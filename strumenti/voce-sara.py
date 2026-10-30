# Registra con la voce Kokoro "Sara" (if_sara) le frasi che mancano.
# Uso: python3 strumenti/voce-sara.py <kokoro-v1.0.onnx> <elenco.json [[impronta, testo], ...]> <cartella delle registrazioni> [velocità]
# Il file voices-v1.0.bin va messo accanto al modello (github.com/thewh1teagle/kokoro-onnx, model-files-v1.0).
# Ogni frase diventa <impronta>.ogg (Opus, mono): piccola e chiara sulle casse della LIM.
import json, subprocess, sys, os, tempfile
import soundfile as sf
from kokoro_onnx import Kokoro

modello, elenco, cartella = sys.argv[1:4]
velocita = float(sys.argv[4]) if len(sys.argv) > 4 else 0.85
voce = Kokoro(modello, os.path.join(os.path.dirname(modello), "voices-v1.0.bin"))
os.makedirs(cartella, exist_ok=True)
frasi = json.load(open(elenco, encoding="utf-8"))
tmp = tempfile.mkdtemp()
for n, (k, testo) in enumerate(frasi, 1):
    dest = os.path.join(cartella, k + ".ogg")
    if os.path.exists(dest):
        continue
    wav = os.path.join(tmp, k + ".wav")
    audio, sr = voce.create(testo, voice="if_sara", speed=velocita, lang="it")
    sf.write(wav, audio, sr)
    # Un attimo di silenzio prima e dopo, così l'inizio della frase non si perde.
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", wav, "-af", "adelay=120,apad=pad_dur=0.25",
                    "-ac", "1", "-c:a", "libopus", "-b:a", "28k", dest + ".part.ogg"], check=True)
    os.replace(dest + ".part.ogg", dest)
    os.remove(wav)
    if n % 100 == 0:
        print(f"{n}/{len(frasi)}", flush=True)
print("Fatto.", flush=True)
