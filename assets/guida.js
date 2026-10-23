/* ---------- Lezione guidata: il tempo della lezione, fase per fase ----------
   👂 Ascolto, 👀 Guardo, ✍️ Copio, 🎯 Provo, 📝 Verifico.
   - Piano del giorno: la maestra sceglie i minuti che ha, il sito li divide fra le fasi (si possono cambiare).
   - In alto la scaletta delle fasi, con la fase di adesso accesa; di lato l'orologio a torta che si svuota.
   - Quando manca un minuto l'orologio diventa arancione e la voce lo dice; allo scadere suona la campanella
     e si passa alla fase dopo (con "➕ 1 minuto" per aspettare ancora).
   - Semaforo di classe: 🟢 lavoro, 🟡 stiamo per finire, 🔴 penne giù e occhi alla LIM.
   - "Copia sul quaderno": poche righe numerate che compaiono una alla volta, accanto al disegno della pagina.
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
  function pagina(radice, id) {
    if (id === "ascolto") return radice.querySelector(".lezione-testa");
    if (id === "guardo") return radice.querySelector("section.scheda:not(.filastrocca):not(.storia)");
    if (id === "copio") return radice.querySelector(".scheda.copia");
    if (id === "provo") return radice.querySelector(".giorno-esercizi, .esercizio");
    if (id === "verifico") return radice.querySelector(".scheda-verifica");
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
      <div class="go-stelle" hidden></div>
      <div class="go-tasti"><button data-go="pausa" aria-label="Pausa">⏸</button><button data-go="piu" aria-label="Un minuto in più">+1</button><button data-go="avanti" aria-label="Fase dopo">⏭</button></div>
      <div class="go-semaforo" aria-label="Semaforo di classe">
        <button class="sem rosso" data-go="rosso" aria-label="Rosso: penne giù, occhi alla LIM"></button>
        <button class="sem giallo" data-go="giallo" aria-label="Giallo: stiamo per finire"></button>
        <button class="sem verde accesa" data-go="verde" aria-label="Verde: al lavoro"></button></div>
      <button class="go-fine" data-go="fine">✕ Finisci</button>`;
    document.body.append(scaletta, orologio);
    spostabile(orologio, orologio.querySelector(".go-maniglia"));
    // Sul telefono l'orologio parte piccolo (si apre toccandolo).
    if (innerWidth <= 600) orologio.classList.add("piccolo");
    G = { l, radice, fasi, scaletta, orologio, k: -1, pausa: false, copia: radice._copia, fatti: radice.querySelectorAll(".esercizio.risolto").length };
    G.timer = setInterval(tick, 250);
    G.osserva = new MutationObserver(() => { if (G && !lim()) termina(); });
    G.osserva.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    G.risolto = () => { G.fatti = radice.querySelectorAll(".esercizio.risolto").length; };
    radice.addEventListener("risolto", G.risolto);
    // Nella lezione guidata la verifica si apre qui dentro, così l'orologio non si perde.
    G.clicVerifica = (e) => { const a = e.target.closest('a[href*="modo=online"]'); if (a && G) { e.preventDefault(); apriVerifica(); } };
    radice.addEventListener("click", G.clicVerifica, true);
    scaletta.addEventListener("click", (e) => { const b = e.target.closest(".gs-fase"); if (b) vaiFase(+b.dataset.k); });
    orologio.addEventListener("click", (e) => {
      const a = e.target.closest("[data-go]")?.dataset.go;
      if (a === "pausa") pausa(!G.pausa);
      if (a === "piu") { G.fineAt += 60000; G.durata += 60000; G.resta += 60000; G.avvisato = false; orologio.classList.remove("arancione", "rosso-fine"); chiudiCartello(); }
      if (a === "avanti") vaiFase(G.k + 1);
      if (a === "piccolo") orologio.classList.toggle("piccolo");
      if (["rosso", "giallo", "verde"].includes(a)) semaforo(a);
      if (a === "fine") { if (confirm("Vuoi finire la lezione guidata?")) termina(); }
    });
    vaiFase(0);
  }
  function pausa(si) {
    G.pausa = si;
    if (si) G.resta = G.fineAt - Date.now(); else G.fineAt = Date.now() + G.resta;
    G.orologio.classList.toggle("in-pausa", si);
    G.orologio.querySelector('[data-go="pausa"]').textContent = si ? "▶" : "⏸";
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
    o.querySelectorAll(".sem").forEach((s) => s.classList.toggle("accesa", s.dataset.go === "verde"));
    document.querySelector(".guida-rosso")?.remove(); document.querySelector(".guida-striscia")?.remove();
    const p = pagina(G.radice, f.id);
    if (p) G.radice.dispatchEvent(new CustomEvent("lim-vai", { detail: p }));
    if (f.id === "copio") G.copia?.vai(1);
    if (f.id === "verifico") apriVerifica(); else chiudiVerifica();
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
      if (a === "piu") G.orologio.querySelector('[data-go="piu"]').click();
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
    g.scaletta.remove(); g.orologio.remove();
    document.querySelector(".guida-rosso")?.remove(); document.querySelector(".guida-striscia")?.remove();
    document.body.classList.remove("guidata");
    G = null;
  }

  /* ---------- Semaforo di classe ---------- */
  function semaforo(colore) {
    G.orologio.querySelectorAll(".sem").forEach((s) => s.classList.toggle("accesa", s.dataset.go === colore));
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
    v.innerHTML = `<div class="gv-barra"><b>${Figura.img("📝", "figura")} La verifica</b><button class="btn bianco" data-gv="chiudi">✕ Chiudi la verifica</button></div>
      <iframe src="verifica.html?file=${encodeURIComponent(G.l.verifica)}&modo=online" title="La verifica"></iframe>`;
    v.querySelector('[data-gv="chiudi"]').onclick = chiudiVerifica;
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


  /* ---------- 🙋 Vieni alla lavagna ----------
     Ogni bambino ha la sua lettera (es. a = Anna): premendola compare grande "Anna! Vieni alla lavagna!"
     e la voce lo dice. Tasto L (o il pulsantino 🙋 in basso a destra, in modalità LIM): l'elenco, dove si aggiungono
     e si tolgono i nomi e si sceglie la lettera. I nomi restano solo su questo computer (non vanno mai nel sito).
     Per caricarli tutti insieme: un link con #nomi=a:Anna:f:biondi:chiara;t:Tommaso:m:neri:scura (la parte dopo # non arriva al sito).
     Ogni bambino ha il suo disegno: bambino o bambina, colore dei capelli e della pelle. */
  const CHIAVE_NOMI = "classe-irene-nomi-lavagna";
  const RISERVATE = ["l", "p"];   // L = elenco, P = pausa della voce
  const nomi = () => {
    let n = [];
    try { n = JSON.parse(localStorage.getItem(CHIAVE_NOMI)) || []; } catch {}
    // elenco vecchio (solo nomi): ognuno prende la prima lettera libera del suo nome
    return n.map((x) => typeof x === "string" ? { nome: x, tasto: "" } : x);
  };
  const salvaNomi = (n) => { try { localStorage.setItem(CHIAVE_NOMI, JSON.stringify(n)); } catch {} };
  const letteraLibera = (nome, n) => [...nome.toLowerCase().replace(/[^a-z]/g, ""), ..."abcdefghijkmnoqrstuvwxyz"].find((c) => !RISERVATE.includes(c) && !n.some((x) => x.tasto === c)) || "";
  // Il disegno del bambino che viene alla lavagna: bambino o bambina, colore dei capelli e della pelle, mano alzata.
  const CAPELLI = { biondi: ["#F6CF5C", "#D9A52E"], "castani chiari": ["#B98352", "#8E5D33"], "castani scuri": ["#6E4529", "#4E2F1B"], "castani più scuri": ["#4A2C19", "#2E1A0E"], neri: ["#3A3540", "#1C1A20"], rossi: ["#D9663A", "#A9441F"] };
  const PELLE = { chiara: ["#FCE0C8", "#E9B48F"], olivastra: ["#E8B98E", "#C98E5E"], scura: ["#A86B45", "#7A4A2C"], "molto scura": ["#7A4A2C", "#55311C"] };
  const MAGLIE = ["#4C7BE8", "#1FA36A", "#8B5CF6", "#FF8A3D", "#E5484D", "#14A3B8", "#F2B705", "#D9468F"];
  // felpa di partenza: per i bambini blu, verde, arancione, azzurro o rosso; per le bambine tutti i colori. Con 🎨 si cambia.
  const felpa = (x) => x.maglia || (x.sesso === "f" ? MAGLIE : ["#4C7BE8", "#1FA36A", "#FF8A3D", "#14A3B8", "#E5484D"])[(x.tasto || "a").charCodeAt(0) % (x.sesso === "f" ? 8 : 5)];
  function bambinoSVG(x) {
    const [c1, c2] = CAPELLI[x.capelli] || CAPELLI["castani scuri"], [p1, p2] = PELLE[x.pelle] || PELLE.chiara;
    const maglia = felpa(x), f = x.sesso === "f", id = "b" + Math.random().toString(36).slice(2, 7);
    return `<svg class="bambino-svg" viewBox="0 0 200 220" role="img" aria-hidden="true">
      <defs><radialGradient id="${id}p" cx="45%" cy="38%" r="65%"><stop offset="0" stop-color="${p1}"/><stop offset="1" stop-color="${p2}"/></radialGradient>
      <linearGradient id="${id}c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
      ${f ? `<path d="M50 96 C44 44 74 26 100 26 C128 26 158 44 152 98 C150 128 158 150 146 162 L56 162 C44 150 52 128 50 96 Z" fill="url(#${id}c)"/>` : ""}
      <path d="M150 168 C160 140 166 110 170 78" stroke="${maglia}" stroke-width="24" stroke-linecap="round" fill="none"/>
      <circle cx="171" cy="64" r="17" fill="url(#${id}p)"/>
      <path d="M40 220 C40 178 64 156 100 156 C136 156 160 178 160 220 Z" fill="${maglia}"/>
      <path d="M90 136 L90 158 C94 164 106 164 110 158 L110 136 Z" fill="${p2}"/>
      <ellipse cx="100" cy="104" rx="42" ry="45" fill="url(#${id}p)"/>
      <ellipse cx="58" cy="108" rx="7" ry="10" fill="${p2}"/><ellipse cx="142" cy="108" rx="7" ry="10" fill="${p2}"/>
      ${f ? `<path d="M56 96 C54 56 78 44 100 44 C124 44 148 56 146 96 C134 80 116 70 98 66 C88 80 72 90 56 96 Z" fill="url(#${id}c)"/>
             <circle cx="146" cy="76" r="9" fill="#FF6B9A"/>`
          : `<path d="M56 100 C50 56 76 42 100 42 C126 42 152 56 146 100 C142 86 136 78 128 74 C116 80 96 80 84 72 C74 78 64 86 56 100 Z" fill="url(#${id}c)"/>`}
      <ellipse cx="84" cy="106" rx="6" ry="7.5" fill="#2B2A33"/><ellipse cx="116" cy="106" rx="6" ry="7.5" fill="#2B2A33"/>
      <circle cx="86" cy="103" r="2.2" fill="#fff"/><circle cx="118" cy="103" r="2.2" fill="#fff"/>
      <ellipse cx="74" cy="122" rx="8" ry="5" fill="#FF8E8E" opacity=".45"/><ellipse cx="126" cy="122" rx="8" ry="5" fill="#FF8E8E" opacity=".45"/>
      <path d="M88 126 C94 134 106 134 112 126" stroke="#8A3B2E" stroke-width="4" stroke-linecap="round" fill="none"/>
    </svg>`;
  }
  const figuraBambino = (x) => x?.sesso || x?.capelli || x?.pelle ? bambinoSVG(x) : Figura.img("🙋", "figura gigante");
  function chiama(nome) {
    document.querySelector(".chiama-scelta")?.remove();
    document.querySelector(".chiama-grande")?.remove();
    const c = document.createElement("div");
    c.className = "chiama-grande";
    const x = typeof nome === "object" ? nome : nomi().find((y) => y.nome === nome) || { nome };
    nome = x.nome;
    c.innerHTML = `<div class="cg-scatola">${figuraBambino(x)}<b>${h(nome)}!</b><span>Vieni alla lavagna! <img class="figura grande cg-maestra" src="assets/disegni/maestra.svg" alt=""></span></div>`;
    c.addEventListener("click", () => c.remove());
    document.body.append(c);
    campanella(1, .12);
    annuncia(`${nome}! Vieni alla lavagna!`);
    setTimeout(() => c.remove(), 6000);
  }
  function sceltaNome() {
    if (document.querySelector(".chiama-scelta")) return document.querySelector(".chiama-scelta").remove();
    const v = document.createElement("div");
    v.className = "chiama-scelta";
    const disegna = () => {
      const n = nomi();
      v.innerHTML = `<div class="cs-testa"><b>🙋 Chi viene alla lavagna?</b><button data-cs="chiudi" aria-label="Chiudi">✕</button></div>
        ${n.length ? `<div class="cs-nomi">${n.map((x, i) => `<span class="cs-nome"><button data-cs="chiama" data-i="${i}">${x.sesso || x.capelli ? `<span class="cs-faccia">${bambinoSVG(x)}</span>` : ""}<kbd>${h((x.tasto || "?").toUpperCase())}</kbd>${h(x.nome)}</button><button class="cs-colore" data-cs="colore" data-i="${i}" title="Cambia il colore della felpa" aria-label="Cambia il colore della felpa di ${h(x.nome)}"><i style="background:${felpa(x)}"></i></button><button class="cs-via" data-cs="togli" data-i="${i}" aria-label="Togli ${h(x.nome)}">×</button></span>`).join("")}</div>
          <p class="cs-aiuto">Premi la lettera sulla tastiera: il bambino viene chiamato subito, anche con questo elenco chiuso.</p>`
          : `<p class="cs-vuoto">Scrivi qui sotto i nomi dei bambini e la loro lettera. Restano solo su questo computer.</p>`}
        <form class="cs-aggiungi"><input name="nome" maxlength="24" placeholder="Nome" autocomplete="off"><input name="tasto" class="cs-tasto" maxlength="1" placeholder="lettera" autocomplete="off" aria-label="Lettera">
          <select name="sesso" aria-label="Bambino o bambina"><option value="m">bambino</option><option value="f">bambina</option></select>
          <select name="capelli" aria-label="Capelli">${Object.keys(CAPELLI).map((k) => `<option>${k}</option>`).join("")}</select>
          <select name="pelle" aria-label="Pelle">${Object.keys(PELLE).map((k) => `<option>${k}</option>`).join("")}</select>
          <button class="btn piccolo">＋ Aggiungi</button></form>`;
    };
    v.addEventListener("click", (e) => {
      const b = e.target.closest("[data-cs]"); if (!b) return;
      const n = nomi(), i = +b.dataset.i;
      if (b.dataset.cs === "chiudi") v.remove();
      if (b.dataset.cs === "chiama") chiama(n[i]);
      if (b.dataset.cs === "togli") { n.splice(i, 1); salvaNomi(n); disegna(); }
      // 🎨 la felpa passa al colore dopo (resta salvato su questo computer)
      if (b.dataset.cs === "colore") { const x = n[i], ora = felpa(x); x.maglia = MAGLIE[(MAGLIE.indexOf(ora) + 1) % MAGLIE.length]; salvaNomi(n); disegna(); }
    });
    v.addEventListener("submit", (e) => {
      e.preventDefault();
      const nome = v.querySelector('[name="nome"]').value.trim();
      let t = v.querySelector('[name="tasto"]').value.trim().toLowerCase();
      if (nome) {
        const n = nomi().filter((x) => x.nome !== nome);
        if (!/^[a-z]$/.test(t) || RISERVATE.includes(t)) t = letteraLibera(nome, n);
        n.forEach((x) => { if (x.tasto === t) x.tasto = ""; });   // la lettera passa al nuovo nome
        const val = (k) => v.querySelector(`[name="${k}"]`).value;
        n.push({ nome, tasto: t, sesso: val("sesso"), capelli: val("capelli"), pelle: val("pelle") }); salvaNomi(n);
      }
      disegna(); v.querySelector('[name="nome"]').focus();
    });
    disegna();
    document.body.append(v);
  }
  // Link per caricare i nomi: ...#nomi=a:Anna;t:Tommaso. Poi la parte dopo # sparisce dall'indirizzo.
  function nomiDalLink() {
    const m = location.hash.match(/^#nomi=(.*)$/);
    if (!m) return;
    // ogni bambino: lettera:nome:m|f:capelli:pelle (le ultime tre facoltative)
    const n = decodeURIComponent(m[1]).split(";").map((x) => x.split(":")).filter(([t, nome]) => /^[a-z]$/i.test(t || "") && nome?.trim())
      .map(([t, nome, sesso, capelli, pelle]) => ({ tasto: t.toLowerCase(), nome: nome.trim(), sesso: sesso === "f" ? "f" : "m",
        capelli: CAPELLI[capelli] ? capelli : "castani scuri", pelle: PELLE[pelle] ? pelle : "chiara" })).filter((x) => !RISERVATE.includes(x.tasto));
    history.replaceState(null, "", location.pathname + location.search);
    if (!n.length) return;
    salvaNomi(n);
    const a = document.createElement("div");
    a.className = "guida-striscia verde"; a.style.top = "20px";
    a.textContent = `✅ ${n.length} nomi salvati su questo computer. Premi L per vederli.`;
    document.body.append(a); setTimeout(() => a.remove(), 5000);
  }
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.altKey || e.metaKey || e.repeat || e.target.closest?.("input, textarea, select, [contenteditable]")) return;
    const k = e.key.toLowerCase();
    if (k === "l") { e.preventDefault(); sceltaNome(); return; }
    if (k === "escape") { document.querySelector(".chiama-scelta")?.remove(); document.querySelector(".chiama-grande")?.remove(); return; }
    const x = /^[a-z]$/.test(k) && nomi().find((y) => y.tasto === k);
    if (x) { e.preventDefault(); chiama(x); }
  });
  const pulsantino = document.createElement("button");
  pulsantino.className = "chiama-btn"; pulsantino.type = "button"; pulsantino.textContent = "🙋";
  pulsantino.setAttribute("aria-label", "Chiama un bambino alla lavagna");
  pulsantino.onclick = sceltaNome;
  document.addEventListener("DOMContentLoaded", () => { document.body.append(pulsantino); nomiDalLink(); });

  // Per ora (prova) solo nelle lezioni con il campo "copia".
  const per = (l) => !!l.copia;

  window.Guida = { FASI, per, chiama, sceltaNome, copiaHTML, prepara, apri: (l, radice) => apri(l, radice), get attiva() { return !!G; } };
})();
