
import { useRef } from 'react'
import { news } from '../../../data/site'
import { useCardsReveal } from '../../../hooks'
import { ArrowRight } from 'lucide-react'

export default function Updates() {
  const ref = useRef(null)
  useCardsReveal(ref)

  return (
    <section
      id="news"
      className="overflow-hidden bg-ink px-4 py-16 sm:px-8 md:py-24"
    >
      <div className="mx-auto max-w-[1440px]">
        {/* Section heading */}
        <div className="flex flex-col justify-between gap-5 border-b border-white/10 pb-8 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow mb-4 uppercase tracking-[0.2em]">
              From the research desk
            </p>

            <h2 className="card-title">
              Latest <span className="font-serif italic">news</span>
            </h2>
          </div>

          <p className="max-w-sm text-sm leading-6 text-white/45 sm:text-right">
            Research highlights, recent developments and updates
            from our team.
          </p>
        </div>

        {/* News cards */}
        <div
          ref={ref}
          className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 "
        >
          {news.slice(0, 3).map((n, i) => {
            const content = (
              <>
                <div>
                  <time className="text-zinc-400 text-xs  uppercase">
                    {n.date}
                  </time>

                  <h3 className="mt-4 text-xl text-zinc-200 leading-snug tracking-tight text-white transition-colors duration-300 group-hover:text-white">
                    {n.title}
                  </h3>
                </div>

                <div className="mt-auto pt-8">
                  <div className="h-px w-full bg-white/10 transition-colors duration-300 group-hover:bg-white/30" />
                  <span className="mt-4 items-center gap-2 text-sm text-white/45 transition-colors group-hover:text-white flex items-center">
                    {n.href ? 'Read full update' : 'Latest update'}
                    <span aria-hidden="true"><ArrowRight size={12}/></span>
                  </span>
                </div>
              </>
            )

            const cls =
              'card group flex min-h-[270px] flex-col p-8 transition-colors duration-300 hover:bg-[rgba(252,252,252,0.08)] '

            return n.href ? (
              <a
                key={n.title}
                href={n.href}
                target="_blank"
                rel="noreferrer"
                className={cls}
              >
                {content}
              </a>
            ) : (
              <article key={n.title} className={cls}>
                {content}
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
