import { useCallback, useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'

import { adminGet } from '@/admin/lib/adminApi'
import { useAuth } from '@/admin/lib/auth'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Icon } from '@/components/ui/Icon'

import { AdminNav } from './AdminNav'
import { ToastProvider } from './Toast'

/**
 * Chrome for every signed-in CMS page: a fixed sidebar on desktop, a slide-over on mobile,
 * and the toast host. Deliberately plain — the admin is a tool, not a brochure.
 */
function AdminChrome() {
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const location = useLocation()

  useEffect(() => setOpen(false), [location.pathname])

  useEffect(() => {
    const controller = new AbortController()
    adminGet('/admin/stats', { signal: controller.signal })
      .then((stats) => setUnread(stats?.enquiries?.new || 0))
      .catch(() => {})
    return () => controller.abort()
  }, [location.pathname])

  const onSignOut = useCallback(() => {
    signOut()
  }, [signOut])

  return (
    <div className="min-h-svh bg-paper-2">
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-xs focus:bg-paper focus:px-3 focus:py-2 focus:text-sm"
      >
        Skip to content
      </a>

      {/* Mobile bar */}
      <div className="flex items-center justify-between border-b border-line bg-brand px-4 py-2.5 lg:hidden">
        <span className="text-sm font-semibold text-paper">Baraka CMS</span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xs border border-paper/30 text-paper"
          aria-expanded={open}
        >
          <Icon name="menu" size={20} />
          <span className="sr-only">Open menu</span>
        </button>
      </div>

      <div className="lg:flex">
        {open && (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-ink/50 lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-brand transition-transform lg:sticky lg:top-0 lg:h-svh lg:translate-x-0 ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center gap-3 border-b border-paper/10 px-4 py-4">
            <img src="/brand/crest-light-256.png" alt="" className="h-9 w-9 object-contain" />
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-paper">Baraka School</span>
              <span className="text-[0.6875rem] tracking-[0.14em] text-paper/60 uppercase">
                Content manager
              </span>
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="ml-auto rounded-xs p-1 text-paper/70 lg:hidden"
            >
              <Icon name="close" size={18} />
              <span className="sr-only">Close menu</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <AdminNav unread={unread} onNavigate={() => setOpen(false)} />
          </div>

          <div className="border-t border-paper/10 px-4 py-3">
            <p className="truncate text-xs text-paper/70">{user?.name || user?.email}</p>
            <div className="mt-2 flex flex-wrap gap-3 text-xs">
              <Link to="/" className="text-paper/80 underline-offset-2 hover:underline">
                View site
              </Link>
              <button
                type="button"
                onClick={onSignOut}
                className="text-paper/80 underline-offset-2 hover:underline"
              >
                Sign out
              </button>
            </div>
          </div>
        </aside>

        <main id="admin-main" className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {/* Keyed on the pathname so a crash on one screen clears when the operator navigates
              away. Inside the layout, so a broken screen keeps the sidebar, the session and
              the toast queue alive. */}
          <ErrorBoundary key={location.pathname} title="This screen ran into a problem">
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}

export function AdminLayout() {
  return (
    <ToastProvider>
      <AdminChrome />
    </ToastProvider>
  )
}

export default AdminLayout
