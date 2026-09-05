import { Link } from 'react-router-dom'

import { cn } from '@/lib/cn'

const VARIANTS = {
  /** Solid brand — one per view, the primary action. */
  primary:
    'bg-brand text-paper border border-brand hover:bg-brand-700 hover:border-brand-700 active:bg-brand',
  /** Outlined — the quieter companion to a primary. */
  secondary:
    'bg-transparent text-ink border border-ink/25 hover:border-ink hover:bg-ink/[0.03]',
  /** Text only, for tertiary actions and in-place links. */
  ghost: 'bg-transparent text-ink border border-transparent hover:bg-ink/[0.05]',
  /** The gold Apply action. Reserved for admissions. */
  gold: 'bg-gold text-paper border border-gold hover:bg-gold-400 hover:border-gold-400 hover:text-ink',
  /** For placement on a photograph or a brand-ground band. */
  inverse:
    'bg-paper text-ink border border-paper hover:bg-transparent hover:text-paper hover:border-paper',
}

const SIZES = {
  sm: 'text-sm px-3.5 py-2 gap-1.5',
  md: 'text-[0.9375rem] px-5 py-2.5 gap-2',
  lg: 'text-base px-6 py-3 gap-2',
}

/**
 * The one button in the system. Renders the right element for what it does:
 *   `to`   → react-router `<Link>` (internal navigation)
 *   `href` → `<a>` (external links, tel:, mailto:)
 *   else   → `<button type="button">`
 *
 * Never render a disabled anchor — pass `disabled` only to the button form.
 *
 * @param {object} props
 * @param {'primary'|'secondary'|'ghost'|'gold'|'inverse'} [props.variant]
 * @param {'sm'|'md'|'lg'} [props.size]
 * @param {string} [props.to] internal route
 * @param {string} [props.href] external URL
 * @param {'button'|'submit'|'reset'} [props.type] button form only
 * @param {boolean} [props.disabled]
 * @param {boolean} [props.block] full width
 * @param {React.ReactNode} [props.iconRight] a 16–20px inline SVG
 * @param {React.ReactNode} [props.iconLeft]
 * @param {string} [props.className]
 */
export function Button({
  variant = 'primary',
  size = 'md',
  to,
  href,
  type = 'button',
  disabled = false,
  block = false,
  iconLeft,
  iconRight,
  className,
  children,
  ...rest
}) {
  const classes = cn(
    'inline-flex items-center justify-center rounded-sm font-medium tracking-[0.01em]',
    'min-h-11 transition-colors duration-150 ease-editorial',
    VARIANTS[variant] || VARIANTS.primary,
    SIZES[size] || SIZES.md,
    block && 'w-full',
    disabled && 'pointer-events-none opacity-50',
    className,
  )

  const content = (
    <>
      {iconLeft ? (
        <span aria-hidden="true" className="shrink-0">
          {iconLeft}
        </span>
      ) : null}
      <span>{children}</span>
      {iconRight ? (
        <span aria-hidden="true" className="shrink-0">
          {iconRight}
        </span>
      ) : null}
    </>
  )

  if (to && !disabled) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    )
  }

  if (href && !disabled) {
    const external = /^https?:\/\//i.test(href)
    return (
      <a
        href={href}
        className={classes}
        {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : null)}
        {...rest}
      >
        {content}
      </a>
    )
  }

  return (
    <button type={type} className={classes} disabled={disabled} {...rest}>
      {content}
    </button>
  )
}

export default Button
