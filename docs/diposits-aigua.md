# Dipòsits d'aigua (水そうと水)

Puzzle original de Naoki Inaba: `src/mizu_q.pdf` (enunciats) i `src/mizu_a.pdf` (solucions).
Versió interactiva: [`diposits-aigua.html`](../diposits-aigua.html).

## Traducció de les instruccions (pàgina 1 del PDF)

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
- Frases que **no són al PDF**: «Toca un dipòsit a l'altura on vols l'aigua, o arrossega amunt i avall. També pots
  escriure el nivell a sota (per exemple, 5/4)» (com es juga a la web). A l'explicació de la columna s'hi diu «en la
  columna de la dreta» en lloc de «en aquesta columna».

## La regla de l'aigua

Cada dipòsit és un rectangle de cubs (1 cub = 1 litre). L'aigua d'un dipòsit té un **nivell** h, de 0 a la seva
alçada en cubs: arriba a la mateixa altura a tot el dipòsit, i omple primer els cubs de baix. Per tant, un cub que
té p cubs del mateix dipòsit a sota té min(1, max(0, h − p)) litres. Els totals de fora són la suma de l'aigua dels
cubs d'aquella fila o columna.

## Com és a la web

- Dins de cada cub s'hi escriu quanta aigua té (com fa el PDF de solucions als problemes 37–42).
- **Tocar** un dipòsit hi posa l'aigua fins a aquella altura, ajustada a les marques, i el tria; **arrossegar** amunt i
  avall la fa pujar i baixar.
- A sota, el **dipòsit triat**: − i + (d'una marca en una marca) i el nivell en fracció, que s'hi pot **escriure**
  (5/4, 13/10…). Als problemes sense marques (37–42), els nivells pugen i baixen d'1/(2 × m.c.m.) en 1/(2 × m.c.m.)
  dels denominadors dels totals (de 1/16 a 1/60): s'hi arriba millor escrivint la fracció.
- **Teclat**: Tab per anar d'un dipòsit a l'altre; fletxes amunt i avall (una marca); Re Pàg / Av Pàg (un cub);
  Inici (buit) i Fi (ple); una xifra va al quadre del nivell.
- Quan tots els totals quadren, es diu sol amb les sumes de cada fila i columna. El botó **Comprova** diu quins totals
  no quadren («A la fila 1: 1/2 + 0 = 1/2, i hi ha d'haver 3/4»).

## Els 42 problemes

Les dades són a [`js/diposits-aigua/problemes.js`](../js/diposits-aigua/problemes.js): els dipòsits (una lletra per
cub), les divisions de les marques i els totals. **No s'escriuen a mà**: les genera
[`tools/extreu-diposits.py`](../tools/extreu-diposits.py) a partir del PDF (`python3 tools/extreu-diposits.py`, des de
l'arrel del repositori; cal `poppler-utils`). L'exemple de la pàgina 1 s'ha copiat a mà a l'script.

| Problemes | Com són |
|---|---|
| 1–6 | 2 × 2 cubs, quarts |
| 7–12 | 2 × 2 cubs, sisens |
| 13–18 | 3 × 2 i 2 × 3 cubs, quarts |
| 19–24 | 3 × 2 i 2 × 3 cubs, sisens |
| 25–30 | 3 × 3 cubs, quarts |
| 31–36 | 3 × 3 cubs, sisens |
| 37–42 | 2 × 2 cubs, sense marques (fraccions com 13/24 o 13/36) |

El motor ([`js/diposits-aigua/motor.js`](../js/diposits-aigua/motor.js)) resol cada problema exactament: per a cada
dipòsit tria a quin pis és la superfície de l'aigua, i aleshores els totals són equacions lineals que es resolen amb
fraccions (Gauss); les solucions es busquen com els vèrtexs del conjunt de solucions de cada cas.
`node tests/diposits-aigua.test.js` comprova que cada problema té **una sola solució** i que és la del PDF de
solucions: als problemes 1–36, l'aigua dibuixada (arrodonida a les marques); als 37–42, les fraccions que el PDF
escriu a cada cub. No s'hi ha trobat cap errada.
