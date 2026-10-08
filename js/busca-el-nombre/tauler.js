/**
 * ============================================================================
 * FITXER: js/busca-el-nombre/tauler.js
 * ROL: Dibuixa el tauler de «Busca el nombre»: la quadrícula de línies de
 *      punts, les pomes i mandarines i el quadrat. Només SVG, sense lògica de joc.
 * ARQUITECTURA: window.TaulerKazu = { crea, estatic }
 *   crea(g)  → { el, pinta, previsio, cursor, punt }  (g de MotorKazu.analitza)
 *     pinta(marc, classe)   posa el quadrat: marc { c, f } (o null); classe
 *                           '' | 'correcte' | 'erroni'
 *     previsio(marc)        el quadrat «fantasma» mentre s'arrossega (o null)
 *     cursor(marc)          el quadrat marcat amb el teclat (o null)
 *     punt(clientX, clientY) → { x, y } en quadrets (decimals; pot sortir de la
 *                           quadrícula): per saber a on assenyala el dit
 *   estatic(g, marc, opcions) → un SVG per a les instruccions (sense events);
 *     marc { c, f, w?, h?, classe? } pot sortir de la quadrícula (exemples ✗)
 *     opcions { amplada } en px.
 * UNITATS: un quadret fa 60 unitats; el quadrat es dibuixa una mica per fora de
 *   les línies dels quadrets que envolta (MARGE) perquè les pomes no el toquin.
 * DEPENDÈNCIES: js/busca-el-nombre/motor.js (per a la forma de g).
 * ============================================================================
 */
window.TaulerKazu = (() => {
    const NS = 'http://www.w3.org/2000/svg';
    const CEL = 60;
    const PAD = 14; // espai al voltant de la quadrícula perquè el traç del quadrat no es talli
    const MARGE = 3;

    function el(nom, atributs = {}, pare = null) {
        const e = document.createElementNS(NS, nom);
        for (const [k, v] of Object.entries(atributs)) e.setAttribute(k, v);
        if (pare) pare.appendChild(e);
        return e;
    }

    // Una poma («┬» a dalt) o una mandarina (full verd) amb el centre a (cx, cy)
    function fruita(pare, tipus, cx, cy) {
        const g = el(
            'g',
            { class: 'fruita ' + (tipus === 'p' ? 'poma' : 'mandarina'), transform: `translate(${cx} ${cy})` },
            pare
        );
        el('circle', { r: 17, cx: 0, cy: 0 }, g);
        if (tipus === 'p') el('path', { class: 'tija', d: 'M-5.5 -17 H5.5 M0 -17 V-8' }, g);
        else el('path', { class: 'full', d: 'M2 -16.5 H13' }, g);
    }

    // On va cada fruita dins d'un quadret, segons quantes n'hi ha (les que cauen encavalcades, com al PDF)
    const POSICIONS = [
        [],
        [[0, 0]],
        [
            [-8, -7],
            [8, 7],
        ],
        [
            [-10, -8],
            [10, -2],
            [-2, 11],
        ],
    ];

    function dibuixaQuadrets(svg, g) {
        const fons = el('g', { class: 'fons' }, svg);
        const fruites = el('g', { class: 'fruites' }, svg);
        for (let f = 0; f < g.alt; f++) {
            for (let c = 0; c < g.amp; c++) {
                const x = PAD + c * CEL;
                const y = PAD + f * CEL;
                el('rect', { x, y, width: CEL, height: CEL, class: 'quadret' }, fons);
                const x0 = x + CEL / 2;
                const y0 = y + CEL / 2;
                const { p, m } = g.cel[f][c];
                const tipus = 'p'.repeat(p) + 'm'.repeat(m);
                [...tipus].forEach((t, k) => {
                    const [dx, dy] = POSICIONS[tipus.length][k];
                    fruita(fruites, t, x0 + dx, y0 + dy);
                });
            }
        }
    }

    // Un quadrat (rectangle gruixut) de w × h quadrets a partir del quadret (c, f)
    function marcEl(pare, classe, { c, f, w, h }) {
        return el(
            'rect',
            {
                class: 'marc ' + classe,
                x: PAD + c * CEL - MARGE,
                y: PAD + f * CEL - MARGE,
                width: w * CEL + 2 * MARGE,
                height: h * CEL + 2 * MARGE,
                rx: 5,
            },
            pare
        );
    }

    function crea(g) {
        const amplada = PAD * 2 + g.amp * CEL;
        const alçada = PAD * 2 + g.alt * CEL;
        const svg = el('svg', {
            class: 'tauler-kazu',
            viewBox: `0 0 ${amplada} ${alçada}`,
            role: 'application',
        });
        svg.style.width = `${(amplada * 56) / CEL}px`; // un quadret fa 56 px a la pantalla
        dibuixaQuadrets(svg, g);
        const capes = el('g', { class: 'capes' }, svg);
        let posat = null;
        let fantasma = null;
        let cursor = null;

        function ferMarc(refs, classe, marc) {
            if (refs) refs.remove();
            if (!marc) return null;
            return marcEl(capes, classe, { c: marc.c, f: marc.f, w: g.mida, h: g.mida });
        }

        return {
            el: svg,
            pinta(marc, classe = '') {
                posat = ferMarc(posat, 'posat ' + classe, marc);
            },
            previsio(marc) {
                fantasma = ferMarc(fantasma, 'previsio', marc);
            },
            cursor(marc) {
                cursor = ferMarc(cursor, 'cursor', marc);
            },
            punt(clientX, clientY) {
                const r = svg.getBoundingClientRect();
                const u = r.width / amplada; // px per unitat
                return { x: ((clientX - r.left) / u - PAD) / CEL, y: ((clientY - r.top) / u - PAD) / CEL };
            },
        };
    }

    function estatic(g, marc = null, opcions = {}) {
        const amplada = PAD * 2 + g.amp * CEL;
        const alçada = PAD * 2 + g.alt * CEL;
        const svg = el('svg', {
            'class': 'tauler-kazu estatic',
            'viewBox': `0 0 ${amplada} ${alçada}`,
            'aria-hidden': 'true',
        });
        svg.style.width = `${opcions.amplada || g.amp * 40}px`;
        dibuixaQuadrets(svg, g);
        if (marc) {
            marcEl(svg, 'posat ' + (marc.classe || ''), {
                c: marc.c,
                f: marc.f,
                w: marc.w || g.mida,
                h: marc.h || g.mida,
            });
        }
        return svg;
    }

    return { crea, estatic };
})();
