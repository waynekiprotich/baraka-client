import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  clearTokens,
  getRefreshToken,
  login as loginRequest,
  logout as logoutRequest,
  me as fetchMe,
  onSessionEnd,
  refreshAccessToken,
  setAccessToken,
  setRefreshToken,
} from '@/admin/lib/adminApi'

/**
 * CMS session state.
 *
 * `booting` is true while the app tries to restore a session from the stored refresh token —
 * `RequireAuth` waits for it rather than bouncing a signed-in admin to the login page on
 * every reload.
 */

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [booting, setBooting] = useState(true)

  // Restore a session from the stored refresh token, once, on mount.
  useEffect(() => {
    let active = true

    const restore = async () => {
      if (!getRefreshToken()) {
        if (active) setBooting(false)
        return
      }
      try {
        await refreshAccessToken()
        const account = await fetchMe()
        if (active) setUser(account)
      } catch {
        clearTokens()
        if (active) setUser(null)
      } finally {
        if (active) setBooting(false)
      }
    }

    restore()
    return () => {
      active = false
    }
  }, [])

  // adminApi tells us when a session has ended underneath us.
  useEffect(
    () =>
      onSessionEnd((reason) => {
        setUser(null)
        navigate(`/admin/login?reason=${encodeURIComponent(reason)}`, { replace: true })
      }),
    [navigate],
  )

  /**
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<object>} the signed-in account
   */
  const signIn = useCallback(async (credentials) => {
    const data = await loginRequest(credentials)
    setAccessToken(data.access_token)
    setRefreshToken(data.refresh_token)
    setUser(data.user)
    return data.user
  }, [])

  /** Revokes the token server-side where possible, then clears local state either way. */
  const signOut = useCallback(async () => {
    try {
      await logoutRequest()
    } catch {
      // A dead or already-revoked token still signs the user out locally.
    }
    clearTokens()
    setUser(null)
    navigate('/admin/login', { replace: true })
  }, [navigate])

  const value = useMemo(
    () => ({ user, setUser, booting, signIn, signOut, isAuthenticated: Boolean(user) }),
    [user, booting, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * @returns {{ user: object|null, setUser: Function, booting: boolean,
 *             signIn: (c: {email: string, password: string}) => Promise<object>,
 *             signOut: () => Promise<void>, isAuthenticated: boolean }}
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
