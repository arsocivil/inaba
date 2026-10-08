/**
 * ============================================================================
 * FITXER: js/talla-rectangles/talla-rectangles.js
 * ROL: Controlador de la pàgina talla-rectangles.html (tot el que toca el DOM).
 * INTERACCIÓ:
 *   - Arrossegar (ratolí o dit) d'un quadret a un altre dibuixa el rectangle
 *     que hi ha entre tots dos. Si trepitja rectangles que ja hi eren, els treu.
 *   - Tocar un rectangle el treu. (Tocar un quadret buit fa un rectangle d'1
 *     quadret, si la llista en demana algun.)
 *   - Teclat: fletxes per moure el quadret marcat; Enter (o espai) per començar
 *     el rectangle i Enter per acabar-lo; Esc per desfer-lo; ⌫/Supr per treure
 *     el rectangle del quadret marcat.
 * Mentre es dibuixa, a sota de la figura es veu «base × altura = quadrets».
 * Quan la figura és plena, es comprova sola.
 * DEPENDÈNCIES: js/comu.js, problemes.js, motor.js i tauler.js (carregats abans).
 * ============================================================================
 */
(() => {
    const P = window.PROBLEMES_RECTANGLES;
    const M = window.MotorRectangles;
    const T = window.TaulerRectangles;
    const N = P.llista.length;

    const $ = id => document.getElementById(id);
    const els = {
        taulerWrap: $('tauler-wrap'),
        mides: $('mides'),
        dibuix: $('estat-dibuix'),
        missatge: $('missatge'),
        reinicia: $('btn-reinicia'),
    };
    const progres = Comu.progres('inaba.talla-rectangles');
    const nav = Comu.navegacio({ total: N, progres, carrega });
    const mostraMissatge = (...args) => Comu.missatge(els.missatge, ...args);
    const amagaMissatge = () => Comu.amagaMissatge(els.missatge);

    // ============================================================
    // ESTAT DEL PROBLEMA
    // ============================================================
    let actual = 0;
    let problema = null;
    let fig = null; // { amp, alt, area, files } de motor.js
    let rects = []; // els rectangles dibuixats: { x, y, w, h }
    let vista = null; // { el, pinta, previsio, cursor, quadret } de tauler.js
    let resolt = false;
    let traç = null; // el rectangle que s'està dibuixant: { ancora, fins, mogut, teclat }
    let cursor = { x: 0, y: 0 }; // el quadret marcat amb el teclat

    function carrega(i) {
        actual = Math.max(0, Math.min(N - 1, i));
        problema = P.llista[actual];
        fig = M.figura(problema);
        rects = [];
        resolt = false;
        traç = null;
        cursor = primerQuadret();

        vista = T.crea(problema.figura);
        configuraTauler();
        els.taulerWrap.replaceChildren(vista.el);
        amagaMissatge();
        nav.obre(actual);
        pinta();
    }

    function primerQuadret() {
        for (let y = 0; y < fig.alt; y++) for (let x = 0; x < fig.amp; x++) if (M.dins(fig, x, y)) return { x, y };
        return { x: 0, y: 0 };
    }

    const llistaMides = () => problema.mides.join(', ').replace(/, (\d+)$/, ' i $1');

    // La classe de color de cada rectangle: la de la seva mida a la llista, o «erroni» si no hi toca
    function classes() {
        const r = M.comprova(problema, rects);
        const queden = problema.mides.map((m, k) => ({ m, k }));
        return rects.map((rect, i) => {
            if (r.sobren.includes(i)) return 'erroni';
            const j = queden.findIndex(q => q.m === rect.w * rect.h);
            const k = queden[j].k;
            queden.splice(j, 1);
            return 'mida-' + k;
        });
    }

    function quadrets(r) {
        const q = [];
        for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) q.push([x, y]);
        return q;
    }

    // Posa al dia el tauler i la llista de mides a partir de l'estat
    function pinta() {
        const cl = classes();
        vista.pinta(rects.map((r, i) => ({ quadrets: quadrets(r), classe: cl[i], etiqueta: r.w * r.h })));
        vista.el.classList.toggle('resolt', resolt);
        // La llista de mides: ✓ a les que ja tenen el seu rectangle
        const fetes = new Set(cl.filter(c => c !== 'erroni').map(c => Number(c.slice(5))));
        els.mides.replaceChildren(
            ...problema.mides.map((m, k) => {
                const d = document.createElement('div');
                d.className = `mida mida-${k}` + (fetes.has(k) ? ' feta' : '');
                d.textContent = m;
                d.setAttribute('aria-label', `${m} quadrets${fetes.has(k) ? ', ja hi és' : ''}`);
                return d;
            })
        );
        vista.el.setAttribute(
            'aria-label',
            `Figura de ${fig.area} quadrets, amb ${rects.length} rectangles. ` +
                'Fletxes per moure el quadret marcat, Enter per començar i acabar un rectangle, Supr per treure’l.'
        );
        nav.actualitza();
    }

    // ============================================================
    // ACCIONS
    // ============================================================
    function rectA(q) {
        return rects.findIndex(r => q.x >= r.x && q.x < r.x + r.w && q.y >= r.y && q.y < r.y + r.h);
    }

    function posa(r) {
        rects = rects.filter(s => !M.toca(r, s));
        rects.push(r);
        canvi();
        Comu.anima(vista.el, 'acaba-de-posar');
    }

    function treu(i) {
        if (i < 0 || resolt) return;
        rects.splice(i, 1);
        canvi();
    }

    function canvi() {
        amagaMissatge();
        pinta();
        revisa();
    }

    // Quan la figura és plena, es comprova
    function revisa() {
        const r = M.comprova(problema, rects);
        if (!r.complet) return;
        if (r.correcte) {
            celebra();
            return;
        }
        const fan = rects
            .map(s => s.w * s.h)
            .sort((a, b) => a - b)
            .join(', ')
            .replace(/, (\d+)$/, ' i $1');
        mostraMissatge('error', 'Encara no! Els rectangles han de fer ' + llistaMides() + ' quadrets,', [
            `però en fan ${fan}.`,
        ]);
    }

    function celebra() {
        resolt = true;
        acabaTraç();
        progres.marcaResolt(actual + 1);
        pinta();
        const frases = [...rects].sort((a, b) => a.w * a.h - b.w * b.h).map(r => `${r.w} × ${r.h} = ${r.w * r.h}`);
        const boto = nav.botoSeguent();
        const titol = nav.totsResolts()
            ? '🏆 Molt bé! Has resolt tots els problemes!'
            : '🎉 Molt bé! Cada rectangle té els quadrets que toca.';
        mostraMissatge('ok', titol, frases, boto);
        boto.focus({ preventScroll: true });
    }

    function reinicia() {
        resolt = false;
        rects = [];
        acabaTraç();
        canvi();
    }

    // ============================================================
    // DIBUIXAR UN RECTANGLE (punter i teclat fan servir les mateixes funcions)
    // ============================================================
    function iniciaTraç(q, teclat) {
        traç = { ancora: q, fins: q, mogut: false, teclat };
        mouTraç(q);
    }

    function mouTraç(q) {
        if (!traç) return;
        if (q.x !== traç.fins.x || q.y !== traç.fins.y) traç.mogut = true;
        traç.fins = q;
        const r = M.entre(traç.ancora, q);
        const valid = M.cap(fig, r);
        vista.previsio(r, valid);
        els.dibuix.textContent = valid
            ? `${r.w} × ${r.h} = ${r.w * r.h} quadrets`
            : `${r.w} × ${r.h}: surt de la figura`;
        els.dibuix.classList.toggle('invalid', !valid);
    }

    function acabaTraç() {
        traç = null;
        if (vista) vista.previsio(null);
        els.dibuix.textContent = '';
        els.dibuix.classList.remove('invalid');
    }

    function finalitzaTraç() {
        if (!traç) return;
        const { ancora, fins, mogut } = traç;
        acabaTraç();
        const r = M.entre(ancora, fins);
        if (!mogut && ancora.x === fins.x && ancora.y === fins.y) {
            // Un toc: treu el rectangle d'aquell quadret, o en fa un d'1 quadret si cal
            const i = rectA(ancora);
            if (i >= 0) treu(i);
            else if (problema.mides.includes(1)) posa(r);
            else mostraMissatge('info', "Arrossega d'un quadret a un altre per dibuixar un rectangle.");
            return;
        }
        if (M.cap(fig, r)) posa(r);
        else {
            mostraMissatge('info', 'El rectangle ha de quedar dins de la figura.');
            Comu.anima(vista.el, 'sacseja');
        }
    }

    function configuraTauler() {
        const el = vista.el;
        el.setAttribute('tabindex', '0');
        el.setAttribute('role', 'application');
        el.addEventListener('pointerdown', e => {
            if (resolt || (e.pointerType === 'mouse' && e.button !== 0)) return;
            const q = vista.quadret(e.clientX, e.clientY);
            if (!M.dins(fig, q.x, q.y)) return;
            e.preventDefault(); // no s'enfoca: el marc del teclat només surt amb Tab
            el.setPointerCapture(e.pointerId);
            cursor = q;
            vista.cursor(null);
            iniciaTraç(q, false);
        });
        el.addEventListener('pointermove', e => {
            if (traç && !traç.teclat) mouTraç(vista.quadret(e.clientX, e.clientY));
        });
        el.addEventListener('pointerup', () => {
            if (traç && !traç.teclat) finalitzaTraç();
        });
        el.addEventListener('pointercancel', acabaTraç);
        el.addEventListener('keydown', teclaTauler);
        el.addEventListener('focus', () => {
            if (!resolt) vista.cursor(cursor);
        });
        el.addEventListener('blur', () => vista.cursor(null));
    }

    // ============================================================
    // TECLAT
    // ============================================================
    function teclaTauler(e) {
        if (e.altKey || e.ctrlKey || e.metaKey || resolt) return;
        const fletxes = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
        if (fletxes[e.key]) {
            e.preventDefault();
            const [dx, dy] = fletxes[e.key];
            cursor = {
                x: Math.max(0, Math.min(fig.amp - 1, cursor.x + dx)),
                y: Math.max(0, Math.min(fig.alt - 1, cursor.y + dy)),
            };
            vista.cursor(cursor);
            if (traç) mouTraç(cursor);
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (traç) finalitzaTraç();
            else if (M.dins(fig, cursor.x, cursor.y)) iniciaTraç(cursor, true);
        } else if (e.key === 'Escape') {
            acabaTraç();
        } else if (e.key === 'Backspace' || e.key === 'Delete') {
            e.preventDefault();
            treu(rectA(cursor));
        }
    }

    // ============================================================
    // ARRENCADA
    // ============================================================
    // Peces a partir d'unes files de lletres (instruccions)
    function pecesDeText(files, mides, erronies = '') {
        const per = {};
        files.forEach((f, y) =>
            [...f].forEach((c, x) => {
                if (c !== '.' && c !== '#') (per[c] = per[c] || []).push([x, y]);
            })
        );
        return Object.entries(per).map(([lletra, q]) => ({
            quadrets: q,
            classe: erronies.includes(lletra) ? 'erroni' : 'mida-' + mides.indexOf(q.length),
            etiqueta: q.length,
        }));
    }

    function pintaInstruccions() {
        const ex = P.exemple;
        const SOL = ['ABBB..', 'ABBB..', 'ACCCCC'];
        const L = ['AAAB..', 'BBBB..', 'CCCCCC']; // la B no és un rectangle
        const o = { amplada: 220 };
        $('ex-problema').prepend(T.estatic(ex.figura, [], o));
        $('ex-solucio').prepend(T.estatic(ex.figura, pecesDeText(SOL, ex.mides), o));
        $('ex-be').prepend(T.estatic(ex.figura, pecesDeText(SOL, ex.mides), o));
        $('ex-malament').prepend(T.estatic(ex.figura, pecesDeText(L, ex.mides, 'B'), o));
        // Les tres peces, separades (amb el color de la seva mida)
        const peces = { 'ex-3': ['A', 'A', 'A'], 'ex-6': ['AAA', 'AAA'], 'ex-5': ['AAAAA'] };
        Object.entries(peces).forEach(([id, files]) => {
            const figura = files.map(f => f.replace(/A/g, '#'));
            const opcions = { amplada: figura[0].length * 28 };
            $(id).prepend(T.estatic(figura, pecesDeText(files, ex.mides), opcions));
        });
    }

    els.reinicia.addEventListener('click', reinicia);

    pintaInstruccions();
    carrega(nav.inicial());
})();
