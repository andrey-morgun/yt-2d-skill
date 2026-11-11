// ─── Палыч: старший, круглый и широкий, вязаная шапка, седые усы щёткой, очки на лбу ───
// Общая библиотека (грузится index.html для всех эпизодов). Контракт персонажа (pipeline.md §3.7):
//   CHARS.<who> = { rig, body(st, P), head(st, P) } — локальная система как у Толяна (голова ≈ 360,590; плечи ≈ y 800);
//   P — префикс id (clipPath/gradient), чтобы персонажи не конфликтовали в одном кадре.
//   st: стандартные поля (lid, pr, mouth, brow, bob, tilt, look, shock, bliss, t) + свои: glasses 0..1 (лоб → нос), gaze [x,y] -1..1
window.CHARS = window.CHARS || {};
const PAL = { skin: '#eab184', shade: '#d39a6c', crease: '#a8714c', sweater: '#6b6a3c', sweaterDk: '#56552f', hat: '#4b4f63', hatDk: '#3b3e4f', grey: '#bdb8ae', greyDk: '#8f8a80', nose: '#d97a63' };

function kEye(id, cx, cy, rx, ry, lid, pr, gx, gy, skinLid) {
  const ly0 = cy - ry + clamp(lid) * 2 * ry;
  const hw = lid >= 1 ? rx : rx * Math.sqrt(clamp(1 - Math.pow((ly0 - cy) / ry, 2)));
  return `<clipPath id="${id}"><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/></clipPath>
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fbf7ef"/>
    <g clip-path="url(#${id})">
      <circle cx="${cx + gx}" cy="${cy + gy}" r="${pr}" fill="#1e140e"/>
      <circle cx="${cx + gx - pr * .35}" cy="${cy + gy - pr * .35}" r="${pr * .3}" fill="#fff"/>
      <rect x="${cx - rx - 4}" y="${cy - ry - 4}" width="${2 * rx + 8}" height="${ly0 - cy + ry + 4}" fill="${skinLid}"/>
    </g>
    ${lid > .02 ? `<path d="M${cx - hw},${ly0} Q${cx},${ly0 + 4} ${cx + hw},${ly0}" stroke="${S}" stroke-width="5.5" fill="none" stroke-linecap="round"/>` : ''}
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="${S}" stroke-width="${W - 1}"/>`;
}

CHARS.palych = {
  anchors: { head: [362, 612], mouth: [362, 704], chest: [360, 800], desk: 932 },   // якоря пресетов (см. tolyan.js / presets.js)
  rig: { L: { shoulder: [236, 806], len: [96, 100], bend: 1 }, R: { shoulder: [484, 806], len: [96, 100], bend: -1 },
         sleeve: PAL.sweater, stripe: null, skin: PAL.skin, crease: PAL.crease, width: 56 },
  body(st, P) {
    const b = (st.bob || 0) * .4;
    return `<g transform="translate(0,${b})">
      <rect x="318" y="690" width="84" height="70" fill="${PAL.skin}" stroke="${S}" stroke-width="${W}"/>
      <path d="M112,1030 C110,872 150,786 248,762 L472,762 C570,786 610,872 608,1030 Z" fill="${PAL.sweater}" stroke="${S}" stroke-width="${W}" stroke-linejoin="round"/>
      <path d="M180,860 C200,940 210,990 214,1030 M540,860 C520,940 510,990 506,1030" stroke="${PAL.sweaterDk}" stroke-width="4" fill="none" opacity=".7"/>
      <ellipse cx="420" cy="884" rx="26" ry="16" fill="#7f7e4c"/>
      <ellipse cx="360" cy="762" rx="84" ry="26" fill="${PAL.sweaterDk}" stroke="${S}" stroke-width="5"/>
      <ellipse cx="360" cy="758" rx="58" ry="14" fill="${PAL.skin}" stroke="${S}" stroke-width="4"/>
      ${[-60, -40, -20, 0, 20, 40, 60].map(x => `<path d="M${360 + x},${744 + Math.abs(x) * .05} v${26 - Math.abs(x) * .12}" stroke="${PAL.sweater}" stroke-width="3" opacity=".8"/>`).join('')}
    </g>`;
  },
  head(st, P) {
    const { lid = .55, pr = 9, mouth = 0, brow = 0, bob = 0, shock = 0, bliss = 0 } = st;
    const g = clamp(st.glasses ?? 0), [gx, gy] = st.gaze || [0, 0];
    const L = st.lid >= 1 ? 1 : Math.max(lid + .06, .24);
    const eyes = bliss > .5
      ? `<path d="M280,606 Q305,620 330,606 M390,606 Q415,620 440,606" stroke="${S}" stroke-width="5.5" fill="none" stroke-linecap="round"/>`
      : kEye(P + 'eL', 305, 604, 27, 21, L, lerp(pr, 5, shock) * .9, gx * 8 + 2, gy * 6 + 6, PAL.shade) +
        kEye(P + 'eR', 415, 602, 28, 22, Math.max(L - .04, .2), lerp(pr, 5, shock) * .9, gx * 8 - 2, gy * 6 + 6, PAL.shade);
    const mo = mouth > .05
      ? `<ellipse cx="362" cy="${704 + mouth * 4}" rx="${16 + shock * 2}" ry="${3 + mouth * 11}" fill="#4a1f17" stroke="${S}" stroke-width="5"/>`
      : `<path d="M342,704 Q362,708 382,702" stroke="${S}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    // очки: g=0 на лбу (на отвороте шапки), g=1 на носу; падение с лёгким перелётом
    const gyPos = lerp(528, 628, g), gTilt = Math.sin(g * Math.PI) * -6;
    const glasses = `<g transform="translate(0,${gyPos}) rotate(${gTilt} 360 0)">
      <rect x="276" y="-22" width="64" height="44" rx="14" fill="#d8e6ea" fill-opacity=".35" stroke="#3a2a20" stroke-width="5"/>
      <rect x="380" y="-22" width="64" height="44" rx="14" fill="#d8e6ea" fill-opacity=".35" stroke="#3a2a20" stroke-width="5"/>
      <path d="M340,-4 Q360,-14 380,-4" stroke="#3a2a20" stroke-width="5" fill="none"/>
      <path d="M290,-12 l14,-4 M394,-12 l14,-4" stroke="#fff" stroke-width="3" opacity=".7" stroke-linecap="round"/></g>`;
    const browY = 562 - brow;
    return `<g transform="translate(0,${bob})">
      <ellipse cx="222" cy="614" rx="24" ry="28" fill="${PAL.skin}" stroke="${S}" stroke-width="${W}"/>
      <ellipse cx="498" cy="610" rx="25" ry="28" fill="${PAL.skin}" stroke="${S}" stroke-width="${W}"/>
      <path d="M226,520 C228,470 290,450 360,450 C432,450 494,472 496,522 C500,600 496,668 452,712 C420,736 300,738 268,712 C226,670 222,600 226,520 Z" fill="${PAL.skin}" stroke="${S}" stroke-width="${W}" stroke-linejoin="round"/>
      <clipPath id="${P}hc"><path d="M226,520 C228,470 290,450 360,450 C432,450 494,472 496,522 C500,600 496,668 452,712 C420,736 300,738 268,712 C226,670 222,600 226,520 Z"/></clipPath>
      <g clip-path="url(#${P}hc)">
        <ellipse cx="362" cy="726" rx="130" ry="44" fill="${PAL.shade}" opacity=".5"/>
        ${(() => { const r = rng(901); return [...Array(46)].map(() => { const x = 262 + r() * 196, y = 684 + r() * 40; return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.9" fill="#8f8a80" opacity=".6"/>`; }).join(''); })()}
      </g>
      <ellipse cx="270" cy="652" rx="24" ry="13" fill="#e9776c" opacity=".45"/>
      <ellipse cx="452" cy="650" rx="24" ry="13" fill="#e9776c" opacity=".45"/>
      ${eyes}
      <path d="M298,${browY + 32} q8,7 18,5 M404,${browY + 32} q8,7 18,5" stroke="${PAL.crease}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>
      <path d="M268,${browY + 8} Q302,${browY - 12} 340,${browY + 4}" stroke="#a9a399" stroke-width="18" fill="none" stroke-linecap="round"/>
      <path d="M380,${browY + 4} Q418,${browY - 14} 454,${browY + 6}" stroke="#a9a399" stroke-width="19" fill="none" stroke-linecap="round"/>
      <path d="M268,${browY + 8} Q302,${browY - 12} 340,${browY + 4} M380,${browY + 4} Q418,${browY - 14} 454,${browY + 6}" stroke="#d6d2ca" stroke-width="3" fill="none" stroke-dasharray="7 9" opacity=".7"/>
      ${mo}
      <ellipse cx="361" cy="646" rx="36" ry="30" fill="${PAL.nose}" stroke="${S}" stroke-width="${W}"/>
      <ellipse cx="348" cy="636" rx="9" ry="6" fill="#fff" opacity=".6"/>
      <!-- усы щёткой -->
      <path d="M300,690 C312,668 340,664 361,672 C382,664 410,668 422,690 C410,698 396,694 384,700 C374,692 348,692 338,700 C326,694 312,698 300,690 Z" fill="${PAL.grey}" stroke="${S}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M316,690 l-4,8 M330,692 l-2,9 M346,692 l-1,9 M376,692 l1,9 M392,692 l2,9 M406,690 l4,8" stroke="${PAL.greyDk}" stroke-width="3" stroke-linecap="round"/>
      <!-- вязаная шапка: купол + отворот -->
      <path d="M232,540 C232,452 290,404 362,404 C434,404 492,452 492,540 Z" fill="${PAL.hat}" stroke="${S}" stroke-width="${W}" stroke-linejoin="round"/>
      ${[-96, -64, -32, 0, 32, 64, 96].map(x => `<path d="M${362 + x},${412 + Math.abs(x) * .3} Q${362 + x * 1.06},470 ${362 + x * 1.1},512" stroke="${PAL.hatDk}" stroke-width="4" fill="none"/>`).join('')}
      <rect x="222" y="502" width="280" height="50" rx="16" fill="${PAL.hat}" stroke="${S}" stroke-width="${W}"/>
      ${[...Array(13)].map((_, i) => `<path d="M${240 + i * 20},508 v38" stroke="${PAL.hatDk}" stroke-width="4"/>`).join('')}
      ${glasses}
    </g>`;
  },
};
