// Time is measured in active animation seconds, so pause/resume never jumps.
export function advanceTime(time, delta, enabled) {
  return enabled ? time + Math.max(0, delta) : time;
}
export function poseAt(time) {
  return {
    y: .008 * Math.sin(time * Math.PI * 2 / 5),
    rotation: time * Math.PI * 2 / 120,
    tilt: .010 * Math.sin(time * Math.PI * 2 / 8),
  };
}
