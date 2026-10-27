import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { group, navLinks, pi } from '../data/site'

// '/research' is a page; '#people' etc. are home-page sections, reachable from any page
const toRoute = (href) => (href.startsWith('#') ? { pathname: '/', hash: href } : href)

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

  // after navigating: scroll to the #section if there is one, otherwise start at the top.
  // Arriving from another page jumps straight there; within the same page it glides.
  const location = useLocation()
  const lastPath = useRef(location.pathname)
  useEffect(() => {
    const changedPage = lastPath.current !== location.pathname
    lastPath.current = location.pathname
    if (!location.hash) {
      if (changedPage) window.scrollTo({ top: 0, behavior: 'instant' })
      return
    }
    // give the page a moment to render before looking for the section
    const id = setTimeout(
      () => document.querySelector(location.hash)?.scrollIntoView({ behavior: changedPage ? 'instant' : 'smooth' }),
      60,
    )
    return () => clearTimeout(id)
  }, [location.pathname, location.hash])

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4 w-full flex justify-center items-center">
      <nav
        className={`mx-auto  flex items-stretch justify-between gap-1.5 transition-all duration-500 ${
          scrolled ? 'w-[70vh]' : 'w-[100vh]'
        }`}
      >
        <Link to="/" className="pill flex items-center px-5 py-3 text-sm text-bone">
          <Logo />
        </Link>

        <ul className="pill hidden items-center gap-1 px-2 md:flex">
          {navLinks.map((l) => (
            <li key={l.href}>
              <Link
                to={toRoute(l.href)}
                className={`block rounded-[4px] px-2.5 py-1 text-[14px] transition-colors hover:bg-white/[0.06] hover:text-bone ${
                  location.pathname === l.href ? 'bg-white/[0.08] text-bone' : 'text-bone/75'
                }`}
              >
                {l.label}
              </Link>
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
              <Link
                to={toRoute(l.href)}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-4 py-3 text-sm text-bone/80 hover:bg-white/[0.06]"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </header>
  )
}
