# Talla en rectangles (四角カット)

Puzzle original de Naoki Inaba: `src/shikaku_q.pdf` (enunciats) i `src/shikaku_a.pdf` (solucions).
Versió interactiva: [`talla-rectangles.html`](../talla-rectangles.html).

## Traducció de les instruccions (pàgina 1 del PDF)

| Japonès | Català |
|---|---|
| 四角カット | Talla en rectangles |
| マス目にそって決められたマス数の四角形に分けましょう | Divideix la figura en rectangles, seguint les línies de la quadrícula, que tinguin el nombre de quadrets indicat. |
| ３，５，６マス | 3, 5 i 6 quadrets |
| マス目にそって四角形に分けましょう | Divideix-la en rectangles seguint les línies de la quadrícula |
| どれも四角形です | Tots són rectangles. ✓ |
| 四角形ではありません | Aquest no és un rectangle. ✗ |
| 四角形は決められたマス数になるようにします | Cada rectangle ha de tenir un dels nombres de quadrets indicats |
| ３マス ／ ５マス ／ ６マス | 3 quadrets / 5 quadrets / 6 quadrets |

Notes de traducció:

- 四角形 vol dir «quadrilàter», però si es talla per les línies de la quadrícula, els únics quadrilàters
  possibles són rectangles (l'exemple ✗ és una peça en forma de L). Per això «rectangles».
- マス (*masu*) és cada quadret de la quadrícula: «quadrets».
- La frase «Per dibuixar un rectangle, arrossega d'un quadret fins al de la cantonada oposada» no és al PDF:
  explica com es fa a la web.

## Com és a la web

- Es dibuixa un rectangle **arrossegant** d'un quadret fins al de la cantonada oposada (amb el ratolí o el
  dit). Mentre es dibuixa, a sota de la figura es veu «base × altura = quadrets».
- Un rectangle nou que en trepitja d'altres els treu; **tocar** un rectangle també el treu.
- **Teclat**: fletxes per moure el quadret marcat, Enter per començar i acabar un rectangle, Esc per desfer-lo
  i Supr per treure el rectangle del quadret marcat.
- Cada mida de la llista té un color, i el rectangle que en té la mida es pinta d'aquell color (i la mida de
  la llista es marca amb ✓). Un rectangle amb una mida que no és a la llista, o que ja hi és, es pinta de
  vermell.
- Quan la figura és plena, es comprova sola; si és correcta, es mostra cada rectangle com a base × altura.

## Els 42 problemes

Les dades són a [`js/talla-rectangles/problemes.js`](../js/talla-rectangles/problemes.js): cada figura, com
a files de text ('#' és un quadret). **No s'escriuen a mà**: les genera
[`tools/extreu-rectangles.py`](../tools/extreu-rectangles.py), que llegeix la vora de cada figura i les mides
directament del PDF (`python3 tools/extreu-rectangles.py`, des de l'arrel del repositori; cal
`poppler-utils`). L'exemple de la pàgina 1 és una imatge al PDF i s'ha copiat a mà a l'script.

| Problemes | Com són |
|---|---|
| 1–24 | Tres rectangles |
| 25–42 | Quatre rectangles |

`node tests/talla-rectangles.test.js` comprova que les mides de cada problema sumen l'àrea de la figura, que
cada problema té **una sola solució** i que és la del PDF de solucions (que l'script també llegeix del PDF).

**Errada del PDF de solucions:** al problema 41 (6, 8, 10 i 15 quadrets), el dibuix de la solució fa peces de
5, 20, 8 i 6 quadrets: hi falta el tall que separa el rectangle de 10 (5 × 2) del de 15 (5 × 3), i n'hi sobra
un d'horitzontal. La solució bona és 15 = 5 × 3 (dalt a la dreta), 10 = 5 × 2, 8 = 4 × 2 i 6 = 6 × 1.
