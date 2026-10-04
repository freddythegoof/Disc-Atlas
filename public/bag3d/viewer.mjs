import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { advanceTime, poseAt } from './motion.mjs';
import { attachDiscFeatures } from './disc-features.mjs';
import { bagLayout, GLB_ACCENT_POSE } from './bag-layout.mjs';
export { parseDiscParams } from './disc-state.mjs';
export { bagLayout, depthOrder } from './bag-layout.mjs';

const VIEWS = {
  home: { position: [.60, .24, 1.14], target: [0, .025, 0] },
  front: { position: [0, .10, 1.29], target: [0, .025, 0] },
  rear: { position: [-.55, .22, -1.17], target: [0, .025, 0] },
  // Disc Atlas page framing: a slight three-quarter view that keeps the main opening,
  // the front putter pocket and the top go-to pocket readable in a 4:5 box.
  page: { position: [.20, .17, 1.33], target: [0, .045, 0] },
};
// Fabric recolors with the bag color; zipper tape, teeth and hardware stay fixed.
const FABRIC = ['Charcoal woven shell', 'Graphite pocket panels', 'Soft black piping', 'Back padding and webbing', 'Tonal seam thread'];
// The site's spring, cubic-bezier(.2,1.35,.35,1), solved for progress at time t.
const spring = t => { let lo = 0, hi = 1, u = t; const b = (p, a, c) => 3 * (1 - p) * (1 - p) * p * a + 3 * (1 - p) * p * p * c + p * p * p; for (let i = 0; i < 16; i++) { u = (lo + hi) / 2; if (b(u, .2, .35) < t) lo = u; else hi = u; } return b(u, 1.35, 1); };
const easeOut = t => 1 - (1 - t) ** 3;
const LIFT_MS = 360, MOVE_MS = 450, YAW_MS = 650;
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
  const resize = () => {
    const width = Math.max(container.clientWidth, 1), height = Math.max(container.clientHeight, 1);
    fullRatio = Math.max(.5, Math.min(devicePixelRatio, low ? 1 : 2, Math.sqrt(maxPixels / (width * height))));
    renderer.setPixelRatio(fullRatio);
    motionRatio = false;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    invalidate();
    container.dispatchEvent(new CustomEvent('bagviewlayout'));
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
    if (visible) invalidate(); else stopLoop();
  });
  intersection.observe(container);
  if (controls) {
    controls.addEventListener('start', () => { dragging = true; });
    controls.addEventListener('end', () => { dragging = false; resumeAt = performance.now() + 1800; });
    controls.addEventListener('change', () => invalidate());
  }
  const visibilityChanged = () => { last = performance.now(); if (!document.hidden) invalidate(); };
  document.addEventListener('visibilitychange', visibilityChanged);
  const contextLost = event => {
    event.preventDefault();
    stopLoop();
    container.dispatchEvent(new CustomEvent('bagviewererror', { detail: 'The 3D display was interrupted. Reload to continue.' }));
  };
  renderer.domElement.addEventListener('webglcontextlost', contextLost);

  // Turntable: a horizontal drag turns the bag and it eases back to the front on release.
  // Vertical swipes stay with the page (touch-action: pan-y), and wheel never zooms.
  const pointer = { press: null };
  const turntable = interaction === 'turntable';
  if (turntable) {
    const el = renderer.domElement;
    el.style.touchAction = 'pan-y';
    el.style.cursor = 'pointer';
    el.addEventListener('pointerdown', event => {
      if (event.button !== 0) return;
      pointer.press = { id: event.pointerId, x: event.clientX, y: event.clientY, yaw, drag: false };
    });
    el.addEventListener('pointermove', event => {
      const press = pointer.press;
      if (!press || event.pointerId !== press.id) return;
      const dx = event.clientX - press.x, dy = event.clientY - press.y;
      if (!press.drag) {
        if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) return;
        press.drag = dragging = true;
        el.setPointerCapture(event.pointerId);
        el.style.cursor = 'grabbing';
        container.dispatchEvent(new CustomEvent('bagdragstart'));
      }
      yawTween = null;
      yaw = press.yaw + dx * .012;
      invalidate();
    });
    const release = event => {
      const press = pointer.press;
      if (!press || event.pointerId !== press.id) return;
      pointer.press = null;
      if (press.drag) {
        dragging = false;
        el.style.cursor = 'pointer';
        turnHome();
        container.dispatchEvent(new CustomEvent('bagdragend'));
      } else if (event.type === 'pointerup') container.dispatchEvent(new CustomEvent('bagclick'));
    };
    el.addEventListener('pointerup', release);
    el.addEventListener('pointercancel', release);
  }
  const turnHome = (instant = !active) => {
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
    material.emissive.copy(accent);
    material.emissiveIntensity = (record.placement.pocket === 'goTo' ? .08 : 0) + (record.key === liftedKey ? .12 : 0);
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
      const record = { key: placement.key, placement, mesh, rest, lift: 0, liftFrom: 0, liftTo: 0, liftStart: 0, move: null };
      // A disc that changed pockets glides from where it was.
      const before = previous.get(placement.key);
      if (before && active && !before.mesh.position.equals(rest.position)) {
        record.move = { position: before.mesh.position.clone(), quaternion: before.mesh.quaternion.clone(), scale: before.mesh.scale.clone(), start: now };
      }
      records.set(placement.key, record);
      paintDisc(record);
    }
    if (!records.has(liftedKey)) liftedKey = null;
    const assigned = result.placements.some(p => p.pocket === 'goTo' && !p.empty);
    // The GLB draws the accent rim and dashed outline around a top-pocket disc; carry them
    // to the go-to's front-pocket seat (the front-most go-to, or the empty slot).
    const seat = result.placements.find(p => p.pocket === 'goTo' && p.order === 0) ?? bagLayout({ goTo: [null] }).placements[0];
    const pose = p => new THREE.Matrix4().compose(new THREE.Vector3(...p.position), new THREE.Quaternion().setFromEuler(new THREE.Euler(...p.rotation)), new THREE.Vector3(...p.scale));
    const toSeat = pose(seat).multiply(pose(GLB_ACCENT_POSE).invert());
    for (const object of [...placeholders, ...accents]) { object.matrixAutoUpdate = false; object.matrix.copy(toSeat); }
    for (const object of placeholders) object.visible = !assigned;
    for (const object of accents) object.visible = assigned;
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
  const scratch = { position: new THREE.Vector3(), quaternion: new THREE.Quaternion(), scale: new THREE.Vector3(), face: new THREE.Quaternion(), one: new THREE.Vector3(1, 1, 1) };
  const poseRecord = (record, now) => {
    let busy = false;
    const { rest, placement, mesh } = record;
    if (record.lift !== record.liftTo || now - record.liftStart < LIFT_MS) {
      const t = Math.min(1, (now - record.liftStart) / LIFT_MS);
      record.lift = t >= 1 ? record.liftTo : record.liftFrom + (record.liftTo - record.liftFrom) * spring(t);
      busy = t < 1;
    }
    let position = rest.position, quaternion = rest.quaternion, scale = rest.scale;
    if (record.move) {
      const t = Math.min(1, (now - record.move.start) / MOVE_MS), e = easeOut(t);
      position = scratch.position.copy(record.move.position).lerp(rest.position, e);
      quaternion = scratch.quaternion.copy(record.move.quaternion).slerp(rest.quaternion, e);
      scale = scratch.scale.copy(record.move.scale).lerp(rest.scale, e);
      if (t >= 1) record.move = null; else busy = true;
    }
    mesh.position.copy(position); mesh.quaternion.copy(quaternion); mesh.scale.copy(scale);
    if (record.lift !== 0) {
      const lifted = new THREE.Vector3(...placement.lift);
      mesh.position.lerp(lifted, record.lift);
      mesh.quaternion.slerp(faceCamera(lifted, scratch.face), Math.min(1, Math.max(0, record.lift)));
      mesh.scale.lerp(scratch.one, Math.min(1, Math.max(0, record.lift)));
    }
    return busy;
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
      // If no frame finishes it (offscreen, hidden tab, stalled GPU), settle on time anyway.
      setTimeout(() => { if (flapMotion === motion && !disposed) { setFlap(motion.to); flapMotion = null; finishFlap(); invalidate(); } }, motion.duration + 250);
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
    for (const record of records.values()) if (poseRecord(record, now)) busy = true;
    if (yawTween) {
      const t = Math.min(1, (now - yawTween.start) / YAW_MS);
      yaw = yawTween.from * (1 - easeOut(t));
      if (t >= 1) { yawTween = null; yaw = 0; } else busy = true;
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
  const project = point => {
    const ndc = point.clone().project(camera);
    return { x: (ndc.x + 1) / 2 * container.clientWidth, y: (1 - ndc.y) / 2 * container.clientHeight };
  };
  const boxOf = (placement, pose = restPose(placement), clip = false) => {
    const matrix = new THREE.Matrix4().compose(pose.position, pose.quaternion, pose.scale);
    // A pocketed disc's lower part sits inside the pocket; clip the box at the mouth.
    const below = clip && placement.mouth !== undefined ? Math.min(.09, Math.max(-.101, (placement.mouth - placement.position[1]) / placement.scale[1])) : -.101;
    let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
    for (const x of [-.005, .005]) for (const y of [below, .101]) for (const z of [-.101, .101]) {
      const p = project(new THREE.Vector3(x, y, z).applyMatrix4(matrix));
      left = Math.min(left, p.x); right = Math.max(right, p.x); top = Math.min(top, p.y); bottom = Math.max(bottom, p.y);
    }
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
    const mains = all.filter(p => p.pocket === 'main');
    const centers = mains.map(p => project(new THREE.Vector3(p.position[0], p.position[1], .10)).x);
    const edge = i => (centers[i] + centers[i + 1]) / 2;
    return all.map(placement => {
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
      yaw = 0;
      yawTween = null;
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
    turnHome,
    discRects,
    discScreenRect,
    get clipped() { return { ...clipped }; },
    getBagLayoutState() {
      return [...records.values()].map(({ key, placement, mesh }) => ({
        key, id: placement.id, pocket: placement.pocket, order: placement.order, empty: placement.empty,
        color: placement.empty ? null : '#' + mesh.material.color.getHexString(),
        position: placement.position.slice(), visible: mesh.visible,
      }));
    },
    get renderer() { return { pixelRatio: renderer.getPixelRatio(), width: renderer.domElement.width, height: renderer.domElement.height, rendering: loopOn, visible, quality: low ? 'low' : 'high' }; },
    invalidate,
    dispose,
  };
}
