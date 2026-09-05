import { useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { SeoHead } from '@/components/SeoHead'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Field } from '@/components/ui/Field'
import { Icon } from '@/components/ui/Icon'
import { Img } from '@/components/ui/Img'
import { PageHeader } from '@/components/ui/PageHeader'
import { Pagination } from '@/components/ui/Pagination'
import { Section } from '@/components/ui/Section'
import { SectionHead } from '@/components/ui/SectionHead'
import { Skeleton } from '@/components/ui/Skeleton'
import { Tag } from '@/components/ui/Tag'
import { getEvents, getNews, getNewsCategories } from '@/lib/api'
import { formatDate, formatDateRange, formatDayMonth, toIsoDate } from '@/lib/format'
import { breadcrumbJsonLd } from '@/lib/seo'
import { useDebouncedValue, useResource } from '@/lib/useResource'

/* Page copy. Nothing here is a claim about the school — the facts all come from the API. */
const COPY = {
  eyebrow: 'News & events',
  title: 'What is happening at Baraka',
  lead: 'Term announcements, results, occasions and the dates worth putting in the diary.',
  metaDescription:
    'Announcements, term news and upcoming events at Baraka School Kapsabet, a CBC day school in Nandi County.',
  newsEyebrow: 'From the school',
  newsTitle: 'Latest news',
  eventsEyebrow: 'Diary',
  eventsTitle: 'Upcoming events',
  eventsLead: 'Open days, term dates and occasions parents are welcome to attend.',
}

const PER_PAGE = 9
const EVENTS_SHOWN = 6

const BREADCRUMBS = [{ label: 'News & events', to: '/news' }]
const BREADCRUMB_TRAIL = [{ name: 'News & events', path: '/news' }]

/** Chips need to clear the 44px tap-target floor (SPEC §9). */
const CHIP = 'min-h-11'

/** "3 articles" / "1 article" — used in the live region above the list. */
function countLabel(total, filtered) {
  const noun = total === 1 ? 'article' : 'articles'
  return filtered ? `${total} matching ${noun}` : `${total} ${noun}`
}

/**
 * The lead story: the most recent article, set larger than the rest. An editorial split when
 * the CMS has a cover image, an asymmetric two-column intro when it does not — a story with
 * no photograph is never given a borrowed one.
 */
function LeadArticle({ article }) {
  const hasCover = Boolean(article.cover_image_url)

  const text = (
    <div className={hasCover ? 'md:col-span-6' : 'md:col-span-7'}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {article.category ? <Tag tone="gold">{article.category}</Tag> : null}
        {article.published_at ? (
          <time className="type-meta" dateTime={toIsoDate(article.published_at)}>
            {formatDate(article.published_at)}
          </time>
        ) : null}
      </div>

      <h3 className="type-h2 mt-4">
        <Link to={`/news/${article.slug}`} className="link-underline">
          {article.title}
        </Link>
      </h3>
    </div>
  )

  const aside = (
    <div className={hasCover ? 'md:col-span-6' : 'md:col-span-5 md:pt-2'}>
      {hasCover ? (
        <Img
          src={article.cover_image_url}
          alt={article.cover_image_alt || ''}
          aspect="3 / 2"
          sizes="(min-width: 768px) 50vw, 100vw"
        />
      ) : null}

      {article.excerpt ? (
        <p className={hasCover ? 'type-lead mt-6' : 'type-lead'}>{article.excerpt}</p>
      ) : null}

      <p className="mt-6">
        <Link
          to={`/news/${article.slug}`}
          className="tap-target inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand"
        >
          <span className="link-underline">Read the full story</span>
          <Icon name="arrow-right" size={18} />
          <span className="sr-only">: {article.title}</span>
        </Link>
      </p>

      {article.author ? <p className="type-meta mt-4">By {article.author}</p> : null}
    </div>
  )

  return (
    <article className="border-t-2 border-gold pt-8">
      <div className="grid gap-8 md:grid-cols-12 md:gap-12">
        {text}
        {aside}
      </div>
    </article>
  )
}

/** Every article after the lead: a hairline-divided list, meta in its own narrow column. */
function ArticleRow({ article }) {
  return (
    <li className="border-b border-line">
      <article className="grid gap-2 py-7 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-3">
          {article.published_at ? (
            <time className="type-meta" dateTime={toIsoDate(article.published_at)}>
              {formatDate(article.published_at)}
            </time>
          ) : null}
          {article.category ? (
            <p className="type-meta mt-1 text-gold">{article.category}</p>
          ) : null}
        </div>

        <div className="md:col-span-9">
          <h3 className="type-h3">
            <Link to={`/news/${article.slug}`} className="link-underline">
              {article.title}
            </Link>
          </h3>
          {article.excerpt ? (
            <p className="type-body mt-2 max-w-2xl text-ink-70">{article.excerpt}</p>
          ) : null}
        </div>
      </article>
    </li>
  )
}

/** One upcoming event: a date block, the title, the full range and where it happens. */
function EventRow({ event }) {
  return (
    <li className="border-b border-line">
      <article className="flex items-start gap-5 py-7">
        <p className="w-20 shrink-0 border border-line bg-paper px-2 py-3 text-center">
          <span className="type-h4 block">{formatDayMonth(event.starts_at)}</span>
        </p>

        <div className="min-w-0">
          <h3 className="type-h3">
            <Link to={`/events/${event.slug}`} className="link-underline">
              {event.title}
            </Link>
          </h3>

          <p className="type-meta mt-2">
            <time dateTime={toIsoDate(event.starts_at)}>
              {formatDateRange(event.starts_at, event.ends_at)}
            </time>
          </p>

          {event.location ? (
            <p className="type-meta mt-1 flex items-start gap-1.5">
              <Icon name="pin" size={16} className="mt-0.5" />
              <span>{event.location}</span>
            </p>
          ) : null}

          {event.summary ? (
            <p className="type-small mt-3 max-w-2xl text-ink-70">{event.summary}</p>
          ) : null}
        </div>
      </article>
    </li>
  )
}

/**
 * News & events index.
 *
 * Articles and events are fetched in parallel — three independent resources, none waiting on
 * another. Search is debounced to 300ms so a keystroke is not a request (SPEC §7).
 */
export default function News() {
  // `?category=` lets an article link back into a filtered index. It seeds the filter; from
  // then on the controls own it, so typing never rewrites the history stack.
  const [searchParams] = useSearchParams()

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState(() => searchParams.get('category') || '')
  const [page, setPage] = useState(1)

  const search = useDebouncedValue(query, 300)
  const listRef = useRef(null)

  // A new search or category is a new result set, so the page resets as the control changes
  // rather than in an effect afterwards — otherwise the old page number fires one request
  // that is immediately aborted.
  const onQueryChange = (value) => {
    setQuery(value)
    setPage(1)
  }

  const onCategoryChange = (value) => {
    setCategory(value)
    setPage(1)
  }

  const news = useResource(
    ({ signal }) =>
      getNews({ page, per_page: PER_PAGE, q: search || undefined, category: category || undefined }, { signal }),
    [page, search, category],
  )

  const categories = useResource(({ signal }) => getNewsCategories({ signal }), [])

  const events = useResource(
    ({ signal }) => getEvents({ upcoming: true, per_page: EVENTS_SHOWN }, { signal }),
    [],
  )

  const articles = (news.data && news.data.items) || []
  const total = (news.data && news.data.total) || 0
  const pages = (news.data && news.data.pages) || 0
  const categoryNames = (categories.data && categories.data.items) || []
  const upcoming = (events.data && events.data.items) || []

  const filtered = Boolean(search || category)
  const showLead = page === 1 && articles.length > 0

  const clearFilters = () => {
    setQuery('')
    setCategory('')
    setPage(1)
  }

  const goToPage = (next) => {
    setPage(next)
    if (listRef.current) listRef.current.scrollIntoView({ block: 'start' })
  }

  return (
    <>
      <SeoHead
        title="News & events"
        description={COPY.metaDescription}
        path="/news"
        jsonLd={breadcrumbJsonLd(BREADCRUMB_TRAIL)}
      />

      <PageHeader
        eyebrow={COPY.eyebrow}
        title={COPY.title}
        lead={COPY.lead}
        breadcrumbs={BREADCRUMBS}
      />

      <Section space="default" bordered>
        <SectionHead eyebrow={COPY.newsEyebrow} title={COPY.newsTitle} />

        {/* Filters. The category list is built from the API, never hard-coded (SPEC §3). */}
        <form
          role="search"
          aria-label="Search news"
          onSubmit={(event) => event.preventDefault()}
          className="mt-10 grid gap-6 border-y border-line py-6 lg:grid-cols-12 lg:items-start lg:gap-10"
        >
          <div className="lg:col-span-4">
            <Field
              label="Search news"
              name="q"
              type="search"
              inputMode="search"
              autoComplete="off"
              placeholder="Search by word or phrase"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
            />
          </div>

          <div className="lg:col-span-8">
            <p className="text-sm font-medium text-ink" id="category-filter-label">
              Filter by category
            </p>

            {categories.loading && !categories.data ? (
              <div className="mt-2 flex flex-wrap gap-2" aria-hidden="true">
                <div className="h-11 w-24">
                  <Skeleton />
                </div>
                <div className="h-11 w-20">
                  <Skeleton />
                </div>
                <div className="h-11 w-28">
                  <Skeleton />
                </div>
              </div>
            ) : categories.error ? (
              <p className="type-meta mt-2 flex flex-wrap items-center gap-3">
                <span>Categories could not be loaded.</span>
                <Button variant="ghost" size="sm" onClick={categories.reload}>
                  Try again
                </Button>
              </p>
            ) : categoryNames.length === 0 ? (
              <p className="type-meta mt-2">
                Categories appear here once the school files articles under one.
              </p>
            ) : (
              <div
                role="group"
                aria-labelledby="category-filter-label"
                className="mt-2 flex flex-wrap gap-2"
              >
                <Tag
                  onClick={() => onCategoryChange('')}
                  selected={category === ''}
                  className={CHIP}
                >
                  All
                </Tag>
                {categoryNames.map((name) => (
                  <Tag
                    key={name}
                    onClick={() => onCategoryChange(name)}
                    selected={category === name}
                    className={CHIP}
                  >
                    {name}
                  </Tag>
                ))}
              </div>
            )}
          </div>
        </form>

        <div ref={listRef} className="scroll-mt-28">
          <p role="status" className="type-meta mt-6 min-h-6">
            {news.data && !news.loading ? countLabel(total, filtered) : ''}
          </p>

          <div className="mt-6" aria-busy={news.loading && !news.data ? true : undefined}>
            {news.loading && !news.data ? (
              <div className="flex flex-col gap-8">
                <Skeleton variant="text" lines={3} />
                <Skeleton variant="text" lines={4} />
                <Skeleton variant="text" lines={4} />
              </div>
            ) : news.error && !news.data ? (
              <ErrorState error={news.error} onRetry={news.reload} />
            ) : articles.length === 0 ? (
              <EmptyState
                title={filtered ? 'Nothing matched that' : 'No news published yet'}
                description={
                  filtered
                    ? 'Try a different word, or clear the filters to see everything the school has published.'
                    : 'When the school posts an announcement it will appear here.'
                }
                action={
                  filtered ? (
                    <Button variant="secondary" size="sm" onClick={clearFilters}>
                      Clear filters
                    </Button>
                  ) : null
                }
              />
            ) : (
              <div className={news.loading ? 'opacity-60 transition-opacity duration-150' : undefined}>
                {news.error ? (
                  <ErrorState
                    error={news.error}
                    onRetry={news.reload}
                    title="That update did not load"
                    className="mb-8"
                  />
                ) : null}

                {showLead ? <LeadArticle article={articles[0]} /> : null}

                {(showLead ? articles.slice(1) : articles).length > 0 ? (
                  <ul className={showLead ? 'mt-12 border-t border-line' : 'border-t border-line'}>
                    {(showLead ? articles.slice(1) : articles).map((article) => (
                      <ArticleRow key={article.slug} article={article} />
                    ))}
                  </ul>
                ) : null}

                <Pagination
                  page={page}
                  pages={pages}
                  onChange={goToPage}
                  label="News pages"
                  className="mt-10"
                />
              </div>
            )}
          </div>
        </div>
      </Section>

      <Section tone="tint" space="default">
        <SectionHead
          eyebrow={COPY.eventsEyebrow}
          title={COPY.eventsTitle}
          lead={COPY.eventsLead}
        />

        <div className="mt-10" aria-busy={events.loading && !events.data ? true : undefined}>
          {events.loading && !events.data ? (
            <div className="flex flex-col gap-8">
              <Skeleton variant="text" lines={2} />
              <Skeleton variant="text" lines={2} />
            </div>
          ) : events.error && !events.data ? (
            <ErrorState error={events.error} onRetry={events.reload} />
          ) : upcoming.length === 0 ? (
            <EmptyState
              icon="calendar"
              title="No upcoming events"
              description="Nothing is scheduled at the moment. Dates are published here as soon as the school sets them."
              action={
                <Button to="/contact" variant="secondary" size="sm">
                  Ask the school
                </Button>
              }
            />
          ) : (
            <ul className="border-t border-line">
              {upcoming.map((event) => (
                <EventRow key={event.slug} event={event} />
              ))}
            </ul>
          )}
        </div>
      </Section>
    </>
  )
}
