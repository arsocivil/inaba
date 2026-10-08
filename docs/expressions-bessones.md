# Expressions bessones (双子式)

Puzzle original de Naoki Inaba: `src/gemini_q.pdf` (enunciats) i `src/gemini_a.pdf` (solucions).
Versió interactiva: [`expressions-bessones.html`](../expressions-bessones.html).

## Traducció de les instruccions (pàgina 1 del PDF)

| Japonès | Català |
|---|---|
| 双子式 | Expressions bessones |
| 数字が書かれた二枚のカードがあります | Hi ha dues targetes amb números. |
| ・どちらにも同じ記号を書き加えて正しい式にしましょう | · Afegeix els mateixos signes a totes dues perquè les dues igualtats siguin correctes. |
| ・使うことのできる記号は＋－×÷と（）です | · Pots fer servir els signes +, −, ×, ÷ i els parèntesis ( ). |
| 【例題】 1 1 2 ＝4 ／ 2 1 1 ＝3 | Exemple: 1 1 2 = 4 / 2 1 1 = 3 |
| 【解答】 （1＋1）×2＝4 ／ （2＋1）×1＝3 | Solució: (1 + 1) × 2 = 4 / (2 + 1) × 1 = 3 |
| ＋－×÷と（）を使って正しい式にしましょう | Fes servir +, −, ×, ÷ i ( ) perquè la igualtat sigui correcta |
| 1＋1＋2＝4 正しい式です | 1 + 1 + 2 = 4: és correcta. ✓ |
| 1＋1×2＝4 計算が合っていません | 1 + 1 × 2 = 4: el càlcul no surt. ✗ |
| どちらのカードにも同じ記号を書き加えます | Afegeix els mateixos signes a totes dues targetes |
| （1＋1）×2＝4 ／ （2＋1）×1＝3 どちらも同じです | (1 + 1) × 2 = 4 / (2 + 1) × 1 = 3: totes dues tenen els mateixos signes. ✓ |
| 1＋1＋2＝4 ／ 2×1＋1＝3 同じではありません | 1 + 1 + 2 = 4 / 2 × 1 + 1 = 3: no tenen els mateixos signes. ✗ |

Notes de traducció:

- 式 (*shiki*) es tradueix per **igualtat**, no per «equació»: aquí no hi ha incògnites.
- «Els mateixos signes» vol dir els mateixos **i als mateixos llocs**. A l'exemple ✗, cada targeta té
  signes diferents (+ + a dalt, × + a baix).
- L'exemple ✗ «1 + 1 × 2 = 4» falla per la **prioritat de les operacions** (1 + 1 × 2 = 1 + 2 = 3): lliga
  amb `prioritat.html` d'operacions. Per això les instruccions de la web hi afegeixen un recordatori de l'ordre
  de les operacions, que no és al PDF.

## Com és a la web

- Les dues targetes són **bessones**: cada signe es posa una sola vegada i va sol a totes dues, de manera
  que la regla dels «mateixos signes» es compleix sempre.
- Els parèntesis «( )» es deixen sobre el signe de l'operació que s'ha de fer primer.
- Quan hi ha els dos signes, es comprova sol i es mostra el càlcul de cada targeta pas a pas, amb fraccions
  exactes si cal (18 ÷ 12 × 2 = (3/2) × 2 = 3).
- S'accepta qualsevol tria de signes que faci correctes totes dues igualtats, encara que no sigui la del PDF.

## Els 42 problemes

Les dades són a [`js/expressions-bessones/problemes.js`](../js/expressions-bessones/problemes.js), en el
mateix ordre que el PDF:

| Problemes | Signes de la solució |
|---|---|
| 1–6 | + i − |
| 7–12 | hi entra el × |
| 13–18 | hi entra el ÷ |
| 19–36 | hi entren els parèntesis |
| 37–42 | nombres de dues xifres |

`node tests/expressions-bessones.test.js` comprova que cada problema té solució, que és única (llevat de
parèntesis que no canvien res, com (a × b) + c) i que la del PDF de solucions és una de les bones.

**Dues errades del PDF de solucions:**

- **Problema 17.** El PDF hi posa 3 ÷ 3 + 2 = 3 i 4 ÷ 2 + 1 = 4, però 4 ÷ 2 + 1 fa 3. Amb l'enunciat del
  PDF (3 3 2 = 3 i 4 2 1 = 4), el problema té dues solucions, totes dues amb parèntesis:
  3 × (3 − 2) = 3 i 4 × (2 − 1) = 4, o bé amb ÷ en lloc de ×. La web accepta totes dues. Si la segona
  targeta fos «4 2 1 = 3» (o «4 2 2 = 4»), l'única solució seria la del PDF, a ÷ b + c.
- **Problema 41.** A la segona targeta hi falten els parèntesis: és 12 × (8 − 6) = 24, no 12 × 8 − 6.
