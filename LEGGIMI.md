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
