# Traduccions de les instruccions dels puzzles pendents

Traducció revisada de la pàgina 1 (instruccions i exemples) dels puzzles de `src/` que encara no s'han
fet. Està feta directament dels PDF i contrastada amb una traducció de Gemini; les notes de cada puzzle diuen
on no coincidien i per què.

Quan es faci un puzzle, la seva part passa al seu propi fitxer (com
[`enllac-multiples.md`](enllac-multiples.md), [`laberint-angles.md`](laberint-angles.md),
[`expressions-bessones.md`](expressions-bessones.md), [`talla-rectangles.md`](talla-rectangles.md),
[`creuat-multiples.md`](creuat-multiples.md), [`on-es-la-xifra.md`](on-es-la-xifra.md), [`busca-el-nombre.md`](busca-el-nombre.md), [`busca-el-triangle.md`](busca-el-triangle.md), [`escala-nombres.md`](escala-nombres.md), [`busca-la-figura.md`](busca-la-figura.md) i [`afegeix-zeros.md`](afegeix-zeros.md)).

**Criteris:**

- Es parla de tu, com a les pàgines que ja estan fetes («Col·loca», «Ves»…).
- **xifra** és cada símbol del 0 al 9; **nombre**, la quantitat; **número**, el que hi ha escrit en una
  casella, targeta o cercle.
- 式 (*shiki*) es tradueix per **igualtat**, no per «equació»: en aquests puzzles no hi ha incògnites.
- ○ del PDF = ✓ (correcte); × del PDF = ✗ (incorrecte).
- Els noms dels puzzles són els aprovats per a la portada.

| Puzzle | Original | PDF |
|---|---|---|
| [Dipòsits d'aigua](#dipòsits-daigua) | 水そうと水 | `mizu` |

---

## Dipòsits d'aigua

`src/mizu_q.pdf` · 水そうと水

| Japonès | Català |
|---|---|
| 水そうと水 | Dipòsits d'aigua |
| 各々の水そうにはどれだけ水が入っているでしょうか？ | Quanta aigua hi ha a cada dipòsit? |
| ・外側の数字はその列に入っている水の量の合計を表します | · Els números de fora són el total d'aigua que hi ha en aquella fila o columna. |
| １リットル | 1 litre (un cub ple d'aigua) |
| この列だと 上は１／３リットル 下は１／２リットル 合わせて５／６リットル | En aquesta columna, a dalt hi ha 1/3 de litre i a baix 1/2 litre: en total, 5/6 de litre. |
| ！注意！ 水そうの水は下の方にたまります | Compte! L'aigua d'un dipòsit es queda a baix. |
| 一つの水そうの中では水面の高さはどこも同じになります | Dins d'un mateix dipòsit, l'aigua arriba a la mateixa altura a tot arreu. |
| 二段以上の水そうは上に水が入っているとき下の方がいっぱいです | En un dipòsit de dos o més pisos, si hi ha aigua al pis de dalt, el de sota és ple. |

Notes:

- **Cada cub ple d'aigua fa 1 litre** (el cub de l'etiqueta «１リットル»). Sense aquesta dada, les fraccions no
  tenen referència; la traducció de Gemini se la deixava.
- Un dipòsit (vora gruixuda) pot ocupar uns quants cubs, separats per línies fines: un dipòsit ample (l'aigua
  hi fa la mateixa altura a tots els cubs) o alt (de dos pisos).
- Les fletxes apunten a una fila (des de l'esquerra) o a una columna (des de dalt).
