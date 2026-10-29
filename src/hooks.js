import { useEffect, useRef, useState } from 'react'

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const clamp01 = (v) => Math.min(Math.max(v, 0), 1)
export const smoothstep = (v) => {
  const t = clamp01(v)
  return t * t * (3 - 2 * t)
}

// One shared requestAnimationFrame loop for every scroll-linked effect, so they all update
// in the same frame (the way a single GSAP ticker drives Arox's ScrollTriggers).
const subscribers = new Set()
let ticking = false
const loop = () => {
  subscribers.forEach((fn) => fn())
  if (subscribers.size) requestAnimationFrame(loop)
  else ticking = false
}
export function onFrame(fn) {
  subscribers.add(fn)
  if (!ticking) {
    ticking = true
    requestAnimationFrame(loop)
  }
  return () => subscribers.delete(fn)
}

/**
 * Scroll-scrubbed animation with eased catch-up, like ScrollTrigger's `scrub: true` smoothing.
 * `progress(rect, vh)` maps the element's viewport rect to a target value each frame; the hook
 * eases toward it and calls `apply(value, el)` when it changes. With reduced motion the
 * `rest` value is applied once and nothing animates, unless `follow` is set: then the value
 * tracks the scroll position directly, without easing (for pinned sections whose content is
 * only reachable by scrolling through them).
 */
export function useScrub(ref, progress, apply, { smoothing = 0.12, rest = 1, follow = false } = {}) {
  const fns = useRef({ progress, apply })
  useEffect(() => {
    fns.current = { progress, apply }
  })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduced = prefersReducedMotion()
    if (reduced && !follow) {
      fns.current.apply(rest, el)
      return
    }
    const ease = reduced ? 1 : smoothing
    let value = null
    let last = null
    return onFrame(() => {
      const target = fns.current.progress(el.getBoundingClientRect(), window.innerHeight)
      value = value === null ? target : value + (target - value) * ease
      if (Math.abs(target - value) < 0.0004) value = target
      if (last === null || Math.abs(value - last) > 0.0002) {
        last = value
        fns.current.apply(value, el)
      }
    })
  }, [ref, smoothing, rest, follow])
}

/**
 * Arox card entrance: every direct child fades in and rises 32px together, scrubbed while the
 * group's top travels from 82% to 30% of the viewport height.
 */
export function useCardsReveal(ref, stagger = 0) {
  useScrub(
    ref,
    (rect, vh) => clamp01((vh * 0.82 - rect.top) / (vh * 0.52)),
    (v, el) => {
      const kids = [...el.children]
      kids.forEach((child, i) => {
        // with a stagger each child starts a little later than the one before it
        const p = smoothstep(v * (1 + stagger * (kids.length - 1)) - i * stagger)
        child.style.opacity = p
        child.style.transform = p >= 1 ? '' : `translate3d(0, ${32 * (1 - p)}px, 0)`
      })
    },
  )
}

// [ref, shown]: `shown` turns true once the element scrolls into view (one-shot, time-based reveals).
export function useReveal(threshold = 0.25) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])
  return [ref, shown]
}
