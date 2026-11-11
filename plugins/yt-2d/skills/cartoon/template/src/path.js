// ─── трек перемещения персонажа по миру: TIMELINE.cast[who].path (этап 2) ─────────────────────────────
// path: [{ t, x }, { t, x, dur? | speed? }, …] — первый ключ: исходная мировая x; каждый следующий: в момент t персонаж
// трогается к мировой x и приходит через dur секунд (или |Δx| / speed, speed по умолчанию PATH_SPEED px/с; dur 0 — мгновенно,
// например перестановка между шотами). Скорость — трапеция: плавный разгон и торможение по PATH_RAMP с (cos-кривая),
// посередине постоянная — живой шаг, а не «равноускоренный» проезд.
// pathAt → { x, dist, v, vRel, dir }: dist — пройденный путь (сумма |Δx|, мировые px, от него считается фаза шага, поэтому
// опорная стопа не скользит при любой скорости); v — скорость (px/с, со знаком); vRel — доля крейсерской (0…1, для смешивания
// стойка↔ходьба); dir — направление последнего движения (±1, 0 — ещё не двигался).
// Файл общий для браузера (index.html) и node (sfx.mjs эпизода: walkSteps — моменты шагов для фоли).
const PATH_RAMP = .45, PATH_SPEED = 400;
function pathAt(path, t) {
  let x = path[0].x, dist = 0, v = 0, vRel = 0, dir = 0;
  for (let i = 1; i < path.length; i++) {
    const k = path[i];
    if (t < k.t) break;
    const D = k.x - x, dur = k.dur ?? Math.abs(D) / (k.speed ?? PATH_SPEED), tau = t - k.t;
    if (D === 0) continue;
    if (tau >= dur) { x = k.x; dist += Math.abs(D); dir = Math.sign(D); continue; }
    const r = Math.min(PATH_RAMP, dur / 3), vmax = D / (dur - r), ramp = q => vmax * (q / 2 - r / (2 * Math.PI) * Math.sin(Math.PI * q / r));
    let s;
    if (tau < r) { s = ramp(tau); v = vmax * (1 - Math.cos(Math.PI * tau / r)) / 2; }
    else if (tau <= dur - r) { s = vmax * (r / 2 + tau - r); v = vmax; }
    else { const q = dur - tau; s = D - ramp(q); v = vmax * (1 - Math.cos(Math.PI * q / r)) / 2; }
    x += s; dist += Math.abs(s); vRel = Math.abs(v / vmax); dir = Math.sign(D);
    break;
  }
  return { x, dist, v, vRel, dir };
}
// длина двойного шага (локальные px персонажа): TIMELINE.cast[who].stride → rig.legs.stride → WALK_STRIDE
const WALK_STRIDE = 340;
// моменты постановки стоп (для фоли): фаза = dist / s / stride; левая ставится на целых фазах, правая — на полуцелых
// TL — TIMELINE; s — масштаб размещения персонажа (cast[who].at.s); шаг дискретизации 1/480 с
function walkSteps(TL, who, { stride, s } = {}) {
  const C = (TL.cast || {})[who] || {}, path = C.path;
  if (!path) return [];
  const st = stride ?? C.stride ?? WALK_STRIDE, sc = s ?? (C.at && C.at.s) ?? 1, out = [];
  let prev = null;
  for (let i = 0; i <= TL.duration * 480; i++) {
    const t = i / 480, p = pathAt(path, t), half = Math.floor(2 * p.dist / sc / st);
    if (prev != null && half > prev && p.vRel > .05) out.push({ t: Math.round(t * 1000) / 1000, foot: half % 2 ? 'R' : 'L' });
    prev = half;
  }
  return out;
}
if (typeof module !== 'undefined') module.exports = { pathAt, walkSteps, PATH_RAMP, PATH_SPEED, WALK_STRIDE };
