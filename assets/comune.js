// Funzioni condivise da tutte le pagine: testata, mascotte, suoni, voce, archivio locale.

window.MASCOTTE = `
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Gufetto, la mascotte">
  <ellipse cx="100" cy="188" rx="58" ry="8" fill="#000" opacity=".08"/>
  <path d="M48 70 L40 30 L75 55 Z" fill="#7A4FD6"/>
  <path d="M152 70 L160 30 L125 55 Z" fill="#7A4FD6"/>
  <ellipse cx="100" cy="112" rx="62" ry="72" fill="#8B5CF6"/>
  <ellipse cx="100" cy="135" rx="40" ry="44" fill="#E9DDFF"/>
  <path d="M80 125 q5 6 10 0 M95 140 q5 6 10 0 M110 125 q5 6 10 0 M88 155 q5 6 10 0 M103 155 q5 6 10 0" stroke="#C4B0F5" stroke-width="3" fill="none" stroke-linecap="round"/>
  <circle cx="74" cy="84" r="26" fill="#fff"/>
  <circle cx="126" cy="84" r="26" fill="#fff"/>
  <circle cx="78" cy="86" r="12" fill="#2B2A33"/>
  <circle cx="122" cy="86" r="12" fill="#2B2A33"/>
  <circle cx="82" cy="81" r="4" fill="#fff"/>
  <circle cx="126" cy="81" r="4" fill="#fff"/>
  <path d="M92 104 L100 118 L108 104 Z" fill="#FFC93C"/>
  <ellipse cx="46" cy="120" rx="12" ry="30" fill="#7A4FD6" transform="rotate(15 46 120)"/>
  <ellipse cx="154" cy="120" rx="12" ry="30" fill="#7A4FD6" transform="rotate(-15 154 120)"/>
  <path d="M82 180 l-6 8 M88 181 l0 9 M118 180 l6 8 M112 181 l0 9" stroke="#FFC93C" stroke-width="5" stroke-linecap="round"/>
  <rect x="50" y="46" width="100" height="10" rx="3" fill="#2B2A33"/>
  <path d="M60 46 L100 28 L140 46 Z" fill="#2B2A33"/>
  <path d="M140 50 q10 10 6 24" stroke="#FFC93C" stroke-width="3" fill="none"/>
  <circle cx="146" cy="76" r="5" fill="#FFC93C"/>
</svg>`;

window.creaTestata = function (attivo) {
  const t = document.createElement("header");
  t.className = "testata";
  t.innerHTML = `
    <div class="contenitore">
      <a class="logo" href="index.html">${MASCOTTE}<span>${SITO.nome}</span></a>
      <nav class="nav">
        <a href="index.html#matematica" class="${attivo === "matematica" ? "attivo" : ""}">🔢 Matematica</a>
        <a href="index.html#scienze" class="${attivo === "scienze" ? "attivo" : ""}">🔬 Scienze</a>
        <a href="cinque-minuti.html" class="${attivo === "cinque" ? "attivo" : ""}">⏱️ Lezione in 5 minuti</a>
      </nav>
    </div>`;
  document.body.prepend(t);
  const p = document.createElement("footer");
  p.className = "piede";
  p.textContent = `${SITO.nome} · ${SITO.motto}`;
  document.body.append(p);
};

window.parametri = () => Object.fromEntries(new URLSearchParams(location.search));

window.escapeHTML = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ---------- Archivio delle lezioni create con "5 minuti" (nel browser) ---------- */
window.Archivio = {
  chiave: "classe-irene-lezioni",
  tutte() {
    try { return JSON.parse(localStorage.getItem(this.chiave)) || []; } catch { return []; }
  },
  salva(lezione) {
    const elenco = this.tutte().filter((l) => l.id !== lezione.id);
    elenco.unshift(lezione);
    try { localStorage.setItem(this.chiave, JSON.stringify(elenco)); return true; } catch { return false; }
  },
  prendi(id) { return this.tutte().find((l) => l.id === id); },
  elimina(id) {
    try { localStorage.setItem(this.chiave, JSON.stringify(this.tutte().filter((l) => l.id !== id))); } catch {}
  },
};

/* ---------- Suoni (generati, nessun file da scaricare) ---------- */
window.Suono = (() => {
  let ctx;
  function nota(freq, inizio, durata, tipo = "sine", vol = 0.15) {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = tipo; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, ctx.currentTime + inizio);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + inizio + durata);
    o.connect(g).connect(ctx.destination);
    o.start(ctx.currentTime + inizio); o.stop(ctx.currentTime + inizio + durata);
  }
  let attivo = true;
  return {
    get attivo() { return attivo; },
    set attivo(v) { attivo = v; },
    giusto() { if (!attivo) return; try { nota(660, 0, .15); nota(880, .1, .25); } catch {} },
    sbagliato() { if (!attivo) return; try { nota(220, 0, .25, "triangle", .12); } catch {} },
    festa() { if (!attivo) return; try { [523, 659, 784, 1047].forEach((f, i) => nota(f, i * .12, .3)); } catch {} },
  };
})();

/* ---------- Voce: legge ad alta voce in italiano ---------- */
window.leggi = function (testo) {
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(testo);
  u.lang = "it-IT"; u.rate = 0.92;
  const voce = speechSynthesis.getVoices().find((v) => v.lang.startsWith("it"));
  if (voce) u.voice = voce;
  speechSynthesis.speak(u);
};

/* ---------- Coriandoli ---------- */
window.coriandoli = function (quanti = 80) {
  const colori = ["#3D6BE0", "#1FA36A", "#FFC93C", "#FF6B6B", "#8B5CF6"];
  for (let i = 0; i < quanti; i++) {
    const c = document.createElement("div");
    c.className = "coriandolo";
    c.style.left = Math.random() * 100 + "vw";
    c.style.background = colori[i % colori.length];
    c.style.animationDuration = 2 + Math.random() * 2 + "s";
    c.style.animationDelay = Math.random() * .6 + "s";
    c.style.borderRadius = Math.random() > .5 ? "50%" : "3px";
    document.body.append(c);
    setTimeout(() => c.remove(), 5000);
  }
};

window.mescola = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};
