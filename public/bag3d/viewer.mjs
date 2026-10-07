import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { advanceTime, poseAt } from './motion.mjs';
import { attachDiscFeatures } from './disc-features.mjs';
import { bagLayout, GLB_ACCENT_POSE, MAIN, TOP, FRONT, DISC, BAG_BOX, STAGE, stageMode, assignSides, sideSpots, flankFrame } from './bag-layout.mjs';
export { parseDiscParams } from './disc-state.mjs';
export { bagLayout, depthOrder } from './bag-layout.mjs';

const VIEWS = {
  home: { position: [.60, .24, 1.14], target: [0, .025, 0] },
  front: { position: [0, .10, 1.29], target: [0, .025, 0] },
  rear: { position: [-.55, .22, -1.17], target: [0, .025, 0] },
  // Disc Atlas page framing: a slight three-quarter view that keeps the main opening, the
  // front go-to pocket and the top putter pocket readable in a 4:5 box, with headroom for a
  // putter slid up out of the top pocket.
  page: { position: [.20, .20, 1.33], target: [0, .075, 0] },
};
// Fabric recolors with the bag color; zipper tape, teeth and hardware stay fixed.
const FABRIC = ['Charcoal woven shell', 'Graphite pocket panels', 'Soft black piping', 'Back padding and webbing', 'Tonal seam thread'];
// The site's spring, cubic-bezier(.2,1.35,.35,1), solved for progress at time t.
const spring = t => { let lo = 0, hi = 1, u = t; const b = (p, a, c) => 3 * (1 - p) * (1 - p) * p * a + 3 * (1 - p) * p * p * c + p * p * p; for (let i = 0; i < 16; i++) { u = (lo + hi) / 2; if (b(u, .2, .35) < t) lo = u; else hi = u; } return b(u, 1.35, 1); };
const easeOut = t => 1 - (1 - t) ** 3;
const easeInOut = t => t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
const LIFT_MS = 360, MOVE_MS = 450, YAW_MS = 650, SLIDE_MS = 620, TOP_MS = 600, STOW_MS = 520, STOW_STAGGER = 70, STOW_WAVE = 240, GLOW_MS = 160, ZOOM_MS = 220;
// After the slide out of its pocket (most of SLIDE_MS), an out disc travels to its staged spot
// beside or around the bag. Discs already out glide to new spots when the staging changes, and
// the camera pulls back (or comes in) as far as the staged discs need.
const TRAVEL_MS = 480, TRAVEL_AT = .75, SLIDE_TOTAL = SLIDE_MS * TRAVEL_AT + TRAVEL_MS, RESTAGE_MS = 650, PULL_MS = 650;
// A path that would cross the bag arcs out in front of it, through this depth.
const ARC_Z = .42;
// Staged discs and their names stay this far (px) inside the canvas.
const FRAME_MARGIN = 8;
// The furthest the camera pulls back for a ring with names: a crowd needing more takes compact
// names, then none (names keep their pixel size, so beyond this the bag would shrink to a token).
const NAMED_PULL = 2.6;
// Turntable: px of horizontal travel before a press becomes a drag (less stays a tap), and the
// turn per px. A release coasts at the swipe's speed over its last SPIN_SAMPLE_MS (capped at
// SPIN_MAX rad/s, none if it held still for SPIN_HOLD_MS), slowing by SPIN_FRICTION per second
// until it falls under SPIN_STOP rad/s.
const DRAG_PX = 8, TURN_PER_PX = .012, SPIN_SAMPLE_MS = 90, SPIN_HOLD_MS = 70, SPIN_MAX = 12, SPIN_FRICTION = 3, SPIN_STOP = .15;
// A hovered disc lights up in its own color at this emissive intensity.
const GLOW = 1.1;
export const MAX_ZOOM = 3;
const Y_AXIS = new THREE.Vector3(0, 1, 0), X_AXIS = new THREE.Vector3(1, 0, 0), WHITE = new THREE.Color(1, 1, 1);
const clamp01 = value => Math.min(1, Math.max(0, value));
// Slide-out runs in two overlapping stages, like pulling a disc out by hand.
const stage = (progress, from, to) => easeInOut(clamp01((progress - from) / (to - from)));
// In top view a hovered disc rises this share of the way toward the camera, above every pocket.
const TOP_LIFT = .3;
// Let input and painting run between the heavy mount phases on slower phones.
const yieldToMain = () => new Promise(resolve => setTimeout(resolve, 0));
// Software WebGL (SwiftShader, llvmpipe, blocklisted GPUs) is CPU-bound: detect it so the
// viewer can drop multisampling, cap resolution and skip ambient motion there.
export function softwareRenderer() {
  try {
    const canvas = document.createElement('canvas'), gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return false;
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const name = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(name);
  } catch { return false; }
}

/** Mount into a sized container. dispose() releases GPU resources and listeners. */
export async function mountBag(container, {
  modelUrl = new URL('./charcoal-bag.glb', import.meta.url).href,
  background = 'neutral',
  animated = !matchMedia('(prefers-reduced-motion: reduce)').matches,
  discColors = [],
  putterSlots = [],
  goToDisc = null,
  onReady = () => {},
  // Disc Atlas extensions. Defaults keep the original standalone behavior.
  interaction = 'orbit',
  turn = true,
  view: initialView = 'home',
  contactShadow = null,
  layout = null,
  bagColor = null,
  accentColor = null,
  compartmentDuration = 2.15,
  maxPixels = Infinity,
  ambientFps = 0,
  quality = 'high',
  toneMapping = 'aces',
  puttersOut = true,
  dragSurface = null,
} = {}) {
  const low = quality === 'low' || (quality === 'auto' && softwareRenderer());
  if (low) animated = false;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(33, 1, .02, 10);
  const target = new THREE.Vector3();
  const renderer = new THREE.WebGLRenderer({ antialias: !low, alpha: true });
  container.dataset.quality = low ? 'low' : 'high';
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  // 'neutral' (Khronos PBR Neutral) keeps disc colors true to their chosen hex; ACES
  // desaturates bright, camera-facing discs toward pastel.
  renderer.toneMapping = toneMapping === 'neutral' ? THREE.NeutralToneMapping : THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = toneMapping === 'neutral' ? .75 : .90;
  renderer.domElement.setAttribute('aria-label', 'Interactive 3D charcoal disc-golf backpack. Drag to rotate; scroll to zoom.');
  renderer.domElement.setAttribute('role', 'img');
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none';
  container.append(renderer.domElement);
  const placeCamera = name => {
    const preset = VIEWS[name] ?? VIEWS.home;
    camera.position.set(...preset.position);
    target.set(...preset.target);
    camera.lookAt(target);
  };
  placeCamera(initialView);
  let controls = null;
  if (interaction === 'orbit') {
    const { OrbitControls } = await import('three/addons/controls/OrbitControls.js');
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(target);
    controls.enableDamping = true;
    controls.dampingFactor = .07;
    controls.enablePan = false;
    controls.minDistance = .72;
    controls.maxDistance = 2.3;
    controls.minPolarAngle = .30;
    controls.maxPolarAngle = Math.PI * .78;
    controls.update();
    controls.saveState();
  }
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, .02);
  scene.environment = environment.texture;
  scene.environmentIntensity = .55;
  room.dispose();
  pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xe6efff, 0x42413e, 1.0));
  const key = new THREE.DirectionalLight(0xfff5e9, 2.0);
  key.position.set(-.65, 1.0, 1.3);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xdbe8ff, 1.0);
  fill.position.set(.9, .25, -.7);
  scene.add(fill);
  const front = new THREE.DirectionalLight(0xffffff, .3);
  front.position.set(0, .1, 1.2);
  scene.add(front);

  // A faint contact shadow anchors the floating object without requiring shadow maps.
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = shadowCanvas.height = 128;
  const ctx = shadowCanvas.getContext('2d');
  const gradient = ctx.createRadialGradient(64, 64, 6, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(25,30,35,.24)');
  gradient.addColorStop(.45, 'rgba(25,30,35,.10)');
  gradient.addColorStop(1, 'rgba(25,30,35,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
  const shadowMaterial = new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false });
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(.65, .48), shadowMaterial);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -.307;
  scene.add(shadow);
  const float = new THREE.Group();
  scene.add(float);
  let time = 0, last = performance.now(), active = animated, dragging = false, resumeAt = 0, offset = 0, disposed = false;
  let yaw = 0, yawTween = null, needsRender = true, loopOn = false, visible = true, lastRender = 0, lastFrame = 0;
  // Top view: the camera moves on a sphere around the target, from the current angle to
  // straight down over the putter pocket. Orbit controls (standalone mode) pause during the move.
  // `overhead` is how far the camera has come (0 = page view, 1 = straight down).
  let topView = false, beforeTop = null, cameraTween = null, cameraWaiters = [], overhead = 0, topPose = null;
  // Zoom renders a window of the full frame (a camera view offset), so projections, hit targets
  // and labels all follow it. zoomCenter is the window's center in the frame (0–1).
  let zoomLevel = 1, zoomCenter = { x: .5, y: .5 }, zoomTween = null;
  let puttersOutState = Boolean(puttersOut), glowKey = null;
  // Staging: the out discs in the order they came out, each one's side (beside the bag), the
  // layout in use ('side', 'map' or null) and the camera's pull-back (1 = the page view).
  let outKeys = [], sides = new Map(), stagedMode = null, ring = null, names = 'full', pull = 1, pullGoal = 1, pullTween = null;
  const homeCamera = () => { const preset = VIEWS[initialView] ?? VIEWS.home; return { position: new THREE.Vector3(...preset.position), target: new THREE.Vector3(...preset.target) }; };
  const sphericalAt = (position, center) => new THREE.Spherical().setFromVector3(position.clone().sub(center));
  const placeOnSphere = (spherical, center) => { camera.position.setFromSpherical(spherical).add(center); target.copy(center); camera.lookAt(target); if (controls) controls.target.copy(target); };
  const finishCamera = () => { const waiters = cameraWaiters; cameraWaiters = []; for (const resolve of waiters) resolve(topView); container.dispatchEvent(new CustomEvent('bagviewlayout')); };
  const setBackground = value => {
    if (!['neutral', 'transparent'].includes(value)) throw new Error('Background must be neutral or transparent');
    container.dataset.background = value;
    container.style.background = value === 'neutral' ? '#eeefec' : 'transparent';
    shadow.visible = contactShadow ?? value === 'neutral';
    invalidate();
  };
  // Render only while something moves; ambient floating can run at a reduced frame rate.
  const invalidate = () => { needsRender = true; startLoop(); };
  const startLoop = () => {
    if (disposed || !visible || !frame) return;
    // Re-arm a loop whose frame callback never arrived (a dropped rAF would otherwise stall it).
    if (loopOn && performance.now() - lastFrame < 250) return;
    if (loopOn) renderer.setAnimationLoop(null);
    loopOn = true;
    last = lastFrame = performance.now();
    renderer.setAnimationLoop(frame);
  };
  const stopLoop = () => { if (loopOn) { loopOn = false; renderer.setAnimationLoop(null); } };
  let frame = null;
  setBackground(background);
  // Cap the drawing buffer so a large bag on a dense display stays affordable. Software
  // renderers draw motion at half resolution and settle on one full-resolution frame.
  let fullRatio = 1, motionRatio = false;
  const applyRatio = moving => {
    const ratio = moving && low ? Math.max(.35, fullRatio / 2) : fullRatio;
    if (renderer.getPixelRatio() === ratio) return;
    renderer.setPixelRatio(ratio);
    renderer.setSize(Math.max(container.clientWidth, 1), Math.max(container.clientHeight, 1), false);
    motionRatio = ratio !== fullRatio;
  };
  let sized = { width: 0, height: 0 };
  const resize = () => {
    const width = Math.max(container.clientWidth, 1), height = Math.max(container.clientHeight, 1);
    sized = { width, height };
    fullRatio = Math.max(.5, Math.min(devicePixelRatio, low ? 1 : 2, Math.sqrt(maxPixels / (width * height))));
    renderer.setPixelRatio(fullRatio);
    motionRatio = false;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    applyZoom();
    // The top view's fit depends on the aspect ratio.
    if (topView && !cameraTween && topPose) { const pose = topPose(); placeOnSphere(pose.spherical, pose.target); }
    invalidate();
    container.dispatchEvent(new CustomEvent('bagviewlayout'));
  };
  function applyZoom() {
    const width = Math.max(container.clientWidth, 1), height = Math.max(container.clientHeight, 1);
    if (zoomLevel <= 1.0001) camera.clearViewOffset();
    else camera.setViewOffset(width, height, (zoomCenter.x - .5 / zoomLevel) * width, (zoomCenter.y - .5 / zoomLevel) * height, width / zoomLevel, height / zoomLevel);
    camera.updateProjectionMatrix();
  }
  // The frame point under `anchor` (container pixels; default the center) stays put.
  const zoomGoal = (value, anchor) => {
    const level = Math.min(MAX_ZOOM, Math.max(1, value)), half = .5 / level;
    const ax = anchor ? anchor.x / Math.max(container.clientWidth, 1) : .5, ay = anchor ? anchor.y / Math.max(container.clientHeight, 1) : .5;
    const fx = zoomCenter.x + (ax - .5) / zoomLevel, fy = zoomCenter.y + (ay - .5) / zoomLevel;
    const clamp = value => Math.min(1 - half, Math.max(half, value));
    return { level, center: { x: clamp(fx - (ax - .5) / level), y: clamp(fy - (ay - .5) / level) } };
  };
  const setZoom = (value, { anchor = null, instant = !active } = {}) => {
    const goal = zoomGoal(value, anchor);
    if (instant) {
      zoomTween = null; zoomLevel = goal.level; zoomCenter = goal.center; applyZoom(); invalidate();
      container.dispatchEvent(new CustomEvent('bagviewlayout'));
    } else { zoomTween = { from: { level: zoomLevel, center: { ...zoomCenter } }, to: goal, start: performance.now() }; invalidate(); }
    container.dispatchEvent(new CustomEvent('bagzoom', { detail: { zoom: goal.level } }));
  };
  const observer = new ResizeObserver(resize);
  observer.observe(container);
  resize();
  // Offscreen or hidden containers stop drawing entirely; a geometric check confirms
  // before stopping. Motion keeps wall-clock time, so it resumes at the right pose.
  const onScreen = () => {
    const rect = container.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.right > 0 && rect.top < innerHeight && rect.left < innerWidth;
  };
  const intersection = new IntersectionObserver(entries => {
    visible = entries.at(-1).isIntersecting || onScreen();
    // A coast nobody can see ends where it is.
    if (visible) invalidate(); else { settleTurn(); stopLoop(); }
  });
  intersection.observe(container);
  if (controls) {
    controls.addEventListener('start', () => { dragging = true; });
    controls.addEventListener('end', () => { dragging = false; resumeAt = performance.now() + 1800; });
    controls.addEventListener('change', () => invalidate());
  }
  const visibilityChanged = () => { last = performance.now(); if (!document.hidden) invalidate(); else settleTurn(); };
  document.addEventListener('visibilitychange', visibilityChanged);
  const contextLost = event => {
    event.preventDefault();
    stopLoop();
    container.dispatchEvent(new CustomEvent('bagviewererror', { detail: 'The 3D display was interrupted. Reload to continue.' }));
  };
  renderer.domElement.addEventListener('webglcontextlost', contextLost);

  // Turntable: a horizontal drag spins the bag. Let go mid-swipe and it coasts to a stop
  // (momentum); let go after holding still and it stops right there. Either way it holds the
  // angle it is left at. A press that moves less than DRAG_PX, or mostly vertically, stays a
  // tap, so a disc under it still toggles. A press on a coasting bag catches it (and is no tap).
  // Vertical swipes stay with the page (touch-action: pan-y), and wheel never zooms. The press
  // can start anywhere on `dragSurface` (the page's box that also holds the discs' hit targets),
  // except on its buttons; a tap on the canvas itself (empty space) is a `bagclick`.
  const pointer = { press: null };
  const turntable = interaction === 'turntable';
  const surface = dragSurface ?? renderer.domElement, listening = new AbortController();
  // The coast: `velocity` in radians per second, decaying by SPIN_FRICTION per second.
  let spin = null;
  // The turn (a drag, or its coast) is over: targets and labels follow the bag again.
  const settleTurn = () => {
    spin = null;
    if (!turntable || !dragging) return;
    dragging = false;
    surface.style.cursor = '';
    if (turntable) renderer.domElement.style.cursor = 'pointer';
    container.dispatchEvent(new CustomEvent('bagdragend'));
    container.dispatchEvent(new CustomEvent('bagviewlayout'));
  };
  // The swipe's speed over its last SPIN_SAMPLE_MS (0 if it held still before letting go).
  const releaseVelocity = (samples, now) => {
    const end = samples.at(-1), from = samples.find(sample => now - sample.t <= SPIN_SAMPLE_MS) ?? end;
    if (!end || now - end.t > SPIN_HOLD_MS || end.t - from.t < 8) return 0;
    const velocity = (end.yaw - from.yaw) / ((end.t - from.t) / 1000);
    return Math.max(-SPIN_MAX, Math.min(SPIN_MAX, velocity));
  };
  if (turntable) {
    const el = renderer.domElement, signal = listening.signal;
    el.style.touchAction = 'pan-y';
    el.style.cursor = 'pointer';
    surface.addEventListener('pointerdown', event => {
      if (event.button !== 0 || event.target.closest?.('button,a,input,select,textarea')) return;
      // A second finger makes it a pinch (the page's): drop the turn.
      if (!event.isPrimary) { cancelPress(); return; }
      const caught = spin !== null;
      spin = null;
      pointer.press = { id: event.pointerId, x: event.clientX, y: event.clientY, yaw, drag: false, caught, empty: event.target === el, samples: [{ t: event.timeStamp, yaw }] };
    }, { signal });
    surface.addEventListener('pointermove', event => {
      const press = pointer.press;
      if (!press || event.pointerId !== press.id) return;
      const dx = event.clientX - press.x, dy = event.clientY - press.y;
      if (!press.drag) {
        if (Math.abs(dx) < DRAG_PX || Math.abs(dx) < Math.abs(dy)) return;
        press.drag = true;
        surface.setPointerCapture(event.pointerId);
        surface.style.cursor = el.style.cursor = 'grabbing';
        if (!dragging) { dragging = true; container.dispatchEvent(new CustomEvent('bagdragstart')); }
      }
      yawTween = null;
      yaw = press.yaw + dx * TURN_PER_PX;
      press.samples.push({ t: event.timeStamp, yaw });
      if (press.samples.length > 24) press.samples.shift();
      invalidate();
    }, { signal });
    const release = event => {
      const press = pointer.press;
      if (!press || event.pointerId !== press.id) return;
      pointer.press = null;
      if (press.drag) {
        // Reduced motion (and the software path) stops where the user let go.
        const velocity = event.type === 'pointerup' && active ? releaseVelocity(press.samples, event.timeStamp) : 0;
        if (Math.abs(velocity) > SPIN_STOP * 2) { spin = { velocity }; invalidate(); } else settleTurn();
      } else if (press.caught) settleTurn();
      else if (event.type === 'pointerup' && press.empty) container.dispatchEvent(new CustomEvent('bagclick'));
    };
    surface.addEventListener('pointerup', release, { signal });
    surface.addEventListener('pointercancel', release, { signal });
  }
  // A second finger turns the gesture into a pinch (handled by the page): drop the turn, coast included.
  const cancelPress = () => {
    pointer.press = null;
    settleTurn();
  };
  const turnHome = (instant = !active) => {
    settleTurn();
    const home = Math.round(yaw / (Math.PI * 2)) * Math.PI * 2;
    if (instant || Math.abs(yaw - home) < 1e-4) { yaw = 0; yawTween = null; invalidate(); return; }
    yawTween = { from: yaw - home, start: performance.now() };
    yaw -= home;
    invalidate();
  };

  let gltf;
  let discFeatures;
  let mixer, flapAction, flapDuration = 1, compartmentOpen = false, flapMotion = null, flapWaiters = [];
  const discGroup = new THREE.Group();
  const records = new Map();
  let discGeometry, discTemplate, ghostMaterial, fabric = [], accentMaterials = [], placeholders = [], accents = [], glbDiscs = [];
  let layoutMode = false, appliedBagColor = null, accent = new THREE.Color(accentColor ?? '#80bcb0'), liftedKey = null, clipped = { main: 0, putter: 0, goTo: 0 };
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    stopLoop();
    observer.disconnect();
    intersection.disconnect();
    listening.abort();
    document.removeEventListener('visibilitychange', visibilityChanged);
    renderer.domElement.removeEventListener('webglcontextlost', contextLost);
    controls?.dispose();
    if (mixer && gltf) { mixer.stopAllAction(); mixer.uncacheRoot(gltf.scene); }
    const geometries = new Set(), materials = new Set([...(discFeatures?.originalMaterials ?? []), ...(ghostMaterial ? [ghostMaterial] : [])]), textures = new Set();
    for (const record of records.values()) materials.add(record.mesh.material);
    scene.traverse(object => {
      if (object.geometry) geometries.add(object.geometry);
      if (object.material) for (const material of [object.material].flat()) materials.add(material);
    });
    for (const material of materials) {
      for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
      material.dispose();
    }
    for (const geometry of geometries) geometry.dispose();
    for (const texture of textures) texture.dispose();
    environment.dispose();
    renderer.dispose();
    renderer.domElement.remove();
    for (const resolve of flapWaiters) resolve(compartmentOpen);
    flapWaiters = [];
  };
  try {
    await yieldToMain();
    gltf = await new GLTFLoader().loadAsync(modelUrl);
    await yieldToMain();
    float.add(gltf.scene);
    discFeatures = attachDiscFeatures(THREE, gltf.scene, {
      onChange: state => container.dispatchEvent(new CustomEvent('discstatechange', { detail: state })),
    });
    discFeatures.api.setDiscColors(discColors);
    discFeatures.api.setPutterSlots(putterSlots);
    discFeatures.api.setGoToDisc(goToDisc);
    const flapClip = gltf.animations.find(clip => clip.name === 'OpenCloseCompartment');
    if (flapClip) {
      mixer = new THREE.AnimationMixer(gltf.scene);
      flapAction = mixer.clipAction(flapClip);
      flapAction.setLoop(THREE.LoopOnce, 1);
      flapAction.clampWhenFinished = true;
      flapAction.play();
      flapAction.paused = true;
      flapDuration = flapClip.duration;
    }
    const seen = new Set();
    gltf.scene.traverse(object => {
      if (object.isMesh && Number.isInteger(object.userData.discSlot)) glbDiscs.push(object);
      if (object.userData.role === 'go-to-placeholder') placeholders.push(object);
      if (object.userData.role === 'go-to-accent') accents.push(object);
      for (const material of object.isMesh ? [object.material].flat() : []) {
        if (seen.has(material)) continue;
        seen.add(material);
        if (FABRIC.includes(material.name)) fabric.push({ material, original: material.color.clone() });
        if (material.name === 'GoTo highlight') accentMaterials.push(material);
      }
    });
    glbDiscs.sort((a, b) => a.userData.discSlot - b.userData.discSlot);
    discGeometry = glbDiscs[0].geometry;
    discTemplate = discFeatures.originalMaterials.values().next().value;
    ghostMaterial = new THREE.MeshBasicMaterial({ color: '#a9b8c9', transparent: true, opacity: .07, depthWrite: false });
    float.add(discGroup);
  } catch (error) {
    dispose();
    throw error;
  }

  const shell = fabric.find(entry => entry.material.name === FABRIC[0]);
  // Fabric parts keep their tonal relationship to the shell (lighter panels, darker piping).
  const luminance = color => .2126 * color.r + .7152 * color.g + .0722 * color.b;
  const setBagColor = value => {
    if (value === null || value === undefined) {
      for (const entry of fabric) entry.material.color.copy(entry.original);
      appliedBagColor = null;
    } else {
      const base = new THREE.Color(value);
      for (const entry of fabric) {
        const ratio = luminance(entry.original) / luminance(shell.original);
        entry.material.color.copy(base).multiplyScalar(ratio);
      }
      appliedBagColor = '#' + base.getHexString();
    }
    invalidate();
  };
  const setAccentColor = value => {
    accent = new THREE.Color(value ?? '#80bcb0');
    for (const material of accentMaterials) { material.color.copy(accent); material.emissive.copy(accent).multiplyScalar(.18); }
    for (const record of records.values()) paintDisc(record);
    invalidate();
  };
  const paintDisc = record => {
    if (record.placement.empty) return;
    const material = record.mesh.material;
    // Every disc renders clean (no accent rim or glow, the go-to included), except the hovered
    // one, which lights up in its own color.
    material.emissive.copy(material.color).lerp(WHITE, .3);
    material.emissiveIntensity = (record.glow ?? 0) * GLOW;
  };

  // Layout mode replaces the GLB's twelve fixed discs with slots built from the same disc mesh.
  const restPose = placement => ({
    position: new THREE.Vector3(...placement.position),
    quaternion: new THREE.Quaternion().setFromEuler(new THREE.Euler(...placement.rotation)),
    scale: new THREE.Vector3(...placement.scale),
  });
  const setBagLayout = slots => {
    const previous = new Map([...records.values()].filter(record => !record.placement.empty).map(record => [record.key, record]));
    for (const record of records.values()) { discGroup.remove(record.mesh); if (record.mesh.material !== ghostMaterial) record.mesh.material.dispose(); }
    records.clear();
    const result = bagLayout(slots);
    clipped = result.clipped;
    if (!layoutMode) { layoutMode = true; for (const disc of glbDiscs) disc.visible = false; }
    const now = performance.now();
    for (const placement of result.placements) {
      // An empty go-to pocket shows the GLB's dashed outline instead of a ghost disc.
      if (placement.empty && placement.pocket === 'goTo') continue;
      const material = placement.empty ? ghostMaterial : discTemplate.clone();
      if (!placement.empty && placement.color) material.color.set(placement.color);
      const mesh = new THREE.Mesh(discGeometry, material);
      mesh.name = placement.empty ? `EmptySlot-${placement.key}` : `Disc-${placement.key}`;
      mesh.userData.discKey = placement.key;
      const rest = restPose(placement);
      mesh.position.copy(rest.position); mesh.quaternion.copy(rest.quaternion); mesh.scale.copy(rest.scale);
      if (placement.empty) mesh.renderOrder = 1;
      discGroup.add(mesh);
      // Putters have a stowed seat; `out` runs from 0 (stowed) to 1 (standing in their row).
      const out = placement.stow && !puttersOutState ? 0 : 1;
      const record = { key: placement.key, placement, mesh, rest, lift: 0, liftFrom: 0, liftTo: 0, liftStart: 0, slide: 0, slideFrom: 0, slideTo: 0, slideStart: 0, move: null,
        stow: placement.stow ? restPose(placement.stow) : null, out, outFrom: out, outTo: out, outStart: 0, outDuration: 0, glow: 0, glowFrom: 0, glowTo: 0, glowStart: 0 };
      // A disc that changed pockets glides from where it was.
      const before = previous.get(placement.key);
      // An out disc stays out (or keeps sliding) through a redraw.
      if (before) for (const field of ['slide', 'slideFrom', 'slideTo', 'slideStart', 'slideDuration', 'spot']) record[field] = before[field];
      if (before && active && !before.slideTo && !before.mesh.position.equals(rest.position)) {
        record.move = { position: before.mesh.position.clone(), quaternion: before.mesh.quaternion.clone(), scale: before.mesh.scale.clone(), start: now };
      }
      records.set(placement.key, record);
      paintDisc(record);
    }
    if (!records.has(liftedKey)) liftedKey = null;
    outKeys = outKeys.filter(key => records.has(key));
    if (glowKey !== null && records.has(glowKey)) { const record = records.get(glowKey); record.glow = record.glowFrom = record.glowTo = 1; paintDisc(record); } else glowKey = null;
    const assigned = result.placements.some(p => p.pocket === 'goTo' && !p.empty);
    // The GLB draws the accent rim and dashed outline around a top-pocket disc; carry them
    // to the go-to's front-pocket seat (the front-most go-to, or the empty slot).
    const seat = result.placements.find(p => p.pocket === 'goTo' && p.order === 0) ?? bagLayout({ goTo: [null] }).placements[0];
    const pose = p => new THREE.Matrix4().compose(new THREE.Vector3(...p.position), new THREE.Quaternion().setFromEuler(new THREE.Euler(...p.rotation)), new THREE.Vector3(...p.scale));
    const toSeat = pose(seat).multiply(pose(GLB_ACCENT_POSE).invert());
    for (const object of [...placeholders, ...accents]) { object.matrixAutoUpdate = false; object.matrix.copy(toSeat); }
    goToAssigned = assigned;
    showFrontPocket();
    // The GLB's go-to accent rim stays hidden: a go-to disc renders clean, without an outline.
    for (const object of accents) object.visible = false;
    invalidate();
    container.dispatchEvent(new CustomEvent('bagviewlayout'));
  };

  // A lifted disc comes out toward the viewer and turns its face to the camera.
  const faceCamera = (position, out) => {
    const toCamera = camera.position.clone().sub(position).normalize();
    return out.setFromUnitVectors(new THREE.Vector3(1, 0, 0), toCamera);
  };
  const liftDisc = (key = null, { instant = !active } = {}) => {
    if (key !== null && !records.has(key)) throw new RangeError(`Unknown disc ${key}`);
    liftedKey = key;
    const now = performance.now();
    for (const record of records.values()) {
      const to = record.key === key ? 1 : 0;
      if (record.liftTo === to && !instant) continue;
      record.liftFrom = record.lift; record.liftTo = to; record.liftStart = instant ? now - LIFT_MS : now;
      paintDisc(record);
    }
    invalidate();
  };
  // Putters stow in the top pocket while the bag is closed and come back out into their row,
  // one after another from the front, when it opens.
  const setPuttersOut = (value, { instant = !active } = {}) => {
    puttersOutState = Boolean(value);
    const now = performance.now(), to = puttersOutState ? 1 : 0;
    const putters = [...records.values()].filter(record => record.stow).sort((a, b) => a.placement.order - b.placement.order);
    let longest = 0;
    putters.forEach((record, index) => {
      if (record.outTo === to && !instant) return;
      // A full pocket keeps the whole wave inside STOW_WAVE, so opening stays under a second.
      const step = Math.min(STOW_STAGGER, STOW_WAVE / Math.max(1, putters.length - 1));
      const delay = instant ? 0 : (puttersOutState ? index : putters.length - 1 - index) * step;
      record.outFrom = record.out; record.outTo = to; record.outStart = now + delay;
      record.outDuration = instant ? 0 : Math.abs(to - record.out) * STOW_MS;
      if (instant) record.out = to;
      longest = Math.max(longest, delay + record.outDuration);
    });
    invalidate();
    // Hit targets move to the new seats right away.
    container.dispatchEvent(new CustomEvent('bagviewlayout'));
    return new Promise(resolve => setTimeout(() => resolve(puttersOutState), longest));
  };
  // Hover: one disc at a time lights up.
  const glowDisc = (key = null, { instant = !active } = {}) => {
    if (key !== null && !records.has(key)) throw new RangeError(`Unknown disc ${key}`);
    glowKey = key;
    const now = performance.now();
    for (const record of records.values()) {
      const to = record.key === key && !record.placement.empty ? 1 : 0;
      if (record.glowTo === to && !instant) continue;
      record.glowFrom = record.glow; record.glowTo = to; record.glowStart = now;
      if (instant) { record.glow = to; paintDisc(record); }
    }
    invalidate();
  };
  // A slid-out disc leaves its pocket along the pocket's own axis (see bag-layout's `slide`
  // poses): putters and the go-to straight up and a step forward, main discs forward out of
  // the compartment, then up and turned face-on. It then travels to its staged spot and stays
  // there until it is staged back in. Every disc is independent: `keys` lists all out discs, in
  // the order they came out. Up to five rest beside the bag, split relative to each other (the
  // less overstable half left, the more overstable half right); six or more spread evenly on a
  // ring around the bag, in stability order along the arc (`atlas`: key → {x, y}, AtlasLayout's
  // 0–1 stability and speed; speed only orders the columns beside the bag).
  // `labels` (key → {width, height}, px, the gap above included) is the name under each disc: the
  // layout keeps room for every name, clear of the bag, the other discs and the other names.
  // `compact` (the same, measured in a smaller style) is for a crowd on the ring: those names are
  // used when the full ones cannot fit within NAMED_PULL; when neither can, the ring leaves the
  // names out (`stage.names`: 'full', 'compact' or 'none').
  // `reserve` keeps a top-right corner of the canvas clear, `clear` more boxes ({left, top, right,
  // bottom}, canvas fractions). Resolves when every disc and the camera settle.
  const stageDiscs = (keys = [], { atlas = new Map(), labels = new Map(), compact = null, reserve, clear = [], instant = !active } = {}) => {
    keys = [...new Set(keys)].filter(key => records.get(key)?.placement.slide && !records.get(key).placement.empty);
    outKeys = keys;
    // The page may have just resized the canvas for this mode (a ring widens it): catch up now
    // rather than on the next resize observation, so the ring is laid out for the canvas it gets.
    if (container.clientWidth !== sized.width || container.clientHeight !== sized.height) resize();
    const mode = stageMode(keys.length);
    const home = homeCamera(), halfHeight = home.position.distanceTo(home.target) * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    // Names in the bag's meters at the page view, measured at the target's depth with a tenth to
    // spare: the camera looks on from one side and above, so the canvas's far parts hold more
    // meters per pixel. pullToFit, which projects for real, settles any remainder.
    const unit = 1.1 * 2 * halfHeight / Math.max(container.clientHeight, 1);
    const entriesFor = sizes => keys.map(key => { const label = sizes.get(key); return { key, atlas: atlas.get(key) ?? null, label: label && { width: label.width * unit, height: label.height * unit } }; });
    const entries = entriesFor(labels);
    let spots = new Map(), goal = 1;
    names = 'full';
    if (mode === 'side') {
      // Names grow with the pull-back: lay the columns out for the pull-back they end up taking.
      sides = assignSides(entries);
      for (let guess = 1, i = 0; i < 4; i++) {
        spots = sideSpots(entries, sides, { pull: guess });
        goal = pullToFit(spots, labels, reserve, clear);
        if (goal <= guess + 1e-3) break;
        guess = goal;
      }
    }
    if (mode === 'map') {
      // The discs flank the bag in columns that fill the free canvas, and the camera stays at the page
      // view, so the bag keeps its size. The frame works in estimated meters; pullToFit projects for
      // real, and where the two disagree the columns draw in a little rather than the camera pulling back.
      // The discs stand a little in front of the target, so the view there is a little smaller.
      const distance = home.position.distanceTo(home.target), discHalfHeight = halfHeight * (distance - STAGE.map.z * (home.position.z - home.target.z) / distance) / distance;
      const plan = (sizes, maxPull) => {
        const base = { aspect: camera.aspect, halfHeight: discHalfHeight, centerY: home.target.y, reserve, clear, edge: (FRAME_MARGIN + 2) * unit, entries: entriesFor(sizes), maxPull };
        let frame = flankFrame(base), fit = pullToFit(frame.spots, sizes, reserve, clear);
        for (let i = 0; i < 24 && frame.fits && fit > frame.pull + 1e-6 && frame.fill > .32; i++) {
          frame = flankFrame({ ...base, fill: frame.fill - .02 });
          fit = pullToFit(frame.spots, sizes, reserve, clear);
        }
        return { spots: frame.spots, ring: { columns: frame.columns }, goal: fit, fits: frame.fits && fit <= maxPull + 1e-3 };
      };
      // Full names at the page view, then compact ones; only then pull back (keeping names), and
      // last of all leave the names out.
      const tries = [[labels, 'full', 1], [compact, 'compact', 1], [labels, 'full', NAMED_PULL], [compact, 'compact', NAMED_PULL], [new Map(), 'none', STAGE.map.maxPull]];
      let best = null;
      for (const [sizes, kind, maxPull] of tries) {
        if (!sizes) continue;
        best = plan(sizes, maxPull); names = kind;
        if (best.fits) break;
      }
      ({ spots, ring, goal } = best);
    }
    if (mode !== 'side') sides = new Map();
    if (mode !== 'map') ring = null;
    stagedMode = mode;
    const eye = pulledHome(goal).position;
    const now = performance.now();
    let longest = 0;
    for (const record of records.values()) {
      const spot = spots.get(record.key), to = spot ? 1 : 0;
      if (spot) {
        // Each staged disc turns its face to the camera.
        const position = new THREE.Vector3(...spot.position);
        const pose = { position, quaternion: new THREE.Quaternion().setFromUnitVectors(X_AXIS, eye.clone().sub(position).normalize()), scale: new THREE.Vector3(spot.scale, spot.scale, spot.scale) };
        // A disc already out glides from where it is; one still on its way heads straight for the new spot.
        const moved = !record.spot || record.spot.to.position.distanceToSquared(position) > 1e-10 || record.spot.to.scale.x !== spot.scale;
        const glide = !instant && record.slideTo === 1 && record.spot && moved;
        if (moved || instant || record.slideTo !== 1) record.spot = { from: glide ? spotAt(record, now) : null, to: pose, start: now, duration: glide ? RESTAGE_MS : 0 };
        if (glide) longest = Math.max(longest, RESTAGE_MS);
      }
      if (record.slideTo === to && !instant) continue;
      // Progress is linear in time; reversing mid-way covers only the remaining distance.
      const duration = instant ? 0 : Math.abs(to - record.slide) * SLIDE_TOTAL;
      record.slideFrom = record.slide; record.slideTo = to; record.slideStart = now; record.slideDuration = duration;
      if (instant) record.slide = to;
      longest = Math.max(longest, duration);
    }
    longest = Math.max(longest, setPull(goal, instant));
    invalidate();
    container.dispatchEvent(new CustomEvent('bagviewlayout'));
    return new Promise(resolve => setTimeout(resolve, longest));
  };
  // The page camera, pulled straight back from its target by `factor`.
  const pulledHome = factor => { const home = homeCamera(); return { position: home.position.clone().sub(home.target).multiplyScalar(factor).add(home.target), target: home.target }; };
  const placePulled = () => { const home = pulledHome(pull); camera.position.copy(home.position); target.copy(home.target); camera.lookAt(target); };
  // Moves the camera's pull-back toward `goal`; returns how long that takes. In the top view the
  // camera returns to the new pull-back when it comes down, so nothing moves now.
  const setPull = (goal, instant) => {
    pullGoal = goal;
    if (controls || (Math.abs(goal - pull) < 1e-4 && !pullTween)) { pullTween = null; return 0; }
    if (instant || topView || cameraTween) { pullTween = null; pull = goal; if (!topView && !cameraTween) placePulled(); return 0; }
    const motion = pullTween = { from: pull, to: goal, start: performance.now() };
    // Settle on time even if no frame finishes it (offscreen, hidden tab).
    setTimeout(() => { if (pullTween === motion && !disposed) { pullTween = null; pull = goal; if (!topView && !cameraTween) placePulled(); invalidate(); container.dispatchEvent(new CustomEvent('bagviewlayout')); } }, PULL_MS + 250);
    return PULL_MS;
  };
  // The least pull-back (at least 1) that keeps every staged disc, and its name under it (`labels`,
  // px), inside the canvas and out of the reserved top-right corner and the `clear` boxes. The bag
  // itself always fits the page view.
  const fitCamera = new THREE.PerspectiveCamera();
  const pullToFit = (spots, labels, reserve, clear = []) => {
    if (!spots.size) return 1;
    const width = Math.max(container.clientWidth, 1), height = Math.max(container.clientHeight, 1);
    fitCamera.copy(camera); fitCamera.clearViewOffset(); fitCamera.aspect = width / height; fitCamera.updateProjectionMatrix();
    const keep = [...(reserve ? [{ left: 1 - reserve.width, top: 0, right: 1, bottom: reserve.height }] : []), ...clear]
      .map(box => ({ left: box.left * width, top: box.top * height, right: box.right * width, bottom: box.bottom * height }));
    const discs = [...spots].map(([key, { position: [x, y, z], scale }]) => {
      const r = DISC.radius * scale;
      return { label: labels.get(key), points: [[-r, 0], [r, 0], [0, r], [0, -r]].map(([dx, dy]) => new THREE.Vector3(x + dx, y + dy, z)) };
    });
    const fits = factor => {
      const home = pulledHome(factor);
      fitCamera.position.copy(home.position); fitCamera.lookAt(home.target); fitCamera.updateMatrixWorld();
      return discs.every(({ label, points }) => {
        const [left, right, top, bottom] = points.map(point => { const ndc = point.clone().project(fitCamera); return [(ndc.x + 1) / 2 * width, (1 - ndc.y) / 2 * height]; });
        const boxes = [{ left: left[0], right: right[0], top: top[1], bottom: bottom[1] }];
        if (label) { const center = (left[0] + right[0]) / 2; boxes.push({ left: center - label.width / 2, right: center + label.width / 2, top: bottom[1], bottom: bottom[1] + label.height }); }
        return boxes.every(box => box.left >= FRAME_MARGIN && box.right <= width - FRAME_MARGIN && box.top >= FRAME_MARGIN && box.bottom <= height - FRAME_MARGIN
          && !keep.some(k => box.left < k.right && k.left < box.right && box.top < k.bottom && k.top < box.bottom));
      });
    };
    if (fits(1)) return 1;
    let low = 1, high = 4;
    for (let i = 0; i < 24; i++) { const mid = (low + high) / 2; if (fits(mid)) high = mid; else low = mid; }
    return high;
  };
  // Where a staged disc rests now (gliding between spots after a restage), in the room's frame.
  const spotAt = (record, now) => {
    const { from, to, start, duration } = record.spot;
    if (!from || now - start >= duration) return to;
    const e = easeInOut(clamp01((now - start) / duration)), a = toBagFrame(from), b = toBagFrame(to);
    return { position: arc(from.position, to.position, e, bulge(a.position, b.position, DISC.radius * to.scale.y), new THREE.Vector3()), quaternion: from.quaternion.clone().slerp(to.quaternion, e), scale: from.scale.clone().lerp(to.scale, e) };
  };
  // Staged spots hold still in the room while the bag's frame turns with the user's drag: undo the turn.
  const toBagFrame = pose => {
    const turnBack = new THREE.Quaternion().setFromAxisAngle(Y_AXIS, -yaw);
    return { position: pose.position.clone().applyAxisAngle(Y_AXIS, -yaw), quaternion: turnBack.multiply(pose.quaternion), scale: pose.scale };
  };
  // A straight path that would pass through the bag bows forward in front of it instead.
  const bulge = (a, b, radius) => {
    for (let i = 0; i <= 16; i++) {
      const t = i / 16, x = a.x + (b.x - a.x) * t, y = a.y + (b.y - a.y) * t;
      if (x > BAG_BOX.xMin - radius && x < BAG_BOX.xMax + radius && y > BAG_BOX.yMin && y < BAG_BOX.yMax + radius) return Math.max(0, ARC_Z - (a.z + b.z) / 2);
    }
    return 0;
  };
  const arc = (a, b, e, depth, out) => { out.copy(a).lerp(b, e); out.z += depth * Math.sin(Math.PI * e); return out; };
  const isOut = key => records.get(key)?.slideTo === 1;
  // The slid-out pose; from above, the disc also turns its face up to the camera.
  const slidePose = (record, progress, base) => {
    const { placement } = record, out = placement.slide, main = placement.pocket === 'main';
    const along = main ? stage(progress, 0, .6) : stage(progress, 0, .7), after = main ? stage(progress, .35, 1) : stage(progress, .55, 1), turn = main ? stage(progress, .3, 1) : 0;
    const position = base.position.clone();
    if (main) {
      position.z += (out.position[2] - position.z) * along;
      position.x += (out.position[0] - position.x) * after;
      position.y += (out.position[1] - position.y) * after;
    } else {
      position.y += (out.position[1] - position.y) * along;
      position.x += (out.position[0] - position.x) * after;
      position.z += (out.position[2] - position.z) * after;
    }
    const quaternion = base.quaternion.clone().slerp(new THREE.Quaternion().setFromEuler(new THREE.Euler(...out.rotation)), turn);
    if (overhead > 0) quaternion.slerp(faceCamera(position, scratch.face), overhead * Math.max(along, after));
    const scale = base.scale.clone().lerp(new THREE.Vector3(...out.scale), Math.max(along, turn));
    return { position, quaternion, scale };
  };
  const scratch = { position: new THREE.Vector3(), seat: new THREE.Vector3(), quaternion: new THREE.Quaternion(), scale: new THREE.Vector3(), face: new THREE.Quaternion(), one: new THREE.Vector3(1, 1, 1) };
  const poseRecord = (record, now) => {
    let busy = false;
    const { rest, placement, mesh } = record;
    if (record.lift !== record.liftTo || now - record.liftStart < LIFT_MS) {
      const t = Math.min(1, (now - record.liftStart) / LIFT_MS);
      record.lift = t >= 1 ? record.liftTo : record.liftFrom + (record.liftTo - record.liftFrom) * spring(t);
      busy = t < 1;
    }
    if (record.slide !== record.slideTo) {
      const t = record.slideDuration ? Math.min(1, (now - record.slideStart) / record.slideDuration) : 1;
      record.slide = t >= 1 ? record.slideTo : record.slideFrom + (record.slideTo - record.slideFrom) * t;
      busy = busy || t < 1;
    }
    if (record.spot?.from && now - record.spot.start < record.spot.duration) busy = true;
    if (record.out !== record.outTo) {
      const t = record.outDuration ? Math.min(1, Math.max(0, (now - record.outStart) / record.outDuration)) : 1;
      record.out = t >= 1 ? record.outTo : record.outFrom + (record.outTo - record.outFrom) * t;
      busy = busy || t < 1;
    }
    if (record.glow !== record.glowTo) {
      const t = Math.min(1, (now - record.glowStart) / GLOW_MS);
      record.glow = t >= 1 ? record.glowTo : record.glowFrom + (record.glowTo - record.glowFrom) * easeOut(t);
      paintDisc(record);
      busy = busy || t < 1;
    }
    let position = rest.position, quaternion = rest.quaternion, scale = rest.scale;
    if (record.move) {
      const t = Math.min(1, (now - record.move.start) / MOVE_MS), e = easeOut(t);
      position = scratch.position.copy(record.move.position).lerp(rest.position, e);
      quaternion = scratch.quaternion.copy(record.move.quaternion).slerp(rest.quaternion, e);
      scale = scratch.scale.copy(record.move.scale).lerp(rest.scale, e);
      if (t >= 1) record.move = null; else busy = true;
    }
    // Rising out of the pocket springs into the row; stowing settles down evenly.
    if (record.stow && record.out !== 1) {
      const e = record.outTo === 1 && record.outFrom === 0 ? spring(record.out) : easeInOut(record.out);
      position = scratch.seat.copy(record.stow.position).lerp(position, e);
    }
    mesh.position.copy(position); mesh.quaternion.copy(quaternion); mesh.scale.copy(scale);
    if (record.lift !== 0) {
      const lifted = new THREE.Vector3(...placement.lift);
      // From above, a lifted disc rises straight toward the viewer instead of out the front.
      if (overhead > 0) lifted.lerp(rest.position.clone().lerp(camera.position, TOP_LIFT), overhead);
      mesh.position.lerp(lifted, record.lift);
      mesh.quaternion.slerp(faceCamera(lifted, scratch.face), Math.min(1, Math.max(0, record.lift)));
      mesh.scale.lerp(scratch.one, Math.min(1, Math.max(0, record.lift)));
    }
    if (record.slide !== 0 && placement.slide) {
      // Out of the pocket first (the slide keeps its own pace), then on to the staged spot.
      const elapsed = record.slide * SLIDE_TOTAL;
      const pose = slidePose(record, Math.min(1, elapsed / SLIDE_MS), { position: mesh.position, quaternion: mesh.quaternion, scale: mesh.scale });
      const travel = record.spot ? easeInOut(clamp01((elapsed - SLIDE_MS * TRAVEL_AT) / TRAVEL_MS)) : 0;
      if (travel > 0) {
        const spot = toBagFrame(spotAt(record, now));
        arc(pose.position, spot.position, travel, bulge(scratch.seat.set(...placement.slide.position), spot.position, DISC.radius * spot.scale.y), pose.position);
        pose.quaternion.slerp(spot.quaternion, travel);
        pose.scale.lerp(spot.scale, travel);
      }
      mesh.position.copy(pose.position); mesh.quaternion.copy(pose.quaternion); mesh.scale.copy(pose.scale);
    }
    return busy;
  };

  // Top view looks straight down into the putter pocket (front of the bag at the bottom). The
  // fabric stays opaque, so only the top pocket's discs show; the frame fits the pocket's width.
  gltf.scene.updateMatrixWorld(true);
  const bagBox = new THREE.Box3().setFromObject(gltf.scene);
  topPose = () => {
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)), width = .27, depth = .2;
    // Framed at the height of the putters' rims, about .09 above the pocket's mouth.
    const fit = Math.max(depth / (2 * tan), width / (2 * tan * camera.aspect)) + .09;
    return { target: new THREE.Vector3(0, TOP.mouth, TOP.center + .01), spherical: new THREE.Spherical(Math.max(fit, bagBox.max.y - TOP.mouth + .1), 1e-3, 0) };
  };
  // From above, only the putter pocket shows: the go-to (or its empty outline) hides halfway up.
  let goToAssigned = false;
  function showFrontPocket() {
    const shown = overhead < .5;
    for (const record of records.values()) if (record.placement.pocket === 'goTo') record.mesh.visible = shown;
    for (const object of placeholders) object.visible = shown && !goToAssigned;
  }
  const setTopView = async (value, { instant = !active } = {}) => {
    const next = Boolean(value);
    const settle = new Promise(resolve => cameraWaiters.push(resolve));
    if (next === topView && !cameraTween) { finishCamera(); return settle; }
    // Leaving the top view returns to wherever the camera was (orbit mode keeps the user's angle).
    if (next && !beforeTop) beforeTop = { position: camera.position.clone(), target: target.clone() };
    topView = next;
    // The page camera comes back at the staged discs' pull-back.
    const back = controls ? beforeTop ?? homeCamera() : pulledHome(pullGoal);
    const goal = next ? topPose() : { target: back.target.clone(), spherical: sphericalAt(back.position, back.target) };
    const from = sphericalAt(camera.position, target);
    // Turn the short way round.
    while (goal.spherical.theta - from.theta > Math.PI) goal.spherical.theta -= Math.PI * 2;
    while (goal.spherical.theta - from.theta < -Math.PI) goal.spherical.theta += Math.PI * 2;
    if (controls) { controls.enabled = false; controls.minPolarAngle = 0; }
    const motion = cameraTween = { from, fromCenter: target.clone(), to: goal.spherical, toCenter: goal.target, overheadFrom: overhead, overheadTo: next ? 1 : 0, start: null, duration: instant ? 0 : TOP_MS };
    // Settle on time even if no frame finishes it (offscreen, hidden tab).
    setTimeout(() => { if (cameraTween === motion && !disposed) { stepCamera(motion, 1); invalidate(); } }, motion.duration + 250);
    invalidate();
    return settle;
  };
  const stepCamera = (motion, t) => {
    const e = easeInOut(t), lerp = (a, b) => a + (b - a) * e;
    const spherical = new THREE.Spherical(lerp(motion.from.radius, motion.to.radius), lerp(motion.from.phi, motion.to.phi), lerp(motion.from.theta, motion.to.theta));
    placeOnSphere(spherical, motion.fromCenter.clone().lerp(motion.toCenter, e));
    overhead = lerp(motion.overheadFrom, motion.overheadTo);
    showFrontPocket();
    if (t < 1) return true;
    cameraTween = null;
    if (!topView) { beforeTop = null; if (!controls) pull = pullGoal; }
    if (controls) { controls.minPolarAngle = topView ? 0 : .30; controls.enabled = true; controls.update(); }
    finishCamera();
    return false;
  };

  // Compartment progress follows wall-clock time, so slow frames never stretch the motion.
  const setFlap = progress => { flapAction.time = progress * flapDuration; flapAction.paused = true; mixer.update(0); };
  const setCompartmentOpen = (value, { instant = !active } = {}) => {
    if (!flapAction) throw new Error('This model has no compartment animation');
    const next = Boolean(value);
    const from = flapAction.time / flapDuration;
    compartmentOpen = next;
    const settle = new Promise(resolve => flapWaiters.push(resolve));
    if (instant || from === (next ? 1 : 0)) {
      flapMotion = null;
      setFlap(next ? 1 : 0);
      finishFlap();
    } else {
      // Reversing mid-motion keeps the current fold and only covers the remaining distance.
      const motion = flapMotion = { from, to: next ? 1 : 0, start: performance.now(), duration: Math.abs((next ? 1 : 0) - from) * compartmentDuration * 1000 };
      // If no frame finishes it on time (offscreen, hidden tab, slow software rendering), settle on time anyway.
      setTimeout(() => { if (flapMotion === motion && !disposed) { setFlap(motion.to); flapMotion = null; finishFlap(); invalidate(); } }, motion.duration + 40);
    }
    invalidate();
    return settle;
  };
  const finishFlap = () => {
    const waiters = flapWaiters;
    flapWaiters = [];
    for (const resolve of waiters) resolve(compartmentOpen);
    container.dispatchEvent(new CustomEvent('compartmentchange', { detail: { open: compartmentOpen } }));
  };

  // One time base for everything: tweens start from performance.now(), so frames read it too
  // (a rAF timestamp can differ from it, e.g. under a test's virtual clock).
  frame = () => {
    const now = performance.now();
    lastFrame = now;
    const delta = Math.min(Math.max(now - last, 0) / 1000, .1);
    last = now;
    if (document.hidden) return;
    let busy = false;
    if (flapMotion) {
      const t = Math.min(1, (now - flapMotion.start) / Math.max(flapMotion.duration, 1));
      setFlap(flapMotion.from + (flapMotion.to - flapMotion.from) * t);
      if (t >= 1) { flapMotion = null; finishFlap(); } else busy = true;
    }
    // The coast turns the bag first, so out discs (held still in the room) pose for this frame's turn.
    if (spin) {
      yaw += spin.velocity * delta;
      spin.velocity *= Math.exp(-SPIN_FRICTION * delta);
      if (Math.abs(spin.velocity) < SPIN_STOP) settleTurn(); else busy = true;
    }
    for (const record of records.values()) if (poseRecord(record, now)) busy = true;
    if (yawTween) {
      const t = Math.min(1, (now - yawTween.start) / YAW_MS);
      yaw = yawTween.from * (1 - easeOut(t));
      if (t >= 1) { yawTween = null; yaw = 0; } else busy = true;
    }
    // The move's clock starts on its first drawn frame.
    if (cameraTween) cameraTween.start ??= now;
    if (cameraTween && stepCamera(cameraTween, Math.min(1, (now - cameraTween.start) / Math.max(cameraTween.duration, 1)))) busy = true;
    if (pullTween && !topView && !cameraTween) {
      const t = Math.min(1, (now - pullTween.start) / PULL_MS);
      pull = pullTween.from + (pullTween.to - pullTween.from) * easeInOut(t);
      placePulled();
      if (t >= 1) pullTween = null; else busy = true;
      container.dispatchEvent(new CustomEvent('bagviewlayout'));
    }
    if (zoomTween) {
      const t = Math.min(1, (now - zoomTween.start) / ZOOM_MS), e = easeOut(t), { from, to } = zoomTween;
      zoomLevel = from.level + (to.level - from.level) * e;
      zoomCenter = { x: from.center.x + (to.center.x - from.center.x) * e, y: from.center.y + (to.center.y - from.center.y) * e };
      applyZoom();
      if (t >= 1) zoomTween = null; else busy = true;
      container.dispatchEvent(new CustomEvent('bagviewlayout'));
    }
    if (dragging) busy = true;
    if (controls?.update()) busy = true;
    const ambient = active && !dragging && now >= resumeAt;
    time = advanceTime(time, delta, ambient);
    const pose = poseAt(time);
    float.position.y = pose.y;
    float.rotation.y = (turn ? pose.rotation + offset : 0) + yaw;
    float.rotation.z = pose.tilt;
    shadow.scale.setScalar(1 + pose.y * 7);
    shadowMaterial.opacity = .85 - pose.y * 5;
    // Settling after motion at reduced resolution redraws once at full resolution.
    if (!busy && motionRatio) needsRender = true;
    const due = busy || needsRender || (ambient && now - lastRender >= (ambientFps ? 1000 / ambientFps - 2 : 0));
    if (due) {
      applyRatio(busy);
      needsRender = false;
      lastRender = now;
      renderer.render(scene, camera);
    }
    if (!busy && !ambient && !needsRender) stopLoop();
  };

  if (layout) setBagLayout(layout);
  if (bagColor) setBagColor(bagColor);
  setAccentColor(accentColor);
  await yieldToMain();
  // Compile every program up front, in parallel where the browser supports it, so the
  // first frame does not stall on shader compilation.
  await renderer.compileAsync(scene, camera);
  if (disposed) throw new Error('The 3D bag was disposed while loading');
  let triangles = 0, meshes = 0;
  gltf.scene.traverse(object => {
    if (object.isMesh) { meshes++; triangles += (object.geometry.index?.count ?? object.geometry.attributes.position.count) / 3; }
  });
  onReady({ triangles, meshes, discCount: discFeatures.api.discCount });
  invalidate();

  // Screen rectangles in container pixels, measured at the resting pose (no float or turn).
  // Points are in the bag's frame; turn them with the bag (the user's drag), ignoring the float.
  const project = (point, view = camera) => {
    const ndc = point.clone().applyAxisAngle(Y_AXIS, yaw).project(view);
    return { x: (ndc.x + 1) / 2 * container.clientWidth, y: (1 - ndc.y) / 2 * container.clientHeight };
  };
  // Where a disc sits now: a putter's stowed seat while they are stowed, otherwise its slot.
  const seatPose = placement => restPose(placement.stow && !puttersOutState ? placement.stow : placement);
  const boxOf = (placement, pose = seatPose(placement), clip = false, rim = false, view = camera) => {
    const matrix = new THREE.Matrix4().compose(pose.position, pose.quaternion, pose.scale);
    // A pocketed disc's lower part sits inside the pocket; clip the box at the mouth.
    const below = clip && placement.mouth !== undefined ? Math.min(.09, Math.max(-.101, (placement.mouth - pose.position.y) / pose.scale.y)) : -.101;
    let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
    const add = point => { const p = project(point.applyMatrix4(matrix), view); left = Math.min(left, p.x); right = Math.max(right, p.x); top = Math.min(top, p.y); bottom = Math.max(bottom, p.y); };
    // A whole disc (out of its pocket) is measured around its rim, so its box hugs the face
    // whatever its roll; a pocketed one by its clipped local box.
    if (rim) for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; add(new THREE.Vector3(0, Math.cos(a) * .101, Math.sin(a) * .101)); }
    else for (const x of [-.005, .005]) for (const y of [below, .101]) for (const z of [-.101, .101]) add(new THREE.Vector3(x, y, z));
    return { left, top, width: right - left, height: bottom - top };
  };
  const discRects = () => {
    camera.updateMatrixWorld();
    const all = [...records.values()].map(record => record.placement);
    // Empty go-to pockets still get a rectangle, at the GLB's dashed outline.
    const goTo = bagLayout({ goTo: [null] }).placements[0];
    if (!all.some(p => p.pocket === 'goTo')) all.push(goTo);
    // Main slots are adjacent edge-on discs; split the opening into columns at the
    // midpoints between neighbors so hit areas never overlap.
    const mains = all.filter(p => p.pocket === 'main' && !isOut(p.key));
    const centers = mains.map(p => project(new THREE.Vector3(p.position[0], p.position[1], .10)).x);
    const edge = i => (centers[i] + centers[i + 1]) / 2;
    return all.map(placement => {
      // An out disc's target is where it rests (or is heading), whole and face-on.
      const record = records.get(placement.key);
      if (isOut(placement.key) && record.spot) return { key: placement.key, id: placement.id, pocket: placement.pocket, order: placement.order, empty: false, shape: 'ellipse', out: true, position: placement.position, ...boxOf(placement, toBagFrame(record.spot.to), false, true) };
      const box = boxOf(placement, undefined, true);
      const rect = { key: placement.key, id: placement.id, pocket: placement.pocket, order: placement.order, empty: placement.empty, shape: placement.mouth === undefined ? 'ellipse' : 'dome', position: placement.position, ...box };
      const i = mains.indexOf(placement), n = mains.length;
      if (i >= 0 && n > 1) {
        const left = i > 0 ? edge(i - 1) : centers[0] - (edge(0) - centers[0]);
        const right = i < n - 1 ? edge(i) : centers[n - 1] + (centers[n - 1] - edge(n - 2));
        Object.assign(rect, { shape: 'column', left, width: right - left });
      } else if (i >= 0) rect.shape = 'column';
      return rect;
    });
  };
  // The bag's silhouette on screen (container px): every bag mesh's vertices (no discs), seen
  // from where the camera settles at its pull-back, so names can keep off the bag.
  const vertex = new THREE.Vector3();
  const bagRect = () => {
    if (!gltf) return null;
    const view = camera.clone();
    if (!controls && !topView && !cameraTween) { const home = pulledHome(pullGoal); view.position.copy(home.position); view.lookAt(home.target); }
    view.updateMatrixWorld(); gltf.scene.updateMatrixWorld(true);
    const width = container.clientWidth, height = container.clientHeight;
    let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
    gltf.scene.traverseVisible(object => {
      if (!object.isMesh || glbDiscs.includes(object)) return;
      const positions = object.geometry.attributes.position, step = Math.max(1, Math.floor(positions.count / 4000));
      for (let i = 0; i < positions.count; i += step) {
        vertex.fromBufferAttribute(positions, i).applyMatrix4(object.matrixWorld).project(view);
        const x = (vertex.x + 1) / 2 * width, y = (1 - vertex.y) / 2 * height;
        left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
      }
    });
    return left < right ? { left, top, width: right - left, height: bottom - top } : null;
  };
  const discScreenRect = key => {
    const record = records.get(key);
    if (!record) return null;
    camera.updateMatrixWorld();
    return boxOf(record.placement, { position: record.mesh.position, quaternion: record.mesh.quaternion, scale: record.mesh.scale });
  };

  return {
    ...discFeatures.api,
    setAnimated(value) { active = Boolean(value); invalidate(); },
    get animated() { return active; },
    get compartmentOpen() { return compartmentOpen; },
    get compartmentProgress() { return flapAction ? flapAction.time / flapDuration : 0; },
    setCompartmentOpen,
    setBackground,
    view(side = 'home') {
      time = 0;
      offset = 0;
      settleTurn();
      yaw = 0;
      yawTween = null;
      if (cameraTween) stepCamera(cameraTween, 1);
      if (topView) { topView = false; overhead = 0; showFrontPocket(); if (controls) controls.minPolarAngle = .30; }
      beforeTop = null;
      float.rotation.set(0, 0, 0);
      float.position.y = 0;
      if (controls) {
        controls.reset();
        if (side === 'front') camera.position.set(0, .10, 1.29);
        if (side === 'rear') camera.position.set(-.55, .22, -1.17);
        controls.update();
      } else placeCamera(side);
      resumeAt = performance.now() + 1800;
      invalidate();
      container.dispatchEvent(new CustomEvent('bagviewlayout'));
    },
    // Disc Atlas extensions.
    setBagLayout,
    setBagColor,
    // Read back from the shell material, so callers can verify what is actually rendered.
    get bagColor() { return '#' + shell.material.color.getHexString(); },
    get customBagColor() { return appliedBagColor; },
    setAccentColor,
    liftDisc,
    get liftedDisc() { return liftedKey; },
    stageDiscs,
    // The out discs, in the order they came out.
    get outDiscs() { return outKeys.slice(); },
    // Staging state for QA: the layout ('side', 'map' or null), each side's discs, the ring (its
    // center, half width a and height b in the bag's meters, and each disc's angle), the names on
    // the ring ('full', 'compact' or 'none'), the
    // camera's pull-back now and where it is heading, and whether anything is still moving.
    get stage() {
      const now = performance.now(), moving = pullTween !== null || [...records.values()].some(r => r.slide !== r.slideTo || (r.spot?.from && now - r.spot.start < r.spot.duration));
      return { mode: stagedMode, sides: Object.fromEntries(sides), ring, names: stagedMode === 'map' ? names : 'full', pull, pullGoal, moving };
    },
    // Where an out disc rests (or is heading), in container pixels, once the camera has
    // settled at its pull-back (so a page can scroll it into view while it still moves).
    outRect(key) {
      const record = records.get(key);
      if (!isOut(key) || !record.spot) return null;
      const view = camera.clone();
      if (!controls && !topView && !cameraTween) { const home = pulledHome(pullGoal); view.position.copy(home.position); view.lookAt(home.target); }
      view.updateMatrixWorld();
      return boxOf(record.placement, toBagFrame(record.spot.to), false, true, view);
    },
    setTopView,
    setPuttersOut,
    get puttersOut() { return puttersOutState; },
    // Whether every putter has finished moving (stowing or coming out).
    get puttersSettled() { return [...records.values()].every(record => record.out === record.outTo); },
    glowDisc,
    get glowingDisc() { return glowKey; },
    setZoom,
    get zoom() { return zoomTween ? zoomTween.to.level : zoomLevel; },
    maxZoom: MAX_ZOOM,
    cancelPress,
    get topView() { return topView; },
    // The bag's turn from the user's drag (radians); it persists until the user drags again.
    get turn() { return yaw; },
    // Whether the bag is coasting after a swipe, and its speed (rad/s).
    get spinning() { return spin !== null; },
    get spinVelocity() { return spin ? spin.velocity : 0; },
    // Whether a drag or its coast is under way (targets and labels wait for it).
    get turning() { return dragging; },
    // Whether the front pockets and main opening face the camera (or the camera is above).
    // Whether any of the GLB's go-to accent rim is drawn (it should not be).
    get goToAccentVisible() { return accents.some(object => object.visible); },
    // Whether the bag's fabric renders opaque (the top view no longer turns it translucent).
    get fabricOpaque() { return fabric.every(({ material }) => !material.transparent && material.opacity === 1); },
    get frontFacing() { return topView || Math.cos(yaw) > .25; },
    get cameraMoving() { return cameraTween !== null; },
    // Camera state for QA: polar angle from straight up (0 = top view) and how far it has come overhead.
    get cameraState() { const s = sphericalAt(camera.position, target); return { polar: s.phi, azimuth: s.theta, radius: s.radius, overhead }; },
    // Screen points (container pixels) for labels anchored to the bag, at the resting pose.
    projectPoint(point) { camera.updateMatrixWorld(); return project(new THREE.Vector3(...point)); },
    // Each pocket's volume projected to container pixels (for top-view pocket labels).
    pocketRects() {
      camera.updateMatrixWorld();
      const rect = (xs, ys, zs) => {
        let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
        for (const x of xs) for (const y of ys) for (const z of zs) { const p = project(new THREE.Vector3(x, y, z)); left = Math.min(left, p.x); right = Math.max(right, p.x); top = Math.min(top, p.y); bottom = Math.max(bottom, p.y); }
        return { left, top, width: right - left, height: bottom - top };
      };
      const r = DISC.radius;
      return {
        main: rect([MAIN.xMin, MAIN.xMax], [MAIN.y - r, MAIN.y + r], [MAIN.z - r, MAIN.z + r]),
        putter: rect([-r - TOP.maxX, r + TOP.maxX], [TOP.mouth, TOP.y + r * TOP.scale], [TOP.center - TOP.span / 2, TOP.center + TOP.span / 2]),
        goTo: rect([-r - FRONT.maxX, r + FRONT.maxX], [FRONT.mouth, FRONT.y + r * FRONT.scale], [FRONT.front - FRONT.span, FRONT.front]),
      };
    },
    turnHome,
    discRects,
    bagRect,
    // Whether `count` out discs rest beside the bag or on the map.
    stageMode,
    discScreenRect,
    get bagBounds() { gltf.scene.updateMatrixWorld(true); const box = new THREE.Box3(); gltf.scene.traverseVisible(o => { if (o.isMesh && !glbDiscs.includes(o)) box.expandByObject(o); }); return { min: box.min.toArray(), max: box.max.toArray() }; },
    get clipped() { return { ...clipped }; },
    getBagLayoutState() {
      return [...records.values()].map(record => ({ record, ...record })).map(({ record, key, placement, mesh }) => ({
        key, id: placement.id, pocket: placement.pocket, order: placement.order, empty: placement.empty,
        color: placement.empty ? null : '#' + mesh.material.color.getHexString(),
        position: placement.position.slice(), visible: mesh.visible,
        // Live pose and finish, for QA of the slide-out path and the clean (unlit) go-to.
        pose: mesh.position.toArray(), slide: record.slide, rise: record.out, glow: placement.empty ? 0 : mesh.material.emissiveIntensity,
        // Staged out (or heading out), and the spot it rests at in the room's frame.
        out: record.slideTo === 1, spot: record.slideTo === 1 && record.spot ? record.spot.to.position.toArray() : null, spotScale: record.slideTo === 1 && record.spot ? record.spot.to.scale.x : null,
      }));
    },
    get renderer() { return { pixelRatio: renderer.getPixelRatio(), width: renderer.domElement.width, height: renderer.domElement.height, rendering: loopOn, visible, quality: low ? 'low' : 'high' }; },
    invalidate,
    dispose,
  };
}
