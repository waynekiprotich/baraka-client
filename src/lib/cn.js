/**
 * Join class names, dropping anything falsy. Objects are treated as
 * `{ 'class-name': condition }` maps.
 *
 *   cn('a', cond && 'b', { c: isC })  →  'a b c'
 */
export function cn(...parts) {
  const out = []

  for (const part of parts) {
    if (!part) continue

    if (typeof part === 'string' || typeof part === 'number') {
      out.push(String(part))
    } else if (Array.isArray(part)) {
      const nested = cn(...part)
      if (nested) out.push(nested)
    } else if (typeof part === 'object') {
      for (const [key, value] of Object.entries(part)) {
        if (value) out.push(key)
      }
    }
  }

  return out.join(' ')
}

export default cn
