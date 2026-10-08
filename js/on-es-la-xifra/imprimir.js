/**
 * ============================================================================
 * FITXER: js/on-es-la-xifra/imprimir.js
 * ROL: Omple imprimir/on-es-la-xifra.html: els exemples del full d'instruccions
 *      i els 7 fulls de problemes (6 per full, amb les caselles buides).
 * DEPENDÈNCIES: js/imprimir.js, problemes.js, motor.js i tauler.js (s'han de
 *      carregar abans).
 * ============================================================================
 */
(() => {
    const P = window.PROBLEMES_XIFRA;
    const T = window.TaulerXifra;
    const $ = id => document.getElementById(id);

    // ---- Full d'instruccions: els mateixos exemples que el joc ----
    const ex = P.exemple;
    const sol = [[8], [5], [1, 3]];
    const senseP = [
        [1, 1, 2],
        [[], []],
        [[], [], []],
    ]; // la mateixa suma, sense números de fora
    const cercles = [
        [1, 0], // el 5, a la fila del 5
        [2, 1], // el 3, a la columna del 3
    ];
    $('ex-problema').prepend(T.estatic(ex));
    $('ex-solucio').prepend(T.estatic(ex, { v: sol, comprova: true }));
    $('ex-suma-be').prepend(T.estatic(senseP, { v: sol, comprova: true }));
    $('ex-suma-zero').prepend(T.estatic(senseP, { v: [[3], [5], [0, 8]], comprova: true }));
    $('ex-pista-be').prepend(T.estatic(ex, { v: sol, comprova: true, cercles }));
    $('ex-pista-mal').prepend(T.estatic(ex, { v: [[7], [5], [1, 2]], comprova: true }));

    // ---- Fulls de problemes ----
    window.Imprimir.problemes({
        total: P.llista.length,
        perFull: 6,
        regla: 'La suma ha de ser correcta, i cada <strong>número de fora</strong> és a la seva <strong>fila</strong> o <strong>columna</strong>.',
        dibuixa: i => T.estatic(P.llista[i]),
    });
    window.Imprimir.capsIPeus({ titol: 'On és la xifra?', jp: 'どこかな算' });
})();
