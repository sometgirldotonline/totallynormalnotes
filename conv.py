from pysstv.color import Robot36
from scipy.io.wavfile import write
from PIL import Image
import numpy as np

# --- Config ---
input_file = "output_320x240_8bit.png"
output_file = "output.wav"
samplerate = 44100  # Hz
bits = 16           # audio bit depth

# --- Load image ---
img = Image.open(input_file).convert("RGB")

# --- Create SSTV object ---
robot = Robot36(img, samples_per_sec=samplerate, bits=bits)

# --- Generate samples ---
samples = robot.gen_samples()

# --- Convert to proper type for WAV ---
if bits == 16:
    data = np.int16(samples * 32767)
elif bits == 8:
    data = np.uint8((samples + 1.0) * 127.5)
else:
    raise ValueError("Unsupported bit depth")

# --- Write WAV file ---
write(output_file, samplerate, data)

print(f"WAV saved to {output_file}")
