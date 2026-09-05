import { Icon } from '@/components/ui/Icon'
import { Section } from '@/components/ui/Section'
import { SectionHead } from '@/components/ui/SectionHead'
import { school, teachingPhilosophy } from '@/content/site'
import { useSettings } from '@/lib/settings'
import { why } from '@/pages/home/copy'

/**
 * Band 3 — why Baraka.
 *
 * Three reasons as a hairline-divided list, not cards: an icon, a heading and a line of
 * body copy laid out on the page grid so the rows read like an editorial table.
 *
 * Each body is assembled from facts that already exist elsewhere — the teaching philosophy
 * and the motto from `content/site.js`, the ratio and the Lower Primary class cap from the
 * CMS `stat_ratio` / `stat_class_cap` rows — so there is exactly one place to correct any
 * of them.
 */
export function WhyBarakaBand() {
  const { get } = useSettings()

  const ratio = get('stat_ratio', '1:18')
  const classCap = get('stat_class_cap', '24')

  const bodies = {
    mastery: teachingPhilosophy.statement,
    'class-size': `A teacher–learner ratio of ${ratio}, Lower Primary classes capped at ${classCap} with a class teacher and an aide, and specialist teachers for sciences, maths and languages from Upper Primary onward.`,
    character: school.mottoMeaning,
  }

  return (
    <Section tone="tint" space="default">
      <SectionHead as="h2" eyebrow={why.eyebrow} title={why.heading} className="max-w-3xl" />

      <ul className="mt-12 border-b border-line">
        {why.reasons.map((reason) => (
          <li
            key={reason.id}
            className="grid gap-3 border-t border-line py-8 md:grid-cols-12 md:gap-8 md:py-10"
          >
            <div className="md:col-span-1">
              <Icon name={reason.icon} className="text-gold" />
            </div>
            <h3 className="type-h3 md:col-span-4">{reason.title}</h3>
            <p className="type-body text-ink-70 md:col-span-7">{bodies[reason.id]}</p>
          </li>
        ))}
      </ul>
    </Section>
  )
}

export default WhyBarakaBand
