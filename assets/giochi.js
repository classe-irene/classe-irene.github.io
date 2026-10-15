// Giochi che i bambini conoscono già: memory, testo bucato, crucipuzzle, indovina la parola,
// trova l'intruso, acchiappa la risposta, parola mescolata.
// Ogni gioco riceve (esercizio, contenitore, esito, intestazione) come gli altri esercizi.

(function () {
  const h = escapeHTML;
  const ric = (t, cl = "figura media") => Figura.ricco(t, cl);
  const parolaDi = (t) => Figura.dividi(t).testo.trim();

  /* ---------- Memory: trova le coppie ---------- */
  function memory(e, c, esito, intestazione) {
    const carte = mescola(e.coppie.flatMap((p, i) => [{ t: p[0], i }, { t: p[1], i }]));
    c.innerHTML = intestazione + `<p class="gioco-aiuto">Gira due carte. Se vanno insieme, restano scoperte.</p>
      <div class="memory" style="--col:${carte.length <= 8 ? 4 : carte.length <= 12 ? 4 : 5}">
      ${carte.map((x, k) => `<button class="carta-memory" data-k="${k}"><span class="dorso">${Figura.img("🦉", "figura media")}</span><span class="faccia">${ric(x.t)}</span></button>`).join("")}</div>
      <p class="gioco-conto">Tentativi: <b data-tentativi>0</b></p>`;
    let prima = null, blocco = false, trovate = 0, tentativi = 0;
    c.querySelector(".memory").addEventListener("click", (ev) => {
      const b = ev.target.closest(".carta-memory");
      if (!b || blocco || b.classList.contains("girata")) return;
      b.classList.add("girata");
      leggi(parolaDi(carte[+b.dataset.k].t));
      if (!prima) { prima = b; return; }
      tentativi++; c.querySelector("[data-tentativi]").textContent = tentativi;
      const a = carte[+prima.dataset.k], z = carte[+b.dataset.k];
      if (a.i === z.i) {
        prima.classList.add("trovata"); b.classList.add("trovata"); prima = null;
        Suono.giusto();
        if (++trovate === e.coppie.length) esito.ok();
      } else {
        blocco = true;
        const p = prima; prima = null;
        setTimeout(() => { p.classList.remove("girata"); b.classList.remove("girata"); blocco = false; }, 1400);
      }
    });
  }

  /* ---------- Testo bucato: completa il testo con le parole ---------- */
  function bucato(e, c, esito, intestazione) {
    const giuste = [];
    const html = h(e.testo).replace(/\[([^\]]+)\]/g, (_, p) => { giuste.push(p); return `<button class="buco-gioco" data-b="${giuste.length - 1}"></button>`; });
    const banca = mescola([...giuste.map((t, i) => ({ t, i })), ...(e.distrattori || []).map((t) => ({ t, i: -1 }))]);
    c.innerHTML = intestazione + `<p class="gioco-aiuto">Tocca un buco, poi la parola giusta.</p>
      <div class="testo-bucato">${html.split(/\n+/).map((r) => `<p>${r}</p>`).join("")}</div>
      <div class="banca-parole">${banca.map((x, k) => `<button class="tessera" data-k="${k}">${h(x.t)}</button>`).join("")}</div>`;
    const buchi = [...c.querySelectorAll(".buco-gioco")];
    let attivo = buchi[0], fatti = 0;
    const evidenzia = () => buchi.forEach((b) => b.classList.toggle("attivo", b === attivo));
    evidenzia();
    c.addEventListener("click", (ev) => {
      const b = ev.target.closest(".buco-gioco");
      if (b && !b.classList.contains("pieno")) { attivo = b; evidenzia(); return; }
      const t = ev.target.closest(".banca-parole .tessera");
      if (!t || t.disabled || !attivo) return;
      const x = banca[+t.dataset.k];
      // va bene anche una parola uguale a quella giusta (stesse parole in buchi diversi)
      if (x.t.toLowerCase() === giuste[+attivo.dataset.b].toLowerCase()) {
        attivo.textContent = x.t; attivo.classList.add("pieno"); t.disabled = true; t.classList.add("usata");
        Suono.giusto();
        if (++fatti === giuste.length) return esito.ok();
        attivo = buchi.find((z) => !z.classList.contains("pieno")); evidenzia();
      } else esito.ko(t);
    });
  }

  /* ---------- Crucipuzzle: trova le parole nascoste ---------- */
  function crucipuzzle(e, c, esito, intestazione) {
    const voci = e.parole.map((p) => ({ mostra: p, parola: parolaDi(p).toUpperCase().normalize("NFD").replace(/[^A-Z]/g, "") }));
    const N = Math.max(e.dimensione || 0, Math.max(...voci.map((v) => v.parola.length)) + 1, 7);
    let griglia, posti;
    // Solo orizzontale (da sinistra a destra) e verticale (dall'alto in basso): più semplice da leggere.
    for (let tentativo = 0; tentativo < 200; tentativo++) {
      griglia = Array.from({ length: N }, () => Array(N).fill(""));
      posti = [];
      let ok = true;
      for (const v of [...voci].sort((a, b) => b.parola.length - a.parola.length)) {
        let messa = false;
        for (let k = 0; k < 200 && !messa; k++) {
          const vert = Math.random() < 0.5, L = v.parola.length;
          const r = Math.floor(Math.random() * (vert ? N - L + 1 : N)), q = Math.floor(Math.random() * (vert ? N : N - L + 1));
          const celle = [...v.parola].map((_, i) => [vert ? r + i : r, vert ? q : q + i]);
          if (celle.every(([a, b], i) => !griglia[a][b] || griglia[a][b] === v.parola[i])) {
            celle.forEach(([a, b], i) => (griglia[a][b] = v.parola[i]));
            posti.push({ v, celle }); messa = true;
          }
        }
        if (!messa) { ok = false; break; }
      }
      if (ok) break;
    }
    const ALF = "ABCDEFGHILMNOPRSTUVZ";
    griglia.forEach((riga) => riga.forEach((x, j) => { if (!x) riga[j] = ALF[Math.floor(Math.random() * ALF.length)]; }));
    c.innerHTML = intestazione + `<p class="gioco-aiuto">Tocca la prima lettera e poi l'ultima della parola.</p>
      <div class="cruci-posto"><div class="cruci" style="--n:${N}">${griglia.map((riga, a) => riga.map((x, b) => `<button class="lettera-c" data-a="${a}" data-b="${b}">${x}</button>`).join("")).join("")}</div>
      <ul class="cruci-elenco">${voci.map((v, i) => `<li data-i="${i}">${ric(v.mostra, "figura piccola")}</li>`).join("")}</ul></div>`;
    const cella = (a, b) => c.querySelector(`.lettera-c[data-a="${a}"][data-b="${b}"]`);
    const colori = ["#FFC93C", "#7DD3A8", "#9DB8FF", "#FF9DB0", "#C9A8FF", "#FFB27A", "#8EE0E8", "#D4E87A"];
    let inizio = null, trovate = 0;
    c.querySelector(".cruci").addEventListener("click", (ev) => {
      const b = ev.target.closest(".lettera-c");
      if (!b) return;
      if (!inizio) { inizio = b; b.classList.add("inizio"); return; }
      const a1 = +inizio.dataset.a, b1 = +inizio.dataset.b, a2 = +b.dataset.a, b2 = +b.dataset.b;
      inizio.classList.remove("inizio");
      const prima = inizio; inizio = null;
      if (prima === b) return;
      const p = posti.find((x) => !x.trovata && ((x.celle[0][0] === a1 && x.celle[0][1] === b1 && x.celle.at(-1)[0] === a2 && x.celle.at(-1)[1] === b2) ||
        (x.celle[0][0] === a2 && x.celle[0][1] === b2 && x.celle.at(-1)[0] === a1 && x.celle.at(-1)[1] === b1)));
      if (!p) return esito.ko(b);
      p.trovata = true;
      const col = colori[trovate % colori.length];
      p.celle.forEach(([a, q]) => { const z = cella(a, q); z.classList.add("trovata"); z.style.background = col; });
      c.querySelector(`.cruci-elenco li[data-i="${voci.indexOf(p.v)}"]`).classList.add("fatta");
      leggi(parolaDi(p.v.mostra)); Suono.giusto();
      if (++trovate === posti.length) esito.ok();
    });
  }

  /* ---------- Indovina la parola (con i palloncini al posto dell'impiccato) ---------- */
  function indovina(e, c, esito, intestazione) {
    const parola = parolaDi(e.parola).toUpperCase();
    const norm = (x) => x.normalize("NFD").replace(/[̀-ͯ]/g, "");
    const VITE = 7;
    let vite = VITE, prese = new Set();
    c.innerHTML = intestazione + `<div class="indovina">
      ${e.indizio ? `<div class="indizio">${ric(e.indizio, "figura grande")}</div>` : ""}
      <div class="palloncini"></div>
      <div class="parola-nascosta"></div>
      <div class="tastiera">${[..."ABCDEFGHILMNOPQRSTUVZ"].map((x) => `<button class="tasto" data-l="${x}">${x}</button>`).join("")}</div></div>`;
    const disegna = () => {
      c.querySelector(".palloncini").innerHTML = Array.from({ length: VITE }, (_, k) => Figura.img("🎈", `figura media${k < vite ? "" : " scoppiato"}`)).join("");
      c.querySelector(".parola-nascosta").innerHTML = [...parola].map((x) => x === " " ? '<span class="spazio"></span>'
        : /[A-ZÀ-Ú]/.test(x) ? `<span class="casella-l">${prese.has(norm(x)) ? x : ""}</span>` : `<span class="casella-l fissa">${x}</span>`).join("");
    };
    const reset = () => { vite = VITE; prese = new Set(); c.querySelectorAll(".tastiera .tasto").forEach((t) => { t.disabled = false; t.className = "tasto"; }); disegna(); };
    disegna();
    c.querySelector(".tastiera").addEventListener("click", (ev) => {
      const t = ev.target.closest(".tasto");
      if (!t || t.disabled || c.closest(".risolto")) return;
      const l = t.dataset.l;
      t.disabled = true;
      if (norm(parola).includes(l)) {
        prese.add(l); t.classList.add("giusta"); Suono.giusto(); disegna();
        if ([...norm(parola)].every((x) => !/[A-Z]/.test(x) || prese.has(x))) { leggi(parola.toLowerCase()); esito.ok(); }
      } else {
        vite--; t.classList.add("no"); disegna(); esito.ko();
        if (vite === 0) {
          c.querySelector(".parola-nascosta").innerHTML = [...parola].map((x) => `<span class="casella-l rivelata">${x === " " ? "" : x}</span>`).join("");
          Voce.parla(`La parola era ${parola.toLowerCase()}. Riproviamo!`);
          setTimeout(reset, 3500);
        }
      }
    });
  }

  /* ---------- Trova l'intruso ---------- */
  function intruso(e, c, esito, intestazione) {
    const el = e.elementi.map((t, i) => ({ t, i }));
    const ordine = mescola(el);
    c.innerHTML = intestazione + `<p class="gioco-aiuto">Uno di questi non c'entra. Quale?</p>
      <div class="intruso">${ordine.map((x) => `<button class="carta-intruso" data-i="${x.i}">${ric(x.t, "figura grande")}</button>`).join("")}</div>`;
    c.querySelector(".intruso").addEventListener("click", (ev) => {
      const b = ev.target.closest(".carta-intruso");
      if (!b || c.closest(".risolto")) return;
      if (+b.dataset.i === e.intruso) { b.classList.add("giusta"); esito.ok(); } else esito.ko(b);
    });
  }

  /* ---------- Acchiappa la risposta (le figure spuntano dalle tane) ---------- */
  function acchiappa(e, c, esito, intestazione) {
    const obiettivo = Math.min(e.quanti || 5, e.giusti.length * 3);
    const TANE = 6, DURATA = (e.lento === false ? 2200 : 3200);
    c.innerHTML = intestazione + `<div class="acchiappa">
      <div class="acchiappa-conto">Presi: <b data-presi>0</b> / ${obiettivo}</div>
      <div class="tane">${Array.from({ length: TANE }, (_, k) => `<div class="tana" data-t="${k}"><button class="talpa" hidden></button></div>`).join("")}</div>
      <button class="btn" data-via>▶ Via!</button></div>`;
    let presi = 0, timer = null, attivo = false, ultima = -1;
    const talpe = [...c.querySelectorAll(".talpa")];
    function spunta() {
      if (!attivo) return;
      talpe.forEach((t) => (t.hidden = true));
      let k; do k = Math.floor(Math.random() * TANE); while (k === ultima); ultima = k;
      const giusto = Math.random() < 0.55;
      const lista = giusto ? e.giusti : e.sbagliati;
      const t = talpe[k];
      t.innerHTML = ric(lista[Math.floor(Math.random() * lista.length)], "figura media");
      t.dataset.giusto = giusto ? "1" : "";
      t.hidden = false; t.classList.remove("presa", "sbagliata");
      timer = setTimeout(spunta, DURATA);
    }
    c.querySelector("[data-via]").onclick = (ev) => {
      if (attivo) return;
      attivo = true; ev.target.hidden = true; spunta();
    };
    c.querySelector(".tane").addEventListener("click", (ev) => {
      const t = ev.target.closest(".talpa");
      if (!t || t.hidden || !attivo) return;
      clearTimeout(timer);
      if (t.dataset.giusto) {
        t.classList.add("presa"); Suono.giusto();
        c.querySelector("[data-presi]").textContent = ++presi;
        if (presi >= obiettivo) { attivo = false; setTimeout(() => talpe.forEach((x) => (x.hidden = true)), 600); return esito.ok(); }
      } else esito.ko(t);
      timer = setTimeout(spunta, 700);
    });
    // si ferma se l'esercizio esce dallo schermo (per esempio cambiando pagina sulla LIM)
    new IntersectionObserver(([v]) => { if (!v.isIntersecting && attivo) { attivo = false; clearTimeout(timer); c.querySelector("[data-via]").hidden = false; c.querySelector("[data-via]").textContent = "▶ Continua"; } }).observe(c);
  }

  /* ---------- Parola mescolata: rimetti in ordine lettere o sillabe ---------- */
  function mescolata(e, c, esito, intestazione) {
    const parola = parolaDi(e.parola).toUpperCase();
    const pezzi = parola.includes("-") ? parola.split("-") : [...parola.replace(/\s/g, "")];
    let ordine = mescola(pezzi.map((t, i) => ({ t, i })));
    if (ordine.every((x, i) => x.i === i) && pezzi.length > 1) ordine.push(ordine.shift());
    c.innerHTML = intestazione + `<div class="mescolata">
      ${e.indizio ? `<div class="indizio">${ric(e.indizio, "figura grande")}</div>` : ""}
      <div class="parola-nascosta">${pezzi.map(() => '<span class="casella-l larga"></span>').join("")}</div>
      <div class="banca-parole">${ordine.map((x, k) => `<button class="tessera grande" data-k="${k}">${h(x.t)}</button>`).join("")}</div></div>`;
    const caselle = [...c.querySelectorAll(".parola-nascosta .casella-l")];
    let n = 0;
    c.querySelector(".banca-parole").addEventListener("click", (ev) => {
      const t = ev.target.closest(".tessera");
      if (!t || t.disabled) return;
      const x = ordine[+t.dataset.k];
      // accetta anche una lettera uguale in un'altra posizione (es. le due A di "PALLA")
      if (x.t === pezzi[n]) {
        caselle[n].textContent = x.t; t.disabled = true; t.classList.add("usata"); Suono.giusto();
        if (++n === pezzi.length) { leggi(pezzi.join("").toLowerCase()); esito.ok(); }
      } else esito.ko(t);
    });
  }

  /* ---------- Controllo dei dati ---------- */
  function valida(e, n) {
    const lista = (x, min) => Array.isArray(x) && x.length >= min;
    switch (e.tipo) {
      case "memory": return lista(e.coppie, 2) && e.coppie.length <= 8 && e.coppie.every((p) => Array.isArray(p) && p.length === 2) ? [] : [`${n}: servono da 2 a 8 "coppie".`];
      case "bucato": return /\[[^\]]+\]/.test(e.testo || "") ? [] : [`${n}: il "testo" deve avere le parole da mettere tra [parentesi quadre].`];
      case "crucipuzzle": return lista(e.parole, 2) && e.parole.length <= 8 && e.parole.every((p) => parolaDi(p).length >= 2 && parolaDi(p).length <= 10) ? [] : [`${n}: servono da 2 a 8 "parole" (al massimo 10 lettere).`];
      case "indovina": return e.parola && parolaDi(e.parola).length >= 2 ? [] : [`${n}: serve "parola".`];
      case "intruso": return lista(e.elementi, 3) && e.elementi[e.intruso] !== undefined ? [] : [`${n}: servono "elementi" (almeno 3) e "intruso".`];
      case "acchiappa": return lista(e.giusti, 1) && lista(e.sbagliati, 1) ? [] : [`${n}: servono "giusti" e "sbagliati".`];
      case "mescolata": return e.parola && parolaDi(e.parola).length >= 2 ? [] : [`${n}: serve "parola".`];
    }
    return [];
  }

  window.Giochi = { memory, bucato, crucipuzzle, indovina, intruso, acchiappa, mescolata, valida, TIPI: ["memory", "bucato", "crucipuzzle", "indovina", "intruso", "acchiappa", "mescolata"] };
})();
