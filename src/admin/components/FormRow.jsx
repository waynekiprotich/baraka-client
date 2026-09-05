import { useId } from 'react'

/**
 * A labelled control for CMS forms — the admin counterpart of the public `<Field>`.
 *
 * @param {object} props
 * @param {string} props.label
 * @param {'input'|'textarea'|'select'} [props.as]
 * @param {string} [props.hint]      guidance shown under the control
 * @param {string} [props.error]     server or client validation message
 * @param {boolean} [props.required]
 * @param {React.ReactNode} [props.children] options, when `as="select"`
 */
export function FormRow({
  label,
  as = 'input',
  hint,
  error,
  required = false,
  rows = 8,
  className = '',
  children,
  id,
  ...rest
}) {
  const autoId = useId()
  const fieldId = id || autoId
  const hintId = hint ? `${fieldId}-hint` : undefined
  const errorId = error ? `${fieldId}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  const base =
    'w-full rounded-xs border bg-paper px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-50 focus-visible:border-brand-600 disabled:cursor-not-allowed disabled:bg-paper-2 disabled:text-ink-50'
  const border = error ? 'border-danger' : 'border-line'
  const Tag = as

  return (
    <div className={className}>
      <label htmlFor={fieldId} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
        {required && (
          <span className="ml-1 text-danger" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <Tag
        id={fieldId}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        className={`${base} ${border}`}
        {...(as === 'textarea' ? { rows } : {})}
        {...rest}
      >
        {children}
      </Tag>
      {hint && (
        <p id={hintId} className="mt-1 text-xs text-ink-50">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1 text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
