/**
 * The `<h1>` for a CMS screen, plus an optional action on the right.
 *
 * It is focusable so route changes can move focus here (the public site does the same thing
 * through its route announcer).
 *
 * @param {{title: string, lead?: string, action?: React.ReactNode}} props
 */
export function PageTitle({ title, lead, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 id="page-title" tabIndex={-1} className="text-xl font-semibold text-ink outline-none">
          {title}
        </h1>
        {lead && <p className="mt-1 max-w-prose text-sm text-ink-70">{lead}</p>}
      </div>
      {action && <div className="flex shrink-0 flex-wrap gap-2">{action}</div>}
    </div>
  )
}
