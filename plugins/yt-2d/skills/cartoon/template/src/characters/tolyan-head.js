// ─── Толян: голова (лицо, глаза, рот, кепка) ───
// Асимметрия намеренная: разные глаза, челюсть шире справа — «рукотворность» без дрожи линий.
const HEAD_PATH = 'M360,448 C431,448 485,504 485,586 C485,656 456,713 364,715 C272,715 238,652 237,586 C236,503 291,448 360,448 Z';
const STUBBLE = (() => {
  const r = rng(42); let s = '';
  for (let i = 0; i < 80; i++) {
    const a = Math.PI * (0.1 + r() * 0.8), rr = 0.5 + r() * 0.45;
    const x = 361 + Math.cos(a) * 120 * rr, y = 585 + Math.sin(a) * 128 * rr;
    if (y < 660 || Math.abs(x - 362) < 34 && y < 702) continue;
    s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1.8 + r() * .8).toFixed(1)}" fill="#6b4a35" opacity=".5"/>`;
  }
  return s;
})();

function eye(id, cx, cy, rx, ry, lid, pr, lx, ly, bliss) {
  if (bliss > .5) // блаженно закрытые — дуги «◡»
    return `<path d="M${cx - rx + 3},${cy - 2} Q${cx},${cy + 14} ${cx + rx - 3},${cy - 2}" stroke="${S}" stroke-width="5.5" fill="none" stroke-linecap="round"/>
      <path d="M${cx - 20},${cy + 26} Q${cx},${cy + 34} ${cx + 18},${cy + 25}" stroke="#a87250" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  const ly0 = cy - ry + lid * 2 * ry;
  const hw = lid >= 1 ? rx : rx * Math.sqrt(clamp(1 - Math.pow((ly0 - cy) / ry, 2)));
  return `<clipPath id="${id}"><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/></clipPath>
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fbf7ef"/>
    <g clip-path="url(#${id})">
      <circle cx="${cx + lx}" cy="${cy + ly}" r="${pr}" fill="#1e140e"/>
      <circle cx="${cx + lx - pr * .35}" cy="${cy + ly - pr * .35}" r="${pr * .3}" fill="#fff"/>
      <rect x="${cx - 40}" y="${cy - 40}" width="80" height="${ly0 - cy + 40}" fill="#e9b47f"/>
    </g>
    ${lid > 0.02 ? `<path d="M${cx - hw},${ly0} Q${cx},${ly0 + 5} ${cx + hw},${ly0}" stroke="${S}" stroke-width="5.5" fill="none" stroke-linecap="round"/>` : ''}
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="${S}" stroke-width="${W - 1}"/>
    <path d="M${cx - 24},${cy + ry + 7} Q${cx},${cy + ry + 17} ${cx + 22},${cy + ry + 6}" stroke="#a87250" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M${cx - 16},${cy + ry + 16} Q${cx},${cy + ry + 22} ${cx + 14},${cy + ry + 15}" stroke="#a87250" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".6"/>`;
}

// спичка в углу рта; в шоке выпадает (падение — по времени от начала шока)
// st.matchDrop — момент начала падения (ставит charState по cast[who].events.matchDrop/shock); без него — старое правило rainbow+E.shock
function matchstick(st, mouth) {
  const E = TIMELINE.events || {}, t = st.t ?? 0;
  let dx = 0, dy = 0, rot = -22 + Math.sin(t * 5) * 3 + mouth * 10;
  const drop = st.matchDrop ?? (st.rainbow && E.shock && t >= E.shock[0] ? E.shock[0] : null);
  if (drop != null && t >= drop) {
    const d = t - drop;
    if (d > .7) return '';
    dx = d * 60; dy = 1500 * d * d; rot += d * 520;
  }
  return `<g transform="translate(${381 + dx},${689 + dy}) rotate(${rot})">
    <rect x="-2" y="-4" width="46" height="8" rx="3" fill="#ecd3a0" stroke="${S}" stroke-width="4"/>
    <ellipse cx="45" cy="0" rx="8" ry="7" fill="#c8402f" stroke="${S}" stroke-width="4"/></g>`;
}

// P — префикс SVG-id (clipPath/filter/gradient), чтобы два персонажа могли делить кадр; '' — как раньше (эпизод tolyan)
function tolyanHead(st, P = '') {
  const { pr, mouth, brow, bob, look } = st;
  const shock = st.shock || 0, bliss = st.bliss || 0;
  // сдержанный шок: веки открываются максимум до ~0.78, зрачки сжимаются
  const lid = st.lid >= 1 ? 1 : Math.max(st.lid, .22);
  const pupil = lerp(pr, 5, clamp(shock));
  const browUp = brow + bliss * 8;
  let mouthSvg;
  const E = TIMELINE.events || {}, tt = st.t ?? 0;
  const kissing = st.kiss ?? (!st.rainbow && E.kiss && tt >= E.kiss[0] && tt < E.kiss[1]);   // st.kiss — от charState(cast)
  if (kissing) // губы трубочкой — chef's kiss
    mouthSvg = `<ellipse cx="360" cy="692" rx="12" ry="10" fill="#d9726a" stroke="${S}" stroke-width="5"/><ellipse cx="360" cy="692" rx="4" ry="3.5" fill="#4a1f17"/>`;
  else if (shock > .3 && mouth > .05) // маленькое «о»
    mouthSvg = `<ellipse cx="363" cy="694" rx="11" ry="${4 + 6 * clamp(shock)}" fill="#4a1f17" stroke="${S}" stroke-width="5"/>`;
  else if (mouth > .05)
    mouthSvg = `<path d="M345,690 Q362,${688 + mouth * 22} 382,688 Q363,684 345,690 Z" fill="#4a1f17" stroke="${S}" stroke-width="5" stroke-linejoin="round"/>
       <ellipse cx="364" cy="${691 + mouth * 9}" rx="8" ry="${mouth * 3.5}" fill="#c4544a"/>`;
  else
    mouthSvg = `<path d="M343,691 Q361,697 383,685" stroke="${S}" stroke-width="5" fill="none" stroke-linecap="round"/>
       <path d="M383,685 l5,-3" stroke="${S}" stroke-width="4" stroke-linecap="round"/>`;
  const hue = ((st.t ?? 0) * 260) % 360;
  const glow = st.rainbow ? `
    <radialGradient id="${P}skinGlow" cx=".62" cy=".95" r=".9"><stop offset="0" stop-color="hsl(${hue},100%,60%)" stop-opacity=".95"/><stop offset=".7" stop-color="hsl(${(hue + 40) % 360},100%,60%)" stop-opacity=".25"/><stop offset="1" stop-color="hsl(${hue},100%,60%)" stop-opacity="0"/></radialGradient>
    <path d="${HEAD_PATH}" fill="url(#${P}skinGlow)" style="mix-blend-mode:soft-light"/>` : '';
  return `
  <g transform="translate(0,${bob}) rotate(${look * 2} 360 680) translate(360 705) scale(.92) translate(-360 -705)">
    <defs><filter id="${P}soft6" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="6"/></filter></defs>
    <ellipse cx="236" cy="598" rx="24" ry="27" fill="${SKIN}" stroke="${S}" stroke-width="${W}"/>
    <ellipse cx="486" cy="592" rx="27" ry="28" fill="${SKIN}" stroke="${S}" stroke-width="${W}"/>
    <path d="M230,594 a8,8 0 0 1 10,-8 M492,588 a8,8 0 0 0 -10,-8" stroke="#b97f55" stroke-width="3" fill="none"/>
    <path d="${HEAD_PATH}" fill="${SKIN}"/>
    <clipPath id="${P}headclip"><path d="${HEAD_PATH}"/></clipPath>
    <g clip-path="url(#${P}headclip)">
      <ellipse cx="362" cy="552" rx="140" ry="20" fill="#b9805a" opacity=".55" filter="url(#${P}soft6)"/>
      <ellipse cx="364" cy="712" rx="118" ry="52" fill="#d9a47a" opacity=".45"/>
    </g>
    ${STUBBLE}
    <ellipse cx="279" cy="654" rx="24" ry="13" fill="#f08a80" opacity=".42"/>
    <ellipse cx="447" cy="650" rx="22" ry="12" fill="#f08a80" opacity=".42"/>
    ${eye(P + 'eyeL', 313, 603, 30, 24, bliss > .5 ? 1 : Math.min(1, lid + .05), pupil, look * 6 + 2, 7 - shock * 4, bliss)}
    ${eye(P + 'eyeR', 410, 599, 33, 27, lid, pupil, look * 6 - 2, 7 - shock * 4, bliss)}
    <path d="M279,${566 - browUp} Q311,${552 - browUp * 1.2} 341,${563 - browUp}" stroke="#5a3a24" stroke-width="10" fill="none" stroke-linecap="round"/>
    <path d="M381,${561 - browUp * 1.1} Q410,${545 - browUp * 1.3} 443,${561 - browUp}" stroke="#5a3a24" stroke-width="11" fill="none" stroke-linecap="round"/>
    <path d="M335,672 Q326,686 333,700 M392,670 Q402,684 396,698" stroke="#c48a5e" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>
    ${glow}
    <path d="${HEAD_PATH}" fill="none" stroke="${S}" stroke-width="${W}"/>
    <ellipse cx="363" cy="646" rx="28" ry="26" fill="#d44a3a" stroke="${S}" stroke-width="${W}"/>
    <ellipse cx="352" cy="636" rx="8" ry="5" fill="#fff" opacity=".7"/>
    ${mouthSvg}
    ${matchstick(st, mouth)}
    <!-- кепка: внутренние линии приглушены -->
    <path d="M234,534 C236,440 297,402 361,402 C424,401 486,438 486,534 Z" fill="#3b4046" stroke="${S}" stroke-width="${W}" stroke-linejoin="round"/>
    <path d="M361,405 L360,528 M300,421 C286,461 283,500 285,530" stroke="${S}" stroke-width="3" fill="none" opacity=".3"/>
    <path d="M300,416 C330,406 350,404 361,404" stroke="#6a7078" stroke-width="5" fill="none" stroke-linecap="round" opacity=".5"/>
    <circle cx="361" cy="404" r="7" fill="#3b4046" stroke="${S}" stroke-width="4"/>
    <path d="M222,532 Q360,500 498,530 Q502,568 362,561 Q218,568 222,532 Z" fill="#2c3035" stroke="${S}" stroke-width="${W}" stroke-linejoin="round"/>
  </g>`;
}
