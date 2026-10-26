import { useEffect, useRef } from 'react'
import ChipScene from './ChipScene'
import { clamp01, onFrame, prefersReducedMotion } from '../hooks'
import { hero, pi } from '../data/site'

const DESKTOP = 1024
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/*
 * Arox hero, step for step:
 *  - the stage is pinned while the next section slides up over it
 *  - on desktop the headline starts split: one half on the left edge, one on the right, with the
 *    chip film between them; over the first ~95% of a screen of scroll both halves slide inward
 *    until they meet as one centred line, and the label glides from the left edge to the centre
 *  - a single wheel tick glides the page all the way to the next section (and back up again)
 */
export default function Hero() {
  const sectionRef = useRef(null)
  const labelRef = useRef(null)
  const leftRef = useRef(null)
  const rightRef = useRef(null)

  // Split headline joining on scroll
  useEffect(() => {
    const label = labelRef.current
    const left = leftRef.current
    const right = rightRef.current
    const reduced = prefersReducedMotion()
    let join = 0
    let labelShift = 0
    let value = 0

    const measure = () => {
      for (const el of [label, left, right]) el.style.transform = ''
      if (window.innerWidth < DESKTOP) {
        join = labelShift = 0
        return
      }
      const l = left.getBoundingClientRect()
      const r = right.getBoundingClientRect()
      const space = parseFloat(getComputedStyle(left).fontSize) * 0.28
      join = Math.max(0, (r.left - l.right - space) / 2)
      const lab = label.getBoundingClientRect()
      labelShift = window.innerWidth / 2 - lab.width / 2 - lab.left
    }

    const apply = (p) => {
      left.style.transform = `translate3d(${join * p}px,0,0)`
      right.style.transform = `translate3d(${-join * p}px,0,0)`
      label.style.transform = `translate3d(${labelShift * p}px,0,0)`
    }

    measure()
    if (reduced) {
      apply(1)
      return
    }
    const onResize = () => {
      measure()
      apply(value)
    }
    window.addEventListener('resize', onResize)
    document.fonts?.ready.then(onResize)
    const stop = onFrame(() => {
      const target = clamp01(window.scrollY / (window.innerHeight * 0.95))
      value += (target - value) * 0.12
      if (Math.abs(target - value) < 0.0005) value = target
      apply(value)
    })
    return () => {
      stop()
      window.removeEventListener('resize', onResize)
    }
  }, [])

  // One wheel tick glides between the top of the page and the next section (desktop mouse only)
  useEffect(() => {
    if (prefersReducedMotion() || !window.matchMedia('(pointer: fine)').matches) return
    let animating = false
    const snapEnd = () => sectionRef.current.offsetHeight - window.innerHeight

    const glideTo = (target) => {
      animating = true
      const from = window.scrollY
      const start = performance.now()
      const duration = 1400
      const step = (now) => {
        const t = Math.min((now - start) / duration, 1)
        window.scrollTo({ top: from + (target - from) * easeInOutCubic(t), behavior: 'instant' })
        if (t < 1) requestAnimationFrame(step)
        else animating = false
      }
      requestAnimationFrame(step)
    }

    const onWheel = (e) => {
      if (window.innerWidth < DESKTOP || e.ctrlKey) return
      const end = snapEnd()
      const y = window.scrollY
      if (animating) {
        e.preventDefault()
        return
      }
      if (e.deltaY > 0 && y < end - 4) {
        e.preventDefault()
        glideTo(end)
      } else if (e.deltaY < 0 && y > 4 && y <= end + 4) {
        e.preventDefault()
        glideTo(0)
      }
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    return () => window.removeEventListener('wheel', onWheel)
  }, [])

  return (
    // 160svh of pinned scroll on desktop (100svh on mobile) + the 100svh the next section overlaps
    <section id="top" ref={sectionRef} className="relative h-[200svh] bg-ink lg:h-[260svh]">
      <div className="sticky top-0 h-[100svh] min-h-[560px] overflow-hidden">
        <ChipScene className="absolute inset-0" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(15,15,17,0.55)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink to-transparent lg:hidden" />

        <div className="absolute inset-x-0 bottom-20 px-5 sm:px-10 lg:top-1/2 lg:bottom-auto lg:-translate-y-1/2 lg:px-24">
          <div className="hero-rise">
            <p
              ref={labelRef}
              className="w-fit font-mono text-[clamp(1.1rem,1.6vw,1.5rem)] leading-none font-light tracking-[-0.05em] text-white/70 will-change-transform"
            >
              {pi.name}
            </p>
          </div>
          <h1
            aria-label={`${hero.left} ${hero.right}`}
            className="hero-rise mt-4 text-[2.5rem] leading-[1.04] font-normal text-white [animation-delay:150ms] lg:mt-5 lg:flex lg:justify-between lg:text-[3.25rem] lg:leading-none lg:whitespace-nowrap"
          >
            <span ref={leftRef} className="inline-block will-change-transform" aria-hidden="true">
              {hero.left}
            </span>{' '}
            <span ref={rightRef} className="inline-block will-change-transform" aria-hidden="true">
              {hero.right}
            </span>
          </h1>
          <p className="hero-rise eyebrow mt-5 max-w-xs [animation-delay:300ms] lg:hidden">{hero.caption}</p>
        </div>

        {/* who they are, centred under the joined headline on desktop */}
        <p className="hero-rise eyebrow absolute inset-x-0 bottom-10 hidden text-center [animation-delay:300ms] lg:block">
          {hero.caption}
        </p>
      </div>
    </section>
  )
}
