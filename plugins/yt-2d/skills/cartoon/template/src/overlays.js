// ─── overlays: субтитры, бейджи ────────────────────────────────────────────
// TIMELINE.subs может отсутствовать: тогда render.js подставляет VOICE.subs (озвучка) или пустой список
function subtitle(t) {
  const ph = (TIMELINE.subs || []).find(p => t >= p.from && t < p.to);
  if (!ph) return '';
  const vis = ph.words.filter(w => t >= w[1]);
  const pop = easeOutBack(prog(t, ph.from, ph.from + .14));
  const html = vis.map((w, i) => `<span class="${i === vis.length - 1 ? 'hl' : ''}">${w[0]}</span>`).join(' ');
  return `<div class="sub" style="transform:translateX(-50%) scale(${(.75 + .25 * pop).toFixed(3)})">${html}</div>`;
}

function badges(t) {
  return (TIMELINE.badges || []).filter(b => t >= b.from && t < b.to).map(b => {
    const k = easeOutBack(prog(t, b.from, b.from + .38));
    return `<div class="badge" style="left:${b.x}px;top:${b.y}px;transform:rotate(${b.rot + (1 - k) * 10}deg) scale(${k.toFixed(3)})">
      <div class="name">${b.name}</div><div class="role" style="background:${b.color}">${b.role}</div></div>`;
  }).join('');
}
