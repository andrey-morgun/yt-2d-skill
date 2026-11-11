// node new-episode.mjs <name> [--preset garage3|garage1|blank]  — создаёт episodes/<name>/ из episodes/_template/<preset>
//   garage3 (по умолчанию) — РАБОЧИЙ эпизод на 10 с: трое в гараже (Толян, Палыч, Санёк), чат Claude, крупный план;
//                            всё на пресетах (stage/cam/pose), 3 реплики-заготовки — перепиши под свой сюжет
//   garage1                — один персонаж за столом в гараже, чат, крупный план (8 с)
//   blank                  — минимальный одиночный путь (сет garage, сырые координаты), как эпизод tolyan
// Имя: латиница/цифры/дефис/подчёркивание. Существующий эпизод не трогает. Ключ TTS для стиллов/превью не нужен.
import { cpSync, existsSync, readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dir = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const pi = args.indexOf('--preset');
const preset = pi >= 0 ? args[pi + 1] : 'garage3';
const name = args.filter((a, i) => pi < 0 || (i !== pi && i !== pi + 1))[0];
const tplRoot = path.join(dir, 'episodes', '_template');
const presets = readdirSync(tplRoot).filter(d => statSync(path.join(tplRoot, d)).isDirectory());
const usage = () => { console.error(`usage: node new-episode.mjs <name> [--preset ${presets.join('|')}]   (имя: латиница, цифры, - и _; не с подчёркивания)`); process.exit(1); };
if (!name || !/^[\w-]+$/.test(name) || name.startsWith('_')) usage();
if (!preset) { console.error('--preset требует значение'); usage(); }
if (!presets.includes(preset)) { console.error(`неизвестный пресет "${preset}"`); usage(); }
const src = path.join(tplRoot, preset), dst = path.join(dir, 'episodes', name);
if (existsSync(dst)) { console.error(`episodes/${name} уже существует — не перезаписываю`); process.exit(1); }
cpSync(src, dst, { recursive: true });
for (const f of readdirSync(dst)) {
  const p = path.join(dst, f);
  if (statSync(p).isFile()) writeFileSync(p, readFileSync(p, 'utf8').replaceAll('__NAME__', name));
}
console.log(`episodes/${name}/ создан из пресета ${preset}: ${readdirSync(dst).join(', ')}
  стиллы:  FRAMES_DIR=/tmp/rv node render.mjs --ep ${name} --stills 1.0,3.5,5.8,7.5
  превью:  node render.mjs --ep ${name} /tmp/${name}.mp4 --preview --sfx
  финал:   node --env-file=.env render.mjs --ep ${name} out/${name}_v1.mp4 --final --voice --sfx`);
