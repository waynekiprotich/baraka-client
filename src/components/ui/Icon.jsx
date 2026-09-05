import { cn } from '@/lib/cn'

/**
 * The icon set. Inline SVG only — no emoji, no icon font, no package (SPEC §3).
 * Every glyph is drawn on a 24×24 grid with `stroke-width: 1.5` in `currentColor`.
 *
 * Decorative by default (`aria-hidden`). Pass `title` when the icon is the only thing
 * carrying meaning, and it becomes an `img` role with an accessible name.
 */

const PATHS = {
  'arrow-right': <path d="M4 12h16m0 0-6-6m6 6-6 6" />,
  'arrow-left': <path d="M20 12H4m0 0 6-6m-6 6 6 6" />,
  'arrow-up-right': <path d="M7 17 17 7m0 0H8m9 0v9" />,
  'chevron-down': <path d="m6 9 6 6 6-6" />,
  'chevron-up': <path d="m6 15 6-6 6 6" />,
  'chevron-left': <path d="m15 6-6 6 6 6" />,
  'chevron-right': <path d="m9 6 6 6-6 6" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  menu: <path d="M3 6h18M3 12h18M3 18h18" />,
  check: <path d="m4 12.5 5 5L20 6.5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  phone: (
    <path d="M6.5 3h3l1.5 4-2 1.5a12 12 0 0 0 6.5 6.5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.5 5.2 2 2 0 0 1 6.5 3Z" />
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <path d="m3.5 6.5 8.5 6 8.5-6" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.2l3.2 2" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="16" rx="1.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 5.2a3.5 3.5 0 0 1 0 5.6M18 14.5a6.5 6.5 0 0 1 3.5 5.5" />
    </>
  ),
  book: (
    <>
      <path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H19v15H5.5A1.5 1.5 0 0 0 4 19.5v-15Z" />
      <path d="M4 19.5A1.5 1.5 0 0 1 5.5 21H19v-3" />
    </>
  ),
  'book-open': (
    <path d="M12 6.5S10 4.5 3.5 4.5v13C10 17.5 12 19.5 12 19.5m0-13s2-2 8.5-2v13c-6.5 0-8.5 2-8.5 2m0-13v13" />
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
    </>
  ),
  sparkle: <path d="M12 3.5 13.8 9l5.7 1.8-5.7 1.9L12 18.4l-1.8-5.7L4.5 10.8 10.2 9 12 3.5Z" />,
  heart: (
    <path d="M12 20s-7.5-4.6-7.5-9.6A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 7.5 2.8C19.5 15.4 12 20 12 20Z" />
  ),
  shield: <path d="M12 3 5 5.8v5.5c0 4.3 3 7.4 7 9.7 4-2.3 7-5.4 7-9.7V5.8L12 3Z" />,
  image: (
    <>
      <rect x="3.5" y="5" width="17" height="14" rx="1.5" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m4.5 17 4.8-4.4L14 17m0 0 2.6-2.4L20 17.5" />
    </>
  ),
  play: <path d="M8 5.5v13l11-6.5-11-6.5Z" />,
  alert: (
    <>
      <path d="M12 4.5 21 20H3l9-15.5Z" />
      <path d="M12 10.5v4M12 17.2v.3" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5M12 7.8v.3" />
    </>
  ),
  download: <path d="M12 4v11m0 0 4-4m-4 4-4-4M4.5 20h15" />,
  external: (
    <>
      <path d="M14 4h6v6" />
      <path d="M20 4 11 13" />
      <path d="M18 14.5V19a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19V7.5A1.5 1.5 0 0 1 5 6h4.5" />
    </>
  ),
  facebook: (
    <path
      fill="currentColor"
      stroke="none"
      d="M13.5 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.6-1.5h1.5V4.3A21 21 0 0 0 14.4 4c-2.3 0-3.9 1.4-3.9 4.1v2.3H8v3h2.5V21h3Z"
    />
  ),
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
}

/** Every available icon name — useful when picking one. */
export const iconNames = Object.keys(PATHS)

/**
 * @param {object} props
 * @param {keyof typeof PATHS} props.name
 * @param {number} [props.size] px, defaults to 24
 * @param {string} [props.title] give the icon an accessible name; omit for decorative icons
 * @param {string} [props.className]
 */
export function Icon({ name, size = 24, title, className, ...rest }) {
  const glyph = PATHS[name]
  if (!glyph) return null

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('shrink-0', className)}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : 'true'}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {glyph}
    </svg>
  )
}

export default Icon
