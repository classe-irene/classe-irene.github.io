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
`scelta`, `vero_falso`, `abbina`, `categorie`, `ordina`, `completa`, `conta`, `retta`.
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
`Sottotitoli` in `assets/comune.js`: mentre la voce parla, le parole compaiono a schermo (carattere Fredoka) e quella detta si illumina; le parole della lezione hanno la loro iconcina. Pulsante "💬 Scritte" nella lezione. I video passano `{ scritte: false }` perché hanno già la didascalia.

## Telecomando della voce
Quando la voce legge (almeno 3 parole), in basso compaiono pulsanti grandi: **⏸ Pausa / ▶ Riprendi**, **🔁 Da capo**, **⏹ Stop**.
La ripresa ricomincia dall'inizio della frase interrotta. Da tastiera: **P** pausa/riprendi, **Esc** stop.
Codice: `Telecomando` e `Voce.pausa / riprendi / daCapo / ferma` in `assets/comune.js`. Lo Stop invia l'evento `voce-ferma` (ferma anche "Ascolta la lezione").

## Pagina del quaderno da ricopiare
Campo facoltativo della lezione: `"quaderno": { "immagine": "immagini/quaderno/....jpg", "titolo": "Ricopiare sul quaderno", "testo": "..." }`.
Compare un pulsante arancione in alto e una scheda con la foto (dopo "Ricordiamo"); toccandola si apre a tutto schermo, con Ingrandisci e Stampa.
Scritte e telecomando compaiono al centro dello schermo. La maniglia gialla "⠿ Trascinami ⠿" li sposta (dito sulla LIM o mouse); la posizione resta salvata su quel computer. Doppio tocco sulla maniglia: torna al centro.
