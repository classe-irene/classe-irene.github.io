import json, sys
N, S, D, R, M = "Numeri", "Spazio e figure", "Dati e previsioni", "Relazioni e funzioni", "Prova mista"
def sc(testo, img, opz, c, sp, **k): return dict(tipo="scelta", immagine=img, testo=testo, opzioni=opz, corretta=c, spiegazione=sp, **k)
def nu(testo, img, ris, unita, sp, **k): return dict(tipo="numero", immagine=img, testo=testo, risposta=str(ris), unita=unita, spiegazione=sp, **k)
def vf(testo, img, aff, sp, **k): return dict(tipo="vf", immagine=img, testo=testo, affermazioni=[dict(testo=t, vera=v) for t, v in aff], spiegazione=sp, **k)
def q(r, c, celle, testo=None): d = dict(righe=r, colonne=c, celle=celle); return d
def riga(n, col=None): return [[0, i] + ([col] if col else []) for i in range(n)]

S1 = [
 sc("Quale numero viene subito dopo il 29?", "🐸", ["28", "30", "39"], 1, "Dopo il 29 viene il 30. 29 + 1 = 30.",
    retta=dict(da=24, a=31, passo=1, etichette=[24, 25, 26, 27, 28, 29], vuoto=30)),
 sc("Quale numero viene subito prima del 40?", "🚂", ["41", "39", "30"], 1, "Prima del 40 c'è il 39. 40 − 1 = 39.",
    retta=dict(da=36, a=43, passo=1, etichette=[40, 41, 42, 43], vuoto=39)),
 sc("Osserva la retta dei numeri. Quale numero va nel cartellino vuoto?", "📏", ["13", "15", "16"], 0, "Dopo il 12 viene il 13.",
    retta=dict(da=10, a=17, passo=1, etichette=[10, 11, 12], vuoto=13)),
]
G2 = dict(righe=3, colonne=3, oggetti=[[0, 0, "🐱"], [0, 1, "🌞"], [0, 2, "⚽"], [1, 0, "🍎"], [1, 1, "🐰"], [1, 2, "🎈"], [2, 0, "🐶"], [2, 1, "🌸"], [2, 2, "⭐"]])
S2 = [
 sc("Che cosa c'è subito sotto il gatto?", "🐱", ["🍎 la mela", "🐶 il cane", "🐰 il coniglio"], 0, "Subito sotto il gatto c'è la mela. Il cane è più giù.", griglia=G2),
 sc("Che cosa c'è a destra del coniglio?", "🐰", ["🍎 la mela", "🎈 il palloncino", "🌸 il fiore"], 1, "Il coniglio è al centro. A destra, nella stessa riga, c'è il palloncino.", griglia=G2),
 sc("Dove si trova il pallone?", "⚽", ["in alto a destra", "in alto a sinistra", "in basso a destra"], 0, "Il pallone è nella riga in alto, nella casella a destra.", griglia=G2),
]
P3 = dict(titolo="🐾 Gli animali preferiti", legenda="🙂 = 1 bambino", simbolo="🙂",
          righe=[dict(etichetta="🐶 Cane", quanti=6), dict(etichetta="🐱 Gatto", quanti=4), dict(etichetta="🐰 Coniglio", quanti=2)])
S3 = [
 sc("Quale animale piace a più bambini?", "📊", ["🐶 il cane", "🐱 il gatto", "🐰 il coniglio"], 0, "Il cane ha la riga più lunga: 6 bambini.", pittogramma=P3),
 nu("Quanti bambini preferiscono il gatto?", "🐱", 4, "bambini", "Nella riga del gatto ci sono 4 faccine.", pittogramma=P3),
 sc("Il cane piace a più bambini del gatto. Quanti bambini in più?", "🐶", ["2", "4", "10"], 0, "Cane 6, gatto 4. 6 − 4 = 2.", pittogramma=P3),
]
S4 = [
 nu("In ogni scatola ci sono 10 pastelli. Ci sono 3 scatole e 4 pastelli fuori. Quanti pastelli in tutto?", "🖍️", 34, "pastelli",
    "3 scatole sono 3 decine: 30. Più 4: 34.", insiemi=[dict(etichetta="10", figure="📦", piccole=True), dict(etichetta="10", figure="📦", piccole=True), dict(etichetta="10", figure="📦", piccole=True), dict(etichetta="4", figure="🖍️🖍️🖍️🖍️", piccole=True)]),
 sc("Nel numero 47, quante sono le decine?", "🔟", ["4", "7", "47"], 0, "47 = 4 decine e 7 unità.", figure="47"),
 sc("Al numero 23 aggiungi 1 decina. Quale numero ottieni?", "➕", ["24", "33", "13"], 1, "1 decina è 10. 23 + 10 = 33.", figure="23 + 10"),
]
S5 = [
 sc("Quale di queste cose ha la forma di un cerchio?", "⭕", ["🍕 la fetta di pizza", "🕒 l'orologio", "📘 il libro"], 1, "L'orologio è rotondo: ha la forma del cerchio."),
 sc("Quanti lati ha il triangolo?", "🔺", ["3", "4", "5"], 0, "Il triangolo ha 3 lati: tri vuol dire tre.", figure="🔺"),
 nu("Quanti quadretti colorati ci sono nella figura?", "🟩", 6, "quadretti", "Conta uno alla volta: sono 6 quadretti.",
    quadretti=dict(righe=3, colonne=5, celle=[[0, 1], [1, 1], [2, 1], [2, 2], [2, 3], [1, 3]])),
]
S6 = [
 sc("Nel sacchetto ci sono solo palline rosse. Prendi una pallina senza guardare. Quale frase è vera?", "🙈",
    ["È CERTO: la pallina è rossa", "È POSSIBILE: la pallina è blu", "È IMPOSSIBILE: la pallina è rossa"], 0,
    "Ci sono solo palline rosse: è certo che prendi una pallina rossa.", insiemi=[dict(etichetta="Il sacchetto", figure="🔴🔴🔴🔴🔴")]),
 sc("Un gatto vola nel cielo come un uccellino. Questo è…", "🐱", ["certo", "possibile", "impossibile"], 2, "I gatti non hanno le ali: è impossibile che volino."),
 sc("Nel sacchetto ci sono palline rosse e palline blu. Prendi una pallina senza guardare. Che sia rossa è…", "🙈",
    ["certo", "possibile", "impossibile"], 1, "Ci sono palline rosse e blu: la pallina può essere rossa, ma anche blu. È possibile.",
    insiemi=[dict(etichetta="Il sacchetto", figure="🔴🔴🔵🔵🔵")]),
]
S7 = [
 nu("Marta ha 9 conchiglie. Ne trova altre 4. Quante conchiglie ha adesso?", "🐚", 13, "conchiglie", "9 + 4 = 13.", figure="🐚🐚🐚🐚🐚🐚🐚🐚🐚 + 🐚🐚🐚🐚"),
 sc("Sull'albero ci sono 15 mele. Ne cadono 7. Quante mele restano sull'albero?", "🌳", ["8", "22", "7"], 0, "15 − 7 = 8.", figure="🍎🍎🍎🍎🍎 🍎🍎🍎🍎🍎 🍎🍎🍎🍎🍎"),
 sc("Quale numero manca?", "🧩", ["6", "14", "5"], 0, "6 + 4 = 10.", figure="❓ + 4 = 10"),
]
FILA = [dict(etichetta=n, figure=e, cornice=False) for n, e in [("Anna", "👧"), ("Bruno", "👦"), ("Carla", "👧"), ("Dario", "👦"), ("Elsa", "👧")]]
S8 = [
 sc("I bambini sono in fila. Anna è la prima. Chi è il terzo?", "🚶", ["Bruno", "Carla", "Dario"], 1, "Contiamo: 1 Anna, 2 Bruno, 3 Carla.", insiemi=FILA),
 sc("Chi c'è tra Bruno e Dario?", "👀", ["Anna", "Carla", "Elsa"], 1, "Tra Bruno e Dario c'è Carla.", insiemi=FILA),
 sc("Elsa è l'ultima della fila. Quanti bambini ci sono prima di Elsa?", "🔢", ["4", "5", "3"], 0, "Prima di Elsa ci sono Anna, Bruno, Carla e Dario: 4 bambini.", insiemi=FILA),
]
T9 = dict(intestazioni=["", "🍎 Mela", "🍌 Banana", "🍐 Pera"], righe=[["Luca", "X", "", ""], ["Sara", "", "X", "X"], ["Tommaso", "X", "X", ""]])
S9 = [
 sc("La tabella dice che cosa hanno mangiato i bambini a merenda. Che cosa ha mangiato Sara?", "📋", ["la mela e la banana", "la banana e la pera", "solo la pera"], 1, "Nella riga di Sara ci sono le X sotto la banana e sotto la pera.", tabella=T9),
 nu("Quanti bambini hanno mangiato la mela?", "🍎", 2, "bambini", "Sotto la mela ci sono 2 X: Luca e Tommaso.", tabella=T9),
 vf("Leggi le frasi. Sono vere o false?", "🤔", [("Luca ha mangiato la pera.", False), ("Tommaso ha mangiato due frutti.", True)], "Luca ha mangiato solo la mela. Tommaso la mela e la banana: due frutti.", tabella=T9),
]
S10 = [
 sc("Quanto fa il doppio di 4?", "🍪", ["6", "8", "44"], 1, "Doppio vuol dire due volte: 4 + 4 = 8.", figure="🍪🍪🍪🍪 🍪🍪🍪🍪"),
 sc("Quanto fa la metà di 10?", "🍓", ["5", "20", "2"], 0, "Metà vuol dire dividere in due parti uguali: 5 e 5.", figure="🍓🍓🍓🍓🍓 🍓🍓🍓🍓🍓"),
 sc("Il doppio di 3 è uguale a…", "✌️", ["3 + 3", "3 + 2", "3 + 1"], 0, "Il doppio di 3 è 3 + 3 = 6.", figure="🧦🧦🧦 🧦🧦🧦"),
]
L = [[0, 0], [1, 0], [1, 1], [1, 2]]
S11 = [
 sc("Guarda la figura verde. Quale figura è uguale?", "🔍", [dict(testo="Figura A", quadretti=q(2, 3, [[0, 0], [1, 0], [1, 1]])), dict(testo="Figura B", quadretti=q(2, 3, L)), dict(testo="Figura C", quadretti=q(2, 3, [[0, 2], [1, 0], [1, 1], [1, 2]]))],
    1, "La figura B ha gli stessi 4 quadretti, nello stesso posto.", quadretti=q(2, 3, L)),
 nu("Quanti quadretti ci sono in questo rettangolo?", "🟩", 8, "quadretti", "2 righe da 4 quadretti: 4 + 4 = 8.", quadretti=q(2, 4, [[r, c] for r in range(2) for c in range(4)])),
 sc("Quale figura ha più quadretti colorati?", "🤔", [dict(testo="Figura A", quadretti=q(3, 3, [[0, 0], [0, 1], [1, 1], [2, 1], [2, 2]])), dict(testo="Figura B", quadretti=q(3, 3, [[0, 0], [1, 0], [2, 0], [2, 1]])), dict(testo="Figura C", quadretti=q(3, 3, [[0, 0], [0, 1], [0, 2], [1, 1], [2, 0], [2, 1]]))],
    2, "A ha 5 quadretti, B ne ha 4, C ne ha 6. La C ne ha di più."),
]
G12 = dict(titolo="📒 Le figurine raccolte", massimo=10, passo=1, barre=[dict(etichetta="Ada", emoji="👧", valore=6), dict(etichetta="Bea", emoji="👧", valore=9), dict(etichetta="Ciro", emoji="👦", valore=3)])
S12 = [
 sc("Chi ha raccolto più figurine?", "📊", ["Ada", "Bea", "Ciro"], 1, "La colonna di Bea è la più alta: 9 figurine.", grafico=G12),
 nu("Quante figurine ha raccolto Ada?", "👧", 6, "figurine", "La colonna di Ada arriva al 6.", grafico=G12),
 sc("Quanti bambini hanno più di 5 figurine?", "🔎", ["Un solo bambino", "Due bambini", "Tutti e tre"], 1, "Ada ne ha 6 e Bea 9: sono più di 5. Ciro ne ha 3.", grafico=G12),
]
S13 = [
 sc("Quale numero va nel cartellino vuoto?", "📏", ["33", "32", "34"], 0, "Dopo il 30 contiamo: 31, 32, 33.", retta=dict(da=30, a=40, passo=1, etichette=[30, 35, 40], vuoto=33)),
 sc("Attenzione: sulla retta i numeri vanno di 2 in 2. Quale numero va nel cartellino?", "🦘", ["15", "16", "18"], 1, "Di 2 in 2: 10, 12, 14, 16.", retta=dict(da=10, a=22, passo=2, etichette=[10, 12, 14, 20, 22], vuoto=16)),
 sc("Quale numero sta tra il 46 e il 48?", "🔢", ["45", "47", "49"], 1, "46, 47, 48: in mezzo c'è il 47.", retta=dict(da=44, a=50, passo=1, etichette=[44, 45, 46, 48, 49, 50], vuoto=47)),
]
TORRI = q(6, 5, [[r, 0, "#E5484D"] for r in range(1, 6)] + [[r, 2, "#3B7DD8"] for r in range(3, 6)] + [[r, 4, "#19A35B"] for r in range(0, 6)])
S14 = [
 sc("Quale striscia è la più lunga?", "📏", [dict(testo="Striscia A", quadretti=q(1, 8, riga(5))), dict(testo="Striscia B", quadretti=q(1, 8, riga(7))), dict(testo="Striscia C", quadretti=q(1, 8, riga(4)))],
    1, "La striscia B ha 7 quadretti: è la più lunga."),
 nu("Il coniglio va verso la carota. Ogni casella è un passo. Quanti passi fa?", "🐰", 5, "passi", "Contiamo le caselle dopo il coniglio: 1, 2, 3, 4, 5.",
    griglia=dict(righe=1, colonne=6, oggetti=[[0, 0, "🐰"], [0, 5, "🥕"]], percorso=[[0, 1], [0, 2], [0, 3], [0, 4], [0, 5]])),
 sc("Guarda le tre torri. Quale torre è la più bassa?", "🏰", ["la torre rossa", "la torre blu", "la torre verde"], 1, "La torre blu ha solo 3 piani: è la più bassa.", quadretti=TORRI),
]
AN = [dict(etichetta="Fido", figure="🐶🎀"), dict(etichetta="Micio", figure="🐱🎩"), dict(etichetta="Bubu", figure="🐻🎀")]
S15 = [
 sc("Anna è più alta di Bea. Bea è più alta di Carlo. Chi è più alto di tutti?", "📏", ["Anna", "Bea", "Carlo"], 0, "Anna è più alta di Bea, e Bea è più alta di Carlo. Allora Anna è la più alta."),
 sc("Indovina chi è: ha il pallone, ma non ha lo zaino.", "🕵️", ["Luca", "Sofia", "Marco"], 2, "Marco ha il pallone e il palloncino. Non ha lo zaino.",
    insiemi=[dict(etichetta="Luca", figure="🎒⚽"), dict(etichetta="Sofia", figure="🎒🎈"), dict(etichetta="Marco", figure="⚽🎈")]),
 vf("Guarda gli animali. Le frasi sono vere o false?", "🧸", [("Due animali hanno il fiocco.", True), ("Solo Micio ha il cappello.", True), ("Bubu ha il cappello.", False)],
    "Fido e Bubu hanno il fiocco. Il cappello ce l'ha solo Micio.", insiemi=AN),
]
S16 = [
 nu("Quanti euro ci sono nel borsellino?", "👛", 5, "euro", "2 + 2 + 1 = 5 euro.", insiemi=[dict(etichetta="👛 Il borsellino", monete=[2, 2, 1])]),
 sc("Chi ha più euro nel borsellino?", "💶", ["Ada", "Bea", "Ciro"], 1, "Ada ha 6 euro, Bea 8 euro, Ciro 6 euro. Bea ne ha di più.",
    insiemi=[dict(etichetta="Ada", monete=[5, 1]), dict(etichetta="Bea", monete=[2, 2, 2, 1, 1]), dict(etichetta="Ciro", monete=[2, 1, 1, 1, 1])]),
 sc("Un gelato costa 3 euro. Paghi con 5 euro. Quanto ricevi di resto?", "🍦", ["2 euro", "3 euro", "8 euro"], 0, "5 − 3 = 2. Il resto è 2 euro.", insiemi=[dict(etichetta="Paghi con", monete=[5])]),
]
G17 = dict(righe=2, colonne=3, oggetti=[[0, 0, "🚗"], [0, 1, "🚲"], [0, 2, "🚌"], [1, 0, "✈️"], [1, 1, "🚂"], [1, 2, "🚀"]])
S17 = [
 sc("Che cosa c'è sotto la bicicletta?", "🚲", ["🚂 il treno", "✈️ l'aereo", "🚌 l'autobus"], 0, "La bicicletta è in alto, al centro. Sotto c'è il treno.", griglia=G17),
 sc("Quanti lati ha il rettangolo?", "▭", ["4", "3", "2"], 0, "Il rettangolo ha 4 lati: 2 lunghi e 2 corti.", quadretti=q(2, 4, [[r, c] for r in range(2) for c in range(4)])),
 sc("Quale figura è un quadrato?", "🟦", [dict(testo="Figura A", quadretti=q(3, 3, [[0, 0], [0, 1], [1, 0], [1, 1]])), dict(testo="Figura B", quadretti=q(3, 3, [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2]])), dict(testo="Figura C", quadretti=q(3, 3, [[0, 0], [1, 0], [1, 1]]))],
    0, "Il quadrato ha 4 lati uguali: la figura A è 2 quadretti per 2 quadretti."),
]
for d in S17[1:2]: d["immagine"] = "📐"
S18 = [
 nu("Babbo Natale ha 6 regali nel sacco. Ne aggiunge altri 7. Quanti regali ha adesso?", "🎅", 13, "regali", "6 + 7 = 13.", figure="🎁🎁🎁🎁🎁🎁 + 🎁🎁🎁🎁🎁🎁🎁", ambito=N),
 sc("Quale numero va nel cartellino vuoto?", "📏", ["56", "57", "58"], 1, "Dopo il 55 contiamo: 56, 57.", retta=dict(da=50, a=60, passo=1, etichette=[50, 55, 60], vuoto=57), ambito=N),
 sc("Che cosa c'è a sinistra dell'albero?", "🎄", ["🎅 Babbo Natale", "🦌 la renna", "🎁 il regalo"], 0, "L'albero è al centro. A sinistra, nella stessa riga, c'è Babbo Natale.",
    griglia=dict(righe=3, colonne=3, oggetti=[[0, 1, "⭐"], [1, 0, "🎅"], [1, 1, "🎄"], [1, 2, "🦌"], [2, 1, "🎁"]]), ambito=S),
 sc("Chi ha fatto più biscotti?", "🍪", ["👵 la nonna", "👩 la mamma", "👦 Leo"], 0, "La riga della nonna è la più lunga: 6 biscotti.",
    pittogramma=dict(titolo="🎄 I biscotti di Natale", legenda="🍪 = 1 biscotto", simbolo="🍪", righe=[dict(etichetta="👵 Nonna", quanti=6), dict(etichetta="👩 Mamma", quanti=4), dict(etichetta="👦 Leo", quanti=3)]), ambito=D),
 sc("Nella scatola ci sono solo stelline. Prendi un addobbo senza guardare. Quale frase è vera?", "🙈", ["È CERTO: prendi una stellina", "È POSSIBILE: prendi una pallina", "È IMPOSSIBILE: prendi una stellina"], 0,
    "Nella scatola ci sono solo stelline: è certo che prendi una stellina.", insiemi=[dict(etichetta="La scatola", figure="⭐⭐⭐⭐⭐")], ambito=D),
]

GIORNI = ["Lunedì", "Mercoledì", "Venerdì"]
pronte = [S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, S13, S14, S15, S16, S17, S18]
# (settimana, fase, [(titolo, ambito, emoji, domande INVALSI simili)] x3)
piano = [
 ("9 – 13 novembre", 1, [("Prima e dopo", N, "🐸"), ("Sopra, sotto, destra, sinistra", S, "🧭"), ("Contiamo con il grafico", D, "📊")]),
 ("16 – 20 novembre", 1, [("Decine e unità", N, "📦"), ("Le figure", S, "🔺"), ("Certo, possibile, impossibile", D, "🎲")]),
 ("23 – 27 novembre", 1, [("Più e meno fino a 20", N, "➕"), ("In fila!", S, "🚶"), ("Leggiamo la tabella", D, "📋")]),
 ("30 novembre – 4 dicembre", 1, [("Il doppio e la metà", N, "✌️"), ("Figure sui quadretti", S, "🟩"), ("Il grafico a colonne", D, "📊")]),
 ("7 – 11 dicembre", 1, [("La retta dei numeri", N, "📏"), ("Più lungo, più corto, passi", S, "🐰"), ("Indovina chi!", R, "🕵️")]),
 ("14 – 18 dicembre", 1, [("Gli euro", N, "💶"), ("Ripasso: figure e posizioni", S, "🧩"), ("Mini prova di Natale", M, "🎄")]),
 ("11 – 15 gennaio", 2, [("Numeri fino a 100: più grande, più piccolo", N, "⚖️"), ("Le figure simmetriche", S, "🦋"), ("Grafici: chi ha di più?", D, "📊")]),
 ("18 – 22 gennaio", 2, [("Problemi con due domande", N, "🧠"), ("Percorsi e passi del robot", S, "🤖"), ("Tabelle a doppia entrata", D, "📋")]),
 ("25 – 29 gennaio", 2, [("Il doppio e il triplo", N, "✖️"), ("Tessere e figure", S, "🔷"), ("Certo, possibile, impossibile", D, "🎲")]),
 ("1 – 5 febbraio", 2, [("Il numero nascosto (uguaglianze)", N, "🧩"), ("Frecce e direzioni", S, "➡️"), ("Vero o falso? Osserva bene", R, "🧸")]),
 ("8 – 12 febbraio", 2, [("Monete e borsellini", N, "👛"), ("Quanti ne riempio? (misure)", S, "🥛"), ("Ragionare con gli indizi", R, "🕵️")]),
 ("15 – 19 febbraio", 2, [("Aggiungo decine e unità", N, "🔟"), ("Unisco i punti: linee e figure", S, "✏️"), ("Grafico con due colonne", D, "📊")]),
 ("22 – 26 febbraio", 2, [("Quanti ne servono? (materiale)", N, "🧵"), ("Strisce e lunghezze", S, "📏"), ("Mini prova di Carnevale", M, "🎭")]),
 ("1 – 5 marzo", 3, [("Numeri oltre il 100", N, "🏨"), ("L'orologio: ore e mezz'ore", S, "🕒"), ("Scatole e palline: dove conviene pescare?", D, "⚫")]),
 ("8 – 12 marzo", 3, [("Tabelle con i prezzi", N, "🥤"), ("Vista dall'alto", S, "🧱"), ("Che cosa è CERTAMENTE vero?", D, "🍬")]),
 ("15 – 19 marzo", 3, [("Problemi con le metà", N, "🍋"), ("Pezzi e disegni", S, "🧩"), ("Mini prova mista A", M, "🎯")]),
 ("22 – 26 marzo", 3, [("Pacchi e confezioni", N, "🖊️"), ("Copia la figura sui puntini", S, "🔵"), ("Grafici e tabelle", D, "📊")]),
 ("6 – 9 aprile", 3, [("Doppio, triplo, metà: ripasso", N, "✌️"), ("L'orologio: 10 minuti dopo", S, "⏰"), ("Mini prova mista B", M, "🎯")]),
 ("12 – 16 aprile", 3, [("Problemi in due passaggi", N, "🧠"), ("Figure e posizioni: ripasso", S, "🧭"), ("Mini prova mista C", M, "🎯")]),
 ("19 – 23 aprile", 4, [("Prova generale 1 (come quella vera)", M, "📝"), ("Correggiamo insieme gli errori", M, "🔍"), ("Prova generale 2", M, "📝")]),
 ("26 – 30 aprile", 4, [("Prova generale 3", M, "📝"), ("Ripasso degli errori più frequenti", M, "🔁"), ("Mini prova della fiducia", M, "💪")]),
]
sessioni, n = [], 0
for sett, fase, tre in piano:
    for g, (tit, amb, emo) in zip(GIORNI, tre):
        n += 1
        s = dict(n=n, settimana=sett, giorno=g, fase=fase, ambito=amb, titolo=tit, emoji=emo)
        if n <= len(pronte):
            dom = pronte[n - 1]
            for d in dom: d.setdefault("ambito", amb)
            s["domande"] = dom
        if fase == 3: s["minuti"] = 12 if amb == M else 10
        sessioni.append(s)
dati = dict(
 titolo="Allenamento INVALSI · classe 2ª",
 classe=2,
 descrizione="Tre mini prove a settimana, da novembre ad aprile, per arrivare sereni alla prova di matematica di maggio. Ogni mini prova dura circa 10 minuti, si fa insieme sulla LIM e si corregge subito.",
 ritmo=[dict(giorno="Lunedì", emoji="🔢", cosa="Numeri e problemi"), dict(giorno="Mercoledì", emoji="📐", cosa="Spazio, figure e misure"), dict(giorno="Venerdì", emoji="📊", cosa="Grafici, tabelle e ragionamento")],
 fasi=[
  dict(n=1, nome="Conosciamo la prova", periodo="novembre – dicembre", emoji="🌱", descrizione="3 domande alla volta, senza tempo. Impariamo la crocetta, le lettere A, B, C e a leggere bene il disegno."),
  dict(n=2, nome="Ragioniamo", periodo="gennaio – febbraio", emoji="🧠", descrizione="4 domande alla volta, senza tempo. Problemi con due passaggi, tabelle a doppia entrata, percorsi, vero o falso."),
  dict(n=3, nome="Come alla prova", periodo="marzo – metà aprile", emoji="⏱️", descrizione="5 domande con un tempo da rispettare (10-12 minuti). Domande miste, come nel fascicolo vero."),
  dict(n=4, nome="Prove generali", periodo="fine aprile", emoji="🏁", descrizione="Tre prove complete come quella vera (28 domande, 45 minuti), con la correzione insieme. L'ultima è facile, per arrivare con fiducia."),
 ],
 sessioni=sessioni)
json.dump(dati, open(sys.argv[1], "w"), ensure_ascii=False, indent=1)
print(n, "sessioni,", sum(len(x) for x in pronte), "domande pronte")
