import { Container } from '@/components/ui/Container'
import { cn } from '@/lib/cn'

/**
 * Figures shown as a thin lined band — never as tiles, never animated on scroll (SPEC §3).
 *
 * @param {object} props
 * @param {Array<{value: string, label: string}>} props.items 3–4 reads best
 * @param {'paper'|'tint'|'inverse'} [props.tone]
 * @param {boolean} [props.contained] wrap in a Container; false when already inside one
 * @param {string} [props.label] accessible name for the list, e.g. 'School at a glance'
 * @param {string} [props.className]
 */
export function StatBand({ items = [], tone = 'paper', contained = true, label, className }) {
  if (!items.length) return null

  const inverse = tone === 'inverse'

  const list = (
    <dl
      className={cn(
        'grid grid-cols-2 md:grid-cols-4',
        'border-y',
        inverse ? 'border-paper/25' : 'border-line',
      )}
    >
      {items.map((item, index) => (
        <div
          key={item.label}
          className={cn(
            'px-4 py-6 md:px-6 md:py-8',
            index % 2 === 1 && 'border-l',
            'md:border-l',
            index === 0 && 'md:border-l-0',
            index === 2 && 'border-t md:border-t-0',
            index === 3 && 'border-t md:border-t-0',
            inverse ? 'border-paper/25' : 'border-line',
          )}
        >
          <dt className="sr-only">{item.label}</dt>
          <dd className="m-0">
            <span
              className={cn(
                'block font-display text-3xl leading-none tracking-[-0.02em] md:text-4xl',
                inverse ? 'text-paper' : 'text-ink',
              )}
            >
              {item.value}
            </span>
            <span
              className={cn('mt-2 block text-sm', inverse ? 'text-paper/70' : 'text-ink-50')}
              aria-hidden="true"
            >
              {item.label}
            </span>
          </dd>
        </div>
      ))}
    </dl>
  )

  const wrapped = (
    <section aria-label={label || 'Key figures'} className={cn(className)}>
      {list}
    </section>
  )

  return contained ? <Container>{wrapped}</Container> : wrapped
}

export default StatBand
