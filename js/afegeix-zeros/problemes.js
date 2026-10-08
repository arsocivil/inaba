/**
 * ============================================================================
 * FITXER: js/afegeix-zeros/problemes.js
 * ROL: Dades dels 49 problemes del puzzle «Afegeix zeros»
 *      (ゼロゼロ式, de Naoki Inaba; src/zero_q.pdf).
 * NO S'EDITA A MÀ: el genera tools/extreu-zeros.py a partir del PDF.
 * FORMAT de cada problema:
 *   targetes: la xifra de cada targeta (sumands), d'esquerra a dreta.
 *   total:    el resultat de la igualtat.
 * Les solucions NO són aquí: les busca motor.js, i tests/ les compara amb
 * les del PDF (src/zero_a.pdf).
 * DEPENDÈNCIES: Cap. Es carrega abans de motor.js.
 * ============================================================================
 */
// prettier-ignore
window.PROBLEMES_ZEROS = {
    // L'exemple de les instruccions (【例題】)
    exemple: { targetes: [1, 2, 3], total: 231 },

    llista: [
        { targetes: [3, 6, 2], total: 92 }, // 1
        { targetes: [6, 1, 3], total: 64 }, // 2
        { targetes: [3, 1, 7], total: 47 }, // 3
        { targetes: [5, 7, 1], total: 76 }, // 4
        { targetes: [9, 4, 1], total: 95 }, // 5
        { targetes: [6, 4, 3], total: 94 }, // 6
        { targetes: [8, 3, 2], total: 58 }, // 7
        { targetes: [9, 7, 8], total: 879 }, // 8
        { targetes: [5, 3, 9], total: 890 }, // 9
        { targetes: [2, 6, 3], total: 650 }, // 10
        { targetes: [8, 1, 4], total: 481 }, // 11
        { targetes: [3, 2, 4], total: 360 }, // 12
        { targetes: [6, 2, 4], total: 804 }, // 13
        { targetes: [1, 2, 6], total: 108 }, // 14
        { targetes: [6, 9, 2], total: 35 }, // 15
        { targetes: [8, 2, 3], total: 31 }, // 16
        { targetes: [9, 7, 4], total: 83 }, // 17
        { targetes: [6, 3, 7], total: 70 }, // 18
        { targetes: [9, 1, 8], total: 90 }, // 19
        { targetes: [8, 2, 3], total: 31 }, // 20
        { targetes: [5, 9, 6], total: 65 }, // 21
        { targetes: [9, 7, 6], total: 139 }, // 22
        { targetes: [5, 3, 7], total: 312 }, // 23
        { targetes: [4, 8, 9], total: 210 }, // 24
        { targetes: [3, 9, 4], total: 133 }, // 25
        { targetes: [3, 8, 4], total: 510 }, // 26
        { targetes: [6, 5, 7], total: 720 }, // 27
        { targetes: [6, 7, 9], total: 103 }, // 28
        { targetes: [9, 7, 5], total: 759 }, // 29
        { targetes: [6, 4, 3], total: 940 }, // 30
        { targetes: [3, 9, 5], total: 125 }, // 31
        { targetes: [7, 6, 4], total: 800 }, // 32
        { targetes: [6, 8, 4], total: 414 }, // 33
        { targetes: [4, 3, 7], total: 140 }, // 34
        { targetes: [7, 9, 8], total: 105 }, // 35
        { targetes: [3, 7, 8, 2], total: 92 }, // 36
        { targetes: [6, 2, 9, 5], total: 76 }, // 37
        { targetes: [5, 1, 2, 6], total: 95 }, // 38
        { targetes: [1, 8, 2, 4], total: 42 }, // 39
        { targetes: [4, 6, 1, 3], total: 86 }, // 40
        { targetes: [4, 3, 8, 6], total: 84 }, // 41
        { targetes: [8, 3, 5, 1], total: 53 }, // 42
        { targetes: [3, 6, 4, 1], total: 860 }, // 43
        { targetes: [6, 7, 9, 3], total: 826 }, // 44
        { targetes: [8, 7, 6, 3], total: 690 }, // 45
        { targetes: [5, 4, 9, 3], total: 714 }, // 46
        { targetes: [3, 9, 4, 1], total: 404 }, // 47
        { targetes: [7, 8, 1, 2], total: 171 }, // 48
        { targetes: [2, 9, 6, 8], total: 700 }, // 49
    ],
};
