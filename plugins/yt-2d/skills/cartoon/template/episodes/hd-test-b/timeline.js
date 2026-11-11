// ─── «hd-test-b» — вторая сцена тестового шоу shows/hd-test (этап 1.3): крупный план Толяна → двушка Санёк+Палыч, 6 с ───
const TIMELINE = {
  duration: 6.0,
  frame: { w: 1920, h: 1080 },
  stage: { preset: 'garage3' },
  shots: [
    { id: 'C1', set: 'stage', from: 0,   to: 3.0, cast: ['tolyan'], cam: [[0, 112, 700, 2.2], [3.0, 112, 696, 2.3]], shakeIn: 6 },
    { id: 'T1', set: 'stage', from: 3.0, to: 6.0, cast: ['sanek', 'palych'], cam: [[3.0, 511, 698, 1.7], [6.0, 509, 692, 1.78]] },
  ],
  subs: [{ from: 0.6, to: 2.6, words: [['Scene', 0.6], ['two.', 1.2]] }, { from: 3.4, to: 5.6, words: [['Same', 3.4], ['garage.', 3.9]] }],
  talk: [[0.6, 1.8, 'tolyan'], [3.4, 4.6, 'sanek']],
  env: { lamp: [{ t: 0, swing: 0, bright: 1 }], breaker: [{ t: 0, v: 0 }], kettleOn: [{ t: 0, v: 0 }], plug: [{ t: 0, v: -1 }], mugs: [{ t: 0, v: 0 }], laptopOn: [{ t: 0, v: true }] },
  cast: {
    tolyan: { poses: { L: [{ t: 0, pose: 'hold', prop: 'kettle' }], R: [{ t: 0, pose: 'down' }], head: [{ t: 0, tilt: 0 }, { t: 1.2, pose: 'nod' }] } },
    palych: { poses: { L: [{ t: 0, pose: 'rest' }], R: [{ t: 0, pose: 'typing' }], head: [{ t: 0, tilt: 0 }] } },
    sanek:  { poses: { L: [{ t: 0, pose: 'phoneWaist' }], R: [{ t: 0, pose: 'typing', jiggle: 0 }], head: [{ t: 0, tilt: 0 }] } },
  },
};
