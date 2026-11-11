// ─── «hd-test-b» — вторая сцена тестового шоу shows/hd-test (этапы 1.3–1.4): крупный план Толяна → двушка Санёк+Палыч, 7 с, английская озвучка ───
const TIMELINE = {
  duration: 7.0,
  frame: { w: 1920, h: 1080 },
  stage: { preset: 'garage3' },
  shots: [
    { id: 'C1', set: 'stage', from: 0,   to: 3.9, cast: ['tolyan'], cam: [[0, 112, 700, 2.2], [3.9, 112, 696, 2.3]], shakeIn: 6 },
    { id: 'T1', set: 'stage', from: 3.9, to: 7.0, cast: ['sanek', 'palych'], cam: [[3.9, 511, 698, 1.7], [7.0, 509, 692, 1.78]] },
  ],
  // английская озвучка (этап 1.4): субтитры и окна рта — из неё; голоса — стоковые Fish для теста, не выбор голосов героев
  lang: 'en',
  voice: {
    cast: { tolyan: 'bf322df2096a46f18c579d0baa36f41d',    // Fish «Adrian» — steady narrator
            sanek:  '536d3a5e000945adb7038665781a4aca' },  // Fish «Ethan» — curious explainer
    lines: [
      { id: 't1', t: 0.4, who: 'tolyan', text: '[dryly] Scene two. The kettle stays.' },
      { id: 's1', t: 4.0, who: 'sanek',  text: 'Same garage, different angle.' },
    ],
  },
  env: { lamp: [{ t: 0, swing: 0, bright: 1 }], breaker: [{ t: 0, v: 0 }], kettleOn: [{ t: 0, v: 0 }], plug: [{ t: 0, v: -1 }], mugs: [{ t: 0, v: 0 }], laptopOn: [{ t: 0, v: true }] },
  cast: {
    tolyan: { poses: { L: [{ t: 0, pose: 'hold', prop: 'kettle' }], R: [{ t: 0, pose: 'down' }], head: [{ t: 0, tilt: 0 }, { t: 1.2, pose: 'nod' }] } },
    palych: { poses: { L: [{ t: 0, pose: 'rest' }], R: [{ t: 0, pose: 'typing' }], head: [{ t: 0, tilt: 0 }] } },
    sanek:  { poses: { L: [{ t: 0, pose: 'phoneWaist' }], R: [{ t: 0, pose: 'typing', jiggle: 0 }], head: [{ t: 0, tilt: 0 }] } },
  },
};
