// ─── пропы гаража (общая библиотека): чайник, кружка, телефон, удлинитель, розетка, верстак, лампа, блэкаут ───
// Все функции — чистые: (x, y, …) → SVG-строка в координатах сцены 720×1280. Цвета по стайлгайду.
const KET = { body: '#c9ccc8', bodyDk: '#9fa39f', handle: '#2f3236', led: '#e2453a', ledOn: '#ff6a4d' };

// чайник: (x,y) — центр дна; s — масштаб; rot — наклон; on — горит индикатор (0..1)
function kettleProp(x, y, s = 1, rot = 0, on = 0, P = 'k') {
  return `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})">
    <ellipse cx="0" cy="4" rx="58" ry="10" fill="#000" opacity=".22"/>
    <path d="M-50,0 L-44,-96 Q-40,-118 0,-120 Q40,-118 44,-96 L50,0 Z" fill="${KET.body}" stroke="${S}" stroke-width="${W}" stroke-linejoin="round"/>
    <path d="M-30,-14 L-26,-100" stroke="#eef0ec" stroke-width="10" stroke-linecap="round" opacity=".8"/>
    <path d="M44,-92 C84,-92 84,-26 46,-24" stroke="${S}" stroke-width="22" fill="none" stroke-linecap="round"/>
    <path d="M44,-92 C84,-92 84,-26 46,-24" stroke="${KET.handle}" stroke-width="11" fill="none" stroke-linecap="round"/>
    <path d="M-46,-80 L-78,-104 L-72,-112 L-44,-96" fill="${KET.body}" stroke="${S}" stroke-width="5" stroke-linejoin="round"/>
    <rect x="-30" y="-132" width="60" height="16" rx="8" fill="${KET.handle}" stroke="${S}" stroke-width="5"/>
    <rect x="-56" y="-8" width="112" height="14" rx="5" fill="${KET.handle}" stroke="${S}" stroke-width="5"/>
    <circle cx="40" cy="-34" r="7" fill="${on > .5 ? KET.ledOn : '#5a2a24'}" stroke="${S}" stroke-width="3"/>
    ${on > .5 ? `<circle cx="40" cy="-34" r="18" fill="${KET.ledOn}" opacity=".35"/>` : ''}
  </g>`;
}

// кружка с паром; steam — фаза времени (t), 0 — без пара
function mugProp(x, y, color = '#e9e4da', band = '#3f8a4f', t = 0, steam = false) {
  const st = steam ? [0, 1].map(i => { const ph = (t * .6 + i / 2) % 1; return `<path d="M${x - 4 + i * 10},${y - 64 - ph * 50} q-8,-10 0,-18 q8,-10 0,-18" stroke="#efe7d8" stroke-width="4" fill="none" stroke-linecap="round" opacity="${(1 - ph) * .7 * Math.min(1, ph * 5)}"/>`; }).join('') : '';
  return `${st}<g transform="translate(${x},${y})">
    <rect x="-24" y="-54" width="48" height="54" rx="6" fill="${color}" stroke="${S}" stroke-width="5"/>
    <rect x="-24" y="-38" width="48" height="13" fill="${band}"/>
    <path d="M24,-44 a13,13 0 0 1 0,28" stroke="${S}" stroke-width="5" fill="none"/>
    <rect x="-24" y="-54" width="48" height="54" rx="6" fill="none" stroke="${S}" stroke-width="5"/></g>`;
}

// телефон в руке: (x,y) — центр, ang — поворот, glow 0..1 — экран горит
function phoneProp(x, y, ang = 0, glow = 1) {
  return `<g transform="translate(${x},${y}) rotate(${ang})">
    ${glow > 0 ? `<circle r="70" fill="#bfe3ff" opacity="${.18 * glow}"/>` : ''}
    <rect x="-17" y="-32" width="34" height="64" rx="7" fill="#22252a" stroke="${S}" stroke-width="4"/>
    <rect x="-12" y="-26" width="24" height="50" rx="3" fill="${glow > 0 ? '#bfe3ff' : '#30353c'}" opacity="${.35 + .65 * glow}"/>
    ${glow > 0 ? `<rect x="-8" y="-20" width="16" height="4" rx="2" fill="#fff" opacity=".8"/><rect x="-8" y="-12" width="12" height="3" rx="1.5" fill="#fff" opacity=".6"/>` : ''}
  </g>`;
}

// верстак/полка Толяна (слева). top — уровень столешницы
function workbenchProp(x, top, w = 300) {
  return `<rect x="${x}" y="${top}" width="${w}" height="34" rx="4" fill="#8f6a3e" stroke="${S}" stroke-width="${W}"/>
    <rect x="${x + 10}" y="${top + 34}" width="${w - 20}" height="400" fill="#6f4f2c" stroke="${S}" stroke-width="${W}"/>
    <path d="M${x + 10},${top + 120} H${x + w - 10}" stroke="${S}" stroke-width="5"/>
    <rect x="${x + 40}" y="${top + 60}" width="70" height="44" rx="4" fill="#c99b62" stroke="${S}" stroke-width="4"/>`;
}

// розетка на стене (+ удлинитель от неё: plug 0..1 — вилка подходит и входит)
function socketProp(x, y, plug = -1, cordTo = null) {
  let cord = '';
  if (plug >= 0 && cordTo) {
    const px = lerp(x + 70, x, clamp(plug)), py = y;
    cord = `<path d="M${cordTo[0]},${cordTo[1]} C${cordTo[0] + 40},${cordTo[1] - 120} ${px + 80},${py + 160} ${px + 26},${py}" stroke="${S}" stroke-width="13" fill="none" stroke-linecap="round"/>
      <path d="M${cordTo[0]},${cordTo[1]} C${cordTo[0] + 40},${cordTo[1] - 120} ${px + 80},${py + 160} ${px + 26},${py}" stroke="#e8e4da" stroke-width="6" fill="none" stroke-linecap="round"/>
      <rect x="${px + 8}" y="${py - 16}" width="34" height="32" rx="7" fill="#e8e4da" stroke="${S}" stroke-width="4"/>`;
  }
  return `<rect x="${x - 30}" y="${y - 30}" width="60" height="60" rx="10" fill="#efeadf" stroke="${S}" stroke-width="5"/>
    <circle cx="${x - 9}" cy="${y}" r="5" fill="${S}"/><circle cx="${x + 9}" cy="${y}" r="5" fill="${S}"/>${cord}`;
}

// лампа на проводе: swing — угол (°), bright 0..1
function lampProp(x, y, swing = 0, bright = 1, P = 'l') {
  return `<defs><radialGradient id="${P}g"><stop offset="0" stop-color="#ffd27a" stop-opacity=".9"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient></defs>
  <g transform="rotate(${swing} ${x} -10)">
    <circle cx="${x}" cy="${y}" r="290" fill="url(#${P}g)" opacity="${.36 * bright}"/>
    <path d="M${x},-10 V${y - 26}" stroke="${S}" stroke-width="3"/>
    <rect x="${x - 10}" y="${y - 30}" width="20" height="16" rx="3" fill="#3c3c3c" stroke="${S}" stroke-width="3"/>
    <circle cx="${x}" cy="${y}" r="17" fill="${bright > .2 ? '#fff0b8' : '#7d7768'}" stroke="${S}" stroke-width="4"/></g>`;
}

// блэкаут: чёрный кадр, светящийся нос (nose:[x,y,r]) + опционально пятно света телефона снизу
function blackoutLayer(t, nose, phone = null, P = 'bo') {
  const breath = Math.sin(t * 2.4) * 4;
  return `<defs><radialGradient id="${P}n"><stop offset="0" stop-color="#ff5a3c" stop-opacity=".9"/><stop offset=".35" stop-color="#ff3a22" stop-opacity=".35"/><stop offset="1" stop-color="#ff3a22" stop-opacity="0"/></radialGradient>
    <radialGradient id="${P}p"><stop offset="0" stop-color="#bfe3ff" stop-opacity=".55"/><stop offset="1" stop-color="#bfe3ff" stop-opacity="0"/></radialGradient></defs>
    <rect width="720" height="1280" fill="#050302"/>
    ${phone ? `<ellipse cx="${phone[0]}" cy="${phone[1]}" rx="${phone[2]}" ry="${phone[2] * 1.2}" fill="url(#${P}p)"/>` : ''}
    <circle cx="${nose[0]}" cy="${nose[1] + breath}" r="${nose[2] * 4}" fill="url(#${P}n)"/>
    <circle cx="${nose[0]}" cy="${nose[1] + breath}" r="${nose[2]}" fill="#e2453a" stroke="#3a0a05" stroke-width="4"/>
    <ellipse cx="${nose[0] - nose[2] * .35}" cy="${nose[1] + breath - nose[2] * .35}" rx="${nose[2] * .3}" ry="${nose[2] * .2}" fill="#fff" opacity=".7"/>`;
}
