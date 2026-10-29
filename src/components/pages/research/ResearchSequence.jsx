import { useRef } from 'react'
import { clamp01, smoothstep, useScrub } from '../../../hooks'
import { researchSequence } from '../../../data/research'
import DeviceScene from './DeviceScene'

/*
 * Pinned scroll sequence (after the reference's image-sequence section). The stage stays on
 * screen for ~6 screens of scroll while the same 3D device comes apart layer by layer:
 *   0.00–0.13  intro line + title
 *   0.13–0.85  four stages; each lights up one layer and shows its explanation + key stat
 *   0.85–1.00  the device settles back and four totals rise in
 * Everything is scrubbed by scroll position (eased), so scrolling back plays it in reverse.
 */
const { intro, stages, totals } = researchSequence
const INTRO_END = 0.13
const STAGE_LEN = (0.85 - INTRO_END) / stages.length
const OUTRO = 0.85

export default function ResearchSequence() {
  const trackRef = useRef(null)
  const sceneRef = useRef(null)
  const introRef = useRef(null)
  const stagesRef = useRef(null)
  const railRef = useRef(null)
  const fillRef = useRef(null)
  const totalsRef = useRef(null)
  const explodeRef = useRef(0)
  const spinRef = useRef(0)
  const highlightRef = useRef(null)

  useScrub(
    trackRef,
    (rect, vh) => clamp01(-rect.top / Math.max(rect.height - vh, 1)),
    (p) => {
      const outro = smoothstep((p - OUTRO) / 0.1)
      explodeRef.current = smoothstep((p - 0.04) / 0.22) * (1 - 0.5 * outro)
      spinRef.current = p * 1.1

      // intro: visible on arrival, lifts away as the device opens
      const io = 1 - smoothstep((p - 0.05) / 0.07)
      introRef.current.style.opacity = io
      introRef.current.style.transform = `translate3d(0, ${-40 * (1 - io)}px, 0)`

      // stages: fade + rise in, fade + lift out; the last one holds until the outro
      let active = -1
      ;[...stagesRef.current.children].forEach((el, i) => {
        const local = (p - (INTRO_END + i * STAGE_LEN)) / STAGE_LEN
        const inO = smoothstep(local / 0.2)
        const outO = i === stages.length - 1 ? 1 - smoothstep((p - OUTRO) / 0.05) : 1 - smoothstep((local - 0.8) / 0.2)
        const o = Math.min(inO, outO)
        el.style.opacity = o
        el.style.transform = `translate3d(0, ${(1 - inO) * 40 - (1 - outO) * 40}px, 0)`
        el.style.visibility = o < 0.01 ? 'hidden' : 'visible'
        if (local >= 0 && local < 1) active = i
      })
      if (p >= OUTRO) active = -1
      highlightRef.current = active >= 0 ? stages[active].layer : null

      // progress rail
      fillRef.current.style.transform = `scaleY(${clamp01((p - INTRO_END) / (OUTRO - INTRO_END))})`
      ;[...railRef.current.querySelectorAll('[data-tick]')].forEach((t, i) => t.classList.toggle('is-active', i === active))
      railRef.current.style.opacity = Math.min(smoothstep((p - 0.08) / 0.05), 1 - outro)

      // finale: device dims, totals rise in one after another
      sceneRef.current.style.opacity = 1 - 0.88 * outro // dim far enough for the totals to read
      ;[...totalsRef.current.children].forEach((el, i) => {
        const t = smoothstep((p - OUTRO - 0.02 - i * 0.015) / 0.07)
        el.style.opacity = t
        el.style.transform = `translate3d(0, ${(1 - t) * 50}px, 0)`
      })
    },
    { smoothing: 0.14, rest: 0.5, follow: true },
  )

  return (
    <section aria-label="Inside the device" className="bg-ink">
      <div ref={trackRef} className="relative h-[620vh]">
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          <div ref={sceneRef} className="absolute inset-x-0 top-0 bottom-[42%] lg:bottom-0 lg:left-[18%]">
            <DeviceScene
              className="h-full w-full"
              explodeRef={explodeRef}
              spinRef={spinRef}
              highlightRef={highlightRef}
              lookAtY={0.9}
            />
          </div>
          {/* soft fades so the text stays readable over the model */}
          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[55%] bg-gradient-to-r from-ink via-ink/70 to-transparent lg:block" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-ink via-ink/80 to-transparent lg:hidden" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink to-transparent" />

          {/* intro */}
          <div ref={introRef} className="absolute inset-x-0 top-[16%] px-5 text-center">
            <p className="seq-line eyebrow uppercase">
              <span />
              {intro.label}
              <span />
            </p>
            <h2 className="mt-4 text-[clamp(2rem,3.6vw,3.6rem)] leading-[1.05] font-normal text-white">{intro.title}</h2>
            <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-white/60">{intro.text}</p>
          </div>

          {/* stages, stacked in one grid cell so the panel keeps the tallest height */}
          <div className="absolute inset-x-0 bottom-[8%] px-5 sm:px-8 lg:top-1/2 lg:bottom-auto lg:left-[5vw] lg:w-[min(36%,520px)] lg:-translate-y-1/2 lg:px-0">
            <div ref={stagesRef} className="grid">
              {stages.map((s, i) => (
                <article key={s.layer} className="[grid-area:1/1] opacity-0" style={{ visibility: 'hidden' }}>
                  <p className="eyebrow uppercase">
                    {String(i + 1).padStart(2, '0')} / {String(stages.length).padStart(2, '0')} — {s.label}
                  </p>
                  <h3 className="mt-3 text-[clamp(1.6rem,2.6vw,2.4rem)] leading-[1.1] font-normal text-white">{s.title}</h3>
                  <p className="mt-4 text-[15px] leading-relaxed text-white/65">{s.text}</p>
                  <div className="mt-6 border-t border-white/10 pt-5">
                    <p className="text-[clamp(2rem,3.4vw,3.2rem)] leading-none text-white">{s.stat}</p>
                    <p className="eyebrow mt-2 text-[12px]">{s.statLabel}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* progress rail (desktop) */}
          <div ref={railRef} className="absolute top-1/2 right-[3vw] hidden -translate-y-1/2 opacity-0 lg:flex lg:items-stretch lg:gap-4">
            <div className="relative w-px bg-white/15">
              <div ref={fillRef} className="absolute inset-0 origin-top scale-y-0 bg-white/80" />
            </div>
            <ol className="flex flex-col justify-between gap-10 py-1">
              {stages.map((s, i) => (
                <li key={s.layer} data-tick className="seq-tick font-mono text-[11px] tracking-[0.7px]">
                  {String(i + 1).padStart(2, '0')} <span className="ml-1">{s.label}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* finale */}
          <div
            ref={totalsRef}
            className="pointer-events-none absolute inset-x-0 top-1/2 mx-auto grid max-w-5xl -translate-y-1/2 grid-cols-2 gap-y-10 px-5 text-center md:grid-cols-4"
          >
            {totals.map((t) => (
              <div key={t.label} className="opacity-0">
                <p className="text-[clamp(3rem,6vw,5.5rem)] leading-none font-normal text-white">{t.value}</p>
                <p className="eyebrow mt-3 uppercase">{t.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
