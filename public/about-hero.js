/* Original Disc Atlas constellation shader; no BigWings/Shadertoy source used.
 * See docs/about-hero.md for reference license research and rendering budget.
 */
const hero = document.querySelector('.about-hero');
const canvas = hero.querySelector('canvas');
const desktop = matchMedia('(min-width: 700px)');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const FRAME_MS = 1000 / 30;
const SCALE = 0.625;
let visible = false;
let failed = false;
let loading = false;
let scene, camera, renderer, material;
let raf = 0;
let last = 0;
let due = 0;
let elapsed = 0;
const pointer = { x: 0, y: 0 };
const eligible = () => desktop.matches && !motion.matches && document.documentElement.dataset.theme !== 'light';
const active = () => eligible() && visible && !document.hidden && !failed;

// A jittered triangular field at three scales, with independent slow translations.
// No flythrough/recycling, time-varying brightness, textures, or postprocessing.
const fragmentShader = `
  precision highp float;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  uniform float uTime;
  uniform vec3 uClay;
  uniform vec3 uAmber;
  varying vec2 vUv;

  vec2 pointAt(vec2 cell, float seed) {
    vec2 n = vec2(dot(cell, vec2(83.17, 217.43)), dot(cell, vec2(149.71, 53.89)));
    return cell + 0.18 + 0.64 * fract(sin(n + seed) * 19273.317);
  }
  float thread(vec2 p, vec2 a, vec2 b, float width) {
    vec2 ab = b - a;
    float d = length(p - a - ab * clamp(dot(p-a, ab) / dot(ab,ab), 0.0, 1.0));
    return exp(-d*d / (width*width)) * 0.12 + exp(-d * 35.0) * 0.015;
  }
  float star(vec2 p, vec2 a, float width) {
    float d = length(p - a);
    return exp(-d*d / (width*width*3.0)) * 0.65 + exp(-d * 24.0) * 0.12;
  }
  void main() {
    vec2 uv = (vUv - 0.5) * vec2(uResolution.x/uResolution.y, 1.0);
    vec3 color = vec3(0.031, 0.035, 0.043);
    float entrance = exp(-uTime * 0.42);
    for (int i = 0; i < 3; i++) {
      float layer = float(i);
      float scale = 3.8 + layer * 2.8;
      vec2 p = uv * scale * (1.0 + entrance * 0.025);
      p += vec2(uTime * (0.009 + layer * 0.003), uTime * -0.005);
      p += uMouse * (0.045 + layer * 0.015) + vec2(4.7, 8.3) * layer;
      vec2 cell = floor(p);
      float light = 0.0;
      float width = scale / uResolution.y * 0.7;
      // Neighbour cells include the glow crossing each cell boundary.
      for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
          vec2 c = cell + vec2(float(x), float(y));
          vec2 a = pointAt(c, layer * 13.0);
          vec2 b = pointAt(c + vec2(1.0, 0.0), layer * 13.0);
          vec2 d = pointAt(c + vec2(0.0, 1.0), layer * 13.0);
          light += thread(p, a, b, width) + thread(p, a, d, width);
          light += thread(p, b, d, width) * 0.5;
          light += star(p, a, width);
        }
      }
      vec3 tint = mix(uClay, uAmber, 0.35 + layer * 0.26);
      color += tint * light * (0.8 - layer * 0.22);
    }
    color += uClay * exp(-length(uv - vec2(0.9, 0.1)) * 2.8) * 0.065;
    color += uAmber * exp(-length(uv + vec2(1.0, 0.25)) * 3.0) * 0.04;
    gl_FragColor = vec4(color, 1.0);
  }
`;

function stop() {
  cancelAnimationFrame(raf);
  raf = 0;
  last = 0;
  due = 0;
}

function fallback() {
  failed = true;
  stop();
  hero.dataset.shader = 'fallback';
  renderer?.dispose();
  material?.dispose();
  scene?.children[0]?.geometry.dispose();
}

function resize() {
  if (!renderer) return;
  const { width, height } = hero.getBoundingClientRect();
  renderer.setSize(Math.round(width * SCALE), Math.round(height * SCALE), false);
  material.uniforms.uResolution.value.set(canvas.width, canvas.height);
}

function frame(now) {
  if (!active()) { stop(); return; }
  raf = requestAnimationFrame(frame);
  if (now + 0.5 < due) return;
  const delta = last ? Math.min((now - last) / 1000, 0.1) : 0;
  last = now;
  due = Math.max(due + FRAME_MS, now + FRAME_MS - 1);
  elapsed += delta;
  material.uniforms.uTime.value = elapsed;
  const mouse = material.uniforms.uMouse.value;
  const ease = 1 - Math.exp(-delta * 2.5);
  mouse.x += (pointer.x - mouse.x) * ease;
  mouse.y += (pointer.y - mouse.y) * ease;
  renderer.render(scene, camera);
  if (!failed && hero.dataset.shader !== 'ready') hero.dataset.shader = 'ready';
}

async function sync() {
  if (!active()) {
    stop();
    if (!eligible()) hero.dataset.shader = 'static';
    return;
  }
  if (renderer) {
    if (!raf) raf = requestAnimationFrame(frame);
    return;
  }
  if (loading) return;
  loading = true;
  try {
    // Probe before downloading the CDN module, so unsupported devices pay no cost.
    const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, powerPreference: 'low-power' });
    if (!gl) { fallback(); return; }
    const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js');
    renderer = new THREE.WebGLRenderer({ canvas, context: gl, antialias: false, alpha: false });
    renderer.setPixelRatio(1);
    renderer.debug.onShaderError = fallback;
    const styles = getComputedStyle(hero);
    material = new THREE.ShaderMaterial({
      depthTest: false, depthWrite: false,
      uniforms: {
        uTime: { value: 0 }, uMouse: { value: new THREE.Vector2() },
        uResolution: { value: new THREE.Vector2() },
        uClay: { value: new THREE.Color().setStyle(styles.getPropertyValue('--distance').trim(), THREE.LinearSRGBColorSpace) },
        uAmber: { value: new THREE.Color().setStyle(styles.getPropertyValue('--hero-amber').trim(), THREE.LinearSRGBColorSpace) },
      },
      vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.0,1.0); }',
      fragmentShader,
    });
    scene = new THREE.Scene();
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));
    camera = new THREE.Camera();
    resize();
    if (active()) raf = requestAnimationFrame(frame);
  } catch { fallback(); }
  finally { loading = false; }
}

new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }).observe(hero);
new ResizeObserver(resize).observe(hero);
desktop.addEventListener('change', sync);
motion.addEventListener('change', sync);
document.addEventListener('visibilitychange', sync);
window.addEventListener('atlas-theme-change', sync);
window.addEventListener('pagehide', stop);
window.addEventListener('pageshow', sync);
canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); fallback(); });
hero.addEventListener('pointermove', event => {
  if (!active() || event.pointerType === 'touch') return;
  const bounds = hero.getBoundingClientRect();
  pointer.x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
  pointer.y = -((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
}, { passive: true });
hero.addEventListener('pointerleave', () => { pointer.x = 0; pointer.y = 0; });
