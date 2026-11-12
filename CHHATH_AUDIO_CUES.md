# PEHLA CHHATH — foley cue sheet

The film is a **silent animatic**: this track has no music and no voice, because the song is the hero and will be laid
over it. What is here is the three sounds the picture actually shows — **a brush on paper, bare feet on stone, and
water** — placed on the cuts. It is mixed 6 dB down with 7 dB of headroom so a song can sit on top without pumping.

Built track: `assets/chhath_foley.wav` (75.00 s, stereo 48 kHz). Rebuild: `python3 tools/build_chhath_audio.py`.

## Levels

| stem | level | why |
|---|---|---|
| `brush` (S1–S2) | −30 dBFS peaks | it should sound like the border being drawn, not like a pen |
| `footsteps` (S4, S8) | −28 dBFS | bare feet on stone; the two walks use the **same sample and the same cadence** so the rhyme is audible |
| `water` (S5–S9) | −26 dBFS, swelling | the river arrives at 26.0 and does not leave until the card |
| `small` (bangles, diya, cloth, flower) | −34 dBFS | these carry the close shots; keep them under the water |
| `bell` (43.6, one hit) | −30 dBFS | a temple bell far off — the only pitched sound in the track |

## Cues

| time | frame | sound | note |
|---|---|---|---|
| 0.06–3.40 | 002–082 | brush strokes, one per beat | the border drawing itself on |
| 1.15–2.20 | 028–053 | shorter dry brush ticks | the sun's rings, then the soop's weave |
| 2.95 | 071 | a soft whoosh | the diya catching |
| 4.05 | 097 | cloth | Maa's hand arriving |
| 4.55, 5.90 | 109, 142 | two bangle chimes | her wrist as she guides Gauri's hand |
| 6.60 | 158 | dupatta in the wind | the tilt up to Gauri's face |
| 4.20–9.80 | 101–235 | diya flicker, faint and pulsing | under the whole of S2 |
| 10.55–16.55 | 253–397 | six "place" hits + settle taps | one per offering, one per phrase |
| 17.00 | 408 | basket settles | the soop is full |
| 19.4–25.8 | 466–619 | footsteps, 1.5/s | the procession |
| 26.0 | 624 | **the river arrives** | stays until the card |
| 29.4 | 706 | a step on stone | arriving at the ghat |
| 34.0–46.0 | 817–1104 | water, held | S6: almost nothing happens, on purpose |
| 35.1, 36.3 | 842, 871 | feet entering the water | two steps, then still |
| 37.0–44.5 | 888–1068 | six ripples, 1.5 s apart | one every time the water moves around her |
| 43.6 | 1046 | **one temple bell, far off** | the moment she stops shaking |
| 46.0 | 1104 | the sun sinking (a low air swell) | |
| 48.35 | 1160 | **low soft hit** on the match cut | sun → flame |
| 49.15–50.2 | 1180–1205 | nine tiny bell-stars | the sky filling in |
| 52.6–59.9 | 1262–1438 | footsteps, **the same loop** | dawn, quieter |
| 52.2 | 1253 | dawn air | |
| 56.4 | 1354 | Pari's small breath | she is asleep on her feet |
| 60.0 | 1440 | sunrise swell | |
| 66.6 | 1598 | the flower changes hands | |
| 68.3 | 1639 | the flower lands in the soop | the payoff |
| 71.95 | 1727 | paper: the card wiping on | |
| 73.90 | 1774 | one low tone + paper | **the loop**: the breath back to the bindu |

## Dropping the song on

1. Put your track at 84 bpm (or time-stretch to it) and align its first downbeat to **0.000 s** — the hook starts on the
   red bindu, not before it.
2. Duck this foley stem by 4–6 dB under the vocal, and let it come back up in the two places the song will be quietest:
   **S6 (34–46)** and **S10 (70–75)**.
3. The picture cuts are already on the beat, so no re-timing is needed unless a phrase runs long; if it does, move a cut
   in whole beats (0.714 s), never in half beats.
4. Keep the bell at 43.6 audible. It is the only place the film is allowed a pitched sound under the song.
