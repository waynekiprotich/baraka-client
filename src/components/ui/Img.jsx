import { cn } from '@/lib/cn'

/**
 * Every image on the site goes through this component.
 *
 * Defaults are the safe ones: lazy loading, async decoding, `object-cover`, and an explicit
 * aspect ratio so nothing shifts while the file arrives. `alt` is required — pass `alt=""`
 * deliberately for a genuinely decorative image.
 *
 * The LCP image (the hero, the main gallery photo) must pass `priority`, which switches to
 * eager loading and `fetchpriority="high"`. Exactly one image per page should do that.
 *
 * @param {object} props
 * @param {string} props.src
 * @param {string} props.alt              required; '' only for decorative images
 * @param {string} [props.srcSet]         width-descriptor set, e.g. from content/media.js
 * @param {string} [props.sizes]          required whenever srcSet is set — say how big it renders
 * @param {number} [props.width]          intrinsic width, for the aspect box
 * @param {number} [props.height]         intrinsic height
 * @param {string} [props.aspect]         CSS aspect-ratio, e.g. '3 / 2' — wins over width/height
 * @param {boolean} [props.priority]      eager + fetchpriority=high, for the LCP image only
 * @param {'cover'|'contain'} [props.fit]
 * @param {string} [props.className]      classes for the <img> itself
 * @param {string} [props.wrapperClassName] set only when `caption` is used
 * @param {React.ReactNode} [props.caption] renders <figure>/<figcaption> instead of a bare img
 */
export function Img({
  src,
  alt,
  srcSet,
  sizes = '100vw',
  width,
  height,
  aspect,
  priority = false,
  fit = 'cover',
  className,
  wrapperClassName,
  caption,
  style,
  ...rest
}) {
  const image = (
    <img
      src={src}
      srcSet={srcSet || undefined}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : undefined}
      className={cn(
        'block h-full w-full bg-paper-2',
        fit === 'contain' ? 'object-contain' : 'object-cover',
        className,
      )}
      style={{ aspectRatio: aspect || (width && height ? `${width} / ${height}` : undefined), ...style }}
      {...rest}
    />
  )

  if (!caption) return image

  return (
    <figure className={cn('m-0', wrapperClassName)}>
      {image}
      <figcaption className="type-meta mt-3">{caption}</figcaption>
    </figure>
  )
}

export default Img
