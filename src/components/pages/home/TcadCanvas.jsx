import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../../../hooks'

// A monochrome "TCAD" cross-section of a charge-sheet superjunction: drift-region pillars,
// animated equipotential lines and carriers drifting through the field. Plain 2D canvas.
export default function TcadCanvas({ className = '' }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    const reduced = prefersReducedMotion()
    let w = 0
    let h = 0
    let raf
    let visible = true

    const carriers = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random(), v: 0.04 + Math.random() * 0.08 }))

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const PILLARS = 6
    // potential (0 at top, 1 at bottom) bent by the pillar charge
    const bend = (x, t) => 0.07 * Math.sin((x * PILLARS * Math.PI * 2) / 1) * (0.75 + 0.25 * Math.sin(t * 0.8))

    const draw = (time) => {
      const t = time * 0.001
      ctx.fillStyle = '#0b0b0d'
      ctx.fillRect(0, 0, w, h)

      const top = h * 0.16
      const bottom = h * 0.9
      const dh = bottom - top

      // pillars
      for (let i = 0; i < PILLARS; i++) {
        const x0 = (i / PILLARS) * w + (w / PILLARS) * 0.3
        const pw = (w / PILLARS) * 0.4
        const g = ctx.createLinearGradient(0, top, 0, bottom)
        g.addColorStop(0, 'rgba(255,255,255,0.14)')
        g.addColorStop(1, 'rgba(255,255,255,0.02)')
        ctx.fillStyle = g
        ctx.fillRect(x0, top + dh * 0.04, pw, dh * 0.82)
        ctx.strokeStyle = 'rgba(255,255,255,0.35)'
        ctx.lineWidth = 1
        ctx.strokeRect(x0 + 0.5, top + dh * 0.04 + 0.5, pw, dh * 0.82)
      }

      // equipotential lines
      const levels = 14
      for (let k = 1; k < levels; k++) {
        const L = k / levels
        ctx.beginPath()
        for (let px = 0; px <= w; px += 4) {
          const x = px / w
          // fixed-point solve of y + bend(x)*sin(pi*y) = L
          let y = L
          for (let it = 0; it < 4; it++) y = L - bend(x, t) * Math.sin(Math.PI * y)
          const py = top + y * dh
          if (px === 0) ctx.moveTo(px, py)
          else ctx.lineTo(px, py)
        }
        ctx.strokeStyle = `rgba(255,255,255,${0.18 + 0.5 * Math.sin(Math.PI * L)})`
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // carriers drifting down the field
      ctx.fillStyle = 'rgba(255,255,255,0.9)'
      for (const c of carriers) {
        if (!reduced) {
          c.y += c.v * 0.016
          if (c.y > 1) {
            c.y = 0
            c.x = Math.random()
          }
        }
        ctx.beginPath()
        ctx.arc(c.x * w, top + c.y * dh, 1.3, 0, Math.PI * 2)
        ctx.fill()
      }

      // electrodes
      ctx.fillStyle = 'rgba(255,255,255,0.85)'
      ctx.fillRect(0, top - 6, w, 2)
      ctx.fillRect(0, bottom + 4, w, 2)

      if (!reduced && visible) raf = requestAnimationFrame(draw)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      cancelAnimationFrame(raf)
      if (visible) raf = requestAnimationFrame(draw)
    })
    io.observe(canvas)
    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
    }
  }, [])

  return <canvas ref={ref} aria-hidden="true" className={`block h-full w-full ${className}`} />
}
