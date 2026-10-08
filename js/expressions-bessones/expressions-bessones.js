/**
 * ============================================================================
 * FITXER: js/expressions-bessones/expressions-bessones.js
 * ROL: Controlador de la pàgina expressions-bessones.html (tot el que toca el DOM).
 * IDEA: les dues targetes són «bessones»: cada signe es posa una sola vegada i
 *   va a totes dues alhora, de manera que sempre tenen els mateixos signes.
 * INTERACCIÓ (tres maneres de fer el mateix):
 *   - Arrossegar un signe (+ − × ÷) fins a un forat; els parèntesis «( )», fins al
 *     signe de l'operació que s'ha de fer primer. Un signe del forat es pot
 *     arrossegar a l'altre forat (s'intercanvien) o fora (es treu).
 *   - Clicar/tocar un signe i després el forat. Clicar un signe posat el treu, i
 *     clicar un parèntesi treu els parèntesis.
 *   - Teclat: Tab o fletxes per anar d'un forat a l'altre, escriure + - * / (o x :),
 *     ( o ) per posar o treure els parèntesis, ⌫ per esborrar.
 * Quan hi ha els dos signes, es comprova sol i es mostra el càlcul de cada targeta.
 * DEPENDÈNCIES: js/comu.js, problemes.js, motor.js i tauler.js (carregats abans).
 * ============================================================================
 */
(() => {
    const P = window.PROBLEMES_BESSONES;
    const M = window.MotorBessones;
    const T = window.TaulerBessones;
    const N = P.llista.length;
    const PARENS = '( )';
    const NOMS = { '+': 'més', '−': 'menys', '×': 'per', '÷': 'entre' };
    const TECLES = {
        '+': '+',
        '-': '−',
        '−': '−',
        '*': '×',
        'x': '×',
        'X': '×',
        '×': '×',
        '/': '÷',
        ':': '÷',
        '÷': '÷',
    };

    const $ = id => document.getElementById(id);
    const els = {
        taulerWrap: $('tauler-wrap'),
        pila: $('pila'),
        missatge: $('missatge'),
        reinicia: $('btn-reinicia'),
    };
    const progres = Comu.progres('inaba.expressions-bessones');
    const nav = Comu.navegacio({ total: N, progres, carrega });
    const mostraMissatge = (...args) => Comu.missatge(els.missatge, ...args);
    const amagaMissatge = () => Comu.amagaMissatge(els.missatge);

    // ============================================================
    // ESTAT DEL PROBLEMA
    // ============================================================
    let actual = 0;
    let problema = null;
    let tria = { ops: [null, null], par: 0 }; // els signes de totes dues targetes
    let vista = null; // { el, files, pinta } de tauler.js
    let seleccio = null; // signe triat a la pila ('+', '−', '×', '÷' o '( )')
    let resolt = false;
    let acabaDArrossegar = false;
    const signesEls = new Map(); // signe → element de la pila

    function carrega(i) {
        actual = Math.max(0, Math.min(N - 1, i));
        problema = P.llista[actual];
        tria = { ops: [null, null], par: 0 };
        seleccio = null;
        resolt = false;

        vista = T.crea(problema);
        vista.files.forEach((f, k) => {
            f.forats.forEach((d, j) => configuraForat(d, j, k));
            f.parens.forEach(p => p.addEventListener('click', clicParentesi));
        });
        els.taulerWrap.replaceChildren(vista.el);
        amagaMissatge();
        nav.obre(actual);
        pinta();
    }

    // Cada forat existeix dues vegades (una per targeta), però és el mateix signe
    function configuraForat(d, j, k) {
        d.setAttribute('role', 'button');
        d.tabIndex = k === 0 ? 0 : -1; // amb el teclat, només els de la primera targeta
        d.addEventListener('click', () => clicForat(j));
        d.addEventListener('keydown', e => teclaForat(e, j));
        d.addEventListener('pointerdown', e => {
            if (tria.ops[j]) iniciaArrossegament(e, tria.ops[j], j, d);
        });
        d.addEventListener('pointerenter', () => bessons(j).forEach(b => b.classList.add('germa')));
        d.addEventListener('pointerleave', () => bessons(j).forEach(b => b.classList.remove('germa')));
    }

    const bessons = j => vista.files.map(f => f.forats[j]);

    function construeixPila() {
        [...M.SIGNES, PARENS].forEach(s => {
            const t = document.createElement('div');
            t.className = 'signe' + (s === PARENS ? ' parens' : '');
            t.textContent = s;
            t.tabIndex = 0;
            t.setAttribute('role', 'button');
            t.setAttribute('aria-label', s === PARENS ? 'Parèntesis' : `Signe ${NOMS[s]}`);
            t.addEventListener('click', () => clicSigne(s));
            t.addEventListener('keydown', e => teclaSigne(e, s));
            t.addEventListener('pointerdown', e => iniciaArrossegament(e, s, 'pila', t));
            signesEls.set(s, t);
            els.pila.appendChild(t);
        });
    }

    // Posa al dia les targetes i la pila a partir de l'estat
    function pinta() {
        vista.files.forEach((f, k) => {
            vista.pinta(k, tria);
            f.forats.forEach((d, j) => {
                const nom = j === 0 ? 'Primer signe' : 'Segon signe';
                const signe = tria.ops[j] ? NOMS[tria.ops[j]] : 'buit';
                d.setAttribute('aria-label', `${nom}: ${signe}${tria.par === j + 1 ? ', entre parèntesis' : ''}`);
                if (resolt) d.tabIndex = -1;
            });
        });
        vista.el.classList.toggle('amb-seleccio', seleccio !== null);
        vista.el.classList.toggle('resolt', resolt);
        signesEls.forEach((t, s) => {
            t.classList.toggle('seleccionat', seleccio === s);
            t.setAttribute('aria-pressed', String(seleccio === s));
            t.tabIndex = resolt ? -1 : 0;
        });
        nav.actualitza();
    }

    // ============================================================
    // ACCIONS
    // ============================================================
    // Posa el signe s al forat j (els parèntesis, al voltant de l'operació j)
    function posa(s, j) {
        if (resolt) return;
        if (s === PARENS) tria.par = j + 1;
        else tria.ops[j] = s;
        seleccio = null;
        canvi();
        bessons(j).forEach(d => Comu.anima(d, 'acaba-de-posar'));
    }

    function treu(j) {
        if (resolt) return;
        if (tria.ops[j]) tria.ops[j] = null;
        else if (tria.par === j + 1) tria.par = 0;
        else return;
        canvi();
    }

    function treuParentesis() {
        if (resolt || !tria.par) return;
        tria.par = 0;
        canvi();
    }

    function canvi() {
        vista.files.forEach(f => {
            f.fons.classList.remove('be', 'malament');
            f.estat.textContent = '';
            f.estat.className = 'estat';
        });
        amagaMissatge();
        pinta();
        revisa();
    }

    // Quan hi ha els dos signes, es comprova
    function revisa() {
        const r = M.comprova(problema, tria.ops, tria.par);
        if (!r.complet) return;
        const frases = r.targetes.map((t, k) => {
            const f = vista.files[k];
            const be = t.correcte;
            f.fons.classList.add(be ? 'be' : 'malament');
            f.estat.textContent = be ? '✓' : '✗';
            f.estat.classList.add(be ? 'be' : 'malament');
            if (t.entreZero) return `${t.passos[0]}: no es pot dividir entre 0 ✗`;
            const calcul = t.passos.join(' = ');
            return be ? `${calcul} ✓` : `${calcul}, i no ${problema[k][3]} ✗`;
        });
        if (r.correcte) {
            celebra(frases);
            return;
        }
        const quines = r.targetes.map(t => t.correcte);
        let titol = 'Encara no! Amb aquests signes, cap de les dues targetes surt:';
        if (quines[0]) titol = 'Encara no! Amb aquests signes, la targeta de dalt surt, però la de baix no:';
        else if (quines[1]) titol = 'Encara no! Amb aquests signes, la targeta de baix surt, però la de dalt no:';
        mostraMissatge('error', titol, frases);
    }

    function celebra(frases) {
        resolt = true;
        progres.marcaResolt(actual + 1);
        pinta();
        vista.files.forEach((f, k) => setTimeout(() => Comu.anima(f.fons, 'celebra'), k * 120));
        const boto = nav.botoSeguent();
        const titol = nav.totsResolts()
            ? '🏆 Molt bé! Has resolt tots els problemes!'
            : '🎉 Molt bé! Totes dues igualtats surten amb els mateixos signes.';
        mostraMissatge('ok', titol, frases, boto);
        boto.focus({ preventScroll: true });
    }

    function reinicia() {
        resolt = false;
        tria = { ops: [null, null], par: 0 };
        seleccio = null;
        canvi();
    }

    // ============================================================
    // CLIC / TOC
    // ============================================================
    function clicSigne(s) {
        if (acabaDArrossegar || resolt) return;
        seleccio = seleccio === s ? null : s;
        pinta();
    }

    function clicForat(j) {
        if (acabaDArrossegar || resolt) return;
        if (seleccio === PARENS && tria.par === j + 1) {
            // Tornar a posar els parèntesis on ja hi són els treu
            seleccio = null;
            treuParentesis();
        } else if (seleccio !== null) {
            posa(seleccio, j);
        } else if (tria.ops[j]) {
            treu(j);
        } else {
            mostraMissatge('info', 'Primer tria un signe de sota, o arrossega-lo fins aquí.');
            Comu.anima(els.pila, 'avisa');
        }
    }

    function clicParentesi() {
        if (acabaDArrossegar) return;
        treuParentesis();
    }

    // ============================================================
    // TECLAT
    // ============================================================
    function teclaForat(e, j) {
        if (e.altKey || e.ctrlKey || e.metaKey) return;
        if (TECLES[e.key]) {
            e.preventDefault();
            posa(TECLES[e.key], j);
        } else if (e.key === '(' || e.key === ')') {
            e.preventDefault();
            if (tria.par === j + 1) treuParentesis();
            else posa(PARENS, j);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            vista.files[0].forats[e.key === 'ArrowRight' ? 1 : 0].focus();
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            clicForat(j);
        } else if (e.key === 'Backspace' || e.key === 'Delete') {
            e.preventDefault();
            treu(j);
        } else if (e.key === 'Escape') {
            seleccio = null;
            pinta();
        }
    }

    function teclaSigne(e, s) {
        if (e.altKey || e.ctrlKey || e.metaKey) return;
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            clicSigne(s);
            if (seleccio === s) {
                const buit = tria.ops.findIndex(o => !o);
                vista.files[0].forats[buit >= 0 ? buit : 0].focus();
            }
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            const tots = [...signesEls.values()];
            tots[tots.indexOf(e.currentTarget) + (e.key === 'ArrowRight' ? 1 : -1)]?.focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            vista.files[0].forats[0].focus();
        } else if (e.key === 'Escape') {
            seleccio = null;
            pinta();
        }
    }

    // ============================================================
    // ARROSSEGAR (Pointer Events: ratolí, dit i llapis amb el mateix codi)
    // ============================================================
    let arr = null;

    function iniciaArrossegament(e, signe, des, el) {
        if (resolt || (e.pointerType === 'mouse' && e.button !== 0)) return;
        arr = {
            signe,
            des,
            el,
            x0: e.clientX,
            y0: e.clientY,
            tactil: e.pointerType !== 'mouse',
            actiu: false,
            sobre: -1,
        };
        document.addEventListener('pointermove', mouArrossegament);
        document.addEventListener('pointerup', deixaArrossegament);
        document.addEventListener('pointercancel', acabaArrossegament);
    }

    // On «apunta» el signe: amb el dit, una mica per sobre perquè es vegi
    function mira(e) {
        return { x: e.clientX, y: e.clientY - (arr.tactil ? 40 : 0) };
    }

    function foratA(p) {
        const el = document.elementFromPoint(p.x, p.y);
        const d = el && el.closest('.forat');
        return d && vista.el.contains(d) ? Number(d.dataset.forat) : -1;
    }

    function mouArrossegament(e) {
        if (!arr) return;
        if (!arr.actiu) {
            if (Math.hypot(e.clientX - arr.x0, e.clientY - arr.y0) < 6) return;
            arr.actiu = true;
            seleccio = null;
            pinta();
            arr.fantasma = document.createElement('div');
            arr.fantasma.className = 'signe fantasma';
            arr.fantasma.textContent = arr.signe;
            document.body.appendChild(arr.fantasma);
            arr.el.classList.add('arrossegant');
            vista.el.classList.add('amb-seleccio');
        }
        e.preventDefault();
        const p = mira(e);
        arr.fantasma.style.left = p.x + 'px';
        arr.fantasma.style.top = p.y + 'px';
        const j = foratA(p);
        if (j !== arr.sobre) {
            if (arr.sobre >= 0) bessons(arr.sobre).forEach(d => d.classList.remove('sobre'));
            if (j >= 0) bessons(j).forEach(d => d.classList.add('sobre'));
            arr.sobre = j;
        }
    }

    function deixaArrossegament(e) {
        if (!arr) return;
        const a = arr;
        const j = a.actiu ? foratA(mira(e)) : -1;
        acabaArrossegament();
        if (!a.actiu) return; // ha estat un clic: se n'encarrega l'esdeveniment 'click'
        acabaDArrossegar = true;
        setTimeout(() => (acabaDArrossegar = false), 0);
        if (a.des === 'pila') {
            if (j >= 0) posa(a.signe, j);
        } else if (j < 0) {
            treu(a.des); // un signe del forat, deixat fora: es treu
        } else if (j !== a.des) {
            // D'un forat a l'altre: s'intercanvien
            [tria.ops[a.des], tria.ops[j]] = [tria.ops[j], a.signe];
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
        if (arr.sobre >= 0) bessons(arr.sobre).forEach(d => d.classList.remove('sobre'));
        vista.el.classList.toggle('amb-seleccio', seleccio !== null);
        arr = null;
    }

    // ============================================================
    // ARRENCADA
    // ============================================================
    function pintaInstruccions() {
        const ex = P.exemple;
        const res = { ops: ['+', '×'], par: 1 };
        $('ex-problema').prepend(
            T.estatic(ex, [
                { ops: [null, null], par: 0 },
                { ops: [null, null], par: 0 },
            ])
        );
        $('ex-solucio').prepend(T.estatic(ex, [res, res], { estats: ['be', 'be'] }));
        // Una targeta sola: 1 1 2 = 4
        const una = [ex[0]];
        $('ex-be').prepend(T.estatic(una, [{ ops: ['+', '+'], par: 0 }], { estats: ['be'] }));
        $('ex-malament').prepend(T.estatic(una, [{ ops: ['+', '×'], par: 0 }], { estats: ['malament'] }));
        // Les dues targetes: amb els mateixos signes, o no
        $('ex-iguals').prepend(T.estatic(ex, [res, res], { estats: ['be', 'be'] }));
        $('ex-diferents').prepend(
            T.estatic(
                ex,
                [
                    { ops: ['+', '+'], par: 0 },
                    { ops: ['×', '+'], par: 0 },
                ],
                { estats: ['malament', 'malament'] }
            )
        );
    }

    els.reinicia.addEventListener('click', reinicia);
    // Esc fora d'un forat o d'un signe: desfà la tria
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
