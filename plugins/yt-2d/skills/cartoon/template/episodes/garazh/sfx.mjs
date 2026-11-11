// Фоли-кью эпизода «garazh» — «Какой миллион». Сухое мультяшное фоли, ночной гараж, deadpan.
// ВСЕ моменты берутся из TIMELINE (env-треки, shots, badges, cast.*.poses/tracks/events, chatSchedule):
// сдвинул событие — звук переехал. Литералы — только художественные смещения внутри события, уровни и питчи.
// Диалог (−16 LUFS) приглушает фоли автоматически (−6 dB), поэтому все кью тихие и «сухие».
import { createRequire } from 'node:module';
const { chatSchedule } = createRequire(import.meta.url)('../../src/sets/chat.js');

export const SAMPLE_RATE = 48000;
export const PEAK_CEILING_DB = -3;

export function cues(TL) {
  const D = TL.duration, ENV = TL.env, C = TL.cast;
  const r = x => Math.round(x * 1000) / 1000;
  const ev = chatSchedule(TL.chat).events;
  const tr = (name, f) => ENV[name].filter(f).map(e => e.t);

  // ── env-треки → окна ──────────────────────────────────────────────────────
  // окна света (автомат не выбит): [0, trip1], [back1, trip2], …, [backN, конец]
  const lit = []; let from = 0;
  for (const e of ENV.breaker) {
    if (e.v === 1) { lit.push([from, e.t]); from = null; } else if (e.t > 0) from = e.t;
  }
  if (from !== null) lit.push([from, D]);
  const trips = tr('breaker', e => e.v === 1);                     // ЩЁЛК автомата
  const returns = tr('breaker', e => e.v === 0 && e.t > 0);        // свет вернулся
  // чайник: [включили, выключили/конец]
  const kettles = ENV.kettleOn.flatMap((e, i, a) => e.v === 1 ? [[e.t, a[i + 1] ? a[i + 1].t : D]] : []);
  const beepT = ENV.laptopOn.filter(e => e.v === true && e.t > 0).map(e => r(e.t + 0.15));   // «бип» чуть после света
  // мерцание лампы: короткие провалы яркости (полный обрыв bright 0 — это сам ЩЁЛК)
  const flicks = ENV.lamp.filter(e => e.bright > 0 && e.bright <= 0.35 && e.dur <= 0.1).map(e => e.t);
  const lampBack = ENV.lamp.filter((e, i, a) => i > 0 && e.bright === 1 && a[i - 1].bright > 0 && a[i - 1].bright <= 0.35 && e.t > 15).map(e => e.t); // одиночное мерцание → «дзынь»
  const plugIn = ENV.plug.filter(e => e.v === 1).map(e => r(e.t + (e.dur || 0)));   // вилка вошла (v достигло 1)
  const mugT = ENV.mugs.filter(e => e.v === 1).map(e => e.t);

  // ── позы → большие жесты (шорох ткани); мгновенные (dur 0) и щелчки пальцем (dur < .1) пропускаем ──
  const big = ['fingerUp', 'point', 'spread'];
  const moves = (arr, ok = h => big.includes(h)) => arr.filter((p, i) => i > 0 && p.dur !== 0 && !(p.dur < 0.1) && ok(p.hand)).map(p => p.t);
  const pal = moves(C.palych.poses.L);
  const tol = [...moves(C.tolyan.poses.L), ...moves(C.tolyan.poses.R, h => h === 'point')].sort((a, b) => a - b);
  const tolKiss = moves(C.tolyan.poses.L, h => h === 'kiss');
  const sanek = moves(C.sanek.poses.L, h => h === 'phone');
  const fingerUp = C.palych.poses.L.filter(p => p.hand === 'fingerUp').map(p => p.t);
  const thumbsUp = C.tolyan.poses.R.find(p => p.hand === 'thumbsUp').t;

  // ── чат ──────────────────────────────────────────────────────────────────
  const evT = (kind, f = () => true) => ev.filter(e => e.kind === kind && f(e)).map(e => e.t);
  const typing = [];   // «печатает…»: тики в окне [a,b)
  evT('typingStart').forEach((a, i) => { const b = evT('typingEnd')[i]; for (let x = a; x < b - 1e-9; x += 0.22) typing.push(r(x)); });
  const progStart = evT('progressStart')[0];
  const progEnd = trips.find(t => t > progStart);                    // тики идут до ЩЁЛКа и обрываются
  const prog = []; { let x = progStart, g = 0.15; while (x < progEnd - 0.03) { prog.push(r(x)); x += g; g = Math.max(0.045, g * 0.9); } }
  const progDb = prog.map((_, i) => -27 + 11 * i / (prog.length - 1));   // ускоряются и нарастают

  const matchDrop = C.tolyan.events.matchDrop;
  const glassesOn = C.palych.tracks.glasses.filter((e, i, a) => e.v === 1 && i > 0 && a[i - 1].v < 1 && e.dur > 0).map(e => r(e.t + e.dur));
  const blissStart = C.tolyan.events.bliss[0][0];

  return [
    // --- фон: гул (окна света) + сверчки (всё время; в темноте — одни сверчки)
    ...lit.map(([a, b], i) => ({ id: `hum${i}`, type: 'garageHum', t: a, dur: r(b - a), db: -24 })),
    { id: 'crickets', type: 'crickets', t: 0, dur: D, db: -36 },

    // --- шорох ткани на больших жестах
    { id: 'tickUp',   type: 'tick',   t: fingerUp, db: -17, pan: -0.1 },
    { id: 'wooshPal', type: 'whoosh', t: pal, db: -19, pan: -0.05, f: 1500, w: 1800, rates: [1, 0.92, 1.06] },
    { id: 'wooshTol', type: 'whoosh', t: tol, db: -20, pan: -0.45, f: 1200, w: 1600, rates: [1, 0.9, 1.08] },
    { id: 'wooshKis', type: 'whoosh', t: tolKiss, db: -22, pan: -0.45, f: 900, w: 1300 },   // тянет вилку к розетке
    { id: 'wooshSan', type: 'whoosh', t: sanek, db: -24, pan: 0.45, f: 1700, w: 2000 },                       // Санёк двигает телефон

    // --- бейджи
    { id: 'badges', type: 'bloop', t: TL.badges.map(b => b.from), db: -10 },

    // --- чайник: кнопка, нарастающий гул, финальный тихий свисток
    { id: 'kClick', type: 'kettleClick', t: kettles.map(k => k[0]), db: -13, pan: -0.5 },
    ...kettles.map(([a, b], i) => i < kettles.length - 1
      ? { id: `kHum${i}`, type: 'kettleHum', t: r(a + 0.03), dur: r(b - a - 0.03), db: -26, pan: -0.5, f0: 140, f1: 400 }
      : { id: `kHum${i}`, type: 'kettleHum', t: r(a + 0.08), dur: r(b - a - 0.08), db: -29, pan: -0.5, f0: 120, f1: 260 }),   // финал: мягко растёт до конца
    { id: 'kWhistle', type: 'kettleWhistle', t: r(blissStart + 1.2), dur: r(D - blissStart - 1.2), db: -34, pan: -0.4 },

    // --- автомат: мерцание → ЩЁЛК (комедийный удар) → свет возвращается («дзынь» + «бип» ноута)
    { id: 'flick',    type: 'lampFlick', t: flicks, db: -19 },
    { id: 'breaker',  type: 'breakerThunk', t: trips, db: -4 },
    { id: 'lampDing', type: 'lampDing', t: [...returns, ...lampBack], dbs: [-16, -16, -22], db: -16 },
    { id: 'beep',     type: 'laptopBeep', t: beepT, db: -19, pan: 0.1 },

    // --- чат
    { id: 'keys',     type: 'textTick', t: evT('key', e => e.ch !== ' '), db: -23, jitter: { gain: 3, rate: 0.15 } },
    { id: 'send',     type: 'pip',   t: evT('send'), db: -22, rates: [0.8] },
    { id: 'typing',   type: 'blip',  t: typing, rates: [1, 1.12, 1.26], db: -25 },
    { id: 'pip',      type: 'pip',   t: evT('pop'), db: -17 },
    { id: 'click',    type: 'click', t: evT('click'), db: -14 },
    { id: 'progress', type: 'progTick', t: prog, dbs: progDb },

    // --- мелочи
    { id: 'glasses', type: 'glassesClick', t: glassesOn, db: -20, pan: 0.05 },   // очки на нос (в шоке — тихо)
    { id: 'match',   type: 'woodTick', t: [matchDrop[0], r(matchDrop[0] + 0.17)], rates: [1, 0.82], dbs: [-20, -24], db: -20, pan: -0.4 },
    { id: 'plug',    type: 'plugClick', t: plugIn, db: -14, pan: -0.5 },
    { id: 'mugs',    type: 'mugClink', t: mugT.flatMap(t => [0, 0.11, 0.23].map(d => r(t + d))), rates: [1, 1.18, 0.9], dbs: [-15, -18, -17], db: -15 },

    // --- финал: thumbsUp — мягкий «динь»
    { id: 'ding',    type: 'ding',  t: thumbsUp, db: -18 },
  ];
}
