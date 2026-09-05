import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'

/** Page numbers around the current page, with gaps marked as null. */
function pageWindow(page, pages) {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1)

  const out = [1]
  const from = Math.max(2, page - 1)
  const to = Math.min(pages - 1, page + 1)

  if (from > 2) out.push(null)
  for (let i = from; i <= to; i += 1) out.push(i)
  if (to < pages - 1) out.push(null)
  out.push(pages)

  return out
}

/**
 * Pagination for any list served by the paginated API envelope
 * (`{ items, page, per_page, total, pages }`).
 *
 * @param {object} props
 * @param {number} props.page   current page, 1-based
 * @param {number} props.pages  total page count
 * @param {(page: number) => void} props.onChange
 * @param {string} [props.label] accessible name, e.g. 'News pages'
 * @param {string} [props.className]
 */
export function Pagination({ page, pages, onChange, label = 'Pagination', className }) {
  if (!pages || pages < 2) return null

  const go = (next) => {
    if (next < 1 || next > pages || next === page) return
    onChange(next)
  }

  const cell =
    'inline-flex min-h-11 min-w-11 items-center justify-center rounded-xs border px-3 text-sm transition-colors duration-150 ease-editorial'

  return (
    <nav aria-label={label} className={cn('flex items-center justify-between gap-4', className)}>
      <button
        type="button"
        onClick={() => go(page - 1)}
        disabled={page <= 1}
        className={cn(cell, 'gap-2 border-line hover:border-ink disabled:opacity-40 disabled:hover:border-line')}
      >
        <Icon name="arrow-left" size={18} />
        <span>Previous</span>
      </button>

      <ol className="hidden items-center gap-1 sm:flex">
        {pageWindow(page, pages).map((entry, index) =>
          entry === null ? (
            <li key={`gap-${index}`} className="px-2 text-ink-50" aria-hidden="true">
              …
            </li>
          ) : (
            <li key={entry}>
              <button
                type="button"
                onClick={() => go(entry)}
                aria-current={entry === page ? 'page' : undefined}
                aria-label={`Page ${entry}`}
                className={cn(
                  cell,
                  entry === page
                    ? 'border-ink bg-ink text-paper'
                    : 'border-transparent text-ink-70 hover:border-line hover:text-ink',
                )}
              >
                {entry}
              </button>
            </li>
          ),
        )}
      </ol>

      <p className="type-meta sm:hidden">
        Page {page} of {pages}
      </p>

      <button
        type="button"
        onClick={() => go(page + 1)}
        disabled={page >= pages}
        className={cn(cell, 'gap-2 border-line hover:border-ink disabled:opacity-40 disabled:hover:border-line')}
      >
        <span>Next</span>
        <Icon name="arrow-right" size={18} />
      </button>
    </nav>
  )
}

export default Pagination
