/**
 * ============================================================================
 * FITXER: js/busca-el-triangle/imprimir.js
 * ROL: Omple imprimir/busca-el-triangle.html: els exemples del full
 *      d'instruccions i els 7 fulls de problemes (6 per full, sense resoldre).
 * ARQUITECTURA: Les quadrícules són les del joc (TaulerTriangle), amb l'amplada
 *   en mm: --k = mm per unitat de tauler. L'àrea que es demana va a dalt de
 *   cada targeta, al costat del número.
 * DEPENDÈNCIES: js/imprimir.js, problemes.js, motor.js i tauler.js (s'han de carregar abans).
 * ============================================================================
 */
(() => {
    const P = window.PROBLEMES_TRIANGLE;
    const M = window.MotorTriangle;
    const T = window.TaulerTriangle;
    const $ = id => document.getElementById(id);

    // Posa la quadrícula a k mm per unitat, sense passar de les mides màximes (en mm)
    function amida(el, maxK, maxAmp, maxAlt) {
        const [amp, alt] = el.style.aspectRatio.split('/').map(Number);
        const k = Math.min(maxK, maxAmp / amp, maxAlt / alt);
        el.style.width = (amp * k).toFixed(2) + 'mm';
        el.style.setProperty('--k', k.toFixed(4));
        return el;
    }
    const quadricula = (p, opcions, maxK, maxAmp, maxAlt) => amida(T.estatic(p, opcions), maxK, maxAmp, maxAlt);

    // ---- Full d'instruccions: els mateixos exemples que el joc ----
    const ex = P.exemple;
    $('ex-problema').prepend(quadricula(ex, {}, 0.185, 50, 50));
    $('ex-solucio').prepend(quadricula(ex, { tria: M.resol(ex)[0] }, 0.185, 50, 50));
    const senzill = { amp: 2, alt: 3, punts: [[2, 0], [0, 3], [2, 3]], area: 3 }; // prettier-ignore
    const ds = M.desglossa(...senzill.punts);
    $('ex-senzill').prepend(quadricula(senzill, { tria: [0, 1, 2], d: ds }, 0.185, 50, 46));
    const inclinat = { amp: 3, alt: 3, punts: [[0, 1], [3, 0], [2, 3]], area: 4 }; // prettier-ignore
    const di = M.desglossa(...inclinat.punts);
    $('ex-inclinat').prepend(quadricula(inclinat, { tria: [0, 1, 2] }, 0.175, 50, 46));
    $('ex-inclinat-caixa').prepend(quadricula(inclinat, { tria: [0, 1, 2], d: di }, 0.175, 50, 46));

    // ---- Fulls de problemes ----
    window.Imprimir.problemes({
        total: P.llista.length,
        perFull: 6,
        regla: "Encercla <strong>tres punts</strong> i uneix-los: han de fer un <strong>triangle</strong> amb l'àrea que es demana.",
        dibuixa: i => {
            const p = P.llista[i];
            const div = document.createElement('div');
            div.className = 'triangle-full';
            const area = document.createElement('div');
            area.className = 'area';
            area.innerHTML = `Àrea <b>${M.text(p.area)}</b>`;
            div.append(area, quadricula(p, {}, 0.3, 90, 64));
            return div;
        },
    });
    window.Imprimir.capsIPeus({ titol: 'Busca el triangle', jp: '三角探し' });
})();
