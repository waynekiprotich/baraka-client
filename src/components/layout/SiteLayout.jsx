import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SkipLink } from '@/components/layout/SkipLink'
import { ErrorBoundary } from '@/components/ErrorBoundary'

/**
 * Chrome for every public route: skip link, header, `<main id="main">`, footer.
 *
 * The routed outlet sits inside its own `ErrorBoundary`, keyed on the pathname, so a page
 * that throws keeps the header and footer and resets as soon as the visitor navigates away.
 *
 * The header is fixed, so pages own their own top spacing — `PageHeader` already includes
 * it, and a full-bleed hero deliberately sits underneath the transparent header.
 */
export function SiteLayout() {
  const location = useLocation()

  return (
    <div className="flex min-h-dvh flex-col">
      <SkipLink />
      <SiteHeader />

      <main id="main" className="flex-1">
        <ErrorBoundary key={location.pathname}>
          {/* A fixed-height fallback: the chunk swap must not shift the page. */}
          <Suspense fallback={<div className="min-h-dvh" aria-hidden="true" />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>

      <SiteFooter />
    </div>
  )
}

export default SiteLayout
