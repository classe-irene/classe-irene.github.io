/* ---------- Lezione guidata: il tempo della lezione, fase per fase ----------
   👂 Ascolto, 👀 Guardo, ✍️ Copio, 🎯 Provo, 📝 Verifico.
   - Piano del giorno: la maestra sceglie i minuti che ha, il sito li divide fra le fasi (si possono cambiare).
   - In alto la scaletta delle fasi, con la fase di adesso accesa; di lato l'orologio a torta che si svuota.
   - Quando manca un minuto l'orologio diventa arancione e la voce lo dice; allo scadere suona la campanella
     e si passa alla fase dopo (con "➕ 1 minuto" per aspettare ancora).
   - Semaforo di classe: 🟢 lavoro, 🟡 stiamo per finire, 🔴 penne giù e occhi alla LIM.
   - "Copia sul quaderno": poche righe numerate che compaiono una alla volta, accanto al disegno della pagina.
   - In basso il navigatore: dove siamo (fase e scheda), cosa fare adesso (il pulsante da toccare si illumina),
     cosa viene dopo, e un solo grande "Avanti". Pausa, minuti, semaforo e "Finisci" stanno nel menu "☰ Maestra".
   Campo facoltativo della lezione: "copia": { "titolo": "...", "righe": ["...", ...], "divisione": { "a": 96, "b": 4 } }
   Per ora la lezione guidata compare solo nelle lezioni che hanno "copia" (prova su mat4-divisioni-una-cifra). */
(function () {
  const h = escapeHTML;
  const FASI = [
    { id: "ascolto", emoji: "👂", nome: "Ascolto", fare: "La maestra legge. Noi ascoltiamo.", peso: 1 },
    { id: "guardo", emoji: "👀", nome: "Guardo", fare: "Guardiamo i video insieme.", peso: 3 },
    { id: "copio", emoji: "✍️", nome: "Copio", fare: "Copiamo sul quaderno, una riga alla volta.", peso: 2 },
    { id: "provo", emoji: "🎯", nome: "Provo", fare: "Facciamo gli esercizi.", peso: 4 },
    { id: "verifico", emoji: "📝", nome: "Verifico", fare: "Facciamo la verifica.", peso: 2 },
  ];
  const TOTALI = [30, 45, 60, 90, 120];
  const lim = () => document.body.classList.contains("lim");

  /* ---------- Le righe da copiare ---------- */
  function copiaDati(l) {
    if (Array.isArray(l.copia?.righe) && l.copia.righe.length) return { titolo: l.copia.titolo || l.titolo, righe: l.copia.righe.slice(0, 6), divisione: l.copia.divisione };
    if (l.ricorda?.length) return { titolo: l.titolo, righe: l.ricorda.slice(0, 5) };
    return null;
  }
  // La divisione in colonna come si scrive sul quaderno, per esteso: una cifra per quadretto, prodotto sotto e sottrazione.
  function divisioneQuaderno(a, b) {
    const dv = Animazioni.estendi(Animazioni.calcolaDivisione(a, b)), n = dv.D.length, m = Math.max(dv.L, dv.giri.length);
    const celle = {}, cls = {};
    dv.D.forEach((c, i) => { celle[`0-${i}`] = c; });
    dv.giri.forEach((g) => {
      const X = String(g.prodotto);
      [...X].forEach((c, k) => { celle[`${g.rigaProdotto}-${g.fine - X.length + 1 + k}`] = c; });
      cls[`${g.rigaProdotto}-${g.fine - X.length + 1}`] = " cq-meno";
      for (let c = g.inizio; c <= g.fine; c++) cls[`${g.rigaProdotto}-${c}`] = (cls[`${g.rigaProdotto}-${c}`] || "") + " cq-linea";
      g.colonne.forEach((c) => { if (c.scrivi || c.sotto == null && c.su) celle[`${g.riga}-${c.col}`] = c.val; });
      if (g.scende) celle[`${g.riga}-${g.scende.col}`] = g.scende.cifra;
    });
    [...String(b)].forEach((c, k) => { celle[`0-${n + k}`] = c; });
    dv.giri.forEach((g, i) => { celle[`1-${n + i}`] = g.q; });
    let html = "";
    for (let r = 0; r < dv.righe; r++) for (let c = 0; c < n + m; c++) {
      const k = `${r}-${c}`;
      html += `<span class="cq-cella${c === n ? " cq-sx" : ""}${r === 0 && c >= n ? " cq-sotto" : ""}${cls[k] || ""}">${celle[k] ?? ""}</span>`;
    }
    const prova = dv.r ? `${dv.q} × ${b} + ${dv.r} = ${a}` : `${dv.q} × ${b} = ${a}`;
    return `<div class="cq-div" style="grid-template-columns:repeat(${n + m}, var(--q))">${html}</div><div class="cq-prova">Prova: ${prova}</div>`;
  }
  function copiaHTML(l) {
    const c = copiaDati(l);
    if (!c) return "";
    const passi = c.righe.length + (c.divisione ? 1 : 0);
    const testo = (x) => Figura.dividi(x).testo;
    return `<section class="scheda copia" data-passi="${passi}"><div class="scheda-corpo">
      <h2>✍️ Copia sul quaderno<button class="leggi" data-copia="leggi">🔊 Leggi</button></h2>
      <p class="copia-aiuto">Una riga alla volta. Scrivi bene, con calma.</p>
      <ol class="copia-righe">${c.righe.map((x, i) => `<li data-r="${i}">${Figura.ricco(x, "figura piccola")}<i class="copia-barra"></i></li>`).join("")}
        ${c.divisione ? `<li data-r="${c.righe.length}">${Figura.ricco(`📐 Copia la divisione: ${c.divisione.a} : ${c.divisione.b}`, "figura piccola")}<i class="copia-barra"></i></li>` : ""}</ol>
      <div class="copia-tasti"><button class="btn bianco" data-copia="prima">⬅ Indietro</button><button class="btn" data-copia="dopo">➡ Riga dopo</button></div>
    </div>
    <div class="copia-foglio" aria-label="Come deve venire la pagina del quaderno"><span class="cq-etichetta">${Figura.img("📒", "figura")} Il tuo quaderno</span>
      <div class="cq-pagina"><div class="cq-data">Data ……………</div><div class="cq-titolo">${h(c.titolo)}</div>
        <ol class="cq-righe">${c.righe.map((x, i) => `<li data-r="${i}"><span>${i + 1}. ${h(testo(x))}</span></li>`).join("")}</ol>
        ${c.divisione ? `<div class="cq-esempio" data-r="${c.righe.length}">${divisioneQuaderno(c.divisione.a, c.divisione.b)}</div>` : ""}
      </div></div></section>`;
  }
  // La scheda "Copia": mostra le righe fino alla n-esima (le altre restano grigie sul disegno del quaderno).
  function preparaCopia(l, radice) {
    const s = radice.querySelector(".scheda.copia");
    if (!s) return null;
    const passi = +s.dataset.passi, c = copiaDati(l);
    const frase = (i) => i < c.righe.length ? Figura.dividi(c.righe[i]).testo : `Copia la divisione: ${c.divisione.a} : ${c.divisione.b}`;
    const ctl = {
      n: 0,
      vai(k, voce) {
        ctl.n = Math.max(1, Math.min(passi, k));
        s.querySelectorAll("[data-r]").forEach((x) => {
          const r = +x.dataset.r;
          x.classList.toggle("vista", r < ctl.n); x.classList.toggle("ora", r === ctl.n - 1);
        });
        s.querySelector('[data-copia="prima"]').disabled = ctl.n <= 1;
        s.querySelector('[data-copia="dopo"]').disabled = ctl.n >= passi;
        if (voce) Voce.parla(`Riga ${ctl.n}. ${frase(ctl.n - 1)}`, null, { scritte: false });
      },
      barra(p) { s.querySelectorAll(".copia-barra").forEach((b) => b.style.setProperty("--p", b.closest("li").classList.contains("ora") ? p : 0)); },
      passi,
    };
    s.addEventListener("click", (e) => {
      const a = e.target.closest("[data-copia]")?.dataset.copia;
      if (a === "dopo") ctl.vai(ctl.n + 1, true);
      if (a === "prima") ctl.vai(ctl.n - 1);
      if (a === "leggi") Voce.parla(`Riga ${ctl.n}. ${frase(ctl.n - 1)}`, null, { scritte: false });
    });
    ctl.vai(1);
    return ctl;
  }

  /* ---------- Il piano del giorno ---------- */
  const chiavePiano = (l) => "classe-irene-piano-" + (parametri().file || l.titolo);
  function disponibili(l, radice) {
    return {
      ascolto: true,
      guardo: !!l.sezioni?.length,
      copio: !!radice.querySelector(".scheda.copia"),
      provo: !!l.esercizi?.length,
      verifico: /^verifiche\/[\w.-]+\.json$/.test(l.verifica || ""),
    };
  }
  // Divide i minuti fra le fasi accese, in proporzione al loro peso (sempre almeno 1 minuto).
  function dividi(piano, totale) {
    const accese = piano.filter((p) => p.si), pesi = accese.reduce((t, p) => t + FASI.find((f) => f.id === p.id).peso, 0);
    if (!accese.length) return;
    const quote = accese.map((p) => totale * FASI.find((f) => f.id === p.id).peso / pesi);
    accese.forEach((p, i) => { p.min = Math.max(1, Math.floor(quote[i])); });
    let resto = totale - accese.reduce((t, p) => t + p.min, 0);
    const ordine = accese.map((p, i) => i).sort((x, y) => (quote[y] % 1) - (quote[x] % 1));
    for (let k = 0; resto > 0; k++, resto--) accese[ordine[k % ordine.length]].min++;
  }
  function pianoIniziale(l, radice) {
    const ok = disponibili(l, radice);
    let salvato = null;
    try { salvato = JSON.parse(localStorage.getItem(chiavePiano(l))); } catch {}
    const piano = FASI.map((f) => {
      const s = salvato?.fasi?.find((x) => x.id === f.id);
      return { id: f.id, ok: ok[f.id], si: ok[f.id] && (s ? s.si : true), min: s?.min || 0 };
    });
    if (!salvato) dividi(piano, 60);
    return piano;
  }
  const totale = (piano) => piano.reduce((t, p) => t + (p.si ? p.min : 0), 0);

  function apri(l, radice) {
    if (G) return;
    const piano = pianoIniziale(l, radice);
    const v = document.createElement("div");
    v.className = "guida-piano";
    const disegna = () => {
      const tot = totale(piano);
      v.innerHTML = `<div class="gp-scatola" role="dialog" aria-label="Il piano di oggi">
        <h2>${Figura.img("⏱️", "figura media")} Il piano di oggi</h2>
        <p class="gp-domanda">Quanti minuti hai oggi?</p>
        <div class="gp-totali">${TOTALI.map((t) => `<button class="gp-tot${t === tot ? " scelto" : ""}" data-gp="tot" data-t="${t}">${t}<small>min</small></button>`).join("")}</div>
        <ol class="gp-fasi">${piano.map((p, i) => { const f = FASI[i]; return `<li class="${p.si ? "" : "spenta"}${p.ok ? "" : " manca"}">
          ${Figura.img(f.emoji, "figura media")}<div class="gp-nome"><b>${f.nome}</b><small>${p.ok ? f.fare : "Questa lezione non ce l'ha."}</small></div>
          ${p.ok ? `<div class="gp-minuti"><button data-gp="meno" data-i="${i}" aria-label="Un minuto in meno" ${!p.si || p.min <= 1 ? "disabled" : ""}>−</button>
            <span>${p.si ? p.min : "–"}<small>min</small></span><button data-gp="piu" data-i="${i}" aria-label="Un minuto in più" ${p.si ? "" : "disabled"}>+</button></div>
            <button class="gp-salta" data-gp="si" data-i="${i}">${p.si ? "Salta" : "Rimetti"}</button>` : ""}</li>`; }).join("")}</ol>
        <p class="gp-totale">Totale: <b>${tot} minuti</b></p>
        <div class="gp-tasti"><button class="btn bianco" data-gp="annulla">Annulla</button><button class="btn verde gp-via" data-gp="via" ${tot ? "" : "disabled"}>▶ Inizia la lezione guidata</button></div>
      </div>`;
    };
    v.addEventListener("click", (e) => {
      const b = e.target.closest("[data-gp]");
      if (!b) { if (e.target === v) v.remove(); return; }
      const a = b.dataset.gp, p = piano[+b.dataset.i];
      if (a === "tot") dividi(piano, +b.dataset.t);
      if (a === "meno") p.min = Math.max(1, p.min - 1);
      if (a === "piu") p.min = Math.min(90, p.min + 1);
      if (a === "si") { p.si = !p.si; if (p.si && !p.min) p.min = 5; }
      if (a === "annulla") return v.remove();
      if (a === "via") {
        try { localStorage.setItem(chiavePiano(l), JSON.stringify({ fasi: piano.map(({ id, si, min }) => ({ id, si, min })) })); } catch {}
        v.remove();
        return avvia(l, radice, piano.filter((x) => x.si).map((x) => ({ ...FASI.find((f) => f.id === x.id), min: x.min })));
      }
      disegna();
    });
    disegna();
    document.body.append(v);
  }

  /* ---------- La lezione guidata in corso ---------- */
  let G = null;
  // Ogni pagina della LIM appartiene a una fase.
  function faseDi(p) {
    const c = p.classList;
    if (c.contains("lezione-testa") || c.contains("filastrocca") || c.contains("storia")) return "ascolto";
    if (c.contains("copia") || c.contains("quaderno")) return "copio";
    if (c.contains("scheda-verifica")) return "verifico";
    if (c.contains("esercizio") || c.contains("giorno-esercizi") || p.hasAttribute("data-fine")) return "provo";
    return "guardo";
  }
  const tuttePagine = (radice) => [radice.querySelector(".lezione-testa"), ...radice.querySelectorAll(".scheda, .giorno-esercizi, .esercizio, [data-fine]")].filter((p) => p && !p.hidden);
  const pagineFase = (id) => tuttePagine(G.radice).filter((p) => faseDi(p) === id);
  function mostraPagina(p) {
    if (!p) return;
    G.radice.dispatchEvent(new CustomEvent("lim-vai", { detail: p }));
    aggiornaNav();
  }
  function avanti() {
    const pp = pagineFase(G.fasi[G.k].id), j = pp.indexOf(G.radice.querySelector(".corrente"));
    if (j >= 0 && j < pp.length - 1) mostraPagina(pp[j + 1]); else vaiFase(G.k + 1);
  }
  function indietro() {
    const pp = pagineFase(G.fasi[G.k].id), j = pp.indexOf(G.radice.querySelector(".corrente"));
    if (j > 0) mostraPagina(pp[j - 1]);
    else if (G.k > 0) { vaiFase(G.k - 1); const qq = pagineFase(G.fasi[G.k].id); mostraPagina(qq[qq.length - 1]); }
  }
  function titoloDi(p) {
    if (p.classList.contains("storia")) return "La storia";
    if (p.classList.contains("esercizio")) return `Esercizio ${[...G.radice.querySelectorAll(".esercizio")].indexOf(p) + 1}`;
    if (p.hasAttribute("data-fine")) return "La festa finale";
    return (p.querySelector("h2, h3, h1")?.childNodes[0]?.textContent || "").trim();
  }
  // Cosa fare su questa pagina, e quale pulsante toccare.
  function consiglio(p, fatto) {
    const c = p.classList;
    const q = (sel) => p.querySelector(sel);
    if (c.contains("lezione-testa")) return { fare: "La maestra legge il titolo ad alta voce. Poi tocca Avanti." };
    if (c.contains("filastrocca")) return fatto ? { fare: "Ascoltiamo la filastrocca fino alla fine. Poi Avanti." } : { fare: "Tocca 🔊 Ascolta la filastrocca.", qui: q('[data-azione="filastrocca"]') };
    if (c.contains("storia")) return fatto ? { fare: "Ascoltiamo la storia. Poi Avanti." } : { fare: "Tocca 🔊 Ascolta la storia.", qui: q('[data-azione="storia"]') };
    if (c.contains("copia")) return { fare: "Copiate sul quaderno la riga accesa. Le righe arrivano da sole." };
    if (c.contains("quaderno")) return { fare: "Ricopiate la pagina sul quaderno, con calma." };
    if (c.contains("scheda-verifica")) return { fare: "Ognuno risponde alle domande. Alla fine tocca ✅ Correggi." };
    if (p.hasAttribute("data-fine")) return { fare: "Esercizi finiti! Bravi. Tocca Avanti." };
    if (c.contains("esercizio")) {
      const ee = [...G.radice.querySelectorAll(".esercizio")], n = ee.indexOf(p) + 1;
      return c.contains("risolto") ? { fare: `✅ Giusto! Tocca Avanti per l'esercizio dopo.` } : { fare: `Esercizio ${n} di ${ee.length}: rispondete toccando la LIM.` };
    }
    if (q('[data-anim="play"]')) return fatto ? { fare: "Guardiamo il video fino alla fine. Poi Avanti." } : { fare: "Tocca ▶ Guarda: guardiamo il video insieme.", qui: q('[data-anim="play"]') };
    if (q(".leggi")) return fatto ? { fare: "Ascoltiamo. Poi tocca Avanti." } : { fare: "Tocca 🔊 Leggi e ascoltate.", qui: q(".leggi") };
    return { fare: "Guardiamo insieme. Poi tocca Avanti." };
  }
  // Il navigatore: dove siamo, cosa fare adesso, cosa viene dopo.
  function aggiornaNav() {
    if (!G || G.k < 0) return;
    const f = G.fasi[G.k], pp = pagineFase(f.id), p = G.radice.querySelector(".corrente");
    const j = pp.indexOf(p);
    if (p !== G.pagina) { G.pagina = p; G.fatto = null; }
    G.radice.querySelectorAll(".guida-qui").forEach((x) => x.classList.remove("guida-qui"));
    const n = G.nav;
    n.querySelector(".gn-qui").innerHTML = `📍 ${Figura.img(f.emoji, "figura")} <b>${f.nome}</b> · fase ${G.k + 1} di ${G.fasi.length}${pp.length > 1 && j >= 0 ? ` · pagina ${j + 1} di ${pp.length}` : ""}`;
    const cons = p ? consiglio(p, G.fatto === p) : { fare: f.fare };
    n.querySelector(".gn-fare").textContent = "👉 " + cons.fare;
    if (cons.qui) cons.qui.classList.add("guida-qui");
    const dopo = j >= 0 && j < pp.length - 1 ? pp[j + 1] : null, fase = G.fasi[G.k + 1];
    n.querySelector(".gn-dopo").innerHTML = dopo ? `Dopo: ${h(titoloDi(dopo) || "la pagina seguente")}` : fase ? `Dopo: ${Figura.img(fase.emoji, "figura")} ${fase.nome}` : "Dopo: fine della lezione 🎉";
    n.querySelector(".gn-avanti").textContent = dopo ? "Avanti ➡" : fase ? `${fase.nome} ➡` : "Fine ➡";
    n.querySelector(".gn-avanti").classList.toggle("pulsa", !cons.qui && !(p?.classList.contains("esercizio") && !p.classList.contains("risolto")));
    n.querySelector(".gn-indietro").disabled = j <= 0 && G.k === 0;
    G.misura();
  }
  function apriMenu(si) {
    G.menu.hidden = !si;
    G.nav.querySelector(".gn-menu").setAttribute("aria-expanded", si);
  }
  function unMinuto() {
    G.fineAt += 60000; G.durata += 60000; G.resta += 60000; G.avvisato = false;
    G.orologio.classList.remove("arancione", "rosso-fine"); chiudiCartello();
  }
  const mmss = (ms) => { const s = Math.max(0, Math.ceil(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };
  const occupata = () => "speechSynthesis" in window && speechSynthesis.speaking;
  const annuncia = (t) => Voce.parla(t, null, { scritte: false });

  // La campanella: due rintocchi (si spegne con "🔔 Suoni: no").
  let audio;
  function campanella(volte = 2, vol = .22) {
    if (!Suono.attivo) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      for (let k = 0; k < volte; k++) [[1320, 1], [2640, .35], [3960, .15]].forEach(([f, v]) => {
        const o = audio.createOscillator(), g = audio.createGain(), t = audio.currentTime + k * .55;
        o.frequency.value = f; g.gain.setValueAtTime(vol * v, t); g.gain.exponentialRampToValueAtTime(.0005, t + 1.6);
        o.connect(g).connect(audio.destination); o.start(t); o.stop(t + 1.7);
      });
    } catch {}
  }

  function avvia(l, radice, fasi) {
    if (!fasi.length) return;
    if (!lim()) radice.querySelector('[data-azione="lim"]')?.click();
    document.body.classList.add("guidata");
    const scaletta = document.createElement("div");
    scaletta.className = "guida-scaletta";
    scaletta.innerHTML = fasi.map((f, k) => `<button class="gs-fase" data-k="${k}">${Figura.img(f.emoji, "figura")}<b>${f.nome}</b><small>${f.min} min</small><i class="gs-barra"></i></button>`).join("");
    const orologio = document.createElement("div");
    orologio.className = "guida-orologio";
    orologio.innerHTML = `<div class="go-maniglia" title="Trascina per spostare">⠿ Trascinami ⠿</div>
      <button class="go-quadrante" data-go="piccolo" aria-label="Rimpicciolisci o ingrandisci l'orologio"><span class="go-centro">${Figura.img("👂", "figura go-fig")}<b class="go-tempo">0:00</b><small class="go-nome"></small></span></button>
      <div class="go-stelle" hidden></div>`;
    // Il navigatore in basso: dove siamo, cosa fare adesso, cosa viene dopo, Avanti.
    const nav = document.createElement("div");
    nav.className = "guida-navigatore";
    nav.innerHTML = `<button class="gn-indietro" data-gn="indietro" aria-label="Indietro">◀</button>
      <div class="gn-testo"><span class="gn-qui"></span><b class="gn-fare"></b><small class="gn-dopo"></small></div>
      <button class="gn-avanti" data-gn="avanti">Avanti ➡</button>
      <button class="gn-menu" data-gn="menu" aria-expanded="false">☰ Maestra</button>`;
    // Il menu della maestra: tutto ciò che non serve sempre.
    const menu = document.createElement("div");
    menu.className = "guida-menu"; menu.hidden = true;
    menu.innerHTML = `<p class="gm-titolo">Semaforo della classe</p>
      <div class="go-semaforo" aria-label="Semaforo di classe">
        <button class="sem rosso" data-go="rosso" aria-label="Rosso: penne giù, occhi alla LIM"></button>
        <button class="sem giallo" data-go="giallo" aria-label="Giallo: stiamo per finire"></button>
        <button class="sem verde accesa" data-go="verde" aria-label="Verde: al lavoro"></button></div>
      <p class="gm-titolo">Orologio</p>
      <div class="gm-riga"><button class="btn bianco" data-go="pausa">⏸ Ferma</button><button class="btn bianco" data-go="piu">+1 minuto</button></div>
      <button class="btn bianco gm-largo" data-go="avanti">⏭ Salta alla fase dopo</button>
      <button class="btn bianco gm-largo gm-fine" data-go="fine">✕ Finisci la lezione</button>`;
    document.body.append(scaletta, orologio, nav, menu);
    spostabile(orologio, orologio.querySelector(".go-maniglia"));
    // L'orologio parte piccolo, per non coprire la lezione (toccandolo si ingrandisce).
    orologio.classList.add("piccolo");
    G = { l, radice, fasi, scaletta, orologio, nav, menu, k: -1, pausa: false, copia: radice._copia, fatti: radice.querySelectorAll(".esercizio.risolto").length };
    G.timer = setInterval(tick, 250);
    G.osserva = new MutationObserver(() => { if (G && !lim()) termina(); });
    G.osserva.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    G.risolto = () => { G.fatti = radice.querySelectorAll(".esercizio.risolto").length; setTimeout(aggiornaNav, 50); };
    radice.addEventListener("risolto", G.risolto);
    // Nella lezione guidata la verifica si apre qui dentro, così l'orologio non si perde.
    G.clicVerifica = (e) => { const a = e.target.closest('a[href*="modo=online"]'); if (a && G) { e.preventDefault(); apriVerifica(); } };
    radice.addEventListener("click", G.clicVerifica, true);
    scaletta.addEventListener("click", (e) => { const b = e.target.closest(".gs-fase"); if (b) vaiFase(+b.dataset.k); });
    const comandi = (e) => {
      const a = e.target.closest("[data-go]")?.dataset.go;
      if (!a) return;
      if (a === "piccolo") return orologio.classList.toggle("piccolo");
      apriMenu(false);
      if (a === "pausa") pausa(!G.pausa);
      if (a === "piu") unMinuto();
      if (a === "avanti") vaiFase(G.k + 1);
      if (["rosso", "giallo", "verde"].includes(a)) semaforo(a);
      if (a === "fine") { if (confirm("Vuoi finire la lezione guidata?")) termina(); }
    };
    orologio.addEventListener("click", comandi);
    menu.addEventListener("click", comandi);
    nav.addEventListener("click", (e) => {
      const a = e.target.closest("[data-gn]")?.dataset.gn;
      if (a === "avanti") { apriMenu(false); avanti(); }
      if (a === "indietro") { apriMenu(false); indietro(); }
      if (a === "menu") apriMenu(menu.hidden);
    });
    // Le frecce della tastiera e i telecomandi da presentazione seguono il navigatore (restano nella fase).
    G.tasti = (ev) => {
      if (document.querySelector(".guida-cartello:not(.breve), .guida-piano, .quaderno-vista")) return;
      if (["ArrowRight", "PageDown"].includes(ev.key)) { ev.preventDefault(); ev.stopPropagation(); avanti(); }
      if (["ArrowLeft", "PageUp"].includes(ev.key)) { ev.preventDefault(); ev.stopPropagation(); indietro(); }
    };
    addEventListener("keydown", G.tasti, true);
    // Il pulsante illuminato ("Tocca qui"), una volta toccato, lascia il posto ad "Avanti".
    G.tocco = (e) => { const t = e.target.closest(".guida-qui"); if (t) { t.classList.remove("guida-qui"); G.fatto = G.pagina; aggiornaNav(); } };
    radice.addEventListener("click", G.tocco);
    G.misura = () => document.body.style.setProperty("--gn-h", nav.offsetHeight + "px");
    addEventListener("resize", G.misura);
    vaiFase(0);
  }
  function pausa(si) {
    G.pausa = si;
    if (si) G.resta = G.fineAt - Date.now(); else G.fineAt = Date.now() + G.resta;
    G.orologio.classList.toggle("in-pausa", si);
    G.menu.querySelector('[data-go="pausa"]').textContent = si ? "▶ Riparti" : "⏸ Ferma";
  }
  function vaiFase(k) {
    chiudiCartello();
    if (k >= G.fasi.length) return finale();
    if (k < 0) return;
    const f = G.fasi[k], cambio = k !== G.k;
    G.k = k; G.durata = G.resta = f.min * 60000; G.fineAt = Date.now() + G.resta; G.avvisato = false;
    if (G.pausa) pausa(false);
    G.scaletta.querySelectorAll(".gs-fase").forEach((b, j) => { b.classList.toggle("ora", j === k); b.classList.toggle("fatta", j < k); });
    G.scaletta.querySelector(".ora")?.scrollIntoView?.({ inline: "center", block: "nearest" });
    const o = G.orologio;
    o.querySelector(".go-fig").outerHTML = Figura.img(f.emoji, "figura go-fig");
    o.querySelector(".go-nome").textContent = f.nome;
    o.classList.remove("arancione", "rosso-fine");
    // Fase nuova: il semaforo torna verde (senza voce).
    G.menu.querySelectorAll(".sem").forEach((s) => s.classList.toggle("accesa", s.dataset.go === "verde"));
    document.querySelector(".guida-rosso")?.remove(); document.querySelector(".guida-striscia")?.remove();
    mostraPagina(pagineFase(f.id)[0]);
    if (f.id === "copio") G.copia?.vai(1);
    if (f.id === "verifico") apriVerifica(); else chiudiVerifica();
    aggiornaNav();
    if (cambio) { cartelloFase(f); annuncia(`Ora: ${f.nome}. ${f.fare} Abbiamo ${f.min === 1 ? "un minuto" : `${f.min} minuti`}.`); }
    tick();
  }
  function tick() {
    if (!G) return;
    const f = G.fasi[G.k], o = G.orologio;
    const resta = G.pausa ? G.resta : G.fineAt - Date.now();
    const p = Math.max(0, Math.min(1, resta / G.durata));
    o.style.setProperty("--p", p);
    o.querySelector(".go-tempo").textContent = mmss(resta);
    G.scaletta.querySelector(".ora")?.style.setProperty("--p", 1 - p);
    const st = o.querySelector(".go-stelle");
    st.hidden = f.id !== "provo";
    if (f.id === "provo") st.textContent = `⭐ ${G.fatti} / ${G.l.esercizi.length}`;
    // La LIM può aver cambiato pagina da sola (es. alla fine degli esercizi): il navigatore la segue.
    if (G.radice.querySelector(".corrente") !== G.pagina) aggiornaNav();
    if (G.pausa) return;
    // Un minuto alla fine (o metà del tempo, per le fasi brevi): orologio arancione e avviso.
    const soglia = Math.min(60000, G.durata / 2);
    if (!G.avvisato && resta <= soglia && resta > 0) {
      G.avvisato = true; o.classList.add("arancione");
      campanella(1, .12);
      if (!occupata()) annuncia(soglia === 60000 ? "Ancora un minuto!" : "Ancora poco!");
    }
    o.classList.toggle("rosso-fine", resta <= 10000);
    // ✍️ Copio: le righe compaiono da sole, ognuna con il suo tempo.
    if (f.id === "copio" && G.copia) {
      const fetta = G.durata / G.copia.passi, passato = G.durata - resta;
      const giusta = Math.min(G.copia.passi, Math.floor(passato / fetta) + 1);
      if (giusta > G.copia.n) G.copia.vai(giusta, true);
      G.copia.barra(G.copia.n === giusta ? (passato % fetta) / fetta : 0);
    }
    if (resta <= 0 && !G.cartello) tempoFinito();
  }
  // Allo scadere: campanella, cartello con la fase dopo e 5 secondi per aggiungere un minuto.
  function tempoFinito() {
    campanella();
    const dopo = G.fasi[G.k + 1];
    if (!dopo) return finale();
    annuncia(`Tempo finito! Ora: ${dopo.nome}.`);
    let s = 5;
    const c = cartello(`<div class="gc-titolo">${Figura.img("🔔", "figura grande")}<b>Tempo finito!</b></div>
      <p>Ora si passa a: ${Figura.img(dopo.emoji, "figura media")} <b>${dopo.nome}</b></p><p class="gc-conto">${s}</p>
      <div class="gc-tasti"><button class="btn bianco" data-gc="piu">➕ Ancora 1 minuto</button><button class="btn" data-gc="vai">⏭ Vai subito</button></div>`);
    G.conto = setInterval(() => { s--; const n = c.querySelector(".gc-conto"); if (n) n.textContent = s; if (s <= 0) vaiFase(G.k + 1); }, 1000);
    c.addEventListener("click", (e) => {
      const a = e.target.closest("[data-gc]")?.dataset.gc;
      if (a === "vai") vaiFase(G.k + 1);
      if (a === "piu") unMinuto();
    });
  }
  function cartello(html) {
    chiudiCartello();
    const c = document.createElement("div");
    c.className = "guida-cartello";
    c.innerHTML = `<div class="gc-scatola">${html}</div>`;
    document.body.append(c);
    G.cartello = c;
    return c;
  }
  function chiudiCartello() {
    if (!G) return;
    clearInterval(G.conto); clearTimeout(G.via);
    G.cartello?.remove(); G.cartello = null;
    G.breve?.remove(); G.breve = null;
  }
  // All'inizio di ogni fase, per due secondi e mezzo, il suo nome in grande (si chiude anche toccandolo).
  function cartelloFase(f) {
    const c = document.createElement("div");
    c.className = "guida-cartello breve";
    c.innerHTML = `<div class="gc-scatola"><div class="gc-grande">${Figura.img(f.emoji, "figura gigante")}<b>${f.nome}</b><small>${f.fare}</small><span class="gc-min">⏱️ ${f.min} min</span></div></div>`;
    c.addEventListener("click", () => c.remove());
    document.body.append(c);
    G.breve = c;
    G.via = setTimeout(() => c.remove(), 2600);
  }
  function finale() {
    clearInterval(G.timer);
    G.orologio.style.setProperty("--p", 0);
    G.scaletta.querySelectorAll(".gs-fase").forEach((b) => { b.classList.remove("ora"); b.classList.add("fatta"); });
    chiudiVerifica();
    Suono.festa(); coriandoli();
    annuncia("La lezione è finita. Bravi tutti!");
    const c = cartello(`<div class="gc-grande">${Figura.img("🎉", "figura gigante")}<b>Lezione finita!</b><small>Bravi tutti!</small></div>
      <div class="gc-tasti"><button class="btn" data-gc="chiudi">✕ Chiudi</button></div>`);
    c.addEventListener("click", (e) => { if (e.target.closest('[data-gc="chiudi"]')) termina(); });
  }
  function termina() {
    if (!G) return;
    const g = G;
    clearInterval(g.timer); chiudiCartello(); chiudiVerifica();
    g.osserva.disconnect();
    g.radice.removeEventListener("risolto", g.risolto);
    g.radice.removeEventListener("click", g.clicVerifica, true);
    removeEventListener("keydown", g.tasti, true);
    removeEventListener("resize", g.misura);
    g.radice.removeEventListener("click", g.tocco);
    g.radice.querySelectorAll(".guida-qui").forEach((x) => x.classList.remove("guida-qui"));
    g.scaletta.remove(); g.orologio.remove(); g.nav.remove(); g.menu.remove();
    document.querySelector(".guida-rosso")?.remove(); document.querySelector(".guida-striscia")?.remove();
    document.body.classList.remove("guidata");
    G = null;
  }

  /* ---------- Semaforo di classe ---------- */
  function semaforo(colore) {
    G.menu.querySelectorAll(".sem").forEach((s) => s.classList.toggle("accesa", s.dataset.go === colore));
    document.querySelector(".guida-rosso")?.remove();
    document.querySelector(".guida-striscia")?.remove();
    if (colore === "rosso") {
      const r = document.createElement("div");
      r.className = "guida-rosso";
      r.innerHTML = `<div class="gr-luce"></div><b>Penne giù!</b><span>${Figura.img("👀", "figura grande")} Occhi alla LIM</span><small>Tocca per tornare al lavoro</small>`;
      r.addEventListener("click", () => semaforo("verde"));
      document.body.append(r);
      annuncia("Penne giù. Occhi alla lavagna.");
    } else {
      const s = document.createElement("div");
      s.className = "guida-striscia " + colore;
      s.innerHTML = colore === "giallo" ? `${Figura.img("🟡", "figura")} Stiamo per finire!` : `${Figura.img("🟢", "figura")} Al lavoro!`;
      document.body.append(s);
      if (colore === "verde") setTimeout(() => s.remove(), 2500);
      annuncia(colore === "giallo" ? "Stiamo per finire." : "Al lavoro!");
    }
  }

  /* ---------- 📝 Verifico: la verifica online dentro la lezione ---------- */
  function apriVerifica() {
    if (!G || document.querySelector(".guida-verifica") || !/^verifiche\/[\w.-]+\.json$/.test(G.l.verifica || "")) return;
    const v = document.createElement("div");
    v.className = "guida-verifica";
    // Niente barra in più: la scaletta dice già "Verifico", e il navigatore porta avanti o indietro.
    v.innerHTML = `<iframe src="verifica.html?file=${encodeURIComponent(G.l.verifica)}&modo=online&dentro=1" title="La verifica"></iframe>`;
    document.body.append(v);
  }
  const chiudiVerifica = () => document.querySelector(".guida-verifica")?.remove();

  // L'orologio si sposta con il dito (LIM) o il mouse; la posizione resta su questo computer.
  const CHIAVE_POS = "classe-irene-orologio-pos";
  function spostabile(d, m) {
    const metti = (x, y) => {
      const r = d.getBoundingClientRect();
      d.style.left = Math.min(Math.max(x, 0), innerWidth - r.width) + "px";
      d.style.top = Math.min(Math.max(y, 0), innerHeight - r.height) + "px";
      d.style.right = "auto";
    };
    try { const p = JSON.parse(localStorage.getItem(CHIAVE_POS)); if (p) requestAnimationFrame(() => metti(p.x * innerWidth, p.y * innerHeight)); } catch {}
    let dx = 0, dy = 0, su = false;
    m.addEventListener("pointerdown", (e) => { const r = d.getBoundingClientRect(); dx = e.clientX - r.left; dy = e.clientY - r.top; su = true; m.setPointerCapture(e.pointerId); e.preventDefault(); });
    m.addEventListener("pointermove", (e) => { if (su) metti(e.clientX - dx, e.clientY - dy); });
    const fine = () => {
      if (!su) return; su = false;
      const r = d.getBoundingClientRect();
      try { localStorage.setItem(CHIAVE_POS, JSON.stringify({ x: r.left / innerWidth, y: r.top / innerHeight })); } catch {}
    };
    m.addEventListener("pointerup", fine); m.addEventListener("pointercancel", fine);
    m.addEventListener("dblclick", () => { d.style.left = d.style.top = d.style.right = ""; try { localStorage.removeItem(CHIAVE_POS); } catch {} });
  }

  // Chiamata dal motore quando la lezione è disegnata.
  function prepara(l, radice) { radice._copia = preparaCopia(l, radice); }


  // Se su questo computer erano rimasti nomi salvati dalla vecchia funzione "Vieni alla lavagna", si cancellano.
  try { localStorage.removeItem("classe-irene-nomi-lavagna"); } catch {}

  // Per ora (prova) solo nelle lezioni con il campo "copia".
  const per = (l) => !!l.copia;

  window.Guida = { FASI, per, copiaHTML, prepara, apri: (l, radice) => apri(l, radice), get attiva() { return !!G; } };
})();
