import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Container } from '@/components/ui/Container'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { cn } from '@/lib/cn'

/**
 * The masthead of every inner page: breadcrumbs, eyebrow, the page's single `<h1>` and a
 * short standfirst. Left aligned — inner pages are not centred (SPEC §3).
 *
 * The `<h1>` carries `id="page-title"`, which the route announcer moves focus to on
 * navigation, so every page must render exactly one PageHeader.
 *
 * @param {object} props
 * @param {string} [props.eyebrow]
 * @param {React.ReactNode} props.title
 * @param {React.ReactNode} [props.lead]
 * @param {Array<{label: string, to?: string}>} [props.breadcrumbs] excluding Home
 * @param {React.ReactNode} [props.aside] pulled to the right on wide screens
 * @param {React.ReactNode} [props.children] actions or extra detail under the standfirst
 * @param {boolean} [props.bordered] hairline rule beneath, defaults to true
 * @param {string} [props.className]
 */
export function PageHeader({
  eyebrow,
  title,
  lead,
  breadcrumbs,
  aside,
  children,
  bordered = true,
  className,
}) {
  return (
    <header className={cn('bg-paper pt-28 pb-10 md:pt-36 md:pb-14', className)}>
      <Container>
        {breadcrumbs && breadcrumbs.length ? (
          <Breadcrumbs items={breadcrumbs} className="mb-8" />
        ) : null}

        <div className={cn('gap-10', aside && 'md:grid md:grid-cols-12')}>
          <div className={cn(aside ? 'md:col-span-7' : 'max-w-3xl')}>
            {eyebrow ? <Eyebrow className="mb-4">{eyebrow}</Eyebrow> : null}
            <h1 id="page-title" tabIndex={-1} className="type-h1 outline-none">
              {title}
            </h1>
            {lead ? <p className="type-lead mt-5 max-w-2xl">{lead}</p> : null}
            {children ? <div className="mt-8">{children}</div> : null}
          </div>
          {aside ? <div className="mt-8 md:col-span-5 md:mt-0">{aside}</div> : null}
        </div>
      </Container>

      {bordered ? (
        <Container className="mt-10 md:mt-14">
          <hr />
        </Container>
      ) : null}
    </header>
  )
}

export default PageHeader
