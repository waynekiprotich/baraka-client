import { useEffect } from 'react'

import {
  DEFAULT_DESCRIPTION,
  OG_IMAGE,
  SITE_NAME,
  absoluteUrl,
  buildDescription,
  buildTitle,
} from '@/lib/seo'

/**
 * Per-route document head: title, description, canonical, Open Graph, Twitter card,
 * robots and JSON-LD.
 *
 * The head is updated imperatively rather than by rendering tags, so the static tags in
 * index.html are *edited in place* instead of being duplicated — a second `<title>` in the
 * document would leave the first one winning and every route would share one title.
 *
 * Render exactly one of these per page, near the top of the page component.
 *
 * @param {object} props
 * @param {string} [props.title]       page title without the site name; ≤60 chars once built
 * @param {string} [props.description] ≤160 chars; markup is stripped and it is truncated
 * @param {string} [props.path]        route path for the canonical URL, e.g. '/about'
 * @param {string} [props.image]       absolute or site-relative OG image
 * @param {'website'|'article'} [props.type]
 * @param {boolean} [props.noindex]    admin routes and nothing else
 * @param {object|object[]} [props.jsonLd] structured data from lib/seo.js builders
 */
export function SeoHead({
  title,
  description,
  path,
  image,
  type = 'website',
  noindex = false,
  jsonLd,
}) {
  const fullTitle = buildTitle(title)
  const metaDescription = description ? buildDescription(description) : DEFAULT_DESCRIPTION
  const canonical = absoluteUrl(path || (typeof window !== 'undefined' ? window.location.pathname : '/'))
  const ogImage = image ? absoluteUrl(image) : OG_IMAGE
  const structured = jsonLd ? JSON.stringify(jsonLd) : null

  useEffect(() => {
    document.title = fullTitle

    const head = document.head

    /** Create or update one tag, matched by its identifying attribute. */
    const upsert = (tagName, matchAttr, matchValue, attrs) => {
      const selector = `${tagName}[${matchAttr}="${matchValue}"]`
      let node = head.querySelector(selector)
      if (!node) {
        node = document.createElement(tagName)
        node.setAttribute(matchAttr, matchValue)
        head.appendChild(node)
      }
      for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value)
      return node
    }

    upsert('meta', 'name', 'description', { content: metaDescription })
    upsert('link', 'rel', 'canonical', { href: canonical })

    upsert('meta', 'property', 'og:title', { content: fullTitle })
    upsert('meta', 'property', 'og:description', { content: metaDescription })
    upsert('meta', 'property', 'og:url', { content: canonical })
    upsert('meta', 'property', 'og:type', { content: type })
    upsert('meta', 'property', 'og:image', { content: ogImage })
    upsert('meta', 'property', 'og:site_name', { content: SITE_NAME })

    upsert('meta', 'name', 'twitter:card', { content: 'summary_large_image' })
    upsert('meta', 'name', 'twitter:title', { content: fullTitle })
    upsert('meta', 'name', 'twitter:description', { content: metaDescription })
    upsert('meta', 'name', 'twitter:image', { content: ogImage })

    const robots = head.querySelector('meta[name="robots"]')
    if (noindex) {
      upsert('meta', 'name', 'robots', { content: 'noindex, nofollow' })
    } else if (robots) {
      robots.remove()
    }
  }, [fullTitle, metaDescription, canonical, ogImage, type, noindex])

  useEffect(() => {
    if (!structured) return undefined

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.dataset.seo = 'route'
    script.textContent = structured
    document.head.appendChild(script)

    return () => script.remove()
  }, [structured])

  return null
}

export default SeoHead
