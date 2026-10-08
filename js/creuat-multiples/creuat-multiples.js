/**
 * ============================================================================
 * FITXER: js/creuat-multiples/creuat-multiples.js
 * ROL: Controlador de la pàgina creuat-multiples.html (tot el que toca el DOM).
 * IDEA: s'omple el quadre xifra a xifra; res no es jutja fins que totes les
 *   caselles blanques tenen xifra. Llavors es mira cada número: el nombre que
 *   es veu des d'ell ha de ser múltiple seu i no pot començar per 0.
 * INTERACCIÓ (tres maneres de fer el mateix):
 *   - Arrossegar una xifra de la fila de sota fins a una casella. Una xifra
 *     d'una casella es pot arrossegar a una altra casella (s'intercanvien) o
 *     fora del quadre (s'esborra).
 *   - Clicar/tocar: o bé una casella i després una xifra (la casella triada
 *     es veu amb una vora gruixuda i, en posar-hi la xifra, el cursor passa
 *     a la següent casella buida), o bé una xifra i després una casella. El
 *     botó ⌫ esborra la casella triada.
 *   - Teclat: Tab o fletxes per anar d'una casella a una altra, escriure la
 *     xifra directament (el cursor avança), ⌫ o Supr per esborrar.
 * Quan totes les caselles són plenes, es comprova sol i es mostra, per a cada
 * número, el nombre que es veu («96 = 8 × 12») o per què no va bé.
 * DEPENDÈNCIES: js/comu.js, problemes.js, motor.js i tauler.js (carregats abans).
 * ============================================================================
 */
(() => {
    const P = window.PROBLEMES_CREUAT;
    const M = window.MotorCreuat;
    const T = window.TaulerCreuat;
    const N = P.llista.length;
    const ESBORRA = '⌫';

    const $ = id => document.getElementById(id);
    const els = {
        taulerWrap: $('tauler-wrap'),
        pila: $('pila'),
        missatge: $('missatge'),
        reinicia: $('btn-reinicia'),
    };
    const progres = Comu.progres('inaba.creuat-multiples');
    const nav = Comu.navegacio({ total: N, progres, carrega });
    const mostraMissatge = (...args) => Comu.missatge(els.missatge, ...args);
    const amagaMissatge = () => Comu.amagaMissatge(els.missatge);

    // ============================================================
    // ESTAT DEL PROBLEMA
    // ============================================================
    let actual = 0;
    let vista = null; // { el, g, blanques, claus, pinta } de tauler.js
    let v = null; // les xifres escrites: v[y][x] (0–9 o null)
    let cursor = null; // la casella triada { x, y }, o null
    let seleccio = null; // xifra triada a la pila (0–9), o null
    let resultat = null; // el que ha dit M.comprova quan el quadre és ple
    let resolt = false;
    let acabaDArrossegar = false;
    const xifresEls = new Map(); // xifra → element de la pila
    let esborraEl = null;

    const mateixa = (a, b) => !!a && !!b && a.x === b.x && a.y === b.y;
    const casella = (x, y) => vista.blanques[y][x];

    function carrega(i) {
        actual = Math.max(0, Math.min(N - 1, i));
        vista = T.crea(P.llista[actual]);
        v = M.buida(vista.g);
        cursor = null;
        seleccio = null;
        resultat = null;
        resolt = false;
        vista.g.blanques.forEach(({ x, y }) => configuraCasella(casella(x, y), x, y));
        els.taulerWrap.replaceChildren(vista.el);
        amagaMissatge();
        nav.obre(actual);
        pinta();
    }

    function configuraCasella(d, x, y) {
        d.setAttribute('role', 'button');
        d.addEventListener('click', () => clicCasella(x, y));
        d.addEventListener('keydown', e => teclaCasella(e, x, y));
        d.addEventListener('focus', () => {
            if (resolt || mateixa(cursor, { x, y })) return;
            cursor = { x, y };
            pinta();
        });
        d.addEventListener('pointerdown', e => {
            if (v[y][x] !== null) iniciaArrossegament(e, v[y][x], { x, y }, d);
        });
    }

    function construeixPila() {
        for (let d = 0; d <= 9; d++) {
            const t = document.createElement('div');
            t.className = 'xifra';
            t.textContent = d;
            t.tabIndex = 0;
            t.setAttribute('role', 'button');
            t.setAttribute('aria-label', `Xifra ${d}`);
            t.addEventListener('click', () => clicXifra(d));
            t.addEventListener('keydown', e => teclaXifra(e, d));
            t.addEventListener('pointerdown', e => iniciaArrossegament(e, d, 'pila', t));
            xifresEls.set(d, t);
            els.pila.appendChild(t);
        }
        esborraEl = document.createElement('div');
        esborraEl.className = 'xifra esborra';
        esborraEl.textContent = ESBORRA;
        esborraEl.tabIndex = 0;
        esborraEl.setAttribute('role', 'button');
        esborraEl.setAttribute('aria-label', 'Esborra la casella triada');
        esborraEl.addEventListener('click', clicEsborra);
        esborraEl.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                clicEsborra();
            } else teclaXifra(e, 'esborra');
        });
        els.pila.appendChild(esborraEl);
    }

    // Posa al dia el quadre i la pila a partir de l'estat
    function pinta() {
        vista.pinta({ v, cursor: resolt ? null : cursor, resultat });
        const primera = vista.g.blanques[0];
        const amb = cursor || primera; // la casella a què porta el Tab
        vista.g.blanques.forEach(({ x, y }) => {
            const d = casella(x, y);
            const xifra = v[y][x];
            d.setAttribute('aria-label', `Fila ${y + 1}, columna ${x + 1}: ${xifra === null ? 'buida' : xifra}`);
            d.tabIndex = !resolt && mateixa(amb, { x, y }) ? 0 : -1;
        });
        vista.el.classList.toggle('amb-seleccio', seleccio !== null);
        vista.el.classList.toggle('resolt', resolt);
        xifresEls.forEach((t, d) => {
            t.classList.toggle('seleccionat', seleccio === d);
            t.setAttribute('aria-pressed', String(seleccio === d));
            t.tabIndex = resolt ? -1 : 0;
        });
        esborraEl.tabIndex = resolt ? -1 : 0;
        esborraEl.classList.toggle('inactiu', resolt || !cursor || v[cursor.y][cursor.x] === null);
        nav.actualitza();
    }

    // ============================================================
    // ACCIONS
    // ============================================================
    // La casella buida següent a (x, y) en ordre de lectura (donant la volta); null si no n'hi ha cap
    function seguentBuida(x, y) {
        const bl = vista.g.blanques;
        const k = bl.findIndex(b => b.x === x && b.y === y);
        for (let i = 1; i < bl.length; i++) {
            const b = bl[(k + i) % bl.length];
            if (v[b.y][b.x] === null) return b;
        }
        return null;
    }

    // Posa la xifra d a la casella (x, y); el cursor passa a la següent casella buida
    function posa(d, x, y, { avanca = true } = {}) {
        if (resolt) return;
        const teFoco = vista.el.contains(document.activeElement);
        v[y][x] = d;
        seleccio = null;
        const seg = avanca ? seguentBuida(x, y) : null;
        cursor = seg || { x, y };
        canvi();
        Comu.anima(casella(x, y), 'acaba-de-posar');
        if (avanca && seg && teFoco) casella(seg.x, seg.y).focus({ preventScroll: true });
    }

    function treu(x, y) {
        if (resolt || v[y][x] === null) return;
        v[y][x] = null;
        cursor = { x, y };
        canvi();
    }

    function canvi() {
        resultat = null;
        amagaMissatge();
        pinta();
        revisa();
    }

    // Quan el quadre és ple, es comprova
    function revisa() {
        const r = M.comprova(vista.g, v);
        if (!r.complet) return;
        resultat = r;
        if (r.correcte) {
            celebra(r);
            return;
        }
        pinta();
        const dolents = r.trams.filter(t => t.estat !== 'be');
        const titol =
            dolents.length === 1
                ? 'Encara no! Hi ha un nombre que no compleix la regla:'
                : `Encara no! Hi ha ${dolents.length} nombres que no compleixen la regla:`;
        mostraMissatge(
            'error',
            titol,
            dolents.map(t => t.motiu)
        );
    }

    function celebra(r) {
        resolt = true;
        progres.marcaResolt(actual + 1);
        cursor = null;
        pinta();
        vista.g.blanques.forEach(({ x, y }, k) => setTimeout(() => Comu.anima(casella(x, y), 'celebra'), k * 70));
        const frases = r.trams.map(t => `${t.nombre} = ${t.tram.clau} × ${t.quocient} ✓`);
        const boto = nav.botoSeguent();
        const titol = nav.totsResolts()
            ? '🏆 Molt bé! Has resolt tots els problemes!'
            : '🎉 Molt bé! Tots els nombres són múltiples del seu número.';
        mostraMissatge('ok', titol, frases, boto);
        boto.focus({ preventScroll: true });
    }

    function reinicia() {
        resolt = false;
        v = M.buida(vista.g);
        cursor = null;
        seleccio = null;
        canvi();
    }

    // ============================================================
    // CLIC / TOC
    // ============================================================
    function clicXifra(d) {
        if (acabaDArrossegar || resolt) return;
        if (cursor) {
            posa(d, cursor.x, cursor.y);
        } else {
            seleccio = seleccio === d ? null : d;
            pinta();
        }
    }

    function clicCasella(x, y) {
        if (acabaDArrossegar || resolt) return;
        if (seleccio !== null) {
            const d = seleccio;
            posa(d, x, y, { avanca: false });
            cursor = null; // xifra primer, casella després: no es deixa cap casella triada
            pinta();
        } else {
            cursor = { x, y };
            pinta();
        }
    }

    function clicEsborra() {
        if (acabaDArrossegar || resolt || !cursor) return;
        treu(cursor.x, cursor.y);
    }

    // ============================================================
    // TECLAT
    // ============================================================
    function vesA(x, y, dx, dy) {
        for (
            let xx = x + dx, yy = y + dy;
            xx >= 0 && yy >= 0 && xx < vista.g.amp && yy < vista.g.alt;
            xx += dx, yy += dy
        ) {
            if (!vista.g.cel[yy][xx].negra) {
                casella(xx, yy).focus();
                return;
            }
        }
    }

    function teclaCasella(e, x, y) {
        if (e.altKey || e.ctrlKey || e.metaKey) return;
        if (/^[0-9]$/.test(e.key)) {
            e.preventDefault();
            posa(Number(e.key), x, y);
        } else if (e.key === 'Backspace' || e.key === 'Delete') {
            e.preventDefault();
            if (v[y][x] !== null) {
                treu(x, y);
            } else if (e.key === 'Backspace') {
                // Casella ja buida: Retrocés va a la casella anterior (com en escriure un text)
                const bl = vista.g.blanques;
                const k = bl.findIndex(b => b.x === x && b.y === y);
                if (k > 0) casella(bl[k - 1].x, bl[k - 1].y).focus();
            }
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            vesA(x, y, 1, 0);
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            vesA(x, y, -1, 0);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            vesA(x, y, 0, 1);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            vesA(x, y, 0, -1);
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            clicCasella(x, y);
        } else if (e.key === 'Escape') {
            seleccio = null;
            pinta();
        }
    }

    function teclaXifra(e, d) {
        if (e.altKey || e.ctrlKey || e.metaKey) return;
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            clicXifra(d);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            const tots = [...xifresEls.values(), esborraEl];
            tots[tots.indexOf(e.currentTarget) + (e.key === 'ArrowRight' ? 1 : -1)]?.focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const c = cursor || vista.g.blanques[0];
            casella(c.x, c.y).focus();
        } else if (e.key === 'Escape') {
            seleccio = null;
            pinta();
        }
    }

    // ============================================================
    // ARROSSEGAR (Pointer Events: ratolí, dit i llapis amb el mateix codi)
    // ============================================================
    let arr = null;

    function iniciaArrossegament(e, xifra, des, el) {
        if (resolt || (e.pointerType === 'mouse' && e.button !== 0)) return;
        arr = {
            xifra,
            des, // 'pila' o { x, y } (la casella d'on surt)
            el,
            x0: e.clientX,
            y0: e.clientY,
            tactil: e.pointerType !== 'mouse',
            actiu: false,
            sobre: null,
        };
        document.addEventListener('pointermove', mouArrossegament);
        document.addEventListener('pointerup', deixaArrossegament);
        document.addEventListener('pointercancel', acabaArrossegament);
    }

    // On «apunta» la xifra: amb el dit, una mica per sobre perquè es vegi
    function mira(e) {
        return { x: e.clientX, y: e.clientY - (arr.tactil ? 40 : 0) };
    }

    function casellaA(p) {
        const el = document.elementFromPoint(p.x, p.y);
        const d = el && el.closest('.blanca');
        return d && vista.el.contains(d) ? { x: Number(d.dataset.x), y: Number(d.dataset.y) } : null;
    }

    function mouArrossegament(e) {
        if (!arr) return;
        if (!arr.actiu) {
            if (Math.hypot(e.clientX - arr.x0, e.clientY - arr.y0) < 6) return;
            arr.actiu = true;
            seleccio = null;
            pinta();
            arr.fantasma = document.createElement('div');
            arr.fantasma.className = 'xifra fantasma';
            arr.fantasma.textContent = arr.xifra;
            document.body.appendChild(arr.fantasma);
            arr.el.classList.add('arrossegant');
            vista.el.classList.add('amb-seleccio');
        }
        e.preventDefault();
        const p = mira(e);
        arr.fantasma.style.left = p.x + 'px';
        arr.fantasma.style.top = p.y + 'px';
        const c = casellaA(p);
        if (!mateixa(c, arr.sobre)) {
            if (arr.sobre) casella(arr.sobre.x, arr.sobre.y).classList.remove('sobre');
            if (c) casella(c.x, c.y).classList.add('sobre');
            arr.sobre = c;
        }
    }

    function deixaArrossegament(e) {
        if (!arr) return;
        const a = arr;
        const c = a.actiu ? casellaA(mira(e)) : null;
        acabaArrossegament();
        if (!a.actiu) return; // ha estat un clic: se n'encarrega l'esdeveniment 'click'
        acabaDArrossegar = true;
        setTimeout(() => (acabaDArrossegar = false), 0);
        if (a.des === 'pila') {
            if (c) posa(a.xifra, c.x, c.y, { avanca: false });
        } else if (!c) {
            treu(a.des.x, a.des.y); // una xifra del quadre, deixada fora: s'esborra
        } else if (!mateixa(c, a.des)) {
            // D'una casella a una altra: s'intercanvien
            [v[a.des.y][a.des.x], v[c.y][c.x]] = [v[c.y][c.x], a.xifra];
            cursor = { x: c.x, y: c.y };
            canvi();
        }
    }

    function acabaArrossegament() {
        document.removeEventListener('pointermove', mouArrossegament);
        document.removeEventListener('pointerup', deixaArrossegament);
        document.removeEventListener('pointercancel', acabaArrossegament);
        if (!arr) return;
        arr.fantasma?.remove();
        arr.el.classList.remove('arrossegant');
        if (arr.sobre) casella(arr.sobre.x, arr.sobre.y).classList.remove('sobre');
        vista.el.classList.toggle('amb-seleccio', seleccio !== null);
        arr = null;
    }

    // ============================================================
    // ARRENCADA
    // ============================================================
    // Les xifres de l'exemple de les instruccions (【解答】)
    function solucioExemple(g) {
        const sol = M.buida(g);
        sol[1][1] = 9;
        sol[1][2] = 6;
        sol[2][2] = 5;
        return sol;
    }

    function pintaInstruccions() {
        const ex = P.exemple;
        const sol = solucioExemple(M.analitza(ex));
        $('ex-problema').prepend(T.estatic(ex));
        $('ex-solucio').prepend(T.estatic(ex, { v: sol, comprova: true }));
        // El nombre que es veu des de cada triangle de l'exemple
        const veu = {
            'ex-veu-96': { dir: 'd', x: 0, y: 1 },
            'ex-veu-65': { dir: 'a', x: 2, y: 0 },
            'ex-veu-9': { dir: 'a', x: 1, y: 0 },
            'ex-veu-5': { dir: 'd', x: 1, y: 2 },
        };
        Object.entries(veu).forEach(([id, t]) => $(id).prepend(T.estatic(ex, { v: sol, veu: [t] })));
        // Compte: una xifra 0 al principi no val
        const zero = ['#d3 . .'];
        const vz = [[null, 0, 6]];
        $('ex-zero').prepend(T.estatic(zero, { v: vz, comprova: true }));
    }

    els.reinicia.addEventListener('click', reinicia);
    // Esc fora d'una casella o d'una xifra: desfà la tria
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && seleccio !== null && !nav.dialegObert()) {
            seleccio = null;
            pinta();
        }
    });

    construeixPila();
    pintaInstruccions();
    carrega(nav.inicial());
})();
