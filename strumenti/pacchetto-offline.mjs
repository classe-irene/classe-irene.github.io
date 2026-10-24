// Prepara la cartella "La classe di Irene" da usare sul PC della LIM senza internet.
// Uso: node strumenti/pacchetto-offline.mjs <cartella di destinazione>
// Dentro ci sono "Apri le lezioni.html" (doppio clic) e la cartella "sito".
// Le lezioni, le verifiche e le prove INVALSI vengono messe tutte in assets/pacchetto.js,
// perché un sito aperto con doppio clic non può leggere i file .json.
import { execSync } from "node:child_process";
import { mkdirSync, copyFileSync, readFileSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";

const radice = new URL("..", import.meta.url).pathname;
const meta = process.argv[2];
if (!meta) { console.error("Indica la cartella di destinazione."); process.exit(1); }
if (existsSync(meta)) rmSync(meta, { recursive: true });
const sito = join(meta, "sito");

// Non servono senza internet: l'area insegnante (crea lezioni con l'intelligenza artificiale) e le note tecniche.
const escludi = /^(area-insegnante\.html|LEGGIMI\.md|strumenti\/|\.nojekyll|robots\.txt|404\.html)/;
const file = execSync("git ls-files", { cwd: radice, encoding: "utf8" }).split("\n").filter((f) => f && !escludi.test(f));

const dati = {};
for (const f of file) {
  mkdirSync(dirname(join(sito, f)), { recursive: true });
  if (/^(lezioni|verifiche|invalsi)\/[\w.-]+\.json$/.test(f)) dati[f] = JSON.parse(readFileSync(join(radice, f), "utf8"));
  if (f.endsWith(".html")) {
    const html = readFileSync(join(radice, f), "utf8")
      .replace('<script src="assets/comune.js"></script>', '<script src="assets/pacchetto.js"></script>\n<script src="assets/comune.js"></script>');
    writeFileSync(join(sito, f), html);
  } else copyFileSync(join(radice, f), join(sito, f));
}

const data = new Date().toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
writeFileSync(join(sito, "assets/pacchetto.js"), `// Versione senza internet, preparata il ${data}.
window.SENZA_INTERNET = ${JSON.stringify(data)};
window.PACCHETTO = ${JSON.stringify(dati)};
// L'area insegnante qui non c'è: nascondo i pulsanti che portano lì.
document.head.insertAdjacentHTML("beforeend", '<style>a[href^="area-insegnante"], .banda-cinque { display: none !important; }</style>');
`);

writeFileSync(join(meta, "Apri le lezioni.html"), `<!doctype html>
<html lang="it"><head><meta charset="utf-8"><title>La classe di Irene</title>
<meta http-equiv="refresh" content="0; url=sito/index.html"></head>
<body style="font:20px system-ui;text-align:center;padding:60px"><a href="sito/index.html">Apri le lezioni</a></body></html>
`);
console.log(`Pronta: ${file.length} file, ${Object.keys(dati).length} tra lezioni, verifiche e prove.`);
