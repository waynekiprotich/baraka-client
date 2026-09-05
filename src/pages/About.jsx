import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Img } from '@/components/ui/Img'
import { PageHeader } from '@/components/ui/PageHeader'
import { Section } from '@/components/ui/Section'
import { SectionHead } from '@/components/ui/SectionHead'
import { StatBand } from '@/components/ui/StatBand'
import { SeoHead } from '@/components/SeoHead'
import { media } from '@/content/media'
import { leadership, milestones, resultsFigures, school } from '@/content/site'
import { cn } from '@/lib/cn'
import { breadcrumbJsonLd } from '@/lib/seo'
import { useSettings } from '@/lib/settings'

const BREADCRUMBS = [{ label: 'About', to: '/about' }]
const BREADCRUMB_JSONLD = breadcrumbJsonLd([{ name: 'About', path: '/about' }])

const META_DESCRIPTION =
  'How Baraka School Kapsabet grew from two classrooms in 2011 into one of Nandi County’s ' +
  'busiest day schools — our mission, our leadership and our milestones.'

/**
 * Founding narrative. Every claim here is a restatement of SPEC §2 facts already held in
 * content/site.js (the 2011 opening, the day-school premise, the science and ICT block, the
 * CBC transition, the current roll). Nothing new is asserted.
 */
const FOUNDING_PARAGRAPHS = [
  school.founding,
  'The premise was a plain one: that a child could get a rigorous, well-resourced education in Kapsabet and still sleep at home. Every decision since — the science and ICT block, specialist subject teachers from Grade 4, the full move to the Competency-Based Curriculum — has been made in service of it.',
  `Fifteen years on, the brief has not changed. Baraka is a ${school.descriptor} teaching the ${school.curriculum} from ${school.gradeRange}, and it is still a school families walk their children to in the morning.`,
]

/** The three statements, in the order they are read. */
const STATEMENTS = [
  { id: 'mission', term: 'Mission', body: school.mission },
  { id: 'vision', term: 'Vision', body: school.vision },
  { id: 'motto', term: 'Motto', body: school.mottoMeaning },
]

/**
 * Which SiteSetting row holds each results figure. Keyed by label so the mapping survives a
 * reordering of `resultsFigures`; the value in content/site.js is the fallback.
 */
const RESULT_SETTING_KEYS = {
  'KCPE mean transition': 'stat_transition',
  'Distinction rate': 'stat_distinction',
  'County top performers': 'stat_top_performers',
  'Lower Primary class cap': 'stat_class_cap',
}

/** Initials for the portrait placeholder, with honorifics dropped. */
function initialsOf(name) {
  return name
    .split(/\s+/)
    .filter((part) => !/^(mr|mrs|ms|dr|prof)\.?$/i.test(part))
    .map((part) => part.charAt(0))
    .join('')
}

/**
 * About — the school's story, the people who run it, and how it got here.
 *
 * Composition, in order: asymmetric masthead with an at-a-glance list · editorial split for
 * the founding story · hairline-divided three-statement band · alternating leadership
 * pull-quotes · a dated timeline on a connecting rule · a full-bleed image band with a scrim
 * · a thin results band · a quiet closing CTA. No card grid anywhere on this page.
 */
export default function About() {
  const { get } = useSettings()

  const foundedYear = get('founded_year', String(school.founded))
  const curriculum = get('curriculum', `${school.curriculum}, ${school.gradeRange}`)
  const locality = get('address_locality', 'Kapsabet')
  const region = get('address_region', 'Nandi County')
  // The setting ships without a trailing stop; the site.js fallback carries one. Normalise so
  // the sentence it is dropped into reads correctly either way.
  const motto = get('motto', school.motto).replace(/\.$/, '')

  const glance = [
    { term: 'Founded', detail: foundedYear },
    { term: 'Curriculum', detail: curriculum },
    { term: 'Type', detail: school.descriptor },
    { term: 'Where', detail: `${locality}, ${region}` },
  ]

  const results = resultsFigures.map((figure) => ({
    label: figure.label,
    value: get(RESULT_SETTING_KEYS[figure.label], figure.value),
  }))

  return (
    <>
      <SeoHead
        title="About the school"
        description={META_DESCRIPTION}
        path="/about"
        jsonLd={BREADCRUMB_JSONLD}
      />

      <PageHeader
        eyebrow="About us"
        title="The school that started with two classrooms"
        lead="Baraka was built by educators from this county, for families in this county — and it has stayed a day school on purpose."
        breadcrumbs={BREADCRUMBS}
        aside={
          <dl className="border-y border-line">
            {glance.map((item) => (
              <div
                key={item.term}
                className="flex items-baseline justify-between gap-6 border-b border-line py-3 last:border-b-0"
              >
                <dt className="type-meta shrink-0">{item.term}</dt>
                <dd className="type-small m-0 text-right text-ink first-letter:uppercase">
                  {item.detail}
                </dd>
              </div>
            ))}
          </dl>
        }
      />

      {/* ------------------------------------------------ founding story: editorial split */}
      <Section space="tight" aria-labelledby="founding-heading">
        <div className="grid items-start gap-10 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-7">
            <Eyebrow className="mb-3">Our story</Eyebrow>
            <h2 id="founding-heading" className="type-h2 max-w-xl">
              Forty pupils, and a bet on {locality}
            </h2>
            <div className="prose-editorial mt-8">
              {FOUNDING_PARAGRAPHS.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="md:col-span-5">
            <Img
              {...media.schoolGrounds}
              alt={media.schoolGrounds.alt}
              sizes="(min-width: 768px) 40vw, 100vw"
              caption="Placeholder photography, standing in until the school supplies its own."
              wrapperClassName="m-0"
            />
          </div>
        </div>
      </Section>

      {/* ------------------------------------- mission / vision / motto: hairline band */}
      <Section tone="tint" bordered>
        <SectionHead
          eyebrow="What we stand for"
          title="Mission, vision and motto"
          lead={`The three sentences the school measures itself against. The motto is the shortest: ${motto}.`}
        />

        <div className="mt-12 grid gap-px border-y border-line bg-line md:grid-cols-3">
          {STATEMENTS.map((statement) => (
            <div
              key={statement.id}
              className="bg-paper-2 py-8 md:px-6 md:py-10 md:first:pl-0 md:last:pr-0"
            >
              <h3 className="type-h4 text-ink-50">{statement.term}</h3>
              <p className="type-body mt-4 text-ink">{statement.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------ leadership: alternating quotes */}
      <Section>
        <SectionHead
          eyebrow="Leadership"
          title="The two people answerable for it"
          lead="In their own words."
        />

        <div className="mt-14 space-y-14 md:mt-16 md:space-y-20">
          {leadership.map((person, index) => {
            const portraitLeft = index % 2 === 0
            return (
              <figure
                key={person.name}
                className="m-0 grid items-center gap-8 md:grid-cols-12 md:gap-12"
              >
                <div
                  className={cn(
                    'md:col-span-4',
                    portraitLeft ? 'md:col-start-1' : 'md:col-start-9',
                  )}
                >
                  <div className="flex aspect-[4/5] max-w-[15rem] items-center justify-center border border-line bg-paper-2 md:max-w-none">
                    <span aria-hidden="true" className="font-display text-5xl text-ink-50">
                      {initialsOf(person.name)}
                    </span>
                  </div>
                  <p className="type-meta mt-3">
                    Portrait photograph to follow — the school has not supplied one yet.
                  </p>
                </div>

                <div
                  className={cn(
                    'md:col-span-7',
                    portraitLeft ? 'md:col-start-6' : 'md:col-start-1 md:row-start-1',
                  )}
                >
                  <blockquote className="type-quote border-l-2 border-gold pl-6 text-ink md:pl-8">
                    {person.quote}
                  </blockquote>
                  <figcaption className="mt-6 border-t border-line pt-4 md:pl-8">
                    <cite className="type-h4 text-ink not-italic">{person.name}</cite>
                    <span className="type-meta mt-1 block">{person.role}</span>
                  </figcaption>
                </div>
              </figure>
            )
          })}
        </div>
      </Section>

      {/* ------------------------------------------------------- milestones: dated rule */}
      <Section tone="tint" bordered>
        <SectionHead
          eyebrow="Milestones"
          title={`${milestones[0].year} to today`}
          lead="How the school got from forty pupils to where it stands now."
        />

        <ol className="mt-12 md:mt-16">
          {milestones.map((milestone, index) => (
            <li
              key={milestone.year}
              className="grid grid-cols-[3.75rem_1fr] gap-x-4 md:grid-cols-[9rem_1fr] md:gap-x-10"
            >
              <p className="type-h3 text-ink">{milestone.year}</p>
              <div
                className={cn(
                  'relative border-l border-line pl-5 md:pl-8',
                  index < milestones.length - 1 && 'pb-10 md:pb-14',
                )}
              >
                <span
                  aria-hidden="true"
                  className="absolute top-2.5 -left-[3px] block h-1.5 w-1.5 bg-gold"
                />
                <h3 className="type-h4 text-ink">{milestone.title}</h3>
                <p className="type-body mt-2 max-w-xl text-ink-70">{milestone.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {/* ------------------------------------------ full-bleed band: where the school is */}
      <section aria-labelledby="place-heading" className="relative isolate overflow-hidden bg-ink">
        <Img
          {...media.runnersDawn}
          alt={media.runnersDawn.alt}
          aspect="auto"
          sizes="100vw"
          className="absolute inset-0"
        />
        <div aria-hidden="true" className="scrim absolute inset-0" />
        <div className="relative flex min-h-[20rem] items-end py-14 md:min-h-[26rem] md:py-20">
          <Container>
            <Eyebrow className="mb-4 text-gold-400">Where we are</Eyebrow>
            <h2 id="place-heading" className="type-h2 max-w-3xl text-paper">
              {school.runningHeartland}
            </h2>
          </Container>
        </div>
      </section>

      {/* ------------------------------------------------------------- results: stat band */}
      <Section>
        <SectionHead eyebrow="Results" title="What the record shows" />

        <StatBand
          items={results}
          contained={false}
          label="Academic results at Baraka School Kapsabet"
          className="mt-10 md:mt-12"
        />

        <p className="type-small mt-6 max-w-2xl text-ink-70">
          Lower Primary classes are capped at {get('stat_class_cap', '24')}, with a class
          teacher and an aide, and the school runs a {get('stat_ratio', '1:18')}{' '}
          teacher–learner ratio overall.
        </p>
      </Section>

      {/* --------------------------------------------------------------- closing actions */}
      <Section tone="tint" space="tight" bordered aria-labelledby="next-heading">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <h2 id="next-heading" className="type-h3">
              Come and see it for yourself
            </h2>
            <p className="type-body mt-3 text-ink-70">
              {get(
                'admissions_open_text',
                `Places are open for ${school.gradeRange.replace('→', 'through')}.`,
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button to="/admissions#apply" variant="primary">
              Start an application
            </Button>
            <Button to="/contact" variant="secondary">
              Contact the school
            </Button>
          </div>
        </div>
      </Section>
    </>
  )
}
