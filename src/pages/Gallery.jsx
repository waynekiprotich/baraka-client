import { useCallback, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { SeoHead } from '@/components/SeoHead'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Img } from '@/components/ui/Img'
import { Lightbox } from '@/components/ui/Lightbox'
import { PageHeader } from '@/components/ui/PageHeader'
import { Pagination } from '@/components/ui/Pagination'
import { Section } from '@/components/ui/Section'
import { Skeleton } from '@/components/ui/Skeleton'
import { Tag } from '@/components/ui/Tag'
import { cn } from '@/lib/cn'
import { getGalleryCategories, getGalleryImages } from '@/lib/api'
import { breadcrumbJsonLd, imageGalleryJsonLd } from '@/lib/seo'
import { useSettings } from '@/lib/settings'
import { useResource } from '@/lib/useResource'

/** Copy owned by this page. Nothing factual is asserted here. */
const COPY = {
  eyebrow: 'Gallery',
  title: 'The school, photographed',
  lead: 'Classrooms, sports days, the arts and the everyday — as the school actually looks. Every photograph here is published by the school through its own admin.',
  filterLabel: 'Filter photographs by album',
  allAlbums: 'All photographs',
  tourHeading: 'Video and virtual tour',
  tourPending:
    'The school has not published a video tour or a 360° walkthrough yet. When it does, both will appear on this page. Until then, the closest thing to a tour is a visit — the admissions office is happy to arrange one.',
}

/** How many photographs a single page of the grid holds. */
const PER_PAGE = 12

const BREADCRUMBS = [{ label: 'Gallery', to: '/gallery' }]

/** Tile sizes, so a 1600px photograph is never downloaded to fill a quarter-column box. */
const TILE_SIZES = '(min-width: 1024px) 23vw, (min-width: 640px) 31vw, 46vw'

/**
 * One photograph in the grid — a real `<button>` so it is keyboard operable, with the
 * API's `alt_text` supplying both the image's alt and the button's accessible name.
 *
 * @param {object} props
 * @param {{ id: number, title: string|null, alt_text: string, url: string,
 *           thumb_url: string|null, width: number|null, height: number|null,
 *           category: {name: string}|null }} props.image
 * @param {() => void} props.onOpen
 */
function GalleryTile({ image, onOpen }) {
  const thumb = image.thumb_url || image.url
  const srcSet = image.thumb_url ? `${image.thumb_url} 480w, ${image.url} 1600w` : undefined

  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        aria-haspopup="dialog"
        className="group block w-full text-left"
      >
        <span className="block overflow-hidden bg-paper-2">
          <Img
            src={thumb}
            srcSet={srcSet}
            sizes={TILE_SIZES}
            alt={image.alt_text}
            width={image.width || undefined}
            height={image.height || undefined}
            aspect="4 / 3"
            className="transition-opacity duration-150 ease-editorial group-hover:opacity-90"
          />
        </span>
        {image.title ? (
          <span className="type-meta mt-2 block text-ink-70 group-hover:text-ink">
            {image.title}
          </span>
        ) : null}
      </button>
    </li>
  )
}

/**
 * Gallery — the school's photographs, served a page at a time from the CMS.
 *
 * The album filter is built from `GET /gallery/categories`, never a hard-coded list, and
 * both the album and the page number live in the query string so a filtered view can be
 * linked and the back button works. `useResource` keeps the previous page on screen while
 * the next one loads, so the grid dims rather than blanking.
 */
export default function Gallery() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [lightboxIndex, setLightboxIndex] = useState(-1)
  const gridRef = useRef(null)
  const { get: setting } = useSettings()

  const album = searchParams.get('album') || ''
  const rawPage = Number(searchParams.get('page'))
  const page = Number.isFinite(rawPage) && rawPage > 1 ? Math.floor(rawPage) : 1

  const categoriesResource = useResource(({ signal }) => getGalleryCategories({ signal }), [])
  const categories = categoriesResource.data ? categoriesResource.data.items || [] : []

  const imagesResource = useResource(
    ({ signal }) =>
      getGalleryImages({ category: album || undefined, page, per_page: PER_PAGE }, { signal }),
    [album, page],
  )

  const payload = imagesResource.data
  const images = useMemo(() => (payload && payload.items) || [], [payload])
  const total = payload ? payload.total : 0
  const pages = payload ? payload.pages : 0

  const firstImagesLoad = imagesResource.loading && !payload
  const refetching = imagesResource.loading && Boolean(payload)

  /** Write album/page into the URL; changing album always returns to page one. */
  const setAlbum = useCallback(
    (slug) => {
      setLightboxIndex(-1)
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (slug) next.set('album', slug)
          else next.delete('album')
          next.delete('page')
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const setPage = useCallback(
    (nextPage) => {
      setLightboxIndex(-1)
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        if (nextPage > 1) next.set('page', String(nextPage))
        else next.delete('page')
        return next
      })
      if (gridRef.current) gridRef.current.scrollIntoView({ block: 'start' })
    },
    [setSearchParams],
  )

  const lightboxImages = useMemo(
    () =>
      images.map((image) => ({
        src: image.url,
        alt: image.alt_text,
        caption: [image.title, image.category && image.category.name].filter(Boolean).join(' · '),
      })),
    [images],
  )

  const activeCategory = categories.find((category) => category.slug === album) || null
  const albumName = activeCategory ? activeCategory.name : null

  // Stale data is deliberately kept behind a failed request, so the count line has to fall
  // silent on an error rather than describe photographs that are no longer on screen.
  // A `page` beyond the end of the set: the API answers with an empty page rather than an
  // error, so say so plainly and offer the way back instead of stranding the visitor.
  const pageOutOfRange =
    Boolean(payload) && !imagesResource.error && images.length === 0 && total > 0 && page > 1

  let summary = ''
  if (firstImagesLoad) summary = 'Loading photographs…'
  else if (!imagesResource.error && images.length > 0) {
    const noun = total === 1 ? 'photograph' : 'photographs'
    const inAlbum = albumName ? ` in ${albumName}` : ''
    const ofPages = pages > 1 ? ` · page ${page} of ${pages}` : ''
    summary = `${total} ${noun}${inAlbum}${ofPages}`
  }

  const videoUrl = setting('youtube_url', '')
  const tourUrl = setting('virtual_tour_url', '')
  const tourLinks = [
    videoUrl ? { key: 'video', label: 'Watch the school video', href: videoUrl } : null,
    tourUrl ? { key: 'tour', label: 'Open the 360° virtual tour', href: tourUrl } : null,
  ].filter(Boolean)

  return (
    <>
      <SeoHead
        title="Gallery"
        description="Photographs of classrooms, sport, the arts and school occasions at Baraka School Kapsabet."
        path="/gallery"
        jsonLd={[
          breadcrumbJsonLd([{ name: 'Gallery', path: '/gallery' }]),
          imageGalleryJsonLd(imagesResource.error ? [] : images),
        ]}
      />

      <PageHeader
        eyebrow={COPY.eyebrow}
        title={COPY.title}
        lead={COPY.lead}
        breadcrumbs={BREADCRUMBS}
      />

      {/* Album filter — an asymmetric strip, built entirely from the API's categories. */}
      <Section space="tight" aria-busy={categoriesResource.loading && !categoriesResource.data}>
        {categoriesResource.error ? (
          <ErrorState
            error={categoriesResource.error}
            onRetry={categoriesResource.reload}
            title="Albums did not load"
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-12 md:items-baseline md:gap-8">
            <h2 className="type-eyebrow text-gold md:col-span-3">Albums</h2>

            <div className="md:col-span-9">
              {categoriesResource.loading && !categoriesResource.data ? (
                <Skeleton variant="text" lines={2} className="max-w-md" />
              ) : (
                <div className="flex flex-wrap gap-2" role="group" aria-label={COPY.filterLabel}>
                  <Tag onClick={() => setAlbum('')} selected={!album} className="tap-target">
                    {COPY.allAlbums}
                  </Tag>
                  {categories.map((category) => (
                    <Tag
                      key={category.id}
                      onClick={() => setAlbum(category.slug)}
                      selected={album === category.slug}
                      className="tap-target"
                    >
                      {category.name}
                    </Tag>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Section>

      {/* The photographs. */}
      <Section
        space="tight"
        bordered
        aria-busy={imagesResource.loading}
        aria-label="Photographs"
      >
        <p ref={gridRef} className="type-meta scroll-mt-28 border-b border-line pb-4" aria-live="polite">
          {summary}
        </p>

        {firstImagesLoad ? (
          <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: PER_PAGE }, (_, index) => (
              <li key={index}>
                <Skeleton variant="image" aspect="4 / 3" />
              </li>
            ))}
          </ul>
        ) : imagesResource.error ? (
          <div className="mt-8 flex flex-col items-start gap-4">
            <ErrorState error={imagesResource.error} onRetry={imagesResource.reload} />
            {album ? (
              <Button variant="secondary" size="sm" onClick={() => setAlbum('')}>
                Show all photographs
              </Button>
            ) : null}
          </div>
        ) : pageOutOfRange ? (
          <EmptyState
            className="mt-8"
            icon="image"
            title="That page is past the end of the album"
            description={`There ${total === 1 ? 'is' : 'are'} ${total} ${total === 1 ? 'photograph' : 'photographs'}${albumName ? ` in ${albumName}` : ' in the gallery'}.`}
            action={
              <Button variant="secondary" size="sm" onClick={() => setPage(1)}>
                Back to the first page
              </Button>
            }
          />
        ) : images.length === 0 ? (
          <EmptyState
            className="mt-8"
            icon="image"
            title={albumName ? `No photographs in ${albumName} yet` : 'No photographs yet'}
            description="The school is still adding photographs here. They will appear on this page as soon as they are published."
            action={
              album ? (
                <Button variant="secondary" size="sm" onClick={() => setAlbum('')}>
                  Show all photographs
                </Button>
              ) : null
            }
          />
        ) : (
          <>
            <ul
              className={cn(
                'mt-8 grid grid-cols-2 gap-x-4 gap-y-8 transition-opacity duration-150 ease-editorial sm:grid-cols-3 lg:grid-cols-4',
                refetching && 'opacity-60',
              )}
            >
              {images.map((image, index) => (
                <GalleryTile
                  key={image.id}
                  image={image}
                  onOpen={() => setLightboxIndex(index)}
                />
              ))}
            </ul>

            <Pagination
              page={page}
              pages={pages}
              onChange={setPage}
              label="Gallery pages"
              className="mt-12 border-t border-line pt-6"
            />
          </>
        )}
      </Section>

      {/* Honest state for the two things the school has not supplied. */}
      <Section tone="tint" space="tight">
        <div className="grid gap-5 md:grid-cols-12 md:gap-10">
          <h2 className="type-h4 md:col-span-4">{COPY.tourHeading}</h2>
          <div className="md:col-span-8">
            {tourLinks.length ? (
              <ul className="border-t border-line">
                {tourLinks.map((link) => (
                  <li key={link.key} className="border-b border-line py-4">
                    <a
                      className="link-underline type-body"
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <>
                <p className="type-body max-w-2xl text-ink-70">{COPY.tourPending}</p>
                <Button to="/contact" variant="secondary" size="sm" className="mt-6">
                  Arrange a visit
                </Button>
              </>
            )}
          </div>
        </div>
      </Section>

      <Lightbox
        images={lightboxImages}
        index={lightboxIndex < 0 ? 0 : lightboxIndex}
        open={lightboxIndex >= 0 && lightboxIndex < lightboxImages.length}
        onClose={() => setLightboxIndex(-1)}
        onIndexChange={setLightboxIndex}
        label={albumName ? `${albumName} photographs` : 'School photographs'}
      />
    </>
  )
}
