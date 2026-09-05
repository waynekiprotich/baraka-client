import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Icon } from '@/components/ui/Icon'
import { Img } from '@/components/ui/Img'
import { Section } from '@/components/ui/Section'
import { SectionHead } from '@/components/ui/SectionHead'
import { Skeleton } from '@/components/ui/Skeleton'
import { getGalleryImages } from '@/lib/api'
import { useResource } from '@/lib/useResource'
import { photography } from '@/pages/home/copy'

/** How many images the teaser pulls. */
const TEASER_COUNT = 6

/** Aspect ratios cycled across the masonry so the columns stagger rather than align. */
const ASPECTS = ['4 / 5', '3 / 2', '1 / 1', '3 / 4', '4 / 3', '1 / 1']

const SIZES = '(min-width: 768px) 30vw, 45vw'

/**
 * Band 7 — the gallery teaser.
 *
 * Six real images from `GET /gallery`, laid out as a CSS-column masonry so the photographs
 * stagger. The API supplies `alt_text` (NOT NULL in the schema) and the intrinsic
 * width/height, and a 480px `thumb_url`; the thumbnail is offered as the small end of a
 * srcset so a 1600px photograph is never downloaded to fill a third of a column.
 *
 * All four remote states are rendered. If the school has published no images, the band says
 * so honestly rather than falling back to placeholder photography — the whole point of this
 * band is that the pictures are real.
 */
export function PhotographyBand() {
  const { data, error, loading, reload } = useResource(
    ({ signal }) => getGalleryImages({ per_page: TEASER_COUNT }, { signal }),
    [],
  )

  const images = (data && data.items) || []
  const firstLoad = loading && !data

  return (
    <Section tone="tint" space="default">
      <SectionHead
        as="h2"
        eyebrow={photography.eyebrow}
        title={photography.heading}
        action={
          <Button to="/gallery" variant="secondary" iconRight={<Icon name="arrow-right" size={18} />}>
            {photography.action}
          </Button>
        }
      />

      <div className="mt-12" aria-busy={firstLoad || undefined}>
        {firstLoad ? (
          <div className="columns-2 gap-4 md:columns-3">
            {ASPECTS.map((aspect, index) => (
              <Skeleton
                key={index}
                variant="image"
                aspect={aspect}
                className="mb-4 break-inside-avoid"
              />
            ))}
          </div>
        ) : null}

        {!firstLoad && error && !images.length ? (
          <ErrorState error={error} onRetry={reload} title="The gallery did not load" />
        ) : null}

        {!firstLoad && !error && !images.length ? (
          <EmptyState
            icon="image"
            title={photography.emptyTitle}
            description={photography.emptyDescription}
          />
        ) : null}

        {images.length ? (
          <ul className="columns-2 gap-4 md:columns-3">
            {images.map((image, index) => (
              <li key={image.id} className="mb-4 break-inside-avoid">
                <Img
                  src={image.url}
                  srcSet={
                    image.thumb_url
                      ? `${image.thumb_url} 480w, ${image.url} ${image.width || 1600}w`
                      : undefined
                  }
                  sizes={SIZES}
                  alt={image.alt_text}
                  aspect={ASPECTS[index % ASPECTS.length]}
                  className="rounded-xs"
                />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Section>
  )
}

export default PhotographyBand
