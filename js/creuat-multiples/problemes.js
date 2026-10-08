/**
 * ============================================================================
 * FITXER: js/creuat-multiples/problemes.js
 * ROL: Dades dels 42 problemes del puzzle «Creuat de múltiples»
 *      (倍数クロス, de Naoki Inaba; src/bcross_q.pdf).
 * NO S'EDITA A MÀ: el genera tools/extreu-creuat.py a partir del PDF.
 * FORMAT de cada problema: la llista de files del quadre, de dalt a baix; cada
 *   fila és un text amb les caselles separades per un espai:
 *     '.'     casella blanca (s'hi escriu una xifra)
 *     '#'     casella negra sense números
 *     '#d8'   casella negra amb el 8 a la meitat de dalt a la dreta (◥): el
 *             nombre que formen les caselles blanques cap a la DRETA ha de
 *             ser múltiple de 8
 *     '#a3'   casella negra amb el 3 a la meitat de baix a l'esquerra (◣): el
 *             nombre que formen les caselles blanques cap AVALL ha de ser
 *             múltiple de 3
 *     '#a3d8' casella negra amb els dos números
 * Les solucions NO són aquí: les busca motor.js, i tests/ les compara amb les
 * del PDF (src/bcross_a.pdf), llegides per tools/extreu-creuat.py a
 * tests/creuat-multiples-solucions.json.
 * DEPENDÈNCIES: Cap. Es carrega abans de motor.js.
 * ============================================================================
 */
// prettier-ignore
window.PROBLEMES_CREUAT = {
    // L'exemple de les instruccions (【例題】)
    exemple: ['# #a3 #a13', '#d8 . .', '# #d5 .'],

    llista: [
        ['# #a3', '#d6 .'], // 1
        ['# #a8', '#d4 .'], // 2
        ['# #a5 #a2', '#d9 . .'], // 3
        ['# #a9', '#d2 .', '#d7 .'], // 4
        ['# #a2 #a9', '#d7 . .'], // 5
        ['# #a8', '#d9 .', '#d3 .'], // 6
        ['# #a7 #a3', '#d9 . .', '#d5 . #'], // 7
        ['# #a6 #a6', '#d7 . .', '# #d1 .'], // 8
        ['# # #a8', '# #a2d7 .', '#d7 . .'], // 9
        ['# #a7 #a8', '#d9 . .', '#d4 . #'], // 10
        ['# #a5 #a8', '#d6 . .', '# #d4 .'], // 11
        ['# # #a8', '# #a1d9 .', '#d7 . .'], // 12
        ['# # #a9 #a4', '# #a8d6 . .', '#d7 . . #'], // 13
        ['# #a8 #a8 #', '#d9 . . #a2', '# #d8 . .'], // 14
        ['# #a7 #a8 #a1', '#d6 . . .'], // 15
        ['# #a7', '#d1 .', '#d5 .', '#d6 .'], // 16
        ['# #a6 #a8 #a3', '#d7 . . .'], // 17
        ['# #a9', '#d3 .', '#d7 .', '#d5 .'], // 18
        ['# #a14 #a8', '#d12 . .', '#d2 . #'], // 19
        ['# #a6 #a13', '#d13 . .', '# #d2 .'], // 20
        ['# # #a16', '# #a9d2 .', '#d15 . .'], // 21
        ['# #a18 #a1', '#d16 . .', '#d6 . #'], // 22
        ['# #a8 #a17', '#d17 . .', '# #d1 .'], // 23
        ['# # #a19', '# #a1d7 .', '#d18 . .'], // 24
        ['# # #a11 #a4', '# #a7d12 . .', '#d13 . . #'], // 25
        ['# #a1 #a11 #', '#d14 . . #a8', '# #d17 . .'], // 26
        ['# #a8 #a9 #a2', '#d16 . . .'], // 27
        ['# #a17', '#d9 .', '#d1 .', '#d9 .'], // 28
        ['# #a2 #a5 #a8', '#d14 . . .'], // 29
        ['# #a12', '#d7 .', '#d1 .', '#d8 .'], // 30
        ['# #a7 #a4', '#d6 . .'], // 31
        ['# #a7', '#d3 .', '#d8 .'], // 32
        ['# #a9 #a2', '#d3 . .'], // 33
        ['# #a3', '#d2 .', '#d5 .'], // 34
        ['# #a4 #a4', '#d7 . .'], // 35
        ['# #a9', '#d2 .', '#d3 .'], // 36
        ['# #a3 #a8', '#d4 . .', '#d8 . #'], // 37
        ['# #a7 #a8', '#d3 . .', '# #d3 .'], // 38
        ['# #a9 #', '#d2 . #a3', '#d7 . .'], // 39
        ['# # #a4', '# #a3d3 .', '#d7 . .'], // 40
        ['# #a7 #a2 #a7', '#d3 . . .'], // 41
        ['# #a9', '#d3 .', '#d4 .', '#d5 .'], // 42
    ],
};
