import { useCallback, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { ConfirmDialog } from '@/admin/components/ConfirmDialog'
import { DataTable } from '@/admin/components/DataTable'
import { StatusPill } from '@/admin/components/StatusPill'
import { useToast } from '@/admin/components/Toast'
import { adminDel, adminGet, adminPatch } from '@/admin/lib/adminApi'
import { SeoHead } from '@/components/SeoHead'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import { formatDateTime, isUpcoming } from '@/lib/format'
import { useDebouncedValue, useResource } from '@/lib/useResource'

import { ListFilters } from './ListFilters'
import { PageTitle } from './PageTitle'

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Drafts' },
]

export default function EventsList() {
  const toast = useToast()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const query = useDebouncedValue(search, 300)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [busy, setBusy] = useState(false)

  const { data, error, loading, reload } = useResource(
    ({ signal }) =>
      adminGet('/admin/events', {
        signal,
        params: { page, per_page: 20, ...(status ? { status } : {}), ...(query ? { q: query } : {}) },
      }),
    [page, status, query],
  )

  const togglePublish = useCallback(
    async (row) => {
      try {
        await adminPatch(`/admin/events/${row.id}/publish`, { is_published: !row.is_published })
        toast.success(`“${row.title}” is now ${row.is_published ? 'a draft' : 'published'}.`)
        reload()
      } catch (err) {
        toast.error(err.message || 'Could not change that event.')
      }
    },
    [reload, toast],
  )

  const confirmDelete = useCallback(async () => {
    if (!pendingDelete) return
    setBusy(true)
    try {
      await adminDel(`/admin/events/${pendingDelete.id}`)
      toast.success(`“${pendingDelete.title}” was deleted.`)
      setPendingDelete(null)
      reload()
    } catch (err) {
      toast.error(err.message || 'Could not delete that event.')
    } finally {
      setBusy(false)
    }
  }, [pendingDelete, reload, toast])

  const columns = [
    {
      key: 'title',
      header: 'Event',
      primary: true,
      render: (row) => (
        <Link to={`/admin/events/${row.id}`} className="font-medium text-ink underline-offset-2 hover:underline">
          {row.title}
        </Link>
      ),
    },
    { key: 'starts_at', header: 'Starts', render: (row) => formatDateTime(row.starts_at) },
    { key: 'location', header: 'Location', render: (row) => row.location || '—' },
    {
      key: 'when',
      header: 'When',
      render: (row) => <StatusPill status={isUpcoming(row.starts_at) ? 'upcoming' : 'past'} />,
    },
    {
      key: 'is_published',
      header: 'Status',
      render: (row) => <StatusPill status={row.is_published ? 'published' : 'draft'} />,
    },
  ]

  return (
    <>
      <SeoHead title="Events" noindex />
      <PageTitle
        title="Events"
        lead="Upcoming events shown on the News page and the homepage."
        action={
          <Button size="sm" onClick={() => navigate('/admin/events/new')}>
            New event
          </Button>
        }
      />

      <ListFilters
        search={search}
        onSearch={(value) => {
          setSearch(value)
          setPage(1)
        }}
        searchLabel="Search events by title"
        select={{
          label: 'Status',
          value: status,
          options: STATUS_OPTIONS,
          onChange: (value) => {
            setStatus(value)
            setPage(1)
          },
        }}
      />

      <DataTable
        caption="Events"
        columns={columns}
        rows={data?.items || []}
        loading={loading}
        error={error}
        onRetry={reload}
        rowKey={(row) => row.id}
        empty={{
          title: query || status ? 'No events match those filters' : 'No events yet',
          description:
            query || status
              ? 'Try a different search or clear the status filter.'
              : 'Add an open day or a parents’ evening and it will show on the homepage.',
        }}
        actions={(row) => (
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="secondary" size="sm" to={`/admin/events/${row.id}`}>
              Edit
            </Button>
            <Button variant="ghost" size="sm" onClick={() => togglePublish(row)}>
              {row.is_published ? 'Unpublish' : 'Publish'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setPendingDelete(row)}>
              Delete
            </Button>
          </div>
        )}
      />

      {data && data.pages > 1 && (
        <div className="mt-6">
          <Pagination page={data.page} pages={data.pages} onChange={setPage} label="Event pages" />
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        busy={busy}
        title="Delete this event?"
        body={`“${pendingDelete?.title || ''}” will be removed permanently. This cannot be undone.`}
      />
    </>
  )
}
