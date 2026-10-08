# Laberint d'angles (角度メイズ)

Puzzle original de Naoki Inaba: `src/kmaze_q.pdf` (enunciats) i `src/kmaze_a.pdf` (solucions).
Versió interactiva: [`laberint-angles.html`](../laberint-angles.html).

## Traducció de les instruccions (pàgina 1 del PDF)

| Japonès | Català |
|---|---|
| 角度メイズ | Laberint d'angles |
| スタート（Ｓ）からゴール（Ｇ）まで線をたどりましょう | Ves de la S (sortida) a la G (meta) seguint les línies. |
| ・同じ○は１回しか通れません | · Només pots passar una vegada per cada cercle. |
| ・数字が書かれた○ではその角度で曲がります | · Als cercles amb un número, les dues línies del camí hi formen aquest angle. |
| 【例題】 | Exemple |
| 【解答】 | Solució |
| 同じ○は１回しか通れません | Només pots passar una vegada per cada cercle |
| 矢印のコースだと真ん中の○を２回通ります | Aquest camí passa dues vegades pel cercle del mig. |
| 数字が書かれた○ではその角度で曲がります | Als cercles amb un número, les dues línies del camí hi formen aquest angle |
| この角度は 60 度です | Aquest angle és de 60°. |
| この角度は 90 度です | Aquest angle és de 90°. |
| 通らない○もあります | Hi ha cercles per on no cal passar. |

Notes de traducció:

- **メイズ** (*maze*) és «laberint».
- **Ｓ** i **Ｇ** són *start* i *goal*. S'han deixat les lletres del PDF; a la web s'explica «S (sortida)»
  i «G (meta)».
- **Quin angle és el número.** 曲がります vol dir «tomba, es doblega». Traduït per «el camí gira fent aquest
  angle», fa pensar en l'**angle de gir** (com la tortuga del LOGO), i llavors 180° seria fer mitja volta.
  Però el número és l'**angle que formen les dues línies del camí** al cercle (la línia per on arriba i la
  línia per on surt): el dibuix de la pàgina 1 marca l'arc entre els dos segments. Per tant, **180° és un
  angle pla**: el camí continua recte. (Angle de gir = 180° − angle del cercle; només coincideixen al 90.)
- Comprovació amb els 38 laberints: llegint el número com a angle entre les dues línies, tots tenen una sola
  solució, la del PDF; llegint-lo com a angle de gir, 26 no en tenen cap, 7 en tenen una i 5 en tenen més
  d'una.
- Per això la web no fa servir el verb «girar» («les dues línies del camí hi formen aquest angle»), dibuixa
  el 180° com un mig cercle i hi afegeix la nota «180° és un angle pla», que no és al PDF.

## Els 38 problemes

Les dades són a [`js/laberint-angles/problemes.js`](../js/laberint-angles/problemes.js). **No s'escriuen a
mà**: les genera [`tools/extreu-laberint.py`](../tools/extreu-laberint.py), que llegeix les línies, els
cercles i els números directament del PDF (`python3 tools/extreu-laberint.py`, des de l'arrel del
repositori; cal `poppler-utils`).

| Problemes | Com són |
|---|---|
| 1–6 | Quadrícula de 3 × 3 |
| 7–12 | Triangle i triangle invertit (angles de 60°, 120° i 180°) |
| 13–18 | Quadrícula amb diagonals (45°, 135°) |
| 19–30 | Mosaics de quadrats i triangles (150°) |
| 31–36 | Figures irregulars (30°, 75°, 105°, 165°…) |
| 37–38 | Laberints grans (triangle i quadrícula 5 × 5) |

Els dibuixos del PDF estan fets a mà i alguns angles s'aparten fins a 12° del que diu el número (al
problema 30, un cercle de 150° està dibuixat a 162°). Per això:

- **1–30, 37 i 38** es redibuixen exactes: cada línia va en un múltiple de 90°, 60°, 45° o 30° (segons la
  família) i fa 1 o √2 de llarg. L'script comprova que el redibuix tanca tots els cicles.
- **31–36** (i l'exemple) mantenen les posicions del PDF; el joc arrodoneix la direcció de cada línia a
  múltiples de 15° (els errors de dibuix hi són de 4° com a molt).

`node tests/laberint-angles.test.js` comprova que cada laberint té **una sola solució** i que és la del PDF
de solucions (que l'script també llegeix del PDF).
