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
  // La divisione in colonna come si scrive sul quaderno: una cifra per quadretto.
  function divisioneQuaderno(a, b) {
    const dv = Animazioni.calcolaDivisione(a, b), n = dv.D.length, R = dv.giri.length, m = Math.max(dv.L, R);
    const celle = {};
    dv.D.forEach((c, i) => { celle[`0-${i}`] = c; });
    dv.giri.forEach((g, i) => {
      const r = String(g.r);
      [...r].forEach((c, k) => { celle[`${i + 1}-${g.fine - r.length + 1 + k}`] = c; });
      if (g.scende) celle[`${i + 1}-${g.scende.col}`] = g.scende.cifra;
    });
    [...String(b)].forEach((c, k) => { celle[`0-${n + k}`] = c; });
    dv.giri.forEach((g, i) => { celle[`1-${n + i}`] = g.q; });
    let html = "";
    for (let r = 0; r <= R; r++) for (let c = 0; c < n + m; c++) {
      const cls = (c === n ? " cq-sx" : "") + (r === 0 && c >= n ? " cq-sotto" : "");
      html += `<span class="cq-cella${cls}">${celle[`${r}-${c}`] ?? ""}</span>`;
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
     Tasto L (o il pulsantino 🙋 in basso a destra, nella modalità LIM): si sceglie un nome e compare grande
     "Nome! Vieni alla lavagna!", detto anche dalla voce. Con la scelta aperta, i tasti 1–9 chiamano subito quel nome.
     I nomi restano solo su questo computer (non vanno mai nel sito). */
  const CHIAVE_NOMI = "classe-irene-nomi-lavagna";
  const nomi = () => { try { return JSON.parse(localStorage.getItem(CHIAVE_NOMI)) || []; } catch { return []; } };
  const salvaNomi = (n) => { try { localStorage.setItem(CHIAVE_NOMI, JSON.stringify(n)); } catch {} };
  function chiama(nome) {
    document.querySelector(".chiama-scelta")?.remove();
    document.querySelector(".chiama-grande")?.remove();
    const c = document.createElement("div");
    c.className = "chiama-grande";
    c.innerHTML = `<div class="cg-scatola">${Figura.img("🙋", "figura gigante")}<b>${h(nome)}!</b><span>Vieni alla lavagna! <img class="figura grande cg-maestra" src="assets/disegni/maestra.svg" alt=""></span></div>`;
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
        ${n.length ? `<div class="cs-nomi">${n.map((x, i) => `<span class="cs-nome"><button data-cs="chiama" data-i="${i}">${i < 9 ? `<small>${i + 1}</small>` : ""}${h(x)}</button><button class="cs-via" data-cs="togli" data-i="${i}" aria-label="Togli ${h(x)}">×</button></span>`).join("")}</div>`
          : `<p class="cs-vuoto">Scrivi qui sotto i nomi dei bambini. Restano solo su questo computer.</p>`}
        <form class="cs-aggiungi"><input name="nome" maxlength="24" placeholder="Nuovo nome" autocomplete="off"><button class="btn piccolo">＋ Aggiungi</button></form>`;
    };
    v.addEventListener("click", (e) => {
      const b = e.target.closest("[data-cs]"); if (!b) return;
      const n = nomi(), i = +b.dataset.i;
      if (b.dataset.cs === "chiudi") v.remove();
      if (b.dataset.cs === "chiama") chiama(n[i]);
      if (b.dataset.cs === "togli") { n.splice(i, 1); salvaNomi(n); disegna(); }
    });
    v.addEventListener("submit", (e) => {
      e.preventDefault();
      const x = v.querySelector("input").value.trim();
      if (x) { const n = nomi(); if (!n.includes(x)) n.push(x); salvaNomi(n); }
      disegna(); v.querySelector("input").focus();
    });
    disegna();
    document.body.append(v);
  }
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.altKey || e.metaKey || e.target.closest?.("input, textarea, select, [contenteditable]")) return;
    if (e.key === "l" || e.key === "L") { e.preventDefault(); sceltaNome(); }
    else if (document.querySelector(".chiama-scelta") && /^[1-9]$/.test(e.key) && nomi()[+e.key - 1]) { e.preventDefault(); chiama(nomi()[+e.key - 1]); }
    else if (e.key === "Escape") { document.querySelector(".chiama-scelta")?.remove(); document.querySelector(".chiama-grande")?.remove(); }
  });
  const pulsantino = document.createElement("button");
  pulsantino.className = "chiama-btn"; pulsantino.type = "button"; pulsantino.textContent = "🙋";
  pulsantino.setAttribute("aria-label", "Chiama un bambino alla lavagna");
  pulsantino.onclick = sceltaNome;
  document.addEventListener("DOMContentLoaded", () => document.body.append(pulsantino));

  // Per ora (prova) solo nelle lezioni con il campo "copia".
  const per = (l) => !!l.copia;

  window.Guida = { FASI, per, chiama, sceltaNome, copiaHTML, prepara, apri: (l, radice) => apri(l, radice), get attiva() { return !!G; } };
})();
