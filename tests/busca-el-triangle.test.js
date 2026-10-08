/**
 * ============================================================================
 * FITXER: tests/busca-el-triangle.test.js
 * ROL: Comprova les dades del «Busca el triangle»:
 *   - que els punts són vèrtexs de la quadrícula, sense repetir-se;
 *   - que cada problema té UNA sola solució (excepte el 26: errada del PDF);
 *   - que aquesta solució és la del PDF de solucions (src/sankaku_a.pdf), llegida
 *     per tools/extreu-triangle.py a tests/busca-el-triangle-solucions.json;
 *   - que el desglossament de l'àrea (base × altura, o la caixa menys les peces)
 *     dona la mateixa àrea per a TOTS els triangles possibles.
 * ÚS: node tests/busca-el-triangle.test.js
 * ============================================================================
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const arrel = path.join(__dirname, '..');
const context = { window: {} };
vm.createContext(context);
for (const f of ['js/busca-el-triangle/problemes.js', 'js/busca-el-triangle/motor.js']) {
    vm.runInContext(fs.readFileSync(path.join(arrel, f), 'utf8'), context, {
        filename: f,
    });
}
const { PROBLEMES_TRIANGLE: P, MotorTriangle: M } = context.window;
const SOLUCIONS_PDF = JSON.parse(fs.readFileSync(path.join(__dirname, 'busca-el-triangle-solucions.json'), 'utf8'));

// Errada del PDF: el problema 26 (àrea 2) té 3 solucions, no 1. La del PDF és la base horitzontal
// (0,3)–(4,3) amb el vèrtex (1,4); també valen (2,0)–(0,1)–(0,3) (base vertical de 2, altura 2) i
// (2,0)–(1,1)–(3,3) (inclinat: 2 × 3 − 0,5 − 2 − 1,5 = 2). El joc les accepta totes.
const SOLUCIONS_26 = 3;

let errors = 0;
function falla(msg) {
    console.error('✗ ' + msg);
    errors++;
}

const clau = punts =>
    punts
        .map(q => q.join(','))
        .sort()
        .join(' ');

function revisa(nom, pr, pdf) {
    const vistos = new Set();
    pr.punts.forEach(([x, y]) => {
        if (!(Number.isInteger(x) && Number.isInteger(y) && x >= 0 && y >= 0 && x <= pr.amp && y <= pr.alt)) {
            falla(`${nom}: el punt ${x},${y} no és un vèrtex de la quadrícula`);
        }
        if (vistos.has(x + ',' + y)) falla(`${nom}: el punt ${x},${y} hi és dues vegades`);
        vistos.add(x + ',' + y);
    });
    const sols = M.resol(pr);
    const esperades = nom === 'problema 26' ? SOLUCIONS_26 : 1;
    if (sols.length !== esperades) {
        falla(`${nom}: té ${sols.length} solucions (n'esperava ${esperades})`);
        return;
    }
    if (!sols.every(s => M.comprova(pr, s).correcte)) falla(`${nom}: comprova() no accepta una solució`);
    if (!sols.some(s => clau(s.map(i => pr.punts[i])) === clau(pdf))) falla(`${nom}: la solució del PDF no hi és`);
    // El desglossament ha de quadrar per a qualsevol terna de punts
    const n = pr.punts.length;
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            for (let k = j + 1; k < n; k++) {
                const d = M.desglossa(pr.punts[i], pr.punts[j], pr.punts[k]);
                let area = d.area;
                if (d.tipus === 'base') area = (d.base * d.altura) / 2;
                if (d.tipus === 'caixa') {
                    const c = d.caixa;
                    area = (c.x1 - c.x0) * (c.y1 - c.y0) - d.peces.reduce((s, p) => s + p.area, 0);
                }
                if (area !== M.dobleArea(pr.punts[i], pr.punts[j], pr.punts[k]) / 2) {
                    falla(`${nom}: el desglossament de ${i},${j},${k} no quadra`);
                }
            }
        }
    }
}

revisa('exemple', P.exemple, SOLUCIONS_PDF.exemple);
if (P.llista.length !== 42) falla(`hi ha ${P.llista.length} problemes (n'esperava 42)`);
P.llista.forEach((pr, i) => {
    const pdf = SOLUCIONS_PDF[String(i + 1)];
    if (!pdf) falla(`problema ${i + 1}: no hi ha la solució del PDF`);
    else revisa(`problema ${i + 1}`, pr, pdf);
});
// El triangle inclinat de les instruccions: 3 × 3 − 1,5 − 1,5 − 2 = 4
if (M.calcul(M.desglossa([0, 1], [3, 0], [2, 3])) !== '3 × 3 − 1,5 − 1,5 − 2 = 4')
    falla('calcul() del triangle inclinat');

if (errors) {
    console.error(`\n${errors} errors`);
    process.exit(1);
}
console.log(
    `✓ Busca el triangle: ${P.llista.length} problemes + l'exemple, solució única (el 26 en té 3) i la del PDF hi és`
);
