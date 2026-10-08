/**
 * ============================================================================
 * FITXER: tests/diposits-aigua.test.js
 * ROL: Comprova les dades de «Dipòsits d'aigua»:
 *   - que cada dipòsit és un rectangle de cubs;
 *   - que cada problema té UNA sola solució (els nivells de l'aigua), i que
 *     encaixa amb el pas del joc (les marques, o 1/(2 × m.c.m. dels denominadors dels totals));
 *   - que aquesta solució és la del PDF de solucions (src/mizu_a.pdf), llegida
 *     per tools/extreu-diposits.py a tests/diposits-aigua-solucions.json (als
 *     problemes 1-36, el dibuix arrodonit a les marques; als 37-42, les
 *     fraccions que el PDF hi escriu).
 * ÚS: node tests/diposits-aigua.test.js
 * ============================================================================
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const arrel = path.join(__dirname, '..');
const context = { window: {} };
vm.createContext(context);
for (const f of ['js/diposits-aigua/problemes.js', 'js/diposits-aigua/motor.js']) {
    vm.runInContext(fs.readFileSync(path.join(arrel, f), 'utf8'), context, { filename: f });
}
const { PROBLEMES_DIPOSITS: P, MotorDiposits: M } = context.window;
const SOLUCIONS_PDF = JSON.parse(fs.readFileSync(path.join(__dirname, 'diposits-aigua-solucions.json'), 'utf8'));

let errors = 0;
function falla(msg) {
    console.error('✗ ' + msg);
    errors++;
}

function revisa(nom, pr, pdf) {
    const ds = M.diposits(pr);
    ds.forEach(d => {
        for (let f = d.f0; f <= d.f1; f++) {
            for (let c = d.c0; c <= d.c1; c++) {
                if (pr.files[f][c] !== d.lletra) falla(`${nom}: el dipòsit ${d.lletra} no és un rectangle`);
            }
        }
    });
    const sols = M.resol(pr);
    if (sols.length !== 1) {
        falla(`${nom}: té ${sols.length} solucions`);
        return;
    }
    if (!M.comprova(pr, sols[0]).correcte) falla(`${nom}: comprova() no accepta la solució`);
    // El joc ajusta els nivells de 1/pas en 1/pas: la solució hi ha d'encaixar
    const pas = M.pas(pr);
    if (!sols[0].every(h => (h[0] * pas) % h[1] === 0)) falla(`${nom}: la solució no encaixa amb el pas 1/${pas}`);
    const txt = sols[0].map(M.text);
    if (JSON.stringify(txt) !== JSON.stringify(pdf)) falla(`${nom}: la solució és ${txt} i al PDF és ${pdf}`);
}

revisa('exemple', P.exemple, SOLUCIONS_PDF.exemple);
if (P.llista.length !== 42) falla(`hi ha ${P.llista.length} problemes (n'esperava 42)`);
P.llista.forEach((pr, i) => revisa(`problema ${i + 1}`, pr, SOLUCIONS_PDF[String(i + 1)]));

if (errors) {
    console.error(`\n${errors} errors`);
    process.exit(1);
}
console.log(`✓ Dipòsits d'aigua: ${P.llista.length} problemes + l'exemple, solució única i igual a la del PDF`);
