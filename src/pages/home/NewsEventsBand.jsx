import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Icon } from '@/components/ui/Icon'
import { Section } from '@/components/ui/Section'
import { SectionHead } from '@/components/ui/SectionHead'
import { Skeleton } from '@/components/ui/Skeleton'
import { getEvents, getNews } from '@/lib/api'
import { formatDate, formatDateRange, formatDayMonth, toIsoDate } from '@/lib/format'
import { useResource } from '@/lib/useResource'
import { newsroom } from '@/pages/home/copy'

const ARTICLE_COUNT = 3
const EVENT_COUNT = 2

/**
 * Split "16 Sep" into its two halves for the date rail.
 * @param {string} value an ISO timestamp
 * @returns {{ day: string, month: string }|null}
 */
function dateParts(value) {
  const label = formatDayMonth(value)
  if (!label) return null
  const [day, ...rest] = label.split(' ')
  return { day, month: rest.join(' ') }
}

/**
 * Band 8 — the noticeboard.
 *
 * Two lists side by side: the three most recent articles on the left, the next two events on
 * the right behind a hairline rule. Neither is a card grid — both are lists divided by 1px
 * rules, with the events carrying a date rail.
 *
 * The two requests are issued in PARALLEL: each `useResource` starts its own fetch on mount,
 * so the events call never waits on the news call. Both render their own loading, error,
 * empty and content states independently — one failing does not blank the other.
 */
export function NewsEventsBand() {
  const news = useResource(
    ({ signal }) => getNews({ per_page: ARTICLE_COUNT }, { signal }),
    [],
  )
  const events = useResource(
    ({ signal }) => getEvents({ upcoming: true, per_page: EVENT_COUNT }, { signal }),
    [],
  )

  const articles = (news.data && news.data.items) || []
  const upcoming = (events.data && events.data.items) || []
  const newsFirstLoad = news.loading && !news.data
  const eventsFirstLoad = events.loading && !events.data

  return (
    <Section tone="paper" space="default">
      <SectionHead
        as="h2"
        eyebrow={newsroom.eyebrow}
        title={newsroom.heading}
        action={
          <Button to="/news" variant="secondary" iconRight={<Icon name="arrow-right" size={18} />}>
            {newsroom.action}
          </Button>
        }
      />

      <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-14">
        {/* ------------------------------------------------------------ news */}
        <div className="lg:col-span-7">
          <h3 className="text-xs font-semibold tracking-[0.14em] text-ink-50 uppercase">{newsroom.newsHeading}</h3>

          <div className="mt-6" aria-busy={newsFirstLoad || undefined}>
            {newsFirstLoad ? (
              <ul>
                {Array.from({ length: ARTICLE_COUNT }, (_, index) => (
                  <li key={index} className="border-t border-line py-6 first:border-t-0 first:pt-0">
                    <Skeleton variant="text" lines={3} />
                  </li>
                ))}
              </ul>
            ) : null}

            {!newsFirstLoad && news.error && !articles.length ? (
              <ErrorState
                error={news.error}
                onRetry={news.reload}
                title="The news did not load"
              />
            ) : null}

            {!newsFirstLoad && !news.error && !articles.length ? (
              <EmptyState
                icon="info"
                title={newsroom.newsEmptyTitle}
                description={newsroom.newsEmptyDescription}
              />
            ) : null}

            {articles.length ? (
              <ul>
                {articles.map((article) => (
                  <li
                    key={article.id}
                    className="border-t border-line py-6 first:border-t-0 first:pt-0"
                  >
                    <p className="type-meta flex flex-wrap items-center gap-x-3 gap-y-1">
                      {article.published_at ? (
                        <time dateTime={toIsoDate(article.published_at)}>
                          {formatDate(article.published_at)}
                        </time>
                      ) : null}
                      {article.category ? (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{article.category}</span>
                        </>
                      ) : null}
                    </p>

                    <h4 className="type-h3 mt-2">
                      <Link
                        to={`/news/${article.slug}`}
                        className="link-underline inline-block py-1"
                      >
                        {article.title}
                      </Link>
                    </h4>

                    {article.excerpt ? (
                      <p className="type-small mt-2 max-w-2xl text-ink-70">{article.excerpt}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        {/* ---------------------------------------------------------- events */}
        <div className="lg:col-span-5 lg:border-l lg:border-line lg:pl-14">
          <h3 className="text-xs font-semibold tracking-[0.14em] text-ink-50 uppercase">{newsroom.eventsHeading}</h3>

          <div className="mt-6" aria-busy={eventsFirstLoad || undefined}>
            {eventsFirstLoad ? (
              <ul>
                {Array.from({ length: EVENT_COUNT }, (_, index) => (
                  <li key={index} className="border-t border-line py-6 first:border-t-0 first:pt-0">
                    <Skeleton variant="text" lines={2} />
                  </li>
                ))}
              </ul>
            ) : null}

            {!eventsFirstLoad && events.error && !upcoming.length ? (
              <ErrorState
                error={events.error}
                onRetry={events.reload}
                title="The diary did not load"
              />
            ) : null}

            {!eventsFirstLoad && !events.error && !upcoming.length ? (
              <EmptyState
                icon="calendar"
                title={newsroom.eventsEmptyTitle}
                description={newsroom.eventsEmptyDescription}
              />
            ) : null}

            {upcoming.length ? (
              <ul>
                {upcoming.map((event) => {
                  const parts = dateParts(event.starts_at)
                  return (
                    <li
                      key={event.id}
                      className="flex gap-5 border-t border-line py-6 first:border-t-0 first:pt-0"
                    >
                      {parts ? (
                        <time
                          dateTime={toIsoDate(event.starts_at)}
                          className="w-14 shrink-0 border-r border-line pr-4 text-center"
                        >
                          <span className="block font-display text-3xl leading-none tracking-[-0.02em]">
                            {parts.day}
                          </span>
                          <span className="mt-1.5 block text-xs tracking-[0.12em] text-ink-50 uppercase">
                            {parts.month}
                          </span>
                        </time>
                      ) : null}

                      <div className="min-w-0">
                        <h4 className="type-h4">
                          <Link
                            to={`/events/${event.slug}`}
                            className="link-underline inline-block py-1"
                          >
                            {event.title}
                          </Link>
                        </h4>

                        <p className="type-meta mt-1">
                          {formatDateRange(event.starts_at, event.ends_at)}
                        </p>

                        {event.location ? (
                          <p className="type-meta mt-1 flex items-start gap-1.5">
                            <Icon name="pin" size={14} className="mt-0.5 shrink-0" />
                            <span>{event.location}</span>
                          </p>
                        ) : null}

                        {event.summary ? (
                          <p className="type-small mt-2 text-ink-70">{event.summary}</p>
                        ) : null}
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : null}
          </div>
        </div>
      </div>
    </Section>
  )
}

export default NewsEventsBand
