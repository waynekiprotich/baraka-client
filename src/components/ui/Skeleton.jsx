import { cn } from '@/lib/cn'

/**
 * A first-load placeholder. Never render one over content that is already on screen —
 * `useResource` keeps the previous data precisely so that cannot happen (SPEC §4/§7).
 *
 * Skeletons are inert to assistive tech; the surrounding region should carry
 * `aria-busy="true"` while they are showing.
 *
 * @param {object} props
 * @param {'block'|'text'|'image'} [props.variant]
 * @param {number} [props.lines] `text` only — how many lines to draw
 * @param {string} [props.aspect] `image` only — CSS aspect-ratio, e.g. '3 / 2'
 * @param {string} [props.className]
 */
export function Skeleton({ variant = 'block', lines = 3, aspect = '3 / 2', className }) {
  const base = 'animate-pulse rounded-xs bg-line/70'

  if (variant === 'text') {
    return (
      <div className={cn('flex flex-col gap-2', className)} aria-hidden="true">
        {Array.from({ length: lines }, (_, index) => (
          <span
            key={index}
            className={cn(base, 'block h-3.5')}
            style={{ width: index === lines - 1 ? '60%' : '100%' }}
          />
        ))}
      </div>
    )
  }

  if (variant === 'image') {
    return <div className={cn(base, 'w-full', className)} style={{ aspectRatio: aspect }} aria-hidden="true" />
  }

  return <div className={cn(base, 'h-full w-full', className)} aria-hidden="true" />
}

export default Skeleton
