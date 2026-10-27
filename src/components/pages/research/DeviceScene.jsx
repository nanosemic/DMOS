import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { prefersReducedMotion } from '../../../hooks'
import { DEVICE_SIZE, LAYERS } from './deviceModel'

/*
 * A cut-away block of a silicon-carbide trench MOSFET with superjunction pillars — the kind of
 * power device the group designs. Layers, bottom to top: drain metal, n+ substrate, drift region
 * (alternating superjunction pillars), body / source, gate trenches (oxide + gate) and source
 * metal. It stands on a fading technical grid with a light sweeping across it.
 *
 * On load the layers drop in one by one, then the gate "switches on" and electrons start to
 * stream down through the pillars, pulsing with each gate cycle.
 *
 * Props (all optional):
 *  - explodeRef.current  0..1   pulls the layers apart (driven by scroll)
 *  - spinRef.current     0..1   extra turn of the block (driven by scroll)
 *  - highlightRef.current       id of a layer to light up (from hovering its label)
 *  - anchors / onProject        3D points on layers, projected to screen px every frame so HTML
 *                               callouts can follow the model
 */

const { W, D } = DEVICE_SIZE
const PILLARS = 7
const TRENCHES = 3

const FinishShader = {
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 } },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    varying vec2 vUv;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main() {
      vec3 col = texture2D(tDiffuse, vUv).rgb;
      float lum = dot(col, vec3(0.299, 0.587, 0.114));
      col = mix(col, vec3(lum), 0.9);
      col *= smoothstep(1.25, 0.3, length(vUv - 0.5) * 1.3);
      col += (hash(vUv * 900.0 + uTime) - 0.5) * 0.022;
      gl_FragColor = vec4(max(col, vec3(0.0588, 0.0588, 0.0667)), 1.0); // #0f0f11 floor
    }
  `,
}

// fading line grid on the floor, brightest under the device
const gridVert = /* glsl */ `
  varying vec2 vPos;
  void main() { vPos = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`
const gridFrag = /* glsl */ `
  uniform float uOpacity;
  varying vec2 vPos;
  float line(float v, float w) { float d = abs(fract(v - 0.5) - 0.5) / fwidth(v); return 1.0 - min(d / w, 1.0); }
  void main() {
    vec2 p = vPos / 0.6;
    float g = max(line(p.x, 1.0), line(p.y, 1.0)) * 0.55;
    vec2 q = vPos / 3.0;
    g = max(g, max(line(q.x, 1.2), line(q.y, 1.2)) * 0.9);
    float fade = smoothstep(9.0, 1.5, length(vPos));
    float shadow = smoothstep(3.2, 0.0, length(vPos * vec2(0.85, 1.4)));
    vec3 col = vec3(1.0) * g * fade * 0.16;
    gl_FragColor = vec4(col, (g * fade * 0.16 + shadow * 0.55) * uOpacity);
    gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.0), shadow * 0.6);
  }
`

const clamp01 = (v) => Math.min(Math.max(v, 0), 1)
const easeOut = (t) => 1 - Math.pow(1 - t, 3)
const easeOutBack = (t) => {
  const c1 = 1.5
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

export default function DeviceScene({ className = '', explodeRef, spinRef, highlightRef, anchors = [], onProject }) {
  const mountRef = useRef(null)
  const propsRef = useRef({ anchors, onProject })
  useEffect(() => {
    propsRef.current = { anchors, onProject }
  })

  useEffect(() => {
    const mount = mountRef.current
    const reduced = prefersReducedMotion()

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
    renderer.setClearColor(0x000000, 1) // black survives the colour pipeline; finish pass lifts it
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    mount.appendChild(renderer.domElement)
    renderer.domElement.style.cssText = 'width:100%;height:100%;display:block'

    const scene = new THREE.Scene()
    const pmrem = new THREE.PMREMGenerator(renderer)
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environmentIntensity = 0.4

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)

    scene.add(new THREE.AmbientLight(0xffffff, 0.15))
    const key = new THREE.DirectionalLight(0xffffff, 2.0)
    key.position.set(-5, 6, 6)
    scene.add(key)
    const rim = new THREE.DirectionalLight(0xffffff, 2.6)
    rim.position.set(6, 3, -5)
    scene.add(rim)
    // a light that sweeps across the top metal
    const sweep = new THREE.PointLight(0xffffff, 0, 6, 1.5)
    scene.add(sweep)

    // ---------------------------------------------------------------- materials
    const mat = {
      metal: new THREE.MeshStandardMaterial({ color: 0xb9b6b0, metalness: 1, roughness: 0.42 }),
      substrate: new THREE.MeshStandardMaterial({ color: 0x1a1a1d, metalness: 0.2, roughness: 0.55 }),
      nPillar: new THREE.MeshStandardMaterial({ color: 0x2a2a2e, metalness: 0.15, roughness: 0.5 }),
      pPillar: new THREE.MeshStandardMaterial({ color: 0x6b6b70, metalness: 0.2, roughness: 0.4 }),
      body: new THREE.MeshStandardMaterial({ color: 0x3c3c41, metalness: 0.2, roughness: 0.45 }),
      sourceN: new THREE.MeshStandardMaterial({ color: 0x9a9aa0, metalness: 0.3, roughness: 0.35 }),
      oxide: new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.08,
        transmission: 0.85,
        thickness: 0.3,
        transparent: true,
        opacity: 0.55,
      }),
      gate: new THREE.MeshStandardMaterial({ color: 0x8c8c92, metalness: 0.6, roughness: 0.3, emissive: 0xffffff, emissiveIntensity: 0 }),
    }
    const edgeMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.18 })

    const device = new THREE.Group()
    scene.add(device)
    const layerGroups = {}

    const addBox = (group, w, h, d, x, y, z, material, rounded = false) => {
      const geo = rounded ? new RoundedBoxGeometry(w, h, d, 2, 0.03) : new THREE.BoxGeometry(w, h, d)
      const mesh = new THREE.Mesh(geo, material)
      mesh.position.set(x, y, z)
      group.add(mesh)
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d)), edgeMat)
      edges.position.copy(mesh.position)
      group.add(edges)
    }

    for (const [id, y, h] of LAYERS) {
      const g = new THREE.Group()
      g.userData.baseY = y
      layerGroups[id] = g
      device.add(g)

      if (id === 'drain') addBox(g, W, h, D, 0, 0, 0, mat.metal, true)
      if (id === 'substrate') addBox(g, W, h, D, 0, 0, 0, mat.substrate)
      if (id === 'drift') {
        const pw = W / PILLARS
        for (let i = 0; i < PILLARS; i++) addBox(g, pw, h, D, -W / 2 + pw * (i + 0.5), 0, 0, i % 2 ? mat.pPillar : mat.nPillar)
      }
      if (id === 'body') {
        addBox(g, W, h, D, 0, 0, 0, mat.body)
        for (let i = 0; i < TRENCHES; i++) {
          const x = -W / 2 + (W / TRENCHES) * (i + 0.5)
          addBox(g, 0.32, h * 0.5, D, x - 0.36, h * 0.26, 0, mat.sourceN)
          addBox(g, 0.32, h * 0.5, D, x + 0.36, h * 0.26, 0, mat.sourceN)
        }
      }
      if (id === 'gate') {
        for (let i = 0; i < TRENCHES; i++) {
          const x = -W / 2 + (W / TRENCHES) * (i + 0.5)
          addBox(g, 0.34, 0.72, D * 1.001, x, -0.26, 0, mat.oxide)
          addBox(g, 0.2, 0.62, D * 0.98, x, -0.24, 0, mat.gate)
        }
      }
      if (id === 'source') addBox(g, W, h, D, 0, 0, 0, mat.metal, true)
    }

    // ---------------------------------------------------------------- floor grid + shadow
    const gridMat = new THREE.ShaderMaterial({
      vertexShader: gridVert,
      fragmentShader: gridFrag,
      uniforms: { uOpacity: { value: 0 } },
      transparent: true,
      depthWrite: false,
      extensions: { derivatives: true },
    })
    const grid = new THREE.Mesh(new THREE.PlaneGeometry(22, 22), gridMat)
    grid.rotation.x = -Math.PI / 2
    grid.position.y = -2.05
    scene.add(grid)

    // ---------------------------------------------------------------- electron flow
    const FLOW = 320
    const flowPos = new Float32Array(FLOW * 3)
    const flowState = Array.from({ length: FLOW }, () => {
      const pillar = Math.floor(Math.random() * Math.ceil(PILLARS / 2)) * 2 // even index = n pillar
      const pw = W / PILLARS
      return {
        x: -W / 2 + pw * (pillar + 0.2 + Math.random() * 0.6),
        z: (Math.random() - 0.5) * D * 0.96,
        t: Math.random(),
        v: 0.2 + Math.random() * 0.25,
      }
    })
    const flowGeo = new THREE.BufferGeometry()
    flowGeo.setAttribute('position', new THREE.BufferAttribute(flowPos, 3))
    const flowMat = new THREE.ShaderMaterial({
      uniforms: { uPixelRatio: { value: renderer.getPixelRatio() }, uOpacity: { value: 0 } },
      vertexShader: /* glsl */ `
        uniform float uPixelRatio;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = min(3.4 * uPixelRatio * (12.0 / -mv.z), 5.0 * uPixelRatio);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uOpacity;
        void main() {
          float a = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5));
          gl_FragColor = vec4(vec3(1.0), a * uOpacity);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    layerGroups.drift.add(new THREE.Points(flowGeo, flowMat))

    // ---------------------------------------------------------------- dust
    const DUST = 200
    const dustPos = new Float32Array(DUST * 3)
    for (let i = 0; i < DUST; i++) {
      dustPos.set([(Math.random() - 0.5) * 20, (Math.random() - 0.3) * 10, (Math.random() - 0.5) * 12 - 2], i * 3)
    }
    const dustGeo = new THREE.BufferGeometry()
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3))
    const dust = new THREE.Points(
      dustGeo,
      new THREE.PointsMaterial({ color: 0xffffff, size: 0.025, transparent: true, opacity: 0.35, depthWrite: false }),
    )
    scene.add(dust)

    // ---------------------------------------------------------------- post
    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), 0.55, 0.3, 0.8))
    composer.addPass(new OutputPass())
    const finish = new ShaderPass(FinishShader)
    composer.addPass(finish)

    let width = 1
    let height = 1
    let portrait = false
    const resize = () => {
      width = mount.clientWidth || 1
      height = mount.clientHeight || 1
      portrait = width / height < 1
      renderer.setSize(width, height, false)
      composer.setSize(width, height)
      camera.aspect = width / height
      camera.position.set(0, 1.2, portrait ? 23 : 19)
      camera.lookAt(0, -0.35, 0)
      // phones: lift the device into the space between the title and the text below
      if (portrait) camera.setViewOffset(width, height, 0, height * 0.17, width, height)
      else camera.clearViewOffset()
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

    // ---------------------------------------------------------------- loop
    let raf
    let running = false
    let clock = 0
    let last = performance.now()
    const STAGGER = 0.2 // seconds between layers dropping in
    const DROP = 0.9 // seconds each layer takes to land
    const BUILT = STAGGER * (LAYERS.length - 1) + DROP // fully assembled
    const v = new THREE.Vector3()
    const lit = {} // smoothed highlight per layer
    const smooth = (x) => {
      const k = clamp01(x)
      return k * k * (3 - 2 * k)
    }

    const frame = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      clock += dt
      const t = reduced ? 99 : clock
      mouse.x += (mouse.tx - mouse.x) * 0.04
      mouse.y += (mouse.ty - mouse.y) * 0.04

      const explode = explodeRef?.current ?? 0
      const spin = spinRef?.current ?? 0
      const built = clamp01((t - BUILT) / 0.6) // 0 → 1 once everything has landed
      const hi = highlightRef?.current

      // layers drop in one by one, bottom to top, and can be pulled apart by scroll
      LAYERS.forEach(([id], i) => {
        const g = layerGroups[id]
        const p = clamp01((t - i * STAGGER) / DROP)
        g.visible = p > 0
        const land = easeOutBack(p)
        g.position.y = g.userData.baseY + (1 - land) * 2.6 + explode * 0.8 * (i - (LAYERS.length - 1) / 2)
        // hover highlight: brighten the hovered layer, dim the rest
        const target = hi ? (hi === id ? 1 : -1) : 0
        lit[id] = (lit[id] ?? 0) + (target - (lit[id] ?? 0)) * 0.12
      })
      // per-material highlight (materials are shared within a layer)
      const glow = (m, id) => {
        m.emissive.setScalar(1)
        m.emissiveIntensity = Math.max(lit[id] ?? 0, 0) * 0.35
      }
      glow(mat.substrate, 'substrate')
      glow(mat.nPillar, 'drift')
      glow(mat.pPillar, 'drift')
      glow(mat.body, 'body')
      glow(mat.sourceN, 'body')
      edgeMat.opacity = 0.18 + Math.max(...Object.values(lit), 0) * 0.15

      // gate switches on in cycles once assembled; electrons flow with it
      const cycle = (t - BUILT) % 4
      const on = built * (cycle < 2.6 ? smooth(cycle / 0.4) : 1 - smooth((cycle - 2.6) / 0.6))
      mat.gate.emissiveIntensity = on * 0.55 + Math.max(lit.gate ?? 0, 0) * 0.4
      flowMat.uniforms.uOpacity.value = on * (1 - explode * 0.5)
      for (let i = 0; i < FLOW; i++) {
        const f = flowState[i]
        f.t = (f.t + f.v * dt * (0.4 + on)) % 1
        flowPos.set([f.x, 0.78 - f.t * 1.56, f.z], i * 3)
      }
      flowGeo.attributes.position.needsUpdate = true

      // light sweep across the top metal
      sweep.intensity = built * 14
      sweep.position.set(Math.sin(t * 0.45) * 3.2, 2.4, 1.6)

      gridMat.uniforms.uOpacity.value = easeOut(clamp01(t / 1.2))

      device.rotation.y = -0.62 + Math.sin(t * 0.16) * 0.18 + mouse.x * 0.16 + spin * 0.9
      device.rotation.x = 0.3 + mouse.y * 0.05 + spin * 0.12 // three-quarter view from above
      device.position.y = 0.15
      camera.position.x = portrait ? 0 : -mouse.x * 0.4

      // project callout anchors to screen pixels
      const { anchors: list, onProject: cb } = propsRef.current
      if (cb && list.length) {
        device.updateMatrixWorld()
        camera.updateMatrixWorld()
        cb(
          list.map((a) => {
            v.set(...a.pos).applyMatrix4(layerGroups[a.layer].matrixWorld).project(camera)
            return { id: a.id, x: ((v.x + 1) / 2) * width, y: ((1 - v.y) / 2) * height }
          }),
          built,
        )
      }

      dust.rotation.y = t * 0.01
      finish.uniforms.uTime.value = t
      composer.render(dt)
      if (running) raf = requestAnimationFrame(frame)
    }

    if (reduced) frame(performance.now())
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
      scene.traverse((o) => {
        o.geometry?.dispose()
        if (o.material && !Array.isArray(o.material)) o.material.dispose()
      })
      Object.values(mat).forEach((m) => m.dispose())
      scene.environment?.dispose()
      pmrem.dispose()
      composer.dispose()
      renderer.dispose()
      mount.removeChild(renderer.domElement)
    }
  }, [explodeRef, spinRef, highlightRef])

  return <div ref={mountRef} aria-hidden="true" className={className} />
}
