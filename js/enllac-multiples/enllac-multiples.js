/**
 * ============================================================================
 * FITXER: js/enllac-multiples/enllac-multiples.js
 * ROL: Controlador de la pàgina enllac-multiples.html (tot el que toca el DOM).
 * INTERACCIÓ (tres maneres de fer el mateix):
 *   - Arrossegar una targeta (ratolí o dit) fins a un lloc. Una targeta del
 *     tauler es pot arrossegar a un altre lloc o fora del tauler (torna a baix).
 *   - Clicar/tocar una targeta i després el lloc. Clicar una targeta del
 *     tauler la treu.
 *   - Teclat: Tab o fletxes per anar d'un lloc a l'altre, escriure el número
 *     de la targeta, ⌫/Supr per treure-la, Esc per desfer la tria.
 * Quan tots els llocs són plens, es comprova sol.
 * El progrés, la capçalera i els missatges són de js/comu.js.
 * DEPENDÈNCIES: js/comu.js, problemes.js, motor.js i tauler.js (carregats abans).
 * ============================================================================
 */
(() => {
    const P = window.PROBLEMES_ENLLAC;
    const M = window.MotorEnllac;
    const T = window.TaulerEnllac;
    const N = P.llista.length;
    const ESPERA_TECLAT = 900; // ms per escriure la segona xifra d'un número

    const $ = id => document.getElementById(id);
    const els = {
        taulerWrap: $('tauler-wrap'),
        pila: $('pila'),
        missatge: $('missatge'),
        reinicia: $('btn-reinicia'),
    };
    const progres = Comu.progres('inaba.enllac-multiples');
    const nav = Comu.navegacio({ total: N, progres, carrega });

    // ============================================================
    // ESTAT DEL PROBLEMA
    // ============================================================
    let actual = 0; // índex del problema (0…N-1)
    let problema = null;
    let tauler = []; // valor de cada lloc (null = buit)
    let vista = null; // { el, llocs, fletxes, etiqueta } de tauler.js
    let targetesEls = new Map(); // valor → element de la targeta a la pila
    let fixes = new Set(); // valors de les targetes que ja hi eren
    let seleccio = null; // valor de la targeta triada a la pila
    let resolt = false;
    let escrit = ''; // xifres teclejades en un lloc
    let llocEscrit = -1;
    let temporitzador = null;
    let acabaDArrossegar = false;

    function carrega(i) {
        actual = Math.max(0, Math.min(N - 1, i));
        problema = P.llista[actual];
        tauler = M.taulerInicial(problema);
        fixes = new Set(tauler.filter(v => v !== null));
        seleccio = null;
        resolt = false;
        anulaEscrit();

        vista = T.crea(problema);
        vista.llocs.forEach(configuraLloc);
        els.taulerWrap.replaceChildren(vista.el);
        construeixPila();
        amagaMissatge();
        nav.obre(actual);
        pinta();
    }

    function configuraLloc(div, j) {
        div.dataset.lloc = j;
        if (M.esFix(problema, j)) {
            div.classList.add('fix');
            div.textContent = tauler[j];
            div.setAttribute('role', 'img');
            div.setAttribute('aria-label', `Targeta ${tauler[j]}, ja hi era`);
            return;
        }
        div.tabIndex = 0;
        div.setAttribute('role', 'button');
        div.addEventListener('click', () => clicLloc(j));
        div.addEventListener('keydown', e => teclaLloc(e, j));
        div.addEventListener('pointerdown', e => {
            if (tauler[j] !== null) iniciaArrossegament(e, tauler[j], j, div);
        });
    }

    function construeixPila() {
        targetesEls = new Map();
        els.pila.replaceChildren(
            ...problema.targetes.map(v => {
                const t = document.createElement('div');
                t.className = 'targeta';
                t.textContent = v;
                targetesEls.set(v, t);
                if (fixes.has(v)) return t;
                t.dataset.valor = v;
                t.addEventListener('click', () => clicTargeta(v));
                t.addEventListener('keydown', e => teclaTargeta(e, v));
                t.addEventListener('pointerdown', e => iniciaArrossegament(e, v, 'pila', t));
                return t;
            })
        );
    }

    // Posa al dia llocs, pila i capçalera a partir de l'estat
    function pinta() {
        vista.llocs.forEach((div, j) => {
            if (M.esFix(problema, j)) return;
            const v = tauler[j];
            div.classList.toggle('ple', v !== null);
            div.classList.toggle('buit', v === null);
            div.classList.remove('escrivint');
            div.textContent = v === null ? '' : v;
            div.setAttribute('aria-label', v === null ? 'Lloc buit' : `Targeta ${v}`);
            div.tabIndex = resolt ? -1 : 0;
        });
        vista.el.classList.toggle('amb-seleccio', seleccio !== null);
        vista.el.classList.toggle('resolt', resolt);

        const alTauler = new Set(tauler.filter(v => v !== null));
        targetesEls.forEach((t, v) => {
            const usada = alTauler.has(v);
            const fix = fixes.has(v);
            t.classList.toggle('usada', usada);
            t.classList.toggle('seleccionada', seleccio === v);
            if (fix) {
                t.setAttribute('aria-label', `Targeta ${v}, ja és al tauler`);
                return;
            }
            t.tabIndex = usada || resolt ? -1 : 0;
            t.setAttribute('role', 'button');
            t.setAttribute('aria-label', usada ? `Targeta ${v}, ja és al tauler` : `Targeta ${v}`);
            t.setAttribute('aria-disabled', String(usada || resolt));
            t.setAttribute('aria-pressed', String(seleccio === v));
        });

        nav.actualitza();
    }

    // ============================================================
    // ACCIONS
    // ============================================================
    // Posa la targeta v al lloc j. Si ja era en un altre lloc, s'intercanvien.
    function posa(v, j) {
        if (resolt || M.esFix(problema, j)) return;
        const des = tauler.indexOf(v);
        if (des === j) {
            seleccio = null;
            pinta();
            return;
        }
        if (des >= 0) tauler[des] = tauler[j];
        tauler[j] = v;
        seleccio = null;
        canvi();
        anima(vista.llocs[j], 'acaba-de-posar');
    }

    function treu(j) {
        if (resolt || tauler[j] === null) return;
        tauler[j] = null;
        canvi();
    }

    function canvi() {
        vista.fletxes.forEach((f, i) => {
            f.g.classList.remove('erronia');
            vista.etiqueta(i, '');
        });
        amagaMissatge();
        pinta();
        revisa();
    }

    // Quan el tauler és ple, es comprova
    function revisa() {
        const r = M.comprova(problema, tauler);
        if (!r.complet) return;
        if (r.correcte) {
            celebra();
            return;
        }
        r.errors.forEach(i => {
            vista.fletxes[i].g.classList.add('erronia');
            vista.etiqueta(i, '✗');
        });
        const frases = r.errors.map(i => {
            const [o, d] = problema.fletxes[i];
            return `${tauler[d]} no és múltiple de ${tauler[o]}`;
        });
        mostraMissatge(
            'error',
            frases.length === 1
                ? 'Encara no! Hi ha una fletxa que no funciona:'
                : 'Encara no! Hi ha fletxes que no funcionen:',
            frases
        );
    }

    function celebra() {
        resolt = true;
        problema.fletxes.forEach(([o, d], i) => vista.etiqueta(i, '×' + tauler[d] / tauler[o]));
        progres.marcaResolt(actual + 1);
        pinta();
        vista.llocs.forEach((div, j) => setTimeout(() => anima(div, 'celebra'), j * 70));

        const frases = problema.fletxes.map(([o, d]) => `${tauler[d]} = ${tauler[o]} × ${tauler[d] / tauler[o]}`);
        const boto = nav.botoSeguent();
        const titol = nav.totsResolts()
            ? '🏆 Molt bé! Has resolt tots els problemes!'
            : '🎉 Molt bé! Cada fletxa porta a un múltiple.';
        mostraMissatge('ok', titol, frases, boto);
        boto.focus({ preventScroll: true });
    }

    function reinicia() {
        resolt = false;
        tauler = M.taulerInicial(problema);
        seleccio = null;
        anulaEscrit();
        canvi();
    }

    // ============================================================
    // CLIC / TOC
    // ============================================================
    function clicTargeta(v) {
        if (acabaDArrossegar || resolt || tauler.includes(v)) return;
        anulaEscrit();
        seleccio = seleccio === v ? null : v;
        pinta();
    }

    function clicLloc(j) {
        if (acabaDArrossegar || resolt) return;
        anulaEscrit();
        if (seleccio !== null) posa(seleccio, j);
        else if (tauler[j] !== null) treu(j);
        else {
            mostraMissatge('info', 'Primer tria una targeta de sota, o arrossega-la fins aquí.');
            anima(els.pila, 'avisa');
        }
    }

    // ============================================================
    // TECLAT
    // ============================================================
    function teclaLloc(e, j) {
        if (e.altKey || e.ctrlKey || e.metaKey) return;
        if (/^[0-9]$/.test(e.key)) {
            e.preventDefault();
            if (!resolt) escriu(j, e.key);
            return;
        }
        const fletxes = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
        if (fletxes[e.key]) {
            e.preventDefault();
            anulaEscrit(true);
            mouFocus(j, ...fletxes[e.key]);
            return;
        }
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (escrit && llocEscrit === j) confirmaEscrit();
            else clicLloc(j);
        } else if (e.key === 'Backspace' || e.key === 'Delete') {
            e.preventDefault();
            if (escrit) anulaEscrit(true);
            else treu(j);
        } else if (e.key === 'Escape') {
            anulaEscrit(true);
            seleccio = null;
            pinta();
        }
    }

    function teclaTargeta(e, v) {
        if (e.altKey || e.ctrlKey || e.metaKey) return;
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            clicTargeta(v);
            if (seleccio === v) primerLlocBuit()?.focus();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            const lliures = [...targetesEls.values()].filter(t => t.tabIndex === 0);
            const k = lliures.indexOf(e.currentTarget) + (e.key === 'ArrowRight' ? 1 : -1);
            lliures[k]?.focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            primerLlocBuit()?.focus();
        } else if (e.key === 'Escape') {
            seleccio = null;
            pinta();
        }
    }

    function primerLlocBuit() {
        const j = tauler.findIndex(v => v === null);
        if (j >= 0) return vista.llocs[j];
        return vista.llocs.find(div => div.tabIndex === 0);
    }

    // Va al lloc més proper en la direcció (dx, dy); avall de tot, a la pila
    function mouFocus(j, dx, dy) {
        const [c0, f0] = problema.llocs[j];
        let millor = -1;
        let millorCost = Infinity;
        problema.llocs.forEach(([c, f], k) => {
            if (k === j || M.esFix(problema, k)) return;
            const avanc = dx ? (c - c0) * dx : (f - f0) * dy;
            if (avanc <= 0) return;
            const cost = avanc + 2 * (dx ? Math.abs(f - f0) : Math.abs(c - c0));
            if (cost < millorCost) {
                millorCost = cost;
                millor = k;
            }
        });
        if (millor >= 0) vista.llocs[millor].focus();
        else if (dy > 0) [...targetesEls.values()].find(t => t.tabIndex === 0)?.focus();
    }

    // Les xifres teclejades en un lloc posen la targeta d'aquell número.
    // Si encara pot ser un número més llarg (3 → 36), s'espera una mica.
    function escriu(j, xifra) {
        if (llocEscrit !== j) anulaEscrit(true);
        llocEscrit = j;
        escrit += xifra;
        const possibles = problema.targetes.filter(v => String(v).startsWith(escrit));
        const movibles = possibles.filter(v => !fixes.has(v));
        if (movibles.length === 0) {
            const txt = escrit;
            anulaEscrit(true);
            mostraMissatge(
                'info',
                possibles.includes(Number(txt))
                    ? `La targeta del ${txt} ja és al tauler.`
                    : `No hi ha cap targeta amb el ${txt}.`
            );
            anima(vista.llocs[j], 'sacseja');
            return;
        }
        const exacta = movibles.find(v => String(v) === escrit);
        if (exacta !== undefined && movibles.length === 1) {
            anulaEscrit();
            posa(exacta, j);
            return;
        }
        const div = vista.llocs[j];
        div.classList.add('escrivint');
        div.textContent = escrit;
        clearTimeout(temporitzador);
        temporitzador = setTimeout(confirmaEscrit, ESPERA_TECLAT);
    }

    function confirmaEscrit() {
        const j = llocEscrit;
        const txt = escrit;
        anulaEscrit();
        const v = Number(txt);
        if (problema.targetes.includes(v) && !fixes.has(v)) {
            posa(v, j);
        } else {
            pinta();
            mostraMissatge('info', `No hi ha cap targeta amb el ${txt}.`);
            anima(vista.llocs[j], 'sacseja');
        }
    }

    function anulaEscrit(repinta = false) {
        clearTimeout(temporitzador);
        temporitzador = null;
        const hiHavia = escrit !== '';
        escrit = '';
        llocEscrit = -1;
        if (repinta && hiHavia) pinta();
    }

    // ============================================================
    // ARROSSEGAR (Pointer Events: ratolí, dit i llapis amb el mateix codi)
    // ============================================================
    let arr = null;

    function iniciaArrossegament(e, valor, des, el) {
        if (resolt || (e.pointerType === 'mouse' && e.button !== 0)) return;
        arr = {
            valor,
            des, // 'pila' o l'índex del lloc d'on surt
            el,
            x0: e.clientX,
            y0: e.clientY,
            tactil: e.pointerType !== 'mouse',
            actiu: false,
            fantasma: null,
            sobre: null,
        };
        document.addEventListener('pointermove', mouArrossegament);
        document.addEventListener('pointerup', deixaArrossegament);
        document.addEventListener('pointercancel', acabaArrossegament);
    }

    // El punt on «apunta» la targeta: amb el dit, una mica per sobre perquè es vegi
    function mira(e) {
        return { x: e.clientX, y: e.clientY - (arr.tactil ? 40 : 0) };
    }

    function llocA(p) {
        const el = document.elementFromPoint(p.x, p.y);
        const div = el && el.closest('.lloc');
        if (!div || !vista.el.contains(div) || div.classList.contains('fix')) return null;
        return div;
    }

    function mouArrossegament(e) {
        if (!arr) return;
        if (!arr.actiu) {
            if (Math.hypot(e.clientX - arr.x0, e.clientY - arr.y0) < 6) return;
            arr.actiu = true;
            anulaEscrit(true);
            seleccio = null;
            pinta();
            arr.fantasma = document.createElement('div');
            arr.fantasma.className = 'targeta fantasma';
            arr.fantasma.textContent = arr.valor;
            document.body.appendChild(arr.fantasma);
            arr.el.classList.add('arrossegant');
            vista.el.classList.add('amb-seleccio');
        }
        e.preventDefault();
        const p = mira(e);
        arr.fantasma.style.left = p.x + 'px';
        arr.fantasma.style.top = p.y + 'px';
        const div = llocA(p);
        if (div !== arr.sobre) {
            arr.sobre?.classList.remove('sobre');
            div?.classList.add('sobre');
            arr.sobre = div;
        }
    }

    function deixaArrossegament(e) {
        if (!arr) return;
        const a = arr;
        const div = a.actiu ? llocA(mira(e)) : null;
        acabaArrossegament();
        if (!a.actiu) return; // ha estat un clic: se n'encarrega l'esdeveniment 'click'
        acabaDArrossegar = true;
        setTimeout(() => (acabaDArrossegar = false), 0);
        if (div) posa(a.valor, Number(div.dataset.lloc));
        else if (a.des !== 'pila') treu(a.des); // fora del tauler: torna a baix
    }

    function acabaArrossegament() {
        document.removeEventListener('pointermove', mouArrossegament);
        document.removeEventListener('pointerup', deixaArrossegament);
        document.removeEventListener('pointercancel', acabaArrossegament);
        if (!arr) return;
        arr.fantasma?.remove();
        arr.el.classList.remove('arrossegant');
        arr.sobre?.classList.remove('sobre');
        vista.el.classList.toggle('amb-seleccio', seleccio !== null);
        arr = null;
    }

    // ============================================================
    // MISSATGES I ANIMACIONS
    // ============================================================
    const mostraMissatge = (...args) => Comu.missatge(els.missatge, ...args);
    const amagaMissatge = () => Comu.amagaMissatge(els.missatge);
    const anima = Comu.anima;

    // ============================================================
    // ARRENCADA
    // ============================================================
    function pintaInstruccions() {
        const ex = P.exemple;
        $('ex-problema').prepend(T.estatic(ex, [10, null, null, null], { amplada: 200 }));
        $('ex-solucio').prepend(
            T.estatic(ex, [10, 5, 4, 20], { amplada: 200, etiquetes: ['×2', '×4', '×5'], estat: 'resolt' })
        );
        // Una parella de targetes amb una fletxa: [0, 1] cap a la dreta, [1, 0] cap a l'esquerra
        const DUES = [[0, 0], [1, 0]]; // prettier-ignore
        const parella = (fletxa, valors, etiqueta, estat) =>
            T.estatic({ llocs: DUES, fletxes: [fletxa] }, valors, { amplada: 160, etiquetes: [etiqueta], estat });
        $('ex-be-1').prepend(parella([1, 0], [10, 5], '×2', 'resolt'));
        $('ex-be-2').prepend(parella([0, 1], [4, 20], '×5', 'resolt'));
        $('ex-malament').prepend(parella([1, 0], [10, 4], '✗', 'error'));
    }

    els.reinicia.addEventListener('click', reinicia);
    // Esc fora d'un lloc o d'una targeta: desfà la tria
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && seleccio !== null && !nav.dialegObert()) {
            seleccio = null;
            pinta();
        }
    });

    pintaInstruccions();
    carrega(nav.inicial());
})();
