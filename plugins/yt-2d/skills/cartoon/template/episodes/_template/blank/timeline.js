// ─── Timeline эпизода «__NAME__» ───────────────────────────────────────────
// Единственный источник правды по таймингам: картинка (render(t)) и фоли (sfx.mjs) читают только этот объект.
// Файл — чистые литералы (без функций/переменных): его же читает node:vm в sfx/build.mjs и voice/build.mjs.
const TIMELINE = {
  duration: 8.0,                      // секунды; кадров = duration × 30
  // scripts: ['episodes/__NAME__/sets/bar.js'],   // доп. сеты/персонажи эпизода (пути от корня проекта), грузятся после общих
  // Несколько персонажей в кадре: set 'stage' + cast/env/stage (реестр CHARS, пропы PROPS, блэкаут) — pipeline.md §3.7.
  // Готовые раскладки/камеры/позы (stage.preset, cam:'cu:tolyan', pose:'fingerUp') — стартеры garage3/garage1 и pipeline.md «Пресеты»
  // Кадры. set — имя из реестра SETS (общие: garage, screen); cam: [[t, cx, cy, scale], [t, cx, cy, scale]] — плавный наезд
  // между двумя ключами (easeInOut); rainbow: true — крупный план с радужной подсветкой и шоком; shakeIn: px — тряска на входе
  shots: [
    { id: 'wide', set: 'garage', from: 0.0, to: 8.0, cam: [[0, 360, 690, 1.2], [8.0, 364, 676, 1.3]] },
  ],
  // озвучка (опц., см. pipeline.md «Озвучка»): voice/build.mjs → voice.js + voice/mix.wav; render.mjs --voice подмешивает.
  // Если subs/talk ниже убрать, они выводятся из озвучки (фразы ≤3 слов / ≤24 символов, рот по речевым окнам).
  // voice: {
  //   cast: { tolyan: '7076e45ce3234fd49ef40ffbd5a3f0cd' },
  //   lines: [{ id: 'l1', t: 0.35, who: 'tolyan', text: '[устало] Так, поехали.', sub: 'Так, поехали.', split: [1, 1] }],
  // },
  // субтитры: words — [[текст, момент появления]...]; последнее появившееся слово подсвечено жёлтым
  subs: [
    { from: 0.35, to: 1.45, words: [['Так.', 0.35], ['поехали', 0.9]] },
  ],
  // окна, когда рот шевелится
  talk: [[0.35, 0.7], [0.9, 1.35]],
  // плашка с именем: from/to, name, role, color, x/y (px сцены), rot (град.)
  badges: [{ from: 0.55, to: 3.0, name: 'ТОЛЯН', role: 'CEO · CTO · QA', color: '#f39a3c', x: 22, y: 186, rot: -4 }],
  // события (все необязательные): blink [t...], kiss [a,b], bliss [a,b], typing/reply/cursor [a,b] (сет screen), click t, boom t, shock [a,b]
  events: {
    blink: [1.25, 5.75],
  },
  // позы рук и головы (риг — src/rig.js). t — старт движения, приезд через dur (по умолчанию .18)
  poses: {
    L: [
      { t: 0,    wrist: [256, 940], hand: 'rest',     rot: -52, layer: 'desk',  bob: 0 },
      { t: 0.30, wrist: [196, 648], hand: 'fingerUp', rot: 0,   layer: 'front', bend: -1, sweep: 1, bob: 1 },
      { t: 1.40, wrist: [256, 940], hand: 'rest',     rot: -52, layer: 'desk',  bob: 0 },
    ],
    R: [
      { t: 0, wrist: [478, 900], hand: 'rest', rot: 30, layer: 'behind', jiggle: 2.5 },   // печатает за ноутом
    ],
    head: [
      { t: 0, tilt: 0 }, { t: 0.30, tilt: -3 }, { t: 1.40, tilt: 0 },
    ],
  },
};
