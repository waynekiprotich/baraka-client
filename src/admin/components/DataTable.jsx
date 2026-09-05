import { Icon } from '@/components/ui/Icon'
import { Spinner } from '@/components/ui/Spinner'

/**
 * The CMS list table.
 *
 * Renders a real `<table>` on desktop and stacked rows under 768px — a table that overflows a
 * phone is a failure, so the mobile view is a first-class layout rather than a scroll box.
 * Loading, error and empty are handled here so every list screen behaves identically.
 *
 * @param {object} props
 * @param {{key:string, header:string, render?:(row:any)=>React.ReactNode, align?:'left'|'right',
 *          width?:string, primary?:boolean}[]} props.columns
 *        `primary: true` marks the column used as the heading in the stacked mobile view.
 * @param {any[]} props.rows
 * @param {boolean} [props.loading]
 * @param {Error} [props.error]
 * @param {() => void} [props.onRetry]
 * @param {{title:string, description?:string}} [props.empty]
 * @param {(row:any)=>string|number} props.rowKey
 * @param {(row:any)=>React.ReactNode} [props.actions]
 */
export function DataTable({
  columns,
  rows = [],
  loading = false,
  error,
  onRetry,
  empty,
  rowKey,
  actions,
  caption,
}) {
  if (error) {
    return (
      <div className="rounded-sm border border-danger/30 bg-danger/5 p-6 text-center">
        <p className="text-sm font-medium text-danger">Could not load this list.</p>
        <p className="mt-1 text-sm text-ink-70">{error.message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 rounded-xs border border-line bg-paper px-3 py-1.5 text-sm font-medium text-ink hover:bg-paper-2"
          >
            Try again
          </button>
        )}
      </div>
    )
  }

  if (loading && rows.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-sm border border-line bg-paper py-16">
        <Spinner label="Loading" />
      </div>
    )
  }

  if (!loading && rows.length === 0) {
    return (
      <div className="rounded-sm border border-dashed border-line bg-paper py-14 text-center">
        <Icon name="info" size={22} className="mx-auto text-ink-50" aria-hidden="true" />
        <p className="mt-2 text-sm font-medium text-ink">{empty?.title || 'Nothing here yet'}</p>
        {empty?.description && (
          <p className="mx-auto mt-1 max-w-sm text-sm text-ink-70">{empty.description}</p>
        )}
      </div>
    )
  }

  return (
    <div
      className={`overflow-hidden rounded-sm border border-line bg-paper transition-opacity ${
        loading ? 'opacity-60' : ''
      }`}
    >
      {/* Desktop */}
      <table className="hidden w-full border-collapse text-sm md:table">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr className="border-b border-line bg-paper-2 text-left">
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                style={c.width ? { width: c.width } : undefined}
                className={`px-4 py-2.5 text-xs font-semibold tracking-[0.06em] text-ink-70 uppercase ${
                  c.align === 'right' ? 'text-right' : ''
                }`}
              >
                {c.header}
              </th>
            ))}
            {actions && (
              <th scope="col" className="px-4 py-2.5 text-right text-xs font-semibold tracking-[0.06em] text-ink-70 uppercase">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} className="border-b border-line last:border-0 hover:bg-paper-2/60">
              {columns.map((c) => (
                <td key={c.key} className={`px-4 py-3 align-middle ${c.align === 'right' ? 'text-right' : ''}`}>
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
              {actions && <td className="px-4 py-3 text-right whitespace-nowrap">{actions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile */}
      <ul className="divide-y divide-line md:hidden">
        {rows.map((row) => {
          const primary = columns.find((c) => c.primary) || columns[0]
          const rest = columns.filter((c) => c !== primary)
          return (
            <li key={rowKey(row)} className="p-4">
              <div className="text-sm font-medium text-ink">
                {primary.render ? primary.render(row) : row[primary.key]}
              </div>
              <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
                {rest.map((c) => (
                  <div key={c.key} className="contents">
                    <dt className="text-ink-50">{c.header}</dt>
                    <dd className="text-ink-70">{c.render ? c.render(row) : row[c.key]}</dd>
                  </div>
                ))}
              </dl>
              {actions && <div className="mt-3 flex flex-wrap gap-2">{actions(row)}</div>}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
