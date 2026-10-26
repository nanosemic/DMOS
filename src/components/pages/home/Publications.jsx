import { useRef } from 'react'
import { publications } from '../../../data/site'
import { useCardsReveal } from '../../../hooks'
import { ArrowUpRight } from 'lucide-react'

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
              Selected <span className="font-serif italic ">Publications</span>
            </h2>
            <p className="card-text mt-3 max-w-xl">
              The two latest papers and the two most cited, from 16 journal and 13 conference papers.
            </p>
          </div>

          <a
            href="https://scholar.google.co.in/citations?user=Eg-jYTgAAAAJ"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-white/15 bg-transparent px-4 text-sm font-medium text-white/80 shadow-sm transition-colors hover:border-white/25 hover:bg-zinc-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
          >
            View all on Google Scholar
          <ArrowUpRight size={14}/>
          </a>

        </div>


<div ref={ref} className="mt-10 border-t border-white/15">
  {publications.map((p, i) => (
    <a
      key={p.doi}
      href={`https://doi.org/${p.doi}`}
      target="_blank"
      rel="noreferrer"
      className="group grid gap-5 border-b border-white/15 py-7 transition-colors duration-300 hover:bg-white/[0.03] sm:grid-cols-[64px_1fr] sm:gap-7 p-7"
    >
      {/* Index */}
      <span className="font-mono text-sm text-white/30 transition-colors group-hover:text-white/70">
        {String(i + 1).padStart(2, '0')}
      </span>

      {/* Publication details */}
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="eyebrow">{p.year}</span>
          <span className="h-1 w-1 rounded-full bg-white/25" />
          <span
            className={`font-mono text-[10px] uppercase tracking-[0.15em] ${
              p.tag?.toLowerCase() === 'latest'
                ? 'text-blue-500 font-semibold'
                : 'text-white/45'
            }`}
          >
            {p.tag}
          </span>
        </div>

        <div className="mt-4 flex items-start justify-between gap-5">
          <h3 className="max-w-4xl text-xl leading-snug font-normal tracking-tight text-white transition-colors group-hover:text-white/75 sm:text-2xl lg:text-3xl">
            {p.title}
          </h3>

          <span
            className="mt-1 shrink-0 text-xl text-white/30 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-white"
            aria-hidden="true"
          >
            <ArrowUpRight size={24}/>
          </span>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-white/50">
          <Authors text={p.authors} />
        </p>
        <p className="mt-4 flex flex-wrap items-center gap-2 font-mono text-xs text-white/40">
          <span className="uppercase tracking-widest text-white/25">DOI</span>
          <span className="text-white/15">/</span>
          <span className="break-all transition-colors group-hover:text-white/70">
            {p.doi}
          </span>
        </p>

        <div className="mt-5 flex items-center gap-3">
          <span className="h-px w-6 bg-white/20 transition-all duration-300 group-hover:w-10 group-hover:bg-white/60" />
          <span className="font-serif text-base italic text-white/70 sm:text-lg">
            {p.venue}
          </span>
        </div>
      </div>
    </a>
  ))}
</div>

      </div>
    </section>
  )
}
