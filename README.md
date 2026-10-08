# inaba

Puzzles matemàtics de **Naoki Inaba** (稲葉直貴), de domini públic, traduïts al català i fets interactius.
Són pàgines web estàtiques, sense res a instal·lar: HTML, CSS i JavaScript «vainilla».

Els PDF originals (en japonès) són a [`src/`](src/): `*_q.pdf` són els enunciats i `*_a.pdf`, les solucions.

## Puzzles

| Puzzle | Original | Pàgina | Problemes |
|---|---|---|---|
| Enllaç de múltiples | 倍数リンク (`blink`) | [`enllac-multiples.html`](enllac-multiples.html) | 42 |
| Laberint d'angles | 角度メイズ (`kmaze`) | [`laberint-angles.html`](laberint-angles.html) | 38 |
| Expressions bessones | 双子式 (`gemini`) | [`expressions-bessones.html`](expressions-bessones.html) | 42 |
| Talla en rectangles | 四角カット (`shikaku`) | [`talla-rectangles.html`](talla-rectangles.html) | 42 |
| Creuat de múltiples | 倍数クロス (`bcross`) | [`creuat-multiples.html`](creuat-multiples.html) | 42 |
| On és la xifra? | どこかな算 (`dokoeq`) | [`on-es-la-xifra.html`](on-es-la-xifra.html) | 42 |
| Busca el nombre | かずさがし (`kazu`) | [`busca-el-nombre.html`](busca-el-nombre.html) | 42 |
| Busca el triangle | 三角探し (`sankaku`) | [`busca-el-triangle.html`](busca-el-triangle.html) | 42 |
| L'escala de nombres | 数字の階段 (`step`) | [`escala-nombres.html`](escala-nombres.html) | 42 |

La portada ([`index.html`](index.html)) també llista els altres 3 puzzles de `src/` com a «Properament».
La traducció de les instruccions de cada puzzle i les notes sobre els problemes són a [`docs/`](docs/).
Les dels puzzles que encara no s'han fet són a [`docs/traduccions.md`](docs/traduccions.md).

## Com es juga a l'Enllaç de múltiples

Tres maneres de fer el mateix, i es poden barrejar:

- **Arrossegar** una targeta (amb el ratolí o amb el dit) fins a un lloc buit. Una targeta del tauler es
  pot arrossegar a un altre lloc (s'intercanvien) o fora del tauler (torna a baix).
- **Clicar o tocar** una targeta i després el lloc. Clicar una targeta del tauler la treu.
- **Teclat**: Tab o les fletxes per anar d'un lloc a l'altre, escriure el número de la targeta,
  ⌫ o Supr per treure-la, Esc per desfer la tria.

Quan tots els llocs són plens, es comprova sol: si hi ha alguna fletxa que no va a un múltiple, es
marca en vermell i es diu per què («10 no és múltiple de 4»); si tot és correcte, cada fletxa mostra
el factor (×2, ×5…).

## Com es juga al Laberint d'angles

El camí sempre surt de la S. Tres maneres de fer-lo, i es poden barrejar:

- **Traçar**: prémer el final del camí i, sense aixecar el dit o el ratolí, passar pels cercles. Tornar
  enrere pel mateix camí l'escurça.
- **Clicar o tocar** els cercles connectats, un darrere l'altre. Clicar un cercle del camí el talla fins allà.
- **Teclat**: Tab o les fletxes per anar d'un cercle a l'altre, Enter per afegir-lo al camí, ⌫ per desfer
  l'últim pas.

Els cercles on es pot anar tenen la vora discontínua, i als cercles amb número per on passa el camí es
dibuixa l'angle que hi formen les dues línies del camí: un escaire si és de 90°, un mig cercle si és de
180° (un angle pla: el camí va recte) i un arc si és un altre. Quan el camí arriba a la G, es comprova sol: si algun angle no és el que demana
el cercle, es marca en vermell i es diu quin fa («Al cercle del 180, el camí fa 90°»).

## Com es juga a les Expressions bessones

Les dues targetes són «bessones»: cada signe (+, −, ×, ÷) es posa una sola vegada i va sol a totes dues.
Els parèntesis «( )» es deixen sobre el signe de l'operació que s'ha de fer primer. Tres maneres de fer-ho:

- **Arrossegar** un signe fins a un forat. Un signe posat es pot arrossegar a l'altre forat (s'intercanvien)
  o fora (es treu).
- **Clicar o tocar** un signe i després el forat. Clicar un signe posat el treu, i clicar un parèntesi treu
  els parèntesis.
- **Teclat**: Tab o les fletxes per anar d'un forat a l'altre, escriure `+ - * /` (o `x :`), `(` per posar o
  treure els parèntesis, ⌫ per esborrar.

Quan hi ha els dos signes, es comprova sol i es mostra el càlcul de cada targeta pas a pas
(«1 + 1 × 2 = 1 + 2 = 3, i no 4»). S'accepta qualsevol solució correcta, encara que no sigui la del PDF.

## Com es juga al Talla en rectangles

- **Arrossegar** (amb el ratolí o el dit) d'un quadret fins al de la cantonada oposada dibuixa un rectangle;
  mentre es dibuixa, es veu «base × altura = quadrets». Si en trepitja d'altres, els treu.
- **Tocar** un rectangle el treu.
- **Teclat**: fletxes per moure el quadret marcat, Enter per començar i acabar un rectangle, Esc per desfer-lo,
  Supr per treure el rectangle del quadret marcat.

Cada mida de la llista té un color, i els rectangles amb una mida que no toca es pinten de vermell. Quan la
figura és plena, es comprova sola.

## Com es juga al Creuat de múltiples

- **Arrossegar** una xifra de la fila de sota fins a una casella blanca. Una xifra del quadre es pot arrossegar
  a una altra casella (s'intercanvien) o fora del quadre (s'esborra).
- **Clicar o tocar**: una casella i després una xifra (el cursor passa a la següent casella buida), o una xifra
  i després una casella. El botó ⌫ esborra la casella triada.
- **Teclat**: Tab o fletxes per anar d'una casella a una altra, escriure la xifra directament, Retrocés o Supr
  per esborrar.

Quan totes les caselles blanques tenen xifra, es comprova sol i es mostra cada nombre («96 = 8 × 12») o per
què no va bé («65 no és múltiple de 8: 8 × 8 = 64 i 8 × 9 = 72»). S'accepta només la solució del PDF, que és
l'única que hi ha.

## Com es juga a On és la xifra?

- **Arrossegar** una xifra de la fila de sota fins a una casella. Una xifra de la suma es pot arrossegar a una
  altra casella (s'intercanvien) o fora de la suma (s'esborra).
- **Clicar o tocar**: una casella i després una xifra (el cursor passa a la següent casella buida), o una xifra
  i després una casella. El botó ⌫ esborra la casella triada.
- **Teclat**: Tab o fletxes per anar d'una casella a una altra, escriure la xifra directament, Retrocés o Supr
  per esborrar.

Quan totes les caselles tenen xifra, es comprova sol i es mostra la suma («37 + 38 = 75») i on és cada número de
fora, o què no va bé («8 + 5 = 13, i no 14», «El 3 no és enlloc de la columna de les unitats (7, 5, 2)»). Els
números de fora que ja són a la seva fila o columna es veuen amb un petit ✓ mentre es juga. S'accepta només la
solució del PDF, que és l'única que hi ha.

## Com es juga a Busca el nombre

- **Arrossegar** (amb el ratolí o el dit): el quadrat segueix el punter, encaixat als quadrets, i es posa en deixar
  anar. Deixar anar fora del tauler no fa res. El quadrat té sempre la mida que toca i no surt de la línia de punts.
- **Tocar o clicar** un lloc del tauler hi posa el quadrat.
- **Teclat**: Tab per entrar al tauler, fletxes per moure el quadrat, Enter per posar-lo, Esc, ⌫ o Supr per treure'l.

En posar el quadrat es comprova sol: si no és el lloc, es diu què hi ha dins («Aquí hi ha 3 pomes, i en volies 2»)
i es pot provar un altre lloc.

## Com es juga a Busca el triangle

- **Tocar o clicar** un punt el tria (li surt una anella); tocar-ne un de triat el treu.
- **Traçar** (amb el ratolí o el dit): prémer un punt i passar per uns altres, com si es dibuixessin els costats.
  Si el traç passa en línia recta per sobre d'un punt, aquest punt no queda triat.
- **Teclat**: fletxes per anar d'un punt a l'altre, Enter per triar-lo o treure'l, ⌫ o Supr per treure'l, Esc per
  treure'ls tots.

Amb tres punts es comprova sol, i es dibuixa com es calcula l'àrea: base × altura : 2 si un costat és horitzontal
o vertical, o el rectangle que envolta el triangle menys les peces del voltant si és inclinat.

## Com es juga a L'escala de nombres

- **Tocar** un cercle i escriure-hi el nombre amb les xifres de sota (per fer 12: l'1 i després el 2); ⌫ esborra
  l'última xifra. Si no hi ha cap cercle triat, la xifra va al primer cercle buit.
- **Arrossegar** una xifra fins a un cercle; arrossegar un nombre fora del tauler l'esborra.
- **Teclat**: Tab o fletxes per anar d'un cercle a l'altre, xifres, ⌫, Supr per buidar-lo i Enter per anar al
  cercle buit següent.

Quan tots els cercles són plens, es comprova sol: les fileres que no augmenten sempre igual es pinten de vermell
amb el motiu, i si tot és correcte, a cada tram s'escriu el que augmenta (+3).

## Comú als puzzles

- Els problemes resolts es desen al navegador (localStorage) i es veuen amb un ✓ a «Escull…» i a la
  portada. Si el navegador no ho permet, es juga igual.
- Per enviar un problema concret als alumnes: `enllac-multiples.html?p=13`, `laberint-angles.html?p=5`…

## Versions per imprimir

Fulls A4 per imprimir a doble cara (en blanc i negre), plastificar i escriure-hi amb retolador de pissarra:
la pàgina 1 són les instruccions, la 2 és en blanc (el revers) i a partir de la 3 hi ha 6 problemes per full
(4 al Laberint d'angles i al Talla en rectangles, que tenen figures més grans).

| Puzzle | Pàgina | PDF |
|---|---|---|
| Expressions bessones | [`imprimir/expressions-bessones.html`](imprimir/expressions-bessones.html) | [`imprimir/expressions-bessones.pdf`](imprimir/expressions-bessones.pdf) (9 pàgines) |
| Creuat de múltiples | [`imprimir/creuat-multiples.html`](imprimir/creuat-multiples.html) | [`imprimir/creuat-multiples.pdf`](imprimir/creuat-multiples.pdf) (9 pàgines) |
| On és la xifra? | [`imprimir/on-es-la-xifra.html`](imprimir/on-es-la-xifra.html) | [`imprimir/on-es-la-xifra.pdf`](imprimir/on-es-la-xifra.pdf) (9 pàgines) |
| Busca el nombre | [`imprimir/busca-el-nombre.html`](imprimir/busca-el-nombre.html) | [`imprimir/busca-el-nombre.pdf`](imprimir/busca-el-nombre.pdf) (9 pàgines) |
| Enllaç de múltiples | [`imprimir/enllac-multiples.html`](imprimir/enllac-multiples.html) | [`imprimir/enllac-multiples.pdf`](imprimir/enllac-multiples.pdf) (9 pàgines) |
| Laberint d'angles | [`imprimir/laberint-angles.html`](imprimir/laberint-angles.html) | [`imprimir/laberint-angles.pdf`](imprimir/laberint-angles.pdf) (12 pàgines, 4 problemes per full) |
| Talla en rectangles | [`imprimir/talla-rectangles.html`](imprimir/talla-rectangles.html) | [`imprimir/talla-rectangles.pdf`](imprimir/talla-rectangles.pdf) (13 pàgines, 4 problemes per full) |
| Busca el triangle | [`imprimir/busca-el-triangle.html`](imprimir/busca-el-triangle.html) | [`imprimir/busca-el-triangle.pdf`](imprimir/busca-el-triangle.pdf) (9 pàgines) |

S'hi arriba des de l'enllaç «Versió per imprimir» de dalt de la pàgina del joc. La pàgina té un botó per
imprimir-la o desar-la com a PDF des del navegador. El PDF del repositori el fa
`node tools/genera-pdf.js <puzzle>` (amb Chromium, p. ex. `expressions-bessones` o `on-es-la-xifra`); si es canvien els problemes o els estils
d'impressió, s'ha de tornar a fer.

## Provar-ho a l'ordinador

Com que no fa servir mòduls, n'hi ha prou amb obrir `index.html` amb doble clic.

## Estructura

```
HANDOUT.md                     ← traspàs tècnic (en anglès) per a una IA que continuï la feina
CLAUDE.md                      ← Claude Code el llegeix sol: remet a HANDOUT.md
index.html                     ← portada
icon.png                       ← la sabatilla (enllaça a step-quiz.net), la mateixa d'operacions
enllac-multiples.html          ← un fitxer HTML per puzzle
laberint-angles.html
css/comu.css                   ← estils comuns a tots els puzzles
css/<puzzle>.css               ← estils de cada puzzle
js/comu.js                     ← progrés, capçalera (‹ Escull… ›) i missatges, comuns a tots els puzzles
js/portada.js                  ← progrés a la portada
js/<puzzle>/
    problemes.js               ← els problemes (dades)
    motor.js                   ← comprovar i resoldre (sense DOM)
    tauler.js                  ← dibuixa el tauler
    <puzzle>.js                ← controlador: arrossegar, clicar, teclat
tests/<puzzle>.test.js         ← cada problema té una sola solució, i és la del PDF
tools/extreu-laberint.py       ← llegeix els laberints del PDF i escriu js/laberint-angles/problemes.js
tools/extreu-rectangles.py     ← llegeix les figures del PDF i escriu js/talla-rectangles/problemes.js
tools/extreu-creuat.py         ← llegeix els quadres del PDF i escriu js/creuat-multiples/problemes.js
tools/extreu-xifra.py          ← llegeix les sumes del PDF i escriu js/on-es-la-xifra/problemes.js
tools/extreu-kazu.py           ← llegeix els quadres del PDF i escriu js/busca-el-nombre/problemes.js
tools/extreu-triangle.py       ← llegeix les quadrícules de punts del PDF i escriu js/busca-el-triangle/problemes.js
tools/extreu-escala.py         ← llegeix els cercles i les fileres del PDF i escriu js/escala-nombres/problemes.js
tools/genera-pdf.js            ← fa el PDF per imprimir d'un puzzle (imprimir/<puzzle>.html → .pdf)
imprimir/<puzzle>.html, .pdf   ← versió per imprimir i el seu PDF
css/imprimir.css               ← estils comuns de les versions per imprimir (+ css/imprimir-<puzzle>.css)
js/imprimir.js                 ← fulls de problemes, capçalera i peu (+ js/<puzzle>/imprimir.js)
docs/<puzzle>.md               ← traducció de les instruccions i notes
docs/traduccions.md            ← traducció de les instruccions dels puzzles pendents
src/                           ← PDF originals
```

## Tests

```
node tests/enllac-multiples.test.js
node tests/laberint-angles.test.js
node tests/expressions-bessones.test.js
node tests/talla-rectangles.test.js
node tests/creuat-multiples.test.js
node tests/on-es-la-xifra.test.js
node tests/busca-el-nombre.test.js
node tests/busca-el-triangle.test.js
node tests/escala-nombres.test.js
```

GitHub els executa sols a cada pull request i a cada canvi a `main` (pestanya **Actions**).
