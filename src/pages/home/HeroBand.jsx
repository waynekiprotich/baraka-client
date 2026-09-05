import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { Img } from '@/components/ui/Img'
import { media } from '@/content/media'
import { school } from '@/content/site'
import { useSettings } from '@/lib/settings'

/**
 * Band 1 — the hero.
 *
 * A full-bleed photograph under a legibility scrim, with the school's single `<h1>` on top.
 * The fixed site header is transparent over this band on `/`, so the copy is bottom-aligned
 * and the top padding clears the header's tallest form (the lg contact strip plus the main
 * row, roughly 104px).
 *
 * The image is the page's LCP: it passes `priority`, which means eager loading and
 * `fetchpriority="high"`, and it is the only image on the page that does.
 *
 * Title, subtitle and image come from the CMS when the school has set them
 * (`hero_title` / `hero_subtitle` / `hero_image_url`); `hero_image_url` ships empty on
 * purpose, and the documented fallback is the curated placeholder in `content/media.js`.
 * The alt text follows whichever image actually renders — the CMS alt describes the CMS
 * photograph and must not be attached to the placeholder.
 */
export function HeroBand() {
  const { get } = useSettings()

  const title = get('hero_title', school.positioning)
  const subtitle = get(
    'hero_subtitle',
    `A ${school.descriptor} in Kapsabet, Nandi County — ${school.curriculum} from Playgroup to Grade 9.`,
  )

  const cmsImage = get('hero_image_url')
  const locality = get('address_locality')
  const region = get('address_region')
  // The live settings row is `address_line1`; the seeded fallback map calls it
  const street = get('address_line1')

  const place = [street, [locality, region].filter(Boolean).join(', ')].filter(Boolean).join(' · ')

  return (
    <section className="relative isolate flex min-h-svh items-end overflow-hidden bg-ink">
      <div className="absolute inset-0 -z-10">
        {cmsImage ? (
          <Img
            src={cmsImage}
            alt={get('hero_image_alt', `${school.name} learners on the school grounds`)}
            sizes="100vw"
            aspect="16 / 9"
            priority
            className="h-full w-full"
          />
        ) : (
          <Img {...media.hero} alt={media.hero.alt} sizes="100vw" priority className="h-full w-full" />
        )}
        <div className="scrim absolute inset-0" aria-hidden="true" />
      </div>

      <Container className="pt-32 pb-14 text-paper sm:pb-20 lg:pt-40 lg:pb-24">
        {place ? (
          <p className="type-eyebrow flex items-center gap-2 text-gold-400">
            <Icon name="pin" size={16} className="shrink-0" />
            <span>{place}</span>
          </p>
        ) : null}

        <h1
          id="page-title"
          tabIndex={-1}
          className="type-hero mt-5 max-w-4xl text-balance text-paper outline-none"
        >
          {title}
        </h1>

        <p className="type-lead mt-5 max-w-xl text-paper/85">{subtitle}</p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Button
            to="/admissions#apply"
            variant="gold"
            size="lg"
            iconRight={<Icon name="arrow-right" size={18} />}
          >
            Apply now
          </Button>
          <Button to="/contact" variant="inverse" size="lg">
            Book a visit
          </Button>
        </div>
      </Container>
    </section>
  )
}

export default HeroBand
