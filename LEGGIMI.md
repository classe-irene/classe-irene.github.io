# La classe di Irene

Sito statico (HTML, CSS, JavaScript) di Matematica e Scienze per la scuola primaria, classi 1ª–5ª.
Non ha bisogno di server né di database: si pubblica gratis con GitHub Pages.

## Pagine
- `index.html`: home con le due materie e le cinque classi
- `sezione.html?materia=scienze&classe=3`: argomenti dell'anno e lezioni salvate
- `lezione.html?file=lezioni/....json`: una lezione con esercizi interattivi
- `cinque-minuti.html`: la "lezione in 5 minuti"

## Aggiungere una lezione per tutti
1. Crea la lezione con "Lezione in 5 minuti" e premi **Scarica il file**.
2. Metti il file nella cartella `lezioni/`.
3. In `assets/curricolo.js`, all'argomento giusto aggiungi `lezione: "lezioni/nome-del-file.json"`.

Le lezioni create e non pubblicate restano salvate solo nel browser in cui sono state create.

## Tipi di esercizio
`scelta`, `vero_falso`, `abbina`, `categorie`, `ordina`, `completa`, `conta`, `retta`.
Il formato esatto di ognuno è scritto nelle istruzioni che prepara `cinque-minuti.html`.

## Programmi
Classi prime dal 2026/27: Nuove Indicazioni Nazionali. Classi 2ª–5ª: Indicazioni Nazionali 2012, fino al passaggio graduale (completo nel 2030/31).
