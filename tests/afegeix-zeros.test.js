/**
 * ============================================================================
 * FITXER: tests/afegeix-zeros.test.js
 * ROL: Comprova les dades d'«Afegeix zeros»:
 *   - que les targetes tenen una sola xifra (de l'1 al 9);
 *   - que cada problema té UNA sola solució;
 *   - que aquesta solució és la del PDF de solucions (src/zero_a.pdf), llegida
 *     per tools/extreu-zeros.py a tests/afegeix-zeros-solucions.json.
 * ÚS: node tests/afegeix-zeros.test.js
 * ============================================================================
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const arrel = path.join(__dirname, '..');
const context = { window: {} };
vm.createContext(context);
for (const f of ['js/afegeix-zeros/problemes.js', 'js/afegeix-zeros/motor.js']) {
    vm.runInContext(fs.readFileSync(path.join(arrel, f), 'utf8'), context, { filename: f });
}
const { PROBLEMES_ZEROS: P, MotorZeros: M } = context.window;
const SOLUCIONS_PDF = JSON.parse(fs.readFileSync(path.join(__dirname, 'afegeix-zeros-solucions.json'), 'utf8'));

let errors = 0;
function falla(msg) {
    console.error('✗ ' + msg);
    errors++;
}

function revisa(nom, pr, pdf) {
    if (!pr.targetes.every(x => Number.isInteger(x) && x >= 1 && x <= 9)) falla(`${nom}: targeta que no és una xifra`);
    const sols = M.resol(pr);
    if (sols.length !== 1) {
        falla(`${nom}: té ${sols.length} solucions`);
        return;
    }
    if (JSON.stringify(sols[0]) !== JSON.stringify(pdf)) falla(`${nom}: la solució és ${sols[0]} i al PDF és ${pdf}`);
}

revisa('exemple', P.exemple, SOLUCIONS_PDF.exemple);
if (P.llista.length !== 49) falla(`hi ha ${P.llista.length} problemes (n'esperava 49)`);
P.llista.forEach((pr, i) => revisa(`problema ${i + 1}`, pr, SOLUCIONS_PDF[String(i + 1)]));
if (M.comprova(P.exemple, [1, 0, 2]).calcul !== '10 + 2 + 300 = 312') falla('calcul()');

if (errors) {
    console.error(`\n${errors} errors`);
    process.exit(1);
}
console.log(`✓ Afegeix zeros: ${P.llista.length} problemes + l'exemple, solució única i igual a la del PDF`);
