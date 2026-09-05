import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { SeoHead } from '@/components/SeoHead'
import { Accordion } from '@/components/ui/Accordion'
import { Button } from '@/components/ui/Button'
import { Field, Honeypot } from '@/components/ui/Field'
import { Icon } from '@/components/ui/Icon'
import { Img } from '@/components/ui/Img'
import { PageHeader } from '@/components/ui/PageHeader'
import { Section } from '@/components/ui/Section'
import { SectionHead } from '@/components/ui/SectionHead'
import { faqs } from '@/content/site'
import { media } from '@/content/media'
import { ApiError, postEnquiry } from '@/lib/api'
import { mailtoHref, telHref } from '@/lib/format'
import { breadcrumbJsonLd } from '@/lib/seo'
import { useSettings } from '@/lib/settings'

const BREADCRUMBS = [{ label: 'Contact', to: '/contact' }]

/* ------------------------------------------------------------------ copy */

/**
 * Page copy. Everything factual — the number, the addresses, the office hours — comes from
 * `useSettings()`; only the connective prose lives here (SPEC §4).
 */
const COPY = {
  lead: 'The school office answers enquiries from parents, prospective families and the wider community. Write to us below, or use whichever of the details on this page suits you best.',
  reachIntro:
    'One office handles everything: admissions, visits, transport routes and general questions. If you are not sure who to ask for, ask for the office.',
  routes: [
    {
      id: 'admissions',
      title: 'You are applying for a place',
      body: 'The admissions page sets out the three-step process, the requirements you will need to gather and the indicative termly fees, and carries its own application form.',
      action: { label: 'Admissions and fees', to: '/admissions#process' },
    },
    {
      id: 'general',
      title: 'Anything else',
      body: 'Transport routes, a request to visit, a question about school life, or something we have not thought of — the general enquiry form reaches the same office.',
      action: { label: 'Go to the enquiry form', href: '#enquiry' },
    },
  ],
  formIntro:
    'Tell us who you are and what you would like to know. Everything you send arrives in the school office inbox.',
  mapPending:
    'An interactive map is not published yet. The address above is complete, and the link below opens it in Google Maps.',
  visitNote:
    'Visits to the school are arranged in advance — call or email the office and we will agree a time with you.',
}

/** The four fields the enquiry form owns, in tab order. Used to focus the first error. */
const FIELD_ORDER = ['name', 'email', 'phone', 'subject', 'message']

const EMPTY_VALUES = { name: '', email: '', phone: '', subject: '', message: '' }

/* --------------------------------------------------------- client validation */

// Deliberately the same shapes the server enforces (`app/validation.py`), so a form that
// passes here is not bounced back for something we could have caught locally.
const EMAIL_RE = /^[^@\s]+@[^@\s.]+(\.[^@\s.]+)+$/
const PHONE_RE = /^[0-9+()\-.\s]{7,40}$/

function validate(values) {
  const errors = {}
  const name = values.name.trim()
  const email = values.email.trim()
  const phone = values.phone.trim()
  const subject = values.subject.trim()
  const message = values.message.trim()

  if (!name) errors.name = 'Please tell us your name.'
  else if (name.length < 2) errors.name = 'Must be at least 2 characters.'
  else if (name.length > 120) errors.name = 'Must be 120 characters or fewer.'

  if (!email) errors.email = 'We need an email address to reply to.'
  else if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email address.'

  if (phone && !PHONE_RE.test(phone)) {
    errors.phone = 'Enter a valid phone number, or leave this blank.'
  }

  if (subject.length > 200) errors.subject = 'Must be 200 characters or fewer.'

  if (!message) errors.message = 'Please write your message.'
  else if (message.length > 5000) errors.message = 'Must be 5000 characters or fewer.'

  return errors
}

/**
 * Turn a failed request into the two things the form needs to show: per-field messages and
 * one form-level explanation. Branches on `error.code`, never on message text (SPEC §4).
 */
function describeFailure(error) {
  if (!(error instanceof ApiError)) {
    return { fields: {}, notice: 'Something went wrong sending your message. Please try again.' }
  }

  if (error.code === 'VALIDATION_ERROR' && error.fields) {
    const fields = {}
    const strays = []
    for (const [key, text] of Object.entries(error.fields)) {
      if (FIELD_ORDER.includes(key)) fields[key] = text
      else strays.push(text)
    }
    return {
      fields,
      notice: strays.length
        ? strays.join(' ')
        : 'Please check the highlighted fields and send again.',
    }
  }

  if (error.code === 'RATE_LIMITED') {
    return {
      fields: {},
      notice:
        'Several messages have already been sent from this connection in the past hour. Please wait a few minutes and try again — or call the office instead, using the number on this page.',
    }
  }

  if (error.code === 'NETWORK_ERROR') {
    return {
      fields: {},
      notice:
        'We could not reach the school’s server. Check your connection and try again, or email the office directly.',
    }
  }

  return {
    fields: {},
    notice: error.reference
      ? `Something went wrong at our end and your message was not sent. Please try again, or quote reference ${error.reference} when you contact us.`
      : 'Something went wrong at our end and your message was not sent. Please try again.',
  }
}

/* ------------------------------------------------------------------ page */

/**
 * Contact — how to reach the school office, where it is, and a working enquiry form that
 * writes a real `enquiries` row through `POST /api/v1/enquiries` with `source: 'contact'`.
 *
 * The `#visit` anchor is linked from the homepage and the footer, so it must stay.
 */
export default function Contact() {
  const { get, ready } = useSettings()

  const phone = get('phone')
  const email = get('email')
  const admissionsEmail = get('admissions_email')
  const addressLine1 = get('address_line1')
  const addressLine2 = get('address_line2')
  const locality = get('address_locality')
  const region = get('address_region')
  const country = get('address_country')

  // `office_hours` and `map_embed_url` ship empty on purpose — the school has not supplied
  // them (CONTRACTS §7). Until the fetch lands, `ready` is false and we say so honestly
  // rather than briefly showing the seeded fallback as if it were fact.
  const officeHours = ready ? get('office_hours') : ''
  const mapEmbedUrl = ready ? get('map_embed_url') : ''

  const addressLines = [addressLine1, addressLine2 || [locality, region].filter(Boolean).join(', '), country]
    .filter(Boolean)
    .filter((line, index, all) => all.indexOf(line) === index)

  // A Google Maps *search* URL built from the published address: a real, working link, not a
  // stand-in for the embed we do not have.
  const mapSearchUrl =
    get('map_url') ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressLines.join(', '))}`

  const details = [
    {
      id: 'phone',
      term: 'Telephone',
      value: phone ? (
        <a href={telHref(phone)} className="link-underline">
          {phone}
        </a>
      ) : null,
    },
    {
      id: 'email',
      term: 'General enquiries',
      value: email ? (
        <a href={mailtoHref(email)} className="link-underline wrap-anywhere">
          {email}
        </a>
      ) : null,
    },
    {
      id: 'admissions-email',
      term: 'Admissions',
      value: admissionsEmail ? (
        <a href={mailtoHref(admissionsEmail)} className="link-underline wrap-anywhere">
          {admissionsEmail}
        </a>
      ) : null,
    },
    {
      id: 'address',
      term: 'Address',
      value: addressLines.length ? (
        <address className="not-italic">
          {addressLines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </address>
      ) : null,
    },
    {
      id: 'hours',
      term: 'Office hours',
      value: officeHours || (
        <span className="text-ink-70">
          Not published yet — call or email us and we will confirm a time that works.
        </span>
      ),
    },
  ].filter((row) => row.value)

  return (
    <>
      <SeoHead
        title="Contact us"
        description={`Reach the Baraka School Kapsabet office by phone or email, send an enquiry, or arrange a visit to ${locality || 'the school'}.`}
        path="/contact"
        jsonLd={breadcrumbJsonLd(BREADCRUMBS)}
      />

      <PageHeader
        eyebrow="Contact"
        title="Talk to the school office"
        lead={COPY.lead}
        breadcrumbs={BREADCRUMBS}
      />

      {/* 1 — the details themselves, as a hairline-divided list rather than cards. */}
      <Section id="reach" space="tight">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <SectionHead eyebrow="Reach us" title="Ways to get in touch" />
            <p className="type-body mt-6 text-ink-70">{COPY.reachIntro}</p>
          </div>

          <dl className="md:col-span-7 md:col-start-6">
            {details.map((row) => (
              <div
                key={row.id}
                className="grid gap-1 border-b border-line py-5 first:border-t sm:grid-cols-[11rem_1fr] sm:gap-6"
              >
                <dt className="type-meta">{row.term}</dt>
                <dd className="type-body m-0 text-ink">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      {/* 2 — routing: admissions questions belong on the admissions page. */}
      <Section tone="tint">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <SectionHead eyebrow="Where to start" title="How can we help?" />
          </div>

          <ul className="md:col-span-7 md:col-start-6">
            {COPY.routes.map((route) => (
              <li key={route.id} className="border-b border-line py-7 first:border-t">
                <h3 className="type-h4">{route.title}</h3>
                <p className="type-body mt-3 max-w-xl text-ink-70">{route.body}</p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-5"
                  to={route.action.to}
                  href={route.action.href}
                  iconRight={<Icon name="arrow-right" size={18} />}
                >
                  {route.action.label}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* 3 — the real enquiry form. */}
      <Section id="enquiry">
        <div className="grid gap-10 md:grid-cols-12 lg:gap-16">
          <div className="md:col-span-4">
            <SectionHead eyebrow="Enquiry form" title="Send us a message" />
            <p className="type-body mt-6 text-ink-70">{COPY.formIntro}</p>
            {phone ? (
              <p className="type-small mt-6 border-t border-line pt-6 text-ink-70">
                Prefer to talk it through?{' '}
                <a href={telHref(phone)} className="link-underline text-ink">
                  {phone}
                </a>
              </p>
            ) : null}
          </div>

          <div className="min-w-0 md:col-span-7 md:col-start-6">
            <EnquiryForm />
          </div>
        </div>
      </Section>

      {/* 4 — where we are. The embed is absent, so the address and a working map link stand in. */}
      <Section id="visit" tone="tint">
        <div className="grid items-start gap-10 md:grid-cols-12 lg:gap-16">
          <div className="min-w-0 md:col-span-5">
            <Img
              {...media.campusBuilding}
              alt={media.campusBuilding.alt}
              sizes="(min-width: 768px) 40vw, 100vw"
              className="rounded-xs"
            />
          </div>

          <div className="md:col-span-6 md:col-start-7">
            <SectionHead eyebrow="Visit" title="Finding the school" />
            <p className="type-body mt-6 text-ink-70">{COPY.visitNote}</p>

            {addressLines.length ? (
              <address className="type-body mt-8 border-t border-line pt-6 not-italic text-ink">
                {addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            ) : null}

            {mapEmbedUrl ? (
              <iframe
                src={mapEmbedUrl}
                title={`Map showing ${addressLines.join(', ')}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="mt-8 block h-72 w-full rounded-xs border border-line"
              />
            ) : (
              <div className="mt-8 flex flex-col items-start gap-3 border border-line bg-paper px-6 py-10">
                <Icon name="pin" className="text-ink-50" />
                <p className="type-small max-w-md text-ink-70">{COPY.mapPending}</p>
              </div>
            )}

            <Button
              variant="secondary"
              size="sm"
              className="mt-6"
              href={mapSearchUrl}
              iconRight={<Icon name="arrow-up-right" size={18} />}
            >
              Open the address in Google Maps
            </Button>
          </div>
        </div>
      </Section>

      {/* 5 — the questions the office answers most often. */}
      <Section>
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <SectionHead eyebrow="Before you write" title="Common questions" />
            <p className="type-body mt-6 text-ink-70">
              These come up most often. The{' '}
              <Link to="/admissions#faq" className="link-underline text-ink">
                admissions page
              </Link>{' '}
              carries the full process, requirements and indicative fees.
            </p>
          </div>

          <div className="min-w-0 md:col-span-7 md:col-start-6">
            <Accordion items={faqs} defaultOpen={faqs[0] ? faqs[0].id : undefined} />
          </div>
        </div>
      </Section>
    </>
  )
}

/* ------------------------------------------------------------------ form */

/**
 * The enquiry form. Posts to `POST /api/v1/enquiries` with `source: 'contact'` and the
 * honeypot the server checks; renders busy, success, field-level and form-level failures.
 */
function EnquiryForm() {
  const [values, setValues] = useState(EMPTY_VALUES)
  const [website, setWebsite] = useState('')
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState('')
  // 'idle' | 'sending' | 'sent'
  const [status, setStatus] = useState('idle')
  const [confirmation, setConfirmation] = useState('')

  const formRef = useRef(null)
  const successRef = useRef(null)

  useEffect(() => {
    if (status === 'sent' && successRef.current) successRef.current.focus()
  }, [status])

  const setField = (name) => (event) => {
    const { value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => {
      if (!current[name]) return current
      const next = { ...current }
      delete next[name]
      return next
    })
  }

  const focusFirstError = (found) => {
    const first = FIELD_ORDER.find((name) => found[name])
    if (!first || !formRef.current) return
    const control = formRef.current.elements[first]
    if (control && typeof control.focus === 'function') control.focus()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (status === 'sending') return

    const found = validate(values)
    if (Object.keys(found).length) {
      setErrors(found)
      setNotice('Please check the highlighted fields and send again.')
      focusFirstError(found)
      return
    }

    setErrors({})
    setNotice('')
    setStatus('sending')

    // Optional fields are omitted rather than sent empty — the server treats "" as a value.
    const payload = {
      name: values.name.trim(),
      email: values.email.trim(),
      message: values.message.trim(),
      source: 'contact',
      website,
    }
    if (values.phone.trim()) payload.phone = values.phone.trim()
    if (values.subject.trim()) payload.subject = values.subject.trim()

    try {
      const result = await postEnquiry(payload)
      setConfirmation((result && result.message) || 'Thank you — your message has been received.')
      setValues(EMPTY_VALUES)
      setWebsite('')
      setStatus('sent')
    } catch (error) {
      const described = describeFailure(error)
      setErrors(described.fields)
      setNotice(described.notice)
      setStatus('idle')
      focusFirstError(described.fields)
    }
  }

  if (status === 'sent') {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="border border-line bg-paper-2/60 px-6 py-10 outline-none"
      >
        <div className="flex items-start gap-3">
          <Icon name="check" className="mt-0.5 text-success" />
          <div className="flex flex-col items-start gap-3">
            <h3 className="type-h4">Message sent</h3>
            <p className="type-small max-w-prose text-ink-70">{confirmation}</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setStatus('idle')
                setConfirmation('')
              }}
            >
              Send another message
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const sending = status === 'sending'

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      aria-busy={sending}
      className="flex flex-col gap-6"
    >
      {notice ? (
        <p
          role="alert"
          className="flex items-start gap-2 border border-danger/40 bg-paper-2/60 px-4 py-3 text-sm text-danger"
        >
          <Icon name="alert" size={20} className="mt-px shrink-0" />
          <span>{notice}</span>
        </p>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          label="Your name"
          name="name"
          id="contact-name"
          required
          autoComplete="name"
          maxLength={120}
          value={values.name}
          onChange={setField('name')}
          error={errors.name}
        />
        <Field
          label="Email address"
          name="email"
          id="contact-email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          maxLength={200}
          value={values.email}
          onChange={setField('email')}
          error={errors.email}
        />
        <Field
          label="Phone number"
          name="phone"
          id="contact-phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          maxLength={40}
          hint="Optional — if you would prefer a call back."
          value={values.phone}
          onChange={setField('phone')}
          error={errors.phone}
        />
        <Field
          label="Subject"
          name="subject"
          id="contact-subject"
          maxLength={200}
          hint="Optional — a few words on what this is about."
          value={values.subject}
          onChange={setField('subject')}
          error={errors.subject}
        />
      </div>

      <Field
        label="Your message"
        name="message"
        id="contact-message"
        as="textarea"
        rows={7}
        required
        maxLength={5000}
        value={values.message}
        onChange={setField('message')}
        error={errors.message}
      />

      <Honeypot value={website} onChange={setWebsite} />

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg" disabled={sending}>
          {sending ? 'Sending…' : 'Send message'}
        </Button>
        <p className="type-meta" role="status">
          {sending ? 'Sending your message…' : 'We use your details only to answer your enquiry.'}
        </p>
      </div>
    </form>
  )
}
