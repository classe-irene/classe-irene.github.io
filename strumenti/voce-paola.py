# Registra con la voce Piper "Paola" le frasi che mancano.
# Uso: python3 strumenti/voce-paola.py <modello .onnx> <elenco.json [[impronta, testo], ...]> <cartella delle registrazioni> [lentezza]
# Ogni frase diventa <impronta>.ogg (Opus, mono): piccola e chiara sulle casse della LIM.
import json, subprocess, sys, wave, os, tempfile
from piper import PiperVoice, SynthesisConfig

modello, elenco, cartella = sys.argv[1:4]
lentezza = float(sys.argv[4]) if len(sys.argv) > 4 else 1.25
voce = PiperVoice.load(modello)
cfg = SynthesisConfig(length_scale=lentezza)
os.makedirs(cartella, exist_ok=True)
frasi = json.load(open(elenco, encoding="utf-8"))
tmp = tempfile.mkdtemp()
for n, (k, testo) in enumerate(frasi, 1):
    dest = os.path.join(cartella, k + ".ogg")
    if os.path.exists(dest):
        continue
    wav = os.path.join(tmp, k + ".wav")
    with wave.open(wav, "wb") as w:
        voce.synthesize_wav(testo, w, syn_config=cfg)
    # Un attimo di silenzio prima e dopo, così l'inizio della frase non si perde.
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", wav, "-af", "adelay=120,apad=pad_dur=0.25",
                    "-ac", "1", "-c:a", "libopus", "-b:a", "28k", dest + ".part.ogg"], check=True)
    os.replace(dest + ".part.ogg", dest)
    os.remove(wav)
    if n % 100 == 0:
        print(f"{n}/{len(frasi)}", flush=True)
print("Fatto.", flush=True)
