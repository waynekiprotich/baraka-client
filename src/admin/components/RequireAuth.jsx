import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from '@/admin/lib/auth'
import { Spinner } from '@/components/ui/Spinner'

/**
 * Route guard for the CMS. Used as a layout route element, so every route nested under it is
 * protected in one place.
 *
 * While the session is being restored from the stored refresh token it renders a quiet
 * waiting state — redirecting during `booting` would sign a signed-in admin out on every
 * page reload. The attempted location is passed along so login can return there.
 */
export function RequireAuth({ children }) {
  const { isAuthenticated, booting } = useAuth()
  const location = useLocation()

  if (booting) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner label="Checking your session" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  return children || <Outlet />
}

export default RequireAuth
