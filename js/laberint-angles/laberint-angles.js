/**
 * ============================================================================
 * FITXER: js/laberint-angles/laberint-angles.js
 * ROL: Controlador de la pàgina laberint-angles.html (tot el que toca el DOM).
 * INTERACCIÓ: el camí sempre surt de la S. Tres maneres de fer-lo créixer:
 *   - Traçar: prémer el final del camí (o un cercle del costat) i, sense
 *     aixecar el dit o el ratolí, passar pels cercles. Tornar enrere pel
 *     mateix camí l'escurça.
 *   - Clicar/tocar cercles connectats, un darrere l'altre.
 *   - Teclat: Tab o fletxes per anar d'un cercle a l'altre, Enter per afegir-lo
 *     al camí, ⌫ per desfer l'últim pas.
 *   Clicar un cercle del camí el talla fins allà.
 * Quan el camí arriba a la G, es comprova sol.
 * DEPENDÈNCIES: js/comu.js, problemes.js, motor.js i tauler.js (carregats abans).
 * ============================================================================
 */
(() => {
    const P = window.PROBLEMES_LABERINT;
    const M = window.MotorLaberint;
    const T = window.TaulerLaberint;
    const N = P.llista.length;

    const $ = id => document.getElementById(id);
    const els = {
        taulerWrap: $('tauler-wrap'),
        missatge: $('missatge'),
        desfes: $('btn-desfes'),
        reinicia: $('btn-reinicia'),
    };
    const progres = Comu.progres('inaba.laberint-angles');
    const nav = Comu.navegacio({ total: N, progres, carrega });
    const mostraMissatge = (...args) => Comu.missatge(els.missatge, ...args);
    const amagaMissatge = () => Comu.amagaMissatge(els.missatge);

    // ============================================================
    // ESTAT DEL PROBLEMA
    // ============================================================
    let actual = 0;
    let problema = null;
    let veins = []; // veïns de cada cercle
    let tallades = new Set(); // 'a-b' de les línies tallades
    let S = 0;
    let G = 0;
    let cami = []; // índexs dels cercles, de S endavant
    let vista = null; // { el, cercles, pintaCami, guia, punt, cercleA } de tauler.js
    let resolt = false;
    let errors = []; // errors de la darrera comprovació (si el camí arriba a G)
    let traçant = false;

    function carrega(i) {
        actual = Math.max(0, Math.min(N - 1, i));
        problema = P.llista[actual];
        veins = M.veins(problema);
        tallades = new Set(problema.tallades.map(([a, b]) => `${Math.min(a, b)}-${Math.max(a, b)}`));
        S = M.sortida(problema);
        G = M.arribada(problema);
        cami = [S];
        resolt = false;
        errors = [];
        acabaTraç();

        vista = T.crea(problema);
        vista.cercles.forEach(configuraCercle);
        els.taulerWrap.replaceChildren(vista.el);
        amagaMissatge();
        nav.obre(actual);
        pinta();
    }

    function configuraCercle(div, i) {
        div.tabIndex = 0;
        div.setAttribute('role', 'button');
        div.addEventListener('pointerdown', e => iniciaTraç(e, i));
        div.addEventListener('keydown', e => teclaCercle(e, i));
        // Clic sense punter (lectors de pantalla): com tocar-lo
        div.addEventListener('click', e => {
            if (e.detail === 0) toca(i);
        });
    }

    function nomCercle(i) {
        if (i === S) return 'la S';
        if (i === G) return 'la G';
        const a = M.angleDemanat(problema, i);
        return a === null ? 'un cercle buit' : `el cercle del ${a}`;
    }

    // Posa al dia el tauler a partir de l'estat
    function pinta() {
        const fi = cami[cami.length - 1];
        const dins = new Set(cami);
        const erronis = new Set(errors.map(e => e.cercle));
        vista.cercles.forEach((div, i) => {
            const candidat = !resolt && fi !== G && !dins.has(i) && veins[fi].includes(i);
            div.classList.toggle('al-cami', dins.has(i) && i !== fi);
            div.classList.toggle('final', i === fi);
            div.classList.toggle('candidat', candidat);
            div.classList.toggle('erroni', erronis.has(i));
            div.tabIndex = resolt ? -1 : 0;
            let estat = '';
            if (i === fi) estat = ', final del camí';
            else if (dins.has(i)) estat = ', dins del camí';
            else if (candidat) estat = ', hi pots anar';
            const nom = nomCercle(i);
            div.setAttribute('aria-label', nom.charAt(0).toUpperCase() + nom.slice(1) + estat);
        });
        vista.el.classList.toggle('resolt', resolt);

        // Un arc a cada cercle amb número per on passa el camí
        const marques = [];
        for (let k = 1; k < cami.length - 1; k++) {
            if (M.angleDemanat(problema, cami[k]) === null) continue;
            const angle = M.angle(problema, cami[k - 1], cami[k], cami[k + 1]);
            marques.push({ pos: k, angle, classe: erronis.has(cami[k]) ? 'erroni' : '' });
        }
        vista.pintaCami(cami, marques);
        els.desfes.disabled = resolt || cami.length < 2;
        nav.actualitza();
    }

    // ============================================================
    // ACCIONS
    // ============================================================
    // Tocar (o prémer Enter a) un cercle. Retorna true si el camí acaba en aquest cercle.
    function toca(i) {
        if (resolt) return false;
        const k = cami.indexOf(i);
        if (k >= 0) {
            // Un cercle del camí: el camí es talla fins allà
            if (k < cami.length - 1) {
                cami = cami.slice(0, k + 1);
                canvi();
            }
            return true;
        }
        const fi = cami[cami.length - 1];
        if (fi === G) {
            mostraMissatge(
                'info',
                'El camí ja arriba a la G. Per canviar-lo, toca un cercle del camí o desfés passos.'
            );
            return false;
        }
        if (veins[fi].includes(i)) {
            afegeix(i);
            return true;
        }
        if (tallades.has(`${Math.min(fi, i)}-${Math.max(fi, i)}`)) {
            mostraMissatge('info', 'Aquesta línia està tallada (×): no hi pots passar.');
        } else if (cami.length === 1) {
            mostraMissatge('info', 'El camí comença a la S: toca un cercle que hi estigui connectat amb una línia.');
        } else {
            mostraMissatge('info', "Només pots anar a un cercle connectat amb l'últim del camí.");
        }
        Comu.anima(vista.cercles[i], 'sacseja');
        return false;
    }

    function afegeix(i) {
        cami.push(i);
        canvi();
        Comu.anima(vista.cercles[i], 'acaba-de-posar');
    }

    function desfes() {
        if (resolt || cami.length < 2) return;
        cami.pop();
        canvi();
    }

    function reinicia() {
        resolt = false;
        cami = [S];
        canvi();
    }

    function canvi() {
        errors = [];
        amagaMissatge();
        revisa();
        pinta();
    }

    // Quan el camí arriba a la G, es comprova
    function revisa() {
        const r = M.comprova(problema, cami);
        if (!r.complet) return;
        if (r.correcte) {
            celebra();
            return;
        }
        errors = r.errors;
        const frases = r.errors.map(
            e => `Al cercle del ${e.demanat}, el camí fa ${e.fet}°${e.fet === 180 ? ' (va recte)' : ''}.`
        );
        mostraMissatge(
            'error',
            frases.length === 1
                ? 'Encara no! Hi ha un angle que no és el que demana el cercle:'
                : 'Encara no! Hi ha angles que no són els que demanen els cercles:',
            frases
        );
    }

    function celebra() {
        resolt = true;
        acabaTraç();
        progres.marcaResolt(actual + 1);
        const boto = nav.botoSeguent();
        const titol = nav.totsResolts()
            ? '🏆 Molt bé! Has resolt tots els laberints!'
            : '🎉 Molt bé! Has arribat a la G formant els angles que demanen els cercles.';
        mostraMissatge('ok', titol, [], boto);
        setTimeout(() => boto.focus({ preventScroll: true }), 0);
    }

    // ============================================================
    // TRAÇAR (Pointer Events: ratolí, dit i llapis amb el mateix codi)
    // ============================================================
    function iniciaTraç(e, i) {
        if (resolt || (e.pointerType === 'mouse' && e.button !== 0)) return;
        e.preventDefault(); // que el navegador no seleccioni ni arrossegui res
        vista.cercles[i].focus({ preventScroll: true });
        if (!toca(i)) return;
        traçant = true;
        vista.el.classList.add('traçant');
        document.addEventListener('pointermove', mouTraç);
        document.addEventListener('pointerup', acabaTraç);
        document.addEventListener('pointercancel', acabaTraç);
    }

    function mouTraç(e) {
        if (!traçant) return;
        e.preventDefault();
        const q = vista.punt(e.clientX, e.clientY);
        const fi = cami[cami.length - 1];
        const i = vista.cercleA(q);
        if (i >= 0 && i !== fi) {
            if (cami.length >= 2 && i === cami[cami.length - 2]) {
                cami.pop(); // enrere pel mateix camí: s'escurça
                canvi();
            } else if (fi !== G && !cami.includes(i) && veins[fi].includes(i)) {
                afegeix(i);
            }
        }
        if (resolt) return;
        vista.guia(cami[cami.length - 1], q);
    }

    function acabaTraç() {
        document.removeEventListener('pointermove', mouTraç);
        document.removeEventListener('pointerup', acabaTraç);
        document.removeEventListener('pointercancel', acabaTraç);
        traçant = false;
        if (vista) {
            vista.guia(null);
            vista.el.classList.remove('traçant');
        }
    }

    // ============================================================
    // TECLAT
    // ============================================================
    function teclaCercle(e, i) {
        if (e.altKey || e.ctrlKey || e.metaKey) return;
        const fletxes = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
        if (fletxes[e.key]) {
            e.preventDefault();
            mouFocus(i, ...fletxes[e.key]);
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toca(i);
        } else if (e.key === 'Backspace' || e.key === 'Delete') {
            e.preventDefault();
            desfes();
            vista.cercles[cami[cami.length - 1]].focus();
        }
    }

    // Va al cercle més proper en la direcció (dx, dy)
    function mouFocus(i, dx, dy) {
        const [x0, y0] = problema.nodes[i];
        let millor = -1;
        let millorCost = Infinity;
        problema.nodes.forEach(([x, y], j) => {
            const avanc = (x - x0) * dx + (y - y0) * dy;
            if (j === i || avanc <= 0.1) return;
            const lateral = Math.abs((x - x0) * dy - (y - y0) * dx);
            if (lateral > avanc * 1.8) return; // massa de costat
            const cost = avanc + 2 * lateral;
            if (cost < millorCost) {
                millorCost = cost;
                millor = j;
            }
        });
        if (millor >= 0) vista.cercles[millor].focus();
    }

    // ============================================================
    // ARRENCADA
    // ============================================================
    function pintaInstruccions() {
        const ex = P.exemple;
        const sol = M.resol(ex)[0];
        const marques = cami =>
            cami
                .map((v, k) => ({ pos: k, v }))
                .filter(({ pos, v }) => pos > 0 && pos < cami.length - 1 && M.angleDemanat(ex, v) !== null)
                .map(({ pos }) => ({ pos, angle: M.angle(ex, cami[pos - 1], cami[pos], cami[pos + 1]) }));
        const opcions = { amplada: 230 };
        $('ex-problema').prepend(T.estatic(ex, [], opcions));
        $('ex-solucio').prepend(T.estatic(ex, sol, { ...opcions, final: true, estat: 'resolt' }));
        // Passa dues vegades pel cercle del mig: S, a baix, mig, 60, 120, a dalt i un altre cop al mig
        const mig = sol[2];
        const doble = sol.slice(0, 6).concat([mig]);
        $('ex-dues-vegades').prepend(T.estatic(ex, doble, { ...opcions, classes: [[mig, 'erroni']] }));
        $('ex-angles').prepend(T.estatic(ex, sol, { ...opcions, final: true, marques: marques(sol) }));
        // Un angle pla: tres cercles en línia, i el del mig és el del 180
        const pla = {
            nodes: [
                [0, 0],
                [1, 0, 180],
                [2, 0],
            ],
            arestes: [
                [0, 1],
                [1, 2],
            ],
            tallades: [],
        };
        $('ex-pla').prepend(T.estatic(pla, [0, 1, 2], { amplada: 200, marques: [{ pos: 1, angle: 180 }] }));
    }

    els.desfes.addEventListener('click', desfes);
    els.reinicia.addEventListener('click', reinicia);

    pintaInstruccions();
    carrega(nav.inicial());
})();
