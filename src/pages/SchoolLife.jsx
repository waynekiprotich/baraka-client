import { SeoHead } from '@/components/SeoHead'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Icon } from '@/components/ui/Icon'
import { Img } from '@/components/ui/Img'
import { PageHeader } from '@/components/ui/PageHeader'
import { Reveal } from '@/components/ui/Reveal'
import { Section } from '@/components/ui/Section'
import { SectionHead } from '@/components/ui/SectionHead'
import { Tabs } from '@/components/ui/Tabs'
import { media, strip } from '@/content/media'
import { arts, clubs, levels, pendingItems, school, sports, studentVoices } from '@/content/site'
import { breadcrumbJsonLd } from '@/lib/seo'

/* Breadcrumbs render from `{label, to}`; the JSON-LD builder wants `{name, path}`. */
const BREADCRUMBS = [{ label: 'School life', to: '/school-life' }]
const BREADCRUMB_TRAIL = [{ name: 'School life', path: '/school-life' }]

/** The Early Years entry, kept in `content/site.js` alongside the other academic levels. */
const earlyYears = levels.find((level) => level.id === 'early-years')

/**
 * Media the school has not produced yet. Rendered as honest, disabled states rather than
 * invented links (SPEC §2). The notes come straight from `pendingItems` — never rewritten
 * into a promise the school has not made.
 */
const UNAVAILABLE_MEDIA = pendingItems.filter(
  (item) => item.id === 'video' || item.id === 'virtual-tour',
)

/**
 * One activity band — sport, clubs or the arts. An image beside a hairline-divided list;
 * the list carries the school's own wording for each activity.
 *
 * @param {object} props
 * @param {{src: string, srcSet: string, alt: string, aspect: string}} props.image
 * @param {string} props.heading
 * @param {string} [props.note] an honest caveat, e.g. why only six clubs are listed
 * @param {Array<{name: string, detail?: string}>} props.items
 * @param {boolean} [props.twoColumn] name-only lists read better in two columns
 */
function ActivityPanel({ image, heading, note, items, twoColumn = false }) {
  return (
    <div className="grid gap-10 md:grid-cols-12 md:gap-12">
      <div className="md:col-span-5">
        <Img
          {...image}
          alt={image.alt}
          sizes="(min-width: 768px) 40vw, 100vw"
          className="rounded-xs"
        />
      </div>

      <div className="md:col-span-7">
        <h3 className="type-h3">{heading}</h3>
        {note ? <p className="type-small mt-3 max-w-prose text-ink-50">{note}</p> : null}

        <ul
          className={`mt-8 border-t border-line ${twoColumn ? 'sm:grid sm:grid-cols-2 sm:gap-x-10' : ''}`}
        >
          {items.map((item) => (
            <li key={item.name} className="border-b border-line py-4">
              <h4 className="type-h4">{item.name}</h4>
              {item.detail ? <p className="type-small mt-1 text-ink-70">{item.detail}</p> : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

const ACTIVITY_TABS = [
  {
    id: 'sport',
    label: 'Sport',
    panel: (
      <ActivityPanel
        image={media.athleticsStart}
        heading="On the field and the track"
        items={sports}
      />
    ),
  },
  {
    id: 'clubs',
    label: 'Clubs',
    panel: (
      <ActivityPanel
        image={media.studentsCollaborating}
        heading="After the bell"
        note="The school counts twelve clubs in all; these six are the ones it names."
        items={clubs}
        twoColumn
      />
    ),
  },
  {
    id: 'arts',
    label: 'Arts',
    panel: <ActivityPanel image={media.craftMaterials} heading="Studio, stage and choir" items={arts} />,
  },
]

/**
 * School Life — what a child's day actually feels like: the early years, sport, clubs and
 * the arts, the campus in photographs, and three learners in their own words.
 */
export default function SchoolLife() {
  return (
    <>
      <SeoHead
        title="School life"
        description="Play-based early years, four sports, six named clubs, music, drama and an open art studio at Baraka School Kapsabet."
        path="/school-life"
        jsonLd={breadcrumbJsonLd(BREADCRUMB_TRAIL)}
      />

      <PageHeader
        eyebrow="School life"
        title="What happens between the lessons"
        lead="A day here is not only timetabled learning. It is a morning on the track, an afternoon in the art studio, and the long stretch in between where children work out who they are."
        breadcrumbs={BREADCRUMBS}
      />

      {/* ---------------------------------------------------------- early years */}

      <Section id="early-years" space="tight" aria-labelledby="early-years-heading">
        <div className="grid items-center gap-10 md:grid-cols-12 md:gap-14">
          <div className="md:col-span-7">
            <Img
              {...media.earlyYearsTable}
              alt={media.earlyYearsTable.alt}
              sizes="(min-width: 768px) 55vw, 100vw"
              className="rounded-xs"
            />
          </div>

          <div className="md:col-span-5">
            <Eyebrow className="mb-3">Early years</Eyebrow>
            <h2 id="early-years-heading" className="type-h2">
              The first years are spent at play
            </h2>
            <p className="type-meta mt-4">{earlyYears.ages}</p>
            <p className="type-body mt-5 text-ink-70">{earlyYears.summary}</p>
            <p className="type-body mt-4 text-ink-70">
              Social confidence and motor skills come first here, well before a pencil is asked
              to sit correctly in a hand.
            </p>

            <ul className="mt-8 border-t border-line">
              {earlyYears.focus.map((area) => (
                <li key={area} className="flex items-center gap-3 border-b border-line py-3">
                  <Icon name="check" size={18} className="shrink-0 text-gold" />
                  <span className="type-small">{area}</span>
                </li>
              ))}
            </ul>

            <p className="mt-8">
              <Button
                variant="ghost"
                size="sm"
                to="/academics"
                className="-ml-3.5"
                iconRight={<Icon name="arrow-right" size={18} />}
              >
                How the early years feed into CBC
              </Button>
            </p>
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------- running heartland band */}

      <Section space="flush" container={false} aria-labelledby="running-heading">
        <div className="relative isolate">
          <div className="aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9]">
            <Img
              {...media.runnersDawn}
              alt={media.runnersDawn.alt}
              aspect="auto"
              sizes="100vw"
              className="h-full"
            />
          </div>
          <div aria-hidden="true" className="scrim absolute inset-0" />
          <div className="absolute inset-0 flex items-end">
            <Container className="pb-10 md:pb-16">
              <Eyebrow className="mb-4 text-gold-400">Kapsabet</Eyebrow>
              <h2 id="running-heading" className="type-h2 max-w-3xl text-balance text-paper">
                {school.runningHeartland}
              </h2>
            </Container>
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------- activities */}

      <Section id="activities" tone="tint">
        <SectionHead
          eyebrow="Sport, clubs & the arts"
          title="Three afternoons, three different children"
          lead="These are the activities the school runs alongside the timetable."
        />

        <Tabs items={ACTIVITY_TABS} label="Sport, clubs and the arts" className="mt-12" />
      </Section>

      {/* ------------------------------------------------------------ photo strip */}

      <Section>
        <SectionHead
          eyebrow="Around the school"
          title="A term, in passing"
          action={
            <Button
              variant="secondary"
              to="/gallery"
              iconRight={<Icon name="arrow-right" size={18} />}
            >
              See the gallery
            </Button>
          }
        />

        <Reveal className="mt-10">
          <ul className="scroll-strip -mx-5 px-5 pb-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            {strip.map((photo) => (
              <li key={photo.src} className="w-[78vw] max-w-[420px] sm:w-[320px] lg:w-[380px]">
                <Img
                  {...photo}
                  alt={photo.alt}
                  sizes="(min-width: 1024px) 380px, (min-width: 640px) 320px, 78vw"
                  className="rounded-xs"
                />
              </li>
            ))}
          </ul>
        </Reveal>

        <div className="mt-12 border-t border-line pt-8">
          <h3 className="type-h4">Not published yet</h3>
          <ul className="mt-4 max-w-3xl">
            {UNAVAILABLE_MEDIA.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-4 border-b border-line py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="type-small font-medium">{item.label}</p>
                  <p className="type-meta mt-1">{item.note}</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled
                  className="shrink-0 self-start sm:self-auto"
                  iconLeft={<Icon name={item.id === 'video' ? 'play' : 'compass'} size={18} />}
                >
                  Unavailable
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* --------------------------------------------------------- student voices */}

      <Section tone="tint">
        <SectionHead eyebrow="Student voices" title="In their own words" />

        <div className="mt-12 border-t border-line">
          {studentVoices.map((voice) => (
            <figure
              key={voice.name}
              className="grid gap-4 border-b border-line py-10 md:grid-cols-12 md:gap-10"
            >
              <figcaption className="md:col-span-3">
                <span className="type-h4 block">{voice.name}</span>
                <span className="type-meta">{voice.grade}</span>
              </figcaption>
              <blockquote className="type-quote md:col-span-9">
                <p>“{voice.quote}”</p>
              </blockquote>
            </figure>
          ))}
        </div>
      </Section>

      {/* -------------------------------------------------------------------- cta */}

      <Section tone="brand" space="tight" aria-labelledby="visit-heading">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow className="mb-4 text-gold-400">Come and see</Eyebrow>
          <h2 id="visit-heading" className="type-h2 text-paper">
            The photographs only get you so far
          </h2>
          <p className="mt-4 text-paper/80">
            Look through the full gallery, or start an application for the next intake.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button variant="gold" to="/admissions#apply">
              Apply to Baraka
            </Button>
            <Button variant="inverse" to="/gallery">
              Browse the gallery
            </Button>
          </div>
        </div>
      </Section>
    </>
  )
}
