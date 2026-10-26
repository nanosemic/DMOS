import { useRef } from 'react'
import { news } from '../../../data/site'
import { useCardsReveal } from '../../../hooks'

export default function Updates() {
  const ref = useRef(null)
  useCardsReveal(ref)

  return (
    <section id="news" className="bg-ink px-4 py-16 sm:px-8 md:py-24">
      <div className="mx-auto max-w-[1440px]">
        <h2 className="card-title">
          Latest <span className="font-serif italic">news</span>
        </h2>

        <div ref={ref} className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {news.slice(0, 3).map((n) => {
            const body = (
              <>
                <time className="eyebrow uppercase">{n.date}</time>
                <p className="mt-6 text-[17px] leading-snug text-white">{n.title}</p>
                {n.href && (
                  <span className="mt-auto pt-6 text-[14px] text-white/50 transition-colors group-hover:text-white" aria-hidden="true">
                    Read more ↗
                  </span>
                )}
              </>
            )
            const cls = 'card group flex min-h-[200px] flex-col p-7'
            return n.href ? (
              <a key={n.title} href={n.href} target="_blank" rel="noreferrer" className={`${cls} transition-colors hover:bg-[rgba(252,252,252,0.08)]`}>
                {body}
              </a>
            ) : (
              <div key={n.title} className={cls}>
                {body}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
