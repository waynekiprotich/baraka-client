import { Section } from '@/components/ui/Section'
import { SectionHead } from '@/components/ui/SectionHead'
import { StatBand } from '@/components/ui/StatBand'
import { figures, school } from '@/content/site'
import { useSettings } from '@/lib/settings'
import { intro } from '@/pages/home/copy'

/**
 * Band 2 — the introduction.
 *
 * Asymmetric by design: a short heading and the motto hold the left column, the two
 * paragraphs of prose sit right, and the figures run underneath as a thin lined band
 * (`StatBand`) rather than as stat tiles.
 *
 * The figures are CMS-managed (`stat_learners`, `stat_staff`, `stat_years`, `stat_ratio`)
 * and fall back to the `figures` list in `content/site.js` when a row is empty.
 */
export function IntroBand() {
  const { get } = useSettings()

  const items = [
    { value: get('stat_learners', figures[0].value), label: figures[0].label },
    { value: get('stat_staff', figures[1].value), label: figures[1].label },
    { value: get('stat_years', figures[2].value), label: figures[2].label },
    { value: get('stat_ratio', figures[3].value), label: figures[3].label },
  ]

  return (
    // Top padding only is tightened here (not `space="default"`'s symmetric py-*, which would
    // fight this on the same property) -- right under a full-bleed hero, the standard top gap
    // reads as dead space. Bottom padding matches "default" exactly, so the gap before the next
    // band is untouched.
    <Section tone="paper" space="flush" className="pt-10 pb-16 md:pt-14 md:pb-24 lg:pt-16 lg:pb-32">
      <div className="grid gap-10 md:grid-cols-12 md:gap-12">
        <div className="md:col-span-5">
          <SectionHead as="h2" eyebrow={intro.eyebrow} title={intro.heading} />

          <p className="mt-8 border-t-2 border-gold pt-5 font-display text-xl tracking-[-0.01em]">
            {school.motto}
          </p>
          <p className="type-small mt-3 max-w-sm text-ink-70">{school.mottoMeaning}</p>
        </div>

        <div className="md:col-span-6 md:col-start-7">
          <p className="type-body text-ink-70">{school.founding}</p>
          <p className="type-body mt-5 text-ink-70">{school.mission}</p>
        </div>
      </div>

      <StatBand
        items={items}
        contained={false}
        label={intro.statsLabel}
        className="mt-14 md:mt-20"
      />
    </Section>
  )
}

export default IntroBand
