"""Original synthesized scene sounds. No samples, network or paid services.
Usage: python create-vn-ep12-audio.py <ffmpeg executable> <output directory>
"""
import hashlib
import json
import math
from pathlib import Path
import random
import subprocess
import sys
import tempfile
import wave
from array import array

RATE = 44100
rng = random.Random(120219)

def tone(t, frequency):
    return math.sin(math.tau * frequency * t)

def make(name, duration):
    noise = 0.0
    samples = array('h')
    peak = 0.0
    square = 0.0
    for n in range(round(RATE * duration)):
        t = n / RATE
        noise = .985 * noise + .015 * rng.uniform(-1, 1)
        if name == 'street-air':
            value = noise * .8 + .009 * tone(t, 47) * (1 + .3 * tone(t, .13))
        elif name == 'night-room':
            value = noise * .28 + .003 * tone(t, 73)
        elif name == 'heartbeat':
            phase = t % .79
            value = sum(.19 * math.exp(-((phase - p) / .04) ** 2) * tone(t, f) for p, f in [(.09, 57), (.26, 49)])
        elif name == 'message':
            value = sum(.12 * math.exp(-(t - p) * 12) * tone(t - p, f) for p, f in [(0, 880), (.105, 1174.66)] if t >= p)
        else:
            value = .18 * math.exp(-t * 46) * (tone(t, 220) + noise * 2)
        edge = min(1.0, t / .015, max(0.0, (duration - t) / .05))
        value *= edge
        peak = max(peak, abs(value)); square += value * value
        samples.append(round(max(-.95, min(.95, value)) * 32767))
    return samples, peak, math.sqrt(square / len(samples))

def main():
    encoder, output = Path(sys.argv[1]).resolve(), Path(sys.argv[2]).resolve()
    output.mkdir(parents=True, exist_ok=True)
    records = []
    for name, duration in [('street-air', 12), ('night-room', 12), ('heartbeat', 3.16), ('message', .65), ('tablet', .4)]:
        samples, peak, rms = make(name, duration)
        with tempfile.TemporaryDirectory(prefix='vn-ep12-audio-') as temporary:
            wav = Path(temporary) / (name + '.wav')
            with wave.open(str(wav), 'wb') as stream:
                stream.setnchannels(1); stream.setsampwidth(2); stream.setframerate(RATE); stream.writeframes(samples.tobytes())
            destination = output / (name + '.mp3')
            subprocess.run([str(encoder), '-hide_banner', '-loglevel', 'error', '-y', '-i', str(wav), '-codec:a', 'libmp3lame', '-b:a', '128k', str(destination)], check=True)
            records.append(dict(file=destination.name, duration=duration, peak=peak, rms=rms, sha256=hashlib.sha256(destination.read_bytes()).hexdigest()))
    (output / 'audio-provenance.json').write_text(json.dumps(dict(method='Original deterministic procedural synthesis; no recordings or samples',seed=120219,sampleRate=RATE,paidCreditsUsed=0,assets=records), indent=2), encoding='utf-8')
    print(json.dumps(records, indent=2))

if __name__ == '__main__':
    main()
