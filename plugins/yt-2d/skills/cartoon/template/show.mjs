// node show.mjs <name> [out.mp4] [--preview | --final] [--sfx] [--voice] [--jobs N] [--dsf N] [--preset p] [--force]
// Шоу — длинный ролик из сцен. Сцена = обычный эпизод (episodes/<ep>/), список — shows/<name>/show.js:
//   const SHOW = { scenes: ['intro', 'scene-2', …] };        // только литералы (файл читается через node:vm)
// Каждая сцена рендерится render.mjs отдельно в out/shows/<name>/: <ep>.mp4 (h264 без звука) + <ep>.wav (звук сцены,
// PCM ровно на длину её видео: кадров × 1600 сэмплов). Сцена пересобирается, только если изменились её входы — файлы
// эпизода (+ TIMELINE.scripts), движок (index.html, render.mjs, src/, fonts/, sfx/, voice/), флаги рендера, Chrome, ffmpeg.
// Склейка: видео — concat без перекодирования; звук — встык с точностью до сэмпла, с фейдом FADE на краях каждой сцены
// (оборванный посреди звук не щёлкает), и ОДИН AAC на весь ролик (склейка готовых AAC-кусков дала бы паузы на стыках).
//   --force    пересобрать все сцены
//   --jobs     процессов Chrome на сцену (на результат не влияет); остальные флаги — как у render.mjs и попадают в хэш сцены
// Все сцены шоу — с одинаковым размером кадра (TIMELINE.frame); флаги рендера общие для всех сцен.
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync, renameSync, rmSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dir = path.dirname(fileURLToPath(import.meta.url));
const FPS = 30, SR = 48000, FADE = 0.008;   // фейд на краях сцены, с (8 мс — не слышно как провал, но убирает щелчок)
const args = process.argv.slice(2);
const fail = msg => { console.error('show: ' + msg); process.exit(1); };
const VALUED = ['--jobs', '--dsf', '--preset'];
const opt = name => { const i = args.indexOf(name); if (i < 0) return null; if (i + 1 >= args.length || args[i + 1].startsWith('--')) fail(`${name} требует значение`); return args[i + 1]; };
const positional = args.filter((a, i) => !a.startsWith('--') && !VALUED.includes(args[i - 1]));
const name = positional.find(a => !a.endsWith('.mp4'));
if (!name || args.includes('--help')) { console.log('usage: node show.mjs <name> [out.mp4] [--preview|--final] [--sfx] [--voice] [--jobs N] [--dsf N] [--preset p] [--force]'); process.exit(name ? 0 : 1); }
if (!/^[\w-]+$/.test(name)) fail(`имя шоу: латиница, цифры, - и _ (получено "${name}")`);
const out = path.resolve(positional.find(a => a.endsWith('.mp4')) || path.join(dir, 'out', `${name}.mp4`));
const cacheDir = path.join(dir, 'out', 'shows', name);

// ── шоу и сцены ──
const showFile = path.join(dir, 'shows', name, 'show.js');
if (!existsSync(showFile)) fail(`нет ${path.relative(dir, showFile)}`);
const SHOW = runInNewContext(readFileSync(showFile, 'utf8') + '\n;SHOW', {}, { filename: showFile });
const scenes = SHOW && SHOW.scenes;
if (!Array.isArray(scenes) || !scenes.length) fail('SHOW.scenes: нужен непустой список имён эпизодов');
const TLs = {};
for (const ep of new Set(scenes)) {
  if (typeof ep !== 'string' || !/^[\w-]+$/.test(ep)) fail(`SHOW.scenes: "${ep}" — не имя эпизода`);
  const f = path.join(dir, 'episodes', ep, 'timeline.js');
  if (!existsSync(f)) fail(`сцена ${ep}: нет episodes/${ep}/timeline.js`);
  const TL = runInNewContext(readFileSync(f, 'utf8') + '\n;TIMELINE', {}, { filename: f });
  if (!(TL && TL.duration > 0)) fail(`сцена ${ep}: нет TIMELINE.duration`);
  TLs[ep] = TL;
}
const frameOf = ep => ({ w: 720, h: 1280, ...(TLs[ep].frame || {}) });
const f0 = frameOf(scenes[0]);
for (const ep of scenes) { const f = frameOf(ep); if (f.w !== f0.w || f.h !== f0.h) fail(`сцены разного размера кадра: ${scenes[0]} ${f0.w}×${f0.h}, ${ep} ${f.w}×${f.h}`); }
const framesOf = ep => Math.round(TLs[ep].duration * FPS);

// ── флаги для render.mjs: всё, кроме --jobs, влияет на результат и входит в хэш сцены ──
const PREVIEW = args.includes('--preview'), FINAL = args.includes('--final');
if (PREVIEW && FINAL) fail('--preview и --final одновременно не имеют смысла');
const affecting = [PREVIEW && '--preview', FINAL && '--final', args.includes('--sfx') && '--sfx', args.includes('--voice') && '--voice',
  ...['--dsf', '--preset'].flatMap(k => opt(k) != null ? [k, opt(k)] : [])].filter(Boolean);
const pass = [...affecting, ...(opt('--jobs') != null ? ['--jobs', opt('--jobs')] : [])];

// ── хэш входов сцены ──
const walk = rel => {
  const abs = path.join(dir, rel);
  if (!existsSync(abs)) return [];
  if (statSync(abs).isFile()) return [rel];
  return readdirSync(abs).sort().flatMap(f => walk(path.join(rel, f)));
};
const ffmpegVersion = (spawnSync('ffmpeg', ['-version'], { encoding: 'utf8' }).stdout || '').split('\n')[0];
const ENGINE = ['index.html', 'render.mjs', 'src', 'fonts', 'sfx/build.mjs', 'voice/build.mjs'].flatMap(walk);
// относительные импорты js/mjs (import … from './x', import('./x'), require('../x')) — рекурсивно: sfx.mjs сцены может
// реэкспортировать чужой (export * from '../other/sfx.mjs'), и его правка тоже должна пересобрать сцену
const IMPORT_RE = /(?:\bfrom\s*|\bimport\s*\(\s*|\brequire\s*\(\s*|createRequire\([^)]*\)\s*\(\s*)['"](\.{1,2}\/[^'"]+)['"]/g;
function withImports(files) {
  const seen = new Set(), queue = [...files];
  while (queue.length) {
    const f = queue.pop();
    if (seen.has(f) || !existsSync(path.join(dir, f))) continue;
    seen.add(f);
    if (/\.m?js$/.test(f)) for (const [, spec] of readFileSync(path.join(dir, f), 'utf8').matchAll(IMPORT_RE))
      queue.push(path.relative(dir, path.resolve(path.dirname(path.join(dir, f)), spec)));
  }
  return [...seen];
}
function sceneHash(ep) {
  const own = walk(path.join('episodes', ep)).filter(f => !f.endsWith(path.join('voice', 'mix.wav')));
  const extra = withImports([...own, ...(TLs[ep].scripts || []).flatMap(walk)]).filter(f => !own.includes(f));
  const h = createHash('sha256').update(JSON.stringify({ affecting, chrome: process.env.CHROME_PATH || process.env.PUPPETEER_EXECUTABLE_PATH || 'chrome', ffmpegVersion }));
  for (const f of [...new Set([...ENGINE, ...own, ...extra])].sort()) h.update(f + '\0').update(readFileSync(path.join(dir, f))).update('\0');
  return h.digest('hex');
}

// ── рендер изменившихся сцен ──
mkdirSync(cacheDir, { recursive: true });
const t0 = Date.now(), secs = ms => ((Date.now() - ms) / 1000).toFixed(1);
const FORCE = args.includes('--force');
for (const ep of new Set(scenes)) {
  const mp4 = path.join(cacheDir, `${ep}.mp4`), wav = path.join(cacheDir, `${ep}.wav`), hashFile = path.join(cacheDir, `${ep}.hash`);
  if (!FORCE && existsSync(mp4) && existsSync(wav) && existsSync(hashFile) && readFileSync(hashFile, 'utf8') === sceneHash(ep)) {
    console.log(`show: ${ep} — без изменений (кэш)`); continue;
  }
  rmSync(hashFile, { force: true });   // упадёт рендер — сцена останется «грязной»
  console.log(`show: ${ep} — рендер (${framesOf(ep)} кадров)…`);
  const t1 = Date.now();
  const r = spawnSync(process.execPath, [path.join(dir, 'render.mjs'), '--ep', ep, mp4, '--audio-out', wav, ...pass], { stdio: 'inherit' });
  if (r.status !== 0) fail(`рендер сцены ${ep} завершился с ошибкой`);
  writeFileSync(hashFile, sceneHash(ep));   // после рендера: voice.js и кэш реплик, собранные им, — тоже входы
  console.log(`show: ${ep} — готово за ${secs(t1)}s`);
}

// ── склейка: видео без перекодирования + звук встык с фейдами краёв → один AAC ──
const list = path.join(cacheDir, 'concat.txt');
writeFileSync(list, scenes.map(ep => `file '${path.join(cacheDir, `${ep}.mp4`).replace(/'/g, `'\\''`)}'`).join('\n') + '\n');
const graph = scenes.map((ep, i) => {
  const len = framesOf(ep) / FPS;
  return `[${i + 1}:a]afade=t=in:d=${FADE},afade=t=out:st=${(len - FADE).toFixed(6)}:d=${FADE}[a${i}]`;
}).join(';') + `;${scenes.map((_, i) => `[a${i}]`).join('')}concat=n=${scenes.length}:v=0:a=1[a]`;
const tmpOut = out.replace(/\.mp4$/, '.show-tmp.mp4');
mkdirSync(path.dirname(out), { recursive: true });
const t2 = Date.now();
const mux = spawnSync('ffmpeg', ['-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', list,
  ...scenes.flatMap(ep => ['-i', path.join(cacheDir, `${ep}.wav`)]),
  '-filter_complex', graph, '-map', '0:v:0', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', tmpOut], { stdio: 'inherit' });
if (mux.status !== 0) { rmSync(tmpOut, { force: true }); fail('склейка ffmpeg завершилась с ошибкой'); }
renameSync(tmpOut, out);

const frames = scenes.reduce((n, ep) => n + framesOf(ep), 0);
console.log(`show: ${scenes.length} сцен, ${frames} кадров = ${(frames / FPS).toFixed(2)} с → ${out} (склейка ${secs(t2)}s, всего ${secs(t0)}s)`);
