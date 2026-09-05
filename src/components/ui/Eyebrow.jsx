import { cn } from '@/lib/cn'

/**
 * Small uppercase gold label. Always sits directly above a heading — never on its own
 * (SPEC §3).
 *
 * @param {object} props
 * @param {React.ElementType} [props.as] defaults to 'p'
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export function Eyebrow({ as: Tag = 'p', className, children, ...rest }) {
  return (
    <Tag className={cn('type-eyebrow', className)} {...rest}>
      {children}
    </Tag>
  )
}

export default Eyebrow
