/**
 * ============================================================================
 * FITXER: js/laberint-angles/imprimir.js
 * ROL: Omple imprimir/laberint-angles.html: els exemples del full
 *      d'instruccions i els 10 fulls de problemes (4 per full, sense resoldre).
 * ARQUITECTURA: Els laberints són els del joc (TaulerLaberint), amb l'amplada
 *   en mm: --k = mm per unitat de tauler. Als laberints petits en paper, els
 *   cercles s'engrandeixen (--cercle) perquè els números es llegeixin bé.
 * DEPENDÈNCIES: js/imprimir.js, problemes.js, motor.js i tauler.js (s'han de carregar abans).
 * ============================================================================
 */
(() => {
    const P = window.PROBLEMES_LABERINT;
    const M = window.MotorLaberint;
    const T = window.TaulerLaberint;
    const $ = id => document.getElementById(id);
    const R = 19; // el radi d'un cercle a tauler.js, en unitats de tauler
    const CERCLE_MIN = 8.6; // diàmetre mínim d'un cercle en paper (mm)

    // Posa el laberint a k mm per unitat, sense passar de les mides màximes (en mm)
    function amida(el, maxK, maxAmp, maxAlt, cercleMin = CERCLE_MIN) {
        const [amp, alt] = el.style.aspectRatio.split('/').map(Number);
        const k = Math.min(maxK, maxAmp / amp, maxAlt / alt);
        el.style.width = (amp * k).toFixed(2) + 'mm';
        el.style.setProperty('--k', k.toFixed(4));
        el.style.setProperty('--cercle', Math.max(1, cercleMin / (2 * R * k)).toFixed(3));
        return el;
    }

    // ---- Full d'instruccions: els mateixos exemples que el joc ----
    const ex = P.exemple;
    const sol = M.resol(ex)[0];
    const marques = cami =>
        cami
            .map((v, k) => ({ pos: k, v }))
            .filter(({ pos, v }) => pos > 0 && pos < cami.length - 1 && M.angleDemanat(ex, v) !== null)
            .map(({ pos }) => ({ pos, angle: M.angle(ex, cami[pos - 1], cami[pos], cami[pos + 1]) }));
    // A les instruccions els cercles no s'engrandeixen: taparien els arcs dels angles
    const instr = (el, k) => amida(el, k, 70, 60, 0);
    $('ex-problema').prepend(instr(T.estatic(ex, []), 0.22));
    $('ex-solucio').prepend(instr(T.estatic(ex, sol), 0.22));
    // Passa dues vegades pel cercle del mig: S, a baix, mig, 60, 120, a dalt i un altre cop al mig
    const mig = sol[2];
    const doble = sol.slice(0, 6).concat([mig]);
    $('ex-dues-vegades').prepend(instr(T.estatic(ex, doble, { classes: [[mig, 'erroni']] }), 0.2));
    $('ex-angles').prepend(instr(T.estatic(ex, sol, { marques: marques(sol) }), 0.26));
    // Un angle pla: tres cercles en línia, i el del mig és el del 180
    const pla = {
        nodes: [
            [0, 0],
            [1, 0, 180],
            [2, 0],
        ],
        arestes: [
            [0, 1],
            [1, 2],
        ],
        tallades: [],
    };
    $('ex-pla').prepend(instr(T.estatic(pla, [0, 1, 2], { marques: [{ pos: 1, angle: 180 }] }), 0.22));

    // ---- Fulls de problemes: 4 per full (2 × 2), perquè els laberints no quedin atapeïts ----
    window.Imprimir.problemes({
        total: P.llista.length,
        perFull: 4,
        regla: 'Ves de la <strong>S</strong> a la <strong>G</strong>. Als cercles amb un número, el camí hi forma aquest <strong>angle</strong>.',
        dibuixa: i => amida(T.estatic(P.llista[i], []), 0.42, 92, 104),
    });
    window.Imprimir.capsIPeus({ titol: "Laberint d'angles", jp: '角度メイズ' });
})();
