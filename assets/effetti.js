// Effetti speciali delle lezioni: sipario d'apertura, entrate sempre diverse, figure che fanno scherzi,
// "gratta e scopri", un compagno che commenta, feste diverse a ogni risposta giusta, serie di risposte.
// Tutto si spegne con il pulsante "✨ Effetti" (scelta ricordata su quel computer) o se il computer
// chiede meno movimento.
(() => {
  const CHIAVE = "classe-irene-effetti";
  const pocoMoto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let attivi = (() => { try { return localStorage.getItem(CHIAVE) !== "no"; } catch { return true; } })() && !pocoMoto;
  const caso = (a) => a[Math.floor(Math.random() * a.length)];
  const tra = (a, b) => a + Math.random() * (b - a);

  // Sceglie dalla lista evitando di ripetere le ultime scelte: così gli effetti non diventano monotoni.
  function sorteggio(lista, memoria = 2) {
    const ultimi = [];
    return () => {
      const liberi = lista.filter((x) => !ultimi.includes(x));
      const x = caso(liberi.length ? liberi : lista);
      ultimi.push(x); if (ultimi.length > Math.min(memoria, lista.length - 1)) ultimi.shift();
      return x;
    };
  }

  /* ---------- Suoni in più ---------- */
  let ctx;
  function nota(f, t0, d, tipo = "sine", v = .12, f2) {
    if (!Suono.attivo) return;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + t0;
      o.type = tipo; o.frequency.setValueAtTime(f, t);
      if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
      g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + d);
      o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + d);
    } catch {}
  }
  const SUONI = {
    boing: () => nota(180, 0, .35, "sine", .18, 520),
    pop: () => { nota(900, 0, .06, "square", .05); nota(1400, .04, .08, "sine", .08); },
    magia: () => [1047, 1319, 1568, 2093, 1568, 2093].forEach((f, i) => nota(f, i * .06, .18, "triangle", .06)),
    razzo: () => nota(200, 0, .6, "sawtooth", .03, 1200),
    botto: () => { nota(120, 0, .25, "square", .08, 40); nota(2000, .05, .3, "triangle", .03, 600); },
    timbro: () => { nota(90, 0, .15, "square", .15, 50); },
    serie: () => [523, 659, 784, 1047, 1319].forEach((f, i) => nota(f, i * .08, .22, "square", .05)),
    fischio: () => nota(600, 0, .4, "sine", .08, 1800),
    gratta: () => nota(tra(2500, 4000), 0, .03, "sawtooth", .015),
  };

  /* ---------- Tela per le particelle ---------- */
  let tela, c2, particelle = [], anima = false;
  const immagini = {};
  function imm(e) {
    if (!immagini[e]) { const f = e.includes("/") ? e : Figura.file(e); if (f) { const i = new Image(); i.src = f; immagini[e] = i; } else immagini[e] = e; }
    return immagini[e];
  }
  function preparaTela() {
    if (tela) return;
    tela = document.createElement("canvas"); tela.className = "tela-effetti";
    document.body.append(tela); c2 = tela.getContext("2d");
    const dim = () => { tela.width = innerWidth * devicePixelRatio; tela.height = innerHeight * devicePixelRatio; c2.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0); };
    dim(); addEventListener("resize", dim);
  }
  function aggiungi(p) { preparaTela(); particelle.push(Object.assign({ vx: 0, vy: 0, g: .25, vita: 90, eta: 0, r: 0, vr: 0, s: 30, attrito: .99 }, p)); if (!anima) { anima = true; requestAnimationFrame(passo); } }
  function passo() {
    c2.clearRect(0, 0, innerWidth, innerHeight);
    particelle = particelle.filter((p) => p.eta < p.vita);
    for (const p of particelle) {
      p.eta++; p.vx *= p.attrito; p.vy = p.vy * p.attrito + p.g; p.x += p.vx + (p.ondeggia ? Math.sin(p.eta / 12) * p.ondeggia : 0); p.y += p.vy; p.r += p.vr;
      if (p.scoppia && p.eta === p.scoppia) { p.vita = 0; p.esplodi?.(p); continue; }
      const alfa = Math.min(1, (p.vita - p.eta) / 20);
      c2.save(); c2.globalAlpha = alfa; c2.translate(p.x, p.y); c2.rotate(p.r);
      if (p.e) {
        const i = imm(p.e);
        if (typeof i === "string") { c2.font = `${p.s}px serif`; c2.textAlign = "center"; c2.textBaseline = "middle"; c2.fillText(i, 0, 0); }
        else if (i.complete && i.naturalWidth) c2.drawImage(i, -p.s / 2, -p.s / 2, p.s, p.s);
      } else if (p.scia) {
        c2.strokeStyle = p.colore; c2.lineWidth = p.s; c2.lineCap = "round";
        c2.beginPath(); c2.moveTo(0, 0); c2.lineTo(-p.vx * 3, -p.vy * 3); c2.stroke();
      } else { c2.fillStyle = p.colore; if (p.tondo) { c2.beginPath(); c2.arc(0, 0, p.s / 2, 0, 7); c2.fill(); } else c2.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); }
      c2.restore();
    }
    if (particelle.length) requestAnimationFrame(passo); else { anima = false; c2.clearRect(0, 0, innerWidth, innerHeight); }
  }
  const COLORI = ["#3D6BE0", "#1FA36A", "#FFC93C", "#FF6B6B", "#8B5CF6", "#FF9F43", "#2EC4F1"];

  /* ---------- Le feste: una diversa ogni volta ---------- */
  let tema = ["⭐"];
  let ultimoPunto = { x: innerWidth / 2, y: innerHeight / 2 };
  addEventListener("pointerdown", (ev) => { ultimoPunto = { x: ev.clientX, y: ev.clientY }; }, true);

  const FESTE = {
    esplosione(el, pt) {
      SUONI.pop();
      for (let i = 0; i < 26; i++) { const a = tra(0, Math.PI * 2), v = tra(5, 13); aggiungi({ x: pt.x, y: pt.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 4, e: caso(tema), s: tra(26, 48), vr: tra(-.2, .2), vita: tra(60, 90) }); }
    },
    fuochi() {
      SUONI.razzo();
      for (let k = 0; k < 3; k++) {
        const x = innerWidth * tra(.2, .8), col = caso(COLORI);
        setTimeout(() => aggiungi({ x, y: innerHeight, vy: tra(-17, -14), g: .3, s: 5, colore: col, scia: true, scoppia: 42, vita: 100,
          esplodi: (p) => { SUONI.botto(); for (let i = 0; i < 46; i++) { const a = i / 46 * Math.PI * 2, v = tra(3, 7); aggiungi({ x: p.x, y: p.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: .08, attrito: .97, s: 3, colore: k % 2 ? col : caso(COLORI), scia: true, vita: tra(50, 75) }); }
            aggiungi({ x: p.x, y: p.y, e: caso(tema), s: 70, g: .05, vita: 70 }); } }), k * 380);
      }
    },
    pioggia() {
      SUONI.magia();
      for (let i = 0; i < 34; i++) aggiungi({ x: tra(0, innerWidth), y: tra(-400, -40), vy: tra(2, 5), g: .12, e: caso(tema), s: tra(30, 60), vr: tra(-.05, .05), ondeggia: tra(0, 1.5), vita: 160, attrito: 1 });
    },
    palloncini() {
      SUONI.fischio();
      for (let i = 0; i < 14; i++) aggiungi({ x: tra(40, innerWidth - 40), y: innerHeight + tra(20, 300), vy: tra(-4, -2.5), g: -.02, e: i % 3 ? "🎈" : caso(tema), s: tra(44, 76), ondeggia: tra(.5, 2), vita: 220, attrito: 1 });
    },
    coriandoli(el, pt) {
      SUONI.pop();
      for (const lato of [0, 1]) for (let i = 0; i < 40; i++) aggiungi({ x: lato ? innerWidth : 0, y: innerHeight * .7, vx: (lato ? -1 : 1) * tra(6, 15), vy: tra(-16, -8), g: .3, s: tra(8, 14), colore: caso(COLORI), vr: tra(-.3, .3), attrito: .985, vita: 140 });
    },
    timbro(el) {
      SUONI.timbro();
      const t = document.createElement("div"); t.className = "timbro";
      t.textContent = caso(["EVVIVA!", "SUPER!", "WOW!", "GRANDE!", "PERFETTO!", "SÌ!", "FANTASTICO!"]);
      t.style.setProperty("--ruota", tra(-14, 14) + "deg"); t.style.color = caso(["#E0533D", "#1F9D66", "#3D6BE0", "#8B5CF6"]);
      el.append(t); setTimeout(() => t.remove(), 2200);
    },
    arcobaleno(el) {
      SUONI.magia();
      const a = document.createElement("div"); a.className = "arcobaleno";
      a.innerHTML = `<svg viewBox="0 0 200 100"><g fill="none" stroke-width="9" stroke-linecap="round">${["#FF6B6B", "#FF9F43", "#FFC93C", "#1FA36A", "#2EC4F1", "#3D6BE0", "#8B5CF6"].map((c, i) => `<path d="M${15 + i * 8} 100 A${85 - i * 8} ${85 - i * 8} 0 0 1 ${185 - i * 8} 100" stroke="${c}" pathLength="1"/>`).join("")}</g></svg>`;
      el.append(a); setTimeout(() => a.remove(), 2600);
      const r = el.getBoundingClientRect();
      setTimeout(() => { for (let i = 0; i < 14; i++) aggiungi({ x: tra(r.left, r.right), y: r.top + 40, vy: tra(-3, 1), g: .05, e: "✨", s: tra(20, 36), vita: 70 }); }, 700);
    },
    tornado(el, pt) {
      SUONI.fischio();
      for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; aggiungi({ x: pt.x + Math.cos(a) * 30, y: pt.y + Math.sin(a) * 30, vx: Math.cos(a + 1.4) * 9, vy: Math.sin(a + 1.4) * 9, g: 0, attrito: .96, e: caso(tema), s: 34, vr: .2, vita: 70 }); }
    },
  };
  const prossimaFesta = sorteggio(Object.keys(FESTE), 3);

  /* ---------- Il compagno: il personaggio della storia che commenta ---------- */
  let compagno, nuvola, timerNuvola;
  const GIUSTO = ["Evviva!", "Che forza!", "Lo sapevi!", "Veloci come un fulmine!", "Mi hai salvato!", "Ancora così!", "Wow, che occhio!", "Hai fatto centro!"];
  const SBAGLIATO = ["Quasi! Riprova.", "Ci sei vicino!", "Pensaci ancora un po'.", "Niente paura, riprova!", "Guarda bene…"];
  function creaCompagno(l) {
    compagno = document.createElement("button");
    compagno.className = "compagno"; compagno.type = "button"; compagno.setAttribute("aria-label", "Il personaggio della lezione");
    compagno.innerHTML = `${Figura.img(l.storia?.personaggio || "👩‍🏫", "figura media")}<span class="nuvola" hidden></span>`;
    nuvola = compagno.querySelector(".nuvola");
    document.body.append(compagno);
    compagno.addEventListener("click", () => {
      gesto(compagno, caso(["salta", "giravolta", "trema"])); SUONI.boing();
      dici(l.storia?.missione ? caso(["Ricordi la missione? " + l.storia.missione, "Andiamo avanti insieme!", "Tocca le figure: a volte fanno sorprese!"]) : caso(["Ciao!", "Andiamo avanti!"]), true);
    });
  }
  function dici(t, voce = false) {
    if (!compagno) return;
    nuvola.textContent = t; nuvola.hidden = false;
    nuvola.classList.remove("appare"); void nuvola.offsetWidth; nuvola.classList.add("appare");
    clearTimeout(timerNuvola); timerNuvola = setTimeout(() => { nuvola.hidden = true; }, 3200);
    if (voce) leggi(t);
  }
  function gesto(el, nome) { if (!el) return; el.classList.remove("g-salta", "g-giravolta", "g-trema", "g-cresce"); void el.offsetWidth; el.classList.add("g-" + nome); }

  /* ---------- Entrate delle schede: ognuna diversa dalla precedente ---------- */
  const ENTRATE = ["zoom", "sinistra", "destra", "cade", "gira", "sfoca", "sipario", "ruota", "molla", "onda"];
  const GALLERIE = ["pop", "volo", "rimbalzo", "carte"];
  // Ogni lettera in uno span (per farla arrivare da sola), ma le parole restano intere quando vanno a capo.
  function lettere(t) {
    let i = 0;
    return String(t).split(" ").map((w) => `<span class="parola-intera">${[...w].map((ch) => `<span style="--i:${i++}">${escapeHTML(ch)}</span>`).join("")}</span>`).join(" ");
  }
  function spezzaTitolo(h2) {
    const nodo = [...h2.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
    if (!nodo) return;
    const span = document.createElement("span"); span.className = "titolo-lettere";
    span.innerHTML = lettere(nodo.textContent);
    nodo.replaceWith(span);
  }

  /* ---------- Scherzi delle figure grandi ---------- */
  const SCHERZI = ["salta", "giravolta", "trema", "cresce", "esplode", "magia"];
  const prossimoScherzo = sorteggio(SCHERZI, 2);
  function scherzo(fig) {
    const s = prossimoScherzo(), r = fig.getBoundingClientRect(), pt = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    const e = fig.getAttribute("src") || caso(tema);
    if (s === "esplode") { SUONI.pop(); for (let i = 0; i < 14; i++) { const a = tra(0, 7), v = tra(4, 9); aggiungi({ x: pt.x, y: pt.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 3, e, s: tra(24, 40), vr: tra(-.2, .2), vita: 70 }); } gesto(fig, "cresce"); }
    else if (s === "magia") { SUONI.magia(); for (let i = 0; i < 16; i++) aggiungi({ x: pt.x + tra(-r.width / 2, r.width / 2), y: pt.y + tra(-r.height / 2, r.height / 2), vy: tra(-3, -1), g: 0, e: "✨", s: tra(16, 30), vita: 60 }); gesto(fig, "giravolta"); }
    else { SUONI[s === "salta" ? "boing" : s === "trema" ? "fischio" : "pop"](); gesto(fig, s); }
  }

  /* ---------- Gratta e scopri (le domande "Pensaci tu") ---------- */
  function grattaEScopri(pensa) {
    const btn = pensa.querySelector("[data-svela]"), risp = pensa.querySelector(".pensa-risposta");
    if (!btn || !risp) return;
    const box = document.createElement("div"); box.className = "gratta";
    btn.hidden = true; risp.hidden = false;
    risp.replaceWith(box); box.append(risp);
    const tela = document.createElement("canvas"); box.append(tela);
    const aiuto = document.createElement("span"); aiuto.className = "gratta-aiuto"; aiuto.textContent = "🪙 Gratta qui col dito per scoprire la risposta!"; box.append(aiuto);
    const ctx = tela.getContext("2d");
    let finito = false, ultimo = 0;
    const dipingi = () => {
      const w = box.clientWidth, h = Math.max(box.clientHeight, 70);
      tela.width = w; tela.height = h;
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#C7CCD6"); g.addColorStop(.5, "#EEF1F6"); g.addColorStop(1, "#B5BCC9");
      ctx.globalCompositeOperation = "source-over"; ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(255,255,255,.5)";
      for (let i = 0; i < 40; i++) ctx.fillRect(Math.random() * w, Math.random() * h, 3, 3);
    };
    requestAnimationFrame(dipingi);
    let premuto = false;
    const gratta = (ev) => {
      if (!premuto || finito) return;
      const r = tela.getBoundingClientRect();
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath(); ctx.arc((ev.clientX - r.left) * tela.width / r.width, (ev.clientY - r.top) * tela.height / r.height, 26, 0, 7); ctx.fill();
      aiuto.hidden = true;
      if (performance.now() - ultimo > 90) { ultimo = performance.now(); SUONI.gratta(); controlla(); }
    };
    const controlla = () => {
      const d = ctx.getImageData(0, 0, tela.width, tela.height).data;
      let vuoti = 0; for (let i = 3; i < d.length; i += 64) if (d[i] === 0) vuoti++;
      if (vuoti / (d.length / 64) > .45) svela();
    };
    const svela = () => { if (finito) return; finito = true; tela.classList.add("via"); SUONI.magia(); leggi(risp.textContent); setTimeout(() => tela.remove(), 600); };
    tela.addEventListener("pointerdown", (ev) => { premuto = true; tela.setPointerCapture(ev.pointerId); gratta(ev); });
    tela.addEventListener("pointermove", gratta);
    tela.addEventListener("pointerup", () => { premuto = false; });
    tela.addEventListener("dblclick", svela);
    box.dataset.gratta = "";
    box.svela = svela;
  }

  /* ---------- Sipario d'apertura ---------- */
  function sipario(l) {
    const s = document.createElement("div"); s.className = "sipario";
    s.innerHTML = `<div class="tenda sx"></div><div class="tenda dx"></div>
      <div class="sipario-centro">
        <div class="sipario-figura">${Figura.img(l.emoji || "📘", "figura gigante")}</div>
        <h1 class="sipario-titolo">${lettere(l.titolo)}</h1>
        ${l.storia?.personaggio && l.storia.personaggio !== l.emoji ? `<div class="sipario-ospite">${Figura.img(l.storia.personaggio, "figura grande")}</div>` : ""}
        <button class="btn sipario-via" type="button">▶ Si comincia!</button>
      </div>`;
    document.body.append(s);
    const apri = () => {
      if (s.classList.contains("aperto")) return;
      s.classList.add("aperto"); SUONI.magia(); FESTE.coriandoli();
      setTimeout(() => { gesto(compagno, "salta"); dici(caso(["Pronti? Si parte!", "Che bello, siete arrivati!", "Andiamo all'avventura!"])); }, 900);
      setTimeout(() => s.remove(), 1300);
    };
    s.addEventListener("click", apri);
    s.apri = apri;
  }

  /* ---------- Sfondo vivo con le figure della lezione ---------- */
  function sfondo() {
    const d = document.createElement("div"); d.className = "sfondo-vivo"; d.setAttribute("aria-hidden", "true");
    d.innerHTML = tema.slice(0, 8).map((e, i) => `<span style="--x:${(i * 13 + 5) % 95}vw;--d:${18 + (i % 4) * 6}s;--r:${i % 2 ? -1 : 1};--ritardo:${-i * 3}s">${Figura.img(e, "figura media")}</span>`).join("");
    document.body.append(d);
  }

  /* ---------- Avvio ---------- */
  function avvia(l, radice) {
    document.body.classList.toggle("effetti", attivi);
    const barra = radice.querySelector(".menu-maestra") || radice.querySelector(".barra-lezione");
    const b = document.createElement("button"); b.className = "btn bianco"; b.dataset.effetti = "";
    b.textContent = `✨ Effetti: ${attivi ? "sì" : "no"}`;
    b.onclick = () => { attivi = !attivi; try { localStorage.setItem(CHIAVE, attivi ? "si" : "no"); } catch {} b.textContent = `✨ Effetti: ${attivi ? "sì" : "no"}`; document.body.classList.toggle("effetti", attivi); };
    barra?.append(b);

    tema = [...new Set([l.premio, l.emoji, ...(l.storia?.immagini || []).map((x) => Figura.dividi(x).emoji), ...l.sezioni.map((s) => s.immagine), "⭐"].filter(Boolean))];

    // Entrate: un mazzo mescolato, così due schede vicine non entrano mai nello stesso modo.
    const prossimaEntrata = sorteggio(ENTRATE, 4), prossimaGalleria = sorteggio(GALLERIE, 1);
    const pagine = radice.querySelectorAll(".lezione-testa, .scheda, .esercizio, [data-fine]");
    pagine.forEach((p) => {
      // Gli esercizi compaiono solo con una dissolvenza (richiesta di Michele): niente movimenti mentre si lavora.
      p.classList.add("entra", "entra-" + (p.classList.contains("esercizio") ? "dissolvi" : prossimaEntrata()));
      p.querySelectorAll(".galleria").forEach((g) => { g.classList.add("gal-" + prossimaGalleria()); [...g.children].forEach((f, i) => f.style.setProperty("--i", i)); });
      const h2 = p.querySelector(":scope > .scheda-corpo > h2");
      if (h2) spezzaTitolo(h2);
    });
    const io = new IntersectionObserver((voci) => voci.forEach((v) => { if (v.isIntersecting) { v.target.classList.add("visto"); io.unobserve(v.target); } }), { threshold: .12 });
    pagine.forEach((p) => io.observe(p));

    // Figure che fanno scherzi quando si toccano; figure della galleria che saltano e si leggono.
    radice.querySelectorAll(".scheda-figura .figura, .lezione-testa > .figura").forEach((f, i) => {
      f.classList.add("scherzosa", "ozio-" + ["galleggia", "dondola", "respira"][i % 3]);
      f.addEventListener("click", () => { if (attivi) scherzo(f); });
    });
    radice.querySelectorAll(".galleria figure").forEach((f) => {
      f.classList.add("toccabile");
      f.addEventListener("click", () => { gesto(f, caso(["salta", "cresce", "giravolta"])); SUONI.pop(); leggi(f.textContent.trim() || ""); });
    });
    radice.querySelectorAll(".pensa").forEach(grattaEScopri);

    if (l.storia?.personaggio || l.emoji) creaCompagno(l);
    sfondo();

    // Feste per le risposte giuste, e serie di risposte giuste di fila.
    let serie = 0;
    radice.addEventListener("risolto", (ev) => {
      serie++;
      const el = ev.detail?.el;
      if (!attivi || !el) return;
      const r = el.getBoundingClientRect();
      const pt = ultimoPunto.y > r.top - 40 && ultimoPunto.y < r.bottom + 40 ? ultimoPunto : { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      FESTE[prossimaFesta()](el, pt);
      gesto(compagno, caso(["salta", "giravolta"])); dici(caso(GIUSTO));
      const quante = serie;
      if ([3, 5, 8, 12].includes(quante)) setTimeout(() => {
        SUONI.serie();
        const s = document.createElement("div"); s.className = "serie";
        s.innerHTML = `🔥 ${quante} di fila!`; document.body.append(s); setTimeout(() => s.remove(), 2400);
      }, 700);
    });
    radice.addEventListener("errore", () => { serie = 0; if (!attivi) return; gesto(compagno, "trema"); dici(caso(SBAGLIATO)); });
    radice.addEventListener("finita", () => { if (!attivi) return; setTimeout(() => FESTE.fuochi(), 400); setTimeout(() => FESTE.pioggia(), 1800); });

    if (attivi && !parametri().nosipario) sipario(l);
  }

  window.Effetti = { avvia, FESTE, get attivi() { return attivi; } };
})();
