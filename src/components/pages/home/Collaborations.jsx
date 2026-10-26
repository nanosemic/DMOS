import { useRef } from 'react'
import { collaborators, partners } from '../../../data/site'
import { useCardsReveal } from '../../../hooks'

export default function Collaborations() {
  const ref = useRef(null)
  useCardsReveal(ref)
  return (
    <section id="collaborations" className="overflow-hidden bg-ink py-16 md:py-24">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
        <h2 className="card-title">
          Who we <span className="font-serif italic">work with</span>
        </h2>
        <p className="card-text mt-3 max-w-xl">Research collaborators, and what we work on together.</p>

        <div ref={ref} className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {collaborators.map((c) => (
            <div key={c.name} className="card flex min-h-[170px] flex-col p-7 transition-colors hover:bg-[rgba(252,252,252,0.08)]">
              <h3 className="text-xl text-white">{c.name}</h3>
              <p className="card-text mt-2 text-[15px]">{c.org}</p>
              <p className="eyebrow mt-auto pt-6">{c.note}</p>
            </div>
          ))}
          <div className="card flex min-h-[170px] flex-col justify-between p-7">
            <p className="card-text">
              Working with industry on power-device R&amp;D, consultancy and student projects. Interested in
              collaborating?
            </p>
            <a href="#contact" className="btn mt-6 self-start">
              Get in touch
            </a>
          </div>
        </div>
      </div>

      {/* Partner marquee */}
      <p className="eyebrow mx-auto mt-16 max-w-[1440px] px-4 uppercase sm:px-8">Funders &amp; partners</p>
      <div className="relative mt-6 [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
        <div className="animate-marquee flex w-max gap-14 whitespace-nowrap">
          {[...partners, ...partners].map((p, i) => (
            <span key={i} className="text-[clamp(1.4rem,2.6vw,2.2rem)] text-white/30">
              {p}
              <span className="ml-14 font-mono text-[0.6em] text-white/15">/</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
