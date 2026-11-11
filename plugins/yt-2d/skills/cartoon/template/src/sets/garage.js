const BRICKS = (() => {
  const r = rng(7); let s = '';
  for (let row = 0, y = -20; y < 1000; row++, y += 64) {
    for (let x = row % 2 ? -60 : 0; x < 760; x += 122) {
      // кирпичи без обводки: два-три близких тона, тёмный зазор = шов, лёгкая неровность
      const v = Math.floor(r() * 3), dw = (r() - .5) * 6, dh = (r() - .5) * 4;
      s += `<rect x="${(x + 4 + r() * 2).toFixed(1)}" y="${(y + 4 + r() * 2).toFixed(1)}" width="${(114 + dw).toFixed(1)}" height="${(56 + dh).toFixed(1)}" rx="5" fill="${['#77715f', '#6f6a59', '#7c7563'][v]}"/>`;
    }
  }
  return s;
})();

const PEG_HOLES = (() => { let s = ''; for (let y = 190; y < 395; y += 22) for (let x = 68; x < 245; x += 22) s += `<circle cx="${x}" cy="${y}" r="2.5" fill="#8a6338"/>`; return s; })();

// ─── shot: garage (wide + face closeup) ────────────────────────────────────
function garage(t, st, rainbow) {
  const flick = 0.33 + 0.03 * Math.sin(t * 17) + 0.02 * Math.sin(t * 41);
  const steam = [0, 1, 2].map(i => {
    const ph = (t * 0.6 + i / 3) % 1, y = 880 - ph * 120, x = 128 + Math.sin(ph * 9 + i) * 10;
    return `<path d="M${x},${y + 40} q-10,-12 0,-22 q10,-12 0,-22" stroke="#e8e0d0" stroke-width="4" fill="none" stroke-linecap="round" opacity="${(1 - ph) * .7 * Math.min(1, ph * 5)}"/>`;
  }).join('');
  const dust = Array.from({ length: 14 }, (_, i) => {
    const r = rng(100 + i); const bx = 60 + r() * 600, by = 120 + r() * 800, sp = 6 + r() * 14;
    const x = bx + Math.sin(t * .7 + i) * 18, y = by - (t * sp) % 60;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${1.5 + r() * 2}" fill="#ffcf7a" opacity="${.35 + .3 * Math.sin(t * 3 + i)}"/>`;
  }).join('');
  const glowCol = rainbow ? `hsl(${(t * 260) % 360},100%,62%)` : '#cfe3ff';
  return `<svg viewBox="0 0 720 1280" width="720" height="1280" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bulb"><stop offset="0" stop-color="#ffd27a" stop-opacity=".9"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>
    <radialGradient id="scr" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${glowCol}" stop-opacity="${rainbow ? .5 : .45}"/><stop offset="1" stop-color="${glowCol}" stop-opacity="0"/></radialGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient>
  </defs>
  <rect width="720" height="1280" fill="#565040"/>
  ${BRICKS}
  <rect y="600" width="720" height="400" fill="url(#floor)"/>
  <!-- окно -->
  <rect x="398" y="128" width="226" height="176" rx="6" fill="#5a4630" stroke="${S}" stroke-width="${W}"/>
  <rect x="412" y="142" width="198" height="148" fill="#22396b"/>
  <circle cx="574" cy="176" r="14" fill="#f3efd0"/>
  <path d="M412,262 Q460,226 512,252 Q560,222 610,248 L610,290 L412,290 Z" fill="#162447"/>
  ${[[438, 268], [470, 258], [520, 272], [548, 262], [588, 276]].map(([x, y]) => `<rect x="${x}" y="${y}" width="7" height="7" fill="#f6c94c"/>`).join('')}
  <path d="M511,142 V290 M412,216 H610" stroke="#5a4630" stroke-width="8"/>
  <rect x="412" y="142" width="198" height="148" fill="none" stroke="${S}" stroke-width="4"/>
  <rect x="388" y="300" width="246" height="14" rx="4" fill="#7a5a3a" stroke="${S}" stroke-width="5"/>
  <!-- перфорированный щит с инструментом -->
  <rect x="50" y="170" width="200" height="232" rx="6" fill="#c79a5e" stroke="${S}" stroke-width="${W}"/>
  ${PEG_HOLES}
  <path d="M90,200 V300" stroke="${S}" stroke-width="5"/><rect x="74" y="190" width="32" height="18" rx="3" fill="#7d8389" stroke="${S}" stroke-width="4"/>
  <rect x="134" y="198" width="12" height="70" rx="4" fill="#d8453b" stroke="${S}" stroke-width="4"/><path d="M140,268 V330" stroke="#aeb4b8" stroke-width="5"/>
  <path d="M198,200 l0,110 m-12,-110 a14,14 0 1 0 24,0" stroke="${S}" stroke-width="5" fill="none"/>
  <!-- полка -->
  <rect x="40" y="420" width="104" height="72" rx="3" fill="#c99b62" stroke="${S}" stroke-width="${W}"/>
  <path d="M40,440 H144" stroke="#a87a45" stroke-width="10"/>
  <rect x="160" y="444" width="46" height="48" rx="4" fill="#4f8a5a" stroke="${S}" stroke-width="5"/>
  <rect x="-10" y="490" width="236" height="14" rx="3" fill="#7a5a3a" stroke="${S}" stroke-width="5"/>
  <!-- труба -->
  <rect x="580" y="-10" width="34" height="960" fill="#4a4d50" stroke="${S}" stroke-width="${W}"/>
  <rect x="574" y="340" width="46" height="18" rx="3" fill="#5b5f63" stroke="${S}" stroke-width="4"/>
  <rect x="574" y="700" width="46" height="18" rx="3" fill="#5b5f63" stroke="${S}" stroke-width="4"/>
  <!-- лампочка -->
  <circle cx="300" cy="138" r="270" fill="url(#bulb)" opacity="${flick}"/>
  <path d="M300,-10 V112" stroke="${S}" stroke-width="3"/>
  <rect x="290" y="108" width="20" height="16" rx="3" fill="#3c3c3c" stroke="${S}" stroke-width="3"/>
  <circle cx="300" cy="138" r="17" fill="#fff0b8" stroke="${S}" stroke-width="4"/>
  <!-- персонаж -->
  ${tolyan(st)}
  <!-- свет от экрана на лице -->
  <ellipse cx="${rainbow ? 362 : 470}" cy="${rainbow ? 700 : 720}" rx="${rainbow ? 230 : 210}" ry="${rainbow ? 250 : 240}" fill="url(#scr)" style="mix-blend-mode:${rainbow ? 'soft-light' : 'screen'}"/>
  <!-- стол -->
  <rect x="-20" y="932" width="760" height="44" rx="4" fill="#a46c3b" stroke="${S}" stroke-width="${W}"/>
  <rect x="-10" y="976" width="740" height="320" fill="#85532b" stroke="${S}" stroke-width="${W}"/>
  <rect x="230" y="1040" width="260" height="78" rx="6" fill="#7a4b26" stroke="${S}" stroke-width="5"/>
  <circle cx="360" cy="1079" r="7" fill="#e3d6bf" stroke="${S}" stroke-width="3"/>
  <!-- рука на столе: без рига — старая статичная варежка -->
  ${st.arms ? '' : `<ellipse cx="256" cy="940" rx="36" ry="22" fill="${SKIN}" stroke="${S}" stroke-width="${W}"/>
  <path d="M244,926 v16 M258,924 v18 M272,926 v16" stroke="#b97f55" stroke-width="3"/>`}
  <!-- кружка -->
  ${steam}
  <rect x="104" y="880" width="54" height="58" rx="6" fill="#e9e4da" stroke="${S}" stroke-width="5"/>
  <rect x="104" y="898" width="54" height="16" fill="#3f8a4f"/>
  <path d="M158,892 a14,14 0 0 1 0,30" stroke="${S}" stroke-width="5" fill="none"/>
  <rect x="104" y="880" width="54" height="58" rx="6" fill="none" stroke="${S}" stroke-width="5"/>
  <!-- ноутбук (крышка со спины) -->
  <path d="M402,950 L672,950 L684,962 L392,962 Z" fill="#9ea2a4" stroke="${S}" stroke-width="5" stroke-linejoin="round"/>
  <rect x="412" y="772" width="252" height="180" rx="12" fill="#c8cac6" stroke="${S}" stroke-width="${W}"/>
  <circle cx="538" cy="860" r="18" fill="none" stroke="#9ea2a4" stroke-width="5"/>
  <rect x="590" y="800" width="44" height="30" rx="5" fill="#f08a3c" stroke="${S}" stroke-width="4" transform="rotate(-8 612 815)"/>
  <rect x="438" y="900" width="34" height="22" rx="4" fill="#5aa0d8" stroke="${S}" stroke-width="3" transform="rotate(6 455 911)"/>
  <!-- руки переднего слоя (подняты перед корпусом) — поверх стола и ноутбука -->
  ${armsSvg(st.arms, 'front')}
  ${dust}
</svg>`;
}
(window.SETS = window.SETS || {}).garage = (t, shot, st) => garage(t, st, !!shot.rainbow);
