import { useCallback, useState } from 'react'

import { ConfirmDialog } from '@/admin/components/ConfirmDialog'
import { DataTable } from '@/admin/components/DataTable'
import { FormRow } from '@/admin/components/FormRow'
import { Modal } from '@/admin/components/Modal'
import { useToast } from '@/admin/components/Toast'
import { adminDel, adminGet, adminPost, adminPut } from '@/admin/lib/adminApi'
import { SeoHead } from '@/components/SeoHead'
import { Button } from '@/components/ui/Button'
import { slugify } from '@/lib/format'
import { useResource } from '@/lib/useResource'

import { PageTitle } from './PageTitle'

const BLANK = { name: '', slug: '', description: '', position: 0 }

export default function CategoriesManager() {
  const toast = useToast()
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const { data, error, loading, reload } = useResource(
    ({ signal }) => adminGet('/admin/gallery/categories', { signal }),
    [],
  )

  const open = (row) => {
    setEditing(row || 'new')
    setForm(row ? { ...BLANK, ...row, description: row.description || '' } : BLANK)
    setErrors({})
  }

  const save = useCallback(async () => {
    if (!form.name.trim()) {
      setErrors({ name: 'Give the category a name.' })
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        slug: (form.slug || slugify(form.name)).trim(),
        description: form.description.trim() || null,
        position: Number(form.position) || 0,
      }
      if (editing === 'new') await adminPost('/admin/gallery/categories', payload)
      else await adminPut(`/admin/gallery/categories/${editing.id}`, payload)
      toast.success(editing === 'new' ? 'Category created.' : 'Category saved.')
      setEditing(null)
      reload()
    } catch (err) {
      if (err.code === 'VALIDATION_ERROR' && err.fields) setErrors(err.fields)
      else if (err.code === 'CONFLICT') setErrors({ slug: 'That web address is already used.' })
      else toast.error(err.message || 'Could not save the category.')
    } finally {
      setSaving(false)
    }
  }, [editing, form, reload, toast])

  const confirmDelete = useCallback(async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await adminDel(`/admin/gallery/categories/${pendingDelete.id}`)
      toast.success(`“${pendingDelete.name}” was deleted.`)
      setPendingDelete(null)
      reload()
    } catch (err) {
      toast.error(err.message || 'Could not delete that category.')
    } finally {
      setDeleting(false)
    }
  }, [pendingDelete, reload, toast])

  const columns = [
    { key: 'name', header: 'Category', primary: true, render: (row) => <span className="font-medium">{row.name}</span> },
    { key: 'slug', header: 'Web address', render: (row) => <code className="text-xs text-ink-50">{row.slug}</code> },
    { key: 'image_count', header: 'Photos', render: (row) => row.image_count },
    { key: 'position', header: 'Order', render: (row) => row.position },
  ]

  return (
    <>
      <SeoHead title="Gallery categories" noindex />
      <PageTitle
        title="Gallery categories"
        lead="The filters parents see above the photo gallery."
        action={
          <Button size="sm" onClick={() => open(null)}>
            New category
          </Button>
        }
      />

      <DataTable
        caption="Gallery categories"
        columns={columns}
        rows={data?.items || []}
        loading={loading}
        error={error}
        onRetry={reload}
        rowKey={(row) => row.id}
        empty={{
          title: 'No categories yet',
          description: 'Add one — the gallery groups photos by these.',
        }}
        actions={(row) => (
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => open(row)}>
              Edit
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setPendingDelete(row)}>
              Delete
            </Button>
          </div>
        )}
      />

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'New category' : 'Edit category'}
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
        <div className="grid gap-4">
          <FormRow
            label="Name"
            required
            value={form.name}
            error={errors.name}
            onChange={(event) => setForm((f) => ({ ...f, name: event.target.value }))}
          />
          <FormRow
            label="Web address"
            value={form.slug}
            error={errors.slug}
            hint="Leave blank to build it from the name."
            onChange={(event) => setForm((f) => ({ ...f, slug: event.target.value }))}
          />
          <FormRow
            label="Description"
            as="textarea"
            rows={3}
            value={form.description}
            error={errors.description}
            onChange={(event) => setForm((f) => ({ ...f, description: event.target.value }))}
          />
          <FormRow
            label="Order"
            type="number"
            value={form.position}
            error={errors.position}
            hint="Lower numbers appear first in the gallery filters."
            onChange={(event) => setForm((f) => ({ ...f, position: event.target.value }))}
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        busy={deleting}
        title="Delete this category?"
        body={`“${pendingDelete?.name || ''}” will be removed. Its ${
          pendingDelete?.image_count || 0
        } photo(s) are kept, but become uncategorised until you file them again.`}
      />
    </>
  )
}
