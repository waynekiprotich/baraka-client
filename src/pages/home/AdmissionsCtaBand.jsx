import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Section } from '@/components/ui/Section'
import { intakeYear } from '@/content/site'
import { useSettings } from '@/lib/settings'
import { admissionsCta } from '@/pages/home/copy'

/**
 * Band 9 — the closing call to action.
 *
 * Brand ground, one heading, one line, two actions. This is one of the two places on the
 * site where centring is allowed (SPEC §3), because there is nothing to align to.
 *
 * The line is the CMS `admissions_open_text` row so the school can change the intake it is
 * advertising without a developer; the fallback restates the same fact from
 * `content/site.js`.
 *
 * `SectionHead` is deliberately not used here: its `type-lead` sets an ink colour that would
 * fail contrast on the brand ground.
 */
export function AdmissionsCtaBand() {
  const { get } = useSettings()

  const line = get(
    'admissions_open_text',
    `Places are open for Playgroup through Grade 9 for the ${intakeYear} intake.`,
  )

  return (
    <Section tone="brand" space="default">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="type-h2 text-balance text-paper">{admissionsCta.heading}</h2>
        <p className="type-lead mt-5 text-paper/80">{line}</p>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Button
            to="/admissions#apply"
            variant="gold"
            size="lg"
            iconRight={<Icon name="arrow-right" size={18} />}
          >
            {admissionsCta.primary}
          </Button>
          <Button to="/contact" variant="inverse" size="lg">
            {admissionsCta.secondary}
          </Button>
        </div>
      </div>
    </Section>
  )
}

export default AdmissionsCtaBand
