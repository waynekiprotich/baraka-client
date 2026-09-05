import { useEffect } from 'react'

import { AdminRoutes } from '@/admin/routes'
import { AuthProvider } from '@/admin/lib/auth'
import { ErrorBoundary } from '@/components/ErrorBoundary'

/**
 * The CMS entry point — one lazy chunk, mounted at `/admin/*`, that a visitor to the public
 * site never downloads.
 *
 * It supplies its own session provider and error boundary, and marks every admin route
 * `noindex` (SPEC §8). The public header and footer never appear here.
 *
 * This boundary is the backstop for the shell itself. The per-screen boundary lives inside
 * `AdminLayout`, keyed on the pathname, so one broken screen neither latches nor tears down
 * the session and the toast queue.
 */
export default function AdminApp() {
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [])

  return (
    <ErrorBoundary title="The dashboard ran into a problem">
      <AuthProvider>
        <div className="min-h-dvh bg-paper text-ink">
          <AdminRoutes />
        </div>
      </AuthProvider>
    </ErrorBoundary>
  )
}
