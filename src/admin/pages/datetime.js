/**
 * Conversions between the API's UTC timestamps and the `datetime-local` input value.
 *
 * The API always speaks "YYYY-MM-DDTHH:MM:SSZ" (UTC). A `datetime-local` input always speaks
 * wall-clock time in the operator's own zone. Getting this wrong shifts every event by the
 * UTC offset — three hours, here — so both directions go through these two functions and
 * nowhere else.
 */

/** API UTC string -> value for a `datetime-local` input, in local time. */
export function isoToLocalInput(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  )
}

/** `datetime-local` value (local time) -> the API's UTC string. */
export function localInputToIso(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return `${date.toISOString().slice(0, 19)}Z`
}
