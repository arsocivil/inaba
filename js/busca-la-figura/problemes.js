/**
 * ============================================================================
 * FITXER: js/busca-la-figura/problemes.js
 * ROL: Dades dels 42 problemes del puzzle «Busca la figura»
 *      (図形探し, de Naoki Inaba; src/zukei_q.pdf).
 * NO S'EDITA A MÀ: el genera tools/extreu-figura.py a partir del PDF.
 * FORMAT de cada problema:
 *   amp, alt: quadrets d'amplada i d'alçada de la quadrícula.
 *   punts:    els punts negres, [columna, fila] d'un vèrtex de la quadrícula
 *             (de 0 a amp i de 0 a alt; la fila 0 és la de dalt).
 *   figura:   la figura que s'ha de fer: 'quadrat', 'rectangle', 'rombe',
 *             'paral·lelogram', 'trapezi', 'isosceles' (triangle isòsceles),
 *             'rectangle-triangle' (triangle rectangle) o
 *             'rectangle-isosceles' (triangle rectangle isòsceles).
 * Les solucions NO són aquí: les busca motor.js, i tests/ les compara amb
 * les del PDF (src/zukei_a.pdf).
 * DEPENDÈNCIES: Cap. Es carrega abans de motor.js.
 * ============================================================================
 */
// prettier-ignore
window.PROBLEMES_FIGURA = {
    // L'exemple de les instruccions (【例題】)
    exemple: { amp: 3, alt: 3, punts: [[1, 0], [2, 1], [3, 2], [0, 3], [3, 3]], figura: 'isosceles' },

    llista: [
        { amp: 3, alt: 3, punts: [[3, 0], [0, 1], [2, 1], [0, 2], [1, 2], [0, 3], [1, 3]], figura: 'quadrat' }, // 1
        { amp: 3, alt: 3, punts: [[0, 0], [1, 0], [3, 0], [0, 2], [3, 2], [0, 3], [2, 3]], figura: 'rectangle' }, // 2
        { amp: 4, alt: 4, punts: [[1, 0], [2, 0], [4, 0], [2, 1], [4, 1], [2, 2], [4, 2], [0, 3], [2, 3], [4, 4]], figura: 'quadrat' }, // 3
        { amp: 4, alt: 4, punts: [[1, 0], [3, 0], [2, 1], [3, 1], [4, 1], [2, 2], [1, 3], [0, 4], [2, 4], [3, 4]], figura: 'rectangle' }, // 4
        { amp: 5, alt: 5, punts: [[0, 0], [3, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2], [4, 2], [5, 2], [3, 3], [5, 3], [0, 4], [0, 5], [1, 5], [4, 5]], figura: 'quadrat' }, // 5
        { amp: 5, alt: 5, punts: [[2, 0], [3, 0], [5, 0], [1, 1], [5, 1], [1, 2], [4, 2], [4, 3], [5, 3], [0, 4], [1, 4], [5, 4], [0, 5], [2, 5], [4, 5]], figura: 'rectangle' }, // 6
        { amp: 3, alt: 3, punts: [[2, 0], [3, 1], [3, 2], [0, 3], [2, 3]], figura: 'rectangle-triangle' }, // 7
        { amp: 3, alt: 3, punts: [[1, 0], [3, 0], [0, 2], [3, 2], [1, 3], [3, 3]], figura: 'rectangle-isosceles' }, // 8
        { amp: 4, alt: 4, punts: [[0, 0], [1, 1], [4, 1], [0, 4], [2, 4], [3, 4]], figura: 'isosceles' }, // 9
        { amp: 4, alt: 4, punts: [[2, 0], [0, 1], [4, 1], [2, 2], [4, 3], [2, 4]], figura: 'rectangle-triangle' }, // 10
        { amp: 5, alt: 5, punts: [[1, 0], [5, 0], [2, 1], [2, 2], [3, 3], [0, 4], [4, 4], [1, 5]], figura: 'rectangle-isosceles' }, // 11
        { amp: 5, alt: 5, punts: [[3, 0], [0, 1], [5, 1], [5, 2], [0, 3], [5, 3], [1, 5], [4, 5]], figura: 'isosceles' }, // 12
        { amp: 3, alt: 3, punts: [[3, 0], [1, 1], [3, 1], [0, 2], [2, 3], [3, 3]], figura: 'trapezi' }, // 13
        { amp: 3, alt: 3, punts: [[1, 0], [3, 1], [0, 2], [1, 2], [2, 2], [3, 2], [3, 3]], figura: 'paral·lelogram' }, // 14
        { amp: 4, alt: 4, punts: [[2, 0], [3, 0], [0, 1], [3, 1], [0, 2], [2, 2], [4, 2], [0, 3], [1, 4], [3, 4]], figura: 'rombe' }, // 15
        { amp: 4, alt: 4, punts: [[4, 0], [0, 1], [2, 1], [3, 1], [0, 2], [1, 3], [4, 4]], figura: 'trapezi' }, // 16
        { amp: 5, alt: 5, punts: [[5, 0], [0, 1], [1, 1], [3, 1], [3, 2], [4, 3], [5, 3], [1, 4], [5, 5]], figura: 'paral·lelogram' }, // 17
        { amp: 5, alt: 5, punts: [[2, 0], [3, 0], [4, 0], [1, 1], [3, 1], [0, 2], [1, 2], [4, 2], [5, 2], [3, 3], [1, 4], [0, 5], [3, 5], [4, 5], [5, 5]], figura: 'rombe' }, // 18
        { amp: 3, alt: 3, punts: [[2, 0], [0, 1], [0, 2], [2, 2], [3, 3]], figura: 'rectangle-triangle' }, // 19
        { amp: 3, alt: 3, punts: [[1, 0], [2, 0], [1, 1], [0, 2], [2, 3], [3, 3]], figura: 'paral·lelogram' }, // 20
        { amp: 3, alt: 3, punts: [[2, 0], [3, 1], [0, 3], [1, 3], [2, 3], [3, 3]], figura: 'rectangle-isosceles' }, // 21
        { amp: 3, alt: 3, punts: [[0, 0], [1, 1], [3, 2], [0, 3], [1, 3], [2, 3]], figura: 'trapezi' }, // 22
        { amp: 3, alt: 3, punts: [[0, 0], [1, 0], [3, 0], [1, 1], [3, 1], [0, 2], [2, 2], [3, 2], [0, 3], [1, 3]], figura: 'quadrat' }, // 23
        { amp: 3, alt: 3, punts: [[0, 0], [1, 0], [0, 1], [3, 1], [1, 2], [2, 2], [3, 2], [0, 3], [2, 3]], figura: 'rectangle' }, // 24
        { amp: 4, alt: 4, punts: [[1, 0], [2, 0], [3, 0], [0, 2], [2, 2], [3, 2], [1, 3], [3, 3], [4, 3], [1, 4]], figura: 'rombe' }, // 25
        { amp: 4, alt: 4, punts: [[0, 0], [1, 0], [4, 1], [3, 2], [1, 3], [3, 3], [0, 4]], figura: 'isosceles' }, // 26
        { amp: 4, alt: 4, punts: [[2, 0], [4, 0], [0, 2], [1, 2], [4, 2], [0, 3], [2, 3], [4, 4]], figura: 'paral·lelogram' }, // 27
        { amp: 4, alt: 4, punts: [[1, 0], [4, 1], [0, 2], [3, 2], [4, 2], [2, 3], [1, 4]], figura: 'trapezi' }, // 28
        { amp: 4, alt: 4, punts: [[1, 0], [3, 0], [4, 0], [0, 1], [0, 2], [1, 3], [2, 4], [3, 4], [4, 4]], figura: 'rectangle-isosceles' }, // 29
        { amp: 4, alt: 4, punts: [[3, 0], [4, 0], [0, 1], [2, 1], [2, 2], [0, 3], [3, 3], [1, 4], [2, 4], [3, 4], [4, 4]], figura: 'rectangle' }, // 30
        { amp: 4, alt: 4, punts: [[0, 0], [0, 1], [4, 1], [1, 2], [2, 2], [3, 2], [4, 4]], figura: 'isosceles' }, // 31
        { amp: 4, alt: 4, punts: [[2, 0], [3, 0], [4, 1], [0, 2], [3, 2], [4, 2], [0, 3], [1, 3], [2, 3], [2, 4]], figura: 'quadrat' }, // 32
        { amp: 4, alt: 4, punts: [[0, 0], [3, 0], [2, 1], [2, 2], [3, 2], [0, 4], [2, 4], [4, 4]], figura: 'paral·lelogram' }, // 33
        { amp: 4, alt: 4, punts: [[1, 0], [3, 1], [0, 3], [2, 3], [3, 3], [4, 3], [0, 4]], figura: 'trapezi' }, // 34
        { amp: 4, alt: 4, punts: [[1, 0], [0, 1], [2, 1], [4, 1], [0, 2], [3, 2], [4, 3], [1, 4], [2, 4], [3, 4]], figura: 'rectangle' }, // 35
        { amp: 4, alt: 4, punts: [[0, 0], [2, 0], [0, 1], [2, 1], [4, 1], [4, 2], [0, 4], [1, 4], [2, 4]], figura: 'rectangle-isosceles' }, // 36
        { amp: 5, alt: 5, punts: [[1, 0], [2, 0], [0, 2], [1, 2], [5, 3], [3, 4], [0, 5], [3, 5], [4, 5], [5, 5]], figura: 'rectangle' }, // 37
        { amp: 5, alt: 5, punts: [[4, 0], [2, 1], [3, 2], [4, 4], [0, 5], [1, 5], [5, 5]], figura: 'rectangle-triangle' }, // 38
        { amp: 5, alt: 5, punts: [[0, 0], [1, 0], [2, 0], [5, 0], [2, 1], [3, 1], [4, 1], [0, 2], [1, 3], [5, 3], [2, 4], [4, 4], [0, 5], [2, 5], [5, 5]], figura: 'quadrat' }, // 39
        { amp: 5, alt: 5, punts: [[0, 0], [5, 0], [4, 1], [5, 2], [0, 3], [2, 3], [0, 5], [3, 5], [4, 5]], figura: 'paral·lelogram' }, // 40
        { amp: 5, alt: 5, punts: [[4, 0], [1, 1], [3, 1], [5, 1], [0, 2], [1, 2], [2, 2], [2, 3], [3, 3], [4, 3], [3, 4], [5, 4], [1, 5], [2, 5], [3, 5]], figura: 'rombe' }, // 41
        { amp: 5, alt: 5, punts: [[4, 0], [4, 1], [0, 3], [1, 3], [2, 3], [4, 3], [5, 3], [4, 5]], figura: 'trapezi' }, // 42
    ],
};
