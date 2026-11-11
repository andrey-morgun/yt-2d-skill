// Фоли эпизода «__NAME__» (стартер garage1). cues(TL, VOICE) — все моменты из TIMELINE; рецепты — sfx/build.mjs RECIPES.
import { createRequire } from 'node:module';
const { chatSchedule } = createRequire(import.meta.url)('../../src/sets/chat.js');

export const SAMPLE_RATE = 48000;
export const PEAK_CEILING_DB = -3;

export function cues(TL, VOICE) {
  const D = TL.duration, L = TL.cast.tolyan.poses.L, shot = id => TL.shots.find(s => s.id === id);
  const r = x => Math.round(x * 1000) / 1000;
  const name = p => p.pose || p.hand;                                              // пресет { pose } или сырой { hand }
  const pose = (n, k = 0) => L.filter(p => name(p) === n)[k].t;                    // старт k-го движения в позу
  const ev = chatSchedule(TL.chat || []).events, evT = kind => ev.filter(e => e.kind === kind).map(e => e.t);
  const word = (text, n = 0) => { const w = (VOICE ? VOICE.lines : []).flatMap(l => l.words).filter(w => w[0].replace(/[.,!?…—]/g, '') === text)[n]; return w ? w[1] : null; };
  const cu = shot('S3');

  return [
    { id: 'hum',      type: 'garageHum', t: 0, dur: D, db: -24 },
    { id: 'crickets', type: 'crickets',  t: 0, dur: D, db: -36 },
    { id: 'tick',     type: 'tick',   t: pose('fingerUp'), db: -15, pan: -.15 },     // палец вверх
    { id: 'woosh',    type: 'whoosh', t: [pose('point'), pose('spread')], db: -20, f: 1400, w: 1700 },
    { id: 'mwah',     type: 'mwah',   t: r(pose('kiss') + .12), db: -12 },           // chef's kiss
    { id: 'badge',    type: 'bloop',  t: TL.badges.map(b => b.from), db: -10 },
    { id: 'keys',     type: 'textTick', t: evT('key'), db: -23, jitter: { gain: 3, rate: .15 } },
    { id: 'pop',      type: 'pip',    t: evT('pop'), db: -17 },
    { id: 'click',    type: 'click',  t: evT('click'), db: -14 },
    { id: 'cut',      type: 'whooshCut', t: cu.from, align: 'end', db: -14 },      // вуш, приземляющийся на склейку в крупный план
    { id: 'thumb',    type: 'ding',   t: pose('thumbsUp'), db: -18 },
    ...(word('красиво', 1) != null ? [{ id: 'punch', type: 'woodTick', t: word('красиво', 1), db: -22 }] : []),
  ];
}
