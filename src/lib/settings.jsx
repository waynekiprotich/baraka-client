import { createContext, useContext, useMemo } from 'react'

import { defaultSettings } from '@/content/site'
import { getSettings } from '@/lib/api'
import { useResource } from '@/lib/useResource'

/**
 * Live site settings, fetched once for the whole app.
 *
 * Contact details, socials, the address and the hero copy are CMS-managed (SPEC §2): they
 * must render from this hook, never from a literal in a component. `defaultSettings` from
 * content/site.js fills the gap before the request resolves and if it fails, so the header
 * and footer are never empty.
 */

const SettingsContext = createContext(null)

/**
 * Wraps the site (public and admin chrome alike) and performs the single `/settings` fetch.
 */
export function SettingsProvider({ children }) {
  const { data, error, loading, reload } = useResource(({ signal }) => getSettings({ signal }), [])

  const value = useMemo(() => {
    const settings = { ...defaultSettings, ...(data || null) }
    return {
      settings,
      /** Read one setting, falling back to the seeded default and then to `fallback`. */
      get: (key, fallback = '') => {
        const found = settings[key]
        return found === undefined || found === null || found === '' ? fallback : found
      },
      loading,
      error,
      reload,
      /** True once real values have arrived from the API. */
      ready: Boolean(data),
    }
  }, [data, error, loading, reload])

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

/**
 * @returns {{ settings: Object<string, string>, get: (key: string, fallback?: string) => string,
 *             loading: boolean, error: Error|null, reload: () => void, ready: boolean }}
 */
export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    // Rendered outside the provider (a test, or a component mounted on its own): fall back
    // to the seeded defaults rather than crashing the tree.
    return {
      settings: defaultSettings,
      get: (key, fallback = '') => defaultSettings[key] || fallback,
      loading: false,
      error: null,
      reload: () => {},
      ready: false,
    }
  }
  return context
}
