import { Link } from 'react-router-dom'

import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { footerNav, school, socials } from '@/content/site'
import { mailtoHref, telHref } from '@/lib/format'
import { useSettings } from '@/lib/settings'

/**
 * The site footer.
 *
 * Every contact value and social URL comes from `/settings` — nothing here is hard-coded, and
 * a social link is omitted entirely rather than pointed at `#` when its setting is empty.
 * There is no newsletter box: the site has no mailing list, and a form that does nothing
 * would be a lie (SPEC §10).
 */
export function SiteFooter() {
  const { get } = useSettings()

  const phone = get('phone')
  const email = get('email')
  const street = get('address_line1')
  const locality = get('address_locality')
  const region = get('address_region')
  const hours = get('office_hours')

  const socialLinks = socials
    .map((social) => ({ ...social, href: get(social.settingsKey) }))
    .filter((social) => Boolean(social.href))

  return (
    <footer className="border-t border-line bg-paper-2">
      <Container className="py-14 md:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-4">
            <Link to="/" className="flex items-center gap-3" aria-label={`${school.name} — home`}>
              <img
                src="/brand/crest-ink-256.png"
                alt=""
                width={56}
                height={56}
                className="h-14 w-14 object-contain"
                loading="lazy"
                decoding="async"
              />
              <span className="flex flex-col leading-tight">
                <span className="font-display text-lg tracking-[-0.01em]">Baraka School</span>
                <span className="text-[0.6875rem] tracking-[0.14em] text-ink-50 uppercase">
                  Kapsabet
                </span>
              </span>
            </Link>

            <p className="type-small mt-6 max-w-xs text-ink-70">{school.positioning}.</p>
            <p className="type-meta mt-3 max-w-xs">
              {school.descriptor.charAt(0).toUpperCase() + school.descriptor.slice(1)} ·{' '}
              {school.curriculum} · {school.gradeRange}
            </p>

            {socialLinks.length ? (
              <ul className="mt-6 flex items-center gap-2">
                {socialLinks.map((social) => (
                  <li key={social.id}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-xs border border-line text-ink-70 transition-colors duration-150 ease-editorial hover:border-ink hover:text-ink"
                    >
                      <Icon name={social.id} size={20} title={`${school.name} on ${social.label}`} />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {/* Link columns */}
          {footerNav.map((column) => (
            <nav key={column.title} aria-label={column.title} className="md:col-span-2">
              <h2 className="text-[0.6875rem] font-semibold tracking-[0.14em] text-ink-50 uppercase">
                {column.title}
              </h2>
              <ul className="mt-4 flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="type-small text-ink-70 hover:text-ink">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/* Contact */}
          <div className="md:col-span-2">
            <h2 className="text-[0.6875rem] font-semibold tracking-[0.14em] text-ink-50 uppercase">
              Find us
            </h2>
            <address className="mt-4 flex flex-col gap-3 text-[0.9375rem] not-italic text-ink-70">
              {street ? (
                <span className="flex items-start gap-2">
                  <Icon name="pin" size={18} className="mt-0.5 text-ink-50" />
                  <span>
                    {street}
                    {locality ? (
                      <>
                        <br />
                        {locality}
                        {region ? `, ${region}` : ''}
                      </>
                    ) : null}
                  </span>
                </span>
              ) : null}
              {phone ? (
                <a href={telHref(phone)} className="flex items-center gap-2 hover:text-ink">
                  <Icon name="phone" size={18} className="text-ink-50" />
                  {phone}
                </a>
              ) : null}
              {email ? (
                <a href={mailtoHref(email)} className="flex items-center gap-2 break-all hover:text-ink">
                  <Icon name="mail" size={18} className="shrink-0 text-ink-50" />
                  {email}
                </a>
              ) : null}
              {hours ? (
                <span className="flex items-start gap-2">
                  <Icon name="clock" size={18} className="mt-0.5 text-ink-50" />
                  <span>{hours}</span>
                </span>
              ) : null}
            </address>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-line pt-6 md:flex-row md:items-center md:justify-between">
          <p className="type-meta">
            © {new Date().getFullYear()} {school.name}. All rights reserved.
          </p>
          <p className="type-meta">
            {school.motto} {school.mottoMeaning}
          </p>
        </div>
      </Container>
    </footer>
  )
}

export default SiteFooter
