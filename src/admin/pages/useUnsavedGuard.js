import { useEffect } from 'react'

/**
 * Warns before a full page unload while an editor has unsaved changes.
 *
 * In-app navigation is guarded by the explicit Cancel/Save buttons on each editor; this covers
 * closing the tab or hitting reload, which is where work actually gets lost.
 *
 * @param {boolean} when
 */
export function useUnsavedGuard(when) {
  useEffect(() => {
    if (!when) return undefined
    const handler = (event) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [when])
}
