import { useCallback, useEffect, useMemo, useState } from 'react'

import { FormRow } from '@/admin/components/FormRow'
import { useToast } from '@/admin/components/Toast'
import { adminGet, adminPut } from '@/admin/lib/adminApi'
import { SeoHead } from '@/components/SeoHead'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Spinner } from '@/components/ui/Spinner'

import { PageTitle } from './PageTitle'
import { useUnsavedGuard } from './useUnsavedGuard'

/** The groups the API returns, in the order the school actually thinks about them. */
const GROUP_ORDER = ['identity', 'contact', 'hero', 'admissions', 'stats', 'social']
const GROUP_LABELS = {
  identity: 'School identity',
  contact: 'Contact and address',
  hero: 'Homepage hero',
  admissions: 'Admissions',
  stats: 'Figures shown on the site',
  social: 'Social media',
}

/** A short note under each group heading, so the operator knows what they are editing. */
const GROUP_NOTES = {
  identity: 'The school name, motto and curriculum, used across the site and in search results.',
  contact: 'Shown in the header, the footer and on the contact page.',
  hero: 'The headline, supporting line and photograph at the top of the homepage.',
  admissions: 'Links to downloadable documents. Blank links are hidden rather than shown broken.',
  stats: 'The figures in the banded rows. Enter them exactly as they should read, e.g. “640+”.',
  social: 'Only the networks with a link here appear in the footer.',
}

/** What the public site does when a value is left blank — shown next to empty fields. */
const BLANK_BEHAVIOUR = {
  office_hours: 'The contact page invites visitors to call or email instead of showing hours.',
  map_embed_url: 'The contact page shows the address with a “search on Google Maps” link.',
  hero_image_url: 'The homepage uses its built-in hero photograph.',
  application_form_url: 'The admissions page tells parents to enquire and you will email the pack.',
  fee_structure_url: 'The admissions page tells parents to enquire for the full fee structure.',
  academic_calendar_url: 'The academics page shows term dates without a download link.',
  virtual_tour_url: 'The gallery omits the virtual tour section entirely.',
  youtube_url: 'The footer omits the YouTube link.',
  facebook_url: 'The footer omits the Facebook link.',
  instagram_url: 'The footer omits the Instagram link.',
}

export default function SettingsPage() {
  const toast = useToast()
  const [rows, setRows] = useState(null)
  const [values, setValues] = useState({})
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState(null)

  const load = useCallback(() => {
    const controller = new AbortController()
    setLoading(true)
    adminGet('/admin/settings', { signal: controller.signal })
      .then((data) => {
        setRows(data.items)
        setValues(Object.fromEntries(data.items.map((r) => [r.key, r.value ?? ''])))
        setLoadError(null)
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setLoadError(err)
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [])

  useEffect(load, [load])

  const dirtyKeys = useMemo(() => {
    if (!rows) return []
    return rows.filter((r) => (r.value ?? '') !== values[r.key]).map((r) => r.key)
  }, [rows, values])

  useUnsavedGuard(dirtyKeys.length > 0 && !saving)

  const grouped = useMemo(() => {
    if (!rows) return []
    const map = new Map()
    rows.forEach((row) => {
      const key = row.group || 'general'
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(row)
    })
    return [...map.entries()].sort(
      (a, b) =>
        (GROUP_ORDER.indexOf(a[0]) + 1 || 99) - (GROUP_ORDER.indexOf(b[0]) + 1 || 99),
    )
  }, [rows])

  const validate = () => {
    const next = {}
    rows.forEach((row) => {
      const value = values[row.key]
      if (!value) return
      if (row.value_type === 'url' && !/^https?:\/\//i.test(value) && !value.startsWith('/')) {
        next[row.key] = 'Start with https:// (or / for a file on this site).'
      }
      if (row.value_type === 'number' && Number.isNaN(Number(value))) {
        next[row.key] = 'Numbers only.'
      }
      if (row.value_type === 'json') {
        try {
          JSON.parse(value)
        } catch {
          next[row.key] = 'This is not valid JSON.'
        }
      }
    })
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const save = async (event) => {
    event.preventDefault()
    if (!validate()) {
      toast.error('Some values need attention.')
      return
    }
    setSaving(true)
    try {
      // The endpoint takes the changed rows wrapped in `values`, and rejects unknown keys.
      const payload = Object.fromEntries(dirtyKeys.map((key) => [key, values[key]]))
      await adminPut('/admin/settings', { values: payload })
      toast.success(
        dirtyKeys.length === 1 ? 'Setting saved.' : `${dirtyKeys.length} settings saved.`,
      )
      load()
    } catch (err) {
      if (err.code === 'VALIDATION_ERROR' && err.fields) {
        setErrors(err.fields)
        toast.error('Some values need attention.')
      } else {
        toast.error(err.message || 'Could not save the settings.')
      }
    } finally {
      setSaving(false)
    }
  }

  // Nothing below may touch `rows` until it exists. An aborted request (React re-running the
  // effect on mount) clears `loading` without ever setting `rows`, so guard on the data
  // itself rather than on the loading flag.
  if (!rows) {
    if (loadError) {
      return (
        <div className="rounded-sm border border-danger/30 bg-danger/5 p-6 text-sm">
          <p className="font-medium text-danger">Could not load the settings.</p>
          <button type="button" onClick={load} className="mt-2 underline">
            Try again
          </button>
        </div>
      )
    }
    return (
      <div className="flex justify-center py-20">
        <Spinner label="Loading settings" />
      </div>
    )
  }

  const blanks = rows.filter((r) => !values[r.key]).length

  return (
    <>
      <SeoHead title="Settings" noindex />
      <PageTitle
        title="Website information"
        lead="Everything the public site shows about the school. Changes appear immediately."
      />

      {blanks > 0 && (
        <p className="mb-6 flex items-start gap-2 rounded-sm border border-gold/40 bg-gold-50 px-4 py-3 text-sm text-warn">
          <Icon name="info" size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>
            {blanks} {blanks === 1 ? 'value is' : 'values are'} still blank. The site hides those
            sections rather than showing something empty — each blank field explains what it does
            below.
          </span>
        </p>
      )}

      {/* On a refetch the current values stay on screen and simply dim — blanking a form the
          operator is looking at would lose their place. */}
      <form onSubmit={save} className={`max-w-3xl space-y-8 pb-24 ${loading ? 'opacity-60' : ''}`}>
        {grouped.map(([group, items]) => (
          <section key={group} aria-labelledby={`group-${group}`}>
            <div className="mb-3 border-b border-line pb-2">
              <h2
                id={`group-${group}`}
                className="text-sm font-semibold tracking-[0.06em] text-ink-70 uppercase"
              >
                {GROUP_LABELS[group] || group}
              </h2>
              {GROUP_NOTES[group] && (
                <p className="mt-1 text-xs text-ink-50">{GROUP_NOTES[group]}</p>
              )}
            </div>
            <div className="grid gap-5">
              {items.map((row) => {
                const isEmpty = !values[row.key]
                const hint =
                  isEmpty && BLANK_BEHAVIOUR[row.key]
                    ? `Currently blank — ${BLANK_BEHAVIOUR[row.key]}`
                    : undefined

                if (row.value_type === 'bool') {
                  return (
                    <div key={row.key} className="flex items-start gap-3">
                      <input
                        id={`s-${row.key}`}
                        type="checkbox"
                        checked={values[row.key] === 'true'}
                        onChange={(event) =>
                          setValues((v) => ({ ...v, [row.key]: event.target.checked ? 'true' : 'false' }))
                        }
                        className="mt-0.5 h-4 w-4"
                      />
                      <label htmlFor={`s-${row.key}`} className="text-sm font-medium text-ink">
                        {row.label || row.key}
                      </label>
                    </div>
                  )
                }

                const multiline = row.value_type === 'text' || row.value_type === 'json'
                return (
                  <FormRow
                    key={row.key}
                    label={row.label || row.key}
                    as={multiline ? 'textarea' : 'input'}
                    rows={row.value_type === 'json' ? 6 : 4}
                    // Deliberately not `type="url"`: several of these hold a site-relative path
                    // like /brand/crest.png, which the native URL type rejects — silently
                    // blocking the whole form. `validate()` below accepts both forms.
                    type={row.value_type === 'number' ? 'number' : 'text'}
                    inputMode={row.value_type === 'url' ? 'url' : undefined}
                    value={values[row.key] ?? ''}
                    error={errors[row.key]}
                    hint={hint}
                    onChange={(event) => setValues((v) => ({ ...v, [row.key]: event.target.value }))}
                  />
                )
              })}
            </div>
          </section>
        ))}

        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur-sm lg:left-64">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
            <p className="text-sm text-ink-70">
              {dirtyKeys.length === 0
                ? 'No unsaved changes.'
                : `${dirtyKeys.length} unsaved ${dirtyKeys.length === 1 ? 'change' : 'changes'}.`}
            </p>
            <Button type="submit" size="sm" disabled={saving || dirtyKeys.length === 0}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </div>
      </form>
    </>
  )
}
