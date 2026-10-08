/**
 * ============================================================================
 * FITXER: js/afegeix-zeros/tauler.js
 * ROL: Dibuixa una igualtat: les targetes (la xifra i els zeros afegits),
 *      els signes + i =, i el total.
 * ARQUITECTURA: HTML (flex). Cada targeta és un div amb la xifra i un span per
 *   zero; els zeros afegits es distingeixen de la xifra (com els zeros encerclats
 *   del PDF). El fa servir el joc, els exemples de les instruccions i la versió
 *   per imprimir.
 * DEPENDÈNCIES: Cap.
 * ============================================================================
 */
window.TaulerZeros = (() => {
    function element(etiqueta, classe, text) {
        const el = document.createElement(etiqueta);
        el.className = classe;
        if (text !== undefined) el.textContent = text;
        return el;
    }

    /**
     * Crea la igualtat del problema p. Retorna:
     *   el, targetes (un div per targeta);
     *   pinta(zeros, estat): posa els zeros de cada targeta; estat '' | 'be' | 'malament'.
     */
    function crea(p) {
        const el = element('div', 'igualtat');
        el.classList.toggle('quatre', p.targetes.length > 3);
        const targetes = p.targetes.map((x, i) => {
            if (i > 0) el.appendChild(element('span', 'signe', '+'));
            const t = element('div', 'targeta');
            t.dataset.targeta = i;
            t.appendChild(element('span', 'xifra', x));
            el.appendChild(t);
            return t;
        });
        el.appendChild(element('span', 'signe', '='));
        el.appendChild(element('span', 'total', p.total));

        function pinta(zeros, estat = '') {
            targetes.forEach((t, i) => {
                t.querySelectorAll('.zero').forEach(z => z.remove());
                for (let k = 0; k < zeros[i]; k++) {
                    const z = element('span', 'zero', '0');
                    z.dataset.zero = k;
                    t.appendChild(z);
                }
                t.classList.toggle('amb-zeros', zeros[i] > 0);
            });
            el.classList.remove('be', 'malament');
            if (estat) el.classList.add(estat);
        }

        pinta(p.targetes.map(() => 0));
        return { el, targetes, pinta };
    }

    // Una igualtat només per mirar (instruccions i versió per imprimir)
    function estatic(p, zeros = null, estat = '') {
        const t = crea(p);
        t.el.classList.add('estatic');
        t.pinta(zeros || p.targetes.map(() => 0), estat);
        return t.el;
    }

    return { crea, estatic };
})();
