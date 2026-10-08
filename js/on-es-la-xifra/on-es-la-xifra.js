/**
 * ============================================================================
 * FITXER: js/on-es-la-xifra/on-es-la-xifra.js
 * ROL: Controlador de la pàgina on-es-la-xifra.html (tot el que toca el DOM).
 * IDEA: s'omple la suma xifra a xifra; res no es jutja fins que totes les
 *   caselles tenen xifra. Llavors es mira que cap nombre no comenci per 0, que
 *   la suma sigui correcta i que cada número de fora sigui a la seva fila o
 *   columna.
 * INTERACCIÓ (tres maneres de fer el mateix):
 *   - Arrossegar una xifra de la fila de sota fins a una casella. Una xifra
 *     d'una casella es pot arrossegar a una altra casella (s'intercanvien) o
 *     fora de la suma (s'esborra).
 *   - Clicar/tocar: o bé una casella i després una xifra (la casella triada
 *     es veu amb una vora gruixuda i, en posar-hi la xifra, el cursor passa
 *     a la següent casella buida), o bé una xifra i després una casella. El
 *     botó ⌫ esborra la casella triada.
 *   - Teclat: Tab o fletxes per anar d'una casella a una altra, escriure la
 *     xifra directament (el cursor avança), ⌫ o Supr per esborrar.
 * Quan totes les caselles són plenes, es comprova sol i es mostra «37 + 38 = 75»
 * i el que fa o no fa cada número de fora.
 * DEPENDÈNCIES: js/comu.js, problemes.js, motor.js i tauler.js (carregats abans).
 * ============================================================================
 */
(() => {
    const P = window.PROBLEMES_XIFRA;
    const M = window.MotorXifra;
    const T = window.TaulerXifra;
    const N = P.llista.length;
    const ESBORRA = '⌫';

    const $ = id => document.getElementById(id);
    const els = {
        taulerWrap: $('tauler-wrap'),
        pila: $('pila'),
        missatge: $('missatge'),
        reinicia: $('btn-reinicia'),
    };
    const progres = Comu.progres('inaba.on-es-la-xifra');
    const nav = Comu.navegacio({ total: N, progres, carrega });
    const mostraMissatge = (...args) => Comu.missatge(els.missatge, ...args);
    const amagaMissatge = () => Comu.amagaMissatge(els.missatge);

    // ============================================================
    // ESTAT DEL PROBLEMA
    // ============================================================
    let actual = 0;
    let vista = null; // { el, g, caixes, pistes, pinta } de tauler.js
    let v = null; // les xifres escrites: v[f][k] (0–9 o null)
    let ordre = []; // totes les caselles en ordre de lectura: [{ f, k }]
    let cursor = null; // la casella triada { f, k }, o null
    let seleccio = null; // xifra triada a la pila (0–9), o null
    let resultat = null; // el que ha dit M.comprova quan la suma és plena
    let resolt = false;
    let acabaDArrossegar = false;
    const xifresEls = new Map(); // xifra → element de la pila
    let esborraEl = null;

    const mateixa = (a, b) => !!a && !!b && a.f === b.f && a.k === b.k;
    const caixa = (f, k) => vista.caixes[f][k];

    function carrega(i) {
        actual = Math.max(0, Math.min(N - 1, i));
        vista = T.crea(P.llista[actual]);
        v = M.buida(vista.g);
        ordre = vista.g.ns.flatMap((n, f) => Array.from({ length: n }, (_, k) => ({ f, k })));
        cursor = null;
        seleccio = null;
        resultat = null;
        resolt = false;
        ordre.forEach(({ f, k }) => configuraCaixa(caixa(f, k), f, k));
        els.taulerWrap.replaceChildren(vista.el);
        amagaMissatge();
        nav.obre(actual);
        pinta();
    }

    function configuraCaixa(d, f, k) {
        d.setAttribute('role', 'button');
        d.addEventListener('click', () => clicCaixa(f, k));
        d.addEventListener('keydown', e => teclaCaixa(e, f, k));
        d.addEventListener('focus', () => {
            if (resolt || mateixa(cursor, { f, k })) return;
            cursor = { f, k };
            pinta();
        });
        d.addEventListener('pointerdown', e => {
            if (v[f][k] !== null) iniciaArrossegament(e, v[f][k], { f, k }, d);
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

    // Posa al dia el tauler i la pila a partir de l'estat
    function pinta() {
        vista.pinta({ v, cursor: resolt ? null : cursor, resultat });
        const amb = cursor || ordre[0]; // la casella a què porta el Tab
        const noms = M.NOM_FILA;
        ordre.forEach(({ f, k }) => {
            const xifra = v[f][k];
            const nXifres = vista.g.ns[f];
            const lloc = nXifres === 1 ? '' : `, xifra ${k + 1} de ${nXifres}`;
            caixa(f, k).setAttribute('aria-label', `${noms[f]}${lloc}: ${xifra === null ? 'buida' : xifra}`);
            caixa(f, k).tabIndex = !resolt && mateixa(amb, { f, k }) ? 0 : -1;
        });
        vista.el.classList.toggle('amb-seleccio', seleccio !== null);
        vista.el.classList.toggle('resolt', resolt);
        xifresEls.forEach((t, d) => {
            t.classList.toggle('seleccionat', seleccio === d);
            t.setAttribute('aria-pressed', String(seleccio === d));
            t.tabIndex = resolt ? -1 : 0;
        });
        esborraEl.tabIndex = resolt ? -1 : 0;
        esborraEl.classList.toggle('inactiu', resolt || !cursor || v[cursor.f][cursor.k] === null);
        nav.actualitza();
    }

    // ============================================================
    // ACCIONS
    // ============================================================
    // La casella buida següent a (f, k) en ordre de lectura (donant la volta); null si no n'hi ha cap
    function seguentBuida(f, k) {
        const i = ordre.findIndex(b => b.f === f && b.k === k);
        for (let j = 1; j < ordre.length; j++) {
            const b = ordre[(i + j) % ordre.length];
            if (v[b.f][b.k] === null) return b;
        }
        return null;
    }

    // Posa la xifra d a la casella (f, k); el cursor passa a la següent casella buida
    function posa(d, f, k, { avanca = true } = {}) {
        if (resolt) return;
        const teFoco = vista.el.contains(document.activeElement);
        v[f][k] = d;
        seleccio = null;
        const seg = avanca ? seguentBuida(f, k) : null;
        cursor = seg || { f, k };
        canvi();
        Comu.anima(caixa(f, k), 'acaba-de-posar');
        if (avanca && seg && teFoco) caixa(seg.f, seg.k).focus({ preventScroll: true });
    }

    function treu(f, k) {
        if (resolt || v[f][k] === null) return;
        v[f][k] = null;
        cursor = { f, k };
        canvi();
    }

    function canvi() {
        resultat = null;
        amagaMissatge();
        pinta();
        revisa();
    }

    // Quan la suma és plena, es comprova
    function revisa() {
        const r = M.comprova(vista.g, v);
        if (!r.complet) return;
        resultat = r;
        if (r.correcte) {
            celebra(r);
            return;
        }
        pinta();
        const titol =
            r.motius.length === 1
                ? 'Encara no! Hi ha una cosa que no va bé:'
                : `Encara no! Hi ha ${r.motius.length} coses que no van bé:`;
        mostraMissatge('error', titol, r.motius);
    }

    function celebra(r) {
        resolt = true;
        progres.marcaResolt(actual + 1);
        cursor = null;
        pinta();
        ordre.forEach(({ f, k }, i) => setTimeout(() => Comu.anima(caixa(f, k), 'celebra'), i * 70));
        const frases = [`${r.suma.motiu} ✓`, ...r.pistes.map(p => `${p.motiu} ✓`)];
        const boto = nav.botoSeguent();
        const titol = nav.totsResolts()
            ? '🏆 Molt bé! Has resolt tots els problemes!'
            : '🎉 Molt bé! La suma és correcta i totes les xifres són al seu lloc.';
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
            posa(d, cursor.f, cursor.k);
        } else {
            seleccio = seleccio === d ? null : d;
            pinta();
        }
    }

    function clicCaixa(f, k) {
        if (acabaDArrossegar || resolt) return;
        if (seleccio !== null) {
            const d = seleccio;
            posa(d, f, k, { avanca: false });
            cursor = null; // xifra primer, casella després: no es deixa cap casella triada
            pinta();
        } else {
            cursor = { f, k };
            pinta();
        }
    }

    function clicEsborra() {
        if (acabaDArrossegar || resolt || !cursor) return;
        treu(cursor.f, cursor.k);
    }

    // ============================================================
    // TECLAT
    // ============================================================
    // Cap a una altra casella: a dreta/esquerra, la de la mateixa fila; amunt/avall, la primera casella
    // d'una altra fila que sigui a la mateixa columna
    function vesA(f, k, df, dk) {
        const g = vista.g;
        if (dk) {
            if (k + dk >= 0 && k + dk < g.ns[f]) caixa(f, k + dk).focus();
            return;
        }
        const c = g.col0[f] + k;
        for (let ff = f + df; ff >= 0 && ff < 3; ff += df) {
            const kk = c - g.col0[ff];
            if (kk >= 0 && kk < g.ns[ff]) return caixa(ff, kk).focus();
        }
    }

    function teclaCaixa(e, f, k) {
        if (e.altKey || e.ctrlKey || e.metaKey) return;
        if (/^[0-9]$/.test(e.key)) {
            e.preventDefault();
            posa(Number(e.key), f, k);
        } else if (e.key === 'Backspace' || e.key === 'Delete') {
            e.preventDefault();
            if (v[f][k] !== null) {
                treu(f, k);
            } else if (e.key === 'Backspace') {
                // Casella ja buida: Retrocés va a la casella anterior (com en escriure un text)
                const i = ordre.findIndex(b => b.f === f && b.k === k);
                if (i > 0) caixa(ordre[i - 1].f, ordre[i - 1].k).focus();
            }
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            vesA(f, k, 0, 1);
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            vesA(f, k, 0, -1);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            vesA(f, k, 1, 0);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            vesA(f, k, -1, 0);
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            clicCaixa(f, k);
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
            const c = cursor || ordre[0];
            caixa(c.f, c.k).focus();
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
            des, // 'pila' o { f, k } (la casella d'on surt)
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

    function caixaA(p) {
        const el = document.elementFromPoint(p.x, p.y);
        const d = el && el.closest('.caixa');
        return d && vista.el.contains(d) ? { f: Number(d.dataset.f), k: Number(d.dataset.k) } : null;
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
        const c = caixaA(p);
        if (!mateixa(c, arr.sobre)) {
            if (arr.sobre) caixa(arr.sobre.f, arr.sobre.k).classList.remove('sobre');
            if (c) caixa(c.f, c.k).classList.add('sobre');
            arr.sobre = c;
        }
    }

    function deixaArrossegament(e) {
        if (!arr) return;
        const a = arr;
        const c = a.actiu ? caixaA(mira(e)) : null;
        acabaArrossegament();
        if (!a.actiu) return; // ha estat un clic: se n'encarrega l'esdeveniment 'click'
        acabaDArrossegar = true;
        setTimeout(() => (acabaDArrossegar = false), 0);
        if (a.des === 'pila') {
            if (c) posa(a.xifra, c.f, c.k, { avanca: false });
        } else if (!c) {
            treu(a.des.f, a.des.k); // una xifra de la suma, deixada fora: s'esborra
        } else if (!mateixa(c, a.des)) {
            // D'una casella a una altra: s'intercanvien
            [v[a.des.f][a.des.k], v[c.f][c.k]] = [v[c.f][c.k], a.xifra];
            cursor = { f: c.f, k: c.k };
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
        if (arr.sobre) caixa(arr.sobre.f, arr.sobre.k).classList.remove('sobre');
        vista.el.classList.toggle('amb-seleccio', seleccio !== null);
        arr = null;
    }

    // ============================================================
    // ARRENCADA
    // ============================================================
    // Els exemples de les instruccions (【例題】, 【解答】 i els dos requadres grisos del PDF)
    function pintaInstruccions() {
        const ex = P.exemple;
        const sol = [[8], [5], [1, 3]];
        const senseP = [
            [1, 1, 2],
            [[], []],
            [[], [], []],
        ]; // la mateixa suma, sense pistes
        const cercles = [
            [1, 0], // el 5, a la fila del 5
            [2, 1], // el 3, a la columna del 3
        ];
        $('ex-problema').prepend(T.estatic(ex));
        $('ex-solucio').prepend(T.estatic(ex, { v: sol, comprova: true }));
        // Una suma correcta, i una amb un 0 a la primera xifra
        $('ex-suma-be').prepend(T.estatic(senseP, { v: sol, comprova: true }));
        $('ex-suma-zero').prepend(T.estatic(senseP, { v: [[3], [5], [0, 8]], comprova: true }));
        // Pistes: el 3 i el 5 hi són / el 3 no és enlloc de la columna
        $('ex-pista-be').prepend(T.estatic(ex, { v: sol, comprova: true, cercles }));
        $('ex-pista-mal').prepend(T.estatic(ex, { v: [[7], [5], [1, 2]], comprova: true }));
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
