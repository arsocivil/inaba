/**
 * ============================================================================
 * FITXER: js/diposits-aigua/motor.js
 * ROL: Lògica pura del puzzle (sense DOM): fraccions exactes, l'aigua de cada
 *      cub segons el nivell de cada dipòsit, els totals de files i columnes,
 *      la comprovació i les solucions.
 * ARQUITECTURA: Un problema té `files` (una lletra per cub: el dipòsit; la fila
 *   0 és la de dalt) i els totals (fracció en text, o null). Cada dipòsit és un
 *   rectangle de cubs; el seu nivell h va de 0 a l'alçada del dipòsit (en cubs,
 *   1 cub = 1 litre). L'aigua d'un cub és min(1, max(0, h − pis)), on pis és
 *   quants cubs del dipòsit té a sota: l'aigua omple primer els de baix i fa el
 *   mateix nivell a tot el dipòsit.
 * DEPENDÈNCIES: Cap.
 * ============================================================================
 */
window.MotorDiposits = (() => {
    // ---- Fraccions exactes: [numerador, denominador] amb denominador > 0 i simplificades ----
    const mcd = (a, b) => (b === 0 ? Math.abs(a) : mcd(b, a % b));
    function F(n, d = 1) {
        if (d < 0) [n, d] = [-n, -d];
        const g = mcd(n, d) || 1;
        return [n / g, d / g];
    }
    const suma = (a, b) => F(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
    const resta = (a, b) => F(a[0] * b[1] - b[0] * a[1], a[1] * b[1]);
    const mult = (a, b) => F(a[0] * b[0], a[1] * b[1]);
    const div = (a, b) => F(a[0] * b[1], a[1] * b[0]);
    const igual = (a, b) => a[0] * b[1] === b[0] * a[1];
    const menor = (a, b) => a[0] * b[1] < b[0] * a[1];
    const ZERO = F(0);
    const U = F(1);
    function llegeix(t) {
        const [n, d] = String(t).split('/').map(Number);
        return F(n, d || 1);
    }
    // En text: «5/4», «2», «0»
    const text = a => (a[1] === 1 ? String(a[0]) : `${a[0]}/${a[1]}`);

    /**
     * Els dipòsits d'un problema: { lletra, f0, f1, c0, c1, alt, amp } (rectangles de cubs).
     */
    function diposits(p) {
        const per = {};
        p.files.forEach((fila, f) =>
            [...fila].forEach((l, c) => {
                const d = (per[l] = per[l] || { lletra: l, f0: f, f1: f, c0: c, c1: c });
                d.f0 = Math.min(d.f0, f);
                d.f1 = Math.max(d.f1, f);
                d.c0 = Math.min(d.c0, c);
                d.c1 = Math.max(d.c1, c);
            })
        );
        return Object.values(per)
            .sort((a, b) => (a.lletra < b.lletra ? -1 : 1))
            .map(d => ({ ...d, alt: d.f1 - d.f0 + 1, amp: d.c1 - d.c0 + 1 }));
    }

    // L'aigua del cub (f, c) del dipòsit d amb nivell h
    function aiguaCub(d, h, f) {
        const pis = F(d.f1 - f);
        const w = resta(h, pis);
        if (menor(w, ZERO)) return ZERO;
        if (menor(U, w)) return U;
        return w;
    }

    /**
     * Els totals que fan uns nivells (un per dipòsit, en l'ordre de diposits()):
     * { files: [fracció], columnes: [fracció], cubs: [[fracció]] }.
     */
    function totals(p, nivells) {
        const ds = diposits(p);
        const alt = p.files.length;
        const amp = p.files[0].length;
        const cubs = p.files.map(() => Array(amp).fill(ZERO));
        ds.forEach((d, k) => {
            for (let f = d.f0; f <= d.f1; f++)
                for (let c = d.c0; c <= d.c1; c++) cubs[f][c] = aiguaCub(d, nivells[k], f);
        });
        const files = cubs.map(fila => fila.reduce(suma, ZERO));
        const columnes = [];
        for (let c = 0; c < amp; c++) {
            let s = ZERO;
            for (let f = 0; f < alt; f++) s = suma(s, cubs[f][c]);
            columnes.push(s);
        }
        return { files, columnes, cubs };
    }

    /**
     * Comprova uns nivells. Retorna { correcte, files, columnes, errors: [{ tipus: 'fila' | 'columna', i,
     * demanat, fet }] } (només dels totals que dona el problema).
     */
    function comprova(p, nivells) {
        const t = totals(p, nivells);
        const errors = [];
        p.totalsFiles.forEach((v, i) => {
            if (v !== null && !igual(llegeix(v), t.files[i])) errors.push({ tipus: 'fila', i, demanat: llegeix(v), fet: t.files[i] }); // prettier-ignore
        });
        p.totalsColumnes.forEach((v, i) => {
            if (v !== null && !igual(llegeix(v), t.columnes[i])) errors.push({ tipus: 'columna', i, demanat: llegeix(v), fet: t.columnes[i] }); // prettier-ignore
        });
        return { correcte: errors.length === 0, files: t.files, columnes: t.columnes, errors };
    }

    // Resol un sistema lineal exacte (Gauss). Retorna la solució si és única, o null si és incompatible
    // o si li falten equacions.
    function gauss(eqs, n) {
        const m = eqs.map(e => e.slice());
        let r = 0;
        const pivots = [];
        for (let col = 0; col < n && r < m.length; col++) {
            const piv = m.findIndex((e, i) => i >= r && e[col][0] !== 0);
            if (piv < 0) continue;
            [m[r], m[piv]] = [m[piv], m[r]];
            const pv = m[r][col];
            m[r] = m[r].map(v => div(v, pv));
            m.forEach((e, i) => {
                if (i !== r && e[col][0] !== 0) {
                    const fct = e[col];
                    m[i] = e.map((v, j) => resta(v, mult(fct, m[r][j])));
                }
            });
            pivots.push(col);
            r++;
        }
        if (m.slice(r).some(e => e[n][0] !== 0) || pivots.length < n) return null;
        const x = Array(n);
        pivots.forEach((col, i) => (x[col] = m[i][n]));
        return x;
    }

    /**
     * Totes les solucions (llistes de nivells). Per a cada dipòsit es tria el pis k on és la superfície
     * (h = k + x, amb 0 ≤ x ≤ 1); llavors els totals són equacions lineals en les x. Les solucions d'un
     * pis són un polítop (equacions dins de la capsa [0, 1]ⁿ): se'n busquen els vèrtexs fixant algunes x a
     * 0 o a 1 fins que el sistema té solució única. Si en surt un sol vèrtex en total, la solució és única;
     * si en surten més, n'hi ha més d'una (o infinites).
     */
    function resol(p) {
        const ds = diposits(p);
        const n = ds.length;
        const alt = p.files.length;
        const amp = p.files[0].length;
        const sols = [];
        const vistes = new Set();
        const pisos = Array(n).fill(0);
        const prova = () => {
            const eqs = [];
            const afegeix = (cubsDe, total) => {
                const fila = Array(n).fill(ZERO);
                let fix = ZERO;
                cubsDe.forEach(([f, c]) => {
                    const k = ds.findIndex(d => f >= d.f0 && f <= d.f1 && c >= d.c0 && c <= d.c1);
                    const pis = ds[k].f1 - f;
                    if (pis < pisos[k]) fix = suma(fix, U);
                    else if (pis === pisos[k]) fila[k] = suma(fila[k], U);
                });
                eqs.push([...fila, resta(llegeix(total), fix)]);
            };
            p.totalsFiles.forEach((v, f) => {
                if (v !== null)
                    afegeix(
                        [...Array(amp).keys()].map(c => [f, c]),
                        v
                    );
            });
            p.totalsColumnes.forEach((v, c) => {
                if (v !== null)
                    afegeix(
                        [...Array(alt).keys()].map(f => [f, c]),
                        v
                    );
            });
            // Cada x: lliure, fixada a 0 o fixada a 1
            const fixa = Array(n).fill(-1);
            const vertex = k => {
                if (k < n) {
                    for (const v of [-1, 0, 1]) {
                        fixa[k] = v;
                        vertex(k + 1);
                    }
                    return;
                }
                const extra = [];
                fixa.forEach((v, i) => {
                    if (v >= 0) extra.push([...Array(n)].map((_, j) => (j === i ? U : ZERO)).concat([F(v)]));
                });
                const x = gauss([...eqs, ...extra], n);
                if (!x || x.some(v => menor(v, ZERO) || menor(U, v))) return;
                const h = x.map((v, i) => suma(F(pisos[i]), v));
                const c = h.map(text).join(' ');
                if (!vistes.has(c)) {
                    vistes.add(c);
                    sols.push(h);
                }
            };
            vertex(0);
        };
        const tria = k => {
            if (k === n) return prova();
            for (let pis = 0; pis < ds[k].alt; pis++) {
                pisos[k] = pis;
                tria(k + 1);
            }
        };
        tria(0);
        return sols;
    }

    // En quantes parts es divideix un cub per ajustar el nivell d'un dipòsit: les marques dels cubs (quarts,
    // sisens…) o, si no n'hi ha, el doble del m.c.m. dels denominadors dels totals (les solucions hi encaixen)
    function pas(p) {
        if (p.divisions) return p.divisions;
        const mcm = (a, b) => (a * b) / mcd(a, b);
        return (
            2 *
            [...p.totalsFiles, ...p.totalsColumnes]
                .filter(v => v !== null)
                .map(v => llegeix(v)[1])
                .reduce(mcm, 1)
        );
    }

    return {
        pas,
        F,
        suma,
        resta,
        mult,
        div,
        igual,
        menor,
        llegeix,
        text,
        diposits,
        aiguaCub,
        totals,
        comprova,
        resol,
        gauss,
    };
})();
