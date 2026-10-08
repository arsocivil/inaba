/**
 * ============================================================================
 * FITXER: js/creuat-multiples/imprimir.js
 * ROL: Omple imprimir/creuat-multiples.html: els exemples del full
 *      d'instruccions i els 7 fulls de problemes (6 per full, sense resoldre).
 * DEPENDÈNCIES: js/imprimir.js, problemes.js, motor.js i tauler.js (s'han de carregar abans).
 * ============================================================================
 */
(() => {
    const P = window.PROBLEMES_CREUAT;
    const M = window.MotorCreuat;
    const T = window.TaulerCreuat;
    const $ = id => document.getElementById(id);

    // ---- Full d'instruccions: els mateixos exemples que el joc ----
    const ex = P.exemple;
    const sol = M.buida(M.analitza(ex));
    sol[1][1] = 9;
    sol[1][2] = 6;
    sol[2][2] = 5;
    $('ex-problema').prepend(T.estatic(ex));
    $('ex-solucio').prepend(T.estatic(ex, { v: sol }));
    const veu = {
        'ex-veu-96': { dir: 'd', x: 0, y: 1 },
        'ex-veu-9': { dir: 'a', x: 1, y: 0 },
        'ex-veu-65': { dir: 'a', x: 2, y: 0 },
        'ex-veu-5': { dir: 'd', x: 1, y: 2 },
    };
    Object.entries(veu).forEach(([id, t]) => $(id).prepend(T.estatic(ex, { v: sol, veu: [t] })));
    $('ex-zero').prepend(T.estatic(['#d3 . .'], { v: [[null, 0, 6]] }));

    // ---- Fulls de problemes ----
    window.Imprimir.problemes({
        total: P.llista.length,
        perFull: 6,
        regla: "Escriu una xifra a cada casella blanca perquè el nombre que es veu des de cada número sigui un <strong>múltiple</strong> d'aquest número.",
        dibuixa: i => T.estatic(P.llista[i]),
    });
    window.Imprimir.capsIPeus({ titol: 'Creuat de múltiples', jp: '倍数クロス' });
})();
