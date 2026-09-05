import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

import { MobileNav } from '@/components/layout/MobileNav'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { applyCta, nav, school } from '@/content/site'
import { cn } from '@/lib/cn'
import { mailtoHref, telHref } from '@/lib/format'
import { useSettings } from '@/lib/settings'

/** Pixels of scroll after which the transparent header turns solid. */
const SOLID_AFTER = 30

/**
 * The site header.
 *
 * On the homepage it starts transparent over the hero photograph and turns solid after 30px
 * of scroll. Everywhere else it is solid from the start. The contact strip reads the phone
 * and e-mail from `/settings`, falling back to the seeded defaults so it is never empty.
 */
export function SiteHeader() {
  const location = useLocation()
  const { get } = useSettings()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const toggleRef = useRef(null)

  // Stable identity: MobileNav's focus-trap effect depends on it and must not re-run on
  // every header render.
  const closeMenu = useCallback(() => setMenuOpen(false), [])

  const overHero = location.pathname === '/'
  const solid = !overHero || scrolled

  useEffect(() => {
    if (!overHero) {
      setScrolled(false)
      return undefined
    }

    const onScroll = () => setScrolled(window.scrollY > SOLID_AFTER)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [overHero])

  const phone = get('phone')
  const email = get('email')
  const crest = solid ? '/brand/crest-ink-256.png' : '/brand/crest-light-256.png'

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-80 transition-colors duration-200 ease-editorial',
          solid ? 'border-b border-line bg-paper text-ink' : 'text-paper',
        )}
      >
        {/* Contact strip — CMS values, hidden on small screens where the sheet carries them. */}
        <div
          className={cn(
            'hidden border-b lg:block',
            solid ? 'border-line bg-paper-2/70' : 'border-paper/20',
          )}
        >
          <div className="container flex items-center justify-between gap-6 py-2 text-[0.8125rem]">
            <p className={cn(solid ? 'text-ink-50' : 'text-paper/80')}>
              {school.descriptor.charAt(0).toUpperCase() + school.descriptor.slice(1)} ·{' '}
              {school.gradeRange}
            </p>
            <ul className="flex items-center gap-5">
              {phone ? (
                <li>
                  <a
                    href={telHref(phone)}
                    className={cn(
                      'inline-flex items-center gap-2',
                      solid ? 'text-ink-70 hover:text-ink' : 'text-paper/90 hover:text-paper',
                    )}
                  >
                    <Icon name="phone" size={16} />
                    <span>{phone}</span>
                  </a>
                </li>
              ) : null}
              {email ? (
                <li>
                  <a
                    href={mailtoHref(email)}
                    className={cn(
                      'inline-flex items-center gap-2',
                      solid ? 'text-ink-70 hover:text-ink' : 'text-paper/90 hover:text-paper',
                    )}
                  >
                    <Icon name="mail" size={16} />
                    <span>{email}</span>
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="container flex items-center justify-between gap-6 py-3">
          <Link to="/" className="flex items-center gap-3" aria-label={`${school.name} — home`}>
            <img
              src={crest}
              alt=""
              width={44}
              height={44}
              className="h-11 w-11 object-contain"
              decoding="async"
            />
            <span className="flex flex-col leading-tight">
              <span className="font-display text-[1.0625rem] tracking-[-0.01em] md:text-lg">
                Baraka School
              </span>
              <span
                className={cn(
                  'text-[0.6875rem] tracking-[0.14em] uppercase',
                  solid ? 'text-ink-50' : 'text-paper/70',
                )}
              >
                Kapsabet
              </span>
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {nav.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        'inline-flex min-h-11 items-center rounded-xs px-3 text-[0.9375rem] transition-colors duration-150 ease-editorial',
                        solid
                          ? isActive
                            ? 'text-ink'
                            : 'text-ink-70 hover:text-ink'
                          : isActive
                            ? 'text-paper'
                            : 'text-paper/80 hover:text-paper',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <span
                        className={cn(
                          'border-b-2 py-0.5',
                          isActive ? 'border-gold' : 'border-transparent',
                        )}
                      >
                        {item.label}
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            {/* Wrapped, not display-toggled: Button always sets `inline-flex`, which would
                win over a `hidden` utility on the same element. */}
            <div className="hidden sm:block">
              <Button to={applyCta.to} variant="gold" size="sm">
                {applyCta.label}
              </Button>
            </div>

            <button
              type="button"
              ref={toggleRef}
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              className={cn(
                'inline-flex h-11 w-11 items-center justify-center rounded-xs border lg:hidden',
                solid ? 'border-line text-ink' : 'border-paper/40 text-paper',
              )}
            >
              <Icon name="menu" size={22} />
              <span className="sr-only">Open menu</span>
            </button>
          </div>
        </div>
      </header>

      <MobileNav
        open={menuOpen}
        onClose={closeMenu}
        triggerRef={toggleRef}
        items={nav}
        cta={applyCta}
        phone={phone}
        email={email}
      />
    </>
  )
}

export default SiteHeader
