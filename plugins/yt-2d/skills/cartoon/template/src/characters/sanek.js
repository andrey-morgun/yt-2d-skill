// ─── Санёк: молодой, высокий и узкий, капюшон худи, круглые очки, редкая бородка, телефон всегда в руке ───
// st: стандартные поля + gaze [x,y] (по умолчанию смотрит вниз в телефон: [0, 1]), squint 0..1 (зажмурился), glow 0..1 (свет телефона на лице)
window.CHARS = window.CHARS || {};
const SAN = { skin: '#f3c99a', shade: '#dcae80', crease: '#b98a62', hood: '#4a5566', hoodDk: '#363f4d', hoodIn: '#2b323d', beard: '#7a5a40' };

CHARS.sanek = {
  anchors: { head: [360, 610], mouth: [360, 676], chest: [360, 790], desk: 932 },   // якоря пресетов (см. tolyan.js / presets.js)
  rig: { L: { shoulder: [262, 790], len: [104, 108], bend: 1 }, R: { shoulder: [458, 790], len: [104, 108], bend: -1 },
         sleeve: SAN.hood, stripe: null, skin: SAN.skin, crease: SAN.crease, width: 44 },
  body(st, P) {
    const b = (st.bob || 0) * .4;
    return `<g transform="translate(0,${b})">
      <path d="M206,1060 C206,900 214,800 282,774 L438,774 C506,800 514,900 514,1060 Z" fill="${SAN.hood}" stroke="${S}" stroke-width="${W}" stroke-linejoin="round"/>
      <path d="M270,940 Q360,920 450,940 L462,1040 L258,1040 Z" fill="${SAN.hoodDk}" stroke="${S}" stroke-width="4" stroke-linejoin="round" opacity=".9"/>
      <path d="M338,790 q-6,60 -2,92 M382,790 q6,60 2,92" stroke="#e8e4da" stroke-width="5" fill="none" stroke-linecap="round"/>
      <circle cx="336" cy="884" r="6" fill="#e8e4da" stroke="${S}" stroke-width="3"/><circle cx="384" cy="884" r="6" fill="#e8e4da" stroke="${S}" stroke-width="3"/>
      <ellipse cx="300" cy="860" rx="18" ry="10" fill="#56627a"/>
    </g>`;
  },
  head(st, P) {
    const { lid = .4, pr = 9, mouth = 0, brow = 0, bob = 0, shock = 0 } = st;
    const [gx, gy] = st.gaze || [0, 1], squint = clamp(st.squint || 0), glow = clamp(st.glow || 0);
    const L = st.lid >= 1 || squint > .5 ? 1 : Math.max(lid, .18);
    const eyes = squint > .5
      ? `<path d="M296,592 l14,6 l-14,6 M420,592 l-14,6 l14,6" stroke="${S}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
      : kEye(P + 'eL', 314, 596, 18, 16, L, lerp(pr, 5, shock) * .75, gx * 6, gy * 6, SAN.shade) +
        kEye(P + 'eR', 404, 596, 18, 16, L, lerp(pr, 5, shock) * .75, gx * 6, gy * 6, SAN.shade);
    const mo = mouth > .05
      ? `<ellipse cx="360" cy="${676 + mouth * 3}" rx="12" ry="${3 + mouth * 9}" fill="#4a1f17" stroke="${S}" stroke-width="4.5"/>`
      : `<path d="M346,676 Q360,680 374,675" stroke="${S}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
    const browY = 556 - brow;
    return `<g transform="translate(0,${bob})">
      <!-- капюшон: задняя часть -->
      <path d="M220,640 C214,500 270,420 360,418 C450,420 506,500 500,640 C496,710 470,742 440,756 L280,756 C250,742 224,710 220,640 Z" fill="${SAN.hood}" stroke="${S}" stroke-width="${W}" stroke-linejoin="round"/>
      <path d="M252,640 C248,520 292,462 360,460 C428,462 472,520 468,640 C466,700 440,728 412,740 L308,740 C280,728 254,700 252,640 Z" fill="${SAN.hoodIn}"/>
      <!-- лицо: узкое вытянутое -->
      <path d="M266,580 C266,500 306,470 360,470 C414,470 454,500 454,580 C454,650 430,712 360,716 C290,712 266,650 266,580 Z" fill="${SAN.skin}" stroke="${S}" stroke-width="${W}"/>
      <clipPath id="${P}hc"><path d="M266,580 C266,500 306,470 360,470 C414,470 454,500 454,580 C454,650 430,712 360,716 C290,712 266,650 266,580 Z"/></clipPath>
      <g clip-path="url(#${P}hc)">
        <ellipse cx="360" cy="478" rx="120" ry="34" fill="${SAN.hoodIn}" opacity=".32"/>
        ${glow > 0 ? `<radialGradient id="${P}gl" cx=".5" cy="1" r=".75"><stop offset="0" stop-color="#cfe9ff" stop-opacity="${.55 * glow}"/><stop offset="1" stop-color="#cfe9ff" stop-opacity="0"/></radialGradient><rect x="250" y="460" width="220" height="270" fill="url(#${P}gl)" style="mix-blend-mode:screen"/>` : ''}
      </g>
      <ellipse cx="292" cy="634" rx="18" ry="10" fill="#f08a80" opacity=".35"/>
      <ellipse cx="428" cy="634" rx="18" ry="10" fill="#f08a80" opacity=".35"/>
      ${eyes}
      <!-- круглые очки -->
      <circle cx="314" cy="596" r="32" fill="#cfe6f2" fill-opacity="${.18 + glow * .25}" stroke="${S}" stroke-width="5"/>
      <circle cx="404" cy="596" r="32" fill="#cfe6f2" fill-opacity="${.18 + glow * .25}" stroke="${S}" stroke-width="5"/>
      <path d="M346,594 Q359,586 372,594" stroke="${S}" stroke-width="5" fill="none"/>
      <path d="M296,580 l10,-6 M386,580 l10,-6" stroke="#fff" stroke-width="3" opacity=".75" stroke-linecap="round"/>
      <path d="M292,${browY} Q314,${browY - 9} 336,${browY - 2} M382,${browY - 2} Q404,${browY - 10} 428,${browY}" stroke="#5a3f2c" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M352,616 Q346,644 356,650 Q362,652 368,648" stroke="${SAN.crease}" stroke-width="4" fill="none" stroke-linecap="round"/>
      ${mo}
      <!-- редкая бородка и усики -->
      <path d="M340,664 l-3,-4 M350,662 l-1,-4 M370,662 l1,-4 M380,664 l3,-4" stroke="${SAN.beard}" stroke-width="3" stroke-linecap="round" opacity=".8"/>
      ${[[332, 700], [342, 708], [352, 712], [362, 714], [372, 711], [384, 704], [346, 698], [376, 698]].map(([x, y]) => `<path d="M${x},${y} l1,6" stroke="${SAN.beard}" stroke-width="3" stroke-linecap="round"/>`).join('')}
      <!-- край капюшона поверх лба -->
      <path d="M244,600 C240,500 290,446 360,444 C430,446 480,500 476,600" stroke="${SAN.hood}" stroke-width="26" fill="none" stroke-linecap="round"/>
      <path d="M244,600 C240,500 290,446 360,444 C430,446 480,500 476,600" stroke="${S}" stroke-width="${W}" fill="none" stroke-linecap="round" transform="translate(0,-13)"/>
      <path d="M232,606 C226,494 284,432 360,430" stroke="none" fill="none"/>
    </g>`;
  },
};

// хват телефона (в словарь кистей рига, без правки src/rig.js); сам телефон рисует проп phoneProp() поверх кисти
HANDS.phone = { parts: [ell(22, 2, 24, 20), cap(30, 14, 46, 16, 12), cap(28, -14, 46, -18, 12)],
                lines: 'M10,-6 q6,-4 12,0 M10,8 q6,-3 12,0' };
