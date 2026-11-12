# PEHLA CHHATH — animator handoff

**75.0 s · 1800 frames · 24 fps · 1080×1920 (9:16) · Madhubani · no lip-sync**

Built film: `out/chhath_animatic.mp4` · storyboard: `CHHATH_STORYBOARD.md` · sound: `CHHATH_AUDIO_CUES.md`
Scene code: `src/scenes/chhath.js` (this repo's engine) · page: `studio_chhath.html` · settings: `src/config_chhath.js`

This is the production document: what to draw, in which layer, in which frames, and which three things will break the
look. It describes the film as built, so it can be handed to another animator, or used to redraw any single shot in
Toon Boom / TVPaint / Procreate / paper.

---

## 1 · The look, in one paragraph

Madhubani painting, animated only where it has to be. Every shape is a **flat fill with a double outline** — one ink
contour and a second, thinner contour offset outward — and a **patterned fill** inside it (dots, comb lines, fish
scales, lotus petals). No shading, no gradients, no perspective, no depth of field. Paper is cream, ink is warm
near-black, red is kumkum. The border of the frame is a painted object, not a frame: it is drawn on at the start and
rubbed out at the end.

## 2 · Layers

| # | layer | contents | line |
|---|---|---|---|
| 1 | **BG** | paper, sky bands, wall, floor, field, river, horizon | 1.5–2 px |
| 2 | **BORDER** | the frame's two rules + the band of motifs (fish, teeth, dots) | 2–3.4 px |
| 3 | **PROPS** | soop, diya, stool, daura, offerings, cane, garland, trees, house | 1.6–2.6 px |
| 4 | **CHARACTER** | Gauri, Maa, Pari | 2–2.6 px |
| 5 | **PAINTED FX** | water lines, ripples, reflections, rays, stars | 1–2 px |
| 6 | **LIGHT** | diya glow, sunset flare, the veil on the match cut | no outline |

Layer order is strict: a hand may cross a prop, a prop may never cross a hand.

## 3 · The rules that are easy to break

1. **Two outlines on everything** — except water lines, stars and rays, which are single-weight.
2. **Pattern the fill, always.** A flat colour with no pattern inside it is the one thing that reads as "vector" and
   kills the style. Even a 20-px-wide band gets dots.
3. **Only five things move:** hands, eyes, dupatta, flame, water. Everything else boils on twos and stays put.
4. **No red except kumkum.** The sun's core is saffron/gold, not red; the red discs are the ring and the bindu.
5. **No figure at large scale from behind.** The whole film is drawn in near-profile; a back-of-head shot reads as a
   completely different drawing style.
6. **Nothing is captioned**, nothing is lip-synced. The card at 72 s is the only writing in the film.
7. **9:16 safe box: x 70–1010, y 300–1640.** Gauri's face and the soop must both live inside it in every shot.

## 4 · Palette

| use | hex |
|---|---|
| paper | `#F6EBD8` |
| ink (all outlines) | `#211A16` |
| kumkum red — bindu, borders, text | `#B8291D` |
| deep red — saris, fish, shadows of red | `#8E1C14` |
| vermilion | `#D9532F` |
| orange — flame outer | `#E8862F` |
| saffron — sun core | `#E9A93C` |
| gold — jewellery, hem, soop rim | `#CF9526` |
| marigold — offerings, garland | `#E5B45A` |
| leaf green — Pari's sari, cane | `#3E6B4A` |
| indigo — night sky, silhouettes | `#1B2547` |
| river | `#25455C` |
| river highlight | `#417E86` |
| skin | `#BE8A5C` |

## 5 · Characters

### Gauri, 15
Height 470 px at the ghat, 500 px in the last shot. Narrow waist, wide pleated skirt, sari `#A8322A` with a gold hem
and a row of red buds on it, pallu over the **left** shoulder only. Hair in a low bun at the back, bindi, gold earring.
**The face is the performance:** large almond eye with a heavy upper lid, a brow that sits low and pinched when she is
nervous (S2–S4) and lifts about 3 px and relaxes from S6 onwards. She never opens her mouth.

### Maa, 38
520 px, deeper red sari, a **daura** (wide patterned basket) balanced on her crown from S4 to S5. Poses: `stand`,
`fold` (namaskar), and one gesture — two fingers correcting Pari's flower at 16.7. Eyes closed or calm throughout.

### Pari, 7
300 px, green sari, no bun (two small plaits), always holding a **marigold**: peeking from the doorway (S2), putting it
in the soop crooked (S3), asleep on her feet still holding it (S8), giving it to Gauri (S9 66.6). The flower changes
hands **three times** and is the only prop that does.

### The rig
One function draws all three: skeleton in units of height, `hipY .40 · waistY .50 · bustY .60 · shoY .705 ·
neckY .75 · head .805` with head radius `.102 h` vertically. Arms are two tapered segments with the elbow bowed
outward; hands are palm + four finger shapes + thumb, and are the only detailed anatomy in the film.

## 6 · Props

| prop | spec | where |
|---|---|---|
| **Soop** (winnowing basket) | The film's spine. Rim band (darker, studded), woven inner surface, a front lip that makes it a bowl and not a wheel. Diameter 584 px in S3, 240 px at the ghat. | S1, S2, S3, S4, S6, S8, S9, S10 |
| **Diya** | Clay bowl, two-lobed flame, white core. Flame animates **every frame**; everything else about it is locked. | S1, S2, S5, S7, S10 |
| **Offerings** | thekua (ridged disc with 12 dots) · banana bunch · coconut (three eyes, leaf tuft) · guava pair · marigold garland · cut cane. Each arrives on its own phrase. | S3 |
| **Daura** | Wide basket on Maa's head, cross-hatched, with a soop as its lid. | S4, S5, S8 |
| **Cane arch** | Four stalks growing up both sides of frame over S3, leaves at every node. | S3 |
| **Marigold garland** | Strung across the top of frame, one flower every 74 px, scalloped. | S3 |
| **Stool** | Low, with a red cloth and a dot pattern. The soop rests on it: a basket in mid-air reads as a wheel. | S3 |
| **Border** | Two rules, 44 px and 76 px in from the edge, with a band of motifs between them: fish every 8th, dots on the odd, teeth on the even. Draws itself on in S1; rubs out in S10. | S1, S10 |

## 7 · Camera

Locked off, desk height, **no zooms except where listed**, all drift is under 5%:

| shot | camera |
|---|---|
| S1 | locked; a 45% push into the flame in the last 1.1 s |
| S2 | tilt from the hands to her face, 4.55 → 7.1 s, and a 14%→8% pull back |
| S3 | 8% push over 8 s |
| S4 | pan right at 1.4–3.0 s; then a 1.3→1.14 push |
| S5 | locked, 5 px drift |
| S6 | locked, 6% pull over 12 s — **the only true hold in the film** |
| S7 | locked; 45%→8% pull on the night |
| S8 | locked, 12% push, same framing as S4 |
| S9 | 6% push |
| S10 | 8% pull, then the camera resets to S1's for the loop |

Parallax in S4/S8: far field 0.14× · treeline 0.22× · house 0.45× · low wall 0.6× · ground 0.8× · walkers 1×.

## 8 · Frame-by-frame

The shot-by-shot breakdown with beat numbers is in **`CHHATH_STORYBOARD.md` §Cuts**. The three timings that must not
drift:

- **S6 is 12 seconds with no cut.** If it feels long, the sound is wrong, not the drawing.
- **The match cut is at 48.35 s** (frame 1160): the sun's disc and the diya's flame occupy the same pixels.
- **The loop point is 74.78 s.** The last 0.2 s and the first 0.2 s are the same drawing.

## 9 · Sound (what the animator needs to know)

The animatic's track is **foley only** — brush, footsteps, water — because a song will be laid over it. Two things to
respect while animating: the **footsteps are on a loop at 1.5 steps/s** in S4 and S8 (so the walk cycle must be
26 steps per shot, not 24), and the **bell at 43.6 s** lands on the exact frame Gauri's hands stop shaking.

## 10 · Delivering it in this repo

```bash
node render.mjs --page=studio_chhath.html --sheet=12,30,44 --cols=3 --w=320 --soft-gl --out=out/check/x.jpg
node render.mjs --page=studio_chhath.html --stills=48.35 --soft-gl --out=out/check/still
node render.mjs --page=studio_chhath.html --outdir=out/chhath_frames --frames --workers=2 --soft-gl
node render.mjs --page=studio_chhath.html --outdir=out/chhath_frames --encode --audio=assets/chhath_foley.wav --out=out/chhath_animatic.mp4
python3 tools/build_chhath_audio.py        # rebuild the foley
```

Notes for whoever touches the engine next:

- Everything is drawn into **one ordered 2D layer** (`flat`, `inkFlat`, `glow`, `letter` in `src/core.js`) and the paper
  grain is multiplied over it. A p5.brush wash costs seconds per call in software, so the brush is not used at all here.
- Alpha is written **0–1** in `chhath.js` and converted once at the scene boundary (`flatA`/`flatCircA`); the engine's
  own `flat()` takes 0–255.
- `pattern()` and `mm()` work in **world space** and go through the camera; `letter()` works in **screen space**, so it
  must be handed a device point (`device(x, y)`) or it will land off the page.
- The engine's canvas size comes from `PROJECT.w/h` in `src/config_chhath.js`; `render.mjs` takes `--page=` and
  `--outdir=` so this film and THE LAST BENCH can share one checkout.
