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
  // поворот st.turn (−1…1, + — лицом вправо): торс и голова уже, черты лица смещаются по ходу взгляда, дальний глаз уже
  body(st, P) {
    const b = (st.bob || 0) * .4, at = Math.min(1, Math.abs(st.turn || 0)), k = 1 - .3 * at;
    const X = x => (360 + (x - 360) * k).toFixed(1);
    return `<g transform="translate(0,${b})">
      <rect x="${X(335)}" y="690" width="${(50 * (1 - .15 * at)).toFixed(1)}" height="96" fill="${DUM.skin}" stroke="${S}" stroke-width="${W}"/>
      <path d="M${X(300)},770 L${X(420)},770 C${X(468)},774 ${X(488)},800 ${X(488)},842 L${X(470)},1000 C${X(467)},1030 ${X(452)},1044 ${X(430)},1044 L${X(290)},1044 C${X(268)},1044 ${X(253)},1030 ${X(250)},1000 L${X(232)},842 C${X(232)},800 ${X(252)},774 ${X(300)},770 Z"
        fill="${DUM.body}" stroke="${S}" stroke-width="${W}" stroke-linejoin="round"/>
      <path d="M${(360 + (st.turn || 0) * 40).toFixed(1)},790 L${(360 + (st.turn || 0) * 40).toFixed(1)},1030" stroke="${DUM.bodyDk}" stroke-width="4" opacity=".6"/>
      <path d="M${X(262)},1006 L${X(458)},1006" stroke="${DUM.bodyDk}" stroke-width="5" opacity=".7"/>
    </g>`;
  },
  head(st, P) {
    const { lid = .5, pr = 8, mouth = 0, bob = 0 } = st, y0 = bob, tn = st.turn || 0, at = Math.min(1, Math.abs(tn));
    const fx = x => 360 + (x - 360) * (1 - .45 * at) + tn * 62;   // черты лица: сжимаются и едут по ходу взгляда
    const eye = (cx0, far) => {
      const cx = fx(cx0), rx = 17 * (far ? 1 - .45 * at : 1);
      return lid > .9
        ? `<path d="M${(cx - rx).toFixed(1)},${580 + y0} q${rx.toFixed(1)},6 ${(2 * rx).toFixed(1)},0" stroke="${S}" stroke-width="5" fill="none" stroke-linecap="round"/>`
        : `<ellipse cx="${cx.toFixed(1)}" cy="${580 + y0}" rx="${rx.toFixed(1)}" ry="21" fill="#f7f4ee" stroke="${S}" stroke-width="5"/>
           <circle cx="${(cx + tn * 5).toFixed(1)}" cy="${584 + y0}" r="${pr}" fill="#1e140e"/>`;
    };
    const mx = fx(360);
    const mouthSvg = mouth > .05
      ? `<ellipse cx="${mx.toFixed(1)}" cy="${666 + y0}" rx="14" ry="${3 + mouth * 10}" fill="#4a1f17" stroke="${S}" stroke-width="4"/>`
      : `<path d="M${(mx - 18).toFixed(1)},${664 + y0} q18,6 36,0" stroke="${S}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    return `<g>
      <ellipse cx="360" cy="${585 + y0}" rx="${(112 * (1 - .1 * at)).toFixed(1)}" ry="128" fill="${DUM.skin}" stroke="${S}" stroke-width="${W}"/>
      <ellipse cx="${fx(300).toFixed(1)}" cy="${640 + y0}" rx="22" ry="12" fill="${DUM.skinDk}" opacity=".6"/>
      <ellipse cx="${fx(420).toFixed(1)}" cy="${640 + y0}" rx="22" ry="12" fill="${DUM.skinDk}" opacity=".6"/>
      ${eye(318, tn > 0)}${eye(402, tn < 0)}
      <circle cx="${(360 + tn * 92).toFixed(1)}" cy="${622 + y0}" r="11" fill="${DUM.bodyDk}" stroke="${S}" stroke-width="4"/>
      ${mouthSvg}
    </g>`;
  },
};
