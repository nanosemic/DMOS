import { useCallback, useRef } from 'react'
import { clamp01, useScrub } from '../../../hooks'
import { deviceCallouts, researchHero } from '../../../data/research'
import DeviceScene from './DeviceScene'
import { DEVICE_SIZE } from './deviceModel'
import './research.css'

const { W, D } = DEVICE_SIZE

// where each callout touches the model, in the layer's own coordinates (front face, z = D/2)
const ANCHOR_POS = {
  source: [W / 2 - 0.25, 0.1, D / 2],
  gate: [-W / 2 + W / 6, -0.1, D / 2],
  body: [W / 2 - W / 6 + 0.36, 0.1, D / 2],
  drift: [-W / 2 + W / 14, 0.3, D / 2],
  substrate: [W / 2 - 0.25, 0, D / 2],
  drain: [-W / 2 + 0.25, 0, D / 2],
}
const ANCHORS = deviceCallouts.map((c) => ({ id: c.id, layer: c.layer, pos: ANCHOR_POS[c.id] }))

/*
 * Research hero:
 *  - a 3D cut-away of a SiC trench MOSFET builds itself layer by layer, then switches on
 *  - labelled callouts draw out to each layer once it has assembled; hovering a label lights
 *    up that layer (desktop)
 *  - title + subtitle at the top; headline (left) and intro + key facts (right) at the bottom
 *  - every line slides up from behind a mask; scrolling away turns the device, starts pulling
 *    its layers apart (a preview of the next section) and fades the hero out
 */
export default function ResearchHero() {
  const sectionRef = useRef(null)
  const contentRef = useRef(null)
  const sceneRef = useRef(null)
  const calloutsRef = useRef(null)
  const explodeRef = useRef(0)
  const spinRef = useRef(0)
  const highlightRef = useRef(null)

  useScrub(
    sectionRef,
    (rect, vh) => clamp01(-rect.top / (vh * 1.1)),
    (p) => {
      explodeRef.current = p * 0.45
      spinRef.current = p
      contentRef.current.style.opacity = 1 - p * 1.3
      contentRef.current.style.transform = `translate3d(0, ${-50 * p}px, 0)`
      calloutsRef.current.style.opacity = 1 - p * 2.5
      sceneRef.current.style.opacity = 1 - p * 0.6
    },
    { rest: 0 },
  )

  // move the callout lines and labels with the model every frame (no React re-render)
  const onProject = useCallback((points, built) => {
    const root = calloutsRef.current
    if (!root) return
    if (built > 0.6) root.classList.add('is-on')
    const right = points.filter((_, i) => deviceCallouts[i].side > 0)
    const left = points.filter((_, i) => deviceCallouts[i].side < 0)
    // label columns sit clear of the block (its back corners reach past the front-face anchors)
    const rightX = Math.max(...right.map((p) => p.x)) + 120
    const leftX = Math.min(...left.map((p) => p.x)) - 80
    points.forEach((p, i) => {
      const c = deviceCallouts[i]
      const ly = p.y + c.dy
      const lx = c.side > 0 ? rightX : leftX
      const line = root.querySelector(`[data-line="${c.id}"]`)
      const dot = root.querySelector(`[data-dot="${c.id}"]`)
      const label = root.querySelector(`[data-label="${c.id}"]`)
      line.setAttribute('points', `${p.x},${p.y} ${p.x + c.side * 26},${ly} ${lx},${ly}`)
      dot.setAttribute('cx', p.x)
      dot.setAttribute('cy', p.y)
      label.style.transform = `translate3d(${c.side > 0 ? lx + 10 : lx - 10}px, ${ly}px, 0) translate(${c.side > 0 ? '0' : '-100%'}, -50%)`
    })
  }, [])

  const { title, subtitle, eyebrow, headline, intro, facts, figure } = researchHero

  return (
    <section ref={sectionRef} id="top" className="relative h-[100svh] min-h-[640px] overflow-hidden bg-ink">
      <div ref={sceneRef} className="absolute inset-x-0 top-[16%] bottom-0 lg:top-0">
        <DeviceScene
          className="h-full w-full"
          explodeRef={explodeRef}
          spinRef={spinRef}
          highlightRef={highlightRef}
          anchors={ANCHORS}
          onProject={onProject}
        />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/80 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-ink via-ink/75 to-transparent" />

      {/* callouts (desktop only: too cramped on phones) */}
      <div ref={calloutsRef} className="callouts pointer-events-none absolute inset-0 hidden lg:block">
        <svg className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
          {deviceCallouts.map((c, i) => (
            <g key={c.id} style={{ '--i': i }}>
              <polyline data-line={c.id} className="callout-line" fill="none" stroke="currentColor" strokeWidth="1" />
              <circle data-dot={c.id} className="callout-dot" r="3" fill="currentColor" />
            </g>
          ))}
        </svg>
        {deviceCallouts.map((c, i) => (
          <div
            key={c.id}
            data-label={c.id}
            style={{ '--i': i }}
            className={`callout-label pointer-events-auto absolute top-0 left-0 cursor-default ${c.side > 0 ? 'text-left' : 'text-right'}`}
            onMouseEnter={() => (highlightRef.current = c.layer)}
            onMouseLeave={() => (highlightRef.current = null)}
          >
            <span className="eyebrow block text-[11px]">{String(i + 1).padStart(2, '0')}</span>
            <span className="block text-[14px] leading-tight whitespace-nowrap text-white">{c.label}</span>
            <span className="block text-[12px] leading-tight whitespace-nowrap text-white/45">{c.note}</span>
          </div>
        ))}
        <p className="callout-figure eyebrow absolute top-[23%] right-[4%] max-w-[240px] text-right text-[11px] leading-snug">
          {figure}
        </p>
      </div>

      <div ref={contentRef} className="pointer-events-none relative h-full will-change-transform">
        {/* top centre */}
        <div className="absolute inset-x-0 top-[13%] px-5 text-center">
          <h1 className="text-[clamp(2.1rem,3.3vw,3.25rem)] leading-none font-normal text-white">
            <span className="line-mask">
              <span style={{ '--d': '0.2s' }}>{title}</span>
            </span>
          </h1>
          <p className="eyebrow mt-3 uppercase">
            <span className="line-mask">
              <span style={{ '--d': '0.35s' }}>{subtitle}</span>
            </span>
          </p>
        </div>

        {/* bottom: headline left, intro + facts right */}
        <div className="absolute inset-x-0 bottom-[7%] mx-auto grid max-w-[1440px] gap-6 px-5 sm:px-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-end lg:gap-16 lg:px-[5vw]">
          <div>
            <p className="eyebrow uppercase">
              <span className="line-mask">
                <span style={{ '--d': '0.9s' }}>— {eyebrow}</span>
              </span>
            </p>
            <h2 className="mt-3 text-[clamp(2rem,3.6vw,3.6rem)] leading-[1.02] font-normal text-white">
              {headline.map((line, i) => (
                <span key={i} className="line-mask">
                  <span style={{ '--d': `${1 + i * 0.12}s` }}>
                    {line.text}
                    {line.accent && <em className="font-serif font-normal">{line.accent}</em>}
                  </span>
                </span>
              ))}
            </h2>
          </div>

          <div className="pointer-events-auto">
            <p className="text-[15px] leading-relaxed text-white/65">
              <span className="line-mask">
                <span style={{ '--d': '1.25s' }}>{intro}</span>
              </span>
            </p>
            <dl className="hero-facts mt-5 hidden border-t border-white/10 sm:grid sm:grid-cols-3">
              {facts.map((f, i) => (
                <div key={f.label} style={{ '--i': i }} className="border-b border-white/10 py-3 sm:border-b-0 sm:pr-4">
                  <dt className="eyebrow text-[11px] uppercase">{f.label}</dt>
                  <dd className="mt-1 text-[13px] leading-snug text-white/85">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* scroll cue */}
      <div className="pointer-events-none absolute bottom-3 left-1/2 hidden -translate-x-1/2 lg:block" aria-hidden="true">
        <span className="scroll-cue block h-8 w-px overflow-hidden bg-white/15">
          <span className="block h-1/2 w-full bg-white/80" />
        </span>
      </div>
    </section>
  )
}
