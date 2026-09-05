import { useId } from 'react'

import { cn } from '@/lib/cn'

/**
 * A labelled form control. Every control on the site uses one — a placeholder is never a
 * label, and an error is never signalled by colour alone (SPEC §6).
 *
 * The error message is tied to the control with `aria-describedby` and marked
 * `role="alert"`, so it is announced the moment it appears.
 *
 * @param {object} props
 * @param {string} props.label        visible label text — required
 * @param {string} props.name         form field name
 * @param {'input'|'textarea'|'select'} [props.as]
 * @param {string} [props.type]       input type, e.g. 'email', 'tel'
 * @param {string} [props.id]         defaults to a generated id
 * @param {string} [props.hint]       help text shown under the label
 * @param {string} [props.error]      validation message; also sets aria-invalid
 * @param {boolean} [props.required]
 * @param {number} [props.rows]       textarea only
 * @param {React.ReactNode} [props.children] `<option>`s when `as="select"`
 * @param {string} [props.className]  wrapper classes
 * @param {boolean} [props.hiddenLabel] visually hide the label (it stays for screen readers)
 * — any other prop (value, onChange, autoComplete, inputMode, placeholder, maxLength …)
 *   is forwarded to the control.
 */
export function Field({
  label,
  name,
  as = 'input',
  type = 'text',
  id,
  hint,
  error,
  required = false,
  rows = 6,
  children,
  className,
  hiddenLabel = false,
  ...rest
}) {
  const generatedId = useId()
  const fieldId = id || `${name}-${generatedId}`
  const hintId = hint ? `${fieldId}-hint` : undefined
  const errorId = error ? `${fieldId}-error` : undefined

  const controlClasses = cn(
    'w-full rounded-xs border bg-paper px-3 py-2.5 text-base text-ink',
    'min-h-11 transition-colors duration-150 ease-editorial',
    'placeholder:text-ink-50',
    error ? 'border-danger' : 'border-line hover:border-ink/40',
  )

  const shared = {
    id: fieldId,
    name,
    required,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': cn(hintId, errorId) || undefined,
    className: controlClasses,
    ...rest,
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label
        htmlFor={fieldId}
        className={cn(
          'text-sm font-medium text-ink',
          hiddenLabel && 'sr-only',
        )}
      >
        {label}
        {required ? (
          <>
            {' '}
            <span className="text-ink-50" aria-hidden="true">
              (required)
            </span>
          </>
        ) : null}
      </label>

      {hint ? (
        <p id={hintId} className="type-meta">
          {hint}
        </p>
      ) : null}

      {as === 'textarea' ? (
        <textarea rows={rows} {...shared} className={cn(controlClasses, 'min-h-32 resize-y')} />
      ) : as === 'select' ? (
        <select {...shared}>{children}</select>
      ) : (
        <input type={type} {...shared} />
      )}

      {error ? (
        <p id={errorId} role="alert" className="flex items-start gap-1.5 text-sm text-danger">
          <span aria-hidden="true">•</span>
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  )
}

/**
 * The hidden honeypot the enquiry endpoint checks. Render it inside every public form and
 * bind it to a state value that must stay empty.
 *
 * @param {object} props
 * @param {string} props.value
 * @param {(value: string) => void} props.onChange
 */
export function Honeypot({ value, onChange }) {
  return (
    <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
      <label htmlFor="website-field">Leave this field empty</label>
      <input
        id="website-field"
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}

export default Field
