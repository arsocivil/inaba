/**
 * ============================================================================
 * FITXER: js/busca-la-figura/busca-la-figura.js
 * ROL: Controlador de la pàgina busca-la-figura.html (tot el que toca el DOM).
 * INTERACCIÓ: com al «Busca el triangle» (fa servir el seu tauler): es trien
 *   els vèrtexs (3 per als triangles, 4 per als quadrilàters):
 *   - Tocar (o clicar) un punt el tria; tocar-ne un de triat el treu.
 *   - Traçar: prémer un punt i, sense aixecar el dit o el ratolí, passar per
 *     altres punts; cada punt per on passa queda triat. Si el traç passa en
 *     línia recta per sobre d'un punt i continua fins a un altre, el punt del
 *     mig no queda triat (no seria un vèrtex).
 *   - Teclat: fletxes per anar d'un punt a l'altre, Enter (o espai) per triar-lo
 *     o treure'l, ⌫/Supr per treure'l, Esc per treure'ls tots.
 * Quan hi ha prou vèrtexs, es comprova sol (si es traça, en aixecar el dit): es
 * dibuixa la figura amb les marques de les propietats que demana la seva
 * definició (angles rectes, costats iguals, costats paral·lels) i es diu si és
 * la figura que es demana o quina propietat li falta.
 * DEPENDÈNCIES: js/comu.js, problemes.js, motor.js i js/busca-el-triangle/tauler.js (carregats abans).
 * ============================================================================
 */
(() => {
    const P = window.PROBLEMES_FIGURA;
    const M = window.MotorFigura;
    const T = window.TaulerTriangle;
    const N = P.llista.length;
    // El nom de la figura, a sota de la quadrícula (com al PDF)
    const NOM_FIGURA = {
        'quadrat': 'Quadrat',
        'rectangle': 'Rectangle',
        'rombe': 'Rombe',
        'paral·lelogram': 'Paral·lelogram',
        'trapezi': 'Trapezi',
        'isosceles': 'Triangle isòsceles',
        'rectangle-triangle': 'Triangle rectangle',
        'rectangle-isosceles': 'Triangle rectangle isòsceles',
    };
    // Les figures d'exemple de la pàgina 1 del PDF (quadrícules de 3 × 3)
    const EXEMPLES = {
        'isosceles': [[1, 0], [3, 2], [0, 3]],
        'quadrat': [[0, 1], [2, 1], [0, 3], [2, 3]],
        'rectangle': [[1, 0], [3, 2], [2, 3], [0, 1]],
        'rombe': [[3, 0], [1, 1], [2, 2], [0, 3]],
        'trapezi': [[1, 0], [2, 0], [3, 3], [0, 3]],
        'paral·lelogram': [[0, 0], [2, 1], [2, 3], [0, 2]],
        'rectangle-triangle': [[1, 0], [3, 0], [3, 3]],
    }; // prettier-ignore

    const $ = id => document.getElementById(id);
    const els = {
        taulerWrap: $('tauler-wrap'),
        figura: $('figura-demanada'),
        missatge: $('missatge'),
        reinicia: $('btn-reinicia'),
    };
    const progres = Comu.progres('inaba.busca-la-figura');
    const nav = Comu.navegacio({ total: N, progres, carrega });
    const mostraMissatge = (...args) => Comu.missatge(els.missatge, ...args);
    const amagaMissatge = () => Comu.amagaMissatge(els.missatge);

    // ============================================================
    // ESTAT DEL PROBLEMA
    // ============================================================
    let actual = 0;
    let problema = null;
    let tria = []; // índexs dels punts triats (com a molt 3 o 4), en l'ordre en què s'han triat
    let cal = 3; // quants vèrtexs té la figura
    let resultat = null; // la comprovació, quan n'hi ha tres
    let vista = null; // { el, punts, pinta, guia, posicio, puntA } de tauler.js
    let resolt = false;
    let traç = null; // { inici, eraTriat, mogut, x, y, afegits } mentre es prem un punt

    function carrega(i) {
        actual = Math.max(0, Math.min(N - 1, i));
        problema = P.llista[actual];
        tria = [];
        cal = M.vertexs(problema.figura);
        resultat = null;
        resolt = false;
        acabaTraç();

        vista = T.crea(problema);
        vista.punts.forEach(configuraPunt);
        els.taulerWrap.replaceChildren(vista.el);
        els.figura.textContent = NOM_FIGURA[problema.figura];
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
        vista.pinta({ tria, estat, ordre: resultat ? ordreDe(resultat.a) : null, marques: resultat ? M.marques(problema.figura, resultat.a) : null }); // prettier-ignore
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
        if (tria.length === cal) {
            mostraMissatge(
                'info',
                `Ja hi ha ${cal === 3 ? 'tres' : 'quatre'} punts triats. Toca'n un per treure'l i tria'n un altre.`
            );
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

    // L'ordre de la vora (índexs de problema.punts) d'una figura analitzada, o null si no és cap polígon
    function ordreDe(a) {
        if (!a.ordre) return null;
        return a.ordre.map(q => problema.punts.findIndex(r => r[0] === q[0] && r[1] === q[1]));
    }

    // Per què la figura és la que es demana, segons la seva definició
    const PER_QUE = {
        'quadrat': 'Té els quatre costats iguals i els quatre angles rectes.',
        'rectangle': 'Té els quatre angles rectes.',
        'rombe': 'Té els quatre costats iguals.',
        'paral·lelogram': 'Té dos parells de costats paral·lels.',
        'trapezi': 'Té un parell de costats paral·lels.',
        'isosceles': 'Té dos costats iguals.',
        'rectangle-triangle': 'Té un angle recte.',
        'rectangle-isosceles': 'Té un angle recte i els dos costats que el formen són iguals.',
    };

    // Quan hi ha prou punts, es comprova
    function revisa() {
        if (tria.length < cal || (traç && traç.mogut)) return; // mentre es traça, s'espera a aixecar el dit
        resultat = M.comprova(
            problema.figura,
            tria.map(i => problema.punts[i])
        );
        if (resultat.correcte) {
            celebra();
            return;
        }
        const frases = [resultat.motiu];
        if (resultat.nom) frases.push(`Has fet ${resultat.nom}.`);
        mostraMissatge('error', `Encara no! No és ${M.NOMS[problema.figura]}.`, frases);
    }

    function celebra() {
        resolt = true;
        acabaTraç();
        progres.marcaResolt(actual + 1);
        const boto = nav.botoSeguent();
        const titol = nav.totsResolts()
            ? '🏆 Molt bé! Has resolt tots els problemes!'
            : `🎉 Molt bé! És ${M.NOMS[problema.figura]}.`;
        const frases = [PER_QUE[problema.figura]];
        if (resultat.nom !== M.NOMS[problema.figura]) frases.push(`De fet, és ${resultat.nom}.`);
        mostraMissatge('ok', titol, frases, boto);
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
            if (tria.length < cal) afegeix(i);
        }
        if (resolt || !traç) return;
        vista.guia(tria.length && tria.length < cal ? tria[tria.length - 1] : null, q);
    }

    // El punt m és entre a i b, en línia recta?
    function entremig(a, m, b) {
        const [pa, pm, pb] = [a, m, b].map(i => problema.punts[i]);
        if ((pm[0] - pa[0]) * (pb[1] - pa[1]) - (pm[1] - pa[1]) * (pb[0] - pa[0]) !== 0) return false;
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
    // Una figura feta (instruccions): els punts són els vèrtexs, en l'ordre de la vora
    function figuraFeta(figura, punts, opcions) {
        const p = { amp: 3, alt: 3, punts };
        const r = M.comprova(figura, punts);
        const ordre = r.a.ordre.map(q => punts.findIndex(s => s[0] === q[0] && s[1] === q[1]));
        return T.estatic(p, { ...opcions, tria: punts.map((q, i) => i), ordre, marques: M.marques(figura, r.a) });
    }

    function pintaInstruccions() {
        const ex = P.exemple;
        const sol = M.resol(ex)[0];
        const o = { amplada: 170 };
        $('ex-problema').prepend(T.estatic(ex, o));
        const r = M.comprova(
            ex.figura,
            sol.map(i => ex.punts[i])
        );
        const ordre = r.a.ordre.map(q => ex.punts.findIndex(s => s[0] === q[0] && s[1] === q[1]));
        $('ex-solucio').prepend(T.estatic(ex, { ...o, tria: sol, ordre, estat: 'be', marques: M.marques(ex.figura, r.a) })); // prettier-ignore
        // Les figures d'exemple de la pàgina 1 del PDF
        const petit = { amplada: 150 };
        Object.entries(EXEMPLES).forEach(([f, punts]) =>
            $('ex-' + f.replace('·', '')).prepend(figuraFeta(f, punts, petit))
        );
    }

    els.reinicia.addEventListener('click', reinicia);

    pintaInstruccions();
    carrega(nav.inicial());
})();
