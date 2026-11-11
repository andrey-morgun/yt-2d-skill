// ─── пресеты: раскладка сцены (stage), камера (cam) и позы (pose) ──────────────────────────────────
// Главный API для нового эпизода: сцена из пресета, камера строкой, позы по имени. Сырые координаты
// ([[t,cx,cy,s],…], wrist:[x,y]) по-прежнему работают — это «аварийный выход», пресеты раскрываются ровно в них.
//
// 1) TIMELINE.stage = { preset: 'garage3' | 'garage1' | 'blank', …переопределения }
//    garage3 — гараж garazh: Толян у верстака слева, Палыч за столом с ноутом в центре, Санёк справа.
//    garage1 — тот же гараж, один (любой) персонаж за столом Палыча.
//    blank   — ничего: back/front/cast задаёт эпизод (как garazh до пресетов).
//    Поля пресета: back/front/blackout (имена функций), cast { who: {x,y,s,flip} } (размещения по умолчанию),
//    default {x,y,s} (размещение персонажа, которого нет в cast), wide [cx,cy,s] (общий план), points { laptop:[x,y], … }
//    (мировые точки для pose point/reach `at:'laptop'`). Любое поле можно переопределить прямо в TIMELINE.stage,
//    размещение персонажа — в TIMELINE.cast[who].at или в shot.cast: [{ who, x, y, s }].
//
// 2) shot.cam — строка или объект { preset, push?, dx?, dy?, s?, cx?, cy? } (или массив, как раньше):
//    'wide'            общий план: wide раскладки, иначе по головам каста (центр между крайними, масштаб по разбросу)
//    'two:<a>+<b>'     двушка: центр между головами a и b, s 1.12
//    'cu:<who>'        крупный план лица: центр — anchors.head персонажа, s 2.3 / масштаб размещения
//    'cu+:<who>'       ещё крупнее (2.6)
//    'mid:<who>'       средний план одного: центр — anchors.chest, s 1.5
//    'screen'          чат/ноутбук (set chat: [360,600,1.06]; set screen: [360,700,1.02])
//    'screen+'         чат ближе к сообщению/кнопке (set chat: [360,660,1.14])
//    Внутри шота камера сама медленно наезжает: +6 % масштаба (push) и дрейф cy −6 px — по стайлгайду §5.
//    dx/dy — сдвиг центра (мировые px), s — свой масштаб, push — доля наезда (0 = статично).
//    Повторить ручные кадры garazh: 'two:tolyan+palych' + dx −45; 'two:sanek+palych' + dx 30; блэкаут — { preset:'two:tolyan+palych', dx:-35, dy:20, s:1.3 }.
//
// 3) Ключ позы { t, pose:'<имя>', …переопределения } в TIMELINE.cast[who].poses.L/R (и TIMELINE.poses.L/R одиночного пути):
//    rest        кисть на столе (anchors.desk)           typing     печатает за ноутом (behind, jiggle)
//    fingerUp    палец вверх у лица — «внимание!»        spread     раскрытая ладонь перед собой — «ну смотри»
//    point       указать: at:'laptop' | '<who>' | [x,y] (мировые px) | 'left'|'right'|'up'|'down'|'screen'
//    reach       тянуться щепоткой к точке (at как у point): вилка к розетке, кнопка
//    kiss        chef's kiss у рта                       thumbsUp   deadpan 👍 перед грудью
//    hold        предмет в руке: prop:'kettle' (по умолчанию) | 'mug'   sip   кружка ко рту (prop mug)
//    phoneWaist  телефон у пояса (Санёк)   phoneUp   телефон над головой   phoneChin   фонарик у подбородка   phoneDown   телефон опущен
//    down        рука убрана под кадр (для крупных планов)
//    Пресет считается от рига персонажа (плечи) и его anchors; для правой руки (R) зеркалится (x, rot, bend, sweep).
//    Явные поля ключа (wrist, rot, layer, dur, prop, bob, …) перекрывают пресет.
//    Голова: head: [{ t, pose:'nod' | 'shake' | 'left' | 'right' | 'level' }] — nod/shake раскрываются в 2–3 ключа.
//
// Персонаж объявляет CHARS.<who>.anchors = { head:[x,y], mouth:[x,y], chest:[x,y], desk: y } (локальные координаты 720×1280);
// без anchors берутся якоря Толяна.

const STAGE_PRESETS = {
  garage3: {
    back: 'garazhBack', front: 'garazhFront', blackout: 'blackoutLayer',
    cast: { tolyan: { x: -250, y: 40, s: .85 }, palych: { x: 0, y: 0, s: 1 }, sanek: { x: 300, y: 20, s: .88 } },
    default: { x: 0, y: 0, s: 1 },
    wide: [360, 700, .98],
    points: { laptop: [360, 870], kettle: [40, 938], socket: [-330, 700], breaker: [655, 410], lamp: [360, 168] },
  },
  garage1: {
    back: 'garazhBack', front: 'garazhFront', blackout: 'blackoutLayer',
    cast: {}, default: { x: 0, y: 0, s: 1 },
    wide: [360, 690, 1.2],
    points: { laptop: [360, 870], kettle: [40, 938], socket: [-330, 700], breaker: [655, 410], lamp: [360, 168] },
  },
  blank: { cast: {}, points: {} },
};
const DEFAULT_ANCHORS = { head: [362, 612], mouth: [362, 690], chest: [360, 800], desk: 932 };

let _layout = null;
// раскладка сцены: пресет TIMELINE.stage.preset + переопределения из TIMELINE.stage (считается один раз)
function stageLayout() {
  if (_layout) return _layout;
  const SG = TIMELINE.stage || {};
  let P = {};
  if (SG.preset) {
    P = STAGE_PRESETS[SG.preset];
    if (!P) throw new Error(`stage.preset "${SG.preset}" неизвестен (есть: ${Object.keys(STAGE_PRESETS).join(', ')})`);
  }
  _layout = { ...P, ...SG, cast: { ...(P.cast || {}), ...(SG.cast || {}) }, points: { ...(P.points || {}), ...(SG.points || {}) } };
  return _layout;
}

// размещение персонажа вне конкретного шота (умолчания раскладки / TIMELINE.cast[who].at)
const charAnchors = who => (CHARS[who] && CHARS[who].anchors) || DEFAULT_ANCHORS;
const placementOf = (who, cast) => {
  const m = (cast || []).map(x => typeof x === 'string' ? { who: x } : x).find(x => x.who === who) || { who };
  return stagePlacement(m);
};
// мировая точка → локальные координаты персонажа (обратное к stagePlacement().toWorld)
const toLocal = (pl, [wx, wy]) => [360 + (wx - pl.x - 360) / pl.sx, 1280 + (wy - pl.y - 1280) / pl.s];

// ── камера ──
const CAM_PUSH = .06, CAM_DRIFT = [0, -6];
const _cams = new Map();
function resolveCam(shot) {
  if (Array.isArray(shot.cam)) return shot.cam;
  let c = _cams.get(shot);
  if (!c) { c = buildCam(shot); _cams.set(shot, c); }
  return c;
}
function buildCam(shot) {
  const o = typeof shot.cam === 'string' ? { preset: shot.cam } : (shot.cam || {});
  const preset = o.preset || (shot.set === 'chat' || shot.set === 'screen' ? 'screen' : 'wide');
  const [kind, arg] = preset.split(':');
  const LY = stageLayout(), cast = shot.cast || [];
  const need = who => {
    if (!CHARS[who]) throw new Error(`shot "${shot.id}": cam "${preset}" — персонаж "${who}" неизвестен (есть: ${Object.keys(CHARS).join(', ')})`);
    if (shot.set === 'stage' && cast.length && !cast.some(x => (typeof x === 'string' ? x : x.who) === who))
      throw new Error(`shot "${shot.id}": cam "${preset}" — "${who}" нет в cast этого шота`);
    const pl = placementOf(who, cast), A = charAnchors(who);
    return { pl, head: pl.toWorld(A.head), chest: pl.toWorld(A.chest) };
  };
  let cx, cy, s, push = o.push ?? CAM_PUSH;
  if (kind === 'wide') {
    if (LY.wide && !o.s) [cx, cy, s] = LY.wide;
    else {
      const xs = cast.map(x => need(typeof x === 'string' ? x : x.who).head[0]);
      const lo = xs.length ? Math.min(...xs) : 360, hi = xs.length ? Math.max(...xs) : 360;
      cx = (lo + hi) / 2; cy = 700; s = clamp(1.2 - (hi - lo) * .0004, .9, 1.25);
    }
  } else if (kind === 'two') {
    const [a, b] = (arg || '').split('+');
    if (!a || !b) throw new Error(`shot "${shot.id}": cam 'two:<who>+<who>' — ожидались два имени, получено "${preset}"`);
    const A = need(a), B = need(b);
    cx = (A.head[0] + B.head[0]) / 2; cy = 700; s = 1.12;
  } else if (kind === 'cu' || kind === 'cu+' || kind === 'mid') {
    if (!arg) throw new Error(`shot "${shot.id}": cam '${kind}:<who>' — не указан персонаж`);
    const C = need(arg), base = kind === 'cu' ? 2.3 : kind === 'cu+' ? 2.6 : 1.5;
    [cx, cy] = kind === 'mid' ? C.chest : C.head; s = base / C.pl.s;
  } else if (kind === 'screen' || kind === 'screen+') {
    const chat = shot.set !== 'screen';
    [cx, cy, s] = kind === 'screen' ? (chat ? [360, 600, 1.06] : [360, 700, 1.02]) : (chat ? [360, 660, 1.14] : [360, 700, 1.1]);
    if (!chat && o.push == null) push = .08;
  } else throw new Error(`shot "${shot.id}": неизвестный пресет камеры "${preset}" (wide | two:a+b | cu:who | cu+:who | mid:who | screen | screen+)`);
  cx = (o.cx ?? cx) + (o.dx ?? 0); cy = (o.cy ?? cy) + (o.dy ?? 0); s = o.s ?? s;
  const r = x => Math.round(x * 1000) / 1000;
  return [[shot.from, r(cx), r(cy), r(s)], [shot.to, r(cx + CAM_DRIFT[0]), r(cy + CAM_DRIFT[1]), r(s * (1 + push))]];
}

// ── позы ──
// Пресеты записаны для ЛЕВОЙ руки (sh — плечо L персонажа, A — его anchors, k — исходный ключ); правая зеркалится.
// Функции получают ctx = { sh, A, k, who, pl, side } и возвращают поля ключа без t.
const POSES = {
  rest:     ({ sh, A }) => ({ wrist: [sh[0] + 30, A.desk + 8], hand: 'rest', rot: -52, layer: 'desk', bob: 0 }),
  typing:   ({ sh, A }) => ({ wrist: [sh[0] + 16, A.desk - 32], hand: 'rest', rot: -30, layer: 'behind', jiggle: 2.5 }),
  fingerUp: ({ sh, A }) => ({ wrist: [sh[0] - 30, A.mouth[1] - 42], hand: 'fingerUp', rot: 0, layer: 'front', bend: -1, sweep: 1, bob: 1 }),
  spread:   ({ sh }) => ({ wrist: [sh[0] + 74, sh[1] + 48], hand: 'spread', rot: 40, layer: 'front', bend: 1 }),
  kiss:     ({ A }) => ({ wrist: [A.mouth[0] - 56, A.mouth[1] + 48], hand: 'kiss', rot: 0, layer: 'front', bend: 1, bob: 1 }),
  thumbsUp: ({ sh }) => ({ wrist: [sh[0] + 44, sh[1] - 12], hand: 'thumbsUp', rot: 0, layer: 'front', elbow: [sh[0] + 29, sh[1] + 93], arc: 0, dur: .2 }),
  down:     ({ sh }) => ({ wrist: [sh[0] + 44, sh[1] + 178], hand: 'rest', rot: 0, layer: 'behind', elbow: [sh[0] + 29, sh[1] + 93], arc: 0, bob: 0 }),
  hold:     ({ sh, k }) => k.prop === 'mug'
    ? { wrist: [sh[0] + 94, sh[1] - 52], hand: 'spread', rot: 60, layer: 'front', bend: 1, prop: 'mug', bob: .9 }
    : { wrist: [sh[0] + 104, sh[1] + 38], hand: 'spread', rot: 50, layer: 'front', bend: 1, prop: 'kettle', bob: .6 },
  sip:      ({ A }) => ({ wrist: [A.mouth[0] - 24, A.mouth[1] + 10], hand: 'spread', rot: 60, layer: 'front', bend: 1, prop: 'mug', bob: 1, dur: .35 }),
  phoneWaist: ({ sh }) => ({ wrist: [sh[0] + 68, sh[1] + 40], hand: 'phone', rot: 20, layer: 'front', bend: 1, prop: 'phone' }),
  phoneUp:    ({ sh }) => ({ wrist: [sh[0] + 38, sh[1] - 415], hand: 'phone', rot: 0, layer: 'front', bend: -1, prop: 'phone', bob: 1, dur: .22 }),
  phoneChin:  ({ A }) => ({ wrist: [A.mouth[0] - 30, A.mouth[1] + 70], hand: 'phone', rot: 0, layer: 'front', bend: 1, prop: 'phone', bob: 1, dur: .3 }),
  phoneDown:  ({ sh, A }) => ({ wrist: [sh[0] + 58, A.desk + 28], hand: 'phone', rot: 40, layer: 'front', bend: 1, prop: 'phone', bob: 0, dur: .4 }),
  point:    ctx => aimPose(ctx, 'point', 0, 1),
  reach:    ctx => ({ ...aimPose(ctx, 'kiss', 0, .8), dur: .3 }),
};
// кисть по направлению на цель: запястье на луче плечо→цель (длина ≈ 2/3 расстояния, 120…175 px), палец вдоль предплечья
function aimPose(ctx, hand, rot, reach) {
  const { sh } = ctx, tgt = aimTarget(ctx);
  const dx = tgt[0] - sh[0], dy = tgt[1] - sh[1], d = Math.hypot(dx, dy) || 1;
  const len = clamp(d * .65 * reach, 120, 175);
  const up = dy / d < -.35;   // цель выше плеча — локоть наружу (как fingerUp)
  return { wrist: [sh[0] + dx / d * len, sh[1] + dy / d * len], hand, rot, layer: 'front', bend: up ? -1 : 1 };
}
// цель at → точка в ЛЕВОЙ системе персонажа (для правой руки x зеркалится — результат зеркалится обратно)
function aimTarget({ k, who, pl, side, sh }) {
  const at = k.at ?? 'laptop', LY = stageLayout();
  let local;
  if (Array.isArray(at)) local = toLocal(pl, at);
  else if (at === 'left') local = [sh[0] - 200, sh[1] + 60];
  else if (at === 'right') local = [sh[0] + 200, sh[1] + 60];
  else if (at === 'up') local = [sh[0] - 40, sh[1] - 200];
  else if (at === 'down') local = [sh[0] + 20, sh[1] + 200];
  else if (CHARS[at] && at !== who) local = toLocal(pl, placementOf(at).toWorld(charAnchors(at).head));
  else if (at === 'screen' || LY.points[at]) {
    const p = LY.points[at === 'screen' ? 'laptop' : at];
    if (!p) throw new Error(`поза ${k.pose} у ${who}: точка "${at}" не задана в раскладке (stage.points)`);
    local = toLocal(pl, p);
  } else throw new Error(`поза ${k.pose} у ${who}: цель at "${at}" неизвестна (laptop | <персонаж> | [x,y] | left/right/up/down)`);
  return side === 'R' ? [720 - local[0], local[1]] : local;
}
const HEAD_POSES = {
  nod:   t => [{ t, tilt: 7.5, dur: .15 }, { t: t + .15, tilt: 4, dur: .15 }],
  shake: t => [{ t, tilt: -4, dur: .12 }, { t: t + .14, tilt: 4, dur: .12 }, { t: t + .28, tilt: 0, dur: .15 }],
  left:  t => [{ t, tilt: -5 }], right: t => [{ t, tilt: 5 }], level: t => [{ t, tilt: 0 }],
};

const mirrorKey = p => {
  const m = { ...p };
  if (m.wrist) m.wrist = [720 - m.wrist[0], m.wrist[1]];
  if (m.elbow) m.elbow = [720 - m.elbow[0], m.elbow[1]];
  for (const f of ['rot', 'bend', 'sweep']) if (f in m) m[f] = -m[f];
  return m;
};
function expandPose(k, side, who) {
  const fn = POSES[k.pose];
  if (!fn) throw new Error(`поза "${k.pose}" у ${who}: неизвестный пресет (есть: ${Object.keys(POSES).join(', ')})`);
  const ch = CHARS[who] || CHARS.tolyan, R = rigOf(ch && ch.rig);
  const ctx = { sh: R.L.shoulder, A: charAnchors(who), k, who, pl: placementOf(who), side };
  let p = fn(ctx);
  if (side === 'R') p = mirrorKey(p);
  const { pose, at, ...rest } = k;
  return { ...p, ...rest };
}
// poses { L, R, head } → те же массивы с раскрытыми пресетами; без пресетов возвращает тот же объект (кэш по объекту)
const _poses = new WeakMap();
function resolvePoses(poses, who) {
  if (!poses) return poses;
  if (_poses.has(poses)) return _poses.get(poses);
  const hasPreset = ['L', 'R', 'head'].some(s => (poses[s] || []).some(k => k && k.pose));
  let out = poses;
  if (hasPreset) {
    out = { ...poses };
    for (const side of ['L', 'R']) if (poses[side]) out[side] = poses[side].map(k => k.pose ? expandPose(k, side, who) : k);
    if (poses.head) out.head = poses.head.flatMap(k => {
      if (!k.pose) return [k];
      const fn = HEAD_POSES[k.pose];
      if (!fn) throw new Error(`поза головы "${k.pose}" у ${who}: неизвестный пресет (есть: ${Object.keys(HEAD_POSES).join(', ')})`);
      const { pose, t, ...rest } = k;
      return fn(t).map((h, i) => i === 0 ? { ...h, ...rest } : h);
    });
  }
  _poses.set(poses, out);
  return out;
}
