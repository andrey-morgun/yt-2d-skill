// Фоли-кью эпизода. cues(TL) получает TIMELINE из ./timeline.js (загружает sfx/build.mjs через node:vm),
// поэтому ВСЕ моменты берутся из таймлайна: сдвинул позу/событие/слово — звук переехал вместе с ним.
// Ручные литералы остаются только там, где это художественный выбор (смещения внутри события, шаги, уровни).
//
//  id      уникальное имя (и имя временного wav)
//  type    рецепт синтеза в sfx/build.mjs (RECIPES): room tick bloop whoosh mwah sparkle whooshCut blip textTick click boom fanfare slideWhistle woodTick ding
//  t       момент удара, сек; число | [числа]
//  every   вместо t: {from, to, step} → серия ударов
//  align   'end' ⇒ t — момент, когда кью ЗАКАНЧИВАЕТСЯ (вуш, приземляющийся на склейку)
//  db      пиковый уровень кью в dBFS (каждый кью сперва нормируется к 0 dB)
//  pan     -1 (L) .. +1 (R), equal power, по умолчанию 0
//  rates   питч-множители по ударам (массив, циклически); dbs — то же для уровней
//  jitter  {gain: dB, rate: доля} детерминированная рандомизация по ударам (порядок кью важен — общий seed)
//  room:   rms = RMS-уровень фона (dBFS), duck = окно приглушения
export const SAMPLE_RATE = 48000;
export const PEAK_CEILING_DB = -3; // потолок финального alimiter

export function cues(TL) {
  const E = TL.events, L = TL.poses.L, shot = id => TL.shots.find(s => s.id === id);
  const r = x => Math.round(x * 1000) / 1000;                       // 3.15 + .2 → ровно 3.35 (не 3.3499999…)
  const pose = (hand, n = 0) => L.filter(p => p.hand === hand)[n].t; // старт n-го движения в позу hand
  const word = (text, n = 0) => TL.subs.flatMap(s => s.words).filter(w => w[0] === text)[n][1];
  const screen = shot('screen'), face = shot('face');

  return [
    // --- фон: ночной гараж (гул + воздух + сверчки), приглушён под крупным планом ноутбука
    { id: 'room', type: 'room', t: 0, rms: -32,
      duck: { from: screen.from, to: screen.to, level: 0.4, fadeDown: 0.12, fadeUp: 0.3 } },

    // --- вступление
    { id: 'tick',    type: 'tick',    t: pose('fingerUp'), db: -15, pan: -0.15 },   // палец вверх: тик + свист
    { id: 'bloop',   type: 'bloop',   t: TL.badges[0].from, db: -8 },               // бейдж выскакивает
    { id: 'whoosh1', type: 'whoosh',  t: pose('point'),  db: -17, pan: -0.3, f: 1500, w: 1800 },
    { id: 'whoosh2', type: 'whoosh',  t: pose('spread'), db: -17, pan: 0.3,  f: 1100, w: 1500 },

    // --- chef's kiss
    { id: 'mwah',    type: 'mwah',    t: E.kiss[0],  db: -9 },
    { id: 'sparkle', type: 'sparkle', t: E.bliss[0], db: -13, pan: 0.15 },

    // --- жёсткая склейка на ноутбук
    { id: 'cutwhoosh', type: 'whooshCut', t: screen.from, align: 'end', db: -16 },

    // --- крупный план ноутбука
    { id: 'typing',  type: 'blip',    t: [0, .2, .4].map(d => r(E.typing[0] + d)), rates: [1, 1.12, 1.26], db: -21 },
    { id: 'textTick', type: 'textTick', every: { from: E.reply[0], to: E.reply[1], step: 0.04 },
      db: -26, jitter: { gain: 3, rate: 0.12 } },
    { id: 'click',   type: 'click',   t: E.click, db: -12 },

    // --- BOOM + кислотная фанфара (обрывается на склейке кадра)
    { id: 'boom',    type: 'boom',    t: E.boom, db: -5 },
    { id: 'fanfare', type: 'fanfare', t: E.boom, db: -7, pan: 0.2, cutAt: face.from, bpm: 160, root: 523.25 },

    // --- крупный план лица
    { id: 'shock',   type: 'slideWhistle', t: E.shock[0], db: -13 },
    { id: 'match',   type: 'woodTick', t: [.45, .62].map(d => r(E.shock[0] + d)), rates: [1, 0.82], dbs: [-19, -23], db: -19, pan: 0.1 },  // спичка падает на стол

    // --- thumbs up
    { id: 'ding',    type: 'ding',    t: word('красиво', 1), db: -16 },   // второе «красиво» (кивок)
  ];
}
