import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { onFrame, prefersReducedMotion } from '../../../hooks'

/*
 * A wheel of cut-out photographs, after Voku's "Artifacts" page. One WebGL canvas
 * draws every photo as a plane; `focusRef.current` (a float, item index) says which one sits in
 * the middle of the screen. Each frame, every photo is placed by its distance from that focus:
 *  - the focused photo is sharp, in full colour, on top of the others
 *  - the further away, the greyer it gets and the more it is smeared and screened with print lines
 * Photos are cut out of their backgrounds in the browser (flood fill from the edges), so plain
 * product shots on white or grey work without editing.
 */

const vert = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`

const frag = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uBlur;     // 0 sharp .. 1 fully out of focus
  uniform float uOpacity;
  uniform float uPad;      // extra room above / below the photo for the smear
  uniform float uTime;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

  vec4 tap(vec2 uv, float bias) {
    vec4 c = texture2D(uMap, uv, bias);
    float inside = step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);
    return vec4(c.rgb * c.a, c.a) * inside; // premultiplied
  }

  void main() {
    vec2 uv = vec2(vUv.x, (vUv.y - 0.5) * (1.0 + 2.0 * uPad) + 0.5);
    vec4 acc;
    if (uBlur < 0.01) {
      acc = tap(uv, 0.0); // in focus: one clean sample, full detail
    } else {
      float spread = uBlur * 0.22;
      acc = vec4(0.0);
      for (int i = 0; i < 12; i++) {
        float t = float(i) / 11.0 - 0.5;
        acc += tap(uv + vec2(t * spread * 0.12, t * spread), uBlur * 3.0);
      }
      acc /= 12.0;
    }
    vec3 col = acc.a > 0.0 ? acc.rgb / acc.a : vec3(0.0);
    float a = acc.a;

    // print look: full colour in focus, fading to greyscale with screen lines and grain as it leaves
    float lum = dot(col, vec3(0.299, 0.587, 0.114));
    vec3 tone = mix(vec3(lum), col, 1.0 - smoothstep(0.0, 0.55, uBlur));
    float lines = 0.5 + 0.5 * sin(gl_FragCoord.y * 1.9);
    tone *= mix(1.0, 0.45 + 0.55 * lines, uBlur * 0.85);
    a *= mix(1.0, 0.55 + 0.45 * lines, uBlur * 0.6);
    float n = hash(floor(gl_FragCoord.xy) + fract(uTime) * 61.0) - 0.5;
    tone += n * mix(0.015, 0.16, uBlur);

    vec3 ink = max(clamp(tone, 0.0, 1.0) * 0.96, vec3(0.06, 0.06, 0.067));
    a *= uOpacity * mix(1.0, 0.75, uBlur);
    gl_FragColor = vec4(ink * a, a);
  }
`

// Cut a photo out of a plain background: grow a region from the border over pixels close to
// their neighbour and to the border colour, make it transparent, feather the edge and crop.
function cutOut(img, mode) {
  const max = 1600
  const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight))
  const w = Math.round(img.naturalWidth * k)
  const h = Math.round(img.naturalHeight * k)
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d', { willReadFrequently: true })

  if (mode === 'print') {
    // keep the whole photo, as a print with softly rounded corners
    g.beginPath()
    g.roundRect(0, 0, w, h, Math.min(w, h) * 0.04)
    g.clip()
    g.drawImage(img, 0, 0, w, h)
    return c
  }

  g.drawImage(img, 0, 0, w, h)
  const data = g.getImageData(0, 0, w, h)
  const px = data.data
  const bg = new Uint8Array(w * h)
  const stack = []
  // average border colour
  let br = 0, bgc = 0, bb = 0, bn = 0
  const seed = (x, y) => {
    const i = y * w + x
    br += px[i * 4]; bgc += px[i * 4 + 1]; bb += px[i * 4 + 2]; bn++
    stack.push(i)
  }
  for (let x = 0; x < w; x++) { seed(x, 0); seed(x, h - 1) }
  for (let y = 0; y < h; y++) { seed(0, y); seed(w - 1, y) }
  br /= bn; bgc /= bn; bb /= bn
  const near = (i, j, tol) =>
    Math.abs(px[i * 4] - px[j * 4]) + Math.abs(px[i * 4 + 1] - px[j * 4 + 1]) + Math.abs(px[i * 4 + 2] - px[j * 4 + 2]) < tol
  const nearBorder = (i) => Math.abs(px[i * 4] - br) + Math.abs(px[i * 4 + 1] - bgc) + Math.abs(px[i * 4 + 2] - bb) < 120
  stack.forEach((i) => (bg[i] = 1))
  while (stack.length) {
    const i = stack.pop()
    const x = i % w
    const y = (i / w) | 0
    const nb = [x > 0 && i - 1, x < w - 1 && i + 1, y > 0 && i - w, y < h - 1 && i + w]
    for (const j of nb) {
      if (j === false || bg[j]) continue
      if (near(i, j, 30) && nearBorder(j)) {
        bg[j] = 1
        stack.push(j)
      }
    }
  }
  // feathered alpha: the mask averaged over a small window (two cheap 1D passes)
  const r = 2
  const rows = new Float32Array(w * h)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0, n = 0
      for (let xx = Math.max(0, x - r); xx <= Math.min(w - 1, x + r); xx++) (sum += bg[y * w + xx]), n++
      rows[y * w + x] = sum / n
    }
  }
  let x0 = w, y0 = h, x1 = 0, y1 = 0
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0, n = 0
      for (let yy = Math.max(0, y - r); yy <= Math.min(h - 1, y + r); yy++) (sum += rows[yy * w + x]), n++
      // parts that run off the picture (tweezers, sensor legs) fade out instead of ending in a hard line
      const edge = Math.min(x, y, w - 1 - x, h - 1 - y) / (Math.min(w, h) * 0.08)
      const alpha = (1 - sum / n) * Math.min(1, edge)
      px[(y * w + x) * 4 + 3] = alpha * 255
      if (alpha > 0.1) {
        if (x < x0) x0 = x
        if (x > x1) x1 = x
        if (y < y0) y0 = y
        if (y > y1) y1 = y
      }
    }
  }
  g.putImageData(data, 0, 0)
  if (x1 <= x0 || y1 <= y0) return c
  const out = document.createElement('canvas')
  out.width = x1 - x0 + 1
  out.height = y1 - y0 + 1
  out.getContext('2d').drawImage(c, x0, y0, out.width, out.height, 0, 0, out.width, out.height)
  return out
}

const PAD = 0.35

export default function ThemeStack({ items, focusRef, className = '' }) {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    const reduced = prefersReducedMotion()

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, premultipliedAlpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace // the shader writes display values
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)
    renderer.domElement.style.display = 'block'

    let disposed = false
    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10)
    const geo = new THREE.PlaneGeometry(1, 1)

    const planes = items.map((item, i) => {
      const mat = new THREE.ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        uniforms: {
          uMap: { value: null },
          uBlur: { value: 1 },
          uOpacity: { value: 0 },
          uPad: { value: PAD },
          uTime: { value: 0 },
        },
        transparent: true,
        premultipliedAlpha: true,
        depthTest: false,
        depthWrite: false,
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.visible = false
      scene.add(mesh)
      const p = { mesh, mat, aspect: 1, ready: false, shown: 0, phase: i * 1.7 }

      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.decoding = 'async'
      img.onload = () => {
        if (disposed) return
        const canvas = cutOut(img, item.mode)
        const tex = new THREE.CanvasTexture(canvas)
        tex.colorSpace = THREE.NoColorSpace
        tex.minFilter = THREE.LinearMipmapLinearFilter
        tex.anisotropy = 4
        mat.uniforms.uMap.value = tex
        p.aspect = canvas.width / canvas.height
        p.ready = true
        mesh.visible = true
      }
      img.src = item.src
      return p
    })

    let W = 1
    let H = 1
    const resize = () => {
      W = mount.clientWidth || 1
      H = mount.clientHeight || 1
      renderer.setSize(W, H)
      camera.left = -W / 2
      camera.right = W / 2
      camera.top = H / 2
      camera.bottom = -H / 2
      camera.updateProjectionMatrix()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(mount)

    // only draw while the section is on screen
    let visible = false
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(mount)

    const clock = new THREE.Clock()
    const draw = () => {
      if (!visible) return
      const t = clock.getElapsedTime()
      const focus = focusRef.current ?? 0
      const narrow = W < 768
      // photo box: the focused one fills about half the screen height
      const boxH = Math.min(H * (narrow ? 0.3 : 0.4), W * (narrow ? 0.6 : 0.42))
      const boxW = narrow ? W * 0.55 : W * 0.5
      const spacing = boxH * 0.92
      // the photos ride round a large wheel whose centre is off to the left: the one in focus sits
      // at its rightmost point, the next ones come up from the lower left (nearer, so bigger) and
      // the previous ones curve away to the upper left (further back, so smaller)
      const R = H * (narrow ? 1.1 : 0.95)
      const step = Math.asin(Math.min(0.95, spacing / R)) // angle between neighbouring photos
      const sway = narrow ? 0.45 : 1 // less sideways travel on phones
      const lift = narrow ? H * 0.22 : 0 // on phones the stack sits above the text

      // draw far photos first so the focused one ends up on top
      const order = planes
        .map((p, i) => ({ p, i, d: i - focus }))
        .sort((a, b) => Math.abs(b.d) - Math.abs(a.d))
      order.forEach(({ p, i, d }, k) => {
        if (!p.ready) return
        p.shown = Math.min(1, p.shown + (reduced ? 1 : 0.04)) // fade in once loaded
        const ad = Math.abs(d)
        const th = d * step // angle of this photo on the wheel
        const depth = 1 + 0.2 * Math.sin(Math.max(-1.2, Math.min(1.2, th))) // nearer below, further above
        let h = boxH * depth
        let w = h * p.aspect
        if (w > boxW * depth) {
          h *= (boxW * depth) / w
          w = boxW * depth
        }
        const float = reduced ? 0 : Math.sin(t * 0.6 + p.phase) * 6 * Math.min(ad, 1)
        const x = W * (narrow ? 0 : 0.06) - R * (1 - Math.cos(th)) * sway
        const y = -R * Math.sin(th) + float + lift
        // whole pixels while in focus so the photo stays crisp
        if (ad < 0.04) p.mesh.position.set(Math.round(x), Math.round(y), 0)
        else p.mesh.position.set(x, y, 0)
        p.mesh.rotation.z = reduced ? 0 : -th * 0.22 * sway // tilt along the wheel
        p.mesh.scale.set(w, h * (1 + 2 * PAD), 1)
        p.mesh.renderOrder = k
        const u = p.mat.uniforms
        // sharp while near the centre, then a quick ramp to full blur
        const b = Math.min(1, Math.max(0, (ad - 0.18) / 0.5))
        u.uBlur.value = b * b * (3 - 2 * b)
        u.uOpacity.value = p.shown * (1 - Math.min(1, Math.max(0, ad - 1.6) / 1.2))
        u.uTime.value = t
        p.mesh.visible = u.uOpacity.value > 0.001
      })
      renderer.render(scene, camera)
    }
    const off = onFrame(draw)

    return () => {
      disposed = true
      off()
      ro.disconnect()
      io.disconnect()
      planes.forEach((p) => {
        p.mat.uniforms.uMap.value?.dispose()
        p.mat.dispose()
      })
      geo.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [items, focusRef])

  return <div ref={mountRef} className={className} aria-hidden="true" />
}
