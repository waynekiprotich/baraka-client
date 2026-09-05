import { SeoHead } from '@/components/SeoHead'
import { school } from '@/content/site'
import { schoolJsonLd } from '@/lib/seo'
import { useSettings } from '@/lib/settings'
import { AcademicsBand } from '@/pages/home/AcademicsBand'
import { AdmissionsCtaBand } from '@/pages/home/AdmissionsCtaBand'
import { FacilitiesBand } from '@/pages/home/FacilitiesBand'
import { HeroBand } from '@/pages/home/HeroBand'
import { IntroBand } from '@/pages/home/IntroBand'
import { NewsEventsBand } from '@/pages/home/NewsEventsBand'
import { PhotographyBand } from '@/pages/home/PhotographyBand'
import { SchoolLifeBand } from '@/pages/home/SchoolLifeBand'
import { WhyBarakaBand } from '@/pages/home/WhyBarakaBand'

/**
 * The homepage.
 *
 * Nine bands in the order set by SPEC §4, each one its own file in `pages/home/`. The tenth
 * band is the site footer, which belongs to `SiteLayout`.
 *
 *   1 Hero              full-bleed photograph, scrim, the page's single <h1>, two actions
 *   2 Introduction      asymmetric heading/prose split over a thin stat band
 *   3 Why Baraka        three reasons as a hairline-divided list with icons
 *   4 Academics         editorial split — photograph beside the four CBC levels
 *   5 School life       copy and a pull-quote over a horizontal photo strip
 *   6 Facilities        overlapping image pair beside a short definition list
 *   7 Photography       six real images from GET /gallery, masonry, → /gallery
 *   8 Noticeboard       3 articles + 2 upcoming events, fetched in parallel
 *   9 Admissions CTA    brand ground, one heading, one line, two actions
 *
 * Backgrounds alternate paper / tint so no two tinted bands ever touch, and no band is a
 * three-column card grid — the page carries none at all.
 *
 * Two bands talk to the API (Photography, Noticeboard) and each renders its own loading,
 * error, empty and content states, so a failing request degrades one band rather than the
 * page. The only image marked `priority` is the hero, which is the LCP.
 */
export default function Home() {
  const { settings, get } = useSettings()

  const locality = get('address_locality', 'Kapsabet')
  const region = get('address_region', 'Nandi County')
  const descriptor = `${school.descriptor.charAt(0).toUpperCase()}${school.descriptor.slice(1)}`

  return (
    <>
      <SeoHead
        title={null}
        description={`${descriptor} in ${locality}, ${region}. ${school.curriculum} from Playgroup to Grade 9 — ${school.positioning.toLowerCase()}.`}
        path="/"
        jsonLd={schoolJsonLd(settings)}
      />

      <HeroBand />
      <IntroBand />
      <WhyBarakaBand />
      <AcademicsBand />
      <SchoolLifeBand />
      <FacilitiesBand />
      <PhotographyBand />
      <NewsEventsBand />
      <AdmissionsCtaBand />
    </>
  )
}
