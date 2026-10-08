# Afegeix zeros (ゼロゼロ式)

Puzzle original de Naoki Inaba: `src/zero_q.pdf` (enunciats) i `src/zero_a.pdf` (solucions).
Versió interactiva: [`afegeix-zeros.html`](../afegeix-zeros.html).

## Traducció de les instruccions (pàgina 1 del PDF)

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
- Frases que **no són al PDF**: «Toca una targeta per afegir-hi un zero, i toca un zero per treure'l» (com es juga a
  la web). A l'exemple ✗ s'hi afegeix el càlcul (10 + 2 + 300 = 312) per veure per què no surt.

## Com és a la web

- Els zeros afegits es veuen dins d'un cercle, del color del tema (com els zeros encerclats del PDF).
- **Tocar** una targeta hi afegeix un zero; **tocar un zero** el treu.
- **Arrossegar** el «0» de sota fins a una targeta hi afegeix un zero; arrossegar un zero fora de la targeta el treu
  (i, si cau en una altra targeta, s'hi posa).
- **Teclat**: Tab o fletxes per anar d'una targeta a l'altra; 0, Enter o espai per afegir un zero; ⌫ o Supr per
  treure'n un.
- Una targeta no pot tenir més zeros que xifres té el total menys una («No hi caben més zeros: 300 ja seria més gran
  que 92»).
- Quan la igualtat és correcta, es diu sola amb el càlcul («6 + 700 + 90 + 30 = 826»). El botó **Comprova** mostra el
  càlcul de la igualtat tal com està i quant falta o sobra («30 + 6 + 2 = 38, i no 92. Falten 54.»).

## Els 49 problemes

Les dades són a [`js/afegeix-zeros/problemes.js`](../js/afegeix-zeros/problemes.js): les xifres de les targetes i el
total. **No s'escriuen a mà**: les genera [`tools/extreu-zeros.py`](../tools/extreu-zeros.py) a partir del text del
PDF (`python3 tools/extreu-zeros.py`, des de l'arrel del repositori; cal `poppler-utils`).

| Problemes | Com són |
|---|---|
| 1–35 | Tres targetes |
| 36–49 | Quatre targetes |

`node tests/afegeix-zeros.test.js` comprova que cada problema té **una sola solució** i que és la del PDF de
solucions (l'script també la llegeix del PDF). No s'hi ha trobat cap errada. Els problemes **16 i 20 són iguals**
(8 + 2 + 3 = 31) al PDF: s'han deixat tots dos.
