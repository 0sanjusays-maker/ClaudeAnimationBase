#!/usr/bin/env python3
"""build_chhath_audio.py — foley for PEHLA CHHATH (the song is dropped on top later).

Silent-film rules, same as THE LAST BENCH: nothing melodic, nothing that competes with a vocal. Only the three sounds
the picture actually shows — a brush on paper, bare feet on stone, and water — placed on the storyboard's cuts.
The mix deliberately leaves 6 dB of headroom so a music bed can be laid over it without pumping.

    python3 tools/build_chhath_audio.py           -> assets/chhath_foley.wav   (75.00 s)
    node render.mjs --page=studio_chhath.html --encode --audio=assets/chhath_foley.wav --out=out/chhath.mp4

Every cue below is frame-accurate at 24 fps (frame / 24 = seconds), and every sound is synthesised with ffmpeg's
lavfi sources, so there is no sample library to license.
"""
import os
import subprocess
import sys
import tempfile

FFMPEG = os.environ.get("FFMPEG", "ffmpeg")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "chhath_foley.wav")
SR = 48000
DUR = 75.0
FPS = 24

tmp = tempfile.mkdtemp(prefix="chh_foley_")
parts = []          # (file, at_seconds, gain)


def run(args):
    p = subprocess.run([FFMPEG, "-y", "-v", "error"] + args, capture_output=True, text=True)
    if p.returncode:
        sys.exit("ffmpeg failed: " + p.stderr[-900:])


def synth(name, expr, dur, at=0.0, gain=1.0, filters=None):
    f = os.path.join(tmp, name + ".wav")
    chain = "aevalsrc=%s:s=%d:d=%.3f" % (expr, SR, dur)
    if filters:
        chain += "," + filters
    run(["-f", "lavfi", "-i", chain, "-ac", "2", "-ar", str(SR), f])
    parts.append((f, at, gain))


def noise(name, dur, at=0.0, gain=1.0, filters=""):
    f = os.path.join(tmp, name + ".wav")
    chain = "anoisesrc=c=pink:s=%d:d=%.3f" % (SR, dur)
    if filters:
        chain += "," + filters
    run(["-f", "lavfi", "-i", chain, "-ac", "2", "-ar", str(SR), f])
    parts.append((f, at, gain))


def env(dur, f_in=0.06, f_out=0.2):
    return "afade=in:st=0:d=%.2f,afade=out:st=%.2f:d=%.2f" % (f_in, max(0.0, dur - f_out), f_out)


T = lambda frame: frame / FPS

# ---------------------------------------------------------------- 1. brush on paper (shots 1-4)
# A short dry stroke: filtered noise with a fast attack. The border draws itself with one stroke per beat at 84 bpm
# (0.714 s), so the strokes land 0.71 s apart until the border is complete.
print("brush · the border drawing itself on, and the sun and soop being painted")
stroke = 0.30
for i in range(9):
    t = 0.06 + i * 0.714
    if t > 3.4:
        break
    noise("brush_line_%d" % i, stroke, at=t, gain=0.30,
          filters="highpass=f=1800,lowpass=f=6500,tremolo=f=14:d=0.5," + env(stroke, .03, .18))
# the sun's rings, then the soop's weave: shorter, drier ticks as the shapes fill in
for i, t in enumerate([1.15, 1.42, 1.70, 1.95, 2.20]):
    noise("brush_fill_%d" % i, 0.22, at=t, gain=0.20,
          filters="highpass=f=2400,lowpass=f=9000," + env(.22, .02, .16))
# the flame catching (a small soft whoosh), then the flare into shot 2
noise("flame", 0.55, at=2.95, gain=0.16, filters="lowpass=f=1200,highpass=f=180," + env(.55, .18, .34))

# ---------------------------------------------------------------- 2. hands, then her eyes (4.0-10.0)
print("foley · cloth, a wrist bangle, the diya's flicker")
noise("cloth_ma", 1.1, at=4.05, gain=0.14, filters="highpass=f=600,lowpass=f=3800," + env(1.1, .2, .7))
synth("bangle", "0.35*sin(2*PI*2600*t)*exp(-9*t)+0.2*sin(2*PI*3900*t)*exp(-13*t)", 0.5, at=4.55, gain=0.20)
synth("bangle2", "0.3*sin(2*PI*2950*t)*exp(-10*t)", 0.4, at=5.9, gain=0.15)
noise("dupatta", 1.6, at=6.6, gain=0.10, filters="highpass=f=900,lowpass=f=5000," + env(1.6, .5, .8))
# diya flicker: a tiny hiss, pulsing, under the whole shot
noise("diya", 5.6, at=4.2, gain=0.06, filters="highpass=f=2000,lowpass=f=7000,tremolo=f=7:d=0.8")

# ---------------------------------------------------------------- 3. the soop fills (10.0-18.0)
print("foley · six offerings being placed, one per phrase")
for t in [10.55, 11.75, 12.95, 14.15, 15.35, 16.55]:
    noise("place_%0.2f" % t, 0.42, at=t, gain=0.22, filters="lowpass=f=2600,highpass=f=90," + env(.42, .02, .32))
    synth("tap_%0.2f" % t, "0.5*sin(2*PI*180*t)*exp(-24*t)+0.2*sin(2*PI*420*t)*exp(-30*t)", 0.3, at=t + 0.16, gain=0.16)
noise("basket_settle", 0.7, at=17.0, gain=0.10, filters="highpass=f=700,lowpass=f=4200," + env(.7, .1, .5))

# ---------------------------------------------------------------- 4. the procession (18.0-26.0)
print("foley · the walk, on a loop, then the pan")
foot = "lowpass=f=900,highpass=f=60," + env(0.17, .01, .13)
for i in range(11):                                    # about 1.5 steps a second, from 19.4 s
    t = 19.4 + i * 0.64
    if t > 26.0:
        break
    noise("step_%d" % i, 0.17, at=t, gain=0.13 + 0.03 * (i % 2), filters=foot)
noise("daura_creak", 0.9, at=20.2, gain=0.08, filters="highpass=f=400,lowpass=f=2200," + env(.9, .2, .5))
noise("paper_wing", 0.5, at=25.55, gain=0.10, filters="highpass=f=1600,lowpass=f=6000," + env(.5, .1, .3))

# ---------------------------------------------------------------- 5. the ghat at dusk (26.0-34.0)
print("foley · water arrives and stays: lapping, then the crowd's low wash")
noise("river_in", 8.0, at=26.0, gain=0.14, filters="lowpass=f=850,highpass=f=70,tremolo=f=0.5:d=0.35," + env(8.0, 1.2, 1.4))
noise("steps", 0.6, at=29.4, gain=0.10, filters="lowpass=f=700," + env(.6, .05, .45))
noise("diyas_float", 2.2, at=30.2, gain=0.07, filters="highpass=f=1200,lowpass=f=5000,tremolo=f=3:d=0.4," + env(2.2, .5, .9))

# ---------------------------------------------------------------- 6. the arghya (34.0-46.0)
print("foley · the held breath: water, a step, then almost nothing")
noise("river_hold", 12.0, at=34.0, gain=0.16, filters="lowpass=f=800,highpass=f=60,tremolo=f=0.42:d=0.4," + env(12.0, 1.0, 1.2))
noise("feet_water_1", 0.55, at=35.1, gain=0.16, filters="lowpass=f=1400,highpass=f=120," + env(.55, .02, .4))
noise("feet_water_2", 0.5, at=36.3, gain=0.13, filters="lowpass=f=1400,highpass=f=120," + env(.5, .02, .4))
# ripples: soft filtered swells, one every ~1.5 s under the held note
for i in range(6):
    noise("ripple_%d" % i, 1.3, at=37.0 + i * 1.5, gain=0.075,
          filters="lowpass=f=1100,highpass=f=200,tremolo=f=2.2:d=0.5," + env(1.3, .3, .8))
# a single temple bell, far off, once: the only pitched sound in the track, and it is a bell, not music
synth("bell_far", "0.5*sin(2*PI*392*t)*exp(-1.6*t)+0.28*sin(2*PI*587*t)*exp(-2.2*t)+0.15*sin(2*PI*784*t)*exp(-3*t)",
      4.5, at=43.6, gain=0.14, filters="lowpass=f=3000")

# ---------------------------------------------------------------- 7. sunset, match cut, night (46.0-52.0)
print("foley · the sinking, the cut, then the night")
noise("sun_sink", 2.6, at=46.0, gain=0.09, filters="lowpass=f=500,highpass=f=50," + env(2.6, 1.0, 1.2))
synth("matchcut", "0.6*sin(2*PI*70*t)*exp(-3.2*t)", 1.6, at=48.35, gain=0.24)      # the red disc -> the flame: a soft low hit
noise("night_air", 3.4, at=48.5, gain=0.07, filters="lowpass=f=600,highpass=f=80," + env(3.4, 1.0, 1.0))
for i in range(9):                                                                  # stars arriving
    t = 49.15 + i * 0.13
    synth("star_%d" % i, "0.32*sin(2*PI*%d*t)*exp(-16*t)" % (2200 + i * 260), 0.35, at=t, gain=0.075)

# ---------------------------------------------------------------- 8. pre-dawn walk (52.0-60.0)
print("foley · the same walk again, quieter, on the same loop")
for i in range(12):
    t = 52.6 + i * 0.64
    if t > 59.9:
        break
    noise("dstep_%d" % i, 0.17, at=t, gain=0.11 + 0.03 * (i % 2), filters=foot)
noise("dawn_air", 7.6, at=52.2, gain=0.06, filters="lowpass=f=700,highpass=f=90," + env(7.6, 2.0, 1.6))
noise("pari_breath", 0.8, at=56.4, gain=0.055, filters="highpass=f=300,lowpass=f=1600," + env(.8, .3, .4))

# ---------------------------------------------------------------- 9. sunrise, and the flower (60.0-70.0)
print("foley · sunrise, water, and the flower changing hands")
noise("sunrise", 4.6, at=60.0, gain=0.13, filters="highpass=f=300,lowpass=f=2600," + env(4.6, 2.2, 1.8))
noise("river_morning", 10.0, at=60.2, gain=0.12, filters="lowpass=f=900,highpass=f=70,tremolo=f=0.55:d=0.4," + env(10.0, 1.5, 1.8))
noise("flower_give", 0.5, at=66.6, gain=0.10, filters="highpass=f=1500,lowpass=f=6000," + env(.5, .06, .3))
noise("flower_place", 0.45, at=68.3, gain=0.13, filters="lowpass=f=2400," + env(.45, .02, .35))

# ---------------------------------------------------------------- 10. the three, the card, the loop (70.0-75.0)
print("foley · the card, then the breath back to the bindu")
noise("card_in", 1.0, at=71.95, gain=0.12, filters="highpass=f=900,lowpass=f=5200," + env(1.0, .1, .6))
synth("loop_tone", "0.18*sin(2*PI*196*t)+0.09*sin(2*PI*294*t)", 1.0, at=73.9, gain=0.10,
      filters="afade=in:st=0:d=0.5,afade=out:st=0.75:d=0.25")
noise("loop_paper", 0.85, at=73.95, gain=0.09, filters="highpass=f=1200,lowpass=f=6000," + env(.85, .3, .4))

# ---------------------------------------------------------------- mix
print("mixing %d elements" % len(parts))
inputs, chains, labels = [], [], []
for i, (f, at, g) in enumerate(parts):
    inputs += ["-i", f]
    ms = int(round(at * 1000))
    chains.append("[%d:a]volume=%.3f,adelay=%d|%d,apad[a%d]" % (i, g, ms, ms, i))
    labels.append("[a%d]" % i)
graph = ";".join(chains) + ";" + "".join(labels) + "amix=inputs=%d:duration=longest:dropout_transition=0:normalize=0,volume=2.8,alimiter=limit=0.72,afade=out:st=%.2f:d=0.6[out]" % (len(parts), DUR - 0.6)
run(["-f", "lavfi", "-i", "anullsrc=r=%d:cl=stereo:d=%.3f" % (SR, DUR)] + inputs +
    ["-filter_complex", graph, "-map", "[out]", "-t", "%.3f" % DUR, "-ar", str(SR), "-ac", "2", OUT])
print("wrote %s" % OUT)
