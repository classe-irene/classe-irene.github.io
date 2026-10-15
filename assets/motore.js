// Motore delle lezioni: trasforma una lezione in formato JSON in una pagina interattiva.
// Tipi di esercizio: scelta, vero_falso, abbina, categorie, ordina, completa, conta, retta.

(function () {
  const TIPI = ["scelta", "vero_falso", "abbina", "categorie", "ordina", "completa", "conta", "retta"];
  const BRAVO = ["Bravissimo! 🎉", "Esatto! ⭐", "Perfetto! 🌟", "Super! 🚀", "Giusto! 👏"];
  const RIPROVA = ["Quasi! Riprova 💪", "Ops, ritenta! 🙂", "Non ancora, prova di nuovo!"];
  const caso = (a) => a[Math.floor(Math.random() * a.length)];
  const h = escapeHTML;

  /* ---------- Controllo del formato (usato anche da "5 minuti") ---------- */
  function valida(l) {
    const errori = [];
    if (!l || typeof l !== "object") return ["Il testo non contiene una lezione."];
    if (!l.titolo) errori.push("Manca il titolo.");
    if (!Array.isArray(l.sezioni) || !l.sezioni.length) errori.push("Mancano le sezioni della spiegazione.");
    if (!Array.isArray(l.esercizi) || !l.esercizi.length) errori.push("Mancano gli esercizi.");
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
      if (e.tipo === "retta" && !(Number.isFinite(e.min) && Number.isFinite(e.max) && Number.isFinite(e.corretta))) errori.push(`${n}: servono min, max e corretta.`);
    });
    return errori;
  }

  /* ---------- Spiegazione ---------- */
  function disegnaLezione(l, radice) {
    const materia = MATERIE[l.materia] || MATERIE.matematica;
    document.body.classList.toggle("scienze", l.materia === "scienze");
    document.title = `${l.titolo} · ${SITO.nome}`;
    const testoIntero = [l.titolo, l.introduzione, ...l.sezioni.map((s) => `${s.titolo}. ${s.testo}`)].join(". ");

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
        <button class="btn" data-azione="lim">🖥️ Modalità LIM</button>
        <button class="btn bianco" data-azione="suoni">🔔 Suoni: sì</button>
        <button class="btn bianco" data-azione="maiuscolo">🔠 STAMPATO MAIUSCOLO</button>
      </div>
      ${l.sezioni.map((s) => `
        <section class="scheda">
          <div class="scheda-corpo">
            <h2>${h(s.titolo)}<button class="leggi" data-leggi="${h(s.titolo + ". " + s.testo)}">🔊 Leggi</button></h2>
            ${String(s.testo).split(/\n+/).map((p) => `<p>${h(p)}</p>`).join("")}
            ${s.immagini?.length ? `<div class="galleria">${s.immagini.map((x) => `<figure>${Figura.ricco(x, "figura media")}</figure>`).join("")}</div>` : ""}
            ${s.curiosita ? `<div class="curiosita">${h(s.curiosita)}</div>` : ""}
          </div>
          <div class="scheda-figura">${Figura.img(s.immagine || s.emoji || "📘", "figura grande")}</div>
        </section>`).join("")}
      ${l.parole_chiave?.length ? `<section class="scheda"><div class="scheda-corpo"><h2>Parole da ricordare</h2><div class="parole">${l.parole_chiave.map((p) => `<span class="parola">${Figura.ricco(p)}</span>`).join("")}</div></div><div class="scheda-figura">${Figura.img("🗝️", "figura grande")}</div></section>` : ""}
      <h2 id="esercizi" style="text-align:center;margin-top:36px">🎯 Ora tocca a te!</h2>
      <div class="punteggio">⭐ <span data-punti>0</span> / ${l.esercizi.length}</div>
      <div data-esercizi></div>
      <div class="fine" data-fine hidden></div>`;

    radice.addEventListener("click", (ev) => {
      const b = ev.target.closest("button");
      if (!b) return;
      if (b.dataset.leggi) leggi(b.dataset.leggi);
      const a = b.dataset.azione;
      if (a === "leggi-tutto") leggi(testoIntero);
      if (a === "vai-esercizi") document.getElementById("esercizi").scrollIntoView({ behavior: "smooth" });
      if (a === "lim") avviaLIM(radice);
      if (a === "maiuscolo") document.body.classList.toggle("maiuscolo");
      if (a === "suoni") { Suono.attivo = !Suono.attivo; b.textContent = `🔔 Suoni: ${Suono.attivo ? "sì" : "no"}`; }
    });

    disegnaEsercizi(l, radice);
  }

  /* ---------- Esercizi ---------- */
  function disegnaEsercizi(l, radice) {
    const box = radice.querySelector("[data-esercizi]");
    const fine = radice.querySelector("[data-fine]");
    const punti = radice.querySelector("[data-punti]");
    let risolti = 0, errori = 0;

    const stato = {
      errore() { errori++; Suono.sbagliato(); },
      risolto(el, spiegazione) {
        if (el.classList.contains("risolto")) return;
        el.classList.add("risolto");
        risolti++; punti.textContent = risolti;
        Suono.giusto();
        const sp = el.querySelector(".spiegazione");
        sp.textContent = caso(BRAVO) + (spiegazione ? " " + spiegazione : "");
        sp.classList.add("visibile");
        radice.dispatchEvent(new CustomEvent("risolto"));
        if (risolti === l.esercizi.length) finale();
      },
    };

    function finale() {
      const stelle = errori <= l.esercizi.length * 0.2 ? 3 : errori <= l.esercizi.length * 0.6 ? 2 : 1;
      fine.hidden = false;
      fine.innerHTML = `<div class="stelle">${"⭐".repeat(stelle)}${"☆".repeat(3 - stelle)}</div>
        <h2>Hai completato la lezione!</h2>
        <p>${stelle === 3 ? "Sei un vero campione!" : stelle === 2 ? "Ottimo lavoro, continua così!" : "Ce l'hai fatta! Con un po' di allenamento andrà ancora meglio."}</p>
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
      ESERCIZI[e.tipo](e, corpo, { ok: () => stato.risolto(el, e.spiegazione), ko: sbaglia });
    });
  }

  // Domanda con figura facoltativa e pulsante per ascoltarla (utile a chi legge con fatica).
  const domanda = (t, e = {}) => (t ? `<div class="domanda-riga">${e.immagine ? Figura.img(e.immagine, "figura media") : ""}
    <div class="domanda">${h(t)}</div><button class="leggi" data-leggi="${h(t)}" aria-label="Ascolta la domanda">🔊</button></div>` : "");

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
          [scelta, b].forEach((x) => { x.classList.remove("scelta"); x.classList.add("giusta"); setTimeout(() => x.classList.add("usata"), 400); });
          Suono.giusto();
          if (++fatte === e.coppie.length) esito.ok();
        } else { scelta.classList.remove("scelta"); esito.ko(b); }
        scelta = null;
      });
    },

    // Tocca una tessera, poi il cesto giusto (si può anche trascinare).
    categorie(e, c, esito) {
      c.innerHTML = domanda(e.domanda || "Metti ogni elemento nel cesto giusto.", e) +
        `<div class="mazzo">${mescola(e.elementi).map((x) => `<button class="tessera" data-cat="${h(x.categoria)}">${Figura.ricco(x.testo)}</button>`).join("")}</div>
         <div class="categorie">${e.categorie.map((k) => `<div class="cesto" data-cat="${h(k)}"><h4>${Figura.ricco(k)}</h4><div class="dentro"></div></div>`).join("")}</div>`;
      let scelta = null, fatte = 0;
      const metti = (t, cesto) => {
        if (t.dataset.cat === cesto.dataset.cat) {
          t.classList.remove("scelta"); t.classList.add("giusta");
          cesto.querySelector(".dentro").append(t);
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
          b.classList.add("giusta"); seq.append(b); b.disabled = true;
          Suono.giusto();
          if (++prossimo === e.elementi.length) esito.ok();
        } else esito.ko(b);
      });
    },

    // Frase con [parole] da completare scegliendo dalle tessere, in ordine.
    completa(e, c, esito) {
      const risposte = [];
      const frase = h(e.testo).replace(/\[([^\]]+)\]/g, (_, r) => { risposte.push(r); return `<span class="buco" data-n="${risposte.length - 1}">&nbsp;</span>`; });
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
      const mostra = e.nascondi_numeri ? (v) => (v === e.min || v === e.max ? v : "?") : (v) => v;
      c.innerHTML = domanda(e.domanda || `Tocca il numero ${e.corretta} sulla linea.`, e) +
        `<div class="retta"><div class="linea"></div>${valori.map((v, i) =>
          `<button class="tacca" data-v="${v}" style="left:${(i / (valori.length - 1)) * 100}%"><span>${mostra(v)}</span></button>`).join("")}</div>`;
      c.addEventListener("click", (ev) => {
        const b = ev.target.closest(".tacca");
        if (!b || c.closest(".risolto")) return;
        if (+b.dataset.v === e.corretta) { b.querySelector("span").textContent = b.dataset.v; b.classList.add("giusta"); esito.ok(); }
        else esito.ko(b);
      });
    },
  };

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
        Object.assign(fantasma.style, { position: "fixed", pointerEvents: "none", zIndex: 50, width: origine.offsetWidth + "px", opacity: .9 });
        document.body.append(fantasma);
      }
      fantasma.style.left = ev.clientX - dx + "px"; fantasma.style.top = ev.clientY - dy + "px";
      const b = document.elementFromPoint(ev.clientX, ev.clientY)?.closest(selBersaglio);
      if (b !== sopra) { sopra?.classList.remove("bersaglio"); sopra = b && radice.contains(b) ? b : null; sopra?.classList.add("bersaglio"); }
    });
    window.addEventListener("pointerup", () => {
      if (fantasma) { fantasma.remove(); fantasma = null; }
      if (origine && mosso && sopra) rilascia(origine, sopra);
      sopra?.classList.remove("bersaglio");
      origine = sopra = null;
    });
  }

  window.Motore = { valida, disegnaLezione, TIPI };
})();
