// handwriting.js: painted lettering for THE LAST BENCH.
//
// ANIMATION_GUIDE.md says "no text", but this film's story is carried by what is written on a page, so the lettering is
// treated as drawing, not as captioning: every glyph is placed by hand (seeded wobble in size, angle, baseline and
// spacing), in a pencil or ink colour from the film's locked palette, with the page's own grain over it. Nothing here is
// a title card or a label on an object: pencils write on paper, and that is the event of the shot.
//
//   write(txt, x, y, o)        one line, centred on (x, y)
//   writeLines(lines, x, y, o) several lines, lineH apart, writing on progressively (see `ink`)
//
// o: { size, font, col, sw, wob, seed, scale, alpha, screen, align, reveal, raw }
//   font    'pencil' (Caveat) | 'print' (DejaVu Serif, ruled register hand) | 'marker' (Permanent Marker, red ink)
//   reveal  0..1 — letters appear one at a time (the nib travelling across the page); 1 = fully written
//   raw     skip the hand-placed wobble (for ruled and machine-clean lines)
// All lettering is queued and composited by core's drawLetters/flushLetters, so wipes cover it correctly.

const HW_FONT = {
  pencil: '"Caveat", "Segoe Script", cursive',
  print: '"DejaVu Serif", "Times New Roman", serif',
  marker: '"Permanent Marker", "Caveat", cursive'
};

function hwLayout(txt, x, y, o) {
  const size = o.size ?? 28, font = o.font || 'pencil', rnd = lcg(o.seed ?? 7), G = [];
  const glyphs = [...String(txt)];
  const adv = glyphs.map(ch => {
    if (ch === ' ') return size * .30;
    if (ch === '.' || ch === ',' || ch === "'" || ch === '!') return size * .30;
    if (ch === 'i' || ch === 'l' || ch === 't' || ch === 'I') return size * .34;
    if (ch === 'm' || ch === 'w' || ch === 'M' || ch === 'W') return size * .86;
    return size * .54 + size * .12 * rnd();
  });
  const total = adv.reduce((a, b) => a + b, 0) * (o.track ?? 1);
  const x0 = o.align === 'left' ? x : o.align === 'right' ? x - total : x - total / 2;
  let cx = x0;
  for (let i = 0; i < glyphs.length; i++) {
    const w = adv[i] * (o.track ?? 1);
    if (glyphs[i] !== ' ') {
      const jx = o.raw ? 0 : (rnd() - .5) * size * .05 * (o.wob ?? 1);
      const jy = o.raw ? 0 : (rnd() - .5) * size * .10 * (o.wob ?? 1);
      const rot = o.raw ? 0 : (rnd() - .5) * .10 * (o.wob ?? 1);
      const sc = o.raw ? 1 : 1 + (rnd() - .5) * .10 * (o.wob ?? 1);
      G.push({ ch: glyphs[i], x: cx + w / 2 + jx, y: y + jy, rot, sc, size: size * (1 + (rnd() - .5) * .07 * (o.wob ?? 1)) });
    }
    cx += w;
  }
  return { G, total, font };
}

// Queue one line of handwriting. `reveal` < 1 shows only the first floor(reveal*len) glyphs, so a reveal reads as the
// nib crossing the page rather than as a text pop-in.
function write(txt, x, y, o = {}) {
  const L = hwLayout(txt, x, y, o);
  const n = o.reveal == null ? L.G.length : Math.ceil(clamp(o.reveal) * L.G.length);
  const s = o.scale ?? 1;
  const col = o.col || '#4A3A2A';
  for (let i = 0; i < n; i++) {
    const g = L.G[i];
    letter(g.ch, g.x, g.y, g.size * s, col, {
      font: `${Math.round(g.size * s)}px ${L.font}`, rot: g.rot, screen: o.screen, alpha: o.alpha,
      pop: 1, ink: o.ink !== false, sw: o.sw
    });
  }
  return L.total * s;
}
// Several lines, each starting at its own time (reveal is per line). size of the block is returned for layout.
function writeLines(lines, x, y, o = {}) {
  const lh = o.lineH ?? (o.size ?? 28) * 1.4;
  lines.forEach((ln, i) => write(ln, x, y + i * lh, { ...o, align: o.align || 'left', reveal: o.revealLine ? o.revealLine(i) : o.reveal }));
  return lines.length * lh;
}
