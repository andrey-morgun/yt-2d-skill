const KEYS = (() => {
  let s = '';
  for (let row = 0; row < 4; row++) {
    const y = 822 + row * 42, inset = 38 - row * 9, n = 12;
    const w = (720 - 2 * (40 + inset)) / n;
    for (let i = 0; i < n; i++) s += `<rect x="${40 + inset + i * w + 3}" y="${y}" width="${w - 6}" height="34" rx="7" fill="#e3e5e6" stroke="${S}" stroke-width="3"/>`;
  }
  return s;
})();


// ─── shot: laptop screen closeup ───────────────────────────────────────────
// нужны TIMELINE.events: typing [a,b] — индикатор печати, reply [a,b] — текст ответа по буквам, cursor [a,b] — курсор едет к кнопке, click, boom
function star(cx, cy, r, rot, fill) {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = rot + i * Math.PI / 5 - Math.PI / 2, rr = i % 2 ? r * .45 : r;
    d += (i ? 'L' : 'M') + (cx + Math.cos(a) * rr).toFixed(1) + ',' + (cy + Math.sin(a) * rr).toFixed(1);
  }
  return `<path d="${d}Z" fill="${fill}" stroke="${S}" stroke-width="3" stroke-linejoin="round"/>`;
}

function screen(t) {
  const E = TIMELINE.events;
  const boom = t >= E.boom;
  // курсор: от правого края к кнопке «Запустить»
  const mv = easeInOut(prog(t, E.cursor[0], E.cursor[1]));
  const cx = lerp(560, 196, mv), cy = lerp(640, 718, mv);
  const clicking = t >= E.click && t < E.click + .1;
  const pressed = t >= E.click && t < E.boom + .05;
  // ответ Claude
  const typing = t >= E.typing[0] && t < E.typing[1];
  const reply = 'Готово ✓ Сделал красиво.';
  const shown = reply.slice(0, Math.floor(prog(t, E.reply[0], E.reply[1]) * reply.length));
  const dots = typing ? [0, 1, 2].map(i => `<circle cx="${416 + i * 16}" cy="${468 - Math.max(0, Math.sin(t * 12 - i * .9)) * 6}" r="5" fill="#b9ae9c"/>`).join('') : '';
  const flash = boom ? clamp(1 - (t - E.boom) / .18) : 0;
  const hue = (t * 300) % 360;
  const kitsch = boom ? `
    <g clip-path="url(#leftpane)">
      <rect x="56" y="350" width="324" height="430" fill="url(#rainbow)"/>
      ${[[110, 420, 30, '#ffe23a'], [320, 400, 24, '#ff5cc8'], [90, 640, 26, '#5cf2ff'], [330, 610, 34, '#ffe23a'], [210, 760, 22, '#7dff5c']]
        .map(([x, y, r, f], i) => star(x, y, r * (1 + .15 * Math.sin(t * 14 + i)), t * (i % 2 ? -5 : 6), f)).join('')}
      <g transform="translate(218,530) rotate(${Math.sin(t * 11) * 7}) scale(${1 + .08 * Math.sin(t * 19)}) skewX(-10)">
        <text text-anchor="middle" y="18" font-family="Rubik" font-weight="900" font-size="66" fill="#ffe23a" stroke="#e3262e" stroke-width="8" paint-order="stroke" stroke-linejoin="round">КУПИ!!!</text>
      </g>
      <rect x="56" y="684" width="324" height="40" fill="#111"/>
      <text x="${380 - ((t - E.boom) * 420) % 560}" y="712" font-family="Rubik" font-weight="900" font-size="24" fill="hsl(${(hue + 120) % 360},100%,65%)">★ СКИДКИ ★ ХИТ ★ ТОП ★ СКИДКИ ★</text>
      <pattern id="uc" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="28" height="28" fill="#ffd21f"/><rect width="14" height="28" fill="#111"/></pattern>
      <rect x="56" y="734" width="324" height="46" fill="url(#uc)"/>
      <rect x="112" y="743" width="212" height="28" rx="4" fill="#111"/>
      <text x="218" y="764" text-anchor="middle" font-family="Rubik" font-weight="900" font-size="17" fill="#ffd21f" opacity="${Math.sin(t * 30) > 0 ? 1 : .25}">В РАЗРАБОТКЕ</text>
    </g>` : `
    <rect x="80" y="374" width="220" height="18" rx="9" fill="#cfc8bb"/>
    <rect x="80" y="408" width="270" height="9" rx="4" fill="#ddd6c9"/>
    <rect x="80" y="426" width="200" height="9" rx="4" fill="#ddd6c9"/>
    <rect x="80" y="452" width="276" height="170" rx="8" fill="#e2dbcd"/>
    <path d="M140,590 l40,-50 l30,30 l24,-22 l50,42 z" fill="#cfc6b6"/>
    <circle cx="300" cy="490" r="14" fill="#cfc6b6"/>
    <rect x="88" y="${pressed ? 694 : 690}" width="180" height="48" rx="12" fill="${pressed ? '#3d7d39' : '#4f9a4a'}" stroke="${S}" stroke-width="4"/>
    <text x="178" y="${pressed ? 726 : 722}" text-anchor="middle" font-family="Rubik" font-weight="700" font-size="21" fill="#fff">Запустить</text>`;
  // рука с тачпадом следует за курсором
  const hx = 470 + (cx - 400) * .25, hy = 1030 + (cy - 680) * .2 + (clicking ? 6 : 0);
  return `<svg viewBox="0 0 720 1280" width="720" height="1280" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgB" cx=".5" cy=".42" r=".75"><stop offset="0" stop-color="#5a3e28"/><stop offset=".6" stop-color="#2e2016"/><stop offset="1" stop-color="#140d08"/></radialGradient>
    <linearGradient id="rainbow" gradientTransform="rotate(${(t * 220) % 360} .5 .5)">
      ${[0, 60, 120, 180, 240, 300, 360].map((h, i) => `<stop offset="${i / 6}" stop-color="hsl(${(h + hue) % 360},100%,58%)"/>`).join('')}
    </linearGradient>
    <clipPath id="leftpane"><rect x="56" y="350" width="324" height="430"/></clipPath>
    <radialGradient id="glowB"><stop offset="0" stop-color="hsl(${hue},100%,60%)" stop-opacity=".3"/><stop offset="1" stop-color="hsl(${hue},100%,60%)" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="720" height="1280" fill="url(#bgB)"/>
  ${boom ? `<circle cx="300" cy="560" r="520" fill="url(#glowB)"/>` : ''}
  <!-- клавиатура -->
  <path d="M40,800 L680,800 L716,1100 L4,1100 Z" fill="#c9ccce" stroke="${S}" stroke-width="${W}" stroke-linejoin="round"/>
  ${KEYS}
  <rect x="250" y="1004" width="220" height="74" rx="10" fill="#d9dcdd" stroke="${S}" stroke-width="4"/>
  <!-- экран -->
  <rect x="34" y="296" width="652" height="508" rx="26" fill="#2b2623" stroke="${S}" stroke-width="${W}"/>
  <rect x="56" y="318" width="608" height="464" rx="8" fill="#f4efe6"/>
  <rect x="56" y="318" width="324" height="32" fill="#e4ddd0"/>
  <circle cx="76" cy="334" r="6" fill="#e2594b"/><circle cx="96" cy="334" r="6" fill="#f2b84b"/><circle cx="116" cy="334" r="6" fill="#62b25a"/>
  ${kitsch}
  <!-- панель Claude -->
  <rect x="380" y="318" width="284" height="464" fill="#f8f4ec"/>
  <path d="M380,318 V782" stroke="#d8d0c2" stroke-width="3"/>
  <g transform="translate(404,342)" stroke="#d97757" stroke-width="4" stroke-linecap="round">
    ${[0, 1, 2, 3, 4, 5].map(i => `<path d="M0,0 L${(Math.cos(i * Math.PI / 3) * 10).toFixed(1)},${(Math.sin(i * Math.PI / 3) * 10).toFixed(1)}"/>`).join('')}
  </g>
  <text x="422" y="349" font-family="Rubik" font-weight="700" font-size="19" fill="#2b2623">Claude</text>
  <path d="M380,368 H664" stroke="#e4dccd" stroke-width="2"/>
  <rect x="470" y="386" width="178" height="40" rx="14" fill="#ebe3d6"/>
  <text x="559" y="412" text-anchor="middle" font-family="Rubik" font-weight="700" font-size="16" fill="#3a332e">сделай красиво</text>
  ${dots}
  ${shown ? `<rect x="396" y="444" width="252" height="74" rx="12" fill="#fff" stroke="#2b2623" stroke-width="2.5"/>
    <text x="412" y="472" font-family="Rubik" font-weight="700" font-size="17" fill="#2b2623">${shown.slice(0, 8)}</text>
    <text x="412" y="500" font-family="Rubik" font-weight="700" font-size="17" fill="#2b2623">${shown.slice(9)}</text>` : ''}
  <rect x="396" y="728" width="252" height="38" rx="19" fill="#fff" stroke="#d2cabb" stroke-width="2"/>
  <circle cx="628" cy="747" r="13" fill="#d97757"/>
  <path d="M628,754 V740 M622,746 L628,740 L634,746" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>
  ${flash ? `<rect x="56" y="318" width="608" height="464" fill="#fff" opacity="${flash}"/>` : ''}
  <!-- курсор -->
  <g transform="translate(${cx},${cy}) scale(${clicking ? .82 : 1})">
    <path d="M0,0 L0,34 L9,26 L16,42 L23,39 L16,23 L28,23 Z" fill="#fff" stroke="#111" stroke-width="3" stroke-linejoin="round"/>
  </g>
  <!-- рука Толяна на тачпаде -->
  ${tube([[820, 1400], [hx + 40, hy + 40]], 70, SUIT)}
  <ellipse cx="${hx}" cy="${hy}" rx="44" ry="34" fill="${SKIN}" stroke="${S}" stroke-width="${W}"/>
  ${tube([[hx - 20, hy - 18], [hx - 34, hy - 48]], 18, SKIN)}
</svg>`;
}
(window.SETS = window.SETS || {}).screen = t => screen(t);
