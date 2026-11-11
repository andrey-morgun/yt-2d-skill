// Фоли-кью эпизода «__NAME__». cues(TL, VOICE): TL — TIMELINE из ./timeline.js (все моменты берём из него),
// VOICE — озвучка из ./voice.js (null, если эпизод без озвучки или она ещё не собрана).
// Поля кью и рецепты (type) описаны в sfx/build.mjs (RECIPES) и в episodes/tolyan/sfx.mjs.
export const SAMPLE_RATE = 48000;
export const PEAK_CEILING_DB = -3;

export function cues(TL, VOICE) {
  const E = TL.events, L = TL.poses.L;
  const r = x => Math.round(x * 1000) / 1000;
  const pose = (hand, n = 0) => L.filter(p => p.hand === hand)[n].t;
  // n-е вхождение слова: из ручных subs или из озвучки (VOICE.lines[].words)
  const word = (text, n = 0) => (TL.subs || (VOICE && VOICE.lines) || []).flatMap(s => s.words).filter(w => w[0] === text)[n][1];

  return [
    { id: 'room',  type: 'room',  t: 0, rms: -32 },                         // фон: ночной гараж
    { id: 'tick',  type: 'tick',  t: pose('fingerUp'), db: -15, pan: -0.15 }, // палец вверх
    { id: 'bloop', type: 'bloop', t: TL.badges[0].from, db: -8 },             // бейдж
    { id: 'ding',  type: 'ding',  t: word('поехали'), db: -16 },
  ];
}
