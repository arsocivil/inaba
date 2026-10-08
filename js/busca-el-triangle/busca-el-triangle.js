/**
 * ============================================================================
 * FITXER: js/busca-el-triangle/busca-el-triangle.js
 * ROL: Controlador de la pàgina busca-el-triangle.html (tot el que toca el DOM).
 * INTERACCIÓ: es trien tres punts, que són els vèrtexs del triangle:
 *   - Tocar (o clicar) un punt el tria; tocar-ne un de triat el treu.
 *   - Traçar: prémer un punt i, sense aixecar el dit o el ratolí, passar per
 *     altres punts; cada punt per on passa queda triat (fins a tres).
 *   - Teclat: fletxes per anar d'un punt a l'altre, Enter (o espai) per triar-lo
 *     o treure'l, ⌫/Supr per treure'l, Esc per treure'ls tots.
 *   Si el traç passa en línia recta per sobre d'un punt i continua fins a un
 *   altre, el punt del mig no queda triat (no seria un vèrtex).
 * Quan hi ha tres punts triats, es comprova sol (si es traça, en aixecar el dit): es dibuixa com es calcula
 * l'àrea (base × altura : 2, o el rectangle que l'envolta menys les peces del
 * voltant) i es diu si és la que demana el problema.
 * DEPENDÈNCIES: js/comu.js, problemes.js, motor.js i tauler.js (carregats abans).
 * ============================================================================
 */
(() => {
    const P = window.PROBLEMES_TRIANGLE;
    const M = window.MotorTriangle;
    const T = window.TaulerTriangle;
    const N = P.llista.length;

    const $ = id => document.getElementById(id);
    const els = {
        taulerWrap: $('tauler-wrap'),
        area: $('area-demanada'),
        missatge: $('missatge'),
        reinicia: $('btn-reinicia'),
    };
    const progres = Comu.progres('inaba.busca-el-triangle');
    const nav = Comu.navegacio({ total: N, progres, carrega });
    const mostraMissatge = (...args) => Comu.missatge(els.missatge, ...args);
    const amagaMissatge = () => Comu.amagaMissatge(els.missatge);

    // ============================================================
    // ESTAT DEL PROBLEMA
    // ============================================================
    let actual = 0;
    let problema = null;
    let tria = []; // índexs dels punts triats (com a molt 3), en l'ordre en què s'han triat
    let resultat = null; // la comprovació, quan n'hi ha tres
    let vista = null; // { el, punts, pinta, guia, posicio, puntA } de tauler.js
    let resolt = false;
    let traç = null; // { inici, eraTriat, mogut, x, y, afegits } mentre es prem un punt

    function carrega(i) {
        actual = Math.max(0, Math.min(N - 1, i));
        problema = P.llista[actual];
        tria = [];
        resultat = null;
        resolt = false;
        acabaTraç();

        vista = T.crea(problema);
        vista.punts.forEach(configuraPunt);
        els.taulerWrap.replaceChildren(vista.el);
        els.area.textContent = M.text(problema.area);
        amagaMissatge();
        nav.obre(actual);
        pinta();
    }

    function configuraPunt(div, i) {
        div.tabIndex = 0;
        div.setAttribute('role', 'button');
        div.addEventListener('pointerdown', e => iniciaTraç(e, i));
        div.addEventListener('keydown', e => teclaPunt(e, i));
        // Clic sense punter (lectors de pantalla): com tocar-lo
        div.addEventListener('click', e => {
            if (e.detail === 0) commuta(i);
        });
    }

    // Posa al dia el tauler a partir de l'estat
    function pinta() {
        const estat = resultat ? (resultat.correcte ? 'be' : 'malament') : '';
        vista.pinta({ tria, estat, d: resultat ? resultat.d : null });
        vista.el.classList.toggle('resolt', resolt);
        vista.punts.forEach((div, i) => {
            const [c, f] = problema.punts[i];
            const triat = tria.includes(i);
            div.tabIndex = resolt ? -1 : 0;
            div.setAttribute('aria-pressed', triat ? 'true' : 'false');
            div.setAttribute('aria-label', `Punt de la columna ${c + 1} i la fila ${f + 1}${triat ? ', triat' : ''}`);
        });
        nav.actualitza();
    }

    // ============================================================
    // ACCIONS
    // ============================================================
    // Tria el punt i o el treu si ja ho era. Retorna true si el punt queda triat.
    function commuta(i) {
        if (resolt) return false;
        if (tria.includes(i)) {
            treu(i);
            return false;
        }
        return afegeix(i);
    }

    function afegeix(i) {
        if (resolt || tria.includes(i)) return false;
        if (traç) traç.afegits.push(i);
        if (tria.length === 3) {
            mostraMissatge('info', "Ja hi ha tres punts triats. Toca'n un per treure'l i tria'n un altre.");
            Comu.anima(vista.punts[i], 'sacseja');
            return false;
        }
        tria.push(i);
        canvi();
        Comu.anima(vista.punts[i], 'acaba-de-posar');
        return true;
    }

    function treu(i) {
        if (resolt || !tria.includes(i)) return;
        tria = tria.filter(j => j !== i);
        canvi();
    }

    function reinicia() {
        resolt = false;
        tria = [];
        acabaTraç();
        canvi();
    }

    function canvi() {
        amagaMissatge();
        resultat = null;
        revisa();
        pinta();
    }

    // Les frases del càlcul de l'àrea, com a les instruccions
    function frasesCalcul(d) {
        if (d.tipus === 'base') return [`Base ${d.base} × altura ${d.altura} : 2 = ${M.text(d.area)}`];
        if (d.tipus === 'caixa') {
            const { x0, y0, x1, y1 } = d.caixa;
            const w = x1 - x0;
            const h = y1 - y0;
            const rect = d.peces.length > 3;
            return [
                `El rectangle que l'envolta fa ${w} × ${h} = ${w * h}.`,
                `Si li treus ${rect ? 'les peces' : 'els triangles'} del voltant: ` +
                    `${w * h} − ${d.peces.map(p => M.text(p.area)).join(' − ')} = ${M.text(d.area)}`,
            ];
        }
        return [];
    }

    // Quan hi ha tres punts, es comprova
    function revisa() {
        if (tria.length < 3 || (traç && traç.mogut)) return; // mentre es traça, s'espera a aixecar el dit
        resultat = M.comprova(problema, tria);
        if (resultat.correcte) {
            celebra();
            return;
        }
        mostraMissatge('error', 'Encara no! ' + resultat.motiu, frasesCalcul(resultat.d));
    }

    function celebra() {
        resolt = true;
        acabaTraç();
        progres.marcaResolt(actual + 1);
        const boto = nav.botoSeguent();
        const titol = nav.totsResolts()
            ? '🏆 Molt bé! Has resolt tots els problemes!'
            : `🎉 Molt bé! El triangle fa ${M.text(problema.area)} d'àrea.`;
        mostraMissatge('ok', titol, frasesCalcul(resultat.d), boto);
        setTimeout(() => boto.focus({ preventScroll: true }), 0);
    }

    // ============================================================
    // TRAÇAR (Pointer Events: ratolí, dit i llapis amb el mateix codi)
    // ============================================================
    function iniciaTraç(e, i) {
        if (resolt || (e.pointerType === 'mouse' && e.button !== 0)) return;
        e.preventDefault(); // que el navegador no seleccioni ni arrossegui res
        vista.punts[i].focus({ preventScroll: true });
        const eraTriat = tria.includes(i);
        if (!eraTriat && !afegeix(i)) return;
        traç = { inici: i, eraTriat, mogut: false, x: e.clientX, y: e.clientY, afegits: [] };
        vista.el.classList.add('traçant');
        document.addEventListener('pointermove', mouTraç);
        document.addEventListener('pointerup', deixaTraç);
        document.addEventListener('pointercancel', acabaTraç);
    }

    function mouTraç(e) {
        if (!traç) return;
        e.preventDefault();
        if (Math.hypot(e.clientX - traç.x, e.clientY - traç.y) > 6) traç.mogut = true;
        if (!traç.mogut) return;
        const q = vista.posicio(e.clientX, e.clientY);
        const i = vista.puntA(q, 0.3); // més just que en tocar: el traç passa a prop d'altres punts
        if (i >= 0 && !tria.includes(i)) {
            // Un costat recte que passa per sobre d'un punt: el punt del mig no és un vèrtex
            const n = tria.length;
            if (n >= 2 && traç.afegits.includes(tria[n - 1]) && entremig(tria[n - 2], tria[n - 1], i)) {
                tria.pop();
            }
            if (tria.length < 3) afegeix(i);
        }
        if (resolt || !traç) return;
        vista.guia(tria.length && tria.length < 3 ? tria[tria.length - 1] : null, q);
    }

    // El punt m és entre a i b, en línia recta?
    function entremig(a, m, b) {
        const [pa, pm, pb] = [a, m, b].map(i => problema.punts[i]);
        if (M.dobleArea(pa, pm, pb) !== 0) return false;
        return (pm[0] - pa[0]) * (pm[0] - pb[0]) <= 0 && (pm[1] - pa[1]) * (pm[1] - pb[1]) <= 0;
    }

    // En aixecar el dit: un toc sobre un punt que ja era triat el treu
    function deixaTraç() {
        const t = traç;
        acabaTraç();
        if (t && !t.mogut && t.eraTriat) treu(t.inici);
        else if (t && t.mogut) canvi();
    }

    function acabaTraç() {
        document.removeEventListener('pointermove', mouTraç);
        document.removeEventListener('pointerup', deixaTraç);
        document.removeEventListener('pointercancel', acabaTraç);
        traç = null;
        if (vista) {
            vista.guia(null);
            vista.el.classList.remove('traçant');
        }
    }

    // ============================================================
    // TECLAT
    // ============================================================
    function teclaPunt(e, i) {
        if (e.altKey || e.ctrlKey || e.metaKey) return;
        const fletxes = {
            ArrowLeft: [-1, 0],
            ArrowRight: [1, 0],
            ArrowUp: [0, -1],
            ArrowDown: [0, 1],
        };
        if (fletxes[e.key]) {
            e.preventDefault();
            mouFocus(i, ...fletxes[e.key]);
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            commuta(i);
        } else if (e.key === 'Backspace' || e.key === 'Delete') {
            e.preventDefault();
            treu(i);
        } else if (e.key === 'Escape' && tria.length && !resolt) {
            tria = [];
            canvi();
        }
    }

    // Va al punt més proper en la direcció (dx, dy)
    function mouFocus(i, dx, dy) {
        const [x0, y0] = problema.punts[i];
        let millor = -1;
        let millorCost = Infinity;
        problema.punts.forEach(([x, y], j) => {
            const avanc = (x - x0) * dx + (y - y0) * dy;
            if (j === i || avanc <= 0) return;
            const lateral = Math.abs((x - x0) * dy - (y - y0) * dx);
            const cost = avanc + 2 * lateral;
            if (cost < millorCost) {
                millorCost = cost;
                millor = j;
            }
        });
        if (millor >= 0) vista.punts[millor].focus();
    }

    // ============================================================
    // ARRENCADA
    // ============================================================
    function pintaInstruccions() {
        const ex = P.exemple;
        const sol = M.resol(ex)[0];
        const o = { amplada: 190 };
        $('ex-problema').prepend(T.estatic(ex, o));
        $('ex-solucio').prepend(T.estatic(ex, { ...o, tria: sol, estat: 'be' }));
        // Un triangle senzill: base 2 (a baix) i altura 3
        const senzill = {
            amp: 2,
            alt: 3,
            punts: [
                [2, 0],
                [0, 3],
                [2, 3],
            ],
            area: 3,
        };
        const ds = M.desglossa(...senzill.punts);
        $('ex-senzill').prepend(T.estatic(senzill, { amplada: 160, tria: [0, 1, 2], d: ds }));
        // Un triangle inclinat: el quadrat de 3 × 3 menys els tres triangles del voltant
        const inclinat = {
            amp: 3,
            alt: 3,
            punts: [
                [0, 1],
                [3, 0],
                [2, 3],
            ],
            area: 4,
        };
        $('ex-inclinat').prepend(T.estatic(inclinat, { amplada: 190, tria: [0, 1, 2] }));
        const di = M.desglossa(...inclinat.punts);
        $('ex-inclinat-caixa').prepend(T.estatic(inclinat, { amplada: 190, tria: [0, 1, 2], d: di }));
    }

    els.reinicia.addEventListener('click', reinicia);

    pintaInstruccions();
    carrega(nav.inicial());
})();
