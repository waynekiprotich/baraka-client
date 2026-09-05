import { Link } from 'react-router-dom'

import { cn } from '@/lib/cn'

const TONES = {
  default: 'bg-paper-2 text-ink-70 border-line',
  gold: 'bg-gold-50 text-gold border-gold/30',
  brand: 'bg-brand-50 text-brand-700 border-brand/20',
  outline: 'bg-transparent text-ink-70 border-line',
}

/**
 * A small label — a news category, an event date badge, a filter chip.
 *
 * Renders a `<span>`, or a `<Link>` when `to` is given, or a `<button>` when `onClick` is.
 * As a filter chip, pass `selected` so the pressed state is exposed to assistive tech.
 *
 * @param {object} props
 * @param {'default'|'gold'|'brand'|'outline'} [props.tone]
 * @param {string} [props.to]
 * @param {() => void} [props.onClick]
 * @param {boolean} [props.selected] only meaningful with onClick
 * @param {string} [props.className]
 */
export function Tag({ tone = 'default', to, onClick, selected, className, children, ...rest }) {
  // The tone's own colours and the selected-state colours must never land in the class string
  // together: Tailwind's generated stylesheet order (not the order classes appear here) decides
  // which utility wins, so `bg-paper-2 ... bg-ink` on the same element can resolve to the
  // *unselected* background paired with the *selected* (near-white) text — invisible text on a
  // light chip. Choosing one set or the other keeps that collision from being possible.
  const classes = cn(
    'inline-flex items-center rounded-xs border px-2.5 py-1 text-xs font-medium uppercase tracking-[0.08em]',
    selected ? 'bg-ink text-paper border-ink' : TONES[tone] || TONES.default,
    (to || onClick) && 'transition-colors duration-150 ease-editorial hover:border-ink/40',
    className,
  )

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    )
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} aria-pressed={selected} className={classes} {...rest}>
        {children}
      </button>
    )
  }

  return (
    <span className={classes} {...rest}>
      {children}
    </span>
  )
}

export default Tag
