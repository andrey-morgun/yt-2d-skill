// ─── «rig-test» — тест рига в полный рост (этап 2): болванчик в тестовой комнате, 1920×1080 ───
// Техническая сцена, не контент. 2.1: стоит; 2.2: садится на ящик (2 с) и встаёт (4 с).
const TIMELINE = {
  duration: 6.0,
  frame: { w: 1920, h: 1080 },
  scripts: ['episodes/rig-test/art/testroom.js', 'episodes/rig-test/art/dummy.js'],
  stage: { back: 'testroomBack' },
  shots: [
    { id: 'W', set: 'stage', from: 0, to: 6.0, cast: ['dummy'], cam: [[0, 360, 860, 1.0], [6.0, 360, 860, 1.0]] },
  ],
  env: { box: [{ t: 0, v: [205, 515, 1166] }] },
  cast: {
    dummy: {
      poses: {
        L: [{ t: 0, pose: 'hang' }],
        R: [{ t: 0, pose: 'hang' }],
        head: [{ t: 0, tilt: 0 }],
        legs: [{ t: 0, pose: 'stand' }, { t: 2.0, pose: 'sit', dur: .6 }, { t: 4.0, pose: 'stand', dur: .6 }],
      },
    },
  },
};
