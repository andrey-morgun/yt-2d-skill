// ─── Timeline эпизода «hd-test» — технический тест горизонтального кадра 1920×1080 (этап 1) ──────────────
// Не контент: существующий гараж garazh и трое героев, камеры сырыми координатами (пресеты камер — под вертикаль, этап 5).
// Проверяет: размер кадра из TIMELINE.frame, камеру, зерно/плёнку, субтитры и бейдж, блэкаут в широком кадре.
// Мир гаража — x −440…1160, y −40…1320: при s < 1.2 по бокам кадра виден край мира.
const TIMELINE = {
  duration: 12.0,
  frame: { w: 1920, h: 1080 },
  stage: { preset: 'garage3' },

  shots: [
    { id: 'W1', set: 'stage', from: 0,    to: 3.5,  cast: ['tolyan', 'sanek', 'palych'], cam: [[0, 360, 730, 1.22], [3.5, 360, 724, 1.27]] },
    { id: 'T1', set: 'stage', from: 3.5,  to: 6.0,  cast: ['tolyan', 'palych'], cam: [[3.5, 237, 698, 1.7], [6.0, 239, 692, 1.78]] },
    { id: 'C1', set: 'stage', from: 6.0,  to: 8.5,  cast: ['palych'], cam: [[6.0, 362, 600, 2.4], [8.5, 362, 596, 2.5]], shakeIn: 6 },
    { id: 'B1', set: 'stage', from: 8.5,  to: 10.5, cast: ['tolyan', 'sanek', 'palych'], cam: [[8.5, 237, 720, 1.5], [10.5, 237, 716, 1.56]], mode: 'blackout' },
    { id: 'T2', set: 'stage', from: 10.5, to: 12.0, cast: ['sanek', 'palych'], cam: [[10.5, 511, 698, 1.7], [12.0, 509, 692, 1.78]] },
  ],

  subs: [
    { from: 0.4, to: 2.4, words: [['Testing', 0.4], ['the', 0.9], ['horizontal', 1.1], ['frame.', 1.7]] },
    { from: 3.7, to: 5.8, words: [['Sixteen', 3.7], ['by', 4.2], ['nine,', 4.4], ['nineteen-twenty', 4.8], ['wide.', 5.3]] },
    { from: 6.3, to: 8.3, words: [['Close-up', 6.3], ['holds', 6.9], ['up.', 7.3]] },
  ],
  talk: [[0.4, 2.2, 'palych'], [3.7, 5.6, 'tolyan'], [6.3, 7.8, 'palych']],

  badges: [
    { from: 0.5, to: 3.5, name: 'PALYCH', role: 'CEO · VISIONARY · GARAGE', color: '#c96a5a', x: 60, y: 60, rot: -3 },
  ],

  env: {
    lamp: [{ t: 0, swing: 0, bright: 1 }],
    breaker: [{ t: 0, v: 0 }],
    kettleOn: [{ t: 0, v: 0 }],
    plug: [{ t: 0, v: -1 }],
    mugs: [{ t: 0, v: 0 }],
    laptopOn: [{ t: 0, v: true }],
  },

  cast: {
    palych: {
      poses: {
        L: [{ t: 0, pose: 'rest' }, { t: 0.3, pose: 'fingerUp' }, { t: 2.2, pose: 'rest' }, { t: 6.3, pose: 'spread' }, { t: 8.0, pose: 'rest' }],
        R: [{ t: 0, pose: 'typing' }],
        head: [{ t: 0, tilt: 0 }, { t: 0.3, pose: 'left' }, { t: 2.2, pose: 'level' }, { t: 7.0, pose: 'nod' }],
      },
      tracks: { gaze: [{ t: 0, v: [0, .7] }, { t: 3.5, v: [-1, .3], dur: .3 }, { t: 6.0, v: [0, 0] }] },
    },
    tolyan: {
      poses: {
        L: [{ t: 0, pose: 'hold', prop: 'kettle' }],
        R: [{ t: 0, pose: 'typing', jiggle: 0 }, { t: 4.4, pose: 'thumbsUp' }],
        head: [{ t: 0, tilt: 0 }, { t: 3.8, pose: 'nod' }],
      },
      tracks: { look: [{ t: 0, v: .4 }] },
    },
    sanek: {
      poses: {
        L: [{ t: 0, pose: 'phoneWaist' }, { t: 10.6, pose: 'phoneUp' }],
        R: [{ t: 0, pose: 'typing', jiggle: 0 }],
        head: [{ t: 0, tilt: 0 }],
      },
      tracks: { gaze: [{ t: 0, v: [0, 1] }, { t: 10.6, v: [0, -1], dur: .2 }] },
    },
  },
};
