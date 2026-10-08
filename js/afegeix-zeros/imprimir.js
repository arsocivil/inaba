/**
 * ============================================================================
 * FITXER: js/afegeix-zeros/imprimir.js
 * ROL: Omple imprimir/afegeix-zeros.html: els exemples del full
 *      d'instruccions i els 10 fulls de problemes (5 per full, una igualtat per
 *      fila: les igualtats són amples i baixes; l'últim full en té 4).
 * ARQUITECTURA: Les igualtats són les del joc (TaulerZeros); el CSS d'impressió
 *   fa les targetes amples, amb espai buit per escriure-hi els zeros.
 * DEPENDÈNCIES: js/imprimir.js, problemes.js i tauler.js (s'han de carregar abans).
 * ============================================================================
 */
(() => {
    const P = window.PROBLEMES_ZEROS;
    const T = window.TaulerZeros;
    const $ = id => document.getElementById(id);

    // ---- Full d'instruccions: els mateixos exemples que el joc ----
    const ex = P.exemple;
    $('ex-problema').prepend(T.estatic(ex));
    $('ex-solucio').prepend(T.estatic(ex, [0, 2, 1]));
    $('ex-be').prepend(T.estatic(ex, [0, 2, 1]));
    $('ex-malament').prepend(T.estatic(ex, [1, 0, 2]));

    // ---- Fulls de problemes ----
    window.Imprimir.problemes({
        total: P.llista.length,
        perFull: 5,
        regla: 'Afegeix <strong>zeros</strong> a algunes targetes perquè la <strong>igualtat</strong> sigui correcta.',
        dibuixa: i => T.estatic(P.llista[i]),
    });
    window.Imprimir.capsIPeus({ titol: 'Afegeix zeros', jp: 'ゼロゼロ式' });
})();
