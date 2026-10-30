// Prepara la cartella "La classe di Irene" da usare sul PC della LIM senza internet.
// Uso: node strumenti/pacchetto-offline.mjs <cartella di destinazione> [versione.json della volta prima] [--voce=<cartella delle registrazioni>]
// Con il versione.json della volta prima prepara anche "<destinazione> - solo novità": solo i file
// nuovi o cambiati, da copiare sopra la cartella che c'è già sul PC.
// Dentro ci sono "Apri le lezioni.html" (doppio clic) e la cartella "sito".
// Le lezioni, le verifiche e le prove INVALSI vengono messe tutte in assets/pacchetto.js,
// perché un sito aperto con doppio clic non può leggere i file .json.
// Con --voce: le frasi registrate con la voce "Sara" (strumenti/voce-registrata.mjs) vanno nella cartella voce/
// e il loro elenco in assets/voce-elenco.js; il sito le suona al posto della voce del computer.
import { execSync } from "node:child_process";
import { mkdirSync, copyFileSync, readFileSync, writeFileSync, rmSync, existsSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";

const radice = new URL("..", import.meta.url).pathname;
const opz = process.argv.slice(2).filter((a) => a.startsWith("--")), arg = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const meta = arg[0], prima = arg[1];
const voce = opz.find((a) => a.startsWith("--voce="))?.slice(7);
if (!meta) { console.error("Indica la cartella di destinazione."); process.exit(1); }
if (existsSync(meta)) rmSync(meta, { recursive: true });
const sito = join(meta, "sito");

// Non servono nella cartella: le note tecniche e i file per GitHub. L'area insegnante c'è (resta con la password):
// a casa, con internet, si creano le lezioni e si portano sul PC della LIM con "📂 Aggiungi una lezione da file".
const escludi = /^(LEGGIMI\.md|strumenti\/|\.nojekyll|robots\.txt|404\.html|assets\/senza-internet\.js)/;
const file = execSync("git ls-files", { cwd: radice, encoding: "utf8" }).split("\n").filter((f) => f && !escludi.test(f));

const dati = {};
for (const f of file) {
  mkdirSync(dirname(join(sito, f)), { recursive: true });
  if (/^(lezioni|verifiche|invalsi)\/[\w.-]+\.json$/.test(f)) dati[f] = JSON.parse(readFileSync(join(radice, f), "utf8"));
  if (f.endsWith(".html")) {
    const html = readFileSync(join(radice, f), "utf8")
      .replace('<script src="assets/comune.js"></script>', `<script src="assets/pacchetto.js"></script>\n${voce ? '<script src="assets/voce-elenco.js"></script>\n' : ""}<script src="assets/comune.js"></script>\n<script src="assets/senza-internet.js"></script>`);
    writeFileSync(join(sito, f), html);
  } else copyFileSync(join(radice, f), join(sito, f));
}

const data = new Date().toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
writeFileSync(join(sito, "assets/pacchetto.js"), `// Versione senza internet, preparata il ${data}.
window.SENZA_INTERNET = ${JSON.stringify(data)};
window.PACCHETTO = ${JSON.stringify(dati)};
`);

writeFileSync(join(meta, "Apri le lezioni.html"), `<!doctype html>
<html lang="it"><head><meta charset="utf-8"><title>La classe di Irene</title>
<meta http-equiv="refresh" content="0; url=sito/index.html"></head>
<body style="font:20px system-ui;text-align:center;padding:60px"><a href="sito/index.html">Apri le lezioni</a></body></html>
`);
const registrate = [];
if (voce) {
  mkdirSync(join(sito, "voce"), { recursive: true });
  for (const f of readdirSync(voce).filter((f) => /^[0-9a-f]{16}\.ogg$/.test(f))) { copyFileSync(join(voce, f), join(sito, "voce", f)); registrate.push(f.slice(0, 16)); }
  writeFileSync(join(sito, "assets/voce-elenco.js"), `// Le frasi registrate con la voce "Sara" (Kokoro, if_sara): i file sono in voce/<impronta>.ogg.\nwindow.VOCE_REGISTRATA = { frasi: ${JSON.stringify(registrate.sort())} };\n`);
}
// L'elenco dei file con la loro "impronta": la volta dopo serve per capire che cosa è cambiato.
const impronta = (f) => createHash("sha1").update(readFileSync(join(sito, f))).digest("hex");
copyFileSync(join(radice, "assets/senza-internet.js"), join(sito, "assets/senza-internet.js"));
const tutti = [...file, "assets/pacchetto.js", "assets/senza-internet.js", ...(voce ? ["assets/voce-elenco.js", ...registrate.map((k) => `voce/${k}.ogg`)] : [])];
const versione = { data, file: Object.fromEntries(tutti.map((f) => [f, impronta(f)])) };
writeFileSync(join(sito, "versione.json"), JSON.stringify(versione, null, 1));

if (prima) {
  const vecchia = JSON.parse(readFileSync(prima, "utf8")).file;
  const cambiati = tutti.filter((f) => vecchia[f] !== versione.file[f]).concat("versione.json");
  const nov = `${meta} - solo novità`, dentro = join(nov, "La classe di Irene", "sito");
  if (existsSync(nov)) rmSync(nov, { recursive: true });
  for (const f of cambiati) { mkdirSync(dirname(join(dentro, f)), { recursive: true }); copyFileSync(join(sito, f), join(dentro, f)); }
  const tolti = Object.keys(vecchia).filter((f) => !versione.file[f]);
  const elenca = (a) => a.length > 40 ? a.filter((f) => !f.startsWith("voce/")).join(", ") + ` e ${a.filter((f) => f.startsWith("voce/")).length} frasi registrate` : a.join(", ");
  console.log(`Novità: ${cambiati.length} file.`, elenca(cambiati.filter((f) => f !== "versione.json")));
  if (tolti.length) console.log("Non servono più (si possono lasciare):", tolti.join(", "));
}
console.log(`Pronta: ${file.length} file, ${Object.keys(dati).length} tra lezioni, verifiche e prove${voce ? `, ${registrate.length} frasi registrate` : ""}.`);
