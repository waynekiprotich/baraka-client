/**
 * The public API client. Every unauthenticated network call in the site goes through here —
 * no bare `fetch` in a component.
 *
 * The backend answers every non-2xx with the envelope from SPEC §5:
 *   { "error": { "code": "VALIDATION_ERROR", "message": "…", "fields": { "email": "…" } } }
 * which is decoded into an `ApiError`. Branch on `err.code`, never on `err.message`.
 */

/** Base URL for the API. In dev, Vite proxies `/api` to http://localhost:8000. */
export const API_BASE = import.meta.env.VITE_API_URL || '/api/v1'

export class ApiError extends Error {
  /**
   * @param {object} init
   * @param {string} init.code    machine-readable code, e.g. 'NOT_FOUND'
   * @param {string} init.message human-readable message
   * @param {object} [init.fields] per-field validation messages, keyed by field name
   * @param {number} [init.status] HTTP status (0 for a network/abort failure)
   * @param {string} [init.reference] server-side reference id, present on 500s
   */
  constructor({ code, message, fields, status, reference }) {
    super(message || 'Something went wrong.')
    this.name = 'ApiError'
    this.code = code || 'INTERNAL_ERROR'
    this.fields = fields || null
    this.status = typeof status === 'number' ? status : 0
    this.reference = reference || null
  }

  /** True when the failure means the resource simply is not there. */
  get isNotFound() {
    return this.code === 'NOT_FOUND' || this.status === 404
  }

  /** True when the request never reached the server (offline, DNS, CORS). */
  get isNetwork() {
    return this.code === 'NETWORK_ERROR'
  }
}

/** Build a query string from an object, dropping undefined/null/'' values. */
export function buildQuery(params) {
  if (!params) return ''
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    if (Array.isArray(value)) {
      for (const item of value) search.append(key, String(item))
    } else if (typeof value === 'boolean') {
      search.set(key, value ? 'true' : 'false')
    } else {
      search.set(key, String(value))
    }
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ''
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
      reference: envelope.reference || (payload && payload.reference) || null,
      status,
    })
  }

  return new ApiError({
    code: status === 404 ? 'NOT_FOUND' : 'INTERNAL_ERROR',
    message:
      status === 404
        ? 'That page could not be found.'
        : 'The server could not complete that request.',
    status,
  })
}

/**
 * Core request helper.
 *
 * `Content-Type` is sent ONLY when there is a body, so catalogue GETs stay CORS-"simple"
 * and never trigger a preflight round trip.
 *
 * @param {string} method
 * @param {string} path      path relative to API_BASE, e.g. '/news'
 * @param {object} [options]
 * @param {any}    [options.body]    JSON-serialisable request body
 * @param {object} [options.params]  query string parameters
 * @param {AbortSignal} [options.signal]
 * @param {object} [options.headers] extra headers
 * @returns {Promise<any>} the parsed JSON body (null for 204)
 */
export async function request(method, path, options = {}) {
  const { body, params, signal, headers } = options
  const init = { method, signal, headers: { Accept: 'application/json', ...headers } }

  if (body !== undefined) {
    init.headers['Content-Type'] = 'application/json'
    init.body = JSON.stringify(body)
  }

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

export const get = (path, options) => request('GET', path, options)
export const post = (path, body, options) => request('POST', path, { ...options, body })
export const put = (path, body, options) => request('PUT', path, { ...options, body })
export const patch = (path, body, options) => request('PATCH', path, { ...options, body })
export const del = (path, options) => request('DELETE', path, options)

/* ------------------------------------------------------------------ endpoints */

/**
 * Public site settings.
 * @returns {Promise<Object<string, string>>} a flat `{ key: value }` map
 */
export const getSettings = (options) => get('/settings', options)

/**
 * Paginated news articles.
 * @param {{ page?: number, per_page?: number, category?: string, q?: string }} [params]
 * @returns {Promise<{ items: Array, page: number, per_page: number, total: number, pages: number }>}
 */
export const getNews = (params, options) => get('/news', { ...options, params })

/**
 * One article by slug.
 * @returns {Promise<object>} the article, including `body`
 */
export const getNewsArticle = (slug, options) =>
  get(`/news/${encodeURIComponent(slug)}`, options)

/**
 * Distinct news categories in use.
 * @returns {Promise<Array<{ name: string, count: number }>|Array<string>>}
 */
export const getNewsCategories = (options) => get('/news/categories', options)

/**
 * Paginated events.
 * @param {{ upcoming?: boolean, page?: number, per_page?: number }} [params]
 * @returns {Promise<{ items: Array, page: number, per_page: number, total: number, pages: number }>}
 */
export const getEvents = (params, options) => get('/events', { ...options, params })

/** One event by slug. */
export const getEvent = (slug, options) => get(`/events/${encodeURIComponent(slug)}`, options)

/**
 * Gallery categories with image counts.
 * @returns {Promise<Array<{ id: number, slug: string, name: string, image_count: number }>>}
 */
export const getGalleryCategories = (options) => get('/gallery/categories', options)

/**
 * Paginated gallery images.
 * @param {{ category?: string, page?: number, per_page?: number }} [params]
 * @returns {Promise<{ items: Array, page: number, per_page: number, total: number, pages: number }>}
 */
export const getGalleryImages = (params, options) => get('/gallery', { ...options, params })

/**
 * Submit a contact or admissions enquiry.
 * @param {{ name: string, email: string, phone?: string, subject?: string, message: string,
 *           learner_name?: string, grade_applying?: string, source: 'contact'|'admissions',
 *           website?: string }} payload  `website` is the honeypot — leave it empty
 * @returns {Promise<object>} the created enquiry stub
 */
export const postEnquiry = (payload, options) => post('/enquiries', payload, options)

/** Liveness probe. */
export const getHealth = (options) => get('/health', options)
