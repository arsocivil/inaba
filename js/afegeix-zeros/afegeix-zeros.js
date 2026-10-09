/**
 * ============================================================================
 * FITXER: js/afegeix-zeros/afegeix-zeros.js
 * ROL: Controlador de la pàgina afegeix-zeros.html (tot el que toca el DOM).
 * INTERACCIÓ: s'afegeixen zeros al final de les targetes (3 → 30 → 300):
 *   - Tocar (o clicar) una targeta hi afegeix un zero (també si es toca un
 *     dels seus zeros: el zero nou surt just on s'ha tocat, i un segon toc ha
 *     d'afegir-ne un altre, no treure'l). El botó «−» de sota la targeta en
 *     treu un.
 *   - Arrossegar el «0» de sota fins a una targeta hi afegeix un zero;
 *     arrossegar un zero d'una targeta fora d'ella el treu.
 *   - Teclat: Tab o fletxes per anar d'una targeta a l'altra; 0, Enter o
 *     espai per afegir un zero; ⌫ o Supr per treure'n un.
 * Quan la igualtat és correcta, es diu sol. El botó «Comprova» mostra el
 * càlcul de la igualtat tal com està (per saber si falta o sobra).
 * DEPENDÈNCIES: js/comu.js, problemes.js, motor.js i tauler.js (carregats abans).
 * ============================================================================
 */
(() => {
    const P = window.PROBLEMES_ZEROS;
    const M = window.MotorZeros;
    const T = window.TaulerZeros;
    const N = P.llista.length;

    const $ = id => document.getElementById(id);
    const els = {
        taulerWrap: $('tauler-wrap'),
        pila: $('pila'),
        missatge: $('missatge'),
        comprova: $('btn-comprova'),
        reinicia: $('btn-reinicia'),
    };
    const progres = Comu.progres('inaba.afegeix-zeros');
    const nav = Comu.navegacio({ total: N, progres, carrega });
    const mostraMissatge = (...args) => Comu.missatge(els.missatge, ...args);
    const amagaMissatge = () => Comu.amagaMissatge(els.missatge);

    // ============================================================
    // ESTAT DEL PROBLEMA
    // ============================================================
    let actual = 0;
    let problema = null;
    let zeros = []; // quants zeros té cada targeta
    let vista = null; // { el, targetes, pinta } de tauler.js
    let resolt = false;
    let erroni = false; // s'ha comprovat i no és correcta (fins al canvi següent)
    let acabaDArrossegar = false;

    function carrega(i) {
        actual = Math.max(0, Math.min(N - 1, i));
        problema = P.llista[actual];
        zeros = problema.targetes.map(() => 0);
        resolt = false;
        erroni = false;

        vista = T.crea(problema);
        vista.targetes.forEach(configuraTargeta);
        els.taulerWrap.replaceChildren(vista.el);
        amagaMissatge();
        nav.obre(actual);
        pinta();
    }

    function configuraTargeta(t, i) {
        t.tabIndex = 0;
        t.setAttribute('role', 'button');
        // El botó «−» per treure un zero (només es veu si la targeta en té; amb el teclat, ⌫)
        const menys = document.createElement('span');
        menys.className = 'treu-zero';
        menys.textContent = '−';
        menys.title = 'Treu un zero';
        menys.setAttribute('aria-hidden', 'true');
        t.appendChild(menys);
        t.addEventListener('click', e => {
            if (acabaDArrossegar || resolt) return;
            if (e.target.closest('.treu-zero')) treu(i);
            else afegeix(i);
        });
        t.addEventListener('keydown', e => teclaTargeta(e, i));
        t.addEventListener('pointerdown', e => {
            const z = e.target.closest('.zero');
            if (z) iniciaArrossegament(e, i, z);
        });
    }

    // El «0» de sota, que s'arrossega fins a una targeta (o es toca: va a la targeta enfocada)
    function construeixPila() {
        const t = document.createElement('div');
        t.className = 'xifra-zero';
        t.textContent = '0';
        t.tabIndex = 0;
        t.setAttribute('role', 'button');
        t.setAttribute('aria-label', 'Un zero: arrossega’l fins a una targeta');
        t.addEventListener('pointerdown', e => iniciaArrossegament(e, 'pila', t));
        t.addEventListener('click', () => {
            if (acabaDArrossegar || resolt) return;
            mostraMissatge('info', 'Arrossega el 0 fins a una targeta, o toca la targeta directament.');
        });
        els.pila.appendChild(t);
    }

    // Posa al dia la igualtat a partir de l'estat
    function pinta() {
        vista.pinta(zeros, resolt ? 'be' : erroni ? 'malament' : '');
        vista.el.classList.toggle('resolt', resolt);
        vista.targetes.forEach((t, i) => {
            t.tabIndex = resolt ? -1 : 0;
            t.setAttribute(
                'aria-label',
                `Targeta del ${problema.targetes[i]}: ${M.valor(problema.targetes[i], zeros[i])}. ` +
                    'Enter o 0 hi afegeix un zero; ⌫ en treu un.'
            );
        });
        els.comprova.disabled = resolt;
        nav.actualitza();
    }

    // ============================================================
    // ACCIONS
    // ============================================================
    function afegeix(i) {
        if (resolt) return;
        if (zeros[i] >= M.maxZeros(problema)) {
            const v = M.valor(problema.targetes[i], zeros[i] + 1);
            mostraMissatge('info', `No hi caben més zeros: ${v} ja seria més gran que ${problema.total}.`);
            Comu.anima(vista.targetes[i], 'sacseja');
            return;
        }
        zeros[i]++;
        canvi();
        const z = vista.targetes[i].querySelector('.zero:last-child');
        if (z) Comu.anima(z, 'acaba-de-posar');
    }

    function treu(i) {
        if (resolt || zeros[i] === 0) return;
        zeros[i]--;
        canvi();
    }

    // Un zero de la targeta i, arrossegat a la targeta j (o fora, j = -1: es treu)
    function mou(i, j) {
        if (resolt || zeros[i] === 0) return;
        if (j >= 0 && zeros[j] >= M.maxZeros(problema)) {
            afegeix(j); // no hi cap: avisa, i el zero es queda on era
            return;
        }
        zeros[i]--;
        if (j >= 0) zeros[j]++;
        canvi();
    }

    function reinicia() {
        resolt = false;
        zeros = problema.targetes.map(() => 0);
        canvi();
    }

    function canvi() {
        erroni = false;
        amagaMissatge();
        if (M.comprova(problema, zeros).correcte) celebra();
        pinta();
    }

    // El botó «Comprova»: el càlcul tal com està
    function comprova() {
        if (resolt) return;
        const r = M.comprova(problema, zeros);
        erroni = true;
        pinta();
        const d = Math.abs(problema.total - r.suma);
        const verb = r.suma < problema.total ? (d === 1 ? 'Falta' : 'Falten') : d === 1 ? 'Sobra' : 'Sobren';
        mostraMissatge('error', `Encara no! ${r.calcul}, i no ${problema.total}.`, [`${verb} ${d}.`]);
        Comu.anima(vista.el, 'sacseja');
    }

    function celebra() {
        resolt = true;
        progres.marcaResolt(actual + 1);
        const r = M.comprova(problema, zeros);
        const boto = nav.botoSeguent();
        const titol = nav.totsResolts()
            ? '🏆 Molt bé! Has resolt totes les igualtats!'
            : '🎉 Molt bé! La igualtat és correcta.';
        mostraMissatge('ok', titol, [r.calcul], boto);
        setTimeout(() => boto.focus({ preventScroll: true }), 0);
    }

    // ============================================================
    // TECLAT
    // ============================================================
    function teclaTargeta(e, i) {
        if (e.altKey || e.ctrlKey || e.metaKey || resolt) return;
        if (e.key === '0' || e.key === 'Enter' || e.key === ' ' || e.key === '+') {
            e.preventDefault();
            afegeix(i);
        } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '-') {
            e.preventDefault();
            treu(i);
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            e.preventDefault();
            vista.targetes[i + (e.key === 'ArrowRight' ? 1 : -1)]?.focus();
        }
    }

    // ============================================================
    // ARROSSEGAR (Pointer Events: ratolí, dit i llapis amb el mateix codi)
    // ============================================================
    let arr = null;

    function iniciaArrossegament(e, des, el) {
        if (resolt || (e.pointerType === 'mouse' && e.button !== 0)) return;
        arr = { des, el, x0: e.clientX, y0: e.clientY, tactil: e.pointerType !== 'mouse', actiu: false, sobre: -1 }; // prettier-ignore
        document.addEventListener('pointermove', mouArrossegament);
        document.addEventListener('pointerup', deixaArrossegament);
        document.addEventListener('pointercancel', acabaArrossegament);
    }

    // On «apunta» el zero: amb el dit, una mica per sobre perquè es vegi
    function mira(e) {
        return { x: e.clientX, y: e.clientY - (arr.tactil ? 40 : 0) };
    }

    function targetaA(q) {
        const el = document.elementFromPoint(q.x, q.y);
        const t = el && el.closest('.targeta');
        return t && vista.el.contains(t) ? Number(t.dataset.targeta) : -1;
    }

    function mouArrossegament(e) {
        if (!arr) return;
        if (!arr.actiu) {
            if (Math.hypot(e.clientX - arr.x0, e.clientY - arr.y0) < 6) return;
            arr.actiu = true;
            arr.fantasma = document.createElement('div');
            arr.fantasma.className = 'xifra-zero fantasma';
            arr.fantasma.textContent = '0';
            document.body.appendChild(arr.fantasma);
            arr.el.classList.add('arrossegant');
            vista.el.classList.add('amb-seleccio');
        }
        e.preventDefault();
        const q = mira(e);
        arr.fantasma.style.left = q.x + 'px';
        arr.fantasma.style.top = q.y + 'px';
        const t = targetaA(q);
        if (t !== arr.sobre) {
            if (arr.sobre >= 0) vista.targetes[arr.sobre].classList.remove('sobre');
            if (t >= 0) vista.targetes[t].classList.add('sobre');
            arr.sobre = t;
        }
    }

    function deixaArrossegament(e) {
        if (!arr) return;
        const a = arr;
        const t = a.actiu ? targetaA(mira(e)) : -1;
        acabaArrossegament();
        if (!a.actiu) return; // ha estat un clic: se n'encarrega l'esdeveniment 'click'
        acabaDArrossegar = true;
        setTimeout(() => (acabaDArrossegar = false), 0);
        if (a.des === 'pila') {
            if (t >= 0) afegeix(t);
        } else if (t !== a.des) {
            // Un zero d'una targeta, deixat fora d'ella: es treu (i, si cau en una altra, s'hi posa)
            mou(a.des, t);
        }
    }

    function acabaArrossegament() {
        document.removeEventListener('pointermove', mouArrossegament);
        document.removeEventListener('pointerup', deixaArrossegament);
        document.removeEventListener('pointercancel', acabaArrossegament);
        if (!arr) return;
        arr.fantasma?.remove();
        arr.el.classList.remove('arrossegant');
        if (arr.sobre >= 0) vista.targetes[arr.sobre].classList.remove('sobre');
        vista.el.classList.remove('amb-seleccio');
        arr = null;
    }

    // ============================================================
    // ARRENCADA
    // ============================================================
    function pintaInstruccions() {
        const ex = P.exemple;
        $('ex-problema').prepend(T.estatic(ex));
        $('ex-solucio').prepend(T.estatic(ex, [0, 2, 1], 'be'));
        $('ex-be').prepend(T.estatic(ex, [0, 2, 1], 'be'));
        $('ex-malament').prepend(T.estatic(ex, [1, 0, 2], 'malament'));
    }

    construeixPila();
    els.comprova.addEventListener('click', comprova);
    els.reinicia.addEventListener('click', reinicia);

    pintaInstruccions();
    carrega(nav.inicial());
})();
