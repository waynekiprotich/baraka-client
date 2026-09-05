import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { SeoHead } from '@/components/SeoHead'
import { Accordion } from '@/components/ui/Accordion'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Field, Honeypot } from '@/components/ui/Field'
import { Icon } from '@/components/ui/Icon'
import { Img } from '@/components/ui/Img'
import { PageHeader } from '@/components/ui/PageHeader'
import { Section } from '@/components/ui/Section'
import { SectionHead } from '@/components/ui/SectionHead'
import { Spinner } from '@/components/ui/Spinner'
import { media } from '@/content/media'
import {
  admissionsRequirements,
  admissionsSteps,
  faqs,
  fees,
  gradeOptions,
  intakeYear,
  leadership,
  school,
} from '@/content/site'
import { ApiError, postEnquiry } from '@/lib/api'
import { cn } from '@/lib/cn'
import { formatDate, formatKes, mailtoHref } from '@/lib/format'
import { breadcrumbJsonLd } from '@/lib/seo'
import { useSettings } from '@/lib/settings'

/* ------------------------------------------------------------------ page copy */

const BREADCRUMBS = [{ label: 'Admissions', to: '/admissions' }]
const BREADCRUMB_TRAIL = [{ name: 'Admissions', path: '/admissions' }]

/** Copy owned by this page. Nothing here states a fact the school has not supplied. */
const COPY = {
  processEyebrow: 'How to apply',
  processTitle: 'From first enquiry to a confirmed place',
  processLead:
    'Three steps, in order. You only need the first one to get started — the admissions office guides you through the rest.',
  requirementsEyebrow: 'What to bring',
  requirementsTitle: 'Documents for the application',
  requirementsLead:
    'Have these ready for the assessment visit. Nothing needs to be certified, and copies are fine.',
  feesEyebrow: 'Fees',
  feesTitle: 'Indicative termly fees',
  documentsTitle: 'Documents to download',
  documentsNote:
    'These are not published on the site yet. Ask for them in your enquiry below and the admissions office will email them to you.',
  faqEyebrow: 'Questions',
  faqTitle: 'Before you apply',
  faqAside:
    'Something not covered here? Ask it in the enquiry form and the admissions office will answer directly.',
  applyEyebrow: 'Enquire',
  applyTitle: 'Send an admissions enquiry',
  applyLead:
    'Tell us about your child and what you would like to know. Your message goes straight to the admissions office.',
}

/** The founding director's quote from content/site.js, used once for the reassurance band. */
const DIRECTOR = leadership[0]

const MESSAGE_MAX = 4000
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_RE = /^[0-9+()\-.\s]{7,40}$/

/* ------------------------------------------------------------------ form model */

const EMPTY_FORM = {
  learnerName: '',
  dob: '',
  grade: '',
  parentName: '',
  phone: '',
  email: '',
  message: '',
  website: '',
}

/**
 * DOM ids, so a failed submit can move focus to the first field that needs attention.
 * Keys match the `EMPTY_FORM` shape and the order is the visual order of the form.
 */
const FIELD_IDS = {
  learnerName: 'apply-learner-name',
  dob: 'apply-learner-dob',
  grade: 'apply-grade',
  parentName: 'apply-parent-name',
  phone: 'apply-phone',
  email: 'apply-email',
  message: 'apply-message',
}
const FIELD_ORDER = Object.keys(FIELD_IDS)

/**
 * Server field names → our form field names. `POST /api/v1/enquiries` answers a
 * VALIDATION_ERROR with a flat `{ field: message }` map keyed by its own names, and every one
 * of them has to land on the control the parent can actually fix. `subject` is derived from
 * the chosen grade, so it surfaces there.
 */
const SERVER_FIELDS = {
  learner_name: 'learnerName',
  grade_applying: 'grade',
  subject: 'grade',
  name: 'parentName',
  phone: 'phone',
  email: 'email',
  message: 'message',
}

/**
 * Client-side validation. Mirrors the server's rules (name 2–120, a real email, the phone
 * charset it accepts, message required) so a parent is told what is wrong before a round trip.
 *
 * @param {typeof EMPTY_FORM} values
 * @returns {Object<string, string>} field name → message, empty when the form is valid
 */
function validate(values) {
  const errors = {}
  const learnerName = values.learnerName.trim()
  const parentName = values.parentName.trim()
  const phone = values.phone.trim()
  const email = values.email.trim()
  const message = values.message.trim()

  if (!learnerName) errors.learnerName = 'Enter the learner’s full name.'
  else if (learnerName.length < 2) errors.learnerName = 'Enter at least two characters.'

  if (!values.dob) {
    errors.dob = 'Enter the learner’s date of birth.'
  } else {
    const dob = new Date(`${values.dob}T00:00:00`)
    if (Number.isNaN(dob.getTime())) errors.dob = 'Enter a valid date.'
    else if (dob.getTime() > Date.now()) errors.dob = 'The date of birth cannot be in the future.'
  }

  if (!values.grade) errors.grade = 'Choose the grade you are applying for.'

  if (!parentName) errors.parentName = 'Enter your full name.'
  else if (parentName.length < 2) errors.parentName = 'Enter at least two characters.'

  const digits = (phone.match(/\d/g) || []).length
  if (!phone) errors.phone = 'Enter a phone number we can reach you on.'
  else if (!PHONE_RE.test(phone) || digits < 7)
    errors.phone = 'Enter a valid phone number, for example +254 712 345 678.'

  if (!email) errors.email = 'Enter an email address.'
  else if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email address.'

  if (!message) errors.message = 'Tell us what you would like to know.'
  else if (message.length > MESSAGE_MAX)
    errors.message = `Please keep this under ${MESSAGE_MAX} characters.`

  return errors
}

/* ------------------------------------------------------------------ page */

/**
 * Admissions — the conversion page.
 *
 * Anchors this page must keep (SPEC §4): `#process` `#fees` `#faq` `#apply`.
 *
 * Everything factual comes from `content/site.js` or from `useSettings()`. The application
 * form and fee structure PDFs are CMS settings that are deliberately empty, so they render a
 * disabled state with a route to a real answer — never a dead link (SPEC §2).
 */
export default function Admissions() {
  const { get } = useSettings()
  const intake = intakeYear
  const admissionsEmail = get('admissions_email', 'admissions@barakaschoolkapsabet.ac.ke')
  const openText = get(
    'admissions_open_text',
    `Places are open for Playgroup through Grade 9 for the ${intake} intake.`,
  )
  const curriculum = get('curriculum', school.curriculum)
  const applicationFormUrl = get('application_form_url', '')
  const feeStructureUrl = get('fee_structure_url', '')

  const documents = [
    {
      id: 'application-form',
      label: 'Application form',
      description: 'The form to complete and bring to the assessment visit.',
      url: applicationFormUrl,
    },
    {
      id: 'fee-structure',
      label: 'Full fee structure',
      description: 'The itemised termly structure, shared in full at offer stage.',
      url: feeStructureUrl,
    },
  ]

  const facts = [
    { term: 'Intake', detail: `${intake} academic year` },
    { term: 'Grades', detail: school.gradeRange },
    { term: 'Curriculum', detail: curriculum },
  ]

  return (
    <>
      <SeoHead
        title="Admissions"
        description={`${openText} Enquire online, attend a short placement assessment, and confirm the place.`}
        path="/admissions"
        jsonLd={breadcrumbJsonLd(BREADCRUMB_TRAIL)}
      />

      <PageHeader
        eyebrow="Admissions"
        title={`Places open for the ${intake} intake`}
        lead={openText}
        breadcrumbs={BREADCRUMBS}
        aside={
          <dl className="border-t border-line">
            {facts.map((fact) => (
              <div
                key={fact.term}
                className="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-b border-line py-4"
              >
                <dt className="w-24 shrink-0 text-sm font-medium text-ink-50">{fact.term}</dt>
                <dd className="type-body m-0 flex-1 text-ink">{fact.detail}</dd>
              </div>
            ))}
          </dl>
        }
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="gold"
            size="lg"
            href="#apply"
            iconRight={<Icon name="arrow-right" size={18} />}
          >
            Start an enquiry
          </Button>
          <Button variant="secondary" size="lg" href="#fees">
            See the fees
          </Button>
        </div>
      </PageHeader>

      {/* ---------------------------------------------------------- #process */}

      <Section id="process">
        <div className="grid gap-8 md:grid-cols-12 md:gap-14">
          <div className="md:col-span-5">
            <SectionHead eyebrow={COPY.processEyebrow} title={COPY.processTitle} />
          </div>
          <p className="type-lead md:col-span-7 md:self-end">{COPY.processLead}</p>
        </div>

        <ol className="relative mt-14 md:mt-16">
          {/* The connecting rule that runs through the step markers. */}
          <span
            aria-hidden="true"
            className="absolute top-6 bottom-6 left-[1.375rem] w-px bg-line"
          />

          {admissionsSteps.map((step, index) => (
            <li
              key={step.step}
              className={cn(
                'relative grid grid-cols-[2.75rem_1fr] gap-x-5 sm:gap-x-8',
                index === admissionsSteps.length - 1 ? 'pb-0' : 'pb-10 md:pb-12',
              )}
            >
              <span
                aria-hidden="true"
                className="flex h-11 w-11 items-center justify-center rounded-xs border border-line bg-paper font-display text-lg text-brand"
              >
                {step.step}
              </span>
              <div className="pt-1.5">
                <h3 className="type-h3">
                  <span className="sr-only">{`Step ${step.step}: `}</span>
                  {step.title}
                </h3>
                <p className="type-body mt-3 max-w-xl text-ink-70">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>

        <p className="type-small mt-12 border-t border-line pt-6 text-ink-70">
          Step one takes about two minutes —{' '}
          <a href="#apply" className="link-underline text-ink">
            send your enquiry from this page
          </a>
          .
        </p>
      </Section>

      {/* ---------------------------------------------------- requirements */}

      <Section tone="tint">
        <div className="grid items-center gap-10 md:grid-cols-12 md:gap-14">
          <div className="md:col-span-5">
            <Img
              {...media.deskStillLife}
              alt={media.deskStillLife.alt}
              sizes="(min-width: 768px) 40vw, 100vw"
              className="rounded-xs"
            />
          </div>

          <div className="min-w-0 md:col-span-7">
            <SectionHead
              eyebrow={COPY.requirementsEyebrow}
              title={COPY.requirementsTitle}
              lead={COPY.requirementsLead}
            />

            <ul className="mt-10 border-t border-line">
              {admissionsRequirements.map((item) => (
                <li key={item} className="flex items-start gap-3 border-b border-line py-4">
                  <Icon name="check" size={20} className="mt-0.5 shrink-0 text-gold" />
                  <span className="type-body text-ink">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------ #fees */}

      <Section id="fees">
        <SectionHead eyebrow={COPY.feesEyebrow} title={COPY.feesTitle} lead={fees.note} />

        <p className="type-meta mt-8 flex items-center gap-2 md:hidden">
          <Icon name="arrow-right" size={16} aria-hidden="true" />
          Scroll the table sideways to see every column.
        </p>

        <div className="table-scroll mt-4 md:mt-10">
          <table className="w-full min-w-[38rem] border-collapse text-left">
            <caption className="sr-only">
              {`${fees.note} Columns: ${fees.columns.join(', ')}.`}
            </caption>
            <thead>
              <tr>
                {fees.columns.map((column, index) => (
                  <th
                    key={column}
                    scope="col"
                    className={cn(
                      'border-y border-line py-4 text-sm font-semibold text-ink',
                      index === 0 ? 'pr-6' : 'px-6',
                    )}
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fees.rows.map((row) => (
                <tr key={row.level}>
                  <th
                    scope="row"
                    className="border-b border-line py-5 pr-6 text-base font-medium text-ink"
                  >
                    {row.level}
                  </th>
                  <td className="border-b border-line px-6 py-5 text-base text-ink-70">
                    {formatKes(row.tuition)}
                  </td>
                  <td className="border-b border-line px-6 py-5 text-base text-ink-70">
                    {formatKes(row.meals)}
                  </td>
                  <td className="border-b border-line px-6 py-5 text-base text-ink-70">
                    {`from ${formatKes(row.transport)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Downloads — honest state for the two PDFs the school has not supplied. */}
        <div className="mt-16 border-t border-line pt-10">
          <h3 className="type-h4">{COPY.documentsTitle}</h3>

          <ul className="mt-6 border-t border-line">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="grid gap-4 border-b border-line py-6 md:grid-cols-12 md:items-center md:gap-8"
              >
                <div className="md:col-span-8">
                  <p className="type-body font-medium text-ink">{doc.label}</p>
                  <p id={`${doc.id}-note`} className="type-small mt-1 text-ink-70">
                    {doc.url ? doc.description : `${doc.description} Not yet available to download.`}
                  </p>
                </div>
                <div className="md:col-span-4 md:justify-self-end">
                  {doc.url ? (
                    <Button
                      variant="secondary"
                      href={doc.url}
                      iconLeft={<Icon name="download" size={18} />}
                    >
                      {`Download the ${doc.label.toLowerCase()}`}
                    </Button>
                  ) : (
                    <Button variant="secondary" disabled aria-describedby={`${doc.id}-note`}>
                      Not yet available
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <p className="type-small mt-6 max-w-2xl text-ink-70">
            {COPY.documentsNote}{' '}
            <a href="#apply" className="link-underline text-ink">
              Ask for them below
            </a>
            , or email{' '}
            <a href={mailtoHref(admissionsEmail)} className="link-underline text-ink">
              {admissionsEmail}
            </a>
            .
          </p>
        </div>
      </Section>

      {/* ------------------------------------------------------------- #faq */}

      <Section id="faq" tone="tint">
        <div className="grid gap-10 md:grid-cols-12 md:gap-14">
          <div className="md:col-span-4">
            <SectionHead eyebrow={COPY.faqEyebrow} title={COPY.faqTitle} />
            <p className="type-small mt-6 text-ink-70">{COPY.faqAside}</p>
          </div>
          <div className="md:col-span-8">
            <Accordion items={faqs} defaultOpen={faqs[0].id} />
          </div>
        </div>
      </Section>

      {/* ------------------------------------------- reassurance image band */}

      <section aria-label={`A word from the ${DIRECTOR.role}`} className="relative bg-ink">
        <div className="relative h-[26rem] md:h-[30rem] lg:h-[34rem]">
          <Img
            {...media.campusBuilding}
            alt={media.campusBuilding.alt}
            sizes="100vw"
            className="absolute inset-0 h-full w-full"
            style={{ aspectRatio: 'auto' }}
          />
          <div aria-hidden="true" className="scrim absolute inset-0" />
          <div className="absolute inset-0 flex items-end">
            <Container className="pb-12 md:pb-16">
              <blockquote className="max-w-3xl">
                <p className="type-quote text-paper">{`“${DIRECTOR.quote}”`}</p>
                <footer className="type-small mt-6 text-paper/80">
                  {`${DIRECTOR.name} — ${DIRECTOR.role}`}
                </footer>
              </blockquote>
            </Container>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- #apply */}

      <EnquirySection admissionsEmail={admissionsEmail} intake={intake} />
    </>
  )
}

/* ------------------------------------------------------------------ #apply */

/**
 * The enquiry band: a left rail with the alternatives to the form, and the form itself.
 *
 * @param {object} props
 * @param {string} props.admissionsEmail  from the `admissions_email` setting
 * @param {string} props.intake           the intake year, used in the enquiry subject line
 */
function EnquirySection({ admissionsEmail, intake }) {
  return (
    <Section id="apply" bordered>
      <div className="grid gap-12 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-5">
          <SectionHead
            eyebrow={COPY.applyEyebrow}
            title={COPY.applyTitle}
            lead={COPY.applyLead}
          />

          <div className="mt-10 border-t border-line pt-6">
            <h3 className="type-h4">Rather not use a form?</h3>
            <ul className="mt-5 flex flex-col gap-4">
              <li className="flex items-start gap-3">
                <Icon name="mail" size={20} className="mt-0.5 shrink-0 text-ink-50" />
                <a
                  href={mailtoHref(admissionsEmail)}
                  className="link-underline type-body text-ink"
                >
                  {admissionsEmail}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Icon name="pin" size={20} className="mt-0.5 shrink-0 text-ink-50" />
                <span className="type-body text-ink-70">
                  Contact details and directions are on the{' '}
                  <Link to="/contact" className="link-underline text-ink">
                    contact page
                  </Link>
                  .
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="min-w-0 md:col-span-7">
          <EnquiryForm intake={intake} admissionsEmail={admissionsEmail} />
        </div>
      </div>
    </Section>
  )
}

/**
 * The admissions enquiry form.
 *
 * Posts to `POST /api/v1/enquiries` through `postEnquiry()` with `source: 'admissions'`. The
 * endpoint has no date-of-birth field, so the learner's date of birth is written into the
 * message the admissions office reads rather than being silently dropped.
 *
 * @param {object} props
 * @param {string} props.intake
 * @param {string} props.admissionsEmail
 */
function EnquiryForm({ intake, admissionsEmail }) {
  const [values, setValues] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  /** 'idle' | 'submitting' | 'success' | 'error' */
  const [status, setStatus] = useState('idle')
  const [failure, setFailure] = useState(null)

  const successRef = useRef(null)
  const alertRef = useRef(null)

  const submitting = status === 'submitting'
  const today = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    if (status === 'success' && successRef.current) successRef.current.focus()
    if (status === 'error' && alertRef.current) alertRef.current.focus()
  }, [status])

  const setValue = useCallback((key, value) => {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => {
      if (!current[key]) return current
      const next = { ...current }
      delete next[key]
      return next
    })
  }, [])

  const focusFirstError = useCallback((nextErrors) => {
    const first = FIELD_ORDER.find((key) => nextErrors[key])
    if (!first) return
    const element = document.getElementById(FIELD_IDS[first])
    if (element) element.focus()
  }, [])

  const submit = useCallback(async () => {
    const nextErrors = validate(values)
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      setStatus('idle')
      setFailure(null)
      focusFirstError(nextErrors)
      return
    }

    setErrors({})
    setFailure(null)
    setStatus('submitting')

    const dobLine = `Learner date of birth: ${formatDate(values.dob) || values.dob}`

    try {
      await postEnquiry({
        name: values.parentName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        subject: `Admissions enquiry — ${values.grade} (${intake} intake)`,
        message: `${values.message.trim()}\n\n${dobLine}`,
        learner_name: values.learnerName.trim(),
        grade_applying: values.grade,
        source: 'admissions',
        website: values.website,
      })
      setStatus('success')
    } catch (error) {
      const code = error instanceof ApiError ? error.code : 'INTERNAL_ERROR'

      if (code === 'VALIDATION_ERROR' && error.fields) {
        const mapped = {}
        let unmapped = false
        for (const [serverField, message] of Object.entries(error.fields)) {
          const local = SERVER_FIELDS[serverField]
          if (local) mapped[local] = message
          else unmapped = true
        }
        if (Object.keys(mapped).length) {
          setErrors(mapped)
          setStatus('idle')
          setFailure(unmapped ? { code } : null)
          focusFirstError(mapped)
          return
        }
      }

      setFailure({ code, reference: error instanceof ApiError ? error.reference : null })
      setStatus('error')
    }
  }, [values, intake, focusFirstError])

  const handleSubmit = (event) => {
    event.preventDefault()
    if (submitting) return
    submit()
  }

  const reset = () => {
    setValues(EMPTY_FORM)
    setErrors({})
    setFailure(null)
    setStatus('idle')
  }

  if (status === 'success') {
    return (
      <div className="border border-line bg-paper-2 p-6 md:p-8">
        <div className="flex items-start gap-3">
          <Icon name="check" size={24} className="mt-1 shrink-0 text-success" />
          <div>
            <h3 ref={successRef} tabIndex={-1} className="type-h3 outline-none">
              Your enquiry is with the admissions office
            </h3>
            <p className="type-body mt-4 text-ink-70">
              Thank you. We have your details for{' '}
              <span className="text-ink">{values.learnerName.trim()}</span> and the{' '}
              <span className="text-ink">{values.grade}</span> place you asked about.
            </p>
          </div>
        </div>

        <h4 className="type-h4 mt-10">What happens next</h4>
        <ol className="mt-5 border-t border-line">
          <li className="border-b border-line py-4">
            <p className="type-body text-ink-70">
              The admissions office replies by email or phone using the details you gave.
            </p>
          </li>
          <li className="border-b border-line py-4">
            <p className="type-body text-ink-70">
              {admissionsSteps[1].detail}
            </p>
          </li>
          <li className="border-b border-line py-4">
            <p className="type-body text-ink-70">{admissionsSteps[2].detail}</p>
          </li>
        </ol>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button variant="secondary" onClick={reset}>
            Send another enquiry
          </Button>
          <p className="type-small text-ink-70">
            Need to add something? Email{' '}
            <a href={mailtoHref(admissionsEmail)} className="link-underline text-ink">
              {admissionsEmail}
            </a>
            .
          </p>
        </div>
      </div>
    )
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      aria-label="Admissions enquiry"
      aria-busy={submitting}
      className={cn(
        'border border-line bg-paper-2 p-6 transition-opacity duration-150 ease-editorial md:p-8',
        submitting && 'opacity-70',
      )}
    >
      {failure ? (
        <SubmitFailure
          ref={alertRef}
          code={failure.code}
          reference={failure.reference}
          admissionsEmail={admissionsEmail}
          onRetry={submit}
          disabled={submitting}
        />
      ) : null}

      <fieldset className="m-0 border-0 p-0">
        <legend className="type-h4">About the learner</legend>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field
            label="Learner’s full name"
            name="learner_name"
            id={FIELD_IDS.learnerName}
            required
            maxLength={120}
            autoComplete="off"
            value={values.learnerName}
            error={errors.learnerName}
            disabled={submitting}
            onChange={(event) => setValue('learnerName', event.target.value)}
          />

          <Field
            label="Date of birth"
            name="learner_dob"
            id={FIELD_IDS.dob}
            type="date"
            required
            max={today}
            hint="Used to confirm the right entry point."
            value={values.dob}
            error={errors.dob}
            disabled={submitting}
            onChange={(event) => setValue('dob', event.target.value)}
          />

          <Field
            label="Grade applying for"
            name="grade_applying"
            id={FIELD_IDS.grade}
            as="select"
            required
            className="sm:col-span-2"
            value={values.grade}
            error={errors.grade}
            disabled={submitting}
            onChange={(event) => setValue('grade', event.target.value)}
          >
            <option value="">Select a grade</option>
            {gradeOptions.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </Field>
        </div>
      </fieldset>

      <fieldset className="m-0 mt-10 border-0 border-t border-line p-0 pt-8">
        <legend className="type-h4">About you</legend>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field
            label="Parent or guardian name"
            name="name"
            id={FIELD_IDS.parentName}
            required
            maxLength={120}
            autoComplete="name"
            value={values.parentName}
            error={errors.parentName}
            disabled={submitting}
            onChange={(event) => setValue('parentName', event.target.value)}
          />

          <Field
            label="Phone number"
            name="phone"
            id={FIELD_IDS.phone}
            type="tel"
            required
            maxLength={40}
            inputMode="tel"
            autoComplete="tel"
            value={values.phone}
            error={errors.phone}
            disabled={submitting}
            onChange={(event) => setValue('phone', event.target.value)}
          />

          <Field
            label="Email address"
            name="email"
            id={FIELD_IDS.email}
            type="email"
            required
            maxLength={255}
            inputMode="email"
            autoComplete="email"
            className="sm:col-span-2"
            value={values.email}
            error={errors.email}
            disabled={submitting}
            onChange={(event) => setValue('email', event.target.value)}
          />

          <Field
            label="Your message"
            name="message"
            id={FIELD_IDS.message}
            as="textarea"
            rows={5}
            required
            maxLength={MESSAGE_MAX}
            className="sm:col-span-2"
            hint="Anything you would like us to know, or ask for the application form and fee structure."
            value={values.message}
            error={errors.message}
            disabled={submitting}
            onChange={(event) => setValue('message', event.target.value)}
          />
        </div>
      </fieldset>

      <Honeypot value={values.website} onChange={(value) => setValue('website', value)} />

      <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-line pt-6">
        <Button
          type="submit"
          variant="gold"
          size="lg"
          disabled={submitting}
          iconLeft={submitting ? <Spinner size={18} label={null} /> : null}
        >
          {submitting ? 'Sending your enquiry' : 'Send enquiry'}
        </Button>
        <p className="type-meta">Fields marked required must be filled in.</p>
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {submitting ? 'Sending your enquiry.' : ''}
      </p>
    </form>
  )
}

/**
 * The submit-failure alert. Copy is chosen from the `ApiError.code`, never from its message
 * text, and rate limiting gets its own wording because waiting — not retrying — is the fix.
 *
 * @param {object} props
 * @param {string} props.code             ApiError code
 * @param {string|null} [props.reference] server reference id, present on a 500
 * @param {string} props.admissionsEmail
 * @param {() => void} props.onRetry
 * @param {boolean} [props.disabled]
 * @param {React.Ref<HTMLDivElement>} [props.ref]
 */
function SubmitFailure({ ref, code, reference, admissionsEmail, onRetry, disabled }) {
  let heading = 'Your enquiry did not send'
  let body = 'Something went wrong at our end. Nothing was lost — your answers are still here.'
  let retryable = true

  if (code === 'RATE_LIMITED') {
    heading = 'Too many enquiries just now'
    body =
      'Several enquiries have already been sent from this connection. Please wait a few minutes and try again — or email the admissions office and we will pick it up straight away.'
    retryable = false
  } else if (code === 'NETWORK_ERROR') {
    heading = 'We could not reach the school’s server'
    body = 'Check your connection and try again. Your answers are still here.'
  } else if (code === 'VALIDATION_ERROR') {
    heading = 'Some details need a second look'
    body = 'The admissions office could not accept the form as filled in. Please check your answers and try again.'
  }

  return (
    <div
      ref={ref}
      role="alert"
      tabIndex={-1}
      className="mb-8 border border-danger/40 bg-paper p-5 outline-none"
    >
      <div className="flex items-start gap-3">
        <Icon name="alert" size={20} className="mt-0.5 shrink-0 text-danger" />
        <div>
          <h3 className="type-h4 text-ink">{heading}</h3>
          <p className="type-small mt-2 text-ink-70">{body}</p>

          {reference ? (
            <p className="type-meta mt-2">
              Reference: <span className="font-mono">{reference}</span>
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            {retryable ? (
              <Button variant="secondary" size="sm" onClick={onRetry} disabled={disabled}>
                Try again
              </Button>
            ) : null}
            <p className="type-small text-ink-70">
              <a href={mailtoHref(admissionsEmail)} className="link-underline text-ink">
                {admissionsEmail}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
