/**
 * ============================================================================
 * FITXER: js/afegeix-zeros/motor.js
 * ROL: Lògica pura del puzzle (sense DOM): el valor de cada targeta amb els
 *      seus zeros, la suma, la comprovació i les solucions.
 * ARQUITECTURA: L'estat és una llista amb quants zeros té cada targeta
 *   (3 amb 2 zeros és 300). Una targeta no pot tenir més zeros que xifres
 *   té el total menys una (si no, ja seria més gran que el total).
 * DEPENDÈNCIES: Cap.
 * ============================================================================
 */
window.MotorZeros = (() => {
    const valor = (xifra, zeros) => xifra * 10 ** zeros;

    // Quants zeros pot tenir com a molt una targeta
    const maxZeros = p => String(p.total).length - 1;

    const valors = (p, zeros) => p.targetes.map((x, i) => valor(x, zeros[i]));

    /**
     * Comprova uns zeros. Retorna { correcte, suma, valors, calcul } amb el càlcul escrit:
     * «30 + 60 + 2 = 92».
     */
    function comprova(p, zeros) {
        const vs = valors(p, zeros);
        const suma = vs.reduce((a, b) => a + b, 0);
        return { correcte: suma === p.total, suma, valors: vs, calcul: `${vs.join(' + ')} = ${suma}` };
    }

    // Totes les solucions (llistes de zeros per targeta)
    function resol(p) {
        const sols = [];
        const max = maxZeros(p);
        const prova = (i, acc) => {
            if (i === p.targetes.length) {
                if (comprova(p, acc).correcte) sols.push(acc.slice());
                return;
            }
            for (let z = 0; z <= max; z++) prova(i + 1, [...acc, z]);
        };
        prova(0, []);
        return sols;
    }

    return { valor, maxZeros, valors, comprova, resol };
})();
