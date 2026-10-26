import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { prefersReducedMotion } from '../hooks'

/*
 * Real-time "header film" of a Nano Semic / D-MOS power chip, cut like a product video:
 *   A  Genesis  – particles converge and a wireframe chip pops up out of the dark
 *   B  Flyover  – camera skims the die surface while signals race along the traces
 *   C  X-ray    – translucent package reveals the die and bond wires
 *   D  Package  – the finished QFN package with metal pads and laser marking
 * Shots are separated by short fades to black and the whole sequence loops.
 */

// Clear and fog to pure black (it survives the composer's colour encoding untouched); the
// finish pass then lifts empty areas to the page's #0f0f11 in display space.
const BG = 0x000000
const SHOTS = [
  { id: 'A', dur: 9 },
  { id: 'B', dur: 7 },
  { id: 'C', dur: 7.5 },
  { id: 'D', dur: 8.5 },
]
const LOOP = SHOTS.reduce((s, x) => s + x.dur, 0)
const FADE = 0.6

// Package geometry (world units)
const SIZE = 4
const HALF = SIZE / 2
const THICK = 0.46
const TOP = THICK / 2

const clamp01 = (v) => Math.min(Math.max(v, 0), 1)
const smooth = (v) => {
  const t = clamp01(v)
  return t * t * (3 - 2 * t)
}
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const easeOutBack = (t) => {
  const c1 = 1.4
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}
const lerp = (a, b, t) => a + (b - a) * t

// ---------------------------------------------------------------- geometry builders

function padLayout() {
  // 10 pads per edge, QFN style, sitting on the top face near the edge.
  const pads = []
  const n = 10
  const pitch = 0.3
  for (let side = 0; side < 4; side++) {
    for (let i = 0; i < n; i++) {
      const u = (i - (n - 1) / 2) * pitch
      const inset = HALF - 0.26
      // side 0: +z, 1: -z, 2: +x, 3: -x
      const p =
        side === 0 ? [u, inset] : side === 1 ? [u, -inset] : side === 2 ? [inset, u] : [-inset, u]
      pads.push({ x: p[0], z: p[1], side, u })
    }
  }
  return pads
}

// Manhattan-routed traces from every pad to the die ring, plus some internal routing.
function buildTraces(pads) {
  const rnd = mulberry(42)
  const lines = []
  const DIE = 0.78
  for (const p of pads) {
    const dirIn = p.side === 0 ? [0, -1] : p.side === 1 ? [0, 1] : p.side === 2 ? [-1, 0] : [1, 0]
    const a = [p.x + dirIn[0] * 0.2, p.z + dirIn[1] * 0.2]
    const kneeDepth = 0.25 + rnd() * 0.35
    const b = [a[0] + dirIn[0] * kneeDepth, a[1] + dirIn[1] * kneeDepth]
    // diagonal jog toward the die, then straight in
    const along = p.side < 2 ? [1, 0] : [0, 1]
    const target = Math.max(-DIE + 0.05, Math.min(DIE - 0.05, p.u * 0.45))
    const cur = p.side < 2 ? b[0] : b[1]
    const jog = target - cur
    const c = [b[0] + along[0] * jog + dirIn[0] * Math.abs(jog), b[1] + along[1] * jog + dirIn[1] * Math.abs(jog)]
    const d =
      p.side === 0 ? [c[0], DIE] : p.side === 1 ? [c[0], -DIE] : p.side === 2 ? [DIE, c[1]] : [-DIE, c[1]]
    lines.push([a, b, c, d])
  }
  // die ring
  lines.push([
    [-DIE, -DIE],
    [DIE, -DIE],
    [DIE, DIE],
    [-DIE, DIE],
    [-DIE, -DIE],
  ])
  // internal grid-ish routing on the die
  for (let i = 0; i < 26; i++) {
    let x = Math.round((rnd() * 2 - 1) * 6) / 10
    let z = Math.round((rnd() * 2 - 1) * 6) / 10
    const pts = [[x, z]]
    for (let k = 0; k < 3; k++) {
      if (k % 2 === 0) x = Math.max(-0.7, Math.min(0.7, x + (rnd() - 0.5) * 0.9))
      else z = Math.max(-0.7, Math.min(0.7, z + (rnd() - 0.5) * 0.9))
      pts.push([x, z])
    }
    lines.push(pts)
  }
  return lines
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

function polylineLength(pts) {
  let L = 0
  for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
  return L
}

function pointOnPolyline(pts, s) {
  let rest = s
  for (let i = 1; i < pts.length; i++) {
    const seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
    if (rest <= seg) {
      const t = seg === 0 ? 0 : rest / seg
      return [lerp(pts[i - 1][0], pts[i][0], t), lerp(pts[i - 1][1], pts[i][1], t)]
    }
    rest -= seg
  }
  return pts[pts.length - 1]
}

function markingTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 1024
  const g = c.getContext('2d')
  g.fillStyle = '#fff'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  // text sits in the gap between the thermal pad and the pad ring
  g.font = '500 44px "Roboto Mono", monospace'
  g.fillText('NANO SEMIC', 512, 512 + 340)
  g.font = '400 30px "Roboto Mono", monospace'
  g.fillText('D-MOS · 4H-SiC · IIT BBS', 512, 512 - 340)
  g.beginPath()
  g.arc(512 - 340, 512 - 340, 16, 0, Math.PI * 2)
  g.fill()
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

function dieTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 512
  const g = c.getContext('2d')
  g.fillStyle = '#0c0c0e'
  g.fillRect(0, 0, 512, 512)
  g.strokeStyle = 'rgba(255,255,255,0.55)'
  g.lineWidth = 1
  const rnd = mulberry(7)
  // superjunction-like stripes + blocks
  for (let x = 24; x < 488; x += 10) {
    g.globalAlpha = 0.25 + rnd() * 0.5
    g.beginPath()
    g.moveTo(x, 40)
    g.lineTo(x, 472)
    g.stroke()
  }
  g.globalAlpha = 1
  g.strokeStyle = '#fff'
  g.lineWidth = 3
  g.strokeRect(16, 16, 480, 480)
  for (let i = 0; i < 12; i++) {
    g.fillStyle = `rgba(255,255,255,${0.15 + rnd() * 0.5})`
    g.fillRect(30 + rnd() * 400, 30 + rnd() * 400, 20 + rnd() * 70, 8 + rnd() * 30)
  }
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// ---------------------------------------------------------------- shaders

const particleVert = /* glsl */ `
  attribute vec3 aStart;
  attribute float aSize;
  attribute float aDelay;
  attribute float aSeed;
  uniform float uProgress;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uDrift;
  varying float vAlpha;
  void main() {
    float p = clamp(uProgress * 1.6 - aDelay, 0.0, 1.0);
    p = p * p * (3.0 - 2.0 * p);
    vec3 pos = mix(aStart, position, p);
    float wobble = 0.012 + (1.0 - p) * 0.25 + uDrift;
    pos += vec3(sin(uTime * 0.6 + aSeed * 6.28), cos(uTime * 0.5 + aSeed * 4.0), sin(uTime * 0.4 + aSeed * 9.0)) * wobble;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = min(aSize * uPixelRatio * (36.0 / -mv.z), 7.0 * uPixelRatio);
    // fade out anything that gets too close to the lens
    vAlpha = mix(0.35, 1.0, p) * smoothstep(0.4, 2.0, -mv.z);
  }
`
const particleFrag = /* glsl */ `
  uniform float uOpacity;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vec3(1.0), a * a * vAlpha * uOpacity);
  }
`

const bokehVert = /* glsl */ `
  attribute float aSize;
  attribute float aSeed;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vSeed;
  void main() {
    vec3 pos = position + vec3(sin(uTime * 0.15 + aSeed * 6.0), cos(uTime * 0.12 + aSeed * 3.0), 0.0) * 0.4;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = min(aSize * uPixelRatio * (30.0 / -mv.z), 48.0 * uPixelRatio);
    vSeed = aSeed;
  }
`
const bokehFrag = /* glsl */ `
  uniform float uOpacity;
  varying float vSeed;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float disc = smoothstep(0.5, 0.42, d);
    float core = smoothstep(0.5, 0.0, d) * 0.4;
    gl_FragColor = vec4(vec3(1.0), (disc * 0.1 + core * 0.5) * (0.2 + fract(vSeed * 7.0) * 0.6) * uOpacity);
  }
`

// Film finish: grain, vignette and fade to black between shots.
const FinishShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uFade: { value: 1 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uFade;
    varying vec2 vUv;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main() {
      vec4 col = texture2D(tDiffuse, vUv);
      float lum = dot(col.rgb, vec3(0.299, 0.587, 0.114));
      col.rgb = mix(col.rgb, vec3(lum), 0.85);              // near-monochrome grade
      float v = smoothstep(1.15, 0.35, length(vUv - 0.5) * 1.4);
      col.rgb *= v;
      col.rgb += (hash(vUv * 900.0 + uTime) - 0.5) * 0.025;  // grain
      vec3 bg = vec3(0.0588, 0.0588, 0.0667);                // #0f0f11
      col.rgb = mix(bg, max(col.rgb, bg * v), uFade);
      gl_FragColor = col;
    }
  `,
}

// ---------------------------------------------------------------- component

export default function ChipScene({ className = '' }) {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    const reduced = prefersReducedMotion()

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
    renderer.setClearColor(BG, 1)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.05
    mount.appendChild(renderer.domElement)
    renderer.domElement.style.cssText = 'width:100%;height:100%;display:block'

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(BG, 0.045)
    const pmrem = new THREE.PMREMGenerator(renderer)
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environmentIntensity = 0.35

    const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 200)

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.08))
    const key = new THREE.DirectionalLight(0xffffff, 1.6)
    key.position.set(-4, 6, 3)
    scene.add(key)
    const rim = new THREE.DirectionalLight(0xffffff, 2.2)
    rim.position.set(5, 2, -5)
    scene.add(rim)
    const sweep = new THREE.PointLight(0xffffff, 5, 9, 1.6)
    scene.add(sweep)

    const chip = new THREE.Group()
    scene.add(chip)

    // Package body
    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: 0x101012,
      roughness: 0.55,
      metalness: 0.15,
      clearcoat: 0.35,
      clearcoatRoughness: 0.5,
      transparent: true,
    })
    const body = new THREE.Mesh(new RoundedBoxGeometry(SIZE, THICK, SIZE, 4, 0.06), bodyMat)
    chip.add(body)

    // Pads + thermal pad
    const pads = padLayout()
    const padMat = new THREE.MeshStandardMaterial({ color: 0xcfc9bd, metalness: 1, roughness: 0.32, transparent: true })
    const padGeo = new THREE.BoxGeometry(0.17, 0.025, 0.4)
    const padMesh = new THREE.InstancedMesh(padGeo, padMat, pads.length)
    const m4 = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    pads.forEach((p, i) => {
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), p.side < 2 ? 0 : Math.PI / 2)
      m4.compose(new THREE.Vector3(p.x, TOP + 0.005, p.z), q, new THREE.Vector3(1, 1, 1))
      padMesh.setMatrixAt(i, m4)
    })
    chip.add(padMesh)
    const thermal = new THREE.Mesh(new RoundedBoxGeometry(2.1, 0.025, 2.1, 2, 0.01), padMat)
    thermal.position.y = TOP + 0.005
    chip.add(thermal)

    // Laser marking
    const markMat = new THREE.MeshBasicMaterial({ map: markingTexture(), transparent: true, opacity: 0, depthWrite: false })
    const mark = new THREE.Mesh(new THREE.PlaneGeometry(SIZE * 0.98, SIZE * 0.98), markMat)
    mark.rotation.x = -Math.PI / 2
    mark.position.y = TOP + 0.002
    chip.add(mark)

    // Wireframe outline
    const wireMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 })
    const wire = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(SIZE, THICK, SIZE)), wireMat)
    chip.add(wire)
    const innerWire = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(SIZE * 0.86, THICK * 0.6, SIZE * 0.86)), wireMat)
    chip.add(innerWire)

    // Traces
    const traces = buildTraces(pads)
    const traceVerts = []
    for (const pts of traces) {
      for (let i = 1; i < pts.length; i++) {
        traceVerts.push(pts[i - 1][0], TOP + 0.012, pts[i - 1][1], pts[i][0], TOP + 0.012, pts[i][1])
      }
    }
    const traceGeo = new THREE.BufferGeometry()
    traceGeo.setAttribute('position', new THREE.Float32BufferAttribute(traceVerts, 3))
    const traceMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 })
    chip.add(new THREE.LineSegments(traceGeo, traceMat))

    // Signal pulses travelling on the traces
    const PULSES = 140
    const traceLens = traces.map(polylineLength)
    const pulseState = Array.from({ length: PULSES }, (_, i) => ({
      trace: i % traces.length,
      s: Math.random() * traceLens[i % traces.length],
      v: 0.5 + Math.random() * 1.1,
    }))
    const pulseGeo = new THREE.BufferGeometry()
    const pulsePos = new Float32Array(PULSES * 3)
    pulseGeo.setAttribute('position', new THREE.BufferAttribute(pulsePos, 3))
    const pulseMat = new THREE.ShaderMaterial({
      vertexShader: /* glsl */ `
        uniform float uPixelRatio;
        varying float vNear;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = min(5.0 * uPixelRatio * (3.0 / -mv.z), 9.0 * uPixelRatio);
          vNear = smoothstep(0.3, 1.2, -mv.z);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float opacity;
        varying float vNear;
        void main() {
          float a = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5));
          gl_FragColor = vec4(vec3(1.0), a * opacity * vNear);
        }
      `,
      uniforms: { opacity: { value: 0 }, uPixelRatio: { value: renderer.getPixelRatio() } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    chip.add(new THREE.Points(pulseGeo, pulseMat))

    // Die + bond wires (x-ray shot)
    const dieMat = new THREE.MeshStandardMaterial({
      map: dieTexture(),
      emissive: 0xffffff,
      emissiveMap: null,
      emissiveIntensity: 0,
      roughness: 0.4,
      metalness: 0.3,
      transparent: true,
      opacity: 0,
    })
    dieMat.emissiveMap = dieMat.map
    const die = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.06, 1.5), dieMat)
    chip.add(die)
    const wireTubeMat = new THREE.MeshStandardMaterial({ color: 0xe8e4da, metalness: 1, roughness: 0.25, transparent: true, opacity: 0 })
    const bondGroup = new THREE.Group()
    pads.forEach((p) => {
      const start = new THREE.Vector3(p.x * 0.33, 0.04, p.z * 0.33)
      const end = new THREE.Vector3(p.x * 0.9, 0.0, p.z * 0.9)
      const mid = start.clone().lerp(end, 0.35).setY(0.32)
      const tube = new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(start, mid, end), 20, 0.008, 5)
      bondGroup.add(new THREE.Mesh(tube, wireTubeMat))
    })
    chip.add(bondGroup)

    // Converging particles: targets sampled on traces, edges and the top face
    const rnd = mulberry(3)
    const N = 5200
    const target = new Float32Array(N * 3)
    const start = new Float32Array(N * 3)
    const size = new Float32Array(N)
    const delay = new Float32Array(N)
    const seed = new Float32Array(N)
    const total = traceLens.reduce((a, b) => a + b, 0)
    for (let i = 0; i < N; i++) {
      const r = rnd()
      let x, y, z
      if (r < 0.55) {
        let s = rnd() * total
        let k = 0
        while (s > traceLens[k]) s -= traceLens[k++]
        ;[x, z] = pointOnPolyline(traces[k], s)
        y = TOP + 0.015
      } else if (r < 0.85) {
        // box edges
        const e = Math.floor(rnd() * 12)
        const t = rnd() * SIZE - HALF
        const sx = e & 1 ? HALF : -HALF
        const sy = e & 2 ? TOP : -TOP
        if (e < 4) [x, y, z] = [t, sy, sx]
        else if (e < 8) [x, y, z] = [sx, sy, t]
        else {
          x = e & 1 ? HALF : -HALF
          z = e & 2 ? HALF : -HALF
          y = (rnd() - 0.5) * THICK
        }
      } else {
        x = (rnd() - 0.5) * SIZE
        z = (rnd() - 0.5) * SIZE
        y = TOP
      }
      target.set([x, y, z], i * 3)
      const a = rnd() * Math.PI * 2
      const rad = 4 + rnd() * 9
      start.set([Math.cos(a) * rad, (rnd() - 0.3) * 7, Math.sin(a) * rad], i * 3)
      size[i] = 0.6 + rnd() * 1.6
      delay[i] = rnd() * 0.6
      seed[i] = rnd()
    }
    const partGeo = new THREE.BufferGeometry()
    partGeo.setAttribute('position', new THREE.BufferAttribute(target, 3))
    partGeo.setAttribute('aStart', new THREE.BufferAttribute(start, 3))
    partGeo.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
    partGeo.setAttribute('aDelay', new THREE.BufferAttribute(delay, 1))
    partGeo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    const partMat = new THREE.ShaderMaterial({
      vertexShader: particleVert,
      fragmentShader: particleFrag,
      uniforms: {
        uProgress: { value: 0 },
        uTime: { value: 0 },
        uPixelRatio: { value: renderer.getPixelRatio() },
        uOpacity: { value: 1 },
        uDrift: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    chip.add(new THREE.Points(partGeo, partMat))

    // Out-of-focus dust in the room
    const B = 260
    const bPos = new Float32Array(B * 3)
    const bSize = new Float32Array(B)
    const bSeed = new Float32Array(B)
    for (let i = 0; i < B; i++) {
      bPos.set([(rnd() - 0.5) * 30, (rnd() - 0.4) * 14, (rnd() - 0.5) * 30], i * 3)
      bSize[i] = 2 + rnd() * 10
      bSeed[i] = rnd()
    }
    const bokehGeo = new THREE.BufferGeometry()
    bokehGeo.setAttribute('position', new THREE.BufferAttribute(bPos, 3))
    bokehGeo.setAttribute('aSize', new THREE.BufferAttribute(bSize, 1))
    bokehGeo.setAttribute('aSeed', new THREE.BufferAttribute(bSeed, 1))
    const bokehMat = new THREE.ShaderMaterial({
      vertexShader: bokehVert,
      fragmentShader: bokehFrag,
      uniforms: { uTime: { value: 0 }, uPixelRatio: { value: renderer.getPixelRatio() }, uOpacity: { value: 1 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    scene.add(new THREE.Points(bokehGeo, bokehMat))

    // Post-processing
    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.5, 0.55, 0.6)
    composer.addPass(bloom)
    composer.addPass(new OutputPass())
    // after OutputPass so the grade works in display (sRGB) space and #0f0f11 stays exact
    const finish = new ShaderPass(FinishShader)
    composer.addPass(finish)

    // ------------------------------------------------------------ sizing
    let width = 1
    let height = 1
    const resize = () => {
      width = mount.clientWidth || 1
      height = mount.clientHeight || 1
      renderer.setSize(width, height, false)
      composer.setSize(width, height)
      bloom.setSize(width, height)
      camera.aspect = width / height
      // chip sits centred between the split headline on desktop; lifted above the text on phones
      const lift = width < 1024 ? height * 0.14 : 0
      camera.setViewOffset(width, height, 0, lift, width, height)
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

    // ------------------------------------------------------------ timeline
    const camPos = new THREE.Vector3()
    const camTarget = new THREE.Vector3()

    const applyShot = (id, t, time) => {
      // defaults
      let wireO = 0
      let traceO = 0
      let bodyO = 0
      let padO = 0
      let markO = 0
      let dieO = 0
      let pulseO = 0
      let partO = 0
      let progress = 1
      let drift = 0
      chip.position.y = 0
      chip.rotation.y = 0

      if (id === 'A') {
        // particles converge, wireframe chip pops up
        progress = smooth(t / 0.6)
        partO = 1
        wireO = smooth((t - 0.25) / 0.3)
        traceO = smooth((t - 0.45) / 0.3) * 0.7
        pulseO = smooth((t - 0.6) / 0.25)
        const pop = clamp01((t - 0.1) / 0.45)
        chip.position.y = lerp(-2.4, 0, easeOutBack(pop))
        chip.rotation.y = lerp(-0.6, 0.15, easeInOut(clamp01(t)))
        const a = lerp(0.9, 0.55, easeInOut(t))
        const r = lerp(11, 8, easeInOut(t))
        camPos.set(Math.sin(a) * r, lerp(6.5, 4.6, easeInOut(t)), Math.cos(a) * r)
        camTarget.set(0, lerp(-0.6, 0, easeInOut(t)), 0)
      } else if (id === 'B') {
        // skim across the surface between the traces
        partO = 0.3
        traceO = 1
        pulseO = 1
        wireO = 0.4
        bodyO = 0.9
        const e = easeInOut(t)
        camPos.set(lerp(-2.6, -0.2, e), TOP + lerp(0.6, 0.38, e), lerp(1.9, 0.9, e))
        camTarget.set(camPos.x + 2.0, TOP - 0.3, camPos.z - 1.5)
      } else if (id === 'C') {
        // x-ray orbit
        partO = 0.35
        drift = 0.02
        wireO = 1
        traceO = 0.45
        pulseO = 0.6
        bodyO = 0.1
        padO = 0.55
        dieO = 1
        const a = lerp(2.3, 3.5, easeInOut(t))
        const r = lerp(7.2, 6.0, t)
        camPos.set(Math.sin(a) * r, lerp(3.4, 2.4, t), Math.cos(a) * r)
        camTarget.set(0, 0, 0)
      } else {
        // finished package, slow corner dolly with sweeping light
        partO = 0.12
        drift = 0.08
        bodyO = 1
        padO = 1
        markO = smooth((t - 0.15) / 0.35) * 0.55
        const e = easeInOut(t)
        camPos.set(lerp(4.6, 2.6, e), lerp(2.6, 1.35, e), lerp(5.4, 3.3, e))
        camTarget.set(lerp(0.2, 0.9, e), 0, lerp(0.2, 0.9, e))
      }

      // portrait screens: pull back so the whole package fits the narrow frame
      const aspect = width / height
      if (aspect < 1 && id !== 'B') {
        camPos.sub(camTarget).multiplyScalar(Math.min(1 / aspect, 2.1) * 0.85).add(camTarget)
      }

      // mouse parallax
      camPos.x += mouse.x * 0.25
      camPos.y -= mouse.y * 0.15

      wireMat.opacity = wireO * 0.85
      traceMat.opacity = traceO * 0.6
      bodyMat.opacity = bodyO
      bodyMat.depthWrite = bodyO > 0.95
      body.visible = bodyO > 0.01
      padMat.opacity = padO
      padMesh.visible = padO > 0.01
      thermal.visible = padO > 0.9 // the big pad would hide the die in the x-ray shot
      markMat.opacity = markO
      dieMat.opacity = dieO
      dieMat.emissiveIntensity = dieO * 0.12
      die.visible = dieO > 0.01
      wireTubeMat.opacity = dieO
      bondGroup.visible = dieO > 0.01
      pulseMat.uniforms.opacity.value = pulseO
      partMat.uniforms.uOpacity.value = partO
      partMat.uniforms.uProgress.value = progress
      partMat.uniforms.uDrift.value = drift

      // Reflections and the sweep light only on the finished package: at the grazing
      // angles of the other shots the clearcoat mirrors the studio lights and blows out.
      const glossy = id === 'D'
      bodyMat.envMapIntensity = glossy ? 1 : 0.02
      bodyMat.clearcoat = glossy ? 0.35 : 0
      padMat.envMapIntensity = glossy ? 1 : 0.15
      key.intensity = glossy ? 1.6 : 0.4
      rim.intensity = glossy ? 2.2 : 0.6
      sweep.visible = glossy
      sweep.position.set(Math.sin(time * 0.5) * 4, 2.2, Math.cos(time * 0.5) * 4)
    }

    const updatePulses = (dt) => {
      for (let i = 0; i < PULSES; i++) {
        const p = pulseState[i]
        p.s += p.v * dt
        if (p.s > traceLens[p.trace]) {
          p.trace = Math.floor(Math.random() * traces.length)
          p.s = 0
        }
        const [x, z] = pointOnPolyline(traces[p.trace], p.s)
        pulsePos[i * 3] = x
        pulsePos[i * 3 + 1] = TOP + 0.02
        pulsePos[i * 3 + 2] = z
      }
      pulseGeo.attributes.position.needsUpdate = true
    }

    let raf
    let running = true
    let last = performance.now()
    let clock = 0

    const frame = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      clock += dt

      mouse.x += (mouse.tx - mouse.x) * 0.03
      mouse.y += (mouse.ty - mouse.y) * 0.03

      // reduced motion: hold a still of the finished package
      let loopT = reduced ? LOOP - SHOTS[3].dur * 0.55 : clock % LOOP
      let shot = SHOTS[0]
      let local = 0
      for (const s of SHOTS) {
        if (loopT < s.dur) {
          shot = s
          local = loopT
          break
        }
        loopT -= s.dur
      }
      const t = local / shot.dur
      applyShot(shot.id, t, clock)
      updatePulses(dt)

      const fade = reduced ? 1 : Math.min(smooth(local / FADE), smooth((shot.dur - local) / FADE))
      finish.uniforms.uFade.value = fade
      finish.uniforms.uTime.value = clock
      partMat.uniforms.uTime.value = clock
      bokehMat.uniforms.uTime.value = clock

      camera.position.copy(camPos)
      camera.lookAt(camTarget)
      composer.render(dt)

      if (running && !reduced) raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    // Dev helper: window.__chipSeek(seconds) jumps the film to a point in the loop.
    if (import.meta.env.DEV) window.__chipSeek = (s) => (clock = s)

    // Pause when off-screen or tab hidden
    const io = new IntersectionObserver(([entry]) => {
      const visible = entry.isIntersecting && !document.hidden
      if (visible && !running && !reduced) {
        running = true
        last = performance.now()
        raf = requestAnimationFrame(frame)
      } else if (!visible) {
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
      scene.traverse((o) => {
        o.geometry?.dispose()
        const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : []
        mats.forEach((m) => {
          m.map?.dispose()
          m.dispose()
        })
      })
      scene.environment?.dispose()
      pmrem.dispose()
      composer.dispose()
      renderer.dispose()
      mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} aria-hidden="true" className={className} />
}
