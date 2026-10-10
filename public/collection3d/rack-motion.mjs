// Timing and cubic easing match Disc Atlas's bag viewer; the initial lift clears wood rails.
export const SLIDE_MS = 620;
export const TRAVEL_MS = 480;
export const TRAVEL_AT = .75;
export const TOTAL_MS = SLIDE_MS * TRAVEL_AT + TRAVEL_MS;
export const RESTAGE_MS = 650;
export const DEFAULT_RACK_COLOR = '#d4bb86';
export const clamp = (n, a = 0, b = 1) => Math.min(b, Math.max(a, n));
export const easeInOut = t => t < .5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
const stage = (t, a, b) => easeInOut(clamp((t - a) / (b - a)));
const mix = (a, b, t) => a + (b - a) * t;

export function normalizeColor(value) {
  if (typeof value !== 'string' || !/^#?(?:[a-f\d]{3}|[a-f\d]{6})$/i.test(value)) throw new TypeError('Use a three- or six-digit hex color.');
  let hex = value.replace('#', '').toLowerCase();
  if (hex.length === 3) hex = [...hex].map(c => c + c).join('');
  return '#' + hex;
}

/** Reversible, rail-safe path; all dimensions are meters, Y up, +Z forward. */
export function discPose(rest, target, progress, targetScale = 1) {
  if (progress <= 0) return {position: [...rest], turn: 0, scale: 1};
  if (progress >= 1) return {position: [...target], turn: -Math.PI / 2, scale: targetScale};
  const ms = clamp(progress) * TOTAL_MS, p = clamp(ms / SLIDE_MS);
  const lift = stage(p, 0, .22), forward = stage(p, .22, .68);
  const turn = stage(p, .68, 1);
  const travel = easeInOut(clamp((ms - SLIDE_MS * TRAVEL_AT) / TRAVEL_MS));
  const clear = [rest[0], rest[1] + .062 * lift, rest[2] + .36 * forward];
  return {
    position: clear.map((v, i) => mix(v, target[i], travel)),
    turn: -Math.PI / 2 * Math.max(turn, travel),
    scale: mix(1, targetScale, travel),
  };
}
