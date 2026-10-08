/**
 * ============================================================================
 * FITXER: tools/genera-pdf.js
 * ROL: Fa el PDF per imprimir d'un puzzle a partir de imprimir/<puzzle>.html,
 *      amb Chromium (Playwright): un full A4 per cada .pagina.
 * ÚS:  node tools/genera-pdf.js expressions-bessones
 *      node tools/genera-pdf.js expressions-bessones --pagines 1,3 --sortida mostra.pdf
 *      Per defecte escriu imprimir/<puzzle>.pdf.
 * DEPENDÈNCIES: Playwright (npm) amb Chromium.
 * ============================================================================
 */
const path = require('path');
const fs = require('fs');

function carregaPlaywright() {
    try {
        return require('playwright');
    } catch {
        return require('/opt/node22/lib/node_modules/playwright');
    }
}

function opcio(nom) {
    const i = process.argv.indexOf(nom);
    return i > 0 ? process.argv[i + 1] : undefined;
}

async function main() {
    const puzzle = process.argv[2];
    const arrel = path.resolve(__dirname, '..');
    const html = path.join(arrel, 'imprimir', `${puzzle}.html`);
    if (!puzzle || !fs.existsSync(html)) {
        console.error('Ús: node tools/genera-pdf.js <puzzle> [--pagines 1,3] [--sortida fitxer.pdf]');
        process.exit(1);
    }
    const sortida = path.resolve(opcio('--sortida') || path.join(arrel, 'imprimir', `${puzzle}.pdf`));

    const { chromium } = carregaPlaywright();
    const navegador = await chromium.launch();
    const pagina = await navegador.newPage();
    const errors = [];
    pagina.on('pageerror', e => errors.push(e.message));
    await pagina.goto('file://' + html, { waitUntil: 'load' });
    await pagina.evaluate(() => document.fonts.ready);
    if (errors.length) throw new Error(errors.join('\n'));

    // Cap full ni cap problema no pot desbordar: el PDF quedaria tallat o encavalcat
    const desborden = await pagina.$$eval('.pagina', fulls =>
        fulls
            .map((f, i) => {
                const caixes = [f, ...f.querySelectorAll('.problemes, .problema, .caixa')];
                return caixes.some(c => c.scrollHeight > c.clientHeight + 1 || c.scrollWidth > c.clientWidth + 1)
                    ? i + 1
                    : 0;
            })
            .filter(Boolean)
    );
    if (desborden.length) throw new Error(`Hi ha fulls que no hi caben: ${desborden.join(', ')}`);

    // En imprimir, només s'han de veure els fulls (la barra de dalt no): si no, hi hauria pàgines de més
    await pagina.emulateMedia({ media: 'print' });
    const sobren = await pagina.$$eval('body > *:not(.pagina):not(script)', els =>
        els.filter(el => getComputedStyle(el).display !== 'none').map(el => el.tagName.toLowerCase())
    );
    if (sobren.length) throw new Error(`Hi ha elements que s'imprimirien fora dels fulls: ${sobren.join(', ')}`);

    await pagina.pdf({
        path: sortida,
        preferCSSPageSize: true,
        printBackground: true,
        pageRanges: opcio('--pagines') || '',
    });
    await navegador.close();
    console.log(`✓ ${path.relative(arrel, sortida)}`);
}

main().catch(e => {
    console.error(e.message);
    process.exit(1);
});
