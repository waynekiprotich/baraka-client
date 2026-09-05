import { useCallback, useState } from 'react'

import { ConfirmDialog } from '@/admin/components/ConfirmDialog'
import { FormRow } from '@/admin/components/FormRow'
import { ImageUploader } from '@/admin/components/ImageUploader'
import { Modal } from '@/admin/components/Modal'
import { StatusPill } from '@/admin/components/StatusPill'
import { useToast } from '@/admin/components/Toast'
import { adminDel, adminGet, adminPost, adminPut } from '@/admin/lib/adminApi'
import { SeoHead } from '@/components/SeoHead'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Spinner } from '@/components/ui/Spinner'
import { useResource } from '@/lib/useResource'

import { ListFilters } from './ListFilters'
import { PageTitle } from './PageTitle'

const BLANK = {
  title: '',
  alt_text: '',
  category_id: '',
  is_featured: false,
  url: null,
  thumb_url: null,
  storage_key: null,
  width: null,
  height: null,
}

export default function GalleryManager() {
  const toast = useToast()
  const [category, setCategory] = useState('')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [reordering, setReordering] = useState(false)
  const [order, setOrder] = useState(null)

  const categories = useResource(({ signal }) => adminGet('/admin/gallery/categories', { signal }), [])

  const images = useResource(
    ({ signal }) =>
      adminGet('/admin/gallery/images', {
        signal,
        params: { per_page: 100, ...(category ? { category } : {}) },
      }),
    [category],
  )

  const rows = order || images.data?.items || []

  const openNew = () => {
    setEditing('new')
    setForm(BLANK)
    setErrors({})
  }

  const openEdit = (image) => {
    setEditing(image)
    setForm({
      title: image.title || '',
      alt_text: image.alt_text || '',
      category_id: image.category_id ? String(image.category_id) : '',
      is_featured: image.is_featured,
      url: image.url,
    })
    setErrors({})
  }

  const save = useCallback(async () => {
    const next = {}
    if (!form.url) next.url = 'Upload an image first.'
    if (!form.alt_text.trim()) next.alt_text = 'Describe the photo — this is required.'
    setErrors(next)
    if (Object.keys(next).length) return

    setSaving(true)
    try {
      const payload = {
        title: form.title.trim() || null,
        alt_text: form.alt_text.trim(),
        category_id: form.category_id ? Number(form.category_id) : null,
        is_featured: form.is_featured,
      }
      if (editing === 'new')
        await adminPost('/admin/gallery/images', {
          ...payload,
          url: form.url,
          thumb_url: form.thumb_url,
          storage_key: form.storage_key,
          width: form.width,
          height: form.height,
        })
      else await adminPut(`/admin/gallery/images/${editing.id}`, payload)
      toast.success(editing === 'new' ? 'Photo added.' : 'Photo updated.')
      setEditing(null)
      setOrder(null)
      images.reload()
    } catch (err) {
      if (err.code === 'VALIDATION_ERROR' && err.fields) setErrors(err.fields)
      else toast.error(err.message || 'Could not save that photo.')
    } finally {
      setSaving(false)
    }
  }, [editing, form, images, toast])

  const confirmDelete = useCallback(async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await adminDel(`/admin/gallery/images/${pendingDelete.id}`)
      toast.success('Photo deleted.')
      setPendingDelete(null)
      setOrder(null)
      images.reload()
    } catch (err) {
      toast.error(err.message || 'Could not delete that photo.')
    } finally {
      setDeleting(false)
    }
  }, [pendingDelete, images, toast])

  /** Move a photo one place in either direction. Keyboard-operable by design — a drag-only
   *  reorder would be unusable with a keyboard or on a touch screen. */
  const move = (index, delta) => {
    const target = index + delta
    if (target < 0 || target >= rows.length) return
    const next = [...rows]
    ;[next[index], next[target]] = [next[target], next[index]]
    setOrder(next)
  }

  const saveOrder = async () => {
    if (!order) return
    setReordering(true)
    try {
      await adminPost('/admin/gallery/images/reorder', { ids: order.map((i) => i.id) })
      toast.success('New photo order saved.')
      setOrder(null)
      images.reload()
    } catch (err) {
      toast.error(err.message || 'Could not save the new order.')
    } finally {
      setReordering(false)
    }
  }

  const categoryOptions = [
    { value: '', label: 'All categories' },
    ...(categories.data?.items || []).map((c) => ({ value: c.slug, label: c.name })),
  ]

  return (
    <>
      <SeoHead title="Gallery" noindex />
      <PageTitle
        title="Gallery"
        lead="Photos shown on the public gallery and the homepage strip."
        action={
          <>
            {order && (
              <Button size="sm" onClick={saveOrder} disabled={reordering}>
                {reordering ? 'Saving…' : 'Save order'}
              </Button>
            )}
            {order && (
              <Button variant="secondary" size="sm" onClick={() => setOrder(null)} disabled={reordering}>
                Discard order
              </Button>
            )}
            <Button size="sm" onClick={openNew}>
              Add photo
            </Button>
          </>
        }
      />

      <ListFilters
        searchLabel=""
        select={{
          label: 'Category',
          value: category,
          options: categoryOptions,
          onChange: (value) => {
            setOrder(null)
            setCategory(value)
          },
        }}
      />

      {images.error && (
        <div className="rounded-sm border border-danger/30 bg-danger/5 p-6 text-center text-sm">
          <p className="font-medium text-danger">Could not load the gallery.</p>
          <button type="button" onClick={images.reload} className="mt-2 underline">
            Try again
          </button>
        </div>
      )}

      {images.loading && rows.length === 0 && (
        <div className="flex justify-center py-16">
          <Spinner label="Loading photos" />
        </div>
      )}

      {!images.loading && rows.length === 0 && !images.error && (
        <div className="rounded-sm border border-dashed border-line bg-paper py-14 text-center">
          <Icon name="image" size={22} className="mx-auto text-ink-50" aria-hidden="true" />
          <p className="mt-2 text-sm font-medium text-ink">No photos here yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-ink-70">
            Add the first one and it will appear in the public gallery straight away.
          </p>
        </div>
      )}

      {rows.length > 0 && (
        <ul className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${images.loading ? 'opacity-60' : ''}`}>
          {rows.map((image, index) => (
            <li key={image.id} className="overflow-hidden rounded-sm border border-line bg-paper">
              <img
                src={image.thumb_url || image.url}
                alt={image.alt_text}
                width={image.width}
                height={image.height}
                loading="lazy"
                decoding="async"
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                    {image.title || <span className="text-ink-50">Untitled</span>}
                  </p>
                  {image.is_featured && <StatusPill status="featured" />}
                </div>
                <p className="mt-0.5 truncate text-xs text-ink-50">
                  {image.category?.name || 'Uncategorised'}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <Button variant="secondary" size="sm" onClick={() => openEdit(image)}>
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setPendingDelete(image)}>
                    Delete
                  </Button>
                  <span className="ml-auto flex gap-1">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-xs border border-line text-ink-70 disabled:opacity-30"
                    >
                      <Icon name="chevron-up" size={16} />
                      <span className="sr-only">Move {image.title || 'photo'} earlier</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === rows.length - 1}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-xs border border-line text-ink-70 disabled:opacity-30"
                    >
                      <Icon name="chevron-down" size={16} />
                      <span className="sr-only">Move {image.title || 'photo'} later</span>
                    </button>
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {order && (
        <p className="mt-4 rounded-sm border border-gold/40 bg-gold-50 px-4 py-2.5 text-sm text-warn">
          The order has changed but is not saved yet.
        </p>
      )}

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        size="lg"
        title={editing === 'new' ? 'Add a photo' : 'Edit photo'}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setEditing(null)} disabled={saving}>
              Cancel
            </Button>
            <Button size="sm" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </>
        }
      >
        {editing && (
        <div className="grid gap-4">
          {editing === 'new' ? (
            <>
              <ImageUploader
                label="Photo"
                value={form.url}
                alt={form.alt_text}
                altError={errors.alt_text}
                onChange={(next) =>
                  // `ImageUploader` re-fires onChange on every keystroke in its own alt-text
                  // field, and that call carries only {url, alt} -- the fields below are
                  // simply absent, not explicitly cleared. Merge rather than overwrite, so
                  // typing the description doesn't wipe out what the upload step just set.
                  // Only the explicit `Remove` action sends `null` for these, which still
                  // clears them as intended.
                  setForm((f) => ({
                    ...f,
                    url: next.url,
                    alt_text: next.alt,
                    thumb_url: 'thumbUrl' in next ? next.thumbUrl : f.thumb_url,
                    storage_key: 'storageKey' in next ? next.storageKey : f.storage_key,
                    width: 'width' in next ? next.width : f.width,
                    height: 'height' in next ? next.height : f.height,
                  }))
                }
              />
              {errors.url && <p className="text-xs font-medium text-danger">{errors.url}</p>}
            </>
          ) : (
            <>
              <img
                src={editing.thumb_url || editing.url}
                alt={editing.alt_text}
                className="aspect-[4/3] w-full rounded-xs object-cover"
              />
              <FormRow
                label="Describe this photo"
                required
                value={form.alt_text}
                error={errors.alt_text}
                hint="Read aloud by screen readers. Describe what is happening."
                onChange={(event) => setForm((f) => ({ ...f, alt_text: event.target.value }))}
              />
            </>
          )}

          <FormRow
            label="Title"
            value={form.title}
            error={errors.title}
            hint="Optional caption shown under the photo in the lightbox."
            onChange={(event) => setForm((f) => ({ ...f, title: event.target.value }))}
          />

          <FormRow
            label="Category"
            as="select"
            value={form.category_id}
            error={errors.category_id}
            onChange={(event) => setForm((f) => ({ ...f, category_id: event.target.value }))}
          >
            <option value="">Uncategorised</option>
            {(categories.data?.items || []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </FormRow>

          <div className="flex items-start gap-3">
            <input
              id="image-featured"
              type="checkbox"
              checked={form.is_featured}
              onChange={(event) => setForm((f) => ({ ...f, is_featured: event.target.checked }))}
              aria-describedby="image-featured-hint"
              className="mt-0.5 h-4 w-4"
            />
            <div className="text-sm">
              <label htmlFor="image-featured" className="font-medium text-ink">
                Featured
              </label>
              <p id="image-featured-hint" className="mt-0.5 text-ink-70">
                Featured photos are the ones pulled onto the homepage.
              </p>
            </div>
          </div>
        </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        busy={deleting}
        title="Delete this photo?"
        body="The photo will be removed from the gallery permanently. This cannot be undone."
      />
    </>
  )
}
