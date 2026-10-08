# L'escala de nombres (数字の階段)

Puzzle original de Naoki Inaba: `src/step_q.pdf` (enunciats) i `src/step_a.pdf` (solucions).
Versió interactiva: [`escala-nombres.html`](../escala-nombres.html).

## Traducció de les instruccions (pàgina 1 del PDF)

| Japonès | Català |
|---|---|
| 数字の階段 | L'escala de nombres |
| 空いている○に「１以上の整数」を入れてください | Escriu un nombre enter més gran o igual que 1 a cada cercle buit. |
| ・一つの列に同じ整数が入ってはいけません | · En una mateixa filera no hi pot haver dos nombres iguals. |
| ・一列に並んでいる整数は一方のはしから同じ数ずつ増えます | · Els nombres d'una filera augmenten sempre la mateixa quantitat, començant per una de les puntes. |
| 一つの列に３がいくつも入っています | Aquesta filera té el 3 més d'una vegada. ✗ |
| ！注意！ ０は使えません | Compte! No es pot fer servir el 0. |
| 二桁以上の整数が入ることもあります | Hi pot haver nombres de dues xifres o més. |
| １ずつ増えています ／ ２ずつ増えています ／ ３ずつ増えています | Augmenten d'1 en 1 / de 2 en 2 / de 3 en 3 |

Notes de traducció:

- Una «filera» és cada línia recta de cercles units. Cada filera és una **progressió aritmètica** de diferència
  1 o més (com que no es poden repetir nombres, la diferència no pot ser 0). Dues línies que es troben en un
  cercle formant un angle són fileres diferents; si una línia continua recta a través d'un cercle, és la
  mateixa filera.
- La traducció de Gemini era correcta; només calia «d'augment» (no «de augment») i treure el «¡».
- Frases que **no són al PDF**: «1, 2, 3: augmenten d'1 en 1» (i les altres dues) concreten l'exemple dels
  +1, +2, +3 del PDF; «Toca un cercle i escriu-hi el nombre amb les xifres de sota (per fer 12, toca l'1 i
  després el 2)» explica com es fa a la web; la regla de dalt del tauler en fa un resum.

## Com és a la web

- **Tocar** un cercle buit el tria; les xifres del teclat de sota s'hi van escrivint (1 i després 2 → 12). La
  primera xifra després de triar un cercle substitueix el nombre que hi havia; ⌫ esborra l'última xifra. Si no
  hi ha cap cercle triat, la xifra va al primer cercle buit. El 0 sol no s'accepta («Compte! No es pot fer
  servir el 0.»), i com a molt s'hi poden escriure 3 xifres.
- **Arrossegar** una xifra del teclat fins a un cercle el tria i hi escriu aquella xifra. Arrossegar el nombre
  d'un cercle fora del tauler l'esborra; deixar-lo en un altre cercle els intercanvia.
- **Teclat**: Tab o fletxes per anar d'un cercle a l'altre, xifres per escriure, ⌫ per esborrar l'última xifra,
  Supr per buidar el cercle, Enter per anar al cercle buit següent.
- Quan tots els cercles tenen nombre, es comprova sol. Les fileres dolentes es pinten de vermell amb el motiu
  («A la filera 3, 4, 6 no augmenten sempre igual (+1, +2).», «A la filera 6, 6, 7 hi ha nombres repetits.»).
  Si és correcte, les fileres es pinten de verd, a cada tram s'escriu el que augmenta (+3) i el missatge diu
  de quant en quant augmenta cada filera.

## Els 42 problemes

Les dades són a [`js/escala-nombres/problemes.js`](../js/escala-nombres/problemes.js): els cercles (posició en
punts del PDF i, si n'hi ha, el número) i les fileres (els cercles de cada línia, d'una punta a l'altra). **No
s'escriuen a mà**: les genera [`tools/extreu-escala.py`](../tools/extreu-escala.py) a partir del PDF
(`python3 tools/extreu-escala.py`, des de l'arrel del repositori; cal `poppler-utils`). L'exemple de la
pàgina 1 s'ha copiat a mà a l'script (a la pàgina hi ha també els dibuixos de l'explicació).

| Problemes | Com són |
|---|---|
| 1–6 | Una filera de 3 o 4 cercles |
| 7–12 | Dues fileres |
| 13–18 | Tres fileres (triangles) |
| 19–30 | Quatre fileres |
| 31–36 | Una filera de 4 cercles amb nombres de dues xifres |
| 37–42 | Dues fileres llargues |

`node tests/escala-nombres.test.js` comprova que cada filera té almenys 3 cercles, que cada problema té **una
sola solució** (buscant nombres de 1 a 200) i que és la del PDF de solucions (l'script també la llegeix del PDF).
No s'hi ha trobat cap errada. En alguns problemes (27, 28, 29, 41) hi ha el mateix nombre en dos cercles: és
correcte, perquè són de fileres diferents.
