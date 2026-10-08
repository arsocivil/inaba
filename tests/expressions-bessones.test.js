/**
 * ============================================================================
 * FITXER: tests/expressions-bessones.test.js
 * ROL: Comprova les dades de les «Expressions bessones»:
 *   - que cada problema té solució, i que totes les solucions són la mateixa
 *     expressió (llevat de parèntesis que no canvien res, com (a × b) + c);
 *   - que la solució del PDF (src/gemini_a.pdf) és una de les bones.
 *   El motor també es prova amb uns quants càlculs pas a pas.
 * ÚS: node tests/expressions-bessones.test.js
 * ============================================================================
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const arrel = path.join(__dirname, '..');
const context = { window: {} };
vm.createContext(context);
for (const f of ['js/expressions-bessones/problemes.js', 'js/expressions-bessones/motor.js']) {
    vm.runInContext(fs.readFileSync(path.join(arrel, f), 'utf8'), context, { filename: f });
}
const { PROBLEMES_BESSONES: P, MotorBessones: M } = context.window;

// Solucions del PDF: [o1, o2, parèntesis] (0 cap, 1 als dos primers números, 2 als dos últims).
// Dues errades del PDF:
//  - (17): hi posa 3 ÷ 3 + 2 = 3 i 4 ÷ 2 + 1 = 4, però 4 ÷ 2 + 1 fa 3. Amb l'enunciat del
//    PDF, la solució és 3 × (3 − 2) = 3 i 4 × (2 − 1) = 4 (o amb ÷ en lloc de ×).
//  - (41): a la segona targeta hi falten els parèntesis: 12 × (8 − 6) = 24, no 12 × 8 − 6.
// prettier-ignore
const SOLUCIONS_PDF = [
    ['+', '+', 0], ['−', '−', 0], ['−', '+', 0], ['+', '−', 0], ['−', '+', 0], ['+', '−', 0],
    ['×', '+', 0], ['×', '−', 0], ['×', '×', 0], ['+', '×', 0], ['−', '×', 0], ['+', '×', 0],
    ['×', '÷', 0], ['÷', '−', 0], ['×', '−', 0], ['+', '÷', 0], ['×', '−', 2], ['+', '×', 0],
    ['×', '−', 2], ['−', '÷', 0], ['+', '÷', 1], ['÷', '÷', 0], ['÷', '−', 2], ['−', '×', 1],
    ['×', '+', 2], ['−', '÷', 1], ['÷', '×', 0], ['÷', '+', 2], ['×', '−', 0], ['+', '×', 1],
    ['−', '×', 1], ['÷', '×', 0], ['×', '+', 2], ['+', '÷', 1], ['×', '−', 2], ['+', '×', 0],
    ['+', '×', 0], ['+', '×', 1], ['+', '÷', 1], ['÷', '+', 0], ['×', '−', 2], ['÷', '×', 0],
];
// Problemes amb més d'una solució de debò (sabut i acceptat: el joc les accepta totes)
const AMB_DUES_SOLUCIONS = [17];

let errors = 0;
function falla(msg) {
    console.error('✗ ' + msg);
    errors++;
}
function igual(real, esperat, nom) {
    if (JSON.stringify(real) !== JSON.stringify(esperat))
        falla(`${nom}: surt ${JSON.stringify(real)}, esperava ${JSON.stringify(esperat)}`);
}

// ---- El motor, pas a pas ----
igual(M.avalua([1, 1, 2], ['+', '×'], 0).passos, ['1 + 1 × 2', '1 + 2', '3'], 'prioritat');
igual(M.avalua([1, 1, 2], ['+', '×'], 1).passos, ['(1 + 1) × 2', '2 × 2', '4'], 'parèntesis');
igual(M.avalua([18, 12, 2], ['÷', '×'], 0).passos, ['18 ÷ 12 × 2', '(3/2) × 2', '3'], 'fraccions');
igual(M.avalua([2, 7, 5], ['−', '+'], 0).passos, ['2 − 7 + 5', '(−5) + 5', '0'], 'negatius');
igual(M.avalua([3, 3, 3], ['÷', '−'], 2).entreZero, true, 'entre zero');

// ---- Els problemes ----
// Dues tries són «la mateixa expressió» si donen el mateix per a qualsevol a, b, c
const PROVES = [
    [2, 3, 5],
    [7, 2, 9],
    [11, 4, 3],
    [5, 8, 2],
    [13, 6, 7],
];
const firma = s =>
    PROVES.map(t => {
        const v = M.avalua(t, s.ops, s.par).valor;
        return v ? M.escriuFrac(v) : '÷0';
    }).join(' ');

function revisa(nom, pr) {
    if (pr.length !== 2 || pr.some(t => t.length !== 4 || !t.every(Number.isInteger))) falla(`${nom}: format`);
    const sols = M.resol(pr);
    if (!sols.length) falla(`${nom}: no té solució`);
    return { sols, diferents: new Set(sols.map(firma)).size };
}

const ex = revisa('exemple', P.exemple);
if (!ex.sols.some(s => s.ops.join() === '+,×' && s.par === 1)) falla('exemple: (1 + 1) × 2 no és solució');
if (P.llista.length !== 42) falla(`hi ha ${P.llista.length} problemes (n'esperava 42)`);
P.llista.forEach((pr, i) => {
    const n = i + 1;
    const { sols, diferents } = revisa(`problema ${n}`, pr);
    if (diferents > 1 && !AMB_DUES_SOLUCIONS.includes(n)) falla(`problema ${n}: té ${diferents} solucions diferents`);
    const [o1, o2, par] = SOLUCIONS_PDF[i];
    if (!sols.some(s => s.ops[0] === o1 && s.ops[1] === o2 && s.par === par)) {
        falla(`problema ${n}: la solució del PDF (${M.escriu(['a', 'b', 'c'], [o1, o2], par)}) no hi és`);
    }
});

if (errors) {
    console.error(`\n${errors} errors`);
    process.exit(1);
}
console.log(
    `✓ Els ${P.llista.length} problemes tenen solució (una de sola, menys el 17, que en té dues), i la del PDF hi és.`
);
