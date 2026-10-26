// Monochrome point-and-line illustrations for each research theme, loosely based on
// the device structure behind it. Pure SVG so they stay crisp at any strip width.

const W = 200
const H = 600

// Deterministic pseudo-random so the art doesn't change between renders.
function rng(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
}

function dots(n, seed, fn) {
  const r = rng(seed)
  return Array.from({ length: n }, (_, i) => fn(r, i))
}

const art = {
  // Superjunction: alternating n / p pillars in the drift region
  pillars: () => (
    <>
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={i * 44 + 6} y="150" width="20" height="380" rx="2" fill="url(#fade)" opacity={i % 2 ? 0.25 : 0.7} />
      ))}
      {dots(380, 7, (r, i) => (
        <circle key={i} cx={r() * W} cy={140 + r() * 400} r={r() * 0.9 + 0.3} fill="#f2f2f0" opacity={r() * 0.6} />
      ))}
      <rect x="0" y="120" width={W} height="2" fill="#f2f2f0" opacity="0.6" />
    </>
  ),
  // Floating field rings: concentric arcs around the active area
  rings: () => (
    <>
      {[40, 70, 95, 125, 160, 200, 245, 295].map((rad, i) => (
        <circle key={rad} cx="100" cy="560" r={rad} fill="none" stroke="#f2f2f0" strokeWidth="1" opacity={0.85 - i * 0.09} strokeDasharray={i % 2 ? '2 4' : 'none'} />
      ))}
      {dots(200, 11, (r, i) => {
        const a = Math.PI + r() * Math.PI
        const rad = 30 + r() * 300
        return <circle key={i} cx={100 + Math.cos(a) * rad} cy={560 + Math.sin(a) * rad} r="0.8" fill="#f2f2f0" opacity={r() * 0.7} />
      })}
    </>
  ),
  // Al2O3 / SiO2 bilayer on a substrate: horizontal bands of different density
  layers: () => (
    <>
      {dots(900, 23, (r, i) => {
        const band = i % 3
        const y = band === 0 ? 220 + r() * 40 : band === 1 ? 270 + r() * 60 : 340 + r() * 220
        return <circle key={i} cx={r() * W} cy={y} r={band === 0 ? 1 : 0.7} fill="#f2f2f0" opacity={band === 0 ? 0.85 : band === 1 ? 0.45 : 0.18} />
      })}
      <rect x="0" y="266" width={W} height="1.5" fill="#f2f2f0" />
      <rect x="40" y="190" width="120" height="26" rx="2" fill="none" stroke="#f2f2f0" opacity="0.6" />
    </>
  ),
  // Sensor nanostructure: hexagonal lattice with a few "adsorbed" bright sites
  lattice: () => (
    <>
      {Array.from({ length: 22 }, (_, row) =>
        Array.from({ length: 9 }, (_, col) => {
          const x = col * 24 + (row % 2 ? 12 : 0) + 4
          const y = 70 + row * 22
          const hot = (row * 7 + col * 3) % 11 === 0
          return <circle key={`${row}-${col}`} cx={x} cy={y} r={hot ? 3 : 1.4} fill="#f2f2f0" opacity={hot ? 0.95 : 0.35} />
        }),
      )}
    </>
  ),
  // 3D NAND: stacked word-line layers pierced by vertical channel holes
  stack: () => (
    <>
      {Array.from({ length: 16 }, (_, i) => (
        <rect key={i} x="0" y={140 + i * 24} width={W} height="10" fill="#f2f2f0" opacity={0.08 + (i % 2) * 0.1} />
      ))}
      {[35, 85, 135, 185].map((x) => (
        <g key={x}>
          <rect x={x - 7} y="120" width="14" height="410" rx="7" fill="none" stroke="#f2f2f0" opacity="0.8" />
          <line x1={x} y1="125" x2={x} y2="525" stroke="#f2f2f0" strokeDasharray="1 5" opacity="0.7" />
        </g>
      ))}
    </>
  ),
}

export default function ThemeArt({ pattern }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2f2f0" stopOpacity="0.9" />
          <stop offset="1" stopColor="#f2f2f0" stopOpacity="0" />
        </linearGradient>
      </defs>
      {art[pattern]()}
    </svg>
  )
}
