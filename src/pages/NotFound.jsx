import { Link } from 'react-router-dom'

import { SeoHead } from '@/components/SeoHead'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Icon } from '@/components/ui/Icon'
import { nav } from '@/content/site'
import { mailtoHref, telHref } from '@/lib/format'
import { useSettings } from '@/lib/settings'

/**
 * Where each section actually goes, so a parent who mistyped a URL can pick the page they
 * meant rather than being dropped back on the homepage. Labels and paths come from the same
 * `nav` list the header uses, so this can never drift into a dead link.
 */
const DESTINATIONS = {
  '/about': 'Our story, leadership, mission and milestones',
  '/academics': 'CBC from Playgroup to Grade 9, and how we teach it',
  '/admissions': 'The application process, requirements and indicative fees',
  '/school-life': 'Sports, clubs, the arts and life beyond the timetable',
  '/gallery': 'Photographs of the classrooms, grounds and school events',
  '/news': 'News from the school and the term’s upcoming events',
  '/contact': 'Phone, email, the address and the enquiry form',
}

/**
 * 404. The one page that is centred (SPEC §3), and the one that must never redirect
 * somewhere else — a wrong URL says so plainly and offers real routes onward (SPEC §8).
 */
export default function NotFound() {
  const { get } = useSettings()

  const phone = get('phone')
  const email = get('email')

  return (
    <>
      <SeoHead
        title="Page not found"
        description="That page does not exist. Use the links here to find the part of the school site you were looking for."
        noindex
      />

      <Container className="pt-28 pb-24 md:pt-36 md:pb-32">
        <div className="mx-auto max-w-xl text-center">
          <Eyebrow>Error 404</Eyebrow>
          <h1 id="page-title" tabIndex={-1} className="type-h1 mt-4 outline-none">
            We could not find that page
          </h1>
          <p className="type-lead mt-5">
            The link may be out of date, or the address may have a typo in it. Nothing else has
            moved — everything below is where you left it.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button to="/" size="lg">
              Back to the homepage
            </Button>
            <Button to="/admissions#apply" variant="gold" size="lg">
              Apply for a place
            </Button>
          </div>
        </div>

        {/* Real routes, hairline-divided — not a wall of cards. */}
        <nav aria-labelledby="notfound-sections" className="mx-auto mt-20 max-w-2xl">
          <h2 id="notfound-sections" className="type-eyebrow border-b border-line pb-4 text-center">
            Every section of the site
          </h2>
          <ul>
            {nav.map((item) => (
              <li key={item.to} className="border-b border-line">
                <Link
                  to={item.to}
                  className="group flex min-h-11 items-center justify-between gap-6 py-5 text-left"
                >
                  <span>
                    <span className="type-h4 block">{item.label}</span>
                    {DESTINATIONS[item.to] ? (
                      <span className="type-small mt-1 block text-ink-70">
                        {DESTINATIONS[item.to]}
                      </span>
                    ) : null}
                  </span>
                  <Icon
                    name="arrow-right"
                    size={20}
                    className="shrink-0 text-ink-50 transition-colors duration-150 ease-editorial group-hover:text-ink"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {(phone || email) && (
          <p className="type-small mx-auto mt-12 max-w-2xl text-center text-ink-70">
            Still stuck? The school office can point you to the right page —{' '}
            {phone ? (
              <a href={telHref(phone)} className="link-underline text-ink">
                {phone}
              </a>
            ) : null}
            {phone && email ? ' or ' : null}
            {email ? (
              <a href={mailtoHref(email)} className="link-underline text-ink">
                {email}
              </a>
            ) : null}
            .
          </p>
        )}
      </Container>
    </>
  )
}
