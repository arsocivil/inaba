/**
 * ============================================================================
 * FITXER: tests/laberint-angles.test.js
 * ROL: Comprova les dades del «Laberint d'angles»:
 *   - que cada laberint està ben escrit (una S, una G, línies correctes…);
 *   - que té UNA sola solució;
 *   - que aquesta solució és la del PDF de solucions (src/kmaze_a.pdf),
 *     llegida per tools/extreu-laberint.py a tests/laberint-angles-solucions.json.
 * ÚS: node tests/laberint-angles.test.js
 * ============================================================================
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const arrel = path.join(__dirname, '..');
const context = { window: {} };
vm.createContext(context);
for (const f of ['js/laberint-angles/problemes.js', 'js/laberint-angles/motor.js']) {
    vm.runInContext(fs.readFileSync(path.join(arrel, f), 'utf8'), context, { filename: f });
}
const { PROBLEMES_LABERINT: P, MotorLaberint: M } = context.window;
const SOLUCIONS_PDF = JSON.parse(fs.readFileSync(path.join(__dirname, 'laberint-angles-solucions.json'), 'utf8'));

let errors = 0;
function falla(msg) {
    console.error('✗ ' + msg);
    errors++;
}

function revisa(nom, pr) {
    const n = pr.nodes.length;
    const S = pr.nodes.filter(x => x[2] === 'S').length;
    const G = pr.nodes.filter(x => x[2] === 'G').length;
    if (S !== 1 || G !== 1) falla(`${nom}: hi ha ${S} S i ${G} G`);
    const vistes = new Set();
    for (const [a, b] of [...pr.arestes, ...pr.tallades]) {
        if (!(a >= 0 && a < n && b >= 0 && b < n && a !== b)) falla(`${nom}: línia [${a}, ${b}] incorrecta`);
        const k = Math.min(a, b) + '-' + Math.max(a, b);
        if (vistes.has(k)) falla(`${nom}: línia [${a}, ${b}] repetida`);
        vistes.add(k);
    }
    for (const x of pr.nodes) {
        if (typeof x[2] === 'number' && (x[2] <= 0 || x[2] > 180 || x[2] % 15 !== 0)) falla(`${nom}: angle ${x[2]}`);
    }
    const sols = M.resol(pr);
    if (sols.length !== 1) falla(`${nom}: té ${sols.length} solucions`);
    return sols[0];
}

const ex = revisa('exemple', P.exemple);
// La solució de l'exemple és la del PDF (pàgina 1): S, a baix, 90, 60, 120, a dalt, G
if (ex && ex.join() !== '6,7,4,3,0,1,2') falla(`exemple: surt [${ex}]`);
if (P.llista.length !== 38) falla(`hi ha ${P.llista.length} problemes (n'esperava 38)`);
P.llista.forEach((pr, i) => {
    const sol = revisa(`problema ${i + 1}`, pr);
    const pdf = SOLUCIONS_PDF[String(i + 1)];
    if (sol && pdf && sol.join() !== pdf.join()) falla(`problema ${i + 1}: surt [${sol}] i el PDF diu [${pdf}]`);
    if (sol && !M.comprova(pr, sol).correcte) falla(`problema ${i + 1}: comprova() no accepta la solució`);
});

if (errors) {
    console.error(`\n${errors} errors`);
    process.exit(1);
}
console.log(`✓ Els ${P.llista.length} laberints i l'exemple tenen una sola solució, i coincideix amb la del PDF.`);
