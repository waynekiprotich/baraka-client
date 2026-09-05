import { Link } from 'react-router-dom'

import { adminGet } from '@/admin/lib/adminApi'
import { StatusPill } from '@/admin/components/StatusPill'
import { SeoHead } from '@/components/SeoHead'
import { Icon } from '@/components/ui/Icon'
import { Spinner } from '@/components/ui/Spinner'
import { formatDate } from '@/lib/format'
import { useResource } from '@/lib/useResource'

import { PageTitle } from './PageTitle'

/** A figure in a lined band — small and factual, not a giant tile. */
function Figure({ value, label, to }) {
  const body = (
    <>
      <span className="block text-2xl font-semibold text-ink tabular-nums">{value}</span>
      <span className="mt-0.5 block text-xs text-ink-70">{label}</span>
    </>
  )
  return (
    <div className="px-4 py-3 sm:px-5">
      {to ? (
        <Link to={to} className="block rounded-xs hover:opacity-70">
          {body}
        </Link>
      ) : (
        body
      )}
    </div>
  )
}

export default function Dashboard() {
  const { data, error, loading, reload } = useResource(
    ({ signal }) => adminGet('/admin/stats', { signal }),
    [],
  )

  return (
    <>
      <SeoHead title="Dashboard" noindex />
      <PageTitle
        title="Dashboard"
        lead="What is currently published, and who is waiting for a reply."
      />

      {error && (
        <div className="rounded-sm border border-danger/30 bg-danger/5 p-4 text-sm">
          <p className="font-medium text-danger">Could not load the dashboard.</p>
          <button type="button" onClick={reload} className="mt-2 underline">
            Try again
          </button>
        </div>
      )}

      {loading && !data && (
        <div className="flex justify-center py-16">
          <Spinner label="Loading" />
        </div>
      )}

      {data && (
        <div className="space-y-6">
          <section aria-labelledby="figures-heading">
            <h2 id="figures-heading" className="sr-only">
              At a glance
            </h2>
            <div className="grid grid-cols-2 divide-line rounded-sm border border-line bg-paper sm:grid-cols-4 sm:divide-x">
              <Figure value={data.news.published} label="News published" to="/admin/news" />
              <Figure value={data.events.upcoming} label="Events upcoming" to="/admin/events" />
              <Figure value={data.gallery.images} label="Gallery photos" to="/admin/gallery" />
              <Figure value={data.enquiries.new} label="Unread enquiries" to="/admin/enquiries" />
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section aria-labelledby="drafts-heading" className="rounded-sm border border-line bg-paper">
              <h2 id="drafts-heading" className="border-b border-line px-5 py-3 text-sm font-semibold text-ink">
                Not yet visible to parents
              </h2>
              <ul className="divide-y divide-line text-sm">
                <li className="flex items-center justify-between gap-3 px-5 py-3">
                  <span className="text-ink-70">News drafts</span>
                  <span className="flex items-center gap-2">
                    <span className="font-medium tabular-nums">{data.news.draft}</span>
                    <Link to="/admin/news" className="text-brand-700 underline-offset-2 hover:underline">
                      Review
                    </Link>
                  </span>
                </li>
                <li className="flex items-center justify-between gap-3 px-5 py-3">
                  <span className="text-ink-70">Event drafts</span>
                  <span className="flex items-center gap-2">
                    <span className="font-medium tabular-nums">{data.events.draft}</span>
                    <Link to="/admin/events" className="text-brand-700 underline-offset-2 hover:underline">
                      Review
                    </Link>
                  </span>
                </li>
                <li className="flex items-center justify-between gap-3 px-5 py-3">
                  <span className="text-ink-70">Gallery categories</span>
                  <span className="flex items-center gap-2">
                    <span className="font-medium tabular-nums">{data.gallery.categories}</span>
                    <Link
                      to="/admin/gallery/categories"
                      className="text-brand-700 underline-offset-2 hover:underline"
                    >
                      Manage
                    </Link>
                  </span>
                </li>
              </ul>
            </section>

            <section aria-labelledby="recent-heading" className="rounded-sm border border-line bg-paper">
              <h2
                id="recent-heading"
                className="flex items-center justify-between border-b border-line px-5 py-3 text-sm font-semibold text-ink"
              >
                Latest enquiries
                <Link to="/admin/enquiries" className="text-xs font-normal text-brand-700 underline-offset-2 hover:underline">
                  Open inbox
                </Link>
              </h2>
              {data.recent_enquiries.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-ink-50">No enquiries yet.</p>
              ) : (
                <ul className="divide-y divide-line">
                  {data.recent_enquiries.slice(0, 5).map((e) => (
                    <li key={e.id} className="px-5 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-ink">{e.name}</p>
                          <p className="truncate text-xs text-ink-50">
                            {e.subject || e.source} · {formatDate(e.created_at)}
                          </p>
                        </div>
                        <StatusPill status={e.status} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <p className="flex items-start gap-2 rounded-sm border border-line bg-paper-2 px-4 py-3 text-xs text-ink-70">
            <Icon name="info" size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>
              Contact details, opening hours and the homepage headline all live in{' '}
              <Link to="/admin/settings" className="underline">
                Settings
              </Link>
              . Anything left blank there is hidden on the public site rather than shown empty.
            </span>
          </p>
        </div>
      )}
    </>
  )
}
