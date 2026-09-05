import { Link } from 'react-router-dom'

import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'

/**
 * Breadcrumb trail for inner pages. "Home" is prepended automatically; the last item is the
 * current page and is not a link.
 *
 * Pair it with `breadcrumbJsonLd()` from lib/seo.js so the markup and the structured data
 * always agree.
 *
 * @param {object} props
 * @param {Array<{label: string, to?: string}>} props.items ordered, excluding Home
 * @param {'ink'|'inverse'} [props.tone] inverse for placement over a dark band
 * @param {string} [props.className]
 */
export function Breadcrumbs({ items = [], tone = 'ink', className }) {
  const trail = [{ label: 'Home', to: '/' }, ...items]

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('type-meta', tone === 'inverse' && 'text-paper/70', className)}
    >
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {trail.map((item, index) => {
          const isLast = index === trail.length - 1
          return (
            <li key={item.label} className="flex items-center gap-2">
              {index > 0 ? (
                <Icon name="chevron-right" size={14} className="opacity-50" />
              ) : null}
              {isLast || !item.to ? (
                <span aria-current="page" className={cn(tone === 'inverse' ? 'text-paper' : 'text-ink')}>
                  {item.label}
                </span>
              ) : (
                <Link to={item.to} className="link-underline hover:text-ink">
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default Breadcrumbs
