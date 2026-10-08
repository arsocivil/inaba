/**
 * ============================================================================
 * FITXER: js/escala-nombres/imprimir.js
 * ROL: Omple imprimir/escala-nombres.html: els exemples del full
 *      d'instruccions i els 11 fulls de problemes (4 per full, sense resoldre:
 *      amb 6 per full, els cercles dels problemes grans quedarien massa petits
 *      per escriure-hi nombres de dues xifres).
 * ARQUITECTURA: Els taulers són els del joc (TaulerEscala), amb l'amplada en
 *   mm: --k = mm per unitat de tauler (un punt del PDF).
 * DEPENDÈNCIES: js/imprimir.js, problemes.js, motor.js i tauler.js (s'han de carregar abans).
 * ============================================================================
 */
(() => {
    const P = window.PROBLEMES_ESCALA;
    const M = window.MotorEscala;
    const T = window.TaulerEscala;
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
    $('ex-problema').prepend(amida(T.estatic(ex), 0.23, 60, 45));
    $('ex-solucio').prepend(amida(T.estatic(ex, { valors: sol }), 0.23, 60, 45));
    const repetit = [3, 3, 1, 2, 3, 4];
    const estats = ex.fileres.map(f => (M.filera(f.map(i => repetit[i])).estat === 'be' ? '' : 'malament'));
    // Els cercles de la filera dolenta, amb doble vora (a més de la línia de punts)
    const dolenta = ex.fileres.find((f, k) => estats[k] === 'malament');
    const classes = dolenta.map(i => [i, 'erroni']);
    $('ex-repetit').prepend(amida(T.estatic(ex, { valors: repetit, estats, classes }), 0.3, 60, 45));
    $('ex-salts').prepend(amida(T.estatic(ex, { valors: sol, salts: true }), 0.25, 60, 45));

    // ---- Fulls de problemes ----
    const gran = PER_FULL === 4;
    window.Imprimir.problemes({
        total: P.llista.length,
        perFull: PER_FULL,
        regla: "Escriu un nombre a cada cercle buit: a cada <strong>filera</strong>, han d'<strong>augmentar sempre igual</strong>.",
        dibuixa: i => amida(T.estatic(P.llista[i]), 0.6, 92, gran ? 104 : 64),
    });
    if (gran) document.body.classList.add('quatre-per-full');
    window.Imprimir.capsIPeus({ titol: "L'escala de nombres", jp: '数字の階段' });
})();
