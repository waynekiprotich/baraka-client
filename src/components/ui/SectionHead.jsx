import { Eyebrow } from '@/components/ui/Eyebrow'
import { cn } from '@/lib/cn'

/**
 * Eyebrow + heading + optional standfirst, left aligned by default.
 *
 * @param {object} props
 * @param {string} [props.eyebrow]
 * @param {React.ReactNode} props.title
 * @param {React.ReactNode} [props.lead] one short paragraph under the heading
 * @param {'h1'|'h2'|'h3'} [props.as] heading level — keep the document outline correct
 * @param {'h1'|'h2'|'h3'} [props.size] visual size, independent of the level
 * @param {'left'|'center'} [props.align]
 * @param {React.ReactNode} [props.action] a link or button placed opposite the heading
 * @param {string} [props.className]
 */
export function SectionHead({
  eyebrow,
  title,
  lead,
  as: Tag = 'h2',
  size,
  align = 'left',
  action,
  className,
}) {
  const visual = size || Tag
  const centered = align === 'center'

  return (
    <div
      className={cn(
        'flex flex-col gap-6',
        action && !centered && 'md:flex-row md:items-end md:justify-between',
        className,
      )}
    >
      <div className={cn('max-w-2xl', centered && 'mx-auto text-center')}>
        {eyebrow ? <Eyebrow className="mb-3">{eyebrow}</Eyebrow> : null}
        <Tag className={cn(`type-${visual}`)}>{title}</Tag>
        {lead ? <p className="type-lead mt-4">{lead}</p> : null}
      </div>
      {action ? <div className={cn('shrink-0', centered && 'mx-auto')}>{action}</div> : null}
    </div>
  )
}

export default SectionHead
