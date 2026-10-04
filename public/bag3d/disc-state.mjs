export function normalizeHex(value) {
  if (typeof value !== 'string') throw new TypeError('Color must be a hex string');
  let hex = value.trim().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(hex)) hex = [...hex].map(c => c+c).join('');
  if (!/^[0-9a-f]{6}$/i.test(hex)) throw new TypeError(`Invalid hex color: ${value}`);
  return '#'+hex.toLowerCase();
}
export function validateSlot(slot, count) {
  if (!Number.isInteger(slot) || slot < 0 || slot >= count) throw new RangeError(`Disc slot must be an integer from 0 to ${count-1}`);
  return slot;
}
export function createDiscState(defaultColors) {
  const defaults = defaultColors.map(normalizeHex), colors = new Map();
  let putters = [], goTo = null;
  const slot = value => validateSlot(value, defaults.length);
  return {
    get count() { return defaults.length; },
    setDiscColors(entries) {
      if (!Array.isArray(entries)) throw new TypeError('setDiscColors expects an array');
      const valid = entries.map(entry => {
        if (!entry || typeof entry !== 'object') throw new TypeError('Each color entry needs slot and color');
        return { slot: slot(entry.slot), color: entry.color === null ? null : normalizeHex(entry.color) };
      });
      for (const entry of valid) entry.color === null ? colors.delete(entry.slot) : colors.set(entry.slot,entry.color);
    },
    setPutterSlots(values) {
      if (!Array.isArray(values)) throw new TypeError('setPutterSlots expects an array of slot indices');
      putters = [...new Set(values.map(slot))];
    },
    setGoToDisc(value) { goTo = value === null ? null : slot(value); },
    snapshot() {
      return defaults.map((defaultColor,index) => ({
        slot:index, color:colors.get(index) ?? defaultColor, defaultColor,
        isPutter:putters.includes(index), isGoTo:index === goTo,
        location:index === goTo ? 'goTo' : putters.includes(index) ? 'putter' : 'main',
      }));
    },
  };
}
export function parseDiscParams(search, count=12) {
  const params = search instanceof URLSearchParams ? search : new URLSearchParams(search);
  const result = { colors:[], putters:[], goTo:null, issues:[] };
  const attempt = fn => { try { return fn(); } catch(error) { result.issues.push(error.message); return undefined; } };
  const slot = raw => {
    if (!/^\d+$/.test(raw.trim())) throw new RangeError(`Invalid disc slot: ${raw}`);
    return validateSlot(Number(raw),count);
  };
  if (params.has('colors')) params.get('colors').split(',').forEach((color,index) => {
    if (!color.trim()) return;
    const value=attempt(()=>({slot:validateSlot(index,count),color:normalizeHex(color)}));
    if (value) result.colors.push(value);
  });
  if (params.get('putters')) for (const raw of params.get('putters').split(',')) {
    const value=attempt(()=>slot(raw));
    if (value !== undefined && !result.putters.includes(value)) result.putters.push(value);
  }
  const raw=params.get('goto');
  if (raw && raw.toLowerCase() !== 'none') result.goTo=attempt(()=>slot(raw)) ?? null;
  return result;
}
