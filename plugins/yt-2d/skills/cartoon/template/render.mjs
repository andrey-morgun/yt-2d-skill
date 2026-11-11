// node render.mjs [out.mp4] [--ep tolyan] [--stills 0.8,3.5,5.0,6.0] [--sfx] [--voice] [--preview | --final] [--keep-frames] [--jobs 4] [--dsf 2] [--preset slow]
//   out.mp4    по умолчанию out/<ep>.mp4
//   --ep       эпизод: episodes/<ep>/timeline.js (+ episodes/<ep>/sfx.mjs для --sfx); по умолчанию tolyan
//   --stills   отрендерить только кадры в указанные секунды (PNG в FRAMES_DIR), без видео
//   --sfx      собрать фоли-дорожку (sfx/build.mjs) и подмешать её в mp4 (AAC 192k)
//   --voice    собрать озвучку (voice/build.mjs: TIMELINE.voice → voice.js + voice/mix.wav; API только для новых реплик,
//              нужен OPENROUTER_API_KEY: node --env-file=.env render.mjs …) и подмешать её; с --sfx фоли приглушаются на −6 dB под речью
//   --preview  быстрый черновик: = --dsf 1 --preset veryfast (контакт-лист, проверка движения)
//   --final    чистовой: = --dsf 2 --preset slow (умолчание); явные --dsf/--preset перекрывают оба
//   --keep-frames  дополнительно сохранить PNG-кадры в FRAMES_DIR (отладка). Без него кадры идут в ffmpeg через pipe и на диск
//              не пишутся (80 с ролика 720×1280 ≈ 3.4 ГБ PNG при dsf 1, 1080p — в 2.25× больше)
//   Если в TIMELINE есть voice, а episodes/<ep>/voice.js ещё нет, он собирается автоматически БЕЗ API (voice/build.mjs --no-api):
//   реплики из кэша, остальные — заглушки по оценке длительности. Настоящая озвучка — только по --voice.
//   --jobs N   параллельных процессов Chrome (кадры независимы; по умолчанию min(4, cpu-2); 4 ≈ 7× быстрее одного)
//   --dsf N    deviceScaleFactor (2 = суперсэмплинг: снимаем вдвое крупнее и уменьшаем lanczos до размера кадра; 1 = быстрый превью)
//   Размер кадра — TIMELINE.frame = { w, h } (чётные px), по умолчанию 720×1280
//   --preset   пресет x264 (по умолчанию slow)
//   FRAMES_DIR каталог для PNG (--stills, --keep-frames; по умолчанию .frames рядом со скриптом)
//   CHROME_PATH путь к Chrome/Chromium, если Google Chrome не установлен в стандартное место
import puppeteer from 'puppeteer-core';
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, rmSync, renameSync, existsSync, readdirSync, readFileSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { cpus } from 'node:os';
import path from 'node:path';

const dir = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const fail = msg => { console.error('render: ' + msg); process.exit(1); };
const opt = (name, def) => {
  const i = args.indexOf(name); if (i < 0) return def;
  if (i + 1 >= args.length || args[i + 1].startsWith('--')) fail(`${name} требует значение`);
  return args[i + 1];
};
if (args.includes('--help') || args.includes('-h')) {
  console.log('usage: node render.mjs [out.mp4] [--ep name] [--stills t1,t2,..] [--sfx] [--voice] [--preview|--final] [--keep-frames] [--jobs N] [--dsf N] [--preset p]'); process.exit(0);
}
const PREVIEW = args.includes('--preview'), FINAL = args.includes('--final'), KEEP_FRAMES = args.includes('--keep-frames');
if (PREVIEW && FINAL) fail('--preview и --final одновременно не имеют смысла');

const ep = opt('--ep', 'tolyan');
if (!/^[\w-]+$/.test(ep)) fail(`--ep: только латиница, цифры, - и _ (получено "${ep}")`);
const stillsArg = opt('--stills', null);
const stills = stillsArg ? stillsArg.split(',').map(s => Number(s.trim())) : null;
if (stills && (!stills.length || stills.some(t => !Number.isFinite(t) || t < 0))) fail(`--stills: ожидались секунды через запятую, получено "${stillsArg}"`);
const FPS = 30, DSF = Number(opt('--dsf', PREVIEW ? '1' : '2')), PRESET = opt('--preset', PREVIEW ? 'veryfast' : 'slow');
const JOBS = Math.max(1, Number(opt('--jobs', String(Math.min(4, Math.max(1, cpus().length - 2))))) || 1);
if (!Number.isFinite(DSF) || DSF <= 0) fail('--dsf: нужно положительное число');
const out = path.resolve(args.find(a => a.endsWith('.mp4')) || path.join(dir, 'out', `${ep}.mp4`));
const framesDir = path.resolve(process.env.FRAMES_DIR || path.join(dir, '.frames'));
const epDir = path.join(dir, 'episodes', ep);
if (!existsSync(path.join(epDir, 'timeline.js'))) {
  const have = existsSync(path.join(dir, 'episodes')) ? readdirSync(path.join(dir, 'episodes')).filter(d => !d.startsWith('_')).join(', ') : '—';
  fail(`эпизод не найден: episodes/${ep}/timeline.js (есть: ${have})`);
}

// ── инструменты и каталоги ──
if (!stills && spawnSync('ffmpeg', ['-version']).error) fail('ffmpeg не найден в PATH (brew install ffmpeg)');
// PNG на диск — только стиллы и --keep-frames; видео идёт в ffmpeg через stdin
const WRITE_FRAMES = !!stills || KEEP_FRAMES;
if (WRITE_FRAMES) {
  if (existsSync(framesDir)) { // чистим только если там лежат наши PNG (защита от FRAMES_DIR=~)
    const foreign = readdirSync(framesDir).filter(f => !/^(f_\d+|still_[\d.]+)\.png$/.test(f) && f !== '.DS_Store');
    if (foreign.length) fail(`FRAMES_DIR ${framesDir} содержит посторонние файлы (${foreign.slice(0, 3).join(', ')}) — не чищу`);
    rmSync(framesDir, { recursive: true, force: true });
  }
  mkdirSync(framesDir, { recursive: true });
}
mkdirSync(path.dirname(out), { recursive: true });

// ── озвучка: собираем ДО съёмки, чтобы voice.js (субтитры, окна рта) был свежим. API зовётся только для новых реплик ──
const VOICE_ON = args.includes('--voice'), SFX_ON = args.includes('--sfx');
const voiceJs = path.join(epDir, 'voice.js'), voiceWav = path.join(epDir, 'voice', 'mix.wav');
if (VOICE_ON && spawnSync(process.execPath, [path.join(dir, 'voice', 'build.mjs'), '--ep', ep], { stdio: 'inherit' }).status !== 0) fail('voice/build.mjs завершился с ошибкой');
// без --voice: если эпизод говорит, а voice.js ещё нет — собрать его без API (кэш + заглушки), чтобы стиллы/превью шли с субтитрами
const hasVoice = (() => { try { return !!runInNewContext(readFileSync(path.join(epDir, 'timeline.js'), 'utf8') + '\n;TIMELINE', {}).voice; } catch { return false; } })();
if (!VOICE_ON && hasVoice && !existsSync(voiceJs)) {
  console.log(`render: episodes/${ep}/voice.js ещё нет — собираю без API (voice/build.mjs --no-api)`);
  if (spawnSync(process.execPath, [path.join(dir, 'voice', 'build.mjs'), '--ep', ep, '--no-api'], { stdio: 'inherit' }).status !== 0) fail('voice/build.mjs --no-api завершился с ошибкой');
}

// Каждая вкладка — в своём процессе Chrome: в headless фоновые вкладки одного браузера не отрисовываются,
// и параллельные скриншоты виснут. Снимаем через сырой CDP Page.captureScreenshot (clip.scale = DSF):
// байт-в-байт то же PNG, что у page.screenshot(), но без его накладных расходов (~2.4× быстрее).
const browsers = [];
let FRAME = null;   // { w, h } — размер кадра эпизода (FRAME в src/render.js); узнаём у первой страницы
let enc = null;     // ffmpeg-энкодер видео (читает PNG из stdin)
const videoTmp = out.replace(/\.mp4$/, '.video-tmp.mp4');   // энкодер пишет сюда; в out — только целиком собранное видео
// первая причина побеждает: остальные ошибки — следствия (закрытый Chrome, оборванный pipe)
let dying = null;
const die = msg => dying ??= (async () => {
  if (enc) { enc.kill('SIGKILL'); rmSync(videoTmp, { force: true }); }
  await Promise.all(browsers.map(b => b.close().catch(() => {}))); fail(msg);
})();
// voice=0: voice.js ещё не собран — index.html не должен пытаться его грузить (несуществующий script на file:// = ошибка страницы)
const pageUrl = pathToFileURL(path.join(dir, 'index.html')).href + `?ep=${encodeURIComponent(ep)}` + (existsSync(voiceJs) ? '' : '&voice=0');
async function openPage() {
  let browser;
  try {
    // CHROME_PATH — свой бинарник Chrome/Chromium (Linux, CI); иначе установленный Google Chrome
    const exe = process.env.CHROME_PATH || process.env.PUPPETEER_EXECUTABLE_PATH;
    browser = await puppeteer.launch({ ...(exe ? { executablePath: exe } : { channel: 'chrome' }), headless: true, args: ['--allow-file-access-from-files'] });
  } catch (e) { await die(`не удалось запустить Chrome (нужен Google Chrome или CHROME_PATH=/путь/к/chromium): ${e.message}`); }
  browsers.push(browser);
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('requestfailed', r => errors.push(`не загрузился ${r.url()}`));
  await page.setViewport({ width: 720, height: 1280, deviceScaleFactor: DSF });
  await page.goto(pageUrl);
  // шрифты грузятся лениво (при первом появлении текста) — грузим все заранее, чтобы ни один кадр не ушёл с fallback-шрифтом
  await page.evaluate(() => Promise.all([...document.fonts].map(f => f.load())).then(() => document.fonts.ready));
  if (errors.length) await die(`ошибки на странице:\n  ${errors.join('\n  ')}`);
  if (!await page.$('#stage')) await die('#stage не найден в index.html');
  // размер кадра: viewport открыт как 720×1280 (умолчание); у эпизода с TIMELINE.frame — пересобираем под него
  const fr = await page.evaluate(() => typeof FRAME === 'object' && FRAME ? { w: FRAME.w, h: FRAME.h } : null);
  if (!fr || ![fr.w, fr.h].every(v => Number.isInteger(v) && v > 0 && v % 2 === 0))
    await die(`TIMELINE.frame: нужны чётные целые w и h в px (получено ${JSON.stringify(fr)})`);
  if (fr.w !== 720 || fr.h !== 1280) await page.setViewport({ width: fr.w, height: fr.h, deviceScaleFactor: DSF });
  FRAME ??= fr;
  const cdp = await page.createCDPSession();
  return { page, cdp, errors };
}
const capture = cdp => cdp.send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true, clip: { x: 0, y: 0, width: FRAME.w, height: FRAME.h, scale: DSF } })
  .then(r => Buffer.from(r.data, 'base64'));

const first = await openPage();
const duration = await first.page.evaluate(() => typeof TIMELINE === 'object' && TIMELINE.duration);
if (!(duration > 0)) await die(`TIMELINE.duration = ${duration} (эпизод ${ep})`);
if (await first.page.evaluate(() => typeof TIMELINE === 'object' && !!TIMELINE.voice && typeof VOICE !== 'object'))
  console.warn(`render: в TIMELINE есть voice, а episodes/${ep}/voice.js не собран — субтитры и рот без озвучки (node --env-file=.env voice/build.mjs --ep ${ep})`);
const times = stills || Array.from({ length: Math.round(duration * FPS) }, (_, i) => i / FPS);
const nameOf = i => stills ? `still_${times[i].toFixed(2)}.png` : `f_${String(i).padStart(4, '0')}.png`;
const jobs = Math.min(JOBS, times.length);
const pages = [first, ...await Promise.all(Array.from({ length: jobs - 1 }, openPage))];

// ── видео: PNG-кадры идут в ffmpeg через stdin (image2pipe) — на диске только mp4 ──
const run = (cmd, a) => new Promise((res, rej) => spawn(cmd, a, { stdio: 'inherit' })
  .on('error', e => rej(new Error(`${cmd}: ${e.message}`)))
  .on('exit', c => c ? rej(new Error(`${cmd} завершился с кодом ${c}`)) : res()));
let encEnding = false;
if (!stills) {
  enc = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', 'pipe:0',
    '-vf', `scale=${FRAME.w}:${FRAME.h}:flags=lanczos`, '-c:v', 'libx264', '-preset', PRESET, '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', videoTmp],
    { stdio: ['pipe', 'inherit', 'inherit'] });
  enc.exited = new Promise(res => enc.on('exit', (code, sig) => res(code ?? sig)));
  enc.on('error', e => die(`ffmpeg: ${e.message}`));
  enc.stdin.on('error', () => {});   // EPIPE, если ffmpeg упал: причину сообщит обработчик выхода ниже
  enc.exited.then(c => { if (!encEnding) die(`ffmpeg завершился посреди съёмки (код ${c})`); });
}

// Кадр — чистая функция t: процессы Chrome берут кадры из общей очереди и снимают параллельно, т.е. не по порядку.
// Буфер переупорядочивания: снятый кадр i ждёт в pending, пока в ffmpeg не ушли все кадры до него.
// Окно WINDOW ограничивает забег вперёд (память ≈ WINDOW PNG-кадров); медленный ffmpeg тормозит съёмку через drain.
const WINDOW = Math.max(8, jobs * 3);
const pending = new Map(), waiters = [];
let claimed = 0, written = 0, done = 0, writeChain = Promise.resolve();
async function flush() {
  while (pending.has(written)) {
    const png = pending.get(written); pending.delete(written); written++;
    waiters.splice(0).forEach(wake => wake());
    if (!enc.stdin.write(png)) await Promise.race([new Promise(r => enc.stdin.once('drain', r)), enc.exited]);
  }
}
const t0 = Date.now();
try {
  await Promise.all(pages.map(async ({ page, cdp, errors }) => {
    for (;;) {
      while (enc && claimed < times.length && claimed - written >= WINDOW) await new Promise(r => waiters.push(r));
      if (claimed >= times.length) return;
      const i = claimed++;
      await page.evaluate(t => render(t), times[i]);
      if (errors.length) throw new Error(`t=${times[i]}: ${errors.join('; ')}`);
      const png = await capture(cdp);
      if (WRITE_FRAMES) await writeFile(path.join(framesDir, nameOf(i)), png);
      if (enc) { pending.set(i, png); writeChain = writeChain.then(flush); }
      if (++done % 30 === 0) process.stdout.write(`\r${done}/${times.length}`);
    }
  }));
} catch (e) { await die(e.message); }
await Promise.all(browsers.map(b => b.close()));
const secs = ms => ((Date.now() - ms) / 1000).toFixed(1);
console.log(`\rcaptured ${times.length} frames ${FRAME.w}×${FRAME.h} in ${secs(t0)}s (${jobs} jobs, dsf ${DSF})` +
  (WRITE_FRAMES ? ` → ${framesDir}` : ' → ffmpeg pipe'));

if (!stills) {
  const t1 = Date.now();
  await writeChain;
  encEnding = true;
  enc.stdin.end();
  const code = await enc.exited;
  if (code !== 0) { rmSync(videoTmp, { force: true }); fail(`ffmpeg завершился с кодом ${code}`); }
  renameSync(videoTmp, out);
  console.log(`→ ${out} (encode tail ${secs(t1)}s, total ${secs(t0)}s)`);

  if (SFX_ON || VOICE_ON) { // звук: фоли (sfx/build.mjs → out/<name>.sfx.wav) и/или озвучка (voice/mix.wav) → AAC
    const wav = out.replace(/\.mp4$/, '.sfx.wav'), tmpOut = out.replace(/\.mp4$/, '.sfx-tmp.mp4');
    if (SFX_ON) await run(process.execPath, [path.join(dir, 'sfx', 'build.mjs'), '--ep', ep, '--out', wav]).catch(e => fail(e.message));
    if (VOICE_ON && !existsSync(voiceWav)) fail(`нет ${voiceWav} — voice/build.mjs не собрал стем`);
    const inputs = ['-i', out, ...(SFX_ON ? ['-i', wav] : []), ...(VOICE_ON ? ['-i', voiceWav] : [])];
    let audio = ['-map', '0:v:0', '-map', '1:a:0'];
    if (SFX_ON && VOICE_ON) {
      // фоли под речью приглушаются на −6 dB: окна реплик из voice.js (вход 0.15 с, выход 0.3 с), как duck в sfx/build.mjs
      const VOICE = runInNewContext(readFileSync(voiceJs, 'utf8') + '\n;VOICE', {}, { filename: voiceJs });
      const win = VOICE.lines.filter(l => l.talk.length).map(l => [l.talk[0][0], l.talk[l.talk.length - 1][1]]);
      const duck = win.length ? `1-0.5*min(1,${win.map(([a, b]) => `(clip((t-(${(a - .15).toFixed(3)}))/.15,0,1)-clip((t-${b.toFixed(3)})/.3,0,1))`).join('+')})` : '1';
      audio = ['-filter_complex', `[1:a]volume='${duck}':eval=frame[s];[s][2:a]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.891:attack=2:release=60:level=disabled[a]`,
        '-map', '0:v:0', '-map', '[a]'];
    }
    await run('ffmpeg', ['-y', '-v', 'error', ...inputs, ...audio, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
      '-shortest', '-movflags', '+faststart', tmpOut]).catch(e => fail(e.message));
    renameSync(tmpOut, out);
    console.log(`→ + ${[SFX_ON && 'sfx', VOICE_ON && 'voice'].filter(Boolean).join(' + ')}`, out);
  }
  if (KEEP_FRAMES) console.log(`кадры оставлены: ${framesDir} (--keep-frames)`);
}
