# Пайплайн и API движка

Студия: `$STUDIO` (по умолчанию `~/Documents/cartoon-studio.nosync`). Кадр = чистая функция `render(t)`; всё детерминировано.

## 0. Карта проекта

```
cartoon-studio/
├─ index.html               стейдж 720×1280, пост-эффекты (warm/haze/vignette/flicker/grain), загрузчик скриптов (?ep=<эпизод>)
├─ render.mjs               puppeteer-core + системный Chrome → PNG → ffmpeg (+ --sfx)
├─ new-episode.mjs          scaffold нового эпизода из episodes/_template
├─ src/                     ОБЩЕЕ, переиспользуется всеми эпизодами
│  ├─ lib.js                константы (S обводка, W, SKIN), clamp/lerp/easeInOut/easeOutBack/prog, rng(seed), tube()
│  ├─ rig.js                риг рук (2-кост. IK, риг на персонажа), кисти HANDS, keyAt/snap/trackAt, rigArms/rigHead/armsSvg, предметы PROPS
│  ├─ render.js             camAt, charState(t, shot, who) (одиночный путь + путь TIMELINE.cast), shake, реестр SETS, window.render(t)
│  ├─ overlays.js           subtitle(t), badges(t)  (HTML поверх сцены)
│  ├─ presets.js            ПРЕСЕТЫ (§1): раскладки stage (garage3/garage1), камеры (cam:'cu:palych'), позы (pose:'fingerUp'), якоря персонажей
│  ├─ characters/           tolyan-head.js + tolyan.js (Толян; CHARS.tolyan), palych.js (Палыч, объявляет kEye), sanek.js (Санёк, HANDS.phone) — все с anchors
│  ├─ props/                garage-props.js (чайник, кружка, телефон, верстак, розетка, лампа, blackoutLayer), registry.js (PROPS.kettle/mug/phone — предметы в кисти)
│  └─ sets/                 garage.js (одиночный), screen.js, chat.js, stage.js (несколько персонажей, §4.7), garazh.js (широкий гараж: garazhBack/garazhFront) — SETS.<name> = (t, shot, st) => '<svg…>'
├─ episodes/<ep>/           ЭПИЗОД: timeline.js (TIMELINE — все тайминги) + sfx.mjs (cues(TIMELINE, VOICE)) [+ свои сеты/персонажи в art/]
│  │                        [+ voice.js и voice/ — сгенерированная озвучка: тайминги слов, окна рта, mp3-кэш, стем mix.wav]
│  ├─ tolyan/               «сделай красиво», 8 с: одиночный путь (set garage, сырые координаты)
│  ├─ garazh/               «Какой миллион», 80.5 с: трое, chat, блэкауты, озвучка (script.md, shots.md) — на общей библиотеке src/
│  └─ _template/            стартеры new-episode.mjs --preset: garage3/ (трое, пресеты), garage1/ (один), blank/ (как tolyan)
├─ sfx/build.mjs            синтез фоли из cues через ffmpeg lavfi (RECIPES), микс, лимитер; --dump
├─ voice/build.mjs          озвучка: TIMELINE.voice → mp3 реплик (OpenRouter TTS, кэш) → episodes/<ep>/voice.js + voice/mix.wav; --check
├─ .env                     OPENROUTER_API_KEY=… или FISH_AUDIO_API_KEY=… (только локально; в шаблон и git не попадает; образец — .env.example)
├─ fonts/                   локальные woff2 (Rubik 700/800/900, Pangolin, JetBrains Mono) + fonts.css
├─ out/                     <ep>.mp4, <ep>.sfx.wav (артефакты)
└─ .frames/                 PNG-кадры последнего рендера (перезаписываются; FRAMES_DIR переопределяет)
```

Порядок загрузки в index.html (важно, скрипты классические, через `document.write`):
`lib → rig → episodes/<ep>/timeline.js → [episodes/<ep>/voice.js, если есть TIMELINE.voice] → characters/* (tolyan, palych, sanek) → props/* → sets/* → TIMELINE.scripts[] → presets → overlays → render`.


---

## 1. Пресеты — основной API (src/presets.js)

Новый эпизод пишется из готовых блоков: **раскладка** сцены, **камера строкой**, **позы по имени**. Сырые координаты (`cam: [[t,cx,cy,s],…]`, `wrist:[x,y]`) остаются аварийным выходом — пресеты раскрываются ровно в них, явные поля ключа перекрывают пресет. Рисовать новое нужно только когда сюжету нужен новый герой/предмет/локация.

```bash
node new-episode.mjs <ep> --preset garage3    # РАБОЧИЙ эпизод 10 с: трое в гараже, чат Claude, крупный план, 3 реплики — перепиши под сюжет
node new-episode.mjs <ep> --preset garage1    # один персонаж за столом, чат, крупный план (8 с)
node new-episode.mjs <ep> --preset blank      # одиночный путь без пресетов, как tolyan
```
Стартер рендерится сразу и без ключа TTS (субтитры/рот — по оценке длительности, см. §4.5).

### 1.1 Раскладка: `TIMELINE.stage = { preset }`
| preset | что | размещения по умолчанию (`cast[who].at`) | `wide` |
|---|---|---|---|
| `garage3` | гараж garazh: back `garazhBack`, front `garazhFront`, blackout `blackoutLayer` | tolyan `{x:-250,y:40,s:.85}` (верстак, чайник), palych `{0,0,1}` (стол, ноут), sanek `{x:300,y:20,s:.88}` | `[360,700,.98]` |
| `garage1` | тот же гараж, один персонаж (любой из CHARS) за столом Палыча | `default {0,0,1}` | `[360,690,1.2]` |
| `blank` | ничего: back/front/cast задаёт эпизод | — | — |

Переопределения прямо в `stage`: `{ preset:'garage3', cast:{ sanek:{x:320} }, points:{ laptop:[360,870] } }`; размещение в шоте: `cast:[{ who:'sanek', x:320, s:.9 }]`. `points` — мировые точки для поз `point/reach` (`laptop`, `kettle`, `socket`, `breaker`, `lamp`).

### 1.2 Камера: `shot.cam` строкой
| cam | кадр |
|---|---|
| `'wide'` | общий план: `wide` раскладки, иначе центр между головами каста, масштаб по их разбросу |
| `'two:<a>+<b>'` | двушка: центр между головами a и b, s 1.12 |
| `'cu:<who>'` / `'cu+:<who>'` | крупный план лица (центр `anchors.head`), s 2.3 / 2.6, делённый на масштаб размещения (лицо одного размера у всех) |
| `'mid:<who>'` | средний план одного (`anchors.chest`), s 1.5 |
| `'screen'` / `'screen+'` | чат/ноутбук: set chat `[360,600,1.06]` / `[360,660,1.14]` (ближе к кнопке), set screen `[360,700,1.02]` |

Наезд внутри шота — сам: +6 % масштаба и дрейф cy −6 (стайлгайд §5). Объектная форма: `cam: { preset:'two:tolyan+palych', dx:-45, dy:0, s:1.3, push:.06 }` (`dx/dy` — сдвиг центра в мировых px, `s` — свой масштаб, `push:0` — статично). Без `cam` берётся `'wide'` для stage и `'screen'` для chat/screen. Ручные кадры garazh: `two:tolyan+palych` + `dx:-45`; `two:sanek+palych` + `dx:30`; блэкаут `{ preset:'two:tolyan+palych', dx:-35, dy:20, s:1.3 }`; `cu:tolyan` ≈ S34.

### 1.3 Позы: `{ t, pose:'<имя>', …переопределения }`
В `cast[who].poses.L/R` (и в `TIMELINE.poses` одиночного пути). Считаются от рига персонажа (плечи) и его `CHARS[who].anchors = { head, mouth, chest, desk }`; для `R` зеркалятся (x, rot, bend, sweep).

| pose | жест | заметки |
|---|---|---|
| `rest` | кисть на столе (`anchors.desk`) | layer desk |
| `typing` | печатает за ноутом | behind, jiggle 2.5 (`jiggle:0` — просто рука за столом) |
| `fingerUp` | палец вверх у лица — «Так.» | |
| `spread` | раскрытая ладонь перед собой — «сделай» | |
| `point` | указать: `at:'laptop' \| '<who>' \| [x,y] (мир) \| 'left'\|'right'\|'up'\|'down'` | по умолчанию `laptop`; запястье на луче плечо→цель |
| `reach` | тянуться щепоткой к точке (`at` как у point) | вилка к розетке, кнопка |
| `kiss` | chef's kiss у рта | + `events.kiss:[[a,b]]` для губ |
| `thumbsUp` | deadpan 👍 перед грудью | dur .2 |
| `hold` | предмет в руке: `prop:'kettle'` (по умолчанию) \| `'mug'` | чайник/кружка из PROPS |
| `sip` | кружка ко рту | prop mug, dur .35 |
| `phoneWaist` / `phoneUp` / `phoneChin` / `phoneDown` | телефон у пояса / над головой / фонарик у подбородка / опущен | prop phone, glow сам |
| `down` | рука убрана под кадр | для крупных планов |

Голова: `head: [{ t, pose:'nod' | 'shake' | 'left' | 'right' | 'level' }]` (`nod`/`shake` раскрываются в 2–3 ключа; `tilt`/`dur` перекрывают). Треки (`gaze`, `look`, `lid`, `glow`, `glasses`) и события (`blink`, `shock`, `bliss`, `squint`, `kiss`) — как в §4.7.
Фоли: в `sfx.mjs` имя жеста — `p.pose || p.hand` (стартеры так и делают).

### 1.4 Свой герой/предмет поверх пресетов
Новый персонаж — `episodes/<ep>/art/<who>.js`: `CHARS.<who> = { rig, anchors, body(st,P), head(st,P) }` (§4.7) + `scripts:['episodes/<ep>/art/<who>.js']`; `anchors` обязательны, чтобы `cu:` и позы считались верно. Он сразу встаёт в любую раскладку (`cast[who].at` или `default`). Новый предмет — `PROPS.<name>` (образец `src/props/registry.js`), новая локация — свои `back/front` в `stage` (контракт `src/sets/garazh.js`).

---

## 2. Сквозной процесс: идея → готовый mp4

### 2.1 Идея → бит-шит (beat sheet)
Перед кодом — текстовый бит-шит (в ответе пользователю, не в файлах проекта). Правила:
- Длина 8–60 с. Темп: **≈1 бит в секунду** (бит = жест, слово, реакция, склейка). На 8 с ≈ 8–10 битов, на 30 с ≈ 25–30.
- Структура (3 акта в миниатюре): **сетап** (кто/где, 20–30 %) → **действие/ожидание** (40–50 %) → **панч + реакция** (20–30 %, deadpan-пауза 0.3–0.6 с перед финальной репликой).
- Каждый бит: `t_start–t_end | кадр (set/cam) | действие/поза | реплика (≤3 слова на фразу субтитра) | звук`.
- Склейки на целых/ясных моментах (3.0, 5.4), субтитр появляется за 0–0.15 с ДО звука слова, жест стартует за ~0.05 с до слова.
- Концовка: держать финальный кадр ≥0.6 с после последнего слова (TIMELINE.duration — с запасом).

### 2.2 Эпизод: scaffold
```bash
cd $STUDIO
node new-episode.mjs <ep> [--preset garage3|garage1|blank]   # создаёт episodes/<ep>/{timeline.js,sfx.mjs} из _template/<preset>; существующий не трогает
```
Имя — латиница/цифры/-/_ (идёт в `?ep=` и в имена out/<ep>.*). По умолчанию `garage3` — готовый 10-секундный эпизод на пресетах (§1); сначала отрендери его стиллы, потом переписывай.

### 2.3 TIMELINE (episodes/<ep>/timeline.js)
Перенести бит-шит в `TIMELINE` (раздел 4 — API). Правила:
- Файл — **только литералы** (`const TIMELINE = {...}`): его читает и браузер, и `node:vm` в sfx/build.mjs. Никаких функций, импортов, переменных.
- Все тайминги живут ТОЛЬКО тут: сеты и фоли читают `TIMELINE.events/poses/subs/shots`. Литерал времени в `src/` или `sfx.mjs` — ошибка проектирования.
- `shots` покрывают `[0, duration)` без дыр; каждый shot имеет `set` из реестра (`garage`, `screen`, свои).

### 2.4 Персонажи/сеты: переиспользовать или создать
- Переиспользуем общую библиотеку: персонажи `src/characters/` (tolyan, palych, sanek), предметы `src/props/` (kettle, mug, phone), сеты `src/sets/` (garage, screen, chat, stage, garazh — широкий гараж с верстаком, столом, щитком) и кисти из `rig.js` (`HANDS`: rest, fingerUp, point, kiss, spread, thumbsUp, trackpad, phone). Всё это грузится index.html для любого эпизода.
- Новое → **в папку эпизода** (`episodes/<ep>/sets/bar.js`), подключить через `TIMELINE.scripts: ['episodes/<ep>/sets/bar.js']`, в файле зарегистрировать `(window.SETS = window.SETS || {}).bar = (t, shot, st) => '<svg viewBox="0 0 720 1280" …>…</svg>'`.
  Если сет/персонаж нужен ≥2 эпизодам — тогда переносить в `src/` (не раньше).
- Общие файлы `src/` менять только обратно-совместимо: прогнать стиллы предыдущего эпизода и убедиться, что PNG байт-в-байт те же (раздел 6).
- Новая кисть: добавить в `HANDS` (rig.js) — локальные координаты, запястье в (0,0), +x вдоль предплечья.
- SVG `id` (clipPath/gradient/filter) уникальны в пределах кадра: второй экземпляр персонажа/сета в одном кадре потребует префикса id (сейчас `headclip/eyeL/eyeR/soft6/skinGlow` в tolyan-head.js — один экземпляр на кадр).

### 2.5 Стиллы (быстрый цикл, ~1 с)
```bash
FRAMES_DIR=/tmp/rv node render.mjs --ep <ep> --stills 0.5,2.1,4.9,7.6     # PNG 1440×2560 в /tmp/rv/still_<t>.png
```
Смотреть PNG (Read). Брать t: середину каждого бита, момент каждой склейки ±0.05, пик каждого жеста (t ключа + dur).
Чинить → снова стиллы. Не идти на полный рендер, пока стиллы не прошли.

### 2.6 Контакт-лист (ревью движения)
```bash
node render.mjs --ep <ep> /tmp/<ep>_preview.mp4 --preview     # = --dsf 1 --preset veryfast; ~8 с на 8-сек ролик (4.9 с захват + 1.3 с кодирование)
ffmpeg -v error -i /tmp/<ep>_preview.mp4 -vf "select=not(mod(n\,10)),scale=180:-1,tile=6x4" -frames:v 1 -y /tmp/<ep>_contact.png
```
`select=not(mod(n,10))` = каждый 10-й кадр (3 в секунду); для 30 с ролика — `mod(n,30)` и `tile=6x5`. Смотреть контакт-лист, править TIMELINE, повторять. Для проверки одного жеста — стиллы с шагом 1/30: `--stills 2.30,2.33,2.37,2.40,2.43,2.47,2.50`.

### 2.7 Полный рендер + фоли
```bash
node render.mjs --ep <ep> --sfx --final              # → out/<ep>.mp4 (+ out/<ep>.sfx.wav); ~18 с на 8 с ролика (--final = --dsf 2 --preset slow, это и умолчание)
node render.mjs --ep <ep> out/<ep>_v2.mp4 --sfx      # явное имя (версии — руками, старые не перезаписывать)
```
Только звук, без видео: `node sfx/build.mjs --ep <ep> [--out x.wav] [--dump] [--keep]`.
Флаги render.mjs: `--preview` / `--final`, `--keep-frames` (после сборки mp4 PNG-кадры удаляются автоматически — 80 с ролика ≈ 10 ГБ; `--stills` не трогает), `--jobs N` (процессы Chrome, по умолчанию 4), `--dsf N`, `--preset` (x264), `FRAMES_DIR=…`.

### 2.8 Сдача
- Проверить ffprobe и просмотреть mp4 (раздел 6).
- Отдать: `out/<ep>.mp4` + бит-шит + список изменённых общих файлов (`src/`), если были.

---

## 3. Scaffold без поломки предыдущих эпизодов

Принцип: **эпизод = данные (timeline.js, sfx.mjs) + свои сеты**; `src/` — общий движок. Предыдущие эпизоды продолжают рендериться той же командой:
```bash
node render.mjs out/x.mp4          # = --ep tolyan (дефолт)
node render.mjs --ep tolyan --sfx
```
Регрессия общего кода: после правок в `src/` — `FRAMES_DIR=/tmp/a node render.mjs --stills 0.5,2.1,4.9,7.6` до и после, `cmp` PNG попарно (ожидание: identical; допустимая причина отличий — только намеренное изменение рисунка).

Что НЕ делать: не держать второй TIMELINE в `src/`, не хардкодить секунды в сетах (`screen.js` читает `E.typing/E.reply/E.cursor`), не писать функции в timeline.js.

---

## 4. API reference

### 4.1 TIMELINE (episodes/<ep>/timeline.js)
```js
const TIMELINE = {
  duration: 8.0,                        // с; кадров = round(duration*30)
  scripts: ['episodes/<ep>/sets/x.js'], // (опц.) доп. скрипты эпизода, грузятся после src/characters и src/sets
  shots: [                              // покрывают [0,duration); последний shot — fallback
    { id: 'wide', set: 'garage', from: 0, to: 3.0,
      cam: [[0, 360, 690, 1.2], [3.0, 364, 676, 1.3]],  // [t, cx, cy, scale] × 2 — easeInOut-наезд между ключами
      rainbow: true,                    // (опц.) крупный план: радужная подсветка лица + шок (E.shock), look=0
      shakeIn: 6 },                     // (опц.) тряска камеры px, затухает за 0.25 с от shot.from
  ],
  subs: [ { from, to, words: [['Так.', 0.35], ['Claude,', 0.9]] } ],   // слово видно с words[i][1]; последнее — жёлтое (.hl)
  talk:  [[a, b], ...],                 // окна шевеления рта
  badges: [{ from, to, name, role, color, x, y, rot }],                 // плашка-имя (HTML), pop 0.38 с easeOutBack
  events: {                             // все необязательные; читают charState/сеты/фоли
    blink: [t, ...],                    // моргание 0.12 с
    kiss: [a, b], bliss: [a, b],        // губы трубочкой; блаженно закрытые глаза
    typing: [a, b], reply: [a, b], cursor: [a, b],   // сет screen: точки печати, текст по буквам, курсор к кнопке
    click: t, boom: t,                  // клик; «взрыв» (тряска 14px/0.35 с, вспышка, кислотный сайт на экране)
    shock: [a, b],                      // шок (только в shot.rainbow): глаза, брови, спичка падает (a…a+0.7)
  },
  poses: { L: [...], R: [...], head: [...] },   // см. 4.2
};
```
Единицы: секунды, пиксели сцены 720×1280 (центр сцены 360,640), градусы.

### 4.2 Позы (src/rig.js)
Ключ руки `{ t, wrist:[x,y], hand, rot, layer, dur?, elbow?, bend?, arc?, sweep?, bob?, jiggle? }`:
- `t` — старт движения В эту позу; приезд через `dur` (по умолчанию `RIG.dur` = 0.18). До первого ключа — первый ключ.
- `hand` — имя из `HANDS`; `rot` — поворот кисти относительно предплечья (°).
- `layer`: `behind` (до стола/ноута) | `front` (поверх) | `desk` (рукав behind, кисть front). Во время перехода, если любой конец `front`, рисуется front.
- `elbow:[x,y]` — явный локоть (иначе IK), `bend ±1` — сторона сгиба IK; `arc 0..1` — доля дуги вокруг плеча при переходе (1 по умолчанию), `sweep ±1` — направление дуги.
- `bob` — доля покачивания корпуса для запястья (0 лежит на столе, 1 у лица; по умолчанию .4); `jiggle` — амплитуда «печатающего» дрожания.
- Переход: `snap(k)` = easeInOut, сжатый к 85 % + перелёт 6 %. Плечи: L (226,812), R (494,812); длины 98+104.
Голова: `head: [{ t, tilt, dur? }]` — наклон (°) вокруг шеи (360,700).
Состояние персонажа (`charState`): `lid` (веко 0..1), `pr` зрачок, `brow`, `mouth`, `shock`, `bob`, `look`, `bliss`, `tilt`, `arms{L,R}`.

### 4.3 Сеты и реестр
`SETS.<name> = (t, shot, st) => '<svg viewBox="0 0 720 1280" width="720" height="1280" …>…</svg>'`.
`garage(t, st, rainbow)` рисует персонажа (`tolyan(st)`) между фоном и столом, руки front — после ноутбука (`armsSvg(st.arms,'front')`).
Свой сет с персонажем ОБЯЗАН вызвать `${tolyan(st)}` (торс + руки слоя behind/desk-рукава) и затем `${armsSvg(st.arms, 'front')}` после предметов переднего плана — иначе поднятые руки (layer front) не отрисуются (проверено: без этого вызова жест fingerUp пропадает). `screen(t)` — ноутбук крупно, персонаж не нужен. Детерминизм: только `t` и `rng(seed)`; никакого `Math.random`/`Date`.

### 4.4 Фоли (episodes/<ep>/sfx.mjs + sfx/build.mjs)
```js
export function cues(TL) { return [ { id, type, t | every:{from,to,step}, align?:'end', db, dbs?, pan?, rates?, jitter?:{gain,rate}, …recipe params } ]; }
export const SAMPLE_RATE = 48000, PEAK_CEILING_DB = -3;   // опц.
```
- Времена брать из `TL`: `E.click`, `TL.shots[i].from`, помощники `pose('fingerUp')`, `word('красиво', 1)`; суммы — через `r(x)` (округление до мс), иначе `3.15+.2 = 3.3499…`.
- Рецепты (`type`): `room`(rms, duck{from,to,level,fadeDown,fadeUp}) `tick` `bloop` `whoosh`(f,w) `mwah` `sparkle` `whooshCut`(align:'end') `blip` `textTick` `click` `boom` `fanfare`(cutAt,bpm,root) `slideWhistle` `woodTick` `ding`. Новый рецепт — в `RECIPES` build.mjs (lavfi `aevalsrc` выражение → `[m]`).
- Порядок кью важен: jitter берёт общий seeded RNG по порядку. `db` — пиковый уровень после нормализации к 0 dBFS; финальный лимитер −3 dB.
- `node sfx/build.mjs --ep <ep> --dump` печатает таблицу ударов (id, delay в сэмплах, db, rate, pan) — diff двух dump'ов доказывает, что ретайминг/рефакторинг звук не поменял; `md5 out/<ep>.sfx.wav` — полное доказательство (сборка байт-детерминирована).

### 4.5 Озвучка (TIMELINE.voice → voice/build.mjs → episodes/<ep>/voice.js + voice/mix.wav)
```js
voice: {
  cast: { tolyan: '7076e45ce3234fd49ef40ffbd5a3f0cd' },      // персонаж → id голоса Fish Audio («Харизматичный дед-разработчик», хриплый дед, ru)
  lines: [
    { id: 'l1', t: 0.5, who: 'tolyan', text: '[устало] Так, мужики.' },               // t — старт реплики; длительность — из mp3
    { id: 'l2', t: 3.0, who: 'tolyan', text: '[зло] Ну… красиво, блин.', sub: 'Ну… красиво, бл*н', split: [1, 2] },
  ],
},
```
- `text` — что произносит TTS. Теги в квадратных скобках `[устало]`, `[с гордостью]`, `[шёпотом]` — режиссёрские ремарки fish-audio/drama-3, не озвучиваются и в субтитры не идут. На тег вроде `[устало]` модель может дорисовать вздох после слов — он на 12+ dB тише речи, build считает его `breath` (не слово и не рот), но он есть в аудио: оставляй ≥0.5 с до следующей реплики.
- `sub` — текст субтитра вместо `text` (цензура мата и т.п.); слов столько же, сколько сказано — тогда тайминги 1:1. `split` — число слов в каждой фразе субтитра (иначе автоматом: ≤3 слов и ≤24 символов).
- Если в TIMELINE **нет** `subs`/`talk`, они берутся из озвучки (`VOICE.subs`, речевые окна `[a, b, who]`). Ручные `subs`/`talk` в TIMELINE имеют приоритет (так работает `tolyan`).
- `charState(t, shot, who)`: окно talk с `who` шевелит рот только этому персонажу; окно без `who` — любому. `st.who` доступен сетам — для будущих сетов с двумя персонажами.

```bash
node --env-file=.env voice/build.mjs --ep <ep> [--check]   # TTS только для новых реплик (кэш hash(model+voice+text) в episodes/<ep>/voice/<hash>.mp3 + .json)
node --env-file=.env render.mjs --ep <ep> out/<ep>_vN.mp4 --voice --sfx   # build озвучки (без API, если всё в кэше) → фоли под речью −6 dB → AAC
```
Что делает build: ffprobe длительность; `silencedetect` (−35 dB, ≥80 мс) → речевые окна → `talk`; слова раскладываются по слогам (русские гласные) вдоль речевого времени (паузы выброшены) → `words: [[слово, t]…]`; фразы субтитров; стем `voice/mix.wav` 48 кГц стерео, каждый клип к −16 LUFS, лимитер −1 dBFS. Предупреждает, если реплика наезжает на следующую того же персонажа или вылезает за `duration`.
`--check`: каждый ещё не проверенный клип → speech-to-text (`openai/gpt-transcribe`, только текст, без таймстемпов) → diff по словам с `text` без тегов (`-ожидалось +услышано`). Результат кэшируется в `<hash>.json`, повторный `--check` ничего не шлёт. Расхождение — только сигнал: перегенерация руками (поменять текст/тег → новый hash).

**Без ключа** (стиллы/превью нового эпизода): `voice/build.mjs` не зовёт API — реплики из кэша как обычно, а некэшированные становятся заглушками: длительность по слогам (≈0.13 с/слог), субтитры и окна рта по оценке, `file: null`, аудио в стем не идёт, в кэш ничего не пишется. `render.mjs` без `--voice` собирает voice.js так автоматически (`voice/build.mjs --ep <ep> --no-api`), если его ещё нет; `--no-api` (или `VOICE_NO_API=1`) гарантирует ноль вызовов TTS даже при ключе. Появился ключ — `node --env-file=.env voice/build.mjs --ep <ep>` сгенерирует только недостающие, после чего пересмотри раскладку шотов под реальные длительности.

API (ключ `OPENROUTER_API_KEY` **или** `FISH_AUDIO_API_KEY` в `.env`, запускать через `node --env-file=.env`; `--provider fish|openrouter` — выбрать явно; модель одна — drama-3, кэш общий; `--check` только через OpenRouter):
- TTS: `POST https://openrouter.ai/api/v1/audio/speech` JSON `{ model: 'fish-audio/drama-3', input, voice: <fish id>, response_format: 'mp3' }` → mp3 44.1 кГц моно.
- STT: `POST https://openrouter.ai/api/v1/audio/transcriptions` JSON `{ model: 'openai/gpt-transcribe', input_audio: { data: <base64 wav>, format: 'wav' }, language: 'ru' }` → `{ text }`.
Деньги: копейки, но не ноль — никаких циклов по API, никакой перегенерации неизменённых реплик. Ключ не печатать и не копировать; `.env` в шаблон скилла не синхронизируется.

Каверзы: voice.js — сгенерированный файл, руками не править (правь timeline.js, пересобирай). Нет voice.js → render.mjs соберёт его без API (заглушки, см. выше); если сборка невозможна, рендерит без озвучки (`?voice=0`), картинка без субтитров. `sfx.mjs` получает `cues(TL, VOICE)` — тайминги слов для ударов брать из `VOICE.lines[].words` (VOICE = null, пока озвучка не собрана; на tolyan не влияет). Пустой список cues допустим (тихая дорожка).

### 4.6 Чат Claude (set `chat`, src/sets/chat.js)
Ноутбук крупно (материалы screen.js), но экран — одно окно чата Claude на всю ширину: шапка, лента сообщений (новые снизу, старые уезжают вверх), строка ввода. Лог **сквозной на весь эпизод**: состояние экрана в момент t — чистая функция t, любой shot `{ set:'chat' }` показывает лог в этот момент; камера — обычный `cam` кадра (наезд на сообщение = cam).
```js
shots: [{ id: 's8', set: 'chat', from: 18, to: 22, cam: [[18, 360, 700, 1.02], [22, 360, 696, 1.06]], sleeve: '#6b6a3c', skin: '#eab184', wrap: 22 }],
chat: [                                                              // только литералы, порядок = порядок в ленте
  { id: 'm0', t: 0,    from: 'claude', text: 'Вы отключались.', pinned: true },   // висит с самого начала, без анимации
  { id: 'u1', t: 18.2, from: 'user',   text: 'идею на миллион' },                // Палыч печатает в строке ввода с t (speed симв/с, 11),
                                                                                  // отправка sendAt (по умолчанию последняя клавиша + 0.3) → пузырь прыгает в ленту
  { typing: [20.0, 21.0] },                                                       // «печатает…» (три точки) в окне [a,b)
  { id: 'm1', t: 21.0, from: 'claude', text: 'Уточните: миллион чего?' },         // появляется в t (pop); type:'typed' — печатная машинка (speed, 45)
  { id: 'm5', t: 35.8, from: 'claude', text: 'Рынок: все. Клиенты уже дышат.', button: 'Запустить' },   // кнопка в сообщении
  { t: 36.4, button: 'Запустить', in: 'm5' },                                     // …или кнопка появляется позже
  { cursor: [39.0, 39.6], to: 'm5' },  { click: 39.75 },                          // курсор едет к кнопке m5, клик (кнопка вдавливается 0.15 с)
  { progress: { from: 39.9, to: 40.5, pct0: 0, pct1: 37, label: 'Запуск…' } },   // «Запуск… ▓▓▓░░░░ 37 %» ползёт, экран мерцает
  { off: [40.5, 47.0] },                                                          // экран выключен (чёрный + блик, сцена темнеет)
  { id: 'm9', t: 64.9, from: 'claude', text: 'Готово.' },
],
```
- Текст: Rubik 700 20 px, перенос по словам ≤ `wrap` символов (22; у сообщения свой `wrap`). Мат пишется уже с цензурой («бл*дь»). `₽` рисуется составным глифом (в woff2 его нет) — просто пиши `₽`. `&`/`<` экранируются.
- Кнопка: `button` у сообщения или отдельный `{ t, button, in }`; курсор `{ cursor:[a,b], to }` едет из правого края к кнопке и виден до клика + 0.9 с (или b + 1 с, или ближайшего `off`); `{ click: t }` давит кнопку последнего курсора. Рука Палыча: на клавишах, пока печатает (подпрыгивает на клавишах), на тачпаде за курсором, иначе отдыхает на тачпаде; `shot.sleeve`/`shot.skin` — цвета рукава/кожи.
- Фоли: `chatSchedule(TL.chat)` — чистый помощник без DOM, тот же, что рисует кадр. Из `episodes/<ep>/sfx.mjs`:
  ```js
  import { createRequire } from 'node:module';
  const { chatSchedule } = createRequire(import.meta.url)('../../src/sets/chat.js');
  const ev = chatSchedule(TL.chat).events;      // [{ t, kind, id, ch? }], по t, мс
  // kind: key (каждая клавиша, ch — символ) | send | pop | char (буквы typed-ответа) | typingStart | typingEnd | button | cursorStart | click | progressStart | progressEnd | off | on
  { id: 'keys', type: 'textTick', t: ev.filter(e => e.kind === 'key' && e.ch !== ' ').map(e => e.t), db: -18, jitter: { gain: 3, rate: .15 } },
  { id: 'pop',  type: 'blip',     t: ev.filter(e => e.kind === 'pop').map(e => e.t), db: -15 },
  ```
  `.msgs[i].at` — момент появления сообщения в ленте (для user — отправка), `.keys` — моменты клавиш, `.offs` — окна выключения.
- Проверка: стиллы на середине печати (строка ввода с кареткой), на `sendAt` + 0.1 (прыжок пузыря), на `typing`, на клике (`click` + 0.05 — вдавленная кнопка), внутри `progress`, внутри `off`.

- **Крупность текста на весь эпизод:** `TIMELINE.chatStyle = { fs, lh, wrap }` (по умолчанию 20 / 26 / 22). Для вертикали «как в референсе» — `{ fs: 27, lh: 34, wrap: 17 }`. Камеру на чат-шотах не поднимать выше ~1.1: при большем масштабе обрезаются края экрана (крупность — через fs, а не через cam).

### 4.7 Несколько персонажей / сет `stage` (src/sets/stage.js, реестр CHARS)
Один кадр — несколько персонажей из реестра `CHARS` на заднике/переднем плане эпизода. Каждый персонаж живёт в своей локальной системе 720×1280 (как Толян: голова ≈ 360,590, плечи y≈800) и размещается в мире `translate(x,y)` + `scale(s)` вокруг (360,1280). Мир может быть шире кадра (overflow visible), `shot.cam` — в мировых px (`cx` < 0 — нормально для двушки слева).

```js
const TIMELINE = {
  // scripts: ['episodes/<ep>/art/<who>.js'],                    // только СВОИ персонажи/предметы; Палыч, Санёк, гараж и пропы уже в src/
  stage: { back: 'garazhBack', front: 'garazhFront' },           // умолчания для shot.back/front: глобальные функции (t, env) → SVG; короче — { preset: 'garage3' } (§1.1)
  shots: [
    { id: 'wide', set: 'stage', from: 0, to: 2, cast: ['tolyan', 'sanek', 'palych'], cam: [[0, 360, 700, .95], [2, 360, 690, 1]] },
    { id: 'twoL', set: 'stage', from: 2, to: 3.5, cast: ['tolyan', { who: 'palych', s: 1.05 }], cam: [[2, 200, 690, 1.15], [3.5, 200, 680, 1.2]] },
    { id: 'dark', set: 'stage', mode: 'blackout', phoneLight: true, from: 6, to: 8, cast: ['tolyan', 'sanek', 'palych'], cam: [[6, 360, 690, 1], [8, 360, 690, 1]] },
  ],
  env: {                                                         // любые ключевые треки → env на кадр → back/front/пропы
    lamp: [{ t: 0, swing: 0, bright: 1 }, { t: 6, bright: 0, swing: 0, dur: .1 }, { t: 7, bright: 1, swing: 6, dur: .3 }, { t: 7.3, swing: -4, dur: .4 }],
    kettleOn: [{ t: 0, v: 0 }, { t: 1.5, v: 1 }], breaker: [{ t: 0, v: 0 }, { t: 6, v: 1 }], plug: [{ t: 0, v: -1 }, { t: 5, v: 0 }, { t: 5.2, v: 1, dur: .07 }],
    mugs: [{ t: 0, v: 0 }, { t: 3, v: 1 }], laptopOn: [{ t: 0, v: true }, { t: 6, v: false }],
  },
  cast: {
    tolyan: { at: { x: -250, y: 40, s: .85 },                    // размещение по умолчанию (shot.cast: 'who' | {who,x,y,s,flip})
      poses: { L: [{ t: 0, wrist: [330, 850], hand: 'spread', rot: 50, layer: 'front', bend: 1, prop: 'kettle', bob: .6 }], R: [...], head: [...] },
      events: { blink: [1.0, 4.0], shock: [[5.2, 5.9]], bliss: [[7, 8]], kiss: [[2, 2.3]], matchDrop: [5.2], matchBack: [7] } },
    palych: { poses: {...}, tracks: { glasses: [{ t: 0, v: 0 }, { t: 3.8, v: 1, dur: .25 }], lid: [{ t: 0, v: .52 }, { t: 4, v: .7 }] },
      events: { shock: [[5.2, 5.9]] } },
    sanek: { at: { x: 300, y: 20, s: .88 },
      poses: { L: [{ t: 0, wrist: [330, 830], hand: 'phone', rot: 20, layer: 'front', bend: 1, prop: 'phone' }], R: [...] },
      tracks: { gaze: [{ t: 0, v: [0, 1] }, { t: 1.2, v: [0, -1], dur: .3 }], glow: [{ t: 0, v: 1 }] },
      events: { squint: [[7.5, 8]] } },
  },
};
```
- **Персонаж** `CHARS.<who> = { rig, anchors, body(st, P), head(st, P), nose?(st) }` (`src/characters/` регистрирует `tolyan`, `palych`, `sanek`; новых — в `episodes/<ep>/art/`). `anchors = { head:[x,y], mouth:[x,y], chest:[x,y], desk: y }` — якоря пресетов камеры и поз (§1). `body` — торс без рук, `head` — голова БЕЗ наклона: руки (`armsSvg`) и поворот головы на `st.tilt` вокруг (360,700) рисует движок. `P` — префикс SVG-id (`${P}eyeL`…), чтобы двое делили кадр. `rig = { L:{shoulder,len,bend}, R:{…}, sleeve, stripe (null = без полосы), skin, crease, width, dur }` — пропущенное берётся из рига Толяна.
- **Состояние** `charState(t, shot, who)` по `TIMELINE.cast[who]`: `poses` как в 4.2; `events`: `blink [t…]` (нет — автоморгание ~3.3–4.9 с со сдвигом по имени), `shock/bliss/squint/kiss` — окна `[a,b]` или `[[a,b],…]`, шок работает в любом кадре (сдержанно), `matchDrop/matchBack` — спичка Толяна (по умолчанию падает в начале каждого shock); `tracks.<поле>` — любые ключи `{t, v, dur?}` → `st.<поле>` (числа/массивы/объекты из чисел — snap-интерполяция, dur по умолчанию .18, строки — переключение); `lid`, `look`, `glow`, `squint` — переопределяют умолчания. Дыхание (`bob`) у каждого со своей фазой (`cast[who].phase` 0..1 — вручную). Рот шевелится только у говорящего (`talk [a,b,who]` из озвучки).
- **Предметы в кисти**: ключ позы `prop:'kettle'|'mug'|'phone'|null` (+ `propRot`, `propOffset:[dx,dy]` в системе кисти: x вдоль предплечья, y вниз). Реестр `PROPS.<name>` — функция `(x, y, ang, st, t, env) → SVG` или `{ draw, offset, rot, upright }` (`upright` — поворот абсолютный, предмет не крутится с рукой). Рисуется сразу после кисти в её слое. Пока предмет в кисти, `env.<name> = { at:'hands', by: who }` (garazhFront не рисует чайник на полке). Телефон в кисти ⇒ `st.glow = 1` у держателя (переопределить `tracks.glow`). Пример регистрации: `src/props/registry.js`.
- **Блэкаут** `shot.mode:'blackout'`: чёрный мир + `blackoutLayer(t, nose, phone, P)` (общая, src/props/garage-props.js; своя — по имени `shot.blackout`/`TIMELINE.stage.blackout`). Нос — `shot.nose [x,y,r]` или `CHARS[who].nose(st)` первого персонажа каста, у которого он есть (Толян: позиция с учётом bob/look/tilt/размещения). `phoneLight: true` — круг света из кисти с `prop:'phone'`; `[x,y]` или `{x, y, r: 230, dim: .5}` — явно. Со светом сцена рисуется целиком и накрывается чёрным с мягким окном (в центре видна на `1 − dim`). Пост-эффекты (`#warm/#haze/#vignette`) ложатся и на чёрный кадр.
- Порядок отрисовки: back → для каждого из `cast` по порядку: body, руки behind (+рукава desk), голова → front → для каждого: руки front (+кисти desk) и предметы. Порядок `scripts` важен: файл, определяющий общие функции, — раньше использующих (общие `kEye`, пропы и `garazhBack/Front` уже загружены из src/).
- Одиночный путь (`TIMELINE.poses/events`, сет `garage`, `tolyan(st)`) не тронут: эпизод `tolyan` рендерится байт-в-байт.

---

## 5. Команды — шпаргалка
```bash
node new-episode.mjs <ep> --preset garage3                               # стартер на пресетах (garage3 | garage1 | blank)
FRAMES_DIR=/tmp/rv node render.mjs --ep <ep> --stills 0.5,2.1            # стиллы (voice.js соберётся сам без API)
node render.mjs --ep <ep> /tmp/p.mp4 --preview                           # превью (= --dsf 1 --preset veryfast)
ffmpeg -v error -i /tmp/p.mp4 -vf "select=not(mod(n\,10)),scale=180:-1,tile=6x4" -frames:v 1 -y /tmp/contact.png
node render.mjs --ep <ep> --sfx --final                                  # финал → out/<ep>.mp4 (кадры .frames удаляются; --keep-frames — оставить)
node sfx/build.mjs --ep <ep> --dump                                      # таблица ударов фоли
node --env-file=.env voice/build.mjs --ep <ep> --check                   # озвучка: TTS новых реплик + проверка STT → voice.js, voice/mix.wav
node --env-file=.env render.mjs --ep <ep> out/<ep>_vN.mp4 --voice --sfx  # финал с озвучкой (фоли приглушены под речью)
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,nb_frames,duration,sample_rate,channels -of compact out/<ep>.mp4
```

---

## 6. Чек-лист проверки

**Перед полным рендером**
- [ ] Стиллы на середине каждого бита и ±0.05 с от каждой склейки просмотрены; нет «пустых» субтитров (первое слово `words[0][1]` должно равняться `from`, иначе рамка без текста).
- [ ] `shots` покрывают `[0, duration)`, `set` каждого есть в реестре (иначе render бросает `неизвестный set`, render.mjs падает с текстом ошибки).
- [ ] `events`/`poses`/`subs`, на которые ссылается `sfx.mjs`, существуют (`node sfx/build.mjs --ep <ep> --dump` отрабатывает без исключений).
- [ ] В `src/` не появилось литералов времени эпизода; `timeline.js` — только литералы (проверка: `node sfx/build.mjs --ep <ep> --dump`).

**После рендера — ffprobe ожидания**
- [ ] video: `h264`, `720x1280`, `r_frame_rate=30/1`, `nb_frames = round(duration*30)` (8.0 с → 240), `duration = TIMELINE.duration`.
- [ ] audio (с `--sfx`): `aac`, `48000`, `channels=2`, duration = video duration (±0.05).
- [ ] с `--voice`: лог `voice: N реплик (0 новых)` на повторной сборке (иначе что-то не кэшируется), без предупреждений о наложении; стиллы на `words[i][1]` показывают нужное слово, рот открыт внутри `talk`.
- [ ] консоль: `captured N frames`, `encode …s`, `→ + sfx`; без `render:` ошибок.
- [ ] `out/<ep>.sfx.wav`: лог сборки `peak ≈ -3.0 dB` (лимитер), `mean` −20…−26 dB для разговорного ролика.

**Контакт-лист / просмотр**
- [ ] Склейки совпадают со звуком (вуш/бум) — проверять кадры `shot.from*30 ± 1`.
- [ ] Руки не «проваливаются» сквозь стол/ноут: слой `layer` на каждом ключе осознан; переходы через ноутбук — `front`.
- [ ] Нет фризов: каждая секунда содержит хоть одно изменение (поза/голова/субтитр/камера).
- [ ] Субтитр помещается в одну строку (`.sub` — `white-space: nowrap`, 34px Rubik 800: ≤ ~24 символов).

**Известные режимы отказа**
- `--stills` последним аргументом / без значения → `render: --stills требует значение`.
- Нет ffmpeg → `ffmpeg не найден в PATH`; нет Chrome → `не удалось запустить Chrome`.
- `FRAMES_DIR` указывает на каталог с посторонними файлами → рендер отказывается его чистить (намеренно).
- Параллельные скриншоты вкладок ОДНОГО Chrome в headless виснут навсегда — поэтому `--jobs` = отдельные процессы Chrome; не «оптимизировать» обратно.
- ±1 LSB-шум в ~3–5 % кадров между двумя прогонами (растеризация градиентов в Chrome, PSNR > 57 dB): норма, после x264 CRF 17 неотличимо. Байт-идентичность стиллов для регрессии проверять на 4–6 фиксированных t (они стабильны), не на всех 240 кадрах.
- Ленивые шрифты: первый кадр с текстом мог уйти с fallback-шрифтом; render.mjs теперь грузит все `document.fonts` до съёмки — при добавлении нового шрифта просто дописать `@font-face` в fonts/fonts.css.
- Длинный ролик (>30 с) при DSF 2: ~1.5 МБ на кадр PNG → 900 кадров ≈ 1.4 ГБ в `.frames` — ставить `FRAMES_DIR` на диск с местом или рендерить с `--dsf 1` для превью.
