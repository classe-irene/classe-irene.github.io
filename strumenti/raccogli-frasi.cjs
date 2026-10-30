// Raccoglie tutte le frasi fisse che il sito legge ad alta voce, per registrarle prima con la voce "Paola".
// Uso: node strumenti/raccogli-frasi.cjs "<cartella sito del pacchetto senza internet>" frasi.json
// Apre ogni pagina con Chromium (senza rete), legge i pulsanti 🔊, fa partire le letture, le filastrocche,
// i video guida e la lezione guidata con il tempo accelerato, e annota ogni frase passata a Voce.parla.
const { chromium } = require("playwright");
const { readdirSync, writeFileSync, readFileSync } = require("fs");
const { join } = require("path");

const sito = process.argv[2], uscita = process.argv[3] || "frasi.json";
const url = (p) => "file://" + join(sito, p);
const pagine = [
  ...readdirSync(join(sito, "lezioni")).filter((f) => f.endsWith(".json")).map((f) => `lezione.html?file=lezioni/${f}&nosipario=1`),
  ...readdirSync(join(sito, "verifiche")).filter((f) => f.endsWith(".json")).map((f) => `verifica.html?file=verifiche/${f}&modo=online`),
  ...readdirSync(join(sito, "invalsi")).filter((f) => f.endsWith(".json")).map((f) => `invalsi.html?file=invalsi/${f}`),
  "index.html", "equivalenze.html", "invalsi.html",
];

// Voce finta che finisce subito e orologio veloce: le letture a catena arrivano in fondo in pochi secondi.
const prima = () => {
  const vero = window.setTimeout.bind(window);
  window.setTimeout = (f, t, ...r) => vero(f, Math.min((t || 0) / 25, 200), ...r);
  class U extends EventTarget { constructor(t) { super(); this.text = t; } }
  const finta = { speaking: false, pending: false, paused: false, getVoices: () => [], cancel() {}, pause() {}, resume() {}, addEventListener() {},
    speak(u) { vero(() => { const e = new Event("end"); u.dispatchEvent(e); u.onend?.(e); }, 5); } };
  Object.defineProperty(window, "speechSynthesis", { value: finta });
  window.SpeechSynthesisUtterance = U;
  window.__frasi = [];
  document.addEventListener("DOMContentLoaded", () => {
    const parla = Voce.parla.bind(Voce);
    Voce.parla = (t, ...r) => { try { window.__frasi.push(Voce.pulisci(t)); } catch {} return parla(t, ...r); };
  });
};

(async () => {
  const browser = await chromium.launch();
  const frasi = new Map();
  for (const p of pagine) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, offline: true });
    const pg = await ctx.newPage();
    pg.on("dialog", (d) => d.dismiss());
    await pg.addInitScript(prima);
    await pg.goto(url(p));
    await pg.waitForTimeout(400);
    const clic = async (sel, attesa = 300) => {
      for (const el of await pg.$$(sel)) { try { await el.evaluate((b) => b.click()); await pg.waitForTimeout(attesa); } catch {} }
    };
    // I pulsanti 🔊: la frase sta già scritta nell'attributo.
    const attr = await pg.$$eval("[data-leggi]", (bs) => bs.map((b) => b.dataset.leggi).filter(Boolean).map((t) => Voce.pulisci(t)));
    await clic("[data-leggi]", 30);
    await clic('[data-azione="storia"], .carta-scopri, [data-svela]', 50);
    await clic('[data-azione="leggi-tutto"]', 3000);
    await clic('[data-azione="filastrocca"]', 4000);
    await clic('[data-anim="play"]', 2500);
    // Lezione guidata: tutte le fasi, con "Salta alla fase dopo", e il semaforo.
    if (await pg.$('[data-azione="guidata"]')) {
      await clic('[data-azione="guidata"]', 800);
      await clic('[data-gp="via"]', 1500);
      await clic('[data-go="rosso"], [data-go="giallo"], [data-go="verde"]', 300);
      for (let i = 0; i < 15 && await pg.$('[data-go="avanti"]'); i++) { await pg.evaluate(() => document.querySelector('[data-go="avanti"]')?.click()); await pg.waitForTimeout(400); }
      await clic('[data-go="fine"]', 500);
    }
    const dette = await pg.evaluate(() => window.__frasi);
    let nuove = 0;
    for (const t of [...attr, ...dette]) if (t && !frasi.has(t)) { frasi.set(t, p); nuove++; }
    console.log(`${p}: ${nuove} frasi nuove`);
    await ctx.close();
  }
  // Le frasi scritte così come sono nel codice (avvisi, complimenti).
  const scritte = [];
  for (const f of readdirSync(join(sito, "assets")).filter((f) => f.endsWith(".js"))) {
    const js = readFileSync(join(sito, "assets", f), "utf8");
    for (const m of js.matchAll(/(?:Voce\.parla|leggi|annuncia)\(\s*"([^"\\]{2,})"/g)) scritte.push(m[1]);
  }
  const pg = await browser.newPage();
  await pg.goto(url("index.html"));
  for (const t of await pg.evaluate((a) => a.map((t) => Voce.pulisci(t)), scritte)) if (t && !frasi.has(t)) frasi.set(t, "codice");
  await browser.close();
  writeFileSync(uscita, JSON.stringify([...frasi.keys()], null, 1));
  console.log(`Totale: ${frasi.size} frasi.`);
})();
