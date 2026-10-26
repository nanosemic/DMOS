import { useRef } from 'react'
import { collaborators, partners } from '../../../data/site'
import { useCardsReveal } from '../../../hooks'
import { ArrowRight, ArrowRightSquareIcon, DotIcon } from 'lucide-react'

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
          <div
            key={c.name}
            className="card flex min-h-[220px] flex-col p-7 transition-colors hover:bg-[rgba(252,252,252,0.08)]"
          >
            {/* Collaborator photo */}
            <div className="mb-5 w-24 aspect-square overflow-hidden rounded-full border border-white/15 bg-white/5">
              {c.src ? (
                <img
                  src={c.src}
                  alt={c.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center font-serif text-2xl italic text-white/30"
                  aria-hidden="true"
                >
                  {c.name.charAt(0)}
                </div>
              )}
            </div>

            <h3 className="text-xl text-white">{c.name}</h3>
            <p className="card-text mt-2 text-[15px]">{c.org}</p>
            <p className="eyebrow mt-auto pt-6">{c.note}</p>
          </div>
        ))}

        <div className="card group flex min-h-[170px] flex-col justify-between p-7  hover:bg-[rgba(252,252,252,0.08)]">
          <div>
            <p className="eyebrow">COLLABORATE WITH US</p>

            <h3 className="mt-4 text-xl leading-snug text-white">
              Let's work together.
            </h3>

            <p className="card-text mt-3 text-[15px]">
              Working with industry on power-device R&amp;D, consultancy and student projects.
              Interested in collaborating?
            </p>
          </div>

          <a href="#contact" className="btn mt-6 inline-flex items-center gap-2 self-start transition-all duration-300 hover:bg-white">
            Get in touch
            <ArrowRight size={18}/>
          </a>
        </div>

        </div>
      </div>

      {/* Partner marquee */}
      <p className="eyebrow mx-auto mt-16 max-w-[1440px] px-4 uppercase sm:px-8">Funders &amp; partners</p>
      <div className="relative mt-6 [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
        <div className="animate-marquee flex w-max gap-14 whitespace-nowrap">
          {[...partners, ...partners].map((p, i) => (
            <span key={i} className="text-[clamp(1.4rem,2.6vw,2.2rem)] text-white/30 hover:text-white transition-all duration-300 cursor-pointer">
              {p}
              {/* <span className="ml-14 font-mono text-[0.6em] text-white/15">/</span> */}
              <DotIcon className='inline-flex ml-14'/>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
