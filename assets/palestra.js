// Palestra delle equivalenze: esercizi sempre nuovi, uno alla volta (anche sulla LIM).
// Livello 1: tabella k h da u (aggiungo o tolgo gli zeri). Livello 2: tabella hk dak uk h da u (leggo fino alla casella).
(() => {
  const caso = (a) => a[Math.floor(Math.random() * a.length)];
  const tra = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const spazi = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  // Numero con la virgola italiana e gli spazi delle migliaia (fino a 3 decimali).
  const scrivi = (v) => { const [i, d] = String(+v.toFixed(3)).split("."); return spazi(i) + (d ? "," + d : ""); };
  const valore = (t) => Number(String(t).replace(/\s/g, "").replace(",", "."));

  const U4 = ["k", "h", "da", "u"];
  const FIG4 = { k: "🚚", h: "🗃️", da: "📦", u: "🍫" };
  const U6 = ["hk", "dak", "uk", "h", "da", "u"];

  // ---------- Livello 1: k h da u ----------
  function coppia1() {
    for (;;) {
      const i0 = tra(0, 3), i1 = tra(0, 3);
      if (i0 === i1) continue;
      const da = U4[i0], a = U4[i1], s = i1 - i0;
      // Verso destra: un numero piccolo (anche di due cifre se il salto è uno). Verso sinistra: un numero con gli zeri giusti.
      const n = s > 0 ? (s === 1 && Math.random() < .35 ? tra(11, 99) : tra(1, 9)) : tra(1, 9) * 10 ** -s * (Math.random() < .25 && s === -1 ? tra(2, 9) : 1);
      const r = Animazioni.calcolaEquivalenza(n, da, a);
      if (!Number.isInteger(r) || r > 9999 || n > 9999) continue;
      return { n, da, a, r, s };
    }
  }
  const regola1 = (q) => `${Math.abs(q.s)} ${Math.abs(q.s) === 1 ? "salto" : "salti"} a ${q.s > 0 ? "destra: aggiungo" : "sinistra: tolgo"} ${Math.abs(q.s) === 1 ? "uno 0" : Math.abs(q.s) + " zeri"}. ${spazi(q.n)} ${q.da} = ${spazi(q.r)} ${q.a}.`;
  const sbagliati1 = (q) => [q.r * 10, q.r % 10 === 0 ? q.r / 10 : q.r * 100].filter((x) => x !== q.r);

  const LIVELLO1 = {
    equivalenza() { const q = coppia1(); return { tipo: "equivalenza", immagine: FIG4[q.da], n: q.n, da: q.da, a: q.a, spiegazione: regola1(q) }; },
    scelta() {
      const q = coppia1();
      return { tipo: "scelta", immagine: FIG4[q.da], domanda: `${spazi(q.n)} ${q.da} = ? ${q.a}`,
        opzioni: [q.r, ...sbagliati1(q)].map((x) => `${FIG4[q.a]} ${spazi(x)} ${q.a}`), corretta: 0, spiegazione: regola1(q) };
    },
    vero_falso() {
      const q = coppia1(), vero = Math.random() < .5, m = vero ? q.r : caso(sbagliati1(q));
      return { tipo: "vero_falso", immagine: "⚖️", affermazione: `${spazi(q.n)} ${q.da} = ${spazi(m)} ${q.a}`, corretta: vero,
        spiegazione: regola1(q) };
    },
    completa() {
      const q = coppia1();
      return { tipo: "completa", immagine: "✏️", domanda: "Completa.", testo: `${spazi(q.n)} ${q.da} = [${spazi(q.r)}] ${q.a}`,
        distrattori: sbagliati1(q).map(spazi), spiegazione: regola1(q) };
    },
  };

  // ---------- Livello 2: hk dak uk h da u ----------
  function coppia2() {
    for (;;) {
      const i0 = tra(0, 5), i1 = tra(0, 5);
      if (i0 === i1) continue;
      const da = U6[i0], a = U6[i1];
      const n = Math.random() < .7 ? tra(1, 9) : tra(11, 99);
      if (n % 10 === 0) continue;
      if (String(n).length - 1 > i0) continue; // il numero deve stare nella tabella
      const L = Animazioni.leggiTabella(n, da, a);
      if (L.decimale.length > 2) continue; // al massimo due cifre dopo la virgola
      return { n, da, a, L };
    }
  }
  const regola2 = (q) => q.L.decimale
    ? `La casella ${q.a} è più a sinistra: leggo fino a ${q.a} e metto la virgola. ${q.n} ${q.da} = ${q.L.testo} ${q.a}.`
    : `Leggo le cifre fino alla casella ${q.a}: ${q.n} ${q.da} = ${q.L.testo} ${q.a}.`;
  const sbagliati2 = (q) => { const v = valore(q.L.testo); return [scrivi(v * 10), scrivi(v / 10)].filter((x) => x !== q.L.testo); };

  const LIVELLO2 = {
    leggi_tabella() { const q = coppia2(); return { tipo: "leggi_tabella", immagine: "🗂️", n: q.n, da: q.da, a: q.a, spiegazione: regola2(q) }; },
    scelta() {
      const q = coppia2();
      return { tipo: "scelta", immagine: "🗂️", domanda: `${q.n} ${q.da} = ? ${q.a}`,
        opzioni: [q.L.testo, ...sbagliati2(q)].map((x) => `🔢 ${x} ${q.a}`), corretta: 0, spiegazione: regola2(q) };
    },
    vero_falso() {
      const q = coppia2(), vero = Math.random() < .5, m = vero ? q.L.testo : caso(sbagliati2(q));
      return { tipo: "vero_falso", immagine: "⚖️", affermazione: `${q.n} ${q.da} = ${m} ${q.a}`, corretta: vero, spiegazione: regola2(q) };
    },
    completa() {
      const q = coppia2();
      return { tipo: "completa", immagine: "✏️", domanda: "Completa.", testo: `${q.n} ${q.da} = [${q.L.testo}] ${q.a}`,
        distrattori: sbagliati2(q), spiegazione: regola2(q) };
    },
  };

  // Giro di 10: gli esercizi con la tabella si alternano alle domande veloci.
  const SCALETTA1 = ["equivalenza", "scelta", "vero_falso", "equivalenza", "completa", "scelta", "equivalenza", "vero_falso", "completa", "equivalenza"];
  const SCALETTA2 = ["leggi_tabella", "scelta", "vero_falso", "leggi_tabella", "completa", "scelta", "leggi_tabella", "vero_falso", "completa", "leggi_tabella"];
  function giro(livello) {
    const fatti = new Set();
    return SCALETTA1.map((_, i) => {
      const l2 = livello === "2" || (livello === "misto" && i % 2 === 1);
      const tipo = (l2 ? SCALETTA2 : SCALETTA1)[i];
      // Niente doppioni nello stesso giro.
      for (let k = 0; ; k++) {
        const e = (l2 ? LIVELLO2 : LIVELLO1)[tipo]();
        const chiave = e.tipo + (e.domanda || "") + (e.affermazione || "") + (e.testo || "") + (e.n ?? "") + (e.da || "") + (e.a || "");
        if (!fatti.has(chiave) || k > 20) { fatti.add(chiave); if (e.opzioni) mescolaOpzioni(e); return e; }
      }
    });
  }
  function mescolaOpzioni(e) {
    const giusta = e.opzioni[e.corretta];
    e.opzioni = mescola([...e.opzioni]);
    e.corretta = e.opzioni.indexOf(giusta);
  }

  window.Palestra = { giro, scrivi, valore };
})();
