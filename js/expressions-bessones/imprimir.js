/**
 * ============================================================================
 * FITXER: js/expressions-bessones/imprimir.js
 * ROL: Omple imprimir/expressions-bessones.html: els exemples del full
 *      d'instruccions i els 7 fulls de problemes (6 per full, sense resoldre).
 * DEPENDÈNCIES: js/imprimir.js, problemes.js i tauler.js (s'han de carregar abans).
 * ============================================================================
 */
(() => {
    const P = window.PROBLEMES_BESSONES;
    const T = window.TaulerBessones;
    const $ = id => document.getElementById(id);
    const buida = { ops: [null, null], par: 0 };

    // ---- Full d'instruccions: els mateixos exemples que el joc ----
    const ex = P.exemple;
    const res = { ops: ['+', '×'], par: 1 };
    $('ex-problema').prepend(T.estatic(ex, [buida, buida]));
    $('ex-solucio').prepend(T.estatic(ex, [res, res], { estats: ['be', 'be'] }));
    const una = [ex[0]];
    $('ex-be').prepend(T.estatic(una, [{ ops: ['+', '+'], par: 0 }], { estats: ['be'] }));
    $('ex-malament').prepend(T.estatic(una, [{ ops: ['+', '×'], par: 0 }], { estats: ['malament'] }));
    $('ex-iguals').prepend(T.estatic(ex, [res, res], { estats: ['be', 'be'] }));
    $('ex-diferents').prepend(
        T.estatic(
            ex,
            [
                { ops: ['+', '+'], par: 0 },
                { ops: ['×', '+'], par: 0 },
            ],
            { estats: ['malament', 'malament'] }
        )
    );

    // ---- Fulls de problemes ----
    window.Imprimir.problemes({
        total: P.llista.length,
        perFull: 6,
        regla: 'Posa els <strong>mateixos signes</strong> a totes dues targetes perquè les dues igualtats siguin correctes.',
        dibuixa: i => {
            const el = T.estatic(P.llista[i], [buida, buida]);
            // 37–42: els números de dues xifres no hi cabrien a la mida dels altres
            if (P.llista[i].some(([a, b, c]) => Math.max(a, b, c) >= 10)) el.classList.add('dues-xifres');
            return el;
        },
    });
    window.Imprimir.capsIPeus({ titol: 'Expressions bessones', jp: '双子式' });
})();
