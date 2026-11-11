// last_bench.js: "THE LAST BENCH" — a 50-second, 20-shot short.
// Storyboard and locked style bible: STORYBOARD.md. Handoff document: HANDOFF.md.
//
// The story is carried by what is written on a page, in a room that has already stopped. Nothing in this film is
// captioned: no subtitles, no onomatopoeia, no labels. The only lettering is the hand of the people in the story —
// chalk on a board, pencil in a register, red ink in the record — and it is always an event in the shot.
(() => {
  // ---------- locked palette (STORYBOARD.md, hex only) ----------
  const C = {
    wall: '#D9C08A', wood: '#8B5A2B', board: '#2E4B3F', chalk: '#F5F5F0', kurta: '#E8E0D0',
    skin: '#B07A4B', hair: '#1A1A1A', red: '#C41E2A', warm: '#FFD98A', shadow: '#3A2A1A',
    black: '#0A0A0A', page: '#FFF8E7'
  };
  const INK = '#2A2018';                     // drawn line colour: a warm near-black, never pure black
  const zk = () => (CAM ? CAM.zoom : 1);     // camera zoom, for keeping prop line weights in screen px
  const pw = (sw) => sw / Math.max(1, Math.min(4, zk()));

  // ---------- small drawing helpers ----------
  // fillInk: one shape, filled on the 2D layer and outlined with the brush — the way the guide wants a character to
  // be built (flat colour plus an ink line), at the cost this renderer can actually pay.
  function fillInk(pts, col, o = {}) {
    flat(pts, col, o.flatOp == null ? 255 : o.flatOp);
    if (o.ink !== null) inkLine([...pts, pts[0]], o.sw || 1, o.inkCol || INK, o.br || 'ink', o.curv == null ? .3 : o.curv);
  }
  function fillInkCirc(x, y, rx, ry, col, o = {}) {
    flatCirc(x, y, rx, ry, col, o.flatOp == null ? 255 : o.flatOp);
    if (o.ink !== null) inkLine([...ellPts(x, y, rx, ry, o.n || 16), ...ellPts(x, y, rx, ry, o.n || 16).slice(0, 1)], o.sw || 1, o.inkCol || INK, o.br || 'ink', .2);
  }
  // A rectangle with hand-drawn corners (j = wobble amount in px).
  function quad(x, y, w, h, j = 1.5) {
    const p = rectPts(x, y, w, h, 0);
    return p.map(([a, b]) => [a + jit(j), b + jit(j)]);
  }
  // A tapered strip between two points (a chalk line, a crack, a fold).
  function strip(x0, y0, x1, y1, w0, w1 = w0) {
    const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
    return [[x0 + nx * w0, y0 + ny * w0], [x1 + nx * w1, y1 + ny * w1],
            [x1 - nx * w1, y1 - ny * w1], [x0 - nx * w0, y0 - ny * w0]];
  }
  // Full-frame darkening, used when the light dies. Painted as one wash so it stays cheap.
  function dim(k, col = C.shadow) { veil(k * .92, col); }   // a screen-space veil: cheap, and it lands under the grain
  const flick = (t, times, amt = .12) => amt * ring(t, times, 9, 26);   // a light failing twice
  // Soft warm key light, off the paper grain, so it reads as light and not pigment.
  function keyLight(x, y, r, a = 1) { glow(x, y, r, C.warm, .16 * a); }
  // Cheap dust: motes drift right, always alive.
  function dust(t, n = 16, seed = 1, a = 1) {
    for (let i = 0; i < n; i++) {
      boilSeed('dust' + seed + i);
      const x = ((hash(i * 3 + seed) * W + t * 8 * (.3 + hash(i + 7))) % (W + 80)) - 40;
      const y = 120 + hash(i * 7 + seed + 2) * 760 + Math.sin(t * .4 + i) * 9;
      const s = .6 + 1.4 * hash(i + 21);
      flatCirc(x, y, s, s, mixCol(C.page, C.warm, .5), 70 * a * (.3 + .7 * hash(i + 4)));
    }
  }


  // Writing inside a drawn page frame (a rotated push/translate in world space) while the camera is live.
  // frameWrite() converts the page-local point to screen through the camera, so the words land on the paper.
  function frameWrite(txt, px, py, F, o = {}) {
    const c = Math.cos(F.rot || 0), sn = Math.sin(F.rot || 0);
    const wx = F.cx + px * c - py * sn, wy = F.cy + px * sn + py * c;
    const [sx, sy] = CAM ? toScreen(wx, wy) : [wx, wy];
    const z = zk();
    write(txt, sx, sy, { ...o, size: (o.size || 24) * z, rot: (o.rot || 0) + (F.rot || 0) + (CAM ? CAM.rot : 0), screen: true });
  }

  // Cinemascope bars, painted straight into the compositor: no brush, no cost.
  function letterbox(h) { if (h < 1) return; veilBar(h); }
  function veilBar(h) { VEILS.push({ bar: h }); }

  // ---------- the room ----------
  // Floor line and the big surfaces are drawn once per frame; everything else layers on top.
  const FLOOR = 646;
  const BLACKBOARD = { x: 604, y: 126, w: 716, h: 372 };
  const PODIUM = { x: 556, y: 706 };
  const LASTBENCH = { x: 1472, y: 1004 };   // Row 5, Seat 4: pulled out 2 inches from the row
  const BOOK = { x: LASTBENCH.x, y: 930 };  // the open page on that bench
  const CLOCK = { x: 232, y: 178, r: 58 };

  function roomShell(t, o = {}) {
    // surfaces are flat fields; the watercolour goes on top as small soft blooms
    flatsBegin();
    flat(quad(-140, -140, W + 280, FLOOR + 150, 0), C.wall);
    flat(quad(-140, FLOOR, W + 280, H - FLOOR + 150, 0), mixCol(C.wood, C.shadow, .45));
    flat(quad(-140, FLOOR - 16, W + 280, 16, 0), mixCol(C.wall, C.wood, .3));
    flatCirc(380, 250, 330, 190, mixCol(C.wall, C.wood, .3), 26);
    flatCirc(1520, 470, 360, 150, mixCol(C.wall, C.shadow, .3), 24);
    flatCirc(1180, 120, 280, 90, mixCol(C.wall, C.warm, .5), 40);
    // floorboards: one line each, converging a little toward the wall
    for (let i = 0; i < 8; i++) {
      boilSeed('fl' + i);
      const y = FLOOR + 26 + i * i * 6.6;
      inkFlat([[-80, y], [W * .5, y - 3], [W + 80, y]], pw(.7), mixCol(C.wood, C.black, .5), .9);
    }
    inkFlat([[-80, FLOOR + 2], [W * .5, FLOOR - 2], [W + 80, FLOOR + 1]], pw(1.6), INK);
    boilSeed('wire');
    inkFlat([[600, 60], [760, 54], [980, 64], [1200, 52], [1350, 60]], pw(.9), INK, .85);
    flatsEnd();
  }

  function blackboard(t, o = {}) {
    const B = o.B || BLACKBOARD;
    flatsBegin();
    flat(quad(B.x - 14, B.y - 14, B.w + 28, B.h + 28, 0), C.wood);
    flat(quad(B.x, B.y, B.w, B.h, 0), C.board);
    flat(quad(B.x - 12, B.y + B.h + 14, B.w + 24, 15, 0), mixCol(C.wood, C.shadow, .3));
    flatCirc(B.x + B.w * .52, B.y + B.h * .45, B.w * .44, B.h * .38, mixCol(C.board, C.chalk, .35), 26);
    flatCirc(B.x + B.w * .22, B.y + B.h * .7, B.w * .2, B.h * .16, mixCol(C.board, C.chalk, .3), 20);
    inkFlat([[B.x - 14, B.y - 14], [B.x + B.w + 14, B.y - 14], [B.x + B.w + 14, B.y + B.h + 14], [B.x - 14, B.y + B.h + 14], [B.x - 14, B.y - 14]], pw(1.8), INK);
    flatsEnd();
    // the half-erased question from the period before
    const er = o.erase == null ? .55 : o.erase;
    if (er < .98) {
      for (let i = 0; i < 4; i++) {
        boilSeed('smear' + i);
        inkFlat([[B.x + 90, B.y + 196 + i * 21], [B.x + 380 - i * 22, B.y + 200 + i * 21]], 5 - i * .8, mixCol(C.board, C.chalk, .55), .22);
      }
      write('Q4: Prove that', B.x + 116, B.y + 232, { size: 44, font: 'pencil', col: C.chalk, alpha: .5 * (1 - er), align: 'left', seed: 31, wob: 1.6 });
    }
    boilSeed('chalkstub');
    paint(quad(B.x + B.w * .62, B.y + B.h + 2, 46, 9, 1), { wash: C.chalk, ink: null });
  }

  // ATTENDANCE, written live on the board (chalk hand, glyph by glyph).
  function boardWord(t, lt, o = {}) {
    const B = BLACKBOARD, txt = o.txt || 'ATTENDANCE';
    const x = o.x ?? B.x + 168, y = o.y ?? B.y + 108;
    const rev = o.reveal == null ? 1 : o.reveal;
    write(txt, x, y, { size: o.size ?? 66, font: 'pencil', col: mixCol(C.chalk, C.page, .25), align: 'left', reveal: rev, seed: 91, wob: 1.4, alpha: o.alpha ?? .92 });
    // chalk dust falling from the nib while it writes
    if (o.dusty) for (let i = 0; i < 7; i++) {
      const a = (i / 7 + t * .3) % 1;
      flatCirc(lerp(x, x + 420, rev) + jit(20), y + 26 + a * 60, 1.4, 1.4, C.chalk, 110 * (1 - a));
    }
  }

  function wallClock(t, stopAt = null) {
    const { x, y, r } = CLOCK, tt = stopAt == null ? t : Math.min(t, stopAt);
    boilSeed('clock');
    flatsBegin();
    flatCirc(x, y, r + 9, r + 9, mixCol(C.wood, C.shadow, .2));
    flatCirc(x, y, r, r, C.page);
    flatCirc(x, y, 3, 3, INK);
    for (let i = 0; i < 12; i++) {
      const a = i * TAU / 12, r0 = r * .78, r1 = r * .9;
      inkFlat([[x + Math.cos(a) * r0, y + Math.sin(a) * r0], [x + Math.cos(a) * r1, y + Math.sin(a) * r1]], pw(i % 3 ? .7 : 1.2), INK);
    }
    const hA = (tt / 3600) * TAU - Math.PI / 2, mA = (tt / 60) * TAU - Math.PI / 2;
    const sA = (Math.floor(tt) / 60) * TAU - Math.PI / 2;                    // the second hand ticks once a second
    inkFlat([[x, y], [x + Math.cos(hA) * r * .45, y + Math.sin(hA) * r * .45]], pw(2.2), INK);
    inkFlat([[x, y], [x + Math.cos(mA) * r * .68, y + Math.sin(mA) * r * .68]], pw(1.5), INK);
    inkFlat([[x, y - 6], [x + Math.cos(sA) * r * .74, y + Math.sin(sA) * r * .74]], pw(.8), C.red);
    inkFlatShape(ellPts(x, y, r + 9, r + 9, 20), pw(1.8), INK);
    flatsEnd();
  }

  // The ceiling fan. angle freezes on `stopAt`; the story wants the blades diagonal when it stops.
  const FAN = { x: 902, y: 34, r: 214 };
  function ceilingFan(t, stopAt = null) {
    const tt = stopAt == null ? t : Math.min(t, stopAt);
    const ang = stopAt != null ? .62 : tt * TAU * 1.0;   // 15 degrees a frame at 24 fps
    boilSeed('fan');
    flatsBegin();
    for (let i = 0; i < 3; i++) {
      const a = ang + i * TAU / 3, c = Math.cos(a), sn = Math.sin(a);
      const pt = (px, py) => [FAN.x + px * c - py * sn, FAN.y + px * sn + py * c];
      flat([pt(26, -13), pt(FAN.r * .96, -34), pt(FAN.r, -6), pt(FAN.r * .96, 20), pt(26, 11)], mixCol(C.wood, C.shadow, .22));
      inkFlat([pt(26, -13), pt(FAN.r * .96, -34), pt(FAN.r, -6), pt(FAN.r * .96, 20)], pw(1.5), INK);
      inkFlat([pt(40, -2), pt(FAN.r * .8, -8)], pw(.8), mixCol(C.wood, C.black, .4), .7);
    }
    flatCirc(FAN.x, FAN.y, 26, 20, mixCol(C.wall, C.shadow, .5));
    flat(quad(FAN.x - 46, -40, 92, 42, 0), mixCol(C.wall, C.shadow, .35));
    inkFlat(quad(FAN.x - 46, -40, 92, 42, 0), pw(1.6), INK);
    inkFlatShape(ellPts(FAN.x, FAN.y, 26, 20, 16), pw(1.6), INK);
    flatsEnd();
  }

  // The dead plant in the right corner, and the 2007 class photo (both come back in the last shots).
  function deadPlant(t, o = {}) {
    const x = 1752, y = 972, sway = o.sway == null ? .8 : o.sway;
    boilSeed('plant');
    flatsBegin();
    flat([[x - 46, y], [x + 46, y], [x + 34, y - 96], [x - 34, y - 96]], mixCol(C.wood, C.shadow, .15));
    inkFlat([[x - 46, y], [x - 34, y - 96], [x + 34, y - 96], [x + 46, y]], pw(1.7), INK);
    for (let i = 0; i < 7; i++) {   // drooping blades, each on its own thin stem
      const a = -Math.PI / 2 + (i - 3) * .42, L = 74 + 26 * hash(i), s = Math.sin(t * .7 + i) * sway;
      const tx = x + Math.cos(a) * L * .7 + s * 5, ty = y - 100 + Math.sin(a) * L * .5 + Math.abs(Math.cos(a)) * 48;
      inkFlat([[x, y - 96], [x + Math.cos(a) * L * .45, y - 100 + Math.sin(a) * L * .4], [tx, ty + 26]], pw(.9), mixCol(C.wood, C.black, .35));
      flat([[tx - 9, ty], [tx + 3, ty - 13], [tx + 12, ty + 2], [tx - 2, ty + 12]], mixCol('#8B7A3A', C.wood, .55));
      inkFlat([[tx - 9, ty], [tx + 3, ty - 13], [tx + 12, ty + 2], [tx - 2, ty + 12], [tx - 9, ty]], pw(.9), INK);
    }
    flatsEnd();
  }

  function classPhoto(t, peel = 0) {
    const x = 1584, y = 74, w = 214, h = 152;
    boilSeed('photo');
    flatsBegin();
    flat(quad(x - 8, y - 8, w + 16, h + 16, 0), mixCol(C.page, C.wood, .35));
    flat(quad(x, y, w, h, 0), mixCol(C.page, C.wall, .18));
    flat(quad(x, y, w, 22, 0), mixCol(C.page, C.wall, .5));
    for (let r = 0; r < 3; r++) for (let i = 0; i < 9; i++) {
      const px = x + 20 + i * 22 + (r % 2) * 8, py = y + 34 + r * 38, s = 7 - r * .6;
      flatCirc(px, py, s * .7, s * .8, mixCol(C.skin, C.page, .45));
      flat(quad(px - s * .9, py + s * .7, s * 1.8, s * 1.5, 0), mixCol(C.page, C.sky || C.wall, .3));
    }
    inkFlat(quad(x - 8, y - 8, w + 16, h + 16, 0), pw(1.5), INK);
    if (peel > 0) {   // a corner lifting off the wall
      const k = clamp(peel), cx = x + w, cy = y;
      flat([[cx - 60 * k, cy], [cx, cy], [cx, cy + 62 * k], [cx - 44 * k, cy + 18 * k]], mixCol(C.wall, C.shadow, .35));
      inkFlat([[cx - 60 * k, cy], [cx, cy], [cx, cy + 62 * k]], pw(1.2), INK);
    }
    flatsEnd();
  }

  function windowWall(t, o = {}) {
    const lit = o.lit == null ? 1 : o.lit;
    boilSeed('winwall');
    paint(quad(-120, -120, W + 240, FLOOR + 130, 2), { wash: mixCol(C.wall, C.shadow, .12), ink: null });
    // three tall windows along the left, with bars, and dust in the light
    for (let i = 0; i < 3; i++) {
      const x = 60 + i * 262, y = 132, w = 196, h = 330;
      boilSeed('win' + i);
      paint(quad(x - 12, y - 12, w + 24, h + 24, 1), { wash: mixCol(C.wood, C.shadow, .2), ink: INK, sw: pw(1.8) });
      paint(quad(x, y, w, h, 1), { wash: mixCol(C.warm, C.page, .35 * lit), ink: null });
      // the light in the window is the only warm thing left
      flatCirc(x + w / 2, y + h * .45, w * .62, h * .5, C.warm, Math.round(90 * lit));
      inkLine([[x + w / 2, y], [x + w / 2, y + h]], pw(1.2), mixCol(C.wood, C.shadow, .3), 'ink', .2);
      inkLine([[x, y + h * .48], [x + w, y + h * .48]], pw(1.2), mixCol(C.wood, C.shadow, .3), 'ink', .2);
    }
    inkLine([[-60, FLOOR + 2], [W * .4, FLOOR - 2], [W + 60, FLOOR + 1]], pw(1.6), INK, 'ink', .4);
  }

  // ---------- the room's furniture ----------
  const ROWS = [
    { y: 706, w: 116, h: 104, n: 10, x0: 132, x1: 1812 },
    { y: 772, w: 130, h: 116, n: 10, x0: 104, x1: 1836 },
    { y: 856, w: 150, h: 132, n: 10, x0: 84, x1: 1852 },
    { y: 952, w: 172, h: 152, n: 10, x0: 60, x1: 1872 }
  ];
  const deskXY = (R, i) => [lerp(R.x0, R.x1, R.n === 1 ? .5 : i / (R.n - 1)), R.y];

  // One desk's flat shape: the shadow side of the box, the lit top, the light catching the front edge.
  function deskFlats(x, y, w, h) {
    flat([[x - w * .5, y - h * .86], [x + w * .5, y - h * .86], [x + w * .46, y - h * .16], [x - w * .46, y - h * .16]], mixCol(C.wood, C.shadow, .3));
    flat([[x - w * .54, y - h * .16 - h * .13], [x + w * .54, y - h * .16 - h * .13], [x + w * .54, y - h * .16], [x - w * .54, y - h * .16]], C.wood);
    flat([[x - w * .5, y - h * .16 - h * .13], [x + w * .5, y - h * .16 - h * .13], [x + w * .5, y - h * .16 - h * .02], [x - w * .5, y - h * .16 - h * .02]], mixCol(C.wood, C.warm, .16));
  }
  // One desk's ink: back edge, the two front legs, a hairline under the top.
  function deskInk(x, y, w, h, sw = 1.5) {
    // one continuous outline: back edge, leg, floor, leg, back up — the way a hand would draw a desk in one go
    inkFlat([[x - w * .52, y - h * .86], [x + w * .52, y - h * .84], [x + w * .52, y - h * .16], [x + w * .48, y],
             [x + w * .46, y - h * .16], [x - w * .46, y - h * .16], [x - w * .48, y], [x - w * .46, y - h * .16],
             [x - w * .52, y - h * .86]], sw, INK);
    inkFlat([[x - w * .5, y - h * .16], [x + w * .5, y - h * .16]], sw * .7, mixCol(C.wood, C.black, .35), .8);
  }
  // The props that carry the story: a pencil left in a desk, a crumpled paper, a bottle with no cap.
  function deskProps(t, r, i, x, y, w, h, o) {
    const ty = y - h * .16 - h * .13;
    if (r === 0 && i === 2) {
      boilSeed('pencil');
      inkLine([[x - w * .13, ty - 3], [x + w * .13, ty - 7]], pw(2.4), mixCol(C.wood, C.black, .15), 'ink', .1);
      paint(ellPts(x - w * .14, ty - 3, 2.4, 2.4, 6), { wash: mixCol(C.page, C.black, .35), ink: null });
    }
    if (r === 1 && i === 0) {
      boilSeed('crumpaper' + (o.shift ? 1 : 0));
      const px = x - w * .06 - (o.shift ? 1.5 : 0);
      paint(starPts(px, ty - 8, 13, .55, 7, .4), { wash: mixCol(C.page, C.wall, .1), ink: INK, sw: pw(1.1) });
      inkLine([[px - 7, ty - 10], [px + 6, ty - 14]], pw(.7), mixCol(C.wood, C.black, .3), 'inkfine', .5);
    }
    if (r === 2 && i === 4) {
      flatsBegin(); flat(quad(x + w * .16, ty - 30, 15, 31, 0), mixCol(C.page, C.sky || C.wall, .5), 200); flatsEnd();
      inkLine([[x + w * .16, ty - 30], [x + w * .16, ty], [x + w * .31, ty], [x + w * .31, ty - 30]], pw(1.1), INK, 'inkfine', .1);
    }
  }
  // All 40 desks: one flat pass, one ink pass, then the props.
  function deskField(t, o = {}) {
    flatsBegin();
    for (let r = 0; r < ROWS.length; r++) for (let i = 0; i < ROWS[r].n; i++) {
      const [x, y] = deskXY(ROWS[r], i), R = ROWS[r];
      deskFlats(x, y, R.w, R.h);
      deskInk(x, y, R.w, R.h, pw(1.5));
    }
    flatsEnd();
    for (let r = 0; r < ROWS.length; r++) for (let i = 0; i < ROWS[r].n; i++) {
      if ((r === 0 && i === 2) || (r === 1 && i === 0) || (r === 2 && i === 4)) {
        const [x, y] = deskXY(ROWS[r], i), R = ROWS[r];
        deskProps(t, r, i, x, y, R.w, R.h, o);
      }
    }
  }
  // The same desks when they are only background: one flat pass and one ink line each.
  function desksLo(t, o = {}) {
    flatsBegin();
    for (let r = 0; r < ROWS.length; r++) for (let i = 0; i < ROWS[r].n; i++) {
      const [x, y] = deskXY(ROWS[r], i), R = ROWS[r], w = R.w * .92, h = R.h;
      deskFlats(x, y, w, h);
      inkFlat([[x - w * .5, y - h * .86], [x - w * .46, y - h * .16], [x + w * .46, y - h * .16], [x + w * .5, y - h * .86]], pw(1.2), INK);
    }
    flatsEnd();
  }
  // Row 5, Seat 4: the last bench, dragged two inches out of the row. `book` puts the NCERT Maths textbook on it.
  function lastBench(t, o = {}) {
    const { x, y } = LASTBENCH, w = 206, h = 178;
    boilSeed('lastbench');
    flatsBegin(); deskFlats(x, y, w, h); deskInk(x, y, w, h, pw(1.9));
    paint(quad(x - w * .34, y + 2, w * .68, 7, 1), { wash: mixCol(C.wood, C.page, .3), washOp: 60, ink: null });   // the scuff
    flatsEnd();
    if (o.book !== false) openBook(t, BOOK.x, BOOK.y, o.bookW || 252, o.book || {});
  }

  // An open textbook lying flat. Pages are the only blank thing in the room, so they are the brightest surface on
  // screen: flat paper, an ink spine, a hairline of shadow in the fold.
  function openBook(t, x, y, w, o = {}) {
    const h = w * .62, page = o.pageCol || C.page;
    flatsBegin();
    flat(quad(x - w * .52, y - h * .56, w * 1.04, h * 1.14, 0), mixCol(C.wood, C.black, .5));
    flat([[x, y - h * .52], [x + w * .5, y - h * .46], [x + w * .5, y + h * .44], [x, y + h * .52]], page);
    flat([[x, y - h * .52], [x - w * .5, y - h * .46], [x - w * .5, y + h * .44], [x, y + h * .52]], mixCol(page, C.wall, .07));
    flatsEnd();
    inkLine([[x - w * .52, y - h * .56], [x + w * .52, y - h * .56], [x + w * .52, y + h * .58], [x - w * .52, y + h * .58], [x - w * .52, y - h * .56]], pw(1.8), INK, 'ink', .1);
    inkLine([[x - w * .5, y - h * .46], [x, y - h * .52], [x + w * .5, y - h * .46]], pw(1.2), mixCol(page, C.wood, .5), 'inkfine', .2);
    inkLine([[x, y - h * .52], [x, y + h * .52]], pw(1.2), mixCol(page, C.shadow, .5), 'inkfine', .2);
    if (o.lines) for (let i = 1; i <= 4; i++) inkLine([[x + w * .07, y - h * .28 + i * h * .17], [x + w * .43, y - h * .29 + i * h * .17]], pw(.4), mixCol(page, C.wood, .45), 'inkfine', .3);
  }

  // ---------- RAVI VERMA ----------
  // 42, looks 50. Round puffy face, tired eyes, mole under the left eye, thinning hair slicked back, cracked glasses
  // (his right lens), white kurta with a yellowed collar, ink on the right thumb. Mannerism: glasses off, rub, back on.
  // Every measurement is in head radii (u), so the same drawing works from a wide shot to a close-up. Shapes are filled
  // flat on the 2D layer and outlined with the brush, in the order a hand would ink them.
  function raviHead(t, x, y, u, o = {}) {
    const view = o.view || 'front', mv = view === 'q' ? .42 : view === 'back' ? 0 : 1;   // how much of the face we see
    const skin = mixCol(C.skin, C.warm, .16), sh = mixCol(skin, C.shadow, .45);
    boilSeed('head' + (o.seed || ''));
    if (view === 'back') {
      flatCirc(x, y + u * .1, u * .92, u * .96, mixCol(C.hair, C.shadow, .25));
      flatCirc(x, y + u * .72, u * .46, u * .3, skin);
      inkLine([...ellPts(x, y + u * .1, u * .92, u * .96, 22), ...ellPts(x, y + u * .1, u * .92, u * .96, 22).slice(0, 1)], pw(u * .03), INK, 'ink', .2);
      return;
    }
    // ears
    for (const s2 of [-1, 1]) fillInkCirc(x + s2 * u * .93, y + u * .1, u * .16, u * .25, mixCol(skin, C.shadow, .18), { sw: pw(u * .028), n: 10 });
    // skull: round and puffy
    fillInkCirc(x, y, u * .92, u * .99, skin, { sw: pw(u * .032), n: 24 });
    // jowls, chin, a soft double chin: he is fifty on the inside
    flatCirc(x, y + u * .62, u * .62, u * .42, mixCol(skin, C.shadow, .12), 150);
    flatCirc(x, y + u * .96, u * .34, u * .16, mixCol(skin, C.shadow, .25), 170);
    // hair: thinning, slicked back; the scalp shows at the hairline
    flatCirc(x, y - u * .52, u * .8, u * .5, mixCol(skin, C.shadow, .18));
    flat([[-u * .95, -u * .06], [-u * .9, -u * .6], [-u * .52, -u * .94], [0, -u * 1.04], [u * .52, -u * .94], [u * .9, -u * .6], [u * .95, -u * .04],
          [u * .72, -u * .44], [u * .3, -u * .62], [-u * .3, -u * .62], [-u * .72, -u * .44]].map(([a2, b2]) => [x + a2, y + b2]), mixCol(C.hair, C.shadow, .2));
    for (let i = 0; i < 6; i++) {   // combed strands, grey at the temples
      boilSeed('strand' + i);
      inkLine([[x - u * .62 + i * u * .24, y - u * .95], [x - u * .84 + i * u * .3, y - u * .5]], pw(u * .014), mixCol(C.hair, C.page, .35 + .1 * i), 'inkfine', .5);
    }
    // brow: heavy and tired, a little raised on one side
    for (const s2 of [-1, 1]) inkLine([[x + s2 * u * .16, y - u * .26 + s2 * u * .02], [x + s2 * u * .5, y - u * .34], [x + s2 * u * .76, y - u * .24]], pw(u * .055), mixCol(C.hair, C.shadow, .2), 'ink', .45);
    // eyes: half-lidded almonds with bags under them
    const squint = clamp(o.squint || 0), open = o.eye == null ? .5 : clamp(o.eye);
    for (const s2 of [-1, 1]) {
      const ex = x + s2 * u * .37, ey = y - u * .02 + (o.lookY || 0) * u * .05, lid = Math.max(.2, open * (1 - squint * .85) + s2 * .02);
      flatCirc(ex, ey, u * .165, u * .105 * lid, C.page);
      inkLine([...ellPts(ex, ey, u * .165, u * .105 * lid, 12), ...ellPts(ex, ey, u * .165, u * .105 * lid, 12).slice(0, 1)], pw(u * .022), INK, 'inkfine', .2);
      flatCirc(ex + (o.lookX || 0) * u * .06, ey + u * .015, u * .075, u * .09 * Math.max(.3, lid), mixCol(C.hair, C.wood, .18));
      inkLine([[ex - u * .2, ey - u * .13 * lid - u * .02], [ex, ey - u * .16 * lid - u * .03], [ex + u * .2, ey - u * .12 * lid - u * .02]], pw(u * .04), mixCol(C.hair, C.shadow, .25), 'ink', .4);
      inkLine([[ex - u * .15, ey + u * .15], [ex, ey + u * .19], [ex + u * .16, ey + u * .13]], pw(u * .02), sh, 'inkfine', .6);
    }
    // the mole under his left eye (screen-right when he faces us)
    flatCirc(x + u * .45 * mv, y + u * .17, u * .045, u * .036, mixCol(C.hair, C.wood, .2));
    // nose: broad, a little bulbous
    flatCirc(x + u * .02 * mv, y + u * .27, u * .12, u * .07, mixCol(skin, C.shadow, .2));
    inkLine([[x + u * .03 * mv, y], [x - u * .05 * mv, y + u * .2], [x + u * .1 * mv, y + u * .27]], pw(u * .032), sh, 'inkfine', .55);
    // mouth: flat and tired, opens for dialogue
    const mOpen = clamp(o.mouth || 0), mCurve = o.curve == null ? 0 : o.curve;
    if (mOpen < .06) inkLine([[x - u * .15, y + u * .46], [x + u * .01, y + u * .47 + mCurve * u * .05], [x + u * .17, y + u * .44]], pw(u * .026), mixCol(skin, C.shadow, .62), 'inkfine', .5);
    else {
      flatCirc(x + u * .01, y + u * .49, u * .13 * (.5 + mOpen * .5), u * .03 + u * .08 * mOpen, mixCol('#4A211C', C.shadow, .3));
      if (mOpen > .3) flat(rectPts(x - u * .07, y + u * .45, u * .14, u * .03), mixCol(C.page, C.wall, .3));
      inkLine([...ellPts(x + u * .01, y + u * .49, u * .13 * (.5 + mOpen * .5), u * .03 + u * .08 * mOpen, 12)], pw(u * .016), INK, 'inkfine', .3);
    }
    // stubble shadow along the jaw
    flatCirc(x, y + u * .82, u * .4, u * .14, mixCol(skin, C.shadow, .32), 70);
    // glasses: cracked across his right lens (screen-left), wire arms into the hair
    const gy = y - u * .05, gx = u * .33 * mv, gr = u * .2;
    if (o.glasses === 'off') {
      for (const s2 of [-1, 1]) { flatCirc(x + s2 * u * .3, y - u * .78, u * .16, u * .12, C.page, 60); inkLine([...ellPts(x + s2 * u * .3, y - u * .78, u * .16, u * .12, 10)], pw(u * .018), mixCol(INK, C.skin, .3), 'inkfine', .2); }
    } else {
      for (const s2 of [-1, 1]) {
        flatCirc(x + s2 * gx, gy, gr, gr * .82, C.page, 40);
        inkLine([...ellPts(x + s2 * gx, gy, gr, gr * .82, 14)], pw(u * .019), mixCol(INK, C.skin, .25), 'inkfine', .2);
      }
      inkLine([[x - gx - gr * .25, gy - gr * .62], [x - gx + gr * .2, gy + gr * .06], [x - gx - gr * .34, gy + gr * .38], [x - gx + gr * .1, gy + gr * .5]], pw(u * .018), mixCol(C.page, C.shadow, .35), 'inkfine', .15);
      inkLine([[x - gx + gr * .62, gy - gr * .06], [x + gx - gr * .62, gy - gr * .06]], pw(u * .022), INK, 'inkfine', .3);
      for (const s2 of [-1, 1]) inkLine([[x + s2 * (gx + gr * .9), gy - gr * .08], [x + s2 * u * .92, gy - u * .02]], pw(u * .018), INK, 'inkfine', .3);
    }
  }

  // Standing body. y = ground, u = head radius (8u tall). Arms are angles: 0 = hanging, + swings forward and up.
  function ravi(t, x, y, u, o = {}) {
    const view = o.view || 'front', mv = view === 'q' ? .42 : view === 'back' ? 0 : 1;
    const bend = o.bend || 0, lean = o.lean || 0;
    const skin = mixCol(C.skin, C.warm, .16);
    const HY = y - u * 3.15, SY = y - u * 5.55, HEM = y - u * 2.45;
    const H = y - u * 7.0 + bend * u * .45;
    const swH = u * 1.52;
    boilSeed('ravi' + (o.seed || ''));
    FLATX = { ox: x, oy: y, rot: lean * .045 };      // the body leans from the feet; fills follow
    // legs and feet
    for (const s2 of [-1, 1]) {
      fillInk([[x + s2 * u * .16, HY], [x + s2 * u * .86, HY], [x + s2 * u * .8, y - u * .34], [x + s2 * u * .2, y - u * .34]], mixCol(C.shadow, C.wall, .28), { sw: pw(u * .04), curv: .2 });
      fillInk([[x + s2 * u * .14, y - u * .34], [x + s2 * u * .86, y - u * .3], [x + s2 * u * .96, y], [x + s2 * u * .06, y]], mixCol(C.hair, C.wood, .3), { sw: pw(u * .036), curv: .2 });
    }
    // an arm: sleeve to the wrist, then a hand. s = +1 right, far = the arm behind the body.
    const arm = (s2, ang, far) => {
      const ax = x + s2 * swH * 1.05, ay = SY + u * .18;
      const ex = ax + Math.sin(ang) * s2 * u * 1.15, ey = ay + Math.cos(ang) * u * 1.35;
      const a2 = ang * .45 + .06;
      const hx = ex + Math.sin(a2) * s2 * u * .8, hy2 = ey + Math.cos(a2) * u * 1.0;
      const w = u * .21;
      fillInk([[ax - s2 * w, ay - u * .25], [ax + s2 * w, ay - u * .2], [ex + s2 * w * .9, ey], [hx + s2 * w * .7, hy2],
               [hx - s2 * w * .8, hy2 + u * .04], [ex - s2 * w * .85, ey + u * .1], [ax - s2 * w * 1.1, ay + u * .3]],
        far ? mixCol(C.kurta, C.shadow, .32) : C.kurta, { sw: pw(u * .042), curv: .2 });
      fillInkCirc(hx + s2 * u * .06, hy2 + u * .2, u * .18, u * .23, far ? mixCol(skin, C.shadow, .3) : skin, { sw: pw(u * .034), n: 10 });
      if (s2 === 1 && o.inkThumb) flatCirc(hx + u * .16, hy2 + u * .14, u * .06, u * .08, mixCol(INK, C.wood, .18));
      return [hx, hy2];
    };
    const far = view === 'q' ? -1 : 1;
    arm(far, far === -1 ? (o.armL ?? .1) : (o.armR ?? .1), true);
    // kurta: from the shoulders past the hip, A-line, the front buttoned
    const hw = u * 1.78;
    fillInk([[x - swH * 1.02, SY + u * .1], [x - swH * .8, SY - u * .12], [x - u * .5, SY - u * .26], [x + u * .5, SY - u * .26], [x + swH * .8, SY - u * .12], [x + swH * 1.02, SY + u * .1],
             [x + swH * .98, HY], [x + hw, HEM + u * .2], [x + hw * .5, HEM - u * .16], [x, HEM + u * .2], [x - hw * .5, HEM - u * .16], [x - hw, HEM + u * .2], [x - swH * .98, HY]],
      C.kurta, { sw: pw(u * .048), curv: .25 });
    flat([[x + swH * .3, SY], [x + swH, SY], [x + hw * .98, HEM + u * .12], [x + hw * .3, HEM + u * .24]], mixCol(C.kurta, C.shadow, .18), 190);   // the shaded side
    for (let i = 0; i < 3; i++) inkLine([[x - swH * .72 + i * swH * .62, SY + u * .5], [x - hw * .74 + i * hw * .6, HEM + u * .1]], pw(u * .014), mixCol(C.kurta, C.shadow, .3), 'inkfine', .5);
    // collar, yellowed at the edge
    fillInk([[x - u * .46, SY - u * .2], [x + u * .46, SY - u * .16], [x + u * .34, SY + u * .22], [x - u * .36, SY + u * .2]], mixCol(C.kurta, C.wall, .3), { sw: pw(u * .03), curv: .2 });
    const bx = x + (view === 'q' ? u * .3 : 0);
    if (mv > .3) {
      inkLine([[bx, SY + u * .2], [bx, HEM]], pw(u * .02), mixCol(C.kurta, C.shadow, .38), 'inkfine', .4);
      for (let i = 0; i < 3; i++) flatCirc(bx, SY + u * .5 + i * u * .62, u * .038, u * .038, mixCol(C.kurta, C.shadow, .55));
    } else inkLine([[x, SY + u * .2], [x, HEM]], pw(u * .02), mixCol(C.kurta, C.shadow, .32), 'inkfine', .4);
    // neck
    fillInk(rectPts(x - u * .23 * Math.max(.3, mv), SY - u * .5, u * .46 * Math.max(.3, mv), u * .5), mixCol(skin, C.shadow, .2), { sw: pw(u * .032), curv: .1 });
    arm(-far, far === -1 ? (o.armR ?? .1) : (o.armL ?? .1), false);
    raviHead(t, x + (view === 'q' ? u * .3 : 0), H, u, { ...o, view });
    FLATX = null;
    return [x + (view === 'q' ? u * .3 : 0), H];
  }

  // The podium, its blue chipped mug, and the register lying on it.
  function podium(t, o = {}) {
    const { x, y } = PODIUM, w = 236, h = 190;
    boilSeed('podium');
    flatPush(x, y);                                    // everything below is local to the podium's corner
    flat(rectPts(-w * .5, -h, w, h), mixCol(C.wood, C.shadow, .34));
    flat(rectPts(-w * .38, -h + 26, w * .76, h - 52), mixCol(C.wood, C.shadow, .5));
    flat(rectPts(-w * .54, -h - 12, w * 1.08, 15), C.wood);
    inkFlat([[-w * .5, -h], [-w * .46, 0], [w * .46, 0], [w * .5, -h]], 2, INK);
    inkFlat([[-w * .38, -h + 26], [w * .38, -h + 26]], 1, mixCol(C.wood, C.shadow, .6), .8);
    inkFlat([[-w * .54, -h - 12], [w * .54, -h - 10]], 2, INK);
    // the register, closed, on the desk
    if (o.register !== 'gone') {
      flat(rectPts(-70, -h - 42, 140, 30), mixCol(C.wood, C.black, .3));
      flat(rectPts(-66, -h - 40, 132, 9), mixCol(C.page, C.wood, .3));
      inkFlat([[-70, -h - 42], [70, -h - 42], [70, -h - 12], [-70, -h - 12], [-70, -h - 42]], 1.8, INK);
    }
    // the mug: blue, chipped, and the only joke in the room
    flat(rectPts(76, -h - 66, 46, 56), mixCol(C.sky || C.wall, C.shadow, .3));
    flat(rectPts(76, -h - 66, 46, 8), mixCol(C.shadow, C.wood, .4));
    inkFlat([[76, -h - 66], [76, -h - 10], [122, -h - 10], [122, -h - 66]], 1.5, INK);
    inkFlat([[122, -h - 56], [136, -h - 48], [134, -h - 26], [120, -h - 22]], 1.3, INK);
    // a hairline of paper edge on the desk where the register lies
    flatPop();
  }

  // ---------- SHOT 1 (F001-F036) — THE ROOM ----------
  function s01(t, lt) {
    camBegin(W / 2, H / 2, 1, .052);          // 35mm, low, 3-degree Dutch: the room is very slightly wrong
    keyLight(300, 210, 900, 1);
    roomShell(t);
    deskField(t);
    lastBench(t, { book: { lines: false } });
    blackboard(t);
    if (lt > .96) boardWord(t, lt, { reveal: 0 });   // the word is not written yet in this shot
    wallClock(t);
    ceilingFan(t);
    classPhoto(t, 0);
    deadPlant(t);
    podium(t);
    dust(t, 18, 1);
    camEnd();
    // the light flickers once, 10%, at F020
    if (t < .83 && t > .79) dim(.1);
  }

  // ---------- SHOT 2 (F037-F072) — THE BENCH ----------
  // One continuous push, no cut: wide on the room, ending with the blank page filling 60% of frame.
  function s02(t, lt) {
    const k1 = ease(seg(lt, 0, .5)), k2 = ease(seg(lt, .5, 1.0)), k3 = ease(seg(lt, 1.0, 1.5));
    const zoom = 1 + .1 * k1 + .15 * k2 + 1.25 * k3;                    // 10%, then another 15%, then into the page
    camBegin(lerp(W / 2, BOOK.x, ease(seg(lt, 0, 1.42))), lerp(H / 2, BOOK.y, ease(seg(lt, 0, 1.42))), zoom, lerp(.052, 0, ease(seg(lt, 0, 1.1))));
    keyLight(300, 210, 900, 1);
    roomShell(t);
    deskField(t);
    lastBench(t, { book: { rustle: seg(lt, .5, .62) } });
    blackboard(t);
    wallClock(t);
    ceilingFan(t);
    classPhoto(t, 0);
    deadPlant(t);
    podium(t);
    dust(t, 14, 2, 1 - seg(lt, .8, 1.5));
    camEnd();
  }

  // ---------- SHOT 3 (F073-F120) — TEACHER INTRO ----------
  function s03(t, lt) {
    camBegin(704, 356, kf(lt, [[0, 1.9], [2, 1.98]]), .01);
    keyLight(430, 250, 820, .9);
    roomShell(t);
    deskField(t);
    blackboard(t);
    // he finishes the word, arm up at the board
    const writing = lt < .5;
    if (lt > .04) boardWord(t, lt, { reveal: clamp((lt - .04) / .42) });
    wallClock(t); ceilingFan(t); deadPlant(t);
    // the teacher: back 3/4, at the podium, left of centre
    const faceAt = seg(lt, .5, .92);        // head turns to camera
    const view = lt < .5 ? 'back' : (lt < .62 ? 'q' : 'front');
    const talk = lt > 1.0 ? mouthTalk(lt, 1.0, 2.0) : 0;
    // taps: F088, F091, F094 → 0.625, 0.75, 0.875 s into the shot
    const tap = ring(lt, [.62, .75, .88], 12, 30);
    ravi(t, 566, 716, 62, {
      view, lookX: -0.2, eye: .55, mouth: talk, squint: lt < .7 ? .1 : 0,
      armR: lt < .5 ? 1.9 + .1 * Math.sin(lt * 26) : .9 + tap * .12,  // arm at the board, then the pen hand on the podium
      armL: .2, bend: .18, glasses: 'on', inkThumb: true
    });
    podium(t, lt > 1.6 ? { register: 'gone' } : {});
    // his pen, tapping the podium edge
    if (lt > .5) {
      boilSeed('pen');
      inkLine([[556 - 18, 486 + tap * 2 - 22], [556 + 16, 486 + tap * 2 + 6]], 2.2, mixCol(C.hair, C.wood, .25), 'ink', .2);
    }
    dust(t, 8, 3, .7);
    camEnd();
  }
  // A crude but readable mouth driver: opens on syllables, closes between words. Used for every spoken line.
  function mouthTalk(lt, t0, t1, rate = 7, seed = 3) {
    if (lt < t0 || lt > t1) return 0;
    const k = seg(lt, t0, t1), w = Math.abs(Math.sin((lt - t0) * rate * Math.PI + seed)) * (0.55 + .45 * Math.sin((lt - t0) * 2.3));
    return clamp(w) * clamp(1 - Math.pow(Math.abs(k - .5) * 2, 6)) * .95;
  }

  // ---------- the register's page ----------
  // One sheet, drawn twice: as the teacher's hands open it (shot 4) and as the record rewrites itself in red (shot 13).
  const PAGEFRAME = { cx: 960, cy: 520, w: 1420, h: 880, rot: -.03 };
  function pageSheet(t, o = {}) {
    const F = o.P || PAGEFRAME;
    flatPush(F.cx, F.cy, F.rot);
    boilSeed('regpage');
    flat(rectPts(-F.w / 2 - 46, -F.h / 2 - 40, F.w + 92, F.h + 80), mixCol(C.wood, C.black, .42));   // leather
    flat(rectPts(-F.w / 2 - 14, -F.h / 2 - 12, F.w + 28, F.h + 24), mixCol(C.page, C.wood, .32));      // the block of pages
    inkFlat(rectPts(-F.w / 2 - 46, -F.h / 2 - 40, F.w + 92, F.h + 80).concat([[-F.w / 2 - 46, -F.h / 2 - 40]]), 2.6, INK);
    flat(rectPts(-F.w / 2, -F.h / 2, F.w, F.h), C.page);
    for (let i = 0; i < 8; i++) inkFlat([[-F.w / 2 + 20, -F.h / 2 + 140 + i * 92], [F.w / 2 - 20, -F.h / 2 + 140 + i * 92]], .8, mixCol(C.page, C.wall, .45), .9);
    inkFlat([[-F.w / 2 + 260, -F.h / 2 + 60], [-F.w / 2 + 260, F.h / 2 - 40]], 1, mixCol(C.red, C.page, .55), .8);
    inkFlat([[-F.w / 2 - 30, -F.h / 2 - 24], [F.w / 2 + 30, -F.h / 2 - 24], [F.w / 2 + 30, F.h / 2 + 24], [-F.w / 2 - 30, F.h / 2 + 24], [-F.w / 2 - 30, -F.h / 2 - 24]], 2.4, INK);
    flatCirc(0, -F.h / 2 + 120, 220, 46, mixCol(C.page, C.wood, .3), 26);
    flatPop();
  }
  // One line of the register, written inside the page frame.
  function pageWrite(txt, px, py, o) {
    const F = PAGEFRAME, c = Math.cos(F.rot), sn = Math.sin(F.rot);
    write(txt, F.cx + px * c - py * sn, F.cy + px * sn + py * c, { ...o, rot: (o.rot || 0) + F.rot, screen: true });
  }

  // ---------- SHOT 4 (F121-F168) — REGISTER ----------
  // Top-down 45deg on the hands. The page is drawn in screen space so the hand-written entries stay crisp.
  // P = the page frame: a local coordinate system, origin at the page's centre, so entries stay on the paper.
  const PAGE = { cx: 960, cy: 528, w: 1300, h: 792, rot: -.035 };
  function regPage(t, o = {}) {
    const { cx, cy, w, h, rot } = o.P || PAGE;
    flatPush(cx, cy, rot);
    boilSeed('regpage');
    paint(quad(-w / 2 - 26, -h / 2 - 20, w + 52, h + 40, 2), { wash: mixCol(C.wood, C.black, .35), ink: INK, sw: 2.4 });
    for (let i = 1; i <= 4; i++) inkLine([[-w / 2 - 14 + i * 6, -h / 2 - 12], [-w / 2 - 14 + i * 6, h / 2 + 12]], .8, mixCol(C.page, C.wood, .45), 'inkfine', .2);
    paint(quad(-w / 2, -h / 2, w, h, 2), { wash: C.page, ink: INK, sw: 1.4 });
    // the printed rulings of a school register, and the red margin
    for (let i = 0; i < 8; i++) inkLine([[-w / 2 + 20, -h / 2 + 108 + i * 84], [w / 2 - 20, -h / 2 + 108 + i * 84]], .7, mixCol(C.page, C.wall, .5), 'inkfine', .15);
    inkLine([[-w / 2 + 250, -h / 2 + 40], [-w / 2 + 250, h / 2 - 30]], 1, mixCol(C.red, C.page, .5), 'inkfine', .15);
    inkLine([[-w / 2 + 20, -h / 2 + 70], [w / 2 - 20, -h / 2 + 70]], 1, mixCol(C.page, C.wall, .5), 'inkfine', .15);
    // the cover's blind stamp, ghosted through the paper
    flatCirc(0, -h / 2 + 120, 210, 42, mixCol(C.page, C.wood, .3), 30);
    flatPop();
  }
  // One line of the register, written inside the page frame.
  function pageWrite(txt, px, py, o) {
    const { cx, cy, rot } = PAGE, c = Math.cos(rot), s = Math.sin(rot);
    write(txt, cx + px * c - py * s, cy + px * s + py * c, { ...o, rot: (o.rot || 0) + rot, screen: true });
  }
  function s04(t, lt) {
    camBegin(W / 2, H / 2, 1, 0);
    keyLight(700, 180, 900, 1);
    dim(.62, mixCol(C.shadow, C.wood, .25));
    PAGEFRAME.cx = 960; PAGEFRAME.cy = 520; PAGEFRAME.w = 1200; PAGEFRAME.h = 780; PAGEFRAME.rot = -.03;
    pageSheet(t);
    const names = ['RAHUL MISHRA', 'AMAN QURESHI', 'VIKRAM NAIR', 'SUNIL PATIL', 'FARAH KHAN'];
    for (let i = 0; i < 5; i++) pageWrite(names[i], -PAGEFRAME.w / 2 + 280, -PAGEFRAME.h / 2 + 150 + i * 82, { size: 44, font: 'print', col: '#3B2E22', seed: 40 + i, raw: true, align: 'left', pace: lt > .35 ? 1.6 : 0 });
    pageWrite('R.M.  seat 4, last row', -PAGEFRAME.w / 2 + 280, 300, { size: 48, font: 'pencil', col: '#4A3A2A', seed: 77, align: 'left', wob: 1.2, pace: lt > 1.0 ? 1.6 : 0 });
    // his hand enters and the ink-stained thumb settles on the page; the pen comes in and taps name one
    const enter = ease(seg(lt, .12, .45));
    if (enter > 0) hand(t, lerp(150, 250, enter), lerp(990, 940, enter), 330, { flip: 1 - enter, ink: true, rot: -1.35 });
    const tap = ring(lt, [.70, .86, 1.02], 10, 26);
    if (lt > .5) {
      const k = ease(seg(lt, .5, .78));
      inkLine([[lerp(700, 900, k), lerp(210, 300, k) + tap * 4], [lerp(724, 924, k), lerp(370, 470, k) + tap * 4]], 3, mixCol(C.hair, C.wood, .2), 'ink', .15);
      paint(quad(lerp(700, 900, k) - 4, lerp(370, 470, k) + tap * 4, 14, 10, 1), { wash: C.wall, ink: INK, sw: 1.2 });
    }
    camEnd();
    if (lt > .04 && lt < .16) dim(.2);
  }
  // A hand from above, resting on the page. Drawn in screen space (top-down on the register): wrist from the left,
  // palm, four fingers over the paper and the ink-stained thumb. k = 0..1 lifts and turns it for a page flip.
  function hand(t, x, y, r, o = {}) {
    const k = clamp(o.flip || 0), lift = Math.sin(k * Math.PI) * r * .5;
    boilSeed('hand' + (o.seed || 0));
    flatPush(x, y - lift, (o.rot || 0) + k * .5);
    const skin = mixCol(C.skin, C.warm, .12), dk = mixCol(skin, C.shadow, .35);
    // a soft shadow so it sits on the page
    paint(ellPts(r * .1, r * .26, r * .92, r * .5, 18), { wash: C.shadow, washOp: 40 + 50 * (1 - k), ink: null });
    // wrist and forearm, running out of frame bottom-left
    paint([[r * -.2, r * .05], [r * -.15, r * .55], [r * .95, r * .86], [r * .8, r * .12]], { wash: mixCol(skin, C.shadow, .1), ink: INK, sw: 2 });
    // palm
    paint(ellPts(0, 0, r * .5, r * .46, 20, 1), { wash: skin, ink: INK, sw: 2 });
    // four fingers, curling over the far edge of the page
    for (let i = 0; i < 4; i++) {
      boilSeed('f' + i);
      const fy = -r * .3 + i * r * .2, a = -.16 + i * .06 - k * .55, L = r * (.62 - Math.abs(i - 1.2) * .05);
      push(); translate(r * .3, fy); rotate(a);
      paint(rrPts(0, -r * .075, L, r * .15, r * .075, .6), { wash: i === 1 ? mixCol(skin, C.page, .12) : skin, ink: INK, sw: 1.7 });
      inkLine([[r * .12, -r * .04], [L * .82, -r * .03]], 1, dk, 'inkfine', .2);
      pop();
    }
    // the thumb: ink-stained, the one that turns the page
    boilSeed('thumb');
    flatPush(-r * .25, r * .08, -1.05 + k * .5);
    paint(rrPts(0, -r * .11, r * .62, r * .22, r * .11, .6), { wash: skin, ink: INK, sw: 1.9 });
    if (o.ink) { boilSeed('inkstain'); paint(ellPts(r * .42, 0, r * .1, r * .085, 10), { wash: mixCol(INK, C.wood, .18), ink: null }); }
    pop();
    // knuckle creases
    for (let i = 0; i < 3; i++) inkLine([[r * .06, -r * .26 + i * r * .2], [r * .22, -r * .24 + i * r * .2]], 1, dk, 'inkfine', .4);
    flatPop();
  }

  // ---------- SHOT 5 (F169-F216) — RAHUL? ----------
  // Same medium as shot 3. He looks off to Row 1, right side. An empty desk answers him.
  function s05(t, lt) {
    camBegin(724, 380, kf(lt, [[0, 1.86], [2, 1.9]]), .01);
    keyLight(430, 250, 820, .9);
    roomShell(t); desksLo(t); blackboard(t); boardWord(t, lt); wallClock(t); ceilingFan(t); deadPlant(t);
    const tap = ring(lt, [.62, .79], 11, 28);
    ravi(t, 566, 716, 62, {
      view: 'q', lookX: .85, lookY: .18, eye: .5,
      mouth: mouthTalk(lt, .15, .33, 8, 1),
      armR: .62 + tap * .1, armL: .16, bend: .16, glasses: 'on', inkThumb: true,
      squint: lt > .9 && lt < 1.1 ? .5 : .1
    });
    podium(t);
    camEnd();
    // F205-F216: a slow blink, six frames. The room does not care.
    if (lt > 1.46 && lt < 1.72) dim(.03);
  }

  // ---------- SHOT 6 (F217-F264) — AMAN? ----------
  function s06(t, lt) {
    camBegin(700, 384, kf(lt, [[0, 1.88], [2, 1.92]]), .01);
    keyLight(430, 250, 820, .9);
    roomShell(t); desksLo(t); blackboard(t); boardWord(t, lt);
    wallClock(t); ceilingFan(t); deadPlant(t);
    const tap = ring(lt, [.62, .79], 11, 28);
    ravi(t, 566, 716, 62, {
      view: 'q', lookX: -.8, lookY: .3, eye: .48,
      mouth: mouthTalk(lt, .1, .3, 7, 2), armR: .6 + tap * .1, armL: .14, bend: .18, glasses: 'on', inkThumb: true
    });
    podium(t);
    camEnd();
  }

  // ---------- SHOT 7 (F265-F312) — VIKRAM: THE FREEZE ----------
  // Close on his face. Four taps. No voice. Glasses off, rub, back on.
  function s07(t, lt) {
    camBegin(596, 330, kf(lt, [[0, 3.95], [2, 4.08]]), .006);
    keyLight(430, 220, 900, .85);
    roomShell(t); desksLo(t); blackboard(t); boardWord(t); wallClock(t); ceilingFan(t); deadPlant(t);
    const taps = [.62, .79, .96, 1.13];
    const tap = ring(lt, taps, 10, 24);
    const glasses = lt > 1.0 && lt < 1.42 ? 'off' : 'on';
    const rub = lt > 1.12 && lt < 1.3 ? 1 : 0;
    ravi(t, 566, 716, 62, {
      view: 'front', lookX: .1, lookY: -.15, eye: .42,
      mouth: mouthTalk(lt, .12, .3, 6, 4), armR: .58 + tap * .12, armL: rub ? .95 + .1 * Math.sin(lt * 40) : .14,
      bend: .16, glasses, squint: .35 + rub * .4, inkThumb: true
    });
    podium(t);
    deadPlant(t, { sway: 1.2 });
    camEnd();
  }

  // ---------- SHOT 8 (F313-F360) — "KOI HAI HI NAHI" ----------
  // He looks down at the desks, then at the register. The fan stops on F349, the clock on F351.
  function s08(t, lt) {
    const STOP = 1.5;                       // F349 = 1.5 s into the shot
    camBegin(760, 392, kf(lt, [[0, 1.74], [1.45, 1.8], [2, 1.82]]), .008);
    keyLight(430, 250, 820, .9 - .2 * seg(lt, 1.5, 2));
    roomShell(t); desksLo(t); blackboard(t); boardWord(t);
    wallClock(t, STOP + .083); ceilingFan(t, STOP); deadPlant(t);
    ravi(t, 566, 716, 62, {
      view: 'front', lookY: .55, lookX: .1, eye: .5,
      mouth: mouthTalk(lt, .7, 1.3, 6, 5), armR: .5, armL: .12, bend: .2 + .1 * seg(lt, .5, 1.2), glasses: 'on', inkThumb: true
    });
    podium(t);
    dust(t, 8, 4, .5);
    camEnd();
    if (lt > 1.55) dim(.12 * seg(lt, 1.55, 2));
  }

  // ---------- SHOT 9 (F361-F408) — TAPPING ----------
  // Wide from behind him, looking down the room at the last bench in shadow. Light drops, shadows lengthen.
  function s09(t, lt) {
    camBegin(980, 470, kf(lt, [[0, 1.02], [2, 1.06]]), 0);
    keyLight(300, 200, 900, .75 - .3 * seg(lt, 0, 1));
    roomShell(t); deskField(t);
    lastBench(t, { book: { glowK: seg(lt, 0, 1) } });
    blackboard(t); wallClock(t); ceilingFan(t); classPhoto(t, 0); deadPlant(t);
    ravi(t, 900, 892, 74, { view: 'back', armR: .1, armL: .1, bend: .1, seed: 'b' });
    const tap = ring(lt, [.62, .96, 1.29, 1.62], 9, 22);   // F376, F384, F392, F400
    if (tap > .01) {                                        // the book's page catches the light on each tap
      boilSeed('tapglow');
      paint(ellPts(LASTBENCH.x, LASTBENCH.y - 210, 90 + tap * 30, 40 + tap * 14, 18), { wash: C.page, washOp: 40 + 90 * tap, ink: null });
    }
    camEnd();
    dim(.22 * seg(lt, .05, 1.2));
  }

  // ---------- text on the bench book ----------
  // The last bench is the only place the film writes in a boy's hand. This projects a point on the open page to screen.
  function benchText(txt, o = {}) {
    frameWrite(txt, o.dx || 0, o.dy || 0, { cx: BOOK.x, cy: BOOK.y, rot: 0 }, { size: o.size || 26, font: 'pencil', col: '#3A2E22', align: 'center', seed: o.seed || 5, reveal: o.reveal, wob: 1.2, track: .92 });
  }

  // ---------- SHOT 10 (F409-F468) — MERI ATTENDANCE REH GAYI ----------
  function s10(t, lt) {
    const pushK = ease(seg(lt, 0, .9));
    camBegin(lerp(BOOK.x, BOOK.x - 4, pushK), lerp(BOOK.y - 10, BOOK.y - 26, pushK), lerp(3.0, 3.4, pushK), 0);
    keyLight(LASTBENCH.x - 120, LASTBENCH.y - 300, 620, 1);
    roomShell(t); deskField(t);
    lastBench(t, { book: { lines: false, pageTurn: seg(lt, .5, 1.0), glowK: 1 } });
    const pool = toScreen(BOOK.x, BOOK.y);
    // the page turns by itself and the words are already there, in pencil
    if (lt > .98) benchText('Sir, aap mujhe har roz dekhte ho.', { size: 16, reveal: seg(lt, 1.0, 1.5), dy: 8, seed: 12 });
    podium(t, { register: 'gone' });
    camEnd();
    dim(.64, mixCol(C.shadow, C.black, .3));
    lightPool(pool[0], pool[1], 430 * 3.2, 1);
  }

  // ---------- SHOT 11 (F469-F552) — THE TURN ----------
  // Locked off medium. Head, then shoulders, then feet, in three parts. Then the glasses, again.
  function s11(t, lt) {
    camBegin(700, 400, kf(lt, [[0, 1.76], [3.5, 1.8]]), 0);
    keyLight(420, 240, 820, .9);
    roomShell(t); desksLo(t); lastBench(t, { book: false }); blackboard(t); boardWord(t); wallClock(t); ceilingFan(t); deadPlant(t);
    const headT = seg(lt, 0, .5), shT = seg(lt, .5, 1.0), ftT = seg(lt, 1.0, 1.5);
    const view = lt < .5 ? 'q' : lt < 1.0 ? 'q' : 'front';
    const lookX = lerp(.4, .25, headT);
    const glasses = lt > 1.5 && lt < 1.95 ? 'off' : 'on';
    const rub = lt > 1.62 && lt < 1.83;
    ravi(t, 566, 716, 62, {
      view: lt < 1.0 ? 'q' : 'front', lookX, lookY: .2, eye: .5,
      mouth: mouthTalk(lt, 1.9, 2.1, 6, 6),
      armR: .55, armL: rub ? 1.0 + .12 * Math.sin(lt * 46) : .14,
      bend: .14 + .12 * (1 - ftT), lean: .2 * (1 - ftT), glasses, squint: rub ? .7 : .1, inkThumb: true
    });
    podium(t);
    camEnd();
  }

  // ---------- SHOT 12 (F553-F648) — HAR ROZ DEKHTE HO ----------
  // Two-shot. He is warm on the left; the bench is dark on the right, and turns its own page.
  function s12(t, lt) {
    camBegin(1040, 612, kf(lt, [[0, 1.3], [4, 1.36]]), 0);
    keyLight(300, 220, 720, .9);
    roomShell(t); desksLo(t);
    // a pool of shadow around the last bench that is deeper than the room
    boilSeed('benchshadow');
    paint(ellPts(LASTBENCH.x, LASTBENCH.y - 160, 340, 250, 24, 8), { wash: mixCol(C.shadow, C.wall, .5), washOp: 150, ink: null });
    lastBench(t, { book: { pageTurn: seg(lt, .6, 1.1) } });
    blackboard(t); deadPlant(t);
    ravi(t, 700, 900, 86, {
      view: 'q', lookX: .75, lookY: .05, eye: .45, squint: .35,
      armR: .1, armL: .1, bend: .12, glasses: 'on', seed: 'c'
    });
    const tap = ring(lt, [2.8, 3.2, 3.6], 10, 24);
    if (lt > 1.05) benchText('Sir, aap mujhe har roz dekhte ho.', { size: 22, reveal: seg(lt, 1.1, 1.7), seed: 12 });
    camEnd();
    dim(.2);
  }

  // ---------- SHOT 13 (F649-F720) — DEAD REVEAL ----------
  // ECU register, shallow. Red appears letter by letter: the only red in the film.
  function s13(t, lt) {
    camBegin(W / 2, H / 2, 1, 0);
    keyLight(640, 220, 900, .8);
    dim(.6, mixCol(C.shadow, C.wood, .22));
    PAGEFRAME.cx = 1010; PAGEFRAME.cy = 500; PAGEFRAME.w = 1300; PAGEFRAME.h = 820; PAGEFRAME.rot = -.02;
    pageSheet(t);
    pageWrite('R.M.  seat 4, last row', -PAGEFRAME.w / 2 + 320, -PAGEFRAME.h / 2 + 120, { size: 46, font: 'pencil', col: '#4A3A2A', seed: 77, align: 'left', wob: 1.2 });
    // the nib presses too hard: red, letter by letter, wet
    const r1 = seg(lt, .5, 1.35), r2 = seg(lt, 1.4, 2.1);
    if (r1 > 0) pageWrite('RAHUL MISHRA', -PAGEFRAME.w / 2 + 300, 10, { size: 100, font: 'marker', col: C.red, align: 'left', reveal: r1, seed: 4, wob: .8 });
    if (r2 > 0) pageWrite('DEAD — 17 YEARS AGO', -PAGEFRAME.w / 2 + 300, 180, { size: 84, font: 'marker', col: C.red, align: 'left', reveal: r2, seed: 9, wob: .9 });
    if (r2 > .15) {   // wet ink catches the lamp
      const wet = clamp(r2 * 1.2);
      flatCirc(-PAGEFRAME.w / 2 + 600, -10, 380, 30, C.red, Math.round(26 * wet));
      flatCirc(-PAGEFRAME.w / 2 + 560, 170, 380, 24, C.red, Math.round(24 * wet));
    }
    if (lt > 1.55 && lt < 2.2) {   // one drop gathers, falls at F700, and lands
      const d = seg(lt, 1.55, 2.0);
      flatCirc(-PAGEFRAME.w / 2 + 860, lt > 2.0 ? 900 : 175 + 12 * d, 6 + 5 * d, 9 + 12 * d, C.red, 235);
    }
    // his hand at the edge of frame, shaking
    const tremble = 2 * Math.sin(lt * 34) * seg(lt, 0, .4);
    hand(t, 130 + tremble, 940, 300, { flip: 1 - seg(lt, 0, .5), ink: true, rot: -1.4 });
    camEnd();
  }

  // ---------- SHOT 14 (F721-F792) — MAR CHUKE HO ----------
  function s14(t, lt) {
    camBegin(596, 336, kf(lt, [[0, 3.85], [3, 3.98]]), .004);
    keyLight(430, 220, 860, .7);
    roomShell(t); desksLo(t); blackboard(t); boardWord(t); wallClock(t); ceilingFan(t); deadPlant(t);
    const glasses = lt > 1.2 && lt < 1.62 ? 'off' : 'on';
    const rub = lt > 1.25 && lt < 1.45;
    const tremble = 2 * Math.sin(lt * 30);
    ravi(t, 566 + tremble, 716, 62, {
      view: 'front', lookX: -.1, lookY: .5, eye: .55,
      mouth: mouthTalk(lt, .35, .95, 5, 7),
      armR: .5, armL: rub ? 1.0 + .1 * Math.sin(lt * 40) : .14,
      bend: .16, glasses, squint: rub ? .7 : .2, inkThumb: true
    });
    podium(t, { register: 'gone' });
    // the pen falls at F785, clinks, rolls and stops
    if (lt > 1.5) {
      const roll = .6 * (1 - Math.exp(-(lt - 1.5) * 6));
      boilSeed('penfall');
      const py2 = Math.min(120, (lt - 1.5) * 900);
      inkLine([[580 + roll * 30, 470 + py2], [590 + roll * 30, 492 + py2]], 3, mixCol(C.hair, C.wood, .2), 'ink', .15);
    }
    camEnd();
    dim(.1 + .1 * seg(lt, 0, 3));
  }

  // ---------- SHOT 15 (F793-F864) — PAR AAP BHI TOH ----------
  function s15(t, lt) {
    camBegin(BOOK.x - 6, BOOK.y - 6, kf(lt, [[0, 3.1], [3, 3.4]]), 0);
    keyLight(LASTBENCH.x - 160, LASTBENCH.y - 340, 560, .8);
    roomShell(t); deskField(t);
    lastBench(t, { book: { pageTurn: seg(lt, 0, .5), glowK: 1 } });
    const pool = toScreen(BOOK.x, BOOK.y);
    benchText('Haan sir… par aap bhi toh…', { size: 18, reveal: seg(lt, .5, 1.2), seed: 21 });
    camEnd();
    // the light fails twice, then holds
    const f = (lt > 1.1 && lt < 1.2) || (lt > 1.35 && lt < 1.45);
    dim(f ? .34 : 0);
    lightPool(pool[0], pool[1], 400 * 3.2, f ? .15 : 1);
  }

  // ---------- SHOT 16 (F865-F936) — DARKNESS ----------
  function s16(t, lt) {
    camBegin(1010, 470, kf(lt, [[0, 1.04], [3, 1.08]]), 0);
    keyLight(260, 240, 640, .35);
    roomShell(t); desksLo(t);
    lastBench(t, { book: { lines: false } });
    blackboard(t); classPhoto(t, seg(lt, 2.4, 2.7) * .6); deadPlant(t, { sway: 1.6 });
    // his silhouette, holding the register, not moving
    ravi(t, 986, 900, 92, { view: 'back', armR: .35, armL: .3, bend: .1, seed: 'd', tintDark: true });
    camEnd();
    dim(.34 + .16 * seg(lt, 0, 1));
  }

  // ---------- SHOT 17 (F937-F1008) — DOOR CLOSES ----------
  function s17(t, lt) {
    camBegin(1150, 520, kf(lt, [[0, 1.0], [3, 1.04]]), 0);
    boilSeed('hall');
    flat(rectPts(-60, -60, W + 120, FLOOR + 70), mixCol(C.wall, C.shadow, .62));
    flat(rectPts(-60, FLOOR, W + 120, H - FLOOR + 60), mixCol(C.wood, C.black, .72));
    const D = { x: 700, y: 196, w: 450, h: 720 };
    const k = ease(seg(lt, 0, 2.0));                    // the swing, three seconds
    flat(rectPts(D.x - 34, D.y - 34, D.w + 68, D.h + 48), mixCol(C.wood, C.shadow, .2));
    // the hall beyond: warm, and the only light in the shot
    flat(rectPts(D.x, D.y, D.w, D.h), mixCol(C.warm, C.wall, .35));
    flatCirc(D.x + D.w * .55, D.y + D.h * .5, D.w * .62, D.h * .4, C.warm, 120);
    const openW = lerp(D.w, 0, k);
    if (openW > 10) flat(rectPts(D.x, D.y, openW, D.h), mixCol(C.warm, C.page, .45), 250);
    // the leaf hinges on the right jamb and swings across, eating the opening as it shuts
    const leafW = D.w - openW + 40;
    flat(rectPts(D.x + D.w + 40 - leafW, D.y - 6, leafW, D.h + 12), mixCol(C.wood, C.shadow, .62));
    inkFlat([[D.x + D.w + 40 - leafW, D.y], [D.x + D.w + 40 - leafW, D.y + D.h]], 2.4, INK);
    inkFlat([[D.x + D.w + 40 - leafW, D.y - 2], [D.x + D.w + 40, D.y + 2], [D.x + D.w + 40, D.y + D.h], [D.x + D.w + 40 - leafW, D.y + D.h]], 2.4, INK);
    if (leafW > 150) for (let i = 0; i < 2; i++) inkFlat([[D.x + D.w + 40 - leafW + 50, D.y + 70 + i * (D.h * .47)], [D.x + D.w + 20, D.y + 70 + i * (D.h * .47)], [D.x + D.w + 20, D.y + 70 + i * (D.h * .47) + D.h * .36], [D.x + D.w + 40 - leafW + 50, D.y + 70 + i * (D.h * .47) + D.h * .36], [D.x + D.w + 40 - leafW + 50, D.y + 70 + i * (D.h * .47)]], 1.6, mixCol(C.wood, C.shadow, .35));
    // the handle: one frame where it turns, catching the hall light
    const hk = lt > 2.02 ? 1 : 0;
    flatCirc(D.x + D.w + 40 - leafW + 56, D.y + 372, 10 + 3 * hk, 10 + 8 * hk, mixCol(C.warm, C.wall, .45));
    inkFlat([[D.x - 34, D.y - 34], [D.x + D.w + 34, D.y - 34], [D.x + D.w + 34, D.y + D.h], [D.x - 34, D.y + D.h], [D.x - 34, D.y - 34]], 2.2, INK);
    // the light on the floor, narrowing with the door
    if (k < .99) flat([[D.x, FLOOR + 4], [D.x + openW, FLOOR + 4], [D.x + openW + 150 * (1 - k), 1070], [D.x - 70, 1070]], C.warm, Math.round(85 * (1 - k)));
    camEnd();
    veil(.72, mixCol(C.shadow, C.black, .4));
    if (lt > 2.06) veil(.9);   // CLACK
  }

  // ---------- SHOT 18 (F1009-F1080) — WHISPER ----------
  function s18(t, lt) {
    camBegin(1188, 520, kf(lt, [[0, 1.12], [3, 1.18]]), 0);
    keyLight(360, 240, 700, .45);
    roomShell(t); desksLo(t);
    lastBench(t, { book: { lines: false }, bookW: 300 });
    blackboard(t); deadPlant(t);
    const drop = seg(lt, 2.5, 2.75);
    ravi(t, 900, 900, 96, { view: 'back', armR: .35 - .2 * drop, armL: .3 - .2 * drop, bend: .12 + .06 * drop, seed: 'e' });
    // the register falls, hits the floor and fans open
    const falling = seg(lt, 2.7, 2.9), landed = lt > 2.9;
    boilSeed('regfall');
    const ry = landed ? 962 : lerp(520, 962, easeIn(falling));
    flatPush(1050, ry, lerp(-.5, .1, easeIn(falling)));
    paint(quad(-86, -12, 172, 26, 1), { wash: mixCol(C.wood, C.black, .35), ink: INK, sw: 2 });
    if (landed) { for (let i = 0; i < 5; i++) paint(quad(-80 + i * 6, -14 - i * 2, 160 - i * 12, 10, 1), { wash: C.page, ink: null }); }
    flatPop();
    camEnd();
    dim(.4 + .12 * seg(lt, 0, 3));
  }

  // ---------- SHOT 19 (F1081-F1176) — PHOTO REVEAL ----------
  function s19(t, lt) {
    // Slow push-in on the register on the floor. At the end the photograph and the entry fill the frame.
    const pushK = ease(seg(lt, 0, 1.5));
    camBegin(lerp(980, 1012, pushK), lerp(760, 780, pushK), lerp(1.75, 2.45, pushK), -.006);
    keyLight(1000, 640, 700, .55);
    boilSeed('floor19');
    paint(quad(-60, FLOOR - 60, W + 120, H - FLOOR + 120, 0), { wash: mixCol(C.wood, C.shadow, .6), ink: null });
    inkLine([[-60, FLOOR + 30], [W * .5, FLOOR + 22], [W + 60, FLOOR + 34]], pw(1.2), mixCol(C.wood, C.black, .5), 'inkfine', .5);
    // his legs at the frame's left edge: the man is still standing there
    boilSeed('legs19');
    for (const s2 of [-1, 1]) paint([[60 + s2 * 76, 240], [190 + s2 * 76, 240], [200 + s2 * 90, 1010], [50 + s2 * 66, 1010]],
      { wash: mixCol(C.shadow, C.black, .5), ink: INK, sw: pw(2) });
    // the register, open, pages fanned, the photograph pasted on the left page
    const rx = 1010, ry = 806;
    boilSeed('regfloor');
    paint(quad(rx - 300, ry - 66, 600, 132, 2), { wash: mixCol(C.wood, C.black, .45), ink: INK, sw: pw(2.4) });
    const layers = Math.min(10, 2 + Math.floor(seg(lt, 0, 1) * 8));
    for (let i = 0; i < layers; i++) paint(quad(rx - 282 + i * 6, ry - 56 - i * 3, 564 - i * 12, 104, 1), { wash: i % 2 ? C.page : mixCol(C.page, C.wall, .12), ink: null });
    paint(quad(rx - 274, ry - 46, 548, 92, 1), { wash: C.page, ink: INK, sw: pw(1.2) });
    inkLine([[rx, ry - 46], [rx, ry + 46]], pw(1.1), mixCol(C.page, C.shadow, .45), 'inkfine', .2);
    // the photograph: young Ravi at 25, gap-toothed, the same cracked glasses, warm and faded
    const ph = { x: rx - 252, y: ry - 40, w: 236, h: 80 };
    boilSeed('youngravi');
    paint(quad(ph.x - 7, ph.y - 7, ph.w + 14, ph.h + 14, 1), { wash: mixCol(C.page, C.wood, .28), ink: INK, sw: pw(1.4) });
    paint(quad(ph.x, ph.y, ph.w, ph.h, 1), { wash: mixCol(C.warm, C.page, .6), ink: null });
    const px = ph.x + ph.w * .36, py = ph.y + ph.h * .9, pr = ph.h * .28;
    paint(ellPts(px, py + pr * 1.5, pr * 2.6, pr * .9, 16, 1), { wash: mixCol(C.page, C.sky || C.wall, .5), ink: null });
    paint(ellPts(px, py - pr * 1.2, pr * .98, pr * 1.05, 16, 1), { wash: mixCol(C.skin, C.warm, .45), ink: mixCol(C.shadow, C.wood, .35), sw: pw(.7) });
    paint(ellPts(px, py - pr * 1.95, pr * 1.02, pr * .55, 14, 1), { wash: mixCol(C.hair, C.shadow, .3), ink: null });     // a full head of hair, 2007
    paint(ellPts(px + pr * .36, py - pr * 1.0, pr * .08, pr * .08, 6), { wash: INK, ink: null });                          // the mole, still there
    for (const s2 of [-1, 1]) paint(ellPts(px + s2 * pr * .4, py - pr * 1.2, pr * .26, pr * .2, 12), { wash: C.page, washOp: 80, ink: mixCol(C.hair, C.wood, .35), sw: pw(.5) });
    paint(quad(px - pr * .46, py - pr * .74, pr * .92, pr * .3, 1), { wash: mixCol('#4A211C', C.shadow, .25), ink: null }); // the gap-toothed grin
    paint(quad(px - pr * .14, py - pr * .74, pr * .14, pr * .3, .4), { wash: C.page, ink: null });
    frameWrite('2007', ph.w * .3, -ph.h * .3, { cx: ph.x + ph.w * .5, cy: ph.y + ph.h * .5, rot: 0 }, { size: 20, font: 'pencil', col: '#4A3A2A', seed: 61, align: 'center' });
    // the record, written on the right-hand page beside the photograph
    const r1 = seg(lt, 1.5, 2.0), r2 = seg(lt, 2.0, 2.8);
    frameWrite('VERMA, RAVI', 0, -10, { cx: rx + 132, cy: ry, rot: 0 }, { size: 24, font: 'marker', col: C.red, align: 'center', reveal: r1, seed: 3 });
    if (r2 > 0) frameWrite('DEAD — 17 YEARS AGO', 0, 20, { cx: rx + 132, cy: ry, rot: 0 }, { size: 20, font: 'marker', col: C.red, align: 'center', reveal: r2, seed: 8 });
    camEnd();
    dim(.4 + .1 * pushK);
    // letterbox slams in at F1128
    const lb = ease(seg(lt, 1.958, 2.04));
    if (lb > 0) { const hh = Math.round(H * .065 * lb); letterbox(hh); }
  }

  // ---------- SHOT 20 (F1177-F1200) — CUT TO BLACK ----------
  function s20(t, lt) {
    paint(quad(-40, -40, W + 80, H + 80, 0), { wash: C.black, ink: null });
  }

  // ---------- timeline (frames at 24 fps; 1200 frames = 50.0 s) ----------
  shots([
    [0.0, s01],        // F001-F036   0.0-1.5   the room
    [1.5, s02],        // F037-F072   1.5-3.0   push-in to the bench
    [3.0, s03],        // F073-F120   3.0-5.0   the teacher writes, turns, counts
    [5.0, s04],        // F121-F168   5.0-7.0   the register
    [7.0, s05],        // F169-F216   7.0-9.0   "Rahul?"
    [9.0, s06],        // F217-F264   9.0-11.0  "Aman?" — the paper moves
    [11.0, s07],       // F265-F312   11.0-13.0 "Vikram?" — four taps
    [13.0, s08],       // F313-F360   13.0-15.0 the fan stops
    [15.0, s09],       // F361-F408   15.0-17.0 tapping on the bench
    [17.0, s10],       // F409-F468   17.0-19.5 the book answers
    [19.5, s11],       // F469-F552   19.5-23.0 the turn
    [23.0, s12],       // F553-F648   23.0-27.0 the two-shot
    [27.0, s13],       // F649-F720   27.0-30.0 the red page
    [30.0, s14],       // F721-F792   30.0-33.0 "mar chuke ho"
    [33.0, s15],       // F793-F864   33.0-36.0 "par aap bhi toh"
    [36.0, s16],       // F865-F936   36.0-39.0 darkness
    [39.0, s17],       // F937-F1008  39.0-42.0 the door
    [42.0, s18],       // F1009-F1080 42.0-45.0 the whisper
    [45.0, s19],       // F1081-F1176 45.0-49.0 the photograph
    [49.0, s20]        // F1177-F1200 49.0-50.0 black
  ]);
})();
