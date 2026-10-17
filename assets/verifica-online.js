// Verifica online: i bambini rispondono sullo schermo (anche sulla LIM) e il sito corregge.
// Usa le stesse domande della verifica da stampare. "risposta" e "disegna" le corregge l'insegnante.

(function () {
  const h = escapeHTML;
  const ric = (t) => Figura.ricco(t, "figura piccola");
  const norm = (t) => String(t ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w\s,.]/g, " ").replace(/\s+/g, " ").trim();
  // "2 000", "2.000" e "2000" sono lo stesso numero; la virgola è quella dei decimali.
  const numero = (t) => { let s = String(t ?? "").replace(/\s/g, ""); if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, ""); return s === "" ? NaN : Number(s.replace(",", ".")); };
  // Una parola scritta è giusta se è uguale alla soluzione, o alla sua prima parola ("membrana" per "membrana cellulare").
  const parolaGiusta = (scritta, giusta) => {
    const a = norm(scritta), b = norm(giusta);
    if (!a) return false;
    if (a === b) return true;
    // Numeri: "2000" e "2 000" valgono uguale; mai solo un pezzo del numero.
    if (/^[\d\s.,]+$/.test(b)) return numero(a) === numero(b);
    const prima = b.split(" ")[0];
    return prima.length >= 4 && a === prima;
  };
  const valoreGiusto = (scritto, giusto) => {
    if (norm(scritto) === norm(giusto)) return true;
    const a = numero(scritto), b = numero(giusto);
    return String(scritto).trim() !== "" && !Number.isNaN(a) && !Number.isNaN(b) && a === b;
  };
  // Stesso mescolamento della stampa: l'ordine non dipende dal caso.
  function mescolaFisso(arr, seme) {
    let s = 0;
    for (const c of String(seme)) s = (s * 31 + c.codePointAt(0)) >>> 0;
    const r = () => ((s = (s * 1103515245 + 12345) >>> 0) / 4294967296), a = [...arr];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    if (a.length > 1 && a.every((x, i) => x === arr[i])) a.push(a.shift());
    return a;
  }
  const campo = (k, classe = "") => `<input class="vo-campo ${classe}" data-k="${k}" autocomplete="off" autocapitalize="off" spellcheck="false">`;
  const tendina = (k, voci) => `<select class="vo-campo" data-k="${k}"><option value="">…</option>${voci.map((v) => `<option value="${h(v.valore)}">${h(v.testo)}</option>`).join("")}</select>`;

  const DISEGNA = {
    scelta: (d, i) => `<div class="v-opzioni vo-scelte">${mescolaFisso(d.opzioni.map((o, j) => ({ o, j })), d.testo + "op").map(({ o, j }) => `<button type="button" class="vo-scelta" data-k="q${i}" data-v="${j}"><span class="cerchio"></span>${ric(o)}</button>`).join("")}</div>`,
    vero_falso: (d, i) => `<table class="v-vf">${d.affermazioni.map((a, j) => `<tr data-riga="q${i}-${j}"><td>${ric(a.testo)}</td>
      <td><button type="button" class="vo-vf" data-k="q${i}-${j}" data-v="1">V</button></td><td><button type="button" class="vo-vf" data-k="q${i}-${j}" data-v="0">F</button></td></tr>`).join("")}</table>`,
    completa: (d, i) => {
      let k = 0;
      const banca = d.parole?.length ? d.parole : mescolaFisso(d.soluzioni, d.frase);
      return `<div class="v-banca">Usa queste parole: ${banca.map((p) => `<b>${h(p)}</b>`).join(" · ")}</div>
        <p class="v-frase">${h(d.frase).replace(/_{3,}/g, () => campo(`q${i}-${k++}`, "corto"))}</p>`;
    },
    collega: (d, i) => {
      const dx = mescolaFisso(d.coppie.map((c, j) => ({ t: c[1], j })), d.testo + "dx");
      return `<p class="consegna-p">Scegli la lettera giusta per ognuno.</p><div class="v-collega">
        <div>${d.coppie.map((c, j) => `<div class="v-voce">${ric(c[0])}${tendina(`q${i}-${j}`, dx.map((x, n) => ({ valore: x.j, testo: String.fromCharCode(65 + n) })))}</div>`).join("")}</div>
        <div>${dx.map((x, n) => `<div class="v-voce"><span class="lettera">${String.fromCharCode(65 + n)}</span>${ric(x.t)}</div>`).join("")}</div></div>`;
    },
    ordina: (d, i) => {
      const m = mescolaFisso(d.elementi.map((t, j) => ({ t, j })), d.testo);
      return `<p class="consegna-p">Scrivi il numero giusto: 1, 2, 3…</p><div class="v-ordina">${m.map((x) => `<div class="v-voce">${campo(`q${i}-${x.j}`, "numero")}${ric(x.t)}</div>`).join("")}</div>`;
    },
    calcolo: (d, i) => `<div class="v-calcoli">${d.operazioni.map((o, j) => `<div class="v-calcolo"><span>${h(o.testo)} =</span>${campo(`q${i}-${j}`, "numero")}</div>`).join("")}</div>`,
    conta: (d, i) => `<div class="v-conta"><span class="gruppo-figure">${Array.from({ length: d.numero }, () => Figura.img(d.figura, "figura mini")).join("")}</span>
      <span class="v-calcolo">Sono: ${campo(`q${i}`, "numero")}</span></div>`,
    risposta: (d, i) => `<textarea class="vo-campo vo-testo" data-k="q${i}" rows="${Math.min(6, Math.max(2, d.righe || 3))}"></textarea><p class="vo-nota">✍️ Questa risposta la corregge la maestra.</p>`,
    disegna: () => `<p class="vo-nota">🎨 Il disegno si fa sul quaderno o sul foglio stampato.</p>`,
    classifica: (d, i) => `<p class="consegna-p">Per ognuno scegli la colonna giusta.</p><div class="vo-classifica">${d.elementi.map((x, j) => `<div class="v-voce">${ric(x.testo)}${tendina(`q${i}-${j}`, d.categorie.map((c) => ({ valore: c, testo: Figura.dividi(c).testo })))}</div>`).join("")}</div>`,
    etichette: (d, i) => `${d.parole?.length ? `<div class="v-banca">Usa queste parole: ${d.parole.map((p) => `<b>${h(p)}</b>`).join(" · ")}</div>` : ""}
      <div class="v-etichette"><img src="${h(d.disegno)}" alt=""><ol>${d.parti.map((_, j) => `<li>${campo(`q${i}-${j}`)}</li>`).join("")}</ol></div>`,
  };

  // Ogni domanda dà una lista di controlli: [chiave, è giusto?, soluzione da mostrare].
  const CONTROLLI = {
    scelta: (d, i, val) => [[`q${i}`, val(`q${i}`) === String(d.corretta), Figura.dividi(d.opzioni[d.corretta]).testo]],
    vero_falso: (d, i, val) => d.affermazioni.map((a, j) => [`q${i}-${j}`, val(`q${i}-${j}`) === (a.vero ? "1" : "0"), a.vero ? "Vero" : "Falso"]),
    completa: (d, i, val) => d.soluzioni.map((s, j) => [`q${i}-${j}`, parolaGiusta(val(`q${i}-${j}`), s), s]),
    collega: (d, i, val) => d.coppie.map((c, j) => [`q${i}-${j}`, val(`q${i}-${j}`) === String(j), Figura.dividi(c[1]).testo]),
    ordina: (d, i, val) => d.elementi.map((_, j) => [`q${i}-${j}`, numero(val(`q${i}-${j}`)) === j + 1, String(j + 1)]),
    calcolo: (d, i, val) => d.operazioni.map((o, j) => [`q${i}-${j}`, valoreGiusto(val(`q${i}-${j}`), o.risultato), String(o.risultato)]),
    conta: (d, i, val) => [[`q${i}`, numero(val(`q${i}`)) === d.numero, String(d.numero)]],
    classifica: (d, i, val) => d.elementi.map((x, j) => [`q${i}-${j}`, val(`q${i}-${j}`) === x.categoria, Figura.dividi(x.categoria).testo]),
    etichette: (d, i, val) => d.parti.map((p, j) => [`q${i}-${j}`, parolaGiusta(val(`q${i}-${j}`), p), p]),
  };

  function disegna(v, { versione = "standard" } = {}) {
    const facile = versione === "facilitata" && v.domande_facilitate?.length;
    const domande = facile ? v.domande_facilitate : v.domande;
    return `<article class="foglio online">
      <header class="v-intestazione">
        <h1>${v.emoji ? Figura.img(v.emoji, "figura v-img-titolo") : ""}${h(v.titolo)}</h1>
        <p class="v-sotto">💻 Verifica online${facile ? ' · <span class="v-facile">versione facilitata</span>' : ""}</p>
        <p class="v-consegna">${h(v.consegna || "Leggi con calma.")} Quando hai finito, tocca «Correggi».</p>
      </header>
      ${domande.map((d, i) => `<section class="v-domanda" data-q="${i}">
        <div class="v-testa"><span class="v-num">${i + 1}</span>${d.immagine ? Figura.img(d.immagine, "figura v-img") : ""}<h3>${d.testo ? h(d.testo) : ({ calcolo: "Esegui i calcoli.", vero_falso: "Vero o falso?" }[d.tipo] || "")}</h3></div>
        <div class="v-corpo">${DISEGNA[d.tipo](d, i)}</div><p class="vo-esito" hidden></p>
      </section>`).join("")}
      <div class="vo-fondo"><button type="button" class="btn verde grande" data-vo="correggi">✅ Correggi</button></div>
      <div class="vo-risultato" hidden></div>
    </article>`;
  }

  // Scelte e Vero/Falso: un tocco seleziona, un altro tocco sullo stesso cambia idea.
  function attiva(radice) {
    radice.addEventListener("click", (ev) => {
      const b = ev.target.closest(".vo-scelta, .vo-vf");
      if (!b || radice.querySelector(".foglio.corretta")) return;
      radice.querySelectorAll(`[data-k="${b.dataset.k}"]`).forEach((x) => x.classList.toggle("scelto", x === b && !x.classList.contains("scelto")));
    });
  }

  const LIVELLI = [[0.9, "Avanzato"], [0.75, "Intermedio"], [0.6, "Base"], [0, "In via di prima acquisizione"]];
  function correggi(radice, v, { versione = "standard" } = {}) {
    const facile = versione === "facilitata" && v.domande_facilitate?.length;
    const domande = facile ? v.domande_facilitate : v.domande;
    const val = (k) => {
      const scelto = radice.querySelector(`.scelto[data-k="${k}"]`);
      if (scelto) return scelto.dataset.v;
      return radice.querySelector(`.vo-campo[data-k="${k}"]`)?.value ?? "";
    };
    let giusti = 0, totale = 0, aMano = 0;
    domande.forEach((d, i) => {
      const sez = radice.querySelector(`[data-q="${i}"]`), esito = sez.querySelector(".vo-esito");
      if (!CONTROLLI[d.tipo]) { if (d.tipo === "risposta") aMano++; return; }
      const c = CONTROLLI[d.tipo](d, i, val);
      let ok = 0;
      c.forEach(([k, giusto, soluzione]) => {
        totale++; if (giusto) { giusti++; ok++; }
        radice.querySelectorAll(`[data-k="${k}"]`).forEach((el) => {
          if (el.matches(".vo-scelta, .vo-vf")) {
            if (el.classList.contains("scelto")) el.classList.add(giusto ? "giusto" : "sbagliato");
            else if (!giusto && (d.tipo === "scelta" ? el.dataset.v === String(d.corretta) : el.dataset.v === (soluzione === "Vero" ? "1" : "0"))) el.classList.add("era-giusto");
          } else {
            el.classList.add(giusto ? "giusto" : "sbagliato");
            el.disabled = true;
            if (!giusto) el.insertAdjacentHTML("afterend", `<span class="vo-sol">${h(soluzione)}</span>`);
          }
        });
      });
      sez.classList.add(ok === c.length ? "tutta-giusta" : "da-rivedere");
      esito.hidden = false;
      esito.textContent = ok === c.length ? "⭐ Tutto giusto!" : `${ok} su ${c.length} giuste. In verde la risposta giusta.`;
    });
    const q = totale ? giusti / totale : 0, stelle = q >= 0.9 ? 3 : q >= 0.6 ? 2 : 1;
    const livello = LIVELLI.find(([s]) => q >= s)[1];
    const box = radice.querySelector(".vo-risultato");
    box.hidden = false;
    box.innerHTML = `<div class="stelle">${"⭐".repeat(stelle)}${"☆".repeat(3 - stelle)}</div>
      <h2>Hai ${giusti} risposte giuste su ${totale}</h2>
      <p>Livello: <b>${livello}</b>${aMano ? ` · ${aMano === 1 ? "una risposta scritta la corregge" : aMano + " risposte scritte le corregge"} la maestra` : ""}</p>
      <button type="button" class="btn bianco" data-vo="ancora">🔁 Rifai la verifica</button>`;
    radice.querySelector(".foglio").classList.add("corretta");
    radice.querySelector(".vo-fondo").hidden = true;
    box.scrollIntoView({ behavior: "smooth", block: "center" });
    return { giusti, totale, livello };
  }

  window.VerificaOnline = { disegna, attiva, correggi, parolaGiusta };
})();
