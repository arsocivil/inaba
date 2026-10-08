# Traduccions de les instruccions dels puzzles pendents

Traducció revisada de la pàgina 1 (instruccions i exemples) dels puzzles de `src/` que encara no s'han
fet. Està feta directament dels PDF i contrastada amb una traducció de Gemini; les notes de cada puzzle diuen
on no coincidien i per què.

Quan es faci un puzzle, la seva part passa al seu propi fitxer (com
[`enllac-multiples.md`](enllac-multiples.md), [`laberint-angles.md`](laberint-angles.md),
[`expressions-bessones.md`](expressions-bessones.md), [`talla-rectangles.md`](talla-rectangles.md),
[`creuat-multiples.md`](creuat-multiples.md), [`on-es-la-xifra.md`](on-es-la-xifra.md), [`busca-el-nombre.md`](busca-el-nombre.md), [`busca-el-triangle.md`](busca-el-triangle.md) i [`escala-nombres.md`](escala-nombres.md)).

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
| [Afegeix zeros](#afegeix-zeros) | ゼロゼロ式 | `zero` |
| [Busca la figura](#busca-la-figura) | 図形探し | `zukei` |

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

---

## Afegeix zeros

`src/zero_q.pdf` · ゼロゼロ式

| Japonès | Català |
|---|---|
| ゼロゼロ式 | Afegeix zeros |
| 数字の書かれたカードで作られた式があります | Hi ha una igualtat feta amb targetes que tenen un número. |
| ・いくつかのカードに０を書きくわえて正しい式にしましょう | · Afegeix zeros a algunes targetes perquè la igualtat sigui correcta. |
| 【例題】 １＋２＋３＝２３１ | Exemple: 1 + 2 + 3 = 231 |
| 【解答】 １＋２００＋３０＝２３１ | Solució: 1 + 200 + 30 = 231 |
| カードに０を書き加えます | Afegeix zeros a les targetes |
| １ 一つも書かない ／ ２００ 二つ書く ／ ３０ 一つ書く | 1: no n'hi escrius cap / 200: n'hi escrius dos / 30: n'hi escrius un |
| １８ ／ ２１０ ０でない数字を書いてはいけません | 18 / 210: no pots escriure xifres que no siguin 0. ✗ |
| 正しい式にしましょう | La igualtat ha de ser correcta |
| １＋２００＋３０＝２３１ 正しい式です | 1 + 200 + 30 = 231: és correcta. ✓ |
| １０＋２＋３００＝２３１ 計算が合っていません | 10 + 2 + 300 = 231: el càlcul no surt. ✗ |

Notes:

- «Cap, dos, un» són les etiquetes de l'exemple, **no una regla**: el PDF no diu que se'n puguin posar dos
  com a màxim (la traducció de Gemini ho presentava com a norma).
- Totes les targetes dels 49 problemes tenen **una sola xifra**, així que els zeros només poden anar al
  final (2 → 200). A l'exemple ✗, el 18 i el 210 hi afegeixen un 8 i un 1.

---

## Busca la figura

`src/zukei_q.pdf` · 図形探し

| Japonès | Català |
|---|---|
| 図形探し | Busca la figura |
| ・下に書かれた図形ができるように頂点を選んで辺で結びましょう | · Tria vèrtexs i uneix-los amb costats per fer la figura que hi ha escrita a sota. |
| 二等辺三角形 | Triangle isòsceles |
| いろいろな図形の例 | Exemples de figures |
| ！注意！ いつも同じ向きとは限りません | Compte! No sempre estan en la mateixa posició (poden estar girades). |
| 二等辺三角形 ・二辺が等しい | Triangle isòsceles: té dos costats iguals. |
| 正方形 ・四つの辺が等しい ・四つの角が等しい | Quadrat: té els quatre costats iguals i els quatre angles iguals. |
| 長方形 ・四つの角が等しい | Rectangle: té els quatre angles iguals. |
| ひし形 ・四つの辺が等しい | Rombe: té els quatre costats iguals. |
| 台形 ・一組の辺が平行 | Trapezi: té un parell de costats paral·lels. |
| 平行四辺形 ・二組の辺が平行 | Paral·lelogram: té dos parells de costats paral·lels. |
| 直角三角形 ・直角な角を持つ | Triangle rectangle: té un angle recte. |

Notes:

- Als problemes també es demana el **triangle rectangle isòsceles** (直角二等辺三角形, en 5 problemes), que no
  surt a la pàgina d'instruccions.
- Les definicions del PDF són **inclusives**: un quadrat també té els quatre angles iguals (és un rectangle)
  i els quatre costats iguals (és un rombe). Pel trapezi, «un parell de costats paral·lels» pot voler dir
  «almenys un» o «només un»: quan es faci el puzzle, s'haurà de mirar a les solucions quin criteri fa servir.
