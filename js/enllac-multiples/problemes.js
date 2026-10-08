/**
 * ============================================================================
 * FITXER: js/enllac-multiples/problemes.js
 * ROL: Dades dels 42 problemes del puzzle «Enllaç de múltiples»
 *      (倍数リンク, de Naoki Inaba; src/blink_q.pdf).
 * FORMAT de cada problema:
 *   llocs:    [columna, fila, valor?]  Un lloc per a cada targeta del tauler.
 *             Si porta valor, la targeta ja hi és (vora contínua al PDF);
 *             si no, és un lloc buit (vora discontínua).
 *   fletxes:  [origen, destí]  Índexs dins de «llocs». La targeta del destí
 *             ha de ser múltiple de la de l'origen.
 *   targetes: Les targetes numerades del problema (també les que ja són al
 *             tauler). No sempre s'han de fer servir totes.
 * Les solucions NO són aquí: les calcula motor.js, i tests/ les compara amb
 * les del PDF (src/blink_a.pdf).
 * Prettier no toca aquesta taula (prettier-ignore): un problema per línia.
 * DEPENDÈNCIES: Cap. Es carrega abans de motor.js.
 * ============================================================================
 */
// prettier-ignore
window.PROBLEMES_ENLLAC = {
    // L'exemple de les instruccions (【例題】)
    exemple: { llocs: [[0, 0, 10], [1, 0], [0, 1], [1, 1]], fletxes: [[1, 0], [1, 3], [2, 3]], targetes: [4, 5, 10, 20] },

    llista: [
        // ---- Pàgina 2: dues targetes ----
        { llocs: [[0, 0, 2], [1, 0]], fletxes: [[0, 1]], targetes: [2, 3, 4] }, // 1
        { llocs: [[0, 0], [1, 0, 6]], fletxes: [[0, 1]], targetes: [3, 4, 6] }, // 2
        { llocs: [[0, 0], [1, 0, 3]], fletxes: [[1, 0]], targetes: [3, 8, 9] }, // 3
        { llocs: [[0, 0, 8], [1, 0]], fletxes: [[1, 0]], targetes: [4, 5, 8] }, // 4
        { llocs: [[0, 0], [1, 0]], fletxes: [[1, 0]], targetes: [5, 6, 10] }, // 5
        { llocs: [[0, 0], [1, 0]], fletxes: [[0, 1]], targetes: [4, 7, 14] }, // 6

        // ---- Pàgina 3: tres targetes en fila ----
        { llocs: [[0, 0, 2], [1, 0], [2, 0]], fletxes: [[0, 1], [2, 1]], targetes: [2, 3, 6] }, // 7
        { llocs: [[0, 0], [1, 0, 4], [2, 0]], fletxes: [[0, 1], [1, 2]], targetes: [2, 4, 8] }, // 8
        { llocs: [[0, 0], [1, 0], [2, 0, 9]], fletxes: [[1, 0], [1, 2]], targetes: [3, 6, 9] }, // 9
        { llocs: [[0, 0, 5], [1, 0], [2, 0]], fletxes: [[0, 1], [2, 1]], targetes: [5, 10, 20] }, // 10
        { llocs: [[0, 0], [1, 0], [2, 0, 7]], fletxes: [[1, 0], [2, 1]], targetes: [7, 14, 42] }, // 11
        { llocs: [[0, 0], [1, 0], [2, 0, 24]], fletxes: [[1, 0], [1, 2]], targetes: [6, 12, 24] }, // 12

        // ---- Pàgina 4: quatre targetes en quadrat, una ja posada ----
        // Llocs: 0 = dalt esquerra, 1 = dalt dreta, 2 = baix esquerra, 3 = baix dreta
        { llocs: [[0, 0, 6], [1, 0], [0, 1], [1, 1]], fletxes: [[0, 2], [1, 3], [2, 3]], targetes: [6, 8, 12, 24] }, // 13
        { llocs: [[0, 0], [1, 0], [0, 1, 7], [1, 1]], fletxes: [[0, 1], [2, 1], [1, 3]], targetes: [3, 7, 21, 42] }, // 14
        { llocs: [[0, 0], [1, 0], [0, 1, 15], [1, 1]], fletxes: [[0, 1], [0, 2], [2, 3], [1, 3]], targetes: [5, 10, 15, 30] }, // 15
        { llocs: [[0, 0], [1, 0], [0, 1], [1, 1, 36]], fletxes: [[0, 1], [1, 2], [1, 3]], targetes: [3, 9, 27, 36] }, // 16
        { llocs: [[0, 0, 63], [1, 0], [0, 1], [1, 1]], fletxes: [[1, 0], [1, 3], [2, 3]], targetes: [7, 8, 56, 63] }, // 17
        { llocs: [[0, 0], [1, 0, 16], [0, 1], [1, 1]], fletxes: [[0, 1], [0, 2], [1, 3]], targetes: [8, 16, 40, 48] }, // 18

        // ---- Pàgina 5: quatre llocs buits ----
        { llocs: [[0, 0], [1, 0], [0, 1], [1, 1]], fletxes: [[0, 1], [1, 3], [2, 3]], targetes: [5, 8, 20, 40] }, // 19
        { llocs: [[0, 0], [1, 0], [0, 1], [1, 1]], fletxes: [[0, 1], [0, 2], [2, 3]], targetes: [3, 12, 27, 36] }, // 20
        { llocs: [[0, 0], [1, 0], [0, 1], [1, 1]], fletxes: [[0, 1], [1, 2], [1, 3], [2, 3]], targetes: [8, 16, 32, 64] }, // 21
        { llocs: [[0, 0], [1, 0], [0, 1], [1, 1]], fletxes: [[0, 1], [0, 2], [1, 2], [2, 3]], targetes: [9, 18, 36, 72] }, // 22
        { llocs: [[0, 0], [1, 0], [0, 1], [1, 1]], fletxes: [[0, 1], [0, 3], [1, 3], [2, 3]], targetes: [6, 8, 36, 72] }, // 23
        { llocs: [[0, 0], [1, 0], [0, 1], [1, 1]], fletxes: [[0, 1], [0, 2], [0, 3], [2, 3]], targetes: [7, 14, 42, 49] }, // 24

        // ---- Pàgina 6: nombres de dues xifres ----
        { llocs: [[0, 0, 19], [1, 0]], fletxes: [[0, 1]], targetes: [19, 76, 86] }, // 25
        { llocs: [[0, 0], [1, 0, 92]], fletxes: [[0, 1]], targetes: [13, 23, 92] }, // 26
        { llocs: [[0, 0], [1, 0, 17]], fletxes: [[1, 0]], targetes: [17, 85, 95] }, // 27
        { llocs: [[0, 0, 87], [1, 0]], fletxes: [[1, 0]], targetes: [19, 29, 87] }, // 28
        { llocs: [[0, 0], [1, 0]], fletxes: [[1, 0]], targetes: [3, 51, 71] }, // 29
        { llocs: [[0, 0], [1, 0]], fletxes: [[0, 1]], targetes: [13, 37, 91] }, // 30

        // ---- Pàgina 7: dues targetes, sense cap pista ----
        { llocs: [[0, 0], [1, 0]], fletxes: [[0, 1]], targetes: [7, 47, 98] }, // 31
        { llocs: [[0, 0], [1, 0]], fletxes: [[0, 1]], targetes: [3, 13, 65] }, // 32
        { llocs: [[0, 0], [1, 0]], fletxes: [[1, 0]], targetes: [29, 47, 83, 94] }, // 33
        { llocs: [[0, 0], [1, 0]], fletxes: [[1, 0]], targetes: [15, 50, 75, 80] }, // 34
        { llocs: [[0, 0], [1, 0]], fletxes: [[1, 0]], targetes: [18, 24, 76, 90] }, // 35
        { llocs: [[0, 0], [1, 0]], fletxes: [[0, 1]], targetes: [19, 29, 67, 87] }, // 36

        // ---- Pàgina 8: tres targetes en fila, quatre per triar ----
        { llocs: [[0, 0, 6], [1, 0], [2, 0]], fletxes: [[0, 1], [2, 1]], targetes: [6, 10, 20, 30] }, // 37
        { llocs: [[0, 0], [1, 0, 21], [2, 0]], fletxes: [[0, 1], [1, 2]], targetes: [7, 21, 49, 63] }, // 38
        { llocs: [[0, 0], [1, 0], [2, 0, 45]], fletxes: [[1, 0], [1, 2]], targetes: [15, 35, 45, 60] }, // 39
        { llocs: [[0, 0, 8], [1, 0], [2, 0]], fletxes: [[0, 1], [2, 1]], targetes: [8, 16, 24, 32] }, // 40
        { llocs: [[0, 0], [1, 0], [2, 0, 9]], fletxes: [[1, 0], [2, 1]], targetes: [9, 27, 54, 72] }, // 41
        { llocs: [[0, 0], [1, 0], [2, 0, 96]], fletxes: [[1, 0], [1, 2]], targetes: [12, 16, 84, 96] }, // 42
    ],
};
