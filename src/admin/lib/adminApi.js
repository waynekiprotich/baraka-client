/**
 * The authenticated API client for the CMS. Everything under `/admin` and `/auth` goes
 * through here — a component never calls `fetch` itself.
 *
 * Token handling follows SPEC §5:
 *   - the access token lives in memory only (a page reload signs in again from the refresh
 *     token), the refresh token in `localStorage`
 *   - a `TOKEN_EXPIRED` response triggers exactly ONE refresh, and the original request is
 *     replayed with the new access token
 *   - `TOKEN_REVOKED`, `INVALID_TOKEN` and a `403 FORBIDDEN` end the session locally and send
 *     the user to `/admin/login?reason=…`
 *   - `INSUFFICIENT_ROLE` is a permissions problem, not a dead session: it is thrown to the
 *     caller and must never sign anybody out
 */

import { API_BASE, ApiError, buildQuery } from '@/lib/api'

const REFRESH_STORAGE_KEY = 'baraka.admin.refresh'

/** Reasons that end a session, surfaced as `?reason=` on the login route. */
export const SESSION_END_REASONS = {
  expired: 'Your session expired. Please sign in again.',
  revoked: 'You were signed out. Please sign in again.',
  invalid: 'Your session is no longer valid. Please sign in again.',
  forbidden: 'That account no longer has access.',
}

let accessToken = null
let refreshInFlight = null
const sessionEndHandlers = new Set()

/** In-memory access token. */
export function getAccessToken() {
  return accessToken
}

export function setAccessToken(token) {
  accessToken = token || null
}

/** Refresh token, persisted so a reload can restore the session. */
export function getRefreshToken() {
  try {
    return window.localStorage.getItem(REFRESH_STORAGE_KEY)
  } catch {
    return null
  }
}

export function setRefreshToken(token) {
  try {
    if (token) window.localStorage.setItem(REFRESH_STORAGE_KEY, token)
    else window.localStorage.removeItem(REFRESH_STORAGE_KEY)
  } catch {
    // Storage can be unavailable (private mode). The session then lasts until reload.
  }
}

export function clearTokens() {
  accessToken = null
  refreshInFlight = null
  setRefreshToken(null)
}

/**
 * Register a listener for "the session is over". `auth.jsx` uses this to clear its state and
 * navigate without a full page reload.
 * @param {(reason: keyof typeof SESSION_END_REASONS) => void} handler
 * @returns {() => void} unsubscribe
 */
export function onSessionEnd(handler) {
  sessionEndHandlers.add(handler)
  return () => sessionEndHandlers.delete(handler)
}

function endSession(reason) {
  clearTokens()
  if (sessionEndHandlers.size) {
    for (const handler of sessionEndHandlers) handler(reason)
    return
  }
  // No React listener mounted (a call made during teardown): fall back to a hard redirect.
  window.location.assign(`/admin/login?reason=${encodeURIComponent(reason)}`)
}

function joinUrl(path, params) {
  const base = API_BASE.replace(/\/+$/, '')
  const rest = path.startsWith('/') ? path : `/${path}`
  return `${base}${rest}${buildQuery(params)}`
}

async function readBody(response) {
  const type = response.headers.get('content-type') || ''
  if (response.status === 204 || response.status === 205) return null
  if (type.includes('application/json')) {
    try {
      return await response.json()
    } catch {
      return null
    }
  }
  const text = await response.text()
  return text || null
}

function toApiError(payload, status) {
  const envelope = payload && typeof payload === 'object' ? payload.error : null
  if (envelope && typeof envelope === 'object') {
    return new ApiError({
      code: envelope.code,
      message: envelope.message,
      fields: envelope.fields,
      reference: envelope.reference || null,
      status,
    })
  }
  return new ApiError({
    code: status === 404 ? 'NOT_FOUND' : 'INTERNAL_ERROR',
    message: 'The server could not complete that request.',
    status,
  })
}

/** One raw round trip. No token refresh, no session handling. */
async function send(method, path, { body, params, signal, headers, auth = true, token } = {}) {
  const init = { method, signal, headers: { Accept: 'application/json', ...headers } }

  if (body !== undefined) {
    init.headers['Content-Type'] = 'application/json'
    init.body = JSON.stringify(body)
  }

  const bearer = token !== undefined ? token : auth ? accessToken : null
  if (bearer) init.headers.Authorization = `Bearer ${bearer}`

  let response
  try {
    response = await fetch(joinUrl(path, params), init)
  } catch (err) {
    if (err && err.name === 'AbortError') throw err
    throw new ApiError({
      code: 'NETWORK_ERROR',
      message: 'Could not reach the server. Check your connection and try again.',
      status: 0,
    })
  }

  const payload = await readBody(response)
  if (!response.ok) throw toApiError(payload, response.status)
  return payload
}

/**
 * Exchange the refresh token for a new access token. Concurrent callers share one request.
 * @returns {Promise<string>} the new access token
 */
export function refreshAccessToken() {
  if (refreshInFlight) return refreshInFlight

  const refresh = getRefreshToken()
  if (!refresh) {
    return Promise.reject(
      new ApiError({ code: 'INVALID_TOKEN', message: 'No refresh token.', status: 401 }),
    )
  }

  refreshInFlight = send('POST', '/auth/refresh', { token: refresh })
    .then((data) => {
      const next = data && data.access_token
      if (!next) {
        throw new ApiError({ code: 'INVALID_TOKEN', message: 'Refresh failed.', status: 401 })
      }
      setAccessToken(next)
      return next
    })
    .finally(() => {
      refreshInFlight = null
    })

  return refreshInFlight
}

/**
 * An authenticated request, with the refresh-and-replay and session-end rules applied.
 *
 * @param {string} method
 * @param {string} path
 * @param {{ body?: any, params?: object, signal?: AbortSignal, headers?: object,
 *           auth?: boolean, retry?: boolean }} [options]
 *        `auth: false` sends no Authorization header (login).
 * @returns {Promise<any>}
 */
export async function adminRequest(method, path, options = {}) {
  const { retry = true, ...rest } = options

  try {
    return await send(method, path, rest)
  } catch (err) {
    if (!(err instanceof ApiError)) throw err
    if (rest.auth === false) throw err

    // Expired access token: refresh exactly once, then replay the original request.
    if (err.code === 'TOKEN_EXPIRED' && retry) {
      try {
        await refreshAccessToken()
      } catch {
        endSession('expired')
        throw err
      }
      return adminRequest(method, path, { ...options, retry: false })
    }

    if (err.code === 'TOKEN_REVOKED') {
      endSession('revoked')
      throw err
    }

    if (err.code === 'INVALID_TOKEN' || (err.status === 401 && err.code === 'UNAUTHORIZED')) {
      endSession('invalid')
      throw err
    }

    // A 403 FORBIDDEN means the account itself is gone or deactivated. INSUFFICIENT_ROLE is
    // a permission problem on one action and must not sign anyone out.
    if (err.status === 403 && err.code === 'FORBIDDEN') {
      endSession('forbidden')
      throw err
    }

    throw err
  }
}

export const adminGet = (path, options) => adminRequest('GET', path, options)
export const adminPost = (path, body, options) => adminRequest('POST', path, { ...options, body })
export const adminPut = (path, body, options) => adminRequest('PUT', path, { ...options, body })
export const adminPatch = (path, body, options) =>
  adminRequest('PATCH', path, { ...options, body })
export const adminDel = (path, options) => adminRequest('DELETE', path, options)

/**
 * Multipart upload — `Content-Type` is left to the browser so the boundary is correct.
 * @param {File} file
 * @returns {Promise<{ url: string, thumb_url: string, width: number, height: number, storage_key: string }>}
 */
export async function adminUpload(file, options = {}) {
  const form = new FormData()
  form.append('file', file)

  const run = async () => {
    const init = {
      method: 'POST',
      body: form,
      signal: options.signal,
      headers: { Accept: 'application/json' },
    }
    if (accessToken) init.headers.Authorization = `Bearer ${accessToken}`

    let response
    try {
      response = await fetch(joinUrl('/admin/uploads'), init)
    } catch (err) {
      if (err && err.name === 'AbortError') throw err
      throw new ApiError({
        code: 'NETWORK_ERROR',
        message: 'Could not reach the server. Check your connection and try again.',
        status: 0,
      })
    }

    const payload = await readBody(response)
    if (!response.ok) throw toApiError(payload, response.status)
    return payload
  }

  try {
    return await run()
  } catch (err) {
    if (err instanceof ApiError && err.code === 'TOKEN_EXPIRED') {
      await refreshAccessToken().catch((refreshError) => {
        endSession('expired')
        throw refreshError
      })
      return run()
    }
    throw err
  }
}

/* ------------------------------------------------------------------ auth endpoints */

/**
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ access_token: string, refresh_token: string, user: object }>}
 */
export function login(credentials) {
  return adminRequest('POST', '/auth/login', { body: credentials, auth: false })
}

/** Revokes the presented token server-side. Safe to call without a session. */
export function logout() {
  return adminRequest('POST', '/auth/logout', { retry: false })
}

/** @returns {Promise<{ id: number, email: string, name: string, is_active: boolean }>} */
export function me(options) {
  return adminRequest('GET', '/auth/me', options)
}

/** @param {{ current_password: string, new_password: string }} payload */
export function changePassword(payload) {
  return adminRequest('POST', '/auth/change-password', { body: payload })
}

export { ApiError }
