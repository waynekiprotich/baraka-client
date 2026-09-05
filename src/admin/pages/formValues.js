/**
 * Merge an API record into a blank form shape.
 *
 * The API returns `null` for "not set"; a controlled React input needs `''`. Passing the
 * record straight through flips inputs between controlled and uncontrolled, so every editor
 * loads its record through here.
 *
 * @param {object} blank  the form's empty shape, which defines the fields
 * @param {object} record the API record
 * @returns {object}
 */
export function toFormValues(blank, record) {
  const next = { ...blank }
  Object.keys(blank).forEach((key) => {
    const value = record?.[key]
    if (value === undefined) return
    next[key] = value === null && typeof blank[key] === 'string' ? '' : value
  })
  return next
}
