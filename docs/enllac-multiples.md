# Enllaç de múltiples (倍数リンク)

Puzzle original de Naoki Inaba: `src/blink_q.pdf` (enunciats) i `src/blink_a.pdf` (solucions).
Versió interactiva: [`enllac-multiples.html`](../enllac-multiples.html).

## Traducció de les instruccions (pàgina 1 del PDF)

| Japonès | Català |
|---|---|
| 倍数リンク | Enllaç de múltiples |
| 点線でかこまれた所に「数字カード」を置いてください | Col·loca les «targetes numerades» als llocs de vora discontínua. |
| ・カードからのびる矢印の先にはそのカードの倍数が入ります | · A la punta de cada fletxa que surt d'una targeta hi va un múltiple d'aquella targeta. |
| 【例題】 | Exemple |
| 【解答】 | Solució |
| ここにカードを置きます | Aquí hi va una targeta |
| 数字カード | Targetes numerades |
| ・10 のカードはもう使われています | · La targeta del 10 ja està feta servir. |
| ・おなじカードは一回しか使えません | · Cada targeta només es pot fer servir una vegada. |
| ！注意！ 全部のカードを使わない問題もあります | Compte! En alguns problemes sobren targetes. |
| カードからのびる矢印の先にはそのカードの倍数が入ります | A la punta de cada fletxa hi va un múltiple de la targeta d'on surt. |
| ・１０は５の倍数 | · 10 és múltiple de 5 |
| ・２０は４の倍数 | · 20 és múltiple de 4 |
| ダメな例 ・10 は４の倍数でない | Exemple incorrecte · 10 no és múltiple de 4 |

Notes de traducció:

- **リンク** (*link*) és «enllaç»: les fletxes enllacen cada nombre amb un múltiple seu.
- Al paper, les targetes que ja són al tauler es marquen amb un ✓ a la fila de targetes. A la versió web
  es fa igual, i també es marquen les que l'alumne ja ha posat.
- Les etiquetes ×2, ×5… de les fletxes (que surten a la pàgina 1 del PDF) a la web apareixen quan el
  problema està resolt.

## Els 42 problemes

Les dades són a [`js/enllac-multiples/problemes.js`](../js/enllac-multiples/problemes.js), en el mateix
ordre que el PDF (6 problemes per pàgina, de més fàcil a més difícil):

| Problemes | Com són |
|---|---|
| 1–6 | Dues targetes i una fletxa (de vegades, una ja posada) |
| 7–12 | Tres targetes en fila, una ja posada |
| 13–18 | Quatre targetes en quadrat, una ja posada |
| 19–24 | Quatre llocs buits en quadrat, amb fletxes en diagonal |
| 25–30 | Nombres de dues xifres (cal buscar divisors: 76 = 4 × 19, 91 = 7 × 13…) |
| 31–36 | Dues targetes buides i en sobren una o dues |
| 37–42 | Tres targetes en fila i en sobra una |

`node tests/enllac-multiples.test.js` comprova que cada problema té **una sola solució** i que coincideix
amb la del PDF.

**Errada del PDF de solucions:** al problema 13, `blink_a.pdf` posa un 24 al lloc de dalt a la dreta, però
hi va el **8** (la targeta del 24 ja és a baix a la dreta, i 24 = 8 × 3).
