// Фоли эпизода «__NAME__» (стартер garage3). cues(TL, VOICE): TL — TIMELINE из ./timeline.js, VOICE — озвучка из ./voice.js
// (null, пока не собрана). ВСЕ моменты берём из TL: сдвинул позу/реплику — звук переехал. Литералы — только уровни и смещения.
// Рецепты (type) — sfx/build.mjs RECIPES: garageHum crickets tick whoosh bloop pip blip textTick click ding kettleClick kettleHum
// breakerThunk lampFlick lampDing laptopBeep progTick plugClick mugClink glassesClick kettleWhistle woodTick mwah boom fanfare…
import { createRequire } from 'node:module';
const { chatSchedule } = createRequire(import.meta.url)('../../src/sets/chat.js');

export const SAMPLE_RATE = 48000;
export const PEAK_CEILING_DB = -3;

export function cues(TL, VOICE) {
  const D = TL.duration, C = TL.cast, ENV = TL.env;
  const r = x => Math.round(x * 1000) / 1000;
  const ev = chatSchedule(TL.chat || []).events, evT = kind => ev.filter(e => e.kind === kind).map(e => e.t);
  // ключи поз: пресеты { pose } и сырые { hand } — имя жеста = pose || hand; мгновенные (dur 0) и короткие — не шуршат
  const name = p => p.pose || p.hand;
  const moves = (arr, ok) => (arr || []).filter((p, i) => i > 0 && p.dur !== 0 && !(p.dur < .1) && ok(name(p))).map(p => p.t);
  const big = ['fingerUp', 'point', 'spread', 'reach', 'phoneUp', 'phoneChin', 'thumbsUp'];
  const gest = Object.values(C).flatMap(c => [...moves(c.poses.L, h => big.includes(h)), ...moves(c.poses.R, h => big.includes(h))]).sort((a, b) => a - b);
  const kettleOn = (ENV.kettleOn || []).filter(e => e.v === 1).map(e => e.t);
  // n-е вхождение слова из озвучки (VOICE.lines[].words) — для ударов точно на слово
  const word = (text, n = 0) => { const w = (VOICE ? VOICE.lines : []).flatMap(l => l.words).filter(w => w[0].replace(/[.,!?…—]/g, '') === text)[n]; return w ? w[1] : null; };

  return [
    { id: 'hum',      type: 'garageHum', t: 0, dur: D, db: -24 },                 // фон: гул гаража
    { id: 'crickets', type: 'crickets',  t: 0, dur: D, db: -36 },                 // сверчки за окном
    { id: 'badges',   type: 'bloop',     t: TL.badges.map(b => b.from), db: -10 },   // поп плашек
    { id: 'gest',     type: 'whoosh',    t: gest, db: -20, f: 1400, w: 1700, rates: [1, .92, 1.06] },   // шорох больших жестов
    { id: 'keys',     type: 'textTick',  t: evT('key'), db: -23, jitter: { gain: 3, rate: .15 } },      // клавиши чата
    { id: 'send',     type: 'pip',       t: evT('send'), db: -22, rates: [.8] },
    { id: 'pop',      type: 'pip',       t: evT('pop'), db: -17 },                                       // сообщение Claude
    { id: 'kettle',   type: 'kettleClick', t: kettleOn, db: -13, pan: -.5 },                             // кнопка чайника
    ...(word('Чай') != null ? [{ id: 'ding', type: 'ding', t: r(word('Чай') + .05), db: -18 }] : []),  // мягкий «динь» на панчлайн
  ];
}
