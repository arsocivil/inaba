/**
 * ============================================================================
 * FITXER: js/busca-el-nombre/imprimir.js
 * ROL: Omple imprimir/busca-el-nombre.html: els exemples del full d'instruccions
 *      i els 7 fulls de problemes (6 per full, amb la pregunta a sobre de cada
 *      quadrícula). Cada full té una sola mida de quadrat (2 × 2 o 3 × 3).
 * MIDES: la quadrícula es dibuixa amb el costat de quadret més gran que hi cap
 *      a la targeta (fins a 20 mm; 6 files fan uns 9 mm).
 * DEPENDÈNCIES: js/imprimir.js, problemes.js, motor.js i tauler.js (s'han de
 *      carregar abans).
 * ============================================================================
 */
(() => {
    const P = window.PROBLEMES_KAZU;
    const M = window.MotorKazu;
    const T = window.TaulerKazu;
    const $ = id => document.getElementById(id);

    // ---- Full d'instruccions: els mateixos exemples que el joc ----
    const ex = M.analitza(P.exemple);
    $('ex-problema').prepend(T.estatic(ex, null));
    $('ex-solucio').prepend(T.estatic(ex, { c: 1, f: 0 }));
    $('ex-1').prepend(T.estatic(ex, { c: 1, f: 1 }));
    $('ex-3').prepend(T.estatic(ex, { c: 0, f: 0 }));
    $('ex-4').prepend(T.estatic(ex, { c: 0, f: 1 }));
    $('ex-surt').prepend(T.estatic(ex, { c: 2, f: 1, classe: 'erroni' }));
    $('ex-mida').prepend(T.estatic(ex, { c: 0, f: 2, w: 1, h: 2, classe: 'erroni' }));
    // La llegenda: una poma i una mandarina soles
    $('ex-poma').prepend(T.estatic(M.analitza([2, ['p'], ['n', 1]])));
    $('ex-mandarina').prepend(T.estatic(M.analitza([2, ['m'], ['n', 1]])));

    // ---- Fulls de problemes ----
    // Mida (mm) del quadret d'un problema: la targeta deixa uns 58 mm d'alt i 90 mm d'ample per a la quadrícula
    const ALT_MAX = 58;
    const AMP_MAX = 90;
    const MARGE = 14 / 60; // el marge de l'SVG, en quadrets (un costat)
    function mida(g) {
        return Math.min(20, ALT_MAX / (g.alt + 2 * MARGE), AMP_MAX / (g.amp + 2 * MARGE));
    }

    window.Imprimir.problemes({
        total: P.llista.length,
        perFull: 6,
        regla: primer => {
            const m = P.llista[primer - 1][0];
            const mixt = M.teMandarines(M.analitza(P.llista[primer - 1]));
            return (
                `Envolta amb un <strong>quadrat de ${m} × ${m}</strong> el lloc que et demanen.` +
                (mixt ? ' ○ poma · ● mandarina' : '')
            );
        },
        dibuixa: i => {
            const g = M.analitza(P.llista[i]);
            const caixa = document.createElement('div');
            caixa.className = 'targeta';
            const pregunta = document.createElement('p');
            pregunta.className = 'pregunta';
            pregunta.textContent = M.enunciat(g);
            const svg = T.estatic(g);
            svg.style.width = `${(g.amp + 2 * MARGE) * mida(g)}mm`;
            caixa.append(pregunta, svg);
            return caixa;
        },
    });
    window.Imprimir.capsIPeus({ titol: 'Busca el nombre', jp: 'かずさがし' });
})();
