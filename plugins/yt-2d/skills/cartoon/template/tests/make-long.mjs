// Длинный тестовый эпизод из короткого: повторяет TIMELINE эпизода N раз подряд со сдвигом всех таймингов.
// Нужен для проверки рендера на длинной дистанции (время, память, место на диске), не для контента.
// usage (из template/): node tests/make-long.mjs [--ep hd-test] [--times 16]  → episodes/<ep>-long/timeline.js (в .gitignore)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2), opt = (k, d) => { const i = argv.indexOf(k); return i < 0 ? d : argv[i + 1]; };
const ep = opt('--ep', 'hd-test'), N = Number(opt('--times', '16'));
const src = path.join(dir, 'episodes', ep, 'timeline.js');
const TL = runInNewContext(readFileSync(src, 'utf8') + '\n;TIMELINE', {});
const D = TL.duration, r = x => Math.round(x * 1000) / 1000;

const rep = (arr, f) => Array.from({ length: N }, (_, k) => (arr || []).map(x => f(x, k * D, k))).flat();
const shiftT = (x, o) => ({ ...x, t: r(x.t + o) });
const out = {
  ...TL,
  duration: r(D * N),
  shots: rep(TL.shots, (s, o, k) => ({ ...s, id: `${s.id}_${k}`, from: r(s.from + o), to: r(s.to + o),
    cam: Array.isArray(s.cam) ? s.cam.map(([t, ...c]) => [r(t + o), ...c]) : s.cam })),
  subs: rep(TL.subs, (p, o) => ({ ...p, from: r(p.from + o), to: r(p.to + o), words: p.words.map(([w, t]) => [w, r(t + o)]) })),
  talk: rep(TL.talk, ([a, b, ...w], o) => [r(a + o), r(b + o), ...w]),
  badges: TL.badges,   // бейдж — только в первом повторе
  cast: Object.fromEntries(Object.entries(TL.cast || {}).map(([who, c]) => [who, {
    ...c,
    poses: Object.fromEntries(Object.entries(c.poses || {}).map(([k, keys]) => [k, rep(keys, shiftT)])),
    tracks: Object.fromEntries(Object.entries(c.tracks || {}).map(([k, keys]) => [k, rep(keys, shiftT)])),
  }])),
};
const dst = path.join(dir, 'episodes', `${ep}-long`);
mkdirSync(dst, { recursive: true });
writeFileSync(path.join(dst, 'timeline.js'),
  `// СГЕНЕРИРОВАНО tests/make-long.mjs: episodes/${ep} × ${N} (${out.duration} с). Не редактировать.\nconst TIMELINE = ${JSON.stringify(out, null, 1)};\n`);
console.log(`episodes/${ep}-long/timeline.js: ${N} × ${D} с = ${out.duration} с, ${out.shots.length} шотов`);
