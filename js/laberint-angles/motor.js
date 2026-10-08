/**
 * ============================================================================
 * FITXER: js/laberint-angles/motor.js
 * ROL: Lògica pura del puzzle (sense DOM): angles, comprovar un camí i
 *      resoldre un laberint.
 * ARQUITECTURA: Un camí és la llista d'índexs dels cercles per on passa, de S
 *   endavant. L'angle que fa el camí en un cercle és el que formen la línia
 *   per on arriba i la línia per on surt (180° = continua recte).
 *   La direcció de cada línia s'arrodoneix a múltiples de 15°: als laberints
 *   regulars ja és exacta, i als irregulars (31-36) treu els errors de dibuix.
 * DEPENDÈNCIES: Cap.
 * ============================================================================
 */
window.MotorLaberint = (() => {
    const PAS = 15;

    // Direcció (0…345°, en sentit antihorari) de la línia que va del cercle v al w
    function direccio(p, v, w) {
        const [x1, y1] = p.nodes[v];
        const [x2, y2] = p.nodes[w];
        const graus = (Math.atan2(y1 - y2, x2 - x1) * 180) / Math.PI;
        return (((Math.round(graus / PAS) * PAS) % 360) + 360) % 360;
    }

    // L'angle (0…180°) que fa el camí u → v → w al cercle v
    function angle(p, u, v, w) {
        const d = Math.abs(direccio(p, v, u) - direccio(p, v, w));
        return d > 180 ? 360 - d : d;
    }

    function etiqueta(p, v) {
        return p.nodes[v].length > 2 ? p.nodes[v][2] : null;
    }

    // L'angle que demana un cercle (o null si no en demana cap)
    function angleDemanat(p, v) {
        const e = etiqueta(p, v);
        return typeof e === 'number' ? e : null;
    }

    function sortida(p) {
        return p.nodes.findIndex(n => n[2] === 'S');
    }

    function arribada(p) {
        return p.nodes.findIndex(n => n[2] === 'G');
    }

    // Veïns de cada cercle (les línies tallades no compten)
    function veins(p) {
        const v = p.nodes.map(() => []);
        for (const [a, b] of p.arestes) {
            v[a].push(b);
            v[b].push(a);
        }
        return v;
    }

    // Revisa els angles dels cercles amb número per on passa el camí.
    // Retorna { complet, errors: [{ pos, cercle, demanat, fet }], correcte }
    function comprova(p, cami) {
        const complet = cami.length > 1 && cami[cami.length - 1] === arribada(p);
        const errors = [];
        for (let k = 1; k < cami.length - 1; k++) {
            const demanat = angleDemanat(p, cami[k]);
            if (demanat === null) continue;
            const fet = angle(p, cami[k - 1], cami[k], cami[k + 1]);
            if (fet !== demanat) errors.push({ pos: k, cercle: cami[k], demanat, fet });
        }
        return { complet, errors, correcte: complet && errors.length === 0 };
    }

    // Tots els camins correctes de S a G (cerca en profunditat amb poda)
    function resol(p) {
        const v = veins(p);
        const G = arribada(p);
        const cami = [sortida(p)];
        const dins = new Set(cami);
        const solucions = [];
        (function avança() {
            const fi = cami[cami.length - 1];
            if (fi === G) {
                solucions.push(cami.slice());
                return;
            }
            for (const w of v[fi]) {
                if (dins.has(w)) continue;
                if (cami.length >= 2) {
                    const demanat = angleDemanat(p, fi);
                    if (demanat !== null && angle(p, cami[cami.length - 2], fi, w) !== demanat) continue;
                }
                cami.push(w);
                dins.add(w);
                avança();
                dins.delete(w);
                cami.pop();
            }
        })();
        return solucions;
    }

    return { direccio, angle, etiqueta, angleDemanat, sortida, arribada, veins, comprova, resol };
})();
