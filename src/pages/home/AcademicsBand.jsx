import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Img } from '@/components/ui/Img'
import { Section } from '@/components/ui/Section'
import { SectionHead } from '@/components/ui/SectionHead'
import { media } from '@/content/media'
import { levels } from '@/content/site'
import { academics } from '@/pages/home/copy'

/**
 * Band 4 — academics.
 *
 * An editorial split: a tall photograph on one side, the four CBC levels on the other as a
 * hairline-divided list. Each row carries the level name and its age or grade range on the
 * left of its own sub-grid and the summary on the right, with the level's qualifying note
 * (class cap, assessment basis, transition rate) as meta beneath it.
 *
 * The levels come from `content/site.js` — the same list the Academics page renders — so
 * the homepage can never drift from it.
 */
export function AcademicsBand() {
  return (
    <Section tone="paper" space="default">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <Img
            {...media.classroomHands}
            alt={media.classroomHands.alt}
            aspect="4 / 5"
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="rounded-xs"
          />
        </div>

        <div className="lg:col-span-7">
          <SectionHead
            as="h2"
            eyebrow={academics.eyebrow}
            title={academics.heading}
            lead={academics.lead}
          />

          <ul className="mt-10 border-b border-line">
            {levels.map((level) => (
              <li key={level.id} className="grid gap-2 border-t border-line py-6 md:grid-cols-12 md:gap-6">
                <div className="md:col-span-4">
                  <h3 className="type-h4">{level.name}</h3>
                  <p className="type-meta mt-1">{level.ages}</p>
                </div>
                <div className="md:col-span-8">
                  <p className="type-small text-ink-70">{level.summary}</p>
                  {level.note ? <p className="type-meta mt-2">{level.note}</p> : null}
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <Button
              to="/academics"
              variant="secondary"
              iconRight={<Icon name="arrow-right" size={18} />}
            >
              {academics.action}
            </Button>
          </div>
        </div>
      </div>
    </Section>
  )
}

export default AcademicsBand
