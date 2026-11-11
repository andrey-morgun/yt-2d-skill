// ─── «hd-test-c» — третья сцена тестового шоу shows/hd-test (этап 1.3): блэкаут → общий план, 4.51 с ───
// Длительность НАРОЧНО не кратна кадру (4.51 с → 135 кадров = 4.5 с): звук сцены должен обрезаться по видео, а не уплыть.
const TIMELINE = {
  duration: 4.51,
  frame: { w: 1920, h: 1080 },
  stage: { preset: 'garage3' },
  shots: [
    { id: 'B1', set: 'stage', from: 0,   to: 2.0,  cast: ['tolyan', 'sanek', 'palych'], cam: [[0, 237, 720, 1.5], [2.0, 237, 716, 1.56]], mode: 'blackout' },
    { id: 'W1', set: 'stage', from: 2.0, to: 4.51, cast: ['tolyan', 'sanek', 'palych'], cam: [[2.0, 360, 730, 1.22], [4.51, 360, 724, 1.27]] },
  ],
  subs: [{ from: 2.3, to: 4.4, words: [['Scene', 2.3], ['three.', 2.8]] }],
  talk: [[2.3, 3.4, 'palych']],
  env: { lamp: [{ t: 0, swing: 0, bright: 1 }], breaker: [{ t: 0, v: 0 }], kettleOn: [{ t: 0, v: 0 }], plug: [{ t: 0, v: -1 }], mugs: [{ t: 0, v: 0 }], laptopOn: [{ t: 0, v: true }] },
  cast: {
    tolyan: { poses: { L: [{ t: 0, pose: 'hold', prop: 'kettle' }], R: [{ t: 0, pose: 'typing', jiggle: 0 }], head: [{ t: 0, tilt: 0 }] } },
    palych: { poses: { L: [{ t: 0, pose: 'rest' }, { t: 2.3, pose: 'spread' }], R: [{ t: 0, pose: 'typing' }], head: [{ t: 0, tilt: 0 }] } },
    sanek:  { poses: { L: [{ t: 0, pose: 'phoneWaist' }], R: [{ t: 0, pose: 'typing', jiggle: 0 }], head: [{ t: 0, tilt: 0 }] } },
  },
};
