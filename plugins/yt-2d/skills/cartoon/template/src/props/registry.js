// ─── реестр предметов в кисти (PROPS.<name>) — обёртки над чистыми функциями src/props/garage-props.js ───
// Движок (src/rig.js propSvg) рисует предмет сразу после кисти, в её слое: draw(x, y, ang, st, t, env).
//   offset — положение предмета в локальной системе кисти (x вдоль предплечья от запястья, y вниз; у правой руки y зеркалится);
//   rot — поворот (°); upright: true — rot абсолютный (предмет стоит вертикально, не крутится с рукой).
//   Ключ позы может подправить: prop:'kettle', propOffset:[dx,dy], propRot (суммируется с rot).
// Общая библиотека: грузится index.html после garage-props.js. Свои предметы эпизода — тем же способом в episodes/<ep>/ (TIMELINE.scripts).
window.PROPS = window.PROPS || {};

// чайник «на руках»: дно на ладони spread, стоит вертикально; индикатор горит, пока env.kettleOn (TIMELINE.env.kettleOn)
PROPS.kettle = { offset: [40, 0], rot: 0, upright: true,
  draw: (x, y, ang, st, t, env) => kettleProp(x, y, .9, ang, env && env.kettleOn ? 1 : 0, 'kh') };

// кружка: дно на ладони, вертикально, с паром (горячий чай)
PROPS.mug = { offset: [30, 0], rot: 0, upright: true,
  draw: (x, y, ang, st, t) => `<g transform="rotate(${ang.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})">${mugProp(x, y, '#e9e4da', '#3f8a4f', t, true)}</g>` };

// телефон в хвате HANDS.phone (пальцы на x 30–46 кисти): поперёк ладони; экран горит на st.glow (track glow, по умолчанию 1 в руке)
PROPS.phone = { offset: [38, 0], rot: 0,
  draw: (x, y, ang, st) => phoneProp(x, y, ang, st.glow ?? 1) };
