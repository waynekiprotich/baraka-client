import { useCallback, useEffect, useState } from 'react'

import { ConfirmDialog } from '@/admin/components/ConfirmDialog'
import { StatusPill } from '@/admin/components/StatusPill'
import { useToast } from '@/admin/components/Toast'
import { adminDel, adminGet, adminPatch } from '@/admin/lib/adminApi'
import { SeoHead } from '@/components/SeoHead'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Spinner } from '@/components/ui/Spinner'
import { formatDateTime, mailtoHref, telHref } from '@/lib/format'
import { useResource } from '@/lib/useResource'

import { PageTitle } from './PageTitle'

const FILTERS = [
  { value: 'new', label: 'Unread' },
  { value: 'read', label: 'Read' },
  { value: 'archived', label: 'Archived' },
  { value: '', label: 'All' },
]

export default function EnquiriesInbox() {
  const toast = useToast()
  const [status, setStatus] = useState('new')
  // The open enquiry is held as an object, not just an id. Reading it marks it read, which
  // drops it out of the "Unread" filter — holding the object keeps it on screen instead of
  // blanking the pane the operator is mid-way through reading.
  const [selected, setSelected] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const { data, error, loading, reload } = useResource(
    ({ signal }) =>
      adminGet('/admin/enquiries', {
        signal,
        params: { per_page: 50, ...(status ? { status } : {}) },
      }),
    [status],
  )

  const items = data?.items || []

  // Opening an enquiry is what marks it read — the operator has now actually seen it.
  useEffect(() => {
    if (!selected || selected.status !== 'new') return
    let active = true
    adminPatch(`/admin/enquiries/${selected.id}`, { status: 'read' })
      .then(() => {
        if (!active) return
        setSelected((current) => (current ? { ...current, status: 'read' } : current))
        reload()
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [selected, reload])

  const setEnquiryStatus = useCallback(
    async (enquiry, next) => {
      try {
        await adminPatch(`/admin/enquiries/${enquiry.id}`, { status: next })
        setSelected((current) =>
          current && current.id === enquiry.id ? { ...current, status: next } : current,
        )
        toast.success(next === 'archived' ? 'Enquiry archived.' : `Marked as ${next}.`)
        reload()
      } catch (err) {
        toast.error(err.message || 'Could not update that enquiry.')
      }
    },
    [reload, toast],
  )

  const confirmDelete = useCallback(async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await adminDel(`/admin/enquiries/${pendingDelete.id}`)
      toast.success('Enquiry deleted.')
      setSelected((current) => (current && current.id === pendingDelete.id ? null : current))
      setPendingDelete(null)
      reload()
    } catch (err) {
      toast.error(err.message || 'Could not delete that enquiry.')
    } finally {
      setDeleting(false)
    }
  }, [pendingDelete, reload, toast])

  const counts = data?.counts

  return (
    <>
      <SeoHead title="Enquiries" noindex />
      <PageTitle
        title="Enquiries"
        lead="Messages from the contact and admissions forms on the public site."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const count = f.value ? counts?.[f.value] : counts?.total
          return (
            <button
              key={f.value || 'all'}
              type="button"
              onClick={() => {
                setStatus(f.value)
                setSelected(null)
              }}
              aria-pressed={status === f.value}
              className={`rounded-xs border px-3 py-1.5 text-sm ${
                status === f.value
                  ? 'border-brand bg-brand text-paper'
                  : 'border-line bg-paper text-ink-70 hover:bg-paper-2'
              }`}
            >
              {f.label}
              {typeof count === 'number' && <span className="ml-1.5 tabular-nums opacity-70">{count}</span>}
            </button>
          )
        })}
      </div>

      {error && (
        <div className="rounded-sm border border-danger/30 bg-danger/5 p-6 text-center text-sm">
          <p className="font-medium text-danger">Could not load the inbox.</p>
          <button type="button" onClick={reload} className="mt-2 underline">
            Try again
          </button>
        </div>
      )}

      {loading && items.length === 0 && (
        <div className="flex justify-center py-16">
          <Spinner label="Loading enquiries" />
        </div>
      )}

      {!loading && items.length === 0 && !selected && !error && (
        <div className="rounded-sm border border-dashed border-line bg-paper py-14 text-center">
          <Icon name="mail" size={22} className="mx-auto text-ink-50" aria-hidden="true" />
          <p className="mt-2 text-sm font-medium text-ink">
            {status === 'new' ? 'Nothing unread' : 'No enquiries here'}
          </p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-ink-70">
            Messages sent through the contact and admissions forms arrive here.
          </p>
        </div>
      )}

      {(items.length > 0 || selected) && (
        <div className="grid gap-4 lg:grid-cols-[22rem_1fr]">
          <ul className="divide-y divide-line overflow-hidden rounded-sm border border-line bg-paper">
            {items.length === 0 && (
              <li className="px-4 py-6 text-center text-xs text-ink-50">
                Nothing else under this filter.
              </li>
            )}
            {items.map((e) => (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => setSelected(e)}
                  aria-current={selected?.id === e.id ? 'true' : undefined}
                  className={`w-full px-4 py-3 text-left hover:bg-paper-2 ${
                    selected?.id === e.id ? 'bg-paper-2' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`truncate text-sm ${
                        e.status === 'new' ? 'font-semibold text-ink' : 'text-ink-70'
                      }`}
                    >
                      {e.name}
                    </span>
                    <StatusPill status={e.status} />
                  </div>
                  <p className="mt-0.5 truncate text-xs text-ink-50">
                    {e.subject || (e.source === 'admissions' ? 'Admissions enquiry' : 'General enquiry')}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-50">{formatDateTime(e.created_at)}</p>
                </button>
              </li>
            ))}
          </ul>

          <div className="rounded-sm border border-line bg-paper p-5">
            {!selected ? (
              <p className="py-12 text-center text-sm text-ink-50">
                Choose an enquiry to read it.
              </p>
            ) : (
              <article>
                <header className="border-b border-line pb-4">
                  <h2 className="text-lg font-semibold text-ink">
                    {selected.subject ||
                      (selected.source === 'admissions' ? 'Admissions enquiry' : 'General enquiry')}
                  </h2>
                  <p className="mt-1 text-sm text-ink-70">
                    From <span className="font-medium text-ink">{selected.name}</span> ·{' '}
                    {formatDateTime(selected.created_at)}
                  </p>

                  <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                    <div className="flex gap-2">
                      <dt className="text-ink-50">Email</dt>
                      <dd className="min-w-0 truncate">
                        <a href={mailtoHref(selected.email)} className="text-brand-700 underline-offset-2 hover:underline">
                          {selected.email}
                        </a>
                      </dd>
                    </div>
                    {selected.phone && (
                      <div className="flex gap-2">
                        <dt className="text-ink-50">Phone</dt>
                        <dd>
                          <a href={telHref(selected.phone)} className="text-brand-700 underline-offset-2 hover:underline">
                            {selected.phone}
                          </a>
                        </dd>
                      </div>
                    )}
                    {selected.learner_name && (
                      <div className="flex gap-2">
                        <dt className="text-ink-50">Learner</dt>
                        <dd className="text-ink-70">{selected.learner_name}</dd>
                      </div>
                    )}
                    {selected.grade_applying && (
                      <div className="flex gap-2">
                        <dt className="text-ink-50">Grade</dt>
                        <dd className="text-ink-70">{selected.grade_applying}</dd>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <dt className="text-ink-50">Form</dt>
                      <dd className="text-ink-70">{selected.source}</dd>
                    </div>
                  </dl>
                </header>

                {/* The message is stored as plain text and is rendered as text, never as HTML. */}
                <p className="mt-4 text-sm whitespace-pre-wrap text-ink-70">{selected.message}</p>

                <div className="mt-6 flex flex-wrap gap-2 border-t border-line pt-4">
                  <Button
                    size="sm"
                    href={`${mailtoHref(selected.email)}?subject=${encodeURIComponent(
                      `Re: ${selected.subject || 'Your enquiry to Baraka School Kapsabet'}`,
                    )}`}
                  >
                    Reply by email
                  </Button>
                  {selected.status !== 'archived' && (
                    <Button variant="secondary" size="sm" onClick={() => setEnquiryStatus(selected, 'archived')}>
                      Archive
                    </Button>
                  )}
                  {selected.status !== 'new' && (
                    <Button variant="ghost" size="sm" onClick={() => setEnquiryStatus(selected, 'new')}>
                      Mark unread
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => setPendingDelete(selected)}>
                    Delete
                  </Button>
                </div>
              </article>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        busy={deleting}
        title="Delete this enquiry?"
        body={`The message from ${pendingDelete?.name || 'this parent'} will be removed permanently. Archiving keeps it out of the way without losing it.`}
      />
    </>
  )
}
