import { useCallback, useEffect, useId, useRef, useState } from 'react'

import { cn } from '@/lib/cn'

/**
 * The WAI-ARIA tab pattern, implemented properly (SPEC §6):
 *   - `role="tablist"` / `role="tab"` / `role="tabpanel"` with `aria-controls` +
 *     `aria-labelledby` wired both ways
 *   - roving tabindex: exactly one tab is in the tab order at a time
 *   - Left/Right (or Up/Down when vertical) move between tabs and wrap, Home/End jump to
 *     the ends, and the newly selected tab takes focus
 *   - the panel is focusable so Tab from the tablist lands on its content
 *
 * Only the selected panel is mounted.
 *
 * @param {object} props
 * @param {Array<{id: string, label: React.ReactNode, panel: React.ReactNode}>} props.items
 * @param {string} [props.defaultTab] id of the initially selected tab
 * @param {string} [props.value] controlled selected id
 * @param {(id: string) => void} [props.onChange]
 * @param {string} props.label accessible name for the tablist, e.g. 'Academic levels'
 * @param {'horizontal'|'vertical'} [props.orientation]
 * @param {string} [props.className]
 * @param {string} [props.listClassName]
 * @param {string} [props.panelClassName]
 */
export function Tabs({
  items = [],
  defaultTab,
  value,
  onChange,
  label,
  orientation = 'horizontal',
  className,
  listClassName,
  panelClassName,
}) {
  const uid = useId()
  const refs = useRef([])
  const [internal, setInternal] = useState(defaultTab || (items[0] && items[0].id))
  const [focusIndex, setFocusIndex] = useState(0)

  const selected = value !== undefined ? value : internal
  const selectedIndex = Math.max(
    0,
    items.findIndex((item) => item.id === selected),
  )

  const select = useCallback(
    (id) => {
      if (value === undefined) setInternal(id)
      if (onChange) onChange(id)
    },
    [onChange, value],
  )

  // Keep the roving tabindex on the selected tab when selection changes elsewhere.
  useEffect(() => {
    setFocusIndex(selectedIndex)
  }, [selectedIndex])

  const move = (nextIndex) => {
    const count = items.length
    if (!count) return
    const index = (nextIndex + count) % count
    setFocusIndex(index)
    select(items[index].id)
    const node = refs.current[index]
    if (node) node.focus()
  }

  const onKeyDown = (event) => {
    const next = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight'
    const prev = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft'

    if (event.key === next) {
      event.preventDefault()
      move(focusIndex + 1)
    } else if (event.key === prev) {
      event.preventDefault()
      move(focusIndex - 1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      move(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      move(items.length - 1)
    }
  }

  if (!items.length) return null

  const active = items[selectedIndex]

  return (
    <div className={cn(orientation === 'vertical' && 'md:flex md:gap-10', className)}>
      <div
        role="tablist"
        aria-label={label}
        aria-orientation={orientation}
        className={cn(
          orientation === 'vertical'
            ? 'flex shrink-0 flex-col border-l border-line md:w-64'
            : 'flex overflow-x-auto border-b border-line',
          listClassName,
        )}
      >
        {items.map((item, index) => {
          const isSelected = index === selectedIndex
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`${uid}-tab-${item.id}`}
              aria-selected={isSelected}
              aria-controls={`${uid}-panel-${item.id}`}
              tabIndex={index === focusIndex ? 0 : -1}
              ref={(node) => {
                refs.current[index] = node
              }}
              onKeyDown={onKeyDown}
              onClick={() => {
                setFocusIndex(index)
                select(item.id)
              }}
              className={cn(
                'min-h-11 whitespace-nowrap px-4 py-3 text-left text-[0.9375rem] font-medium',
                'transition-colors duration-150 ease-editorial',
                orientation === 'vertical'
                  ? cn('-ml-px border-l-2', isSelected ? 'border-gold text-ink' : 'border-transparent text-ink-50 hover:text-ink')
                  : cn('-mb-px border-b-2', isSelected ? 'border-gold text-ink' : 'border-transparent text-ink-50 hover:text-ink'),
              )}
            >
              {item.label}
            </button>
          )
        })}
      </div>

      <div
        role="tabpanel"
        id={`${uid}-panel-${active.id}`}
        aria-labelledby={`${uid}-tab-${active.id}`}
        tabIndex={0}
        className={cn('pt-8 outline-none', orientation === 'vertical' && 'md:min-w-0 md:flex-1 md:pt-0', panelClassName)}
      >
        {active.panel}
      </div>
    </div>
  )
}

export default Tabs
