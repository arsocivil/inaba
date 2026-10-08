/**
 * ============================================================================
 * FITXER: js/enllac-multiples/imprimir.js
 * ROL: Omple imprimir/enllac-multiples.html: els exemples del full
 *      d'instruccions i els 7 fulls de problemes (6 per full, sense resoldre).
 * ARQUITECTURA: Els taulers són els del joc (TaulerEnllac), amb l'amplada en
 *   mm: --k = mm per unitat de tauler, i les lletres es mesuren amb --k.
 *   Sota cada tauler (o a la dreta, si té dues files), les targetes del
 *   problema (les que ja hi són, amb ✓).
 * DEPENDÈNCIES: js/imprimir.js, problemes.js i tauler.js (s'han de carregar abans).
 * ============================================================================
 */
(() => {
    const P = window.PROBLEMES_ENLLAC;
    const T = window.TaulerEnllac;
    const $ = id => document.getElementById(id);

    // Posa el tauler a k mm per unitat, sense passar de les mides màximes (en mm)
    function amida(el, maxK, maxAmp, maxAlt) {
        const [amp, alt] = el.style.aspectRatio.split('/').map(Number);
        const k = Math.min(maxK, maxAmp / amp, maxAlt / alt);
        el.style.width = (amp * k).toFixed(2) + 'mm';
        el.style.setProperty('--k', k.toFixed(4));
        return el;
    }

    // La fila de targetes: les que ja són al tauler porten ✓
    function targetes(problema) {
        const fixes = problema.llocs.filter(l => l.length > 2).map(l => l[2]);
        const fila = document.createElement('div');
        fila.className = 'targetes';
        problema.targetes.forEach(n => {
            const t = document.createElement('div');
            t.className = 'targeta';
            t.textContent = n;
            const j = fixes.indexOf(n);
            if (j >= 0) {
                t.classList.add('usada');
                fixes.splice(j, 1);
            }
            fila.appendChild(t);
        });
        return fila;
    }

    // ---- Full d'instruccions: els mateixos exemples que el joc ----
    const ex = P.exemple;
    const gran = el => amida(el, 0.2, 70, 60);
    $('ex-problema').prepend(gran(T.estatic(ex, [10, null, null, null])));
    $('ex-solucio').prepend(gran(T.estatic(ex, [10, 5, 4, 20], { etiquetes: ['×2', '×4', '×5'] })));
    $('ex-targetes').append(targetes(ex));
    const DUES = [[0, 0], [1, 0]]; // prettier-ignore
    const parella = (fletxa, valors, etiqueta) =>
        amida(T.estatic({ llocs: DUES, fletxes: [fletxa] }, valors, { etiquetes: [etiqueta] }), 0.2, 50, 40);
    $('ex-be-1').prepend(parella([1, 0], [10, 5], '×2'));
    $('ex-be-2').prepend(parella([0, 1], [4, 20], '×5'));
    $('ex-malament').prepend(parella([1, 0], [10, 4], '✗'));

    // ---- Fulls de problemes ----
    window.Imprimir.problemes({
        total: P.llista.length,
        perFull: 6,
        regla: "A la punta de cada fletxa hi va un <strong>múltiple</strong> de la targeta d'on surt.",
        dibuixa: i => {
            const div = document.createElement('div');
            div.className = 'enllac';
            const p = P.llista[i];
            const tauler = T.estatic(
                p,
                p.llocs.map(l => (l.length > 2 ? l[2] : null))
            );
            // Els taulers de dues files (2 × 2) són alts: les targetes van a la dreta, en columna
            const duesFiles = p.llocs.some(l => l[1] > 0);
            div.classList.toggle('en-columna', duesFiles);
            div.append(duesFiles ? amida(tauler, 0.3, 70, 52) : amida(tauler, 0.3, 84, 40), targetes(p));
            return div;
        },
    });
    window.Imprimir.capsIPeus({ titol: 'Enllaç de múltiples', jp: '倍数リンク' });
})();
