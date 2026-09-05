import { cn } from '@/lib/cn'

/**
 * Horizontal page container.
 *
 * @param {object} props
 * @param {'default'|'prose'|'wide'} [props.width] 1200px · 720px · 1440px
 * @param {React.ElementType} [props.as] element to render, defaults to 'div'
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export function Container({ as: Tag = 'div', width = 'default', className, children, ...rest }) {
  const base =
    width === 'prose' ? 'container-prose' : width === 'wide' ? 'container-wide' : 'container'

  return (
    <Tag className={cn(base, className)} {...rest}>
      {children}
    </Tag>
  )
}

export default Container
