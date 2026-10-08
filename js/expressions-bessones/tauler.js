/**
 * ============================================================================
 * FITXER: js/expressions-bessones/tauler.js
 * ROL: Dibuixa les targetes: a ○ b ○ c = r, amb els forats dels signes i els
 *      parèntesis. El fa servir el joc i també els exemples de les instruccions.
 * ARQUITECTURA: Totes les targetes van en una sola graella CSS, una fila per
 *   targeta, perquè els forats dels signes quedin un sota l'altre (les dues
 *   targetes són «bessones»). Columnes de cada fila:
 *     marge ( a ○ ( b ) ○ c ) = r marge estat
 *   Les columnes dels parèntesis queden buides (amplada 0) si no n'hi ha.
 * DEPENDÈNCIES: Cap.
 * ============================================================================
 */
window.TaulerBessones = (() => {
    // Columna (1…) de cada peça dins de la fila
    const COL = { obre1: 2, a: 3, forat0: 4, obre2: 5, b: 6, tanca1: 7, forat1: 8, c: 9, tanca2: 10, igual: 11, r: 12 };
    const COL_ESTAT = 14;

    function cel(el, classe, fila, col, text = '') {
        const d = document.createElement('div');
        d.className = classe;
        d.style.gridRow = fila;
        d.style.gridColumn = col;
        d.textContent = text;
        el.appendChild(d);
        return d;
    }

    /**
     * Crea les targetes (una o dues). Retorna:
     *   el, files: per a cada targeta { fons, forats: [div, div], parens: [obre1, tanca1, obre2, tanca2], estat },
     *   pinta(k, { ops, par }): posa els signes i els parèntesis a la targeta k.
     */
    function crea(cartes) {
        const el = document.createElement('div');
        el.className = 'bessones';
        const files = cartes.map(([a, b, c, r], k) => {
            const fila = k + 1;
            const fons = cel(el, 'targeta-fons', fila, '1 / 14');
            cel(el, 'num pos-a', fila, COL.a, a);
            cel(el, 'num pos-b', fila, COL.b, b);
            cel(el, 'num pos-c', fila, COL.c, c);
            cel(el, 'igual', fila, COL.igual, '=');
            cel(el, 'num resultat', fila, COL.r, r);
            const forats = [cel(el, 'forat', fila, COL.forat0), cel(el, 'forat', fila, COL.forat1)];
            forats.forEach((f, i) => (f.dataset.forat = i));
            const parens = [COL.obre1, COL.tanca1, COL.obre2, COL.tanca2].map(col => cel(el, 'paren', fila, col));
            const estat = cel(el, 'estat', fila, COL_ESTAT);
            return { fons, forats, parens, estat };
        });

        function pinta(k, { ops, par }) {
            const f = files[k];
            f.forats.forEach((d, i) => {
                d.textContent = ops[i] || '';
                d.classList.toggle('ple', !!ops[i]);
                d.classList.toggle('dins-paren', par === i + 1);
            });
            const [o1, t1, o2, t2] = f.parens;
            o1.textContent = par === 1 ? '(' : '';
            t1.textContent = par === 1 ? ')' : '';
            o2.textContent = par === 2 ? '(' : '';
            t2.textContent = par === 2 ? ')' : '';
            f.parens.forEach(p => p.classList.toggle('posat', p.textContent !== ''));
        }

        return { el, files, pinta };
    }

    // Unes targetes només per mirar (instruccions): una tria de signes per targeta, i ✓ o ✗ si cal
    function estatic(cartes, tries, opcions = {}) {
        const t = crea(cartes);
        t.el.classList.add('estatic');
        tries.forEach((tria, k) => t.pinta(k, tria));
        (opcions.estats || []).forEach((e, k) => {
            if (!e) return;
            t.files[k].fons.classList.add(e);
            t.files[k].estat.textContent = e === 'be' ? '✓' : '✗';
            t.files[k].estat.classList.add(e);
        });
        return t.el;
    }

    return { crea, estatic };
})();
