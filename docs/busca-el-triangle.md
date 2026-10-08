# Busca el triangle (三角探し)

Puzzle original de Naoki Inaba: `src/sankaku_q.pdf` (enunciats) i `src/sankaku_a.pdf` (solucions).
Versió interactiva: [`busca-el-triangle.html`](../busca-el-triangle.html).

## Traducció de les instruccions (pàgina 1 del PDF)

| Japonès | Català |
|---|---|
| 三角探し | Busca el triangle |
| ・下に書かれた面積の三角形ができるように三つの頂点を選んで辺で結びましょう | · Tria tres vèrtexs i uneix-los amb costats per fer un triangle que tingui l'àrea que hi ha escrita a sota. |
| 面積３ | Àrea 3 |
| 基本的な三角形の面積 | L'àrea d'un triangle senzill |
| 計算してみよう | Calcula-la |
| 底辺の長さ２ ／ 高さ３ | Base 2 / Altura 3 |
| ２×３÷２＝３（底辺×高さ÷２＝面積） | 2 × 3 : 2 = 3 (base × altura : 2 = àrea) |
| 斜めになった三角形の面積 | L'àrea d'un triangle inclinat |
| 面積９ ／ 面積1.5 ／ 面積２ | Àrea 9 / Àrea 1,5 / Àrea 2 |
| 全体から周りの三角形をひくと ９－1.5－1.5－２＝４ 面積４ | Si a tot el quadrat li treus els triangles del voltant: 9 − 1,5 − 1,5 − 2 = 4. Àrea 4 |

Notes de traducció:

- La traducció de Gemini era correcta. Els decimals s'escriuen amb coma (1,5) i la divisió amb «:», com es
  fa a classe.
- 頂点 són els **vèrtexs** (els punts negres); 面積 és l'**àrea**, en quadrets de la quadrícula.
- Frases que **no són al PDF**: «Cada quadret fa 1 d'àrea» (al PDF s'entén pels exemples) i «Toca tres punts
  (o arrossega d'un punt a l'altre); per treure un punt, toca'l un altre cop» (com es juga a la web).
- La regla de dalt del tauler («Tria tres punts: han de fer un triangle amb l'àrea que hi ha a sota») resumeix
  la del PDF.

## Com és a la web

- **Tocar o clicar** un punt el tria (li surt una anella, com els cercles del PDF de solucions); tocar-ne un de
  triat el treu. Si ja n'hi ha tres, primer se n'ha de treure un.
- **Traçar**: prémer un punt i, sense aixecar el dit, passar per uns altres; cada punt per on passa queda triat.
  Si el traç passa en línia recta per sobre d'un punt i continua fins a un altre, el del mig no queda triat (no
  seria un vèrtex): així es pot dibuixar un costat que passa per sobre d'un punt.
- **Teclat**: fletxes per anar d'un punt a l'altre, Enter (o espai) per triar-lo o treure'l, ⌫ o Supr per
  treure'l i Esc per treure'ls tots.
- Amb tres punts triats es comprova sol (si es traça, en aixecar el dit). Tant si és correcte com si no, es
  dibuixa **com es calcula l'àrea**, igual que a les instruccions del PDF:
  - si un costat és horitzontal o vertical: la base, l'altura (línia de punts, amb l'escaire) i
    «Base 4 × altura 3 : 2 = 6»;
  - si no: el rectangle que envolta el triangle (línia de punts) i les peces del voltant amb la seva àrea:
    «El rectangle que l'envolta fa 3 × 3 = 9. Si li treus els triangles del voltant: 9 − 1,5 − 1,5 − 2 = 4».
    Quan dos vèrtexs són cantonades oposades del rectangle, entre les peces hi ha també un rectangle petit.
  - si els tres punts estan alineats: «Els tres punts estan alineats: no fan cap triangle».
- S'accepta **qualsevol** triangle amb l'àrea demanada (vegeu el problema 26).

## Els 42 problemes

Les dades són a [`js/busca-el-triangle/problemes.js`](../js/busca-el-triangle/problemes.js): la mida de la
quadrícula, els punts ([columna, fila], amb la fila 0 a dalt) i l'àrea. **No s'escriuen a mà**: les genera
[`tools/extreu-triangle.py`](../tools/extreu-triangle.py) a partir del PDF (`python3 tools/extreu-triangle.py`,
des de l'arrel del repositori; cal `poppler-utils`). L'exemple de la pàgina 1 s'ha copiat a mà a l'script
(a la pàgina hi ha també els dibuixos de l'explicació).

| Problemes | Com són |
|---|---|
| 1–18 | Quadrícula de 3 × 3, àrees 1, 2 i 3 |
| 19–36 | Quadrícula de 4 × 4, àrees 1, 2, 3, 4, 6 i 8 |
| 37–42 | Quadrícula de 4 × 4, menys punts i àrees de 6 a 1 |

`node tests/busca-el-triangle.test.js` comprova que els punts són vèrtexs de la quadrícula, que cada problema té
**una sola solució**, que és la del PDF de solucions (l'script la llegeix dels cercles del PDF), i que el
desglossament de l'àrea quadra per a totes les ternes de punts de tots els problemes.

**Errada del PDF:** el problema 26 (àrea 2) té **3 solucions**, no 1. La del PDF és (0,3)–(4,3)–(1,4) (base 4,
altura 1); també valen (2,0)–(0,1)–(0,3) (base vertical de 2, altura 2) i (2,0)–(1,1)–(3,3) (inclinat:
2 × 3 − 0,5 − 2 − 1,5 = 2). Es manté l'enunciat original i el joc accepta les tres.
