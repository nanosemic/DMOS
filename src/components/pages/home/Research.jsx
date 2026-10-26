import { useRef, useState } from 'react'
import { projects, researchIntro, themes } from '../../../data/site'
import { clamp01, smoothstep, useCardsReveal, useScrub } from '../../../hooks'
import ThemeArt from './ThemeArt'
import { ArrowUpRight } from 'lucide-react'

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
  useCardsReveal(projectsRef, 0.05)
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

<section className="mx-auto max-w-[1440px] px-4 pb-20 sm:px-8 md:pb-28 lg:pt-20">
  {/* Section heading */}
  <div className="flex flex-col justify-between gap-6 border-b border-white/15 pb-8 md:flex-row md:items-end">
    <div>
      <h3 className="card-title ">
        Current <span className="font-serif italic ">projects.</span>
      </h3>
      <p className="eyebro mt-3 text-zinc-400">
        Principal Investigator <span className="text-zinc-500">/</span>{" "}
        Dr. Akshay K.
      </p>
    </div>

    <div className="max-w-sm md:text-right">
        <button
    type="button"
    className="group mt-12 inline-flex w-fit cursor-pointer items-center gap-3
      rounded-md border border-[#292d30] bg-transparent
      px-4 py-2.5 text-sm font-normal text-[#f0f0f0]
      transition-colors duration-150 ease-out
      hover:border-[#6e727a] hover:text-white"
  >
    <span>View All Projects</span>
    <ArrowUpRight
      size={15}
      strokeWidth={1.5}
      className="text-[#a1a4a5] transition-transform duration-150
        group-hover:-translate-y-0.5 group-hover:translate-x-0.5
        group-hover:text-white"
    />
  </button>
    </div>
  </div>

  {/* Project cards */}
  <div ref={projectsRef} className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {projects.map((p, i) => (
      <article
        key={p.title}
        className="group relative flex min-h-[290px] flex-col overflow-hidden
          rounded-2xl border border-white/10 bg-white/[0.025] p-6
          transition-all duration-500 hover:-translate-y-1
          hover:border-white/25 hover:bg-white/[0.055]
          sm:p-8"
      >

        {/* Funder and period */}
        <div className="relative flex items-start justify-between gap-4">
          <span className="max-w-[65%] text-xs font-medium uppercase tracking-[0.16em] text-white/75 transition-all duration-300 group-hover:text-zinc-100">
            {p.funder}
          </span>
          <span className="shrink-0 rounded-full border border-white/10 px-3 py-1 text-[10px] tracking-wide text-white/50 transition-all duration-300 group-hover:text-zinc-100">
            {p.period}
          </span>
        </div>

        {/* Accent line */}
        <div className="relative mt-4 h-px w-full bg-white/10">
          <div className="h-px w-10 bg-white/60 transition-all duration-500 group-hover:w-1/3 " />
        </div>

        {/* Project title */}
        <h4 className="relative mt-7 text-lg leading-snug tracking-tight text-white/90 transition-colors duration-300 group-hover:text-white sm:text-xl">
          {p.title}
        </h4>

        {/* Optional note */}
        {p.note && (
          <p className="relative mt-auto pt-4 text-xs leading-relaxed text-white/45 transition-all duration-300 group-hover:text-zinc-400">
            {p.note}
          </p>
        )}

        {/* Bottom indicator */}
        <div className="mt-auto flex items-center justify-between pt-8">
          <span className="text-[10px] uppercase tracking-[0.22em] text-white/35 transition-all duration-300 group-hover:text-zinc-300">
            Research initiative
          </span>
          <span
            aria-hidden="true"
            className="flex size-8 items-center justify-center rounded-full
              border border-white/10 text-white/50 transition-all duration-300
              group-hover:border-white/40 group-hover:bg-white
              group-hover:text-black"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="size-4 transition-transform duration-300"
            >
              <path d="M7 17 17 7M7 7h10v10" />
            </svg>
          </span>
        </div>
      </article>
    ))}
  </div>

</section>

    </section>
  )
}
