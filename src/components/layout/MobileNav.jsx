import { useEffect, useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import { mailtoHref, telHref } from '@/lib/format'

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * The full-screen mobile navigation sheet.
 *
 * Everything SPEC §4/§6 asks for lives here: focus moves into the sheet on open and is
 * trapped, `Escape` closes it, a route change closes it, the page behind cannot scroll, and
 * focus returns to the button that opened it.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {React.RefObject<HTMLElement>} props.triggerRef the toggle button, for focus return
 * @param {Array<{label: string, to: string}>} props.items
 * @param {{label: string, to: string}} props.cta
 * @param {string} [props.phone]
 * @param {string} [props.email]
 */
export function MobileNav({ open, onClose, triggerRef, items, cta, phone, email }) {
  const panelRef = useRef(null)
  const location = useLocation()

  // A route change always closes the sheet.
  useEffect(() => {
    if (open) onClose()
    // Only the pathname/hash should trigger this, not a new `onClose` identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.hash])

  // Lock the page behind the sheet.
  useEffect(() => {
    if (!open) return undefined
    const { body } = document
    const previous = body.style.overflow
    body.style.overflow = 'hidden'
    return () => {
      body.style.overflow = previous
    }
  }, [open])

  // Move focus in, trap it, close on Escape, and hand focus back on the way out.
  useEffect(() => {
    if (!open) return undefined

    const panel = panelRef.current
    // Copy the ref now: it must not be read for the first time in the cleanup.
    const trigger = triggerRef.current
    const first = panel && panel.querySelector(FOCUSABLE)
    if (first) first.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab' || !panel) return

      const nodes = Array.from(panel.querySelectorAll(FOCUSABLE))
      if (!nodes.length) return
      const firstNode = nodes[0]
      const lastNode = nodes[nodes.length - 1]

      if (event.shiftKey && document.activeElement === firstNode) {
        event.preventDefault()
        lastNode.focus()
      } else if (!event.shiftKey && document.activeElement === lastNode) {
        event.preventDefault()
        firstNode.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)

      // Hand focus back to the toggle — but only if focus is still inside the sheet or has
      // been dropped on the body. When the sheet closed because the route changed, the route
      // announcer has already moved focus to the new page's heading; do not steal it back.
      const active = document.activeElement
      const focusLost = !active || active === document.body
      const focusInside = Boolean(panel && active && panel.contains(active))
      if (!focusLost && !focusInside) return

      if (trigger && typeof trigger.focus === 'function') trigger.focus()
    }
  }, [open, onClose, triggerRef])

  if (!open) return null

  return (
    <div
      id="mobile-nav"
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      className="fixed inset-0 z-90 flex flex-col bg-paper lg:hidden"
    >
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <span className="font-display text-lg">Menu</span>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xs border border-line"
          aria-label="Close menu"
        >
          <Icon name="close" size={22} />
        </button>
      </div>

      <nav aria-label="Site" className="flex-1 overflow-y-auto px-5 py-2">
        <ul className="flex flex-col">
          {items.map((item) => (
            <li key={item.to} className="border-b border-line">
              <NavLink
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-14 items-center justify-between py-4 font-display text-2xl',
                    isActive ? 'text-ink' : 'text-ink-70',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span>{item.label}</span>
                    {isActive ? <Icon name="check" size={20} className="text-gold" /> : null}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-line px-5 py-5">
        <Button to={cta.to} variant="gold" size="lg" block onClick={onClose}>
          {cta.label}
        </Button>

        <ul className="mt-5 flex flex-col gap-3 text-sm">
          {phone ? (
            <li>
              <a href={telHref(phone)} className="inline-flex items-center gap-2 text-ink-70">
                <Icon name="phone" size={18} />
                {phone}
              </a>
            </li>
          ) : null}
          {email ? (
            <li>
              <a href={mailtoHref(email)} className="inline-flex items-center gap-2 text-ink-70">
                <Icon name="mail" size={18} />
                {email}
              </a>
            </li>
          ) : null}
        </ul>
      </div>
    </div>
  )
}

export default MobileNav
