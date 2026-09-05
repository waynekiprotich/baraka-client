import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { FormRow } from '@/admin/components/FormRow'
import { ImageUploader } from '@/admin/components/ImageUploader'
import { useToast } from '@/admin/components/Toast'
import { adminGet, adminPost, adminPut } from '@/admin/lib/adminApi'
import { SeoHead } from '@/components/SeoHead'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { slugify } from '@/lib/format'

import { isoToLocalInput, localInputToIso } from './datetime'
import { toFormValues } from './formValues'
import { PageTitle } from './PageTitle'
import { useUnsavedGuard } from './useUnsavedGuard'

const BLANK = {
  title: '',
  slug: '',
  summary: '',
  description: '',
  starts_at: '',
  ends_at: '',
  location: '',
  cover_image_url: null,
  cover_image_alt: '',
  is_published: false,
}

export default function EventEdit() {
  const { id } = useParams()
  const isNew = !id
  const navigate = useNavigate()
  const toast = useToast()

  const [form, setForm] = useState(BLANK)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [slugTouched, setSlugTouched] = useState(!isNew)

  useUnsavedGuard(dirty && !saving)

  useEffect(() => {
    if (isNew) return undefined
    const controller = new AbortController()
    setLoading(true)
    adminGet(`/admin/events/${id}`, { signal: controller.signal })
      .then((event) =>
        setForm({
          ...toFormValues(BLANK, event),
          starts_at: isoToLocalInput(event.starts_at),
          ends_at: isoToLocalInput(event.ends_at),
        }),
      )
      .catch((err) => {
        if (err.name !== 'AbortError') toast.error(err.message || 'Could not load that event.')
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [id, isNew, toast])

  const set = useCallback((patch) => {
    setForm((prev) => ({ ...prev, ...patch }))
    setDirty(true)
  }, [])

  const validate = () => {
    const next = {}
    if (!form.title.trim()) next.title = 'Give the event a name.'
    if (!form.slug.trim()) next.slug = 'A web address is required.'
    if (!form.starts_at) next.starts_at = 'When does it start?'
    if (form.ends_at && form.starts_at && new Date(form.ends_at) <= new Date(form.starts_at)) {
      next.ends_at = 'The end time must be after the start time.'
    }
    if (form.cover_image_url && !form.cover_image_alt.trim()) {
      next.cover_image_alt = 'Describe the image so screen readers can announce it.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const save = async (event) => {
    event.preventDefault()
    if (!validate()) {
      toast.error('Some fields need attention.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        summary: form.summary.trim() || null,
        description: form.description || null,
        starts_at: localInputToIso(form.starts_at),
        ends_at: localInputToIso(form.ends_at),
        location: form.location.trim() || null,
        cover_image_url: form.cover_image_url || null,
        is_published: form.is_published,
      }
      const saved = isNew
        ? await adminPost('/admin/events', payload)
        : await adminPut(`/admin/events/${id}`, payload)
      setDirty(false)
      toast.success(isNew ? 'Event created.' : 'Event saved.')
      navigate(isNew ? `/admin/events/${saved.id}` : '/admin/events')
    } catch (err) {
      if (err.code === 'VALIDATION_ERROR' && err.fields) {
        setErrors(err.fields)
        toast.error('Some fields need attention.')
      } else if (err.code === 'CONFLICT') {
        setErrors({ slug: 'Another event already uses this web address.' })
        toast.error('That web address is taken.')
      } else {
        toast.error(err.message || 'Could not save the event.')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner label="Loading event" />
      </div>
    )
  }

  return (
    <>
      <SeoHead title={isNew ? 'New event' : 'Edit event'} noindex />
      <PageTitle
        title={isNew ? 'New event' : 'Edit event'}
        lead={form.slug ? `Public address: /events/${form.slug}` : 'Times are entered in your own time zone.'}
        action={
          <Button variant="secondary" size="sm" to="/admin/events">
            Back to list
          </Button>
        }
      />

      <form onSubmit={save} className="grid max-w-4xl gap-5">
        <FormRow
          label="Event name"
          required
          value={form.title}
          error={errors.title}
          onChange={(event) =>
            set({
              title: event.target.value,
              ...(slugTouched ? {} : { slug: slugify(event.target.value) }),
            })
          }
        />

        <FormRow
          label="Web address"
          required
          value={form.slug}
          error={errors.slug}
          hint="Used in the link: /events/your-address."
          onChange={(event) => {
            setSlugTouched(true)
            set({ slug: event.target.value })
          }}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <FormRow
            label="Starts"
            type="datetime-local"
            required
            value={form.starts_at}
            error={errors.starts_at}
            onChange={(event) => set({ starts_at: event.target.value })}
          />
          <FormRow
            label="Ends"
            type="datetime-local"
            value={form.ends_at}
            error={errors.ends_at}
            hint="Optional — leave blank for a single-time event."
            onChange={(event) => set({ ends_at: event.target.value })}
          />
        </div>

        <FormRow
          label="Location"
          value={form.location}
          error={errors.location}
          hint="e.g. Main Hall, or the school field."
          onChange={(event) => set({ location: event.target.value })}
        />

        <FormRow
          label="Summary"
          as="textarea"
          rows={3}
          value={form.summary}
          error={errors.summary}
          hint="One or two lines, shown in event listings."
          onChange={(event) => set({ summary: event.target.value })}
        />

        <FormRow
          label="Details"
          as="textarea"
          rows={12}
          value={form.description}
          error={errors.description}
          hint="Plain text. Leave a blank line between paragraphs."
          onChange={(event) => set({ description: event.target.value })}
        />

        <ImageUploader
          label="Cover image"
          value={form.cover_image_url}
          alt={form.cover_image_alt}
          altError={errors.cover_image_alt}
          onChange={({ url, alt }) => set({ cover_image_url: url, cover_image_alt: alt })}
        />

        <div className="flex items-start gap-3 rounded-sm border border-line bg-paper p-4">
          <input
            id="event-published"
            type="checkbox"
            checked={form.is_published}
            onChange={(event) => set({ is_published: event.target.checked })}
            aria-describedby="event-published-hint"
            className="mt-0.5 h-4 w-4"
          />
          <div className="text-sm">
            <label htmlFor="event-published" className="font-medium text-ink">
              Published
            </label>
            <p id="event-published-hint" className="mt-0.5 text-ink-70">
              When ticked, this event appears on the public site.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 border-t border-line pt-5">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : isNew ? 'Create event' : 'Save changes'}
          </Button>
          <Button variant="secondary" to="/admin/events" disabled={saving}>
            Cancel
          </Button>
          {dirty && <p className="self-center text-xs text-ink-50">You have unsaved changes.</p>}
        </div>
      </form>
    </>
  )
}
