/**
 * The first focusable element on the page. Hidden until focused, then it sits over the
 * header and jumps to `#main` (SPEC §6).
 */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-200 focus:inline-flex focus:min-h-11 focus:items-center focus:rounded-sm focus:bg-ink focus:px-4 focus:text-paper"
    >
      Skip to main content
    </a>
  )
}

export default SkipLink
