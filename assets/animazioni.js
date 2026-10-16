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

  function scenaCorpo() {
    const linea = (x1, y1, x2, y2) => `<path d="M${x1} ${y1} L${x2} ${y2}" class="sc-linea"/>`;
    const etichetta = (x, y, t) => `<text x="${x}" y="${y}" class="sc-parola">${t}</text>`;
    return {
      viewBox: "0 0 620 400",
      pezzi: [
        { da: 0, svg: `<rect x="0" y="0" width="620" height="400" class="sc-cielo"/>
          <path d="M258 135 L205 262 M362 135 L415 262 M287 275 L278 385 M333 275 L342 385" class="sc-arto"/>
          <rect x="296" y="105" width="28" height="24" rx="8" class="sc-pelle"/>
          <path d="M248 128 Q310 108 372 128 L384 272 Q310 294 236 272 Z" class="sc-pelle"/>
          <circle cx="310" cy="66" r="46" class="sc-pelle"/>` },
        { da: 1, svg: fig("🧠", 310, 62, 64) }, { da: 1, a: 1, svg: linea(355, 60, 455, 60) + etichetta(510, 68, "cervello") },
        { da: 2, svg: `<g class="sc-respira">${fig("🫁", 310, 168, 104)}</g>` }, { da: 2, a: 2, svg: linea(262, 168, 170, 168) + etichetta(115, 176, "polmoni") },
        { da: 3, svg: `<g class="sc-batte">${fig("🫀", 332, 182, 44)}</g>` }, { da: 3, a: 3, svg: linea(352, 182, 455, 182) + etichetta(500, 190, "cuore") },
        { da: 4, svg: `<path d="M298 214 C 300 200, 345 198, 348 216 C 350 236, 318 246, 304 236 C 296 230, 296 222, 298 214 Z" class="sc-stomaco"/>
          <path d="M276 252 q 12 -10 24 0 t 24 0 t 24 0 t 18 4 M282 266 q 12 -10 24 0 t 24 0 t 24 0" class="sc-intestino"/>` },
        { da: 4, a: 4, svg: linea(348, 222, 455, 222) + etichetta(510, 230, "stomaco") + linea(272, 258, 170, 258) + etichetta(110, 266, "intestino") },
        { da: 5, svg: `<path d="M210 250 L254 145 M410 250 L366 145 M281 378 L289 285 M339 378 L331 285" class="sc-osso"/>` },
        { da: 5, a: 5, svg: fig("🦴", 130, 330, 54) + etichetta(130, 378, "ossa") + fig("💪", 490, 330, 54) + etichetta(490, 378, "muscoli") },
        { da: 6, svg: etichetta(510, 68, "comanda") + etichetta(115, 176, "respira") + etichetta(500, 190, "batte")
          + etichetta(510, 230, "digerisce") + `<text x="310" y="392" class="sc-parola">Organi in squadra = apparati</text>` },
      ],
      passi: [
        "Ecco il corpo umano. Dentro ci sono tanti organi. Ogni organo ha un lavoro.",
        "Nella testa c'è il cervello. Il cervello comanda tutto il corpo.",
        "Nel petto ci sono i polmoni. Si gonfiano e prendono l'aria.",
        "Vicino ai polmoni c'è il cuore. Batte sempre e spinge il sangue in tutto il corpo.",
        "Nella pancia ci sono lo stomaco e l'intestino. Digeriscono il cibo.",
        "Le ossa ci tengono dritti. I muscoli tirano le ossa e ci fanno muovere.",
        "Gli organi lavorano in squadra. Una squadra di organi si chiama apparato.",
      ],
    };
  }

  // Le cellule disegnate (come assets/disegni/cellula.svg e cellula-vegetale.svg), in un quadrato 200×200.
  const CELLA_FORMA = "M100 16 C150 14 186 48 184 98 C182 150 146 186 98 184 C50 182 16 148 18 100 C20 52 52 18 100 16 Z";
  const CELLA = `<path d="M100 16 C150 14 186 48 184 98 C182 150 146 186 98 184 C50 182 16 148 18 100 C20 52 52 18 100 16 Z" fill="#FFD9E0" stroke="#E2667F" stroke-width="6"/><g transform="rotate(-30 56 68)"><ellipse cx="56" cy="68" rx="16" ry="9" fill="#F6A04D" stroke="#D97B22" stroke-width="2.5"/><path d="M44.8 68 q 3.7 -5.4 7.5 0 t 7.5 0 t 7.5 0" fill="none" stroke="#C0631A" stroke-width="1.8"/></g><g transform="rotate(25 62 142)"><ellipse cx="62" cy="142" rx="16" ry="9" fill="#F6A04D" stroke="#D97B22" stroke-width="2.5"/><path d="M50.8 142 q 3.7 -5.4 7.5 0 t 7.5 0 t 7.5 0" fill="none" stroke="#C0631A" stroke-width="1.8"/></g><g transform="rotate(-15 150 150)"><ellipse cx="150" cy="150" rx="16" ry="9" fill="#F6A04D" stroke="#D97B22" stroke-width="2.5"/><path d="M138.8 150 q 3.7 -5.4 7.5 0 t 7.5 0 t 7.5 0" fill="none" stroke="#C0631A" stroke-width="1.8"/></g><circle cx="142" cy="50" r="5" fill="#EE8FA6"/><circle cx="38" cy="106" r="5" fill="#EE8FA6"/><circle cx="104" cy="162" r="5" fill="#EE8FA6"/><circle cx="162" cy="104" r="5" fill="#EE8FA6"/><circle cx="108" cy="96" r="34" fill="#A98BF0" stroke="#6B4FC8" stroke-width="4"/><circle cx="118" cy="88" r="11" fill="#6B4FC8"/>`;
  const VEGETALE = `<rect x="10" y="14" width="180" height="172" rx="22" fill="#7CC46A" stroke="#3E8E3A" stroke-width="6"/><rect x="24" y="28" width="152" height="144" rx="14" fill="#DDF5C8" stroke="#5AAE4E" stroke-width="3"/><path d="M92 44 C140 36 166 56 164 100 C162 146 140 160 112 156 C88 152 84 128 88 104 C92 80 70 52 92 44 Z" fill="#A8E4EC" stroke="#4FB3C4" stroke-width="3"/><g transform="rotate(20 46 54)"><ellipse cx="46" cy="54" rx="13" ry="7" fill="#43A047" stroke="#1B5E20" stroke-width="2"/><path d="M39 52 h14 M39 56 h14" stroke="#A5D6A7" stroke-width="1.5"/></g><g transform="rotate(-70 40 92)"><ellipse cx="40" cy="92" rx="13" ry="7" fill="#43A047" stroke="#1B5E20" stroke-width="2"/><path d="M33 90 h14 M33 94 h14" stroke="#A5D6A7" stroke-width="1.5"/></g><g transform="rotate(0 100 164)"><ellipse cx="100" cy="164" rx="13" ry="7" fill="#43A047" stroke="#1B5E20" stroke-width="2"/><path d="M93 162 h14 M93 166 h14" stroke="#A5D6A7" stroke-width="1.5"/></g><g transform="rotate(-30 150 162)"><ellipse cx="150" cy="162" rx="13" ry="7" fill="#43A047" stroke="#1B5E20" stroke-width="2"/><path d="M143 160 h14 M143 164 h14" stroke="#A5D6A7" stroke-width="1.5"/></g><g transform="rotate(60 72 90)"><ellipse cx="72" cy="90" rx="13" ry="7" fill="#43A047" stroke="#1B5E20" stroke-width="2"/><path d="M65 88 h14 M65 92 h14" stroke="#A5D6A7" stroke-width="1.5"/></g><g transform="rotate(10 40 162)"><ellipse cx="40" cy="162" rx="9" ry="5" fill="#F6A04D" stroke="#D97B22" stroke-width="2.5"/><path d="M33.7 162 q 2.1 -3.0 4.2 0 t 4.2 0 t 4.2 0" fill="none" stroke="#C0631A" stroke-width="1.8"/></g><g transform="rotate(90 166 124)"><ellipse cx="166" cy="124" rx="9" ry="5" fill="#F6A04D" stroke="#D97B22" stroke-width="2.5"/><path d="M159.7 124 q 2.1 -3.0 4.2 0 t 4.2 0 t 4.2 0" fill="none" stroke="#C0631A" stroke-width="1.8"/></g><circle cx="58" cy="128" r="22" fill="#A98BF0" stroke="#6B4FC8" stroke-width="3.5"/><circle cx="64" cy="122" r="7" fill="#6B4FC8"/>`;
  const VACUOLO = "M92 44 C140 36 166 56 164 100 C162 146 140 160 112 156 C88 152 84 128 88 104 C92 80 70 52 92 44 Z";
  const cella = (x, y, s, extra = "", forma = CELLA) => `<g transform="translate(${x - 100 * s} ${y - 100 * s}) scale(${s})"><g ${extra}>${forma}</g></g>`;
  // Tessuto: tante cellule uguali, vicine vicine (a nido d'ape).
  const tessuto = (x, y, s) => {
    let g = "";
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) g += cella(x + (c - 1) * 150 * s + (r % 2 ? 75 * s : -40 * s), y + (r - 1) * 135 * s, s * 0.82);
    return g;
  };
  const linea = (x1, y1, x2, y2) => `<path d="M${x1} ${y1} L${x2} ${y2}" class="sc-linea"/>`;
  const parola = (x, y, t) => `<text x="${x}" y="${y}" class="sc-parola">${t}</text>`;
  const freccia = (x1, x2, y) => `<path d="M${x1} ${y} H${x2}" class="sc-freccia sequenza"/>`;
  const nucleo = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#A98BF0" stroke="#6B4FC8" stroke-width="${r / 8.5}"/><circle cx="${cx + r * 0.3}" cy="${cy - r * 0.24}" r="${r * 0.32}" fill="#6B4FC8"/>`;

  // Che cos'è la cellula: la foglia vista al microscopio è fatta di tanti "contenitori" (classe 4ª).
  function scenaFoglia() {
    let celle = "";
    for (let r = 0; r < 8; r++) for (let c = 0; c < 7; c++) {
      const x = 290 + c * 52 + (r % 2 ? 26 : 0), y = 40 + r * 42;
      celle += `<rect x="${x}" y="${y}" width="48" height="38" rx="12" class="sc-cellina"/><circle cx="${x + 15}" cy="${y + 13}" r="4" class="sc-cellina-nucleo"/>`;
    }
    return {
      viewBox: "0 0 620 400",
      pezzi: [
        { da: 0, svg: `<rect x="0" y="0" width="620" height="400" class="sc-cielo"/>` },
        { da: 0, a: 2, svg: `<path d="M40 330 C 40 200, 140 120, 250 115 C 250 245, 160 330, 40 330 Z" class="sc-foglia"/><path d="M52 320 C 110 260, 180 190, 242 124" class="sc-venatura"/>` },
        { da: 0, a: 0, svg: parola(150, 375, "una foglia") },
        { da: 1, a: 2, svg: `<path d="M185 205 L 330 60 L 330 330 Z" class="sc-cono"/><defs><clipPath id="sc-lente"><circle cx="450" cy="200" r="150"/></clipPath></defs>
          <g clip-path="url(#sc-lente)"><circle cx="450" cy="200" r="150" class="sc-lente-fondo"/>${celle}</g><circle cx="450" cy="200" r="150" class="sc-lente"/>` },
        { da: 1, a: 1, svg: parola(450, 385, "tanti piccoli contenitori") },
        { da: 2, a: 2, svg: `<rect x="420" y="166" width="48" height="38" rx="12" class="sc-scelta sc-gonfia"/>` + parola(450, 385, "ognuno è una cellula") },
        { da: 3, svg: `<g class="sc-entra">${cella(170, 175, 1.05)}</g><g class="sc-entra" style="animation-delay:.5s">${cella(450, 175, 1.05, "", VEGETALE)}</g>`
          + parola(170, 335, "cellula animale") + parola(450, 335, "cellula vegetale") },
      ],
      passi: [
        "Immagina di avere una vista speciale. Guardiamo questa foglia.",
        "Con il microscopio la foglia diventa grandissima. È fatta di tanti piccoli contenitori, uno vicino all'altro.",
        "Ognuno di questi contenitori è una cellula. La cellula è la parte più piccola che è viva: cresce, si nutre e respira.",
        "Ci sono due tipi di cellula: la cellula animale e la cellula vegetale.",
      ],
    };
  }

  // La cellula animale: membrana, citoplasma, nucleo, mitocondri.
  function scenaCellula() {
    const S = 1.7, X = 170, Y = 30; // la cellula grande va da x 170 a 510
    const p = (cx, cy) => [X + cx * S, Y + cy * S];
    const [mx, my] = p(18, 100), [cx, cy] = p(62, 152), [nx, ny] = p(130, 70), [ox, oy] = p(158, 156);
    const alone = (x, y, r) => { const [a, b] = p(x, y); return `<circle cx="${a}" cy="${b}" r="${r * S}" class="sc-alone"/>`; };
    return {
      viewBox: "0 0 620 400",
      pezzi: [
        { da: 0, svg: `<rect x="0" y="0" width="620" height="400" class="sc-cielo"/>` },
        { da: 0, a: 4, svg: cella(340, 200, S) },
        { da: 0, a: 0, svg: fig("🔬", 540, 310, 90) + parola(530, 380, "microscopio") },
        { da: 1, a: 1, svg: `<path d="${CELLA_FORMA}" transform="translate(${X} ${Y}) scale(${S})" class="sc-evidenzia"/>` },
        { da: 1, a: 4, svg: linea(mx - 4, my - 6, 120, 150) + parola(78, 140, "membrana") },
        { da: 2, a: 2, svg: `<g transform="translate(${X} ${Y}) scale(${S})"><path d="${CELLA_FORMA}" class="sc-gelatina"/>${nucleo(108, 96, 34)}</g>` },
        { da: 2, a: 4, svg: linea(cx - 10, cy + 8, 150, 318) + parola(80, 330, "citoplasma") },
        { da: 3, a: 3, svg: alone(108, 96, 40) + `<g transform="translate(${X} ${Y}) scale(${S})">${nucleo(108, 96, 34)}</g>` },
        { da: 3, a: 4, svg: linea(nx + 8, ny - 8, 520, 100) + parola(560, 90, "nucleo") },
        { da: 4, a: 4, svg: alone(56, 68, 20) + alone(62, 142, 20) + alone(150, 150, 20) + `<g transform="translate(${X} ${Y}) scale(${S})"><g transform="rotate(-30 56 68)"><ellipse cx="56" cy="68" rx="16" ry="9" fill="#F6A04D" stroke="#D97B22" stroke-width="2.5"/><path d="M44.8 68 q 3.7 -5.4 7.5 0 t 7.5 0 t 7.5 0" fill="none" stroke="#C0631A" stroke-width="1.8"/></g><g transform="rotate(25 62 142)"><ellipse cx="62" cy="142" rx="16" ry="9" fill="#F6A04D" stroke="#D97B22" stroke-width="2.5"/><path d="M50.8 142 q 3.7 -5.4 7.5 0 t 7.5 0 t 7.5 0" fill="none" stroke="#C0631A" stroke-width="1.8"/></g><g transform="rotate(-15 150 150)"><ellipse cx="150" cy="150" rx="16" ry="9" fill="#F6A04D" stroke="#D97B22" stroke-width="2.5"/><path d="M138.8 150 q 3.7 -5.4 7.5 0 t 7.5 0 t 7.5 0" fill="none" stroke="#C0631A" stroke-width="1.8"/></g></g>` },
        { da: 4, a: 4, svg: linea(ox, oy, 515, 318) + parola(555, 340, "mitocondri") },
        { da: 5, svg: `<g class="sc-entra">${cella(190, 190, 1.05)}</g><g class="sc-entra" style="animation-delay:.5s">${cella(430, 190, 1.05)}</g>`
          + `<path d="M300 190 H322" class="sc-freccia sequenza"/>` + parola(310, 370, "una cellula si divide in due") },
      ],
      passi: [
        "Questa è una cellula animale. È piccolissima: la vediamo solo con il microscopio.",
        "Intorno c'è la membrana cellulare. È uno strato sottile: da qui entrano ed escono le sostanze.",
        "Dentro c'è il citoplasma. È morbido, come una gelatina, e riempie la cellula.",
        "Al centro c'è il nucleo. È il centro di controllo: comanda tutta la cellula.",
        "Nel citoplasma ci sono i mitocondri. Producono l'energia per la cellula.",
        "La cellula è viva: si nutre e cresce. Poi si divide in due cellule nuove!",
      ],
    };
  }

  // La cellula vegetale: le stesse parti, più parete cellulare, vacuolo e cloroplasti.
  function scenaCellulaVegetale() {
    const S = 1.7, X = 140, Y = 30;
    const p = (x, y) => [X + x * S, Y + y * S];
    const dentro = (svg) => `<g transform="translate(${X} ${Y}) scale(${S})">${svg}</g>`;
    const [a1, b1] = p(24, 40), [a2, b2] = p(64, 74), [a3, b3] = p(44, 140), [a4, b4] = p(188, 40), [a5, b5] = p(150, 96), [a6, b6] = p(150, 166);
    return {
      viewBox: "0 0 620 400",
      pezzi: [
        { da: 0, svg: `<rect x="0" y="0" width="620" height="400" class="sc-cielo"/>` + dentro(VEGETALE) },
        { da: 0, svg: linea(a1, b1, 118, 72) + parola(68, 66, "membrana") + linea(a2, b2, 128, 186) + parola(68, 196, "citoplasma") + linea(a3, b3, 112, 318) + parola(64, 330, "nucleo") },
        { da: 1, a: 1, svg: dentro(`<rect x="10" y="14" width="180" height="172" rx="22" class="sc-evidenzia"/>`) },
        { da: 1, svg: linea(a4, b4, 512, 70) + parola(560, 66, "parete") },
        { da: 2, a: 2, svg: dentro(`<path d="${VACUOLO}" class="sc-acqua"/>`) },
        { da: 2, svg: linea(a5, b5, 505, 190) + parola(558, 196, "vacuolo") },
        { da: 3, a: 3, svg: [[46, 54], [40, 92], [100, 164], [150, 162], [72, 90]].map(([x, y]) => { const [u, v] = p(x, y); return `<circle cx="${u}" cy="${v}" r="${18 * S}" class="sc-alone"/>`; }).join("") + dentro(`<g transform="rotate(20 46 54)"><ellipse cx="46" cy="54" rx="13" ry="7" fill="#43A047" stroke="#1B5E20" stroke-width="2"/><path d="M39 52 h14 M39 56 h14" stroke="#A5D6A7" stroke-width="1.5"/></g><g transform="rotate(-70 40 92)"><ellipse cx="40" cy="92" rx="13" ry="7" fill="#43A047" stroke="#1B5E20" stroke-width="2"/><path d="M33 90 h14 M33 94 h14" stroke="#A5D6A7" stroke-width="1.5"/></g><g transform="rotate(0 100 164)"><ellipse cx="100" cy="164" rx="13" ry="7" fill="#43A047" stroke="#1B5E20" stroke-width="2"/><path d="M93 162 h14 M93 166 h14" stroke="#A5D6A7" stroke-width="1.5"/></g><g transform="rotate(-30 150 162)"><ellipse cx="150" cy="162" rx="13" ry="7" fill="#43A047" stroke="#1B5E20" stroke-width="2"/><path d="M143 160 h14 M143 164 h14" stroke="#A5D6A7" stroke-width="1.5"/></g><g transform="rotate(60 72 90)"><ellipse cx="72" cy="90" rx="13" ry="7" fill="#43A047" stroke="#1B5E20" stroke-width="2"/><path d="M65 88 h14 M65 92 h14" stroke="#A5D6A7" stroke-width="1.5"/></g>`) },
        { da: 3, svg: linea(a6, b6, 500, 330) + parola(555, 345, "cloroplasti") },
      ],
      passi: [
        "Questa è una cellula vegetale. Ha le stesse parti della cellula animale: membrana, citoplasma, nucleo e mitocondri.",
        "In più ha la parete cellulare. È uno strato rigido, fuori dalla membrana: dà la forma e sostiene la cellula.",
        "Ha anche il vacuolo. È un grande serbatoio: tiene l'acqua e aiuta la cellula a mantenere la sua forma.",
        "E poi ci sono i cloroplasti, verdi. Con la luce del sole fanno la fotosintesi: preparano il cibo della pianta.",
      ],
    };
  }

  // Dalla cellula all'apparato, con i disegni (classe 5ª).
  function scenaDallaCellula() {
    return {
      viewBox: "0 0 620 400",
      pezzi: [
        { da: 0, svg: `<rect x="0" y="0" width="620" height="400" class="sc-cielo"/>` },
        { da: 0, a: 0, svg: `<g class="sc-entra">${cella(310, 180, 1.2)}</g>` + parola(310, 365, "una cellula") },
        { da: 1, a: 1, svg: cella(110, 190, 0.6) + parola(110, 320, "cellula") + freccia(200, 250, 190)
          + `<g class="sc-entra">${tessuto(440, 190, 0.5)}</g>` + parola(440, 360, "tessuto") },
        { da: 2, a: 2, svg: tessuto(140, 190, 0.4) + parola(140, 340, "tessuto") + freccia(270, 330, 190)
          + `<g class="sc-entra sc-batte">${fig("🫀", 460, 185, 170)}</g>` + parola(460, 340, "organo: il cuore") },
        { da: 3, svg: `<g class="sc-entra">${fig("🧠", 80, 180, 100)}</g><g class="sc-entra" style="animation-delay:.3s">${fig("🫁", 195, 180, 100)}</g><g class="sc-entra" style="animation-delay:.6s">${fig("🫀", 310, 180, 100)}</g>`
          + parola(195, 300, "organi") + freccia(375, 425, 180) + `<g class="sc-entra" style="animation-delay:1s">${fig("🤝", 520, 180, 120)}</g>` + parola(520, 300, "apparato") },
      ],
      passi: [
        "Il nostro corpo è fatto di tantissime cellule piccolissime.",
        "Tante cellule uguali, vicine vicine, formano un tessuto.",
        "Tanti tessuti insieme formano un organo, per esempio il cuore.",
        "Gli organi lavorano in squadra: formano un apparato.",
      ],
    };
  }

  function scenaSeme() {
    let gocce = "";
    for (let k = 0; k < 8; k++) gocce += `<line x1="${250 + k * 17}" y1="${60 + (k % 3) * 12}" x2="${247 + k * 17}" y2="${76 + (k % 3) * 12}" class="sc-pioggia" style="animation-delay:-${(k * 0.21).toFixed(2)}s"/>`;
    return {
      viewBox: "0 0 620 360",
      pezzi: [
        { da: 0, svg: `<rect x="0" y="0" width="620" height="360" class="sc-cielo"/><rect x="0" y="228" width="620" height="132" class="sc-terra"/><rect x="0" y="222" width="620" height="12" rx="6" class="sc-prato"/>` },
        { da: 0, a: 1, svg: fig("🫘", 310, 282, 46) },
        { da: 0, a: 0, svg: `<text x="400" y="290" class="sc-parola">seme</text>` },
        { da: 1, a: 1, svg: gocce + fig("💧", 470, 120, 44) + `<text x="470" y="180" class="sc-parola">acqua</text>` },
        { da: 2, svg: `<path d="M310 292 C 304 315, 318 332, 306 352" pathLength="100" class="sc-radici sc-cresce"/>
          <path d="M309 312 q -22 8 -34 26 M311 326 q 20 6 30 22" pathLength="100" class="sc-radici sc-cresce lenta"/>` },
        { da: 2, svg: fig("🫘", 310, 282, 54, 'class="sc-gonfia"') },
        { da: 2, a: 2, svg: `<text x="400" y="340" class="sc-parola">radice</text>` },
        { da: 3, svg: `<path d="M310 268 C 298 230, 322 180, 310 135" pathLength="100" class="sc-fusto sc-cresce"/>` + fig("☀️", 80, 70, 90) },
        { da: 3, a: 3, svg: `<text x="400" y="190" class="sc-parola">fusto</text><path d="M115 95 L 230 140 M120 120 L 250 190" class="sc-raggio"/>` },
        { da: 4, svg: `<g class="sc-entra"><path d="M310 150 C 260 140, 235 110, 242 92 C 278 92, 300 118, 310 150 Z" class="sc-foglia"/>
          <path d="M310 150 C 360 140, 385 110, 378 92 C 342 92, 320 118, 310 150 Z" class="sc-foglia"/></g>` },
        { da: 4, a: 4, svg: `<text x="440" y="120" class="sc-parola">foglie</text>` },
        { da: 5, svg: `<g class="sc-entra">${fig("🌸", 310, 112, 64)}</g><g class="sc-entra" style="animation-delay:.6s">${fig("🫛", 340, 205, 44)}</g>` },
        { da: 5, a: 5, svg: `<text x="200" y="110" class="sc-parola">fiore</text><text x="470" y="210" class="sc-parola">frutto</text>` },
        { da: 6, a: 6, svg: `<rect x="20" y="245" width="580" height="100" rx="18" class="sc-riquadro"/>
          ${[["💧", "acqua"], ["☀️", "luce"], ["🌬️", "aria"], ["", "terra"]].map(([e, t], i) => `<g class="sc-entra" style="animation-delay:${i * 0.35}s">${e ? fig(e, 95 + i * 145, 282, 46) : `<path d="M${55 + i * 145} 300 Q ${95 + i * 145} 250 ${135 + i * 145} 300 Z" class="sc-terra"/>`}<text x="${95 + i * 145}" y="334" class="sc-etichetta">${t}</text></g>`).join("")}` },
      ],
      passi: [
        "Questo è un seme di fagiolo. Dentro dorme una piccola pianta.",
        "Mettiamo il seme nella terra e gli diamo l'acqua.",
        "Il seme beve, si gonfia e si apre. Esce la radice: va giù, nella terra.",
        "Poi esce il fusto: va su, verso la luce del sole.",
        "Spuntano le prime foglie. È nata una piantina!",
        "La pianta cresce e fa i fiori. Dal fiore nasce il frutto. Dentro ci sono semi nuovi!",
        "Per crescere, la pianta ha bisogno di acqua, luce, aria e terra.",
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
      r.textContent = col === i1 ? testo.replace(/\B(?=(\d{3})+(?!\d))/g, " ") : "?";
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

  /* ---------- Numeri decimali: tabella h da u , d c m (classe 5ª) ----------
     Un numero è { D: cifre senza virgola, p: quante cifre stanno prima della virgola }.
     × 10, 100, 1000: le cifre si spostano verso sinistra; : 10, 100, 1000 verso destra.
     La virgola resta ferma in mezzo alla tabella, come sul quaderno. */
  const COLD = [
    { s: "h", nome: "centinaia", c: "#2FA35B" },
    { s: "da", nome: "decine", c: "#E0533D" },
    { s: "u", nome: "unità", c: "#3D6BE0" },
    { s: "d", nome: "decimi", c: "#8B5CF6" },
    { s: "c", nome: "centesimi", c: "#F08A24" },
    { s: "m", nome: "millesimi", c: "#14A3A3" }];
  const XD = (i) => (i < 3 ? 60 + i * 100 : 100 + i * 100);
  function leggiDecimale(n) {
    const t = String(n).trim().replace(".", ",");
    if (!/^\d+(,\d+)?$/.test(t)) return null;
    const [int, dec = ""] = t.split(",");
    return { D: int + dec, p: int.length };
  }
  function spostaDecimale(x, k) {
    let { D, p } = x;
    for (; k > 0; k--) { p++; if (p > D.length) D += "0"; }
    for (; k < 0; k++) { p--; if (p < 1) { D = "0" + D; p = 1; } }
    return { D, p };
  }
  function partiDecimale(x) {
    const int = x.D.slice(0, x.p).replace(/^0+(?=\d)/, ""), dec = x.D.slice(x.p).replace(/0+$/, "");
    return { int, dec, testo: int + (dec ? "," + dec : "") };
  }
  // Cifre nelle 6 caselle (null se il numero non entra nella tabella).
  function cifreDecimale(x) {
    const { int, dec } = partiDecimale(x);
    if (int.length > 3 || dec.length > 3) return null;
    const cifre = Array(6).fill("");
    [...int].forEach((ch, k) => { cifre[3 - int.length + k] = ch; });
    [...dec].forEach((ch, k) => { cifre[3 + k] = ch; });
    return cifre;
  }
  const PASSI_PER = { 10: 1, 100: 2, 1000: 3 };
  // "x" = per, ":" = diviso. Restituisce null se l'operazione non è valida o il risultato non entra.
  function calcolaVirgola(n, op, per) {
    const x = leggiDecimale(n), k = PASSI_PER[per];
    if (!x || !k || !["x", ":"].includes(op) || !cifreDecimale(x)) return null;
    const y = spostaDecimale(x, op === "x" ? k : -k);
    return cifreDecimale(y) ? partiDecimale(y).testo : null;
  }
  function tabellaDecSVG({ cifre = [], evid = [], nuove = {}, fantasmi = [], cliccabile = false } = {}) {
    let svg = `<rect x="10" y="6" width="300" height="28" rx="8" class="t6-classe semplici"/><text x="160" y="26" class="t6-classe-t">PARTE INTERA</text>
      <rect x="350" y="6" width="300" height="28" rx="8" class="t6-classe"/><text x="500" y="26" class="t6-classe-t">PARTE DECIMALE</text>`;
    COLD.forEach((x, i) => {
      const acc = evid.includes(i);
      svg += `<g ${cliccabile ? `data-col="${i}" class="t6-col"` : ""}>
        <rect x="${XD(i) - 48}" y="40" width="96" height="50" rx="10" fill="${x.c}" opacity="${acc ? 1 : .22}"/>
        <text x="${XD(i)}" y="74" class="t6-sigla" fill="${acc ? "#fff" : x.c}">${x.s}</text>
        <rect x="${XD(i) - 48}" y="96" width="96" height="84" rx="10" class="t6-casella ${acc ? "accesa" : ""}" ${acc ? `stroke="${x.c}"` : ""}/></g>`;
    });
    fantasmi.forEach((ch, i) => { if (ch) svg += `<text x="${XD(i)}" y="160" class="t6-cifra spenta">${ch}</text>`; });
    cifre.forEach((ch, i) => {
      if (!ch) return;
      const nv = nuove[i];
      svg += nv === undefined ? `<text x="${XD(i)}" y="160" class="t6-cifra">${ch}</text>`
        : `<text x="${XD(i)}" y="160" class="t6-cifra dec-scivola ${nv === 0 ? "dec-zero" : ""}" style="--dx:${XD(i + nv) - XD(i)}px">${ch}</text>`;
    });
    return svg + `<text x="330" y="166" class="t6-virgola">,</text>`;
  }
  function scenaDecimali(anim) {
    const x = leggiDecimale(anim.n ?? "2,35") || leggiDecimale("2,35");
    const cifre = cifreDecimale(x) || cifreDecimale(leggiDecimale("2,35"));
    const { int, dec, testo } = partiDecimale(x);
    const pezzi = [], passi = [];
    const passo = (svg, frase) => { pezzi.push({ da: pezzi.length, a: pezzi.length, svg }); passi.push(frase); };
    passo(tabellaDecSVG(), "Ecco la tabella dei numeri decimali. A sinistra c'è la parte intera, a destra la parte decimale. In mezzo c'è la virgola.");
    passo(tabellaDecSVG({ cifre }), `Scrivo il numero ${testo}. Le cifre prima della virgola sono la parte intera. Quelle dopo la virgola sono la parte decimale.`);
    const iInt = cifre.map((ch, i) => (ch && i < 3 ? i : -1)).filter((i) => i >= 0);
    passo(tabellaDecSVG({ cifre, evid: iInt }) + `<text x="160" y="232" class="t6-leggo">${int} ${int === "1" ? "intero" : "interi"}</text>`, `La parte intera è ${int}.`);
    [...dec].forEach((ch, k) => {
      const i = 3 + k, U = COLD[i];
      const spiega = ["Un decimo è una parte dell'intero diviso in 10.", "Un centesimo è una parte dell'intero diviso in 100.", "Un millesimo è una parte dell'intero diviso in 1000."][k];
      passo(tabellaDecSVG({ cifre, evid: [i] }) + `<text x="${XD(i)}" y="232" class="t6-leggo">${ch} ${U.s}</text>`, `Il ${ch} è nei ${U.nome}: vale ${ch} ${U.nome}. ${spiega}`);
    });
    const righe = [];
    (anim.operazioni || []).forEach((o) => {
      const m = /^([x:])(10|100|1000)$/.exec(String(o).replace("×", "x").replace("÷", ":"));
      if (!m) return;
      const op = m[1], per = +m[2], k = PASSI_PER[per];
      const y = spostaDecimale(x, op === "x" ? k : -k), dopo = cifreDecimale(y);
      if (!dopo) return;
      const ris = partiDecimale(y).testo, segno = op === "x" ? "×" : ":";
      // Le cifre del numero si spostano di k posti; quelle nuove sono zeri.
      const sh = op === "x" ? -k : k, nuove = {};
      dopo.forEach((ch, i) => { if (ch) nuove[i] = cifre[i - sh] ? -sh : 0; });
      const riga = `${testo} ${segno} ${per} = ${ris}`; righe.push(riga);
      const verso = op === "x" ? "a sinistra" : "a destra", posti = k === 1 ? "1 posto" : `${k} posti`;
      passo(tabellaDecSVG({ cifre: dopo, nuove, fantasmi: cifre }) + `<text x="330" y="232" class="t6-leggo">${riga}</text>`,
        `${op === "x" ? "Moltiplico" : "Divido"} per ${per}: le cifre si spostano di ${posti} ${verso}. ${riga}.`
        + (Object.values(nuove).includes(0) ? " Dove resta una casella vuota scrivo lo zero." : ""));
    });
    if (righe.length > 1) passo(tabellaDecSVG({ cifre }) + righe.map((r, k) => `<text x="${k % 2 ? 490 : 170}" y="${222 + Math.floor(k / 2) * 34}" class="t6-riga">${r}</text>`).join(""),
      "Per 10, 100, 1000 le cifre vanno a sinistra: il numero diventa più grande. Diviso 10, 100, 1000 vanno a destra: il numero diventa più piccolo.");
    return { viewBox: "0 0 660 270", pezzi, passi };
  }

  /* ---------- Esercizio "virgola": sposto le cifre nella tabella per × o : 10, 100, 1000 ---------- */
  function esercizioVirgola(e, c, esito, intestazione) {
    const x0 = leggiDecimale(e.n), per = +e.per, segno = e.op === "x" ? "×" : ":", k = PASSI_PER[per];
    const ris = calcolaVirgola(e.n, e.op, per), start = partiDecimale(x0).testo;
    let x = x0, mosse = 0;
    c.innerHTML = intestazione + `<div class="equivalenza">
      <div class="eq-domanda">${start} ${segno} ${per} = <b class="eq-ris">?</b></div>
      <svg viewBox="0 0 660 200" class="eq-tabella dec-tabella"></svg>
      <p class="eq-aiuto">× 10, 100, 1000: le cifre vanno a ⬅️ sinistra · : 10, 100, 1000: le cifre vanno a destra ➡️</p>
      <p class="dec-mosse"></p>
      <div class="costruisci-tasti">
        <button class="btn bianco" data-q="s">⬅️ Cifre a sinistra</button>
        <button class="btn bianco" data-q="d">Cifre a destra ➡️</button>
        <button class="btn verde" data-q="ok">✔ Ho finito</button>
      </div></div>`;
    const svg = c.querySelector(".dec-tabella"), r = c.querySelector(".eq-ris"), m = c.querySelector(".dec-mosse");
    const disegna = (nuove = {}) => {
      svg.innerHTML = tabellaDecSVG({ cifre: cifreDecimale(x), nuove });
      const t = partiDecimale(x).testo;
      r.textContent = mosse ? t : "?";
      m.textContent = mosse ? `Hai spostato le cifre di ${Math.abs(mosse)} ${Math.abs(mosse) === 1 ? "posto" : "posti"} ${mosse > 0 ? "a sinistra" : "a destra"}.` : "Tocca le frecce per spostare le cifre.";
    };
    disegna();
    c.addEventListener("click", (ev) => {
      const b = ev.target.closest("[data-q]");
      if (!b || c.classList.contains("risolto") || c.closest(".risolto")) return;
      const q = b.dataset.q;
      if (q === "s" || q === "d") {
        const dir = q === "s" ? 1 : -1, y = spostaDecimale(x, dir);
        if (!cifreDecimale(y)) { Voce.parla("Non c'è più posto nella tabella.", null, { scritte: false }); return; }
        const prima = cifreDecimale(x), dopo = cifreDecimale(y), nuove = {};
        dopo.forEach((ch, i) => { if (ch) nuove[i] = prima[i + dir] ? dir : 0; });
        x = y; mosse += dir; Suono?.clic?.(); disegna(nuove); return;
      }
      if (partiDecimale(x).testo === ris) { r.textContent = ris; esito.ok(); }
      else {
        e.suggerimento = `${segno === "×" ? "Per" : "Diviso"} ${per}: sposta le cifre di ${k} ${k === 1 ? "posto" : "posti"} ${e.op === "x" ? "a sinistra" : "a destra"}.`;
        esito.ko(b);
      }
    });
  }

  /* ---------- Addizione in colonna con i cubetti (2ª: senza e con cambio) ---------- */
  const S = 11; // cubetto piccolo
  function decinaPiccola(x, y, cls = "") {
    let r = `<g class="${cls}"><rect x="${x - 2}" y="${y - 2}" width="${S + 4}" height="${S * 10 + 4}" rx="4" class="decina-bordo"/>`;
    for (let k = 0; k < 10; k++) r += `<rect x="${x}" y="${y + k * S}" width="${S}" height="${S}" rx="2" class="cubo cubo-d"/>`;
    return r + "</g>";
  }
  // Cubetti delle unità: 5 per fila, dal basso (così 10 unità sono due file piene).
  const unitaPiccole = (u, y, da = 0) => Array.from({ length: u - da }, (_, i) => {
    const k = i + da;
    return `<rect x="${250 + (k % 5) * 16}" y="${y + S * 9 - Math.floor(k / 5) * 16}" width="${S}" height="${S}" rx="2" class="cubo cubo-u"/>`;
  }).join("");
  const decinePiccole = (n, y, da = 0, cls = "") => Array.from({ length: n - da }, (_, i) => decinaPiccola(30 + (i + da) * 19, y, cls)).join("");
  // Le parti di una somma, senza gli zeri: [1, 2, 0] -> "1 + 2".
  const sommaTesto = (xs) => xs.filter((x) => x).join(" + ");

  function scenaAddizione(anim) {
    const a = +anim.a, b = +anim.b, s = a + b;
    const da = Math.floor(a / 10), ua = a % 10, db = Math.floor(b / 10), ub = b % 10;
    const su = ua + ub, rip = su >= 10 ? 1 : 0, sd = da + db + rip;
    const Y = { a: 30, b: 160, r: 300 }, T = { a: 107, b: 237, r: 377 };
    const X = { s: 520, d: 610, u: 700 };
    const cifra = (x, y, t, cls = "") => `<text x="${x}" y="${y}" class="add-cifra ${cls}">${t}</text>`;
    const colonna = (x, cls = "add-evid") => `<rect x="${x - 40}" y="${Y.a + 20}" width="80" height="${T.r - Y.a + 2}" rx="14" class="${cls}"/>`;
    const pezzi = [], passi = [];
    let k = 0;
    // Passo 0: i due numeri, in colonna e con i cubetti.
    pezzi.push({ da: 0, svg: `<text x="${X.d}" y="24" class="add-testa cifra-d">da</text><text x="${X.u}" y="24" class="add-testa cifra-u">u</text>
      <line x1="20" y1="285" x2="790" y2="285" class="add-linea"/><line x1="430" y1="10" x2="430" y2="410" class="add-separa"/>
      ${cifra(X.d, T.a, da || "", "cifra-d")}${cifra(X.u, T.a, ua, "cifra-u")}
      ${cifra(X.s, T.b, "+", "segno")}${cifra(X.d, T.b, db || "", "cifra-d")}${cifra(X.u, T.b, ub, "cifra-u")}
      ${decinePiccole(da, Y.a)}${unitaPiccole(ua, Y.a)}${decinePiccole(db, Y.b)}${unitaPiccole(ub, Y.b)}` });
    passi.push(`Calcoliamo ${a} + ${b}. Le decine sotto le decine, le unità sotto le unità.`);
    // Unità.
    k++;
    pezzi.unshift({ da: k, a: k + rip, svg: colonna(X.u) + `<rect x="240" y="${Y.a}" width="90" height="250" rx="12" class="add-evid"/>` });
    if (rip) {
      pezzi.push({ da: k, a: k, svg: unitaPiccole(su, Y.r) + `<rect x="244" y="${Y.r + S * 9 - 20}" width="88" height="36" rx="8" class="add-gruppo"/>` });
      passi.push(`Si parte dalle unità: ${ua} + ${ub} = ${su}. C'è il cambio!`);
      k++;
      pezzi.push({ da: k, svg: decinaPiccola(30 + (da + db) * 19, Y.r, "decina-cambio") + unitaPiccole(su, Y.r, 10)
        + cifra(X.u, T.r, su - 10, "cifra-u") + `<text x="${X.d}" y="56" class="add-riporto">1</text>` });
      const xb = 30 + (da + db) * 19 + S + 12;
      pezzi.push({ da: k, a: k, svg: `<path d="M242 ${Y.r + 80} C 200 ${Y.r + 80}, ${xb + 40} ${Y.r + 60}, ${xb} ${Y.r + 60}" class="add-freccia"/>
        <text x="320" y="${Y.r + 45}" class="add-nota">10 unità = 1 decina</text>` });
      passi.push(`10 unità fanno 1 decina! Scrivo ${su - 10} sotto le unità e porto 1 sopra le decine.`);
    } else {
      pezzi.push({ da: k, svg: unitaPiccole(su, Y.r) + cifra(X.u, T.r, su, "cifra-u") });
      passi.push(`Si parte dalle unità: ${ua} + ${ub} = ${su}. Scrivo ${su} sotto le unità.`);
    }
    // Decine.
    if (sd) {
      k++;
      pezzi.unshift({ da: k, a: k, svg: colonna(X.d) + `<rect x="20" y="${Y.a}" width="210" height="250" rx="12" class="add-evid"/>` });
      pezzi.push({ da: k, svg: decinePiccole(da + db, Y.r) + cifra(X.d, T.r, sd, "cifra-d") });
      const parti = [rip, da, db].filter((x) => x);
      passi.push(parti.length < 2 ? `Ora le decine: c'è solo ${sd}. Scrivo ${sd}.`
        : `Ora le decine${rip ? ", con il riporto" : ""}: ${sommaTesto([rip, da, db])} = ${sd}. Scrivo ${sd}.`);
    }
    // Fine.
    k++;
    pezzi.unshift({ da: k, svg: `<rect x="${X.d - 40}" y="${Y.r + 10}" width="170" height="90" rx="14" class="add-fine"/>` });
    passi.push(`${a} + ${b} = ${s}. Fatto!`);
    return { viewBox: "0 0 800 420", pezzi, passi };
  }

  /* ---------- Esercizio "addizione": il bambino scrive il risultato in colonna ---------- */
  function esercizioAddizione(e, c, esito, intestazione) {
    const a = +e.a, b = +e.b;
    const da = Math.floor(a / 10), ua = a % 10, db = Math.floor(b / 10), ub = b % 10;
    const rip = ua + ub >= 10 ? 1 : 0, sd = da + db + rip;
    const el = document.createElement("div");
    el.className = "colonna-griglia";
    el.style.gridTemplateColumns = "repeat(3, 1fr)";
    const celle = {};
    const cella = (k, cls = "", t = "") => { const x = document.createElement("div"); x.className = "cella " + cls; x.textContent = t; celle[k] = x; el.append(x); };
    cella("t-s", "intesta"); cella("t-d", "intesta cifra-d", "da"); cella("t-u", "intesta cifra-u", "u");
    cella("rip-s", "riporto"); cella("rip-d", "riporto"); cella("rip-u", "riporto");
    cella("a-s"); cella("a-d", "cifra-d", da || ""); cella("a-u", "cifra-u", ua);
    cella("b-s", "segno", "+"); cella("b-d", "cifra-d", db || ""); cella("b-u", "cifra-u", ub);
    const l = document.createElement("div"); l.className = "colonna-linea"; l.style.gridColumn = "1 / span 3"; el.append(l);
    cella("r-s"); cella("r-d", "cifra-d"); cella("r-u", "cifra-u");
    const sequenza = [{ cella: "r-u", val: (ua + ub) % 10, evid: ["a-u", "b-u"], aiuto: `Somma le unità: ${ua} + ${ub}.` }];
    if (sd) sequenza.push({ cella: "r-d", val: sd, evid: ["rip-d", "a-d", "b-d"],
      aiuto: rip ? `Somma le decine e il riporto: ${sommaTesto([1, da, db])}.` : `Somma le decine: ${sommaTesto([da, db]) || 0}.` });
    c.innerHTML = intestazione + `<div class="colonna-es"><div class="colonna-posto"></div>
      <div class="tastierino">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d) => `<button class="tasto" data-d="${d}">${d}</button>`).join("")}</div></div>`;
    c.querySelector(".colonna-posto").append(el);
    let k = 0;
    const prepara = () => {
      Object.values(celle).forEach((x) => x.classList.remove("attiva", "evid"));
      const at = sequenza[k];
      if (!at) return;
      celle[at.cella].classList.add("attiva");
      at.evid.forEach((x) => { if (celle[x].textContent) celle[x].classList.add("evid"); });
    };
    prepara();
    c.addEventListener("click", (ev) => {
      const t = ev.target.closest(".tasto");
      if (!t || k >= sequenza.length) return;
      c.querySelectorAll(".tasto.sbagliata").forEach((x) => x.classList.remove("sbagliata"));
      const at = sequenza[k];
      if (+t.dataset.d !== at.val) { e.suggerimento = at.aiuto; return esito.ko(t); }
      const x = celle[at.cella];
      x.textContent = at.val; x.classList.add("nuova");
      esito.bene?.(t);
      if (at.cella === "r-u" && rip) {
        celle["rip-d"].textContent = "1"; celle["rip-d"].classList.add("nuova");
        Voce.parla("10 unità fanno 1 decina: porto 1!", null, { scritte: false });
      }
      k++;
      prepara();
      if (k >= sequenza.length) {
        el.classList.add("finita");
        ["r-d", "r-u"].forEach((y) => { if (celle[y].textContent) celle[y].classList.add("evid"); });
        esito.ok();
      } else Suono.giusto();
    });
  }

  /* ---------- Frazioni: pizza o tavoletta di cioccolata divisa in parti uguali ----------
     Le parti prese sono rosse (con il salame, sulla pizza); quelle che restano, se servono, azzurre. */
  const NOMI_FRAZ = { 2: ["mezzo", "mezzi"], 3: ["terzo", "terzi"], 4: ["quarto", "quarti"], 5: ["quinto", "quinti"], 6: ["sesto", "sesti"],
    7: ["settimo", "settimi"], 8: ["ottavo", "ottavi"], 9: ["nono", "noni"], 10: ["decimo", "decimi"] };
  const nomeFraz = (d, uno = false) => (NOMI_FRAZ[d] || ["", ""])[uno ? 0 : 1];
  // stato(i) -> "pasta" | "presa" | "resto" | "uno"; opz.tocca: parti cliccabili; opz.conta: numeri sulle parti prese.
  function formaSVG(forma, cx, cy, R, d, stato = () => "pasta", opz = {}) {
    const tocca = (i) => (opz.tocca ? `class="fr-spicchio fr-${stato(i)} fr-tocca" data-p="${i}"` : `class="fr-spicchio fr-${stato(i)}"`);
    let svg = "", contati = 0;
    if (forma === "cioccolata") {
      const W = R * 2.6, H = R * 1.1, w = W / d, x0 = cx - W / 2, y0 = cy - H / 2;
      svg += `<rect x="${x0 - 8}" y="${y0 - 8}" width="${W + 16}" height="${H + 16}" rx="14" class="fr-ciocc"/>`;
      for (let i = 0; i < d; i++) {
        svg += `<rect x="${x0 + i * w}" y="${y0}" width="${w}" height="${H}" rx="8" ${tocca(i)}/>`;
        if (opz.conta && stato(i) === "presa") svg += `<text x="${x0 + i * w + w / 2}" y="${cy + 10}" class="fr-conta">${++contati}</text>`;
      }
      return svg;
    }
    svg += `<circle cx="${cx}" cy="${cy}" r="${R + 10}" class="fr-crosta"/>`;
    if (d === 1) return svg + `<circle cx="${cx}" cy="${cy}" r="${R}" ${tocca(0)}/>`;
    const pt = (r, a) => `${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`;
    const ang = (i) => -Math.PI / 2 + (2 * Math.PI * i) / d;
    for (let i = 0; i < d; i++) {
      svg += `<path d="M${cx} ${cy} L${pt(R, ang(i))} A${R} ${R} 0 0 1 ${pt(R, ang(i + 1))} Z" ${tocca(i)}/>`;
      const m = (ang(i) + ang(i + 1)) / 2, larga = Math.PI / d;
      if (opz.conta && stato(i) === "presa") svg += `<text x="${pt(R * 0.62, m).split(" ")[0]}" y="${+pt(R * 0.62, m).split(" ")[1] + 9}" class="fr-conta">${++contati}</text>`;
      else if (stato(i) === "presa") {
        const posti = d <= 5 ? [[0.42, -0.35], [0.72, 0.3], [0.72, -0.4]] : [[0.5, 0], [0.8, 0.2]];
        svg += posti.map(([r, s]) => `<circle cx="${pt(R * r, m + s * larga).split(" ")[0]}" cy="${pt(R * r, m + s * larga).split(" ")[1]}" r="${(R * 0.075).toFixed(1)}" class="fr-salame"/>`).join("");
      }
    }
    return svg;
  }
  // Frazione in colonna dentro una scena: numeratore, linea, denominatore (y = altezza della linea).
  function frazSVG(x, y, n, d, cls = "") {
    const w = String(n).length > 1 || String(d).length > 1 ? 44 : 30;
    return `<text x="${x}" y="${y - 12}" class="fr-num ${cls}">${n}</text><path d="M${x - w} ${y} H${x + w}" class="fr-linea ${cls}"/><text x="${x}" y="${y + 50}" class="fr-num ${cls}">${d}</text>`;
  }

  function scenaFrazione(anim) {
    const d = Math.max(2, Math.min(10, +anim.d || 4)), n = Math.max(1, Math.min(2 * d, +anim.n || 3)), forma = anim.forma === "cioccolata" ? "cioccolata" : "pizza";
    const cosa = forma === "pizza" ? "pizza" : "tavoletta di cioccolata", pezzi = [], passi = [];
    if (n < d) {
      const P = (stato, opz) => formaSVG(forma, 200, 160, 120, d, stato, opz);
      pezzi.push({ da: 0, a: 0, svg: formaSVG(forma, 200, 160, 120, 1) + `<text x="500" y="170" class="sc-etichetta">l'intero</text>` });
      passi.push(`Ecco una ${cosa} intera. È l'intero.`);
      pezzi.push({ da: 1, a: 1, svg: P() });
      passi.push(`La tagliamo in ${d} parti uguali. Tutte grandi uguali!`);
      pezzi.push({ da: 2, a: 2, svg: P((i) => (i === 0 ? "uno" : "pasta")) + frazSVG(500, 160, 1, d) + `<text x="500" y="270" class="fr-nota" text-anchor="middle">unità frazionaria</text>` });
      passi.push(`Ogni parte è un ${nomeFraz(d, true)}. Si scrive 1/${d}. Si chiama unità frazionaria.`);
      const prese = (i) => (i < n ? "presa" : "pasta");
      pezzi.push({ da: 3, a: 3, svg: P(prese, { conta: true }) });
      passi.push(`Ne prendiamo ${n}. Contiamo: ${Array.from({ length: n }, (_, k) => k + 1).join(", ")}.`);
      pezzi.push({ da: 4, a: 4, svg: P(prese) + frazSVG(470, 160, n, d, "presa")
        + `<text x="515" y="128" class="fr-nota">⬅ numeratore:</text><text x="515" y="150" class="fr-nota">le parti che prendo</text>`
        + `<text x="515" y="198" class="fr-nota">⬅ denominatore:</text><text x="515" y="220" class="fr-nota">in quante parti taglio</text>` });
      passi.push(`Si scrive ${n}/${d}. Sopra la linea c'è il numeratore: le parti che prendo. Sotto c'è il denominatore: in quante parti uguali ho tagliato.`);
      pezzi.push({ da: 5, svg: P((i) => (i < n ? "presa" : "resto")) + frazSVG(430, 160, n, d, "presa") + `<text x="505" y="182" class="fr-uguale">+</text>` + frazSVG(580, 160, d - n, d, "resto")
        + `<text x="430" y="262" class="fr-nota" text-anchor="middle">prendo</text><text x="580" y="262" class="fr-nota" text-anchor="middle">resta</text><text x="505" y="300" class="sc-etichetta">= l'intero</text>` });
      passi.push(`${d - n === 1 ? "Resta 1 parte" : `Restano ${d - n} parti`}: ${d - n}/${d}. È la frazione complementare. Insieme, ${n}/${d} e ${d - n}/${d} fanno l'intero.`);
      return { viewBox: "0 0 680 320", pezzi, passi };
    }
    // n >= d: servono una o due forme intere (frazione apparente o impropria).
    const quante = Math.ceil(n / d), xs = quante === 1 ? [200] : [130, 340], R = quante === 1 ? 120 : 92;
    const tutte = (stato, opz) => xs.map((x, k) => formaSVG(forma, x, 160, R, d, (i) => stato(k * d + i), opz)).join("");
    pezzi.push({ da: 0, a: 0, svg: xs.map((x) => formaSVG(forma, x, 160, R, 1)).join("") });
    passi.push(quante === 1 ? `Ecco una ${cosa} intera.` : `Ecco due ${forma === "pizza" ? "pizze" : "tavolette"} intere, uguali.`);
    pezzi.push({ da: 1, a: 1, svg: tutte(() => "pasta") });
    passi.push(`Tagliamo ${quante === 1 ? "la" : "ogni"} ${forma === "pizza" ? "pizza" : "tavoletta"} in ${d} parti uguali: sono ${d} ${nomeFraz(d)}.`);
    const prese = (j) => (j < n ? "presa" : "pasta");
    pezzi.push({ da: 2, a: 2, svg: tutte(prese, { conta: true }) });
    passi.push(n === d ? `Prendiamo tutte le ${d} parti.` : n === 2 * d ? `Prendiamo tutte le parti: ${n}.` : `Prendiamo ${n} parti: tutta la prima e ancora ${n - d} della seconda.`);
    pezzi.push({ da: 3, svg: tutte(prese) + frazSVG(575, 150, n, d, "presa") + `<text x="575" y="270" class="fr-nota" text-anchor="middle">${n % d ? "impropria" : "apparente"}</text>` });
    passi.push(n % d === 0
      ? `Si scrive ${n}/${d}. ${n === d ? "Fa un intero esatto" : "Fa due interi esatti"}: è una frazione apparente.`
      : `Si scrive ${n}/${d}. Il numeratore è più grande del denominatore: è una frazione impropria. È più di un intero!`);
    return { viewBox: "0 0 680 320", pezzi, passi };
  }

  function scenaFrazioniEquivalenti(anim) {
    const d = Math.max(2, Math.min(5, +anim.d || 2)), n = Math.max(1, Math.min(d - 1, +anim.n || 1)), k = Math.max(2, Math.min(3, +anim.k || 2));
    const forma = anim.forma === "cioccolata" ? "cioccolata" : "pizza", D = d * k, N = n * k;
    const A = (cls) => formaSVG(forma, 160, 130, 100, d, (i) => (i < n ? cls : "pasta"));
    const B = (cls) => formaSVG(forma, 520, 130, 100, D, (i) => (i < N ? cls : "pasta"));
    const pezzi = [], passi = [];
    pezzi.push({ da: 0, a: 0, svg: formaSVG(forma, 160, 130, 100, 1) + formaSVG(forma, 520, 130, 100, 1) });
    passi.push(forma === "pizza" ? "Ecco due pizze uguali." : "Ecco due tavolette di cioccolata uguali.");
    pezzi.push({ da: 1, svg: A("presa") + frazSVG(160, 300, n, d, "presa") });
    pezzi.push({ da: 1, a: 1, svg: formaSVG(forma, 520, 130, 100, 1) });
    passi.push(`La prima la taglio in ${d} parti e ne prendo ${n}: ${n}/${d}.`);
    pezzi.push({ da: 2, svg: B("presa") + frazSVG(520, 300, N, D, "presa") });
    passi.push(`La seconda la taglio in ${D} parti e ne prendo ${N}: ${N}/${D}.`);
    pezzi.push({ da: 3, svg: `<text x="340" y="320" class="fr-uguale">=</text>` + (forma === "pizza" ? `<circle cx="160" cy="130" r="118" class="fr-cerchio"/><circle cx="520" cy="130" r="118" class="fr-cerchio"/>` : "") });
    passi.push(`Guarda: la parte rossa è grande uguale! ${n}/${d} = ${N}/${D}. Sono frazioni equivalenti.`);
    pezzi.push({ da: 4, svg: `<text x="340" y="244" class="fr-per">× ${k}</text><text x="340" y="392" class="fr-per">× ${k}</text><path d="M232 270 Q 340 240 448 270" class="eq-salto" marker-end="url(#punta)"/><path d="M232 340 Q 340 370 448 340" class="eq-salto" marker-end="url(#punta)"/>` });
    passi.push(`Il trucco: moltiplico il numeratore e il denominatore per lo stesso numero, ${k}.`);
    return { viewBox: "0 0 680 400", pezzi, passi };
  }

  // Tre frazioni diverse: la giusta e due sbagli tipici (sopra e sotto scambiati, la parte che resta...).
  function opzioniFrazione(a, b) {
    const giusta = `${a}/${b}`, alt = [`${b}/${a}`, `${b - a}/${b}`, `${a}/${b + 1}`, `${a + 1}/${b}`, `${a}/${b - 1}`];
    const scelte = [giusta];
    for (const x of alt) { const [p, q] = x.split("/").map(Number); if (p > 0 && q > 1 && !scelte.includes(x) && scelte.length < 3) scelte.push(x); }
    return mescola(scelte);
  }

  /* ---------- Esercizio "colora_frazione": il bambino tocca le parti da colorare ---------- */
  function esercizioColoraFrazione(e, c, esito, intestazione) {
    const n = +e.n, d = +e.d, forma = e.forma === "cioccolata" ? "cioccolata" : "pizza", prese = new Set();
    const vb = forma === "pizza" ? "0 0 320 300" : "0 0 440 200", cx = forma === "pizza" ? 160 : 220, cy = forma === "pizza" ? 150 : 100, R = forma === "pizza" ? 130 : 150;
    c.innerHTML = intestazione + `<div class="frazione-es">
      <p class="gioco-aiuto">Tocca una parte per colorarla. Toccala ancora per togliere il colore.</p>
      <div class="fr-riga"><div class="fr-meta">${Figura.img(forma === "pizza" ? "🍕" : "🍫", "figura media")} ${Figura.frazioneHTML(n, d)}</div>
      <svg viewBox="${vb}" class="fr-forma"></svg></div>
      <p class="fr-contatore"></p>
      <div class="costruisci-tasti"><button class="btn bianco" data-f="via">↺ Cancella</button><button class="btn verde" data-f="ok">✔ Ho finito</button></div></div>`;
    const svg = c.querySelector(".fr-forma"), conto = c.querySelector(".fr-contatore");
    const disegna = () => {
      svg.innerHTML = formaSVG(forma, cx, cy, R, d, (i) => (prese.has(i) ? "presa" : "pasta"), { tocca: true });
      conto.textContent = `Parti colorate: ${prese.size}`;
    };
    disegna();
    svg.addEventListener("click", (ev) => {
      const p = ev.target.closest("[data-p]");
      if (!p || c.classList.contains("risolto") || c.closest(".risolto")) return;
      const i = +p.dataset.p;
      prese.has(i) ? prese.delete(i) : prese.add(i);
      Suono?.clic?.(); disegna();
    });
    c.addEventListener("click", (ev) => {
      const b = ev.target.closest("[data-f]");
      if (!b || c.closest(".risolto")) return;
      if (b.dataset.f === "via") { prese.clear(); disegna(); return; }
      if (prese.size === n) esito.ok();
      else {
        e.suggerimento = prese.size > n ? `Hai colorato troppe parti. Il numeratore è ${n}: ne servono ${n}.` : `Il numeratore è ${n}: colora ${n} ${n === 1 ? "parte" : "parti"}.`;
        esito.ko(b);
      }
    });
  }

  /* ---------- Esercizio "leggi_frazione": guarda la figura e scegli la frazione ---------- */
  function esercizioLeggiFrazione(e, c, esito, intestazione) {
    const n = +e.n, d = +e.d, forma = e.forma === "cioccolata" ? "cioccolata" : "pizza", comp = e.chiedi === "complementare";
    const a = comp ? d - n : n, giusta = `${a}/${d}`;
    const vb = forma === "pizza" ? "0 0 320 300" : "0 0 440 200", cx = forma === "pizza" ? 160 : 220, cy = forma === "pizza" ? 150 : 100, R = forma === "pizza" ? 130 : 150;
    c.innerHTML = intestazione + `<div class="frazione-es">
      <svg viewBox="${vb}">${formaSVG(forma, cx, cy, R, d, (i) => (i < n ? "presa" : "pasta"))}</svg>
      <div class="opzioni fr-opzioni">${opzioniFrazione(a, d).map((x) => `<button class="opzione" data-o="${x}">${Figura.frazioneHTML(...x.split("/"))}</button>`).join("")}</div></div>`;
    c.addEventListener("click", (ev) => {
      const b = ev.target.closest("[data-o]");
      if (!b || c.closest(".risolto")) return;
      if (b.dataset.o === giusta) { b.classList.add("giusta"); esito.ok(); }
      else {
        e.suggerimento = `Conta le parti ${comp ? "bianche" : "rosse"}: vanno sopra. Tutte le parti insieme vanno sotto.`;
        esito.ko(b);
      }
    });
  }

  const SCENE = { stati: scenaStati, ciclo_acqua: scenaCicloAcqua, fotosintesi: scenaFotosintesi, seme: scenaSeme, corpo: scenaCorpo, cellula: scenaCellula, cellula_vegetale: scenaCellulaVegetale, foglia: scenaFoglia, dalla_cellula: scenaDallaCellula, numero: scenaNumero, equivalenza: scenaEquivalenza, tabella_valore: scenaTabellaValore, decimali: scenaDecimali, frazione: scenaFrazione, frazioni_equivalenti: scenaFrazioniEquivalenti };
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
    } else if (tipo === "scena" || tipo === "sequenza" || tipo === "addizione") {
      const sc = tipo === "sequenza" ? scenaSequenza(anim) : tipo === "addizione" ? scenaAddizione(anim) : SCENE[anim.scena]?.(anim);
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

  window.Animazioni = { SCENE: Object.keys(SCENE), crea, esercizioColoraFrazione, esercizioLeggiFrazione, esercizioAddizione, esercizioCostruisci, esercizioEquivalenza, calcolaEquivalenza, esercizioLeggiTabella, leggiTabella, esercizioVirgola, calcolaVirgola, esercizioColonna, esercizioGelosia, passiMoltiplicazione, passiGelosia, apriTavola };
})();
