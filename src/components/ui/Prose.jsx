import { cn } from '@/lib/cn'

/**
 * Long-form copy at a comfortable measure.
 *
 * Two ways to use it:
 *   1. `<Prose>` with JSX children — for editorial copy written in a component.
 *   2. `<Prose text={article.body} />` — for plain text out of the CMS. Blank lines become
 *      paragraphs. Nothing is ever parsed as HTML: CMS text is not trusted markup, and
 *      rendering it as HTML would be an injection hole (SPEC §5).
 *
 * @param {object} props
 * @param {string} [props.text] plain text; blank-line separated paragraphs
 * @param {React.ElementType} [props.as]
 * @param {string} [props.className]
 */
export function Prose({ text, as: Tag = 'div', className, children, ...rest }) {
  const paragraphs =
    typeof text === 'string'
      ? text
          .replace(/\r\n/g, '\n')
          .split(/\n{2,}/)
          .map((block) => block.trim())
          .filter(Boolean)
      : null

  return (
    <Tag className={cn('prose-editorial', className)} {...rest}>
      {paragraphs
        ? paragraphs.map((block, index) => (
            // Paragraph order is stable for a given body of text.
            <p key={index}>{block}</p>
          ))
        : children}
    </Tag>
  )
}

export default Prose
