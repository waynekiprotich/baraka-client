/**
 * A compact status marker. Never colour alone — the label always carries the meaning.
 *
 * @param {{status: string, className?: string}} props
 */
const TONES = {
  published: 'border-success/30 bg-success/10 text-success',
  upcoming: 'border-success/30 bg-success/10 text-success',
  draft: 'border-line bg-paper-2 text-ink-70',
  past: 'border-line bg-paper-2 text-ink-70',
  read: 'border-line bg-paper-2 text-ink-70',
  archived: 'border-line bg-paper-2 text-ink-50',
  new: 'border-gold/40 bg-gold-50 text-warn',
  featured: 'border-brand/25 bg-brand-50 text-brand-700',
}

export function StatusPill({ status, className = '' }) {
  const key = String(status || '').toLowerCase()
  return (
    <span
      className={`inline-flex items-center rounded-xs border px-2 py-0.5 text-[0.6875rem] font-medium tracking-[0.06em] uppercase ${
        TONES[key] || TONES.draft
      } ${className}`}
    >
      {status}
    </span>
  )
}
