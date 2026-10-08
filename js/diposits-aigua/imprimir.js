/**
 * ============================================================================
 * FITXER: js/diposits-aigua/imprimir.js
 * ROL: Omple imprimir/diposits-aigua.html: els exemples del full
 *      d'instruccions i els 11 fulls de problemes (4 per full, sense resoldre:
 *      amb 6 per full, els cubs dels problemes de 3 × 3 serien massa petits per
 *      dibuixar-hi el nivell de l'aigua entre les marques).
 * ARQUITECTURA: Els taulers són els del joc (TaulerDiposits), amb l'amplada en
 *   mm: --k = mm per unitat de tauler (un cub fa 100 unitats).
 * DEPENDÈNCIES: js/imprimir.js, problemes.js, motor.js i tauler.js (s'han de carregar abans).
 * ============================================================================
 */
(() => {
    const P = window.PROBLEMES_DIPOSITS;
    const M = window.MotorDiposits;
    const T = window.TaulerDiposits;
    const $ = id => document.getElementById(id);
    const PER_FULL = 4;

    // Posa el tauler a k mm per unitat, sense passar de les mides màximes (en mm)
    function amida(el, maxK, maxAmp, maxAlt) {
        const [amp, alt] = el.style.aspectRatio.split('/').map(Number);
        const k = Math.min(maxK, maxAmp / amp, maxAlt / alt);
        el.style.width = (amp * k).toFixed(2) + 'mm';
        el.style.setProperty('--k', k.toFixed(4));
        return el;
    }

    // ---- Full d'instruccions: els mateixos exemples que el joc ----
    const ex = P.exemple;
    const sol = M.resol(ex)[0];
    $('ex-problema').prepend(amida(T.estatic(ex, { quantitats: false }), 0.14, 52, 46));
    $('ex-solucio').prepend(amida(T.estatic(ex, { nivells: sol }), 0.14, 52, 46));
    $('ex-columna').prepend(amida(T.estatic(ex, { nivells: sol }), 0.12, 45, 40));
    const un = { files: ['A'], divisions: 6, totalsFiles: [null], totalsColumnes: [null] };
    $('ex-litre').prepend(amida(T.estatic(un, { nivells: [M.F(1)] }), 0.15, 20, 20));
    $('ex-un').prepend(amida(T.estatic(un, { nivells: [M.F(1, 3)] }), 0.15, 20, 20));
    const alt = { files: ['A', 'A'], divisions: 6, totalsFiles: [null, null], totalsColumnes: [null] };
    $('ex-alt').prepend(amida(T.estatic(alt, { nivells: [M.F(3, 2)] }), 0.15, 20, 34));
    const ample = { files: ['AA'], divisions: 6, totalsFiles: [null], totalsColumnes: [null, null] };
    $('ex-ample').prepend(amida(T.estatic(ample, { nivells: [M.F(1, 3)] }), 0.15, 34, 20));

    // ---- Fulls de problemes ----
    const gran = PER_FULL === 4;
    window.Imprimir.problemes({
        total: P.llista.length,
        perFull: PER_FULL,
        regla: "Dibuixa l'<strong>aigua</strong> de cada dipòsit: cada fila i columna ha de tenir el <strong>total</strong> de la fletxa.",
        dibuixa: i => amida(T.estatic(P.llista[i], { quantitats: false }), 0.3, 92, gran ? 106 : 66),
    });
    if (gran) document.body.classList.add('quatre-per-full');
    window.Imprimir.capsIPeus({ titol: "Dipòsits d'aigua", jp: '水そうと水' });
})();
