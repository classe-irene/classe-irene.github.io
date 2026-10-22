// Funzioni condivise da tutte le pagine: testata, mascotte, suoni, voce, archivio locale.

// La mascotte: la maestra in mezzo ai suoi bambini (immagini 3D di assets/emoji).
const figuraEmoji = (f, cls) => `<img class="${cls}" src="assets/emoji/${f}.webp" alt="" draggable="false">`;
window.MASCOTTE = `
<div class="maestra-classe" role="img" aria-label="La maestra con i suoi bambini">
  <img class="mc-maestra" src="assets/disegni/maestra.svg" alt="" draggable="false">
  ${[["1f467-1f3fb", 1], ["1f466-1f3fd", 2], ["1f467-1f3fe", 3], ["1f466-1f3fc", 4], ["1f467", 5], ["1f466-1f3ff", 6]].map(([f, k]) => figuraEmoji(f, `mc-bimbo mc-b${k}`)).join("")}
</div>`;
window.LOGO = `<img class="logo-maestra" src="assets/disegni/maestra.svg" alt="" draggable="false">`;

window.creaTestata = function (attivo) {
  document.querySelectorAll("header.testata, footer.piede").forEach((x) => x.remove());
  const t = document.createElement("header");
  t.className = "testata";
  t.innerHTML = `
    <div class="contenitore">
      <a class="logo" href="index.html">${LOGO}<span>${SITO.nome}</span></a>
      <nav class="nav">
        <a href="index.html#matematica" class="${attivo === "matematica" ? "attivo" : ""}">🔢 Matematica</a>
        <a href="index.html#scienze" class="${attivo === "scienze" ? "attivo" : ""}">🔬 Scienze</a>
        <a href="album.html" class="${attivo === "album" ? "attivo" : ""}">🏆 Figurine</a>
        <a href="area-insegnante.html" class="${attivo === "cinque" ? "attivo" : ""}">🔒 Area insegnante</a>
      </nav>
    </div>`;
  document.body.prepend(t);
  const p = document.createElement("footer");
  p.className = "piede";
  p.textContent = `${SITO.nome} · ${SITO.motto}`;
  document.body.append(p);
};

window.parametri = () => Object.fromEntries(new URLSearchParams(location.search));

window.escapeHTML = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ---------- Archivio delle lezioni create con "5 minuti" (nel browser) ---------- */
window.Archivio = {
  chiave: "classe-irene-lezioni",
  tutte() {
    try { return JSON.parse(localStorage.getItem(this.chiave)) || []; } catch { return []; }
  },
  salva(lezione) {
    const elenco = this.tutte().filter((l) => l.id !== lezione.id);
    elenco.unshift(lezione);
    try { localStorage.setItem(this.chiave, JSON.stringify(elenco)); return true; } catch { return false; }
  },
  prendi(id) { return this.tutte().find((l) => l.id === id); },
  elimina(id) {
    try { localStorage.setItem(this.chiave, JSON.stringify(this.tutte().filter((l) => l.id !== id))); } catch {}
  },
};

/* ---------- Suoni (generati, nessun file da scaricare) ---------- */
window.Suono = (() => {
  let ctx;
  function nota(freq, inizio, durata, tipo = "sine", vol = 0.15) {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = tipo; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, ctx.currentTime + inizio);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + inizio + durata);
    o.connect(g).connect(ctx.destination);
    o.start(ctx.currentTime + inizio); o.stop(ctx.currentTime + inizio + durata);
  }
  let attivo = true;
  return {
    get attivo() { return attivo; },
    set attivo(v) { attivo = v; },
    giusto() { if (!attivo) return; try { nota(660, 0, .15); nota(880, .1, .25); } catch {} },
    sbagliato() { if (!attivo) return; try { nota(220, 0, .25, "triangle", .12); } catch {} },
    festa() { if (!attivo) return; try { [523, 659, 784, 1047].forEach((f, i) => nota(f, i * .12, .3)); } catch {} },
  };
})();

/* ---------- Telecomando della voce ----------
   Pulsanti grandi in basso, sempre visibili mentre la voce parla:
   ⏸ Pausa / ▶ Riprendi, 🔁 Da capo, ⏹ Stop. Anche le scritte stanno qui dentro. */
window.Telecomando = (() => {
  let dock, timer;
  function crea() {
    if (dock) return dock;
    dock = document.createElement("div"); dock.className = "voce-dock via";
    dock.innerHTML = `<div class="tc-maniglia" title="Trascina per spostare" aria-label="Maniglia: trascina per spostare"><span class="tc-presa">⠿</span> Trascinami <span class="tc-presa">⠿</span></div>
      <div class="telecomando" role="toolbar" aria-label="Comandi della voce">
      <span class="tc-onde" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
      <button class="tc-btn tc-pausa" type="button" data-tc="pausa"><span class="tc-ico">⏸</span><span class="tc-txt">Pausa</span></button>
      <button class="tc-btn tc-dacapo" type="button" data-tc="dacapo"><span class="tc-ico">🔁</span><span class="tc-txt">Da capo</span></button>
      <button class="tc-btn tc-stop" type="button" data-tc="stop"><span class="tc-ico">⏹</span><span class="tc-txt">Stop</span></button>
    </div>`;
    dock.addEventListener("click", (e) => {
      const b = e.target.closest("[data-tc]"); if (!b) return;
      const a = b.dataset.tc;
      if (a === "pausa") Voce.inPausa ? Voce.riprendi() : Voce.pausa();
      else if (a === "dacapo") Voce.daCapo();
      else Voce.ferma();
    });
    document.body.append(dock);
    trascina(dock, dock.querySelector(".tc-maniglia"));
    return dock;
  }
  // Maniglia: il riquadro si sposta col dito (LIM) o col mouse; la posizione resta su questo computer.
  const CHIAVE_POS = "classe-irene-scritte-pos";
  function metti(d, x, y) {
    const r = d.getBoundingClientRect();
    x = Math.min(Math.max(x, 0), innerWidth - r.width); y = Math.min(Math.max(y, 0), innerHeight - r.height);
    d.style.left = x + "px"; d.style.top = y + "px"; d.classList.add("spostato");
  }
  function trascina(d, m) {
    try { const p = JSON.parse(localStorage.getItem(CHIAVE_POS)); if (p) requestAnimationFrame(() => metti(d, p.x * innerWidth, p.y * innerHeight)); } catch {}
    let dx = 0, dy = 0, attivo = false;
    m.addEventListener("pointerdown", (e) => {
      const r = d.getBoundingClientRect(); dx = e.clientX - r.left; dy = e.clientY - r.top; attivo = true;
      m.setPointerCapture(e.pointerId); d.classList.add("trascino"); e.preventDefault();
    });
    m.addEventListener("pointermove", (e) => { if (attivo) metti(d, e.clientX - dx, e.clientY - dy); });
    const fine = () => {
      if (!attivo) return; attivo = false; d.classList.remove("trascino");
      const r = d.getBoundingClientRect();
      try { localStorage.setItem(CHIAVE_POS, JSON.stringify({ x: r.left / innerWidth, y: r.top / innerHeight })); } catch {}
    };
    m.addEventListener("pointerup", fine); m.addEventListener("pointercancel", fine);
    // Doppio tocco sulla maniglia: torna al centro.
    m.addEventListener("dblclick", () => { d.classList.remove("spostato"); d.style.left = d.style.top = ""; try { localStorage.removeItem(CHIAVE_POS); } catch {} });
    addEventListener("resize", () => { if (d.classList.contains("spostato")) { const r = d.getBoundingClientRect(); metti(d, r.left, r.top); } });
  }
  function stato(s) {
    clearTimeout(timer);
    if (s === "fermo") { if (dock) timer = setTimeout(() => dock.classList.add("via"), 1700); dock?.classList.remove("in-pausa"); return; }
    const d = crea();
    d.classList.remove("via");
    d.classList.toggle("in-pausa", s === "pausa");
    const b = d.querySelector(".tc-pausa");
    b.querySelector(".tc-ico").textContent = s === "pausa" ? "▶" : "⏸";
    b.querySelector(".tc-txt").textContent = s === "pausa" ? "Riprendi" : "Pausa";
  }
  // Barra spaziatrice o tasto P: pausa e ripresa (quando il telecomando è visibile).
  document.addEventListener("keydown", (e) => {
    if (!dock || dock.classList.contains("via") || e.target.closest?.("input, textarea, select, [contenteditable]")) return;
    if (e.key === "p" || e.key === "P") { e.preventDefault(); Voce.inPausa ? Voce.riprendi() : Voce.pausa(); }
    if (e.key === "Escape") Voce.ferma();
  });
  return { stato, dock: crea };
})();

/* ---------- Voce: legge ad alta voce in italiano ----------
   Sceglie la voce femminile italiana più naturale disponibile sul computer.
   L'insegnante può cambiarla nell'area insegnante: la scelta resta su quel computer. */
window.Voce = (() => {
  const CHIAVE = "classe-irene-voce";
  const CHIAVE_VEL = "classe-irene-velocita";
  // Velocità di lettura: lenta di base, pensata per bambini con DSA.
  const VELOCITA = { "molto lenta": 0.6, "lenta": 0.72, "normale": 0.85 };
  // In ordine di preferenza: voci "naturali" di Edge/Windows, Chrome, Apple.
  const PREFERITE = [/elsa.*natural/i, /isabella.*natural/i, /natural.*it/i, /google italiano/i, /alice/i, /federica/i, /elsa/i, /paola/i, /emma/i];
  const MASCHILI = /cosimo|diego|luca|giuseppe|benigno|marcello|rinaldi/i;
  let voci = [], ora = null, giro = 0;
  const carica = () => { voci = ("speechSynthesis" in window) ? speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith("it")) : []; };
  carica();
  if ("speechSynthesis" in window) speechSynthesis.addEventListener?.("voiceschanged", carica);
  function scelta() {
    let nome = null;
    try { nome = localStorage.getItem(CHIAVE); } catch {}
    const salvata = voci.find((v) => v.name === nome);
    if (salvata) return salvata;
    for (const re of PREFERITE) { const v = voci.find((x) => re.test(x.name)); if (v) return v; }
    return voci.find((v) => !MASCHILI.test(v.name)) || voci[0];
  }
  // "1 pacco" letto dal sintetizzatore diventa "uno pacco": lo trasformo in "un pacco", "una decina", "uno zaino".
  // Dopo "1" queste parole non sono nomi: "scrivo 1 sopra", "porto 1 nella diagonale", "1 più 1".
  const NON_NOMI = /^(sopra|sotto|nella|nel|nello|nei|nelle|e|ed|o|più|meno|per|di|da|a|in|con|su|fa|fanno|è|sono|volta|alla|al|allo|della|del|dello|dopo|prima|poi|che|come|se|non|si|ci|ne|lo|la|le|li|il|gli|un|una|uno|uguale|diviso|virgola)$/i;
  const FEMMINILI = /^(mano|radio|foto|moto|eco|auto|bici)$/i;
  function articolo(parola) {
    const p = parola.toLowerCase();
    const femminile = FEMMINILI.test(p) || /(a|à|ione|tù)$/.test(p) && !/^(problema|tema|sistema|pigiama|papà|pianeta|cinema|programma|clima|poeta)$/.test(p);
    if (femminile) return /^[aeiouàèéìòù]/.test(p) ? "un'" : "una ";
    return /^(s[^aeiouàèéìòù]|z|gn|ps|pn|x|y)/.test(p) ? "uno " : "un ";
  }
  // "1 000" o "1.000" -> "1000", così la voce dice "mille" e non "uno, zero zero zero".
  // Sigle delle equivalenze lette per intero: "3 dak" -> "3 decine di migliaia", "1 h" -> "un centinaio".
  const SIGLE = { hk: ["centinaio di migliaia", "centinaia di migliaia"], dak: ["decina di migliaia", "decine di migliaia"], uk: ["unità di migliaia", "unità di migliaia"],
    k: ["migliaio", "migliaia"], h: ["centinaio", "centinaia"], da: ["decina", "decine"], u: ["unità", "unità"] };
  // Frazioni lette come a scuola: "3/4" -> "3 quarti", "1/2" -> "un mezzo".
  const FRAZ = { 2: ["mezzo", "mezzi"], 3: ["terzo", "terzi"], 4: ["quarto", "quarti"], 5: ["quinto", "quinti"], 6: ["sesto", "sesti"],
    7: ["settimo", "settimi"], 8: ["ottavo", "ottavi"], 9: ["nono", "noni"], 10: ["decimo", "decimi"] };
  const sigle = (t) => t
    .replace(/(^|[^\d,])(\d[\d,]*) ?(hk|dak|uk|k|h|da|u)\b(?![àèéìòù'])/g, (m, p, num, s) => `${p}${num} ${SIGLE[s][num === "1" ? 0 : 1]}`)
    .replace(/\b(casella|colonna) (hk|dak|uk|h|da|u)\b(?![àèéìòù'])/g, (m, c, s) => `${c} delle ${SIGLE[s][1]}`)
    .replace(/\b([Qq]uant[ei]) (hk|dak|uk|h|da|u)\b(?![àèéìòù'])/g, (m, q, s) => `${q} ${SIGLE[s][1]}`)
    .replace(/\b(hk|dak|uk)\b/g, (m, s) => SIGLE[s][1])
    .replace(/(^|[^\d\/])(\d{1,2})\/(\d{1,2})(?![\d\/])/g, (m, p, n, d) => (FRAZ[d] ? `${p}${n === "1" ? "un" : n} ${FRAZ[d][n === "1" ? 0 : 1]}` : m))
    .replace(/(\d) : (\d)/g, "$1 diviso $2").replace(/(\d) × (\d)/g, "$1 per $2").replace(/(\d) − (\d)/g, "$1 meno $2")
    .replace(/ = /g, " uguale a ")
    .replace(/ < /g, " è minore di ").replace(/ > /g, " è maggiore di ").replace(/ \+ /g, " più ");
  const leggibile = (t) => sigle(t.replace(/(\d)[ \u00a0\u202f.](?=\d{3}(?!\d))/g, "$1")).replace(/(^|[^\d,.])1 ([a-zàèéìòù]+)/gi, (tutto, prima, parola) =>
    NON_NOMI.test(parola) ? tutto : prima + articolo(parola) + parola);

  const Voce = {
    leggibile,
    elenco: () => voci,
    scelta,
    imposta(nome) { try { localStorage.setItem(CHIAVE, nome); } catch {} },
    VELOCITA,
    velocita() { let v = null; try { v = localStorage.getItem(CHIAVE_VEL); } catch {} return VELOCITA[v] ? v : "lenta"; },
    impostaVelocita(nome) { try { localStorage.setItem(CHIAVE_VEL, nome); } catch {} },
    // "fine" (facoltativa) viene chiamata quando la voce ha finito di parlare.
    // opz.scritte = false: niente scritte a schermo (per esempio nei video, che hanno già la loro didascalia).
    parla(testo, fine, opz = {}) {
      if (!("speechSynthesis" in window)) { if (fine) setTimeout(fine, 2500); return; }
      // Le emoji non vanno lette ad alta voce.
      const pulito = leggibile(String(testo).replace(/[0-9#*]\uFE0F?\u20E3/gu, "").replace(/\p{Extended_Pictographic}|️|‍/gu, "").replace(/\s+/g, " ").trim());
      ora = { pulito, fine, opz, pos: 0, pausa: false, comandi: opz.scritte !== false && pulito.split(" ").length >= 3 };
      dici(0);
    },
    // Telecomando: pausa, riprendi, da capo, stop. In pausa la voce si ferma davvero;
    // quando riparte, ricomincia dall'inizio della frase interrotta (così il bambino non perde il filo).
    pausa() {
      if (!ora || ora.pausa) return;
      ora.pausa = true; giro++; clearTimeout(ora.timer);
      let pos = ora.confini ? ora.pos : ora.da + Math.round((performance.now() - (ora.t0 || performance.now())) / 1000 * 11 * (ora.rate || .72));
      pos = Math.min(Math.max(pos, ora.da), ora.pulito.length);
      const prima = ora.pulito.slice(0, pos);
      const m = [...prima.matchAll(/[.!?]\s+/g)].pop();
      ora.ripresa = m ? m.index + m[0].length : 0;
      speechSynthesis.cancel();
      Telecomando.stato("pausa");
    },
    riprendi() { if (ora?.pausa) { ora.pausa = false; dici(ora.ripresa || 0); } },
    daCapo() { if (ora) { ora.pausa = false; dici(0); } },
    ferma() {
      giro++; if (ora) clearTimeout(ora.timer); ora = null;
      if ("speechSynthesis" in window) speechSynthesis.cancel();
      Telecomando.stato("fermo");
      document.dispatchEvent(new CustomEvent("voce-ferma"));
    },
    get inPausa() { return !!ora?.pausa; },
  };
  return Voce;
  function dici(da) {
    const g = ++giro, o = ora;
    speechSynthesis.cancel();
    clearTimeout(o.timer);
    const parte = o.pulito.slice(da);
    o.da = da; o.pos = da; o.confini = false; o.t0 = 0;
    const u = new SpeechSynthesisUtterance(parte);
    u.lang = "it-IT"; u.rate = o.rate = VELOCITA[Voce.velocita()]; u.pitch = 1.05;
    const v = scelta(); if (v) u.voice = v;
    u.addEventListener("start", () => { if (g === giro) o.t0 = performance.now(); });
    u.addEventListener("boundary", (ev) => { if (g === giro) { o.confini = true; o.pos = da + ev.charIndex; } });
    const finito = () => {
      if (g !== giro || o.pausa) return;
      giro++; clearTimeout(o.timer);
      if (ora === o) ora = null;
      Telecomando.stato("fermo");
      if (o.fine) o.fine();
    };
    u.onend = finito; u.onerror = finito;
    o.timer = setTimeout(finito, 4000 + parte.length * 140);
    if (o.opz.scritte !== false) window.Sottotitoli?.mostra(parte, u, o.opz);
    if (o.comandi) Telecomando.stato("parla");
    speechSynthesis.speak(u);
  }
})();
window.leggi = (t, fine) => Voce.parla(t, fine);

/* ---------- Scritte a schermo mentre la voce parla ----------
   Le parole compaiono una alla volta, con caratteri allegri; la parola detta in quel momento si illumina.
   Le parole importanti della lezione hanno accanto la loro iconcina. */
window.Sottotitoli = (() => {
  const CHIAVE = "classe-irene-scritte";
  let attivo = (() => { try { return localStorage.getItem(CHIAVE) !== "no"; } catch { return true; } })();
  let box, giro = 0, timer;
  const diz = new Map(Object.entries({ ciao: "👋", caramell: "🍬", pacc: "📦", missione: "🎯", aiut: "🤝", pensa: "🤔", guard: "👀", ascolt: "👂",
    acqua: "💧", ghiacci: "🧊", sole: "☀️", caldo: "🔥", fredd: "❄️", piant: "🌱", fior: "🌸", animal: "🐾", fung: "🍄", libr: "📚",
    bambin: "🧒", scuola: "🏫", casa: "🏠", ricord: "📌", gioc: "🎲", figurin: "🏆", tabella: "🗂️", virgola: "🔴", zer: "⭕",
    migliai: "🏟️", centinai: "💯", decin: "🔟", unità: "1️⃣", numer: "🔢", cifr: "🔢", moltiplic: "✖️", somm: "➕", sottra: "➖", divisi: "➗" }));
  const norm = (w) => w.toLowerCase().replace(/[^a-zàèéìòù]/g, "");
  function icona(w) {
    const p = norm(w);
    if (p.length < 4) return null;
    for (const [k, e] of diz) if (p.startsWith(k)) return e;
    return null;
  }
  // La lezione aggiunge le sue parole: "🍬 caramelle" → caramell = 🍬
  // Solo etichette brevi ("🫁 polmoni"): in una frase lunga l'emoji non vale per ogni parola.
  // Le etichette più corte vincono: "🫁 polmoni" conta più di "🧠 sistema nervoso".
  function dizionario(voci) {
    const messe = new Set();
    const brevi = voci.map((v) => Figura.dividi(v || "")).map((x) => ({ ...x, parole: x.testo.trim().split(/\s+/).filter(Boolean) }))
      .filter((x) => x.emoji && x.parole.length && x.parole.length <= 3).sort((a, b) => a.parole.length - b.parole.length);
    for (const { emoji, parole } of brevi) for (const w of parole) {
      const p = norm(w);
      if (p.length < 4 || /^(sono|della|delle|degli|dalla|nella|nelle|questo|questa|ogni|anche)$/.test(p)) continue;
      const k = p.slice(0, Math.max(4, p.length - 1));
      if (messe.has(k)) continue;
      messe.add(k); diz.set(k, emoji);
    }
  }
  const bello = (w) => w.replace(/\d{4,}/g, (n) => n.replace(/\B(?=(\d{3})+(?!\d))/g, " "));
  function nascondi(g) { if (g !== giro || !box) return; box.classList.add("via"); }
  function mostra(testo, u, opz = {}) {
    if (!attivo || !u) return;
    const parole = [...testo.matchAll(/\S+/g)];
    if (parole.length < 3) return;
    const g = ++giro;
    clearTimeout(timer);
    if (!box) {
      box = document.createElement("div"); box.className = "sottotitoli via"; box.setAttribute("aria-hidden", "true");
      box.innerHTML = `<button class="st-chiudi" type="button" aria-label="Chiudi">✕</button><div class="st-figure"></div><div class="st-testo"></div>`;
      box.querySelector(".st-chiudi").onclick = () => { box.classList.add("via"); };
      const dk = Telecomando.dock(); dk.insertBefore(box, dk.querySelector(".telecomando"));
    }
    // Una frase alla volta: le frasi lunghe stanno comode sulla LIM.
    const frasi = []; let cur = [];
    parole.forEach((m, i) => { cur.push(i); if (/[.!?]$/.test(m[0]) || cur.length >= 22) { frasi.push(cur); cur = []; } });
    if (cur.length) frasi.push(cur);
    const frase = (i) => frasi.findIndex((f) => f.includes(i));
    const t = box.querySelector(".st-testo"), fg = box.querySelector(".st-figure");
    let fCor = -1, wCor = -1, usaConfini = false;
    const disegna = (fi) => {
      fCor = fi; let gia = new Set();
      t.innerHTML = frasi[fi].map((i) => {
        const w = parole[i][0], e = icona(w);
        const ico = e && !gia.has(e) ? (gia.add(e), Figura.img(e, "st-icona")) : "";
        return `<span class="st-parola" data-i="${i}">${ico}${escapeHTML(bello(w))}</span>`;
      }).join(" ");
      t.classList.remove("st-nuova"); void t.offsetWidth; t.classList.add("st-nuova");
      // Le immagini grandi di quello che la voce sta dicendo: si accendono quando la parola viene detta.
      // Se la frase non ha parole con un'immagine, resta la figura della scheda che si sta leggendo.
      const figure = [], viste = new Set();
      for (const i of frasi[fi]) {
        const e = icona(parole[i][0]);
        if (e && !viste.has(e) && figure.length < 4) { viste.add(e); figure.push({ e, i, w: parole[i][0].replace(/[^\p{L}\p{N}'’ ]/gu, "") }); }
      }
      fg.innerHTML = figure.length
        ? figure.map((x) => `<span class="st-fig" data-i="${x.i}">${Figura.img(x.e, "st-fig-img")}<b>${escapeHTML(x.w)}</b></span>`).join("")
        : opz.figura ? `<span class="st-fig accesa sola">${Figura.img(opz.figura, "st-fig-img")}</span>` : "";
      fg.hidden = !fg.innerHTML;
    };
    const evidenzia = (i) => {
      if (g !== giro || i === wCor || i >= parole.length) return;
      wCor = i;
      const fi = frase(i); if (fi !== fCor) disegna(fi);
      t.querySelectorAll(".st-parola").forEach((s) => { const k = +s.dataset.i; s.classList.toggle("detta", k < i); s.classList.toggle("ora", k === i); });
      fg.querySelectorAll(".st-fig[data-i]").forEach((s) => { const k = +s.dataset.i; s.classList.toggle("accesa", k <= i); s.classList.toggle("ora", k === i); });
    };
    box.classList.remove("via");
    disegna(0); evidenzia(0);
    u.addEventListener("boundary", (ev) => {
      if (ev.name && ev.name !== "word") return;
      usaConfini = true;
      let i = parole.findIndex((m) => m.index + m[0].length > ev.charIndex); if (i < 0) i = parole.length - 1;
      evidenzia(i);
    });
    // Se il browser non dice a che parola è arrivato, stimo i tempi.
    const vel = u.rate || .8;
    let k = 0;
    const passo = () => {
      if (g !== giro || usaConfini) return;
      if (Voce.inPausa) return;
      evidenzia(k);
      const d = (120 + parole[k][0].length * 62) / vel + (/[.,;:!?]$/.test(parole[k][0]) ? 260 : 0);
      if (++k < parole.length) timer = setTimeout(passo, d);
    };
    u.addEventListener("start", () => { if (g === giro && !usaConfini) { k = 0; timer = setTimeout(passo, 150); } });
    u.addEventListener("end", () => { if (g !== giro || Voce.inPausa) return; t.querySelectorAll(".st-parola").forEach((s) => { s.classList.add("detta"); s.classList.remove("ora"); }); fg.querySelectorAll(".st-fig").forEach((s) => { s.classList.add("accesa"); s.classList.remove("ora"); }); setTimeout(() => nascondi(g), 1600); });
  }
  return {
    mostra, dizionario,
    get attivo() { return attivo; },
    set attivo(v) { attivo = v; try { localStorage.setItem(CHIAVE, v ? "si" : "no"); } catch {} if (!v) box?.classList.add("via"); },
  };
})();

/* ---------- Immagini illustrate ----------
   Ogni emoji diventa un'immagine 3D colorata (cartella assets/emoji).
   Se un testo comincia con un'emoji ("🍎 mela"), l'emoji diventa la figura dell'elemento. */
window.Figura = (() => {
  // Anche i tasti con i numeri (1️⃣, #️⃣): diventano immagini come le altre emoji.
  const EMO = "(?:[0-9#*]\\uFE0F?\\u20E3|\\p{Extended_Pictographic}(?:\\uFE0F|\\u20E3|[\\u{1F3FB}-\\u{1F3FF}]|\\u200D\\p{Extended_Pictographic}\\uFE0F?)*)";
  const RE_INIZIO = new RegExp(`^\\s*((?:${EMO}\\s*)+)`, "u");
  const RE_UNA = new RegExp(EMO, "gu");
  const nomeFile = (e) => [...e].map((c) => c.codePointAt(0).toString(16).padStart(4, "0")).join("-");
  // Disegni fatti a mano per le cose che non hanno un'emoji giusta (🧫 = cellula animale, 🥬 = cellula vegetale).
  const DISEGNI = { "🧫": "assets/disegni/cellula.svg", "🥬": "assets/disegni/cellula-vegetale.svg" };
  function file(emoji) {
    if (DISEGNI[emoji]) return DISEGNI[emoji];
    const set = window.EMOJI_DISPONIBILI;
    if (!set) return null;
    const n = nomeFile(emoji);
    const senza = n.split("-").filter((x) => x !== "fe0f").join("-");
    const conFe = senza.includes("-") ? null : senza + "-fe0f";
    for (const c of [n, senza, conFe]) if (c && set.has(c)) return `assets/emoji/${c}.webp`;
    return null;
  }
  function img(emoji, classe = "figura") {
    const f = file(emoji);
    return f ? `<img class="${classe}" src="${f}" alt="" draggable="false">` : `<span class="${classe} figura-testo" aria-hidden="true">${escapeHTML(emoji)}</span>`;
  }
  // Separa le emoji iniziali (anche ripetute: "🍎🍎🍎 3") dal resto del testo.
  function dividi(t) {
    const m = String(t ?? "").match(RE_INIZIO);
    if (!m) return { emoji: null, tutte: [], testo: String(t ?? "") };
    const tutte = m[1].match(RE_UNA) || [];
    return { emoji: tutte[0], tutte, testo: String(t).slice(m[0].length) };
  }
  const gruppo = (tutte, classe) => tutte.length > 1 ? `<span class="gruppo-figure">${tutte.map((e) => img(e, classe)).join("")}</span>` : img(tutte[0], classe);
  // HTML per un'opzione o una tessera: figura sopra, parola sotto.
  function ricco(t, classe = "figura piccola") {
    const { tutte, testo } = dividi(t);
    return tutte.length ? `<span class="con-figura">${gruppo(tutte, classe)}<span>${frazioni(escapeHTML(testo))}</span></span>` : frazioni(escapeHTML(testo));
  }
  // "3/4" in un testo già sicuro (HTML) diventa una frazione in colonna: numeratore sopra, linea, denominatore sotto.
  const frazioneHTML = (n, d) => `<span class="fraz" role="img" aria-label="${n}/${d}"><span class="fraz-n">${n}</span><span class="fraz-d">${d}</span></span>`;
  const frazioni = (html) => String(html).replace(/(^|[^\d\/])(\d{1,2})\/(\d{1,2})(?![\d\/])/g, (m, p, n, d) => p + frazioneHTML(n, d));
  return { img, dividi, ricco, file, frazioni, frazioneHTML };
})();

/* ---------- Coriandoli ---------- */
window.coriandoli = function (quanti = 80) {
  const colori = ["#3D6BE0", "#1FA36A", "#FFC93C", "#FF6B6B", "#8B5CF6"];
  for (let i = 0; i < quanti; i++) {
    const c = document.createElement("div");
    c.className = "coriandolo";
    c.style.left = Math.random() * 100 + "vw";
    c.style.background = colori[i % colori.length];
    c.style.animationDuration = 2 + Math.random() * 2 + "s";
    c.style.animationDelay = Math.random() * .6 + "s";
    c.style.borderRadius = Math.random() > .5 ? "50%" : "3px";
    document.body.append(c);
    setTimeout(() => c.remove(), 5000);
  }
};

window.mescola = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};
