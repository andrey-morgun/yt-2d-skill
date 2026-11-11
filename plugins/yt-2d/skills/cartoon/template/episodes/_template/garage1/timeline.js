// ─── Timeline эпизода «__NAME__» — стартер garage1: один персонаж за столом в гараже, чат, крупный план ──────
// РАБОЧИЙ ЭПИЗОД-ЗАГОТОВКА (8 с), перепиши под свой сюжет. Только литералы; все тайминги — здесь.
// API пресетов — pipeline.md «Пресеты». Трое в кадре — стартер garage3 (node new-episode.mjs <ep> --preset garage3).
//   стиллы  FRAMES_DIR=/tmp/rv node render.mjs --ep __NAME__ --stills 0.8,2.0,4.0,6.9
//   превью  node render.mjs --ep __NAME__ /tmp/__NAME__.mp4 --preview --sfx
//   финал   node --env-file=.env render.mjs --ep __NAME__ out/__NAME___v1.mp4 --final --voice --sfx
const TIMELINE = {
  duration: 8.0,
  // гараж garazh, один персонаж за столом Палыча (размещение по умолчанию x:0,y:0,s:1 для любого из CHARS).
  // Свой герой: episodes/__NAME__/art/<who>.js (CHARS.<who> = { rig, anchors, body, head }) + scripts: ['episodes/__NAME__/art/<who>.js']
  stage: { preset: 'garage1' },
  shots: [
    { id: 'S1', set: 'stage', from: 0,   to: 3.0, cast: ['tolyan'], cam: 'wide' },                 // просьба + жесты
    { id: 'S2', set: 'chat',  from: 3.0, to: 5.4, cam: 'screen' },                                  // экран: Claude отвечает
    { id: 'S3', set: 'stage', from: 5.4, to: 8.0, cast: ['tolyan'], cam: 'cu:tolyan', shakeIn: 6 }, // реакция крупно → панч → 👍
  ],
  voice: {
    cast: { tolyan: '7076e45ce3234fd49ef40ffbd5a3f0cd' },   // «Харизматичный дед-разработчик»
    lines: [
      { id: 't1', t: 0.35, who: 'tolyan', text: '[устало] Так. Клод. [пауза] Сделай красиво.', sub: 'Так. Claude. Сделай красиво.', split: [1, 1, 2] },
      { id: 't2', t: 6.4,  who: 'tolyan', text: '[зло, после паузы] Ну… красиво.', split: [1, 1] },
    ],
  },
  badges: [{ from: 0.55, to: 3.0, name: 'ТОЛЯН', role: 'CEO · CTO · QA', color: '#f39a3c', x: 22, y: 150, rot: -4 }],
  env: { lamp: [{ t: 0, swing: 0, bright: 1 }], breaker: [{ t: 0, v: 0 }], kettleOn: [{ t: 0, v: 0 }], plug: [{ t: 0, v: -1 }], mugs: [{ t: 0, v: 1 }], laptopOn: [{ t: 0, v: true }] },
  chatStyle: { fs: 27, lh: 34, wrap: 17 },
  chat: [
    { id: 'u1', t: 0.9, from: 'user', text: 'сделай красиво', speed: 14 },   // печатает в S1 (экран не виден), в S2 уже отправлено
    { typing: [3.2, 3.9] },
    { id: 'm1', t: 3.9, from: 'claude', text: 'Готово. Запускаю.', button: 'Запустить' },
    { cursor: [4.3, 4.8], to: 'm1' }, { click: 4.95 },
  ],
  cast: {
    tolyan: {
      poses: {
        L: [
          { t: 0,    pose: 'rest' },
          { t: 0.30, pose: 'fingerUp' },                 // «Так.»
          { t: 0.95, pose: 'point', at: 'laptop' },      // «Claude,» — на ноут
          { t: 1.75, pose: 'spread' },                   // «сделай»
          { t: 2.25, pose: 'kiss' },                     // «красиво» — chef's kiss
          { t: 3.0,  pose: 'down' },                     // под кадр
          { t: 7.3,  pose: 'thumbsUp' },                 // панч: deadpan 👍
        ],
        R: [{ t: 0, pose: 'typing' }],
        head: [{ t: 0, tilt: 0 }, { t: 0.3, pose: 'left' }, { t: 0.95, pose: 'right' }, { t: 2.25, tilt: -6 }, { t: 3.0, pose: 'level' }, { t: 6.4, tilt: 4 }, { t: 7.3, pose: 'nod' }],
      },
      events: { kiss: [[2.3, 2.6]], bliss: [[2.6, 3.0]], shock: [[5.5, 6.2]] },   // шок в крупном плане: спичка падает сама
    },
  },
};
