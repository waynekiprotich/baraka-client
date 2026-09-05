import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/cn'

/**
 * Scroll reveal: opacity plus an 8px rise, once, on section-level blocks only.
 *
 * Do not wrap every element on a page in this (SPEC §3 lists that as a build failure). It is
 * for a handful of major bands.
 *
 * Anyone who has asked for reduced motion — and anyone whose browser lacks
 * IntersectionObserver — sees the content immediately, with no transition at all.
 *
 * @param {object} props
 * @param {React.ElementType} [props.as]
 * @param {number} [props.delay] ms, keep under 200
 * @param {string} [props.className]
 */
export function Reveal({ as: Tag = 'div', delay = 0, className, children, ...rest }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(() => {
    if (typeof window === 'undefined') return true
    if (!('IntersectionObserver' in window)) return true
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    if (shown) return undefined
    const node = ref.current
    if (!node) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true)
            observer.disconnect()
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [shown])

  return (
    <Tag
      ref={ref}
      className={cn(
        'transition-[opacity,transform] duration-[200ms] ease-editorial',
        shown ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
        className,
      )}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  )
}

export default Reveal
