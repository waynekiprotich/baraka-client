import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Fetch a remote resource and track its four states.
 *
 * Contract (SPEC §4):
 *   - `data` keeps the PREVIOUS value while a refetch is in flight, so usable content is
 *     never replaced by a spinner. Skeletons are for the first load only — check
 *     `loading && !data`.
 *   - the in-flight request is aborted when the dependencies change or the component
 *     unmounts, so a slow response can never overwrite a newer one.
 *   - `fn` is read from a ref, so passing an inline arrow function does NOT cause a
 *     refetch loop. The dependency array is what decides when to refetch — list every
 *     value the fetch actually varies on.
 *
 * @template T
 * @param {(ctx: { signal: AbortSignal }) => Promise<T>} fn
 * @param {ReadonlyArray<any>} [deps] values that, when changed, trigger a refetch
 * @param {{ enabled?: boolean, initialData?: T }} [options]
 *        `enabled: false` skips the fetch entirely (for dependent queries).
 * @returns {{ data: T|null, error: Error|null, loading: boolean, reload: () => void }}
 *
 * @example
 * const { data, error, loading, reload } = useResource(
 *   ({ signal }) => getNews({ page }, { signal }),
 *   [page],
 * )
 */
export function useResource(fn, deps = [], options = {}) {
  const { enabled = true, initialData = null } = options

  const fnRef = useRef(fn)
  fnRef.current = fn

  const [state, setState] = useState({
    data: initialData,
    error: null,
    loading: enabled,
  })
  const [nonce, setNonce] = useState(0)

  /** Refetch on demand — the retry button of an error state. */
  const reload = useCallback(() => setNonce((n) => n + 1), [])

  useEffect(() => {
    if (!enabled) {
      setState((prev) => (prev.loading ? { ...prev, loading: false } : prev))
      return undefined
    }

    const controller = new AbortController()
    let active = true

    setState((prev) => ({ ...prev, loading: true, error: null }))

    Promise.resolve()
      .then(() => fnRef.current({ signal: controller.signal }))
      .then((data) => {
        if (active) setState({ data, error: null, loading: false })
      })
      .catch((err) => {
        if (!active || (err && err.name === 'AbortError')) return
        // Previous data is deliberately kept so the page can show stale content
        // alongside the error rather than blanking.
        setState((prev) => ({ data: prev.data, error: err, loading: false }))
      })

    return () => {
      active = false
      controller.abort()
    }
    // `fn` is intentionally excluded — it lives in a ref. `deps` is spread so callers can
    // pass an inline array without changing identity every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, nonce, ...deps])

  return { data: state.data, error: state.error, loading: state.loading, reload }
}

/**
 * Debounce a rapidly changing value — search inputs must not fire a request per keystroke
 * (SPEC §7 asks for 300ms).
 *
 * @template T
 * @param {T} value
 * @param {number} [delay] milliseconds
 * @returns {T} the value, settled
 */
export function useDebouncedValue(value, delay = 300) {
  const [settled, setSettled] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setSettled(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])

  return settled
}

export default useResource
