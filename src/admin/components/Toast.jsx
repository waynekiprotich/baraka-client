import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

import { Icon } from '@/components/ui/Icon'

const ToastContext = createContext(null)

/**
 * A small toast queue with a polite live region.
 *
 * Every mutation in the CMS ends in one of these, so the operator always knows whether their
 * change landed. Errors stay until dismissed; successes clear themselves.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const seq = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (tone, message) => {
      const id = ++seq.current
      setToasts((list) => [...list, { id, tone, message }])
      if (tone !== 'error') {
        setTimeout(() => dismiss(id), 4500)
      }
      return id
    },
    [dismiss],
  )

  const value = useMemo(
    () => ({
      success: (message) => push('success', message),
      error: (message) => push('error', message),
      info: (message) => push('info', message),
      dismiss,
    }),
    [push, dismiss],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 sm:items-end"
        role="region"
        aria-label="Notifications"
      >
        <output aria-live="polite" className="contents">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-sm border px-4 py-3 text-sm shadow-sm ${
                t.tone === 'error'
                  ? 'border-danger/30 bg-danger/10 text-danger'
                  : t.tone === 'success'
                    ? 'border-success/30 bg-success/10 text-success'
                    : 'border-line bg-paper text-ink'
              }`}
            >
              <Icon
                name={t.tone === 'error' ? 'alert' : t.tone === 'success' ? 'check' : 'info'}
                size={18}
                className="mt-0.5 shrink-0"
              />
              <p className="flex-1">{t.message}</p>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="shrink-0 rounded-xs p-0.5 opacity-70 hover:opacity-100"
              >
                <Icon name="close" size={16} />
                <span className="sr-only">Dismiss</span>
              </button>
            </div>
          ))}
        </output>
      </div>
    </ToastContext.Provider>
  )
}

/** @returns {{success:(m:string)=>void, error:(m:string)=>void, info:(m:string)=>void, dismiss:(id:number)=>void}} */
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
