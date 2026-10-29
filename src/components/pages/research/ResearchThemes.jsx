import { useRef } from 'react'
import { clamp01, smoothstep, useScrub } from '../../../hooks'
import { researchThemes } from '../../../data/research'
import ThemeStack from './ThemeStack'

/*
 * Five research themes, after Voku's "Artifacts" page. The section pins for ~6 screens while a
 * wheel of images (one per theme) turns through the left half of the screen. The image in the
 * middle is sharp; the others are smeared and screened as if out of focus. As each image reaches
 * the centre, two labels point at it and its theme's text fades in on the
 * right while the previous one lifts away.
 *   focus -1        the heading is on screen, the first image waits below
 *   focus 0 .. 4    themes 01 .. 05, settling a little on each
 * Everything is scrubbed by scroll, so scrolling back plays it in reverse.
 */
const { eyebrow, title, accent, intro, themes } = researchThemes
const N = themes.length
const END = 0.94 // share of the track that moves the stack; the rest holds the last theme
const pad = (n) => String(n).padStart(2, '0')
const IMAGES = themes.map((t) => t.image) // stable, so the WebGL scene is built once

// scroll progress -> focus, easing a little around every whole theme so each one settles
const toFocus = (p) => {
  const g = -1 + clamp01(p / END) * N
  const base = Math.floor(g)
  return base + (smoothstep(g - base) * 0.3 + (g - base) * 0.7)
}

// small line icons for the "why it matters" card
const ICONS = {
  chip: (
    <>
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
      <rect x="10" y="10" width="4" height="4" />
      <path d="M9 4v3M12 4v3M15 4v3M9 17v3M12 17v3M15 17v3M4 9h3M4 12h3M4 15h3M17 9h3M17 12h3M17 15h3" />
    </>
  ),
  layers: <path d="M12 4 3 8.5 12 13l9-4.5L12 4ZM3 12.5 12 17l9-4.5M3 16.5 12 21l9-4.5" />,
  sensor: (
    <>
      <circle cx="12" cy="12" r="2.5" />
      <path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4M5 5a10 10 0 0 0 0 14M19 5a10 10 0 0 1 0 14" />
    </>
  ),
}

export default function ResearchThemes() {
  const trackRef = useRef(null)
  const headRef = useRef(null)
  const panelsRef = useRef(null)
  const barRef = useRef(null)
  const countRef = useRef(null)
  const calloutsRef = useRef(null)
  const focusRef = useRef(-1)
  const activeRef = useRef(0)

  useScrub(
    trackRef,
    (rect, vh) => clamp01(-rect.top / Math.max(rect.height - vh, 1)),
    (p) => {
      const f = toFocus(p)
      focusRef.current = f

      // heading: on screen while the first image is still below, lifts away as it arrives
      const ho = 1 - smoothstep((f + 0.75) / 0.5)
      headRef.current.style.opacity = ho
      headRef.current.style.transform = `translate3d(0, ${-60 * (1 - ho)}px, 0)`
      headRef.current.style.visibility = ho < 0.01 ? 'hidden' : 'visible'

      // theme texts and labels: fade + rise in as their image nears the centre, lift out as it leaves
      const show = (el, i, rise) => {
        const d = i - f
        const o = 1 - smoothstep((Math.abs(d) - 0.12) / 0.38)
        el.style.opacity = o
        el.style.transform = `translate3d(0, ${d * rise}px, 0)`
        el.style.visibility = o < 0.01 ? 'hidden' : 'visible'
        el.style.pointerEvents = o > 0.6 ? 'auto' : 'none'
        return o
      }
      ;[...panelsRef.current.children].forEach((el, i) => show(el, i, 70))
      ;[...calloutsRef.current.children].forEach((el, i) => {
        const o = show(el, i, 30)
        el.style.setProperty('--draw', smoothstep((o - 0.3) / 0.7)) // lines draw out as it settles
      })

      // shared bar: counter + arrows
      const active = Math.round(Math.min(Math.max(f, 0), N - 1))
      activeRef.current = active
      countRef.current.textContent = pad(active + 1)
      const bo = smoothstep((f + 0.6) / 0.4)
      barRef.current.style.opacity = bo
      barRef.current.style.visibility = bo < 0.01 ? 'hidden' : 'visible'
    },
    { smoothing: 0.1, rest: 0, follow: true }, // a slower catch-up gives the glide of Voku's smooth scroll
  )

  // jump to a theme: scroll so its image sits exactly in the middle
  const goTo = (i) => {
    const track = trackRef.current
    const top = track.getBoundingClientRect().top + window.scrollY
    const run = track.offsetHeight - window.innerHeight
    const k = Math.min(Math.max(i, 0), N - 1)
    window.scrollTo({ top: top + ((k + 1) / N) * END * run, behavior: 'smooth' })
  }

  const arrow = 'grid size-10 place-items-center rounded-full border transition-colors duration-300'

  return (
    <section id="themes" aria-label={`${title} ${accent}`} className="themes bg-ink">
      <div ref={trackRef} className="relative h-[680vh]">
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          {/* ambient glow and dot fields behind the image */}
          <div className="pointer-events-none absolute -top-[20%] left-[8%] h-[70%] w-[50%] rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.05),transparent)] blur-2xl" />
          <div className="theme-dots pointer-events-none absolute top-[24%] left-[4%] hidden h-[22%] w-[16%] lg:block" />
          <div className="theme-dots pointer-events-none absolute right-[48%] bottom-[22%] hidden h-[16%] w-[12%] lg:block" />

          {/* the image wheel */}
          <ThemeStack items={IMAGES} focusRef={focusRef} className="absolute inset-0 lg:right-[46%]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-ink to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[50%] bg-gradient-to-t from-ink via-ink/85 to-transparent lg:h-28 lg:via-transparent" />

          {/* labels pointing at the image in focus (desktop), one pair per theme */}
          <div ref={calloutsRef} className="pointer-events-none absolute inset-y-0 left-0 hidden w-[54%] lg:block">
            {themes.map((t, i) => (
              <div key={t.id} className="theme-callouts absolute inset-0 opacity-0" style={{ visibility: 'hidden' }}>
                {/* top left: dot, label, line down and in towards the image */}
                <div className="absolute top-[26%] left-[21%]">
                  <svg className="absolute top-[6px] left-[3px] overflow-visible" width="1" height="1" aria-hidden="true">
                    <path d="M0 0 V70 L90 160" pathLength="1" />
                  </svg>
                  <p className="flex gap-3">
                    <span className="theme-dot mt-[2px]" />
                    <span className="font-mono text-[11px] leading-[1.5] tracking-[1.5px] uppercase">
                      <span className="block text-white">{t.callouts[0][0]}</span>
                      <span className="block text-white/45">{t.callouts[0][1]}</span>
                    </span>
                  </p>
                </div>
                {/* bottom right: line comes from the image up-left of the label */}
                <div className="absolute bottom-[24%] left-[58%]">
                  <svg className="absolute top-[6px] left-[3px] overflow-visible" width="1" height="1" aria-hidden="true">
                    <path d="M0 0 H-14 L-70 -60" pathLength="1" />
                  </svg>
                  <p className="flex gap-3">
                    <span className="theme-dot mt-[2px]" />
                    <span className="font-mono text-[11px] leading-[1.5] tracking-[1.5px] uppercase">
                      <span className="block text-white">{t.callouts[1][0]}</span>
                      <span className="block text-white/45">{t.callouts[1][1]}</span>
                    </span>
                  </p>
                </div>
                <p className="absolute bottom-[5vh] left-[5vw] font-mono text-[10px] tracking-[0.5px] text-white/30">
                  Fig. {pad(i + 1)} — {t.image.alt} (illustration)
                </p>
              </div>
            ))}
          </div>

          {/* heading */}
          <header ref={headRef} className="absolute inset-x-0 top-[16%] px-5 lg:top-[20%] sm:px-8 lg:left-[5vw] lg:max-w-2xl lg:px-0">
            <p className="eyebrow uppercase">— {eyebrow}</p>
            <h2 className="mt-4 text-[clamp(2.6rem,5vw,4.8rem)] leading-[1.02] font-normal text-white">
              {title} <em className="font-serif font-normal">{accent}</em>
            </h2>
            <p className="mt-5 max-w-md text-[16px] leading-relaxed text-white/60">{intro}</p>
            <p className="mt-8 font-mono text-[11px] tracking-[0.7px] text-white/40">Scroll ↓</p>
          </header>

          {/* right column, centred on the image: shared bar on top, then the theme texts stacked in one
              grid cell (so the block keeps the tallest height and does not jump between themes) */}
          <div className="absolute inset-x-0 bottom-[4%] px-5 sm:px-8 lg:top-1/2 lg:right-[6vw] lg:bottom-auto lg:left-[55%] lg:max-w-[560px] lg:-translate-y-1/2 lg:px-0">
            <div ref={barRef} className="mb-5 flex items-center gap-4 opacity-0 lg:mb-[2.4vh]" style={{ visibility: 'hidden' }}>
              <p className="font-mono text-[11px] tracking-[1.5px] text-white/70">
                <span ref={countRef}>01</span> / {pad(N)}
              </p>
              <span className="h-px w-12 bg-white/30 lg:w-16" />
              <p className="font-mono text-[11px] tracking-[2.5px] text-white/80 uppercase">{eyebrow}</p>
              <div className="ml-auto hidden gap-3 lg:flex">
                <button
                  type="button"
                  aria-label="Previous theme"
                  onClick={() => goTo(activeRef.current - 1)}
                  className={`${arrow} border-white/20 text-white/80 hover:border-white/50 hover:text-white`}
                >
                  ←
                </button>
                <button
                  type="button"
                  aria-label="Next theme"
                  onClick={() => goTo(activeRef.current + 1)}
                  className={`${arrow} border-(--acc)/70 text-(--acc) shadow-[0_0_24px_rgba(255,255,255,0.12)] hover:bg-(--acc) hover:text-ink`}
                >
                  →
                </button>
              </div>
            </div>

            <div ref={panelsRef} className="grid items-start">
              {themes.map((t) => (
                <article key={t.id} id={`theme-${t.id}`} className="[grid-area:1/1] opacity-0" style={{ visibility: 'hidden' }}>
                  <h3 className="text-[clamp(1.7rem,min(2.6vw,4.8vh),2.9rem)] leading-[1.05] font-medium tracking-[-0.02em] text-white">
                    {t.heading[0]}
                    <em className="block font-serif font-normal text-white/80">{t.heading[1]}</em>
                  </h3>
                  <p className="mt-4 line-clamp-3 text-[14px] leading-relaxed text-white/65 lg:mt-[1.8vh] lg:line-clamp-none lg:text-[clamp(13px,1.8vh,15px)]">
                    {t.text}
                  </p>

                  {/* why it matters */}
                  <div className="mt-[2.2vh] hidden items-center gap-4 rounded-lg border border-(--acc)/15 bg-(--acc)/[0.03] px-4 py-[1.4vh] lg:flex">
                    <svg viewBox="0 0 24 24" className="size-7 shrink-0 text-(--acc)" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" aria-hidden="true">
                      {ICONS[t.icon]}
                    </svg>
                    <span className="h-9 w-px bg-white/15" />
                    <p>
                      <span className="block font-mono text-[10px] tracking-[2px] text-white/55 uppercase">Why it matters</span>
                      <span className="mt-0.5 block text-[clamp(13px,1.75vh,14px)] leading-snug text-white/90">{t.why}</span>
                    </p>
                  </div>

                  {/* key papers */}
                  <ol className="mt-4 flex flex-wrap gap-x-4 gap-y-1 lg:mt-[1.4vh] lg:block lg:divide-y lg:divide-white/10">
                    {t.papers.map((p, j) => (
                      <li key={p.doi}>
                        <a
                          href={`https://doi.org/${p.doi}`}
                          target="_blank"
                          rel="noreferrer"
                          className="group flex items-center gap-4 lg:py-[1.1vh]"
                        >
                          <span className="hidden w-6 shrink-0 font-mono text-[12px] text-white/40 lg:block">{pad(j + 1)}</span>
                          <span className="min-w-0 flex-1">
                            <span className="hidden text-[clamp(12.5px,1.7vh,14px)] leading-snug text-white/85 group-hover:text-white lg:block">{p.title}</span>
                            <span className="block font-serif text-[12.5px] text-white/55 italic group-hover:text-white lg:mt-0.5 lg:text-white/45">
                              {p.venue} · {p.year}
                            </span>
                          </span>
                          <span
                            aria-hidden="true"
                            className="grid shrink-0 place-items-center text-[12px] text-white/50 transition-colors group-hover:border-(--acc) group-hover:text-(--acc) lg:size-7 lg:rounded-full lg:border lg:border-white/25 lg:text-[12px] lg:text-white/80"
                          >
                            →
                          </span>
                        </a>
                      </li>
                    ))}
                  </ol>
                  <p className="mt-3 text-[12.5px] text-white/45 lg:mt-[1.2vh]">
                    <span className="mr-2 font-mono text-[10px] tracking-[1.5px] uppercase">People</span>
                    {t.people.join(' · ')}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
