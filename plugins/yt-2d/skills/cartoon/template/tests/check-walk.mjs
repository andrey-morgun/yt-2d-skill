// Проверка ходьбы: опорная стопа не скользит по полу. Для каждой опоры (фаза stance цикла шага) на крейсерской скорости
// (vRel = 1, без смешивания со стойкой) меряет разброс мировой x лодыжки — в идеале 0.
// usage (из template/): node tests/check-walk.mjs [--ep rig-test] [--who dummy] [--max 1.5]   (нужен Chrome, см. CHROME_PATH)
import puppeteer from 'puppeteer-core';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2), opt = (k, d) => { const i = argv.indexOf(k); return i < 0 ? d : argv[i + 1]; };
const ep = opt('--ep', 'rig-test'), who = opt('--who', 'dummy'), MAX = Number(opt('--max', '1.5'));
const exe = process.env.CHROME_PATH || process.env.PUPPETEER_EXECUTABLE_PATH;
const browser = await puppeteer.launch({ ...(exe ? { executablePath: exe } : { channel: 'chrome' }), headless: true, args: ['--allow-file-access-from-files'] });
const page = await browser.newPage();
await page.goto(pathToFileURL(path.join(dir, 'index.html')).href + `?ep=${ep}&voice=0`);
const res = await page.evaluate(who => {
  const C = TIMELINE.cast[who], samples = [];
  for (let i = 0; i < TIMELINE.duration * 120; i++) {
    const t = i / 120, shot = TIMELINE.shots.find(s => t >= s.from && t < s.to);
    if (!shot || !(shot.cast || []).some(m => (m.who || m) === who)) continue;
    const st = charState(t, shot, who), P = C.path ? pathAt(C.path, t) : null;
    if (!st.legs || !P || P.vRel < .999) continue;
    const pl = stagePlacement({ who }, t);
    for (const side of ['L', 'R']) samples.push({ t, side, stance: st.legs[side].stance, x: pl.toWorld(st.legs[side].ankle)[0] });
  }
  return samples;
}, who);
await browser.close();
// группируем подряд идущие кадры опоры каждой ноги
const runs = [];
for (const side of ['L', 'R']) {
  let cur = null;
  for (const s of res.filter(r => r.side === side)) {
    if (s.stance && cur && s.t - cur.t1 < .02) { cur.t1 = s.t; cur.lo = Math.min(cur.lo, s.x); cur.hi = Math.max(cur.hi, s.x); }
    else if (s.stance) { cur = { side, t0: s.t, t1: s.t, lo: s.x, hi: s.x }; runs.push(cur); }
    else cur = null;
  }
}
const full = runs.filter(r => r.t1 - r.t0 > .05);
if (!full.length) { console.log(`check-walk ${ep}/${who}: нет опор на крейсерской скорости`); process.exit(1); }
const worst = Math.max(...full.map(r => r.hi - r.lo));
console.log(`check-walk ${ep}/${who}: ${full.length} опор, скольжение опорной стопы: max ${worst.toFixed(2)} мировых px` +
  ` (первые: ${full.slice(0, 4).map(r => `${r.side} ${r.t0.toFixed(2)}–${r.t1.toFixed(2)} с: ${(r.hi - r.lo).toFixed(2)}`).join('; ')})`);
process.exit(worst <= MAX ? 0 : 1);
