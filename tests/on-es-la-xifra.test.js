/**
 * ============================================================================
 * FITXER: tests/on-es-la-xifra.test.js
 * ROL: Comprova les dades d'«On és la xifra?»:
 *   - que cada problema té el format bo (3 files, el resultat és el més llarg,
 *     una llista de pistes per columna i per fila);
 *   - que cada problema té UNA sola solució;
 *   - que aquesta solució és la del PDF de solucions (src/dokoeq_a.pdf), llegida
 *     per tools/extreu-xifra.py a tests/on-es-la-xifra-solucions.json.
 *   El motor també es prova amb l'exemple de les instruccions.
 * ÚS: node tests/on-es-la-xifra.test.js
 * ============================================================================
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const arrel = path.join(__dirname, '..');
const context = { window: {} };
vm.createContext(context);
for (const f of ['js/on-es-la-xifra/problemes.js', 'js/on-es-la-xifra/motor.js']) {
    vm.runInContext(fs.readFileSync(path.join(arrel, f), 'utf8'), context, { filename: f });
}
const { PROBLEMES_XIFRA: P, MotorXifra: M } = context.window;
const SOLUCIONS_PDF = JSON.parse(fs.readFileSync(path.join(__dirname, 'on-es-la-xifra-solucions.json'), 'utf8'));

let errors = 0;
function falla(msg) {
    console.error('✗ ' + msg);
    errors++;
}

const matriu = text => text.map(t => t.split('').map(Number)); // ['16', '66', '82'] → v

function revisa(nom, p, pdf) {
    const [ns, pc, pf] = p;
    if (ns.length !== 3) return falla(`${nom}: no té 3 files`);
    if (Math.max(...ns) !== ns[2]) falla(`${nom}: el resultat no és el nombre més llarg`);
    if (pc.length !== ns[2]) falla(`${nom}: ${pc.length} llistes de pistes de columna per a ${ns[2]} columnes`);
    if (pf.length !== 3) falla(`${nom}: ${pf.length} llistes de pistes de fila`);
    if (![...pc.flat(), ...pf.flat()].length) falla(`${nom}: no té cap pista`);
    const g = M.analitza(p);
    const sols = M.resol(g, 3);
    if (sols.length !== 1) return falla(`${nom}: té ${sols.length === 3 ? 'més de 2' : sols.length} solucions`);
    const delPdf = matriu(pdf);
    if (JSON.stringify(sols[0]) !== JSON.stringify(delPdf)) {
        falla(`${nom}: la solució ${JSON.stringify(sols[0])} no és la del PDF ${JSON.stringify(delPdf)}`);
    }
    if (!M.comprova(g, delPdf).correcte) falla(`${nom}: comprova() no accepta la solució del PDF`);
}

// ---- El motor, amb l'exemple de les instruccions: 8 + 5 = 13, amb el 3 a la columna i el 5 a la fila ----
{
    const g = M.analitza(P.exemple);
    const bona = [[8], [5], [1, 3]];
    const r = M.comprova(g, bona);
    if (!r.correcte) falla('exemple: la solució de les instruccions no passa');
    if (r.suma.motiu !== '8 + 5 = 13') falla(`exemple: motiu de la suma «${r.suma.motiu}»`);
    // Un 0 al principi no val (3 + 5 = 08), tot i que la suma és bona
    const zero = M.comprova(g, [[3], [5], [0, 8]]);
    if (zero.correcte || zero.zeros.length !== 1 || zero.zeros[0].f !== 2) falla('exemple: el 0 inicial no es detecta');
    if (zero.suma.ok !== true) falla('exemple: 3 + 5 = 08 hauria de tenir la suma bona');
    // Falta el 3 a la columna (7 + 5 = 12)
    const sense3 = M.comprova(g, [[7], [5], [1, 2]]);
    const dolents = sense3.pistes.filter(x => !x.ok);
    if (dolents.length !== 1 || dolents[0].motiu !== 'El 3 no és enlloc de la columna de les unitats (7, 5, 2).') {
        falla(`exemple: pista dolenta ${JSON.stringify(dolents)}`);
    }
    // Suma falsa
    const falsa = M.comprova(g, [[8], [5], [1, 4]]);
    if (falsa.suma.ok || falsa.suma.motiu !== '8 + 5 = 13, i no 14.')
        falla(`exemple: suma falsa «${falsa.suma.motiu}»`);
    // Incomplet: no es jutja res
    const inc = M.comprova(g, [[8], [null], [1, 3]]);
    if (inc.complet || inc.correcte) falla('exemple: incomplet no hauria de comprovar-se');
    // Un 0 sol no val com a nombre
    if (!M.comprova(g, [[0], [5], [0, 5]]).zeros.length) falla('exemple: un 0 sol no es detecta');
    const sols = M.resol(g, 3);
    if (sols.length !== 1) falla(`exemple: ${sols.length} solucions`);
    // Pistes ja complertes (ajuda local)
    const fetes = M.pistesFetes(g, [[8], [null], [1, 3]]);
    if (fetes.length !== 1 || fetes[0].dir !== 'columna') falla('exemple: pistesFetes');
}

// ---- Els problemes ----
if (P.llista.length !== 42) falla(`hi ha ${P.llista.length} problemes (n'esperava 42)`);
P.llista.forEach((p, i) => {
    const pdf = SOLUCIONS_PDF[String(i + 1)];
    if (!pdf) return falla(`problema ${i + 1}: no hi ha solució del PDF`);
    revisa(`problema ${i + 1}`, p, pdf);
});

if (errors) {
    console.error(`\n${errors} errors`);
    process.exit(1);
}
console.log(`✓ Els ${P.llista.length} problemes tenen una sola solució i és la del PDF.`);
