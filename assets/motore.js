// Motore delle lezioni: trasforma una lezione in formato JSON in una pagina interattiva.
// Tipi di esercizio: scelta, vero_falso, abbina, categorie, ordina, completa, conta, retta, colonna, gelosia, addizione, colora_frazione, leggi_frazione.

(function () {
  const TIPI = ["scelta", "vero_falso", "abbina", "categorie", "ordina", "completa", "conta", "retta", "colonna", "gelosia", "addizione", "costruisci", "equivalenza", "leggi_tabella", "virgola", "colora_frazione", "leggi_frazione", ...(window.Giochi?.TIPI || [])];
  const BRAVO = ["Fantastico! 🎉", "Esatto! ⭐", "Perfetto! 🌟", "Super! 🚀", "Giusto! 👏"];
  const RIPROVA = ["Quasi! Riprova 💪", "Ops, ritenta! 🙂", "Non ancora, prova di nuovo!"];
  const caso = (a) => a[Math.floor(Math.random() * a.length)];
  const h = escapeHTML;

  // Addizione in colonna di 2ª: due numeri interi (anche di una cifra) con somma fino a 99.
  const addizioneValida = (x) => Number.isInteger(x.a) && Number.isInteger(x.b) && x.a >= 1 && x.b >= 1 && x.a + x.b <= 99;

  /* ---------- Controllo del formato (usato anche da "5 minuti") ---------- */
  function valida(l) {
    const errori = [];
    if (!l || typeof l !== "object") return ["Il testo non contiene una lezione."];
    if (!l.titolo) errori.push("Manca il titolo.");
    if (!Array.isArray(l.sezioni) || !l.sezioni.length) errori.push("Mancano le sezioni della spiegazione.");
    if (!Array.isArray(l.esercizi) || !l.esercizi.length) errori.push("Mancano gli esercizi.");
    (l.sezioni || []).forEach((s, i) => {
      const an = s.animazione;
      if (!an) return;
      if (an.tipo === "scena") {
        if (!(window.Animazioni?.SCENE || []).includes(an.scena)) errori.push(`Sezione ${i + 1}: la scena "${an.scena}" non esiste (scene pronte: ${(window.Animazioni?.SCENE || []).join(", ")}).`);
      } else if (an.tipo === "sequenza") {
        if (!Array.isArray(an.passi) || an.passi.length < 2 || an.passi.length > 10 || an.passi.some((p) => !p || typeof p.testo !== "string" || !p.testo.trim()))
          errori.push(`Sezione ${i + 1}: la sequenza ha bisogno di 2-10 "passi", ognuno con "figure" e "testo".`);
      } else if (an.tipo === "addizione") {
        if (!addizioneValida(an)) errori.push(`Sezione ${i + 1}: l'addizione ha bisogno di "a" e "b" con somma fino a 99.`);
      } else if (!(["moltiplicazione", "scomposizione", "gelosia"].includes(an.tipo) && Number.isInteger(an.a) && Number.isInteger(an.b) && an.a > 0 && an.b > 0 && an.a <= 999 && an.b <= 99))
        errori.push(`Sezione ${i + 1}: animazione non valida (tipo "moltiplicazione", "scomposizione" o "gelosia", a fino a 999, b fino a 99; oppure "scena" o "sequenza").`);
    });
    (l.esercizi || []).forEach((e, i) => {
      const n = `Esercizio ${i + 1}`;
      if (!TIPI.includes(e.tipo)) return errori.push(`${n}: tipo "${e.tipo}" sconosciuto.`);
      if (e.tipo === "scelta" && (!Array.isArray(e.opzioni) || e.opzioni[e.corretta] === undefined)) errori.push(`${n}: opzioni o risposta corretta non valide.`);
      if (e.tipo === "vero_falso" && typeof e.corretta !== "boolean") errori.push(`${n}: "corretta" deve essere true o false.`);
      if (e.tipo === "abbina" && !(Array.isArray(e.coppie) && e.coppie.length >= 2)) errori.push(`${n}: servono almeno 2 coppie.`);
      if (e.tipo === "categorie" && !(Array.isArray(e.categorie) && Array.isArray(e.elementi) && e.elementi.every((x) => e.categorie.includes(x.categoria)))) errori.push(`${n}: categorie o elementi non validi.`);
      if (e.tipo === "ordina" && !(Array.isArray(e.elementi) && e.elementi.length >= 2)) errori.push(`${n}: servono almeno 2 elementi da ordinare.`);
      if (e.tipo === "completa" && !/\[[^\]]+\]/.test(e.testo || "")) errori.push(`${n}: il testo deve avere le parole da completare tra [parentesi quadre].`);
      if (e.tipo === "conta" && !(e.oggetto && Number.isInteger(e.numero))) errori.push(`${n}: servono "oggetto" e "numero".`);
      if ((e.tipo === "colonna" || e.tipo === "gelosia") && !(Number.isInteger(e.a) && Number.isInteger(e.b) && e.a >= 2 && e.a <= 999 && e.b >= 2 && e.b <= 99)) errori.push(`${n}: servono "a" (fino a 999) e "b" (fino a 99).`);
      if (e.tipo === "addizione" && !addizioneValida(e)) errori.push(`${n}: servono "a" e "b" con somma fino a 99.`);
      if (window.Giochi?.TIPI.includes(e.tipo)) errori.push(...Giochi.valida(e, n));
      if (e.tipo === "costruisci" && !(Number.isInteger(e.numero) && e.numero >= 1 && e.numero <= 100)) errori.push(`${n}: serve "numero" da 1 a 100.`);
      if (e.tipo === "equivalenza" && !(Number.isInteger(e.n) && e.n > 0 && ["k", "h", "da", "u"].includes(e.da) && ["k", "h", "da", "u"].includes(e.a) && Number.isInteger(Animazioni.calcolaEquivalenza(e.n, e.da, e.a)))) errori.push(`${n}: servono "n", "da" e "a" (k, h, da, u) con risultato intero.`);
      if (e.tipo === "leggi_tabella" && !(Number.isInteger(e.n) && e.n > 0 && e.n < 1000 && ["hk", "dak", "uk", "h", "da", "u"].includes(e.da) && ["hk", "dak", "uk", "h", "da", "u"].includes(e.a) && e.da !== e.a)) errori.push(`${n}: servono "n" (fino a 999), "da" e "a" diversi (hk, dak, uk, h, da, u).`);
      if ((e.tipo === "colora_frazione" || e.tipo === "leggi_frazione") && !(Number.isInteger(e.d) && Number.isInteger(e.n) && e.d >= 2 && e.d <= 10 && e.n >= 1 && e.n < (e.tipo === "colora_frazione" ? e.d + 1 : e.d))) errori.push(`${n}: servono "n" e "d" (d da 2 a 10, n più piccolo di d).`);
      if (e.tipo === "virgola" && !(["x", ":"].includes(e.op) && [10, 100, 1000].includes(+e.per) && Animazioni.calcolaVirgola(e.n, e.op, +e.per))) errori.push(`${n}: servono "n" (es. "2,35"), "op" ("x" o ":") e "per" (10, 100 o 1000); il numero e il risultato devono stare nella tabella h da u , d c m.`);
      if (e.tipo === "retta" && !(Number.isFinite(e.min) && Number.isFinite(e.max) && Number.isFinite(e.corretta))) errori.push(`${n}: servono min, max e corretta.`);
    });
    return errori;
  }

  /* ---------- Spiegazione ---------- */
  function disegnaLezione(l, radice) {
    const materia = MATERIE[l.materia] || MATERIE.matematica;
    document.body.classList.toggle("scienze", l.materia === "scienze");
    document.title = `${l.titolo} · ${SITO.nome}`;

    radice.innerHTML = `
      <div class="lezione-testa">
        ${Figura.img(l.emoji || materia.icona, "figura gigante")}
        <div class="etichetta" style="background:var(--tema-chiaro);color:var(--tema)">${h(materia.nome)}${l.classe ? ` · classe ${h(l.classe)}ª` : ""}</div>
        <h1>${h(l.titolo)}</h1>
        ${l.introduzione ? `<p>${h(l.introduzione)}</p>` : ""}
      </div>
      <div class="barra-lezione">
        <button class="btn bianco" data-azione="leggi-tutto">🔊 Ascolta la lezione</button>
        <button class="btn bianco" data-azione="vai-esercizi">🎯 Vai agli esercizi</button>
        ${l.quaderno ? `<button class="btn quaderno-link" data-azione="vai-quaderno">📒 ${h(l.quaderno.titolo || "Ricopiare sul quaderno")}</button>` : ""}
        <button class="btn" data-azione="lim">🖥️ Modalità LIM</button>
        <button class="btn bianco" data-azione="scritte">💬 Scritte: ${Sottotitoli.attivo ? "sì" : "no"}</button>
        <button class="btn bianco" data-azione="velocita">🐢 Voce: ${Voce.velocita()}</button>
        <button class="btn bianco" data-azione="suoni">🔔 Suoni: sì</button>
        <button class="btn bianco" data-azione="maiuscolo">🔠 STAMPATO MAIUSCOLO</button>
      </div>
      ${l.storia ? storiaHTML(l) : ""}
      ${l.sezioni.map((s) => `
        <section class="scheda${s.animazione ? " con-animazione" : ""}">
          <div class="scheda-corpo">
            <h2>${h(s.titolo)}<button class="leggi" data-leggi="${h(s.titolo + ". " + s.testo)}" data-figura="${h(s.immagine || "")}">🔊 Leggi</button></h2>
            ${String(s.testo).split(/\n+/).map((p) => `<p>${Figura.frazioni(h(p))}</p>`).join("")}
            ${s.immagini?.length ? `<div class="galleria">${s.immagini.map((x) => `<figure>${Figura.ricco(x, "figura media")}</figure>`).join("")}</div>` : ""}
            ${s.animazione ? `<div class="anim-posto" data-anim="${h(JSON.stringify(s.animazione))}"></div>` : ""}
            ${s.pensa ? `<div class="pensa"><b>🤔 ${h(s.pensa.domanda)}</b><button class="btn bianco piccolo" data-svela>👀 Scopri la risposta</button><p class="pensa-risposta" hidden>${h(s.pensa.risposta)}</p></div>` : ""}
            ${s.scopri?.length ? `<p class="gioco-aiuto">Tocca le carte per scoprire cosa c'è dietro!</p><div class="scopri">${s.scopri.map((x) => `<button class="carta-scopri" data-retro="${h(x.retro)}"><span class="fronte">${Figura.ricco(x.fronte, "figura grande")}</span><span class="retro">${Figura.ricco(x.retro, "figura media")}</span></button>`).join("")}</div>` : ""}
            ${s.esperimento ? esperimentoHTML(s.esperimento) : ""}
            ${s.curiosita ? `<div class="curiosita">${Figura.frazioni(h(s.curiosita))}</div>` : ""}
          </div>
          <div class="scheda-figura">${Figura.img(s.immagine || s.emoji || "📘", "figura grande")}</div>
        </section>`).join("")}
      ${l.ricorda?.length ? `<section class="scheda ricorda"><div class="scheda-corpo"><h2>📌 Ricordiamo<button class="leggi" data-leggi="${h(l.ricorda.map((x) => Figura.dividi(x).testo).join(". "))}">🔊 Leggi</button></h2>
        <ol class="ricorda-lista">${l.ricorda.map((x) => `<li>${Figura.ricco(x, "figura media")}</li>`).join("")}</ol></div><div class="scheda-figura">${Figura.img("📌", "figura grande")}</div></section>` : ""}
      ${l.quaderno ? quadernoHTML(l.quaderno) : ""}
      ${l.parole_chiave?.length ? `<section class="scheda"><div class="scheda-corpo"><h2>Parole da ricordare</h2><div class="parole">${l.parole_chiave.map((p) => `<span class="parola">${Figura.ricco(p)}</span>`).join("")}</div></div><div class="scheda-figura">${Figura.img("🗝️", "figura grande")}</div></section>` : ""}
      ${/^verifiche\/[\w.-]+\.json$/.test(l.verifica || "") ? `<section class="scheda"><div class="scheda-corpo"><h2>📝 La verifica</h2><p>Si può fare sullo schermo o sulla LIM, e il sito la corregge subito. Oppure si stampa: c'è anche la versione facilitata e, per l'insegnante, le soluzioni.</p><p class="bottoni-verifica"><a class="btn verde" href="verifica.html?file=${h(l.verifica)}&modo=online">💻 Fai la verifica online</a> <a class="btn bianco" href="verifica.html?file=${h(l.verifica)}">🖨️ Verifica da stampare</a></p></div><div class="scheda-figura">${Figura.img("📝", "figura grande")}</div></section>` : ""}
      <h2 id="esercizi" style="text-align:center;margin-top:36px">🎯 Ora tocca a te!</h2>
      <div class="punteggio">⭐ <span data-punti>0</span> / ${l.esercizi.length}</div>
      ${mappaHTML(l)}
      <div data-esercizi></div>
      <div class="fine" data-fine hidden></div>`;

    radice.addEventListener("click", (ev) => {
      const b = ev.target.closest("button");
      if (!b) return;
      // Negli esercizi la voce legge senza il riquadro al centro, che coprirebbe le risposte.
      if (b.dataset.leggi) Voce.parla(b.dataset.leggi, null, b.closest(".esercizio") ? { scritte: false } : { figura: b.dataset.figura || undefined });
      if (b.classList.contains("carta-scopri")) { b.classList.toggle("girata"); if (b.classList.contains("girata")) leggi(Figura.dividi(b.dataset.retro).testo); }
      if (b.hasAttribute("data-svela")) { const r = b.nextElementSibling; r.hidden = false; b.hidden = true; leggi(r.textContent); }
      if (b.classList.contains("passo-esp")) b.classList.toggle("fatto");
      if (b.dataset.azione === "storia") leggi(`${l.storia.testo} ${l.storia.missione || ""}`);
      const a = b.dataset.azione;
      if (a === "leggi-tutto") leggiLezione(b);
      if (a === "scritte") { Sottotitoli.attivo = !Sottotitoli.attivo; b.textContent = `💬 Scritte: ${Sottotitoli.attivo ? "sì" : "no"}`; }
      if (a === "vai-esercizi") document.getElementById("esercizi").scrollIntoView({ behavior: "smooth" });
      if (a === "vai-quaderno") { const q = radice.querySelector(".quaderno"); if (document.body.classList.contains("lim")) apriQuaderno(l.quaderno); else q?.scrollIntoView({ behavior: "smooth", block: "start" }); }
      if (a === "apri-quaderno") apriQuaderno(l.quaderno);
      if (a === "lim") avviaLIM(radice);
      if (a === "velocita") {
        const nomi = Object.keys(Voce.VELOCITA), dopo = nomi[(nomi.indexOf(Voce.velocita()) + 1) % nomi.length];
        Voce.impostaVelocita(dopo); b.textContent = `🐢 Voce: ${dopo}`; Voce.parla("Leggo così.");
      }
      if (a === "maiuscolo") document.body.classList.toggle("maiuscolo");
      if (a === "suoni") { Suono.attivo = !Suono.attivo; b.textContent = `🔔 Suoni: ${Suono.attivo ? "sì" : "no"}`; }
    });

    // Parole della lezione con la loro iconcina, per le scritte che accompagnano la voce.
    Sottotitoli.dizionario([...(l.parole_chiave || []), ...(l.storia?.immagini || []), ...l.sezioni.flatMap((s) => s.immagini || [])]);

    // "Ascolta la lezione": legge una scheda alla volta, la mostra e la illumina.
    let lettura = 0;
    function leggiLezione(btn) {
      const mio = ++lettura;
      if (btn.dataset.inCorso) { delete btn.dataset.inCorso; btn.textContent = "🔊 Ascolta la lezione"; speechSynthesis?.cancel(); radice.querySelectorAll(".in-lettura").forEach((x) => x.classList.remove("in-lettura")); return; }
      btn.dataset.inCorso = "1"; btn.textContent = "⏹ Ferma la lettura";
      // Lo Stop del telecomando ferma anche la lettura di tutta la lezione.
      document.addEventListener("voce-ferma", () => { if (mio !== lettura) return; delete btn.dataset.inCorso; btn.textContent = "🔊 Ascolta la lezione"; radice.querySelectorAll(".in-lettura").forEach((x) => x.classList.remove("in-lettura")); }, { once: true });
      const pezzi = [{ el: radice.querySelector(".lezione-testa"), t: `${l.titolo}. ${l.introduzione || ""}`, figura: l.emoji },
        ...(l.storia ? [{ el: radice.querySelector(".storia"), t: `${l.storia.testo} ${l.storia.missione || ""}`, figura: l.storia.personaggio }] : []),
        ...[...radice.querySelectorAll("section.scheda:not(.storia):not(.ricorda)")].slice(0, l.sezioni.length).map((el, i) => ({ el, t: `${l.sezioni[i].titolo}. ${l.sezioni[i].testo}`, figura: l.sezioni[i].immagine }))];
      const avanti = (k) => {
        radice.querySelectorAll(".in-lettura").forEach((x) => x.classList.remove("in-lettura"));
        if (mio !== lettura || !btn.dataset.inCorso) return;
        if (k >= pezzi.length) { delete btn.dataset.inCorso; btn.textContent = "🔊 Ascolta la lezione"; return; }
        const p = pezzi[k];
        p.el?.classList.add("in-lettura");
        if (!document.body.classList.contains("lim")) p.el?.scrollIntoView({ behavior: "smooth", block: "start" });
        Voce.parla(p.t, () => setTimeout(() => avanti(k + 1), 700), { figura: p.figura });
      };
      avanti(0);
    }

    radice.querySelectorAll(".anim-posto").forEach((p) => { try { Animazioni.crea(p, JSON.parse(p.dataset.anim)); } catch {} });
    disegnaEsercizi(l, radice);
    try { window.Effetti?.avvia(l, radice); } catch (err) { console.warn(err); }
  }

  /* ---------- Storia, missione, esperimenti, mappa e album ---------- */
  function storiaHTML(l) {
    const st = l.storia;
    return `<section class="scheda storia"><div class="scheda-corpo">
      <div class="fumetto-riga">${Figura.img(st.personaggio || "🦉", "figura gigante personaggio")}
        <div class="fumetto">${String(st.testo).split(/\n+/).map((p) => `<p>${h(p)}</p>`).join("")}</div></div>
      ${st.immagini?.length ? `<div class="galleria">${st.immagini.map((x) => `<figure>${Figura.ricco(x, "figura media")}</figure>`).join("")}</div>` : ""}
      ${st.missione ? `<div class="missione">🎯 <b>La missione:</b> ${h(st.missione)}</div>` : ""}
      <button class="btn bianco" data-azione="storia">🔊 Ascolta la storia</button>
    </div></section>`;
  }
  // La pagina del quaderno da ricopiare: foto ripulita, ben in vista, che si apre a tutto schermo.
  function quadernoHTML(q) {
    return `<section class="scheda quaderno" id="quaderno"><div class="scheda-corpo">
      <h2>📒 ${h(q.titolo || "Ricopiare sul quaderno")}<button class="leggi" data-leggi="${h(q.testo || "Ricopia questa pagina sul quaderno.")}">🔊 Leggi</button></h2>
      ${q.testo ? `<p>${h(q.testo)}</p>` : ""}
      <div class="quaderno-azioni"><button class="btn" data-azione="apri-quaderno">✍️ Ricopiare sul quaderno</button></div>
      <button class="foglio" type="button" data-azione="apri-quaderno" aria-label="Guarda la pagina in grande">
        <span class="nastro n1"></span><span class="nastro n2"></span>
        <img src="${h(q.immagine)}" alt="La pagina del quaderno da ricopiare" loading="lazy">
        <span class="foglio-lente">🔍 Guarda in grande</span>
      </button>
    </div></section>`;
  }
  function apriQuaderno(q) {
    if (!q) return;
    const v = document.createElement("div");
    v.className = "quaderno-vista";
    v.innerHTML = `<div class="qv-barra"><b>📒 ${h(q.titolo || "Ricopiare sul quaderno")}</b>
        <button class="btn bianco" data-qv="zoom">🔍 Ingrandisci</button>
        <button class="btn bianco" data-qv="stampa">🖨️ Stampa</button>
        <button class="btn" data-qv="chiudi">✕ Chiudi</button></div>
      <div class="qv-foglio"><img src="${h(q.immagine)}" alt="La pagina del quaderno da ricopiare"></div>`;
    const chiudi = () => { v.remove(); document.removeEventListener("keydown", tasto, true); };
    const tasto = (e) => { if (e.key === "Escape") { e.stopPropagation(); chiudi(); } };
    v.addEventListener("click", (e) => {
      const a = e.target.closest("[data-qv]")?.dataset.qv;
      if (a === "chiudi" || e.target === v) chiudi();
      if (a === "zoom" || e.target.tagName === "IMG") { const z = v.classList.toggle("zoom"); v.querySelector('[data-qv="zoom"]').textContent = z ? "↩️ Pagina intera" : "🔍 Ingrandisci"; }
      if (a === "stampa") { const w = open("", "_blank"); if (!w) return; w.document.write(`<title>${h(q.titolo || "Quaderno")}</title><style>@page{margin:10mm}body{margin:0;text-align:center}img{max-width:100%;max-height:100vh}</style><img src="${new URL(q.immagine, location.href).href}" onload="print()">`); w.document.close(); }
    });
    document.addEventListener("keydown", tasto, true);
    document.body.append(v);
  }
  function esperimentoHTML(x) {
    return `<div class="esperimento"><h3>🧪 ${h(x.titolo || "Proviamo in classe!")}</h3>
      ${x.materiali?.length ? `<div class="materiali"><b>Ci serve:</b> ${x.materiali.map((m) => `<span class="materiale">${Figura.ricco(m, "figura piccola")}</span>`).join("")}</div>` : ""}
      <ol class="passi-esp">${(x.passi || []).map((p) => `<li><button class="passo-esp">${Figura.ricco(p, "figura piccola")}</button></li>`).join("")}</ol>
      ${x.domanda ? `<p class="esp-domanda">🤔 ${h(x.domanda)}</p>` : ""}</div>`;
  }
  function mappaHTML(l) {
    const chi = l.storia?.personaggio || "🦉", premio = l.premio || "🏆";
    return `<div class="mappa${l.esercizi.length > 24 ? " fitta" : ""}" aria-hidden="true"><div class="sentiero">
      ${l.esercizi.map((_, i) => `<span class="sasso" data-sasso="${i}">${i + 1}</span>`).join("")}
      <span class="sasso traguardo">${Figura.img(premio, "figura piccola")}</span></div>
      <span class="viaggiatore" style="--pos:0">${Figura.img(chi, "figura media")}</span></div>`;
  }
  const Album = {
    chiave: "classe-irene-album",
    tutte() { try { return JSON.parse(localStorage.getItem(this.chiave)) || []; } catch { return []; } },
    aggiungi(f) {
      const el = this.tutte().filter((x) => x.titolo !== f.titolo || x.file !== f.file);
      el.push(f);
      try { localStorage.setItem(this.chiave, JSON.stringify(el)); } catch {}
    },
  };
  window.Album = Album;

  /* ---------- Esercizi ---------- */
  function disegnaEsercizi(l, radice) {
    const box = radice.querySelector("[data-esercizi]");
    const fine = radice.querySelector("[data-fine]");
    const punti = radice.querySelector("[data-punti]");
    let risolti = 0, errori = 0;

    const stato = {
      errore() { errori++; Suono.sbagliato(); radice.dispatchEvent(new CustomEvent("errore")); },
      risolto(el, spiegazione) {
        if (el.classList.contains("risolto")) return;
        el.classList.add("risolto");
        risolti++; punti.textContent = risolti;
        const mappa = radice.querySelector(".mappa");
        if (mappa) {
          mappa.querySelector(`[data-sasso="${[...box.children].indexOf(el)}"]`)?.classList.add("fatto");
          mappa.querySelector(".viaggiatore").style.setProperty("--pos", risolti / l.esercizi.length);
        }
        Suono.giusto();
        const sp = el.querySelector(".spiegazione");
        sp.textContent = caso(BRAVO) + (spiegazione ? " " + spiegazione : "");
        sp.classList.add("visibile");
        radice.dispatchEvent(new CustomEvent("risolto", { detail: { el } }));
        if (risolti === l.esercizi.length) finale();
      },
    };

    function premioHTML() {
      const premio = l.premio || "🏆";
      Album.aggiungi({ titolo: l.titolo, file: parametri().file || "", premio, materia: l.materia, classe: l.classe, data: new Date().toISOString().slice(0, 10) });
      return `<div class="figurina-vinta">${Figura.img(premio, "figura gigante")}<p>Hai vinto una figurina per il tuo <a href="album.html">album</a>!</p></div>`;
    }
    function finale() {
      const stelle = errori <= l.esercizi.length * 0.2 ? 3 : errori <= l.esercizi.length * 0.6 ? 2 : 1;
      fine.hidden = false;
      fine.innerHTML = `<div class="stelle">${"⭐".repeat(stelle)}${"☆".repeat(3 - stelle)}</div>
        ${premioHTML()}
        <h2>${l.storia?.missione ? "Missione compiuta!" : "Hai completato la lezione!"}</h2>
        <p>${stelle === 3 ? "Risultato da campioni!" : stelle === 2 ? "Ottimo lavoro, continua così!" : "Ce l'hai fatta! Con un po' di allenamento andrà ancora meglio."}</p>
        <button class="btn" onclick="location.reload()">🔁 Ricomincia</button>`;
      Suono.festa(); coriandoli();
      radice.dispatchEvent(new CustomEvent("finita"));
      if (!document.body.classList.contains("lim")) fine.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    l.esercizi.forEach((e, i) => {
      const el = document.createElement("div");
      el.className = "esercizio";
      el.innerHTML = `<span class="num">Esercizio ${i + 1}</span><div class="corpo"></div><div class="spiegazione"></div>`;
      box.append(el);
      const corpo = el.querySelector(".corpo");
      const sbaglia = (nodo) => {
        stato.errore();
        if (nodo) { nodo.classList.remove("sbagliata"); void nodo.offsetWidth; nodo.classList.add("sbagliata"); }
        const sp = el.querySelector(".spiegazione");
        sp.textContent = caso(RIPROVA) + (e.suggerimento ? " " + e.suggerimento : "");
        sp.classList.add("visibile");
      };
      // Passo giusto dentro un esercizio a più mosse: tolgo il rosso e il vecchio "ritenta".
      const bene = (nodo) => {
        nodo?.classList.remove("sbagliata");
        const sp = el.querySelector(".spiegazione");
        if (sp.classList.contains("visibile")) { sp.textContent = caso(["Giusto! 👍", "Bravo! Continua così.", "Sì, è quello giusto!"]); }
      };
      ESERCIZI[e.tipo](e, corpo, { ok: () => stato.risolto(el, e.spiegazione), ko: sbaglia, bene });
    });
  }

  // Domanda con figura facoltativa e pulsante per ascoltarla (utile a chi legge con fatica).
  const domanda = (t, e = {}) => (t ? `<div class="domanda-riga">${e.immagine ? Figura.img(e.immagine, "figura media") : ""}
    <div class="domanda">${Figura.frazioni(h(t))}</div><button class="leggi" data-leggi="${h(t)}" aria-label="Ascolta la domanda">🔊</button></div>` : "");

  const ESERCIZI = {
    scelta(e, c, esito) {
      const ordine = mescola(e.opzioni.map((t, i) => ({ t, i })));
      c.innerHTML = domanda(e.domanda, e) + `<div class="opzioni">${ordine.map((o) => `<button class="opzione" data-i="${o.i}">${Figura.ricco(o.t)}</button>`).join("")}</div>`;
      c.addEventListener("click", (ev) => {
        const b = ev.target.closest(".opzione");
        if (!b || c.closest(".risolto")) return;
        if (+b.dataset.i === e.corretta) { b.classList.add("giusta"); esito.ok(); } else esito.ko(b);
      });
    },

    vero_falso(e, c, esito) {
      c.innerHTML = domanda(e.affermazione, e) + `<div class="vf"><button class="opzione" data-v="true">${Figura.ricco("👍 Vero")}</button><button class="opzione" data-v="false">${Figura.ricco("👎 Falso")}</button></div>`;
      c.addEventListener("click", (ev) => {
        const b = ev.target.closest(".opzione");
        if (!b || c.closest(".risolto")) return;
        if ((b.dataset.v === "true") === e.corretta) { b.classList.add("giusta"); esito.ok(); } else esito.ko(b);
      });
    },

    // Tocca un elemento a sinistra, poi il suo compagno a destra.
    abbina(e, c, esito) {
      const sx = mescola(e.coppie.map((p, i) => ({ t: p[0], i })));
      const dx = mescola(e.coppie.map((p, i) => ({ t: p[1], i })));
      c.innerHTML = domanda(e.domanda || "Unisci le coppie: tocca un elemento a sinistra e poi il suo compagno.", e) +
        `<div class="abbina"><div class="colonna">${sx.map((o) => `<button class="tessera" data-lato="sx" data-i="${o.i}">${Figura.ricco(o.t)}</button>`).join("")}</div>
         <div class="colonna">${dx.map((o) => `<button class="tessera" data-lato="dx" data-i="${o.i}">${Figura.ricco(o.t)}</button>`).join("")}</div></div>`;
      let scelta = null, fatte = 0;
      c.addEventListener("click", (ev) => {
        const b = ev.target.closest(".tessera");
        if (!b || b.classList.contains("usata")) return;
        if (!scelta || scelta.dataset.lato === b.dataset.lato) {
          scelta?.classList.remove("scelta");
          scelta = b; b.classList.add("scelta"); return;
        }
        if (scelta.dataset.i === b.dataset.i) {
          [scelta, b].forEach((x) => { x.classList.remove("scelta"); x.classList.add("giusta"); esito.bene?.(x); setTimeout(() => x.classList.add("usata"), 400); });
          Suono.giusto();
          if (++fatte === e.coppie.length) esito.ok();
        } else { scelta.classList.remove("scelta"); esito.ko(b); }
        scelta = null;
      });
    },

    // Tocca una tessera, poi il cesto giusto (si può anche trascinare).
    categorie(e, c, esito) {
      c.innerHTML = domanda(e.domanda || "Metti ogni elemento nel cesto giusto.", e) +
        `<p class="gioco-aiuto">✋ Trascina ogni carta nel box giusto. Oppure tocca la carta e poi tocca il box.</p>
         <div class="mazzo trascina">${mescola(e.elementi).map((x) => `<button class="tessera" data-cat="${h(x.categoria)}">${Figura.ricco(x.testo)}</button>`).join("")}</div>
         <div class="categorie">${e.categorie.map((k) => `<div class="cesto" data-cat="${h(k)}"><h4>${Figura.ricco(k)}</h4><div class="dentro"></div></div>`).join("")}</div>`;
      let scelta = null, fatte = 0;
      const metti = (t, cesto) => {
        if (t.dataset.cat === cesto.dataset.cat) {
          t.classList.remove("scelta"); t.classList.add("giusta"); esito.bene?.(t);
          cesto.querySelector(".dentro").append(t);
          cesto.classList.remove("accoglie"); void cesto.offsetWidth; cesto.classList.add("accoglie");
          Suono.giusto();
          if (++fatte === e.elementi.length) esito.ok();
        } else { t.classList.remove("scelta"); esito.ko(t); }
        scelta = null;
      };
      c.addEventListener("click", (ev) => {
        const t = ev.target.closest(".mazzo .tessera");
        if (t) { scelta?.classList.remove("scelta"); scelta = t; t.classList.add("scelta"); return; }
        const cesto = ev.target.closest(".cesto");
        if (cesto && scelta) metti(scelta, cesto);
      });
      trascinabile(c, ".mazzo .tessera", ".cesto", metti);
    },

    // Tocca le tessere nell'ordine giusto.
    ordina(e, c, esito) {
      c.innerHTML = domanda(e.domanda || "Metti in ordine.", e) +
        `<div class="sequenza"><span class="vuoto">Tocca le tessere nell'ordine giusto…</span></div>
         <div class="mazzo">${mescola(e.elementi.map((t, i) => ({ t, i }))).map((o) => `<button class="tessera" data-i="${o.i}">${Figura.ricco(o.t)}</button>`).join("")}</div>`;
      const seq = c.querySelector(".sequenza");
      let prossimo = 0;
      c.addEventListener("click", (ev) => {
        const b = ev.target.closest(".mazzo .tessera");
        if (!b) return;
        if (+b.dataset.i === prossimo) {
          seq.querySelector(".vuoto")?.remove();
          b.classList.add("giusta"); esito.bene?.(b); seq.append(b); b.disabled = true;
          Suono.giusto();
          if (++prossimo === e.elementi.length) esito.ok();
        } else esito.ko(b);
      });
    },

    // Frase con [parole] da completare scegliendo dalle tessere, in ordine.
    completa(e, c, esito) {
      const risposte = [];
      const frase = h(e.testo).replace(/\[([^\]]+)\]/g, (_, r) => { risposte.push(r); return `<span class="buco" data-n="${risposte.length - 1}">&nbsp;</span>`; }).replace(/\n/g, "<br>");
      const tessere = mescola([...risposte, ...(e.distrattori || [])]);
      c.innerHTML = domanda(e.domanda || "Completa la frase con le parole giuste.", e) +
        `<p class="frase-completa">${frase}</p><div class="mazzo">${tessere.map((t) => `<button class="tessera">${h(t)}</button>`).join("")}</div>`;
      let n = 0;
      const buchi = c.querySelectorAll(".buco");
      buchi[0]?.classList.add("bersaglio");
      c.addEventListener("click", (ev) => {
        const b = ev.target.closest(".tessera");
        if (!b || b.classList.contains("usata") || n >= risposte.length) return;
        if (b.textContent.trim().toLowerCase() === risposte[n].trim().toLowerCase()) {
          buchi[n].textContent = risposte[n]; buchi[n].classList.add("giusta");
          b.classList.add("usata"); Suono.giusto();
          if (++n === risposte.length) esito.ok();
        } else esito.ko(b);
      });
    },

    conta(e, c, esito) {
      let opz = e.opzioni;
      if (!opz) {
        const s = new Set([e.numero]);
        while (s.size < 4) s.add(Math.max(0, e.numero + Math.floor(Math.random() * 7) - 3));
        opz = [...s];
      }
      c.innerHTML = domanda(e.domanda || "Quanti sono?", e) +
        `<div class="oggetti">${Array.from({ length: e.numero }, (_, i) => `<span style="animation-delay:${i * 60}ms">${Figura.img(e.oggetto, "figura conta")}</span>`).join("")}</div>
         <div class="opzioni">${mescola(opz).map((n) => `<button class="opzione" data-n="${n}">${n}</button>`).join("")}</div>`;
      c.addEventListener("click", (ev) => {
        const b = ev.target.closest(".opzione");
        if (!b || c.closest(".risolto")) return;
        if (+b.dataset.n === e.numero) { b.classList.add("giusta"); esito.ok(); } else esito.ko(b);
      });
    },

    retta(e, c, esito) {
      const passo = e.passo || 1;
      const valori = [];
      for (let v = e.min; v <= e.max + 1e-9; v += passo) valori.push(+v.toFixed(2));
      const virgola = (v) => String(v).replace(".", ",");
      const mostra = e.nascondi_numeri ? (v) => (v === e.min || v === e.max ? virgola(v) : "?") : virgola;
      c.innerHTML = domanda(e.domanda || `Tocca il numero ${virgola(e.corretta)} sulla linea.`, e) +
        `<div class="retta"><div class="linea"></div>${valori.map((v, i) =>
          `<button class="tacca" data-v="${v}" style="left:${(i / (valori.length - 1)) * 100}%"><span>${mostra(v)}</span></button>`).join("")}</div>`;
      c.addEventListener("click", (ev) => {
        const b = ev.target.closest(".tacca");
        if (!b || c.closest(".risolto")) return;
        if (+b.dataset.v === e.corretta) { b.querySelector("span").textContent = virgola(b.dataset.v); b.classList.add("giusta"); esito.ok(); }
        else esito.ko(b);
      });
    },
  };

  // Giochi (assets/giochi.js): memory, testo bucato, crucipuzzle, indovina, intruso, acchiappa, parola mescolata.
  const DOMANDA_GIOCO = { memory: "Gioca a memory: trova le coppie!", bucato: "Completa il testo bucato.", crucipuzzle: "Trova le parole nascoste.",
    indovina: "Indovina la parola!", intruso: "Trova l'intruso.", acchiappa: "Acchiappa le risposte giuste!", mescolata: "Rimetti in ordine la parola." };
  for (const g of window.Giochi?.TIPI || [])
    ESERCIZI[g] = (e, c, esito) => Giochi[g](e, c, esito, domanda(e.domanda || DOMANDA_GIOCO[g], e));
  ESERCIZI.costruisci = (e, c, esito) =>
    Animazioni.esercizioCostruisci(e, c, esito, domanda(e.domanda || `Costruisci il numero ${e.numero} con decine e unità.`, e));
  ESERCIZI.equivalenza = (e, c, esito) =>
    Animazioni.esercizioEquivalenza(e, c, esito, domanda(e.domanda || `Sposta il numero nella tabella: ${e.n} ${e.da} = ? ${e.a}`, e));
  ESERCIZI.leggi_tabella = (e, c, esito) =>
    Animazioni.esercizioLeggiTabella(e, c, esito, domanda(e.domanda || `Quante ${e.a} sono ${e.n} ${e.da}? Usa la tabella.`, e));
  ESERCIZI.colora_frazione = (e, c, esito) =>
    Animazioni.esercizioColoraFrazione(e, c, esito, domanda(e.domanda || `Colora ${e.n}/${e.d} della ${e.forma === "cioccolata" ? "tavoletta" : "pizza"}.`, e));
  ESERCIZI.leggi_frazione = (e, c, esito) =>
    Animazioni.esercizioLeggiFrazione(e, c, esito, domanda(e.domanda || (e.chiedi === "complementare" ? "Quale frazione è rimasta bianca?" : "Quale frazione è colorata di rosso?"), e));
  ESERCIZI.virgola = (e, c, esito) =>
    Animazioni.esercizioVirgola(e, c, esito, domanda(e.domanda || `Sposta le cifre nella tabella: ${String(e.n).replace(".", ",")} ${e.op === "x" ? "×" : ":"} ${e.per}`, e));
  ESERCIZI.gelosia = (e, c, esito) =>
    Animazioni.esercizioGelosia(e, c, esito, domanda(e.domanda || `Calcola con la griglia: ${e.a} × ${e.b}`, e));
  ESERCIZI.addizione = (e, c, esito) =>
    Animazioni.esercizioAddizione(e, c, esito, domanda(e.domanda || `Calcola in colonna: ${e.a} + ${e.b}`, e));
  ESERCIZI.colonna = (e, c, esito) =>
    Animazioni.esercizioColonna(e, c, esito, domanda(e.domanda || `Calcola in colonna: ${e.a} × ${e.b}`, e));

  /* ---------- Modalità LIM ----------
     Schermo intero, una schermata alla volta (titolo, spiegazioni, esercizi, finale),
     tasti grandi, frecce della tastiera e telecomandi da presentazione (PagSu/PagGiù). */
  function avviaLIM(radice) {
    if (document.body.classList.contains("lim")) return;
    document.body.classList.add("lim");
    document.documentElement.requestFullscreen?.().catch(() => {});
    const pagine = () => [radice.querySelector(".lezione-testa"), ...radice.querySelectorAll(".scheda, .esercizio, [data-fine]")]
      .filter((p) => p && !p.hidden);
    let i = 0;
    const barra = document.createElement("div");
    barra.className = "lim-barra";
    barra.innerHTML = `<button class="lim-freccia" data-lim="prec" aria-label="Indietro">◀</button>
      <span class="lim-conta"></span>
      <button class="lim-freccia" data-lim="succ" aria-label="Avanti">▶</button>
      <button class="lim-esci" data-lim="esci">✕ Esci</button>`;
    document.body.append(barra);
    const succ = barra.querySelector('[data-lim="succ"]');

    function mostra(n) {
      const pp = pagine();
      i = Math.max(0, Math.min(pp.length - 1, n));
      pp.forEach((p, k) => p.classList.toggle("corrente", k === i));
      barra.querySelector(".lim-conta").textContent = `${i + 1} / ${pp.length}`;
      barra.querySelector('[data-lim="prec"]').disabled = i === 0;
      succ.disabled = i === pp.length - 1;
      const cur = pp[i];
      succ.classList.toggle("pulsa", cur.classList.contains("risolto") || !cur.classList.contains("esercizio"));
      scrollTo(0, 0);
    }
    function esci() {
      document.body.classList.remove("lim");
      radice.querySelectorAll(".corrente").forEach((p) => p.classList.remove("corrente"));
      barra.remove();
      document.removeEventListener("keydown", tasti);
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    }
    function tasti(ev) {
      if (["ArrowRight", "PageDown"].includes(ev.key)) { ev.preventDefault(); mostra(i + 1); }
      if (["ArrowLeft", "PageUp"].includes(ev.key)) { ev.preventDefault(); mostra(i - 1); }
    }
    barra.addEventListener("click", (ev) => {
      const a = ev.target.closest("button")?.dataset.lim;
      if (a === "prec") mostra(i - 1);
      if (a === "succ") mostra(i + 1);
      if (a === "esci") esci();
    });
    document.addEventListener("keydown", tasti);
    radice.addEventListener("risolto", () => mostra(i));
    radice.addEventListener("finita", () => setTimeout(() => mostra(pagine().length - 1), 1200));
    mostra(0);
  }

  /* Trascinamento con dito, penna o mouse (funziona anche sulla LIM). */
  function trascinabile(radice, selTessera, selBersaglio, rilascia) {
    let fantasma = null, origine = null, sopra = null, dx = 0, dy = 0, mosso = false;
    radice.addEventListener("pointerdown", (ev) => {
      const t = ev.target.closest(selTessera);
      if (!t || t.disabled || t.closest(".cesto")) return;
      origine = t; mosso = false;
      const r = t.getBoundingClientRect(); dx = ev.clientX - r.left; dy = ev.clientY - r.top;
    });
    window.addEventListener("pointermove", (ev) => {
      if (!origine) return;
      if (!fantasma) {
        mosso = true;
        fantasma = origine.cloneNode(true);
        fantasma.classList.add("fantasma"); origine.classList.add("in-volo");
        Object.assign(fantasma.style, { position: "fixed", pointerEvents: "none", zIndex: 130, width: origine.offsetWidth + "px", margin: 0 });
        document.body.append(fantasma);
      }
      fantasma.style.left = ev.clientX - dx + "px"; fantasma.style.top = ev.clientY - dy + "px";
      const b = document.elementFromPoint(ev.clientX, ev.clientY)?.closest(selBersaglio);
      if (b !== sopra) { sopra?.classList.remove("bersaglio"); sopra = b && radice.contains(b) ? b : null; sopra?.classList.add("bersaglio"); }
    });
    const fine = (annulla) => {
      if (fantasma) { fantasma.remove(); fantasma = null; }
      if (!annulla && origine && mosso && sopra) rilascia(origine, sopra);
      if (origine && mosso) { origine.classList.remove("in-volo"); radice.addEventListener("click", (e) => { e.stopPropagation(); e.preventDefault(); }, { capture: true, once: true }); }
      sopra?.classList.remove("bersaglio");
      origine = sopra = null;
    };
    window.addEventListener("pointerup", () => fine(false));
    window.addEventListener("pointercancel", () => fine(true));
  }

  // Un esercizio da solo, fuori da una lezione (palestra delle equivalenze).
  const esercizio = (e, corpo, esito) => ESERCIZI[e.tipo](e, corpo, esito);

  window.Motore = { valida, disegnaLezione, TIPI, esercizio, BRAVO, RIPROVA };
})();
