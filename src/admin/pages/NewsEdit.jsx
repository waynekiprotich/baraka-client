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

import { toFormValues } from './formValues'
import { PageTitle } from './PageTitle'
import { useUnsavedGuard } from './useUnsavedGuard'

const EXCERPT_MAX = 300

const BLANK = {
  title: '',
  slug: '',
  excerpt: '',
  body: '',
  category: '',
  author: '',
  cover_image_url: null,
  cover_image_alt: '',
  is_published: false,
}

export default function NewsEdit() {
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
    adminGet(`/admin/news/${id}`, { signal: controller.signal })
      .then((article) => setForm(toFormValues(BLANK, article)))
      .catch((err) => {
        if (err.name !== 'AbortError') toast.error(err.message || 'Could not load that article.')
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [id, isNew, toast])

  const set = useCallback((patch) => {
    setForm((prev) => ({ ...prev, ...patch }))
    setDirty(true)
  }, [])

  const onTitle = (value) => {
    set({ title: value, ...(slugTouched ? {} : { slug: slugify(value) }) })
  }

  const validate = () => {
    const next = {}
    if (!form.title.trim()) next.title = 'Give the article a title.'
    if (!form.slug.trim()) next.slug = 'A web address is required.'
    if (!form.excerpt.trim()) next.excerpt = 'Write a short summary — it appears in the news list.'
    if (form.excerpt.length > EXCERPT_MAX) next.excerpt = `Keep this under ${EXCERPT_MAX} characters.`
    if (!form.body.trim()) next.body = 'The article needs some content.'
    if (form.cover_image_url && !form.cover_image_alt.trim()) {
      next.cover_image_alt = 'Describe the cover image so screen readers can announce it.'
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
        excerpt: form.excerpt.trim(),
        body: form.body,
        category: form.category.trim() || null,
        author: form.author.trim() || null,
        cover_image_url: form.cover_image_url || null,
        cover_image_alt: form.cover_image_url ? form.cover_image_alt.trim() : null,
        is_published: form.is_published,
      }
      const saved = isNew
        ? await adminPost('/admin/news', payload)
        : await adminPut(`/admin/news/${id}`, payload)
      setDirty(false)
      toast.success(isNew ? 'Article created.' : 'Article saved.')
      navigate(isNew ? `/admin/news/${saved.id}` : '/admin/news')
    } catch (err) {
      if (err.code === 'VALIDATION_ERROR' && err.fields) {
        setErrors(err.fields)
        toast.error('Some fields need attention.')
      } else if (err.code === 'CONFLICT') {
        setErrors({ slug: 'Another article already uses this web address.' })
        toast.error('That web address is taken.')
      } else {
        toast.error(err.message || 'Could not save the article.')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner label="Loading article" />
      </div>
    )
  }

  return (
    <>
      <SeoHead title={isNew ? 'New article' : 'Edit article'} noindex />
      <PageTitle
        title={isNew ? 'New article' : 'Edit article'}
        lead={
          form.slug
            ? `Public address: /news/${form.slug}`
            : 'Published articles appear on the public News page.'
        }
        action={
          <Button variant="secondary" size="sm" to="/admin/news">
            Back to list
          </Button>
        }
      />

      <form onSubmit={save} className="grid max-w-4xl gap-5">
        <FormRow
          label="Title"
          required
          value={form.title}
          error={errors.title}
          onChange={(event) => onTitle(event.target.value)}
        />

        <FormRow
          label="Web address"
          required
          value={form.slug}
          error={errors.slug}
          hint="Used in the link: /news/your-address. Lower case, words joined by hyphens."
          onChange={(event) => {
            setSlugTouched(true)
            set({ slug: event.target.value })
          }}
        />

        <FormRow
          label="Summary"
          as="textarea"
          rows={3}
          required
          value={form.excerpt}
          error={errors.excerpt}
          maxLength={EXCERPT_MAX + 50}
          hint={`Shown in the news list and in search results. ${form.excerpt.length}/${EXCERPT_MAX} characters.`}
          onChange={(event) => set({ excerpt: event.target.value })}
        />

        <FormRow
          label="Article"
          as="textarea"
          rows={16}
          required
          value={form.body}
          error={errors.body}
          hint="Plain text. Leave a blank line between paragraphs — that is how they are separated on the site."
          onChange={(event) => set({ body: event.target.value })}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <FormRow
            label="Category"
            value={form.category}
            error={errors.category}
            hint="Groups the article in the News filters, e.g. Academics, Sports, Community."
            onChange={(event) => set({ category: event.target.value })}
          />
          <FormRow
            label="Author"
            value={form.author}
            error={errors.author}
            onChange={(event) => set({ author: event.target.value })}
          />
        </div>

        <ImageUploader
          label="Cover image"
          value={form.cover_image_url}
          alt={form.cover_image_alt}
          altError={errors.cover_image_alt}
          onChange={({ url, alt }) => set({ cover_image_url: url, cover_image_alt: alt })}
        />

        <div className="flex items-start gap-3 rounded-sm border border-line bg-paper p-4">
          <input
            id="is-published"
            type="checkbox"
            checked={form.is_published}
            onChange={(event) => set({ is_published: event.target.checked })}
            aria-describedby="is-published-hint"
            className="mt-0.5 h-4 w-4"
          />
          <div className="text-sm">
            <label htmlFor="is-published" className="font-medium text-ink">
              Published
            </label>
            <p id="is-published-hint" className="mt-0.5 text-ink-70">
              When ticked, parents can read this on the public News page.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 border-t border-line pt-5">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : isNew ? 'Create article' : 'Save changes'}
          </Button>
          <Button variant="secondary" to="/admin/news" disabled={saving}>
            Cancel
          </Button>
          {dirty && <p className="self-center text-xs text-ink-50">You have unsaved changes.</p>}
        </div>
      </form>
    </>
  )
}
