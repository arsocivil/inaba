# Busca el nombre (かずさがし)

Puzzle original de Naoki Inaba: `src/kazu_q.pdf` (enunciats) i `src/kazu_a.pdf` (solucions).
Versió interactiva: [`busca-el-nombre.html`](../busca-el-nombre.html). Està escrit en *hiragana*, per als més
petits: el català ha de ser senzill.

## Traducció de les instruccions (pàgina 1 del PDF)



| Japonès | Català |
|---|---|
| かずさがし | Busca el nombre |
| ・いわれたところを「たて３ よこ３ のしかく」でかこみましょう | · Envolta el lloc que et demanen amb un «quadrat de 3 × 3» (3 d'alt i 3 d'ample). |
| 【もんだい】／【こたえ】 | Problema / Resposta |
| ２こ はどこ？ | On n'hi ha 2? |
| かこんだリンゴのかずをかぞえてみよう | Compta les pomes que queden dins del quadrat |
| １こ ／ ３こ ／ ４こ | 1 / 3 / 4 |
| ！ちゅうい！ てんせんから はみだしては いけません | Compte! No pots sortir de la línia de punts. |
| しかくの おおきさが ちがいます | Aquest quadrat no és de la mida que toca. |

Preguntes de les pàgines 2-8:

| Japonès | Català |
|---|---|
| ・いわれたところを「たて２ よこ２ のしかく」でかこみましょう | · Envolta el lloc que et demanen amb un «quadrat de 2 × 2». |
| ０こ はどこ？ … １０こ はどこ？ | On n'hi ha 0? … On n'hi ha 10? |
| ミカンがリンゴより おおいのはどこ？ | On hi ha més mandarines que pomes? |
| ミカンがリンゴより すくないのはどこ？ | On hi ha menys mandarines que pomes? |
| リンゴがミカンより おおいのはどこ？ | On hi ha més pomes que mandarines? |
| リンゴがミカンより すくないのはどこ？ | On hi ha menys pomes que mandarines? |
| リンゴとミカンのかずが おなじなのはどこ？ | On hi ha tantes pomes com mandarines? |
| リンゴとミカンのかずのさ が０／１／２ なのはどこ？ | On la diferència entre pomes i mandarines és 0 / 1 / 2? |

Notes:

- かこむ és «envoltar»: és un quadrat, no un cercle (Gemini deia «encercla»).
- El «Compte!» és per no sortir de la línia de punts i per la mida del quadrat (els dos exemples ✗). Gemini
  ho havia llegit com «compta bé els elements».

No són al PDF, i s'han afegit a la web:

- «(de 2 × 2 o de 3 × 3; sempre ho diu a sobre del tauler)»: la pàgina 1 només parla del quadrat de 3 × 3, però
  les pàgines 2–8 alternen 2 × 2 i 3 × 3 (problemes 1–6, 13–18 i 25–30: 2 × 2; la resta: 3 × 3).
- «Aquí, el quadrat ja és de la mida que toca i no et deixa sortir de la línia de punts: només cal triar el lloc»
  (vegeu «Com és a la web»).
- La frase de dalt del tauler («Posa un quadrat de 3 × 3 allà on toca…») és una síntesi.

## Com és a la web

- El quadrat té **sempre la mida que toca** i **no pot sortir de la línia de punts**: els dos errors (✗) de
  «Compte!» no es poden cometre. Es mantenen a les instruccions perquè són al PDF.
- Es pot **arrossegar** (el quadrat va seguint el punter, encaixat als quadrets; amb el dit va 40 px per sobre
  perquè no quedi amagat), **tocar** el lloc, o amb el **teclat** (fletxes, Enter, Esc/⌫/Supr per treure'l).
  Deixar anar fora del tauler no fa res.
- En posar el quadrat es comprova sol. Si no és bo, es diu què hi ha dins («Aquí hi ha 3 pomes, i en volies 2»;
  «Aquí hi ha 2 pomes i 1 mandarina: més pomes que mandarines») i es pot provar un altre lloc. No es mostra cap
  compte mentre es juga: comptar és el joc.
- Quan és bo, es mostra el compte («2 pomes i 2 mandarines: tantes pomes com mandarines»; a les diferències,
  «3 pomes i 1 mandarina: 3 − 1 = 2»).

## Els 42 problemes

Les dades són a [`js/busca-el-nombre/problemes.js`](../js/busca-el-nombre/problemes.js): per a cada problema,
`[mida, files, pregunta]`. Cada quadret és un codi: `.` buit, `p` poma, `m` mandarina; **un quadret pot tenir-ne
més d'una** (`pp`, `pm`), perquè al PDF hi ha pomes dibuixades encavalcades (a partir del problema 13). **No
s'escriuen a mà**: les genera [`tools/extreu-kazu.py`](../tools/extreu-kazu.py), que llegeix els quadrets de la
línia de punts, les fruites i el quadrat de la solució directament dels PDF (`python3 tools/extreu-kazu.py`, des
de l'arrel del repositori; cal `poppler-utils`). L'exemple de la pàgina 1 s'ha copiat a mà a l'script.

- Els problemes 1–24 només tenen pomes («On n'hi ha N?», N de 0 a 10); del 25 al 42 hi ha també mandarines.
- Preguntes: «tantes com» (25, 30, 31, 36), «més / menys mandarines que pomes» i «més / menys pomes que
  mandarines» (26–29, 32–35) i «la diferència és 0 / 1 / 2» (37–42).
- Al PDF, el problema 30 té un quadret sense la vora dibuixada; la zona és igualment un rectangle i l'script ho
  accepta.

`node tests/busca-el-nombre.test.js` comprova el format, que cada problema té **una sola solució** i que és la
del PDF de solucions (que l'script també llegeix del PDF).

**Errades del PDF:** cap. Les 42 solucions del PDF són l'única solució de cada problema.

## Versió per imprimir

[`imprimir/busca-el-nombre.html`](../imprimir/busca-el-nombre.html) i el seu PDF (9 pàgines A4: 1 instruccions,
2 en blanc, 3–9 problemes, 6 per full). Fa servir el mateix SVG que el joc (`TaulerKazu.estatic`) amb els estils
de [`css/imprimir-busca-el-nombre.css`](../css/imprimir-busca-el-nombre.css), només en blanc, negre i gris fosc.
Decisions:

- Cada full té una sola mida de quadrat (2 × 2 o 3 × 3), i ho diu a dalt. La pregunta va dins de cada targeta,
  al costat del número del problema.
- Sense color, la **poma** és un cercle blanc amb tija i la **mandarina** un cercle gris fosc amb el full blanc
  (els fulls amb mandarines ho recorden a dalt: «○ poma · ● mandarina», i la llegenda és a les instruccions).
- La quadrícula té el quadret més gran que hi cap a la targeta (fins a 20 mm; les de 6 files, uns 9 mm).
- El quadrat no és al full de problemes: s'hi dibuixa amb retolador. A les instruccions, els quadrats ✗ van amb
  traç discontinu (en lloc de vermell).

