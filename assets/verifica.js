// Verifiche da stampare: trasforma una verifica in formato JSON in un foglio A4 adatto ai bambini.
// Due versioni: "standard" e "facilitata" (per BES/DSA). Soluzioni visibili solo nella copia dell'insegnante.

(function () {
  const TIPI = ["scelta", "vero_falso", "completa", "collega", "ordina", "calcolo", "conta", "risposta", "disegna", "classifica", "etichette"];
  const h = escapeHTML;
  const ric = (t) => Figura.ricco(t, "figura piccola");

  /* ---------- Archivio delle verifiche (in questo browser) ---------- */
  const Archivio = {
    chiave: "classe-irene-verifiche",
    tutte() { try { return JSON.parse(localStorage.getItem(this.chiave)) || []; } catch { return []; } },
    salva(v) {
      const elenco = this.tutte().filter((x) => x.id !== v.id);
      elenco.unshift(v);
      try { localStorage.setItem(this.chiave, JSON.stringify(elenco)); return true; } catch { return false; }
    },
    prendi(id) { return this.tutte().find((x) => x.id === id); },
    elimina(id) { try { localStorage.setItem(this.chiave, JSON.stringify(this.tutte().filter((x) => x.id !== id))); } catch {} },
  };

  /* ---------- Controllo ---------- */
  function validaDomanda(d, n) {
    const e = [];
    const lista = (x, min) => Array.isArray(x) && x.length >= min;
    if (!TIPI.includes(d.tipo)) return [`${n}: tipo "${d.tipo}" sconosciuto.`];
    if (d.tipo !== "calcolo" && d.tipo !== "vero_falso" && !d.testo) e.push(`${n}: manca "testo".`);
    if (d.tipo === "scelta" && !(lista(d.opzioni, 2) && Number.isInteger(d.corretta) && d.opzioni[d.corretta] !== undefined)) e.push(`${n}: servono "opzioni" e "corretta".`);
    if (d.tipo === "vero_falso" && !(lista(d.affermazioni, 1) && d.affermazioni.every((a) => a.testo && typeof a.vero === "boolean"))) e.push(`${n}: servono "affermazioni" con "testo" e "vero".`);
    if (d.tipo === "completa" && !(typeof d.frase === "string" && d.frase.includes("___") && lista(d.soluzioni, 1))) e.push(`${n}: servono "frase" con ___ e "soluzioni".`);
    if (d.tipo === "collega" && !(lista(d.coppie, 2) && d.coppie.every((c) => Array.isArray(c) && c.length === 2))) e.push(`${n}: servono "coppie".`);
    if (d.tipo === "ordina" && !lista(d.elementi, 2)) e.push(`${n}: servono "elementi" in ordine giusto.`);
    if (d.tipo === "calcolo" && !(lista(d.operazioni, 1) && d.operazioni.every((o) => o.testo && o.risultato !== undefined))) e.push(`${n}: servono "operazioni" con "testo" e "risultato".`);
    if (d.tipo === "conta" && !(d.figura && Number.isInteger(d.numero) && d.numero > 0 && d.numero <= 30)) e.push(`${n}: servono "figura" e "numero" (fino a 30).`);
    if (d.tipo === "etichette" && !(/^assets\/disegni\/[\w-]+\.svg$/.test(d.disegno || "") && lista(d.parti, 2))) e.push(`${n}: servono "disegno" (assets/disegni/…svg) e "parti" in ordine.`);
    if (d.tipo === "classifica" && !(lista(d.categorie, 2) && lista(d.elementi, 2) && d.elementi.every((x) => d.categorie.includes(x.categoria)))) e.push(`${n}: servono "categorie" ed "elementi" con la categoria giusta.`);
    return e;
  }
  function valida(v) {
    if (!v || typeof v !== "object") return ["Non è una verifica."];
    const e = [];
    if (!v.titolo) e.push("Manca il titolo.");
    if (!Array.isArray(v.domande) || !v.domande.length) e.push("Mancano le domande.");
    (v.domande || []).forEach((d, i) => e.push(...validaDomanda(d, `Domanda ${i + 1}`)));
    (v.domande_facilitate || []).forEach((d, i) => e.push(...validaDomanda(d, `Domanda facilitata ${i + 1}`)));
    return e;
  }

  /* ---------- Mescolare sempre allo stesso modo (stampa e soluzioni coincidono) ---------- */
  function generatore(testo) {
    let s = 0;
    for (const c of String(testo)) s = (s * 31 + c.codePointAt(0)) >>> 0;
    return () => ((s = (s * 1103515245 + 12345) >>> 0) / 4294967296);
  }
  function mescolaFisso(arr, seme) {
    const r = generatore(seme), a = [...arr];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    if (a.length > 1 && a.every((x, i) => x === arr[i])) a.push(a.shift()); // mai già in ordine
    return a;
  }

  /* ---------- Disegno delle domande ---------- */
  const sol = (t) => `<span class="sol">${h(t)}</span>`;
  const casella = (dentro = "") => `<span class="casella">${dentro}</span>`;

  const DISEGNA = {
    scelta: (d) => `<p class="consegna-p">Colora il cerchio della risposta giusta.</p>
      <div class="v-opzioni">${d.opzioni.map((o, i) => `<div class="v-opzione"><span class="cerchio${i === d.corretta ? " giusto" : ""}"></span>${ric(o)}</div>`).join("")}</div>`,
    vero_falso: (d) => `<p class="consegna-p">Fai una crocetta: V se è vero, F se è falso.</p>
      <table class="v-vf">${d.affermazioni.map((a) => `<tr><td>${ric(a.testo)}</td><td>${casella(a.vero ? sol("X") : "")} V</td><td>${casella(a.vero ? "" : sol("X"))} F</td></tr>`).join("")}</table>`,
    completa: (d, ver) => {
      let k = 0;
      const frase = h(d.frase).replace(/_{3,}/g, () => `<span class="buco">${sol(d.soluzioni[k++] ?? "")}</span>`);
      const banca = d.parole?.length ? d.parole : (ver === "facilitata" ? mescolaFisso(d.soluzioni, d.frase) : null);
      return `${banca ? `<div class="v-banca">Usa queste parole: ${banca.map((p) => `<b>${h(p)}</b>`).join(" · ")}</div>` : ""}<p class="v-frase">${frase}</p>`;
    },
    collega: (d) => {
      const dx = mescolaFisso(d.coppie.map((c, i) => ({ t: c[1], i })), d.testo + "dx");
      return `<p class="consegna-p">Unisci con una linea.</p><div class="v-collega">
        <div>${d.coppie.map((c, i) => `<div class="v-voce">${ric(c[0])}<span class="punto">●</span>${sol("→ " + String.fromCharCode(65 + dx.findIndex((x) => x.i === i)))}</div>`).join("")}</div>
        <div>${dx.map((x, j) => `<div class="v-voce"><span class="punto">●</span><span class="lettera">${String.fromCharCode(65 + j)}</span>${ric(x.t)}</div>`).join("")}</div></div>`;
    },
    ordina: (d) => {
      const m = mescolaFisso(d.elementi.map((t, i) => ({ t, i })), d.testo);
      return `<p class="consegna-p">Scrivi nel quadrato il numero giusto: 1, 2, 3…</p>
        <div class="v-ordina">${m.map((x) => `<div class="v-voce">${casella(sol(x.i + 1))}${ric(x.t)}</div>`).join("")}</div>`;
    },
    calcolo: (d) => `<div class="v-calcoli${d.in_colonna ? " colonna" : ""}">${d.operazioni.map((o) => d.in_colonna
        ? `<div class="v-colonna"><div class="v-op">${h(o.testo)} =</div><div class="quadretti"></div><div class="v-ris">${sol(o.risultato)}</div></div>`
        : `<div class="v-calcolo"><span>${h(o.testo)} =</span>${casella(sol(o.risultato))}</div>`).join("")}</div>`,
    conta: (d) => `<div class="v-conta"><span class="gruppo-figure">${Array.from({ length: d.numero }, () => Figura.img(d.figura, "figura mini")).join("")}</span>
      <span class="v-calcolo">Sono: ${casella(sol(d.numero))}</span></div>`,
    risposta: (d) => `${'<div class="riga"></div>'.repeat(Math.min(8, Math.max(1, d.righe || 3)))}${d.soluzione ? `<p class="sol blocco">${h(d.soluzione)}</p>` : ""}`,
    disegna: () => `<div class="v-disegno"></div>`,
    // Disegno con i numeri: si scrive il nome di ogni parte (parti in ordine: 1, 2, 3…).
    etichette: (d) => `${d.parole?.length ? `<div class="v-banca">Usa queste parole: ${d.parole.map((p) => `<b>${h(p)}</b>`).join(" · ")}</div>` : ""}
      <div class="v-etichette"><img src="${h(d.disegno)}" alt=""><ol>${d.parti.map((p) => `<li><span class="buco">${sol(p)}</span></li>`).join("")}</ol></div>`,
    classifica: (d) => `<div class="v-banca">${d.elementi.map((x) => `<span class="v-tessera">${ric(x.testo)}</span>`).join("")}</div>
      <table class="v-tabella"><tr>${d.categorie.map((c) => `<th>${ric(c)}</th>`).join("")}</tr>
      <tr>${d.categorie.map((c) => `<td>${d.elementi.filter((x) => x.categoria === c).map((x) => sol(Figura.dividi(x.testo).testo)).join("<br>")}</td>`).join("")}</tr></table>`,
  };

  function domandaHTML(d, n, ver) {
    const titolo = d.testo ? h(d.testo) : ({ calcolo: "Esegui i calcoli.", vero_falso: "Vero o falso?" }[d.tipo] || "");
    return `<section class="v-domanda">
      <div class="v-testa"><span class="v-num">${n}</span>${d.immagine ? Figura.img(d.immagine, "figura v-img") : ""}<h3>${titolo}</h3></div>
      <div class="v-corpo">${DISEGNA[d.tipo](d, ver)}</div>
    </section>`;
  }

  const LIVELLI = ["Avanzato", "Intermedio", "Base", "In via di prima acquisizione"];
  function disegna(v, { versione = "standard" } = {}) {
    const facile = versione === "facilitata" && v.domande_facilitate?.length;
    const domande = facile ? v.domande_facilitate : v.domande;
    const materia = MATERIE[v.materia]?.nome || "";
    return `<article class="foglio">
      <header class="v-intestazione">
        <div class="v-campi"><span>Nome ______________________</span><span>Data ____________</span><span>Classe ${v.classe ? h(v.classe) + "ª" : "____"}</span></div>
        <h1>${v.emoji ? Figura.img(v.emoji, "figura v-img-titolo") : ""}${h(v.titolo)}</h1>
        <p class="v-sotto">${h(materia)}${facile ? ' · <span class="v-facile">versione facilitata</span>' : ""}</p>
        ${v.obiettivi?.length ? `<p class="v-obiettivi"><b>Obiettivi:</b> ${v.obiettivi.map(h).join("; ")}</p>` : ""}
        ${v.consegna ? `<p class="v-consegna">${h(v.consegna)}</p>` : ""}
      </header>
      ${domande.map((d, i) => domandaHTML(d, i + 1, versione)).join("")}
      <footer class="v-fine">
        <div class="v-auto"><b>Come è andata?</b> Colora una faccina: <span class="faccine">${["😀", "🙂", "😐"].map((e) => Figura.img(e, "figura mini")).join("")}</span></div>
        <div class="v-livello"><b>Livello raggiunto:</b> ${LIVELLI.map((l) => `<span>${casella()} ${l}</span>`).join("")}</div>
      </footer>
    </article>`;
  }

  window.Verifica = { valida, disegna, Archivio, TIPI };
})();
