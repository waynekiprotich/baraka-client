import { Component } from 'react'

import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'

/**
 * Catches a render error so a crashing page does not become a white screen.
 *
 * Two of these are mounted (SPEC §4): one around the routed outlet inside `SiteLayout`, so
 * the header and footer survive and the visitor can navigate away, and one around the whole
 * app as a backstop for the chrome itself.
 *
 * The boundary is reset by being **keyed on `location.pathname`** — a keyed remount. Without
 * that it latches, and "Back home" changes the URL while the error stays on screen.
 *
 * The stack is shown in development only.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    const { error } = this.state
    const { children, title = 'This page ran into a problem', fallback } = this.props

    if (!error) return children
    if (fallback) return fallback

    return (
      <Container className="py-24 md:py-32">
        <div className="max-w-2xl">
          <p className="type-eyebrow mb-4">Something went wrong</p>
          <h1 className="type-h2">{title}</h1>
          <p className="type-lead mt-5">
            The rest of the site is still working. Try reloading, or head back to the homepage.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button to="/" variant="primary">
              Back to the homepage
            </Button>
            <Button variant="secondary" onClick={() => window.location.reload()}>
              Reload this page
            </Button>
          </div>

          {import.meta.env.DEV ? (
            <pre className="mt-10 overflow-x-auto border border-line bg-paper-2 p-4 text-xs leading-relaxed text-ink-70">
              {error.stack || String(error)}
            </pre>
          ) : null}
        </div>
      </Container>
    )
  }
}

export default ErrorBoundary
