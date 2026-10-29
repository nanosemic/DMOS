import { useRef } from 'react'
import { clamp01, useCardsReveal, useScrub } from '../../../hooks'
import { intro, stats } from '../../../data/site'
import TcadCanvas from './TcadCanvas'

// Arox "studio intro". The section slides up over the pinned hero. Its media card grows from
// 0.61x to full size as it arrives and shrinks to 0.55x as it leaves; the 42px statement
// sharpens line by line (blur 5 / 7.5 / 11.5px, dropped 0 / 15 / 23px). Below it: who the
// group is, why the work matters, and the key numbers.
const BLUR = [5, 7.5, 11.5]
const DROP = [0, 15, 23]

export default function Statement() {
  const sectionRef = useRef(null)
  const cardRef = useRef(null)
  const textRef = useRef(null)
  const statsRef = useRef(null)

  // measured from the section (the card's own box changes as it scales)
  useScrub(
    sectionRef,
    (rect, vh) => (rect.top + cardRef.current.offsetTop) / vh, // card top in viewport heights
    (t) => {
      const s = t >= 0.11 ? 1 - 0.39 * clamp01((t - 0.11) / 0.89) : 1 - 0.45 * clamp01((0.11 - t) / 0.83)
      cardRef.current.style.transform = `scale(${s})`
    },
    { rest: 0.11 },
  )

  useScrub(
    textRef,
    (rect, vh) => clamp01((vh * 0.95 - rect.top) / (vh * 0.5)),
    (p, el) => {
      ;[...el.children].forEach((line, i) => {
        const local = clamp01(p * 1.5 - i * 0.25)
        line.style.filter = local >= 1 ? 'none' : `blur(${BLUR[i] * (1 - local)}px)`
        line.style.transform = `translate3d(0, ${DROP[i] * (1 - local)}px, 0)`
      })
    },
  )

  useCardsReveal(statsRef)

  return (
    <section ref={sectionRef} className="relative z-10 -mt-[100svh] bg-ink px-4 pt-20 pb-28 sm:px-8 md:pb-40">
      <div
        ref={cardRef}
        className="relative mx-auto aspect-[16/9] w-full max-w-[900px] overflow-hidden rounded-[10px] will-change-transform lg:w-[50vw]"
      >
        <TcadCanvas className="opacity-90" />
        <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between p-3 font-mono text-[11px] font-light tracking-[0.7px] text-white/60 md:p-4 md:text-[12px]">
          <span>Superjunction drift region</span>
          <span>Illustration</span>
        </div>
      </div>

      <p
        ref={textRef}
        className="mx-auto mt-16 max-w-4xl text-center text-[clamp(1.6rem,3.3vw,2.625rem)] leading-[1.1] font-normal text-white md:mt-24"
      >
        {intro.lines.map((l) => (
          <span key={l} className="block will-change-[filter,transform]">
            {l}
          </span>
        ))}
      </p>

      {/* who they are / why it matters */}
      <div className="mx-auto mt-20 grid max-w-5xl gap-10 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:gap-16">
        <div>
          <p className="eyebrow uppercase">Who we are</p>
          <p className="mt-4 text-[17px] leading-relaxed text-white/80">{intro.about}</p>
        </div>
        <div>
          <p className="eyebrow uppercase">Why it matters</p>
          <p className="mt-4 text-[17px] leading-relaxed text-white/80">{intro.why}</p>
        </div>
      </div>

      <dl ref={statsRef} className="mx-auto mt-20 grid max-w-5xl grid-cols-2 gap-5 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card flex flex-col-reverse p-6">
            <dt>
              <span className="mt-3 block text-[15px] text-white">{s.label}</span>
              <span className="eyebrow mt-1 block text-[12px] mt-6">{s.note}</span>
            </dt>
            <dd className="text-[clamp(2rem,3.3vw,2.625rem)] leading-none text-white">{s.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
