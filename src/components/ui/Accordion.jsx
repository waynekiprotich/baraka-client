import { useId, useState } from 'react'

import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'

/**
 * A disclosure list — used for the admissions FAQs.
 *
 * Implemented as `<button aria-expanded>` plus a labelled region, per SPEC §6. Panels are
 * unmounted when closed so their content is genuinely out of the tab order.
 *
 * @param {object} props
 * @param {Array<{id: string, question: React.ReactNode, answer: React.ReactNode}>} props.items
 * @param {boolean} [props.multiple] allow more than one panel open at a time
 * @param {string|string[]} [props.defaultOpen] id(s) open on first render
 * @param {string} [props.className]
 */
export function Accordion({ items = [], multiple = false, defaultOpen, className }) {
  const uid = useId()
  const [open, setOpen] = useState(() => {
    if (!defaultOpen) return []
    return Array.isArray(defaultOpen) ? defaultOpen : [defaultOpen]
  })

  const toggle = (id) => {
    setOpen((current) => {
      const isOpen = current.includes(id)
      if (isOpen) return current.filter((entry) => entry !== id)
      return multiple ? [...current, id] : [id]
    })
  }

  if (!items.length) return null

  return (
    <div className={cn('border-t border-line', className)}>
      {items.map((item) => {
        const isOpen = open.includes(item.id)
        const buttonId = `${uid}-${item.id}-button`
        const panelId = `${uid}-${item.id}-panel`

        return (
          <div key={item.id} className="border-b border-line">
            <h3 className="m-0">
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                className="flex w-full items-center justify-between gap-6 py-5 text-left"
              >
                <span className="type-h4">{item.question}</span>
                <Icon
                  name="chevron-down"
                  size={20}
                  className={cn(
                    'text-ink-50 transition-transform duration-150 ease-editorial',
                    isOpen && 'rotate-180',
                  )}
                />
              </button>
            </h3>

            {isOpen ? (
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className="pb-6 type-body text-ink-70"
              >
                {item.answer}
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

export default Accordion
