# Busca la figura (図形探し)

Puzzle original de Naoki Inaba: `src/zukei_q.pdf` (enunciats) i `src/zukei_a.pdf` (solucions).
Versió interactiva: [`busca-la-figura.html`](../busca-la-figura.html).

## Traducció de les instruccions (pàgina 1 del PDF)

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

Notes de traducció:

- Als problemes també es demana el **triangle rectangle isòsceles** (直角二等辺三角形, en 5 problemes), que no surt
  a la pàgina d'instruccions. A la web s'hi explica en una frase que **no és al PDF**: «Un triangle rectangle
  isòsceles té un angle recte i dos costats iguals».
- Tampoc són al PDF: la frase sobre les marques (l'escaire, les ratlletes i les fletxetes) i «Toca els vèrtexs (o
  arrossega d'un punt a l'altre); per treure un punt, toca'l un altre cop» (com es juga a la web).

## Les definicions: inclusives

Les definicions del PDF són **inclusives** i el joc les fa servir així: un quadrat també és un rectangle, un rombe,
un paral·lelogram i un trapezi; un paral·lelogram també és un trapezi (té almenys un parell de costats paral·lels);
un triangle rectangle isòsceles també és rectangle i isòsceles.

S'ha comprovat amb les solucions: en 40 problemes, el criteri inclusiu i l'exclusiu donen la mateixa solució
única (la del PDF). Els altres dos són errades del PDF (més avall).

## Com és a la web

- La mateixa quadrícula de punts del «Busca el triangle» (el joc fa servir el seu `tauler.js`): **tocar** un punt
  el tria i tocar-lo un altre cop el treu; **traçar** d'un punt a l'altre (si el traç passa en línia recta per
  sobre d'un punt, aquest no queda triat); **teclat**: fletxes, Enter, ⌫/Supr i Esc.
- Es trien 3 vèrtexs per als triangles i 4 per als quadrilàters. L'ordre no importa: la figura es dibuixa
  resseguint la vora.
- Amb prou vèrtexs es comprova sol. Es dibuixen les marques de les propietats que fa servir la definició de la
  figura demanada (l'escaire als angles rectes, ratlletes als costats iguals, fletxetes als costats paral·lels).
  - Si és correcte: «Molt bé! És un rombe. Té els quatre costats iguals.» (i, si és més concreta, «De fet, és un
    quadrat»).
  - Si no: la propietat que falta i què s'ha fet («No és un rombe. Els quatre costats no són iguals. Has fet un
    trapezi.»); o que hi ha tres punts alineats, o que un punt queda a dins del triangle dels altres tres.

## Els 42 problemes

Les dades són a [`js/busca-la-figura/problemes.js`](../js/busca-la-figura/problemes.js): la mida de la
quadrícula, els punts i la figura. **No s'escriuen a mà**: les genera
[`tools/extreu-figura.py`](../tools/extreu-figura.py) a partir del PDF (`python3 tools/extreu-figura.py`, des de
l'arrel del repositori; cal `poppler-utils`). L'exemple de la pàgina 1 s'ha copiat a mà a l'script.

| Problemes | Com són |
|---|---|
| 1–6 | Quadrats i rectangles «drets», quadrícules de 3 × 3 a 5 × 5 |
| 7–12 | Triangles (rectangle, rectangle isòsceles, isòsceles) |
| 13–18 | Trapezis, paral·lelograms i rombes |
| 19–42 | Barrejats, i moltes figures girades |

`node tests/busca-la-figura.test.js` comprova que cada problema té **una sola solució** (excepte el 17 i el 19)
i que la del PDF de solucions hi és (l'script la llegeix de les anelles del PDF).

**Errades del PDF:**

- **17** (paral·lelogram): té **2 solucions**. La del PDF és (5,0)–(1,1)–(5,3)–(1,4); també ho és
  (0,1)–(1,1)–(5,3)–(4,3).
- **19** (triangle rectangle): amb la definició del PDF («té un angle recte»), a més de la solució del PDF
  (0,1)–(0,2)–(2,2), també ho és el triangle rectangle isòsceles (0,2)–(2,0)–(2,2). Potser el PDF entén «triangle
  rectangle» com a «no isòsceles» (perquè el rectangle isòsceles és una figura a part), però les instruccions no ho
  diuen.

Es manté l'enunciat original i el joc accepta les dues solucions de cada un.
