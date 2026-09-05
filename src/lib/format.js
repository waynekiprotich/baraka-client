/**
 * Formatting helpers. Kenyan locale ('en-KE'), Nairobi time, no date library.
 */

const LOCALE = 'en-KE'

/** Parse anything the API might hand us into a Date, or null if it is not usable. */
export function toDate(value) {
  if (!value) return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

/**
 * "14 March 2026"
 * @param {string|Date} value
 * @param {{ month?: 'long'|'short', weekday?: boolean }} [options]
 */
export function formatDate(value, options = {}) {
  const date = toDate(value)
  if (!date) return ''
  const { month = 'long', weekday = false } = options
  return new Intl.DateTimeFormat(LOCALE, {
    day: 'numeric',
    month,
    year: 'numeric',
    ...(weekday ? { weekday: 'long' } : null),
  }).format(date)
}

/** "14 Mar" — for compact listings. */
export function formatDayMonth(value) {
  const date = toDate(value)
  if (!date) return ''
  return new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short' }).format(date)
}

/** "2:30 pm" */
export function formatTime(value) {
  const date = toDate(value)
  if (!date) return ''
  return new Intl.DateTimeFormat(LOCALE, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

/** "14 March 2026, 2:30 pm" */
export function formatDateTime(value) {
  const date = toDate(value)
  if (!date) return ''
  return `${formatDate(date)}, ${formatTime(date)}`
}

/**
 * A human range that collapses shared parts:
 *   same day        → "14 March 2026, 9:00 am – 3:00 pm"
 *   same month      → "14 – 16 March 2026"
 *   different month → "28 April – 25 July 2026"
 */
export function formatDateRange(start, end) {
  const from = toDate(start)
  const to = toDate(end)
  if (!from) return ''
  if (!to) return formatDate(from)

  const sameDay =
    from.getFullYear() === to.getFullYear() &&
    from.getMonth() === to.getMonth() &&
    from.getDate() === to.getDate()

  if (sameDay) return `${formatDate(from)}, ${formatTime(from)} – ${formatTime(to)}`

  const sameYear = from.getFullYear() === to.getFullYear()
  const sameMonth = sameYear && from.getMonth() === to.getMonth()

  if (sameMonth) {
    const day = new Intl.DateTimeFormat(LOCALE, { day: 'numeric' }).format(from)
    return `${day} – ${formatDate(to)}`
  }
  if (sameYear) {
    const part = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'long' }).format(from)
    return `${part} – ${formatDate(to)}`
  }
  return `${formatDate(from)} – ${formatDate(to)}`
}

/** ISO 8601 for `<time datetime>` and JSON-LD. */
export function toIsoDate(value) {
  const date = toDate(value)
  return date ? date.toISOString() : ''
}

/** True when the date is in the future. */
export function isUpcoming(value) {
  const date = toDate(value)
  return Boolean(date) && date.getTime() >= Date.now()
}

/**
 * "KES 28,000". Pass `{ decimals: true }` for cents.
 * @param {number|string} amount
 */
export function formatKes(amount, options = {}) {
  const { decimals = false } = options
  const value = typeof amount === 'string' ? Number(amount) : amount
  if (typeof value !== 'number' || Number.isNaN(value)) return ''
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: 'KES',
    currencyDisplay: 'code',
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: decimals ? 2 : 0,
  })
    .format(value)
    .replace(/[\u00a0\u202f]/g, ' ')
}

/** "1,240" */
export function formatNumber(value) {
  const num = typeof value === 'string' ? Number(value) : value
  if (typeof num !== 'number' || Number.isNaN(num)) return ''
  return new Intl.NumberFormat(LOCALE).format(num)
}

/**
 * Trim to a word boundary and add an ellipsis. Used for excerpts and meta descriptions.
 * @param {string} text
 * @param {number} max
 */
export function truncate(text, max = 160) {
  if (typeof text !== 'string') return ''
  const clean = text.trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max - 1)
  const boundary = cut.lastIndexOf(' ')
  return `${(boundary > max * 0.6 ? cut.slice(0, boundary) : cut).trimEnd()}…`
}

/** Strip HTML tags — used when deriving a plain-text description from CMS body copy. */
export function stripHtml(html) {
  if (typeof html !== 'string') return ''
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** "Kapsabet–Eldoret Road" → "kapsabet-eldoret-road" */
export function slugify(text) {
  return String(text)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Turn a stored phone number into a `tel:` href. */
export function telHref(phone) {
  if (!phone) return ''
  return `tel:${String(phone).replace(/[^\d+]/g, '')}`
}

/** Turn a stored e-mail address into a `mailto:` href. */
export function mailtoHref(email) {
  return email ? `mailto:${String(email).trim()}` : ''
}

/** Estimated reading time in whole minutes, minimum 1. */
export function readingMinutes(text) {
  const words = stripHtml(text || '').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}
