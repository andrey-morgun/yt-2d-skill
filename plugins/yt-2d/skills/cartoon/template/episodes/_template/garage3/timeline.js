// ─── Timeline эпизода «__NAME__» — стартер garage3: трое в гараже, чат Claude, крупный план ───────────────
// ЭТО РАБОЧИЙ ЭПИЗОД-ЗАГОТОВКА (10 с). Перепиши под свой сюжет: оставь структуру, замени реплики, шоты и позы.
// Правила файла: ТОЛЬКО литералы (его читают браузер и node:vm в sfx/voice build); все тайминги живут здесь.
// API пресетов — pipeline.md «Пресеты»; эталон полного эпизода — episodes/garazh (script.md, shots.md, timeline.js).
//
// Как собирается: 1) стиллы  FRAMES_DIR=/tmp/rv node render.mjs --ep __NAME__ --stills 1.0,3.5,5.8,7.5,9.2
//                 2) превью  node render.mjs --ep __NAME__ /tmp/__NAME__.mp4 --preview --sfx
//                 3) финал   node --env-file=.env render.mjs --ep __NAME__ out/__NAME___v1.mp4 --final --voice --sfx
// Без ключа TTS всё равно работает: субтитры и рот строятся по оценке длительности реплик (voice/build.mjs --no-api).
const TIMELINE = {
  duration: 10.0,                               // секунды; кадров = duration × 30. Последний кадр держать ≥0.6 с после последнего слова

  // РАСКЛАДКА СЦЕНЫ: гараж на троих (задник/передний план garazh, размещения по умолчанию:
  // tolyan слева у верстака с чайником, palych в центре за столом с ноутом, sanek справа с телефоном).
  // Переопределить размещение: cast.<who>.at = { x, y, s } или в шоте cast: [{ who:'sanek', x: 320 }].
  stage: { preset: 'garage3' },

  // ШОТЫ покрывают [0, duration) без дыр. set: 'stage' (персонажи из cast на раскладке) | 'chat' (экран Claude).
  // cam — пресет: 'wide' | 'two:<a>+<b>' | 'cu:<who>' | 'cu+:<who>' | 'mid:<who>' | 'screen' | 'screen+'
  //       или объект { preset, dx, dy, s, push } (сырые [[t,cx,cy,s],[t,cx,cy,s]] тоже можно). Наезд +6 % — сам.
  // shakeIn: 6 — толчок камеры на входе в крупный план (стайлгайд §5). mode:'blackout' — темнота (см. garazh).
  shots: [
    { id: 'S1', set: 'stage', from: 0,   to: 2.6, cast: ['tolyan', 'sanek', 'palych'], cam: 'wide' },                  // подводка: Палыч командует
    { id: 'S2', set: 'stage', from: 2.6, to: 4.8, cast: ['sanek', 'palych'], cam: { preset: 'two:sanek+palych', dx: 30 } }, // Санёк поднимает телефон
    { id: 'S3', set: 'chat',  from: 4.8, to: 6.8, cam: 'screen' },                                                      // экран: Claude отвечает
    { id: 'S4', set: 'stage', from: 6.8, to: 8.6, cast: ['tolyan'], cam: 'cu:tolyan', shakeIn: 6 },                     // реакция крупно
    { id: 'S5', set: 'stage', from: 8.6, to: 10,  cast: ['tolyan', 'palych'], cam: { preset: 'two:tolyan+palych', dx: -45 } },   // финал: 👍 Толяна, держим кадр (dx — сдвиг центра, как в garazh)
  ],

  // ОЗВУЧКА. cast: персонаж → id голоса fish.audio (каталог: curl -s "https://api.fish.audio/model?page_size=40&language=ru").
  // lines: t — старт реплики; text — что говорит TTS, теги [устало] не озвучиваются и в субтитры не идут;
  // sub — текст субтитра вместо text (цензура), split — слов в каждой фразе субтитра (фраза ≤3 слов / ≤24 символов).
  // Субтитры и окна рта выводятся из озвучки сами (ручные subs/talk не нужны). Длительность реплики — из mp3
  // (или по оценке, пока ключа нет) — после генерации сверь шоты с реальными длительностями (образец: garazh/shots.md).
  voice: {
    cast: { palych: '7076e45ce3234fd49ef40ffbd5a3f0cd',   // «Харизматичный дед-разработчик» — хриплый дед
            tolyan: 'b4b3cd5e89cc4fb682301b43e627d5ef',   // «мориарти» — низкий, спокойный
            sanek:  '6ada82e315e648b6a30a2e2210844cbf' }, // «Дерзкий Парень» — молодой
    lines: [
      { id: 'p1', t: 0.3, who: 'palych', text: '[сухо] Так. [пауза] Мужики.', split: [1, 1] },
      { id: 's1', t: 2.8, who: 'sanek',  text: '[не отрываясь от телефона] Опять стартап?' },
      { id: 't1', t: 7.2, who: 'tolyan', text: '[с достоинством] Чай.' },
    ],
  },

  // ПЛАШКИ «ИМЯ / РОЛИ» (HTML поверх кадра): появляются с pop, x/y — px экрана, rot — наклон. Одна на персонажа при первом появлении.
  badges: [
    { from: 0.5, to: 2.6, name: 'ПАЛЫЧ', role: 'CEO · ВИЗИОНЕР · ГАРАЖ', color: '#c96a5a', x: 24, y: 120, rot: -3 },
    { from: 2.9, to: 4.8, name: 'САНЁК', role: 'CMO · SMM · ПЛЕМЯННИК', color: '#7fae6a', x: 250, y: 150, rot: 3 },
    { from: 7.0, to: 8.6, name: 'ТОЛЯН', role: 'QA · ЗАВХОЗ · ЧАЙНИК', color: '#f39a3c', x: 20, y: 150, rot: -4 },
  ],

  // СОСТОЯНИЕ СЦЕНЫ (треки {t, v | поля, dur?}) — читают задник/передний план и фоли: лампа, автомат, чайник, вилка, кружки, ноут.
  env: {
    lamp: [{ t: 0, swing: 0, bright: 1 }],
    breaker: [{ t: 0, v: 0 }],
    kettleOn: [{ t: 0, v: 0 }, { t: 7.2, v: 1 }],     // индикатор чайника загорается на «Чай.»
    plug: [{ t: 0, v: -1 }],
    mugs: [{ t: 0, v: 0 }],
    laptopOn: [{ t: 0, v: true }],
  },

  // ЧАТ CLAUDE (set 'chat'): сквозной лог на весь эпизод; крупность текста — chatStyle. Подробно — pipeline.md §3.6.
  chatStyle: { fs: 27, lh: 34, wrap: 17 },
  chat: [
    { id: 'm0', t: 0,   from: 'claude', text: 'Чем помочь?', pinned: true },         // висит с самого начала
    { id: 'u1', t: 4.9, from: 'user',   text: 'идею на миллион', speed: 14 },       // Палыч печатает (speed симв/с) → отправка
    { typing: [6.1, 6.5] },                                                         // «печатает…»
    { id: 'm1', t: 6.5, from: 'claude', text: 'Идея: подписка на чай.' },
  ],

  // ПЕРСОНАЖИ: позы по пресетам { t, pose:'<имя>', …переопределения }. t — старт движения (приезд через dur, по умолчанию 0.18 с).
  // Пресеты: rest typing fingerUp spread point(at) reach(at) kiss thumbsUp hold(prop) sip phoneWaist phoneUp phoneChin phoneDown down.
  // Голова: head: [{ t, tilt }] или { t, pose:'nod'|'shake'|'left'|'right'|'level' }. Треки: gaze [x,y] (-1..1), look, lid, glow, glasses…
  // События: blink [t…] (нет — автоморгание), shock/bliss/squint/kiss — окна [[a,b]], matchDrop/matchBack — спичка Толяна.
  cast: {
    palych: {
      poses: {
        L: [
          { t: 0,    pose: 'rest' },
          { t: 0.25, pose: 'fingerUp' },            // «Так.»
          { t: 1.6,  pose: 'rest' },
          { t: 4.9,  pose: 'typing', jiggle: 3 },   // печатает в чат (S3 — его экран)
          { t: 6.8,  pose: 'rest' },
        ],
        R: [{ t: 0, pose: 'typing' }],
        head: [{ t: 0, tilt: 0 }, { t: 0.3, pose: 'left' }, { t: 1.6, pose: 'level' }, { t: 8.7, pose: 'nod' }],
      },
      tracks: { gaze: [{ t: 0, v: [0, .7] }, { t: 2.7, v: [1, 0], dur: .2 }, { t: 4.8, v: [0, .7] }, { t: 8.7, v: [-1, .3], dur: .3 }] },   // взгляд на Санька, в финале — на Толяна
    },
    tolyan: {
      poses: {
        L: [{ t: 0, pose: 'hold', prop: 'kettle' }],                    // чайник на руках весь эпизод
        R: [{ t: 0, pose: 'typing', jiggle: 0 }, { t: 8.7, pose: 'thumbsUp' }],   // финал: deadpan 👍
        head: [{ t: 0, tilt: 0 }, { t: 7.3, pose: 'nod' }],
      },
      tracks: { look: [{ t: 0, v: .4 }] },
      events: { bliss: [[7.9, 8.6]] },                                   // блаженно прикрыл глаза после «Чай.»
    },
    sanek: {
      poses: {
        L: [{ t: 0, pose: 'phoneWaist' }, { t: 2.7, pose: 'phoneUp' }, { t: 4.8, pose: 'phoneWaist', dur: 0 }],   // телефон над головой на реплике
        R: [{ t: 0, pose: 'typing', jiggle: 0 }],
        head: [{ t: 0, tilt: 0 }, { t: 2.7, pose: 'left' }, { t: 4.8, pose: 'level' }],
      },
      tracks: { gaze: [{ t: 0, v: [0, 1] }, { t: 2.7, v: [0, -1], dur: .2 }, { t: 4.8, v: [0, 1] }] },   // смотрит вниз в телефон → вверх
    },
  },
};
