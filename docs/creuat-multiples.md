# Creuat de múltiples (倍数クロス)

Puzzle original de Naoki Inaba: `src/bcross_q.pdf` (enunciats) i `src/bcross_a.pdf` (solucions).
Versió interactiva: [`creuat-multiples.html`](../creuat-multiples.html).

## Traducció de les instruccions (pàgina 1 del PDF)

| Japonès | Català |
|---|---|
| 倍数クロス | Creuat de múltiples |
| 空いている白マスに０～９の数字を入れましょう | Escriu una xifra del 0 al 9 a cada casella blanca buida. |
| ・数が入った三角マス ◣ から下に向かって列の数字を見たとき、その数の倍数が見えるようにします（◥ からは右に見ます） | · Des de cada triangle amb un número, mira les xifres de la columna cap avall: el nombre que hi veus ha de ser un múltiple del número del triangle. (Des dels triangles de dalt a la dreta, mira cap a la dreta.) |
| 【例題】／【解答】 | Exemple / Solució |
| 三角マスから見える数 | El nombre que es veu des d'un triangle |
| この三角からは「９」が見えます | Des d'aquest triangle es veu el «9». |
| この三角からは「６５」が見えます | Des d'aquest triangle es veu el «65». |
| この三角からは「９６」が見えます | Des d'aquest triangle es veu el «96». |
| この三角からは「５」が見えます | Des d'aquest triangle es veu el «5». |
| ！注意！ 一番上の位に０は入りません | Compte! La primera xifra d'un nombre no pot ser 0. |
| 「見える数」は三角に書かれた数の倍数です | El nombre que es veu és un múltiple del número del triangle. |
| ９６は８の１２倍 ／ ９は３の３倍 ／ ５は５の１倍 ／ ６５は１３の５倍 | 96 és 12 vegades 8 / 9 és 3 vegades 3 / 5 és 1 vegada 5 / 65 és 5 vegades 13 |

Notes de traducció:

- Les caselles negres estan partides en dos triangles, com en un kakuro: el número de la meitat de **baix a
  l'esquerra** (◣) es llegeix **cap avall**, i el de la meitat de **dalt a la dreta** (◥), **cap a la dreta**.
  Al PDF són dues icones dins del text; a la web es dibuixa el quadre i no calen.
- 一番上の位 és «la posició de més valor»: és a dir, el nombre no pot començar per 0.
- Les frases «Escriu una xifra del 0 al 9…» i la regla de la pàgina del joc són una síntesi de les del PDF.
- No són al PDF, i s'han afegit a la web: l'exemple «06 no val: no pot començar per 0» (il·lustra el «Compte!») i
  les quatre figures de l'apartat «El nombre que es veu des d'un triangle» (al PDF són quatre globus sobre un
  sol quadre; a la web, un quadre per cada triangle amb les caselles ressaltades i una fletxa).

## Com és a la web

- Es juga amb una fila de xifres 0–9 i un botó ⌫. S'hi pot **arrossegar** una xifra fins a una casella
  (d'una casella a una altra s'intercanvien; fora del quadre, s'esborra), **tocar** una casella i després una
  xifra (o al revés) i, amb **teclat**, escriure les xifres directament (fletxes per canviar de casella,
  Retrocés o Supr per esborrar).
- Tocar una casella plena només la tria (com en un camp de text): per esborrar-la, ⌫, Retrocés/Supr o
  arrossegar la xifra fora.
- No es jutja res fins que totes les caselles blanques tenen xifra. Llavors, per a cada número es mostra el
  nombre que es veu i el quocient («96 = 8 × 12») o per què no va bé: «65 no és múltiple de 8: 8 × 8 = 64 i
  8 × 9 = 72» o «El nombre que es veu des del 3 no pot començar per 0».

## Els 42 problemes

Les dades són a [`js/creuat-multiples/problemes.js`](../js/creuat-multiples/problemes.js): cada quadre, com a
files de text (`.` casella blanca, `#` negra, `#d8` negra amb el 8 que es llegeix cap a la dreta, `#a3` amb el 3
que es llegeix cap avall). **No s'escriuen a mà**: les genera
[`tools/extreu-creuat.py`](../tools/extreu-creuat.py), que llegeix les caselles i els números directament dels
PDF (`python3 tools/extreu-creuat.py`, des de l'arrel del repositori; cal `poppler-utils` i Pillow). El color de
cada casella es decideix mirant la pàgina com a imatge, perquè al PDF alguns contorns són ambigus. L'exemple de
la pàgina 1 s'ha copiat a mà a l'script.

Els quadres van des del 2 × 2 (problemes 1 i 2) fins al 3 × 4 i el 4 × 2, i cap problema té més de 4
caselles blanques.

`node tests/creuat-multiples.test.js` comprova que cada casella blanca la veu algun número, que cada problema té
**una sola solució** i que és la del PDF de solucions (que l'script també llegeix del PDF).

**Errades del PDF:** cap. Les 42 solucions del PDF són l'única solució de cada problema.

## Versió per imprimir

[`imprimir/creuat-multiples.html`](../imprimir/creuat-multiples.html) i el PDF
[`imprimir/creuat-multiples.pdf`](../imprimir/creuat-multiples.pdf) (9 pàgines A4: instruccions, una de
buida i 7 fulls de 6 problemes). Es fa amb `node tools/genera-pdf.js creuat-multiples`.

- Els quadres són els del joc (`TaulerCreuat.estatic`), sense xifres i en blanc i negre: les caselles negres
  són negres amb la diagonal i els números en blanc, i les blanques, buides.
- La mida de la casella s'ajusta a l'alçada: 22 mm als quadres de 2 files, uns 20 mm als de 3 i uns 15 mm als
  de 4 files (problemes 16, 18, 28, 30, 41 i 42). El quadre més ample fa 90,5 mm (el límit d'una columna és 97,5).
- Text que no és al PDF: la caixa «Amb el retolador» de la pàgina 1 («Escriu una xifra a cada casella blanca,
  ben grossa. Una casella pot formar part de dos nombres… Per esborrar…»), en el mateix estil que la d'Expressions
  bessones. A les instruccions, les fletxes → i ↓ de les figures marquen cap on es llegeix.
