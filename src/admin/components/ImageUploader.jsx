import { useRef, useState } from 'react'

import { adminUpload } from '@/admin/lib/adminApi'
import { Icon } from '@/components/ui/Icon'

import { FormRow } from './FormRow'

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 8 * 1024 * 1024

/** Turn an ApiError from the upload endpoint into something an operator can act on. */
function uploadMessage(error) {
  switch (error?.code) {
    case 'PAYLOAD_TOO_LARGE':
      return 'That file is larger than 8MB. Save a smaller copy and try again.'
    case 'UNSUPPORTED_MEDIA_TYPE':
      return 'That file is not a JPEG, PNG or WebP image.'
    case 'VALIDATION_ERROR':
      return error.message || 'The server rejected that file.'
    default:
      return error?.message || 'The upload failed. Check your connection and try again.'
  }
}

/**
 * Uploads one image and hands the caller the stored URL.
 *
 * Alt text is required before the value is accepted: `gallery_images.alt_text` is NOT NULL and
 * the public site's accessibility depends on it, so this component refuses to hand back an
 * image nobody has described.
 *
 * @param {object} props
 * @param {string} [props.value]        current image url
 * @param {string} [props.alt]          current alt text
 * @param {(next: {url: string|null, alt: string, thumbUrl?: string|null,
 *                 storageKey?: string|null, width?: number, height?: number}) => void} props.onChange
 *        `storageKey` is what the delete endpoint removes by — a caller that stores an image
 *        (the gallery manager) must persist it, or the file it uploaded can never be deleted.
 * @param {string} [props.label]
 * @param {boolean} [props.requireAlt]  set false where alt is optional (a news cover with no image)
 */
export function ImageUploader({
  value,
  alt = '',
  onChange,
  label = 'Image',
  requireAlt = true,
  altError,
}) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const handleFile = async (file) => {
    if (!file) return
    setError('')

    if (!ACCEPTED.includes(file.type)) {
      setError('Choose a JPEG, PNG or WebP image.')
      return
    }
    if (file.size > MAX_BYTES) {
      setError(`That image is ${(file.size / 1024 / 1024).toFixed(1)}MB. The limit is 8MB.`)
      return
    }

    setBusy(true)
    try {
      const result = await adminUpload(file)
      onChange({
        url: result.url,
        thumbUrl: result.thumb_url,
        storageKey: result.storage_key,
        width: result.width,
        height: result.height,
        alt,
      })
    } catch (err) {
      setError(uploadMessage(err))
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      <p className="mb-1.5 block text-sm font-medium text-ink">{label}</p>

      {value ? (
        <div className="flex items-start gap-3 rounded-xs border border-line bg-paper p-3">
          <img
            src={value}
            alt=""
            className="h-20 w-20 shrink-0 rounded-xs object-cover"
            width={80}
            height={80}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-ink-50">{value}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={busy}
                className="rounded-xs border border-line px-2.5 py-1 text-xs font-medium text-ink hover:bg-paper-2 disabled:opacity-50"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={() => onChange({ url: null, alt: '', thumbUrl: null, storageKey: null })}
                disabled={busy}
                className="rounded-xs border border-line px-2.5 py-1 text-xs font-medium text-danger hover:bg-danger/5 disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="flex w-full flex-col items-center gap-1.5 rounded-xs border border-dashed border-line bg-paper px-4 py-8 text-sm text-ink-70 hover:border-brand-600 hover:text-ink disabled:opacity-60"
        >
          <Icon name={busy ? 'clock' : 'image'} size={22} aria-hidden="true" />
          <span className="font-medium">{busy ? 'Uploading…' : 'Choose an image'}</span>
          <span className="text-xs text-ink-50">JPEG, PNG or WebP · up to 8MB</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        className="sr-only"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />

      {error && (
        <p className="mt-1.5 text-xs font-medium text-danger" role="alert">
          {error}
        </p>
      )}

      {value && (
        <FormRow
          className="mt-3"
          label="Describe this image"
          required={requireAlt}
          value={alt}
          error={altError}
          onChange={(event) => onChange({ url: value, alt: event.target.value })}
          hint="Read aloud by screen readers and shown if the image fails to load. Describe what is happening, not “photo of”."
          maxLength={200}
        />
      )}
    </div>
  )
}
