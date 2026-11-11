// ─── болванчик: серый манекен для теста рига в полный рост (этап 2). Техническая заготовка, НЕ арт канала ───
// Локальная система как у остальных персонажей (720×1280, голова ≈ 360,590, плечи ≈ y 800, шея — 360,700),
// плюс ноги: бёдра y ≈ 1012, пол — FLOOR (y 1280). Нос-точка и глаза показывают, куда он смотрит.
window.CHARS = window.CHARS || {};
const DUM = { skin: '#dcd6cc', skinDk: '#c4bdb1', body: '#9a948a', bodyDk: '#827c72', trouser: '#6b6761', shoe: '#3a3632' };

CHARS.dummy = {
  anchors: { head: [360, 590], mouth: [360, 664], chest: [360, 860], desk: 932 },
  rig: {
    L: { shoulder: [262, 800], len: [100, 98], bend: 1 }, R: { shoulder: [458, 800], len: [100, 98], bend: -1 },
    sleeve: DUM.body, stripe: null, skin: DUM.skin, crease: DUM.bodyDk, width: 46,
    legs: { L: { hip: [318, 1012], len: [128, 124], bend: 1 }, R: { hip: [402, 1012], len: [128, 124], bend: -1 },
            width: 58, trouser: DUM.trouser, shoe: DUM.shoe, ankle: 18 },
  },
  body(st, P) {
    const b = (st.bob || 0) * .4;
    return `<g transform="translate(0,${b})">
      <rect x="335" y="690" width="50" height="96" fill="${DUM.skin}" stroke="${S}" stroke-width="${W}"/>
      <path d="M300,770 L420,770 C468,774 488,800 488,842 L470,1000 C467,1030 452,1044 430,1044 L290,1044 C268,1044 253,1030 250,1000 L232,842 C232,800 252,774 300,770 Z"
        fill="${DUM.body}" stroke="${S}" stroke-width="${W}" stroke-linejoin="round"/>
      <path d="M360,790 L360,1030" stroke="${DUM.bodyDk}" stroke-width="4" opacity=".6"/>
      <path d="M262,1006 L458,1006" stroke="${DUM.bodyDk}" stroke-width="5" opacity=".7"/>
    </g>`;
  },
  head(st, P) {
    const { lid = .5, pr = 8, mouth = 0, bob = 0 } = st, y0 = bob;
    const eye = cx => lid > .9
      ? `<path d="M${cx - 16},${580 + y0} q16,6 32,0" stroke="${S}" stroke-width="5" fill="none" stroke-linecap="round"/>`
      : `<ellipse cx="${cx}" cy="${580 + y0}" rx="17" ry="21" fill="#f7f4ee" stroke="${S}" stroke-width="5"/>
         <circle cx="${cx}" cy="${584 + y0}" r="${pr}" fill="#1e140e"/>`;
    const mouthSvg = mouth > .05
      ? `<ellipse cx="360" cy="${666 + y0}" rx="14" ry="${3 + mouth * 10}" fill="#4a1f17" stroke="${S}" stroke-width="4"/>`
      : `<path d="M342,${664 + y0} q18,6 36,0" stroke="${S}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    return `<g>
      <ellipse cx="360" cy="${585 + y0}" rx="112" ry="128" fill="${DUM.skin}" stroke="${S}" stroke-width="${W}"/>
      <ellipse cx="300" cy="${640 + y0}" rx="22" ry="12" fill="${DUM.skinDk}" opacity=".6"/>
      <ellipse cx="420" cy="${640 + y0}" rx="22" ry="12" fill="${DUM.skinDk}" opacity=".6"/>
      ${eye(318)}${eye(402)}
      <circle cx="360" cy="${622 + y0}" r="11" fill="${DUM.bodyDk}" stroke="${S}" stroke-width="4"/>
      ${mouthSvg}
    </g>`;
  },
};
