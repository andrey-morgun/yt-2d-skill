// ─── декорация garazh: широкий гараж (мир x −420…1140), задник и передний план; общая библиотека (stage-пресеты garage3/garage1) ───
// Персонажи рисуются движком МЕЖДУ garazhBack и garazhFront. Состояние сцены (лампа, автомат, чайник, вилка, кружки)
// приходит в env — его считает движок из TIMELINE.events (см. бриф): { lamp:{swing, bright}, breaker:0|1, kettleOn, plug, mugs, laptopOn }
const GZ = { wall: '#565040', b: ['#77715f', '#6f6a59', '#7c7563'], deskTop: '#a46c3b', deskFront: '#85532b' };
const GZ_BRICKS = (() => {
  const r = rng(77); let s = '';
  for (let row = 0, y = -20; y < 1000; row++, y += 64)
    for (let x = row % 2 ? -480 : -420; x < 1180; x += 122) {
      const v = Math.floor(r() * 3), dw = (r() - .5) * 6, dh = (r() - .5) * 4;
      s += `<rect x="${(x + 4 + r() * 2).toFixed(1)}" y="${(y + 4 + r() * 2).toFixed(1)}" width="${(114 + dw).toFixed(1)}" height="${(56 + dh).toFixed(1)}" rx="5" fill="${GZ.b[v]}"/>`;
    }
  return s;
})();

// мировые точки, которые нужны движку/другим сетам
const GZ_POS = {
  kettleShelf: [40, 938],      // чайник стоит на верстаке Толяна (центр дна)
  socketA: [168, 800],         // старая розетка за верстаком (перегруз)
  socketB: [-330, 700],        // вторая розетка «на другой стене» (бит 35)
  breaker: [655, 410],         // электрощиток (над Саньком, справа от окна)
  lamp: [360, 168],
  mugs: [[250, 934], [470, 934], [560, 934]],
};

function garazhBack(t, env = {}) {
  const lamp = env.lamp || { swing: 0, bright: 1 };
  const dim = 1 - .55 * (1 - lamp.bright);
  return `
  <rect x="-440" y="-40" width="1600" height="1360" fill="${GZ.wall}"/>
  ${GZ_BRICKS}
  <rect x="-440" y="620" width="1600" height="400" fill="#000" opacity=".22"/>
  <!-- окно -->
  <rect x="398" y="128" width="226" height="176" rx="6" fill="#5a4630" stroke="${S}" stroke-width="${W}"/>
  <rect x="412" y="142" width="198" height="148" fill="#22396b"/>
  <circle cx="574" cy="176" r="14" fill="#f3efd0"/>
  <path d="M412,262 Q460,226 512,252 Q560,222 610,248 L610,290 L412,290 Z" fill="#162447"/>
  ${[[438, 268], [470, 258], [520, 272], [548, 262], [588, 276]].map(([x, y]) => `<rect x="${x}" y="${y}" width="7" height="7" fill="#f6c94c"/>`).join('')}
  <path d="M511,142 V290 M412,216 H610" stroke="#5a4630" stroke-width="8"/>
  <rect x="388" y="300" width="246" height="14" rx="4" fill="#7a5a3a" stroke="${S}" stroke-width="5"/>
  <!-- перфощит слева, над верстаком Толяна -->
  <rect x="-250" y="190" width="220" height="230" rx="6" fill="#c79a5e" stroke="${S}" stroke-width="${W}"/>
  ${(() => { let s = ''; for (let y = 210; y < 410; y += 22) for (let x = -232; x < -40; x += 22) s += `<circle cx="${x}" cy="${y}" r="2.5" fill="#8a6338"/>`; return s; })()}
  <path d="M-200,220 V320" stroke="${S}" stroke-width="5"/><rect x="-216" y="210" width="32" height="18" rx="3" fill="#7d8389" stroke="${S}" stroke-width="4"/>
  <rect x="-146" y="218" width="12" height="70" rx="4" fill="#d8453b" stroke="${S}" stroke-width="4"/><path d="M-140,288 V350" stroke="#aeb4b8" stroke-width="5"/>
  <path d="M-82,220 l0,110 m-12,-110 a14,14 0 1 0 24,0" stroke="${S}" stroke-width="5" fill="none"/>
  <!-- труба -->
  <rect x="1010" y="-40" width="34" height="1000" fill="#4a4d50" stroke="${S}" stroke-width="${W}"/>
  <rect x="1004" y="360" width="46" height="18" rx="3" fill="#5b5f63" stroke="${S}" stroke-width="4"/>
  <!-- электрощиток справа -->
  <rect x="${GZ_POS.breaker[0] - 70}" y="${GZ_POS.breaker[1] - 90}" width="140" height="180" rx="8" fill="#9aa0a3" stroke="${S}" stroke-width="${W}"/>
  <rect x="${GZ_POS.breaker[0] - 52}" y="${GZ_POS.breaker[1] - 60}" width="104" height="70" rx="4" fill="#2f3236" stroke="${S}" stroke-width="4"/>
  ${[0, 1, 2, 3].map(i => { const x = GZ_POS.breaker[0] - 40 + i * 26, down = i === 2 && env.breaker; return `<rect x="${x - 8}" y="${GZ_POS.breaker[1] - 50}" width="16" height="50" rx="3" fill="#e8e4da"/><rect x="${x - 6}" y="${GZ_POS.breaker[1] - (down ? 20 : 48)}" width="12" height="18" rx="2" fill="${down ? '#e2453a' : '#3a3d42'}"/>`; }).join('')}
  <path d="M${GZ_POS.breaker[0] - 40},${GZ_POS.breaker[1] + 40} h80 M${GZ_POS.breaker[0] - 40},${GZ_POS.breaker[1] + 60} h60" stroke="#6b7073" stroke-width="5" stroke-linecap="round"/>
  <path d="M${GZ_POS.breaker[0]},${GZ_POS.breaker[1] - 90} V-40" stroke="${S}" stroke-width="8"/>
  <!-- шины справа -->
  ${[0, 1, 2].map(i => `<ellipse cx="900" cy="${1000 - i * 62}" rx="120" ry="36" fill="#2c2d30" stroke="${S}" stroke-width="${W}"/><ellipse cx="900" cy="${992 - i * 62}" rx="58" ry="14" fill="#1a1b1d"/>`).join('')}
  <!-- розетки -->
  ${socketProp(GZ_POS.socketA[0], GZ_POS.socketA[1])}
  ${socketProp(GZ_POS.socketB[0], GZ_POS.socketB[1])}
  <!-- провод чайника в старую розетку -->
  <path d="M${GZ_POS.kettleShelf[0] + 40},${GZ_POS.kettleShelf[1] - 20} C${GZ_POS.kettleShelf[0] + 90},${GZ_POS.kettleShelf[1] - 10} ${GZ_POS.socketA[0] - 40},${GZ_POS.socketA[1] + 80} ${GZ_POS.socketA[0]},${GZ_POS.socketA[1] + 14}" stroke="${S}" stroke-width="9" fill="none" opacity="${env.plug > 0 ? 0 : 1}"/>
  <!-- лампа -->
  ${lampProp(GZ_POS.lamp[0], GZ_POS.lamp[1], lamp.swing, lamp.bright, 'gzl')}
  <rect x="-440" y="-40" width="1600" height="1360" fill="#000" opacity="${(1 - dim).toFixed(3)}"/>`;
}

// передний план: верстак Толяна, стол Палыча с ноутом и кружками, чайник (если не в руках), удлинитель
function garazhFront(t, env = {}) {
  const ket = env.kettle || { at: 'shelf' };          // 'shelf' | 'hands' (тогда чайник рисует движок у запястья)
  const plug = env.plug ?? -1;
  return `
  ${workbenchProp(-300, 960, 420)}
  ${ket.at === 'shelf' ? kettleProp(GZ_POS.kettleShelf[0], GZ_POS.kettleShelf[1] + 22, .9, 0, env.kettleOn ? 1 : 0, 'ks') : ''}
  ${plug >= 0 ? socketProp(GZ_POS.socketB[0], GZ_POS.socketB[1], plug, [GZ_POS.kettleShelf[0] - 30, GZ_POS.kettleShelf[1] + 10]) : ''}
  <!-- стол Палыча -->
  <rect x="140" y="932" width="560" height="44" rx="4" fill="${GZ.deskTop}" stroke="${S}" stroke-width="${W}"/>
  <rect x="150" y="976" width="540" height="340" fill="${GZ.deskFront}" stroke="${S}" stroke-width="${W}"/>
  <rect x="300" y="1040" width="240" height="76" rx="6" fill="#7a4b26" stroke="${S}" stroke-width="5"/>
  <circle cx="420" cy="1078" r="7" fill="#e3d6bf" stroke="${S}" stroke-width="3"/>
  <!-- ноутбук спиной к камере -->
  <path d="M262,948 L458,948 L468,960 L252,960 Z" fill="#9ea2a4" stroke="${S}" stroke-width="5" stroke-linejoin="round"/>
  <rect x="270" y="812" width="180" height="138" rx="10" fill="#c8cac6" stroke="${S}" stroke-width="${W}"/>
  <circle cx="360" cy="880" r="14" fill="none" stroke="#9ea2a4" stroke-width="5"/>
  <rect x="404" y="830" width="34" height="24" rx="4" fill="#9b3b32" stroke="${S}" stroke-width="3" transform="rotate(-8 421 842)"/>
  ${env.laptopOn !== false ? `<ellipse cx="360" cy="800" rx="140" ry="60" fill="#cfe3ff" opacity=".12"/>` : ''}
  ${(env.mugs ? GZ_POS.mugs : []).map(([x, y], i) => mugProp(x, y, ['#e9e4da', '#d8453b', '#5c8a4a'][i], ['#3f8a4f', '#f4f4f0', '#f4f4f0'][i], t, i === 0)).join('')}`;
}
