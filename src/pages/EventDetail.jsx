import { Link, useParams } from 'react-router-dom'

import { SeoHead } from '@/components/SeoHead'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { ErrorState } from '@/components/ui/ErrorState'
import { Icon } from '@/components/ui/Icon'
import { Img } from '@/components/ui/Img'
import { PageHeader } from '@/components/ui/PageHeader'
import { Prose } from '@/components/ui/Prose'
import { Section } from '@/components/ui/Section'
import { Skeleton } from '@/components/ui/Skeleton'
import { getEvent } from '@/lib/api'
import { formatDateRange, formatTime, isUpcoming, toIsoDate, truncate } from '@/lib/format'
import { breadcrumbJsonLd, eventJsonLd } from '@/lib/seo'
import { useResource } from '@/lib/useResource'

const COPY = {
  notFoundTitle: 'That event is not available',
  notFoundLead:
    'The link may be out of date, or the event may have been withdrawn. Everything currently in the diary is on the news and events page.',
  pastNotice: 'This event has already taken place. It is kept here for the record.',
  askTitle: 'Questions about this event?',
  askBody:
    'The school office can confirm timings, directions and whether visitors need to book ahead.',
  backLabel: 'All news and events',
}

const NEWS_CRUMB = { label: 'News & events', to: '/news' }

/** Breadcrumb JSON-LD for one event — the same trail the visible breadcrumbs show. */
function trailFor(event) {
  return breadcrumbJsonLd([
    { name: 'News & events', path: '/news' },
    { name: event.title, path: `/events/${event.slug}` },
  ])
}

/** A hairline-divided detail row: label above, value below. */
function Detail({ label, children }) {
  return (
    <div className="border-b border-line py-4 first:border-t">
      <dt className="type-meta uppercase tracking-[0.14em]">{label}</dt>
      <dd className="type-body mt-1.5 text-ink">{children}</dd>
    </div>
  )
}

/**
 * A single event.
 *
 * An event that has been and gone still resolves — the page says so at the top rather than
 * pretending it is still ahead, and the diary link points at what is next.
 */
export default function EventDetail() {
  const { slug } = useParams()
  const { data, error, loading, reload } = useResource(
    ({ signal }) => getEvent(slug, { signal }),
    [slug],
  )

  /* First load. */
  if (loading && !data) {
    return (
      <Container width="prose" className="pt-32 pb-20 md:pt-40">
        <Skeleton variant="text" lines={2} className="max-w-md" />
        <div className="mt-8">
          <Skeleton variant="text" lines={7} />
        </div>
      </Container>
    )
  }

  /* A 404 is a real state, not a failure. */
  if ((error && error.isNotFound) || (!loading && !data && !error)) {
    return (
      <>
        <SeoHead title="Event not found" path={`/events/${slug}`} noindex />

        <PageHeader
          eyebrow="Events"
          title={COPY.notFoundTitle}
          lead={COPY.notFoundLead}
          breadcrumbs={[NEWS_CRUMB, { label: 'Not found' }]}
        >
          <div className="flex flex-wrap gap-3">
            <Button to="/news">See what is coming up</Button>
            <Button to="/contact" variant="secondary">
              Contact the school
            </Button>
          </div>
        </PageHeader>
      </>
    )
  }

  if (error && !data) {
    return (
      <>
        <SeoHead title="Event" path={`/events/${slug}`} noindex />

        <PageHeader
          eyebrow="Events"
          title="We could not load that event"
          breadcrumbs={[NEWS_CRUMB]}
        />

        <Section space="tight">
          <ErrorState error={error} onRetry={reload} />
        </Section>
      </>
    )
  }

  const past = !isUpcoming(data.ends_at || data.starts_at)
  const startTime = formatTime(data.starts_at)

  return (
    <>
      <SeoHead
        title={truncate(data.title, 34)}
        description={data.summary || data.description}
        path={`/events/${data.slug}`}
        image={data.cover_image_url || undefined}
        type="article"
        jsonLd={[eventJsonLd(data), trailFor(data)]}
      />

      <PageHeader
        eyebrow={past ? 'Past event' : 'Upcoming event'}
        title={data.title}
        lead={data.summary || undefined}
        breadcrumbs={[NEWS_CRUMB, { label: truncate(data.title, 48) }]}
      >
        <p className="type-body flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line pt-5 text-ink">
          <Icon name="calendar" size={18} className="text-ink-50" />
          <time dateTime={toIsoDate(data.starts_at)}>
            {formatDateRange(data.starts_at, data.ends_at)}
          </time>
        </p>
      </PageHeader>

      {past ? (
        <Container className="pb-6">
          <p className="type-small flex items-start gap-3 border border-line bg-paper-2 px-5 py-4 text-ink-70">
            <Icon name="info" size={20} className="mt-0.5 shrink-0" />
            <span>{COPY.pastNotice}</span>
          </p>
        </Container>
      ) : null}

      {data.cover_image_url ? (
        <Container className="pb-4">
          <Img
            src={data.cover_image_url}
            alt=""
            aspect="16 / 9"
            sizes="(min-width: 1200px) 1200px, 100vw"
            priority
          />
        </Container>
      ) : null}

      {/* Editorial split: the practical detail on the left, the description on the right. */}
      <Section space="tight">
        <div className="grid gap-10 md:grid-cols-12 md:gap-14">
          <div className="md:col-span-4">
            <h2 className="type-h3">The detail</h2>

            <dl className="mt-5">
              <Detail label="When">
                <time dateTime={toIsoDate(data.starts_at)}>
                  {formatDateRange(data.starts_at, data.ends_at)}
                </time>
                {!data.ends_at && startTime ? (
                  <span className="type-meta mt-1 block">Starts at {startTime}</span>
                ) : null}
              </Detail>

              {data.location ? <Detail label="Where">{data.location}</Detail> : null}
            </dl>

            <div className="mt-10">
              <h3 className="type-h4">{COPY.askTitle}</h3>
              <p className="type-small mt-2 text-ink-70">{COPY.askBody}</p>
              <Button to="/contact" variant="secondary" size="sm" className="mt-4">
                Ask about this event
              </Button>
            </div>
          </div>

          <div className="md:col-span-8">
            {data.description ? (
              <Prose text={data.description} />
            ) : (
              <p className="type-body text-ink-70">
                Further detail about this event has not been published yet. The school office can
                tell you more.
              </p>
            )}

            <div className="mt-12 border-t border-line pt-8">
              <Link
                to="/news"
                className="tap-target inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand"
              >
                <Icon name="arrow-left" size={18} />
                <span className="link-underline">{COPY.backLabel}</span>
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}
