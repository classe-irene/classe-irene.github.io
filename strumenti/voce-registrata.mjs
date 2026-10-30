// Registra in anticipo con la voce "Paola" le frasi fisse del sito (versione senza internet).
// Uso: node strumenti/voce-registrata.mjs <frasi.json da raccogli-frasi.cjs> <cartella delle registrazioni> <it_IT-paola-medium.onnx>
// Le frasi già registrate restano: si registrano solo quelle nuove. Poi pacchetto-offline.mjs --voce=<cartella> le mette nel pacchetto.
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { tmpdir } from "node:os";

// La stessa impronta di Voce in assets/comune.js: è il nome del file di ogni frase.
export function impronta(t) {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < t.length; i++) { const c = t.charCodeAt(i); h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677); }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, "0") + (h1 >>> 0).toString(16).padStart(8, "0");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [frasi, cartella, modello] = process.argv.slice(2);
  if (!modello) { console.error("Uso: node strumenti/voce-registrata.mjs frasi.json <cartella> <modello.onnx>"); process.exit(1); }
  const elenco = JSON.parse(readFileSync(frasi, "utf8")).map((t) => [impronta(t), t]);
  const tmp = join(mkdtempSync(join(tmpdir(), "voce-")), "elenco.json");
  writeFileSync(tmp, JSON.stringify(elenco));
  execFileSync("python3", [new URL("voce-paola.py", import.meta.url).pathname, modello, tmp, cartella], { stdio: "inherit" });
  // L'indice: impronta → testo, per sapere che cosa c'è in ogni file.
  writeFileSync(join(cartella, "indice.json"), JSON.stringify(Object.fromEntries(elenco), null, 1));
}
