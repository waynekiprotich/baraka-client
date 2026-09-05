/**
 * SEO helpers — title/description building, canonical URLs and JSON-LD builders.
 * `SeoHead` consumes these; pages should not hand-write structured data.
 */

import { stripHtml, toIsoDate, truncate } from '@/lib/format'

/** Canonical production origin. Overridable per-deploy with VITE_SITE_URL. */
export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://barakaschoolkapsabet.ac.ke')
  .replace(/\/+$/, '')

export const SITE_NAME = 'Baraka School Kapsabet'

/** Shared Open Graph image, 1200×630. */
export const OG_IMAGE = `${SITE_URL}/og-image.jpg`

export const DEFAULT_TITLE = 'Baraka School Kapsabet — Nurturing Excellence & Character'
export const DEFAULT_DESCRIPTION =
  'Baraka School Kapsabet is a premium private mixed day school in Nandi County, Kenya, teaching the CBC curriculum from Playgroup to Grade 9.'

/**
 * "About" → "About | Baraka School Kapsabet", capped at 60 characters (SPEC §8).
 * Pass nothing for the site default.
 */
export function buildTitle(title) {
  if (!title) return DEFAULT_TITLE
  const full = `${title} | ${SITE_NAME}`
  return full.length <= 60 ? full : truncate(full, 60)
}

/** Clamp any description to the 160-character budget, stripping markup first. */
export function buildDescription(text) {
  const plain = stripHtml(text || '')
  return plain ? truncate(plain, 160) : DEFAULT_DESCRIPTION
}

/** "/news/open-day" → "https://barakaschoolkapsabet.ac.ke/news/open-day" */
export function absoluteUrl(path = '/') {
  if (!path) return `${SITE_URL}/`
  if (/^https?:\/\//i.test(path)) return path
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

/* ------------------------------------------------------------------ JSON-LD */

/** `School` — Home only. Facts come from SPEC §2 with live settings overriding them. */
export function schoolJsonLd(settings = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'School',
    '@id': `${SITE_URL}/#school`,
    name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    logo: `${SITE_URL}/brand/crest-ink-512.png`,
    image: OG_IMAGE,
    telephone: settings.phone || '+254 700 123456',
    email: settings.email || undefined,
    foundingDate: '2011',
    slogan: 'Nurturing Excellence, Character & Future Leaders',
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings.address_line1 || 'Kapsabet–Eldoret Road',
      addressLocality: 'Kapsabet',
      addressRegion: 'Nandi County',
      addressCountry: 'KE',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: Number(settings.geo_lat) || 0.2017,
      longitude: Number(settings.geo_lng) || 35.1053,
    },
    sameAs: [
      settings.facebook_url || 'https://facebook.com/barakaschoolkapsabet',
      settings.instagram_url || 'https://instagram.com/barakaschoolkapsabet',
    ].filter(Boolean),
  }
}

/**
 * `BreadcrumbList` for inner pages.
 * @param {Array<{ name: string, path: string }>} items ordered, excluding "Home"
 */
export function breadcrumbJsonLd(items = []) {
  const trail = [{ name: 'Home', path: '/' }, ...items]
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

/** `NewsArticle` for an article detail page. */
export function newsArticleJsonLd(article) {
  if (!article) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: buildDescription(article.excerpt || article.body),
    image: article.cover_image_url ? [absoluteUrl(article.cover_image_url)] : [OG_IMAGE],
    datePublished: toIsoDate(article.published_at || article.created_at),
    dateModified: toIsoDate(article.updated_at || article.published_at || article.created_at),
    author: { '@type': 'Organization', name: article.author || SITE_NAME },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/brand/crest-ink-512.png` },
    },
    mainEntityOfPage: absoluteUrl(`/news/${article.slug}`),
  }
}

/** `Event` for an event detail page. */
export function eventJsonLd(event) {
  if (!event) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: buildDescription(event.summary || event.description),
    startDate: toIsoDate(event.starts_at),
    endDate: event.ends_at ? toIsoDate(event.ends_at) : undefined,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    image: event.cover_image_url ? [absoluteUrl(event.cover_image_url)] : [OG_IMAGE],
    location: {
      '@type': 'Place',
      name: event.location || SITE_NAME,
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Kapsabet–Eldoret Road',
        addressLocality: 'Kapsabet',
        addressRegion: 'Nandi County',
        addressCountry: 'KE',
      },
    },
    organizer: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    url: absoluteUrl(`/events/${event.slug}`),
  }
}

/**
 * `ImageGallery` for the gallery page.
 * @param {Array<{ url: string, alt_text?: string, title?: string }>} images
 */
export function imageGalleryJsonLd(images = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: `${SITE_NAME} photo gallery`,
    url: absoluteUrl('/gallery'),
    associatedMedia: images.slice(0, 24).map((image) => ({
      '@type': 'ImageObject',
      contentUrl: absoluteUrl(image.url),
      name: image.title || undefined,
      description: image.alt_text || undefined,
    })),
  }
}
