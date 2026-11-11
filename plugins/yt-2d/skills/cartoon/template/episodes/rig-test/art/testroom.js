// ─── тестовая комната для рига (этап 2): серая стена и пол с сеткой координат. Техническая заготовка, НЕ арт канала ───
// Пол — мировой y 1280 (FLOOR персонажа при размещении y = 0). Метки x каждые 200 мировых px — по ним видно, скользит ли стопа.
// env.box = [x0, x1, top] — ящик-сиденье (TIMELINE.env.box: [{ t, v:[…] }]), рисуется за персонажем.
function testroomBack(t, env = {}) {
  let grid = '';
  for (let x = -2400; x <= 3200; x += 200) {
    grid += `<path d="M${x},-600 V1280" stroke="#958f86" stroke-width="4"/>
      <text x="${x + 10}" y="1312" font-family="JetBrains Mono" font-weight="700" font-size="26" fill="#3f3b36">${x}</text>
      <path d="M${x},1280 V1520" stroke="#5d5952" stroke-width="5"/>`;
  }
  return `<rect x="-2600" y="-800" width="6000" height="2080" fill="#bdb8b0"/>
    <rect x="-2600" y="1280" width="6000" height="900" fill="#8f8b84"/>
    ${grid}
    <path d="M-2600,1280 H3400" stroke="${S}" stroke-width="6"/>
    <path d="M-2600,1340 H3400 M-2600,1420 H3400" stroke="#837f78" stroke-width="2"/>
    ${env.box ? `<rect x="${env.box[0]}" y="${env.box[2]}" width="${env.box[1] - env.box[0]}" height="${1280 - env.box[2]}" fill="#a0784f" stroke="${S}" stroke-width="${W}"/>
      <rect x="${env.box[0]}" y="${env.box[2]}" width="${env.box[1] - env.box[0]}" height="14" fill="#b88d60" stroke="${S}" stroke-width="4"/>` : ''}`;
}
