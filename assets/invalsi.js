// Prove in stile INVALSI: domande numerate (D1, D2…), risposte con la crocetta sulla lettera,
// niente correzione durante la prova, tempo facoltativo, risultati e soluzioni solo alla consegna.
(() => {
  const h = escapeHTML;
  const PROVE = [
    { classe: 2, file: "invalsi/mat2-prova-1.json", nome: "Prova 1", emoji: "🎒" },
    { classe: 2, file: "invalsi/mat2-prova-2.json", nome: "Prova 2", emoji: "🏫" },
    { classe: 2, file: "invalsi/mat2-prova-3.json", nome: "Prova 3", emoji: "🖍️" },
    { classe: 5, file: "invalsi/mat5-prova-1.json", nome: "Prova 1", emoji: "🧭" },
    { classe: 5, file: "invalsi/mat5-prova-2.json", nome: "Prova 2", emoji: "🔭" },
    { classe: 5, file: "invalsi/mat5-prova-3.json", nome: "Prova 3", emoji: "🗺️" },
  ];
  const LETTERE = ["A", "B", "C"];
  const AMBITI = { "Numeri": "🔢", "Spazio e figure": "📐", "Relazioni e funzioni": "🔗", "Dati e previsioni": "📊", "Prova mista": "🎯" };
  const EMO = /\p{Extended_Pictographic}(?:️|⃣|[\u{1F3FB}-\u{1F3FF}]|‍\p{Extended_Pictographic}️?)*/gu;
  // Testo con le emoji trasformate nelle immagini del sito.
  const conFigure = (t, classe = "figura piccola") => Figura.frazioni(h(t).replace(EMO, (e) => Figura.img(e, classe)));
  const numero = (t) => Number(String(t ?? "").replace(/\s/g, "").replace(",", "."));

  function valida(p) {
    const e = [];
    if (!p || !Array.isArray(p.domande) || !p.domande.length) return ["Mancano le domande."];
    p.domande.forEach((d, i) => {
      const n = `D${i + 1}`;
      if (!d.testo) e.push(`${n}: manca il testo.`);
      if (d.tipo === "scelta" && !(Array.isArray(d.opzioni) && d.opzioni.length >= 2 && d.opzioni.length <= 3 && d.opzioni[d.corretta] !== undefined && d.opzioni.every((o) => typeof o === "string" || o?.testo))) e.push(`${n}: servono 2 o 3 opzioni e la risposta corretta.`);
      else if (d.tipo === "numero" && !Number.isFinite(numero(d.risposta))) e.push(`${n}: "risposta" deve essere un numero.`);
      else if (d.tipo === "vf" && !(Array.isArray(d.affermazioni) && d.affermazioni.length && d.affermazioni.every((a) => typeof a.vera === "boolean"))) e.push(`${n}: servono le affermazioni con "vera" true o false.`);
      else if (!["scelta", "numero", "vf"].includes(d.tipo)) e.push(`${n}: tipo "${d.tipo}" sconosciuto (scelta, numero, vf).`);
    });
    return e;
  }

  // ---------- Disegni delle domande ----------
  function pittogramma(p) {
    return `<div class="iv-stimolo iv-pitto"><div class="iv-stim-titolo">${conFigure(p.titolo || "")}</div>
      ${p.righe.map((r) => `<div class="iv-pitto-riga"><span class="iv-pitto-et">${conFigure(r.etichetta)}</span>
        <span class="iv-pitto-sim">${Array.from({ length: r.quanti }, () => Figura.img(p.simbolo || "🙂", "figura piccola")).join("")}</span></div>`).join("")}
      ${p.legenda ? `<div class="iv-legenda">${conFigure(p.legenda)}</div>` : ""}</div>`;
  }
  function grafico(g) {
    const max = g.massimo || Math.max(...g.barre.map((b) => b.valore)), passo = g.passo || 1;
    const tacche = []; for (let v = 0; v <= max; v += passo) tacche.push(v);
    return `<div class="iv-stimolo iv-grafico"><div class="iv-stim-titolo">${conFigure(g.titolo || "")}</div>
      <div class="iv-graf-area" style="--max:${max}">
        <div class="iv-graf-asse">${tacche.map((v) => `<span style="--v:${v}">${v}</span>`).join("")}</div>
        <div class="iv-graf-barre">${tacche.map((v) => `<i class="iv-graf-linea" style="--v:${v}"></i>`).join("")}
          ${g.barre.map((b) => `<div class="iv-graf-col"><div class="iv-graf-barra" style="--v:${b.valore}"></div></div>`).join("")}</div>
      </div>
      <div class="iv-graf-etichette">${g.barre.map((b) => `<span>${b.emoji ? Figura.img(b.emoji, "figura piccola") : ""}${h(b.etichetta)}</span>`).join("")}</div></div>`;
  }
  function tabella(t) {
    return `<div class="iv-stimolo"><table class="iv-tabella"><thead><tr>${t.intestazioni.map((x) => `<th>${conFigure(x)}</th>`).join("")}</tr></thead>
      <tbody>${t.righe.map((r) => `<tr>${r.map((x) => `<td>${conFigure(x, "figura piccola")}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  }
  function quadretti(q) {
    const s = 40, W = q.colonne * s, H = q.righe * s, piene = new Map(q.celle.map(([r, c, col]) => [r + "," + c, col]));
    let svg = "";
    for (let r = 0; r < q.righe; r++) for (let c = 0; c < q.colonne; c++)
      svg += `<rect x="${c * s}" y="${r * s}" width="${s}" height="${s}" class="${piene.has(r + "," + c) ? "iv-q-piena" : "iv-q"}"${piene.get(r + "," + c) ? ` style="fill:${piene.get(r + "," + c)}"` : ""}/>`;
    if (q.piccoli) return `<svg class="iv-quadretti piccoli" viewBox="-3 -3 ${W + 6} ${H + 6}">${svg}</svg>`;
    return `<div class="iv-stimolo"><svg class="iv-quadretti" viewBox="-3 -3 ${W + 6} ${H + 6}" style="--col:${q.colonne}">${svg}</svg></div>`;
  }
  function rettangolo(r) {
    const k = 300 / Math.max(r.base, r.altezza * 2), w = r.base * k, hh = r.altezza * k;
    return `<div class="iv-stimolo"><svg class="iv-rett" viewBox="-70 -20 ${w + 140} ${hh + 70}">
      <rect x="0" y="0" width="${w}" height="${hh}" rx="4" class="iv-rett-f"/>
      <text x="${w / 2}" y="${hh + 38}" class="iv-rett-t">${r.base} ${h(r.unita || "")}</text>
      <text x="${w + 12}" y="${hh / 2 + 9}" class="iv-rett-t" style="text-anchor:start">${r.altezza} ${h(r.unita || "")}</text></svg></div>`;
  }
  // La retta dei numeri: tacche ogni "passo", alcuni numeri scritti, un cartellino vuoto con la freccia (come D11).
  function retta(r) {
    const n = Math.round((r.a - r.da) / r.passo), W = 640, x0 = 40, dx = (W - 80) / n, X = (v) => x0 + ((v - r.da) / r.passo) * dx;
    const scritti = new Set(r.etichette || []);
    let svg = `<line x1="0" y1="110" x2="${W - 6}" y2="110" class="iv-r-linea"/><path d="M${W - 18} 100 L${W - 2} 110 L${W - 18} 120 Z" class="iv-r-punta"/>`
      + `<line x1="0" y1="110" x2="${x0 - 14}" y2="110" class="iv-r-tratt"/>`;
    for (let k = 0; k <= n; k++) {
      const v = r.da + k * r.passo, x = X(v);
      svg += `<line x1="${x}" y1="96" x2="${x}" y2="124" class="iv-r-tacca"/>`;
      if (scritti.has(v)) svg += `<text x="${x}" y="84" class="iv-r-num">${v}</text>`;
    }
    for (const v of [].concat(r.vuoto ?? [])) {
      const x = X(v);
      svg += `<rect x="${x - 30}" y="14" width="60" height="44" rx="6" class="iv-r-cart"/><text x="${x}" y="46" class="iv-r-num">?</text>`
        + `<line x1="${x}" y1="58" x2="${x}" y2="88" class="iv-r-freccia"/><path d="M${x - 7} 82 L${x} 94 L${x + 7} 82 Z" class="iv-r-punta"/>`;
    }
    return `<div class="iv-stimolo"><svg class="iv-retta" viewBox="0 0 ${W} 140">${svg}</svg></div>`;
  }
  // Monete e banconote da euro, disegnate (non ci sono emoji per gli euro).
  function moneta(v) {
    if (v >= 5) return `<span class="iv-banconota v${v}"><b>${v}</b><i>euro</i></span>`;
    return `<span class="iv-moneta v${v}"><b>${v}</b><i>€</i></span>`;
  }
  // Gruppi con il loro nome sotto: scatole, borsellini, bambini in fila (come D12, D23).
  function insiemi(g) {
    return `<div class="iv-stimolo"><div class="iv-insiemi">${g.map((x) => `<div class="iv-insieme${x.cornice === false ? " senza" : ""}">
      <div class="iv-ins-dentro">${x.figure ? (x.figure.match(EMO) || []).map((e) => Figura.img(e, x.piccole ? "figura piccola" : "figura media")).join("") : ""}
      ${x.monete ? x.monete.map(moneta).join("") : ""}</div>
      ${x.etichetta ? `<div class="iv-ins-nome">${conFigure(x.etichetta)}</div>` : ""}</div>`).join("")}</div></div>`;
  }
  // Una griglia con oggetti nelle caselle: destra, sinistra, sopra, sotto, percorsi.
  function griglia(g) {
    const ogg = new Map((g.oggetti || []).map(([r, c, e]) => [r + "," + c, e]));
    const strada = new Set((g.percorso || []).map(([r, c]) => r + "," + c));
    let celle = "";
    for (let r = 0; r < g.righe; r++) for (let c = 0; c < g.colonne; c++) {
      const k = r + "," + c;
      celle += `<span class="iv-cella${strada.has(k) ? " strada" : ""}">${ogg.has(k) ? Figura.img(ogg.get(k), "figura media") : ""}</span>`;
    }
    return `<div class="iv-stimolo"><div class="iv-griglia-ogg" style="--col:${g.colonne}">${celle}</div></div>`;
  }
  // Le figure separate da spazi formano gruppi che restano interi (8 figurine non vanno a capo a metà).
  const figure = (t) => {
    const gruppi = t.split(/\s+/), molte = Math.max(...gruppi.map((g) => (g.match(EMO) || []).length)) > 5;
    return `<div class="iv-stimolo iv-figure">${gruppi.map((g) => `<span class="iv-gruppo">${conFigure(g, molte ? "figura piccola" : "figura media")}</span>`).join("")}</div>`;
  };
  const stimolo = (d) => (d.figure ? figure(d.figure) : "")
    + (d.pittogramma ? pittogramma(d.pittogramma) : "") + (d.grafico ? grafico(d.grafico) : "")
    + (d.tabella ? tabella(d.tabella) : "") + (d.quadretti ? quadretti(d.quadretti) : "") + (d.rettangolo ? rettangolo(d.rettangolo) : "")
    + (d.retta ? retta(d.retta) : "") + (d.insiemi ? insiemi(d.insiemi) : "") + (d.griglia ? griglia(d.griglia) : "");

  // Un'opzione può essere un testo oppure un disegno con il suo nome: { "testo": "Figura A", "quadretti": {…} }.
  const opTesto = (o) => typeof o === "string" ? o : o.testo;
  const opHTML = (o) => typeof o === "string" ? conFigure(o, "figura piccola")
    : `${o.quadretti ? quadretti({ ...o.quadretti, piccoli: true }) : ""}${o.monete ? `<span class="iv-op-monete">${o.monete.map(moneta).join("")}</span>` : ""}<span>${conFigure(o.testo, "figura piccola")}</span>`;
  const pulisciVoce = (t) => String(t).replace(EMO, "").replace(/\s+/g, " ").trim();
  // Testo da leggere ad alta voce: domanda e risposte con la loro lettera.
  function daLeggere(d) {
    const pul = pulisciVoce;
    if (d.tipo === "scelta") return `${d.testo} ${d.opzioni.map((o, k) => `${LETTERE[k]}: ${pul(opTesto(o))}.`).join(" ")}`;
    if (d.tipo === "vf") return `${d.testo} ${d.affermazioni.map((a, k) => `Frase ${k + 1}: ${pul(a.testo)}`).join(" ")}`;
    return `${d.testo} Scrivi il numero nel riquadro.`;
  }

  function rispostaHTML(d, r, k) {
    if (d.tipo === "scelta") return `<div class="iv-opzioni${d.opzioni.some((o) => typeof o !== "string") ? " disegni" : ""}">${d.opzioni.map((o, j) => `
      <button class="iv-opzione${r === j ? " segnata" : ""}" data-scelta="${j}"><span class="iv-casella">${LETTERE[j]}</span><span class="iv-op-testo${typeof o === "string" ? "" : " con-disegno"}">${opHTML(o)}</span></button>`).join("")}</div>`;
    if (d.tipo === "vf") return `<table class="iv-vf"><thead><tr><th></th><th>Vero</th><th>Falso</th></tr></thead><tbody>
      ${d.affermazioni.map((a, j) => `<tr><td class="iv-vf-testo"><b>${String.fromCharCode(97 + j)})</b> ${conFigure(a.testo)}</td>
        ${[true, false].map((v) => `<td><button class="iv-casella grande${r?.[j] === v ? " segnata" : ""}" data-vf="${j}" data-v="${v}" aria-label="${v ? "Vero" : "Falso"}"></button></td>`).join("")}</tr>`).join("")}</tbody></table>`;
    return `<div class="iv-numero"><span>Risposta:</span><span class="iv-campo" data-campo>${h(r ?? "")}</span>${d.unita ? `<span class="iv-unita">${conFigure(d.unita)}</span>` : ""}</div>
      <div class="iv-tastiera">${["1", "2", "3", "4", "5", "6", "7", "8", "9", ",", "0", "⌫"].map((t) => `<button class="iv-tasto" data-tasto="${t}">${t}</button>`).join("")}</div>`;
  }

  const risposta = (d, r) => {
    if (r === undefined || r === null || r === "") return null;
    if (d.tipo === "scelta") return r === d.corretta;
    if (d.tipo === "vf") return d.affermazioni.every((a, j) => r[j] === a.vera);
    return numero(r) === numero(d.risposta);
  };
  const completa = (d, r) => d.tipo === "vf" ? !!r && d.affermazioni.every((_, j) => typeof r[j] === "boolean") : r !== undefined && r !== null && r !== "";
  const testoRisposta = (d, r) => {
    if (!completa(d, r)) return "nessuna risposta";
    if (d.tipo === "scelta") return `${LETTERE[r]}: ${opTesto(d.opzioni[r])}`;
    if (d.tipo === "vf") return d.affermazioni.map((_, j) => `${String.fromCharCode(97 + j)}) ${r[j] ? "Vero" : "Falso"}`).join(" · ");
    return `${r}${d.unita ? " " + d.unita : ""}`;
  };
  const testoGiusta = (d) => d.tipo === "scelta" ? `${LETTERE[d.corretta]}: ${opTesto(d.opzioni[d.corretta])}`
    : d.tipo === "vf" ? d.affermazioni.map((a, j) => `${String.fromCharCode(97 + j)}) ${a.vera ? "Vero" : "Falso"}`).join(" · ")
    : `${d.risposta}${d.unita ? " " + d.unita : ""}`;

  // ---------- La prova ----------
  // opz.allenamento: mini prova di allenamento (3-5 domande). Dopo ogni risposta si preme "Controlla":
  // se è sbagliata si riprova una volta, poi si vede la risposta giusta con la spiegazione.
  // opz.fine(giuste, totale) viene chiamata alla fine; opz.indietro è l'indirizzo del calendario.
  function avvia(p, radice, opz = {}) {
    const D = p.domande, risposte = D.map((d) => (d.tipo === "vf" ? [] : undefined));
    const allena = !!opz.allenamento, esitoA = D.map(() => null), tentativi = D.map(() => 0);
    let i = 0, conTempo = !allena || !!p.minuti, resto = (p.minuti || 30) * 60, timer = null, consegnata = false;
    document.title = allena ? `${p.titolo} · Allenamento INVALSI` : `${p.titolo} · classe ${p.classe}ª · Prova in stile INVALSI`;

    function copertina() {
      if (allena) {
        radice.innerHTML = `<div class="iv-copertina allena">
          <div class="iv-marchio">Allenamento INVALSI · n. ${h(p.numero)}</div>
          <div class="iv-cop-figure">${LOGO}${Figura.img(p.emoji || "📝", "figura gigante")}</div>
          <h1>${h(p.titolo)}</h1>
          <p class="iv-classe">${AMBITI[p.ambito] || "📘"} ${h(p.ambito || "")} · ${D.length} domande${p.minuti ? ` · ${p.minuti} minuti` : ""}</p>
          <ol class="iv-istruzioni">
            <li>${Figura.img("👀", "figura piccola")} Guarda bene il disegno e ascolta la domanda con 🔊.</li>
            <li>${Figura.img("✏️", "figura piccola")} Tocca la lettera della risposta: compare la crocetta.</li>
            <li>${Figura.img("✅", "figura piccola")} Poi tocca «Controlla». Se sbagli, puoi riprovare.</li>
          </ol>
          ${p.minuti ? `<label class="iv-tempo-scelta"><input type="checkbox" data-tempo checked> ⏱️ Con il tempo: ${p.minuti} minuti</label>` : ""}
          <div class="iv-azioni"><button class="btn giallo grande" data-inizia>▶ Cominciamo</button>
            <button class="btn bianco" data-lim>🖥️ Sulla LIM</button>
            ${opz.indietro ? `<a class="btn bianco" href="${h(opz.indietro)}">📅 Calendario</a>` : ""}</div></div>`;
        return;
      }
      radice.innerHTML = `<div class="iv-copertina">
        <div class="iv-marchio">Prova in stile INVALSI</div>
        ${Figura.img(p.emoji || "📝", "figura gigante")}
        <h1>${h(p.titolo)}</h1>
        <p class="iv-classe">Classe ${h(p.classe)}ª primaria · ${D.length} domande</p>
        <ol class="iv-istruzioni">
          <li>${Figura.img("📖", "figura piccola")} Leggi bene ogni domanda. Puoi ascoltarla con 🔊.</li>
          <li>${Figura.img("✏️", "figura piccola")} Per ogni domanda c'è una sola risposta giusta: tocca la lettera.</li>
          <li>${Figura.img("🔁", "figura piccola")} Hai sbagliato? Tocca un'altra lettera: la crocetta si sposta.</li>
          <li>${Figura.img("⏭️", "figura piccola")} Se una domanda è difficile, vai avanti e torna dopo.</li>
          <li>${Figura.img("🤫", "figura piccola")} Le risposte giuste le vedi solo alla fine, quando consegni.</li>
        </ol>
        <div class="iv-esempio"><b>Esempio</b><p>Quanto fa 2 + 1?</p>
          <div class="iv-opzioni"><div class="iv-opzione"><span class="iv-casella">A</span>2</div><div class="iv-opzione segnata"><span class="iv-casella">B</span>3</div><div class="iv-opzione"><span class="iv-casella">C</span>4</div></div>
          <p class="nota">La risposta giusta è la B: ha la crocetta.</p></div>
        <label class="iv-tempo-scelta"><input type="checkbox" data-tempo checked> ⏱️ Con il tempo: ${p.minuti || 30} minuti</label>
        <div class="iv-azioni"><button class="btn giallo grande" data-inizia>▶ Inizia la prova</button>
          <button class="btn bianco" data-lim>🖥️ Sulla LIM</button></div></div>`;
    }

    function domanda() {
      const d = D[i], r = risposte[i];
      const fatte = D.map((dd, k) => completa(dd, risposte[k]));
      radice.innerHTML = `<div class="iv-prova">
        <div class="iv-barra">
          <span class="iv-marchio piccolo">INVALSI · Classe ${h(p.classe)}ª</span>
          <span class="iv-avanz">Domanda ${i + 1} di ${D.length}</span>
          ${conTempo ? `<span class="iv-orologio" data-orologio>⏱️ ${orario()}</span>` : ""}
          <button class="btn bianco piccolo" data-lim>${document.body.classList.contains("lim") ? "✕ Esci dalla LIM" : "🖥️ Sulla LIM"}</button>
        </div>
        <div class="iv-foglio">
          <div class="iv-intesta"><span class="iv-d">D${i + 1}</span>
            ${d.ambito ? `<span class="iv-ambito">${AMBITI[d.ambito] || "📘"} ${h(d.ambito)}</span>` : ""}
            <button class="leggi" data-leggi aria-label="Ascolta la domanda">🔊</button></div>
          <div class="iv-testo">${d.immagine ? Figura.img(d.immagine, "figura media") : ""}<p>${Figura.frazioni(h(d.testo))}</p></div>
          <div class="iv-corpo${stimolo(d) ? " con-stimolo" : ""}"><div>${stimolo(d)}</div>
          <div class="iv-risposta${allena && esitoA[i] !== null ? " controllata" : ""}">${rispostaHTML(d, r, i)}${allena ? esitoHTML(i) : ""}</div></div>
        </div>
        <div class="iv-naviga">
          <button class="btn bianco" data-vai="${i - 1}" ${i === 0 ? "disabled" : ""}>◀ Indietro</button>
          ${allena && esitoA[i] === null ? `<button class="btn verde" data-controlla ${completa(d, r) ? "" : "disabled"}>✔ Controlla</button>` : ""}
          ${i < D.length - 1 ? `<button class="btn" data-vai="${i + 1}">Avanti ▶</button>` : `<button class="btn giallo" data-consegna>${allena ? "🏁 Fine" : "📤 Consegna"}</button>`}
        </div>
        <div class="iv-griglia" aria-label="Domande">${D.map((_, k) => `<button class="iv-num${fatte[k] ? " fatta" : ""}${allena && esitoA[k] !== null ? (esitoA[k] ? " giusta" : " sbagliata") : ""}${k === i ? " ora" : ""}" data-vai="${k}">D${k + 1}</button>`).join("")}
          <button class="iv-num consegna" data-consegna>${allena ? "🏁" : "📤"}</button></div>
      </div>`;
      if (allena) segnaEsito();
    }

    // Allenamento: verde sulla risposta giusta, rosso su quella sbagliata (o "ritenta" dopo il primo errore).
    function segnaEsito() {
      const d = D[i], r = risposte[i], fatto = esitoA[i] !== null, primo = !fatto && tentativi[i] > 0;
      if (!fatto && !primo) return;
      if (d.tipo === "scelta") radice.querySelectorAll("[data-scelta]").forEach((b) => {
        const j = +b.dataset.scelta;
        if (fatto && j === d.corretta) b.classList.add("giusta");
        else if (j === r) b.classList.add(fatto ? "sbagliata" : "ritenta");
      });
      if (d.tipo === "vf") radice.querySelectorAll("[data-vf]").forEach((b) => {
        const j = +b.dataset.vf, v = b.dataset.v === "true";
        if (fatto && d.affermazioni[j].vera === v) b.classList.add("giusta");
        else if (r?.[j] === v && d.affermazioni[j].vera !== v) b.classList.add(fatto ? "sbagliata" : "ritenta");
      });
      if (d.tipo === "numero") radice.querySelector("[data-campo]")?.classList.add(fatto ? (esitoA[i] ? "giusta" : "sbagliata") : "ritenta");
    }
    // Allenamento: il riquadro con l'esito sotto la domanda, con la maestra.
    function esitoHTML(k) {
      const d = D[k];
      if (esitoA[k] === null && tentativi[k] === 0) return "";
      if (esitoA[k] === null) return `<div class="iv-esito-box riprova">${LOGO}<div><b>Quasi! Guarda bene e riprova.</b></div></div>`;
      return `<div class="iv-esito-box ${esitoA[k] ? "giusta" : "sbagliata"}">${LOGO}<div>
        <b>${esitoA[k] ? "Giusto! Bravi!" : `La risposta giusta è: ${conFigure(testoGiusta(d))}`}</b>
        ${d.spiegazione ? `<p>💡 ${conFigure(d.spiegazione)}</p>` : ""}</div></div>`;
    }
    function controlla() {
      const d = D[i], ok = risposta(d, risposte[i]);
      tentativi[i]++;
      if (ok || tentativi[i] >= 2) {
        esitoA[i] = !!ok;
        ok ? Suono.giusto?.() : Suono.sbagliato?.();
        domanda();
        Voce.parla(ok ? `Giusto! Bravi! ${d.spiegazione || ""}` : `La risposta giusta è ${pulisciVoce(testoGiusta(d))}. ${d.spiegazione || ""}`, null, { scritte: false });
      } else {
        Suono.sbagliato?.();
        domanda();
        Voce.parla("Quasi! Guarda bene e riprova.", null, { scritte: false });
      }
    }

    const orario = () => `${Math.floor(Math.max(0, resto) / 60)}:${String(Math.max(0, resto) % 60).padStart(2, "0")}`;
    function tic() {
      resto--;
      const o = radice.querySelector("[data-orologio]");
      if (o) { o.textContent = `⏱️ ${orario()}`; o.classList.toggle("poco", resto <= 300); }
      if (resto === 300) Voce.parla("Mancano cinque minuti.", null, { scritte: false });
      if (resto <= 0) { clearInterval(timer); consegna(true); }
    }

    function chiediConsegna() {
      const vuote = D.filter((d, k) => !completa(d, risposte[k])).length;
      const box = document.createElement("div");
      box.className = "iv-conferma";
      box.innerHTML = `<div class="iv-conferma-box">${Figura.img("📤", "figura grande")}
        <h2>${allena ? "Hai finito?" : "Vuoi consegnare la prova?"}</h2>
        <p>${allena ? (D.filter((_, k) => esitoA[k] === null).length ? `Ci sono <b>${D.filter((_, k) => esitoA[k] === null).length}</b> domande non controllate.` : "Hai controllato tutte le domande.") : vuote ? `Hai lasciato <b>${vuote}</b> ${vuote === 1 ? "domanda" : "domande"} senza risposta.` : "Hai risposto a tutte le domande. Bravo!"}</p>
        <div class="iv-azioni"><button class="btn bianco" data-annulla>↩️ Torno alla prova</button><button class="btn giallo" data-conferma>${allena ? "🏁 Sì, ho finito" : "📤 Sì, consegno"}</button></div></div>`;
      document.body.append(box);
      box.addEventListener("click", (ev) => {
        if (ev.target.closest("[data-annulla]")) box.remove();
        if (ev.target.closest("[data-conferma]")) { box.remove(); consegna(false); }
      });
    }

    function consegna(scaduto) {
      if (consegnata) return;
      if (allena) return fineAllenamento(scaduto);
      consegnata = true; clearInterval(timer);
      const esiti = D.map((d, k) => risposta(d, risposte[k]));
      const giuste = esiti.filter((x) => x === true).length;
      const perAmbito = {};
      D.forEach((d, k) => { const a = d.ambito || "Altro"; (perAmbito[a] ||= { g: 0, n: 0 }); perAmbito[a].n++; if (esiti[k]) perAmbito[a].g++; });
      const quota = giuste / D.length, stelle = quota >= .8 ? 3 : quota >= .5 ? 2 : 1;
      radice.innerHTML = `<div class="iv-risultati">
        <div class="fine">
          ${scaduto ? `<p class="iv-scaduto">⏰ Il tempo è finito! La prova è stata consegnata.</p>` : ""}
          <div class="stelle">${"⭐".repeat(stelle)}${"☆".repeat(3 - stelle)}</div>
          <h2>Hai risposto bene a ${giuste} domande su ${D.length}</h2>
          <p>${stelle === 3 ? "Bravissimo! Sei pronto per la prova vera." : stelle === 2 ? "Buon lavoro! Guarda le risposte qui sotto per imparare dagli errori." : "Non ti preoccupare: guarda le spiegazioni e riprova."}</p>
          <div class="iv-ambiti">${Object.entries(perAmbito).map(([a, x]) => `<div class="iv-amb"><span>${AMBITI[a] || "📘"} ${h(a)}</span>
            <span class="iv-amb-barra"><i style="width:${(x.g / x.n) * 100}%"></i></span><b>${x.g} / ${x.n}</b></div>`).join("")}</div>
          <div class="iv-azioni"><button class="btn" data-rifai>🔁 Rifai la prova</button><a class="btn bianco" href="invalsi.html">📝 Altre prove</a></div>
        </div>
        <h2 style="text-align:center">Le risposte, una per una</h2>
        ${D.map((d, k) => `<div class="iv-correzione ${esiti[k] ? "giusta" : "sbagliata"}">
          <div class="iv-intesta"><span class="iv-d">D${k + 1}</span><span class="iv-esito">${esiti[k] ? "✅ Giusta" : esiti[k] === false ? "❌ Sbagliata" : "⬜ Senza risposta"}</span></div>
          <p class="iv-cor-testo">${d.immagine ? Figura.img(d.immagine, "figura piccola") : ""}${Figura.frazioni(h(d.testo))}</p>
          ${esiti[k] ? "" : `<p>La tua risposta: <b>${conFigure(testoRisposta(d, risposte[k]))}</b></p>`}
          <p>Risposta giusta: <b>${conFigure(testoGiusta(d))}</b></p>
          ${d.spiegazione ? `<p class="iv-spiega">💡 ${Figura.frazioni(h(d.spiegazione))}</p>` : ""}</div>`).join("")}
      </div>`;
      radice.dispatchEvent(new CustomEvent("consegnata", { detail: { giuste, totale: D.length } }));
      if (stelle >= 2) { Suono.festa(); coriandoli(); }
      scrollTo(0, 0);
    }

    function fineAllenamento(scaduto) {
      consegnata = true; clearInterval(timer);
      const giuste = esitoA.filter((x) => x === true).length;
      const quota = giuste / D.length, stelle = quota >= .8 ? 3 : quota >= .5 ? 2 : 1;
      radice.innerHTML = `<div class="iv-risultati"><div class="fine">
          ${scaduto ? `<p class="iv-scaduto">⏰ Il tempo è finito!</p>` : ""}
          <div class="iv-cop-figure">${LOGO}</div>
          <div class="stelle">${"⭐".repeat(stelle)}${"☆".repeat(3 - stelle)}</div>
          <h2>Giuste: ${giuste} su ${D.length}</h2>
          <p>${stelle === 3 ? "Bravissimi! Allenamento finito." : stelle === 2 ? "Bravi! Ogni volta andrà meglio." : "Bene così: allenarsi serve proprio a imparare."}</p>
          <div class="iv-pallini">${D.map((_, k) => `<span class="${esitoA[k] ? "si" : esitoA[k] === false ? "no" : "vuoto"}">D${k + 1}</span>`).join("")}</div>
          <div class="iv-azioni"><button class="btn bianco" data-rifai>🔁 Rifai</button>
            ${opz.indietro ? `<a class="btn giallo grande" href="${h(opz.indietro)}">📅 Torna al calendario</a>` : ""}</div>
        </div></div>`;
      opz.fine?.(giuste, D.length);
      Voce.parla(stelle === 3 ? "Bravissimi! Allenamento finito." : stelle === 2 ? "Bravi! Ogni volta andrà meglio." : "Bene così: allenarsi serve proprio a imparare.", null, { scritte: false });
      if (stelle >= 2) { Suono.festa(); coriandoli(); }
      scrollTo(0, 0);
    }

    function vai(k) { i = Math.max(0, Math.min(D.length - 1, k)); domanda(); scrollTo(0, 0); }

    radice.addEventListener("click", (ev) => {
      const b = ev.target.closest("button");
      if (!b) return;
      const d = D[i];
      if (b.hasAttribute("data-inizia")) {
        const t = radice.querySelector("[data-tempo]"); if (t) conTempo = t.checked;
        if (conTempo) timer = setInterval(tic, 1000);
        vai(0);
      }
      if (b.hasAttribute("data-lim")) lim(!document.body.classList.contains("lim"));
      if (b.dataset.vai !== undefined) vai(+b.dataset.vai);
      if (b.hasAttribute("data-consegna")) chiediConsegna();
      if (b.hasAttribute("data-rifai")) location.reload();
      if (b.hasAttribute("data-leggi")) Voce.parla(daLeggere(d), null, { scritte: false });
      if (b.hasAttribute("data-controlla")) return controlla();
      if (allena && esitoA[i] !== null && (b.dataset.scelta !== undefined || b.dataset.vf !== undefined || b.dataset.tasto)) return;
      if (b.dataset.scelta !== undefined) {
        risposte[i] = +b.dataset.scelta; Suono.clic?.();
        radice.querySelectorAll("[data-scelta]").forEach((x) => x.classList.toggle("segnata", x === b));
        radice.querySelector(`.iv-num[data-vai="${i}"]`)?.classList.add("fatta");
      }
      if (b.dataset.vf !== undefined) {
        const j = +b.dataset.vf; risposte[i][j] = b.dataset.v === "true"; Suono.clic?.();
        radice.querySelectorAll(`[data-vf="${j}"]`).forEach((x) => x.classList.toggle("segnata", x === b));
        radice.querySelector(`.iv-num[data-vai="${i}"]`)?.classList.toggle("fatta", completa(d, risposte[i]));
      }
      if (b.dataset.tasto) {
        let t = String(risposte[i] ?? "");
        if (b.dataset.tasto === "⌫") t = t.slice(0, -1);
        else if (b.dataset.tasto === ",") { if (t && !t.includes(",")) t += ","; }
        else if (t.length < 7) t += b.dataset.tasto;
        risposte[i] = t || undefined; Suono.clic?.();
        radice.querySelector("[data-campo]").textContent = t;
        radice.querySelector(`.iv-num[data-vai="${i}"]`)?.classList.toggle("fatta", !!t);
      }
    });
    radice.addEventListener("click", (ev) => {
      const c = radice.querySelector("[data-controlla]");
      if (c) c.disabled = !completa(D[i], risposte[i]);
      // Una nuova risposta dopo il "Quasi!" toglie il rosso.
      if (allena && tentativi[i] && esitoA[i] === null && ev.target.closest("[data-scelta], [data-vf], [data-tasto]")) {
        radice.querySelector(".iv-esito-box.riprova")?.remove();
        radice.querySelectorAll(".ritenta").forEach((x) => x.classList.remove("ritenta"));
      }
    });
    // Anche la tastiera del computer scrive nel riquadro delle risposte numeriche.
    document.addEventListener("keydown", (ev) => {
      if (consegnata || !radice.querySelector("[data-campo]")) return;
      const t = /^[0-9]$/.test(ev.key) ? ev.key : ev.key === "," || ev.key === "." ? "," : ev.key === "Backspace" ? "⌫" : null;
      if (t) { ev.preventDefault(); radice.querySelector(`[data-tasto="${t}"]`)?.click(); }
    });

    function lim(on) {
      document.body.classList.toggle("lim", on);
      if (on) document.documentElement.requestFullscreen?.().catch(() => {});
      else if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
      const b = radice.querySelector("[data-lim]"); if (b) b.textContent = on ? "✕ Esci dalla LIM" : "🖥️ Sulla LIM";
    }
    copertina();
  }

  function elenco(radice) {
    const perClasse = [2, 5].map((c) => ({ c, prove: PROVE.filter((p) => p.classe === c) }));
    radice.innerHTML = `<div class="intest-sezione" data-numero="📝">
        <span class="etichetta">🔢 Matematica</span>
        <h1>Prove in stile INVALSI</h1>
        <p>Allenamento per le prove nazionali di classe 2ª e 5ª: domande numerate, risposte con la crocetta, il tempo e le soluzioni solo alla fine.</p>
      </div>
      <a class="iv-cal-oggi" href="allenamento.html">${Figura.img("📅", "figura media")}<span><small>Classe 2ª · da novembre a maggio</small><b>Allenamento: 3 mini prove a settimana</b></span><span class="btn giallo grande">📅 Apri il calendario</span></a>
      <div class="iv-elenco">${perClasse.map(({ c, prove }) => `<div class="iv-classe-box"><h2>Classe ${c}ª</h2>
        ${prove.map((p) => `<a class="argomento pronta" href="invalsi.html?file=${encodeURIComponent(p.file)}">${Figura.img(p.emoji, "figura media")}<h3>Matematica · ${h(p.nome)}</h3><span class="stato">▶ Inizia</span></a>`).join("")}</div>`).join("")}</div>
      <p class="nota" style="text-align:center;margin-top:24px">Le prove INVALSI della scuola primaria si fanno in classe 2ª e in classe 5ª.</p>`;
  }

  // ---------- Allenamento: il calendario delle mini prove (3 a settimana) ----------
  const CHIAVE_FATTE = (f) => "classe-irene-allenamento:" + f;
  function fatte(f) { try { return JSON.parse(localStorage.getItem(CHIAVE_FATTE(f)) || "{}"); } catch { return {}; } }
  function segnaFatta(f, n, giuste, totale) {
    const x = fatte(f); x[n] = { giuste, totale, quando: new Date().toISOString().slice(0, 10) };
    try { localStorage.setItem(CHIAVE_FATTE(f), JSON.stringify(x)); } catch {}
  }
  const pronta = (s) => Array.isArray(s.domande) && s.domande.length > 0;
  function sessione(dati, n) {
    const s = dati.sessioni.find((x) => x.n === n);
    return s && pronta(s) ? { ...s, numero: s.n, classe: dati.classe } : null;
  }
  // base: l'indirizzo delle mini prove, a cui si aggiunge "n=…" (la pagina allenamento.html oppure invalsi.html?file=…&).
  function calendario(dati, radice, file, base = `invalsi.html?file=${encodeURIComponent(file)}&`) {
    const fatto = fatte(file), href = (n) => `${base}n=${n}`;
    const prossima = dati.sessioni.find((s) => pronta(s) && !fatto[s.n]);
    const giorno = (s) => {
      const f = fatto[s.n], ok = pronta(s);
      const dentro = `<span class="iv-cal-giorno">${h(s.giorno)}</span>${Figura.img(s.emoji || AMBITI[s.ambito] || "📝", "figura media")}
        <span class="iv-cal-n">n. ${s.n}</span><b class="iv-cal-titolo">${h(s.titolo)}</b>
        <span class="iv-cal-amb">${AMBITI[s.ambito] || "📘"} ${h(s.ambito)}</span>
        ${f ? `<span class="iv-cal-fatta">✅ ${f.giuste}/${f.totale}</span>` : ok ? `<span class="iv-cal-via">▶ ${s.domande.length} domande</span>` : `<span class="iv-cal-presto">🔜 in preparazione</span>`}`;
      return ok ? `<a class="iv-cal-sess a-${AMB_CLASSE[s.ambito] || "x"}${f ? " fatta" : ""}${s === prossima ? " prossima" : ""}" href="${href(s.n)}">${dentro}</a>`
        : `<div class="iv-cal-sess presto a-${AMB_CLASSE[s.ambito] || "x"}">${dentro}</div>`;
    };
    const settimane = [];
    for (const s of dati.sessioni) {
      let w = settimane.find((x) => x.settimana === s.settimana && x.fase === s.fase);
      if (!w) settimane.push(w = { settimana: s.settimana, fase: s.fase, sess: [] });
      w.sess.push(s);
    }
    radice.innerHTML = `<div class="intest-sezione" data-numero="${h(dati.classe)}ª">
        <span class="etichetta">🔢 Matematica · classe ${h(dati.classe)}ª</span>
        <h1>${h(dati.titolo)}</h1>
        <p>${h(dati.descrizione || "")}</p>
      </div>
      <div class="iv-cal-ritmo">${(dati.ritmo || []).map((r) => `<div>${Figura.img(r.emoji, "figura piccola")}<b>${h(r.giorno)}</b><span>${h(r.cosa)}</span></div>`).join("")}</div>
      ${prossima ? `<a class="iv-cal-oggi" href="${href(prossima.n)}">${LOGO}<span><small>Il prossimo allenamento</small><b>n. ${prossima.n} · ${h(prossima.titolo)}</b></span><span class="btn giallo grande">▶ Via</span></a>` : ""}
      ${dati.fasi.map((fa) => `<section class="iv-cal-fase"><h2>${Figura.img(fa.emoji, "figura piccola")} Fase ${fa.n} · ${h(fa.nome)} <small>${h(fa.periodo)}</small></h2>
        <p class="iv-cal-fase-desc">${h(fa.descrizione)}</p>
        ${settimane.filter((w) => w.fase === fa.n).map((w) => `<div class="iv-cal-sett"><div class="iv-cal-data">${h(w.settimana)}</div>
          <div class="iv-cal-tre">${w.sess.map(giorno).join("")}</div></div>`).join("")}</section>`).join("")}
      <p class="nota" style="text-align:center;margin:24px 0">Se un giorno salta, si riprende dal prossimo allenamento: il pulsante «Il prossimo allenamento» lo ricorda da solo su questo computer.
        <button class="btn bianco piccolo" data-azzera>↺ Ricomincia da capo</button></p>`;
    radice.querySelector("[data-azzera]")?.addEventListener("click", () => {
      if (confirm("Tolgo tutti i ✅ degli allenamenti fatti su questo computer?")) { try { localStorage.removeItem(CHIAVE_FATTE(file)); } catch {} calendario(dati, radice, file, base); }
    });
  }
  const AMB_CLASSE = { "Numeri": "num", "Spazio e figure": "spa", "Relazioni e funzioni": "rel", "Dati e previsioni": "dat", "Prova mista": "mis" };
  // Tutte le frasi che la voce può leggere in una prova (per registrarle prima con la voce "Sara").
  function frasi(p) {
    const tutte = ["Quasi! Guarda bene e riprova.", "Bravissimi! Allenamento finito.", "Bravi! Ogni volta andrà meglio.", "Bene così: allenarsi serve proprio a imparare.", "Mancano cinque minuti."];
    const prove = p.sessioni ? p.sessioni.filter(pronta) : [p];
    for (const q of prove) for (const d of q.domande) {
      tutte.push(daLeggere(d));
      if (p.sessioni) tutte.push(`Giusto! Bravi! ${d.spiegazione || ""}`, `La risposta giusta è ${pulisciVoce(testoGiusta(d))}. ${d.spiegazione || ""}`);
    }
    return tutte;
  }

  window.Invalsi = { PROVE, valida, avvia, elenco, risposta, calendario, sessione, segnaFatta, frasi };
})();
