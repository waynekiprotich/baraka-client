import { useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'

const FOCUSABLE = 'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'

/**
 * Full-screen image viewer for the gallery.
 *
 * Behaviour required by SPEC §6, all implemented here:
 *   - `role="dialog" aria-modal` with an accessible name
 *   - focus moves into the dialog on open and is trapped inside it
 *   - `Escape` closes; `ArrowLeft` / `ArrowRight` step through the set
 *   - previous/next buttons carry real labels
 *   - the caption is announced with the image via `aria-live`
 *   - focus returns to whatever opened it
 *   - the page behind cannot scroll while it is open
 *
 * It is a controlled component: the gallery owns `index` and `open`.
 *
 * @param {object} props
 * @param {Array<{src: string, srcSet?: string, alt: string, caption?: React.ReactNode}>} props.images
 * @param {number} props.index    index of the visible image
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {(index: number) => void} props.onIndexChange
 * @param {string} [props.label]  dialog accessible name
 */
export function Lightbox({ images = [], index = 0, open, onClose, onIndexChange, label = 'Image viewer' }) {
  const dialogRef = useRef(null)
  const closeRef = useRef(null)
  const returnFocusRef = useRef(null)

  const count = images.length
  const image = images[index]

  const step = useCallback(
    (delta) => {
      if (!count) return
      onIndexChange((index + delta + count) % count)
    },
    [count, index, onIndexChange],
  )

  // Remember what had focus, and give it back on close.
  useEffect(() => {
    if (!open) return undefined
    returnFocusRef.current = document.activeElement
    const timer = window.setTimeout(() => {
      if (closeRef.current) closeRef.current.focus()
    }, 0)

    return () => {
      window.clearTimeout(timer)
      const node = returnFocusRef.current
      if (node && typeof node.focus === 'function') node.focus()
    }
  }, [open])

  // Lock the page behind the dialog.
  useEffect(() => {
    if (!open) return undefined
    const { body } = document
    const previous = body.style.overflow
    body.style.overflow = 'hidden'
    return () => {
      body.style.overflow = previous
    }
  }, [open])

  // Keyboard: Escape, arrows, and the focus trap.
  useEffect(() => {
    if (!open) return undefined

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        step(1)
        return
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        step(-1)
        return
      }
      if (event.key !== 'Tab') return

      const root = dialogRef.current
      if (!root) return
      const nodes = Array.from(root.querySelectorAll(FOCUSABLE))
      if (!nodes.length) return

      const first = nodes[0]
      const last = nodes[nodes.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose, step])

  if (!open || !image) return null

  const control =
    'inline-flex h-11 w-11 items-center justify-center rounded-xs border border-paper/30 text-paper transition-colors duration-150 ease-editorial hover:bg-paper/10'

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      ref={dialogRef}
      className="fixed inset-0 z-100 flex flex-col bg-ink/95 p-4 md:p-8"
    >
      <div className="flex items-center justify-between gap-4">
        <p className="type-meta text-paper/70">
          {index + 1} of {count}
        </p>
        <button type="button" ref={closeRef} onClick={onClose} className={control} aria-label="Close image viewer">
          <Icon name="close" size={22} />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center gap-4 py-4">
        {count > 1 ? (
          <button type="button" onClick={() => step(-1)} className={cn(control, 'shrink-0')} aria-label="Previous image">
            <Icon name="chevron-left" size={22} />
          </button>
        ) : null}

        <img
          src={image.src}
          srcSet={image.srcSet || undefined}
          sizes={image.srcSet ? '100vw' : undefined}
          alt={image.alt}
          className="max-h-full max-w-full object-contain"
        />

        {count > 1 ? (
          <button type="button" onClick={() => step(1)} className={cn(control, 'shrink-0')} aria-label="Next image">
            <Icon name="chevron-right" size={22} />
          </button>
        ) : null}
      </div>

      <p aria-live="polite" className="min-h-6 text-center text-sm text-paper/80">
        {image.caption || image.alt}
      </p>
    </div>,
    document.body,
  )
}

export default Lightbox
