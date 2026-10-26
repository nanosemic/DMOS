import { group, navLinks, pi } from '../data/site'
import { useReveal } from '../hooks'

// Arox footer: one 5%-white panel (8px radius) holding link columns and a full-width wordmark.
const YEAR = new Date().getFullYear()

function Column({ title, children }) {
  return (
    <div>
      <div className="text-[16px] leading-6 font-medium text-white uppercase">{title}</div>
      <div className="mt-5 flex flex-col gap-3 text-[14px] leading-[1.2] text-[rgba(252,252,252,0.72)]">{children}</div>
    </div>
  )
}

const linkCls = 'w-fit transition-colors hover:text-white'

export default function Footer() {
  const [markRef, markShown] = useReveal(0.3)
  return (
    <footer id="contact" className="bg-ink p-4 sm:p-8">
      <div className="card flex min-h-[calc(100svh-4rem)] flex-col rounded-[8px] p-[27px]">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[repeat(3,minmax(0,1fr))_minmax(0,1.4fr)]">
          <Column title="Site index">
            <a href="#top" className={linkCls}>Home</a>
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className={linkCls}>{l.label}</a>
            ))}
          </Column>

          <Column title="Profiles">
            {pi.links.map((l) => (
              <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className={linkCls}>{l.label}</a>
            ))}
            <a href="https://nanosemic.co.in" target="_blank" rel="noreferrer" className={linkCls}>Nano Semic</a>
          </Column>

          <Column title="Lab">
            <span>D-MOS Research Group</span>
            <span>{group.school}</span>
            <span>{group.office}</span>
          </Column>

          <Column title="Contact & join us">
            <span>Ph.D. and MS(R) positions, M.Tech and B.Tech projects, and industry collaboration</span>
            <a href={`mailto:${group.email}`} className={`${linkCls} text-[18px] text-white underline decoration-white/30 underline-offset-4`}>
              {group.email}
            </a>
            <a href={group.admissions} target="_blank" rel="noreferrer" className={linkCls}>
              Ph.D. / MS(R) admissions at SECS ↗
            </a>
          </Column>
        </div>

        {/* Wordmark */}
        <div className="mt-auto pt-20">
          {/* Wordmark parts rise into place one after another, like Arox's footer logo */}
          <div
            ref={markRef}
            aria-hidden="true"
            className={`rise-parts ${markShown ? 'is-in' : ''} flex items-end justify-between text-[15vw] leading-[0.8] font-normal tracking-[-0.045em] whitespace-nowrap text-white select-none lg:text-[min(17.5vw,22rem)]`}
          >
            <img src={group.logo} alt="" className="mb-[0.04em] h-[0.86em] w-auto" />
            <span>Akshay</span>
            <span>K.</span>
          </div>
          <div className="mt-6 flex flex-col justify-between gap-2 text-[12px] leading-[1.2] text-[#a2a2a3] sm:flex-row">
            <span>
              ©{YEAR} {group.fullName} · {group.institute}
            </span>
            <span>{group.school}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
