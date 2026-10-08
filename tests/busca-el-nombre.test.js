/**
 * ============================================================================
 * FITXER: tests/busca-el-nombre.test.js
 * ROL: Comprova les dades de «Busca el nombre»:
 *   - que cada problema té el format bo (quadrícula rectangular, mida 2 o 3,
 *     el quadrat hi cap, només els primers 24 problemes sense mandarines);
 *   - que cada problema té UNA sola solució;
 *   - que aquesta solució és la del PDF de solucions (src/kazu_a.pdf), llegida
 *     per tools/extreu-kazu.py a tests/busca-el-nombre-solucions.json.
 *   El motor també es prova amb l'exemple de les instruccions.
 * ÚS: node tests/busca-el-nombre.test.js
 * ============================================================================
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const arrel = path.join(__dirname, '..');
const context = { window: {} };
vm.createContext(context);
for (const f of ['js/busca-el-nombre/problemes.js', 'js/busca-el-nombre/motor.js']) {
    vm.runInContext(fs.readFileSync(path.join(arrel, f), 'utf8'), context, { filename: f });
}
const { PROBLEMES_KAZU: P, MotorKazu: M } = context.window;
const SOLUCIONS_PDF = JSON.parse(fs.readFileSync(path.join(__dirname, 'busca-el-nombre-solucions.json'), 'utf8'));

let errors = 0;
function falla(msg) {
    console.error('✗ ' + msg);
    errors++;
}

function revisa(nom, p, pdf, i) {
    const [mida, files] = p;
    if (mida !== 2 && mida !== 3) return falla(`${nom}: mida ${mida}`);
    const g = M.analitza(p);
    if (!M.cap(g, pdf[0], pdf[1])) return falla(`${nom}: el quadrat del PDF no hi cap`);
    if (i < 24 && M.teMandarines(g)) falla(`${nom}: els primers 24 problemes no tenen mandarines`);
    if (i >= 24 && !M.teMandarines(g)) falla(`${nom}: ha de tenir mandarines`);
    const sols = M.resol(g);
    if (sols.length !== 1) return falla(`${nom}: té ${sols.length} solucions ${JSON.stringify(sols)}`);
    if (JSON.stringify(sols[0]) !== JSON.stringify(pdf)) {
        falla(`${nom}: la solució ${JSON.stringify(sols[0])} no és la del PDF ${JSON.stringify(pdf)}`);
    }
    if (!M.comprova(g, pdf[0], pdf[1]).correcte) falla(`${nom}: comprova() no accepta la solució del PDF`);
    void files;
}

// ---- El motor, amb l'exemple de les instruccions: quadrat de 3 × 3 amb 2 pomes ----
{
    const g = M.analitza([3, ['. . . p', 'p . . .', 'p . p .', 'p . . .'], ['n', 2]]);
    const bo = M.comprova(g, 1, 0); // el quadrat de la resposta de les instruccions
    if (!bo.correcte || bo.p !== 2) falla(`exemple: (1, 0) hauria de comptar 2 pomes, té ${bo.p}`);
    const m = M.comprova(g, 0, 1); // el de la dreta de l'exemple «4 pomes»
    if (m.correcte || m.p !== 4 || m.motiu !== 'Aquí hi ha 4 pomes, i en volies 2.') {
        falla(`exemple: motiu «${m.motiu}»`);
    }
    if (M.comprova(g, 1, 1).p !== 1 || M.comprova(g, 1, 1).compte !== '1 poma') falla('exemple: 1 poma');
    if (M.cap(g, 2, 0) || !M.cap(g, 1, 1) || M.cap(g, 0, 2)) falla('exemple: cap()');
    if (M.enunciat(g) !== "On n'hi ha 2?") falla('exemple: enunciat');
    // Les respostes d'altres preguntes
    const h = M.analitza([2, ['m p', 'p p'], ['mes', 'p']]);
    if (!M.compleix(['mes', 'p'], M.compta(h, 0, 0)) || M.compleix(['mes', 'm'], M.compta(h, 0, 0))) falla('mes');
    if (!M.compleix(['menys', 'm'], { p: 3, m: 1 }) || M.compleix(['menys', 'p'], { p: 3, m: 1 })) falla('menys');
    if (!M.compleix(['dif', 2], { p: 1, m: 3 }) || M.compleix(['dif', 1], { p: 1, m: 3 })) falla('dif');
    if (!M.compleix(['igual'], { p: 2, m: 2 })) falla('igual');
    // Les frases del missatge
    const r1 = M.analitza([2, ['m p', 'p p'], ['mes', 'm']]);
    if (M.comprova(r1, 0, 0).motiu !== 'Aquí hi ha 3 pomes i 1 mandarina: més pomes que mandarines.') {
        falla(`motiu de «més»: ${M.comprova(r1, 0, 0).motiu}`);
    }
    const r2 = M.analitza([2, ['m p', 'p m'], ['dif', 1]]);
    if (M.comprova(r2, 0, 0).correcte) falla('dif: 2 pomes i 2 mandarines no fan diferència 1');
    if (M.comprova(r2, 0, 0).motiu !== 'Aquí hi ha 2 pomes i 2 mandarines: la diferència és 0, i en volies 1.') {
        falla(`motiu de «dif»: ${M.comprova(r2, 0, 0).motiu}`);
    }
}

// ---- Els problemes ----
if (P.llista.length !== 42) falla(`hi ha ${P.llista.length} problemes (n'esperava 42)`);
P.llista.forEach((p, i) => {
    const pdf = SOLUCIONS_PDF[String(i + 1)];
    if (!pdf) return falla(`problema ${i + 1}: no hi ha solució del PDF`);
    revisa(`problema ${i + 1}`, p, pdf, i);
});

if (errors) {
    console.error(`\n${errors} errors`);
    process.exit(1);
}
console.log(`✓ Els ${P.llista.length} problemes tenen una sola solució i és la del PDF.`);
