/**
 * ============================================================================
 * FITXER: js/talla-rectangles/imprimir.js
 * ROL: Omple imprimir/talla-rectangles.html: els exemples del full
 *      d'instruccions i els 11 fulls de problemes (4 per full, sense resoldre).
 * ARQUITECTURA: Les figures són les del joc (TaulerRectangles), amb l'amplada
 *   en mm: --k = mm per unitat de l'SVG (un quadret fa 10 unitats). La llista
 *   de mides va a dalt de cada targeta, al costat del número.
 * DEPENDÈNCIES: js/imprimir.js, problemes.js i tauler.js (s'han de carregar abans).
 * ============================================================================
 */
(() => {
    const P = window.PROBLEMES_RECTANGLES;
    const T = window.TaulerRectangles;
    const $ = id => document.getElementById(id);

    // Mida d'un quadret: com més gran millor, sense passar de les mides màximes (en mm)
    function amida(el, files, maxCel, maxAmp, maxAlt) {
        const cel = Math.min(maxCel, maxAmp / (files[0].length + 0.4), maxAlt / (files.length + 0.4));
        el.style.width = ((files[0].length + 0.4) * cel).toFixed(2) + 'mm'; // + 0.4: el marge de l'SVG
        el.style.setProperty('--k', (cel / 10).toFixed(4));
        return el;
    }
    const figura = (files, peces, maxCel, maxAmp, maxAlt) =>
        amida(T.estatic(files, peces), files, maxCel, maxAmp, maxAlt);

    // Peces a partir de files de lletres (com al joc): cada lletra és una peça; l'etiqueta és la seva mida
    function pecesDeText(files, erronies = '') {
        const per = {};
        files.forEach((f, y) =>
            [...f].forEach((c, x) => {
                if (c !== '.' && c !== '#') (per[c] = per[c] || []).push([x, y]);
            })
        );
        return Object.entries(per).map(([lletra, q]) => ({
            quadrets: q,
            classe: erronies.includes(lletra) ? 'erroni' : '',
            etiqueta: q.length,
        }));
    }

    // ---- Full d'instruccions: els mateixos exemples que el joc ----
    const ex = P.exemple;
    const SOL = ['ABBB..', 'ABBB..', 'ACCCCC'];
    const L = ['AAAB..', 'BBBB..', 'CCCCCC']; // la B no és un rectangle
    $('ex-problema').prepend(figura(ex.figura, [], 13, 80, 45));
    $('ex-solucio').prepend(figura(ex.figura, pecesDeText(SOL), 13, 80, 45));
    $('ex-be').prepend(figura(ex.figura, pecesDeText(SOL), 10, 80, 40));
    $('ex-malament').prepend(figura(ex.figura, pecesDeText(L, 'B'), 10, 80, 40));
    // Les tres peces, separades
    const peces = { 'ex-3': ['A', 'A', 'A'], 'ex-6': ['AAA', 'AAA'], 'ex-5': ['AAAAA'] };
    Object.entries(peces).forEach(([id, files]) => {
        $(id).prepend(
            figura(
                files.map(f => f.replace(/A/g, '#')),
                pecesDeText(files),
                10,
                80,
                40
            )
        );
    });

    // ---- Fulls de problemes: 4 per full (2 × 2), perquè les figures no quedin atapeïdes ----
    window.Imprimir.problemes({
        total: P.llista.length,
        perFull: 4,
        regla: 'Divideix la figura en <strong>rectangles</strong>: un de cada nombre de quadrets de la llista.',
        dibuixa: i => {
            const p = P.llista[i];
            const div = document.createElement('div');
            div.className = 'talla';
            const mides = document.createElement('div');
            mides.className = 'mides';
            p.mides.forEach(m => {
                const el = document.createElement('span');
                el.className = 'mida';
                el.textContent = m;
                mides.appendChild(el);
            });
            div.append(mides, figura(p.figura, [], 16, 92, 104));
            return div;
        },
    });
    window.Imprimir.capsIPeus({ titol: 'Talla en rectangles', jp: '四角カット' });
})();
