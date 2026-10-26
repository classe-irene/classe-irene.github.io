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
- **Verifica online** (`verifica.html?file=…&modo=online`, pulsante "💻 Online, con correzione"): le stesse domande diventano interattive (crocette, V/F, caselle da scrivere, tendine per collega e classifica, numeri per ordina/calcolo/conta). "✅ Correggi" colora in verde/rosso, mostra la risposta giusta, il punteggio, le stelle e il livello. Le parole scritte valgono anche senza accenti e maiuscole (e basta la prima parola: "membrana" per "membrana cellulare"). `risposta` la corregge la maestra, `disegna` si fa su carta. Codice: `assets/verifica-online.js`.

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
La ripresa riparte dalla parola interrotta (se il computer non lo dice, due parole prima). Il telecomando compare per ogni voce, anche nei video e negli esercizi: lì sta in basso, solo con i pulsanti. Uscendo dalla pagina la voce si ferma. Nei video "⏸ Pausa / ▶ Riprendi" fa lo stesso. Da tastiera: **P** pausa/riprendi, **Esc** stop.
Codice: `Telecomando` e `Voce.pausa / riprendi / daCapo / ferma` in `assets/comune.js`. Lo Stop invia l'evento `voce-ferma` (ferma anche "Ascolta la lezione").

## Pagina del quaderno da ricopiare
Campo facoltativo della lezione: `"quaderno": { "immagine": "immagini/quaderno/....jpg", "titolo": "Ricopiare sul quaderno", "testo": "..." }`.
Compare un pulsante arancione in alto e una scheda con la foto (dopo "Ricordiamo"); toccandola si apre a tutto schermo, con Ingrandisci e Stampa.
Scritte e telecomando compaiono al centro dello schermo. La maniglia gialla "⠿ Trascinami ⠿" li sposta (dito sulla LIM o mouse); la posizione resta salvata su quel computer. Doppio tocco sulla maniglia: torna al centro. I pulsanti ➖ e ➕ accanto alla maniglia lo rimpiccioliscono o ingrandiscono (mai oltre lo schermo); anche la misura resta salvata.

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

## Lezione modello (prototipo: `lezioni/sci4-la-cellula.json`)
Ogni lezione segue lo stesso schema: narratrice femminile con `storia` e `missione`, `premio`, `parole_chiave`, 3-5 sezioni (ognuna con `immagini` che seguono il testo e almeno un'attività: video, `scopri`, `pensa` o `esperimento`; almeno 2 video per lezione), 22-24 esercizi di tipi diversi, `ricorda` e `verifica` (`verifiche/<stesso nome>.json`, standard + facilitata, correggibile online).
Video per qualunque argomento: `{"tipo":"sequenza","video":true,"titolo":"…","passi":[{"figure":"🌱 → 🌳","testo":"…"}]}`.
Le emoji dei tasti numerici (1️⃣ … 🔟) diventano immagini come le altre.

## La settimana (esercizi divisi per giorno)
Campo facoltativo della lezione: `"settimana": [{ "giorno": "Lunedì", "ore": 2, "esercizi": 10 }, ...]` (gli esercizi, in ordine, devono essere in tutto quanti quelli della lezione).
In alto compaiono i pulsanti dei giorni ("tocca il giorno di oggi"): portano al primo esercizio di quel giorno, anche in modalità LIM. Prima di ogni gruppo c'è il cartello del giorno; ogni esercizio dice giorno e ora ("Esercizio 6 · Lunedì, 2ª ora"), con le ore divise in parti uguali.
Per tornare su: la freccia blu "⬆ Giorni" in basso a destra (compare scorrendo la pagina), il pulsante "⬆ Torna ai giorni" su ogni cartello e, in modalità LIM, "📅 Giorni" nella barra in basso. Nelle lezioni senza settimana la freccia dice "⬆ Su" e torna in cima.

## Scomporre, comporre, confrontare (classe 4ª)
Stessa tabella hk dak uk h da u, numeri fino a 999 999. Gli 0 segnaposto sono in arancione.
- Video `{"tipo":"scena","scena":"scomponi","n":7254}`: le cifre entrano dall'ultima a destra, poi quanto vale ognuna e la somma (7 254 = 7 000 + 200 + 50 + 4).
- Video `{"tipo":"scena","scena":"componi","n":62507}`: dai pezzi (6 dak 2 uk 5 h 7 u) al numero, con lo 0 segnaposto e il numero in lettere.
- Video `{"tipo":"scena","scena":"confronto","a":4352,"b":4318}`: i due numeri uno sotto l'altro; conta le cifre oppure confronta casella per casella da sinistra.
- Video `{"tipo":"scena","scena":"fila","numeri":[4000,400,40000]}`: ordine crescente e decrescente come una scala.
- Esercizio `componi` {n, lettere?, mescola?}: il bambino scrive le cifre con il tastierino, casella per casella (anche lo 0); con `lettere` poi sceglie il numero scritto in lettere.
- Esercizio `scomponi` {n}: per ogni cifra sceglie quanto vale (es. 4 → 4 000).
- Esercizio `confronta` {a, b, uguale?}: tasti < minore e > maggiore (= solo se i numeri sono uguali o con `uguale`); se sbaglia, la tabella illumina la casella che decide.
- La voce legge "<" come "è minore di", ">" come "è maggiore di", "+" come "più".

## Divisione in colonna con la filastrocca (classe 4ª)
Le quattro parole della filastrocca guidano il calcolo e si accendono a turno: 👒 **Cappellino** (copre tante cifre quante il divisore, una in più se non basta), 🎶 **Tabellina** (quante volte ci sta, si scrive sotto la linea), ➖ **Resto** (sotto il dividendo si scrive solo il resto), 🛗 **Ascensore** (la cifra dopo scende accanto al resto).
- Nel video, sopra la colonna, compare il verso della filastrocca di quel passo (la voce lo dice e poi spiega i numeri).
- Video in una sezione: `"animazione": { "tipo": "divisione", "a": 156, "b": 12, "video": true, "titolo": "156 : 12" }`. Nei video e nella filastrocca la divisione è **per esteso**: sotto il numero si scrive il prodotto, si tira la linea e si sottrae cifra per cifra da destra, con il prestito quando serve (cifra barrata e piccolo 1). Anche il disegno del quaderno della lezione guidata è per esteso. L'esercizio resta con i soli resti. Di lato: la tabellina del divisore (giusti in verde, "troppo" in rosso) e la lavagnetta con moltiplicazione e sottrazione; alla fine la prova.
- Esercizio `{ "tipo": "divisione", "a": 168, "b": 12 }`: il bambino tocca l'ultima cifra del cappellino, scrive quoziente e resto con il tastierino e tocca la cifra che scende. La tabellina del divisore è sempre in vista (strumento compensativo per DSA); se sbaglia, i suggerimenti dicono perché ("2 × 12 = 24: è troppo!").
- Limiti: dividendo fino a 9999, divisore da 2 a 99, dividendo non più piccolo del divisore. Lezione: `lezioni/mat4-divisioni-due-cifre.json`.
- Lezione `lezioni/mat4-divisioni-una-cifra.json` (divisore di una cifra), prima della 4ª.

## Lezione in evidenza
In `assets/curricolo.js` un argomento con `evidenza: true` compare in grande, con il nastro "⭐ In evidenza", nella pagina della classe e nella home.
- Campo facoltativo della lezione `filastrocca`: `{ "titolo": "👑 ...", "strofe": [["😉 verso", "👒 verso"], ...] }`. Compare all'inizio, a colori e animata; il pulsante "🔊 Ascolta la filastrocca" la fa leggere alla voce verso per verso (si ferma toccandolo di nuovo). Usata in `mat4-divisioni-una-cifra`.
  - Con `"divisione": { "a": 156, "b": 4 }` accanto ai versi compare una divisione vera che fa un passo per ogni verso (chiavi predefinite: occhio, cappello, tabellina, linea, resto, —, ascensore, ricomincio; si cambiano con `"chiavi"`). Toccando un verso si vede il suo passo; ci sono anche "⏭ Un passo" e "↺ Da capo". Con l'ascolto, la voce dice il verso e poi spiega i numeri; finiti i versi, la divisione continua fino alla prova.

## Lezione guidata (prova: `lezioni/mat4-divisioni-una-cifra.json`)
Pulsante arancione "⏱️ Lezione guidata" (anche nella barra della modalità LIM). Codice: `assets/guida.js`.
- **Piano di oggi**: si sceglie quanti minuti ci sono (30, 45, 60, 90, 120) e il sito li divide fra le fasi 👂 Ascolto, 👀 Guardo, ✍️ Copio, 🎯 Provo, 📝 Verifico; ogni fase si allunga o accorcia di un minuto (− +) o si salta. Il piano resta salvato su quel computer.
- **Scaletta** in alto con la fase di adesso accesa (toccando una fase ci si va). **Orologio a torta** spostabile (maniglia gialla; toccandolo diventa piccolo): ⏸ pausa, +1 minuto, ⏭ fase dopo. A un minuto dalla fine diventa arancione e la voce lo dice; allo scadere suona la campanella e dopo 5 secondi si passa alla fase dopo ("➕ Ancora 1 minuto" per aspettare).
- **Semaforo**: 🟢 al lavoro, 🟡 stiamo per finire, 🔴 schermo rosso "Penne giù! Occhi alla LIM" (si tocca per tornare al verde). A ogni fase nuova torna verde.
- **Copia sul quaderno**: campo della lezione `"copia": { "titolo": "...", "righe": [fino a 6 frasi], "divisione": { "a": 96, "b": 4 } }`. Righe numerate che compaiono una alla volta (nella lezione guidata da sole, con il tempo diviso fra le righe, e la voce le legge), accanto al disegno della pagina del quaderno a quadretti (le righe ancora da scrivere sono grigie). Per ora la lezione guidata compare solo nelle lezioni con `copia`.
- In 📝 Verifico la verifica online si apre dentro la lezione, così l'orologio resta in vista.
- **Pagina semplice** (solo nelle lezioni con la lezione guidata): sotto il titolo c'è un solo pulsante grande, "▶ Comincia la lezione". Tutti gli altri (Ascolta, Esercizi, LIM, Scritte, Voce, Suoni, Maiuscolo, Effetti) sono chiusi in "☰ Strumenti della maestra".
- **Navigatore** in basso durante la lezione guidata, sempre uguale: 📍 dove siamo (fase e pagina), 👉 cosa fare adesso, "Dopo:" cosa viene dopo, un solo grande pulsante verde "Avanti" (alla fine di una fase diventa "Copio ➡", "Provo ➡"…) e ◀ per tornare indietro. Il pulsante da toccare sulla pagina (▶ Guarda, 🔊 Leggi, 🔊 Ascolta la filastrocca…) si illumina con "👇 Tocca qui". Avanti e le frecce della tastiera restano dentro la fase.
- Fasi delle pagine: 👂 Ascolto = titolo, filastrocca, storia; 👀 Guardo = le schede (anche Ricordiamo e Parole); ✍️ Copio = copia e quaderno; 🎯 Provo = esercizi; 📝 Verifico = verifica (con `&dentro=1` la verifica si vede senza testata e pulsanti).
- **☰ Maestra** (in basso a destra) contiene semaforo, ⏸ Ferma / +1 minuto, ⏭ Salta alla fase dopo, ✕ Finisci la lezione. L'orologio parte piccolo (toccandolo si ingrandisce). Durante la lezione guidata il personaggio, il punteggio e la barra della LIM si nascondono.


## Senza internet (PC della LIM)

`node strumenti/pacchetto-offline.mjs <cartella>` prepara la cartella "La classe di Irene": si apre con doppio clic su "Apri le lezioni.html", senza internet e senza installare nulla. Lezioni, verifiche e prove INVALSI finiscono tutte in `sito/assets/pacchetto.js` (letto da `leggiJSON` in comune.js), i caratteri sono in `assets/caratteri/`, l'area insegnante non c'è. Senza rete la voce usa solo le voci installate sul computer (su Windows: Elsa).

## Vieni alla lavagna
In ogni lezione ogni bambino ha la sua **lettera**: premendola sulla tastiera compare grande "Nome! Vieni alla lavagna!" e la voce lo dice. **L** (o il pulsantino 🙋 quasi trasparente in basso a destra, in modalità LIM) apre l'elenco: si aggiungono nomi con la loro lettera, si tolgono, e toccando un nome lo si chiama. L e P non si possono usare (elenco e pausa della voce). Esc chiude.
I nomi restano solo su quel computer, mai nel sito. Per caricarli tutti insieme si apre una volta un indirizzo della lezione con in fondo `#nomi=a:Anna:f:biondi:chiara;t:Tommaso:m:neri:scura` (lettera:nome:m o f:capelli:pelle; capelli biondi, castani chiari, castani scuri, castani più scuri, neri, rossi; pelle chiara, olivastra, scura, molto scura). Ogni bambino ha il suo disegno con la mano alzata (la parte dopo # non viene mandata al sito e sparisce subito dall'indirizzo).

Aggiornamenti piccoli: passando come secondo argomento il `versione.json` dell'ultima cartella consegnata (copia in `/mnt/project-files/classe-irene-archivio/ultima-versione.json`), lo script prepara anche "<cartella> - solo novità" con i soli file nuovi o cambiati; si estrae sopra la cartella che c'è già, sostituendo i file. In fondo alla home compare "📦 Versione senza internet del …".
