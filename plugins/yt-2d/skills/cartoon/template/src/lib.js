// ─── helpers ───────────────────────────────────────────────────────────────
const S = '#2a1c14', W = 6, SKIN = '#f1c08a';
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const easeInOut = k => k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
const easeOutBack = k => { const c = 1.9; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
const prog = (t, a, b) => clamp((t - a) / (b - a));
function rng(seed) { return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
const tube = (pts, w, fill) => {
  const d = 'M' + pts.map(p => p.join(',')).join(' L');
  return `<path d="${d}" stroke="${S}" stroke-width="${w + 2 * W}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="${d}" stroke="${fill}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
};
