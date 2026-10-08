/**
 * ============================================================================
 * FITXER: js/escala-nombres/motor.js
 * ROL: Lògica pura del puzzle (sense DOM): comprovar les fileres i buscar les
 *      solucions.
 * ARQUITECTURA: Uns valors són una llista (un per cercle) de nombres enters o
 *   null (cercle buit). Una filera és bona si és una progressió aritmètica de
 *   diferència diferent de 0: des d'una de les puntes, els nombres augmenten
 *   sempre la mateixa quantitat (i per tant no es repeteixen).
 * DEPENDÈNCIES: Cap.
 * ============================================================================
 */
window.MotorEscala = (() => {
    const MAXIM = 200; // el resolutor no prova nombres més grans

    // Els valors inicials: els números que ja hi són escrits, i null als cercles buits
    function inicials(p) {
        return p.nodes.map(n => (n.length > 2 ? n[2] : null));
    }

    const esFix = (p, i) => p.nodes[i].length > 2;

    // Una frase amb els nombres d'una filera, d'una punta a l'altra: «3, 5, 7»
    const llista = vs => vs.join(', ');

    /**
     * Comprova una filera (els seus valors, en ordre). Retorna:
     *   { estat: 'incomplet' } si hi ha algun cercle buit;
     *   { estat: 'be', d } si és bona: d és el que augmenta, d'una punta (la del primer cercle) a l'altra
     *     (positiu o negatiu);
     *   { estat: 'repetit' | 'salt', motiu } si no.
     */
    function filera(vs) {
        if (vs.some(v => v === null)) return { estat: 'incomplet' };
        if (new Set(vs).size < vs.length) {
            return { estat: 'repetit', motiu: `A la filera ${llista(vs)} hi ha nombres repetits.` };
        }
        const d = vs[1] - vs[0];
        for (let k = 2; k < vs.length; k++) {
            if (vs[k] - vs[k - 1] !== d) {
                const salts = vs.slice(1).map((v, j) => v - vs[j]);
                const signe = x => (x > 0 ? '+' : '−') + Math.abs(x);
                return {
                    estat: 'salt',
                    motiu: `A la filera ${llista(vs)} no augmenten sempre igual (${salts.map(signe).join(', ')}).`,
                };
            }
        }
        return { estat: 'be', d };
    }

    /**
     * Comprova tot el problema. Retorna { complet, correcte, fileres: [resultat de filera() per a cada filera],
     * zeros: [índexs dels cercles amb un 0 o menys] }.
     */
    function comprova(p, valors) {
        const complet = valors.every(v => v !== null);
        const fileres = p.fileres.map(f => filera(f.map(i => valors[i])));
        const zeros = valors.map((v, i) => (v !== null && v < 1 ? i : -1)).filter(i => i >= 0);
        const correcte = complet && zeros.length === 0 && fileres.every(r => r.estat === 'be');
        return { complet, correcte, fileres, zeros };
    }

    /**
     * Totes les solucions (fins a «fins», per defecte 2) amb nombres de 1 a MAXIM.
     * Propaga: dos valors d'una filera la determinen sencera. Quan no es pot deduir res, prova totes les
     * diferències possibles a la filera amb menys cercles buits (i, si cal, el primer valor).
     */
    function resol(p, fins = 2) {
        const sols = [];

        function propaga(vs) {
            let canvi = true;
            while (canvi) {
                canvi = false;
                for (const f of p.fileres) {
                    const sabuts = f.map((i, k) => [k, vs[i]]).filter(([, v]) => v !== null);
                    if (sabuts.length < 2) continue;
                    const [[ka, va], [kb, vb]] = sabuts;
                    const d = (vb - va) / (kb - ka);
                    if (!Number.isInteger(d) || d === 0) return false;
                    for (let k = 0; k < f.length; k++) {
                        const v = va + (k - ka) * d;
                        if (v < 1 || v > MAXIM) return false;
                        if (vs[f[k]] === null) {
                            vs[f[k]] = v;
                            canvi = true;
                        } else if (vs[f[k]] !== v) return false;
                    }
                }
            }
            return true;
        }

        function cerca(vs) {
            if (sols.length >= fins || !propaga(vs)) return;
            if (vs.every(v => v !== null)) {
                if (p.fileres.every(f => filera(f.map(i => vs[i])).estat === 'be')) sols.push(vs);
                return;
            }
            // La filera amb algun cercle buit i amb més valors sabuts
            let millor = null;
            for (const f of p.fileres) {
                const buits = f.filter(i => vs[i] === null).length;
                if (!buits) continue;
                const sabuts = f.length - buits;
                if (!millor || sabuts > millor.sabuts) millor = { f, sabuts };
            }
            const f = millor.f;
            const k = f.findIndex(i => vs[i] !== null);
            if (k < 0) {
                // Cap valor sabut a la filera: es prova el primer
                for (let v = 1; v <= MAXIM && sols.length < fins; v++) {
                    const nou = vs.slice();
                    nou[f[0]] = v;
                    cerca(nou);
                }
                return;
            }
            // Un valor sabut: es prova cada diferència (el cercle del costat)
            const j = k + 1 < f.length ? k + 1 : k - 1;
            for (let d = 1 - MAXIM; d < MAXIM && sols.length < fins; d++) {
                const v = vs[f[k]] + d * (j - k);
                if (d === 0 || v < 1 || v > MAXIM) continue;
                const nou = vs.slice();
                nou[f[j]] = v;
                cerca(nou);
            }
        }

        cerca(inicials(p));
        return sols;
    }

    return { inicials, esFix, filera, comprova, resol };
})();
