import { Img } from '@/components/ui/Img'
import { Section } from '@/components/ui/Section'
import { SectionHead } from '@/components/ui/SectionHead'
import { media } from '@/content/media'
import { departments, digitalLearning, milestones, sports } from '@/content/site'
import { facilities } from '@/pages/home/copy'

/** The 2019 milestone — the only purpose-built block the school has told us about. */
const SCIENCE_BLOCK = milestones.find((entry) => entry.year === '2019')
/** The Agriculture department is where the school garden is documented. */
const AGRICULTURE = departments.find((entry) => entry.name === 'Agriculture')

/**
 * The spaces and programmes named in SPEC §2. Nothing may be added here that the school has
 * not supplied — a hall, a library, a pool or a dining room would all be inventions.
 * @type {Array<{ term: string, detail: string }>}
 */
const PLACES = [
  {
    term: 'Science & ICT block',
    detail: SCIENCE_BLOCK
      ? `Opened in ${SCIENCE_BLOCK.year}. ${SCIENCE_BLOCK.detail}`
      : 'Purpose-built labs for practical learning.',
  },
  {
    term: 'Every classroom',
    detail: digitalLearning,
  },
  {
    term: 'The school garden',
    detail: AGRICULTURE ? AGRICULTURE.description : 'Practical farming taught on site.',
  },
  {
    term: 'Sport',
    detail: sports.map((sport) => sport.name).join(' · '),
  },
]

/**
 * Band 6 — facilities.
 *
 * An overlapping image pair on the left, short text and a definition list on the right. The
 * overlap is built inside the page grid (a second cell pulled up by a negative margin)
 * rather than with absolute offsets, so nothing can hang past the container and open a
 * horizontal scrollbar at 320px.
 *
 * Only spaces the school has actually described appear here. A library and a sports field
 * would be plausible and are deliberately absent: SPEC §2 forbids inventing a facility.
 */
export function FacilitiesBand() {
  return (
    <Section tone="paper" space="default">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-6">
          <div className="grid grid-cols-12">
            <div className="col-span-10">
              <Img
                {...media.campusBuilding}
                alt={media.campusBuilding.alt}
                aspect="4 / 3"
                sizes="(min-width: 1024px) 40vw, 84vw"
                className="rounded-xs"
              />
            </div>
            <div className="col-span-6 col-start-7 -mt-14 border-4 border-paper md:-mt-20">
              <Img
                {...media.scienceGlassware}
                alt={media.scienceGlassware.alt}
                aspect="1 / 1"
                sizes="(min-width: 1024px) 24vw, 46vw"
                className="rounded-xs"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-6">
          <SectionHead
            as="h2"
            eyebrow={facilities.eyebrow}
            title={facilities.heading}
            lead={facilities.lead}
          />

          <dl className="mt-10 grid gap-x-10 gap-y-7 sm:grid-cols-2">
            {PLACES.map((place) => (
              <div key={place.term}>
                <dt className="type-h4">{place.term}</dt>
                <dd className="type-small mt-2 text-ink-70">{place.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Section>
  )
}

export default FacilitiesBand
