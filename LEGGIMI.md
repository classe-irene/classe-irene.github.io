# La classe di Irene

Sito statico (HTML, CSS, JavaScript) di Matematica e Scienze per la scuola primaria, classi 1ª–5ª.
Non ha bisogno di server né di database: si pubblica gratis con GitHub Pages.

## Pagine
- `index.html`: home con le due materie e le cinque classi
- `sezione.html?materia=scienze&classe=3`: argomenti dell'anno e lezioni salvate
- `lezione.html?file=lezioni/....json`: una lezione con esercizi interattivi
- `area-insegnante.html`: la "lezione in 5 minuti", cifrata con password (AES-256). Il sorgente in chiaro e lo script `cifra.mjs` NON stanno in questo repository: sono nella cartella privata del progetto.

## Aggiungere una lezione per tutti
1. Crea la lezione con "Lezione in 5 minuti" e premi **Scarica il file**.
2. Metti il file nella cartella `lezioni/`.
3. In `assets/curricolo.js`, all'argomento giusto aggiungi `lezione: "lezioni/nome-del-file.json"`.

Le lezioni create e non pubblicate restano salvate solo nel browser in cui sono state create.

## Tipi di esercizio
`scelta`, `vero_falso`, `abbina`, `categorie`, `ordina`, `completa`, `conta`, `retta`, `addizione`.
Il formato esatto di ognuno è scritto nelle istruzioni che prepara l'area insegnante.

## Programmi
Classi prime dal 2026/27: Nuove Indicazioni Nazionali. Classi 2ª–5ª: Indicazioni Nazionali 2012, fino al passaggio graduale (completo nel 2030/31).

## Modalità LIM
Nel pulsante "Modalità LIM" di ogni lezione: schermo intero, una schermata alla volta, tasti grandi.
Si va avanti con le frecce sullo schermo, con le frecce della tastiera o con un telecomando da presentazione (PagSu/PagGiù).

## Immagini e voce
- Ogni emoji all'inizio di un testo ("🍎 mela") diventa un'immagine 3D: cartella `assets/emoji` (Fluent Emoji di Microsoft, licenza MIT, vedi `assets/emoji/LICENZA.txt`).
- La lettura ad alta voce sceglie da sola la voce femminile italiana più naturale del computer; si può cambiare nell'area insegnante.

## Animazioni ed esercizi in colonna
- In una sezione: `"animazione": { "tipo": "moltiplicazione", "a": 23, "b": 14 }` oppure `"tipo": "scomposizione"`. Mostra il calcolo passo passo, con una frase (e la voce) per ogni passo: ▶ Guarda, ⏭ Un passo, ↺ Da capo.
- Esercizio `{ "tipo": "colonna", "a": 32, "b": 24 }`: moltiplicazione in colonna guidata, il bambino scrive le cifre con un tastierino; i riporti compaiono da soli.
- Addizione in colonna di 2ª (somma fino a 99, con o senza cambio): in una sezione `"animazione": { "tipo": "addizione", "a": 27, "b": 15 }` (cubetti + colonna, il cambio di 10 unità in 1 decina e il riporto); esercizio `{ "tipo": "addizione", "a": 27, "b": 15 }` con il tastierino, il riporto compare da solo.
- Scena di scienze `"scena": "seme"`: dal seme di fagiolo alla pianta con fiore e frutto.
- Codice: `assets/animazioni.js`.

## Verifiche da stampare

- Pagina `verifica.html?file=verifiche/nome.json` (o `?locale=id` per quelle create nell'area insegnante).
- Il formato è in `assets/verifica.js` (tipi: scelta, vero_falso, completa, collega, ordina, calcolo, conta, classifica, risposta, disegna).
- `domande_facilitate` è la versione per BES/DSA. Il pulsante "Soluzioni" mostra le risposte in rosso (copia dell'insegnante).
- Si creano nell'area insegnante, scheda "📝 Crea una verifica".

## Giochi, storia e album
Giochi (campo `tipo` negli esercizi): `memory` (coppie), `bucato` (testo con [parole] e distrattori), `crucipuzzle` (parole), `indovina` (parola, indizio), `intruso` (elementi, intruso), `acchiappa` (giusti, sbagliati, quanti), `mescolata` (parola, sillabe con "-").
Campi facoltativi della lezione: `storia` {personaggio, testo, immagini, missione}, `premio` (emoji della figurina), `ricorda` [frasi].
Campi facoltativi di una sezione: `pensa` {domanda, risposta}, `scopri` [{fronte, retro}], `esperimento` {titolo, materiali, passi, domanda}.
Le figurine vinte finiscono in `album.html` (salvate solo su quel computer).
Equivalenze numeriche (k, h, da, u): esercizio `equivalenza` {n, da, a} e video `{"tipo":"scena","scena":"equivalenza","n":3,"da":"h","a":"da"}`.

## Effetti speciali
`assets/effetti.js` (caricato da `lezione.html`): sipario d'apertura (si salta con `&nosipario=1`), entrate delle schede sempre diverse, titoli lettera per lettera, figure che fanno scherzi quando si toccano, "gratta e scopri" per le domande "Pensaci tu", personaggio della storia che commenta, 8 feste diverse per le risposte giuste, serie "🔥 3 di fila!". Si spengono con "✨ Effetti" nella barra della lezione.
Tabella hk dak uk h da u (relazione di equivalenza): esercizio `leggi_tabella` {n, da, a} (anche risultati con la virgola) e video `{"tipo":"scena","scena":"tabella_valore","n":3,"da":"dak","letture":["u","da","h","uk","hk"]}`. La voce legge le sigle per intero.

## Scritte che accompagnano la voce
`Sottotitoli` in `assets/comune.js`: mentre la voce parla, le parole compaiono a schermo (carattere Fredoka) e quella detta si illumina; le parole della lezione hanno la loro iconcina. Pulsante "💬 Scritte" nella lezione. Sopra le scritte compaiono le immagini grandi delle parole della frase (fino a 4): si accendono quando la voce dice la parola. Le immagini vengono dalle etichette brevi della lezione ("🫁 polmoni" in `immagini`, `parole_chiave`, `storia.immagini`); se la frase non ne ha, si vede la figura della scheda letta. I video passano `{ scritte: false }` perché hanno già la didascalia.

## Telecomando della voce
Quando la voce legge (almeno 3 parole), in basso compaiono pulsanti grandi: **⏸ Pausa / ▶ Riprendi**, **🔁 Da capo**, **⏹ Stop**.
La ripresa ricomincia dall'inizio della frase interrotta. Da tastiera: **P** pausa/riprendi, **Esc** stop.
Codice: `Telecomando` e `Voce.pausa / riprendi / daCapo / ferma` in `assets/comune.js`. Lo Stop invia l'evento `voce-ferma` (ferma anche "Ascolta la lezione").

## Pagina del quaderno da ricopiare
Campo facoltativo della lezione: `"quaderno": { "immagine": "immagini/quaderno/....jpg", "titolo": "Ricopiare sul quaderno", "testo": "..." }`.
Compare un pulsante arancione in alto e una scheda con la foto (dopo "Ricordiamo"); toccandola si apre a tutto schermo, con Ingrandisci e Stampa.
Scritte e telecomando compaiono al centro dello schermo. La maniglia gialla "⠿ Trascinami ⠿" li sposta (dito sulla LIM o mouse); la posizione resta salvata su quel computer. Doppio tocco sulla maniglia: torna al centro.

## Frazioni
- Video `{"tipo":"scena","scena":"frazione","n":3,"d":4}` (anche `"forma":"cioccolata"`): intero, parti uguali, unità frazionaria, numeratore e denominatore, complementare. Con `n` più grande di `d` (fino a 2 interi) mostra la frazione impropria o apparente.
- Video `{"tipo":"scena","scena":"frazioni_equivalenti","n":1,"d":2,"k":2}`: due pizze, 1/2 = 2/4, il trucco del "× 2".
- Esercizio `colora_frazione` {n, d, forma}: il bambino tocca le parti da colorare. Esercizio `leggi_frazione` {n, d, forma, chiedi}: sceglie la frazione colorata fra 3 (con `"chiedi":"complementare"` quella rimasta bianca).
- In tutti i testi "3/4" si vede in colonna (numeratore sopra, denominatore sotto) e la voce dice "3 quarti".
## Numeri decimali (classe 5ª)
Tabella h da u , d c m con la virgola ferma in mezzo: × 10, 100, 1000 le cifre vanno a sinistra, : 10, 100, 1000 vanno a destra.
Video `{"tipo":"scena","scena":"decimali","n":"2,35","operazioni":["x10","x100",":10"]}` (senza `operazioni` spiega solo intero, decimi, centesimi, millesimi).
Esercizio `virgola` {n: "2,4", op: "x" oppure ":", per: 10 | 100 | 1000}: il bambino sposta le cifre con le frecce e preme "Ho finito". Numero e risultato devono stare nella tabella (al massimo 3 cifre prima e 3 dopo la virgola).
L'esercizio `retta` mostra i numeri con la virgola (es. `"min": 0, "max": 1, "passo": 0.1, "corretta": 0.7`).

## Corpo umano (classe 5ª)
Video `{"tipo":"scena","scena":"corpo"}`: cervello, polmoni (respirano), cuore (batte), stomaco e intestino, ossa e muscoli, poi "organi in squadra = apparati".
Video `{"tipo":"scena","scena":"cellula"}`: la cellula disegnata con membrana, citoplasma e nucleo, poi la cellula che si divide. Video `{"tipo":"scena","scena":"dalla_cellula"}`: cellula → tessuto → organo → apparato.
Video `{"tipo":"scena","scena":"foglia"}` (la foglia al microscopio: tanti contenitori = cellule) e `{"tipo":"scena","scena":"cellula_vegetale"}` (parete, vacuolo, cloroplasti). La scena `cellula` mostra anche i mitocondri.
Disegni fatti a mano in `assets/disegni/` (mappa `DISEGNI` in `assets/comune.js`): l'emoji 🧫 mostra la cellula animale, 🥬 la cellula vegetale.
Campo facoltativo della lezione: `"verifica": "verifiche/nome.json"` aggiunge la scheda "📝 Verifica da stampare". Nelle verifiche c'è anche il tipo `etichette` {disegno: "assets/disegni/…-numeri.svg", parti: [nomi in ordine 1, 2, 3…], parole?}: un disegno con i numeri, si scrive il nome di ogni parte.

## Palestra delle equivalenze (equivalenze.html)

Pagina a parte con solo equivalenze, un esercizio alla volta (anche in modalità LIM). Tre livelli: 1 (k h da u, esercizio "equivalenza"), 2 (hk dak uk h da u, esercizio "leggi_tabella"), misto. Ogni giro sono 10 esercizi nuovi creati a caso da `assets/palestra.js` (tabella, scelta, vero o falso, completa). Usa `Motore.esercizio` per disegnare un esercizio fuori da una lezione. Pulsante nella home e nelle sezioni di matematica 4ª e 5ª.

## Prove in stile INVALSI (invalsi.html)

`invalsi.html` elenca le prove; `invalsi.html?file=invalsi/x.json` apre una prova. Domande D1, D2…, risposta con la crocetta sulla lettera (massimo 3 opzioni), nessuna correzione durante la prova, tempo facoltativo, risultati per ambito e soluzioni alla consegna. Tipi di domanda: `scelta` {opzioni, corretta}, `numero` {risposta, unita} con tastierino, `vf` {affermazioni:[{testo, vera}]}. Figure facoltative: `figure` (emoji separate da spazi), `pittogramma`, `grafico` (barre), `tabella`, `quadretti`, `rettangolo`. Per aggiungere una prova: un file in `invalsi/` e una riga in `PROVE` dentro `assets/invalsi.js`.
