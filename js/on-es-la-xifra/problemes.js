/**
 * ============================================================================
 * FITXER: js/on-es-la-xifra/problemes.js
 * ROL: Dades dels 42 problemes del puzzle «On és la xifra?»
 *      (どこかな算, de Naoki Inaba; src/dokoeq_q.pdf).
 * NO S'EDITA A MÀ: el genera tools/extreu-xifra.py a partir del PDF.
 * FORMAT de cada problema: [[n1, n2, ns], pistesColumna, pistesFila]
 *   [n1, n2, ns]  quantes xifres (caselles □) té el primer nombre, el segon i
 *                 el resultat. Els nombres van alineats per la dreta (unitats
 *                 amb unitats); el resultat és el més llarg.
 *   pistesColumna una llista per columna (d'esquerra a dreta, com el resultat):
 *                 les xifres dels números de dalt (↓). Cadascuna ha de ser
 *                 en alguna casella d'aquella columna (de les tres files).
 *   pistesFila    una llista per fila (primer nombre, segon, resultat): les
 *                 xifres dels números de la dreta (←). Cadascuna ha de ser
 *                 en alguna casella d'aquella fila.
 *   Un número de fora amb coma al PDF (4,8) són dues xifres: s'hi han de
 *   trobar les dues.
 * Les solucions NO són aquí: les busca motor.js, i tests/ les compara amb les
 * del PDF (src/dokoeq_a.pdf), llegides per tools/extreu-xifra.py a
 * tests/on-es-la-xifra-solucions.json.
 * DEPENDÈNCIES: Cap. Es carrega abans de motor.js.
 * ============================================================================
 */
window.PROBLEMES_XIFRA = {
    // Exemple de la pàgina 1 del PDF (8 + 5 = 13)
    // prettier-ignore
    exemple: [[1, 1, 2], [[], [3]], [[], [5], []]],
    // prettier-ignore
    llista: [
        [[1, 1, 1], [[]], [[2], [3], []]],
        [[1, 1, 1], [[]], [[], [7], [8]]],
        [[1, 1, 1], [[]], [[4], [], [6]]],
        [[1, 1, 1], [[]], [[5], [4], []]],
        [[1, 1, 1], [[]], [[], [1], [9]]],
        [[1, 1, 1], [[]], [[3], [], [7]]],
        [[1, 1, 1], [[4]], [[], [5], []]],
        [[1, 1, 1], [[2]], [[6], [], []]],
        [[1, 1, 1], [[3]], [[], [], [6]]],
        [[1, 1, 1], [[7]], [[], [5], []]],
        [[1, 1, 1], [[9]], [[1], [], []]],
        [[1, 1, 1], [[4]], [[], [], [8]]],
        [[1, 1, 1], [[]], [[], [], [2]]],
        [[1, 1, 1], [[]], [[], [8], []]],
        [[1, 1, 2], [[], []], [[6], [7], []]],
        [[1, 1, 2], [[], []], [[], [9], [3]]],
        [[1, 1, 2], [[], []], [[8], [], [4]]],
        [[1, 1, 2], [[], [6]], [[5], [], []]],
        [[1, 1, 2], [[], []], [[7], [], [2]]],
        [[1, 1, 2], [[], [1]], [[], [3], []]],
        [[1, 1, 2], [[], [4]], [[5], [], []]],
        [[1, 1, 2], [[], [8]], [[], [], [6]]],
        [[1, 1, 2], [[], []], [[1], [], []]],
        [[1, 1, 2], [[], []], [[], [], [8]]],
        [[2, 1, 2], [[], []], [[5], [7], [0]]],
        [[2, 1, 2], [[2, 3], []], [[], [], [8]]],
        [[2, 1, 2], [[8], []], [[], [2], [6]]],
        [[2, 1, 2], [[6], []], [[4], [], [9]]],
        [[2, 1, 2], [[4], []], [[1, 3], [], []]],
        [[2, 1, 2], [[], []], [[], [7], [1, 5]]],
        [[2, 1, 2], [[], [4, 8]], [[], [], [1]]],
        [[2, 1, 2], [[5], []], [[0], [], [6]]],
        [[2, 1, 2], [[1], [7]], [[], [], [4]]],
        [[2, 1, 2], [[], [6]], [[9], [5], []]],
        [[2, 1, 2], [[], []], [[2, 9], [], [2]]],
        [[2, 1, 2], [[], []], [[7], [8], [1]]],
        [[2, 2, 2], [[3], []], [[7], [8], [7]]],
        [[2, 2, 2], [[], [4, 8]], [[], [2], [3]]],
        [[2, 2, 2], [[4, 5], []], [[], [5], [0]]],
        [[2, 2, 2], [[], []], [[4, 7], [], [3, 6]]],
        [[2, 2, 2], [[8], [6]], [[1], [], [2]]],
        [[2, 2, 2], [[], []], [[6], [7, 8], []]],
    ],
};
