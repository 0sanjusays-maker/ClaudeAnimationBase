#!/usr/bin/env python3
"""build_audio.py — the sound of THE LAST BENCH.

Takes the spoken lines in assets/vo/ and the frame-accurate cue list from STORYBOARD.md, and builds one 50.0 s
stereo track: dialogue placed on its frames, and every sound effect synthesised here (fan, clock, pen, page,
latch, thud, bell, heartbeat, gong), so the film needs no sound library.

    python3 tools/build_audio.py            → assets/last_bench_audio.wav
    node render.mjs --encode --audio=assets/last_bench_audio.wav --out=out/last_bench.mp4

All cue times are in seconds of the finished film (frame / 24). Anything that cannot be synthesised well
(the voices, the giggle) is a file in assets/vo/; a missing file is skipped with a warning, so the track can be
rebuilt as the voice set grows.
"""
import json
import os
import subprocess
import sys
import tempfile

FFMPEG = os.environ.get("FFMPEG", "ffmpeg")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VO = os.path.join(ROOT, "assets", "vo")
OUT = os.path.join(ROOT, "assets", "last_bench_audio.wav")
SR = 48000
DUR = 50.0

tmp = tempfile.mkdtemp(prefix="lb_audio_")
parts = []            # (file, delay_ms, gain)


def run(args):
    p = subprocess.run([FFMPEG, "-y", "-v", "error"] + args, capture_output=True, text=True)
    if p.returncode:
        sys.exit("ffmpeg failed: " + p.stderr[-800:])


def synth(name, expr, dur, gain=1.0, at=0.0, extra=None, filters=None):
    """A mono 48k clip from an aevalsrc expression, delayed to `at` seconds."""
    f = os.path.join(tmp, name + ".wav")
    chain = "aevalsrc=%s:s=%d:d=%.3f" % (expr, SR, dur)
    if filters:
        chain += "," + filters
    run(["-f", "lavfi", "-i", chain] + (extra or []) + ["-ac", "1", "-ar", str(SR), f])
    parts.append((f, int(at * 1000), gain))
    return f


def noise(name, dur, at=0.0, gain=1.0, filters=""):
    f = os.path.join(tmp, name + ".wav")
    chain = "anoisesrc=c=white:s=%d:d=%.3f" % (SR, dur)
    if filters:
        chain += "," + filters
    run(["-f", "lavfi", "-i", chain, "-ac", "1", "-ar", str(SR), f])
    parts.append((f, int(at * 1000), gain))
    return f


def clip(name, at, gain=1.0, tempo=1.0, fade_in=0.0, fade_out=0.0):
    src = os.path.join(VO, name)
    if not os.path.exists(src):
        print("  (missing, skipped) " + name)
        return
    f = os.path.join(tmp, "vo_" + name.replace(".mp3", ".wav"))
    chain = []
    if tempo != 1.0:
        chain.append("atempo=%.3f" % tempo)
    if fade_in:
        chain.append("afade=in:st=0:d=%.3f" % fade_in)
    if fade_out:
        chain.append("areverse,afade=in:st=0:d=%.3f,areverse" % fade_out)
    run(["-i", src] + (["-filter_complex", ",".join(chain)] if chain else []) +
        ["-ac", "1", "-ar", str(SR), f])
    parts.append((f, int(at * 1000), gain))


T = lambda frame: frame / 24.0

# ---------------------------------------------------------------- dialogue (frames from the storyboard)
print("dialogue")
# Shot 3, F097: "Panch log hone chahiye..." A J-cut: his voice carries over the register close-up.
clip("t03_count.mp3", T(94), .95)
clip("t05_rahul.mp3", T(169), 1.0)
clip("b_present.mp3", T(193), .78)          # off-screen right, a little far
clip("t06_aman.mp3", T(217), 1.0)
clip("b_present.mp3", T(241), .9)           # closer this time
clip("t07_vikram.mp3", T(265), .9)
clip("t08_koi_nahi.mp3", T(317), 1.0)       # the fan dies under his last word
clip("b_attendance.mp3", T(445), .95)       # from the bench, close, dry, annoyed
clip("t11_tum_kaun.mp3", T(543), .85)
clip("b_dekhte.mp3", T(601), .9)
clip("t14_mar_chuke.mp3", T(748), .7, fade_in=.25)
clip("b_aap_bhi.mp3", T(817), .85, fade_out=.5)
clip("b_whisper.mp3", T(1021), .9, tempo=1.2, fade_out=.4)
clip("giggle.mp3", T(1189), .5, fade_out=.12)

# ---------------------------------------------------------------- room tone: fan and clock, 001-351
print("room tone")
# the fan: a low whir with a blade beat, dying exactly on F349 (14.542 s)
synth("fan", "0.5*(sin(2*PI*118*t)+0.4*sin(2*PI*59*t))*(0.65+0.35*sin(2*PI*7.4*t))", 14.55,
      gain=.075, filters="lowpass=f=420,afade=in:st=0:d=0.4,afade=out:st=14.35:d=0.2")
synth("fanwhir", "0.16*sin(2*PI*236*t)*(0.5+0.5*sin(2*PI*7.4*t))", 14.55,
      gain=.035, filters="lowpass=f=900,afade=out:st=14.35:d=0.2")
# the clock: one tick a second until F351 (14.667 s)
for i in range(15):
    synth("tick%d" % i, "0.5*exp(-120*t)*sin(2*PI*2400*t)", .05, gain=.05, at=i + .02)
# a distant muted bell at F010
synth("bellfar", "0.5*exp(-2.2*t)*(sin(2*PI*523*t)+0.5*sin(2*PI*784*t))", 2.4, gain=.05, at=T(10),
      filters="lowpass=f=1400")
# his breathing, from the end of the fan through the dark
noise("breath", DUR - 14.5, at=14.5, gain=.012,
      filters="bandpass=f=700:w=380,tremolo=f=0.32:d=0.9,afade=in:st=0:d=2")

# ---------------------------------------------------------------- pen taps (the teacher's rhythm)
print("taps")
taps = [88, 91, 94, 140, 144, 148, 184, 188, 232, 236, 280, 284, 288, 292, 620, 630, 640]
for i, f in enumerate(taps):
    synth("pen%d" % i, "0.6*exp(-90*t)*sin(2*PI*1900*t)", .07, gain=.16, at=T(f))
    noise("penN%d" % i, .04, at=T(f), gain=.05, filters="highpass=f=2500,afade=out:st=0.01:d=0.03")
# the bench taps, F376/384/392/400: a finger on wood, polite and slow
for i, f in enumerate([376, 384, 392, 400]):
    synth("wood%d" % i, "0.7*exp(-45*t)*sin(2*PI*320*t)", .12, gain=.2, at=T(f))

# ---------------------------------------------------------------- paper, glass, small objects
print("objects")
for name, fr in [("pg1", 125), ("pg2", 421), ("pg3", 577), ("pg4", 793), ("pg5", 1079)]:
    noise(name, .55, at=T(fr), gain=.07, filters="highpass=f=1200,lowpass=f=6000,afade=in:st=0:d=0.08,afade=out:st=0.2:d=0.35")
synth("glassclick", "0.5*exp(-140*t)*sin(2*PI*3100*t)", .05, gain=.1, at=T(298))     # glasses back on
synth("glassclick2", "0.5*exp(-140*t)*sin(2*PI*2900*t)", .05, gain=.09, at=T(549))
synth("glassclick3", "0.5*exp(-140*t)*sin(2*PI*3000*t)", .05, gain=.08, at=T(778))
synth("penclink", "0.7*exp(-70*t)*sin(2*PI*2600*t)", .35, gain=.13, at=T(785))        # the pen falls
synth("inkdrop", "0.7*exp(-160*t)*sin(2*PI*1500*t)", .06, gain=.1, at=T(712))         # the red drop lands
synth("nibscratch", "0.22*sin(2*PI*1700*t)*(0.6+0.4*sin(2*PI*23*t))", 2.9, gain=.02, at=T(661),
      filters="highpass=f=900,afade=out:st=2.4:d=0.5")
# the light failing twice in shot 15
synth("buzz", "0.4*sin(2*PI*100*t)*(0.5+0.5*sin(2*PI*50*t))", .16, gain=.05, at=T(843))
synth("buzz2", "0.4*sin(2*PI*100*t)*(0.5+0.5*sin(2*PI*50*t))", .16, gain=.05, at=T(847))

# ---------------------------------------------------------------- the door: creak, latch, and after
print("door")
synth("creak", "0.35*sin(2*PI*(150+40*sin(2*PI*1.7*t))*t)*(0.6+0.4*sin(2*PI*9*t))", 2.9, gain=.05, at=T(937),
      filters="lowpass=f=1200,afade=in:st=0:d=0.3,afade=out:st=2.3:d=0.6")
synth("latch", "0.9*exp(-90*t)*sin(2*PI*900*t)+0.5*exp(-40*t)*sin(2*PI*240*t)", .5, gain=.22, at=T(995))
noise("latchN", .06, at=T(995), gain=.12, filters="highpass=f=1800")
synth("thud", "0.9*exp(-16*t)*sin(2*PI*58*t)", .9, gain=.3, at=T(1079))               # the register hits the floor
noise("thudN", .25, at=T(1079), gain=.08, filters="lowpass=f=500")

# ---------------------------------------------------------------- the end: hum, heartbeat, gong, bell, laugh
print("ending")
synth("sub", "0.5*sin(2*PI*40*t)", 4.9, at=T(1081), gain=.06,
      filters="afade=in:st=0:d=1.6,afade=out:st=4.3:d=0.6")
for i, f in enumerate([1130, 1150]):
    synth("hb%d" % i, "0.9*exp(-24*t)*sin(2*PI*44*t)", .5, gain=.22, at=T(f))
    synth("hb%db" % i, "0.7*exp(-26*t)*sin(2*PI*40*t)", .4, gain=.14, at=T(f) + .13)
# the gong on AGOO (F1152), three seconds of decay
synth("gong", "exp(-1.1*t)*(sin(2*PI*98*t)+0.55*sin(2*PI*147*t)+0.35*sin(2*PI*196*t)+0.2*sin(2*PI*293*t))", 3.4,
      gain=.2, at=T(1152))
# the school bell at F1177: loud, warm, clear, one second
synth("bell", "(sin(2*PI*1046*t)+0.6*sin(2*PI*1568*t)+0.3*sin(2*PI*2093*t))*(0.7+0.3*sin(2*PI*26*t))*exp(-2.6*t)",
      1.8, gain=.3, at=T(1177), filters="afade=out:st=1.4:d=0.4")

# ---------------------------------------------------------------- mix
print("mixing %d elements" % len(parts))
inputs, chains = [], []
for i, (f, delay, gain) in enumerate(parts):
    inputs += ["-i", f]
    chains.append("[%d:a]adelay=%d,volume=%.3f[a%d]" % (i, delay, gain, i))   # mono in, one delay value
mix = "".join("[a%d]" % i for i in range(len(parts)))
graph = ";".join(chains) + ";%samix=inputs=%d:duration=longest,volume=%d,apad,atrim=0:%.3f,alimiter=limit=0.9[aout]" % (
    mix, len(parts), len(parts), DUR)
run(inputs + ["-filter_complex", graph, "-map", "[aout]", "-ac", "2", "-ar", str(SR), "-c:a", "pcm_s16le", OUT])
print("wrote " + os.path.relpath(OUT, ROOT))
