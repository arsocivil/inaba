/**
 * ============================================================================
 * FITXER: js/busca-la-figura/motor.js
 * ROL: Lògica pura del puzzle (sense DOM): què és la figura que fan uns
 *      punts de la quadrícula, si és la que es demana, per què no, i les
 *      solucions.
 * ARQUITECTURA: Un punt és [columna, fila]. Tot es calcula exacte amb enters:
 *   longituds al quadrat, productes escalars (angle recte = 0) i vectorials
 *   (paral·lels o alineats = 0). Les definicions són les del PDF, que són
 *   inclusives: un quadrat també és un rectangle, un rombe, un paral·lelogram
 *   i un trapezi (té almenys un parell de costats paral·lels), i un triangle
 *   rectangle isòsceles també és rectangle i isòsceles.
 * DEPENDÈNCIES: Cap.
 * ============================================================================
 */
window.MotorFigura = (() => {
    const NOMS = {
        'quadrat': 'un quadrat',
        'rectangle': 'un rectangle',
        'rombe': 'un rombe',
        'paral·lelogram': 'un paral·lelogram',
        'trapezi': 'un trapezi',
        'isosceles': 'un triangle isòsceles',
        'rectangle-triangle': 'un triangle rectangle',
        'rectangle-isosceles': 'un triangle rectangle isòsceles',
    };

    const vertexs = figura => (['isosceles', 'rectangle-triangle', 'rectangle-isosceles'].includes(figura) ? 3 : 4);

    const resta = (a, b) => [a[0] - b[0], a[1] - b[1]];
    const vect = (u, v) => u[0] * v[1] - u[1] * v[0];
    const esc = (u, v) => u[0] * v[0] + u[1] * v[1];
    const d2 = (a, b) => esc(resta(a, b), resta(a, b));

    /**
     * Què fan uns punts (3 o 4). Retorna:
     *   { tipus: 'alineats' } si n'hi ha tres en línia;
     *   { tipus: 'concau' } si un punt queda a dins del triangle dels altres tres (no fan un quadrilàter convex);
     *   { tipus: 'triangle' | 'quadrilater', ordre, costats, rectes, iguals, paralleles }:
     *     ordre: els punts en l'ordre de la vora (el polígon);
     *     costats: [i, j] (índexs d'«ordre») de cada costat; llargs: la longitud al quadrat de cada costat;
     *     rectes: els vèrtexs (índexs d'«ordre») amb angle recte;
     *     iguals: grups de costats iguals (índexs de «costats», grups de 2 o més);
     *     paralleles: parells de costats paral·lels (només als quadrilàters).
     */
    function analitza(punts) {
        const n = punts.length;
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                for (let k = j + 1; k < n; k++) {
                    if (vect(resta(punts[j], punts[i]), resta(punts[k], punts[i])) === 0) return { tipus: 'alineats' };
                }
            }
        }
        let ordre = punts.slice();
        if (n === 4) {
            // L'ordre de la vora: per angle al voltant del centre. Si un gir canvia de signe, no és convex.
            const cx = punts.reduce((s, p) => s + p[0], 0) / 4;
            const cy = punts.reduce((s, p) => s + p[1], 0) / 4;
            ordre.sort((a, b) => Math.atan2(a[1] - cy, a[0] - cx) - Math.atan2(b[1] - cy, b[0] - cx));
            const girs = ordre.map((p, i) =>
                Math.sign(vect(resta(ordre[(i + 1) % 4], p), resta(ordre[(i + 2) % 4], p)))
            );
            if (!girs.every(g => g === girs[0])) return { tipus: 'concau' };
        }
        const costats = ordre.map((p, i) => [i, (i + 1) % n]);
        const llargs = costats.map(([i, j]) => d2(ordre[i], ordre[j]));
        const rectes = ordre
            .map((p, i) => i)
            .filter(i => esc(resta(ordre[(i + 1) % n], ordre[i]), resta(ordre[(i + n - 1) % n], ordre[i])) === 0);
        const grups = {};
        llargs.forEach((l, k) => (grups[l] = grups[l] || []).push(k));
        const iguals = Object.values(grups).filter(g => g.length >= 2);
        const paralleles = [];
        if (n === 4) {
            for (const [a, b] of [
                [0, 2],
                [1, 3],
            ]) {
                // prettier-ignore
                const [i, j] = costats[a];
                const [k, l] = costats[b];
                if (vect(resta(ordre[j], ordre[i]), resta(ordre[l], ordre[k])) === 0) paralleles.push([a, b]);
            }
        }
        return { tipus: n === 3 ? 'triangle' : 'quadrilater', ordre, costats, llargs, rectes, iguals, paralleles };
    }

    // Propietats que fan servir les definicions
    function propietats(a) {
        const totsIguals = a.iguals.some(g => g.length === a.costats.length);
        return {
            dosIguals: a.iguals.some(g => g.length >= 2),
            totsIguals,
            unRecte: a.rectes.length >= 1,
            totsRectes: a.rectes.length === 4,
            paralleles: a.paralleles.length,
        };
    }

    // La figura més concreta que fan (per dir «Has fet un rombe»)
    function nom(a) {
        if (a.tipus === 'alineats' || a.tipus === 'concau') return null;
        const p = propietats(a);
        if (a.tipus === 'triangle') {
            if (p.unRecte && p.dosIguals) return 'un triangle rectangle isòsceles';
            if (p.unRecte) return 'un triangle rectangle';
            if (p.dosIguals) return 'un triangle isòsceles';
            return 'un triangle sense costats iguals ni angles rectes';
        }
        if (p.totsRectes && p.totsIguals) return 'un quadrat';
        if (p.totsRectes) return 'un rectangle';
        if (p.totsIguals) return 'un rombe';
        if (p.paralleles === 2) return 'un paral·lelogram';
        if (p.paralleles === 1) return 'un trapezi';
        return 'un quadrilàter sense costats paral·lels';
    }

    /**
     * Comprova si uns punts fan la figura demanada. Retorna { correcte, a (analitza), nom, motiu }:
     * motiu és la propietat que falta (o per què no és cap polígon).
     */
    function comprova(figura, punts) {
        const a = analitza(punts);
        if (a.tipus === 'alineats') {
            return { correcte: false, a, nom: null, motiu: 'Hi ha tres punts alineats: no fan cap figura.' };
        }
        if (a.tipus === 'concau') {
            return {
                correcte: false,
                a,
                nom: null,
                motiu: "Un punt queda a dins del triangle que fan els altres tres: no pot ser cap d'aquestes figures.",
            };
        }
        const p = propietats(a);
        const falta = {
            'quadrat': !p.totsIguals
                ? 'Els quatre costats no són iguals.'
                : !p.totsRectes
                  ? 'Els angles no són rectes.'
                  : '',
            'rectangle': !p.totsRectes ? 'Els quatre angles no són rectes.' : '',
            'rombe': !p.totsIguals ? 'Els quatre costats no són iguals.' : '',
            'paral·lelogram': p.paralleles < 2 ? (p.paralleles === 1 ? 'Només té un parell de costats paral·lels.' : 'No té costats paral·lels.') : '', // prettier-ignore
            'trapezi': p.paralleles < 1 ? 'No té cap parell de costats paral·lels.' : '',
            'isosceles': !p.dosIguals ? 'No té dos costats iguals.' : '',
            'rectangle-triangle': !p.unRecte ? 'No té cap angle recte.' : '',
            'rectangle-isosceles': !p.unRecte
                ? 'No té cap angle recte.'
                : !p.dosIguals
                  ? 'No té dos costats iguals.'
                  : '',
        }[figura];
        return { correcte: falta === '', a, nom: nom(a), motiu: falta };
    }

    /**
     * Les marques que expliquen la figura demanada (només les propietats que fa servir la seva definició i
     * que té): { rectes: [vèrtexs], iguals: [[costats]], paralleles: [[costat, costat]] }.
     */
    function marques(figura, a) {
        if (a.tipus !== 'triangle' && a.tipus !== 'quadrilater') return { rectes: [], iguals: [], paralleles: [] };
        const angles = ['quadrat', 'rectangle', 'rectangle-triangle', 'rectangle-isosceles'].includes(figura);
        const costats = ['quadrat', 'rombe', 'isosceles', 'rectangle-isosceles'].includes(figura);
        const paral = ['paral·lelogram', 'trapezi'].includes(figura);
        let iguals = [];
        if (costats) {
            const tots = a.iguals.find(g => g.length === a.costats.length);
            iguals = tots ? [tots] : a.iguals;
        }
        return { rectes: angles ? a.rectes : [], iguals, paralleles: paral ? a.paralleles : [] };
    }

    // Totes les solucions: les combinacions de punts (índexs en ordre creixent) que fan la figura
    function resol(p) {
        const k = vertexs(p.figura);
        const sols = [];
        const tria = (des, acc) => {
            if (acc.length === k) {
                if (
                    comprova(
                        p.figura,
                        acc.map(i => p.punts[i])
                    ).correcte
                )
                    sols.push(acc.slice());
                return;
            }
            for (let i = des; i < p.punts.length; i++) tria(i + 1, [...acc, i]);
        };
        tria(0, []);
        return sols;
    }

    return { NOMS, vertexs, analitza, comprova, marques, resol };
})();
