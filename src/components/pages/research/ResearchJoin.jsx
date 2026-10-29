import { useRef, useState } from 'react'
import { clamp01, smoothstep, useScrub } from '../../../hooks'
import { researchJoin } from '../../../data/research'

/*
 * Closing call to action: three ways to work with the group, as panels side by side. The open
 * panel widens and shows its details; hovering or clicking another one opens it instead (on
 * phones they stack and open on tap). The heading rises in, then the panels follow one after
 * another, scrubbed by scroll. (Email and profile links are in the site footer just below.)
 */
const { eyebrow, title, intro, paths } = researchJoin
const pad = (n) => String(n).padStart(2, '0')

// entrance progress of an element: 0 when its top is at 92% of the viewport, 1 at 55%
const enter = (rect, vh) => clamp01((vh * 0.92 - rect.top) / (vh * 0.37))
const riseChildren = (v, el, step = 0.15) =>
  [...el.children].forEach((c, i) => {
    const k = smoothstep(v * 1.5 - i * step)
    c.style.opacity = k
    c.style.transform = k >= 1 ? '' : `translate3d(0, ${(1 - k) * 44}px, 0)`
  })

export default function ResearchJoin() {
  const [open, setOpen] = useState(0)
  const headRef = useRef(null)
  const panelsRef = useRef(null)

  useScrub(headRef, enter, (v, el) => riseChildren(v, el, 0.2))
  useScrub(panelsRef, enter, (v, el) => riseChildren(v, el))

  return (
    <section id="join" aria-label={eyebrow} className="bg-ink px-5 py-24 sm:px-8 md:py-32">
      <div className="mx-auto max-w-[1440px]">
        {/* heading, centred */}
        <header ref={headRef} className="mx-auto max-w-3xl text-center">
          <p className="seq-line eyebrow uppercase opacity-0">
            <span />
            {eyebrow}
            <span />
          </p>
          <h2 className="mt-5 text-[clamp(2.6rem,5.4vw,5.2rem)] leading-[1] font-normal tracking-[-0.02em] text-white opacity-0">
            {title[0]}
            <br />
            <em className="font-serif font-normal">{title[1]}</em>
            {title[2]}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[16px] leading-relaxed text-white/60 opacity-0">{intro}</p>
        </header>

        {/* three paths */}
        <div ref={panelsRef} className="mt-16 flex flex-col gap-3 lg:min-h-[min(62vh,540px)] lg:flex-row">
          {paths.map((p, i) => {
            const isOpen = open === i
            return (
              <article
                key={p.id}
                onMouseEnter={() => setOpen(i)}
                className={`join-panel relative flex min-w-0 flex-col overflow-hidden rounded-[10px] border p-7 opacity-0 sm:p-9 ${
                  isOpen ? 'is-open border-white/25 bg-white/[0.06]' : 'border-white/10 bg-white/[0.02]'
                }`}
              >
                {/* large faint number behind the content */}
                <span className="pointer-events-none absolute -right-2 -bottom-8 text-[11rem] leading-none text-white/[0.04] select-none" aria-hidden="true">
                  {pad(i + 1)}
                </span>

                <button
                  type="button"
                  onClick={() => setOpen(i)}
                  aria-expanded={isOpen}
                  className="flex cursor-pointer items-start justify-between gap-4 text-left"
                >
                  <span>
                    <span className="block font-mono text-[11px] tracking-[1.5px] text-white/45 uppercase">Path {pad(i + 1)}</span>
                    <span className="mt-3 block text-[clamp(1.4rem,1.9vw,1.9rem)] leading-[1.15] text-white">{p.title}</span>
                  </span>
                  <span className={`join-plus mt-1 grid size-9 shrink-0 place-items-center rounded-full border text-[16px] ${isOpen ? 'border-white bg-white text-ink' : 'border-white/25 text-white/70'}`} aria-hidden="true">
                    +
                  </span>
                </button>

                {/* details: shown while open */}
                <div className="join-body flex min-h-0 flex-1 flex-col">
                  <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/70">{p.lead}</p>
                  <p className="mt-6 font-mono text-[10px] tracking-[2px] text-white/40 uppercase">{p.label}</p>
                  <ul className="mt-3 max-w-xl divide-y divide-white/10 border-y border-white/10">
                    {p.points.map((pt) => (
                      <li key={pt} className="py-2.5 text-[14px] leading-snug text-white/80">
                        {pt}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={p.cta.href}
                    {...(p.cta.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
                    className="group mt-6 inline-flex w-fit items-center gap-3 rounded-full bg-white py-2.5 pr-2.5 pl-5 text-[14px] text-ink transition-colors hover:bg-white/85 lg:mt-auto lg:self-start"
                  >
                    {p.cta.label}
                    <span className="grid size-7 place-items-center rounded-full bg-ink text-white transition-transform group-hover:translate-x-0.5" aria-hidden="true">
                      →
                    </span>
                  </a>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
