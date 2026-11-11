// Озвучка эпизода: node --env-file=.env voice/build.mjs --ep <ep> [--check] [--model fish-audio/drama-3]
//   TIMELINE.voice (episodes/<ep>/timeline.js) → mp3 реплик (TTS fish-audio/drama-3 через OpenRouter ИЛИ напрямую Fish Audio;
//   кэш по hash(model+voice+text) общий для обоих провайдеров)
//     → episodes/<ep>/voice.js  (VOICE: реплики с таймингом слов, окнами рта и фразами субтитров — читает браузер и sfx/build.mjs)
//     → episodes/<ep>/voice/mix.wav (стем диалога 48 кГц стерео, реплики на своих t, −16 LUFS)
//   --check  новые (ещё не проверенные) клипы прогнать через speech-to-text и показать расхождения с текстом
//   Кэш: episodes/<ep>/voice/<hash>.mp3 + <hash>.json (длительность, речевые окна, громкость, транскрипт).
//   Правка одной реплики перегенерирует только её. Ключ — любой из двух (в .env):
//     OPENROUTER_API_KEY  — https://openrouter.ai/keys (TTS + проверка --check через openai/gpt-transcribe)
//     FISH_AUDIO_API_KEY  — https://fish.audio (TTS напрямую; работают и приватные голоса твоего аккаунта; --check недоступен)
//   Оба заданы → OpenRouter; --provider fish|openrouter (или VOICE_PROVIDER) — принудительно.
//   Без ключа (или с --no-api) API не зовётся: реплики из кэша как обычно, а для некэшированных строится ЗАГЛУШКА —
//   длительность по слогам, субтитры и окна рта по оценке, аудио нет (в стем не идёт, в кэш ничего не пишется).
//   Так стиллы и превью нового эпизода работают без ключа; появился ключ — пересобери, сгенерируются только недостающие.
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdirSync, existsSync, readFileSync, writeFileSync, renameSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url)), root = path.dirname(here);
const argv = process.argv.slice(2);
const opt = (name, def) => { const i = argv.indexOf(name); if (i < 0) return def; if (i + 1 >= argv.length) throw new Error(`${name} needs a value`); return argv[i + 1]; };
const ep = opt('--ep', 'tolyan'), epDir = path.join(root, 'episodes', ep), cacheDir = path.join(epDir, 'voice');
const MODEL = opt('--model', 'fish-audio/drama-3'), CHECK = argv.includes('--check'), NO_API = argv.includes('--no-api') || process.env.VOICE_NO_API === '1';
const HAS_KEY = !!(process.env.OPENROUTER_API_KEY || process.env.FISH_AUDIO_API_KEY);
const SR = 48000, TARGET_LUFS = -16, CEILING = 0.891;      // стем: −16 LUFS интегрально по клипу, пик ≤ −1 dBFS
const SUB_WORDS = 3, SUB_CHARS = 24, SUB_HOLD = 0.45;        // фраза субтитра: ≤3 слова, ≤24 символа; держать после последнего слова
const BREATH_DB = 12, META_V = 3;                           // речевой участок тише самого громкого на 12+ dB = вздох; версия анализа в <hash>.json
const warn = m => console.warn('voice: ' + m);

// timeline.js — классический браузерный скрипт из литералов: читаем его в пустом vm-контексте (как sfx/build.mjs)
function loadTimeline(file) {
  const TL = runInNewContext(readFileSync(file, 'utf8') + '\n;TIMELINE', {}, { filename: file });
  if (!TL || !(TL.duration > 0)) throw new Error(`${file}: TIMELINE.duration missing`);
  return TL;
}
const TL = loadTimeline(path.join(epDir, 'timeline.js'));
const V = TL.voice;
if (!V || !Array.isArray(V.lines) || !V.cast) throw new Error(`episodes/${ep}/timeline.js: нет TIMELINE.voice = { cast, lines }`);
for (const l of V.lines) {
  if (!l.id || !l.who || typeof l.text !== 'string' || !(l.t >= 0)) throw new Error(`реплика без id/who/text/t: ${JSON.stringify(l)}`);
  if (!V.cast[l.who]) throw new Error(`реплика ${l.id}: who "${l.who}" нет в voice.cast`);
  if (V.lines.filter(x => x.id === l.id).length > 1) throw new Error(`дубль id реплики "${l.id}"`);
}

// ---------- helpers ----------
function ff(args, label) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-nostdin', '-y', ...args], { encoding: 'utf8', maxBuffer: 1 << 26 });
  if (r.status !== 0) throw new Error(`ffmpeg failed (${label}):\n${r.stderr}`);
  return r.stderr;
}
const spoken = text => text.replace(/\[[^\]]*\]/g, ' ').trim().split(/\s+/).filter(Boolean);   // слова без режиссёрских тегов [устало]
const syllables = w => Math.max(1, (w.toLowerCase().match(/[аеёиоуыэюяaeiouy]/g) || []).length);
const norm = s => s.toLowerCase().replace(/ё/g, 'е').replace(/[^\p{L}\p{N}\s]/gu, ' ').trim().split(/\s+/).filter(Boolean);
const r3 = x => Math.round(x * 1000) / 1000;

const PROVIDER = opt('--provider', process.env.VOICE_PROVIDER || (process.env.OPENROUTER_API_KEY ? 'openrouter' : process.env.FISH_AUDIO_API_KEY ? 'fish' : 'openrouter'));
const NO_KEY = 'нет ключа TTS: положи в .env OPENROUTER_API_KEY или FISH_AUDIO_API_KEY и запускай через node --env-file=.env …';
// синтез одной реплики: одинаковая модель drama-3 у обоих провайдеров → один и тот же кэш
async function tts(text, voice) {
  if (PROVIDER === 'fish') {
    const key = process.env.FISH_AUDIO_API_KEY;
    if (!key) throw new Error(NO_KEY);
    const res = await fetch('https://api.fish.audio/v1/tts', {
      method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', model: MODEL.replace(/^fish-audio\//, '') },
      body: JSON.stringify({ text, reference_id: voice, format: 'mp3' }), signal: AbortSignal.timeout(120000),
    });
    if (!res.ok) throw new Error(`fish tts: HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
    return res;
  }
  return api('speech', { model: MODEL, input: text, voice, response_format: 'mp3' });
}
async function api(endpoint, body) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error(endpoint === 'speech' ? NO_KEY : 'проверка --check требует OPENROUTER_API_KEY (openai/gpt-transcribe)');
  const res = await fetch(`https://openrouter.ai/api/v1/audio/${endpoint}`, {
    method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body), signal: AbortSignal.timeout(120000),
  });
  if (!res.ok) throw new Error(`${endpoint}: HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return res;
}

// длительность + речевые окна (всё, что не тишина ниже −35 dB дольше 80 мс) + громкость клипа
function analyse(file) {
  const p = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], { encoding: 'utf8' });
  const dur = +p.stdout;
  if (!(dur > 0)) throw new Error(`ffprobe: нет длительности у ${file}`);
  const log = ff(['-i', file, '-af', 'silencedetect=n=-35dB:d=0.08', '-f', 'null', '-'], 'silencedetect');
  const sil = []; let open = null;
  for (const m of log.matchAll(/silence_(start|end): (-?[\d.]+)/g)) {
    if (m[1] === 'start') open = +m[2]; else if (open != null) { sil.push([Math.max(0, open), +m[2]]); open = null; }
  }
  if (open != null) sil.push([Math.max(0, open), dur]);              // тишина до конца файла без silence_end
  const speech = []; let cur = 0;
  for (const [a, b] of sil) { if (a - cur > 0.02) speech.push([cur, a]); cur = b; }
  if (dur - cur > 0.02) speech.push([cur, dur]);
  if (!speech.length) { warn(`${path.basename(file)}: речь не найдена (весь клип тише −35 dB) — считаю речью весь клип`); speech.push([0, dur]); }
  // вздохи/дыхание: TTS по тегу вроде [устало] дорисовывает выдох — он на 12+ dB тише слов; в слова и окна рта его не берём
  const rmsOf = ([a, b]) => +ff(['-i', file, '-af', `atrim=${a}:${b},astats=measure_perchannel=none:measure_overall=RMS_level`, '-f', 'null', '-'], 'rms')
    .match(/RMS level dB: (-?[\d.]+|-inf)/)[1];
  const rms = speech.map(rmsOf), loud = Math.max(...rms);
  const breath = speech.filter((_, i) => rms[i] < loud - BREATH_DB);
  const voiced = speech.filter((_, i) => rms[i] >= loud - BREATH_DB);
  let lufs = null;
  // громкость меряем уже в стерео (как клип ляжет в стем): моно, раздвоенное в L+R, на 3 LU громче
  const m = ff(['-i', file, '-af', 'pan=stereo|c0=c0|c1=c0,ebur128=framelog=verbose', '-f', 'null', '-'], 'ebur128').match(/I:\s+(-?[\d.]+) LUFS/);
  if (m && Number.isFinite(+m[1]) && +m[1] > -70) lufs = +m[1];
  let gain;
  if (lufs != null) gain = TARGET_LUFS - lufs;
  else {   // слишком короткий/тихий клип для ebur128: нормируем по пику к −3 dBFS
    const s = ff(['-i', file, '-af', 'astats=measure_perchannel=none:measure_overall=Peak_level', '-f', 'null', '-'], 'astats');
    gain = -3 - +s.slice(s.lastIndexOf('Overall')).match(/Peak level dB: (-?[\d.]+)/)[1];
    warn(`${path.basename(file)}: ebur128 не дал LUFS, нормирую по пику`);
  }
  const rr = w => w.map(([a, b]) => [r3(a), r3(b)]);
  return { v: META_V, dur: r3(dur), speech: rr(voiced), breath: rr(breath), lufs, gain: r3(gain) };
}

// заглушка без аудио: длительность по слогам (≈0.13 с/слог + 0.06 с/слово + 0.35 с хвост), вся реплика — одно речевое окно
function estimate(text) {
  const words = spoken(text), syl = words.reduce((s, w) => s + syllables(w), 0);
  const dur = r3(.35 + syl * .13 + words.length * .06);
  return { v: META_V, dur, speech: [[0, dur]], breath: [], lufs: null, gain: 0, placeholder: true };
}

// слова раскладываем по слогам вдоль «речевого времени» (сумма речевых окон, паузы выброшены) → абсолютные t
function wordTimes(words, speech, t0) {
  const runs = speech.map(([a, b]) => [a, b, b - a]), total = runs.reduce((s, r) => s + r[2], 0);
  const syl = words.map(syllables), sylTotal = syl.reduce((a, b) => a + b, 0);
  const toAbs = s => { for (const [a, , len] of runs) { if (s <= len + 1e-9) return t0 + a + s; s -= len; } return t0 + runs[runs.length - 1][1]; };
  let acc = 0;
  return words.map((w, i) => { const t = toAbs(total * acc / sylTotal); acc += syl[i]; return [w, r3(t)]; });
}

// фразы субтитров: ≤SUB_WORDS слов и ≤SUB_CHARS символов, либо split — число слов в каждой фразе
function chunk(words, split) {
  const out = [];
  if (split) {
    let i = 0;
    for (const n of split) { if (n > 0 && i < words.length) out.push(words.slice(i, i + n)); i += n; }
    if (i < words.length) out.push(words.slice(i));
    return out;
  }
  let cur = [];
  for (const w of words) {
    const len = [...cur, w].map(x => x[0]).join(' ').length;
    if (cur.length && (cur.length >= SUB_WORDS || len > SUB_CHARS)) { out.push(cur); cur = []; }
    cur.push(w);
  }
  if (cur.length) out.push(cur);
  return out;
}

// ---------- 1) клипы: кэш или генерация ----------
mkdirSync(cacheDir, { recursive: true });
const clips = [];   // { line, hash, mp3, meta }
let generated = 0, placeholders = 0;
for (const l of V.lines) {
  const voice = V.cast[l.who];
  const hash = createHash('sha1').update(`${MODEL}\n${voice}\n${l.text}`).digest('hex').slice(0, 12);
  const mp3 = path.join(cacheDir, `${hash}.mp3`), json = path.join(cacheDir, `${hash}.json`);
  if (!existsSync(mp3) && (NO_API || !HAS_KEY)) {   // нет аудио и нельзя/нечем генерировать → заглушка в памяти, кэш не трогаем
    placeholders++;
    clips.push({ line: l, hash, mp3: null, json, meta: { model: MODEL, voice, text: l.text, ...estimate(l.text) } });
    continue;
  }
  if (!existsSync(mp3)) {
    process.stdout.write(`voice: tts ${l.id} (${l.who}) «${l.text}» … `);
    const res = await tts(l.text, voice);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 1000) throw new Error(`${l.id}: подозрительно короткий ответ TTS (${buf.length} байт)`);
    writeFileSync(mp3 + '.part', buf); renameSync(mp3 + '.part', mp3);   // неполная загрузка никогда не попадает в кэш
    rmSync(json, { force: true });
    generated++;
    console.log(`${(buf.length / 1024).toFixed(0)} KB`);
  }
  let meta = existsSync(json) ? JSON.parse(readFileSync(json, 'utf8')) : null;
  if (!meta || meta.v !== META_V) {   // анализ устарел/отсутствует — пересчитать локально (транскрипт сохраняем, API не трогаем)
    meta = { model: MODEL, voice, text: l.text, ...analyse(mp3), ...(meta && meta.transcript != null ? { transcript: meta.transcript } : {}) };
    writeFileSync(json, JSON.stringify(meta, null, 1));
  }
  clips.push({ line: l, hash, mp3, json, meta });
}
if (placeholders) warn(`${NO_API ? 'режим без API' : 'нет ключа TTS'} — ${placeholders} реплик без аудио (субтитры и рот по оценке длительности). ` +
  `Ключ OPENROUTER_API_KEY или FISH_AUDIO_API_KEY в .env и node --env-file=.env voice/build.mjs --ep ${ep} сгенерирует только недостающие`);

// ---------- 2) --check: speech-to-text новых клипов, diff со словами реплики ----------
if (CHECK) {
  for (const c of clips) {
    if (c.meta.transcript != null || c.meta.placeholder) continue;
    const wav = spawnSync('ffmpeg', ['-hide_banner', '-nostdin', '-v', 'error', '-i', c.mp3, '-ar', '16000', '-ac', '1', '-c:a', 'pcm_s16le', '-f', 'wav', 'pipe:1'], { maxBuffer: 1 << 26 });
    if (wav.status !== 0) throw new Error(`ffmpeg wav для --check: ${wav.stderr}`);
    try {
      const res = await api('transcriptions', { model: 'openai/gpt-transcribe', input_audio: { data: wav.stdout.toString('base64'), format: 'wav' }, language: 'ru' });
      c.meta.transcript = String((await res.json()).text ?? '');
      writeFileSync(c.json, JSON.stringify(c.meta, null, 1));
    } catch (e) { warn(`${c.line.id}: транскрипция не удалась — ${e.message}`); continue; }
  }
  for (const c of clips) {
    if (c.meta.transcript == null) continue;
    const want = norm(spoken(c.line.text).join(' ')), got = norm(c.meta.transcript);
    if (want.join(' ') === got.join(' ')) { console.log(`check ${c.line.id}: ok  «${c.meta.transcript}»`); continue; }
    // LCS-diff по словам: «-» ожидалось, но не услышано; «+» услышано лишнее
    const n = want.length, m = got.length, L = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = want[i] === got[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    const d = []; let i = 0, j = 0;
    while (i < n || j < m) {
      if (i < n && j < m && want[i] === got[j]) { d.push(want[i]); i++; j++; }
      else if (j < m && (i >= n || L[i][j + 1] >= L[i + 1][j])) d.push(`+${got[j++]}`);
      else d.push(`-${want[i++]}`);
    }
    console.log(`check ${c.line.id}: РАСХОЖДЕНИЕ  ${d.join(' ')}\n   текст:      «${spoken(c.line.text).join(' ')}»\n   услышано:   «${c.meta.transcript}»`);
  }
}

// ---------- 3) тайминги слов, окна рта, субтитры → voice.js ----------
const lines = [], subs = [];
const sorted = [...clips].sort((a, b) => a.line.t - b.line.t);
for (const [k, c] of sorted.entries()) {
  const { line: l, meta } = c;
  const said = spoken(l.text), shown = l.sub ? l.sub.trim().split(/\s+/) : said;
  let words = wordTimes(said, meta.speech, l.t);
  if (shown !== said) {
    if (shown.length === said.length) words = words.map(([, t], i) => [shown[i], t]);
    else { warn(`${l.id}: в sub ${shown.length} слов, в text ${said.length} — раскладываю слова sub по их слогам`); words = wordTimes(shown, meta.speech, l.t); }
  }
  const talk = meta.speech.map(([a, b]) => [r3(l.t + a), r3(l.t + b)]);
  const end = r3(l.t + meta.dur);
  const next = sorted.slice(k + 1).find(x => x.line.who === l.who);
  if (next && end > next.line.t) warn(`${l.id} (${l.who}) кончается в ${end}, а ${next.line.id} того же персонажа начинается в ${next.line.t} — наложение ${r3(end - next.line.t)} с`);
  if (end > TL.duration) warn(`${l.id} кончается в ${end} > duration ${TL.duration}`);
  lines.push({ id: l.id, who: l.who, t: l.t, dur: meta.dur, file: meta.placeholder ? null : `episodes/${ep}/voice/${c.hash}.mp3`, words, talk });
  const phrases = chunk(words, l.split);
  const lineEnd = Math.min(talk[talk.length - 1][1] + SUB_HOLD, sorted[k + 1] ? sorted[k + 1].line.t : Infinity, TL.duration);
  phrases.forEach((ws, i) => {
    const from = ws[0][1], to = phrases[i + 1] ? phrases[i + 1][0][1] : r3(Math.max(lineEnd, from + 0.3));
    const text = ws.map(w => w[0]).join(' ');
    if (text.length > SUB_CHARS) warn(`${l.id}: фраза «${text}» длиннее ${SUB_CHARS} символов — не влезет в строку (задай split или sub)`);
    subs.push({ from, to, who: l.who, words: ws });
  });
}
// литерал в одну строку: { id: 'l1', words: [['Так,', 0.61], …] } — ключи без кавычек, строки через JSON (кавычки внутри слов экранированы)
const lit = v => Array.isArray(v) ? `[${v.map(lit).join(', ')}]`
  : v && typeof v === 'object' ? `{ ${Object.entries(v).map(([k, x]) => `${k}: ${lit(x)}`).join(', ')} }` : JSON.stringify(v);
const js = `// Сгенерировано voice/build.mjs из TIMELINE.voice — не редактировать руками (правь timeline.js и пересобирай).
// lines: t/dur — секунды; words — [[слово, момент появления]…]; talk — речевые окна (рот шевелится); file: null — заглушка без аудио (нет ключа TTS).
// subs — фразы субтитров (≤${SUB_WORDS} слов / ≤${SUB_CHARS} символов), используются, если в TIMELINE нет своих subs.
const VOICE = {
  lines: [
${lines.map(l => '    ' + lit(l) + ',').join('\n')}
  ],
  subs: [
${subs.map(s => '    ' + lit(s) + ',').join('\n')}
  ],
};
`;
writeFileSync(path.join(epDir, 'voice.js'), js);

// ---------- 4) стем диалога: episodes/<ep>/voice/mix.wav ----------
const total = Math.round(TL.duration * SR);
const real = sorted.filter(c => !c.meta.placeholder);   // заглушки без аудио в стем не идут
const chains = real.map((c, i) => `[${i}:a]aresample=${SR},volume=${c.meta.gain.toFixed(2)}dB,pan=stereo|c0=c0|c1=c0,adelay=${Math.round(c.line.t * SR)}S:all=1[s${i}]`);
const mixIn = real.length ? `${real.map((_, i) => `[s${i}]`).join('')}amix=inputs=${real.length}:normalize=0:duration=longest:dropout_transition=0` : `anullsrc=r=${SR}:cl=stereo`;
const filter = [...chains, `${mixIn},alimiter=limit=${CEILING}:attack=2:release=60:level=disabled,apad=whole_len=${total},atrim=end_sample=${total},aresample=${SR}[out]`].join(';');
const mix = path.join(cacheDir, 'mix.wav');
ff([...real.flatMap(c => ['-i', c.mp3]), '-filter_complex', filter, '-map', '[out]', '-ar', SR, '-ac', 2, '-c:a', 'pcm_s16le', mix], 'mix');
console.log(`voice: ${lines.length} реплик (${generated} новых${placeholders ? `, ${placeholders} без аудио` : ''}), ${subs.length} фраз → episodes/${ep}/voice.js, ${path.relative(root, mix)}`);
