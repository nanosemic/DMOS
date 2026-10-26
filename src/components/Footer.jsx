
import { group, navLinks, pi } from '../data/site'
import { useReveal } from '../hooks'

const YEAR = new Date().getFullYear()

function Column({ title, children }) {
  return (
    <div className="min-w-0">
      <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/90">
        {title}
      </h3>
      <div className="mt-5 flex flex-col items-start gap-3 text-sm leading-relaxed text-white/60">
        {children}
      </div>
    </div>
  )
}

const linkCls =
  'w-fit max-w-full break-words transition-colors duration-200 hover:text-white focus-visible:text-white focus-visible:outline-none'

export default function Footer() {
  const [markRef, markShown] = useReveal(0.3)

  return (
    <footer id="contact" className="bg-ink px-3 py-3 sm:px-6 sm:py-6 lg:px-8">
      <div className="card overflow-hidden bg-zinc-900 rounded-xl border border-white/[0.09]">
        {/* Footer heading */}
        <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-7 sm:px-8 sm:py-9 lg:flex-row lg:items-end lg:justify-between lg:px-10">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-white/45">
              Get in touch
            </p>
            <h2 className="mt-2 text-2xl font-normal tracking-tight text-white sm:text-3xl">
              Research. Build. Discover.
            </h2>
          </div>
          <a
            href={`mailto:${group.email}`}
            className="w-fit text-sm text-white/75 underline decoration-white/25 underline-offset-4 transition-colors hover:text-white"
          >
            {group.email}
          </a>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-1 gap-9 px-5 py-8 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-10 sm:px-8 sm:py-10 lg:grid-cols-4 lg:gap-10 lg:px-10 lg:py-12">
          <Column title="Explore">
            <a href="#top" className={linkCls}>Home</a>
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className={linkCls}>
                {l.label}
              </a>
            ))}
          </Column>

          <Column title="Connect">
            {pi.links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className={linkCls}
              >
                {l.label}
                <span className="ml-1 text-white/30">↗</span>
              </a>
            ))}
            <a
              href="https://nanosemic.co.in"
              target="_blank"
              rel="noreferrer"
              className={linkCls}
            >
              Nano Semic <span className="ml-1 text-white/30">↗</span>
            </a>
          </Column>

          <Column title="Our lab">
            <span className="text-white/85">D-MOS Research Group</span>
            <span>{group.school}</span>
            <span>{group.office}</span>
          </Column>

          <Column title="Work with us">
            <p className="max-w-sm text-white/60">
              Ph.D. and MS(R) positions, M.Tech and B.Tech projects, and
              industry collaboration.
            </p>
            <a
              href={group.admissions}
              target="_blank"
              rel="noreferrer"
              className={`${linkCls} mt-1 text-white/85`}
            >
              Admissions at SECS <span className="ml-1">↗</span>
            </a>
          </Column>
        </div>

        {/* Oversized wordmark */}
        <div className="border-t border-white/10 px-4 pt-8 sm:px-8 sm:pt-10 lg:px-10 lg:pt-12 ">
          <div
            ref={markRef}
            aria-hidden="true"
            className={`rise-parts ${markShown ? 'is-in' : ''} flex items-end gap-2 overflow-hidden whitespace-nowrap text-wrap text-[18vw] font-normal leading-[0.82] tracking-[-0.075em] text-white select-none sm:gap-4 lg:text-[min(16.5vw,15rem)]`}
          >
            <img
              src={group.logo}
              alt=""
              className="mb-[0.06em] h-[0.65em] w-auto shrink-0 object-contain"
            />
            <span>Akshay</span>
            <span className="tracking-[-0.08em]">K.</span>

          </div>

          {/* Copyright and credits */}
          <div className="mt-7 flex flex-col gap-3 border-t border-white/[0.08] py-5 text-[11px] leading-relaxed text-white/40 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <p>
              © {YEAR} {group.fullName}
              <span className="mx-2 text-white/20">/</span>
              {group.institute}
            </p>
            <p>{group.school}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
