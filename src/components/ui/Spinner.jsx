import { cn } from '@/lib/cn'

/**
 * An indeterminate progress indicator. Use it only where there is nothing to show yet —
 * a refetch over existing content must not blank the content (SPEC §4).
 *
 * @param {object} props
 * @param {number} [props.size] px
 * @param {string} [props.label] announced to assistive tech; pass null to silence it when a
 *   surrounding live region already says what is happening
 * @param {string} [props.className]
 */
export function Spinner({ size = 20, label = 'Loading', className }) {
  return (
    <span
      className={cn('inline-flex items-center gap-2 text-ink-50', className)}
      role="status"
      aria-live="polite"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="animate-spin"
        aria-hidden="true"
        focusable="false"
      >
        <circle cx="12" cy="12" r="9" className="opacity-25" />
        <path d="M21 12a9 9 0 0 0-9-9" />
      </svg>
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  )
}

export default Spinner
