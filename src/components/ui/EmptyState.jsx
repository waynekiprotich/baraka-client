import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'

/**
 * "There is nothing here yet" — said honestly, never faked with sample content.
 *
 * @param {object} props
 * @param {string} props.title      short and plain, e.g. 'No news yet'
 * @param {React.ReactNode} [props.description] one sentence on what to expect instead
 * @param {string} [props.icon]     an Icon name
 * @param {React.ReactNode} [props.action] a Button, if there is somewhere useful to go
 * @param {string} [props.className]
 */
export function EmptyState({ title, description, icon = 'info', action, className }) {
  return (
    <div
      className={cn(
        'flex flex-col items-start gap-3 border border-line bg-paper-2/60 px-6 py-10',
        className,
      )}
    >
      <Icon name={icon} className="text-ink-50" />
      <h3 className="type-h4">{title}</h3>
      {description ? <p className="type-small max-w-prose text-ink-70">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  )
}

export default EmptyState
