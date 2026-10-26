import { useRef } from 'react'
import { clamp01, smoothstep, useScrub } from '../hooks'
import GenesisScene from './GenesisScene'

/*
 * Arox "The genesis of impact": a particle render with a frosted glass card over it.
 *  - the render drifts slowly (parallax) across the section's pass
 *  - it fades in and settles up 36px as the section arrives
 *  - the glass card (5% white, blur 8px, saturate 150%, bevelled edge) fades in and rises
 *    gently through the ring
 *  - top and bottom fade into the page colour so the section merges with its neighbours
 */
export default function Genesis() {
  const sectionRef = useRef(null)
  const driftRef = useRef(null)
  const fadeRef = useRef(null)
  const cardRef = useRef(null)

  // parallax drift of the render
  useScrub(
    sectionRef,
    (rect, vh) => clamp01((vh - rect.top) / (rect.height + vh)),
    (p) => (driftRef.current.style.transform = `translate3d(0, ${-80 + 160 * p}px, 0)`),
    { rest: 0.5 },
  )

  // render fade-in as the section arrives
  useScrub(
    sectionRef,
    (rect, vh) => smoothstep((vh * 0.95 - rect.top) / (vh * 0.32)),
    (p) => {
      fadeRef.current.style.opacity = p
      fadeRef.current.style.transform = `translate3d(0, ${36 * (1 - p)}px, 0)`
    },
  )

  // glass card: centred in the ring, fades in and drifts up ~140px across the pass
  useScrub(
    sectionRef,
    (rect, vh) => (vh - rect.top) / (rect.height + vh),
    (p) => {
      const card = cardRef.current
      const vh = window.innerHeight
      const top = sectionRef.current.getBoundingClientRect().top
      card.style.opacity = smoothstep((vh * 0.75 - top) / (vh * 0.45))
      card.style.transform = `translate(-50%, calc(-50% + ${(0.5 - clamp01(p)) * 140}px))`
    },
    { rest: 0.5 },
  )

  return (
    <section id="impact" ref={sectionRef} className="relative h-[100lvh] min-h-[640px] overflow-hidden bg-ink lg:h-[110lvh]">
      <div ref={driftRef} className="absolute inset-x-0 -top-[80px] -bottom-[80px] will-change-transform">
        <div ref={fadeRef} className="h-full w-full opacity-0">
          <GenesisScene className="h-full w-full" />
        </div>
      </div>

      {/* blend the render into the sections above and below */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[22%] bg-gradient-to-b from-ink to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[22%] bg-gradient-to-t from-ink to-transparent" />

      <div
        ref={cardRef}
        style={{ transform: 'translate(-50%, -50%)' }}
        className="glass absolute top-1/2 left-1/2 flex w-[min(88%,357px)] flex-col gap-3 rounded-[0.5rem] px-5 py-6 opacity-0 will-change-transform md:w-[min(80%,470px)] md:px-6 lg:w-[min(46%,34rem)] lg:px-[clamp(1.5rem,2.6vw,2.25rem)] lg:py-[clamp(1.4rem,2.4vw,2rem)]"
      >
        <h2 className="text-[1.75rem] leading-[1.2] font-normal text-white lg:text-[clamp(1.5rem,2.6vw,1.875rem)]">
          From the lab to <span className="font-serif italic">industry</span>
        </h2>
        <div className="text-[16px] leading-[1.25] text-[rgba(204,204,204,0.95)]">
          <p>
            Nano Semic, co-founded by Dr. Akshay K. and Dr. Sayan Dey at the IIT Bhubaneswar Research and
            Entrepreneurship Park, offers semiconductor products and services to industry.
          </p>
          <p className="mt-[0.65em]">
            Developed through Nano Semic: ArsenSafe, a hand-held arsenic detector built on sensor research from Dr.
            Dey’s group.
          </p>
        </div>
        <div className="mt-auto flex flex-col gap-[0.2em] pt-[0.875rem] font-mono text-[0.875rem] leading-[1.1] font-light tracking-[0.05em] text-[rgba(140,140,140,0.95)] uppercase">
          <time dateTime="2026-06-10">June 10th, 2026</time>
          <span>IIT Bhubaneswar - Odisha</span>
        </div>
      </div>
    </section>
  )
}
