import { useId } from 'react'

import { SeoHead } from '@/components/SeoHead'
import { Button } from '@/components/ui/Button'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Icon } from '@/components/ui/Icon'
import { Img } from '@/components/ui/Img'
import { PageHeader } from '@/components/ui/PageHeader'
import { Section } from '@/components/ui/Section'
import { SectionHead } from '@/components/ui/SectionHead'
import { StatBand } from '@/components/ui/StatBand'
import { Tabs } from '@/components/ui/Tabs'
import { media } from '@/content/media'
import {
  departments,
  digitalLearning,
  levels,
  pendingItems,
  resultsFigures,
  school,
  teachingPhilosophy,
  termDates,
} from '@/content/site'
import { breadcrumbJsonLd } from '@/lib/seo'
import { useSettings } from '@/lib/settings'

const BREADCRUMBS = [{ label: 'Academics', to: '/academics' }]

/**
 * Page-local copy. Connective prose only — every fact on this page comes from
 * `content/site.js` or from a SiteSetting. Nothing here asserts a number, a date, a result
 * or a claim that the school has not supplied (SPEC §2).
 */
const COPY = {
  metaDescription:
    'The CBC pathway at Baraka School Kapsabet — four stages from Playgroup to Grade 9, eight subject departments, and teaching to mastery rather than the calendar.',
  headerTitle: 'Playgroup to Grade 9, taught to mastery',
  headerLead:
    'One curriculum, four stages, and a class that moves at the pace of understanding rather than the pace of the term.',
  pathHeading: 'One pathway, four stages',
  pathParagraphs: [
    'A learner can start at Baraka in Playgroup and finish at the end of Grade 9 without ever changing school. The CBC pathway runs unbroken across four stages, and each stage is shaped around what children of that age need from a school day.',
    'Choose a stage to see its grade range, what it concentrates on, and how it is taught.',
  ],
  focusLabel: 'What it concentrates on',
  calendarHeading: 'Academic calendar',
  calendarAvailable: 'The full academic calendar is published as a downloadable document.',
}

/** One placeholder photograph per stage, from the curated library in `content/media.js`. */
const LEVEL_MEDIA = {
  'early-years': media.earlyYearsTable,
  'lower-primary': media.learnerWriting,
  'upper-primary': media.scienceGlassware,
  'junior-school': media.libraryAisle,
}

const LEVEL_SIZES = '(min-width: 1024px) 30vw, (min-width: 768px) 38vw, 100vw'
const SPLIT_SIZES = '(min-width: 768px) 45vw, 100vw'

/** The honest note for things the school has not supplied yet (SPEC §2, CONTRACTS A8). */
const DOWNLOADS_PENDING = pendingItems.find((item) => item.id === 'downloads')

/**
 * One stage of the pathway: an editorial split of photograph and detail. Rendered inside the
 * tab panel, so its heading sits one level below the section heading.
 */
function LevelPanel({ level }) {
  const image = LEVEL_MEDIA[level.id]

  return (
    // This grid is nested inside the tab panel, which is only ~390px wide at the md
    // breakpoint — twelve columns of 40px gap do not fit there, so the split waits for lg.
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
      <div className="lg:col-span-7">
        <p className="type-meta">{level.ages}</p>
        <h3 className="type-h3 mt-2">{level.name}</h3>
        <p className="type-lead mt-4">{level.summary}</p>

        <h4 className="type-meta mt-8 font-semibold uppercase tracking-[0.12em] text-ink-50">
          {COPY.focusLabel}
        </h4>
        <ul className="mt-3 border-t border-line">
          {level.focus.map((item) => (
            <li key={item} className="flex items-start gap-3 border-b border-line py-3">
              <Icon name="check" size={18} className="mt-1 shrink-0 text-gold" />
              <span className="type-body">{item}</span>
            </li>
          ))}
        </ul>

        {level.note ? (
          <p className="type-body mt-6 border-l-2 border-gold pl-4 text-ink-70">{level.note}</p>
        ) : null}
      </div>

      <div className="lg:col-span-5">
        <Img {...image} alt={image.alt} sizes={LEVEL_SIZES} className="w-full rounded-xs" />
      </div>
    </div>
  )
}

/**
 * Academics — how a learner moves from Playgroup to Grade 9: the four stages, the eight
 * departments, how teaching works, what the school reports, and the school year.
 */
export default function Academics() {
  const { get } = useSettings()
  const calendarNoteId = useId()

  const curriculum = get('curriculum', school.curriculum)
  const calendarUrl = get('academic_calendar_url')

  const glance = [
    { term: 'Curriculum', detail: curriculum },
    { term: 'Grade range', detail: school.gradeRange },
    { term: 'School year', detail: `${termDates.length} terms` },
  ]

  const tabItems = levels.map((level) => ({
    id: level.id,
    label: (
      <span className="block whitespace-normal py-1">
        <span className="block font-display text-base font-semibold">{level.name}</span>
        <span className="type-meta mt-1 block">{level.ages}</span>
      </span>
    ),
    panel: <LevelPanel level={level} />,
  }))

  return (
    <>
      <SeoHead
        title="Academics"
        description={COPY.metaDescription}
        path="/academics"
        jsonLd={breadcrumbJsonLd(BREADCRUMBS)}
      />

      <PageHeader
        eyebrow="Academics"
        title={COPY.headerTitle}
        lead={COPY.headerLead}
        breadcrumbs={BREADCRUMBS}
        aside={
          <dl className="border-b border-line">
            {glance.map((row) => (
              <div key={row.term} className="border-t border-line py-4">
                <dt className="type-meta uppercase tracking-[0.12em]">{row.term}</dt>
                <dd className="type-body mt-1 text-ink">{row.detail}</dd>
              </div>
            ))}
          </dl>
        }
      />

      {/* ---------------------------------------------------------- the pathway */}
      <Section space="default">
        <div className="grid gap-8 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-5">
            <Eyebrow className="mb-3">The pathway</Eyebrow>
            <h2 className="type-h2">{COPY.pathHeading}</h2>
          </div>
          <div className="md:col-span-7">
            {COPY.pathParagraphs.map((paragraph) => (
              <p key={paragraph} className="type-body mt-0 mb-4 max-w-prose text-ink-70 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <Tabs
          items={tabItems}
          orientation="vertical"
          label="Academic stages"
          className="mt-12 md:mt-16"
          listClassName="md:w-72"
        />
      </Section>

      {/* ---------------------------------------------------------- departments */}
      <Section tone="tint" bordered>
        <SectionHead
          eyebrow="Departments"
          title="Eight subject departments"
          lead="What each department concentrates on."
        />

        <dl className="mt-10 grid border-b border-line md:grid-cols-2 md:gap-x-14">
          {departments.map((department) => (
            <div key={department.name} className="border-t border-line py-5">
              <dt className="type-h4">{department.name}</dt>
              <dd className="type-body mt-1 text-ink-70">{department.description}</dd>
            </div>
          ))}
        </dl>
      </Section>

      {/* ---------------------------------------------------------- how we teach */}
      <Section>
        <div className="grid items-center gap-10 md:grid-cols-12 md:gap-14">
          <div className="md:col-span-5">
            <Img
              {...media.teacherWhiteboard}
              alt={media.teacherWhiteboard.alt}
              sizes={SPLIT_SIZES}
              className="w-full rounded-xs"
            />
          </div>

          <div className="md:col-span-7">
            <Eyebrow className="mb-3">How we teach</Eyebrow>
            <h2 className="type-h2">Taught to mastery, not to the calendar</h2>
            <p className="type-lead mt-5 max-w-2xl">{teachingPhilosophy.statement}</p>

            <ol className="mt-10 border-l border-line">
              {teachingPhilosophy.practices.map((practice, index) => (
                <li key={practice} className="relative py-4 pl-8">
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-4 -translate-x-1/2 bg-paper px-1.5 font-display text-sm font-semibold text-gold"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="type-body">{practice}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Section>

      {/* ---------------------------------------------------------- digital learning */}
      <Section tone="brand">
        <div className="grid items-center gap-10 md:grid-cols-12 md:gap-14">
          <div className="md:col-span-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-400">
              Digital learning
            </p>
            <h2 className="type-h2 mt-3">Screens with a purpose, and a limit</h2>
            <p className="type-lead mt-5 text-paper/80">{digitalLearning}</p>
          </div>

          <div className="md:col-span-6">
            <Img
              {...media.studentsCollaborating}
              alt={media.studentsCollaborating.alt}
              sizes={SPLIT_SIZES}
              className="w-full rounded-xs"
            />
          </div>
        </div>
      </Section>

      {/* ---------------------------------------------------------- results */}
      <Section space="tight">
        <SectionHead eyebrow="Results" title="What the school reports" as="h2" />
        <StatBand
          items={resultsFigures}
          contained={false}
          label="Academic results"
          className="mt-8"
        />
      </Section>

      {/* ---------------------------------------------------------- the school year */}
      <Section tone="tint" bordered>
        <SectionHead eyebrow="The school year" title="Term dates" />

        <div className="table-scroll mt-10">
          <table className="w-full min-w-[26rem] border-collapse text-left">
            <caption className="sr-only">
              Term dates for the Baraka School Kapsabet academic year
            </caption>
            <thead>
              <tr className="border-y border-line">
                <th
                  scope="col"
                  className="type-meta py-3 pr-6 font-semibold uppercase tracking-[0.12em]"
                >
                  Term
                </th>
                <th
                  scope="col"
                  className="type-meta py-3 pr-6 font-semibold uppercase tracking-[0.12em]"
                >
                  Starts
                </th>
                <th
                  scope="col"
                  className="type-meta py-3 font-semibold uppercase tracking-[0.12em]"
                >
                  Ends
                </th>
              </tr>
            </thead>
            <tbody>
              {termDates.map((term) => (
                <tr key={term.term} className="border-b border-line">
                  <th scope="row" className="type-h4 py-4 pr-6 font-semibold">
                    {term.term}
                  </th>
                  <td className="type-body py-4 pr-6 text-ink-70">{term.start}</td>
                  <td className="type-body py-4 text-ink-70">{term.end}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10 border border-line bg-paper p-6 md:flex md:items-center md:justify-between md:gap-10">
          <div className="max-w-xl">
            <h3 className="type-h4">{COPY.calendarHeading}</h3>
            <p id={calendarNoteId} className="type-body mt-2 text-ink-70">
              {calendarUrl ? COPY.calendarAvailable : DOWNLOADS_PENDING.note}
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-3 md:mt-0 md:shrink-0">
            {calendarUrl ? (
              <Button
                href={calendarUrl}
                variant="secondary"
                iconRight={<Icon name="download" size={18} />}
              >
                Download the calendar
              </Button>
            ) : (
              <Button
                variant="secondary"
                disabled
                aria-describedby={calendarNoteId}
                iconRight={<Icon name="download" size={18} />}
              >
                Download the calendar
              </Button>
            )}
            <Button to="/contact" variant="ghost" iconRight={<Icon name="arrow-right" size={18} />}>
              Ask the school
            </Button>
          </div>
        </div>
      </Section>
    </>
  )
}
