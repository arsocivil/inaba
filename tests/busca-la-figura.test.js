/**
 * ============================================================================
 * FITXER: tests/busca-la-figura.test.js
 * ROL: Comprova les dades del «Busca la figura»:
 *   - que els punts són vèrtexs de la quadrícula, sense repetir-se;
 *   - que cada problema té UNA sola solució (excepte el 17 i el 19: errades del PDF);
 *   - que la solució del PDF de solucions (src/zukei_a.pdf), llegida per
 *     tools/extreu-figura.py a tests/busca-la-figura-solucions.json, hi és.
 * ÚS: node tests/busca-la-figura.test.js
 * ============================================================================
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const arrel = path.join(__dirname, '..');
const context = { window: {} };
vm.createContext(context);
for (const f of ['js/busca-la-figura/problemes.js', 'js/busca-la-figura/motor.js']) {
    vm.runInContext(fs.readFileSync(path.join(arrel, f), 'utf8'), context, { filename: f });
}
const { PROBLEMES_FIGURA: P, MotorFigura: M } = context.window;
const SOLUCIONS_PDF = JSON.parse(fs.readFileSync(path.join(__dirname, 'busca-la-figura-solucions.json'), 'utf8'));

// Errades del PDF (es manté l'enunciat original i el joc accepta totes les solucions):
// - 17 (paral·lelogram): també ho és (0,1)–(1,1)–(5,3)–(4,3), a més del del PDF.
// - 19 (triangle rectangle): amb la definició del PDF («té un angle recte») també ho és el triangle rectangle
//   isòsceles (0,2)–(2,0)–(2,2); el PDF només dona (0,1)–(0,2)–(2,2).
const SOLUCIONS = { 17: 2, 19: 2 };

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

function revisa(nom, n, pr, pdf) {
    if (!M.NOMS[pr.figura]) falla(`${nom}: figura desconeguda ${pr.figura}`);
    const vistos = new Set();
    pr.punts.forEach(([x, y]) => {
        if (!(x >= 0 && y >= 0 && x <= pr.amp && y <= pr.alt)) falla(`${nom}: el punt ${x},${y} és fora`);
        if (vistos.has(x + ',' + y)) falla(`${nom}: el punt ${x},${y} hi és dues vegades`);
        vistos.add(x + ',' + y);
    });
    const sols = M.resol(pr);
    const esperades = SOLUCIONS[n] || 1;
    if (sols.length !== esperades) falla(`${nom}: té ${sols.length} solucions (n'esperava ${esperades})`);
    if (!sols.some(s => clau(s.map(i => pr.punts[i])) === clau(pdf))) falla(`${nom}: la solució del PDF no hi és`);
}

revisa('exemple', 0, P.exemple, SOLUCIONS_PDF.exemple);
if (P.llista.length !== 42) falla(`hi ha ${P.llista.length} problemes (n'esperava 42)`);
P.llista.forEach((pr, i) => revisa(`problema ${i + 1}`, i + 1, pr, SOLUCIONS_PDF[String(i + 1)]));

// Les figures d'exemple de la pàgina 1 del PDF
const EXEMPLES = {
    'quadrat': [[0, 1], [2, 1], [0, 3], [2, 3]],
    'rectangle': [[1, 0], [3, 2], [2, 3], [0, 1]],
    'rombe': [[3, 0], [1, 1], [2, 2], [0, 3]],
    'trapezi': [[1, 0], [2, 0], [3, 3], [0, 3]],
    'paral·lelogram': [[0, 0], [2, 1], [2, 3], [0, 2]],
    'rectangle-triangle': [[1, 0], [3, 0], [3, 3]],
    'isosceles': [[1, 0], [3, 2], [0, 3]],
}; // prettier-ignore
for (const [f, punts] of Object.entries(EXEMPLES)) {
    if (!M.comprova(f, punts).correcte) falla(`l'exemple de ${f} no és ${f}`);
}
// Les definicions són inclusives, i el nom diu la figura més concreta
if (!M.comprova('rombe', EXEMPLES.quadrat).correcte) falla('un quadrat també és un rombe');
if (M.comprova('quadrat', EXEMPLES.rombe).motiu !== 'Els angles no són rectes.') falla('motiu del rombe');
if (M.comprova('quadrat', EXEMPLES.rombe).nom !== 'un rombe') falla('nom del rombe');
if (
    M.comprova('quadrat', [
        [0, 0],
        [2, 0],
        [1, 1],
        [1, 2],
    ]).a.tipus !== 'concau'
)
    falla('quadrilàter còncau');

if (errors) {
    console.error(`\n${errors} errors`);
    process.exit(1);
}
console.log(
    `✓ Busca la figura: ${P.llista.length} problemes + l'exemple, solució única (el 17 i el 19 en tenen 2) i la del PDF hi és`
);
