import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { prefersReducedMotion } from '../hooks'

/*
 * Real-time stand-in for Arox's "celestial" event film: tilted rings of particle streams that
 * flow around an orbit. Dense clumps travel along each ring and bloom into soft glows, so they
 * read as bright smears through the glass card in front.
 */

// Cleared to pure black (which survives the composer's colour encoding untouched); a final
// pass then lifts empty pixels to the page's #0f0f11 in display space, so it matches exactly.
const BG = 0x000000
const LiftShader = {
  uniforms: { tDiffuse: { value: null } },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    varying vec2 vUv;
    void main() {
      vec3 col = texture2D(tDiffuse, vUv).rgb;
      gl_FragColor = vec4(max(col, vec3(0.0588, 0.0588, 0.0667)), 1.0); // #0f0f11
    }
  `,
}

// Each ribbon: radius, particle count, tilt (x, y, z), stream width/height, flow speed,
// shape wobble, and clumps as [angle, spread, share of particles].
const RIBBONS = [
  { r: 3.4, n: 15000, tilt: [1.18, 0.0, 0.32], w: 0.09, h: 0.05, speed: 0.07, wobble: 0.09, clumps: [[1.2, 0.55, 0.45], [4.3, 0.35, 0.2]] },
  { r: 2.55, n: 6500, tilt: [1.42, 0.4, -0.55], w: 0.07, h: 0.05, speed: -0.1, wobble: 0.14, clumps: [[2.6, 0.4, 0.5]] },
  { r: 4.4, n: 3000, tilt: [0.98, -0.25, 0.7], w: 0.3, h: 0.22, speed: 0.035, wobble: 0.05, clumps: [[5.2, 0.6, 0.3]] },
]

const vert = /* glsl */ `
  attribute float aTheta;
  attribute float aOff;
  attribute float aY;
  attribute float aSize;
  attribute float aBright;
  attribute float aJit;
  uniform float uTime;
  uniform float uSpeed;
  uniform float uR;
  uniform float uWobble;
  uniform float uPixelRatio;
  uniform float uOpacity;
  varying float vA;
  void main() {
    float th = aTheta + uTime * uSpeed * (1.0 + aJit * 0.35);
    float r = uR * (1.0 + uWobble * sin(2.0 * th + 1.3)) + aOff;
    vec3 p = vec3(cos(th) * r, aY + 0.08 * sin(3.0 * th + aJit * 6.28), sin(th) * r);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = min(aSize * uPixelRatio * (30.0 / -mv.z), 6.0 * uPixelRatio);
    vA = aBright * uOpacity;
  }
`
const frag = /* glsl */ `
  varying float vA;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vec3(1.0), a * a * vA);
  }
`

function gaussian(rnd) {
  // Box–Muller
  const u = Math.max(rnd(), 1e-6)
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd())
}

function buildRibbon(spec, rnd, pixelRatio) {
  const { n } = spec
  const theta = new Float32Array(n)
  const off = new Float32Array(n)
  const y = new Float32Array(n)
  const size = new Float32Array(n)
  const bright = new Float32Array(n)
  const jit = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    let r = rnd()
    let inClump = false
    let t = rnd() * Math.PI * 2
    for (const [center, spread, share] of spec.clumps) {
      if (r < share) {
        t = center + gaussian(rnd) * spread
        inClump = true
        break
      }
      r -= share
    }
    theta[i] = t
    const g = gaussian(rnd)
    off[i] = g * spec.w * (inClump ? 1.3 : 1)
    y[i] = gaussian(rnd) * spec.h
    size[i] = (inClump ? 1.2 : 0.8) + rnd() * 1.4
    bright[i] = (inClump ? 0.75 : 0.2) + rnd() * (inClump ? 0.6 : 0.35)
    jit[i] = rnd()
  }
  const geo = new THREE.BufferGeometry()
  // position is unused by the shader but three.js needs it for the draw count
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3))
  geo.setAttribute('aTheta', new THREE.BufferAttribute(theta, 1))
  geo.setAttribute('aOff', new THREE.BufferAttribute(off, 1))
  geo.setAttribute('aY', new THREE.BufferAttribute(y, 1))
  geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
  geo.setAttribute('aBright', new THREE.BufferAttribute(bright, 1))
  geo.setAttribute('aJit', new THREE.BufferAttribute(jit, 1))
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), spec.r * 1.5)

  const mat = new THREE.ShaderMaterial({
    vertexShader: vert,
    fragmentShader: frag,
    uniforms: {
      uTime: { value: 0 },
      uSpeed: { value: spec.speed },
      uR: { value: spec.r },
      uWobble: { value: spec.wobble },
      uPixelRatio: { value: pixelRatio },
      uOpacity: { value: 1 },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  const points = new THREE.Points(geo, mat)
  points.rotation.set(...spec.tilt)
  return points
}

function mulberry(seed) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export default function GenesisScene({ className = '' }) {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    const reduced = prefersReducedMotion()

    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
    renderer.setClearColor(BG, 1)
    mount.appendChild(renderer.domElement)
    renderer.domElement.style.cssText = 'width:100%;height:100%;display:block'

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100)
    camera.position.set(0, 0, 11)

    const rnd = mulberry(11)
    const group = new THREE.Group()
    const ribbons = RIBBONS.map((spec) => buildRibbon(spec, rnd, renderer.getPixelRatio()))
    ribbons.forEach((r) => group.add(r))
    scene.add(group)

    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    // high threshold: only the dense clumps glow, the background stays #0f0f11
    // small radius keeps the glow tight around the arcs instead of fogging the frame
    // tight, high-threshold bloom: the arcs glow without fogging the background grey
    const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.85, 0.25, 0.42)
    composer.addPass(bloom)
    composer.addPass(new OutputPass())
    composer.addPass(new ShaderPass(LiftShader))

    let width = 1
    let height = 1
    const resize = () => {
      width = mount.clientWidth || 1
      height = mount.clientHeight || 1
      renderer.setSize(width, height, false)
      composer.setSize(width, height)
      camera.aspect = width / height
      // keep the ring a similar size on screen whatever the section's aspect ratio
      camera.position.z = width / height < 1 ? 20 : 16.5
      camera.updateProjectionMatrix()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(mount)

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 }
    const onMove = (e) => {
      mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('pointermove', onMove)

    let raf
    let running = false
    let clock = 12
    let last = performance.now()
    const frame = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      clock += dt
      mouse.x += (mouse.tx - mouse.x) * 0.03
      mouse.y += (mouse.ty - mouse.y) * 0.03
      group.rotation.y = clock * 0.04 + mouse.x * 0.12
      group.rotation.x = mouse.y * 0.08
      ribbons.forEach((r) => (r.material.uniforms.uTime.value = clock))
      composer.render(dt)
      if (running) raf = requestAnimationFrame(frame)
    }

    if (reduced) {
      frame(performance.now())
    }

    // Only animate while on screen
    const io = new IntersectionObserver(([entry]) => {
      if (reduced) return
      if (entry.isIntersecting && !running) {
        running = true
        last = performance.now()
        raf = requestAnimationFrame(frame)
      } else if (!entry.isIntersecting) {
        running = false
        cancelAnimationFrame(raf)
      }
    })
    io.observe(mount)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      window.removeEventListener('pointermove', onMove)
      ribbons.forEach((r) => {
        r.geometry.dispose()
        r.material.dispose()
      })
      composer.dispose()
      renderer.dispose()
      mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} aria-hidden="true" className={className} />
}
