import { useRef } from 'react'
import { clamp01, smoothstep, useScrub } from '../../../hooks'
import { researchProjects } from '../../../data/research'

/*
 * Current projects as a row of project files that slides sideways. On desktop the section pins
 * for three screens: the heading, a counter and a progress line stay on the left while the cards
 * move across from the right. Each card's ring fills to the share of the project already elapsed
 * as the card arrives, and its mini timeline marks today. On phones the cards simply stack.
 * Everything is scrubbed by scroll position, so scrolling back reverses it.
 */
const { eyebrow, title, intro, projects } = researchProjects

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const toMonth = (ym) => {
  const [y, m] = ym.split('-').map(Number)
  return y * 12 + m - 1
}
const label = (ym) => `${MONTHS[Number(ym.slice(5)) - 1]} ${ym.slice(0, 4)}`
const now = new Date()
const TODAY = now.getFullYear() * 12 + now.getMonth()
const pad = (n) => String(n).padStart(2, '0')
const isDesktop = () => window.innerWidth >= 1024
const RING = 2 * Math.PI * 44 // circumference of the progress ring (r = 44)

function Card({ p, index }) {
  const ref = useRef(null)
  const s = toMonth(p.start)
  const e = toMonth(p.end)
  const done = clamp01((TODAY - s) / (e - s)) // share of the project already elapsed
  const years = (e - s) / 12

  // arrival: from the right on desktop (the row slides), from below on phones
  useScrub(
    ref,
    (rect, vh) =>
      isDesktop()
        ? clamp01((window.innerWidth * 0.98 - rect.left) / (window.innerWidth * 0.4))
        : clamp01((vh * 0.92 - rect.top) / (vh * 0.4)),
    (v, el) => {
      const k = smoothstep(v)
      el.style.setProperty('--k', k)
      el.style.opacity = 0.25 + 0.75 * k
    },
  )

  const facts = [
    ['Role', 'Principal Investigator'],
    ['Amount', p.amount ?? 'Not disclosed'],
    ['Period', `${label(p.start)} – ${label(p.end)}`],
    ['Duration', `${years} years`],
  ]

  return (
    <article ref={ref} className="proj-card card flex w-full shrink-0 flex-col p-7 opacity-25 sm:p-9 lg:h-[min(72vh,620px)] lg:w-[min(38vw,540px)]">
      {/* top line */}
      <div className="flex items-center justify-between font-mono text-[11px] tracking-[1.5px] uppercase">
        <span className="text-white/45">Project {pad(index + 1)}</span>
        <span className="flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-white/75">
          <span className="proj-live size-1.5 rounded-full bg-white" />
          Ongoing
        </span>
      </div>

      {/* funder and title */}
      <h3 className="mt-8 text-[clamp(2rem,3vw,2.9rem)] leading-none font-normal tracking-[-0.02em] text-white">{p.funder}</h3>
      <p className="mt-2 font-serif text-[16px] text-white/50 italic">{p.kind}</p>
      <p className="mt-5 text-[15px] leading-relaxed text-white/80 lg:text-[clamp(14px,1.9vh,16px)]">{p.title}</p>

      {/* ring + facts */}
      <div className="mt-auto grid grid-cols-[auto_minmax(0,1fr)] items-center gap-5 pt-8 sm:gap-7">
        <div className="relative size-20 sm:size-28">
          <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden="true">
            <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
            <circle
              className="proj-ring"
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="#fff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={RING}
              style={{ '--done': done * RING, '--ring': RING }}
            />
          </svg>
          <p className="absolute inset-0 grid place-content-center text-center">
            <span className="text-[18px] leading-none text-white sm:text-[22px]">{Math.round(done * 100)}%</span>
            <span className="mt-1 font-mono text-[9px] tracking-[1px] text-white/45 uppercase">Elapsed</span>
          </p>
        </div>
        <dl className="divide-y divide-white/10 border-y border-white/10">
          {facts.map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-3 py-2">
              <dt className="font-mono text-[10px] tracking-[1.5px] text-white/40 uppercase">{k}</dt>
              <dd className="text-right text-[13px] text-white/85">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* mini timeline */}
      <div className="mt-7">
        <div className="relative h-px bg-white/15">
          <span className="proj-line absolute inset-y-0 left-0 bg-white" style={{ width: `${done * 100}%` }} />
          <span className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_0_4px_rgba(255,255,255,0.12)]" style={{ left: `calc(${done * 100}% * var(--k, 0))` }} />
        </div>
        <div className="mt-3 flex justify-between font-mono text-[10px] tracking-[1px] text-white/40">
          <span>{label(p.start)}</span>
          <span className="text-white/70">Today</span>
          <span>{label(p.end)}</span>
        </div>
      </div>

      {p.note && <p className="mt-5 font-serif text-[13px] leading-snug text-white/45 italic">{p.note}</p>}
    </article>
  )
}

export default function ResearchProjects() {
  const trackRef = useRef(null)
  const rowRef = useRef(null)
  const countRef = useRef(null)
  const barRef = useRef(null)

  useScrub(
    trackRef,
    (rect, vh) => clamp01(-rect.top / Math.max(rect.height - vh, 1)),
    (p) => {
      const row = rowRef.current
      if (!isDesktop()) {
        row.style.transform = ''
        return
      }
      // slide the row so its last card ends at the right edge when the pin ends
      const travel = Math.max(0, row.scrollWidth - row.parentElement.clientWidth)
      row.style.transform = `translate3d(${-p * travel}px, 0, 0)`
      barRef.current.style.transform = `scaleX(${p})`
      countRef.current.textContent = pad(Math.min(projects.length, Math.floor(p * (projects.length - 0.001)) + 1))
    },
    { smoothing: 0.12, rest: 0, follow: true },
  )

  return (
    <section id="projects" aria-label={eyebrow} className="bg-ink">
      <div ref={trackRef} className="relative lg:h-[300vh]">
        <div className="flex flex-col gap-12 px-5 py-24 sm:px-8 lg:sticky lg:top-0 lg:h-[100svh] lg:flex-row lg:items-center lg:gap-16 lg:overflow-hidden lg:py-0 lg:pl-[5vw]">
          {/* left: heading, counter and progress (stays while the cards slide) */}
          <div className="lg:w-[30%] lg:shrink-0">
            <p className="eyebrow uppercase">— {eyebrow}</p>
            <h2 className="mt-4 text-[clamp(2.4rem,4vw,4rem)] leading-[1.02] font-normal text-white">
              {title[0]}
              <br />
              <em className="font-serif font-normal">{title[1]}</em>
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/60">{intro}</p>
            <div className="mt-12 hidden lg:block">
              <p className="text-[clamp(3rem,5vw,4.6rem)] leading-none tracking-[-0.03em] text-white">
                <span ref={countRef}>01</span>
                <span className="text-white/30"> / {pad(projects.length)}</span>
              </p>
              <div className="mt-5 h-px w-full max-w-xs bg-white/15">
                <div ref={barRef} className="h-full origin-left scale-x-0 bg-white" />
              </div>
              <p className="mt-4 font-mono text-[11px] tracking-[1.5px] text-white/40 uppercase">Scroll to browse</p>
            </div>
          </div>

          {/* right: the cards, clipped to this area and fading out at its left edge */}
          <div className="min-w-0 lg:flex-1 lg:self-stretch lg:overflow-hidden lg:[mask-image:linear-gradient(to_right,transparent,#000_7%)]">
            <div ref={rowRef} className="flex flex-col gap-6 will-change-transform lg:h-full lg:flex-row lg:items-center lg:pr-[5vw] lg:pl-16">
              {projects.map((p, i) => (
                <Card key={p.title} p={p} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
