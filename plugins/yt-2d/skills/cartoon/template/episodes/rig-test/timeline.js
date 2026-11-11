// ─── «rig-test» — тест рига в полный рост (этап 2): болванчик в тестовой комнате, 1920×1080 ───
// Техническая сцена, не контент. Шаг 2.1: стоит (общий план + средний план).
const TIMELINE = {
  duration: 4.0,
  frame: { w: 1920, h: 1080 },
  scripts: ['episodes/rig-test/art/testroom.js', 'episodes/rig-test/art/dummy.js'],
  stage: { back: 'testroomBack' },
  shots: [
    { id: 'W', set: 'stage', from: 0, to: 2.0, cast: ['dummy'], cam: [[0, 360, 860, 1.0], [2.0, 360, 856, 1.03]] },
    { id: 'M', set: 'stage', from: 2.0, to: 4.0, cast: ['dummy'], cam: [[2.0, 360, 760, 1.6], [4.0, 360, 756, 1.66]] },
  ],
  cast: {
    dummy: {
      poses: {
        L: [{ t: 0, pose: 'hang' }],
        R: [{ t: 0, pose: 'hang' }],
        head: [{ t: 0, tilt: 0 }],
        legs: [{ t: 0, pose: 'stand' }],
      },
    },
  },
};
