/**
 * ============================================================================
 * FITXER: tests/talla-rectangles.test.js
 * ROL: Comprova les dades del «Talla en rectangles»:
 *   - que les mides de cada problema sumen l'àrea de la figura;
 *   - que cada problema té UNA sola solució;
 *   - que aquesta solució és la del PDF de solucions (src/shikaku_a.pdf), llegida
 *     per tools/extreu-rectangles.py a tests/talla-rectangles-solucions.json.
 * ÚS: node tests/talla-rectangles.test.js
 * ============================================================================
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const arrel = path.join(__dirname, '..');
const context = { window: {} };
vm.createContext(context);
for (const f of ['js/talla-rectangles/problemes.js', 'js/talla-rectangles/motor.js']) {
    vm.runInContext(fs.readFileSync(path.join(arrel, f), 'utf8'), context, { filename: f });
}
const { PROBLEMES_RECTANGLES: P, MotorRectangles: M } = context.window;
const SOLUCIONS_PDF = JSON.parse(fs.readFileSync(path.join(__dirname, 'talla-rectangles-solucions.json'), 'utf8'));

// Errada del PDF de solucions: al 41, el dibuix no talla bé (hi falta el tall entre el rectangle de 10 i
// el de 15, i n'hi sobra un de horitzontal). La solució bona és la que es comprova aquí.
// prettier-ignore
const SOLUCIO_41 = [
    '.....AAAAA',
    'BBBBBAAAAA',
    'BBBBBAAAAA',
    'CCCCDDDDDD',
    'CCCC......',
];

let errors = 0;
function falla(msg) {
    console.error('✗ ' + msg);
    errors++;
}

// Una solució (llista de rectangles) en el format de lletres, per comparar-la amb la del PDF.
// Dues solucions són iguals si fan els mateixos talls: es comparen les parelles de quadrets veïns
// que van al mateix rectangle.
function mateixos(f, lletra) {
    const out = [];
    for (let y = 0; y < f.alt; y++) {
        for (let x = 0; x < f.amp; x++) {
            if (!M.dins(f, x, y)) continue;
            if (M.dins(f, x + 1, y)) out.push(lletra(x, y) === lletra(x + 1, y) ? 1 : 0);
            if (M.dins(f, x, y + 1)) out.push(lletra(x, y) === lletra(x, y + 1) ? 1 : 0);
        }
    }
    return out.join('');
}
const deRectangles = rects => (x, y) => rects.findIndex(r => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h);
const deText = files => (x, y) => files[y][x];

function revisa(nom, pr, pdf) {
    const f = M.figura(pr);
    if (!pr.figura.every(fila => fila.length === f.amp && /^[#.]+$/.test(fila))) falla(`${nom}: figura mal escrita`);
    const suma = pr.mides.reduce((a, b) => a + b, 0);
    if (suma !== f.area) falla(`${nom}: les mides sumen ${suma} i la figura té ${f.area} quadrets`);
    const sols = M.resol(pr);
    if (sols.length !== 1) {
        falla(`${nom}: té ${sols.length} solucions`);
        return;
    }
    if (!M.comprova(pr, sols[0]).correcte) falla(`${nom}: comprova() no accepta la solució`);
    if (pdf && mateixos(f, deRectangles(sols[0])) !== mateixos(f, deText(pdf))) {
        falla(`${nom}: la solució no és la del PDF`);
    }
}

revisa('exemple', P.exemple, SOLUCIONS_PDF.exemple);
if (P.llista.length !== 42) falla(`hi ha ${P.llista.length} problemes (n'esperava 42)`);
P.llista.forEach((pr, i) => {
    const n = i + 1;
    const pdf = n === 41 ? SOLUCIO_41 : SOLUCIONS_PDF[String(n)];
    if (!pdf) falla(`problema ${n}: no hi ha la solució del PDF`);
    revisa(`problema ${n}`, pr, pdf);
});

if (errors) {
    console.error(`\n${errors} errors`);
    process.exit(1);
}
console.log(`✓ Els ${P.llista.length} problemes i l'exemple tenen una sola solució, i coincideix amb la del PDF.`);
