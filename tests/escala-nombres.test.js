/**
 * ============================================================================
 * FITXER: tests/escala-nombres.test.js
 * ROL: Comprova les dades de «L'escala de nombres»:
 *   - que cada filera té almenys 3 cercles i que cada cercle és en alguna filera;
 *   - que cada problema té UNA sola solució (amb nombres fins a 200);
 *   - que aquesta solució és la del PDF de solucions (src/step_a.pdf), llegida
 *     per tools/extreu-escala.py a tests/escala-nombres-solucions.json.
 * ÚS: node tests/escala-nombres.test.js
 * ============================================================================
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const arrel = path.join(__dirname, '..');
const context = { window: {} };
vm.createContext(context);
for (const f of ['js/escala-nombres/problemes.js', 'js/escala-nombres/motor.js']) {
    vm.runInContext(fs.readFileSync(path.join(arrel, f), 'utf8'), context, { filename: f });
}
const { PROBLEMES_ESCALA: P, MotorEscala: M } = context.window;
const SOLUCIONS_PDF = JSON.parse(fs.readFileSync(path.join(__dirname, 'escala-nombres-solucions.json'), 'utf8'));

let errors = 0;
function falla(msg) {
    console.error('✗ ' + msg);
    errors++;
}

function revisa(nom, pr, pdf) {
    const enFilera = new Set(pr.fileres.flat());
    pr.nodes.forEach((n, i) => {
        if (!enFilera.has(i)) falla(`${nom}: el cercle ${i} no és a cap filera`);
    });
    pr.fileres.forEach(f => {
        if (f.length < 3) falla(`${nom}: una filera té ${f.length} cercles`);
    });
    const sols = M.resol(pr);
    if (sols.length !== 1) {
        falla(`${nom}: té ${sols.length} solucions`);
        return;
    }
    if (!M.comprova(pr, sols[0]).correcte) falla(`${nom}: comprova() no accepta la solució`);
    if (JSON.stringify(sols[0]) !== JSON.stringify(pdf)) {
        falla(`${nom}: la solució és ${sols[0]} i al PDF és ${pdf}`);
    }
}

revisa('exemple', P.exemple, SOLUCIONS_PDF.exemple);
if (P.llista.length !== 42) falla(`hi ha ${P.llista.length} problemes (n'esperava 42)`);
P.llista.forEach((pr, i) => {
    const pdf = SOLUCIONS_PDF[String(i + 1)];
    if (!pdf) falla(`problema ${i + 1}: no hi ha la solució del PDF`);
    else revisa(`problema ${i + 1}`, pr, pdf);
});
// Els motius dels errors, com a les instruccions
if (M.filera([3, 3, 3]).estat !== 'repetit') falla('filera() no veu els repetits');
if (M.filera([2, 4, 5]).motiu !== 'A la filera 2, 4, 5 no augmenten sempre igual (+2, +1).') falla('motiu del salt');

if (errors) {
    console.error(`\n${errors} errors`);
    process.exit(1);
}
console.log(`✓ L'escala de nombres: ${P.llista.length} problemes + l'exemple, solució única i igual a la del PDF`);
