/**
 * ============================================================================
 * FITXER: js/expressions-bessones/motor.js
 * ROL: Lògica pura del puzzle (sense DOM): calcular a ○ b ○ c pas a pas,
 *      comprovar les dues targetes i buscar les solucions.
 * ARQUITECTURA: Una tria de signes és { ops: [o1, o2], par }:
 *   - o1 va entre a i b, i o2 entre b i c ('+', '−', '×', '÷' o null si encara no hi és);
 *   - par: 0 sense parèntesis, 1 = (a o1 b) o2 c, 2 = a o1 (b o2 c).
 *   Els càlculs es fan amb fraccions exactes (18 ÷ 12 × 2 = 3/2 × 2 = 3).
 * DEPENDÈNCIES: Cap.
 * ============================================================================
 */
window.MotorBessones = (() => {
    const SIGNES = ['+', '−', '×', '÷'];
    const alta = s => s === '×' || s === '÷';

    // ---- Fraccions { n, d } amb d > 0 i simplificades ----
    function mcd(a, b) {
        while (b) [a, b] = [b, a % b];
        return a;
    }
    function frac(n, d = 1) {
        if (d < 0) [n, d] = [-n, -d];
        const g = mcd(Math.abs(n), d) || 1;
        return { n: n / g, d: d / g };
    }
    // x ○ y; null si es divideix entre 0
    function opera(x, signe, y) {
        if (signe === '+') return frac(x.n * y.d + y.n * x.d, x.d * y.d);
        if (signe === '−') return frac(x.n * y.d - y.n * x.d, x.d * y.d);
        if (signe === '×') return frac(x.n * y.n, x.d * y.d);
        if (y.n === 0) return null;
        return frac(x.n * y.d, x.d * y.n);
    }
    // 3 → «3», −5 → «−5», 3/2 → «3/2»
    function escriuFrac(f) {
        const s = (f.n < 0 ? '−' : '') + Math.abs(f.n);
        return f.d === 1 ? s : `${s}/${f.d}`;
    }
    // Un resultat a mig càlcul: entre parèntesis si és negatiu o fracció (perquè no es confongui)
    function escriuMig(f) {
        return f.n < 0 || f.d !== 1 ? `(${escriuFrac(f)})` : escriuFrac(f);
    }

    // L'operació que es fa primer: 0 (la de l'esquerra) o 1 (la de la dreta)
    function primera(ops, par) {
        if (par === 1) return 0;
        if (par === 2) return 1;
        return alta(ops[1]) && !alta(ops[0]) ? 1 : 0;
    }

    // L'expressió en text: «(1 + 1) × 2»
    function escriu([a, b, c], ops, par) {
        const [o1, o2] = ops.map(o => o || '○');
        if (par === 1) return `(${a} ${o1} ${b}) ${o2} ${c}`;
        if (par === 2) return `${a} ${o1} (${b} ${o2} ${c})`;
        return `${a} ${o1} ${b} ${o2} ${c}`;
    }

    /**
     * Calcula a ○ b ○ c. Retorna { valor, passos, entreZero }:
     *   valor: la fracció del resultat (null si es divideix entre 0);
     *   passos: ['(1 + 1) × 2', '2 × 2', '4'] (el càlcul pas a pas).
     */
    function avalua(nums, ops, par) {
        const [a, b, c] = nums.map(n => frac(n));
        const passos = [escriu(nums, ops, par)];
        let valor;
        if (primera(ops, par) === 0) {
            const x = opera(a, ops[0], b);
            if (!x) return { valor: null, passos, entreZero: true };
            passos.push(`${escriuMig(x)} ${ops[1]} ${nums[2]}`);
            valor = opera(x, ops[1], c);
        } else {
            const y = opera(b, ops[1], c);
            if (!y) return { valor: null, passos, entreZero: true };
            passos.push(`${nums[0]} ${ops[0]} ${escriuMig(y)}`);
            valor = opera(a, ops[0], y);
        }
        if (!valor) return { valor: null, passos, entreZero: true };
        passos.push(escriuFrac(valor));
        return { valor, passos, entreZero: false };
    }

    // Comprova totes dues targetes. Retorna { complet, targetes: [{ valor, passos, entreZero, correcte }], correcte }
    function comprova(problema, ops, par) {
        const complet = ops.every(Boolean);
        if (!complet) return { complet, targetes: [], correcte: false };
        const targetes = problema.map(([a, b, c, r]) => {
            const t = avalua([a, b, c], ops, par);
            return { ...t, correcte: !!t.valor && t.valor.d === 1 && t.valor.n === r };
        });
        return { complet, targetes, correcte: targetes.every(t => t.correcte) };
    }

    // Totes les tries de signes que fan correctes les dues targetes
    function resol(problema) {
        const sols = [];
        for (const o1 of SIGNES)
            for (const o2 of SIGNES)
                for (const par of [0, 1, 2])
                    if (comprova(problema, [o1, o2], par).correcte) sols.push({ ops: [o1, o2], par });
        return sols;
    }

    return { SIGNES, avalua, comprova, resol, escriu, escriuFrac };
})();
