import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Img } from '@/components/ui/Img'
import { Section } from '@/components/ui/Section'
import { SectionHead } from '@/components/ui/SectionHead'
import { strip } from '@/content/media'
import { arts, clubs, school, sports, studentVoices } from '@/content/site'
import { schoolLife } from '@/pages/home/copy'

/** The learner quote used here — attributed exactly as the school supplied it. */
const VOICE = studentVoices.find((voice) => voice.name === 'Naomi') || studentVoices[0]

/* Names are read from site.js rather than retyped, so the band can only list what the
   school has actually named — six clubs, not the rounder "twelve" the old site claimed. */
const SPORT_NAMES = sports.map((sport) => sport.name)
const CLUB_NAMES = clubs.map((club) => club.name)
const ARTS_NAMES = arts.map((art) => art.name)

/**
 * Join a list into a sentence fragment: "a, b and c".
 * @param {string[]} parts
 */
function sentenceList(parts) {
  if (parts.length < 2) return parts.join('')
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`
}

/**
 * Band 5 — school life.
 *
 * Copy left, a pull-quote set off by a gold rule on the right, and a horizontal photo strip
 * beneath that scrolls on mobile (`.scroll-strip`, with snap points from base.css).
 *
 * The sports, clubs and arts named here are read from `content/site.js` rather than typed
 * out, so the band lists exactly the six clubs the school has actually named — never the
 * rounder "twelve clubs" the old site claimed without listing.
 */
export function SchoolLifeBand() {
  return (
    <Section tone="tint" space="default">
      <div className="grid gap-10 md:grid-cols-12 md:gap-12">
        <div className="md:col-span-7">
          <SectionHead as="h2" eyebrow={schoolLife.eyebrow} title={schoolLife.heading} />

          <p className="type-body mt-6 text-ink-70">{school.runningHeartland}</p>
          <p className="type-body mt-5 text-ink-70">
            {sentenceList(SPORT_NAMES)} run through the year, and the afternoons belong to the
            clubs — {sentenceList(CLUB_NAMES)}.
          </p>
          <p className="type-body mt-5 text-ink-70">
            {sentenceList(ARTS_NAMES)} carry the arts across every grade.
          </p>

          <div className="mt-8">
            <Button
              to="/school-life"
              variant="secondary"
              iconRight={<Icon name="arrow-right" size={18} />}
            >
              {schoolLife.action}
            </Button>
          </div>
        </div>

        <figure className="border-t-2 border-gold pt-6 md:col-span-4 md:col-start-9 md:mt-2">
          <blockquote className="type-quote">
            <p>“{VOICE.quote}”</p>
          </blockquote>
          <figcaption className="type-meta mt-4">
            {VOICE.name}, {VOICE.grade}
          </figcaption>
        </figure>
      </div>

      <ul className="scroll-strip mt-12 pb-3 md:mt-16" aria-label="Photographs of school life">
        {strip.map((photo) => (
          <li key={photo.src} className="w-[74vw] max-w-[380px] sm:w-[46vw] lg:w-[28vw]">
            <Img
              {...photo}
              alt={photo.alt}
              aspect="4 / 5"
              sizes="(min-width: 1024px) 28vw, (min-width: 640px) 46vw, 74vw"
              className="rounded-xs"
            />
          </li>
        ))}
      </ul>
    </Section>
  )
}

export default SchoolLifeBand
