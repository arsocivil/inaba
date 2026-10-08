# On és la xifra? (どこかな算)

Puzzle original de Naoki Inaba: `src/dokoeq_q.pdf` (enunciats) i `src/dokoeq_a.pdf` (solucions).
Versió interactiva: [`on-es-la-xifra.html`](../on-es-la-xifra.html).

## Traducció de les instruccions (pàgina 1 del PDF)

| Japonès | Català |
|---|---|
| どこかな算 | On és la xifra? |
| ・□に０～９の数字を入れて正しい筆算にしましょう | · Escriu una xifra del 0 al 9 a cada □ perquè la suma en columna sigui correcta. |
| ・一番上の位に０は入りません（０だけでも使えません） | · La primera xifra d'un nombre no pot ser 0 (i un nombre tampoc pot ser només un 0). |
| ・周りの数字は矢印が指している列のどこかに入ります | · Cada número de fora va en algun lloc de la fila o la columna a què apunta la seva fletxa. |
| 正しい筆算にしましょう | La suma ha de ser correcta |
| 正しい筆算です | Aquesta suma és correcta (8 + 5 = 13). ✓ |
| ！注意！ 一番上の位が０になってはいけません | Compte! La primera xifra no pot ser 0 (3 + 5 = 08). ✗ |
| 周りの数字は矢印が指している列のどこかに入ります | Cada número de fora va en algun lloc de la fila o la columna a què apunta la seva fletxa |
| 矢印が指す列に３と５が入っています | El 3 i el 5 són a la columna i a la fila on apunten les fletxes. ✓ |
| 列のどこにも３が入っていません | El 3 no és enlloc de la columna. ✗ |

Notes de traducció:

- 筆算 és el càlcul «escrit», en columna. Tots els signes del PDF (48) són **+**: només hi ha sumes. La
  traducció de Gemini deia «suma/resta».
- 列 vol dir «renglera»: a l'exemple, el 3 apunta cap avall a una **columna** i el 5 apunta de costat a una
  **fila**. Per això «la fila o la columna».
- «０だけでも使えません» només diu que un nombre no pot ser un 0 sol. La traducció de Gemini hi afegia «ni com
  a resultat precedit de zero», que el PDF no diu.
- No són al PDF, i s'han afegit a la web: la frase «Si fora hi ha dos números junts, com «4, 8», els dos han de
  ser a la fila o la columna» (explica els problemes 26, 29, 30, 31, 35, 38–40 i 42, que al PDF no ho
  expliquen) i els dos quadres «Aquesta suma és correcta» i «Compte!» sense números de fora (al PDF, el
  quadre de l'esquerra és el mateix exemple amb els números de fora esborrats). Les tres frases de dalt de la
  pàgina del joc («Escriu una xifra del 0 al 9…») són les del PDF, i la regla que hi ha sobre el tauler n'és
  una síntesi.

## Com és a la web

- Es juga amb una fila de xifres 0–9 i un botó ⌫. S'hi pot **arrossegar** una xifra fins a una casella
  (d'una casella a una altra s'intercanvien; fora de la suma, s'esborra), **tocar** una casella i després una
  xifra (o al revés) i, amb **teclat**, escriure les xifres directament (fletxes per canviar de casella,
  Retrocés o Supr per esborrar).
- Tocar una casella plena només la tria (com en un camp de text): per esborrar-la, ⌫, Retrocés/Supr o
  arrossegar la xifra fora.
- No es jutja res fins que totes les caselles tenen xifra. Llavors es mira que cap nombre comenci per 0 («El
  resultat no pot començar per 0 (08)»), que la suma sigui correcta («8 + 5 = 13, i no 14») i que cada número
  de fora sigui a la seva fila o columna («El 3 no és enlloc de la columna de les unitats (7, 5, 2)»).
- Mentre es juga, un número de fora que ja és a la seva fila o columna es veu amb un petit ✓. És una ajuda
  local: no diu si la suma és bona.

## Els 42 problemes

Les dades són a [`js/on-es-la-xifra/problemes.js`](../js/on-es-la-xifra/problemes.js): per a cada problema,
`[[n1, n2, ns], pistesColumna, pistesFila]` (quantes xifres té cada nombre i els números de fora de cada columna
i de cada fila). **No s'escriuen a mà**: les genera [`tools/extreu-xifra.py`](../tools/extreu-xifra.py), que
llegeix les caselles □ i els números directament dels PDF (`python3 tools/extreu-xifra.py`, des de l'arrel del
repositori; cal `poppler-utils`). L'exemple de la pàgina 1 s'ha copiat a mà a l'script.

Els problemes 1–14 són de 1 xifra + 1 xifra, el 15–24 de 1 + 1 amb resultat de 2 xifres, el 25–36 de 2 + 1 i el
37–42 de 2 + 2.

`node tests/on-es-la-xifra.test.js` comprova el format, que cada problema té **una sola solució** i que és la
del PDF de solucions (que l'script també llegeix del PDF). Aquesta comprovació també confirma que els números
amb coma («4,8») volen dir que **les dues** xifres han de ser a la fila o la columna: amb aquesta lectura cada
problema té una sola solució i és la del PDF.

**Errades del PDF:** cap. Les 42 solucions del PDF són l'única solució de cada problema.

## Versió per imprimir

[`imprimir/on-es-la-xifra.html`](../imprimir/on-es-la-xifra.html) i el seu PDF (9 pàgines A4: 1 instruccions,
2 en blanc, 3–9 problemes, 6 per full). Fa servir el mateix DOM que el joc (`TaulerXifra.estatic`) amb els
estils en mm de [`css/imprimir-on-es-la-xifra.css`](../css/imprimir-on-es-la-xifra.css), només en blanc, negre i
gris fosc. Decisions:

- Caselles de 16 × 16 mm amb vora contínua de 0,5 mm (com al PDF original), números de fora en negreta a 19,5 pt.
  Hi ha almenys 3 mm d'aire entre la suma i la vora de la targeta als 42 problemes; als més alts (37–42, amb
  números a sobre de les columnes) és el que limita la mida de les caselles.
- El número del problema va a la cantonada de la targeta (així la suma té tot l'alt) i cada targeta té una vora fina.
- Sense color, les caselles que fallen a les instruccions (✗) es marquen amb una vora més gruixuda i les xifres que
  es busquen (✓) amb un cercle, com al PDF original.
- Al quadre «Amb el retolador» s'ha afegit que els nombres van alineats per la dreta (no és al PDF original).
- `.caixa` és el nom del quadre d'instruccions (`css/imprimir.css`) i també el de la casella de la suma del joc; el
  CSS d'impressió desfà el del quadre a `.suma .caixa`.

`node tools/genera-pdf.js on-es-la-xifra` fa el PDF; cal tornar-lo a fer si canvien els problemes o els estils.
