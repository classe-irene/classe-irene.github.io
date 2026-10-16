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

  /* ---------- Moltiplicazione "per gelosia" (a griglia) ----------
     Strategia compensativa adatta ai DSA: niente riporti a mente, ogni casella è
     un prodotto della tavola pitagorica, alla fine si somma lungo le diagonali. */
  function calcolaGelosia(a, b) {
    const A = cifre(a), B = cifre(b);           // A in alto (colonne), B a destra (righe)
    const n = A.length, m = B.length;
    const caselle = [];
    for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) {
      const p = A[c] * B[r];
      caselle.push({ r, c, p, d: Math.floor(p / 10), u: p % 10, diag: (n - 1 - c) + (m - 1 - r) });
    }
    const diagonali = [];
    let riporto = 0;
    for (let k = 0; k < n + m; k++) {
      const pezzi = [];
      for (const x of caselle) { if (x.diag === k) pezzi.push({ ...x, parte: "u", v: x.u }); if (x.diag + 1 === k) pezzi.push({ ...x, parte: "d", v: x.d }); }
      const somma = pezzi.reduce((t, x) => t + x.v, 0) + riporto;
      diagonali.push({ k, pezzi, riportoPrima: riporto, somma, cifra: somma % 10, riporto: Math.floor(somma / 10) });
      riporto = Math.floor(somma / 10);
    }
    return { A, B, n, m, caselle, diagonali };
  }
  function passiGelosia(a, b) {
    const g = calcolaGelosia(a, b);
    const passi = [{ testo: `Disegno una griglia. ${a} va in alto, ${b} a destra. Ogni casella ha una diagonale.`, caselle: 0, diag: 0 }];
    passi.push({ testo: "In ogni casella scrivo un risultato della tavola pitagorica: le decine sopra la diagonale, le unità sotto.", caselle: 0, diag: 0 });
    g.caselle.forEach((x, i) => passi.push({ testo: `${g.B[x.r]} × ${g.A[x.c]} = ${x.p}. Scrivo ${x.d} sopra e ${x.u} sotto.`, caselle: i + 1, diag: 0, attiva: i }));
    passi.push({ testo: "Ora sommo lungo le diagonali, partendo dall'angolo in basso a destra.", caselle: g.caselle.length, diag: 0 });
    g.diagonali.forEach((dg, i) => {
      const numeri = dg.pezzi.map((x) => x.v);
      if (dg.riportoPrima) numeri.push(dg.riportoPrima);
      let testo = numeri.length > 1 ? `${numeri.join(" + ")} = ${dg.somma}.` : `Qui c'è solo ${dg.somma}.`;
      if (dg.riportoPrima) testo = testo.replace(/ \+ (\d+) =/, " + $1 di riporto =");
      testo += dg.riporto ? ` Scrivo ${dg.cifra} e porto ${dg.riporto} nella diagonale dopo.` : ` Scrivo ${dg.cifra}.`;
      passi.push({ testo, caselle: g.caselle.length, diag: i + 1, diagAttiva: i });
    });
    const letto = g.diagonali.map((x) => x.cifra).reverse().join("");
    passi.push({ testo: `Leggo il risultato da sinistra: ${letto.replace(/^0+(?=\d)/, "")}. Quindi ${a} × ${b} = ${a * b}! 🎉`, caselle: g.caselle.length, diag: g.diagonali.length, finale: true });
    return { g, passi };
  }
  function svgGelosia(g, stato) {
    // stato: { caselle: quante riempite, diag: quante diagonali sommate, attiva, diagAttiva, attese: Set di chiavi da evidenziare }
    const S = 92, x0 = 70, y0 = 56, W = x0 + g.n * S + 70, H = y0 + g.m * S + 60;
    const colori = ["var(--mat)", "var(--sci)", "var(--corallo)", "var(--viola)", "#E0A100", "#0E9AA7"];
    let svg = `<svg viewBox="0 0 ${W} ${H}" class="gelosia" role="img">`;
    // fasce colorate delle diagonali già sommate
    for (let k = 0; k < stato.diag; k++) {
      const col = colori[k % colori.length];
      for (const x of g.caselle) {
        const X = x0 + x.c * S, Y = y0 + x.r * S;
        if (x.diag === k) svg += `<polygon points="${X + S},${Y} ${X + S},${Y + S} ${X},${Y + S}" fill="${col}" fill-opacity="${stato.diagAttiva === k ? 0.35 : 0.14}"/>`;
        if (x.diag + 1 === k) svg += `<polygon points="${X},${Y} ${X + S},${Y} ${X},${Y + S}" fill="${col}" fill-opacity="${stato.diagAttiva === k ? 0.35 : 0.14}"/>`;
      }
    }
    g.caselle.forEach((x, i) => {
      const X = x0 + x.c * S, Y = y0 + x.r * S;
      const att = stato.attiva === i;
      svg += `<rect x="${X}" y="${Y}" width="${S}" height="${S}" fill="${att ? "var(--giallo-chiaro)" : "none"}" stroke="var(--testo)" stroke-width="3"/>`;
      svg += `<line x1="${X + S}" y1="${Y}" x2="${X}" y2="${Y + S}" stroke="var(--testo-tenue)" stroke-width="2"/>`;
      if (i < stato.caselle) {
        svg += `<text x="${X + S * 0.3}" y="${Y + S * 0.42}" class="g-cifra${att ? " nuova-svg" : ""}">${x.d}</text>`;
        svg += `<text x="${X + S * 0.7}" y="${Y + S * 0.86}" class="g-cifra${att ? " nuova-svg" : ""}">${x.u}</text>`;
      }
      if (stato.chiedi?.has(`c${i}d`)) svg += `<rect x="${X + 8}" y="${Y + 8}" width="${S * 0.42}" height="${S * 0.42}" rx="8" class="g-chiedi"/>`;
      if (stato.chiedi?.has(`c${i}u`)) svg += `<rect x="${X + S * 0.5}" y="${Y + S * 0.5}" width="${S * 0.42}" height="${S * 0.42}" rx="8" class="g-chiedi"/>`;
    });
    g.A.forEach((d, c) => { svg += `<text x="${x0 + c * S + S / 2}" y="${y0 - 14}" class="g-dato">${d}</text>`; });
    g.B.forEach((d, r) => { svg += `<text x="${x0 + g.n * S + 30}" y="${y0 + r * S + S / 2 + 12}" class="g-dato">${d}</text>`; });
    svg += `<text x="${x0 + g.n * S + 30}" y="${y0 - 14}" class="g-dato segno">×</text>`;
    // risultati delle diagonali: sotto la griglia e a sinistra
    g.diagonali.forEach((dg, k) => {
      let X, Y;
      if (k < g.n) { X = x0 + (g.n - 1 - k) * S + S / 2; Y = y0 + g.m * S + 42; }
      else { const r = g.n + g.m - 1 - k; X = x0 - 30; Y = y0 + r * S + S / 2 + 12; }
      if (k < stato.diag) svg += `<text x="${X}" y="${Y}" class="g-risultato${stato.diagAttiva === k ? " nuova-svg" : ""}" fill="${colori[k % colori.length]}">${dg.cifra}</text>`;
      if (stato.chiedi?.has(`r${k}`)) svg += `<rect x="${X - 22}" y="${Y - 34}" width="44" height="44" rx="10" class="g-chiedi"/>`;
    });
    return svg + "</svg>";
  }

  /* ---------- Tavola pitagorica (strumento compensativo) ---------- */
  function apriTavola() {
    let d = document.getElementById("tavola-pitagorica");
    if (!d) {
      d = document.createElement("dialog");
      d.id = "tavola-pitagorica";
      let t = '<table><tr><th>×</th>' + [1,2,3,4,5,6,7,8,9,10].map((x) => `<th>${x}</th>`).join("") + "</tr>";
      for (let r = 1; r <= 10; r++) t += `<tr><th>${r}</th>` + [1,2,3,4,5,6,7,8,9,10].map((c) => `<td data-r="${r}" data-c="${c}">${r * c}</td>`).join("") + "</tr>";
      t += "</table>";
      d.innerHTML = `<div class="tavola-testa"><h2>📋 Tavola pitagorica</h2><button class="btn bianco piccolo" data-chiudi>✕ Chiudi</button></div>
        <p class="tavola-frase">Tocca un numero.</p>${t}`;
      d.addEventListener("click", (ev) => {
        if (ev.target.closest("[data-chiudi]") || ev.target === d) return d.close();
        const td = ev.target.closest("td");
        if (!td) return;
        const r = +td.dataset.r, c = +td.dataset.c;
        d.querySelectorAll("td").forEach((x) => x.classList.toggle("riga", (+x.dataset.r === r && +x.dataset.c <= c) || (+x.dataset.c === c && +x.dataset.r <= r)));
        d.querySelectorAll(".scelto").forEach((x) => x.classList.remove("scelto")); td.classList.add("scelto");
        const frase = `${r} × ${c} = ${r * c}`;
        d.querySelector(".tavola-frase").textContent = frase;
        Voce.parla(frase.replace("×", "per"), null, { scritte: false });
      });
      document.body.append(d);
    }
    d.showModal ? d.showModal() : d.setAttribute("open", "");
  }

  /* ---------- Scene di Scienze: piccoli "video" disegnati ----------
     Ogni scena è un disegno SVG con dei pezzi che compaiono passo dopo passo
     (da = dal passo, a = fino al passo). Il disegno resta fermo e i movimenti
     continui (palline, pioggia, fiume) sono animazioni CSS. */
  const fig = (e, x, y, s, extra = "") => {
    const f = window.Figura?.file(e);
    return f ? `<image href="${f}" x="${x - s / 2}" y="${y - s / 2}" width="${s}" height="${s}" ${extra}/>`
      : `<text x="${x}" y="${y + s * 0.35}" font-size="${s}" text-anchor="middle" ${extra}>${e}</text>`;
  };
  const casuale = (seme) => () => ((seme = (seme * 9301 + 49297) % 233280) / 233280);

  function scenaStati() {
    const r = casuale(7);
    const scatola = (x, titolo, emoji) => `<rect x="${x}" y="70" width="170" height="190" rx="18" class="sc-scatola"/>
      ${fig(emoji, x + 85, 40, 44)}<text x="${x + 85}" y="292" class="sc-etichetta">${titolo}</text>`;
    let solido = "", liquido = "", gas = "";
    for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++)
      solido += `<circle cx="${45 + i * 26}" cy="${142 + j * 26}" r="11" class="pallina vibra" style="animation-delay:-${(r() * 0.4).toFixed(2)}s"/>`;
    for (let k = 0; k < 18; k++) {
      const x = 240 + (k % 6) * 22 + r() * 6, y = 180 + Math.floor(k / 6) * 25 + r() * 4;
      liquido += `<circle cx="${x}" cy="${y}" r="11" class="pallina scivola" style="animation-delay:-${(r() * 4).toFixed(2)}s"/>`;
    }
    for (let k = 0; k < 9; k++)
      gas += `<circle cx="${455 + r() * 80}" cy="${125 + r() * 80}" r="11" class="pallina vola v${k % 4}" style="animation-delay:-${(r() * 6).toFixed(2)}s"/>`;
    return {
      viewBox: "0 0 620 330",
      pezzi: [
        { da: 0, a: 0, svg: fig("🔍", 250, 150, 170) + [0, 1, 2, 3, 4, 5, 6].map((k) => `<circle cx="${400 + (k % 3) * 34}" cy="${120 + Math.floor(k / 3) * 34}" r="14" class="pallina vibra"/>`).join("") },
        { da: 1, svg: scatola(20, "SOLIDO", "🧊") + solido },
        { da: 2, svg: scatola(215, "LIQUIDO", "💧") + `<rect x="217" y="152" width="166" height="106" rx="14" class="sc-acqua"/>` + liquido },
        { da: 3, svg: scatola(410, "GAS", "♨️") + gas },
        { da: 4, a: 4, svg: `<path d="M195 165 h14" class="sc-freccia caldo"/><path d="M390 165 h14" class="sc-freccia caldo"/>${fig("🔥", 202, 205, 34)}${fig("🔥", 397, 205, 34)}` },
        { da: 5, svg: `<path d="M209 135 h-14" class="sc-freccia freddo"/><path d="M404 135 h-14" class="sc-freccia freddo"/>${fig("❄️", 202, 100, 30)}${fig("❄️", 397, 100, 30)}` },
      ],
      passi: [
        "Tutte le cose sono fatte di pezzettini piccolissimi. Li disegniamo come palline.",
        "Nel solido le palline sono strette strette. Tremano, ma restano al loro posto. Per questo il solido ha una forma sua.",
        "Nel liquido le palline sono vicine, ma scivolano. Per questo il liquido scorre e prende la forma del bicchiere.",
        "Nel gas le palline sono lontane e volano dappertutto. Per questo il gas riempie tutto lo spazio.",
        "Se scaldo, le palline si muovono di più. Il ghiaccio diventa acqua. L'acqua diventa vapore.",
        "Se raffreddo, succede il contrario. Il vapore torna acqua. L'acqua diventa ghiaccio.",
      ],
    };
  }

  function scenaCicloAcqua() {
    let gocce = "", vapore = "", neve = "";
    for (let k = 0; k < 9; k++) gocce += `<line x1="${330 + k * 22}" y1="${118 + (k % 3) * 8}" x2="${326 + k * 22}" y2="${132 + (k % 3) * 8}" class="sc-pioggia" style="animation-delay:-${(k * 0.17).toFixed(2)}s"/>`;
    for (let k = 0; k < 6; k++) vapore += `<path d="M${80 + k * 34} 250 q 8 -12 0 -24 q -8 -12 0 -24" class="sc-vapore" style="animation-delay:-${(k * 0.45).toFixed(2)}s"/>`;
    for (let k = 0; k < 4; k++) neve += fig("❄️", 470 + k * 18, 125 + (k % 2) * 10, 16, `class="sc-fiocco" style="animation-delay:-${k * 0.5}s"`);
    return {
      viewBox: "0 0 620 330",
      pezzi: [
        { da: 0, svg: `<rect x="0" y="0" width="620" height="330" class="sc-cielo"/>
          <path d="M300 300 L470 110 L640 300 Z" class="sc-monte"/><path d="M445 140 L470 110 L497 140 L482 134 L470 146 L458 134 Z" class="sc-cima"/>
          <path d="M0 260 Q 60 248 120 260 T 240 260 T 340 262 L340 330 L0 330 Z" class="sc-mare"/>
          <rect x="300" y="300" width="320" height="30" class="sc-prato"/>
          ${fig("🌊", 160, 285, 46)}<text x="60" y="318" class="sc-etichetta piccola">MARE</text><text x="470" y="290" class="sc-etichetta piccola">MONTAGNA</text>` },
        { da: 0, svg: `<g class="${""}sc-sole">${fig("☀️", 70, 62, 90)}</g>` },
        { da: 1, svg: `<circle cx="70" cy="62" r="62" class="sc-alone"/>` },
        { da: 2, a: 3, svg: vapore + `<text x="170" y="170" class="sc-parola">evaporazione</text>` },
        { da: 3, svg: `<g class="sc-nuvola">${fig("☁️", 390, 85, 110)}${fig("☁️", 470, 75, 96)}</g>` },
        { da: 3, a: 3, svg: `<text x="420" y="160" class="sc-parola">condensazione</text>` },
        { da: 4, a: 5, svg: gocce + neve + `<text x="560" y="200" class="sc-parola">pioggia</text>` },
        { da: 5, svg: `<path d="M470 150 C 440 200, 400 220, 380 250 S 330 275, 290 268" class="sc-fiume"/><path d="M470 150 C 440 200, 400 220, 380 250 S 330 275, 290 268" class="sc-fiume-scorre"/><text x="380" y="292" class="sc-parola">fiume</text>` },
        { da: 6, svg: `<path d="M140 200 C 160 110, 260 60, 330 70" class="sc-giro"/><path d="M560 120 C 600 200, 520 300, 420 300" class="sc-giro"/><path d="M300 305 C 240 315, 190 300, 170 280" class="sc-giro"/>` },
      ],
      passi: [
        "Ecco il mare, la montagna e il sole.",
        "Il sole scalda l'acqua del mare.",
        "L'acqua calda diventa vapore e sale in cielo. Si chiama evaporazione.",
        "In alto fa freddo. Il vapore diventa tante goccioline: nasce una nuvola. Si chiama condensazione.",
        "Le gocce diventano pesanti e cadono: è la pioggia. In montagna, se fa molto freddo, cade la neve.",
        "L'acqua scorre nel fiume e torna al mare.",
        "E il viaggio ricomincia, sempre! È il ciclo dell'acqua.",
      ],
    };
  }

  function scenaFotosintesi() {
    let acqua = "", ossigeno = "", co2 = "";
    for (let k = 0; k < 4; k++) acqua += `<circle cx="310" cy="300" r="7" class="sc-goccia-sale" style="animation-delay:-${k * 0.7}s"/>`;
    for (let k = 0; k < 4; k++) ossigeno += `<g class="sc-bolla-esce" style="animation-delay:-${k * 0.8}s"><circle cx="400" cy="120" r="16" class="sc-o2"/><text x="400" y="126" class="sc-formula">O₂</text></g>`;
    for (let k = 0; k < 3; k++) co2 += `<g class="sc-bolla-entra" style="animation-delay:-${k * 1}s"><circle cx="560" cy="90" r="18" class="sc-co2"/><text x="560" y="96" class="sc-formula">CO₂</text></g>`;
    return {
      viewBox: "0 0 620 360",
      pezzi: [
        { da: 0, svg: `<rect x="0" y="0" width="620" height="360" class="sc-cielo"/><rect x="0" y="250" width="620" height="110" class="sc-terra"/>
          <path d="M310 250 v-150" class="sc-fusto"/>
          <path d="M310 250 q -20 30 -50 45 M310 250 q 5 40 -5 70 M310 250 q 25 25 55 40 M285 282 q -20 5 -35 20 M330 275 q 20 10 25 30" class="sc-radici"/>
          <path d="M310 170 C 250 150, 220 110, 230 90 C 270 90, 300 120, 310 170 Z" class="sc-foglia"/>
          <path d="M310 140 C 370 120, 400 80, 390 60 C 350 60, 320 90, 310 140 Z" class="sc-foglia"/>
          <path d="M310 205 C 370 195, 410 160, 405 140 C 360 140, 325 170, 310 205 Z" class="sc-foglia"/>
` },
        { da: 0, a: 0, svg: `<text x="170" y="120" class="sc-parola">foglie</text><text x="250" y="230" class="sc-parola">fusto</text><text x="200" y="320" class="sc-parola">radici</text>` },
        { da: 1, svg: acqua }, { da: 1, a: 1, svg: fig("💧", 400, 300, 40) + `<text x="470" y="306" class="sc-parola">acqua</text>` },
        { da: 2, svg: fig("☀️", 70, 60, 90) + `<path d="M115 85 L 225 110 M110 105 L 230 160 M100 120 L 290 190" class="sc-raggio"/>` }, { da: 2, a: 2, svg: `<text x="120" y="190" class="sc-parola">luce</text>` },
        { da: 3, svg: co2 }, { da: 3, a: 3, svg: `<text x="540" y="160" class="sc-parola">aria</text>` },
        { da: 4, svg: fig("🍬", 255, 118, 34, 'class="sc-zucchero"') + fig("🍬", 375, 160, 34, 'class="sc-zucchero"') }, { da: 4, a: 4, svg: `<text x="440" y="215" class="sc-parola">cibo!</text>` },
        { da: 5, svg: ossigeno + fig("🧒", 560, 300, 70) + `<text x="470" y="250" class="sc-parola">ossigeno</text>` },
      ],
      passi: [
        "Ecco una pianta. Ha le radici, il fusto e le foglie.",
        "Le radici bevono l'acqua del terreno. L'acqua sale nel fusto fino alle foglie.",
        "Le foglie prendono la luce del sole. Sono verdi proprio per catturarla.",
        "Le foglie prendono anche un gas dall'aria: si chiama anidride carbonica.",
        "Con acqua, luce e aria la foglia prepara il suo cibo: uno zucchero. Si chiama fotosintesi.",
        "E intanto la pianta regala ossigeno: l'aria che noi respiriamo! Grazie, piante!",
      ],
    };
  }

  // Sequenza semplice per qualsiasi argomento (la usa anche la "lezione in 5 minuti"):
  // ogni passo mostra grandi figure (emoji) e una frase. "→" fra le figure disegna una freccia.
  function scenaSequenza(anim) {
    const passi = (anim.passi || []).map((p) => String(p.testo || ""));
    const pezzi = (anim.passi || []).map((p, k) => {
      const parti = String(p.figure || "").trim().split(/\s+/).filter(Boolean).slice(0, 5);
      const passo = 600 / Math.max(parti.length, 1);
      const svg = parti.map((t, i) => {
        const x = passo * i + passo / 2;
        return t === "→" ? `<path d="M${x - 28} 150 h50" class="sc-freccia sequenza"/>`
          : `<g class="sc-entra" style="animation-delay:${(i * 0.35).toFixed(2)}s">${fig(t, x, 150, Math.min(150, passo * 0.8))}</g>`;
      }).join("");
      return { da: k, a: k, svg };
    });
    return { viewBox: "0 0 600 300", pezzi, passi };
  }

  /* ---------- Decine e unità con i cubetti (numeri fino a 100) ---------- */
  const Q = 18; // lato di un cubetto
  function barraDecina(x, y, cls = "") {
    let r = `<g class="decina ${cls}"><rect x="${x - 2}" y="${y - 2}" width="${Q + 4}" height="${Q * 10 + 4}" rx="5" class="decina-bordo"/>`;
    for (let k = 0; k < 10; k++) r += `<rect x="${x}" y="${y + k * Q}" width="${Q}" height="${Q}" rx="3" class="cubo cubo-d"/>`;
    return r + "</g>";
  }
  const cubetto = (x, y, cls = "") => `<rect x="${x}" y="${y}" width="${Q}" height="${Q}" rx="3" class="cubo cubo-u ${cls}"/>`;
  function blocchiSVG(d, u, x0 = 30, y0 = 40) {
    let svg = "";
    for (let i = 0; i < d; i++) svg += barraDecina(x0 + i * (Q + 12), y0);
    const xu = x0 + d * (Q + 12) + (d ? 24 : 0);
    for (let k = 0; k < u; k++) svg += cubetto(xu + (k % 3) * (Q + 6), y0 + Q * 10 - Q - Math.floor(k / 3) * (Q + 6));
    return svg;
  }
  function abaco(x, y, d, u, c = 0) {
    const asta = (xa, n, cls, et) => `<line x1="${xa}" y1="${y}" x2="${xa}" y2="${y + 150}" class="asta"/>
      ${Array.from({ length: n }, (_, k) => `<ellipse cx="${xa}" cy="${y + 140 - k * 14}" rx="18" ry="7" class="pallina-abaco ${cls}"/>`).join("")}
      <text x="${xa}" y="${y + 180}" class="sc-etichetta">${et}</text>`;
    return `<rect x="${x - 10}" y="${y + 150}" width="${c ? 200 : 140}" height="12" rx="4" class="base-abaco"/>`
      + (c ? asta(x + 30, c, "c", "h") + asta(x + 100, d, "d", "da") + asta(x + 170, u, "u", "u") : asta(x + 30, d, "d", "da") + asta(x + 100, u, "u", "u"));
  }
  function scenaNumero(anim) {
    const n = Math.max(1, Math.min(100, +anim.n || 34));
    if (n === 100) {
      const pezzi = [{ da: 0, a: 0, svg: blocchiSVG(9, 10, 40, 40) }, { da: 1, svg: blocchiSVG(10, 0, 40, 40) },
        { da: 2, a: 2, svg: `<rect x="30" y="30" width="${10 * 30 + 4}" height="200" rx="12" class="centinaio"/><text x="530" y="170" class="g-numero">100</text>` },
        { da: 3, svg: abaco(450, 30, 0, 0, 1) }];
      return { viewBox: "0 0 680 300", pezzi, passi: [
        "Ecco 9 decine e 10 unità. 10 unità fanno una decina nuova!",
        "Ora le decine sono 10.",
        "10 decine fanno 100: un centinaio!",
        "Sull'abaco: 1 pallina nelle centinaia, 0 nelle decine, 0 nelle unità. Si scrive 100."] };
    }
    const d = Math.floor(n / 10), u = n % 10;
    const pezzi = [], passi = [];
    pezzi.push({ da: 0, a: 0, svg: `<text x="340" y="170" class="g-numero grigio">${n}</text>` });
    passi.push(`Ecco il numero ${n}. Lo costruiamo con i cubetti.`);
    for (let i = 0; i < d; i++) {
      pezzi.push({ da: i + 1, svg: barraDecina(30 + i * (Q + 12), 40) + `<text x="${30 + i * (Q + 12) + Q / 2}" y="250" class="g-conto">${(i + 1) * 10}</text>` });
      passi.push(i === 0 ? "Una barretta ha 10 cubetti: è una decina. 10." : `${(i + 1) * 10}.`);
    }
    const xu = 30 + d * (Q + 12) + (d ? 24 : 0);
    let cubi = "";
    for (let k = 0; k < u; k++) cubi += cubetto(xu + (k % 3) * (Q + 6), 40 + Q * 9 - Math.floor(k / 3) * (Q + 6));
    if (u) { pezzi.push({ da: d + 1, svg: cubi }); passi.push(`Ora i cubetti da soli: le unità. ${Array.from({ length: u }, (_, k) => n - u + k + 1).join(", ")}.`); }
    const k = passi.length;
    pezzi.push({ da: k, svg: `<text x="${Math.max(xu + 100, 380)}" y="170" class="g-numero"><tspan class="cifra-d">${d || ""}</tspan><tspan class="cifra-u">${u}</tspan></text>` });
    passi.push(`${d} ${d === 1 ? "decina" : "decine"} e ${u} ${u === 1 ? "unità" : "unità"}: ${n}.${d ? ` La cifra blu dice le decine, la cifra arancione le unità.` : ""}`);
    pezzi.push({ da: k + 1, svg: abaco(Math.max(xu + 90, 370) + 160, 40, d, u) });
    passi.push(`Sull'abaco: ${d} ${d === 1 ? "pallina" : "palline"} sull'asta delle decine e ${u} sull'asta delle unità.`);
    return { viewBox: "0 0 680 300", pezzi, passi };
  }

  /* ---------- Esercizio "costruisci": il bambino costruisce un numero con decine e unità ---------- */
  function esercizioCostruisci(e, c, esito, intestazione) {
    const n = +e.numero;
    let d = 0, u = 0;
    c.innerHTML = intestazione + `<div class="costruisci">
      <div class="costruisci-meta">${n}</div>
      <div class="colonna-posto costruisci-posto"></div>
      <div class="costruisci-tasti">
        <button class="btn" data-c="d+">➕ 1 decina</button><button class="btn bianco" data-c="d-">➖ decina</button>
        <button class="btn arancio" data-c="u+">➕ 1 unità</button><button class="btn bianco" data-c="u-">➖ unità</button>
        <button class="btn verde" data-c="ok">✔ Ho finito</button>
      </div>
      <p class="costruisci-conto"></p></div>`;
    const posto = c.querySelector(".costruisci-posto"), conto = c.querySelector(".costruisci-conto");
    const disegna = () => {
      posto.innerHTML = `<svg viewBox="0 0 ${Math.max(420, 60 + d * 30 + 90)} 230" class="blocchi">${blocchiSVG(d, u, 20, 20)}</svg>`;
      conto.innerHTML = `<b class="cifra-d">${d}</b> ${d === 1 ? "decina" : "decine"} e <b class="cifra-u">${u}</b> unità = <b>${d * 10 + u}</b>`;
    };
    disegna();
    c.addEventListener("click", (ev) => {
      const b = ev.target.closest("[data-c]");
      if (!b || c.classList.contains("risolto")) return;
      const a = b.dataset.c;
      if (a === "d+" && d < 10) d++;
      if (a === "d-" && d > 0) d--;
      if (a === "u+") { u++; if (u === 10) { u = 0; d++; Voce.parla("10 unità fanno una decina!", null, { scritte: false }); } }
      if (a === "u-" && u > 0) u--;
      if (a !== "ok") { disegna(); return; }
      if (d * 10 + u === n) esito.ok();
      else { e.suggerimento = `${n} = ${Math.floor(n / 10)} decine e ${n % 10} unità.`; esito.ko(b); }
    });
  }


  /* ---------- Equivalenze con i numeri: tabella k h da u ---------- */
  const UNITA_EQ = [
    { s: "k", nome: "migliaia", uno: "migliaio", e: "🚚", c: "#8B5CF6" },
    { s: "h", nome: "centinaia", uno: "centinaio", e: "🗃️", c: "#E0533D" },
    { s: "da", nome: "decine", uno: "decina", e: "📦", c: "#3D6BE0" },
    { s: "u", nome: "unità", uno: "unità", e: "🍫", c: "#F2994A" }];
  const colEq = (s) => UNITA_EQ.findIndex((x) => x.s === s);
  // Risultato dell'equivalenza, oppure null se non è un numero intero.
  function calcolaEquivalenza(n, da, a) {
    const salti = colEq(a) - colEq(da);
    if (salti >= 0) return n * 10 ** salti;
    const r = n / 10 ** -salti;
    return Number.isInteger(r) ? r : null;
  }
  const xEq = (i) => 130 + i * 140;
  function tabellaEqSVG(evid = -1) {
    return UNITA_EQ.map((x, i) => `<rect x="${xEq(i) - 66}" y="20" width="132" height="94" rx="14" fill="${x.c}" opacity="${i === evid ? 1 : .18}"/>
      ${fig(x.e, xEq(i), 52, 44)}<text x="${xEq(i)}" y="102" class="eq-sigla ${i === evid ? "chiara" : ""}">${x.s}</text>
      <rect x="${xEq(i) - 66}" y="122" width="132" height="96" rx="14" class="eq-casella"/>`).join("");
  }
  function cifreEqSVG(testo, ultima, cls = "", barrate = 0) {
    const t = String(testo);
    return [...t].map((c, k) => {
      const i = ultima - (t.length - 1 - k);
      const x = i >= 0 ? xEq(i) : xEq(0) - 140 * -i;
      const barra = k >= t.length - barrate;
      return `<text x="${x}" y="194" class="eq-cifra ${cls} ${barra ? "barrata" : ""}">${c}</text>${barra ? `<path d="M${x - 30} 196 L${x + 30} 140" class="eq-barra"/>` : ""}`;
    }).join("");
  }
  function scenaEquivalenza(anim) {
    const n = Math.max(1, +anim.n || 3), da = UNITA_EQ[colEq(anim.da)] ? anim.da : "h", a = UNITA_EQ[colEq(anim.a)] ? anim.a : "da";
    const i0 = colEq(da), i1 = colEq(a), salti = i1 - i0, ris = calcolaEquivalenza(n, da, a);
    const U0 = UNITA_EQ[i0], U1 = UNITA_EQ[i1], pezzi = [], passi = [];
    const nomeU = (U, q) => (q === 1 ? U.uno : U.nome);
    pezzi.push({ da: 0, a: 0, svg: tabellaEqSVG() });
    passi.push("Ecco la tabella: migliaia, centinaia, decine e unità. Ogni casella vale 10 volte quella a destra.");
    pezzi.push({ da: 1, svg: tabellaEqSVG(i1) });
    pezzi.push({ da: 1, a: 1, svg: cifreEqSVG(n, i0) });
    passi.push(`Scrivo ${n} ${U0.s}: l'ultima cifra va nella casella delle ${U0.nome}. Voglio arrivare alle ${U1.nome}.`);
    const passo = Math.abs(salti);
    const freccia = (k) => `<path d="M${xEq(i0 + Math.sign(salti) * k)} 250 Q ${(xEq(i0 + Math.sign(salti) * k) + xEq(i0 + Math.sign(salti) * (k + 1))) / 2} 225 ${xEq(i0 + Math.sign(salti) * (k + 1))} 250" class="eq-salto" marker-end="url(#punta)"/>`;
    if (salti === 0) {
      pezzi.push({ da: 2, svg: cifreEqSVG(n, i0) });
      passi.push("Sono già nella casella giusta: il numero non cambia.");
    } else if (salti > 0) {
      for (let k = 1; k <= passo; k++) {
        pezzi.push({ da: k + 1, svg: freccia(k - 1) });
        pezzi.push({ da: k + 1, a: k === passo ? undefined : k + 1, svg: cifreEqSVG(n + "0".repeat(k), i0 + k) });
        passi.push(`Salto ${k} verso destra: aggiungo uno 0. ${n + "0".repeat(k)}.`);
      }
    } else if (ris !== null) {
      for (let k = 1; k <= passo; k++) {
        pezzi.push({ da: k + 1, svg: freccia(k - 1) });
        pezzi.push({ da: k + 1, a: k === passo ? k + 1 : k + 1, svg: cifreEqSVG(n, i0, "", k) });
        passi.push(`Salto ${k} verso sinistra: tolgo uno 0.`);
      }
      pezzi.push({ da: passo + 2, svg: cifreEqSVG(ris, i1) });
      passi.push(`Restano ${ris}: l'ultima cifra è nella casella delle ${U1.nome}.`);
    }
    const ultimo = passi.length;
    pezzi.push({ da: ultimo, svg: `<text x="340" y="292" class="eq-risultato">${n} ${U0.s} = ${ris ?? "?"} ${U1.s}</text>` });
    passi.push(ris === null ? "Qui servono i numeri con la virgola: li vedremo più avanti." : `${n} ${U0.s} = ${ris} ${U1.s}. ${ris} ${nomeU(U1, ris)}!`);
    return { viewBox: "0 0 680 305", pezzi, passi };
  }

  /* ---------- Esercizio "equivalenza": il bambino sposta il numero nella tabella aggiungendo o togliendo zeri ---------- */
  function esercizioEquivalenza(e, c, esito, intestazione) {
    const n = +e.n, i0 = colEq(e.da), i1 = colEq(e.a), ris = calcolaEquivalenza(n, e.da, e.a);
    let testo = String(n), col = i0;
    c.innerHTML = intestazione + `<div class="equivalenza">
      <div class="eq-domanda">${n} ${e.da} = <b class="eq-ris">?</b> ${e.a}</div>
      <svg viewBox="0 0 680 230" class="eq-tabella"></svg>
      <p class="eq-aiuto">➡️ verso destra aggiungo uno 0 · ⬅️ verso sinistra tolgo uno 0</p>
      <div class="costruisci-tasti">
        <button class="btn bianco" data-q="s">⬅️ Togli 0</button>
        <button class="btn" data-q="d">Aggiungi 0 ➡️</button>
        <button class="btn verde" data-q="ok">✔ Ho finito</button>
      </div></div>`;
    const svg = c.querySelector(".eq-tabella"), r = c.querySelector(".eq-ris");
    const disegna = () => {
      svg.innerHTML = `<defs><marker id="punta-eq" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="context-stroke"/></marker></defs>` + tabellaEqSVG(i1) + cifreEqSVG(testo, col);
      r.textContent = col === i1 ? testo : "?";
    };
    disegna();
    c.addEventListener("click", (ev) => {
      const b = ev.target.closest("[data-q]");
      if (!b || c.classList.contains("risolto")) return;
      const q = b.dataset.q;
      if (q === "d" && col < 3) { testo += "0"; col++; Suono?.clic?.(); }
      else if (q === "s" && col > 0) {
        if (!testo.endsWith("0") || testo.length === 1) { Voce.parla("Qui non c'è uno zero da togliere.", null, { scritte: false }); return; }
        testo = testo.slice(0, -1); col--;
      }
      if (q !== "ok") { disegna(); return; }
      if (col === i1 && +testo === ris) esito.ok();
      else { e.suggerimento = `Porta l'ultima cifra nella casella ${e.a}: ${n} ${e.da} = ${ris} ${e.a}.`; esito.ko(b); }
    });
  }


  /* ---------- Tabella del valore posizionale hk dak uk h da u (relazione di equivalenza) ----------
     Metodo del quaderno: metto la cifra nella sua casella, riempio con gli zeri fino alle unità,
     leggo le cifre fino alla casella che cerco. Se la casella è più a sinistra, scrivo 0 e la virgola. */
  const COL6 = [
    { s: "hk", nome: "centinaia di migliaia", uno: "centinaio di migliaia", c: "#2FA35B" },
    { s: "dak", nome: "decine di migliaia", uno: "decina di migliaia", c: "#E0533D" },
    { s: "uk", nome: "unità di migliaia", uno: "unità di migliaia", c: "#3D6BE0" },
    { s: "h", nome: "centinaia", uno: "centinaio", c: "#2FA35B" },
    { s: "da", nome: "decine", uno: "decina", c: "#E0533D" },
    { s: "u", nome: "unità", uno: "unità", c: "#3D6BE0" }];
  const col6 = (s) => COL6.findIndex((x) => x.s === s);
  const migliaia = (t) => t.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  // Lettura nella tabella: { cifre (6 caselle), intera, decimale, testo }.
  function leggiTabella(n, da, a) {
    const s = String(n), i0 = col6(da), t = col6(a), cifre = Array(6).fill("");
    [...s].forEach((ch, k) => { const i = i0 - (s.length - 1 - k); if (i >= 0) cifre[i] = ch; });
    for (let i = i0 + 1; i < 6; i++) cifre[i] = "0";
    const prima = cifre.findIndex((x) => x !== "");
    const intera = t < prima ? "0" : cifre.slice(prima, t + 1).join("");
    const decimale = cifre.slice(t + 1).map((x) => x || "0").join("").replace(/0+$/, "");
    const testo = migliaia(intera) + (decimale ? "," + decimale : "");
    return { cifre, prima, i0, t, intera, decimale, testo };
  }
  const X6 = (i) => 70 + i * 100;
  function tabella6SVG({ evid = -1, cifre = [], spente = [], cliccabile = false, scuri = [] } = {}) {
    let svg = `<rect x="20" y="6" width="298" height="28" rx="8" class="t6-classe"/><text x="169" y="26" class="t6-classe-t">MIGLIAIA</text>
      <rect x="322" y="6" width="298" height="28" rx="8" class="t6-classe semplici"/><text x="471" y="26" class="t6-classe-t">UNITÀ SEMPLICI</text>`;
    COL6.forEach((x, i) => {
      const acc = i === evid || scuri.includes(i);
      svg += `<g ${cliccabile ? `data-col="${i}" class="t6-col"` : ""}>
        <rect x="${X6(i) - 48}" y="40" width="96" height="50" rx="10" fill="${x.c}" opacity="${acc ? 1 : .22}"/>
        <text x="${X6(i)}" y="74" class="t6-sigla ${acc ? "chiara" : ""}" fill="${acc ? "#fff" : x.c}">${x.s}</text>
        <rect x="${X6(i) - 48}" y="96" width="96" height="84" rx="10" class="t6-casella ${acc ? "accesa" : ""}" ${acc ? `stroke="${x.c}"` : ""}/>
        ${cifre[i] ? `<text x="${X6(i)}" y="160" class="t6-cifra ${spente.includes(i) ? "spenta" : ""}">${cifre[i]}</text>` : ""}</g>`;
    });
    return svg;
  }
  function graffa(da, a, testo = "") {
    const x1 = X6(da) - 44, x2 = X6(a) + 44;
    return `<path d="M${x1} 190 q0 12 12 12 H${(x1 + x2) / 2 - 10} l10 10 l10 -10 H${x2 - 12} q12 0 12 -12" class="t6-graffa"/>${testo ? `<text x="${Math.min(Math.max((x1 + x2) / 2, 160), 480)}" y="238" class="t6-leggo">${testo}</text>` : ""}`;
  }
  const virgola = (t) => `<text x="${X6(t) + 50}" y="166" class="t6-virgola">,</text>`;
  function scenaTabellaValore(anim) {
    const n = Math.max(1, +anim.n || 3), da = col6(anim.da) >= 0 ? anim.da : "dak";
    const letture = (anim.letture || ["u"]).filter((x) => col6(x) >= 0);
    const L0 = leggiTabella(n, da, "u"), i0 = col6(da), U0 = COL6[i0];
    const pezzi = [], passi = [];
    const solo = Array(6).fill(""); [...String(n)].forEach((ch, k, arr) => { const i = i0 - (arr.length - 1 - k); if (i >= 0) solo[i] = ch; });
    pezzi.push({ da: 0, a: 0, svg: tabella6SVG() });
    passi.push("Ecco la tabella. A sinistra la classe delle migliaia, a destra le unità semplici. Ogni casella vale 10 volte quella alla sua destra.");
    pezzi.push({ da: 1, a: 1, svg: tabella6SVG({ evid: i0, cifre: solo }) });
    passi.push(`Metto ${n} nella casella ${U0.s}.`);
    pezzi.push({ da: 2, a: 2, svg: tabella6SVG({ evid: i0, cifre: L0.cifre }) });
    passi.push(i0 < 5 ? `Riempio con gli zeri fino alla casella delle unità.` : "Sono già nella casella delle unità.");
    const righe = [];
    letture.forEach((a, k) => {
      const L = leggiTabella(n, da, a), t = L.t, U = COL6[t], step = 3 + k;
      const inizioDec = t + 1, spente = L.cifre.map((_, i) => i).filter((i) => i > t && !(i >= inizioDec && i < inizioDec + L.decimale.length));
      const cifre = L.cifre.map((x, i) => (i >= t && i < L.prima ? "0" : x));
      const riga = `${n} ${da} = ${L.testo} ${a}`; righe.push(riga);
      const da_ = Math.min(t, L.prima);
      pezzi.push({ da: step, a: step, svg: tabella6SVG({ evid: t, cifre, spente }) + graffa(da_, t, riga) + (L.decimale ? virgola(t) : "") });
      passi.push(L.decimale
        ? `Cerco le ${U.nome}: la casella ${U.s} è più a sinistra. Leggo fino a ${U.s}, poi metto la virgola. ${riga}.`
        : `Per sapere quante ${U.nome}, leggo le cifre fino alla casella ${U.s}: ${riga}.`);
    });
    if (righe.length > 1) {
      const fin = 3 + letture.length;
      pezzi.push({ da: fin, svg: tabella6SVG({ cifre: L0.cifre }) + righe.map((r, k) => `<text x="${k < 3 ? 170 : 470}" y="${222 + (k % 3) * 34}" class="t6-riga">${r}</text>`).join("") });
      passi.push("Tutte queste scritture indicano la stessa quantità: sono equivalenti!");
    }
    return { viewBox: "0 0 640 320", pezzi, passi };
  }

  /* ---------- Esercizio "leggi_tabella": metti la cifra, scegli fin dove leggere, scegli il risultato ---------- */
  function esercizioLeggiTabella(e, c, esito, intestazione) {
    const L = leggiTabella(e.n, e.da, e.a), i0 = col6(e.da), t = L.t;
    let fase = 1;
    const soloNumero = L.cifre.map((x, i) => (i > i0 ? "" : x));
    const sbagli = [L.testo];
    const alt = (x) => { const v = Number(x.replace(/\s/g, "").replace(",", ".")); return [v * 10, v / 10].map((y) => migliaia(String(+y.toFixed(6)).replace(".", ",").replace(/^(\d+)/, (m) => m))); };
    const opzioni = mescola([L.testo, ...alt(L.testo).filter((x) => !sbagli.includes(x))].slice(0, 3));
    c.innerHTML = intestazione + `<div class="leggi-tab">
      <div class="eq-domanda">${e.n} ${e.da} = <b class="eq-ris">?</b> ${e.a}</div>
      <p class="lt-fase"></p>
      <svg viewBox="0 0 640 245" class="lt-tabella"></svg>
      <div class="lt-opzioni" hidden>${opzioni.map((o) => `<button class="opzione" data-o="${o}">${o} ${e.a}</button>`).join("")}</div></div>`;
    const svg = c.querySelector(".lt-tabella"), fase_ = c.querySelector(".lt-fase"), ris = c.querySelector(".eq-ris"), ops = c.querySelector(".lt-opzioni");
    const disegna = () => {
      if (fase === 1) { svg.innerHTML = tabella6SVG({ cliccabile: true }); const nn = String(e.n); fase_.innerHTML = nn.length > 1 ? `1️⃣ Tocca la casella <b>${e.da}</b>: lì va l'ultima cifra del ${nn}, cioè il ${nn.slice(-1)}.` : `1️⃣ Tocca la casella <b>${e.da}</b>: lì va il ${nn}.`; }
      // Fase 2: solo le cifre del numero, senza zeri (gli zeri arrivano dopo, fino alla casella scelta).
      if (fase === 2) { svg.innerHTML = tabella6SVG({ cliccabile: true, cifre: soloNumero, scuri: [i0] }); fase_.innerHTML = `2️⃣ Vuoi sapere quante <b>${e.a}</b>. Tocca la casella <b>${e.a}</b>: leggerai fino a lì.`; }
      if (fase === 3) {
        // Zeri solo fino alla casella scelta: dopo non scrivo niente, così si legge subito il risultato.
        const cifre = L.cifre.map((x, i) => (i >= t && i < L.prima ? "0" : i > t && i > i0 ? "" : x));
        svg.innerHTML = tabella6SVG({ cifre, evid: t }) + graffa(Math.min(t, L.prima), t) + (L.decimale ? virgola(t) : "");
        fase_.innerHTML = `3️⃣ Leggi le cifre${L.decimale ? " e ricorda la virgola" : ""}. Quanto fa?`; ops.hidden = false;
      }
    };
    disegna();
    svg.addEventListener("click", (ev) => {
      const g = ev.target.closest("[data-col]");
      if (!g || c.classList.contains("risolto")) return;
      const i = +g.dataset.col;
      if (fase === 1 && i === i0) { fase = 2; Suono.giusto(); disegna(); Voce.parla("Bene! Ora scegli fino a quale casella leggere.", null, { scritte: false }); }
      else if (fase === 2 && i === t) { fase = 3; Suono.giusto(); disegna(); }
      else { e.suggerimento = fase === 1 ? `Cerca la casella ${e.da}.` : `Cerca la casella ${e.a}: leggi fino a lì.`; esito.ko(g); }
    });
    ops.addEventListener("click", (ev) => {
      const b = ev.target.closest("[data-o]");
      if (!b || c.classList.contains("risolto")) return;
      if (b.dataset.o === L.testo) { b.classList.add("giusta"); ris.textContent = L.testo; esito.ok(); }
      else { e.suggerimento = `Leggi le cifre fino alla casella ${e.a}.`; esito.ko(b); }
    });
  }

  const SCENE = { stati: scenaStati, ciclo_acqua: scenaCicloAcqua, fotosintesi: scenaFotosintesi, numero: scenaNumero, equivalenza: scenaEquivalenza, tabella_valore: scenaTabellaValore };
  function disegnaScena(palco, sc, n) {
    let svg = palco.querySelector("svg.scena");
    if (!svg) {
      palco.innerHTML = `<svg viewBox="${sc.viewBox}" class="scena" role="img"><defs>
        <marker id="punta" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="context-stroke"/></marker></defs>
        ${sc.pezzi.map((p, i) => `<g data-i="${i}">${p.svg}</g>`).join("")}</svg>`;
      svg = palco.querySelector("svg.scena");
    }
    sc.pezzi.forEach((p, i) => {
      const g = svg.querySelector(`g[data-i="${i}"]`);
      const visibile = n >= p.da && (p.a === undefined || n <= p.a);
      g.style.display = visibile ? "" : "none";
      g.classList.toggle("sc-nuovo", n === p.da);
    });
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
    } else if (tipo === "gelosia") {
      const s = passiGelosia(a, b);
      passi = s.passi;
      disegna = (palco, n) => { palco.innerHTML = svgGelosia(s.g, passi[n]); };
    } else if (tipo === "scena" || tipo === "sequenza") {
      const sc = tipo === "sequenza" ? scenaSequenza(anim) : SCENE[anim.scena]?.(anim);
      if (!sc || !sc.passi.length) return;
      passi = sc.passi.map((testo, i) => ({ testo, finale: i === sc.passi.length - 1 }));
      disegna = (palco, n) => disegnaScena(palco, sc, n);
    } else return;

    contenitore.innerHTML = `
      <div class="animazione${anim.video ? " video" : ""}">
        ${anim.video ? `<div class="video-titolo">🎬 Video guida${anim.titolo ? ": " + escapeHTML(anim.titolo) : ""}</div>` : ""}
        <div class="palco"></div>
        <div class="avanzamento"><span></span></div>
        <p class="didascalia" aria-live="polite"></p>
        <div class="comandi">
          <button class="btn" data-anim="play">▶ Guarda</button>
          ${tipo === "gelosia" || tipo === "moltiplicazione" ? '<button class="btn bianco" data-anim="tavola">📋 Tavola pitagorica</button>' : ""}
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
      contenitore.querySelector(".avanzamento span").style.width = `${(n / (passi.length - 1)) * 100}%`;
      didascalia.classList.remove("nuova"); void didascalia.offsetWidth; didascalia.classList.add("nuova");
      if (passi[n].finale) Suono.giusto();
      // Pause lunghe: i bambini hanno il tempo di guardare prima del passo successivo.
      if (parla && voce.checked) Voce.parla(passi[n].testo, () => { if (inCorso) timer = setTimeout(avanti, 1500); }, { scritte: false });
      else if (inCorso) timer = setTimeout(avanti, 4000);
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
      if (az === "tavola") apriTavola();
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

  /* ---------- Esercizio "gelosia": il bambino riempie la griglia ---------- */
  function esercizioGelosia(e, c, esito, intestazione) {
    const a = +e.a, b = +e.b;
    const g = calcolaGelosia(a, b);
    const sequenza = [];
    g.caselle.forEach((x, i) => {
      const aiuto = `Guarda la tavola pitagorica: ${g.B[x.r]} × ${g.A[x.c]} = ${x.p}.`;
      sequenza.push({ chiave: `c${i}d`, val: x.d, aiuto: aiuto + ` Sopra scrivo ${x.d}.`, casella: i }, { chiave: `c${i}u`, val: x.u, aiuto: aiuto + ` Sotto scrivo ${x.u}.`, casella: i });
    });
    g.diagonali.forEach((dg, k) => {
      if (k === g.diagonali.length - 1 && dg.cifra === 0) return; // lo 0 iniziale non si scrive
      const numeri = dg.pezzi.map((x) => x.v).concat(dg.riportoPrima ? [dg.riportoPrima] : []);
      sequenza.push({ chiave: `r${k}`, val: dg.cifra, aiuto: `Somma la diagonale: ${numeri.join(" + ")} = ${dg.somma}.`, diag: k });
    });
    c.innerHTML = intestazione + `<div class="colonna-es"><div class="colonna-posto gelosia-posto"></div>
      <div class="lato-tastierino"><div class="tastierino">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d) => `<button class="tasto" data-d="${d}">${d}</button>`).join("")}</div>
      <button class="btn bianco piccolo" data-tavola>📋 Tavola pitagorica</button></div></div>`;
    const posto = c.querySelector(".gelosia-posto");
    let k = 0;
    const disegna = () => {
      const at = sequenza[k];
      const casellePiene = at ? (at.casella !== undefined ? at.casella : g.caselle.length) : g.caselle.length;
      const diagFatte = at ? (at.diag !== undefined ? at.diag : 0) : g.diagonali.length;
      posto.innerHTML = svgGelosia(g, {
        caselle: casellePiene, diag: diagFatte, attiva: at?.casella, diagAttiva: at?.diag,
        chiedi: new Set(at ? [at.chiave] : []),
      });
      // cifra già scritta nella casella in corso (le decine prima delle unità)
      if (at?.chiave?.endsWith("u")) {
        const x = g.caselle[at.casella];
        const S = 92, X = 70 + x.c * S, Y = 56 + x.r * S;
        posto.querySelector("svg").insertAdjacentHTML("beforeend", `<text x="${X + S * 0.3}" y="${Y + S * 0.42}" class="g-cifra">${x.d}</text>`);
      }
    };
    disegna();
    c.addEventListener("click", (ev) => {
      if (ev.target.closest("[data-tavola]")) return apriTavola();
      const t = ev.target.closest(".tasto");
      if (!t || k >= sequenza.length) return;
      c.querySelectorAll(".tasto.sbagliata").forEach((x) => x.classList.remove("sbagliata"));
      if (+t.dataset.d === sequenza[k].val) {
        k++;
        disegna();
        if (k >= sequenza.length) esito.ok(); else Suono.giusto();
      } else { e.suggerimento = sequenza[k].aiuto; esito.ko(t); }
    });
  }

  window.Animazioni = { SCENE: Object.keys(SCENE), crea, esercizioCostruisci, esercizioEquivalenza, calcolaEquivalenza, esercizioLeggiTabella, leggiTabella, esercizioColonna, esercizioGelosia, passiMoltiplicazione, passiGelosia, apriTavola };
})();
