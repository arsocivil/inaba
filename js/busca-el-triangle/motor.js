/**
 * ============================================================================
 * FITXER: js/busca-el-triangle/motor.js
 * ROL: Lògica pura del puzzle (sense DOM): l'àrea d'un triangle de punts de
 *      la quadrícula, com es calcula (per explicar-la) i les solucions.
 * ARQUITECTURA: Un punt és [columna, fila] (la fila 0 és la de dalt). Una tria
 *   és una llista d'índexs de problema.punts. Les àrees es calculen exactes
 *   amb enters: el doble de l'àrea és |producte vectorial|.
 * DEPENDÈNCIES: Cap.
 * ============================================================================
 */
window.MotorTriangle = (() => {
    // El doble de l'àrea del triangle abc (un enter)
    function dobleArea(a, b, c) {
        return Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1]));
    }

    // Un nombre amb coma decimal (1,5)
    function text(x) {
        return String(x).replace('.', ',');
    }

    /**
     * Com es calcula l'àrea del triangle abc, com a les instruccions del PDF:
     *   - si un costat és horitzontal o vertical: { tipus: 'base', base, altura, costat: [i, j], area }
     *     (costat: els índexs, dins de [a, b, c], dels extrems de la base);
     *   - si no: { tipus: 'caixa', caixa: { x0, y0, x1, y1 }, peces: [{ punts, area }], area }:
     *     l'àrea del rectangle que l'envolta menys les peces del voltant (triangles rectangles i,
     *     de vegades, un rectangle).
     *   - si els tres punts estan alineats: { tipus: 'alineats', area: 0 }.
     */
    function desglossa(a, b, c) {
        const v = [a, b, c];
        const area = dobleArea(a, b, c) / 2;
        if (area === 0) return { tipus: 'alineats', area: 0 };
        for (let i = 0; i < 3; i++) {
            const p = v[i];
            const q = v[(i + 1) % 3];
            const r = v[(i + 2) % 3];
            if (p[1] === q[1]) return { tipus: 'base', base: Math.abs(p[0] - q[0]), altura: Math.abs(r[1] - p[1]), costat: [i, (i + 1) % 3], area }; // prettier-ignore
            if (p[0] === q[0]) return { tipus: 'base', base: Math.abs(p[1] - q[1]), altura: Math.abs(r[0] - p[0]), costat: [i, (i + 1) % 3], area }; // prettier-ignore
        }
        const xs = v.map(p => p[0]);
        const ys = v.map(p => p[1]);
        const caixa = {
            x0: Math.min(...xs),
            y0: Math.min(...ys),
            x1: Math.max(...xs),
            y1: Math.max(...ys),
        };
        // Per a cada costat, el triangle rectangle de fora que el té d'hipotenusa: el vèrtex de l'angle
        // recte és el dels dos possibles que queda a l'altre costat del tercer vèrtex
        const peces = [];
        for (let i = 0; i < 3; i++) {
            const p = v[i];
            const q = v[(i + 1) % 3];
            const r = v[(i + 2) % 3];
            const costat = s => Math.sign((q[0] - p[0]) * (s[1] - p[1]) - (s[0] - p[0]) * (q[1] - p[1]));
            const k = [[p[0], q[1]], [q[0], p[1]]].find(s => costat(s) !== costat(r)); // prettier-ignore
            peces.push({ punts: [p, k, q], area: dobleArea(p, k, q) / 2 });
        }
        // El que queda (quan dos vèrtexs són cantonades oposades de la caixa) és un rectangle: el del
        // tercer vèrtex fins a la cantonada de la caixa que és del seu costat de la diagonal
        const sobra = (caixa.x1 - caixa.x0) * (caixa.y1 - caixa.y0) - area - peces.reduce((s, p) => s + p.area, 0);
        if (sobra > 0) {
            const cantonades = [[caixa.x0, caixa.y0], [caixa.x1, caixa.y0], [caixa.x1, caixa.y1], [caixa.x0, caixa.y1]]; // prettier-ignore
            const esVertex = k => v.some(p => p[0] === k[0] && p[1] === k[1]);
            const esCantonada = p => cantonades.some(k => p[0] === k[0] && p[1] === k[1]);
            const [p, q] = v.filter(esCantonada); // les dues cantonades oposades
            const m = v.find(r => r !== p && r !== q);
            const costat = s => Math.sign((q[0] - p[0]) * (s[1] - p[1]) - (s[0] - p[0]) * (q[1] - p[1]));
            const [kx, ky] = cantonades.find(k => !esVertex(k) && costat(k) === costat(m));
            const rect = { punts: [m, [kx, m[1]], [kx, ky], [m[0], ky]], area: Math.abs(kx - m[0]) * Math.abs(ky - m[1]) }; // prettier-ignore
            if (rect.area !== sobra) throw new Error('desglossa: les peces no omplen la caixa');
            peces.push(rect);
        }
        return { tipus: 'caixa', caixa, peces, area };
    }

    // El càlcul en una frase: «2 × 3 : 2 = 3» o «3 × 3 − 1,5 − 1,5 − 2 = 4»
    function calcul(d) {
        if (d.tipus === 'base') return `${d.base} × ${d.altura} : 2 = ${text(d.area)}`;
        if (d.tipus === 'caixa') {
            const { x0, y0, x1, y1 } = d.caixa;
            return `${x1 - x0} × ${y1 - y0} − ${d.peces.map(p => text(p.area)).join(' − ')} = ${text(d.area)}`;
        }
        return '';
    }

    /**
     * Comprova una tria de tres punts. Retorna { correcte, area, d (desglossa), motiu }.
     */
    function comprova(p, tria) {
        const [a, b, c] = tria.map(i => p.punts[i]);
        const d = desglossa(a, b, c);
        if (d.tipus === 'alineats') {
            return {
                correcte: false,
                area: 0,
                d,
                motiu: 'Els tres punts estan alineats: no fan cap triangle.',
            };
        }
        const correcte = d.area === p.area;
        const motiu = correcte ? '' : `Aquest triangle fa ${text(d.area)} d'àrea, i no ${text(p.area)}.`;
        return { correcte, area: d.area, d, motiu };
    }

    // Totes les solucions: les ternes de punts (índexs en ordre creixent) amb l'àrea demanada
    function resol(p) {
        const sols = [];
        const n = p.punts.length;
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                for (let k = j + 1; k < n; k++) {
                    if (dobleArea(p.punts[i], p.punts[j], p.punts[k]) === 2 * p.area) sols.push([i, j, k]);
                }
            }
        }
        return sols;
    }

    return { dobleArea, desglossa, calcul, comprova, resol, text };
})();
