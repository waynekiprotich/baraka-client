import { useId } from 'react'

/**
 * The search + filter strip above a CMS list. Kept in one place so every list screen filters
 * the same way.
 *
 * @param {object} props
 * @param {string} props.search
 * @param {(value: string) => void} props.onSearch
 * @param {string} props.searchLabel
 * @param {{label: string, value: string, options: {value: string, label: string}[],
 *          onChange: (value: string) => void}} [props.select]
 */
export function ListFilters({ search, onSearch, searchLabel, select, children }) {
  const searchId = useId()
  const selectId = useId()

  return (
    <div className="mb-4 flex flex-wrap items-end gap-3">
      {onSearch && (
        <div className="min-w-[14rem] flex-1">
          <label htmlFor={searchId} className="mb-1.5 block text-xs font-medium text-ink-70">
            {searchLabel}
          </label>
          <input
            id={searchId}
            type="search"
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search…"
            className="w-full rounded-xs border border-line bg-paper px-3 py-2 text-sm outline-none focus-visible:border-brand-600"
          />
        </div>
      )}

      {select && (
        <div>
          <label htmlFor={selectId} className="mb-1.5 block text-xs font-medium text-ink-70">
            {select.label}
          </label>
          <select
            id={selectId}
            value={select.value}
            onChange={(event) => select.onChange(event.target.value)}
            className="rounded-xs border border-line bg-paper px-3 py-2 text-sm outline-none focus-visible:border-brand-600"
          >
            {select.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {children}
    </div>
  )
}
