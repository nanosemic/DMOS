import { useRef, useState } from 'react'
import { projects, researchIntro, themes } from '../../../data/site'
import { clamp01, smoothstep, useCardsReveal, useScrub } from '../../../hooks'
import ThemeArt from './ThemeArt'

const DESKTOP = 1024

// Arox "application notes" layout: a featured text card beside narrow image cards.
// On desktop the section pins while you scroll and steps through the five themes one by one
// (counter + progress bar); the image cards grow up into view one after another as the section
// arrives. Hover / click still pick a theme directly. On phones it scrolls normally.
export default function Research() {
  const [active, setActive] = useState(0)
  const trackRef = useRef(null)
  const featuredRef = useRef(null)
  const stripsRef = useRef(null)
  const barRef = useRef(null)
  const scrollIndex = useRef(0)
  const projectsRef = useRef(null)
  useCardsReveal(projectsRef, 0.25)
  const theme = themes[active]

  // pinned tour: scroll progress through the tall track picks the theme
  useScrub(
    trackRef,
    (rect, vh) => (window.innerWidth >= DESKTOP ? clamp01(-rect.top / Math.max(rect.height - vh, 1)) : 0),
    (p) => {
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`
      if (window.innerWidth < DESKTOP) return
      const i = Math.min(themes.length - 1, Math.floor(p * themes.length))
      if (i !== scrollIndex.current) {
        scrollIndex.current = i
        setActive(i)
      }
    },
    { smoothing: 0.18, rest: 0 },
  )

  // entrance: featured card rises in, image cards grow up one after another
  useScrub(
    trackRef,
    (rect, vh) => clamp01((vh * 0.95 - rect.top) / (vh * 0.65)),
    (e) => {
      const f = smoothstep(e * 1.4)
      featuredRef.current.style.opacity = f
      featuredRef.current.style.transform = f >= 1 ? '' : `translate3d(0, ${40 * (1 - f)}px, 0)`
      ;[...stripsRef.current.children].forEach((strip, i) => {
        const s = smoothstep(e * 1.8 - 0.2 - i * 0.14)
        strip.style.clipPath = s >= 1 ? '' : `inset(${(1 - s) * 100}% 0 0 0 round 10px)`
        strip.style.transform = s >= 1 ? '' : `translate3d(0, ${70 * (1 - s)}px, 0)`
      })
    },
  )

  return (
    <section id="research" className="bg-ink">
      {/* tall track on desktop: the stage stays pinned while the themes step through */}
      <div ref={trackRef} className="relative lg:h-[330vh]">
        <div className="px-4 py-16 sm:px-8 md:py-24 lg:sticky lg:top-0 lg:flex lg:h-screen lg:items-center lg:pt-20 lg:pb-6">
          <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 lg:h-[min(680px,calc(100vh-130px))] lg:flex-row">
            {/* Featured card */}
            <div ref={featuredRef} className="card flex shrink-0 flex-col p-8 md:p-10 lg:w-[44%] lg:overflow-hidden">
              <div className="flex items-center justify-between">
                <p className="eyebrow uppercase">Research</p>
                <p className="eyebrow tabular-nums">
                  <span className="text-white">{theme.code}</span> / {String(themes.length).padStart(2, '0')}
                </p>
              </div>
              {/* scroll progress through the five themes */}
              <div className="mt-3 h-px w-full bg-white/10">
                <div ref={barRef} className="h-px w-full origin-left scale-x-0 bg-white/70" />
              </div>

              <h2 className="card-title mt-6">
                What we <span className="font-serif italic">work on</span>
              </h2>
              <p className="card-text mt-4">{researchIntro}</p>

              {/* the five themes, always visible */}
              <ul className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Research themes">
                {themes.map((t, i) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={active === i}
                      onClick={() => setActive(i)}
                      onMouseEnter={() => setActive(i)}
                      className={`rounded-full border px-3 py-1.5 text-[13px] transition-colors duration-300 ${
                        active === i ? 'border-white bg-white text-ink' : 'border-white/20 text-white/75 hover:border-white/50'
                      }`}
                    >
                      {t.title}
                    </button>
                  </li>
                ))}
              </ul>

              <div key={theme.id} className="mt-8 animate-[rise_0.6s_ease_both] border-t border-white/10 pt-6">
                <p className="eyebrow">Theme {theme.code}</p>
                <h3 className="mt-2 text-xl text-white">{theme.title}</h3>
                <p className="card-text mt-3 text-[15px] leading-relaxed">{theme.text}</p>
              </div>

              <p className="eyebrow mt-auto hidden pt-6 lg:block">Scroll to explore each theme ↓</p>
            </div>

            {/* Image cards */}
            <div ref={stripsRef} className="flex h-[300px] gap-3 sm:h-[380px] lg:h-full lg:flex-1 lg:gap-5" aria-hidden="true">
              {themes.map((t, i) => {
                const on = active === i
                // active card is full height; the first rest card is a little taller, like Arox's
                const height = on ? 'lg:h-full' : i === 0 ? 'lg:h-[74%]' : 'lg:h-[65%]'
                return (
                  <button
                    key={t.id}
                    type="button"
                    tabIndex={-1}
                    // onMouseEnter={() => setActive(i)}
                    // onClick={() => setActive(i)}
                    className={`card group relative h-full min-w-0 basis-0 self-start overflow-hidden text-left transition-[flex-grow,height] duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)] ${height} ${
                      on ? 'grow-[3.5]' : 'grow'
                    }`}
                  >
                    <div
                      className={`absolute inset-0 transition-[opacity,transform] duration-1000 ${
                        on ? 'scale-100 opacity-100' : 'scale-110 opacity-50 group-hover:opacity-75'
                      }`}
                    >
                      <ThemeArt pattern={t.pattern} />
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 to-transparent" />
                    <span
                      className={`absolute bottom-4 left-4 text-[14px] leading-snug text-white transition-all duration-500 ${
                        on ? 'max-w-[90%] translate-y-0 opacity-100 delay-200' : 'max-w-0 translate-y-2 opacity-0'
                      }`}
                    >
                      <span className="eyebrow block text-white/60">{t.code}</span>
                      <span className="block whitespace-nowrap">{t.short}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* What they are working on right now */}
      <div className="mx-auto max-w-[1440px] px-4 pb-16 sm:px-8 md:pb-24 lg:pt-16">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <h3 className="text-[clamp(1.4rem,2vw,1.75rem)] text-white">
            Current <span className="font-serif italic">projects</span>
          </h3>
          <p className="eyebrow">Led by Dr. Akshay K. as principal investigator</p>
        </div>
        <div ref={projectsRef} className="mt-6 grid gap-5 md:grid-cols-3">
          {projects.map((p) => (
            <article key={p.title} className="card flex flex-col p-7">
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-[15px] text-white">{p.funder}</span>
                <span className="eyebrow whitespace-nowrap">{p.period}</span>
              </div>
              <p className="mt-5 text-[17px] leading-snug text-white/90">{p.title}</p>
              {p.note && <p className="eyebrow mt-auto pt-5 text-[12px]">{p.note}</p>}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
