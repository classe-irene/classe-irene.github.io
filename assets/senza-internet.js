// Solo nella cartella "senza internet" (la aggiunge strumenti/pacchetto-offline.mjs).
// Nella home: la data di questa versione e il pulsante per aggiungere una lezione salvata come file
// (il file .json che l'area insegnante dà con "💾 Scarica il file").
(() => {
  const home = ["/index.html", "/sito/"].some((x) => location.pathname.endsWith(x));
  if (!home) return;
  addEventListener("DOMContentLoaded", () => {
    const p = document.createElement("section");
    p.className = "senza-internet";
    p.style.cssText = "text-align:center;margin:24px 0;color:#8a8597;font:700 .95rem Nunito,sans-serif";
    p.innerHTML = `<label class="btn bianco" style="cursor:pointer">📂 Aggiungi una lezione da file
        <input type="file" accept=".json,application/json" hidden></label>
      <p class="si-esito" style="margin:12px 0 0"></p>
      <p style="margin:12px 0 0">📦 Versione senza internet del ${escapeHTML(window.SENZA_INTERNET || "")}</p>`;
    document.body.append(p);
    const esito = p.querySelector(".si-esito");
    p.querySelector("input").addEventListener("change", async (ev) => {
      const f = ev.target.files[0];
      if (!f) return;
      try {
        const l = JSON.parse(await f.text());
        if (!l || !l.titolo || !Array.isArray(l.sezioni)) throw new Error();
        l.id = l.id || "file-" + Date.now().toString(36);
        if (!Archivio.salva(l)) throw new Error();
        location.href = "lezione.html?locale=" + encodeURIComponent(l.id);
      } catch {
        esito.textContent = "😕 Questo file non è una lezione. Scegli il file .json scaricato dall'area insegnante.";
      }
      ev.target.value = "";
    });
  });
})();
