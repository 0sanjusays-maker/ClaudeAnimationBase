# THE LAST BENCH — animator handoff

**Specs:** 1920×1080 · 16:9 · 24 fps · **1200 frames · 50.000 s**
**Built film:** `out/last_bench.mp4` (picture + sound) · **Story:** `STORYBOARD.md` · **Sound:** `AUDIO_CUES.md`
**Scene code (this repo's engine):** `src/scenes/last_bench.js` · palette in one place: `C` at the top of that file.

This is the production document: what to draw, in which layer, in which frames. If you are animating outside this
engine (Toon Boom, TVPaint, Blender, paper), everything you need is below and nothing here depends on the code.

---

## 1 · Layers

Draw and hand in **five separate layers per shot**, in this order, all at 1920×1080, all on twos unless noted:

| # | layer | contents | line weight |
|---|---|---|---|
| 1 | **BG** | wall, floor, blackboard, windows, door, grime | 0.5–1 px, thin, sketchy |
| 2 | **DESKS/PROPS** | 40 desks, podium, register, mug, textbook, plant, photo, fan, clock | 1.5–2 px |
| 3 | **CHARACTER** | Ravi Verma only (hands are their own sub-layer in CUs) | 2.5 px |
| 4 | **TEXT/REGISTER** | anything written: chalk, pencil, red ink | red ink 3 px, shaky hand |
| 5 | **FX/LIGHT** | lamp pools, shadow movement, light dim, dust, letterbox | no outline |

Boil: each layer re-draws its linework on **twos** (12 drawings/s), so nothing looks frozen. Props that must hold still
(a photo on a wall, a name on a page) do **not** boil; they are pinned.

---

## 2 · Global style bible — do not change

**Line weight:** BG 0.5–1 px thin sketchy · DESKS/PROPS 1.5–2 px · Teacher outline 2.5 px · Red text 3 px hand-drawn shaky.

**Colour palette — hex only:**

| use | hex |
|---|---|
| Wall, faded yellow | `#D9C08A` |
| Wood desk | `#8B5A2B` |
| Blackboard green | `#2E4B3F` |
| Chalk | `#F5F5F0` |
| Teacher kurta | `#E8E0D0` |
| Skin | `#B07A4B` |
| Hair | `#1A1A1A` |
| **Red ink — the only red in the film** | `#C41E2A` |
| Warm light | `#FFD98A` |
| Deep shadow | `#3A2A1A` |
| Pure black | `#0A0A0A` |
| Textbook page | `#FFF8E7` |

**The three rules that are easy to break:**

1. **No red except the register.** Not in the skin, not in the wood, not in a lamp. One red, two pages, one film.
2. **No figure at the last bench. Ever.** No shadow of a boy, no silhouette, no hand. The bench is empty in every frame.
3. **No on-screen dialogue, no subtitles.** Words appear only where a person would leave them: chalk on a board, pencil
   in a book, ink in a register. Everything spoken is sound only (see `AUDIO_CUES.md`).

---

## 3 · Character — RAVI VERMA

Teacher. **42, looks 50.** Height 8 heads; he stoops a little, as if the ceiling is low.

**Head:**

- Round, puffy face; soft jowls, slightly double chin.
- Tired eyes, half-lidded; a bag under each eye.
- **Mole under the left eye** (screen-right when he faces camera). Off-model if missing.
- Thinning hair, slicked straight back; scalp visible at the hairline; grey at the temples.
- **Cracked glasses: his right lens** (screen-left), a hairline crack running diagonally. Wire arms into the hair.
- Broad, slightly bulbous nose. Mouth flat at rest; tired half-smile on greeting.

**Body:**

- White kurta `#E8E0D0`, **yellowed collar and cuffs**. Long, to mid-thigh, buttoned to the throat, side vent.
- Baggy trousers, dark; worn brown shoes, toes turned slightly out.
- **Ink stain on the right thumb** — always present, never mentioned.
- Hands: soft, ink on the right thumb only.

**Mannerism (the character's whole inner life is in this):** takes off his glasses (thumb and forefinger on the bridge,
one frame of lift), rubs his eyes with the back of his free hand, puts the glasses back on (one frame of click).
It happens **three times**: F289, F541, F769 — impatience, embarrassment, grief. Same action, different weight each time.

**Pen tap rhythm: tick-tick-tick.** Three taps, 0.12 s apart, same accent. In shot 7 he taps **four** times, 0.17 s apart,
because he is waiting.

**Poses in this film:** standing 3/4 back at the board · 3/4 toward camera · front at podium · front CU · full front
turning · silhouette from behind. There is no walk and no head-turn beyond 90°.

---

## 4 · Props — locked

| prop | spec | where |
|---|---|---|
| **Register** | Leather brown, worn at the corners. Cover stamped: `STUDENT REGISTER — ST. MARY'S, 2007-2024`. Inside: one cream sheet with printed rulings and a red margin, five names in a neat teacher's hand, and a pencil note at the bottom: **`R.M. — seat 4, last row`**. | Shots 3, 4, 8, 13, 18, 19 |
| **Mug** | Blue, chipped rim, on the podium: `WORLD'S OKAYEST TEACHER`. Never in focus in a hero frame; it is a background joke. | Shots 1–8 |
| **Textbook** | NCERT Maths Class 10, open **on last bench, Row 5 Seat 4**, blank page `#FFF8E7`. The brightest surface in the film. It writes on itself three times. | Shots 1, 2, 9, 10, 12, 15 |
| **Last bench** | Row 5, Seat 4. **Pulled out 2 inches** from the row, with a scuff of bare floor behind it. This is the film's "tell" for anyone watching closely. | Every room shot |
| **Class photo 2007** | On the wall top-right, warm and faded, three rows of small heads. Corner peeling. Pays off as the pasted photograph in shot 19. | Shots 1, 9, 16 |
| **Dead plant** | Bottom-right corner, seven drooping blades in a wooden pot. Sways 1 mm even when nothing else moves. | Shots 1, 8, 16 |
| **Ceiling fan** | Top-centre, three blades, **15° per frame**. Stops mid-rotation, blades diagonal (shot 8, F349). | Shots 1–8 |
| **Wall clock** | Top-left, second hand red. Ticks once a second. Stops at F351. | Shots 1–8 |
| **Pencil** | Still in the desk, Row 1 Seat 3. Never picked up. | Shots 1, 5 |
| **Crumpled paper** | Row 2 Seat 1. Moves 1 mm left for exactly two frames at F253. | Shots 1, 6 |
| **Water bottle** | Row 3 Seat 5, half full, cap off. | Shot 1 |
| **Pen** | Plain black, in his right hand. Falls at F785 and rolls. | Shots 3–14 |

---

## 5 · Camera

**90% locked off at desk height.** Lens: 35 mm for the room, 50 mm medium, 85 mm close-up. Horizon at about 60% frame
height, sitting *at desk level*, so the desks stack up and the empty room feels big.

**Only two camera moves in the film:**

| move | shot | what |
|---|---|---|
| **Push-in** | **Shot 2** (F037–F072, 1.5 s) | Starts wide on the room, ends with the blank page filling 60% of frame. One continuous move, no cut. |
| **Push-in** | **Shot 19** (F1081–F1176, 1.5 s of move, then hold) | Slow push on the register on the floor until the photograph and the red entry fill the frame. |

Everything else is a locked frame with a 1–2% settle so it does not look dead. Shot 1 has a **3° Dutch** — the room is
very slightly wrong — which the camera keeps for the whole film.

Shot 19 also has the only **framing change**: a 2.35:1 letterbox slams in at **F1128**, exactly as the red text arrives.

---

## 6 · Shot list

| shot | frames | time | camera |
|---|---|---|---|
| 1 | 001–036 | 0.0–1.5 | wide, 35 mm, 3° Dutch |
| 2 | 037–072 | 1.5–3.0 | push-in to the last bench |
| 3 | 073–120 | 3.0–5.0 | medium teacher |
| 4 | 121–168 | 5.0–7.0 | CU register + hands, top-down 45° |
| 5 | 169–216 | 7.0–9.0 | medium teacher |
| 6 | 217–264 | 9.0–11.0 | medium teacher |
| 7 | 265–312 | 11.0–13.0 | CU teacher face |
| 8 | 313–360 | 13.0–15.0 | medium-wide |
| 9 | 361–408 | 15.0–17.0 | wide from behind him |
| 10 | 409–468 | 17.0–19.5 | CU bench textbook |
| 11 | 469–552 | 19.5–23.0 | locked medium, the turn |
| 12 | 553–648 | 23.0–27.0 | two-shot |
| 13 | 649–720 | 27.0–30.0 | ECU register, shallow |
| 14 | 721–792 | 30.0–33.0 | CU teacher face |
| 15 | 793–864 | 33.0–36.0 | CU bench textbook |
| 16 | 865–936 | 36.0–39.0 | wide, dark amber |
| 17 | 937–1008 | 39.0–42.0 | CU door |
| 18 | 1009–1080 | 42.0–45.0 | medium from behind him |
| 19 | 1081–1176 | 45.0–49.0 | push-in on register, letterbox at F1128 |
| 20 | 1177–1200 | 49.0–50.0 | black |

---

## 7 · Frame-by-frame

Frames are 1-based. "Hold" means redraw identical except for boil and the listed secondary motion.

### SHOT 1 · F001–F036 · THE ROOM
Wide, low, 35 mm, 3° Dutch. **Teacher NOT in frame.**

**Draw (BG):** 40 desks, 4 rows of 10. Wall faded yellow, floor brown. Blackboard centre: `ATTENDANCE` and a half-erased
`Q4: Prove that` from the period before. Ceiling fan top centre, wall clock top left, class photo top right (peeling),
dead plant bottom right.
**Draw (DESKS/PROPS):** Row 1 Seat 3 — pencil in the desk. Row 2 Seat 1 — crumpled paper. Row 3 Seat 5 — half a bottle,
cap off. Row 5 Seat 4 — **pulled out 2 inches, textbook open, blank page.**

- **F001:** keyframe, all of the above, warm amber light.
- **F002–F036:** hold identical. Only animate: fan blades 15°/frame; dust motes drift 2 px right per 6 frames; clock second
  hand ticks at F024; light drops 10% at F020 for one frame only.

**Sound:** fan creak loop, clock tick, distant muffled bell at F010.

### SHOT 2 · F037–F072 · THE BENCH
**Camera:** slow push-in, 2 s, wide to CU last bench. No cut.

**Draw:** last bench Row 5 Seat 4 pulled out 2 inches, the textbook open on it, page blank.
- **F037–F048:** push 10%. Page blank.
- **F049–F060:** push another 15%. Page rustles 1 px at F055.
- **F061–F072:** hold. The page fills 60% of frame, `#FFF8E7`, the brightest thing on screen.

### SHOT 3 · F073–F120 · TEACHER INTRO
Cut to medium: teacher left of centre at the podium, back 3/4 to camera, board behind him.
- **F073–F084:** he finishes writing `ATTENDANCE` (chalk hand, live). Arm up at the board.
- **F085–F096:** head turns to camera, then shoulders. Pen taps the podium: F088, F091, F094.
- **F097–F120:** facing camera, tired half-smile, mouth moving. *(Speaking; see cue sheet.)*

**Note:** his body never fully faces us in this shot; the turn completes in shot 5.

### SHOT 4 · F121–F168 · THE REGISTER
**Camera:** CU hands on the podium, top-down 45°. The register fills the frame, one cream sheet, red margin.
- **Draw (TEXT):** five names in neat teacher print — `RAHUL MISHRA · AMAN QURESHI · VIKRAM NAIR · SUNIL PATIL ·
  FARAH KHAN`. At the bottom, in pencil, lighter: **`R.M. — seat 4, last row`**.
- **F121–F132:** his hand enters from bottom-left, ink-stained thumb on the page.
- **F133–F168:** hold on the page. The thumb taps name 1 with the pen at F140, F144, F148.

**Note:** this is the setup for the whole film. The pencil note must be readable but must not be *pointed at* by the
camera or by his thumb. He is not looking at it.

### SHOT 5 · F169–F216 · "RAHUL?"
Medium, same as shot 3. He looks off to Row 1, right side.
- **F169–F180:** he asks (mouth F172–F176), then the pen taps twice only: F184, F188.
- **F181–F192:** beat — 0.5 s of waiting.
- **F193–F204:** the answer comes from off-screen right. The desk in frame is **empty**: only a pencil in it.
- **F205–F216:** hold. He blinks, slow, six frames (F208–F213).

**Note:** the answer is *not* spooky. No wind, no light change, nothing moves but his eyelids.

### SHOT 6 · F217–F264 · "AMAN?"
Same medium, other side.
- **F217–F228:** he asks (mouth F220–F224).
- **F229–F240:** pen taps twice: F232, F236.
- **F241–F252:** answer from off-screen left, closer.
- **F253–F254:** **CRITICAL** — the crumpled paper on Row 2's desk shifts **1 mm left. Two frames only.** Nothing else moves.
- **F255–F264:** hold.

### SHOT 7 · F265–F312 · THE FOURTH TAP
**Camera:** CU his face.
- **F265–F276:** he asks the third name, quieter.
- **F277–F288:** **no voice.** Pen taps at F280, F284, F288, F292 — **four taps, slower than his own rhythm.** Wrong on purpose.
- **F289–F300:** glasses off (F289), rubs his eyes (F292–F296), glasses back on (F298, one frame click).
- **F301–F312:** hold on confused face. Dead plant sways 1 mm at F305.

### SHOT 8 · F313–F360 · "KOI HAI HI NAHI"
Medium-wide.
- **F313–F324:** he looks down at the empty desks, then at the register in his hand.
- **F325–F348:** he speaks, flat and tired, mouth F330–F344.
- **F349:** **the fan stops mid-rotation.** Blades freeze diagonal, not aligned.
- **F351:** **the clock's second hand stops.**
- **F353–F360:** hold, 0.3 s, all still. This is the film's first silence — draw it still, not frozen: boil only.

### SHOT 9 · F361–F408 · TAPPING
Wide, from behind him, looking down the room to the last bench in shadow.
- **F361–F372:** light dims 20%, goes warmer. Shadows lengthen.
- **F373–F408:** four taps on wood from the bench: F376, F384, F392, F400. **No hand visible.** On each tap the page on
  the bench catches a little light (2–3 frames of a faint glow).
- **F400–F408:** hold. He has not turned around.

### SHOT 10 · F409–F468 · "MERI ATTENDANCE REH GAYI"
**Camera:** CU the open textbook.
- **F409–F420:** blank page. Nothing. The brightest thing in a dark room.
- **F421–F444:** the page turns **by itself**, slow, one second. New page: hand-written pencil, appearing as the nib
  travels: **`Sir, aap mujhe har roz dekhte ho.`**
- **F445–F468:** hold on the line. *(The boy speaks; see cue sheet.)*

**Note:** the writing must appear **letter by letter**, left to right, over ~0.5 s after the page lands. Not a pop-in.

### SHOT 11 · F469–F552 · THE TURN
Locked-off medium. The turn is in three parts — this is the animation set piece of the film.
- **F469–F492:** **head** turns 0–1 s. Neck creak.
- **F493–F516:** **shoulders** turn 1–2 s. Kurta rustles.
- **F517–F540:** **feet** turn 2–3 s. Shoes scrape.
- **F541–F552:** facing the bench. Glasses off (F541), rub (F543–F547), on (F549). He speaks, quiet and embarrassed.

**Note:** overlap — the head finishes *while* the shoulders are already starting; the feet are the last to commit. It is
reluctance drawn as weight, not a snap turn.

### SHOT 12 · F553–F648 · "HAR ROZ DEKHTE HO"
**Camera:** two-shot. He is left, lit warm. The bench is right, in shadow.
- **F553–F576:** hold. He squints at an empty bench.
- **F577–F600:** the page turns again, one second. Same sentence on it.
- **F601–F648:** hold. No eyes, no face, no figure. Only the book and the shadow. *(The boy speaks; see cue sheet.)*

**Note:** this shot is the test of the film's idea. The long hold on an empty desk while a voice comes out of it must be
*comfortable* to watch. If it is boring, the sound is wrong, not the drawing.

### SHOT 13 · F649–F720 · THE RED PAGE
**Camera:** ECU register, shallow depth of field, background soft.
- **F649–F660:** his trembling hand flips the page (hand shakes 2 px at 34 Hz).
- **F661–F708:** red text appears **letter by letter** over 2 s, in `#C41E2A`:
  - Line 1: **`RAHUL MISHRA`** — large, pressed hard.
  - Line 2: **`DEAD — 17 YEARS AGO.`**
  - The ink glistens: a wet highlight along each stroke, fading as it dries.
- **F700:** one red drop gathers at the bottom of the page and falls.
- **F709–F720:** hold on the red text. The drop lands at F712.

**Note:** this is the only red in the film. The rest of the frame is *dimmer* than in shot 4 — the page should feel hot.

### SHOT 14 · F721–F792 · "MAR CHUKE HO"
**Camera:** CU teacher face.
- **F721–F744:** staring at the register, eyes wet, hand trembling 2 px.
- **F745–F768:** he whispers, and his voice breaks mid-line, mouth F750–F765.
- **F769–F780:** glasses off / rub / on, **third time** (F769–F778).
- **F781–F792:** the pen drops from his hand at F785, clinks, rolls and stops at F790.

### SHOT 15 · F793–F864 · "PAR AAP BHI TOH…"
**Camera:** CU the textbook.
- **F793–F816:** the page turns. New text, pencil: **`Haan sir… par aap bhi toh…`** — the ellipsis is the point.
- **F817–F840:** the boy speaks the line and **trails off, unfinished**.
- **F841–F852:** the light flickers twice: F843 off, F845 on, F847 off, F849 on.
- **F853–F864:** hold, 1 s of silence. The shadow on the bench shifts 1 mm at F858.

### SHOT 16 · F865–F936 · DARKNESS
Wide classroom.
- **F865–F888:** light dims to **dark amber, not black** — the desks are still visible.
- **F889–F912:** teacher's silhouette, frozen, holding the register.
- **F913–F936:** hold. Dead plant sways 1 mm at F920. Class photo peels 2 mm more at F925.

### SHOT 17 · F937–F1008 · THE DOOR CLOSES
**Camera:** CU the door, hallway warm light visible around it. **Draw it after dark** — the room behind the door is
already gone; the only light is the seam.
- **F937–F984:** the door swings shut, slow, 3 s. The warm rectangle narrows to a line.
- **F985–F992:** the handle turns (one frame, F988).
- **F993–F1008:** door closed. Latch **CLACK** at F995. Hallway light gone.

### SHOT 18 · F1009–F1080 · THE WHISPER
Medium, teacher's back, facing the bench. Camera behind him.
- **F1009–F1020:** still. Shoulders hunched.
- **F1021–F1068:** the whisper comes from the **centre of frame, behind the camera**. *(See cue sheet.)*
- **F1069–F1075:** shoulders drop 2 mm. His hand opens.
- **F1076–F1080:** the register falls, hits the floor at F1079, pages fan open.

### SHOT 19 · F1081–F1176 · THE PHOTOGRAPH
**Camera:** slow push-in, 4 s, on the register on the floor. **Letterbox 2.35:1 slams in at F1128.**
- **Draw (PROPS):** register open on the floor, pages fanned. **Pasted inside: a photograph** of young Ravi Verma, 25,
  gap-toothed grin, **full head of hair**, the same cracked glasses, warm and faded. Small pencil `2007` on the photo.
- **F1081–F1116:** push 20%. The photograph becomes visible.
- **F1117–F1152:** red text appears below the photo, letter by letter: **`VERMA, RAVI`** / **`DEAD — 17 YEARS AGO.`**
  The red pulsates on a **two-frame opacity heartbeat**.
- **F1153–F1176:** hold CU. **The eyes in the photograph shift 1 px at F1160.** Nothing else moves.

### SHOT 20 · F1177–F1200 · CUT TO BLACK
Pure black `#0A0A0A`, all frames. No drawing.
- **F1177 sound:** school bell, loud, warm, clear, 1 s.
- **F1189 sound:** one child's giggle, 0.5 s, **cut off mid-laugh**.
- **F1200 sound:** silence. END.

---

## 8 · Things that go wrong on this film (check these before delivery)

1. **A fifth tap.** His rhythm is three. Four taps happen exactly once (shot 7) and are the whole point.
2. **Red creeping in.** The photo, the wood, the lamp, the skin, the clock's second hand — if any of them is red, the
   reveal at F661 has nothing to reveal.
3. **A boy at the bench.** See rule 2 above. Check shot 12 frame by frame.
4. **Text on screen not written by a character.** No shot numbers, no subtitles, no captions, no "17 YEARS AGO" anywhere
   except inside the register.
5. **The page popping in.** All pencil and red text must *write on*, glyph by glyph. It is the film's only motion effect.
6. **The fan stopping clean.** It must stop **mid-rotation**, blades diagonal, not snap to a symmetric pose.
7. **The two silences filled.** F353–F360 and F853–F864. Leave them empty.
8. **The giggle fading.** It must cut.

---

## 9 · Handing this to the engine in this repo

The film is already built in `src/scenes/last_bench.js`; each shot is one function (`s01`…`s20`), and `shots([...])` at
the bottom wires the frame ranges. To change a shot, edit its function; to check it, render stills:

```bash
node render.mjs --sheet=0.5,1.2 --cols=2 --w=640 --out=out/check/s1.jpg      # contact sheet at times
node render.mjs --strip=19.5:20.5 --cols=6 --w=320 --out=out/check/turn.jpg  # every frame of a move
node render.mjs --frames --workers=2                                        # 1200 frames → out/frames
node render.mjs --encode --audio=assets/last_bench_audio.wav --out=out/last_bench.mp4
python3 tools/build_audio.py                                                 # rebuild the sound track
```

Working notes from building it (worth knowing before you change the engine):

- The film draws on a **single ordered 2D layer** (`flat()`, `inkFlat()`, `flatCirc()`, `letter()`, `glow()`, `veil()` in
  `src/core.js`) and the paper grain is multiplied over it. p5.brush's `fill` (watercolour bleed) is beautiful but costs
  **~3 s per call** in software rendering; `paint()` in this build is a flat fill plus a hand-drawn ink contour. That is
  the difference between a 13-hour render and a 3-minute one. Read the comment block at the top of `src/core.js` before
  switching anything back.
- Lettering is a font (Caveat / Permanent Marker / DejaVu Serif) placed **glyph by glyph** with seeded wobble in size,
  angle, baseline and spacing (`src/handwriting.js`), in a palette colour, with the paper grain over it. It is drawing,
  not typography; do not set it in a text box.
- The Hindi lines are generated speech from `assets/vo/` (see `AUDIO_CUES.md`). They are deliberately not subtitled, in
  either picture or document; this file is the only place the lines are written down in full.
