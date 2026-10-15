// Argomenti per classe e materia, ordinati come un anno scolastico.
// Riferimento: classi prime dal 2026/27 -> Nuove Indicazioni Nazionali (D.M. 2025);
// classi 2ª-5ª -> Indicazioni Nazionali 2012, fino al passaggio graduale.
// Per collegare una lezione pronta basta aggiungere `lezione: "lezioni/nome-file.json"`.

window.SITO = {
  nome: "La classe di Irene",
  motto: "Matematica e Scienze per piccoli esploratori",
  // Classi in cui Irene insegna quest'anno: in evidenza nella home.
  classiInEvidenza: [2, 4],
};

window.MATERIE = {
  matematica: { nome: "Matematica", icona: "🔢", classe: "matematica" },
  scienze: { nome: "Scienze", icona: "🔬", classe: "scienze" },
};

window.RIFERIMENTO = function (classe) {
  return classe === 1
    ? "Nuove Indicazioni Nazionali (in vigore per le classi prime dal 2026/27)"
    : "Indicazioni Nazionali 2012 (in vigore per questa classe nel 2026/27)";
};

window.CURRICOLO = {
  matematica: {
    1: [
      { id: "mat1-insiemi", emoji: "🧺", titolo: "Classificare e raggruppare", descrizione: "Insiemi, uguale e diverso, di più e di meno." },
      { id: "mat1-numeri20", emoji: "🔢", titolo: "I numeri fino a 20", descrizione: "Contare, leggere, scrivere e ordinare i numeri.", lezione: "lezioni/mat1-numeri-fino-a-20.json" },
      { id: "mat1-confronto", emoji: "⚖️", titolo: "Maggiore, minore, uguale", descrizione: "Confrontare quantità e numeri con > < =." },
      { id: "mat1-decina", emoji: "🔟", titolo: "La decina", descrizione: "Raggruppare per dieci: decine e unità." },
      { id: "mat1-addizione", emoji: "➕", titolo: "L'addizione", descrizione: "Aggiungere e unire, sulla linea dei numeri." },
      { id: "mat1-sottrazione", emoji: "➖", titolo: "La sottrazione", descrizione: "Togliere e trovare la differenza." },
      { id: "mat1-spazio", emoji: "🧭", titolo: "Sopra, sotto, destra, sinistra", descrizione: "Orientarsi nello spazio e sul foglio." },
      { id: "mat1-forme", emoji: "🔺", titolo: "Le forme intorno a noi", descrizione: "Cerchio, quadrato, triangolo, rettangolo." },
      { id: "mat1-problemi", emoji: "🧩", titolo: "Piccoli problemi", descrizione: "Raccontare e risolvere situazioni con i numeri." },
      { id: "mat1-algoritmi", emoji: "🤖", titolo: "Istruzioni in fila", descrizione: "Primi algoritmi: seguire e dare comandi in ordine." },
    ],
    2: [
      { id: "mat2-numeri100", emoji: "💯", titolo: "I numeri fino a 100", descrizione: "Decine e unità, valore posizionale.", lezione: "lezioni/mat2-numeri-fino-a-100.json" },
      { id: "mat2-addcambio", emoji: "➕", titolo: "Addizioni in colonna", descrizione: "Con e senza cambio." },
      { id: "mat2-sottcambio", emoji: "➖", titolo: "Sottrazioni in colonna", descrizione: "Con e senza prestito." },
      { id: "mat2-moltiplicazione", emoji: "✖️", titolo: "La moltiplicazione", descrizione: "Addizioni ripetute e schieramenti." },
      { id: "mat2-tabelline", emoji: "🎶", titolo: "Le tabelline", descrizione: "Dalla tabellina del 2 a quella del 10." },
      { id: "mat2-divisione", emoji: "🍕", titolo: "Dividere in parti uguali", descrizione: "Distribuire e raggruppare." },
      { id: "mat2-pari", emoji: "👯", titolo: "Pari e dispari", descrizione: "Riconoscere i numeri pari e dispari." },
      { id: "mat2-linee", emoji: "〰️", titolo: "Linee e confini", descrizione: "Linee aperte, chiuse, regioni interne ed esterne." },
      { id: "mat2-misure", emoji: "📏", titolo: "Misurare con il corpo", descrizione: "Misure arbitrarie: spanne, passi, matite." },
      { id: "mat2-euro", emoji: "💶", titolo: "Le monete e l'euro", descrizione: "Contare soldi e fare la spesa." },
    ],
    3: [
      { id: "mat3-migliaia", emoji: "🏰", titolo: "I numeri fino a 1000", descrizione: "Centinaia, decine, unità." },
      { id: "mat3-operazioni", emoji: "🧮", titolo: "Le quattro operazioni", descrizione: "Proprietà e calcolo in colonna." },
      { id: "mat3-divisione", emoji: "➗", titolo: "La divisione in colonna", descrizione: "Con una cifra al divisore, con il resto." },
      { id: "mat3-frazioni", emoji: "🍰", titolo: "Le frazioni", descrizione: "L'intero diviso in parti uguali." },
      { id: "mat3-decimali", emoji: "🔸", titolo: "Decimi e centesimi", descrizione: "Primi numeri decimali." },
      { id: "mat3-angoli", emoji: "📐", titolo: "Gli angoli", descrizione: "Retto, acuto, ottuso." },
      { id: "mat3-poligoni", emoji: "⬠", titolo: "I poligoni", descrizione: "Lati, vertici e perimetro." },
      { id: "mat3-misure", emoji: "📏", titolo: "Le misure di lunghezza", descrizione: "Metro, multipli e sottomultipli." },
      { id: "mat3-dati", emoji: "📊", titolo: "Indagini e grafici", descrizione: "Raccogliere dati e fare istogrammi." },
      { id: "mat3-problemi", emoji: "🧩", titolo: "Problemi con due domande", descrizione: "Dati, domanda, operazioni." },
    ],
    4: [
      { id: "mat4-grandi", emoji: "🚀", titolo: "I grandi numeri", descrizione: "Migliaia e classi di numeri.", lezione: "lezioni/mat4-grandi-numeri.json" },
      { id: "mat4-equivalenze", emoji: "🔄", titolo: "Le equivalenze con i numeri", descrizione: "Unità, decine, centinaia e migliaia.", lezione: "lezioni/mat4-equivalenze-numeriche.json" },
      { id: "mat4-moltiplicazioni", emoji: "✖️", titolo: "Moltiplicazioni a due cifre", descrizione: "Calcolo in colonna e stime.", lezione: "lezioni/mat4-moltiplicazioni-due-cifre.json" },
      { id: "mat4-divisioni", emoji: "➗", titolo: "Divisioni a due cifre", descrizione: "Divisore a due cifre e prova." },
      { id: "mat4-frazioni", emoji: "🍕", titolo: "Frazioni proprie e improprie", descrizione: "Frazioni equivalenti e complementari." },
      { id: "mat4-decimali", emoji: "🔸", titolo: "I numeri decimali", descrizione: "Operazioni con i decimali." },
      { id: "mat4-perimetro", emoji: "🟩", titolo: "Perimetro dei poligoni", descrizione: "Triangoli e quadrilateri." },
      { id: "mat4-area", emoji: "🧱", titolo: "Il concetto di area", descrizione: "Superfici equiestese e unità di misura." },
      { id: "mat4-misure", emoji: "⚖️", titolo: "Peso e capacità", descrizione: "Chilogrammo, litro, multipli e sottomultipli." },
      { id: "mat4-probabilita", emoji: "🎲", titolo: "Certo, possibile, impossibile", descrizione: "Primi passi nella probabilità." },
      { id: "mat4-problemi", emoji: "🧩", titolo: "Problemi con le misure", descrizione: "Peso lordo, netto, tara e compravendita." },
    ],
    5: [
      { id: "mat5-milioni", emoji: "🌌", titolo: "Milioni e miliardi", descrizione: "Numeri grandissimi e potenze." },
      { id: "mat5-potenze", emoji: "⚡", titolo: "Le potenze", descrizione: "Base, esponente e notazione." },
      { id: "mat5-multipli", emoji: "🔗", titolo: "Multipli, divisori e primi", descrizione: "Criteri di divisibilità." },
      { id: "mat5-relativi", emoji: "🌡️", titolo: "I numeri negativi", descrizione: "Temperature e retta dei numeri relativi." },
      { id: "mat5-percentuali", emoji: "💯", titolo: "Le percentuali", descrizione: "Sconti, aumenti e frazioni." },
      { id: "mat5-aree", emoji: "📐", titolo: "Area dei poligoni", descrizione: "Formule per triangoli e quadrilateri." },
      { id: "mat5-cerchio", emoji: "⭕", titolo: "Il cerchio", descrizione: "Circonferenza, raggio, diametro." },
      { id: "mat5-solidi", emoji: "🧊", titolo: "I solidi", descrizione: "Sviluppi e volume." },
      { id: "mat5-statistica", emoji: "📊", titolo: "Media, moda, mediana", descrizione: "Leggere e interpretare dati." },
      { id: "mat5-espressioni", emoji: "🧠", titolo: "Le espressioni", descrizione: "Ordine delle operazioni e parentesi." },
    ],
  },
  scienze: {
    1: [
      { id: "sci1-sensi", emoji: "👀", titolo: "I cinque sensi", descrizione: "Esplorare il mondo con vista, udito, tatto, gusto, olfatto." },
      { id: "sci1-corpo", emoji: "🧍", titolo: "Il mio corpo", descrizione: "Le parti del corpo e come muoversi." },
      { id: "sci1-viventi", emoji: "🌱", titolo: "Viventi e non viventi", descrizione: "Che cosa nasce, cresce e si riproduce?" },
      { id: "sci1-oggetti", emoji: "🧸", titolo: "Gli oggetti e i materiali", descrizione: "Legno, plastica, metallo, carta, vetro." },
      { id: "sci1-stagioni", emoji: "🍂", titolo: "Le stagioni", descrizione: "Come cambia la natura durante l'anno." },
      { id: "sci1-tempo", emoji: "☀️", titolo: "Che tempo fa?", descrizione: "Sole, pioggia, vento, neve." },
      { id: "sci1-piante", emoji: "🌻", titolo: "Le piante del giardino", descrizione: "Radici, fusto, foglie e fiori." },
      { id: "sci1-animali", emoji: "🐾", titolo: "Gli animali intorno a noi", descrizione: "Dove vivono e come si muovono." },
    ],
    2: [
      { id: "sci2-materia", emoji: "🧊", titolo: "Solidi, liquidi e gas", descrizione: "Gli stati della materia.", lezione: "lezioni/sci2-solidi-liquidi-gas.json" },
      { id: "sci2-acqua", emoji: "💧", titolo: "L'acqua", descrizione: "Proprietà e trasformazioni dell'acqua." },
      { id: "sci2-semi", emoji: "🌰", titolo: "Dal seme alla pianta", descrizione: "La germinazione e la crescita." },
      { id: "sci2-ciclovita", emoji: "🔄", titolo: "Il ciclo della vita", descrizione: "Nascere, crescere, riprodursi, morire." },
      { id: "sci2-animali", emoji: "🦁", titolo: "Classificare gli animali", descrizione: "Cosa mangiano, come nascono, come si muovono." },
      { id: "sci2-ambienti", emoji: "🏞️", titolo: "Gli ambienti naturali", descrizione: "Bosco, prato, mare, montagna." },
      { id: "sci2-rifiuti", emoji: "♻️", titolo: "La raccolta differenziata", descrizione: "Rispettare l'ambiente." },
      { id: "sci2-esperimenti", emoji: "🧪", titolo: "Il metodo dello scienziato", descrizione: "Osservare, fare ipotesi, provare." },
    ],
    3: [
      { id: "sci3-metodo", emoji: "🔬", titolo: "Il metodo scientifico", descrizione: "Domanda, ipotesi, esperimento, conclusione." },
      { id: "sci3-materia", emoji: "⚛️", titolo: "La materia e i suoi stati", descrizione: "Passaggi di stato." },
      { id: "sci3-acqua", emoji: "🌧️", titolo: "Il ciclo dell'acqua", descrizione: "Evaporazione, condensazione, precipitazione.", lezione: "lezioni/sci3-ciclo-dell-acqua.json" },
      { id: "sci3-aria", emoji: "🌬️", titolo: "L'aria", descrizione: "Proprietà dell'aria e il vento." },
      { id: "sci3-suolo", emoji: "🪱", titolo: "Il suolo", descrizione: "Strati del terreno e piccoli abitanti." },
      { id: "sci3-piante", emoji: "🌿", titolo: "Le piante", descrizione: "Parti della pianta e fotosintesi." },
      { id: "sci3-animali", emoji: "🐸", titolo: "Vertebrati e invertebrati", descrizione: "Classificare il regno animale." },
      { id: "sci3-catene", emoji: "🦊", titolo: "Le catene alimentari", descrizione: "Produttori, consumatori, decompositori." },
    ],
    4: [
      { id: "sci4-cellula", emoji: "🧫", titolo: "La cellula", descrizione: "Il mattoncino della vita." },
      { id: "sci4-regni", emoji: "🍄", titolo: "I cinque regni", descrizione: "Batteri, protisti, funghi, piante, animali.", lezione: "lezioni/sci4-cinque-regni.json" },
      { id: "sci4-piante", emoji: "🌸", titolo: "Riproduzione delle piante", descrizione: "Fiore, impollinazione, frutto e seme." },
      { id: "sci4-invertebrati", emoji: "🐝", titolo: "Gli invertebrati", descrizione: "Insetti, molluschi, aracnidi..." },
      { id: "sci4-vertebrati", emoji: "🐬", titolo: "I vertebrati", descrizione: "Pesci, anfibi, rettili, uccelli, mammiferi." },
      { id: "sci4-ecosistemi", emoji: "🌳", titolo: "Gli ecosistemi", descrizione: "Equilibri tra viventi e ambiente." },
      { id: "sci4-calore", emoji: "🔥", titolo: "Calore e temperatura", descrizione: "Il termometro e la dilatazione." },
      { id: "sci4-miscugli", emoji: "🥣", titolo: "Miscugli e soluzioni", descrizione: "Separare e sciogliere." },
    ],
    5: [
      { id: "sci5-corpo", emoji: "🫀", titolo: "Il corpo umano", descrizione: "Organi, apparati e sistemi." },
      { id: "sci5-digerente", emoji: "🍎", titolo: "Apparato digerente", descrizione: "Il viaggio del cibo." },
      { id: "sci5-respiratorio", emoji: "🫁", titolo: "Respiratorio e circolatorio", descrizione: "Polmoni, cuore e sangue." },
      { id: "sci5-nervoso", emoji: "🧠", titolo: "Il sistema nervoso", descrizione: "Cervello, nervi e sensi." },
      { id: "sci5-salute", emoji: "🥗", titolo: "Alimentazione e salute", descrizione: "La piramide alimentare e i corretti stili di vita." },
      { id: "sci5-energia", emoji: "⚡", titolo: "L'energia", descrizione: "Fonti rinnovabili e non rinnovabili." },
      { id: "sci5-luce", emoji: "🌈", titolo: "Luce e suono", descrizione: "Come viaggiano luce e suono." },
      { id: "sci5-universo", emoji: "🪐", titolo: "Il Sistema solare", descrizione: "Il Sole, i pianeti e la Luna." },
    ],
  },
};
