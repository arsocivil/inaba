/**
 * ============================================================================
 * FITXER: tests/creuat-multiples.test.js
 * ROL: Comprova les dades del «Creuat de múltiples»:
 *   - que cada problema té el format bo (quadre rectangular, cada casella
 *     blanca és vista per algun número);
 *   - que cada problema té UNA sola solució;
 *   - que aquesta solució és la del PDF de solucions (src/bcross_a.pdf), llegida
 *     per tools/extreu-creuat.py a tests/creuat-multiples-solucions.json.
 *   El motor també es prova amb l'exemple de les instruccions.
 * ÚS: node tests/creuat-multiples.test.js
 * ============================================================================
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const arrel = path.join(__dirname, '..');
const context = { window: {} };
vm.createContext(context);
for (const f of ['js/creuat-multiples/problemes.js', 'js/creuat-multiples/motor.js']) {
    vm.runInContext(fs.readFileSync(path.join(arrel, f), 'utf8'), context, { filename: f });
}
const { PROBLEMES_CREUAT: P, MotorCreuat: M } = context.window;
const SOLUCIONS_PDF = JSON.parse(fs.readFileSync(path.join(__dirname, 'creuat-multiples-solucions.json'), 'utf8'));

let errors = 0;
function falla(msg) {
    console.error('✗ ' + msg);
    errors++;
}

// Les xifres de la solució del PDF (per files, només les caselles blanques) com a matriu v[y][x]
function matriuDelPdf(g, files) {
    const v = M.buida(g);
    g.blanques.forEach(({ x, y }) => {
        const fila = g.blanques.filter(b => b.y === y);
        const k = fila.findIndex(b => b.x === x);
        v[y][x] = Number(files[y][k]);
    });
    return v;
}

function revisa(nom, files, pdf) {
    const g = M.analitza(files);
    if (!g.cel.every(f => f.length === g.amp)) falla(`${nom}: les files no tenen la mateixa llargada`);
    if (!g.blanques.length) falla(`${nom}: no hi ha cap casella blanca`);
    // Cada casella blanca ha de ser vista per algun número (si no, podria ser qualsevol xifra)
    g.blanques.forEach(({ x, y }) => {
        if (!g.trams.some(t => t.cel.some(c => c.x === x && c.y === y)))
            falla(`${nom}: la casella (${x},${y}) no la veu cap número`);
    });
    // Cada número ha de veure alguna casella
    g.trams.forEach(t => {
        if (!t.cel.length) falla(`${nom}: el número ${t.clau} (${t.x},${t.y}) no veu cap casella`);
    });
    const sols = M.resol(g, 3);
    if (sols.length !== 1) {
        falla(`${nom}: té ${sols.length === 3 ? 'més de 2' : sols.length} solucions`);
        return;
    }
    const delPdf = matriuDelPdf(g, pdf);
    if (JSON.stringify(sols[0]) !== JSON.stringify(delPdf)) {
        falla(`${nom}: la solució ${JSON.stringify(sols[0])} no és la del PDF ${JSON.stringify(delPdf)}`);
    }
    // La solució del PDF ha de superar la comprovació del joc
    if (!M.comprova(g, delPdf).correcte) falla(`${nom}: comprova() no accepta la solució del PDF`);
}

// ---- El motor, amb l'exemple de les instruccions: 96 = 8 × 12, 9 = 3 × 3, 65 = 13 × 5, 5 = 5 × 1 ----
{
    const g = M.analitza(P.exemple);
    const v = M.buida(g);
    const posa = (x, y, d) => (v[y][x] = d);
    posa(1, 1, 9);
    posa(2, 1, 6);
    posa(2, 2, 5);
    const r = M.comprova(g, v);
    if (!r.correcte) falla('exemple: la solució de les instruccions no passa');
    const q = Object.fromEntries(r.trams.map(t => [`${t.tram.dir}${t.tram.clau}`, [t.nombre, t.quocient]]));
    if (JSON.stringify(q) !== JSON.stringify({ a3: ['9', 3], a13: ['65', 5], d8: ['96', 12], d5: ['5', 1] })) {
        falla(`exemple: nombres i quocients ${JSON.stringify(q)}`);
    }
    // Un 0 al principi no val, i un múltiple fals s'explica
    posa(1, 1, 0);
    if (M.comprova(g, v).trams.find(t => t.tram.clau === 3).estat !== 'zero')
        falla('exemple: el 0 inicial no es detecta');
    posa(1, 1, 8);
    const m = M.comprova(g, v).trams.find(t => t.tram.clau === 3);
    if (m.estat !== 'multiple' || !m.motiu.startsWith('8 no és múltiple de 3: 3 × 2 = 6 i 3 × 3 = 9')) {
        falla(`exemple: motiu del múltiple fals: ${m.motiu}`);
    }
    posa(1, 1, null);
    if (M.comprova(g, v).complet) falla('exemple: no hauria de ser complet');
    const sols = M.resol(g, 3);
    if (sols.length !== 1) falla(`exemple: ${sols.length} solucions`);
}

// ---- Els problemes ----
if (P.llista.length !== 42) falla(`hi ha ${P.llista.length} problemes (n'esperava 42)`);
P.llista.forEach((files, i) => {
    const pdf = SOLUCIONS_PDF[String(i + 1)];
    if (!pdf) return falla(`problema ${i + 1}: no hi ha solució del PDF`);
    revisa(`problema ${i + 1}`, files, pdf);
});

if (errors) {
    console.error(`\n${errors} errors`);
    process.exit(1);
}
console.log(`✓ Els ${P.llista.length} problemes tenen una sola solució i és la del PDF.`);
