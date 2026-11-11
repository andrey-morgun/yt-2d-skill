// ─── set: chat — ноутбук крупно, ОДНО окно чата Claude на весь экран; содержимое — данные TIMELINE.chat ───
// Лог чата сквозной на весь эпизод: состояние экрана в момент t — чистая функция t, любой shot с set:'chat'
// просто показывает лог в этот момент. Материалы (фон, рамка, клавиатура, рука на тачпаде) — как у screen.js.
//
// TIMELINE.chat = [                       (только литералы; порядок элементов = порядок в логе)
//   { id:'m1', t, from:'user',   text, type?:'typed'|'pop', speed?, sendAt?, pinned?:true, wrap? },
//   { id:'m2', t, from:'claude', text, type?:'pop'|'typed', speed?, pinned?:true, button?:'Запустить' },
//   { typing:[a,b] },                      индикатор «печатает…» в окне [a,b)
//   { t, button:'Запустить', in:'m2' },    кнопка появляется в сообщении позже самого сообщения
//   { cursor:[a,b], to:'m2' },             курсор едет к кнопке сообщения m2 (видим с a до клика+0.9 / b+1 / ближайшего off)
//   { click: t },                          клик по кнопке, к которой ехал последний курсор
//   { progress:{ from, to, pct0, pct1, label:'Запуск…' } },   строка «Запуск… ▓▓▓░░░░ 37 %» ползёт, экран мерцает
//   { off:[a,b] },                         экран выключен (чёрный, блик) в окне [a,b)
// ]
// user: t — старт печати в строке ввода, клавиши с ритмом (speed симв/с, по умолчанию 11), отправка sendAt
//       (по умолчанию последняя клавиша + 0.3) — пузырь прыгает в лог. type:'pop' — появляется сразу в t.
// claude: t — момент появления; 'pop' (по умолчанию) или 'typed' — быстрая печатная машинка (speed, по умолчанию 45).
// pinned — без анимации появления (висело «до начала»). Мат в text пишется уже с цензурой («бл*дь»).
// Параметры кадра: shot.sleeve (рукав, по умолчанию '#6b6a3c'), shot.skin ('#eab184'), shot.wrap (символов в строке, 22).
// Эпизод: TIMELINE.chatStyle = { fs, lh, wrap } — размер текста ленты (по умолчанию 20 px, строка 26, перенос 22).
//
// chatSchedule(TIMELINE.chat) — чистый помощник (без DOM/lib.js), работает и в node: из episodes/<ep>/sfx.mjs
//   const { chatSchedule } = createRequire(import.meta.url)('../../src/sets/chat.js');
//   chatSchedule(TL.chat).events → [{ t, kind, id, ch? }] kind: key | send | pop | char | typingStart | typingEnd |
//   button | cursorStart | click | progressStart | progressEnd | off | on   (отсортированы по t, t округлены до мс)
//   .msgs[i] — { id, from, text, at (момент появления в логе), keys[] (моменты клавиш), lastKey, buttonAt }

function chatRng(seed) { return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }

function chatSchedule(items) {
  const msgs = [], typing = [], progress = [], cursors = [], clicks = [], offs = [], buttons = [], events = [];
  const ms = x => Math.round(x * 1000) / 1000;
  const ev = (t, kind, id, extra) => events.push(Object.assign({ t: ms(t), kind, id: id == null ? null : id }, extra || {}));
  (items || []).forEach((it, i) => {
    if (it.text != null) {
      const user = it.from === 'user', type = it.type || (user ? 'typed' : 'pop');
      const m = { id: it.id || `m${msgs.length + 1}`, from: user ? 'user' : 'claude', text: String(it.text), type, t: it.t,
        at: it.t, pinned: !!it.pinned, button: it.button || null, buttonAt: it.button ? it.t : null, keys: [], speed: it.speed, wrap: it.wrap };
      if (user && type === 'typed') {
        const speed = it.speed || 11, r = chatRng(1000 + i * 7919), chars = [...m.text];
        let k = it.t;
        chars.forEach(ch => { m.keys.push(ms(k)); k += (0.65 + 0.7 * r()) * (ch === ' ' ? 1.6 : /[.,!?…:]/.test(ch) ? 1.3 : 1) / speed; });
        m.lastKey = m.keys[m.keys.length - 1];
        m.at = m.pinned ? it.t : it.sendAt != null ? it.sendAt : ms(m.lastKey + 0.3);
        if (!m.pinned) { m.keys.forEach((kt, j) => ev(kt, 'key', m.id, { ch: chars[j] })); ev(m.at, 'send', m.id); }
      } else if (type === 'typed') {
        m.speed = it.speed || 45;
        if (!m.pinned) { ev(m.at, 'pop', m.id); [...m.text].forEach((ch, j) => { if (ch !== ' ') ev(m.at + j / m.speed, 'char', m.id, { ch }); }); }
      } else if (!m.pinned) ev(m.at, 'pop', m.id);
      msgs.push(m);
    } else if (it.typing) { typing.push({ a: it.typing[0], b: it.typing[1] }); ev(it.typing[0], 'typingStart'); ev(it.typing[1], 'typingEnd'); }
    else if (it.progress) { const p = Object.assign({ pct0: 0, pct1: 100, label: 'Запуск…' }, it.progress); progress.push(p); ev(p.from, 'progressStart'); ev(p.to, 'progressEnd'); }
    else if (it.button) { buttons.push({ t: it.t, label: it.button, in: it.in }); ev(it.t, 'button', it.in); }
    else if (it.cursor) { cursors.push({ a: it.cursor[0], b: it.cursor[1], to: it.to }); ev(it.cursor[0], 'cursorStart', it.to); }
    else if (it.click != null) { clicks.push(it.click); }
    else if (it.off) { offs.push({ a: it.off[0], b: it.off[1] }); ev(it.off[0], 'off'); ev(it.off[1], 'on'); }
  });
  buttons.forEach(b => { const m = msgs.find(x => x.id === b.in); if (m) { m.button = b.label; m.buttonAt = b.t; } });
  cursors.forEach(c => {
    c.click = clicks.find(k => k >= c.a && k <= c.b + 3);
    const off = offs.map(o => o.a).filter(x => x > c.a).sort((x, y) => x - y)[0];
    c.hide = Math.min(c.click != null ? c.click + .9 : c.b + 1, off == null ? Infinity : off);
  });
  clicks.forEach(k => { const c = cursors.filter(x => x.a <= k).pop(); ev(k, 'click', c ? c.to : null); });
  events.sort((x, y) => x.t - y.t);
  return { msgs, typing, progress, cursors, clicks, offs, events };
}

if (typeof module !== 'undefined' && module.exports) module.exports = { chatSchedule };

if (typeof window !== 'undefined') (function () {
  // ── геометрия экрана (как у screen.js: рамка 34,296 652×508; матрица 56,318 608×464) ──
  const SX = 56, SY = 318, SW = 608, SH = 464;           // матрица
  const HEAD_H = 50, LIST_TOP = SY + HEAD_H + 8, LIST_BOT = SY + SH - 56, LIST_H = LIST_BOT - LIST_TOP;
  const INPUT_Y = SY + SH - 46;                           // строка ввода
  // TIMELINE.chatStyle = { fs, lh, wrap } — крупность текста на весь эпизод (по умолчанию 20 / 26 / 22)
  const CS = (typeof TIMELINE === 'object' && TIMELINE && TIMELINE.chatStyle) || {};
  const FS = CS.fs || 20, LH = CS.lh || Math.round(FS * 1.3), PAD = 10, PADX = 14, GAP = 14, BTN_H = 40, PROG_H = 40, TYPING_H = 30;
  const ACCENT = '#d97757', INK = '#2b2623', PAPER = '#f8f4ec', BUBBLE = '#ebe3d6', MUTED = '#9a9082';
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  let ctx = null;
  function measure(str, size) {           // ширина строки Rubik 700 (canvas; шрифты уже загружены render.mjs)
    if (!ctx) { const c = document.createElement('canvas'); ctx = c.getContext('2d'); }
    if (!ctx) return str.length * size * .56;
    ctx.font = `700 ${size}px Rubik`;
    return ctx.measureText(str.replace(/₽/g, 'Р')).width;
  }
  // ₽ нет в наших woff2 (unicode-range Rubik без U+20BD) — рисуем «Р» + перекладина тем же шрифтом
  function textRun(x, y, str, size, fill, extra) {
    extra = extra || '';
    const T = (xx, s) => `<text x="${xx.toFixed(1)}" y="${y}" font-family="Rubik" font-weight="700" font-size="${size}" fill="${fill}"${extra}>${esc(s)}</text>`;
    if (!str.includes('₽')) return T(x, str);
    let out = '', cx = x;
    str.split('₽').forEach((part, i, arr) => {
      if (part) { out += T(cx, part); cx += measure(part, size); }
      if (i < arr.length - 1) {
        out += T(cx, 'Р') + `<rect x="${(cx - size * .09).toFixed(1)}" y="${(y - size * .3).toFixed(1)}" width="${(size * .52).toFixed(1)}" height="${(size * .1).toFixed(1)}" fill="${fill}"${extra}/>`;
        cx += measure('Р', size);
      }
    });
    return out;
  }
  function wrapText(str, n) {             // перенос по словам, ≤ n символов в строке (длинное слово режется)
    const lines = []; let cur = '';
    str.split(' ').forEach(w => {
      while (w.length > n) { if (cur) { lines.push(cur); cur = ''; } lines.push(w.slice(0, n)); w = w.slice(n); }
      if (!cur) cur = w; else if ((cur + ' ' + w).length <= n) cur += ' ' + w; else { lines.push(cur); cur = w; }
    });
    if (cur) lines.push(cur);
    return lines;
  }
  const easeOut = k => 1 - (1 - k) * (1 - k);
  const asterisk = (cx, cy, r, sw) => `<g transform="translate(${cx},${cy})" stroke="${ACCENT}" stroke-width="${sw}" stroke-linecap="round">` +
    [0, 1, 2, 3, 4, 5].map(i => `<path d="M0,0 L${(Math.cos(i * Math.PI / 3) * r).toFixed(1)},${(Math.sin(i * Math.PI / 3) * r).toFixed(1)}"/>`).join('') + '</g>';

  const CKEYS = (() => {                  // клавиатура — та же сетка, что у screen.js
    let s = '';
    for (let row = 0; row < 4; row++) {
      const y = 822 + row * 42, inset = 38 - row * 9, n = 12, w = (720 - 2 * (40 + inset)) / n;
      for (let i = 0; i < n; i++) s += `<rect x="${40 + inset + i * w + 3}" y="${y}" width="${w - 6}" height="34" rx="7" fill="#e3e5e6" stroke="${S}" stroke-width="3"/>`;
    }
    return s;
  })();

  let cache = { src: null, sch: null };
  const schedule = () => { if (cache.src !== TIMELINE.chat) cache = { src: TIMELINE.chat, sch: chatSchedule(TIMELINE.chat) }; return cache.sch; };

  // раскладка лога в момент t: элементы (сообщения / «печатает…» / прогресс) с высотами и прокруткой
  function layout(sch, t, wrapN) {
    const els = [];
    sch.msgs.forEach(m => {
      if (t < m.at) return;
      const lines = wrapText(m.text, m.wrap || wrapN);
      const hasBtn = m.button && t >= m.buttonAt;
      const bk = hasBtn ? (m.pinned && m.buttonAt <= m.at ? 1 : easeOut(prog(t, m.buttonAt, m.buttonAt + .22))) : 0;
      const full = lines.length * LH + 2 * PAD + GAP + bk * (BTN_H + 12);
      const e = m.pinned ? 1 : easeOut(prog(t, m.at, m.at + .22));
      els.push({ kind: 'msg', m, lines, at: m.at, e, bk, h: full * e });
    });
    sch.typing.forEach(tp => {
      if (t < tp.a || t >= tp.b + .15) return;
      const e = easeOut(prog(t, tp.a, tp.a + .2)) * (1 - prog(t, tp.b, tp.b + .15));
      els.push({ kind: 'typing', at: tp.a, e, h: (TYPING_H + GAP) * e });
    });
    sch.progress.forEach(p => {
      if (t < p.from) return;
      const e = easeOut(prog(t, p.from, p.from + .22));
      els.push({ kind: 'progress', p, at: p.from, e, h: (PROG_H + GAP) * e });
    });
    els.sort((x, y) => x.at - y.at || (x.kind === 'typing' ? -1 : 1));
    let y = 0;
    els.forEach(el => { el.y = y; y += el.h; });
    return { els, scroll: Math.max(0, y - LIST_H + 4), total: y };
  }

  function chat(t, shot) {
    const sch = schedule();
    const wrapN = shot.wrap || CS.wrap || 22, SLEEVE = shot.sleeve || '#6b6a3c', SKINC = shot.skin || '#eab184';
    const L = layout(sch, t, wrapN);
    const off = sch.offs.find(o => t >= o.a && t < o.b);
    const cur = sch.cursors.find(c => t >= c.a && t < c.hide);
    const click = sch.clicks.filter(k => k <= t).pop();
    const clickCursor = click != null ? sch.cursors.filter(c => c.a <= click).pop() : null;
    const typingMsg = sch.msgs.find(m => m.from === 'user' && m.type === 'typed' && !m.pinned && t >= m.keys[0] && t < m.at);
    const prog_ = sch.progress.find(p => t >= p.from && t < p.to);

    // ── лог ──
    let list = '';
    const btnCenters = {};
    L.els.forEach(el => {
      const top = LIST_TOP + el.y - L.scroll;
      if (top > LIST_BOT + 40 || top + el.h < LIST_TOP - 60) return;
      if (el.kind === 'typing') {
        list += `<g opacity="${el.e.toFixed(2)}">${asterisk(SX + 30, top + 15, 7, 3)}` +
          [0, 1, 2].map(i => `<circle cx="${SX + 56 + i * 15}" cy="${(top + 16 - Math.max(0, Math.sin(t * 12 - i * .9)) * 6).toFixed(1)}" r="4.5" fill="#b9ae9c"/>`).join('') +
          `<text x="${SX + 108}" y="${(top + 21).toFixed(1)}" font-family="Rubik" font-weight="700" font-size="15" fill="${MUTED}">печатает…</text></g>`;
        return;
      }
      if (el.kind === 'progress') {
        const p = el.p, k = prog(t, p.from, p.to);
        const crawl = clamp(k - .045 * Math.sin(k * 23) * (1 - k));            // неровное ползание
        const pct = Math.round(lerp(p.pct0, p.pct1, Math.floor(crawl * 40) / 40));
        const cells = 7, filled = Math.round(pct / 100 * cells);
        const lx = SX + 48, ty = top + 26, lw = measure(p.label, 18);
        let s = textRun(lx, ty, p.label, 18, INK);
        for (let i = 0; i < cells; i++) s += `<rect x="${(lx + lw + 12 + i * 16).toFixed(1)}" y="${(top + 9).toFixed(1)}" width="13" height="19" fill="${i < filled ? ACCENT : '#e4dccd'}"/>`;
        s += textRun(lx + lw + 12 + cells * 16 + 10, ty, `${pct} %`, 18, INK);
        list += `<g opacity="${el.e.toFixed(2)}">${s}</g>`;
        return;
      }
      const m = el.m, lines = el.lines;
      if (m.from === 'user') {
        const w = Math.max(...lines.map(l => measure(l, FS))) + 2 * PADX, h = lines.length * LH + 2 * PAD;
        const x = SX + SW - 16 - w;
        const yb = m.pinned ? top : lerp(INPUT_Y - 4, top, el.e);          // прыгает из строки ввода
        list += `<g><rect x="${x.toFixed(1)}" y="${yb.toFixed(1)}" width="${w.toFixed(1)}" height="${h}" rx="14" fill="${BUBBLE}"/>` +
          lines.map((l, i) => textRun(x + PADX, (yb + PAD + 19 + i * LH).toFixed(1), l, FS, '#3a332e')).join('') + '</g>';
      } else {
        const shown = m.type === 'typed' && !m.pinned ? Math.floor((t - m.at) * m.speed) : Infinity;
        let used = 0, s = asterisk(SX + 30, (top + PAD + 10).toFixed(1), 8, 3.5);
        lines.forEach((l, i) => {
          const part = shown === Infinity ? l : l.slice(0, Math.max(0, shown - used));
          used += l.length + 1;
          if (part) s += textRun(SX + 48, (top + PAD + 19 + i * LH).toFixed(1), part, FS, INK);
        });
        if (el.bk > 0) {
          const bw = measure(m.button, 18) + 44, bx = SX + 48, by = top + PAD + lines.length * LH + 12;
          const pressed = clickCursor && clickCursor.to === m.id && t >= click && t < click + .15;
          const sc = easeOutBack(el.bk), cx = bx + bw / 2, cy = by + BTN_H / 2, dy = pressed ? 3 : 0;
          btnCenters[m.id] = { x: cx, y: cy };
          s += `<g transform="translate(${cx.toFixed(1)},${cy.toFixed(1)}) scale(${sc.toFixed(3)}) translate(${(-cx).toFixed(1)},${(-cy).toFixed(1)})">
            <rect x="${bx}" y="${(by + dy).toFixed(1)}" width="${bw.toFixed(1)}" height="${BTN_H}" rx="12" fill="${pressed ? '#3d7d39' : '#4f9a4a'}" stroke="${INK}" stroke-width="3"/>
            ${textRun(bx + 22, (by + 27 + dy).toFixed(1), m.button, 18, '#fff')}</g>`;
        }
        const dy = m.pinned ? 0 : (1 - el.e) * 10;
        list += `<g opacity="${el.e.toFixed(2)}" transform="translate(0,${dy.toFixed(1)})">${s}</g>`;
      }
    });

    // ── строка ввода ──
    let input = '';
    if (typingMsg) {
      const n = typingMsg.keys.filter(k => k <= t).length, txt = typingMsg.text.slice(0, n), w = measure(txt, 17);
      input = (txt ? textRun(SX + 34, INPUT_Y + 25, txt, 17, INK) : '') +
        (Math.floor(t * 2.4) % 2 === 0 ? `<rect x="${(SX + 36 + w).toFixed(1)}" y="${INPUT_Y + 10}" width="2.5" height="20" fill="${INK}"/>` : '');
    } else input = `<text x="${SX + 34}" y="${INPUT_Y + 25}" font-family="Rubik" font-weight="700" font-size="16" fill="#b9ae9c">Ответить Claude…</text>`;

    // ── курсор ──
    let cursor = '', cxp = 560, cyp = 640, cursorOn = false;
    if (cur && !off) {
      const tgt = btnCenters[cur.to] || { x: 360, y: 600 };
      const mv = easeInOut(prog(t, cur.a, cur.b));
      cxp = lerp(560, tgt.x + 8, mv); cyp = lerp(640, tgt.y + 6, mv); cursorOn = true;
      const clicking = cur.click != null && t >= cur.click && t < cur.click + .1;
      cursor = `<g transform="translate(${cxp.toFixed(1)},${cyp.toFixed(1)}) scale(${clicking ? .82 : 1})">
        <path d="M0,0 L0,34 L9,26 L16,42 L23,39 L16,23 L28,23 Z" fill="#fff" stroke="#111" stroke-width="3" stroke-linejoin="round"/></g>`;
    }

    // ── мерцание экрана во время прогресса ──
    let flick = '';
    if (prog_ && !off) {
      const n = Math.max(0, Math.sin(t * 23) * Math.sin(t * 37.3)) * .12 + .04 * Math.sin(t * 61);
      const band = ((t - prog_.from) * 260) % (SH + 80) - 40;
      flick = `<rect x="${SX}" y="${SY}" width="${SW}" height="${SH}" fill="#000" opacity="${Math.max(0, n).toFixed(3)}"/>
        <rect x="${SX}" y="${(SY + band).toFixed(1)}" width="${SW}" height="22" fill="#fff" opacity="${(0.05 + .04 * Math.sin(t * 17)).toFixed(3)}"/>`;
    }

    // ── рука: на клавишах (пока печатает), на тачпаде за курсором, иначе отдыхает на тачпаде ──
    const restX = 510, restY = 1022, keysX = 430, keysY = 912;
    let hx = restX, hy = restY;
    if (typingMsg) {
      const wIn = easeOut(prog(t, typingMsg.keys[0], typingMsg.keys[0] + .25));
      const ki = typingMsg.keys.filter(k => k <= t).length - 1, bounce = Math.exp(-(t - typingMsg.keys[ki]) / .07);
      hx = lerp(restX, keysX + (ki % 2 ? 14 : -10), wIn); hy = lerp(restY, keysY - 9 * bounce, wIn);
    } else if (cursorOn) {
      const wIn = easeOut(prog(t, cur.a, cur.a + .25));
      const clicking = cur.click != null && t >= cur.click && t < cur.click + .1;
      hx = lerp(restX, 470 + (cxp - 400) * .25, wIn); hy = lerp(restY, 1030 + (cyp - 680) * .2 + (clicking ? 6 : 0), wIn);
    } else {                                             // возврат на тачпад: с клавиш (после отправки) или из точки, где погас курсор
      const lastTyped = sch.msgs.filter(m => m.from === 'user' && m.type === 'typed' && !m.pinned && m.at <= t).pop();
      const lastCur = sch.cursors.filter(c => c.hide <= t || (off && c.a <= t)).pop();
      let fromX = keysX, fromY = keysY, t0 = lastTyped ? lastTyped.at : -1;
      const curEnd = lastCur ? Math.min(lastCur.hide, off && lastCur.a <= t ? off.a : Infinity) : -1;
      if (lastCur && curEnd > t0) {
        t0 = curEnd;
        const tgt = btnCenters[lastCur.to] || { x: 360, y: 600 }, mv = easeInOut(prog(curEnd, lastCur.a, lastCur.b));
        const ex = lerp(560, tgt.x + 8, mv), ey = lerp(640, tgt.y + 6, mv);
        fromX = 470 + (ex - 400) * .25; fromY = 1030 + (ey - 680) * .2;
      }
      const back = t0 < 0 ? 1 : easeOut(prog(t, t0, t0 + .3));
      hx = lerp(fromX, restX, back); hy = lerp(fromY, restY, back);
    }
    const hand = `${tube([[820, 1400], [hx + 40, hy + 40]], 70, SLEEVE)}
      <ellipse cx="${hx.toFixed(1)}" cy="${hy.toFixed(1)}" rx="44" ry="34" fill="${SKINC}" stroke="${S}" stroke-width="${W}"/>
      ${tube([[hx - 20, hy - 18], [hx - 34, hy - 48]], 18, SKINC)}`;

    // ── экран выключен: чёрная матрица с бликом, сцена темнеет ──
    let dark = '';
    if (off) {
      const k = prog(t, off.a, off.a + .1), line = t >= off.a + .06 && t < off.a + .14;
      dark = `<rect x="${SX}" y="${SY}" width="${SW}" height="${SH}" fill="#0b0908" opacity="${k.toFixed(2)}"/>
        <rect x="${SX}" y="${SY}" width="${SW}" height="${SH}" fill="url(#chatRefl)" opacity="${k.toFixed(2)}"/>
        ${line ? `<rect x="${SX + 20}" y="${SY + SH / 2 - 1}" width="${SW - 40}" height="2" fill="#fff" opacity=".8"/>` : ''}`;
    }
    const dim = off ? `<rect width="720" height="1280" fill="#000" opacity="${(0.72 * prog(t, off.a, off.a + .12)).toFixed(2)}"/>` : '';

    return `<svg viewBox="0 0 720 1280" width="720" height="1280" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgB" cx=".5" cy=".42" r=".75"><stop offset="0" stop-color="#5a3e28"/><stop offset=".6" stop-color="#2e2016"/><stop offset="1" stop-color="#140d08"/></radialGradient>
    <linearGradient id="chatRefl" x1="0" y1="0" x2="1" y2="1"><stop offset=".2" stop-color="#fff" stop-opacity="0"/><stop offset=".42" stop-color="#fff" stop-opacity=".09"/><stop offset=".5" stop-color="#fff" stop-opacity=".03"/><stop offset=".75" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <clipPath id="chatList"><rect x="${SX}" y="${LIST_TOP}" width="${SW}" height="${LIST_H}"/></clipPath>
    <clipPath id="chatScreen"><rect x="${SX}" y="${SY}" width="${SW}" height="${SH}" rx="8"/></clipPath>
  </defs>
  <rect width="720" height="1280" fill="url(#bgB)"/>
  <!-- клавиатура -->
  <path d="M40,800 L680,800 L716,1100 L4,1100 Z" fill="#c9ccce" stroke="${S}" stroke-width="${W}" stroke-linejoin="round"/>
  ${CKEYS}
  <rect x="250" y="1004" width="220" height="74" rx="10" fill="#d9dcdd" stroke="${S}" stroke-width="4"/>
  <!-- экран -->
  <rect x="34" y="296" width="652" height="508" rx="26" fill="#2b2623" stroke="${S}" stroke-width="${W}"/>
  <rect x="${SX}" y="${SY}" width="${SW}" height="${SH}" rx="8" fill="${PAPER}"/>
  <g clip-path="url(#chatScreen)">
    <rect x="${SX}" y="${SY}" width="${SW}" height="${HEAD_H}" fill="#f1eadf"/>
    <circle cx="${SX + 22}" cy="${SY + 25}" r="6" fill="#e2594b"/><circle cx="${SX + 42}" cy="${SY + 25}" r="6" fill="#f2b84b"/><circle cx="${SX + 62}" cy="${SY + 25}" r="6" fill="#62b25a"/>
    ${asterisk(SX + 104, SY + 25, 10, 4)}
    <text x="${SX + 122}" y="${SY + 32}" font-family="Rubik" font-weight="700" font-size="19" fill="${INK}">Claude</text>
    <path d="M${SX},${SY + HEAD_H} H${SX + SW}" stroke="#e4dccd" stroke-width="2"/>
    <g clip-path="url(#chatList)">${list}</g>
    <rect x="${SX + 16}" y="${INPUT_Y}" width="${SW - 32}" height="38" rx="19" fill="#fff" stroke="#d2cabb" stroke-width="2"/>
    ${input}
    <circle cx="${SX + SW - 36}" cy="${INPUT_Y + 19}" r="13" fill="${ACCENT}"/>
    <path d="M${SX + SW - 36},${INPUT_Y + 26} V${INPUT_Y + 12} M${SX + SW - 42},${INPUT_Y + 18} L${SX + SW - 36},${INPUT_Y + 12} L${SX + SW - 30},${INPUT_Y + 18}" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>
    ${flick}
    ${dark}
  </g>
  ${cursor}
  ${hand}
  ${dim}
</svg>`;
  }
  (window.SETS = window.SETS || {}).chat = (t, shot) => chat(t, shot);
})();
