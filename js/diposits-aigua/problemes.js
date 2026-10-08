/**
 * ============================================================================
 * FITXER: js/diposits-aigua/problemes.js
 * ROL: Dades dels 42 problemes del puzzle «Dipòsits d'aigua»
 *      (水そうと水, de Naoki Inaba; src/mizu_q.pdf).
 * NO S'EDITA A MÀ: el genera tools/extreu-diposits.py a partir del PDF.
 * FORMAT de cada problema:
 *   files:          la cara del davant, de dalt a baix: cada lletra és el
 *                   dipòsit d'aquell cub (cada dipòsit és un rectangle de cubs).
 *   divisions:      en quantes parts divideixen cada cub les marques del costat
 *                   (4: quarts, 6: sisens); 0 si no n'hi ha.
 *   totalsFiles:    el total d'aigua de cada fila (de dalt a baix), o null.
 *   totalsColumnes: el total d'aigua de cada columna (d'esquerra a dreta), o null.
 * 1 cub = 1 litre. Les solucions NO són aquí: les busca motor.js, i tests/ les
 * compara amb les del PDF (src/mizu_a.pdf).
 * DEPENDÈNCIES: Cap. Es carrega abans de motor.js.
 * ============================================================================
 */
// prettier-ignore
window.PROBLEMES_DIPOSITS = {
    // L'exemple de les instruccions (【例題】)
    exemple: { files: ['AB', 'CC'], divisions: 6, totalsFiles: ['1', '1'], totalsColumnes: [null, '5/6'] },

    llista: [
        { files: ['AB', 'AB'], divisions: 4, totalsFiles: ['1/4', null], totalsColumnes: [null, '3/4'] }, // 1
        { files: ['AA', 'BB'], divisions: 4, totalsFiles: [null, '1'], totalsColumnes: [null, '5/4'] }, // 2
        { files: ['AB', 'CC'], divisions: 4, totalsFiles: ['3/4', '3/2'], totalsColumnes: [null, '1'] }, // 3
        { files: ['AB', 'CB'], divisions: 4, totalsFiles: ['1', '5/4'], totalsColumnes: [null, '3/2'] }, // 4
        { files: ['AB', 'AC'], divisions: 4, totalsFiles: [null, '1'], totalsColumnes: ['1/4', '5/4'] }, // 5
        { files: ['AA', 'BC'], divisions: 4, totalsFiles: ['1/2', null], totalsColumnes: ['1', '3/4'] }, // 6
        { files: ['AB', 'AB'], divisions: 6, totalsFiles: [null, '7/6'], totalsColumnes: ['3/2', null] }, // 7
        { files: ['AA', 'BB'], divisions: 6, totalsFiles: ['4/3', null], totalsColumnes: [null, '1'] }, // 8
        { files: ['AB', 'CC'], divisions: 6, totalsFiles: ['2/3', '2/3'], totalsColumnes: ['1/2', null] }, // 9
        { files: ['AB', 'CB'], divisions: 6, totalsFiles: ['4/3', '5/3'], totalsColumnes: [null, '11/6'] }, // 10
        { files: ['AB', 'AC'], divisions: 6, totalsFiles: ['1', null], totalsColumnes: ['2/3', '7/6'] }, // 11
        { files: ['AA', 'BC'], divisions: 6, totalsFiles: ['1/3', null], totalsColumnes: ['2/3', '5/6'] }, // 12
        { files: ['ABB', 'ACC'], divisions: 4, totalsFiles: ['5/4', null], totalsColumnes: ['5/4', null, '5/4'] }, // 13
        { files: ['AB', 'AB', 'CC'], divisions: 4, totalsFiles: [null, null, '1/2'], totalsColumnes: ['3/2', '3/4'] }, // 14
        { files: ['AAB', 'CCB'], divisions: 4, totalsFiles: ['9/4', '5/2'], totalsColumnes: [null, null, '7/4'] }, // 15
        { files: ['AA', 'BC', 'BC'], divisions: 4, totalsFiles: ['1', '3/4', null], totalsColumnes: [null, '2'] }, // 16
        { files: ['AAB', 'CCC'], divisions: 4, totalsFiles: [null, '3/2'], totalsColumnes: ['3/4', null, '1/2'] }, // 17
        { files: ['AB', 'AB', 'CB'], divisions: 4, totalsFiles: ['5/4', null, null], totalsColumnes: ['5/2', '11/4'] }, // 18
        { files: ['ABC', 'ADD'], divisions: 6, totalsFiles: ['3/2', '5/3'], totalsColumnes: ['4/3', null, '5/6'] }, // 19
        { files: ['AB', 'AC', 'DD'], divisions: 6, totalsFiles: ['1/3', null, '1/3'], totalsColumnes: ['7/6', '4/3'] }, // 20
        { files: ['AAB', 'AAC'], divisions: 6, totalsFiles: ['2', null], totalsColumnes: ['5/3', null, '1'] }, // 21
        { files: ['AA', 'AA', 'BC'], divisions: 6, totalsFiles: ['2/3', null, '7/6'], totalsColumnes: [null, '7/3'] }, // 22
        { files: ['AAB', 'CDD'], divisions: 6, totalsFiles: [null, null], totalsColumnes: ['4/3', '3/2', '2'] }, // 23
        { files: ['AB', 'CB', 'CD'], divisions: 6, totalsFiles: [null, '11/6', null], totalsColumnes: ['5/2', '3'] }, // 24
        { files: ['ABB', 'ACD', 'EEE'], divisions: 4, totalsFiles: ['5/4', '2', '3/2'], totalsColumnes: ['9/4', null, '1'] }, // 25
        { files: ['AAA', 'BCD', 'EED'], divisions: 4, totalsFiles: ['9/4', null, '5/4'], totalsColumnes: ['2', '5/4', '1'] }, // 26
        { files: ['ABB', 'CCD', 'EFF'], divisions: 4, totalsFiles: ['1/2', '3', '1'], totalsColumnes: ['1', null, null] }, // 27
        { files: ['AAB', 'AAC', 'DDD'], divisions: 4, totalsFiles: ['1', null, '3/4'], totalsColumnes: [null, '3/2', '3/2'] }, // 28
        { files: ['AAB', 'CDB', 'CEE'], divisions: 4, totalsFiles: [null, '5/4', '9/4'], totalsColumnes: [null, '3/2', '3'] }, // 29
        { files: ['ABB', 'ACD', 'AED'], divisions: 4, totalsFiles: [null, '3/4', '5/2'], totalsColumnes: ['7/4', null, '2'] }, // 30
        { files: ['ABB', 'ACD', 'EED'], divisions: 6, totalsFiles: ['1', '3', null], totalsColumnes: ['3/2', null, '7/3'] }, // 31
        { files: ['ABC', 'ABD', 'EBD'], divisions: 6, totalsFiles: ['1/2', '2', null], totalsColumnes: ['5/3', '5/2', '7/6'] }, // 32
        { files: ['ABB', 'CCC', 'DDE'], divisions: 6, totalsFiles: [null, '1/2', null], totalsColumnes: ['1', '5/3', '13/6'] }, // 33
        { files: ['ABB', 'ABB', 'ACD'], divisions: 6, totalsFiles: ['2/3', null, '4/3'], totalsColumnes: ['11/6', null, '3/2'] }, // 34
        { files: ['AAB', 'CCB', 'CCD'], divisions: 6, totalsFiles: ['3/2', null, '3'], totalsColumnes: ['3/2', null, '17/6'] }, // 35
        { files: ['ABC', 'ABC', 'DBE'], divisions: 6, totalsFiles: ['8/3', null, '5/3'], totalsColumnes: [null, '8/3', '5/2'] }, // 36
        { files: ['AB', 'AB'], divisions: 0, totalsFiles: ['2/3', null], totalsColumnes: [null, '8/5'] }, // 37
        { files: ['AA', 'BB'], divisions: 0, totalsFiles: [null, '5/4'], totalsColumnes: [null, '7/6'] }, // 38
        { files: ['AB', 'CC'], divisions: 0, totalsFiles: [null, '7/8'], totalsColumnes: ['5/4', '1/2'] }, // 39
        { files: ['AB', 'CB'], divisions: 0, totalsFiles: ['7/15', '5/3'], totalsColumnes: [null, '13/10'] }, // 40
        { files: ['AB', 'AC'], divisions: 0, totalsFiles: ['3/2', null], totalsColumnes: ['11/7', '9/7'] }, // 41
        { files: ['AA', 'BC'], divisions: 0, totalsFiles: ['5/6', '4/9'], totalsColumnes: ['7/9', null] }, // 42
    ],
};
