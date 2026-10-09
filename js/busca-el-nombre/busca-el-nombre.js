/**
 * ============================================================================
 * FITXER: js/busca-el-nombre/busca-el-nombre.js
 * ROL: Controlador de la pàgina busca-el-nombre.html (tot el que toca el DOM).
 * INTERACCIÓ: el quadrat té sempre la mida que toca (2 × 2 o 3 × 3) i sempre
 *   queda dins de la línia de punts. Tres maneres de posar-lo:
 *   - Arrossegar (ratolí o dit): el quadrat va seguint el punter, encaixat als
 *     quadrets; en deixar anar, es posa. Deixar anar fora del tauler no fa res.
 *   - Tocar o clicar un lloc del tauler: hi posa el quadrat.
 *   - Teclat: fletxes per moure el quadrat, Enter (o espai) per posar-lo,
 *     Esc, ⌫ o Supr per treure'l.
 * En posar el quadrat, es comprova sol: si no és el lloc que toca, es diu què
 * hi ha dins («Aquí hi ha 3 pomes, i en volies 2»); es pot provar un altre lloc.
 * DEPENDÈNCIES: js/comu.js, problemes.js, motor.js i tauler.js (carregats abans).
 * ============================================================================
 */
(() => {
    const P = window.PROBLEMES_KAZU;
    const M = window.MotorKazu;
    const T = window.TaulerKazu;
    const N = P.llista.length;

    const $ = id => document.getElementById(id);
    const els = {
        pregunta: $('pregunta'),
        regla: $('regla-mida'),
        taulerWrap: $('tauler-wrap'),
        missatge: $('missatge'),
        reinicia: $('btn-reinicia'),
    };
    const progres = Comu.progres('inaba.busca-el-nombre');
    const nav = Comu.navegacio({ total: N, progres, carrega });
    const mostraMissatge = (...args) => Comu.missatge(els.missatge, ...args);
    const amagaMissatge = () => Comu.amagaMissatge(els.missatge);

    // ============================================================
    // ESTAT DEL PROBLEMA
    // ============================================================
    let actual = 0;
    let g = null; // el problema analitzat (motor.js)
    let vista = null; // { el, pinta, previsio, cursor, punt } de tauler.js
    let marc = null; // el quadrat posat: { c, f } o null
    let classe = ''; // '' | 'correcte' | 'erroni'
    let resolt = false;
    let cursor = { c: 0, f: 0 }; // el quadrat marcat amb el teclat
    let arrossegant = false;

    function carrega(i) {
        actual = Math.max(0, Math.min(N - 1, i));
        g = M.analitza(P.llista[actual]);
        marc = null;
        classe = '';
        resolt = false;
        arrossegant = false;
        cursor = { c: Math.floor((g.amp - g.mida) / 2), f: Math.floor((g.alt - g.mida) / 2) };

        vista = T.crea(g);
        configuraTauler();
        els.taulerWrap.replaceChildren(vista.el);
        els.pregunta.textContent = M.enunciat(g);
        els.regla.innerHTML = `Posa un quadrat de <strong>${g.mida} × ${g.mida}</strong> allà on toca. Arrossega o toca el tauler.`;
        amagaMissatge();
        nav.obre(actual);
        pinta();
    }

    const dins = (c, f) => M.cap(g, c, f);

    // Posa al dia el tauler a partir de l'estat
    function pinta() {
        vista.pinta(marc, classe);
        vista.el.classList.toggle('resolt', resolt);
        const lloc = marc
            ? ` El quadrat és a la fila ${marc.f + 1}, columna ${marc.c + 1}.`
            : ' Encara no has posat el quadrat.';
        vista.el.setAttribute(
            'aria-label',
            `Quadrícula de ${g.alt} files i ${g.amp} columnes. ${M.enunciat(g)} Quadrat de ${g.mida} × ${g.mida}.${lloc} ` +
                'Fletxes per moure el quadrat, Enter per posar-lo, Esc per treure’l.'
        );
        nav.actualitza();
    }

    // ============================================================
    // ACCIONS
    // ============================================================
    // Posa el quadrat amb el quadret de dalt a l'esquerra a (c, f) i el comprova
    function posa(c, f) {
        if (resolt || !dins(c, f)) return;
        marc = { c, f };
        amagaMissatge();
        const r = M.comprova(g, c, f);
        classe = r.correcte ? 'correcte' : 'erroni';
        pinta();
        Comu.anima(vista.el, 'acaba-de-posar');
        if (r.correcte) celebra(r);
        else mostraMissatge('error', 'Encara no! Mira què hi ha dins del quadrat:', [r.motiu]);
    }

    function treu() {
        if (resolt || !marc) return;
        marc = null;
        classe = '';
        amagaMissatge();
        pinta();
    }

    function celebra(r) {
        resolt = true;
        progres.marcaResolt(actual + 1);
        pinta();
        const boto = nav.botoSeguent();
        const titol = nav.totsResolts()
            ? '🏆 Molt bé! Has resolt tots els problemes!'
            : '🎉 Molt bé! Aquest és el lloc.';
        mostraMissatge('ok', titol, [r.frase], boto);
        boto.focus({ preventScroll: true });
    }

    function reinicia() {
        resolt = false;
        marc = null;
        classe = '';
        acabaArrossegar();
        amagaMissatge();
        pinta();
    }

    // ============================================================
    // PUNTER (ratolí, dit i llapis amb el mateix codi)
    // ============================================================
    // Del punt de la pantalla al quadrat que s'hi encaixa; null si el punter és fora del tauler.
    // Quan s'arrossega amb el dit, el quadrat va 40 px per sobre perquè no quedi amagat sota el dit
    // (en un toc no: el quadrat ha d'anar allà on s'ha tocat).
    function quadratA(e, mogut) {
        const y = mogut && e.pointerType === 'touch' ? e.clientY - 40 : e.clientY;
        const { x, y: v } = vista.punt(e.clientX, y);
        if (x < -0.5 || v < -0.5 || x > g.amp + 0.5 || v > g.alt + 0.5) return null;
        const c = Math.max(0, Math.min(g.amp - g.mida, Math.round(x - g.mida / 2)));
        const f = Math.max(0, Math.min(g.alt - g.mida, Math.round(v - g.mida / 2)));
        return { c, f };
    }

    function acabaArrossegar() {
        arrossegant = false;
        if (vista) vista.previsio(null);
    }

    function configuraTauler() {
        const el = vista.el;
        el.setAttribute('tabindex', '0');
        let aqui = null; // l'últim quadrat sota el punter
        let inici = null; // on s'ha premut
        let mogut = false; // el punter s'ha mogut més de 6 px: és un arrossegament, no un toc
        el.addEventListener('pointerdown', e => {
            if (resolt || (e.pointerType === 'mouse' && e.button !== 0)) return;
            e.preventDefault(); // no s'enfoca: el marc del teclat només surt amb Tab
            el.setPointerCapture(e.pointerId);
            arrossegant = true;
            inici = { x: e.clientX, y: e.clientY };
            mogut = false;
            vista.cursor(null);
            aqui = quadratA(e, mogut);
            vista.previsio(aqui);
        });
        el.addEventListener('pointermove', e => {
            if (!arrossegant) return;
            if (!mogut && Math.hypot(e.clientX - inici.x, e.clientY - inici.y) > 6) mogut = true;
            aqui = quadratA(e, mogut);
            vista.previsio(aqui);
        });
        el.addEventListener('pointerup', e => {
            if (!arrossegant) return;
            aqui = quadratA(e, mogut);
            acabaArrossegar();
            if (aqui) {
                cursor = aqui;
                posa(aqui.c, aqui.f);
            }
        });
        el.addEventListener('pointercancel', acabaArrossegar);
        el.addEventListener('keydown', teclaTauler);
        el.addEventListener('focus', () => {
            if (!resolt) vista.cursor(marc || cursor);
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
            const [dc, df] = fletxes[e.key];
            cursor = {
                c: Math.max(0, Math.min(g.amp - g.mida, cursor.c + dc)),
                f: Math.max(0, Math.min(g.alt - g.mida, cursor.f + df)),
            };
            vista.cursor(cursor);
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            posa(cursor.c, cursor.f);
        } else if (e.key === 'Escape' || e.key === 'Backspace' || e.key === 'Delete') {
            e.preventDefault();
            treu();
        }
    }

    // ============================================================
    // ARRENCADA
    // ============================================================
    // Els exemples de les instruccions (pàgina 1 del PDF)
    function pintaInstruccions() {
        const ex = M.analitza(P.exemple);
        const o = { amplada: 190 };
        $('ex-problema').prepend(T.estatic(ex, null, o));
        $('ex-solucio').prepend(T.estatic(ex, { c: 1, f: 0 }, o));
        // Comptar les pomes del quadrat: 1, 3 i 4
        [
            ['ex-1', { c: 1, f: 1 }],
            ['ex-3', { c: 0, f: 0 }],
            ['ex-4', { c: 0, f: 1 }],
        ].forEach(([id, m]) => $(id).prepend(T.estatic(ex, m, { amplada: 150 })));
        // Els dos errors: el quadrat surt de la línia de punts, o no és de la mida que toca
        $('ex-surt').prepend(T.estatic(ex, { c: 2, f: 1, classe: 'erroni' }, { amplada: 170 }));
        $('ex-mida').prepend(T.estatic(ex, { c: 0, f: 2, w: 1, h: 2, classe: 'erroni' }, { amplada: 170 }));
    }

    els.reinicia.addEventListener('click', reinicia);

    pintaInstruccions();
    carrega(nav.inicial());
})();
