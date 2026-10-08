/**
 * ============================================================================
 * FITXER: js/enllac-multiples/motor.js
 * ROL: Lògica pura del puzzle (sense DOM): comprovar un tauler i resoldre'l.
 * ARQUITECTURA: Un tauler és un vector amb un valor per lloc (o null si el
 *   lloc és buit), en el mateix ordre que «llocs» del problema.
 * DEPENDÈNCIES: Cap.
 * ============================================================================
 */
window.MotorEnllac = (() => {
    // b és múltiple de a?
    function esMultiple(a, b) {
        return b % a === 0;
    }

    // El tauler inicial: les targetes que ja hi són i null als llocs buits
    function taulerInicial(problema) {
        return problema.llocs.map(l => (l.length > 2 ? l[2] : null));
    }

    function esFix(problema, lloc) {
        return problema.llocs[lloc].length > 2;
    }

    // Les targetes que l'alumne pot moure (totes menys les que ja són al tauler)
    function targetesLliures(problema) {
        const fixes = new Set(taulerInicial(problema).filter(v => v !== null));
        return problema.targetes.filter(v => !fixes.has(v));
    }

    // Revisa cada fletxa amb les dues puntes plenes.
    // Retorna { complet, errors: [índexs de fletxa], correcte }
    function comprova(problema, tauler) {
        const complet = tauler.every(v => v !== null);
        const errors = [];
        problema.fletxes.forEach(([o, d], i) => {
            if (tauler[o] !== null && tauler[d] !== null && !esMultiple(tauler[o], tauler[d])) errors.push(i);
        });
        return { complet, errors, correcte: complet && errors.length === 0 };
    }

    // Totes les solucions (per força bruta: com a molt 4 targetes en 4 llocs)
    function resol(problema) {
        const tauler = taulerInicial(problema);
        const buits = tauler.map((v, i) => (v === null ? i : -1)).filter(i => i >= 0);
        const lliures = targetesLliures(problema);
        const solucions = [];
        const usades = new Set();
        (function prova(k) {
            if (k === buits.length) {
                if (comprova(problema, tauler).correcte) solucions.push(tauler.slice());
                return;
            }
            for (const v of lliures) {
                if (usades.has(v)) continue;
                usades.add(v);
                tauler[buits[k]] = v;
                prova(k + 1);
                tauler[buits[k]] = null;
                usades.delete(v);
            }
        })(0);
        return solucions;
    }

    return { esMultiple, taulerInicial, esFix, targetesLliures, comprova, resol };
})();
