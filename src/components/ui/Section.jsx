import { Container } from '@/components/ui/Container'
import { cn } from '@/lib/cn'

const TONE = {
  paper: 'bg-paper text-ink',
  tint: 'bg-paper-2 text-ink',
  brand: 'bg-brand text-paper',
  ink: 'bg-ink text-paper',
}

const SPACE = {
  default: 'py-16 md:py-24 lg:py-32',
  tight: 'py-10 md:py-14',
  flush: '',
}

/**
 * A page band. Handles the vertical rhythm, the background tone and the container in one
 * place so pages stay declarative.
 *
 * Never place two `tone="tint"` sections next to each other (SPEC §3).
 *
 * @param {object} props
 * @param {'paper'|'tint'|'brand'|'ink'} [props.tone]
 * @param {'default'|'tight'|'flush'} [props.space] vertical padding
 * @param {'default'|'prose'|'wide'|false} [props.container] false renders full-bleed content
 * @param {boolean} [props.bordered] adds a hairline rule on top
 * @param {string} [props.id] anchor target
 * @param {React.ElementType} [props.as]
 * @param {string} [props.className] applied to the outer band
 * @param {string} [props.innerClassName] applied to the container
 */
export function Section({
  as: Tag = 'section',
  tone = 'paper',
  space = 'default',
  container = 'default',
  bordered = false,
  className,
  innerClassName,
  children,
  ...rest
}) {
  const body =
    container === false ? (
      children
    ) : (
      <Container width={container} className={innerClassName}>
        {children}
      </Container>
    )

  return (
    <Tag
      className={cn(TONE[tone], SPACE[space], bordered && 'border-t border-line', className)}
      {...rest}
    >
      {body}
    </Tag>
  )
}

export default Section
