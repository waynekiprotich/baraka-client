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
import { Tag } from '@/components/ui/Tag'
import { getNewsArticle } from '@/lib/api'
import { formatDate, readingMinutes, toIsoDate, truncate } from '@/lib/format'
import { breadcrumbJsonLd, newsArticleJsonLd } from '@/lib/seo'
import { useResource } from '@/lib/useResource'

const COPY = {
  notFoundTitle: 'That article is not available',
  notFoundLead:
    'The link may be out of date, or the article may have been taken down. Everything the school has published is on the news page.',
  backLabel: 'All news and events',
}

const NEWS_CRUMB = { label: 'News & events', to: '/news' }

/** Breadcrumb JSON-LD for one article — the same trail the visible breadcrumbs show. */
function trailFor(article) {
  return breadcrumbJsonLd([
    { name: 'News & events', path: '/news' },
    { name: article.title, path: `/news/${article.slug}` },
  ])
}

/**
 * A single news article.
 *
 * The body is plain text from the CMS with blank-line paragraph breaks; it goes through
 * `<Prose text>`, which never treats it as markup (SPEC §5).
 */
export default function NewsArticle() {
  const { slug } = useParams()
  const { data, error, loading, reload } = useResource(
    ({ signal }) => getNewsArticle(slug, { signal }),
    [slug],
  )

  /* First load. */
  if (loading && !data) {
    return (
      <Container width="prose" className="pt-32 pb-20 md:pt-40">
        <Skeleton variant="text" lines={2} className="max-w-md" />
        <div className="mt-8">
          <Skeleton variant="text" lines={8} />
        </div>
      </Container>
    )
  }

  /* A 404 is a real state, not a failure — say so plainly and offer the way back. */
  if ((error && error.isNotFound) || (!loading && !data && !error)) {
    return (
      <>
        <SeoHead title="Article not found" path={`/news/${slug}`} noindex />

        <PageHeader
          eyebrow="News & events"
          title={COPY.notFoundTitle}
          lead={COPY.notFoundLead}
          breadcrumbs={[NEWS_CRUMB, { label: 'Not found' }]}
        >
          <div className="flex flex-wrap gap-3">
            <Button to="/news">Read the latest news</Button>
            <Button to="/contact" variant="secondary">
              Contact the school
            </Button>
          </div>
        </PageHeader>
      </>
    )
  }

  /* Anything else that went wrong: keep the chrome, offer a retry. */
  if (error && !data) {
    return (
      <>
        <SeoHead title="News" path={`/news/${slug}`} noindex />

        <PageHeader
          eyebrow="News & events"
          title="We could not load that article"
          breadcrumbs={[NEWS_CRUMB]}
        />

        <Section space="tight">
          <ErrorState error={error} onRetry={reload} />
        </Section>
      </>
    )
  }

  const published = data.published_at
  const minutes = data.body ? readingMinutes(data.body) : 0

  return (
    <>
      <SeoHead
        title={truncate(data.title, 34)}
        description={data.excerpt || data.body}
        path={`/news/${data.slug}`}
        image={data.cover_image_url || undefined}
        type="article"
        jsonLd={[newsArticleJsonLd(data), trailFor(data)]}
      />

      <PageHeader
        eyebrow={data.category || 'News'}
        title={data.title}
        lead={data.excerpt || undefined}
        breadcrumbs={[NEWS_CRUMB, { label: truncate(data.title, 48) }]}
      >
        {/* Byline: a hairline-ruled band rather than a floating meta line. */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-5">
          {published ? (
            <time className="type-meta" dateTime={toIsoDate(published)}>
              {formatDate(published)}
            </time>
          ) : null}

          {data.author ? (
            <p className="type-meta">
              <span className="sr-only">Written by </span>
              {data.author}
            </p>
          ) : null}

          {minutes ? (
            <p className="type-meta flex items-center gap-1.5">
              <Icon name="clock" size={16} />
              <span>{minutes} min read</span>
            </p>
          ) : null}

          {data.category ? (
            <Tag tone="gold" to={`/news?category=${encodeURIComponent(data.category)}`}>
              {data.category}
            </Tag>
          ) : null}
        </div>
      </PageHeader>

      {data.cover_image_url ? (
        <Container className="pb-4">
          <Img
            src={data.cover_image_url}
            alt={data.cover_image_alt || ''}
            aspect="16 / 9"
            sizes="(min-width: 1200px) 1200px, 100vw"
            priority
          />
        </Container>
      ) : null}

      <Section space="tight" container="prose">
        {data.body ? (
          <Prose text={data.body} />
        ) : (
          <p className="type-body text-ink-70">
            The full text of this announcement has not been published yet.
          </p>
        )}

        <div className="mt-14 border-t border-line pt-8">
          <Link
            to="/news"
            className="tap-target inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand"
          >
            <Icon name="arrow-left" size={18} />
            <span className="link-underline">{COPY.backLabel}</span>
          </Link>
        </div>
      </Section>
    </>
  )
}
