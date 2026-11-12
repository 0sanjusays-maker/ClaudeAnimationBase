// chhath.js: "PEHLA CHHATH — teen peedhiyon ka saath" — a 75-second, 9:16 Madhubani music-video animatic.
// Storyboard and shot list: CHHATH_STORYBOARD.md. Sound: CHHATH_AUDIO_CUES.md (foley only; the song is dropped on top).
//
// Nothing here is lip-synced and nothing is captioned: the only lettering in the film is the closing card, which is
// painted in the same hand as the border. The style is Madhubani — flat fills, a double outline on every shape, a
// patterned fill inside it, and a hand-inked border that is drawn on, beat by beat, in shot 1 and rubs out in shot 20
// so the Reel loops back onto its own first frame.
(() => {
  // ---------- palette (Madhubani: earth, kumkum, indigo) ----------
  const C = {
    paper: '#F6EBD8', ink: '#211A16', red: '#B8291D', redDk: '#8E1C14', verm: '#D9532F', orange: '#E8862F',
    saff: '#E9A93C', gold: '#CF9526', marigold: '#E5B45A', green: '#3E6B4A', greenLt: '#6E8F5B',
    indigo: '#1B2547', night: '#111834', violet: '#46386B', water: '#25455C', waterLt: '#417E86',
    skin: '#BE8A5C', skinDk: '#A87448', skinLt: '#D6A87C', white: '#FBF3E2', hair: '#171310',
    sari: '#A8322A', sariLt: '#C0473A'
  };
  const INK = C.ink;
  // Alpha in this file is written 0..1 (the way you think about opacity); the engine's flat layer takes 0..255.
  // These two wrappers do the conversion once, here, so every call below can say a: .6 and mean it.
  const A8 = a => (a == null ? 255 : a <= 1 ? a * 255 : a);
  // Wrap the engine's fill calls so this file can write alpha as 0..1 everywhere (an IIFE is function-scoped, so the
  // `flat` / `flatCirc` names below really are these wrappers).
  // (no local `flat`: resolving the name here would capture the global by TDZ. Call flatA/flatCircA instead.)
  const flatA = (pts, col, a) => flat(pts, col, A8(a));
  const flatCircA = (x, y, rx, ry, col, a, rot) => flatCirc(x, y, rx, ry, col, A8(a), rot);

  // ---------- geometry helpers ----------
  const lerpP = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
  const centroid = P => { let x = 0, y = 0; for (const p of P) { x += p[0]; y += p[1]; } return [x / P.length, y / P.length]; };
  // Scale a shape about its own centre: k > 1 gives the offset second line that makes a Madhubani shape read as drawn.
  const growShape = (P, k) => { const [cx, cy] = centroid(P); return P.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k]); };
  const closed = P => [...P, P[0]];
  const pt2 = (a, b, k) => lerpP(a, b, clamp(k));

  // world point -> the flat layer's device space, in the same order flat() does it (transform, then camera)
  function device(x, y) {
    let [u, v] = flatPt(x, y);
    if (CAM) { const c = Math.cos(CAM.rot), s = Math.sin(CAM.rot), dx = (u - CAM.cx) * CAM.zoom, dy = (v - CAM.cy) * CAM.zoom; u = W / 2 + dx * c - dy * s; v = H / 2 + dx * s + dy * c; }
    return [u, v];
  }
  // Clip subsequent flat/ink drawing to a world-space shape. Pair with clipEnd().
  function clipShape(P) {
    const c = flatX; c.save();
    c.beginPath(); P.forEach(([x, y], i) => { const [u, v] = device(x, y); i ? c.lineTo(u, v) : c.moveTo(u, v); });
    c.closePath(); c.clip();
  }
  const clipEnd = () => flatX.restore();
  // Fill the whole DEVICE canvas (not world space): a camera at zoom > 1 would otherwise show bare paper at the edges.
  function bgFill(col, a = 1) { const c = flatX; c.save(); c.translate(W / 2, H / 2); c.globalAlpha = clamp(a); c.fillStyle = col; c.fillRect(-W / 2, -H / 2, W, H); c.restore(); }

  // One Madhubani shape: flat fill, an ink contour, and a second thinner contour offset outside it.
  function mm(P, col, o = {}) {
    if (typeof P[0] === 'number') throw new Error('mm: pass ONE polygon, not a limb point-list');
    if (col) flatA(P, col, o.a == null ? 255 : o.a);
    const w = o.w == null ? 2.6 : o.w;
    inkFlat(closed(P), w, o.inkCol || INK, o.inkA == null ? 1 : o.inkA, o.boil == null ? 1 : o.boil);
    if (o.dbl !== false) inkFlat(closed(growShape(P, o.dblK || 1.045)), w * .45, o.inkCol || INK, (o.inkA == null ? 1 : o.inkA) * .8, .7);
  }
  // A patterned area inside a shape: dots, comb lines, fish-scale arcs, lotus petals or a crosshatch.
  function pattern(P, kind, col = INK, o = {}) {
    const a = o.a == null ? .5 : o.a, st = o.step || 26, lw = o.w == null ? 1.1 : o.w;
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (const [x, y] of P) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    clipShape(P);
    const c = flatX; c.save();
    c.strokeStyle = col; c.fillStyle = col; c.globalAlpha = a; c.lineCap = 'round';
    const W2 = (x, y) => device(x, y);          // world -> device, camera included (the canvas has no transform here)
    if (kind === 'dots') {
      for (let y = y0; y < y1 + st; y += st) for (let x = x0 + ((Math.round((y - y0) / st) % 2) ? st / 2 : 0); x < x1 + st; x += st) {
        const [u, v] = W2(x + jit(1.2), y + jit(1.2)); c.beginPath(); c.arc(u, v, lw * .95, 0, TAU); c.fill();
      }
    } else if (kind === 'lines') {
      for (let x = x0; x < x1 + st; x += st) {
        c.beginPath(); let first = true;
        for (let y = y0 - 20; y < y1 + 40; y += 34) { const [u, v] = W2(x + jit(1) + Math.sin(y * .02) * 2, y); first ? (c.moveTo(u, v), first = false) : c.lineTo(u, v); }
        c.lineWidth = lw * (CAM ? CAM.zoom : 1); c.stroke();
      }
    } else if (kind === 'scale') {
      c.lineWidth = lw * (CAM ? CAM.zoom : 1);
      for (let y = y0, r = 0; y < y1 + st; y += st * .55, r++) for (let x = x0 + (r % 2 ? st / 2 : 0); x < x1 + st; x += st) {
        const [u, v] = W2(x, y); c.beginPath(); c.arc(u, v, st * .5 * (CAM ? CAM.zoom : 1), Math.PI, TAU * 1.16); c.stroke();
      }
    } else if (kind === 'lotus') {
      c.lineWidth = lw * (CAM ? CAM.zoom : 1);
      for (let y = y0 + st; y < y1; y += st * 1.7) for (let x = x0 + st; x < x1; x += st * 1.7) {
        const [u, v] = W2(x, y), r = st * .42 * (CAM ? CAM.zoom : 1);
        for (let k = 0; k < 6; k++) { const a0 = k / 6 * TAU; c.beginPath(); c.moveTo(u, v); c.quadraticCurveTo(u + Math.cos(a0 + .3) * r, v + Math.sin(a0 + .3) * r, u + Math.cos(a0) * r, v + Math.sin(a0) * r); c.stroke(); }
      }
    } else if (kind === 'cross') {
      c.lineWidth = lw * (CAM ? CAM.zoom : 1);
      for (let y = y0 - (x1 - x0); y < y1 + 40; y += st) {
        let f = true; c.beginPath();
        for (let x = x0 - 20; x < x1 + 20; x += 40) { const [u, v] = W2(x, y + (x - x0)); f ? (c.moveTo(u, v), f = false) : c.lineTo(u, v); } c.stroke();
        f = true; c.beginPath();
        for (let x = x0 - 20; x < x1 + 20; x += 40) { const [u, v] = W2(x, y + (x1 - x0) - (x - x0)); f ? (c.moveTo(u, v), f = false) : c.lineTo(u, v); } c.stroke();
      }
    }
    c.restore(); clipEnd();
  }
  // A tapering limb / stalk as a closed shape between two points, with a bend in the middle.
  function limb(a, b, w0, w1, bend = 0, n = 7) {
    const L = [], R = [];
    for (let i = 0; i <= n; i++) {
      const k = i / n, p = lerpP(a, b, k), dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len, ny = dx / len, off = Math.sin(k * Math.PI) * bend, w = lerp(w0, w1, k) / 2;
      L.push([p[0] + nx * w + nx * off, p[1] + ny * w + ny * off]);
      R.push([p[0] - nx * w + nx * off, p[1] - ny * w + ny * off]);
    }
    return L.concat(R.reverse());
  }
  // Stroke a path as an ink line, optionally only its first k fraction (lines that are drawn on).
  function inkPath(P, w, col = INK, k = 1, a = 1) {
    if (k <= 0) return;
    const n = Math.max(2, Math.ceil(P.length * clamp(k)));
    inkFlat(P.slice(0, n), w, col, a, .8);
  }

  // ---------- shared settings ----------
  const GROUND = 1520;                        // the aangan floor line, and the default standing line
  const SAFE = { x0: 70, x1: 1010, y0: 300, y1: 1640 };   // 9:16 crop-safe box for Reels/Shorts

  // ================= BORDER =================
  // The frame's hand-inked border: two rules with a band of motifs between them. `k` draws it on (0..1), `rub` rubs it
  // out (1..0), so shot 1 and the last second of shot 20 can meet at the same drawing and the Reel loops.
  function border(k = 1, o = {}) {
    if (k <= .002) return;
    const m = 44, m2 = 76, P = [[m, m], [W - m, m], [W - m, H - m], [m, H - m]];
    const per = 2 * ((W - 2 * m) + (H - 2 * m)), draw = per * clamp(k), a = o.a == null ? 1 : o.a, col = o.col || INK;
    // outer rule, drawn on like a pen travelling round the frame
    let run = 0;
    for (let i = 0; i < 4; i++) {
      const a0 = P[i], b0 = P[(i + 1) % 4], L = Math.hypot(b0[0] - a0[0], b0[1] - a0[1]);
      const kk = clamp((draw - run) / L); run += L;
      if (kk > 0) inkFlat([a0, lerpP(a0, b0, kk)], o.w || 3.4, col, a, .8);
    }
    if (k > .34) {
      // inner rule, then the band of motifs staggered along it
      const ka = ease(seg(k, .34, .78));
      const P2 = [[m2, m2], [W - m2, m2], [W - m2, H - m2], [m2, H - m2]];
      let run2 = 0; const per2 = 2 * ((W - 2 * m2) + (H - 2 * m2)), d2 = per2 * ka;
      for (let i = 0; i < 4; i++) {
        const a0 = P2[i], b0 = P2[(i + 1) % 4], L = Math.hypot(b0[0] - a0[0], b0[1] - a0[1]);
        const kk = clamp((d2 - run2) / L); run2 += L;
        if (kk > 0) inkFlat([a0, lerpP(a0, b0, kk)], 1.8, col, a, .8);
      }
      // motifs: small triangles + dots + a fish every so often, all in the band between the two rules
      const km = seg(k, .5, 1);
      const count = Math.floor(km * 64);
      for (let i = 0; i < count; i++) {
        const q = i / 64, side = Math.floor(q * 4), f = (q * 4) % 1;
        const A = P[side], B = P[(side + 1) % 4], mid = lerpP(A, B, f), c = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
        const out = [mid[0] - c[0], mid[1] - c[1]], ol = Math.hypot(out[0], out[1]) || 1;
        const nx = -out[1] / ol, ny = out[0] / ol, mx = mid[0] + out[0] / ol * 16, my = mid[1] + out[1] / ol * 16;
        boilSeed('bord' + i);
        if (i % 8 === 3) {                       // a fish, nose to the band
          const s = 13, d = [nx, ny];
          mm([[mx - d[0] * s + out[0] / ol * 5, my - d[1] * s + out[1] / ol * 5], [mx + d[0] * s, my + d[1] * s],
              [mx + d[0] * s * .4 - out[0] / ol * 9, my + d[1] * s * .4 - out[1] / ol * 9],
              [mx - d[0] * s * .4 - out[0] / ol * 9, my - d[1] * s * .4 - out[1] / ol * 9]],
            i % 16 === 3 ? C.red : null, { w: 1.6, a: a * .9, dbl: false });
        } else if (i % 2) {                      // a dot
          flatCircA(mx, my, 3.4, 3.4, col, 210 * a);
        } else {                                 // a little tooth pair
          inkFlat([[mx - nx * 11, my - ny * 11], [mx + out[0] / ol * 9, my + out[1] / ol * 9], [mx + nx * 11, my + ny * 11]], 1.5, col, a * .85, .6);
        }
      }
    }
  }

  // ================= SUN / SOOP / DIYA =================
  // The film's one motif, in its four states. All four share the same centre so a shot can morph between them.
  function sunChakra(x, y, r, o = {}) {
    const pal = o.pal || [C.red, C.verm, C.orange, C.saff];
    const k = o.k == null ? 1 : o.k, rot = o.rot || 0;
    if (r < 2) return;
    for (let i = 0; i < 4; i++) {           // concentric discs, LARGEST first: the centre ends up saffron
      const rr = r * (1 - i * .17);
      if (rr < 2) continue;
      const grow = clamp(k * 1.4 - (3 - i) * .1);
      if (grow <= 0) continue;
      flatCircA(x, y, rr * grow, rr * grow, pal[i], o.a == null ? 1 : o.a);
      inkFlat(closed(ellPts(x, y, rr * grow, rr * grow, 40)), i === 0 ? 3.2 : 1.2, INK, .85, .7);
    }
    // rays: Madhubani uses a ring of small triangles or petals, not lines
    if (o.rays !== false && r > 20) {
      const n = o.rayN || 26, kr = clamp(seg(k, .45, 1));
      for (let i = 0; i < n; i++) {
        const a0 = rot + i / n * TAU, a1 = a0 + TAU / n * .42, rr = r * 1.02, r2 = r * (o.rayLen || 1.24);
        if (i / n > kr) break;
        boilSeed('ray' + i);
        mm([[x + Math.cos(a0) * rr, y + Math.sin(a0) * rr], [x + Math.cos((a0 + a1) / 2) * r2, y + Math.sin((a0 + a1) / 2) * r2],
            [x + Math.cos(a1) * rr, y + Math.sin(a1) * rr]], C.gold, { w: 1.7, a: .85, dbl: false });
      }
    }
  }
  // The winnowing basket (soop) seen almost face-on: rim, woven interior, and whatever is in it.
  function soop(x, y, rx, ry, o = {}) {
    const rot = o.rot || 0, a = o.a == null ? 1 : o.a, c = Math.cos(rot), s = Math.sin(rot);
    const T = (px, py) => [x + px * c - py * s, y + px * s + py * c];
    const rimPts = (n, k) => Array.from({ length: n }, (_, i) => { const t = i / n * TAU; return T(Math.cos(t) * rx * k, Math.sin(t) * ry * k); });
    // the outer rim: a thick band, heaviest at the bottom, so the basket has a front edge
    const outer = rimPts(48, 1), inner = rimPts(48, .8);
    flatA(outer, mixCol(o.col || C.marigold, C.redDk, .35), a);
    inkFlat(closed(outer), 3, INK, a, .6);
    // the woven inner surface, sitting a little high: the basket is shallow
    const surf = Array.from({ length: 48 }, (_, i) => { const t = i / 48 * TAU; return T(Math.cos(t) * rx * .8, Math.sin(t) * ry * .8 - ry * .06); });
    flatA(surf, o.col || C.marigold, a);
    inkFlat(closed(surf), 2.2, INK, a * .95, .6);
    if (o.weave !== false) {       // the weave: a light grid on the inner surface, kept faint so the contents read
      clipShape(surf);
      for (let i = -8; i <= 8; i++) inkFlat([T(i / 9 * rx * .78, -ry * .8), T(i / 9 * rx * .78, ry * .8)], .9, INK, a * .22, .4);
      for (let j = -5; j <= 5; j++) { const yy = j / 6 * ry * .76; inkFlat([T(-rx * .78, yy), T(rx * .78, yy)], .9, INK, a * .2, .4); }
      clipEnd();
    }
    // the front lip: a crescent below the surface, darker, that makes the basket a bowl and not a wheel
    const lip = [];
    for (let i = 0; i <= 24; i++) { const t = i / 24 * Math.PI; lip.push(T(Math.cos(t) * rx * 1.0, Math.sin(t) * ry * 1.0)); }
    for (let i = 24; i >= 0; i--) { const t = i / 24 * Math.PI; lip.push(T(Math.cos(t) * rx * .8, Math.sin(t) * ry * .8)); }
    flatA(lip, mixCol(o.col || C.marigold, C.redDk, .55), a * .95);
    inkFlat(lip.slice(0, 25), 2.6, INK, a, .6);
    if (o.rimDots !== false) for (let i = 0; i < 34; i++) {
      const t = i / 34 * TAU, p = T(Math.cos(t) * rx * .9, Math.sin(t) * ry * .9);
      flatCircA(p[0], p[1], 2.4, 2.4, C.redDk, a * .85);
    }
  }
  // A clay diya with a two-lobed flame. `l` = flame size 0..1, `fl` = flicker seed time.
  function diya(x, y, s = 1, o = {}) {
    const l = o.l == null ? 1 : o.l, a = o.a == null ? 1 : o.a;
    if (a <= 0) return;
    const flick = o.flick == null ? 0 : Math.sin(o.flick);
    const bowl = [[x - 34 * s, y], [x - 26 * s, y + 15 * s], [x + 26 * s, y + 15 * s], [x + 34 * s, y], [x + 26 * s, y - 4 * s], [x - 26 * s, y - 4 * s]];
    mm(bowl, mixCol(C.skinDk, C.red, .45), { w: 2.4, a, dbl: false });
    inkFlat([[x - 34 * s, y], [x + 34 * s, y]], 2.2, INK, a, .7);
    pattern(bowl, 'dots', C.white, { a: a * .5, step: 12 * s, w: 1 });
    if (l > .02) {
      const h = (52 + 10 * flick) * s * l, w = (17 + 3 * flick) * s * l;
      glow(x, y - h * .55, 150 * s * l, C.saff, .85 * a);
      const fl = [[x, y - 6 * s], [x + w * .55, y - h * .35], [x + w * .28, y - h * .78], [x, y - h],
                  [x - w * .34, y - h * .72], [x - w * .5, y - h * .34]];
      mm(fl, C.orange, { w: 1.8, a, dbl: false });
      flatA(fl.map(([px, py]) => [x + (px - x) * .55, y - 6 * s + (py - (y - 6 * s)) * .62]), C.white, a * .92);
      flatCircA(x, y - h * .3, w * .17, h * .17, C.white, a * .9);
    }
  }
  // Sugarcane: a stalk with leaf nodes. Grows from `k` 0..1.
  function cane(x, y, h, k = 1, lean = 0, o = {}) {
    if (k <= .01) return;
    const hh = h * ease(k), pts = [], n = 7;
    for (let i = 0; i <= n; i++) { const f = i / n; pts.push([x + lean * f * f + Math.sin(f * 2) * 6, y - hh * f]); }
    const body = [];
    for (let i = 0; i <= n; i++) body.push([pts[i][0] - 9 + i * .8, pts[i][1]]);
    for (let i = n; i >= 0; i--) body.push([pts[i][0] + 9 - i * .8, pts[i][1]]);
    mm(body, C.greenLt, { w: 2, a: o.a == null ? 1 : o.a, dbl: false });
    for (let i = 1; i < n; i++) inkFlat([[pts[i][0] - 8, pts[i][1]], [pts[i][0] + 8, pts[i][1]]], 1.4, INK, .5, .4);
    // leaves: a blade each side at every other node
    for (let i = 2; i <= n; i += 1) {
      const p = pts[i], side = i % 2 ? 1 : -1, L = 46 * (1 - i / (n + 3));
      boilSeed('leaf' + i + x);
      const tip = [p[0] + side * L * 1.5, p[1] - L * .5], mid = [p[0] + side * L, p[1] + L * .1];
      mm([p, mid, tip, [p[0] + side * 6, p[1] + 4]], i % 3 ? C.green : C.greenLt, { w: 1.7, dbl: false });
      inkFlat([p, [p[0] + side * L * 1.1, p[1] - L * .18]], 1, INK, .35, .4);
    }
  }

  // A readable hand at (x, y) pointing along `ang`: palm, four fingers, thumb, and the wrist behind it.
  function handShape(x, y, ang, s, skin, a = 1, fingers = 'open') {
    const c = Math.cos(ang), sn = Math.sin(ang);
    const T = (px, py) => [x + px * c - py * sn, y + px * sn + py * c];
    mm([[T(-s * .5, -s * .55), T(s * .3, -s * .5), T(s * .62, -s * .18), T(s * .62, s * .2), T(s * .3, s * .5), T(-s * .5, s * .5)]], skin, { w: 1.9, a, dbl: false });
    if (fingers === 'open') for (let i = 0; i < 4; i++) {
      const oy = -s * .32 + i * s * .21, len = s * (.52 - Math.abs(i - 1.5) * .07), w = s * .085;
      const f = [T(s * .46, oy - w), T(s * .46 + len, oy - w * .8), T(s * .46 + len * 1.02, oy + w * .8), T(s * .46, oy + w)];
      mm(f, skin, { w: 1.4, a, dbl: false });
    }
    mm([T(s * .02, s * .4), T(s * .34, s * .52), T(s * .36, s * .66), T(s * .04, s * .58)], skin, { w: 1.4, a, dbl: false });   // thumb
    return T(0, 0);
  }

  // ================= FIGURES =================
  // A Madhubani figure from a small skeleton, so one rig can stand, walk, lift a soop or fold its hands. Front view:
  // big head, narrow waist, wide skirt, arms outside the silhouette, everything flat + double-outlined.
  // dir: +1 faces right, -1 faces left. h: height in px. Origin between the feet, on the ground line.
  function figure(o = {}) {
    const x = o.x || 0, y = o.y == null ? GROUND : o.y, h = o.h || 470, dir = o.dir || 1, a = o.a == null ? 1 : o.a;
    if (a <= .01) return { handL: null, handR: null };
    const u = h, walk = o.walk || 0, bob = o.bob || 0, lean = o.lean || 0;
    const skin = o.skin || C.skin, sari = o.sari || C.sari;
    const skinDk = mixCol(skin, INK, .22), hair = C.hair;
    // local (across, up) -> world. Across is mirrored by dir; lean shears the whole body; bob lifts it.
    const T = (px, py) => [x + (px * dir + lean * (1 - py)) * u, y - py * u + bob];
    // proportions (units of h)
    const hipY = .40, waistY = .50, bustY = .60, shoY = .705, neckY = .75, headY = .805, headRy = .102, headRx = .078;
    const shoL = .105, shoR = -.10;
    const headC = [.004, headY];

    // ---- legs + feet (walk is a two-pose cycle, feet flat)
    const ph = walk * TAU, kF = Math.sin(ph), kB = Math.sin(ph + Math.PI);
    const ankle = (k, side) => [side * .045 + .022 * k, .085 + Math.max(0, k) * .028];
    [[kF, 1, skin], [kB, -1, skinDk]].forEach(([k, side, col]) => {
      const ank = ankle(k, side), hip = [side * .045, hipY];
      mm(limb(T(hip[0], hip[1] + .02), T(ank[0], ank[1]), .062 * u, .042 * u, 0), col, { w: 2, a, dbl: false });
      // foot: a flat wedge pointing outward, toes drawn
      const foot = [T(ank[0] - .022, ank[1]), T(ank[0] + .055 * dir, .012), T(ank[0] + .058 * dir, -.004), T(ank[0] - .026, .004)];
      mm(foot, skinDk, { w: 1.8, a, dbl: false });
      inkFlat([T(ank[0] + .03 * dir, .03), T(ank[0] + .034 * dir, .008)], .8, INK, a * .5, .4);
      // ankle bangle
      inkFlat([T(ank[0] - .014, ank[1] + .022), T(ank[0] + .018, ank[1] + .022)], 2, C.gold, a * .9, .5);
    });

    // ---- skirt: wide trapezoid, pleats, gold hem with a lotus row
    const hem = .025, hemL = .205, hemR = -.195;
    const skirt = [T(hemR, hem), T(hemR * .72, hipY * .72), T(-.065, hipY), T(.065, hipY),
                   T(hemL * .72, hipY * .72), T(hemL, hem)];
    mm(skirt, sari, { w: 2.6, a, dbl: false });
    for (let i = -4; i <= 4; i++) { const k = i / 4; inkFlat([T(k * .062, hipY - .015), T(k * .19, hem + .012)], 1.1, mixCol(sari, INK, .45), a * .42, .5); }
    const hemB = [T(hemR, hem + .052), T(hemR - .006, hem + .004), T(0, hem - .006), T(hemL + .006, hem + .004), T(hemL, hem + .052)];
    mm(hemB, C.gold, { w: 1.9, a, dbl: false });
    for (let i = -3; i <= 3; i++) {   // little buds on the hem
      const bx = i * .052, by = hem + .028;
      inkFlat([T(bx - .012, by - .012), T(bx, by + .012)], 1.2, C.redDk, a * .8, .4);
      inkFlat([T(bx + .012, by - .012), T(bx, by + .012)], 1.2, C.redDk, a * .8, .4);
    }

    // ---- torso: fitted, with a gold necklace and the sari's border down the front
    const torso = [T(shoR - .008, shoY), T(-.052, bustY), T(-.048, waistY), T(-.062, hipY), T(.062, hipY), T(.05, waistY), T(.056, bustY), T(shoL + .008, shoY)];
    mm(torso, sari, { w: 2.4, a, dbl: false });
    // blouse: a darker band across the bust, patterned with dots
    const blouse = [T(shoR - .006, shoY - .004), T(-.05, bustY + .012), T(.055, bustY + .012), T(shoL + .01, shoY - .004)];
    mm(blouse, mixCol(sari, C.redDk, .55), { w: 1.8, a, dbl: false });
    pattern(blouse, 'dots', C.gold, { a: a * .75, step: 13, w: 1 });
    // pallu: the sari's end over the left shoulder, falling straight down that side (never across the body)
    const pallu = [T(shoL + .014, shoY + .012), T(shoL + .05, shoY - .02), T(shoL + .046, waistY), T(shoL + .006, bustY + .04)];
    mm(pallu, C.gold, { w: 1.7, a, dbl: false });
    pattern(pallu, 'lines', C.redDk, { a: a * .55, step: 8, w: .9 });
    // necklace: two arcs of gold, the one piece of jewellery that reads at this size
    for (let n = 0; n < 2; n++) {
      const rr = .045 + n * .012;
      inkFlat(Array.from({ length: 9 }, (_, i) => { const th = Math.PI * (1.12 + i / 8 * .76); return T(Math.cos(th) * rr, neckY - .02 + Math.sin(th) * rr * .8); }), 1.5, C.gold, a * .9, .4);
    }

    // ---- head
    const hx = T(headC[0], headC[1]);
    const headPts = Array.from({ length: 26 }, (_, i) => {
      const th = i / 26 * TAU;
      return [hx[0] + Math.cos(th) * headRx * u, hx[1] + Math.sin(th) * headRy * u];
    });
    mm(headPts, skin, { w: 2.3, a, dbl: false });
    // neck
    mm([T(-.026, neckY + .028), T(-.03, shoY - .006), T(.03, shoY - .006), T(.026, neckY + .028)], skin, { w: 1.9, a, dbl: false });
    // hair: a cap over the crown, coming down the sides to the jaw, with a bun at the back
    const hairPts = [];
    for (let i = 0; i <= 20; i++) { const th = Math.PI * 1.03 + i / 20 * Math.PI * .94; hairPts.push([hx[0] + Math.cos(th) * headRx * u * 1.1, hx[1] + Math.sin(th) * headRy * u * 1.12]); }
    for (let i = 20; i >= 0; i--) { const th = Math.PI * 1.03 + i / 20 * Math.PI * .94; hairPts.push([hx[0] + Math.cos(th) * headRx * u * .92, hx[1] + Math.sin(th) * headRy * u * .74 - headRy * u * .18]); }
    mm(hairPts, hair, { w: 2, a, dbl: false });
    inkFlat(Array.from({ length: 8 }, (_, i) => { const th = Math.PI * 1.15 + i / 7 * Math.PI * .7; return [hx[0] + Math.cos(th) * headRx * u * .78, hx[1] + Math.sin(th) * headRy * u * .72]; }), 1, mixCol(hair, C.white, .35), a * .3, .5);
    // bun at the back of the head, drawn low so it never reads as a horn
    const bunX = hx[0] - headRx * u * .92 * dir, bunY = hx[1] + headRy * u * .1;
    mm(ellPts(bunX, bunY, headRx * u * .3, headRy * u * .26, 16), hair, { w: 1.6, a, dbl: false });
    // earring at the lobe
    flatCircA(hx[0] + headRx * u * .66, hx[1] + headRy * u * .12, 4.2, 5.6, C.gold, a);
    inkFlat(closed(ellPts(hx[0] + headRx * u * .66, hx[1] + headRy * u * .12, 4.2, 5.6, 12)), 1.1, INK, a * .7, .4);
    // face: brow, eye, nose, lips, bindi
    const ex = hx[0] + headRx * u * .30, ey = hx[1] - headRy * u * .04, er = headRx * u * .30;
    const lid = o.eye === 'closed' ? .12 : o.eye === 'sleepy' ? .5 : .72;
    const eyeShape = [];
    for (let i = 0; i <= 10; i++) { const t = Math.PI + i / 10 * Math.PI; eyeShape.push([ex + Math.cos(t) * er, ey + Math.sin(t) * er * lid]); }
    for (let i = 0; i <= 10; i++) { const t = i / 10 * Math.PI; eyeShape.push([ex + Math.cos(t) * er, ey + Math.sin(t) * er * .42 * lid + er * .1]); }
    flatA(eyeShape, C.white, a);
    inkFlat(closed(eyeShape), 1.7, INK, a, .5);
    if (lid > .3) flatCircA(ex + er * .22, ey + er * .05, er * .2, er * .2, INK, a);
    inkFlat([[ex - er * 1.0, ey - er * .1], [ex + er * .95, ey - er * .25]], 1.6, INK, a * .8, .3);
    const browLift = o.brow || 0;
    inkFlat([[ex - er * 1.0, ey - er * 1.25 - browLift * 3], [ex + er * .05, ey - er * 1.55 - browLift * 7], [ex + er * .95, ey - er * 1.2 - browLift * 3]], 1.9, INK, a * .95, .4);
    // nose: a short hook
    inkFlat([[ex + er * .6, ey + er * .35], [ex + er * .92, ey + er * .85]], 1.2, mixCol(skin, INK, .3), a * .7, .3);
    // lips
    const sm = o.smile || 0;
    inkFlat([[hx[0] + headRx * u * .2, hx[1] + headRy * u * .55], [hx[0] + headRx * u * .4, hx[1] + headRy * u * .53 - sm * 2.2], [hx[0] + headRx * u * .56, hx[1] + headRy * u * .48 - sm * 4]], 1.8, C.redDk, a * .95, .3);
    // bindi
    flatCircA(hx[0] + headRx * u * .04, hx[1] - headRy * u * .52, 4, 4, C.red, a);
    // cheek: a warm wash, so the face has some blood in it
    if (o.blush !== false) flatCircA(hx[0] + headRx * u * .5, hx[1] + headRy * u * .3, headRx * u * .22, headRy * u * .12, mixCol(C.verm, skin, .45), a * .45);

    // ---- dupatta: a triangle over the head and both shoulders, and a long tail down the back that moves
    const sway = o.dupattaSway || 0;
    const dup = [T(headC[0] - headRx * .05, headY - headRy * 1.05), T(headC[0] + headRx * .95, headY - headRy * .35),
                 T(shoL + .035, shoY + .03), T(shoL + .07 + sway * .02, waistY - .06), T(-.175 - sway * .03, hipY - .04),
                 T(-.02, hipY + .02), T(shoR - .02, shoY + .04)];
    mm(dup, mixCol(sari, C.red, .5), { w: 2, a, dbl: false });
    pattern(dup, 'dots', C.gold, { a: a * .7, step: 14, w: 1 });
    inkFlat([T(shoL + .035, shoY + .02), T(shoL + .07 + sway * .02, waistY - .06)], 2.4, C.gold, a * .9, .5);
    inkFlat([T(-.02, hipY + .02), T(shoR - .02, shoY + .03)], 1.8, C.gold, a * .7, .4);

    // ---- arms (drawn last so the hands are in front of the sari)
    const poses = {
      stand: [[.165, .46], [.15, .40]], hold: [[.12, .50], [.075, .50]], lift: [[.19, .80], [.15, .80]],
      fold: [[.045, .60], [-.005, .60]], give: [[.20, .58], [.06, .50]], peek: [[.175, .60], [-.06, .46]],
      sleepwalk: [[-.14, .58], [-.03, .44]]
    };
    const pp = poses[o.pose] || poses.stand;
    const bow = (a, b, out) => [(a + b) / 2 + out, (shoY + .44) / 2];
    const elbowL = bow(shoL, pp[0][0], .075), elbowR = bow(shoR, pp[1][0], -.075);
    const flex = .028 * Math.sin(walk * TAU * 2 + 1);
    const armPt = (side, target, elbow) => {
      const A = T(side, shoY - .005), E = T(elbow[0], elbow[1]), B = T(target[0] + flex * (side > 0 ? 1 : -1), target[1]);
      const P = [...limb(A, E, .062 * u, .05 * u, 0), ...limb(E, B, .05 * u, .038 * u, 0).reverse()];
      mm(P, skin, { w: 2.1, a, dbl: false });
      // bangles at the wrist
      for (let b = 0; b < 2; b++) { const q = lerpP(E, B, .82 + b * .09); inkFlat([[q[0] - 7, q[1] - 3], [q[0] + 7, q[1] + 2]], 2, C.gold, a * .95, .5); }
      const ang = Math.atan2(B[1] - E[1], B[0] - E[0]);
      handShape(B[0], B[1], ang, .056 * u, skin, a, o.pose === 'fold' ? 'folded' : 'open');
      return B;
    };
    const handL = armPt(shoL, pp[0], elbowL), handR = armPt(shoR, pp[1], elbowR);
    return { handL, handR };
  }

  // ================= THE AANGAN (courtyard) =================
  // A mud-walled courtyard with painted Madhubani panels on the wall — the same wall in shots 2, 3 and 4.
  function aangan(t, o = {}) {
    const wash = o.wash || mixCol(C.paper, C.saff, .18), floor = o.floor || mixCol(C.saff, C.marigold, .45);
    flatA(rectPts(0, 0, W, H), wash, 255);
    // wall: a band of flat colour with a hand-ruled top edge, and a wavy plaster line
    const wallTop = o.wallTop == null ? 470 : o.wallTop;
    const wall = rectPts(-20, wallTop, W + 40, GROUND - wallTop, 0);
    flatA(wall, o.wall || mixCol(C.marigold, C.white, .3), 255);
    inkFlat([[0, wallTop + jit(2)], [W, wallTop + jit(2)]], 3, INK, .8, .6);
    inkFlat([[0, wallTop + 9], [W, wallTop + 9]], 1.2, INK, .4, .5);
    // painted panel on the wall: a sun and a fish, the family's two motifs
    if (o.panels !== false) {
      sunChakra(760, 690, 78, { k: 1, a: .55, pal: [C.redDk, C.red, C.verm, C.marigold], rot: .1 });
      mm([[170, 660], [300, 640], [318, 686], [292, 722], [176, 700]], C.red, { w: 2, a: .5, dbl: false });
      pattern([[170, 660], [300, 640], [318, 686], [292, 722], [176, 700]], 'scale', C.paper, { a: .5, step: 16 });
      inkFlat([[318, 686], [344, 668], [344, 706]], 2, INK, .5, .5);
    }
    // floor with its combed pattern
    flatA(rectPts(-20, GROUND, W + 40, H - GROUND + 20, 0), floor, 255);
    inkFlat([[0, GROUND + jit(1.5)], [W, GROUND + jit(1.5)]], 3.4, INK, .85, .6);
    pattern(rectPts(-20, GROUND + 6, W + 40, H - GROUND, 0), 'lines', INK, { a: .16, step: 34, w: 1 });
    return { wallTop };
  }

  // A doorway at the right: jamb, leaf, and the dark inside. Pari peeks round it in shot 2.
  function doorway(x, y, w, h, o = {}) {
    const dark = o.dark == null ? 1 : o.dark;
    const frame = [[x, y], [x + w, y], [x + w, y - h], [x, y - h]];
    flatA(frame, mixCol(C.skinDk, C.red, .25), 255);
    const inner = [[x + w * .14, y], [x + w * .86, y], [x + w * .86, y - h * .92], [x + w * .14, y - h * .92]];
    flatA(inner, C.indigo, 255);
    if (dark > 0) flatA(inner, mixCol(C.indigo, C.night, .6), 255 * dark);
    inkFlat(closed(inner), 3, INK, .9, .6);
    pattern(frame, 'dots', C.gold, { a: .5, step: 18, w: 1.2 });
    // the leaf, part-way open, with a brass ring
    const leaf = [[x + w * .16, y], [x + w * .5, y], [x + w * .5, y - h * .9], [x + w * .16, y - h * .9]];
    flatA(leaf, mixCol(C.red, C.redDk, .4), 255);
    pattern(leaf, 'lines', C.gold, { a: .45, step: 14, w: 1 });
    inkFlat(closed(leaf), 2.6, INK, .9, .6);
    for (let i = 1; i < 4; i++) inkFlat([[x + w * .16, y - h * .9 * i / 4], [x + w * .5, y - h * .9 * i / 4]], 1.4, INK, .5, .5);
    flatCircA(x + w * .46, y - h * .45, 6, 6, C.gold, 255);
    inkFlat(closed(ellPts(x + w * .46, y - h * .45, 6, 6, 16)), 1.6, INK, .9, .5);
  }

  // ================= SHOTS =================
  // Camera helper: a slow drift, so a held shot still breathes.
  function cam(x, y, z, rot = 0) { CAM = LAST_CAM = { cx: x, cy: y, zoom: z, rot }; }
  function camOff() { CAM = null; }
  const pushK = (lt, a, b, z0, z1) => lerp(z0, z1, ease(seg(lt, a, b)));

  // ---------- SHOT 1 · 0.0-4.0 · the bindu becomes the sun, the sun becomes the soop ----------
  function s01(t, lt) {
    flatA(rectPts(-20, -20, W + 40, H + 40), C.paper, 255);
    // the bindu is already there on frame 0, and the loop comes back to it
    const kBorder = ease(seg(lt, .10, 2.70));
    const cz = pushK(lt, 2.9, 4.0, 1, 1.45);
    const cx = W / 2, cy = 900 - (cz - 1) * 120;
    cam(cx, cy, cz, 0);
    // 0.00-0.55  red bindu
    const r0 = 15;                       // present from frame 0: this is the frame the last second loops back to
    if (r0 > 0) { flatCircA(cx, cy, r0, r0, C.red, 255); inkFlat(closed(ellPts(cx, cy, r0, r0, 24)), 2.4, INK, .95, .6); }
    // 0.35-1.60 the bindu grows rings and becomes a sun
    const ks = ease(seg(lt, .35, 1.55));
    if (ks > 0) sunChakra(cx, cy, 250 * ks, { k: ks, pal: [C.red, C.verm, C.orange, C.saff], rot: lt * .12, rayN: 30, rayLen: 1.26 });
    // 1.55-2.55 the sun's disc becomes the soop: the rim becomes a basket, the rays fold in
    const ksp = ease(seg(lt, 1.6, 2.55));
    if (ksp > 0) {
      soop(cx, cy, 250 * (1 - .06 * ksp), 250 * (1 - .06 * ksp) * lerp(1, .82, ksp), { rot: lt * .04, a: ksp, col: mixCol(C.marigold, C.orange, .3), weave: true });
    }
    // 2.55-4.0 the diya in the soop, lit
    const kd = seg(lt, 2.5, 3.15), kl = seg(lt, 3.0, 3.7);
    if (kd > 0) diya(cx, cy + 110, 1.5, { l: ease(kl), a: ease(kd), flick: sin(lt * 9) });
    if (kl > .2) glow(cx, cy + 30, 420 * kl, C.saff, .55 * kl);
    // drawn border, on the beat
    border(kBorder, { a: .9 });
    camOff();
    // warm flare as the flame takes the frame, into shot 2
    const kf = seg(lt, 3.55, 4.0);
    if (kf > 0) veil(.55 * ease(kf), mixCol(C.saff, C.orange, .4));
  }

  // ---------- SHOT 2 · 4.0-10.0 · the hands on the soop, then her eyes ----------
  function s02(t, lt) {
    // a shallow tilt: first the hands, then up to Gauri's face
    const kt = ease(seg(lt, .55, 3.1));
    const cx = 540, cy = lerp(1180, 1010, kt), cz = lerp(1.14, .92, kt);
    cam(cx, cy, cz, 0);
    aangan(t, {});
    // door with Pari behind it
    doorway(880, GROUND - 10, 190, 420, { dark: .6 });
    const peek = 1 - ease(seg(lt, 5.2 * 0, 9, 0)) * 0;      // stays peeking
    // Gauri (left) and Maa (right) hold the soop's rim between them; Maa's other hand comes over Gauri's
    const gs = { x: 380, y: GROUND, h: 470, dir: 1, pose: 'hold', eye: 'nervous', brow: -.35, dupattaSway: Math.sin(t * 1.3) * .3 };
    figure(gs);
    figure({ x: 700, y: GROUND, h: 520, dir: -1, pose: 'hold', eye: 'calm', smile: .5, brow: .1, sari: C.red, dupattaSway: Math.sin(t * 1.1 + 1) * .25 });
    // the soop between them, empty, its rim on the two hands
    const sx = 540 + Math.sin(t * .9) * 1.5, sy = GROUND - 268;
    soop(sx, sy, 108, 74, { rot: -.05, col: C.marigold, a: 1 });
    // Maa's hand on Gauri's: a single drawn gesture, then the fingers relax
    const kh = ease(seg(lt, .45, 1.25));
    if (kh > 0) {
      const hx0 = lerp(300, 596, kh), hy0 = lerp(1120, 1218, kh);
      const ka = 1 - .15 * ease(seg(lt, 2.4, 3.4));
      mm(limb([hx0 - 110, hy0 + 40], [hx0 - 20, hy0], 40, 32, 0), C.skin, { w: 2.2, a: ka, dbl: false });
      handShape(hx0, hy0, .1, 46, C.skin, ka);
    }
    // diya on the wall niche, flickering, and the dupatta's corner moving
    diya(160, 900, .7, { l: .8, flick: sin(t * 7.3) });
    camOff();
    const fade = seg(lt, 0, .28);            // in from the flare of shot 1
    if (fade < 1) veil(.8 * (1 - fade), mixCol(C.saff, C.orange, .4));
  }

  // ---------- SHOT 3 · 10.0-18.0 · the soop fills, one phrase at a time ----------
  function s03(t, lt) {
    const cz = lerp(1.12, 1.2, ease(seg(lt, 0, 8)));
    cam(540, 980, cz, 0);
    // a close wall behind: warm, with a painted border running across it
    bgFill(mixCol(C.marigold, C.white, .3));
    flatA(rectPts(-30, -30, W + 60, 1180), mixCol(C.marigold, C.white, .34), 255);
    // a painted band across the top of the wall: two rules and a row of fish, the family's motif
    const bandY = 90;
    flatA(rectPts(-30, bandY - 74, W + 60, 118), mixCol(C.verm, C.white, .45), .9);
    inkFlat([[-20, bandY + 44], [W + 20, bandY + 40]], 2.2, INK, .55, .5);
    for (let i = 0; i < 9; i++) {
      const bx = 40 + i * 120, by = bandY + 6, fw = 34, fh = 15;
      mm([[bx - fw, by], [bx, by - fh], [bx + fw * .55, by], [bx, by + fh * .8]], i % 2 ? C.redDk : C.green, { w: 1.6, a: .85, dbl: false });
      inkFlat([[bx - fw, by], [bx - fw - 12, by - 9], [bx - fw - 12, by + 9]], 1.5, INK, .7, .4);
    }
    inkFlat([[-20, 300], [W + 20, 292]], 2, INK, .35, .5);
    inkFlat([[-20, 1080], [W + 20, 1072]], 3, INK, .7, .5);
    flatA(rectPts(-30, 1080, W + 60, H - 1080), mixCol(C.saff, C.marigold, .4), 255);
    pattern(rectPts(-30, 1080, W + 60, H - 1080, 0), 'lines', INK, { a: .14, step: 30, w: 1 });
    // the cane arch grows up both sides over the eight seconds (behind everything)
    const kc0 = seg(lt, .2, 7.2);
    cane(60, 1580, 1240, clamp(kc0 * 1.15), 90, {});
    cane(1020, 1600, 1240, clamp(kc0 * 1.15 - .06), -100, {});
    // a low stool with a red cloth, and the soop resting on it (a basket in the air reads as a wheel)
    const sx = 540, sy = 1080, rx = 292, ry = 205;
    // a low wooden stool with a red cloth over it: the basket sits on something, and has weight
    mm([[sx - 300, sy + 150], [sx + 300, sy + 150], [sx + 262, sy + 232], [sx - 262, sy + 232]], mixCol(C.redDk, INK, .25), { w: 2.4, a: .95, dbl: false });
    pattern([[sx - 300, sy + 150], [sx + 300, sy + 150], [sx + 262, sy + 232], [sx - 262, sy + 232]], 'dots', C.gold, { a: .55, step: 22, w: 1.1 });
    for (const lx of [-230, 230]) { mm([[sx + lx - 22, sy + 232], [sx + lx + 22, sy + 232], [sx + lx + 16, sy + 400], [sx + lx - 16, sy + 400]], mixCol(C.redDk, INK, .45), { w: 2, a: .95, dbl: false }); }
    // marigold garland strung across the top of the frame (the space over the basket is the poem's sky)
    for (let i = 0; i < 16; i++) {
      const gx = -20 + i * 74, gy = 250 + Math.sin(i * .9) * 46 + 190;
      for (let q = 0; q < 5; q++) { const a2 = q / 5 * TAU; flatCircA(gx + Math.cos(a2) * 13, gy + Math.sin(a2) * 13, 10, 10, q % 2 ? C.marigold : C.orange, 1); }
      flatCircA(gx, gy, 7, 7, C.redDk, 1);
      if (i < 15) inkFlat([[gx, gy], [gx + 74, 250 + Math.sin((i + 1) * .9) * 46 + 190]], 2, C.green, .8, .4);
    }
    soop(sx, sy, rx, ry, { rot: -.03, col: C.marigold });

    // six offerings, one per phrase, each placed with a settle
    const items = [
      { t: .5, f: 'thekua' }, { t: 1.7, f: 'banana' }, { t: 2.9, f: 'coconut' },
      { t: 4.1, f: 'fruit' }, { t: 5.3, f: 'flowers' }, { t: 6.5, f: 'cane' }
    ];
    const slots = [[-172, -26], [-52, 44], [86, 40], [-118, 104], [44, -74], [152, 6]];
    items.forEach((it, i) => {
      const k = seg(lt, it.t, it.t + .55);
      if (k <= 0) return;
      const [ox, oy] = slots[i], p = [sx + ox, sy + oy], s = spring(lt, it.t + .4, 7, 20);
      boilSeed('item' + i);
      if (it.f === 'thekua') {   // the sweet: a round ridged disc
        flatCircA(p[0], p[1], 54 * (1 + s * .04), 40 * (1 + s * .04), mixCol(C.saff, C.white, .3), 255);
        inkFlat(closed(ellPts(p[0], p[1], 54, 40, 26)), 2.2, INK, .9, .6);
        for (let r = 1; r < 4; r++) inkFlat(closed(ellPts(p[0], p[1], 54 * r / 4, 40 * r / 4, 20)), 1.2, mixCol(C.red, C.INK || C.ink, .3), .55, .5);
        for (let r = 0; r < 12; r++) { const th = r / 12 * TAU; flatCircA(p[0] + Math.cos(th) * 36, p[1] + Math.sin(th) * 26, 3, 3, C.red, 210); }
      } else if (it.f === 'banana') {  // a bunch, three fingers
        for (let b = 0; b < 3; b++) {
          const q = [p[0] - 34 + b * 30, p[1] - 4 + b * 6];
          mm(limb([q[0] - 12, q[1] - 44], [q[0] + 14, q[1] + 40], 26, 16, -10), C.marigold, { w: 2, dbl: false });
          inkFlat([[q[0] - 4, q[1] - 40], [q[0] + 6, q[1] + 34]], 1, INK, .3, .4);
        }
      } else if (it.f === 'coconut') { // a whole coconut with its three eyes, and a tuft
        flatCircA(p[0], p[1], 52, 52, mixCol(C.skinDk, C.red, .35), 255);
        inkFlat(closed(ellPts(p[0], p[1], 52, 52, 26)), 2.4, INK, .9, .6);
        pattern(ellPts(p[0], p[1], 52, 52, 20), 'scale', C.ink, { a: .3, step: 20 });
        for (let e = 0; e < 3; e++) flatCircA(p[0] + Math.cos(e * 2.2) * 16, p[1] + Math.sin(e * 2.2) * 16, 5, 5, INK, 220);
        for (let e = 0; e < 5; e++) inkFlat([[p[0], p[1] - 50], [p[0] - 30 + e * 16, p[1] - 92 - (e % 2) * 12]], 2, C.green, .8, .4);
      } else if (it.f === 'fruit') {   // a pair of guavas / ber
        for (let b = 0; b < 2; b++) {
          const q = [p[0] + (b ? 30 : -28), p[1] + (b ? 10 : -6)];
          flatCircA(q[0], q[1], 34, 30, mixCol(C.greenLt, C.saff, .35), 255);
          inkFlat(closed(ellPts(q[0], q[1], 34, 30, 20)), 2.2, INK, .9, .6);
          inkFlat([[q[0], q[1] - 30], [q[0] + 10, q[1] - 44]], 2, C.green, .9, .4);
        }
      } else if (it.f === 'flowers') { // a marigold garland: a ring of small flowers
        for (let b = 0; b < 9; b++) {
          const th = b / 9 * TAU, q = [p[0] + Math.cos(th) * 52, p[1] + Math.sin(th) * 30];
          for (let q2 = 0; q2 < 6; q2++) { const a2 = q2 / 6 * TAU; flatCircA(q[0] + Math.cos(a2) * 9, q[1] + Math.sin(a2) * 9, 7, 7, C.marigold, 255); }
          flatCircA(q[0], q[1], 5, 5, C.orange, 255);
        }
      } else {                          // a piece of cane, cut, standing in the basket
        mm(limb([p[0] - 8, p[1] + 90], [p[0] + 6, p[1] - 90], 30, 24, 0), C.greenLt, { w: 2, dbl: false });
        for (let r = 0; r < 5; r++) inkFlat([[p[0] - 14, p[1] + 60 - r * 36], [p[0] + 16, p[1] + 60 - r * 36]], 1.4, INK, .45, .4);
      }
    });
    // hands entering to place each thing, then Pari's crooked flower and Maa's correction
    // A hand reaching in from the edge of frame (side: -1 the left, +1 the right), placing an offering.
    const handAt = (t0, side, x1, y1, col = C.skin, sleeve = C.sari) => {
      const k = seg(lt, t0, t0 + .55), k2 = seg(lt, t0 + .95, t0 + 1.6);
      const u = ease(k) * (1 - ease(k2));
      if (u <= .01) return;
      const from = [side < 0 ? -70 : W + 70, y1 + 300];
      const wrist = [lerp(from[0], x1, ease(k)), lerp(from[1], y1, ease(k)) - Math.sin(ease(k) * Math.PI) * 26];
      const elbow = [(from[0] + wrist[0]) / 2 + side * -30, Math.max(wrist[1] + 120, (from[1] + wrist[1]) / 2)];
      mm(limb(from, elbow, 66, 54, 0), sleeve, { w: 2.1, a: u, dbl: false });
      mm(limb(elbow, wrist, 54, 44, 0), sleeve, { w: 2.1, a: u, dbl: false });
      inkFlat([[wrist[0] - 20, wrist[1] + 34], [wrist[0] + 20, wrist[1] + 30]], 3.4, C.gold, u * .9, .5);
      handShape(wrist[0], wrist[1], Math.atan2(y1 - wrist[1], x1 - wrist[0]), 42, col, u);
    };
    if (!window.NOHAND) handAt(.5, 250, 1620, 400, 1180);            // Maa places the thekua
    handAt(1.7, 880, 1640, 630, 1200);           // bananas, from the other side
    handAt(2.9, 240, 1660, 470, 1150);           // coconut
    handAt(4.1, 900, 1620, 620, 1230);           // fruit
    // Pari: a small hand coming in from the right, putting a flower slightly wrong, then Maa's hand
    handAt(5.3, 1, 700, 1200, C.skinLt, C.green);   // Pari puts a flower in, slightly crooked
    if (seg(lt, 5.3, 5.9) > 0 && seg(lt, 6.6, 7.2) < 1) {   // her marigold, sitting crooked where she left it
      const px = 700, py = 1200;
      for (let q = 0; q < 6; q++) { const a2 = q / 6 * TAU; flatCircA(px - 8 + Math.cos(a2) * 9, py + 14 + Math.sin(a2) * 9, 8, 8, C.marigold, 1); }
      flatCircA(px - 8, py + 14, 5, 5, C.orange, 1);
    }
    // Maa's correcting hand, nudging the flower straight (6.6-7.6)
    const kc2 = seg(lt, 6.7, 7.4);
    if (kc2 > 0) {
      const u = ease(seg(lt, 6.7, 7.1)) * (1 - ease(seg(lt, 7.5, 8))), px = 660, py = 1150;
      if (u > .02) { mm(limb([px + 120, py + 360], [px + 16, py + 90], 56, 40, 0), C.sari, { w: 2.2, a: u, dbl: false }); handShape(px, py + 46, Math.PI / 2, 40, C.skin, u); }
    }
    camOff();
  }

  // ---------- SHOT 4 · 18.0-26.0 · out of the aangan, the procession ----------
  function s04(t, lt) {
    // first a close on the soop in her hands, then the camera slides right and the walk begins
    const kPan = ease(seg(lt, 1.4, 3.0));
    const cx = lerp(470, 700, kPan), cz = lerp(1.3, 1.14, kPan);
    const walkK = seg(lt, 2.6, 8.0);
    cam(cx, lerp(1330, 1180, kPan), cz, 0);
    // sky and ground scroll slower than the walkers (parallax), the wall a little faster
    const sc = walkK * 900;
    bgFill(mixCol(C.saff, C.marigold, .45));                                            // the floor, under everything
    flatA(rectPts(-30, -30, W + 160, 1120), mixCol(C.marigold, C.white, .5), 255);      // sky
    flatA(rectPts(-30, 1080, W + 160, 470), mixCol(C.greenLt, C.marigold, .55), 255);   // the far field
    inkFlat([[-20, 1082], [W + 20, 1080]], 2, INK, .45, .4);
    // distant trees: flat Madhubani canopies, patterned
    for (let i = -2; i < 6; i++) {            // a far row, smaller and paler
      const bx = 40 + i * 260 - sc * .14, by = 1130, hs = .5 + hash(i * 5 + 1) * .3;
      const c2 = [[bx - 100 * hs, by], [bx - 50 * hs, by - 96 * hs], [bx - 6 * hs, by - 52 * hs], [bx + 40 * hs, by - 104 * hs], [bx + 100 * hs, by]];
      mm(c2, mixCol(C.green, C.marigold, .35), { w: 1.8, a: .55, dbl: false });

    }
    for (let i = -1; i < 5; i++) {
      const bx = 120 + i * 330 - sc * .22, by = 1180, hs = .8 + hash(i * 13 + 5) * .55, wob = (hash(i + 3) - .5) * 40;
      const canopy = [[bx - 120 * hs, by], [bx - 70 * hs, by - 110 * hs], [bx - 20 * hs, by - 62 * hs], [bx + 30 * hs, by - 128 * hs],
                      [bx + 92 * hs, by - 58 * hs], [bx + 124 * hs, by]];
      mm(canopy, mixCol(C.green, C.greenLt, hash(i + 9) * .5), { w: 2.2, a: .88, dbl: false });
      pattern(canopy, 'scale', C.greenLt, { a: .4, step: 20 });
      mm([[bx + wob * .3 - 15, by + 4], [bx + wob * .3 + 15, by + 4], [bx + wob * .3 + 9, by - 70], [bx + wob * .3 - 9, by - 70]], mixCol(C.green, INK, .55), { w: 1.8, a: .9, dbl: false });
    }
    // the house they leave: wall, door, a painted fish over the door
    const hx = -120 - sc * .45;
    flatA(rectPts(hx - 300, 900, 620, GROUND - 900 + 6), mixCol(C.saff, C.white, .32), 255);
    inkFlat([[hx - 300, 900], [hx + 320, 900]], 3, INK, .8, .5);
    pattern(rectPts(hx - 300, 900, 620, GROUND - 900, 0), 'dots', C.red, { a: .28, step: 40 });
    doorway(hx + 90, GROUND - 6, 150, 300, { dark: .35 });
    mm([[hx - 240, 760], [hx - 120, 730], [hx - 90, 776], [hx - 130, 810], [hx - 236, 798]], C.red, { w: 2, a: .7, dbl: false });
    // the path: a band of floor with combed lines, scrolling
    flatA(rectPts(-30, GROUND, W + 60, H - GROUND + 60), mixCol(C.saff, C.marigold, .45), 255);

    inkFlat([[-20, GROUND], [W + 20, GROUND]], 3.2, INK, .85, .5);
    for (let i = -1; i < 8; i++) {
      const px = i * 200 - (sc * .8) % 200;
      inkFlat([[px, GROUND + 40], [px + 90, H + 20]], 1.2, INK, .18, .4);
      inkFlat([[px + 40, GROUND + 40], [px + 150, H + 20]], 1.2, INK, .12, .4);
    }
    // the three of them walking: Maa (daura on her head), Gauri (soop), Pari (flower)
    const bob = Math.sin(walkK * 26) * 3;
    const maaX = 560 - walkK * 60, gauX = 300 - walkK * 60, parX = 150 - walkK * 60;
    const gwalk = (walkK * 3.4) % 1;
    figure({ x: maaX, y: GROUND, h: 520, dir: -1, pose: 'stand', walk: gwalk, bob: bob * .6, eye: 'calm', smile: .45, sari: C.red, dupattaSway: Math.sin(t * 3) * .4 });
    // daura: a wide basket on her head, patterned
    const dY = GROUND - 520 * .965 + bob * .6;
    mm([[maaX - 82, dY], [maaX + 82, dY], [maaX + 60, dY - 60], [maaX - 60, dY - 60]], mixCol(C.marigold, C.skinDk, .3), { w: 2.4, dbl: false });
    pattern([[maaX - 82, dY], [maaX + 82, dY], [maaX + 60, dY - 60], [maaX - 60, dY - 60]], 'cross', C.redDk, { a: .6, step: 15 });
    soop(maaX, dY + 2, 84, 16, { rot: 0, col: C.gold, weave: false, rimDots: true });
    figure({ x: gauX, y: GROUND, h: 470, dir: -1, pose: 'hold', walk: gwalk, bob: bob, eye: 'calm', smile: .3, brow: -.1, dupattaSway: Math.sin(t * 2.8 + 1) * .35 });
    // the soop in her hands, carried at the waist
    const soopY = GROUND - 300 + bob, soopX = gauX - 40;
    soop(soopX, soopY, 118, 78, { rot: -.1, col: C.marigold });
    for (let i = 0; i < 5; i++) { const th = i / 5 * TAU; flatCircA(soopX + Math.cos(th) * 62, soopY - 10 + Math.sin(th) * 26, 16, 12, i % 2 ? C.saff : C.orange, 255); }
    figure({ x: parX, y: GROUND, h: 300, dir: -1, pose: 'stand', walk: (gwalk + .35) % 1, bob: bob * 1.3, eye: 'calm', smile: .7, sari: C.green, flower: true, flowerS: 15, dupattaSway: Math.sin(t * 3.4) * .5 });
    camOff();
    // into the ghat: a warm wipe on the last half second
    const kw = seg(lt, 7.55, 8);
    if (kw > 0) veil(ease(kw) * .8, C.orange);
  }

  // ---------- SHOT 5 · 26.0-34.0 · arriving at the ghat, evening ----------
  // The ghat. One layout for shots 5, 6, 7 and 9 so the evening and the morning are the same place:
  // sky bands -> horizon -> bank (with steps) -> water. Water line at WATER_Y; the bank is where people stand.
  const WATER_Y = 1290;
  function ghatBg(kSky, kSun, sunY, o = {}) {
    const night = mixCol(C.indigo, C.violet, .35);
    // sky: flat bands, Madhubani-style, warming or cooling with kSky
    const bands = [mixCol(C.marigold, C.white, .5), mixCol(C.saff, C.orange, .25), mixCol(C.orange, C.verm, .3), mixCol(C.verm, C.red, .35)];
    for (let i = 0; i < 4; i++) {
      const col = mixCol(bands[i], night, kSky);
      flatA(rectPts(-30, -30 + i * 260, W + 60, 272), col, 255);
    }
    // horizon: a thin band of distant water/haze
    flatA(rectPts(-30, 1010, W + 60, 24), mixCol(C.gold, night, kSky * .8), 255);
    // the sun, with its ray ring
    if (sunY < 1120 && kSun > 0) sunChakra(540, sunY, 118, { k: kSun, pal: [C.red, C.verm, C.orange, C.saff], rot: (o.t || 0) * .07, rayN: 24, a: 1 });
    // the bank: sand, a patterned retaining edge, steps down to the water on the left
    const bankTop = 1000, bankCol = mixCol(mixCol(C.saff, C.white, .25), night, kSky * .7);
    flatA(rectPts(-30, bankTop, W + 60, WATER_Y - bankTop + 10), bankCol, 255);
    inkFlat([[-20, bankTop + 2], [W + 20, bankTop + 2]], 2.4, INK, .5, .5);
    pattern(rectPts(-40, bankTop + 10, W + 80, WATER_Y - bankTop, 0), 'lines', INK, { a: .1, step: 26, w: 1 });
    // steps at the left: four treads going into the water
    for (let i = 0; i < 4; i++) {
      const y0 = WATER_Y - 96 + i * 26, x0 = 60 + i * 16, x1 = 460 - i * 10;
      inkFlat([[x0, y0], [x1, y0]], 2.2, INK, .55, .5);
      flatA(rectPts(x0, y0, x1 - x0, 26), mixCol(bankCol, C.white, .12), 255);
    }
    // a low retaining edge with a row of gold studs
    const edge = [[-30, WATER_Y], [W + 30, WATER_Y - 6], [W + 30, WATER_Y + 16], [-30, WATER_Y + 22]];
    flatA(edge, mixCol(C.skinDk, C.red, .3), 255);
    inkFlat([[-20, WATER_Y], [W + 20, WATER_Y - 6]], 2.6, INK, .85, .5);
    for (let i = 0; i < 16; i++) flatCircA(30 + i * 66, WATER_Y + 6, 3, 3, C.gold, .8);
    // water
    flatA(rectPts(-30, WATER_Y + 14, W + 60, H - WATER_Y + 30), mixCol(mixCol(C.water, C.indigo, .35), night, kSky), 255);
    for (let i = 0; i < 26; i++) {
      const y = WATER_Y + 34 + i * 26;
      if (y > H + 20) break;
      const pts = [];
      for (let x = -40; x < W + 60; x += 70) pts.push([x, y + Math.sin(x * .011 + (o.scroll || 0) * (1 + i * .1) + i) * 4]);
      inkFlat(pts, 1.2 + (i > 16 ? .5 : 0), i % 6 === 3 ? mixCol(C.saff, C.water, .45) : mixCol(C.waterLt, C.white, .16), .3 + (i % 4) * .05, .5);
    }
    // the sun's broken reflection
    for (let i = 0; i < 13; i++) {
      const y = WATER_Y + 26 + i * 44, w2 = 110 - i * 7 + Math.sin((o.scroll || 0) * 2 + i) * 12;
      if (w2 < 6) continue;
      inkFlat([[540 - w2, y], [540 + w2, y]], 3.2 - i * .18, mixCol(C.saff, C.white, .3), .5 - i * .028, .5);
    }
    // three little diyas floating at the water's edge, lit
    [[190, WATER_Y + 40, .9], [330, WATER_Y + 66, .7], [700, WATER_Y + 52, .8]].forEach(([dx, dy, sc], i) => {
      diya(dx, dy, sc, { l: .8 + .2 * Math.sin((o.t || 0) * 6 + i * 2), flick: Math.sin((o.t || 0) * 8 + i) });
      glow(dx, dy - 30, 110, C.saff, .45);
    });
    return WATER_Y;
  }
  // A distant crowd on the bank: flat heads-and-shoulders, patterned, never detailed.
  function crowd(n, y, sd = 1) {
    for (let i = 0; i < n; i++) {
      const x = 560 + i * 62 * sd + (hash(i * 7 + 3) - .5) * 30, sc = .8 + hash(i + 11) * .5;
      const P = [...ellPts(x, y - 62 * sc, 13 * sc, 15 * sc, 14), [x - 18 * sc, y], [x + 18 * sc, y]];
      mm(P, mixCol(C.indigo, C.red, .3), { w: 1.6, a: .85, dbl: false });
      pattern(P, 'dots', C.gold, { a: .35, step: 11, w: .8 });
    }
  }
  function s05(t, lt) {
    const kSky = ease(seg(lt, 0, 7.4)) * .5, sunY = lerp(840, 980, ease(seg(lt, 0, 8)));
    cam(540 + Math.sin(lt * .3) * 5, 1080, 1, 0);
    ghatBg(kSky, 1, sunY, { scroll: lt * .8, t });
    crowd(5, 1000);
    // the three arrive along the bank from the left and stop by the steps
    const kIn = ease(seg(lt, .8, 6.2)), walkK = (lt * 1.6) % 1;
    const bx = lerp(-180, 150, kIn), base = 1180;
    figure({ x: bx + 250, y: base, h: 300, dir: 1, pose: 'stand', walk: walkK, eye: 'calm', smile: .6, sari: C.red });
    figure({ x: bx + 96, y: base + 4, h: 268, dir: 1, pose: 'hold', walk: walkK, eye: 'calm', smile: .3, sari: C.sari });
    soop(bx + 62, base + 4 - 178, 74, 50, { col: C.marigold, rot: -.08 });
    figure({ x: bx - 4, y: base, h: 176, dir: 1, pose: 'stand', walk: (walkK + .4) % 1, eye: 'calm', smile: .7, sari: C.green, flower: true, flowerS: 10 });
    camOff();
    const fade = seg(lt, 0, .55);
    if (fade < 1) veil(.85 * (1 - fade), C.orange);
  }

  // ---------- SHOT 6 · 34.0-46.0 · the arghya: the film's held breath ----------
  function s06(t, lt) {
    // nearly locked: a 4% drift over twelve seconds, and the sun sinking a hand's width
    const z = lerp(1.34, 1.28, ease(seg(lt, 0, 12)));
    cam(520, 1120, z, 0);
    const kSky = lerp(.28, .5, ease(seg(lt, 0, 12))), sunY = lerp(940, 985, seg(lt, 0, 12));
    ghatBg(kSky, 1, sunY, { scroll: lt * .5, t });
    // Gauri in the water at the steps: only her upper body shows; the water line is the story
    const gx = 420;
    figure({ x: gx, y: WATER_Y + 120, h: 470, dir: 1, pose: 'lift', eye: 'calm', smile: .55, brow: .2, dupattaSway: Math.sin(t * 1.2) * .3 });
    // her reflection, faint, under the water line
    // the soop lifted high, the sun's circle behind it
    const soopY = WATER_Y + 120 - 470 * 1.14, soopX = gx + 96;
    sunChakra(soopX + 18, soopY - 4, 116, { k: 1, pal: [C.red, C.verm, C.orange, C.saff], rot: lt * .09, rayN: 20, a: .8 });
    soop(soopX, soopY - 6, 104, 74, { rot: -.05, col: C.marigold });
    for (let i = 0; i < 7; i++) { const th = i / 7 * TAU; flatCircA(soopX + Math.cos(th) * 54, soopY - 18 + Math.sin(th) * 26, 15, 11, i % 2 ? C.saff : C.orange, 1); }
    diya(soopX, soopY - 50, .8, { l: .9, flick: Math.sin(t * 7.2) });
    // the water crosses her waist (so she reads as standing IN the river, not on it)
    flatA(rectPts(-30, WATER_Y + 96, W + 60, H - WATER_Y), mixCol(C.water, C.indigo, .45), 252);
    // ripples where the river meets her
    for (let i = 0; i < 4; i++) {
      const k = seg(lt, i * .9, i * .9 + 3.6);
      if (k <= 0 || k >= 1) continue;
      inkFlat(closed(ellPts(gx + 60, WATER_Y + 100, lerp(40, 300, ease(k)) * 1.2, lerp(8, 62, ease(k)), 40)), 1.8, mixCol(C.saff, C.white, .3), (1 - k) * .5, .5);
    }
    // Maa and Pari on the bank, hands folded, small against the river
    figure({ x: 800, y: 1216, h: 330, dir: -1, pose: 'fold', eye: 'closed', smile: .5, sari: C.red, dupattaSway: Math.sin(t * 1.1) * .25 });
    figure({ x: 930, y: 1214, h: 210, dir: -1, pose: 'fold', eye: 'closed', smile: .7, sari: C.green, flower: true, flowerS: 11 });
    // a fish and a lotus in the foreground water
    const fishX = 210 + Math.sin(lt * .45) * 26;
    mm([[fishX - 54, 1560], [fishX + 16, 1534], [fishX + 34, 1560], [fishX + 16, 1586]], mixCol(C.saff, C.white, .25), { w: 2, a: .8, dbl: false });
    inkFlat([[fishX - 54, 1560], [fishX - 78, 1544], [fishX - 78, 1576]], 2, INK, .6, .5);
    flatCircA(fishX + 4, 1554, 3.5, 3.5, INK, .8);
    camOff();
    const fade = seg(lt, 0, .7);
    if (fade < 1) veil(.6 * (1 - fade), C.orange);
  }

  // ---------- SHOT 7 · 46.0-52.0 · the sun goes down, and comes back as a flame ----------
  function s07(t, lt) {
    // 46-48.6: the last of the sun on the water, sinking into it
    const kDown = ease(seg(lt, 0, 2.5));
    if (lt < 2.9) {
      cam(540, 1080, 1, 0);
      const kSky = lerp(.45, .95, kDown), sunY = lerp(960, 1240, kDown);
      ghatBg(kSky, 1, sunY, { scroll: lt, t });
      // the sun goes under the water line: draw the river over it again so the disc is cut cleanly
      flatA(rectPts(-30, WATER_Y + 14, W + 60, H - WATER_Y), mixCol(mixCol(C.water, C.indigo, .5), C.indigo, kDown * .5), 240);
      for (let i = 0; i < 10; i++) { const y = WATER_Y + 30 + i * 48, w2 = 100 - i * 8; if (w2 < 8) continue; inkFlat([[540 - w2, y], [540 + w2, y]], 3 - i * .2, mixCol(C.saff, C.white, .2), .4 - i * .03, .5); }
      camOff();
      if (lt > 2.3) veil(ease(seg(lt, 2.3, 2.9)) * .9, C.redDk);   // match cut: red disc -> red flame
      return;
    }
    // 48.4-52: night. one diya, stars in a Madhubani grid, the river under it
    const kk = seg(lt, 2.9, 3.6);
    cam(540, 1150, lerp(1.45, 1.08, ease(kk)), 0);
    bgFill(mixCol(C.night, C.indigo, .3));
    // a horizon band and the dark water
    flatA(rectPts(-30, 1080, W + 60, H - 1080), mixCol(C.water, C.night, .7), 255);
    inkFlat([[-20, 1080], [W + 20, 1078]], 2, INK, .5, .5);
    for (let r = 0; r < 8; r++) for (let c = 0; c < 6; c++) {
      const i = r * 6 + c, k = clamp((lt - 3.1 - i * .05) * 3);
      if (k <= 0) continue;
      const sx = 90 + c * 180 + (r % 2 ? 90 : 0), sy = 180 + r * 118;
      boilSeed('star' + i);
      const s = 8 * ease(k);
      inkFlat([[sx, sy - s], [sx + s * .3, sy - s * .3], [sx + s, sy], [sx + s * .3, sy + s * .3], [sx, sy + s], [sx - s * .3, sy + s * .3], [sx - s, sy], [sx - s * .3, sy - s * .3], [sx, sy - s]], 1.3, mixCol(C.marigold, C.white, .4), .8 * k, .6);
    }
    // the diya on the bank, now the only light in the frame
    diya(540, 1240, 2.0, { l: 1, flick: Math.sin(t * 6.4) });
    glow(540, 1160, 560, C.saff, .45);
    glow(540, 1200, 300, C.orange, .35);
    for (let i = 0; i < 12; i++) {
      const y = 1300 + i * 34, w2 = 44 - i * 2.2 + Math.sin(t * 3 + i) * 7;
      if (w2 < 4) continue;
      inkFlat([[540 - w2, y], [540 + w2, y]], 2.8 - i * .1, C.saff, .45 - i * .03, .5);
    }
    camOff();
    if (lt < 3.2) veil(1 - seg(lt, 2.9, 3.2), C.redDk);
  }

  // ---------- SHOT 8 · 52.0-60.0 · pre-dawn, the same walk again ----------
  function s08(t, lt) {
    // same composition as shot 4 — same figures, same spacing — so dusk and dawn rhyme
    const walkK = seg(lt, 0, 8.0);
    cam(680 - walkK * 30, 1170, 1.12, 0);
    const sc = walkK * 900;
    const dawn = ease(seg(lt, 0, 7.4));
    const skyTop = mixCol(C.night, C.violet, dawn * .9), skyLow = mixCol(C.violet, C.verm, .2 + dawn * .6);
    bgFill(skyTop);
    flatA(rectPts(-30, -30, W + 60, 620), skyTop, 255);
    flatA(rectPts(-30, 560, W + 60, 460), mixCol(skyTop, skyLow, .6), 255);
    flatA(rectPts(-30, 980, W + 60, 100), skyLow, 255);
    for (let i = 0; i < 24; i++) {
      const k = clamp(1 - dawn * 1.25 - i * .02);
      if (k <= 0) continue;
      flatCircA(60 + (i * 139) % 960, 120 + (i * 83) % 560, 2.4, 2.4, C.white, .8 * k);
    }
    // trees, dark, same canopy shapes as shot 4
    for (let i = -1; i < 5; i++) {
      const bx = 120 + i * 330 - sc * .22, by = 1000;
      const canopy = [[bx - 120, by], [bx - 60, by - 130], [bx, by - 70], [bx + 60, by - 140], [bx + 120, by]];
      mm(canopy, mixCol(C.green, C.night, .6), { w: 2.2, a: .95, dbl: false });
      pattern(canopy, 'scale', mixCol(C.greenLt, C.night, .4), { a: .35, step: 20 });
      inkFlat([[bx, by], [bx + 6, by + 130]], 6, mixCol(INK, C.night, .4), .8, .5);
    }
    // the house, with its lit doorway
    const hx = -160 - sc * .45;
    flatA(rectPts(hx - 300, 930, 620, GROUND - 930 + 6), mixCol(C.saff, C.night, .55), 255);
    inkFlat([[hx - 300, 970], [hx + 320, 970]], 3, INK, .6, .5);
    pattern(rectPts(hx - 300, 970, 620, GROUND - 970, 0), 'dots', C.redDk, { a: .25, step: 40 });
    doorway(hx + 90, GROUND - 6, 150, 300, { dark: .2 });
    // a low wall behind the walkers, on the far side of the path
    flatA(rectPts(-40, GROUND - 168, W + 80, 128), mixCol(mixCol(C.marigold, C.white, .3), C.night, .55), 255);
    inkFlat([[-30, GROUND - 170], [W + 30, GROUND - 172]], 2.6, INK, .5, .5);
    pattern(rectPts(-40, GROUND - 168, W + 80, 128, 0), 'scale', mixCol(C.redDk, C.violet, .55), { a: .35, step: 24 });
    // the path (the ground already runs to the bottom of the frame)
    flatA(rectPts(-60, GROUND, W + 120, 1500), mixCol(C.saff, C.violet, .38), 255);
    inkFlat([[-20, GROUND], [W + 20, GROUND]], 3, INK, .75, .5);
    for (let i = -1; i < 9; i++) {
      const px = i * 200 - (sc * .8) % 200;
      inkFlat([[px, GROUND + 40], [px + 90, H + 20]], 1.2, INK, .16, .4);
    }
    // the three, walking to the ghat again; Pari half asleep, still holding Maa's hand and her flower
    const bob = Math.sin(walkK * 26) * 3, gwalk = (walkK * 3.4) % 1;
    figure({ x: 560 - walkK * 60, y: GROUND, h: 520, dir: -1, pose: 'stand', walk: gwalk, bob: bob * .6, eye: 'sleepy', smile: .3, sari: C.red, dupattaSway: Math.sin(t * 3) * .3 });
    figure({ x: 300 - walkK * 60, y: GROUND, h: 470, dir: -1, pose: 'hold', walk: gwalk, bob: bob, eye: 'calm', smile: .2, dupattaSway: Math.sin(t * 2.8 + 1) * .3 });
    soop(300 - walkK * 60 + 40, GROUND - 232 + bob, 100, 66, { rot: .08, col: C.marigold });
    figure({ x: 150 - walkK * 60, y: GROUND, h: 300, dir: -1, pose: 'sleepwalk', walk: (gwalk + .35) % 1, bob: bob * 1.2, eye: 'sleepy', smile: .4, sari: C.green, flower: true, flowerS: 15, flowerHand: 'R' });
    camOff();
    if (lt < .55) veil(.7 * (1 - seg(lt, 0, .55)), C.night);
  }

  // ---------- SHOT 9 · 60.0-70.0 · the sunrise, and Pari's flower ----------
  function s09(t, lt) {
    const rise = ease(seg(lt, 0, 5.4)), kSky = .8 * (1 - rise);
    const sunY = lerp(1160, 690, rise);
    const z = lerp(1.02, 1.08, ease(seg(lt, 0, 10)));
    cam(540, 1120, z, 0);
    ghatBg(kSky, 1, sunY, { scroll: lt * .4, t });
    crowd(3, 1000, 1.1);
    // rays on the water: lotus and fish-tail patterns, in gold, spreading with the light
    const kr = seg(lt, .7, 4.2);
    for (let i = 0; i < 8; i++) {
      const k = clamp(kr * 1.5 - i * .09);
      if (k <= 0) continue;
      const y = WATER_Y + 40 + i * 44, w2 = 40 + i * 30;
      for (let j = 0; j < 3; j++) {
        const x0 = 540 - w2 + j * (w2 * .9), s = 10 + i * 1.3;
        if (i % 3 === 0) { for (let p = 0; p < 5; p++) { const th = -Math.PI / 2 + (p - 2) * .5; inkFlat([[x0, y], [x0 + Math.cos(th) * s, y + Math.sin(th) * s * k]], 1.8, mixCol(C.saff, C.white, .35), .6, .4); } }
        else inkFlat([[x0 - s * k, y], [x0 + s * k, y]], 2, mixCol(C.saff, C.white, .4), .45, .4);
      }
    }
    // Gauri in the water, the same stance as the evening — but her face is calm now, and she is smiling
    const gx = 420;
    figure({ x: gx, y: WATER_Y + 120, h: 470, dir: 1, pose: 'lift', eye: 'calm', smile: .85, brow: .45, dupattaSway: Math.sin(t * 1.4) * .35 });
    const soopX = gx + 96, soopY = WATER_Y + 120 - 470 * 1.14;
    sunChakra(soopX + 18, soopY - 4, 112, { k: 1, pal: [C.red, C.verm, C.orange, C.saff], rot: lt * .11, rayN: 20, a: .75 });
    soop(soopX, soopY - 6, 114, 80, { rot: -.05, col: C.marigold });
    for (let i = 0; i < 7; i++) { const th = i / 7 * TAU; flatCircA(soopX + Math.cos(th) * 52, soopY - 18 + Math.sin(th) * 26, 15, 11, i % 2 ? C.saff : C.orange, 1); }
    diya(soopX, soopY - 50, .8, { l: .85, flick: Math.sin(t * 7) });
    flatA(rectPts(-30, WATER_Y + 96, W + 60, H - WATER_Y), mixCol(C.water, C.indigo, .4), 252);
    // Maa, proud, on the bank
    figure({ x: 800, y: 1216, h: 330, dir: -1, pose: 'fold', eye: 'calm', smile: .9, brow: .4, sari: C.red, dupattaSway: Math.sin(t * 1.2) * .25 });
    // 66.6-68: Pari gives Gauri her flower; 68.2-69.2: Gauri puts it in the soop. The payoff of the whole film.
    const kGive = seg(lt, 6.6, 8.0), kPut = seg(lt, 8.2, 9.2);
    figure({ x: 930, y: 1214, h: 210, dir: -1, pose: kGive > .1 ? 'give' : 'fold', eye: 'calm', smile: .9, sari: C.green,
             flower: kGive < .55, flowerS: 11 + kGive * 6, flowerHand: 'L' });
    if (kPut > 0) {
      const pos = lerpP([900, 1180], [soopX + 52, soopY - 24], ease(kPut));
      for (let i = 0; i < 8; i++) { const th = i / 8 * TAU; flatCircA(pos[0] + Math.cos(th) * 9, pos[1] + Math.sin(th) * 9, 8, 8, C.marigold, 1); }
      flatCircA(pos[0], pos[1], 6, 6, C.orange, 1);
    }
    camOff();
    if (lt < .55) veil(.6 * (1 - seg(lt, 0, .55)), C.night);
  }

  // ---------- SHOT 10 · 70.0-75.0 · all three, the card, and back to the bindu ----------
  function s10(t, lt) {
    const z = lerp(1.14, 1.06, ease(seg(lt, 0, 4.6)));
    cam(540, 1180, z, 0);
    ghatBg(0, 1, 760, { scroll: lt * .3, t });
    // the three of them, together and large, on the bank: Maa left, Gauri centre with the soop, Pari right
    const kk = ease(seg(lt, 0, 1.3));
    figure({ x: 250, y: 1330, h: 430, dir: 1, pose: 'fold', eye: 'calm', smile: .8, sari: C.red, dupattaSway: Math.sin(t * 1.3) * .25 });
    figure({ x: 520, y: 1362, h: 500, dir: 1, pose: 'hold', eye: 'calm', smile: .9, brow: .4, a: kk, dupattaSway: Math.sin(t * 1.5) * .3 });
    soop(548, 1362 - 292, 118, 80, { rot: -.04, col: C.marigold, a: kk });
    diya(548, 1362 - 350, .8, { l: .9, a: kk, flick: Math.sin(t * 7) });
    figure({ x: 812, y: 1330, h: 280, dir: -1, pose: 'fold', eye: 'calm', smile: .9, sari: C.green, a: kk });
    // 72.0-73.9: the card, painted in the same hand as the border
    const kCard = ease(seg(lt, 2.0, 2.8));
    if (kCard > .01) {
      const bandY = 1640;
      flatA(rectPts(40, bandY - 74, W - 80, 176), C.paper, .94 * kCard);
      inkFlat([[46, bandY - 70], [W - 46, bandY - 70]], 2.6, INK, .85 * kCard, .6);
      inkFlat([[46, bandY + 94], [W - 46, bandY + 94]], 2.6, INK, .85 * kCard, .6);
      // the Devanagari line wipes on from the left, so it arrives as a written line, not a pop-in
      const c = flatX; c.save();
      const [ax, ay] = device(46, bandY - 70), [bx] = device(46 + (W - 92) * clamp((lt - 2.0) / 1.5), 0);
      c.beginPath(); c.rect(ax, ay, Math.max(0, bx - ax), 162); c.clip();
      const [tx, ty] = device(W / 2, bandY + 10);
      letter('छठ — आस्था जो पीढ़ियों से बहती है', tx, ty, 68 * (CAM ? CAM.zoom : 1), C.redDk, { font: '68px "Tiro Devanagari Hindi", serif', ink: false, alpha: kCard, rot: -.01 });
      c.restore();
      flatCircA(74, bandY + 10, 7, 7, C.verm, .85 * kCard); flatCircA(W - 74, bandY + 10, 7, 7, C.verm, .85 * kCard);
    }
    camOff();
    // ------------------- the loop -------------------
    // Paint over the whole DEVICE frame with paper, reset the camera to shot 1's, then draw exactly what frame 0
    // shows: the border rubbing out and the red bindu. Frame 1800 == frame 0, so the Reel loops without a seam.
    const kLoop = ease(seg(lt, 3.95, 4.78));
    if (kLoop > 0) {
      bgFill(C.paper, kLoop);
      CAM = LAST_CAM = { cx: W / 2, cy: 900, zoom: 1, rot: 0 };
      border(1 - kLoop, { a: 1 });
      flatCircA(W / 2, 900, 15, 15, C.red, 1);
      inkFlat(closed(ellPts(W / 2, 900, 15, 15, 24)), 2.4, INK, .95, .6);
    }
  }

  shots([
    [0.0, s01],        // 0.0-4.0   bindu -> sun -> soop -> diya
    [4.0, s02],        // 4.0-10.0  hands, then her eyes
    [10.0, s03],       // 10-18     the soop fills, on the phrases
    [18.0, s04],       // 18-26     out of the aangan, the procession
    [26.0, s05],       // 26-34     the ghat at dusk
    [34.0, s06],       // 34-46     the arghya, held
    [46.0, s07],       // 46-52     sunset, match cut, night
    [52.0, s08],       // 52-60     the same walk, pre-dawn
    [60.0, s09],       // 60-70     sunrise, and the flower
    [70.0, s10]        // 70-75     the three, the card, the loop
  ]);
})();
