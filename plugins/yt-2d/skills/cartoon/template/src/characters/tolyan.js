// ─── Толян: тело и руки (голова — tolyan-head.js, риг рук — rig.js) ───
// Два входа: tolyan(st) — старый одиночный путь (эпизод tolyan, сет garage: торс + руки behind + голова с наклоном),
// и CHARS.tolyan — реестр персонажей для сета stage (несколько персонажей в кадре): body/head раздельно, id с префиксом P,
// руки и наклон головы рисует движок (контракт CHARS — см. src/sets/stage.js).
function tolyanTorso(st) {
  const { bob } = st;
  return `
  <!-- torso -->
  <g transform="translate(0,${bob * .4})">
    <rect x="318" y="660" width="88" height="120" fill="${SKIN}" stroke="${S}" stroke-width="${W}"/>
    <ellipse cx="362" cy="724" rx="46" ry="15" fill="#c98f62" opacity=".7"/>
    <path d="M168,1010 C172,860 188,782 262,758 L458,758 C534,782 548,860 552,1010 Z" fill="${SUIT}" stroke="${S}" stroke-width="${W}" stroke-linejoin="round"/>
    <path d="M296,758 L362,836 L428,758" fill="#4a5e7f" stroke="${S}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M362,842 L362,1010" stroke="#283548" stroke-width="5"/>
    <rect x="355" y="852" width="14" height="24" rx="3" fill="#cfd3d8" stroke="${S}" stroke-width="3"/>
    <path d="M205,800 C196,860 190,930 188,1010 M515,800 C524,860 530,930 532,1010" stroke="#f4f4f0" stroke-width="9" fill="none"/>
    <path d="M205,800 C196,860 190,930 188,1010 M515,800 C524,860 530,930 532,1010" stroke="${SUIT}" stroke-width="3" fill="none"/>
  </g>`;
}

function tolyan(st) {
  const { bob, tilt = 0 } = st;
  // руки: риг из st.arms (слой 'behind' — здесь, 'front' — в сете после ноутбука); без рига — статичные
  const arms = st.arms ? armsSvg(st.arms, 'behind')
    : `<g transform="translate(0,${bob * .4})">${tube([[226, 812], [214, 880], [244, 934]], 50, SUIT)}${tube([[494, 812], [508, 880], [474, 928]], 50, SUIT)}</g>`;
  return `${tolyanTorso(st)}
  ${arms}
  <!-- голова: наклон вокруг шеи (360,700) -->
  <g transform="rotate(${tilt.toFixed(2)} 360 700)">${tolyanHead(st)}</g>`;
}

// реестр персонажей: rig — риг Толяна по умолчанию (RIG/SUIT/SKIN из rig.js), body — торс, head — голова без наклона
window.CHARS = window.CHARS || {};
CHARS.tolyan = {
  rig: {},
  // якоря для пресетов (src/presets.js), локальные координаты: head — центр крупного плана (cam 'cu:tolyan'),
  // mouth — рот (позы kiss/sip/fingerUp/phoneChin), chest — центр груди (cam 'mid:'), desk — y столешницы (позы rest/typing)
  anchors: { head: [362, 612], mouth: [362, 690], chest: [360, 800], desk: 932 },
  body: (st, P) => tolyanTorso(st),
  head: (st, P) => tolyanHead(st, P || ''),
  // кончик носа в локальных координатах персонажа (после внутренних трансформов головы, до наклона tilt): для блэкаута
  nose(st) {
    const look = st.look ?? 0, bob = st.bob ?? 0, a = look * 2 * Math.PI / 180;
    const x0 = 360 + (363 - 360) * .92, y0 = 705 + (646 - 705) * .92;           // scale(.92) вокруг (360,705)
    const dx = x0 - 360, dy = y0 - 680;                                           // rotate(look*2) вокруг (360,680)
    return { x: 360 + dx * Math.cos(a) - dy * Math.sin(a), y: 680 + dx * Math.sin(a) + dy * Math.cos(a) + bob, r: 26 * .92 };
  },
};
