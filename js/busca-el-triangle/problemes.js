/**
 * ============================================================================
 * FITXER: js/busca-el-triangle/problemes.js
 * ROL: Dades dels 42 problemes del puzzle «Busca el triangle»
 *      (三角探し, de Naoki Inaba; src/sankaku_q.pdf).
 * NO S'EDITA A MÀ: el genera tools/extreu-triangle.py a partir del PDF.
 * FORMAT de cada problema:
 *   amp, alt: quadrets d'amplada i d'alçada de la quadrícula.
 *   punts:    els punts negres, [columna, fila] d'un vèrtex de la quadrícula
 *             (de 0 a amp i de 0 a alt; la fila 0 és la de dalt).
 *   area:     l'àrea del triangle que s'ha de fer (en quadrets).
 * Les solucions NO són aquí: les busca motor.js, i tests/ les compara amb
 * les del PDF (src/sankaku_a.pdf).
 * DEPENDÈNCIES: Cap. Es carrega abans de motor.js.
 * ============================================================================
 */
// prettier-ignore
window.PROBLEMES_TRIANGLE = {
    // L'exemple de les instruccions (【例題】)
    exemple: { amp: 3, alt: 3, punts: [[2, 0], [2, 1], [3, 1], [0, 3], [2, 3]], area: 3 },

    llista: [
        { amp: 3, alt: 3, punts: [[1, 0], [0, 2], [1, 2], [3, 3]], area: 1 }, // 1
        { amp: 3, alt: 3, punts: [[1, 0], [3, 0], [3, 2], [0, 3]], area: 2 }, // 2
        { amp: 3, alt: 3, punts: [[1, 0], [3, 0], [0, 2], [2, 2], [1, 3]], area: 3 }, // 3
        { amp: 3, alt: 3, punts: [[3, 0], [1, 1], [0, 2], [0, 3], [2, 3]], area: 1 }, // 4
        { amp: 3, alt: 3, punts: [[1, 0], [2, 1], [0, 2], [1, 2], [3, 2], [1, 3]], area: 2 }, // 5
        { amp: 3, alt: 3, punts: [[2, 0], [0, 1], [2, 1], [3, 1], [0, 2], [0, 3]], area: 3 }, // 6
        { amp: 3, alt: 3, punts: [[1, 0], [0, 2], [3, 2], [2, 3]], area: 3 }, // 7
        { amp: 3, alt: 3, punts: [[3, 0], [0, 2], [2, 2], [1, 3]], area: 1 }, // 8
        { amp: 3, alt: 3, punts: [[0, 0], [3, 0], [1, 1], [3, 2], [0, 3]], area: 2 }, // 9
        { amp: 3, alt: 3, punts: [[1, 0], [0, 1], [2, 2], [3, 2], [0, 3]], area: 3 }, // 10
        { amp: 3, alt: 3, punts: [[3, 0], [0, 1], [3, 1], [2, 2], [0, 3], [3, 3]], area: 1 }, // 11
        { amp: 3, alt: 3, punts: [[1, 0], [0, 1], [2, 1], [3, 1], [2, 2], [1, 3]], area: 2 }, // 12
        { amp: 3, alt: 3, punts: [[2, 0], [1, 1], [3, 1], [0, 3]], area: 2 }, // 13
        { amp: 3, alt: 3, punts: [[0, 0], [0, 2], [1, 2], [3, 3]], area: 3 }, // 14
        { amp: 3, alt: 3, punts: [[1, 0], [3, 0], [0, 2], [2, 2], [3, 3]], area: 1 }, // 15
        { amp: 3, alt: 3, punts: [[1, 0], [0, 1], [3, 1], [2, 2], [3, 3]], area: 2 }, // 16
        { amp: 3, alt: 3, punts: [[0, 0], [1, 1], [1, 2], [3, 2], [1, 3], [3, 3]], area: 3 }, // 17
        { amp: 3, alt: 3, punts: [[0, 0], [1, 0], [3, 0], [3, 2], [0, 3], [1, 3]], area: 1 }, // 18
        { amp: 4, alt: 4, punts: [[4, 0], [0, 1], [0, 2], [3, 2], [0, 4], [3, 4]], area: 1 }, // 19
        { amp: 4, alt: 4, punts: [[0, 0], [2, 0], [4, 1], [1, 3], [2, 4], [4, 4]], area: 2 }, // 20
        { amp: 4, alt: 4, punts: [[3, 0], [0, 1], [1, 1], [4, 2], [0, 4], [1, 4]], area: 3 }, // 21
        { amp: 4, alt: 4, punts: [[1, 0], [0, 1], [0, 3], [2, 3], [4, 3], [1, 4]], area: 4 }, // 22
        { amp: 4, alt: 4, punts: [[2, 0], [0, 1], [2, 1], [4, 1], [4, 2], [3, 4]], area: 6 }, // 23
        { amp: 4, alt: 4, punts: [[0, 0], [3, 1], [4, 1], [0, 2], [1, 2], [0, 4]], area: 8 }, // 24
        { amp: 4, alt: 4, punts: [[3, 0], [1, 1], [4, 1], [0, 3], [3, 3], [0, 4], [3, 4]], area: 1 }, // 25
        { amp: 4, alt: 4, punts: [[2, 0], [0, 1], [1, 1], [0, 3], [3, 3], [4, 3], [1, 4]], area: 2 }, // 26
        { amp: 4, alt: 4, punts: [[4, 0], [2, 1], [4, 1], [0, 2], [1, 2], [3, 3], [3, 4]], area: 3 }, // 27
        { amp: 4, alt: 4, punts: [[0, 0], [1, 1], [2, 2], [4, 2], [4, 3], [1, 4], [4, 4]], area: 4 }, // 28
        { amp: 4, alt: 4, punts: [[2, 0], [0, 1], [1, 1], [2, 3], [4, 3], [0, 4], [1, 4]], area: 6 }, // 29
        { amp: 4, alt: 4, punts: [[4, 0], [2, 1], [4, 1], [1, 2], [0, 3], [2, 3], [4, 4]], area: 8 }, // 30
        { amp: 4, alt: 4, punts: [[0, 0], [2, 0], [4, 0], [0, 3], [3, 3], [4, 3], [0, 4], [3, 4]], area: 1 }, // 31
        { amp: 4, alt: 4, punts: [[0, 0], [1, 0], [4, 0], [4, 2], [0, 3], [1, 3], [3, 3], [3, 4]], area: 2 }, // 32
        { amp: 4, alt: 4, punts: [[4, 0], [0, 1], [4, 1], [1, 2], [1, 3], [3, 3], [3, 4], [4, 4]], area: 3 }, // 33
        { amp: 4, alt: 4, punts: [[3, 0], [4, 0], [0, 1], [4, 1], [1, 2], [1, 3], [0, 4], [1, 4]], area: 4 }, // 34
        { amp: 4, alt: 4, punts: [[1, 0], [3, 1], [1, 2], [4, 2], [0, 3], [3, 3], [1, 4], [2, 4]], area: 6 }, // 35
        { amp: 4, alt: 4, punts: [[2, 0], [3, 1], [0, 2], [2, 2], [0, 3], [0, 4], [3, 4], [4, 4]], area: 8 }, // 36
        { amp: 4, alt: 4, punts: [[4, 0], [0, 2], [2, 2], [1, 3], [2, 4]], area: 6 }, // 37
        { amp: 4, alt: 4, punts: [[4, 0], [0, 1], [4, 2], [0, 4], [2, 4]], area: 5 }, // 38
        { amp: 4, alt: 4, punts: [[2, 0], [1, 1], [4, 2], [1, 3], [0, 4]], area: 4 }, // 39
        { amp: 4, alt: 4, punts: [[0, 0], [0, 1], [4, 2], [2, 3], [1, 4]], area: 3 }, // 40
        { amp: 4, alt: 4, punts: [[0, 0], [4, 1], [3, 2], [0, 3], [1, 4]], area: 2 }, // 41
        { amp: 4, alt: 4, punts: [[1, 0], [3, 0], [2, 2], [4, 3], [0, 4]], area: 1 }, // 42
    ],
};
