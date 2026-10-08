/**
 * ============================================================================
 * FITXER: js/busca-el-nombre/problemes.js
 * ROL: Dades dels 42 problemes del puzzle «Busca el nombre»
 *      (かずさがし, de Naoki Inaba; src/kazu_q.pdf).
 * NO S'EDITA A MÀ: el genera tools/extreu-kazu.py a partir del PDF.
 * FORMAT de cada problema: [mida, files, pregunta]
 *   mida      costat del quadrat que s'ha de posar (2 o 3), en quadrets.
 *   files     una cadena per fila de la quadrícula (de dalt a baix), amb un codi
 *             per quadret separats per un espai: «.» és un
 *             quadret buit, «p» té una poma, «m» una mandarina, i un quadret pot
 *             tenir-ne més d'una («pp» són dues pomes, «pm» una de cada). La quadrícula
 *             és un rectangle (és la zona de la línia de punts).
 *   pregunta  el que ha de complir el quadrat (pomes = p, mandarines = m):
 *               ['n', N]           hi ha N fruites (pomes en els primers
 *                                  problemes, que només en tenen)
 *               ['mes', 'm']       més mandarines que pomes (['mes', 'p']: al revés)
 *               ['menys', 'm']     menys mandarines que pomes (['menys', 'p']: al revés)
 *               ['igual']          tantes pomes com mandarines
 *               ['dif', D]         la diferència entre pomes i mandarines és D
 * A més, `exemple` és el de la pàgina 1 del PDF (3 × 3, 2 pomes; solució: el
 * quadrat que comença al quadret [1, 0]).
 * Les solucions NO són aquí: les busca motor.js, i tests/ les compara amb les
 * del PDF (src/kazu_a.pdf), llegides per tools/extreu-kazu.py a
 * tests/busca-el-nombre-solucions.json.
 * DEPENDÈNCIES: Cap. Es carrega abans de motor.js.
 * ============================================================================
 */
window.PROBLEMES_KAZU = {
    // Exemple de la pàgina 1 del PDF
    // prettier-ignore
    exemple: [3, ['. . . p', 'p . . .', 'p . p .', 'p . . .'], ['n', 2]],
    // prettier-ignore
    llista: [
        [2, ['p . p', '. p .', '. . p'], ['n', 1]],
        [2, ['. . p', 'p p p', '. p .'], ['n', 2]],
        [2, ['. p . p', 'p . p .', '. p p .', 'p . . p'], ['n', 3]],
        [2, ['p . p p', 'p p p .', 'p . p p', 'p p p p'], ['n', 4]],
        [2, ['. p . p .', '. . . . .', 'p . p . p', '. . . . .', '. p . . p'], ['n', 0]],
        [2, ['p p . p .', '. p p p p', 'p p . p .', 'p . p p p', 'p p p . p'], ['n', 2]],
        [3, ['p . p .', '. . . .', '. . . p', '. p . .'], ['n', 1]],
        [3, ['. . p p', 'p . p p', 'p . . .', 'p . p .'], ['n', 3]],
        [3, ['. p p . .', '. p . . .', '. . . p p', 'p . . p .', 'p p . . .'], ['n', 2]],
        [3, ['p p p p .', '. . . . .', '. p p p p', '. . . . .', 'p p p . .'], ['n', 4]],
        [3, ['. p . . . p', '. . p . p .', '. . . . . .', 'p . p . p .', '. p . . . p', '. . . . p .'], ['n', 4]],
        [3, ['. p p . p p', 'p p p p p .', 'p . p . p p', 'p p p p p .', 'p . p . p p', 'p p p p p .'], ['n', 5]],
        [2, ['p . pp', '. . .', 'p . p'], ['n', 2]],
        [2, ['. p .', 'p . .', '. pp pp'], ['n', 3]],
        [2, ['pp pp p p', 'p . . p', 'pp . . p', 'p pp p pp'], ['n', 4]],
        [2, ['pp p . p', '. p pp p', 'pp p p .', 'p . pp p'], ['n', 5]],
        [2, ['pp . pp . pp', 'pp . . . pp', 'pp pp pp . pp', '. . . . .', 'pp . pp pp pp'], ['n', 6]],
        [2, ['. p p p p', 'pp . p . p', 'pp pp . p p', 'pp . pp . p', 'pp pp pp pp .'], ['n', 4]],
        [3, ['p . p .', '. . . .', '. . . pp', '. pp . .'], ['n', 3]],
        [3, ['pp . p p', '. . pp .', 'p . . .', 'p . p pp'], ['n', 6]],
        [3, ['. pp . pp .', 'pp . pp . pp', '. . pp . pp', '. pp . . .', 'p . pp . pp'], ['n', 7]],
        [3, ['. p . . pp', 'pp . pp . p', '. . . . .', 'p pp . pp .', '. pp . p pp'], ['n', 6]],
        [3, ['p . . . p .', '. p . p . pp', 'p . p . pp .', '. p . pp . pp', 'p . pp . pp .', '. pp . . . pp'], ['n', 5]],
        [3, ['pp p p p p p', 'p p p pp p pp', 'p p pp p p p', 'pp p p p p pp', 'p p p pp p p', 'p pp p p p pp'], ['n', 10]],
        [2, ['m p .', '. m p', 'p . m'], ['igual']],
        [2, ['m p m', 'm . p', 'p p m'], ['mes', 'm']],
        [2, ['m m m p', '. p . m', 'm m p m', 'p . m .'], ['menys', 'm']],
        [2, ['m . p m', '. . m p', 'm p . m', 'p m p .'], ['mes', 'p']],
        [2, ['. m . m .', 'p p . p p', '. . . . .', 'p m . p m', '. p . p .'], ['menys', 'p']],
        [2, ['. . m . .', 'p . . . p', '. . p . .', '. . . . m', 'm . p . .'], ['igual']],
        [3, ['. p m p', '. m . .', 'p . p .', 'm . . m'], ['igual']],
        [3, ['. m p m', 'm p . p', 'p m . m', '. p m p'], ['mes', 'm']],
        [3, ['m m m p m', '. p . p p', '. m m . m', 'p p m p m', 'p p m p .'], ['menys', 'm']],
        [3, ['p m p . m', '. . . . m', 'm . m . p', 'p . . . .', 'm . p m p'], ['mes', 'p']],
        [3, ['. m . p . m', 'p . m . p .', '. p . . . p', 'm . . . m .', '. p . p . m', 'p . m . p .'], ['menys', 'p']],
        [3, ['m p m p p p', 'p m p m m p', 'p p . . m p', 'p m . . p p', 'm p m p m m', 'p p m p m p'], ['igual']],
        [3, ['. p m p', '. . . .', 'p . p .', 'm . . m'], ['dif', 1]],
        [3, ['p m p m', 'm . . p', 'p m . m', '. p . p'], ['dif', 2]],
        [3, ['m p p m m', 'm p p . p', 'm . . m p', 'p p m m p', 'p p . . .'], ['dif', 0]],
        [3, ['p . m . m', '. . . . .', 'p . m . p', '. . . . .', 'm . p . p'], ['dif', 1]],
        [3, ['. m . m . .', 'p . m . m .', '. p . m . m', 'p . p . m .', '. p . p . m', 'p . . . p .'], ['dif', 2]],
        [3, ['. p m p p .', 'p m p m m p', 'p p m p m p', 'p m p p p p', 'm p m p m m', '. p m p m .'], ['dif', 0]],
    ],
};
