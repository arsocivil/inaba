/**
 * ============================================================================
 * FITXER: js/escala-nombres/escala-nombres.js
 * ROL: Controlador de la pàgina escala-nombres.html (tot el que toca el DOM).
 * INTERACCIÓ: s'escriu un nombre (d'una o més xifres) a cada cercle buit.
 *   - Tocar un cercle el tria; les xifres del teclat de sota s'hi van escrivint
 *     (1, després 2 → 12). La primera xifra després de triar-lo substitueix el
 *     nombre que hi havia. ⌫ esborra l'última xifra. Si no hi ha cap cercle
 *     triat, una xifra va al primer cercle buit.
 *   - Arrossegar una xifra del teclat a un cercle: el tria i hi escriu aquella
 *     xifra (se n'hi poden afegir més tocant el teclat). Arrossegar un nombre
 *     d'un cercle fora del tauler l'esborra.
 *   - Teclat: Tab o fletxes per anar d'un cercle a l'altre, xifres per escriure,
 *     ⌫ per esborrar l'última xifra, Supr per buidar el cercle, Enter per anar
 *     al cercle buit següent.
 * Quan tots els cercles tenen nombre, es comprova sol.
 * DEPENDÈNCIES: js/comu.js, problemes.js, motor.js i tauler.js (carregats abans).
 * ============================================================================
 */
(() => {
    const P = window.PROBLEMES_ESCALA;
    const M = window.MotorEscala;
    const T = window.TaulerEscala;
    const N = P.llista.length;
    const MAX_XIFRES = 3;
    const ESBORRA = '⌫';

    const $ = id => document.getElementById(id);
    const els = {
        taulerWrap: $('tauler-wrap'),
        pila: $('pila'),
        missatge: $('missatge'),
        reinicia: $('btn-reinicia'),
    };
    const progres = Comu.progres('inaba.escala-nombres');
    const nav = Comu.navegacio({ total: N, progres, carrega });
    const mostraMissatge = (...args) => Comu.missatge(els.missatge, ...args);
    const amagaMissatge = () => Comu.amagaMissatge(els.missatge);

    // ============================================================
    // ESTAT DEL PROBLEMA
    // ============================================================
    let actual = 0;
    let problema = null;
    let valors = []; // un nombre o null per cercle
    let triat = null; // el cercle on s'escriu
    let nou = true; // la xifra següent substitueix el nombre del cercle triat (acabat de triar)
    let resultat = null; // la comprovació, quan tots els cercles són plens
    let vista = null; // { el, cercles, pinta } de tauler.js
    let resolt = false;
    let acabaDArrossegar = false;

    function carrega(i) {
        actual = Math.max(0, Math.min(N - 1, i));
        problema = P.llista[actual];
        valors = M.inicials(problema);
        triat = null;
        nou = true;
        resultat = null;
        resolt = false;

        vista = T.crea(problema);
        vista.cercles.forEach(configuraCercle);
        els.taulerWrap.replaceChildren(vista.el);
        amagaMissatge();
        nav.obre(actual);
        pinta();
    }

    function configuraCercle(div, i) {
        if (M.esFix(problema, i)) {
            div.setAttribute('aria-label', `Cercle amb el ${valors[i]}`);
            return;
        }
        div.tabIndex = 0;
        div.setAttribute('role', 'button');
        div.addEventListener('click', () => clicCercle(i));
        div.addEventListener('keydown', e => teclaCercle(e, i));
        div.addEventListener('focus', () => {
            if (resolt || triat === i) return;
            tria(i);
        });
        div.addEventListener('pointerdown', e => {
            if (valors[i] !== null) iniciaArrossegament(e, valors[i], i, div);
        });
    }

    function construeixPila() {
        const tecla = (text, etiqueta, accio) => {
            const t = document.createElement('div');
            t.className = 'xifra';
            t.textContent = text;
            t.tabIndex = 0;
            t.setAttribute('role', 'button');
            t.setAttribute('aria-label', etiqueta);
            t.addEventListener('click', () => {
                if (!acabaDArrossegar) accio();
            });
            t.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    accio();
                }
            });
            els.pila.appendChild(t);
            return t;
        };
        for (const d of [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]) {
            const t = tecla(d, `Xifra ${d}`, () => xifra(d));
            t.addEventListener('pointerdown', e => iniciaArrossegament(e, d, 'pila', t));
        }
        tecla(ESBORRA, "Esborra l'última xifra", esborraXifra).classList.add('esborra');
    }

    // Posa al dia el tauler a partir de l'estat
    function pinta() {
        const estats = resultat ? resultat.fileres.map(r => (r.estat === 'be' ? 'be' : 'malament')) : [];
        vista.pinta({ valors, estats, salts: resolt, triat: resolt ? null : triat });
        vista.el.classList.toggle('resolt', resolt);
        vista.cercles.forEach((div, i) => {
            if (M.esFix(problema, i)) return;
            div.tabIndex = resolt ? -1 : 0;
            div.setAttribute('aria-label', valors[i] === null ? 'Cercle buit' : `Cercle amb el ${valors[i]}`);
        });
        nav.actualitza();
    }

    // ============================================================
    // ACCIONS
    // ============================================================
    function tria(i) {
        triat = i;
        nou = true;
        pinta();
    }

    const primerBuit = (des = -1) => {
        const n = valors.length;
        for (let k = 1; k <= n; k++) {
            const i = (des + k + n) % n;
            if (valors[i] === null && !M.esFix(problema, i)) return i;
        }
        return null;
    };

    // Escriu la xifra d al cercle triat (o al primer buit)
    function xifra(d) {
        if (resolt) return;
        if (triat === null) {
            triat = primerBuit();
            nou = true;
            if (triat === null) {
                mostraMissatge('info', 'Toca el cercle on vols escriure.');
                return;
            }
        }
        const abans = nou || valors[triat] === null ? '' : String(valors[triat]);
        const text = abans + d;
        if (Number(text) === 0) {
            mostraMissatge('info', 'Compte! No es pot fer servir el 0.');
            Comu.anima(vista.cercles[triat], 'sacseja');
            return;
        }
        if (text.length > MAX_XIFRES) {
            mostraMissatge('info', `Com a molt, nombres de ${MAX_XIFRES} xifres.`);
            return;
        }
        const el = vista.cercles[triat];
        valors[triat] = Number(text);
        nou = false;
        canvi();
        Comu.anima(el, 'acaba-de-posar');
    }

    function esborraXifra() {
        if (resolt || triat === null || valors[triat] === null) return;
        const v = Math.floor(valors[triat] / 10);
        valors[triat] = v === 0 ? null : v;
        nou = false;
        canvi();
    }

    function buida(i) {
        if (resolt || M.esFix(problema, i) || valors[i] === null) return;
        valors[i] = null;
        nou = true;
        canvi();
    }

    function reinicia() {
        resolt = false;
        valors = M.inicials(problema);
        triat = null;
        canvi();
    }

    function canvi() {
        amagaMissatge();
        resultat = null;
        revisa();
        pinta();
    }

    // Una filera, de petit a gran: «2, 4, 6»
    function creixent(f) {
        const vs = f.map(i => valors[i]);
        return vs[0] < vs[vs.length - 1] ? vs : vs.reverse();
    }

    // Quan tots els cercles són plens, es comprova
    function revisa() {
        const r = M.comprova(problema, valors);
        if (!r.complet) return;
        resultat = r;
        if (r.correcte) {
            celebra();
            return;
        }
        const motius = r.fileres.filter(f => f.estat !== 'be').map(f => f.motiu);
        mostraMissatge(
            'error',
            motius.length === 1
                ? 'Encara no! Hi ha una filera que no és una escala:'
                : 'Encara no! Hi ha fileres que no són escales:',
            motius
        );
    }

    function celebra() {
        resolt = true;
        triat = null;
        progres.marcaResolt(actual + 1);
        const frases = problema.fileres.map(f => {
            const vs = creixent(f);
            const d = vs[1] - vs[0];
            return `${vs.join(', ')}: augmenten de ${d} en ${d}.`;
        });
        const boto = nav.botoSeguent();
        const titol = nav.totsResolts()
            ? '🏆 Molt bé! Has resolt totes les escales!'
            : '🎉 Molt bé! Cada filera augmenta sempre igual.';
        mostraMissatge('ok', titol, frases, boto);
        setTimeout(() => boto.focus({ preventScroll: true }), 0);
    }

    // ============================================================
    // CLIC / TOC
    // ============================================================
    function clicCercle(i) {
        if (acabaDArrossegar || resolt) return;
        tria(i); // (el focus ja l'ha triat, però tornar-hi a tocar el torna a «estrenar»: la xifra substitueix)
    }

    // ============================================================
    // TECLAT
    // ============================================================
    function teclaCercle(e, i) {
        if (e.altKey || e.ctrlKey || e.metaKey || resolt) return;
        if (/^[0-9]$/.test(e.key)) {
            e.preventDefault();
            if (triat !== i) tria(i);
            xifra(Number(e.key));
        } else if (e.key === 'Backspace') {
            e.preventDefault();
            if (triat !== i) tria(i);
            esborraXifra();
        } else if (e.key === 'Delete') {
            e.preventDefault();
            buida(i);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const j = primerBuit(i);
            if (j !== null) vista.cercles[j].focus();
        } else if (e.key === ' ') {
            e.preventDefault();
            clicCercle(i);
        } else if (e.key.startsWith('Arrow')) {
            e.preventDefault();
            const dir = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
            mouFocus(i, ...dir);
        } else if (e.key === 'Escape') {
            triat = null;
            vista.cercles[i].blur();
            pinta();
        }
    }

    // Va al cercle buit (o escrit per tu) més proper en la direcció (dx, dy)
    function mouFocus(i, dx, dy) {
        const [x0, y0] = problema.nodes[i];
        let millor = -1;
        let millorCost = Infinity;
        problema.nodes.forEach(([x, y], j) => {
            if (j === i || M.esFix(problema, j)) return;
            const avanc = (x - x0) * dx + (y - y0) * dy;
            if (avanc <= 5) return;
            const lateral = Math.abs((x - x0) * dy - (y - y0) * dx);
            const cost = avanc + 2 * lateral;
            if (cost < millorCost) {
                millorCost = cost;
                millor = j;
            }
        });
        if (millor >= 0) vista.cercles[millor].focus();
    }

    // ============================================================
    // ARROSSEGAR (Pointer Events: ratolí, dit i llapis amb el mateix codi)
    // ============================================================
    let arr = null;

    function iniciaArrossegament(e, valor, des, el) {
        if (resolt || (e.pointerType === 'mouse' && e.button !== 0)) return;
        arr = { valor, des, el, x0: e.clientX, y0: e.clientY, tactil: e.pointerType !== 'mouse', actiu: false, sobre: -1 }; // prettier-ignore
        document.addEventListener('pointermove', mouArrossegament);
        document.addEventListener('pointerup', deixaArrossegament);
        document.addEventListener('pointercancel', acabaArrossegament);
    }

    // On «apunta» el nombre: amb el dit, una mica per sobre perquè es vegi
    function mira(e) {
        return { x: e.clientX, y: e.clientY - (arr.tactil ? 40 : 0) };
    }

    function cercleA(q) {
        const el = document.elementFromPoint(q.x, q.y);
        const d = el && el.closest('.cercle');
        if (!d || !vista.el.contains(d)) return -1;
        const i = Number(d.dataset.cercle);
        return M.esFix(problema, i) ? -1 : i;
    }

    function mouArrossegament(e) {
        if (!arr) return;
        if (!arr.actiu) {
            if (Math.hypot(e.clientX - arr.x0, e.clientY - arr.y0) < 6) return;
            arr.actiu = true;
            arr.fantasma = document.createElement('div');
            arr.fantasma.className = 'xifra fantasma';
            arr.fantasma.textContent = arr.valor;
            document.body.appendChild(arr.fantasma);
            arr.el.classList.add('arrossegant');
            vista.el.classList.add('amb-seleccio');
        }
        e.preventDefault();
        const q = mira(e);
        arr.fantasma.style.left = q.x + 'px';
        arr.fantasma.style.top = q.y + 'px';
        const c = cercleA(q);
        if (c !== arr.sobre) {
            if (arr.sobre >= 0) vista.cercles[arr.sobre].classList.remove('sobre');
            if (c >= 0) vista.cercles[c].classList.add('sobre');
            arr.sobre = c;
        }
    }

    function deixaArrossegament(e) {
        if (!arr) return;
        const a = arr;
        const c = a.actiu ? cercleA(mira(e)) : -1;
        acabaArrossegament();
        if (!a.actiu) return; // ha estat un clic: se n'encarrega l'esdeveniment 'click'
        acabaDArrossegar = true;
        setTimeout(() => (acabaDArrossegar = false), 0);
        if (a.des === 'pila') {
            if (c >= 0) {
                triat = c;
                nou = true;
                xifra(a.valor);
            }
        } else if (c < 0) {
            buida(a.des); // un nombre d'un cercle, deixat fora: s'esborra
        } else if (c !== a.des) {
            // D'un cercle a un altre: s'intercanvien
            [valors[a.des], valors[c]] = [valors[c], a.valor];
            triat = c;
            nou = true;
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
        if (arr.sobre >= 0) vista.cercles[arr.sobre].classList.remove('sobre');
        vista.el.classList.remove('amb-seleccio');
        arr = null;
    }

    // ============================================================
    // ARRENCADA
    // ============================================================
    function pintaInstruccions() {
        const ex = P.exemple;
        const sol = M.resol(ex)[0];
        const o = { amplada: 190 };
        $('ex-problema').prepend(T.estatic(ex, o));
        $('ex-solucio').prepend(T.estatic(ex, { ...o, valors: sol, estats: ex.fileres.map(() => 'be') }));
        // Una filera amb el 3 repetit (la de dalt a la dreta): 3, 3, 3
        const repetit = [3, 3, 1, 2, 3, 4];
        const estats = ex.fileres.map(f => (M.filera(f.map(i => repetit[i])).estat === 'be' ? '' : 'malament'));
        $('ex-repetit').prepend(T.estatic(ex, { ...o, valors: repetit, estats }));
        $('ex-salts').prepend(
            T.estatic(ex, { amplada: 230, valors: sol, estats: ex.fileres.map(() => 'be'), salts: true })
        );
    }

    construeixPila();
    els.reinicia.addEventListener('click', reinicia);

    pintaInstruccions();
    carrega(nav.inicial());
})();
