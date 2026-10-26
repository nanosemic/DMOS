import { useEffect, useState } from 'react'
import { group, navLinks, pi } from '../data/site'

export function Logo({ className = '' }) {
  return (
    <span className={`flex items-center gap-2.5 font-medium ${className}`}>
      <img src={group.logo} alt={group.institute} className="h-[1.9em] w-auto" />
      {pi.name}
    </span>
  )
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4">
      <nav
        className={`mx-auto flex max-w-fit items-stretch gap-1.5 transition-transform duration-500 ${
          scrolled ? 'scale-[0.97]' : ''
        }`}
      >
        <a href="#top" className="pill flex items-center px-5 py-3 text-sm text-bone">
          <Logo />
        </a>

        <ul className="pill hidden items-center gap-1 px-2 md:flex">
          {navLinks.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="block rounded-[4px] px-2.5 py-1 text-[14px] text-bone/75 transition-colors hover:bg-white/[0.06] hover:text-bone"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle menu"
          className="pill flex w-12 items-center justify-center md:hidden"
        >
          <span className="relative block h-3 w-4">
            <span className={`absolute left-0 h-px w-4 bg-bone transition-all ${open ? 'top-1.5 rotate-45' : 'top-0'}`} />
            <span className={`absolute left-0 h-px w-4 bg-bone transition-all ${open ? 'top-1.5 -rotate-45' : 'top-3'}`} />
          </span>
        </button>
      </nav>

      {open && (
        <ul className="pill mx-auto mt-2 max-w-sm p-2 md:hidden">
          {navLinks.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-4 py-3 text-sm text-bone/80 hover:bg-white/[0.06]"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  )
}
