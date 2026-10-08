/**
 * ============================================================================
 * FITXER: js/busca-la-figura/imprimir.js
 * ROL: Omple imprimir/busca-la-figura.html: els exemples del full
 *      d'instruccions i els 7 fulls de problemes (6 per full, sense resoldre).
 * ARQUITECTURA: Les quadrícules són les del joc (TaulerTriangle, el mateix del
 *   «Busca el triangle»), amb l'amplada en mm: --k = mm per unitat de tauler.
 *   La figura que es demana va a dalt de cada targeta, al costat del número.
 * DEPENDÈNCIES: js/imprimir.js, problemes.js, motor.js i js/busca-el-triangle/tauler.js.
 * ============================================================================
 */
(() => {
    const P = window.PROBLEMES_FIGURA;
    const M = window.MotorFigura;
    const T = window.TaulerTriangle;
    const $ = id => document.getElementById(id);
    const NOM = {
        'quadrat': 'Quadrat',
        'rectangle': 'Rectangle',
        'rombe': 'Rombe',
        'paral·lelogram': 'Paral·lelogram',
        'trapezi': 'Trapezi',
        'isosceles': 'Triangle isòsceles',
        'rectangle-triangle': 'Triangle rectangle',
        'rectangle-isosceles': 'Triangle rectangle isòsceles',
    };
    // Les figures d'exemple de la pàgina 1 del PDF (quadrícules de 3 × 3)
    const EXEMPLES = {
        'isosceles': [[1, 0], [3, 2], [0, 3]],
        'rectangle-triangle': [[1, 0], [3, 0], [3, 3]],
        'quadrat': [[0, 1], [2, 1], [0, 3], [2, 3]],
        'rectangle': [[1, 0], [3, 2], [2, 3], [0, 1]],
        'rombe': [[3, 0], [1, 1], [2, 2], [0, 3]],
        'trapezi': [[1, 0], [2, 0], [3, 3], [0, 3]],
        'paral·lelogram': [[0, 0], [2, 1], [2, 3], [0, 2]],
    }; // prettier-ignore

    // Posa la quadrícula a k mm per unitat, sense passar de les mides màximes (en mm)
    function amida(el, maxK, maxAmp, maxAlt) {
        const [amp, alt] = el.style.aspectRatio.split('/').map(Number);
        const k = Math.min(maxK, maxAmp / amp, maxAlt / alt);
        el.style.width = (amp * k).toFixed(2) + 'mm';
        el.style.setProperty('--k', k.toFixed(4));
        return el;
    }

    // Una figura feta: els punts triats, en l'ordre de la vora, i les marques de la seva definició
    function feta(p, figura, tria) {
        const r = M.comprova(
            figura,
            tria.map(i => p.punts[i])
        );
        const ordre = r.a.ordre.map(q => p.punts.findIndex(s => s[0] === q[0] && s[1] === q[1]));
        return T.estatic(p, { tria, ordre, marques: M.marques(figura, r.a) });
    }

    // ---- Full d'instruccions: els mateixos exemples que el joc ----
    const ex = P.exemple;
    $('ex-problema').prepend(amida(T.estatic(ex), 0.18, 50, 46));
    $('ex-solucio').prepend(amida(feta(ex, ex.figura, M.resol(ex)[0]), 0.18, 50, 46));
    Object.entries(EXEMPLES).forEach(([f, punts]) => {
        const p = { amp: 3, alt: 3, punts };
        const tots = punts.map((q, i) => i);
        $('ex-' + f.replace('·', '')).prepend(amida(feta(p, f, tots), 0.15, 44, 38));
    });

    // ---- Fulls de problemes ----
    window.Imprimir.problemes({
        total: P.llista.length,
        perFull: 6,
        regla: 'Encercla els <strong>vèrtexs</strong> i uneix-los per fer la <strong>figura</strong> que es demana.',
        dibuixa: i => {
            const p = P.llista[i];
            const div = document.createElement('div');
            div.className = 'figura-full';
            const nom = document.createElement('div');
            nom.className = 'nom-figura';
            nom.textContent = NOM[p.figura];
            div.append(nom, amida(T.estatic(p), 0.3, 90, 64));
            return div;
        },
    });
    window.Imprimir.capsIPeus({ titol: 'Busca la figura', jp: '図形探し' });
})();
