import { useRef } from 'react'
import { clamp01, smoothstep, useScrub } from '../../../hooks'
import { researchCapabilities } from '../../../data/research'

/*
 * Capabilities as the group's workflow: Model → Simulate → Lay out and build → Measure.
 * A rail runs across the four stages (down the side on phones) and fills as the section scrolls
 * through; each stage's node lights up and its column rises in when the fill reaches it. The labs
 * and facilities follow as a three-column strip. All of it is scrubbed by scroll position.
 */
const { eyebrow, title, intro, stat, stages, labs } = researchCapabilities
const pad = (n) => String(n).padStart(2, '0')

// entrance progress of an element: 0 when its top is at 92% of the viewport, 1 at 62%
const enter = (rect, vh) => clamp01((vh * 0.92 - rect.top) / (vh * 0.3))
const rise = (el, e, dist = 40) => {
  el.style.opacity = e
  el.style.transform = e >= 1 ? '' : `translate3d(0, ${(1 - e) * dist}px, 0)`
}

export default function ResearchCapabilities() {
  const headRef = useRef(null)
  const flowRef = useRef(null)
  const railRef = useRef(null)
  const labsRef = useRef(null)

  useScrub(headRef, enter, (v, el) => [...el.children].forEach((c, i) => rise(c, smoothstep(v * 1.4 - i * 0.2))))

  // the rail fills as the workflow scrolls up from 85% of the viewport; on phones, where the
  // stages are stacked and much taller than the screen, it follows the list's height instead
  useScrub(
    flowRef,
    (rect, vh) => clamp01((vh * 0.85 - rect.top) / Math.max(vh * 0.5, rect.height - vh * 0.3)),
    (p, el) => {
      railRef.current.style.setProperty('--fill', p)
      ;[...el.querySelectorAll('[data-stage]')].forEach((col, i) => {
        const at = i / stages.length // where along the rail this stage starts
        rise(col, smoothstep((p - at + 0.12) / 0.22))
        col.classList.toggle('is-on', p >= at)
      })
    },
  )

  useScrub(labsRef, enter, (v, el) => [...el.children].forEach((c, i) => rise(c, smoothstep(v * 1.5 - i * 0.18), 48)))

  return (
    <section id="capabilities" aria-label={eyebrow} className="bg-ink px-5 py-24 sm:px-8 md:py-32">
      <div className="mx-auto max-w-[1440px]">
        {/* header: title on the left; intro and key figure on the right */}
        <header ref={headRef} className="grid gap-10 border-b border-white/10 pb-12 lg:grid-cols-2 lg:items-end lg:gap-16">
          <div className="opacity-0">
            <p className="eyebrow uppercase">— {eyebrow}</p>
            <h2 className="mt-4 text-[clamp(2.4rem,4.4vw,4.2rem)] leading-[1.02] font-normal text-white">
              {title[0]}
              <br />
              {title[1]}
              <em className="font-serif font-normal">{title[2]}</em>
            </h2>
          </div>
          <div className="grid gap-8 opacity-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <p className="max-w-md text-[16px] leading-relaxed text-white/60">{intro}</p>
            <div className="sm:border-l sm:border-white/15 sm:pl-8">
              <p className="text-[clamp(2.4rem,3.6vw,3.4rem)] leading-none tracking-[-0.03em] text-white">{stat.value}</p>
              <p className="mt-2 max-w-[15rem] text-[13px] leading-snug text-white/50">{stat.label}</p>
            </div>
          </div>
        </header>

        {/* workflow */}
        <div ref={flowRef} className="relative mt-16 lg:mt-20">
          <div ref={railRef} className="cap-rail" aria-hidden="true" />
          <ol className="grid gap-12 lg:grid-cols-4 lg:gap-0">
            {stages.map((s, i) => (
              <li key={s.name} data-stage className="cap-stage relative flex flex-col pl-9 opacity-0 lg:pt-12 lg:pr-8 lg:pl-0">
                <span className="cap-node" aria-hidden="true" />
                <p className="font-mono text-[11px] tracking-[2px] text-white/45 uppercase">Stage {pad(i + 1)}</p>
                <h3 className="mt-3 text-[clamp(1.6rem,2.2vw,2.1rem)] leading-[1.1] font-normal text-white">{s.name}</h3>
                <p className="mt-3 text-[14px] leading-relaxed text-white/55 lg:min-h-[4.5rem]">{s.text}</p>

                <ul className="mt-6 border-t border-white/10">
                  {s.tools.map((t) => (
                    <li key={t.name} className="flex items-baseline justify-between gap-3 border-b border-white/10 py-3">
                      <span className="text-[15px] text-white/90">{t.name}</span>
                      <span className="shrink-0 font-mono text-[10px] tracking-[1px] text-white/40 uppercase">{t.tag}</span>
                    </li>
                  ))}
                </ul>

                <p className="mt-6 lg:mt-auto lg:pt-8">
                  <span className="block font-mono text-[10px] tracking-[2px] text-white/35 uppercase">Where</span>
                  <span className="mt-1 block text-[13px] leading-snug text-white/65">{s.where}</span>
                </p>
              </li>
            ))}
          </ol>
        </div>

        {/* labs and facilities */}
        <div className="mt-24 lg:mt-32">
          <div className="flex items-center gap-4">
            <p className="font-mono text-[11px] tracking-[2px] text-white/70 uppercase">Labs and facilities</p>
            <span className="h-px flex-1 bg-white/10" />
            <p className="font-mono text-[11px] tracking-[1px] text-white/40">{pad(labs.length)}</p>
          </div>
          <div ref={labsRef} className="mt-10 grid gap-10 md:grid-cols-3 md:gap-0">
            {labs.map((l, i) => (
              <article key={l.name} className="flex flex-col opacity-0 md:border-l md:border-white/10 md:px-8 md:first:border-l-0 md:first:pl-0">
                <p className="font-mono text-[12px] text-white/35">{pad(i + 1)}</p>
                <h3 className="mt-4 text-[22px] leading-[1.2] font-normal text-white">{l.name}</h3>
                <p className="mt-1 font-serif text-[15px] text-white/50 italic">{l.place}</p>
                <p className="mt-4 mb-6 text-[14px] leading-relaxed text-white/60">{l.text}</p>
                <p className="mt-auto font-mono text-[10px] tracking-[1.5px] text-white/45 uppercase">{l.role}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
