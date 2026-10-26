import { useRef } from 'react'
import { publications } from '../../../data/site'
import { useCardsReveal } from '../../../hooks'

// Bold the PI's name inside an author string.
function Authors({ text }) {
  const parts = text.split(/(Akshay K|K\. Akshay)/)
  return (
    <>
      {parts.map((p, i) =>
        /Akshay/.test(p) ? (
          <span key={i} className="text-white">
            {p}
          </span>
        ) : (
          p
        ),
      )}
    </>
  )
}

export default function Publications() {
  const ref = useRef(null)
  useCardsReveal(ref)
  return (
    <section id="publications" className="bg-ink px-4 py-16 sm:px-8 md:py-24">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h2 className="card-title">
              Selected <span className="font-serif italic">publications</span>
            </h2>
            <p className="card-text mt-3 max-w-xl">
              The two latest papers and the two most cited, from 16 journal and 13 conference papers.
            </p>
          </div>
          <a href="https://scholar.google.co.in/citations?user=Eg-jYTgAAAAJ" target="_blank" rel="noreferrer" className="btn self-start md:self-auto">
            All publications on Google Scholar
          </a>
        </div>

        <div ref={ref} className="mt-10 grid gap-5 md:grid-cols-2">
          {publications.map((p) => (
            <a
              key={p.doi}
              href={`https://doi.org/${p.doi}`}
              target="_blank"
              rel="noreferrer"
              className="card group flex min-h-[260px] flex-col p-8 transition-colors hover:bg-[rgba(252,252,252,0.08)]"
            >
              <div className="flex items-baseline justify-between gap-4">
                <span className="eyebrow">
                  {p.year} · <span className="text-white/75">{p.tag}</span>
                </span>
                <span className="text-white/40 transition-transform group-hover:translate-x-1 group-hover:text-white" aria-hidden="true">
                  ↗
                </span>
              </div>
              <h3 className="mt-6 text-[clamp(1.15rem,1.6vw,1.375rem)] leading-snug text-white">{p.title}</h3>
              <p className="mt-auto pt-6 text-[14px] leading-relaxed text-white/50">
                <Authors text={p.authors} />
              </p>
              <p className="mt-2 font-serif text-lg text-white/80 italic">{p.venue}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
