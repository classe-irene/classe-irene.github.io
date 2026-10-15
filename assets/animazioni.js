// Animazioni passo passo per le lezioni, sincronizzate con una frase (e la voce) per ogni passo.
//   { "tipo": "moltiplicazione", "a": 23, "b": 14 }   moltiplicazione in colonna, con riporti
//   { "tipo": "scomposizione",   "a": 23, "b": 14 }   il rettangolo diviso in quattro parti
// Contiene anche l'esercizio interattivo "colonna": il bambino scrive le cifre con un tastierino.

(function () {
  const cifre = (n) => String(n).split("").map(Number);

  /* ---------- Calcolo dei passi della moltiplicazione in colonna ----------
     Colonne: 0 = unità, 1 = decine, ...  Righe: "rm" riporti della moltiplicazione,
     "a", "b", "p0", "p1"... risultati parziali, "rs" riporti della somma, "r" risultato. */
  function passiMoltiplicazione(a, b) {
    const A = cifre(a).reverse(), B = cifre(b).reverse();
    const passi = [];
    const unaRiga = B.length === 1;
    passi.push({ testo: "Scriviamo i numeri in colonna: unità sotto le unità, decine sotto le decine.", azioni: [], evid: [] });
    B.forEach((m, j) => {
      const riga = unaRiga ? "r" : "p" + j;
      const nome = ["unità", "decine", "centinaia"][j];
      const inizio = { testo: "", azioni: [{ tipo: "pulisci", riga: "rm" }], evid: [`b-${j}`] };
      if (j === 0) inizio.testo = `Cominciamo dalle unità: moltiplichiamo ogni cifra di ${a} per ${m}.`;
      else {
        inizio.testo = `Ora tocca alle ${nome}: moltiplichiamo per ${m}. Prima scriviamo ${j === 1 ? "uno 0" : "due 0"} a destra: è il segnaposto.`;
        for (let z = 0; z < j; z++) inizio.azioni.push({ tipo: "zero", riga, col: z, val: 0 });
      }
      passi.push(inizio);
      let riporto = 0;
      A.forEach((d, i) => {
        const prodotto = d * m, totale = prodotto + riporto;
        const cifra = totale % 10, nuovo = Math.floor(totale / 10);
        let testo = `${m} × ${d} = ${prodotto}`;
        if (riporto) testo += `, più ${riporto} di riporto fa ${totale}`;
        testo += i === A.length - 1 ? `. Scrivo ${totale}.` : `. Scrivo ${cifra}${nuovo ? ` e riporto ${nuovo}` : ""}.`;
        const azioni = [];
        if (i === A.length - 1) {
          azioni.push({ tipo: "cifra", riga, col: i + j, val: cifra });
          if (nuovo) azioni.push({ tipo: "cifra", riga, col: i + j + 1, val: nuovo });
        } else {
          azioni.push({ tipo: "cifra", riga, col: i + j, val: cifra });
          if (nuovo) azioni.push({ tipo: "riporto", riga: "rm", col: i + 1, val: nuovo });
        }
        passi.push({ testo, azioni, evid: [`b-${j}`, `a-${i}`, `${riga}-${i + j}`] });
        riporto = nuovo;
      });
    });
    if (!unaRiga) {
      const parziali = B.map((m, j) => a * m * 10 ** j);
      const larghezza = String(a * b).length;
      passi.push({ testo: "Ora sommiamo i risultati in colonna, partendo dalle unità.", azioni: [{ tipo: "pulisci", riga: "rm" }], evid: [] });
      let riporto = 0;
      for (let c = 0; c < larghezza; c++) {
        const addendi = parziali.map((p) => Math.floor(p / 10 ** c) % 10).filter((x, k) => parziali[k] >= 10 ** c || x);
        const somma = addendi.reduce((s, x) => s + x, 0) + riporto;
        const cifra = somma % 10, nuovo = Math.floor(somma / 10);
        const ultima = c === larghezza - 1;
        let testo;
        if (!addendi.length) testo = `Scrivo il riporto ${riporto}.`;
        else if (addendi.length === 1 && !riporto) testo = `Qui c'è solo il ${addendi[0]}: lo scrivo giù.`;
        else {
          testo = addendi.join(" + ") + (riporto ? ` + ${riporto} di riporto` : "") + ` = ${somma}.`;
          testo += ultima ? ` Scrivo ${somma}.` : ` Scrivo ${cifra}${nuovo ? ` e riporto ${nuovo}` : ""}.`;
        }
        const azioni = [{ tipo: "cifra", riga: "r", col: c, val: ultima ? somma : cifra }];
        if (!ultima && nuovo) azioni.push({ tipo: "riporto", riga: "rs", col: c + 1, val: nuovo });
        passi.push({ testo, azioni, evid: B.map((_, j) => `p${j}-${c}`).concat(`r-${c}`) });
        riporto = nuovo;
      }
    }
    passi.push({ testo: `${a} × ${b} = ${a * b}. Bravissimi! 🎉`, azioni: [], evid: ["r-*"], finale: true });
    return passi;
  }

  /* ---------- Griglia della moltiplicazione in colonna ---------- */
  function griglia(a, b) {
    const W = String(a * b).length + 1;
    const nB = String(b).length;
    const righe = ["rm", "a", "b", "linea"];
    if (nB > 1) { for (let j = 0; j < nB; j++) righe.push("p" + j); righe.push("rs-dopo", "linea2"); }
    righe.push("r");
    const el = document.createElement("div");
    el.className = "colonna-griglia";
    el.style.gridTemplateColumns = `repeat(${W}, 1fr)`;
    const celle = {};
    for (const r of righe) {
      if (r.startsWith("linea")) { const l = document.createElement("div"); l.className = "colonna-linea"; l.style.gridColumn = `1 / span ${W}`; el.append(l); continue; }
      const nomeRiga = r === "rs-dopo" ? "rs" : r;
      for (let g = 0; g < W; g++) {
        const col = W - 1 - g;
        const c = document.createElement("div");
        c.className = "cella" + (nomeRiga === "rm" || nomeRiga === "rs" ? " riporto" : "");
        celle[`${nomeRiga}-${col}`] = c;
        el.append(c);
      }
    }
    // "rs" (riporti della somma) va sopra i parziali: la spostiamo prima di p0.
    if (nB > 1) {
      const primaP = celle[`p0-${W - 1}`];
      for (let g = 0; g < W; g++) el.insertBefore(celle[`rs-${W - 1 - g}`], primaP);
    }
    cifre(a).reverse().forEach((d, i) => { celle[`a-${i}`].textContent = d; });
    cifre(b).reverse().forEach((d, i) => { celle[`b-${i}`].textContent = d; });
    celle[`b-${W - 1}`].textContent = "×";
    celle[`b-${W - 1}`].classList.add("segno");
    return { el, celle, W };
  }

  function applica(g, passo, scrivi = true, anima = true) {
    for (const az of passo.azioni) {
      if (az.tipo === "pulisci") { Object.entries(g.celle).forEach(([k, c]) => { if (k.startsWith(az.riga + "-")) c.textContent = ""; }); continue; }
      const c = g.celle[`${az.riga}-${az.col}`];
      if (!c || !scrivi) continue;
      c.textContent = az.val;
      if (anima) { c.classList.remove("nuova"); void c.offsetWidth; c.classList.add("nuova"); }
      if (az.tipo === "zero") c.classList.add("segnaposto");
    }
  }
  function evidenzia(g, passo) {
    Object.values(g.celle).forEach((c) => c.classList.remove("evid"));
    for (const k of passo.evid || []) {
      if (k.endsWith("-*")) Object.entries(g.celle).forEach(([kk, c]) => { if (kk.startsWith(k.slice(0, -1)) && c.textContent) c.classList.add("evid"); });
      else g.celle[k]?.classList.add("evid");
    }
  }

  /* ---------- Scomposizione: il rettangolo diviso in quattro ---------- */
  function passiScomposizione(a, b) {
    const da = Math.floor(a / 10) * 10, ua = a % 10, db = Math.floor(b / 10) * 10, ub = b % 10;
    const parti = [[da, db], [ua, db], [da, ub], [ua, ub]].filter(([x, y]) => x && y);
    const passi = [
      { testo: `${a} × ${b} è come un rettangolo: largo ${a} e alto ${b}.`, mostra: "intero" },
      { testo: `Spezziamo i numeri: ${a} = ${[da, ua].filter(Boolean).join(" + ")} e ${b} = ${[db, ub].filter(Boolean).join(" + ")}.`, mostra: "tagli" },
      ...parti.map(([x, y], k) => ({ testo: `${x} × ${y} = ${x * y}.`, mostra: "parte", parte: k })),
      { testo: `Ora sommiamo i pezzi: ${parti.map(([x, y]) => x * y).join(" + ")} = ${a * b}. 🎉`, mostra: "somma", finale: true },
    ];
    return { passi, da, ua, db, ub };
  }
  function disegnaScomposizione(palco, a, b, s, n) {
    const W = 520, H = 300, M = 40;
    const minimo = 0.18;
    const fx = s.ua && s.da ? Math.min(1 - minimo, Math.max(minimo, s.da / a)) : (s.da ? 1 : 0);
    const fy = s.ub && s.db ? Math.min(1 - minimo, Math.max(minimo, s.db / b)) : (s.db ? 1 : 0);
    const x0 = M, y0 = M, w = W - M - 10, h = H - M - 10;
    const xs = x0 + w * fx, ys = y0 + h * fy;
    const passo = s.passi[n];
    const colori = ["var(--mat)", "var(--sci)", "var(--giallo)", "var(--corallo)"];
    const rett = [
      [x0, y0, xs - x0, ys - y0, s.da, s.db], [xs, y0, x0 + w - xs, ys - y0, s.ua, s.db],
      [x0, ys, xs - x0, y0 + h - ys, s.da, s.ub], [xs, ys, x0 + w - xs, y0 + h - ys, s.ua, s.ub],
    ].filter((r) => r[4] && r[5]);
    const tagliato = n >= 1;
    let svg = `<svg viewBox="0 0 ${W} ${H}" class="scomposizione" role="img" aria-label="${escapeHTML(passo.testo)}">`;
    if (!tagliato) {
      svg += `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" rx="10" fill="var(--tema-chiaro)" stroke="var(--tema)" stroke-width="4"/>`;
      svg += `<text x="${x0 + w / 2}" y="${y0 - 12}" class="etichetta-svg">${a}</text><text x="${x0 - 12}" y="${y0 + h / 2}" class="etichetta-svg" text-anchor="end">${b}</text>`;
    } else {
      const fatti = s.passi.slice(0, n + 1).filter((p) => p.mostra === "parte").map((p) => p.parte);
      rett.forEach((r, k) => {
        const attivo = passo.parte === k || passo.mostra === "somma";
        const visto = fatti.includes(k) || passo.mostra === "somma";
        svg += `<rect x="${r[0] + 3}" y="${r[1] + 3}" width="${r[2] - 6}" height="${r[3] - 6}" rx="8" fill="${visto ? colori[k] : "var(--tema-chiaro)"}" fill-opacity="${attivo ? 0.95 : visto ? 0.45 : 1}" stroke="${colori[k]}" stroke-width="${attivo ? 6 : 3}" class="${passo.parte === k ? "pezzo-nuovo" : ""}"/>`;
        if (visto) svg += `<text x="${r[0] + r[2] / 2}" y="${r[1] + r[3] / 2 + 10}" class="valore-svg">${r[4] * r[5]}</text>`;
      });
      [[x0, xs, s.da], [xs, x0 + w, s.ua]].forEach(([p, q, v]) => { if (v) svg += `<text x="${(p + q) / 2}" y="${y0 - 12}" class="etichetta-svg">${v}</text>`; });
      [[y0, ys, s.db], [ys, y0 + h, s.ub]].forEach(([p, q, v]) => { if (v) svg += `<text x="${x0 - 12}" y="${(p + q) / 2 + 8}" class="etichetta-svg" text-anchor="end">${v}</text>`; });
    }
    svg += "</svg>";
    palco.innerHTML = svg;
  }

  /* ---------- Lettore: Guarda / Passo / Da capo, con voce facoltativa ---------- */
  function crea(contenitore, anim) {
    const a = +anim.a, b = +anim.b;
    const tipo = anim.tipo;
    let passi, disegna;
    if (tipo === "moltiplicazione") {
      passi = passiMoltiplicazione(a, b);
      disegna = (palco, n) => {
        const g = griglia(a, b);
        palco.replaceChildren(g.el);
        for (let k = 0; k <= n; k++) applica(g, passi[k], true, k === n);
        evidenzia(g, passi[n]);
        if (passi[n].finale) g.el.classList.add("finita");
      };
    } else if (tipo === "scomposizione") {
      const s = passiScomposizione(a, b);
      passi = s.passi;
      disegna = (palco, n) => disegnaScomposizione(palco, a, b, s, n);
    } else return;

    contenitore.innerHTML = `
      <div class="animazione">
        <div class="palco"></div>
        <p class="didascalia" aria-live="polite"></p>
        <div class="comandi">
          <button class="btn" data-anim="play">▶ Guarda</button>
          <button class="btn bianco" data-anim="passo">⏭ Un passo</button>
          <button class="btn bianco" data-anim="capo">↺ Da capo</button>
          <label class="con-voce"><input type="checkbox" data-anim="voce" checked> 🔊 Con la voce</label>
        </div>
      </div>`;
    const palco = contenitore.querySelector(".palco"), didascalia = contenitore.querySelector(".didascalia");
    const play = contenitore.querySelector('[data-anim="play"]'), voce = contenitore.querySelector('[data-anim="voce"]');
    let n = 0, timer = null, inCorso = false;

    function vai(k, parla) {
      n = Math.max(0, Math.min(passi.length - 1, k));
      disegna(palco, n);
      didascalia.textContent = passi[n].testo;
      didascalia.classList.remove("nuova"); void didascalia.offsetWidth; didascalia.classList.add("nuova");
      if (passi[n].finale) Suono.giusto();
      if (parla && voce.checked) Voce.parla(passi[n].testo, () => { if (inCorso) timer = setTimeout(avanti, 700); });
      else if (inCorso) timer = setTimeout(avanti, 2600);
    }
    function avanti() {
      if (!inCorso) return;
      if (n >= passi.length - 1) return ferma();
      vai(n + 1, true);
    }
    function ferma() { inCorso = false; clearTimeout(timer); play.textContent = "▶ Guarda"; }
    contenitore.addEventListener("click", (ev) => {
      const az = ev.target.closest("button")?.dataset.anim;
      if (!az) return;
      if (az === "play") {
        if (inCorso) { ferma(); speechSynthesis?.cancel?.(); return; }
        inCorso = true; play.textContent = "⏸ Pausa";
        vai(n >= passi.length - 1 ? 0 : n, true);
      }
      if (az === "passo") { ferma(); vai(n + 1, true); }
      if (az === "capo") { ferma(); speechSynthesis?.cancel?.(); vai(0, false); }
    });
    vai(0, false);
  }

  /* ---------- Esercizio "colonna": il bambino scrive le cifre ---------- */
  function esercizioColonna(e, c, esito, intestazione) {
    const a = +e.a, b = +e.b;
    const passi = passiMoltiplicazione(a, b);
    const g = griglia(a, b);
    // Sequenza delle cifre da scrivere, con il suggerimento del passo.
    const attese = [];
    passi.forEach((p, k) => p.azioni.forEach((az) => { if (az.tipo === "cifra" || az.tipo === "zero") attese.push({ ...az, passo: k }); }));
    // Un numero di due cifre scritto in fondo alla riga va scritto una cifra alla volta.
    const sequenza = [];
    for (const at of attese) {
      if (at.val >= 10) { sequenza.push({ ...at, val: at.val % 10 }, { ...at, col: at.col + 1, val: Math.floor(at.val / 10) }); }
      else sequenza.push(at);
    }
    c.innerHTML = intestazione + `<div class="colonna-es"><div class="colonna-posto"></div>
      <div class="tastierino">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d) => `<button class="tasto" data-d="${d}">${d}</button>`).join("")}</div></div>`;
    c.querySelector(".colonna-posto").append(g.el);
    let k = 0, applicati = -1;
    const puliti = new Set();
    const soloTipo = (p, tipi) => ({ azioni: passi[p].azioni.filter((x) => tipi.includes(x.tipo)) });
    function prepara() {
      Object.values(g.celle).forEach((x) => x.classList.remove("attiva"));
      if (k >= sequenza.length) return;
      const at = sequenza[k];
      // Passi già superati (anche quelli senza cifre da scrivere): pulizie e riporti, in ordine.
      for (let p = applicati + 1; p < at.passo; p++) { applica(g, soloTipo(p, ["pulisci", "riporto"])); puliti.add(p); }
      applicati = Math.max(applicati, at.passo - 1);
      if (!puliti.has(at.passo)) { applica(g, soloTipo(at.passo, ["pulisci"])); puliti.add(at.passo); }
      g.celle[`${at.riga}-${at.col}`].classList.add("attiva");
      evidenzia(g, passi[at.passo]);
    }
    prepara();
    c.addEventListener("click", (ev) => {
      const t = ev.target.closest(".tasto");
      if (!t || k >= sequenza.length) return;
      c.querySelectorAll(".tasto.sbagliata").forEach((x) => x.classList.remove("sbagliata"));
      const at = sequenza[k];
      const cella = g.celle[`${at.riga}-${at.col}`];
      if (+t.dataset.d === at.val) {
        cella.textContent = at.val; cella.classList.add("nuova");
        if (at.tipo === "zero") cella.classList.add("segnaposto");
        k++;
        const finitoPasso = k >= sequenza.length || sequenza[k].passo !== at.passo;
        if (finitoPasso) { applica(g, soloTipo(at.passo, ["riporto"])); applicati = at.passo; }
        if (k >= sequenza.length) { evidenzia(g, { evid: ["r-*"] }); Object.values(g.celle).forEach((x) => x.classList.remove("attiva")); esito.ok(); }
        else { Suono.giusto(); prepara(); }
      } else {
        const p = passi[at.passo];
        e.suggerimento = at.tipo === "zero" ? "Ricorda lo 0 segnaposto!" : p.testo.replace(/Scrivo.*$/, "").trim();
        esito.ko(t);
      }
    });
  }

  window.Animazioni = { crea, esercizioColonna, passiMoltiplicazione };
})();
