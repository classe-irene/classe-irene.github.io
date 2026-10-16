// Funzioni condivise da tutte le pagine: testata, mascotte, suoni, voce, archivio locale.

window.MASCOTTE = `
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Gufetto, la mascotte">
  <ellipse cx="100" cy="188" rx="58" ry="8" fill="#000" opacity=".08"/>
  <path d="M48 70 L40 30 L75 55 Z" fill="#7A4FD6"/>
  <path d="M152 70 L160 30 L125 55 Z" fill="#7A4FD6"/>
  <ellipse cx="100" cy="112" rx="62" ry="72" fill="#8B5CF6"/>
  <ellipse cx="100" cy="135" rx="40" ry="44" fill="#E9DDFF"/>
  <path d="M80 125 q5 6 10 0 M95 140 q5 6 10 0 M110 125 q5 6 10 0 M88 155 q5 6 10 0 M103 155 q5 6 10 0" stroke="#C4B0F5" stroke-width="3" fill="none" stroke-linecap="round"/>
  <circle cx="74" cy="84" r="26" fill="#fff"/>
  <circle cx="126" cy="84" r="26" fill="#fff"/>
  <circle cx="78" cy="86" r="12" fill="#2B2A33"/>
  <circle cx="122" cy="86" r="12" fill="#2B2A33"/>
  <circle cx="82" cy="81" r="4" fill="#fff"/>
  <circle cx="126" cy="81" r="4" fill="#fff"/>
  <path d="M92 104 L100 118 L108 104 Z" fill="#FFC93C"/>
  <ellipse cx="46" cy="120" rx="12" ry="30" fill="#7A4FD6" transform="rotate(15 46 120)"/>
  <ellipse cx="154" cy="120" rx="12" ry="30" fill="#7A4FD6" transform="rotate(-15 154 120)"/>
  <path d="M82 180 l-6 8 M88 181 l0 9 M118 180 l6 8 M112 181 l0 9" stroke="#FFC93C" stroke-width="5" stroke-linecap="round"/>
  <rect x="50" y="46" width="100" height="10" rx="3" fill="#2B2A33"/>
  <path d="M60 46 L100 28 L140 46 Z" fill="#2B2A33"/>
  <path d="M140 50 q10 10 6 24" stroke="#FFC93C" stroke-width="3" fill="none"/>
  <circle cx="146" cy="76" r="5" fill="#FFC93C"/>
</svg>`;

window.creaTestata = function (attivo) {
  document.querySelectorAll("header.testata, footer.piede").forEach((x) => x.remove());
  const t = document.createElement("header");
  t.className = "testata";
  t.innerHTML = `
    <div class="contenitore">
      <a class="logo" href="index.html">${MASCOTTE}<span>${SITO.nome}</span></a>
      <nav class="nav">
        <a href="index.html#matematica" class="${attivo === "matematica" ? "attivo" : ""}">🔢 Matematica</a>
        <a href="index.html#scienze" class="${attivo === "scienze" ? "attivo" : ""}">🔬 Scienze</a>
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
    dock.innerHTML = `<div class="telecomando" role="toolbar" aria-label="Comandi della voce">
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
    return dock;
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
  const sigle = (t) => t
    .replace(/(^|[^\d,])(\d[\d,]*) ?(hk|dak|uk|k|h|da|u)\b(?![àèéìòù'])/g, (m, p, num, s) => `${p}${num} ${SIGLE[s][num === "1" ? 0 : 1]}`)
    .replace(/\b(casella|colonna) (hk|dak|uk|h|da|u)\b(?![àèéìòù'])/g, (m, c, s) => `${c} delle ${SIGLE[s][1]}`)
    .replace(/\b([Qq]uant[ei]) (hk|dak|uk|h|da|u)\b(?![àèéìòù'])/g, (m, q, s) => `${q} ${SIGLE[s][1]}`)
    .replace(/\b(hk|dak|uk)\b/g, (m, s) => SIGLE[s][1])
    .replace(/ = /g, " uguale a ");
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
      const pulito = leggibile(String(testo).replace(/\p{Extended_Pictographic}|️|‍/gu, "").replace(/\s+/g, " ").trim());
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
    if (o.opz.scritte !== false) window.Sottotitoli?.mostra(parte, u);
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
  function dizionario(voci) {
    for (const v of voci) {
      const { emoji, testo } = Figura.dividi(v || "");
      if (!emoji) continue;
      for (const w of testo.split(/\s+/)) { const p = norm(w); if (p.length >= 4 && !/^(sono|della|delle|degli|dalla|nella|nelle|questo|questa|ogni|anche)$/.test(p)) diz.set(p.slice(0, Math.max(4, p.length - 1)), emoji); }
    }
  }
  const bello = (w) => w.replace(/\d{4,}/g, (n) => n.replace(/\B(?=(\d{3})+(?!\d))/g, " "));
  function nascondi(g) { if (g !== giro || !box) return; box.classList.add("via"); }
  function mostra(testo, u) {
    if (!attivo || !u) return;
    const parole = [...testo.matchAll(/\S+/g)];
    if (parole.length < 3) return;
    const g = ++giro;
    clearTimeout(timer);
    if (!box) {
      box = document.createElement("div"); box.className = "sottotitoli via"; box.setAttribute("aria-hidden", "true");
      box.innerHTML = `<button class="st-chiudi" type="button" aria-label="Chiudi">✕</button><div class="st-testo"></div>`;
      box.querySelector(".st-chiudi").onclick = () => { box.classList.add("via"); };
      Telecomando.dock().append(box);
    }
    // Una frase alla volta: le frasi lunghe stanno comode sulla LIM.
    const frasi = []; let cur = [];
    parole.forEach((m, i) => { cur.push(i); if (/[.!?]$/.test(m[0]) || cur.length >= 22) { frasi.push(cur); cur = []; } });
    if (cur.length) frasi.push(cur);
    const frase = (i) => frasi.findIndex((f) => f.includes(i));
    const t = box.querySelector(".st-testo");
    let fCor = -1, wCor = -1, usaConfini = false;
    const disegna = (fi) => {
      fCor = fi; let gia = new Set();
      t.innerHTML = frasi[fi].map((i) => {
        const w = parole[i][0], e = icona(w);
        const ico = e && !gia.has(e) ? (gia.add(e), Figura.img(e, "st-icona")) : "";
        return `<span class="st-parola" data-i="${i}">${ico}${escapeHTML(bello(w))}</span>`;
      }).join(" ");
      t.classList.remove("st-nuova"); void t.offsetWidth; t.classList.add("st-nuova");
    };
    const evidenzia = (i) => {
      if (g !== giro || i === wCor || i >= parole.length) return;
      wCor = i;
      const fi = frase(i); if (fi !== fCor) disegna(fi);
      t.querySelectorAll(".st-parola").forEach((s) => { const k = +s.dataset.i; s.classList.toggle("detta", k < i); s.classList.toggle("ora", k === i); });
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
    u.addEventListener("end", () => { if (g !== giro || Voce.inPausa) return; t.querySelectorAll(".st-parola").forEach((s) => { s.classList.add("detta"); s.classList.remove("ora"); }); setTimeout(() => nascondi(g), 1600); });
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
  const EMO = "\\p{Extended_Pictographic}(?:\\uFE0F|\\u20E3|[\\u{1F3FB}-\\u{1F3FF}]|\\u200D\\p{Extended_Pictographic}\\uFE0F?)*";
  const RE_INIZIO = new RegExp(`^\\s*((?:${EMO}\\s*)+)`, "u");
  const RE_UNA = new RegExp(EMO, "gu");
  const nomeFile = (e) => [...e].map((c) => c.codePointAt(0).toString(16)).join("-");
  function file(emoji) {
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
    return tutte.length ? `<span class="con-figura">${gruppo(tutte, classe)}<span>${escapeHTML(testo)}</span></span>` : escapeHTML(testo);
  }
  return { img, dividi, ricco, file };
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
