import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'

/**
 * Message for a request that failed, with a retry. The copy is chosen from the ApiError's
 * `code` — never from its message text (SPEC §4).
 *
 * @param {object} props
 * @param {Error & { code?: string, reference?: string }} [props.error]
 * @param {() => void} [props.onRetry] usually `reload` from useResource
 * @param {string} [props.title] override the derived heading
 * @param {string} [props.className]
 */
export function ErrorState({ error, onRetry, title, className }) {
  const code = error && error.code

  let heading = title || 'That did not load'
  let body = 'Something went wrong at our end. Please try again.'

  if (code === 'NETWORK_ERROR') {
    heading = title || 'No connection'
    body = 'We could not reach the school’s server. Check your connection and try again.'
  } else if (code === 'NOT_FOUND') {
    heading = title || 'Not found'
    body = 'That page or item is no longer available.'
  } else if (code === 'RATE_LIMITED') {
    heading = title || 'Too many attempts'
    body = 'Please wait a short while before trying again.'
  }

  return (
    <div
      className={cn('border border-line bg-paper-2/60 px-6 py-10', className)}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <Icon name="alert" className="mt-0.5 text-danger" />
        <div className="flex flex-col items-start gap-3">
          <h3 className="type-h4">{heading}</h3>
          <p className="type-small max-w-prose text-ink-70">{body}</p>
          {error && error.reference ? (
            <p className="type-meta">
              Reference: <span className="font-mono">{error.reference}</span>
            </p>
          ) : null}
          {onRetry ? (
            <Button variant="secondary" size="sm" onClick={onRetry}>
              Try again
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default ErrorState
