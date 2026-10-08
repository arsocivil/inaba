/**
 * ============================================================================
 * FITXER: js/on-es-la-xifra/motor.js
 * ROL: Lògica pura del puzzle (sense DOM): llegir un problema, comprovar una
 *      suma escrita i buscar-ne les solucions.
 * ARQUITECTURA: analitza(problema) → un «problema analitzat» g:
 *   g.ns          [n1, n2, ns]: xifres del primer nombre, del segon i del resultat
 *   g.amp         nombre de columnes (les del resultat, que és el més llarg)
 *   g.col0[f]     columna de la primera xifra de la fila f (els nombres van
 *                 alineats per la dreta: col0 = amp − ns[f])
 *   g.pistesCol   [[xifres]] una llista per columna (les dels números de dalt)
 *   g.pistesFila  [[xifres]] una llista per fila (les dels números de la dreta)
 *   Les xifres que s'hi escriuen són una matriu v[f][k]: f = 0 primer nombre,
 *   1 segon, 2 resultat; k = posició dins del nombre (0 = la de més a l'esquerra);
 *   cada valor és una xifra 0–9 o null.
 * REGLES: la suma ha de ser correcta; un nombre no pot començar per 0 (ni ser
 *   només un 0); cada xifra d'una pista ha de ser en alguna casella de la
 *   columna (de les tres files) o de la fila a què apunta.
 * DEPENDÈNCIES: Cap.
 * ============================================================================
 */
window.MotorXifra = (() => {
    const NOM_FILA = ['primer nombre', 'segon nombre', 'resultat'];
    const NOM_FILA_DE = ['del primer nombre', 'del segon nombre', 'del resultat'];
    const NOM_COLUMNA = ['unitats', 'desenes', 'centenes', 'unitats de miler'];

    function analitza([ns, pistesCol, pistesFila]) {
        const amp = Math.max(...ns);
        if (pistesCol.length !== amp) throw new Error('pistes de columna: no hi ha una llista per columna');
        return { ns, amp, col0: ns.map(n => amp - n), pistesCol, pistesFila };
    }

    function buida(g) {
        return g.ns.map(n => new Array(n).fill(null));
    }

    // El nombre escrit a la fila f (null si encara hi ha caselles buides)
    function nombre(v, f) {
        return v[f].some(d => d === null) ? null : Number(v[f].join(''));
    }

    // Les xifres d'una columna c (de les files que hi tenen casella), de dalt a baix; null = buida
    function xifresColumna(g, v, c) {
        const out = [];
        for (let f = 0; f < 3; f++) if (c >= g.col0[f]) out.push(v[f][c - g.col0[f]]);
        return out;
    }

    // «3, 5, 2» a partir de les xifres d'una línia (les buides no hi surten)
    const llista = xs => xs.filter(d => d !== null).join(', ');

    function comprova(g, v) {
        const complet = v.every(fila => fila.every(d => d !== null));
        const r = { complet, correcte: false, zeros: [], suma: null, pistes: [], motius: [] };
        if (!complet) return r;

        // 1. Cap nombre no pot començar per 0 (ni ser només un 0)
        for (let f = 0; f < 3; f++) {
            if (v[f][0] !== 0) continue;
            const text = v[f].join('');
            const motiu =
                g.ns[f] === 1
                    ? `El ${NOM_FILA[f]} no pot ser només un 0.`
                    : `El ${NOM_FILA[f]} no pot començar per 0 (${text}).`;
            r.zeros.push({ f, motiu });
            r.motius.push(motiu);
        }

        // 2. La suma ha de ser correcta
        const [a, b, s] = [0, 1, 2].map(f => nombre(v, f));
        const ok = a + b === s;
        r.suma = {
            ok,
            a,
            b,
            s,
            motiu: ok ? `${a} + ${b} = ${s}` : `${a} + ${b} = ${a + b}, i no ${s}.`,
        };
        if (!ok) r.motius.push(r.suma.motiu);

        // 3. Cada xifra de cada pista ha de ser a la seva línia
        g.pistesFila.forEach((xs, f) =>
            xs.forEach(x => {
                const dins = v[f].includes(x);
                const motiu = dins
                    ? `El ${x} és a la fila ${NOM_FILA_DE[f]} (${v[f].join('')}).`
                    : `El ${x} no és enlloc de la fila ${NOM_FILA_DE[f]} (${v[f].join('')}).`;
                r.pistes.push({ dir: 'fila', index: f, xifra: x, ok: dins, motiu });
                if (!dins) r.motius.push(motiu);
            })
        );
        g.pistesCol.forEach((xs, c) =>
            xs.forEach(x => {
                const xifres = xifresColumna(g, v, c);
                const dins = xifres.includes(x);
                const nom = NOM_COLUMNA[g.amp - 1 - c];
                const motiu = dins
                    ? `El ${x} és a la columna de les ${nom} (${llista(xifres)}).`
                    : `El ${x} no és enlloc de la columna de les ${nom} (${llista(xifres)}).`;
                r.pistes.push({ dir: 'columna', index: c, xifra: x, ok: dins, motiu });
                if (!dins) r.motius.push(motiu);
            })
        );

        r.correcte = r.motius.length === 0;
        return r;
    }

    // Les pistes que ja es compleixen amb el que hi ha escrit ara (una ajuda local, no jutja res):
    // [{ dir, index, xifra }]
    function pistesFetes(g, v) {
        const out = [];
        g.pistesFila.forEach((xs, f) =>
            xs.forEach(x => v[f].includes(x) && out.push({ dir: 'fila', index: f, xifra: x }))
        );
        g.pistesCol.forEach((xs, c) =>
            xs.forEach(x => xifresColumna(g, v, c).includes(x) && out.push({ dir: 'columna', index: c, xifra: x }))
        );
        return out;
    }

    // Totes les solucions (fins a `max`): matrius v. Prova tots els parells de nombres de les mides donades.
    function resol(g, max = 2) {
        const [n1, n2, ns] = g.ns;
        const rang = n => [n === 1 ? 1 : 10 ** (n - 1), 10 ** n - 1];
        const [a0, a1] = rang(n1);
        const [b0, b1] = rang(n2);
        const sols = [];
        const xifres = (x, n) => String(x).padStart(n, '0').split('').map(Number);
        for (let a = a0; a <= a1; a++) {
            for (let b = b0; b <= b1; b++) {
                const s = a + b;
                if (String(s).length !== ns) continue;
                const v = [xifres(a, n1), xifres(b, n2), xifres(s, ns)];
                if (comprova(g, v).correcte) {
                    sols.push(v);
                    if (sols.length >= max) return sols;
                }
            }
        }
        return sols;
    }

    return { analitza, buida, nombre, comprova, pistesFetes, resol, NOM_FILA };
})();
