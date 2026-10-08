/**
 * ============================================================================
 * FITXER: tests/enllac-multiples.test.js
 * ROL: Comprova les dades de l'«Enllaç de múltiples»:
 *   - que cada problema està ben escrit (índexs, targetes repetides…);
 *   - que té UNA sola solució;
 *   - que aquesta solució és la del PDF de solucions (src/blink_a.pdf).
 * ÚS: node tests/enllac-multiples.test.js
 * ============================================================================
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const arrel = path.join(__dirname, '..');
const context = { window: {} };
vm.createContext(context);
for (const f of ['js/enllac-multiples/problemes.js', 'js/enllac-multiples/motor.js']) {
    vm.runInContext(fs.readFileSync(path.join(arrel, f), 'utf8'), context, { filename: f });
}
const { PROBLEMES_ENLLAC: P, MotorEnllac: M } = context.window;

// Solucions del PDF, lloc per lloc (en l'ordre de «llocs»).
// El 13 és l'excepció: el PDF hi posa 24 dalt a la dreta, però hi va el 8
// (la targeta del 24 ja és a baix a la dreta, i 24 és múltiple de 8).
// prettier-ignore
const SOLUCIONS_PDF = [
    [2, 4], [3, 6], [9, 3], [8, 4], [10, 5], [7, 14],
    [2, 6, 3], [2, 4, 8], [6, 3, 9], [5, 20, 10], [42, 14, 7], [12, 6, 24],
    [6, 8, 12, 24], [3, 21, 7, 42], [5, 10, 15, 30], [3, 9, 27, 36], [63, 7, 8, 56], [8, 16, 40, 48],
    [5, 20, 8, 40], [3, 27, 12, 36], [8, 16, 32, 64], [9, 18, 36, 72], [6, 36, 8, 72], [7, 49, 14, 42],
    [19, 76], [23, 92], [85, 17], [87, 29], [51, 3], [13, 91],
    [7, 98], [13, 65], [94, 47], [75, 15], [90, 18], [29, 87],
    [6, 30, 10], [7, 21, 63], [60, 15, 45], [8, 32, 16], [54, 27, 9], [84, 12, 96],
];

let errors = 0;
function falla(msg) {
    console.error('✗ ' + msg);
    errors++;
}

function revisa(nom, pr) {
    const n = pr.llocs.length;
    if (new Set(pr.targetes).size !== pr.targetes.length) falla(`${nom}: targetes repetides`);
    const posicions = new Set(pr.llocs.map(l => l[0] + ',' + l[1]));
    if (posicions.size !== n) falla(`${nom}: dos llocs a la mateixa posició`);
    for (const l of pr.llocs) {
        if (l.length > 2 && !pr.targetes.includes(l[2])) falla(`${nom}: la targeta fixa ${l[2]} no és a «targetes»`);
    }
    for (const [o, d] of pr.fletxes) {
        if (!(o >= 0 && o < n && d >= 0 && d < n && o !== d)) falla(`${nom}: fletxa [${o}, ${d}] incorrecta`);
    }
    const buits = M.taulerInicial(pr).filter(v => v === null).length;
    if (M.targetesLliures(pr).length < buits) falla(`${nom}: no hi ha prou targetes`);
    const sols = M.resol(pr);
    if (sols.length !== 1) falla(`${nom}: té ${sols.length} solucions`);
    return sols[0];
}

revisa('exemple', P.exemple);
if (P.llista.length !== 42) falla(`hi ha ${P.llista.length} problemes (n'esperava 42)`);
P.llista.forEach((pr, i) => {
    const sol = revisa(`problema ${i + 1}`, pr);
    const pdf = SOLUCIONS_PDF[i];
    if (sol && pdf && sol.join() !== pdf.join()) falla(`problema ${i + 1}: surt [${sol}] i el PDF diu [${pdf}]`);
});

if (errors) {
    console.error(`\n${errors} errors`);
    process.exit(1);
}
console.log(`✓ Els ${P.llista.length} problemes i l'exemple tenen una sola solució, i coincideix amb la del PDF.`);
