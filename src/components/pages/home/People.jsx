import { useRef } from 'react'
import { group, pi, scholars } from '../../../data/site'
import { useCardsReveal } from '../../../hooks'
import { ArrowUpRight, Dot } from 'lucide-react'

const initials = (name) =>
  name
    .replace(/^Dr\.\s*/, '')
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')

function Portrait({ name, className = '' }) {
  // Placeholder until official photos are supplied.
  return (
    <div className={`relative flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_30%_20%,#26262a,#121214_70%)] ${className}`}>
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff12_1px,transparent_1px)] [background-size:10px_10px]" />
      <span className="relative font-serif text-6xl text-white/80 italic">{initials(name)}</span>
    </div>
  )
}

export default function People() {
  const piRef = useRef(null)
  useCardsReveal(piRef)
  const teamRef = useRef(null)
  useCardsReveal(teamRef)

  return (
    <section id="people" className="bg-ink px-4 py-16 sm:px-8 md:py-24 ">
      <div className="mx-auto max-w-[1440px]">
        {/* Principal investigator */}
        <div ref={piRef} className="grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="card group relative aspect-[4/5] overflow-hidden lg:aspect-auto lg:min-h-[620px]">
            <img
              src={pi.photo}
              alt={`Portrait of ${pi.name}`}
              className="absolute inset-0 h-full w-full object-cover object-[46%_center] transition-transform duration-[1.2s] ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:scale-[1.03]"
            />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#141416] to-transparent" />
            <div className="absolute bottom-5 left-6 flex items-center gap-2.5">
              <img src={group.logo} alt="" className="h-7 w-auto opacity-90" />
              <span className="eyebrow">{group.institute}</span>
            </div>
          </div>

          <div className="card flex flex-col p-8 md:p-10">
            <p className="eyebrow uppercase">Principal Investigator</p>
            <h2 className="mt-4 text-[clamp(2.3rem,4.4vw,3.25rem)] leading-none text-white">{pi.name}</h2>
            <p className="eyebrow mt-3">{pi.role}</p>
            <p className="mt-8 max-w-2xl text-[17px] leading-relaxed text-white/80">{pi.bio}</p>

            {/* at a glance */}
            <dl className="mt-10 divide-y divide-white/10 border-y border-white/10">
              {pi.facts.map((f) => (
                <div key={f.label} className="grid gap-1 py-4 sm:grid-cols-[110px_minmax(0,1fr)] sm:gap-6">
                  <dt className="eyebrow">{f.label}</dt>
                  <dd className="text-[15px] leading-snug text-white/85">{f.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-auto flex flex-wrap gap-3 pt-10">
              {pi.links.map((l) => {
                const label = l.label.toLowerCase();
                const logo = label === "linkedin" ? "/icon/linkedin-app-white-icon.png" : label.includes("orcid") ? "/icon/orcid-dark.png" : label.includes("google scholar") || label.includes("scholar") ? "/icon/googlescholar-dark.png" : null;
                return (
                  <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className="group mt-12 inline-flex w-fit cursor-pointer items-center gap-3 rounded-md border border-[#292d30] bg-transparent px-4 py-2.5 text-sm font-normal text-[#f0f0f0] transition-colors duration-300 ease-out hover:border-[#6e727a] hover:text-white">
                    {logo && (
                      <img src={logo} alt="" className="h-5 w-5 object-contain"/>
                    )}
                    {l.label}
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Scholars */}
        <div className="mt-36 flex flex-col justify-between gap-4 md:flex-row md:items-end ">
          <h3 className="card-title">
            Ph.D. <span className="font-serif italic">scholars</span>
            <p className="card-text max-w-4xl text-zinc-400">
              Our research team works across power semiconductor devices, TCAD simulation,
              fabrication and characterisation, advancing next-generation device technologies.
            </p>
          </h3>
          <button
            type="button"
            className="group mt-12 inline-flex w-fit cursor-pointer items-center gap-3
              rounded-md border border-[#292d30] bg-transparent
              px-4 py-2.5 text-sm font-normal text-[#f0f0f0]
              transition-colors duration-150 ease-out
              hover:border-[#6e727a] hover:text-white"
          >
            <span>View All Scholars</span>
            <ArrowUpRight
              size={15}
              strokeWidth={1.5}
              className="text-[#a1a4a5] transition-transform duration-150
                group-hover:-translate-y-0.5 group-hover:translate-x-0.5
                group-hover:text-white"
            />
          </button>
        </div>

        <div ref={teamRef} className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {scholars.map((s) => (
            <article key={s.name} className="card group flex flex-col overflow-hidden">
              <Portrait name={s.name} className="aspect-[4/3] transition-transform duration-700 group-hover:scale-[1.03]" />
              <div className="flex flex-1 flex-col p-6">
                <h4 className="mt-2 text-xl text-white">{s.name}</h4>

                <p className="mt-1 text-[14px] text-zinc-300 tracking-wide ">{s.college}</p>
                <div className='flex gap-1 items-center'>
                <span className="mt-1 text-[14px] text-white/50 inline-flex">{s.role}</span>
                <Dot size={14} className='text-zinc-500'/>
                <span className="mt-1 text-[14px] text-white/50 inline-flex">{s.department}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  )
}
