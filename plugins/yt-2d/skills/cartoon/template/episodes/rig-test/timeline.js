// ─── «rig-test» — тест рига в полный рост (этап 2): болванчик в тестовой комнате, 1920×1080 ───
// Техническая сцена, не контент. 2.1: стоит; 2.2: садится на ящик (2 с) и встаёт (4 с);
// 2.3: второй шот — входит слева из-за кадра, проходит через кадр и уходит вправо (камера стоит).
const TIMELINE = {
  duration: 14.0,
  frame: { w: 1920, h: 1080 },
  scripts: ['episodes/rig-test/art/testroom.js', 'episodes/rig-test/art/dummy.js'],
  stage: { back: 'testroomBack' },
  shots: [
    { id: 'W', set: 'stage', from: 0, to: 6.0, cast: ['dummy'], cam: [[0, 360, 860, 1.0], [6.0, 360, 860, 1.0]] },
    { id: 'Walk', set: 'stage', from: 6.0, to: 14.0, cast: ['dummy'], cam: [[6.0, 360, 860, 1.0], [14.0, 360, 860, 1.0]] },
  ],
  env: { box: [{ t: 0, v: [205, 515, 1166] }, { t: 6.0, v: null }] },
  cast: {
    dummy: {
      poses: {
        L: [{ t: 0, pose: 'hang' }],
        R: [{ t: 0, pose: 'hang' }],
        head: [{ t: 0, tilt: 0 }],
        legs: [{ t: 0, pose: 'stand' }, { t: 2.0, pose: 'sit', dur: .6 }, { t: 4.0, pose: 'stand', dur: .6 }],
      },
      // путь: стоит в x 0; к шоту Walk переставлен за левый край кадра; идёт вправо через весь кадр и уходит
      path: [{ t: 0, x: 0 }, { t: 6.0, x: -1150, dur: 0 }, { t: 6.3, x: 1900, dur: 7.4 }],
      tracks: { turn: [{ t: 0, v: 0 }, { t: 6.0, v: .75, dur: 0 }] },
    },
  },
};
