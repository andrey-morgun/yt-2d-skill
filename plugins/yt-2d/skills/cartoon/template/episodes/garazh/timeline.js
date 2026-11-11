// ─── Timeline эпизода «garazh» — «Какой миллион» (80.5 с) ───────────────────
// Сценарий: script.md; раскладка шотов под реальную озвучку: shots.md. Файл — только литералы.
const TIMELINE = {
  duration: 80.5,
  stage: { back: 'garazhBack', front: 'garazhFront' },
  shots: [
    { id: 'S1', set: 'stage', from: 0, to: 4.0, cast: ['tolyan', 'sanek', 'palych'], cam: [[0, 360, 700, .98], [4.0, 362, 694, 1.04]] },
    { id: 'S2', set: 'stage', from: 4.0, to: 7.0, cast: ['tolyan', 'palych'], cam: [[4.0, 190, 700, 1.12], [7.0, 192, 694, 1.18]] },
    { id: 'S3', set: 'stage', from: 7.0, to: 8.5, cast: ['sanek', 'palych'], cam: [[7.0, 540, 700, 1.12], [8.5, 538, 694, 1.18]] },
    { id: 'S4', set: 'stage', from: 8.5, to: 10.6, cast: ['palych'], cam: [[8.5, 362, 612, 2.3], [10.6, 362, 606, 2.45]], shakeIn: 6 },
    { id: 'S5', set: 'stage', from: 10.6, to: 12.9, cast: ['tolyan', 'palych'], cam: [[10.6, 190, 700, 1.12], [12.9, 192, 694, 1.18]] },
    { id: 'S6', set: 'stage', from: 12.9, to: 15.4, cast: ['tolyan', 'sanek', 'palych'], cam: [[12.9, 200, 720, 1.3], [15.4, 200, 714, 1.36]], mode: 'blackout' },
    { id: 'S6b', set: 'stage', from: 15.4, to: 17.3, cast: ['tolyan', 'sanek', 'palych'], cam: [[15.4, 200, 720, 1.3], [17.3, 200, 714, 1.36]], mode: 'blackout', phoneLight: { x: 150, y: 915, r: 165, dim: .55 } },
    { id: 'S7', set: 'stage', from: 17.3, to: 18.6, cast: ['tolyan', 'sanek', 'palych'], cam: [[17.3, 360, 700, .98], [18.6, 362, 694, 1.04]] },
    { id: 'S8', set: 'chat', from: 18.6, to: 22.2, cam: [[18.6, 360, 600, 1.06], [22.2, 360, 596, 1.1]] },
    { id: 'S9', set: 'stage', from: 22.2, to: 24.9, cast: ['palych'], cam: [[22.2, 362, 612, 2.3], [24.9, 362, 606, 2.45]], shakeIn: 6 },
    { id: 'S10', set: 'chat', from: 24.9, to: 27.0, cam: [[24.9, 360, 600, 1.06], [27.0, 360, 596, 1.1]] },
    { id: 'S11', set: 'stage', from: 27.0, to: 30.3, cast: ['tolyan', 'palych'], cam: [[27.0, 190, 700, 1.12], [30.3, 192, 694, 1.18]] },
    { id: 'S12', set: 'chat', from: 30.3, to: 31.6, cam: [[30.3, 360, 600, 1.06], [31.6, 360, 596, 1.1]] },
    { id: 'S13', set: 'stage', from: 31.6, to: 33.0, cast: ['tolyan', 'palych'], cam: [[31.6, 190, 700, 1.12], [33.0, 192, 694, 1.18]] },
    { id: 'S14', set: 'stage', from: 33.0, to: 35.0, cast: ['sanek', 'palych'], cam: [[33.0, 540, 700, 1.12], [35.0, 538, 694, 1.18]] },
    { id: 'S15', set: 'chat', from: 35.0, to: 37.5, cam: [[35.0, 360, 600, 1.06], [37.5, 360, 596, 1.1]] },
    { id: 'S16', set: 'stage', from: 37.5, to: 39.0, cast: ['palych'], cam: [[37.5, 362, 612, 2.3], [39.0, 362, 606, 2.45]], shakeIn: 6 },
    { id: 'S17', set: 'chat', from: 39.0, to: 40.5, cam: [[39.0, 360, 660, 1.14], [40.5, 360, 654, 1.2]] },
    { id: 'S18', set: 'stage', from: 40.5, to: 42.2, cast: ['tolyan', 'sanek', 'palych'], cam: [[40.5, 360, 700, .98], [42.2, 362, 694, 1.04]] },
    { id: 'S19', set: 'stage', from: 42.2, to: 45.3, cast: ['tolyan', 'sanek', 'palych'], cam: [[42.2, 200, 720, 1.3], [45.3, 200, 714, 1.36]], mode: 'blackout' },
    { id: 'S20', set: 'stage', from: 45.3, to: 47.2, cast: ['tolyan', 'sanek', 'palych'], cam: [[45.3, 200, 720, 1.3], [47.2, 200, 714, 1.36]], mode: 'blackout', phoneLight: { x: 150, y: 915, r: 165, dim: .55 } },
    { id: 'S20b', set: 'stage', from: 47.2, to: 48.6, cast: ['tolyan', 'sanek', 'palych'], cam: [[47.2, 470, 700, 1.3], [48.6, 470, 694, 1.36]], mode: 'blackout', phoneLight: true },
    { id: 'S21', set: 'stage', from: 48.6, to: 50.0, cast: ['tolyan', 'sanek', 'palych'], cam: [[48.6, 360, 700, .98], [50.0, 362, 694, 1.04]] },
    { id: 'S22', set: 'stage', from: 50.0, to: 53.8, cast: ['palych'], cam: [[50.0, 362, 612, 2.3], [53.8, 362, 606, 2.45]], shakeIn: 6 },
    { id: 'S23', set: 'chat', from: 53.8, to: 56.0, cam: [[53.8, 360, 600, 1.06], [56.0, 360, 596, 1.1]] },
    { id: 'S24', set: 'chat', from: 56.0, to: 59.0, cam: [[56.0, 360, 560, 1.06], [59.0, 360, 520, 1.2]] },
    { id: 'S25', set: 'stage', from: 59.0, to: 60.3, cast: ['tolyan', 'sanek', 'palych'], cam: [[59.0, 360, 700, .98], [60.3, 362, 694, 1.04]] },
    { id: 'S26', set: 'stage', from: 60.3, to: 62.3, cast: ['sanek', 'palych'], cam: [[60.3, 540, 700, 1.12], [62.3, 538, 694, 1.18]] },
    { id: 'S27', set: 'stage', from: 62.3, to: 63.8, cast: ['tolyan', 'palych'], cam: [[62.3, 190, 700, 1.12], [63.8, 192, 694, 1.18]] },
    { id: 'S28', set: 'chat', from: 63.8, to: 66.5, cam: [[63.8, 360, 660, 1.14], [66.5, 360, 654, 1.2]] },
    { id: 'S29', set: 'stage', from: 66.5, to: 68.5, cast: ['tolyan', 'palych'], cam: [[66.5, -30, 720, 1.05], [68.5, -20, 714, 1.1]] },
    { id: 'S30', set: 'stage', from: 68.5, to: 71.3, cast: ['tolyan', 'sanek', 'palych'], cam: [[68.5, 360, 700, .98], [71.3, 362, 694, 1.04]] },
    { id: 'S31', set: 'stage', from: 71.3, to: 73.6, cast: ['tolyan', 'palych'], cam: [[71.3, 190, 700, 1.12], [73.6, 192, 694, 1.18]] },
    { id: 'S32', set: 'stage', from: 73.6, to: 75.4, cast: ['sanek', 'palych'], cam: [[73.6, 540, 700, 1.12], [75.4, 538, 694, 1.18]] },
    { id: 'S33', set: 'stage', from: 75.4, to: 78.6, cast: ['tolyan'], cam: [[75.4, 112, 718, 2.55], [78.6, 112, 714, 2.7]], shakeIn: 6 },
    { id: 'S34', set: 'stage', from: 78.6, to: 80.5, cast: ['tolyan'], cam: [[78.6, 112, 712, 2.85], [80.5, 112, 710, 2.95]] },
  ],
  voice: {
    cast: { palych: '7076e45ce3234fd49ef40ffbd5a3f0cd',   // «Харизматичный дед-разработчик» (свой)
            tolyan: 'b4b3cd5e89cc4fb682301b43e627d5ef',   // «мориарти» — низкий, спокойный (каталог Fish)
            sanek:  '6ada82e315e648b6a30a2e2210844cbf' }, // «Дерзкий Парень» — молодой (каталог Fish)
    lines: [
      { id: 'p1', t: 0.3, who: 'palych', text: '[сухо] Так.' },
      { id: 'p2', t: 1.7, who: 'palych', text: '[пауза] Мужики. [пауза] Стартап.', split: [1, 1] },
      { id: 'p3', t: 4.1, who: 'palych', text: '[с гордостью] На миллион. [пауза] До утра.', split: [2, 2] },
      { id: 's1', t: 7.1, who: 'sanek', text: '[не отрываясь от телефона] А идея?' },
      { id: 'p4', t: 8.7, who: 'palych', text: '[спокойно, как о само собой разумеющемся] Клод, придумает.', sub: 'Claude придумает.', split: [1, 1] },
      { id: 'p5', t: 13.2, who: 'palych', text: '[в темноте, ровно, без эмоций] Толян. [пауза] Чайник.', split: [1, 1] },
      { id: 't1', t: 15.65, who: 'tolyan', text: '[сонно, виновато] Я чай хотел.' },
      { id: 'p6', t: 22.3, who: 'palych', text: '[устало] Долларов, блядь.', sub: 'Долларов, бл*дь.', split: [1, 1] },
      { id: 't2', t: 27.1, who: 'tolyan', text: '[медленно] Это гараж.' },
      { id: 'p7', t: 29.4, who: 'palych', text: 'Дальше.' },
      { id: 't3', t: 31.6, who: 'tolyan', text: '[ревниво] Он занят.' },
      { id: 's2', t: 33.1, who: 'sanek', text: '[вдохновенно] Подписка на воздух!', split: [1, 2] },
      { id: 'p8', t: 37.6, who: 'palych', text: '[торжественно] Запускай.' },
      { id: 'p9', t: 40.6, who: 'palych', text: '[резко, громко, по слогам] То-лян!', sub: 'Толян—' },
      { id: 'p10', t: 42.2, who: 'palych', text: '[в темноте, тихо, зло] Каждую, блядь, ночь.', sub: 'Каждую, бл*дь, ночь.', split: [1, 1, 1] },
      { id: 't4', t: 45.4, who: 'tolyan', text: '[сонно, ровно] Я чай хотел.' },
      { id: 's3', t: 47.4, who: 'sanek', text: '[шёпотом] Четвёртый.' },
      { id: 'p11', t: 50.0, who: 'palych', text: '[без интонации, устало] Клод. [пауза] Какую боль закрывать.', sub: 'Claude. Какую боль закрывать.', split: [1, 2, 1] },
      { id: 's4', t: 60.4, who: 'sanek', text: '[растерянно] Это не миллион.', split: [1, 2] },
      { id: 't5', t: 62.3, who: 'tolyan', text: '[с достоинством] Это чай.' },
      { id: 't6', t: 72.1, who: 'tolyan', text: '[тихо, с гордостью] Не выбило.' },
      { id: 's5', t: 73.8, who: 'sanek', text: '[осторожно] А миллион?' },
      { id: 't7', t: 76.3, who: 'tolyan', text: '[блаженно, не вопрос] Какой миллион.' },
    ],
  },
  badges: [
    { from: 1.6, to: 4.0, name: 'ПАЛЫЧ', role: 'CEO · ВИЗИОНЕР · ГАРАЖ', color: '#c96a5a', x: 24, y: 120, rot: -3 },
    { from: 5.0, to: 7.0, name: 'ТОЛЯН', role: 'QA · ЗАВХОЗ · ЧАЙНИК', color: '#f39a3c', x: 20, y: 170, rot: -4 },
    { from: 7.3, to: 8.5, name: 'САНЁК', role: 'CMO · SMM · ПЛЕМЯННИК', color: '#7fae6a', x: 250, y: 150, rot: 3 },
    { from: 78.9, to: 80.5, name: 'ТОЛЯН', role: 'QA · ЗАВХОЗ · ЧАЙ', color: '#f39a3c', x: 30, y: 120, rot: -4 },
  ],
  // сцена: лампа, автомат, чайник, удлинитель, кружки, ноут (треки {t, v|поля, dur?})
  env: {
    lamp: [{ t: 0, swing: 0, bright: 1 },
      { t: 12.2, bright: .3, dur: .05 }, { t: 12.3, bright: 1, dur: .05 }, { t: 12.45, bright: .3, dur: .05 }, { t: 12.55, bright: 1, dur: .05 }, { t: 12.75, bright: 0, dur: .05 },
      { t: 17.3, bright: 1, swing: 7, dur: .3 }, { t: 17.65, swing: -5, dur: .4 }, { t: 18.1, swing: 2, dur: .4 }, { t: 18.5, swing: 0, dur: .4 },
      { t: 40.5, bright: .55, swing: 5, dur: .4 }, { t: 41.0, swing: -5, dur: .45 }, { t: 41.5, swing: 4, dur: .45 }, { t: 42.1, bright: 0, swing: 0, dur: .05 },
      { t: 48.6, bright: 1, swing: 7, dur: .3 }, { t: 48.95, swing: -5, dur: .4 }, { t: 49.4, swing: 0, dur: .5 },
      { t: 70.1, bright: .3, dur: .05 }, { t: 70.2, bright: 1, swing: 3, dur: .1 }, { t: 70.6, swing: 0, dur: .5 }],
    breaker: [{ t: 0, v: 0 }, { t: 12.75, v: 1 }, { t: 17.3, v: 0 }, { t: 42.1, v: 1 }, { t: 48.6, v: 0 }],
    kettleOn: [{ t: 0, v: 0 }, { t: 12.0, v: 1 }, { t: 12.75, v: 0 }, { t: 41.95, v: 1 }, { t: 42.1, v: 0 }, { t: 70.0, v: 1 }],
    plug: [{ t: 0, v: -1 }, { t: 66.6, v: 0, dur: 0 }, { t: 67.2, v: 1, dur: .4 }],
    mugs: [{ t: 0, v: 0 }, { t: 73.6, v: 1 }],
    laptopOn: [{ t: 0, v: true }, { t: 12.75, v: false }, { t: 17.3, v: true }, { t: 42.1, v: false }, { t: 48.6, v: true }],
  },
  // лента чата Claude (set chat) — сквозная на весь эпизод; текст крупнее, как в референсе
  chatStyle: { fs: 27, lh: 34, wrap: 17 },
  chat: [
    { off: [12.75, 17.3] },
    { id: 'm0', t: 17.4, from: 'claude', text: 'Вы отключались.', pinned: true },
    { id: 'u1', t: 18.8, from: 'user', text: 'идею на миллион', speed: 12 },
    { typing: [20.6, 21.1] },
    { id: 'm1', t: 21.1, from: 'claude', text: 'Уточните: миллион чего?' },
    { id: 'm2', t: 25.1, from: 'claude', text: 'Принято (бл*дь).' },
    { id: 'm3', t: 25.9, from: 'claude', text: 'Идея 1: Uber для гаражей.' },
    { id: 'm4', t: 30.5, from: 'claude', text: 'Идея 2: Тиндер для чайников.' },
    { id: 'u2', t: 35.05, from: 'user', text: 'подписка на воздух', speed: 16 },
    { typing: [36.5, 36.8] },
    { id: 'm5', t: 36.8, from: 'claude', text: 'Рынок: все. Клиенты уже дышат.', button: 'Запустить' },
    { cursor: [39.0, 39.5], to: 'm5' },
    { click: 39.65 },
    { progress: { from: 39.8, to: 40.5, pct0: 0, pct1: 37, label: 'Запуск…' } },
    { off: [42.1, 48.6] },
    { typing: [53.9, 55.1] },
    { id: 'm6', t: 55.2, from: 'claude', text: 'Вашу.' },
    { id: 'm7', t: 56.2, from: 'claude', text: '«Толян, чайник» — 4 раза за ночь.' },
    { id: 'm8', t: 57.4, from: 'claude', text: 'Чайник выбивает автомат.' },
    { id: 'm9', t: 64.0, from: 'claude', text: 'Решение: вторая розетка. 300 ₽.' },
    { id: 'm10', t: 64.8, from: 'claude', text: 'Клиентов: 3.', button: 'Запустить' },
    { cursor: [65.2, 65.7], to: 'm10' },
    { click: 65.85 },
    { id: 'm11', t: 66.1, from: 'claude', text: 'Готово.' },
  ],
  // персонажи: позы (координаты в локальной системе персонажа), треки, события
  cast: {
    palych: {
      poses: {
        L: [
          { t: 0, wrist: [250, 930], hand: 'rest', rot: -52, layer: 'desk', bob: 0 },
          { t: 0.25, wrist: [205, 650], hand: 'fingerUp', rot: 0, layer: 'front', bend: -1, sweep: 1, bob: 1 },   // «Так.»
          { t: 1.6, wrist: [250, 930], hand: 'rest', rot: -52, layer: 'desk', bob: 0 },
          { t: 4.35, wrist: [300, 860], hand: 'spread', rot: 40, layer: 'front', bend: 1 },                    // «На миллион»
          { t: 5.55, wrist: [138, 885], hand: 'point', rot: 0, layer: 'front', bend: 1 },                      // «До утра» — на Толяна
          { t: 7.0, wrist: [250, 930], hand: 'rest', rot: -52, layer: 'desk', bob: 0 },
          { t: 29.35, wrist: [300, 860], hand: 'spread', rot: 10, layer: 'front', bend: 1 },          // «Дальше.»
          { t: 30.3, wrist: [250, 930], hand: 'rest', rot: -52, layer: 'desk', bob: 0 },
          { t: 37.55, wrist: [330, 860], hand: 'point', rot: -40, layer: 'front', bend: 1 },                   // «Запускай» — в экран
          { t: 39.0, wrist: [250, 930], hand: 'rest', rot: -52, layer: 'desk', bob: 0 },
        ],
        R: [{ t: 0, wrist: [470, 915], hand: 'rest', rot: 30, layer: 'behind', jiggle: 2.5 }],
        head: [{ t: 0, tilt: 0 }, { t: 1.75, tilt: -3, dur: .12 }, { t: 2.7, tilt: 3, dur: .12 }, { t: 3.6, tilt: 0 },
          { t: 8.75, tilt: 4 }, { t: 10.4, tilt: 0 }, { t: 22.3, tilt: -6 }, { t: 24.8, tilt: 0 },
          { t: 40.6, tilt: -7, dur: .12 }, { t: 42.2, tilt: 0 }, { t: 50.0, tilt: -3 }, { t: 59.1, tilt: -6, dur: .4 }, { t: 60.4, tilt: -2 }],
      },
      tracks: {
        glasses: [{ t: 0, v: 0 }, { t: 37.5, v: 1, dur: .2 }, { t: 48.6, v: .85, dur: 0 }, { t: 53.8, v: 0, dur: 0 }, { t: 59.15, v: 1, dur: .16 }],
        gaze: [{ t: 0, v: [0, .7] }, { t: 1.7, v: [0, 0] }, { t: 7.1, v: [1, 0], dur: .2 }, { t: 8.5, v: [0, .7] },
          { t: 40.6, v: [-1, 0], dur: .12 }, { t: 42.2, v: [0, .7] }, { t: 59.1, v: [-1, .4], dur: .4 }, { t: 61.5, v: [-1, 0] }, { t: 73.0, v: [-1, 0] }],
        lid: [{ t: 0, v: .55 }, { t: 22.2, v: .78, dur: .3 }, { t: 24.9, v: .55 }, { t: 48.6, v: .62 }, { t: 50.0, v: .8, dur: .4 }, { t: 53.8, v: .55 }],
      },
      events: { shock: [[59.15, 60.2]] },
    },
    tolyan: {
      at: { x: -250, y: 40, s: .85 },
      poses: {
        L: [
          { t: 0, wrist: [330, 850], hand: 'spread', rot: 50, layer: 'front', bend: 1, prop: 'kettle', bob: .6 },   // чайник на руках
          { t: 10.7, wrist: [292, 850], hand: 'rest', rot: -30, layer: 'front', bend: 1, prop: null, bob: 0 },      // поставил на верстак
          { t: 17.3, wrist: [330, 850], hand: 'spread', rot: 50, layer: 'front', bend: 1, prop: 'kettle', bob: .6, dur: 0 },
          { t: 31.55, wrist: [395, 790], hand: 'spread', rot: 40, layer: 'front', bend: 1, prop: 'kettle', propRot: -14, bob: .8 }, // «Он занят»
          { t: 35.0, wrist: [292, 850], hand: 'rest', rot: -30, layer: 'front', bend: 1, prop: null, bob: 0, dur: 0 },
          { t: 61.0, wrist: [330, 850], hand: 'spread', rot: 50, layer: 'front', bend: 1, prop: 'kettle', bob: .6, dur: 0 },
          { t: 62.25, wrist: [175, 760], hand: 'spread', rot: 70, layer: 'front', bend: -1, prop: 'kettle', bob: 1, dur: .3 },  // «Это чай» — к глазам
          { t: 63.8, wrist: [292, 850], hand: 'rest', rot: -30, layer: 'front', bend: 1, prop: null, bob: 0, dur: 0 },
          { t: 66.6, wrist: [120, 790], hand: 'kiss', rot: 0, layer: 'front', bend: -1, dur: .3 },                 // тянет вилку к розетке
          { t: 67.7, wrist: [292, 850], hand: 'rest', rot: -30, layer: 'front', bend: 1, bob: 0, dur: .3 },
          { t: 75.4, wrist: [320, 760], hand: 'spread', rot: 60, layer: 'front', bend: 1, prop: 'mug', bob: .9, dur: 0 },
          { t: 75.5, wrist: [338, 700], hand: 'spread', rot: 60, layer: 'front', bend: 1, prop: 'mug', bob: 1, dur: .35 },     // глоток
          { t: 76.2, wrist: [320, 770], hand: 'spread', rot: 60, layer: 'front', bend: 1, prop: 'mug', bob: .9, dur: .3 },
        ],
        R: [
          { t: 0, wrist: [470, 930], hand: 'rest', rot: 30, layer: 'behind' },
          { t: 11.3, wrist: [372, 826], hand: 'point', rot: 0, layer: 'front', bend: 1, dur: .3 },                // тянется к кнопке
          { t: 11.95, wrist: [360, 830], hand: 'point', rot: 0, layer: 'front', bend: 1, dur: .08 },              // щёлк
          { t: 17.3, wrist: [470, 930], hand: 'rest', rot: 30, layer: 'behind', dur: 0 },
          { t: 40.5, wrist: [362, 829], hand: 'point', rot: 0, layer: 'front', bend: 1, dur: 0 },                 // палец уже на кнопке
          { t: 41.9, wrist: [356, 832], hand: 'point', rot: 0, layer: 'front', bend: 1, dur: .08 },
          { t: 48.6, wrist: [470, 930], hand: 'rest', rot: 30, layer: 'behind', dur: 0 },
          { t: 68.6, wrist: [374, 820], hand: 'point', rot: 0, layer: 'front', bend: 1, dur: .3 },                // палец над кнопкой
          { t: 69.95, wrist: [360, 830], hand: 'point', rot: 0, layer: 'front', bend: 1, dur: .08 },
          { t: 70.8, wrist: [470, 930], hand: 'rest', rot: 30, layer: 'behind', dur: .3 },
          { t: 78.7, wrist: [450, 790], hand: 'thumbsUp', rot: 0, layer: 'front', elbow: [470, 905], arc: 0, dur: .2 },  // 👍
        ],
        head: [{ t: 0, tilt: 0 }, { t: 15.65, tilt: -4 }, { t: 17.3, tilt: 0 }, { t: 27.1, tilt: -5 }, { t: 28.3, tilt: 3 }, { t: 29.3, tilt: 0 },
          { t: 31.55, tilt: -7 }, { t: 33.0, tilt: 0 }, { t: 59.1, tilt: 6, dur: .4 }, { t: 62.25, tilt: -4 }, { t: 63.8, tilt: 0 },
          { t: 71.5, tilt: 4, dur: .4 }, { t: 72.1, tilt: -3 }, { t: 75.6, tilt: -7, dur: .4 }, { t: 78.75, tilt: 7.5, dur: .15 }, { t: 78.9, tilt: 4, dur: .15 }],
      },
      tracks: {
        look: [{ t: 0, v: .4 }, { t: 27.1, v: -1, dur: .4 }, { t: 27.9, v: 1, dur: .5 }, { t: 28.8, v: 0 }, { t: 59.1, v: .9, dur: .4 }, { t: 61.0, v: .3 }, { t: 71.5, v: -.6, dur: .3 }, { t: 72.0, v: .8, dur: .3 }, { t: 73.0, v: 0 }],
        lid: [{ t: 0, v: .55 }, { t: 75.4, v: .6 }, { t: 78.65, v: .45, dur: .12 }],
      },
      events: { shock: [[59.15, 60.2]], matchDrop: [59.15], matchBack: [71.3], bliss: [[75.85, 78.65]] },
    },
    sanek: {
      at: { x: 300, y: 20, s: .88 },
      poses: {
        L: [
          { t: 0, wrist: [330, 830], hand: 'phone', rot: 20, layer: 'front', bend: 1, prop: 'phone' },
          { t: 32.95, wrist: [300, 375], hand: 'phone', rot: 0, layer: 'front', bend: -1, prop: 'phone', bob: 1, dur: .22 },   // телефон над головой
          { t: 35.0, wrist: [330, 830], hand: 'phone', rot: 20, layer: 'front', bend: 1, prop: 'phone', dur: 0 },
          { t: 47.2, wrist: [330, 745], hand: 'phone', rot: 0, layer: 'front', bend: 1, prop: 'phone', bob: 1, dur: .3 },      // фонарик у подбородка
          { t: 48.6, wrist: [330, 830], hand: 'phone', rot: 20, layer: 'front', bend: 1, prop: 'phone', dur: 0 },
          { t: 60.3, wrist: [320, 960], hand: 'phone', rot: 40, layer: 'front', bend: 1, prop: 'phone', bob: 0, dur: .4 },     // опустил телефон
          { t: 66.5, wrist: [330, 830], hand: 'phone', rot: 20, layer: 'front', bend: 1, prop: 'phone', dur: 0 },
        ],
        R: [{ t: 0, wrist: [470, 990], hand: 'rest', rot: 60, layer: 'behind' }],
        head: [{ t: 0, tilt: 0 }, { t: 7.1, tilt: 3 }, { t: 8.5, tilt: 0 }, { t: 33.0, tilt: -4 }, { t: 35.0, tilt: 0 }, { t: 40.6, tilt: -7, dur: .12 },
          { t: 42.2, tilt: 0 }, { t: 59.1, tilt: -6, dur: .4 }, { t: 60.4, tilt: -3 }, { t: 62.3, tilt: 0 }, { t: 73.8, tilt: -4 }],
      },
      tracks: {
        gaze: [{ t: 0, v: [0, 1] }, { t: 32.9, v: [0, -1], dur: .2 }, { t: 35.0, v: [0, 1] }, { t: 40.6, v: [-1, 0], dur: .12 }, { t: 42.2, v: [0, 1] },
          { t: 47.2, v: [0, 0] }, { t: 48.6, v: [0, 1] }, { t: 59.1, v: [-1, .5], dur: .4 }, { t: 60.4, v: [-1, 0] }, { t: 66.5, v: [0, 1] }, { t: 73.7, v: [-1, 0], dur: .2 }],
        glow: [{ t: 0, v: 1 }, { t: 60.3, v: 0 }, { t: 66.5, v: 1 }],
      },
      events: { shock: [[59.15, 60.2]], squint: [[69.3, 70.4]] },
    },
  },
};
