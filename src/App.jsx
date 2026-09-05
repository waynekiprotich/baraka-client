import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AppRoutes } from '@/routes'
import { SettingsProvider } from '@/lib/settings'

/**
 * Wait for something a lazily-loaded page renders. Route effects fire before the page's
 * chunk has mounted, so both scrolling to a hash and moving focus to the new `<h1>` have to
 * wait for it to exist.
 *
 * @param {() => Element|null} find
 * @param {(node: Element) => void} onFound
 * @returns {() => void} cancel
 */
function whenPresent(find, onFound) {
  let cancelled = false
  let attempts = 0

  const tick = () => {
    if (cancelled) return
    const node = find()
    if (node) {
      onFound(node)
      return
    }
    attempts += 1
    // ~2 seconds of polling, then give up quietly.
    if (attempts < 40) window.setTimeout(tick, 50)
  }

  tick()
  return () => {
    cancelled = true
  }
}

/**
 * Scroll behaviour on navigation: to the top for a new page, to the element for a `#hash`
 * (which needs the lazy page to have mounted first).
 */
function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      return undefined
    }

    const id = decodeURIComponent(hash.slice(1))
    return whenPresent(
      () => document.getElementById(id),
      (node) => node.scrollIntoView({ block: 'start' }),
    )
  }, [pathname, hash])

  return null
}

/**
 * Announces the new page to assistive technology and moves focus to its heading, so a
 * screen-reader or keyboard user is not left at the top of the document after a client-side
 * navigation (SPEC §6).
 */
function RouteAnnouncer() {
  const { pathname } = useLocation()
  const [message, setMessage] = useState('')
  const firstRender = useRef(true)

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return undefined
    }

    return whenPresent(
      () => document.getElementById('page-title') || document.getElementById('main'),
      (node) => {
        if (typeof node.focus === 'function') node.focus({ preventScroll: true })
        setMessage(document.title)
      },
    )
  }, [pathname])

  return (
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
    </div>
  )
}

/**
 * The application shell. `BrowserRouter` is mounted in main.jsx, so everything here can use
 * router hooks.
 *
 * The outer `ErrorBoundary` is the backstop for the chrome itself — the header, footer and
 * the admin shell. A second boundary inside `SiteLayout` catches page-level crashes without
 * taking the chrome down with them.
 */
export function App() {
  return (
    <ErrorBoundary title="The site ran into a problem">
      <SettingsProvider>
        <ScrollManager />
        <RouteAnnouncer />
        <AppRoutes />
      </SettingsProvider>
    </ErrorBoundary>
  )
}

export default App
