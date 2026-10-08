/**
 * ============================================================================
 * FITXER: js/diposits-aigua/diposits-aigua.js
 * ROL: Controlador de la pàgina diposits-aigua.html (tot el que toca el DOM).
 * INTERACCIÓ: es posa el nivell de l'aigua de cada dipòsit:
 *   - Tocar un dipòsit hi posa l'aigua fins a aquella altura (ajustada a les
 *     marques) i el tria; arrossegar amunt i avall la fa pujar i baixar.
 *   - A sota, el dipòsit triat: − i + (d'una marca en una marca) i el nivell en
 *     fracció, que s'hi pot escriure (per exemple 13/10).
 *   - Teclat: Tab per anar d'un dipòsit a l'altre; fletxes amunt i avall (una
 *     marca), Re Pàg / Av Pàg (un cub sencer), Inici (buit) i Fi (ple).
 * Dins de cada cub s'escriu quanta aigua hi ha. Quan tots els totals quadren,
 * es diu sol; el botó «Comprova» diu quins totals no quadren i per què.
 * DEPENDÈNCIES: js/comu.js, problemes.js, motor.js i tauler.js (carregats abans).
 * ============================================================================
 */
(() => {
    const P = window.PROBLEMES_DIPOSITS;
    const M = window.MotorDiposits;
    const T = window.TaulerDiposits;
    const N = P.llista.length;

    const $ = id => document.getElementById(id);
    const els = {
        taulerWrap: $('tauler-wrap'),
        editor: $('editor'),
        nomDiposit: $('nom-diposit'),
        menys: $('btn-menys'),
        mes: $('btn-mes'),
        nivell: $('nivell'),
        missatge: $('missatge'),
        comprova: $('btn-comprova'),
        reinicia: $('btn-reinicia'),
    };
    const progres = Comu.progres('inaba.diposits-aigua');
    const nav = Comu.navegacio({ total: N, progres, carrega });
    const mostraMissatge = (...args) => Comu.missatge(els.missatge, ...args);
    const amagaMissatge = () => Comu.amagaMissatge(els.missatge);

    // ============================================================
    // ESTAT DEL PROBLEMA
    // ============================================================
    let actual = 0;
    let problema = null;
    let ds = []; // els dipòsits (MotorDiposits.diposits)
    let nivells = []; // una fracció per dipòsit
    let pas = 4; // es puja i baixa d'1/pas en 1/pas
    let triat = null;
    let estats = null; // l'estat de cada total després de comprovar (o de resoldre)
    let vista = null; // { el, capes, ds, pinta, nivellA } de tauler.js
    let resolt = false;
    let arr = null; // el dipòsit que s'està arrossegant

    function carrega(i) {
        actual = Math.max(0, Math.min(N - 1, i));
        problema = P.llista[actual];
        ds = M.diposits(problema);
        nivells = ds.map(() => M.F(0));
        pas = M.pas(problema);
        triat = null;
        estats = null;
        resolt = false;

        vista = T.crea(problema);
        vista.capes.forEach(configuraCapa);
        els.taulerWrap.replaceChildren(vista.el);
        amagaMissatge();
        nav.obre(actual);
        pinta();
    }

    const nomDe = k => `el dipòsit ${k + 1}`;

    function configuraCapa(div, k) {
        div.tabIndex = 0;
        div.setAttribute('role', 'slider');
        div.setAttribute('aria-valuemin', '0');
        div.setAttribute('aria-valuemax', String(ds[k].alt));
        div.addEventListener('pointerdown', e => iniciaArrossegament(e, k));
        div.addEventListener('keydown', e => teclaDiposit(e, k));
        div.addEventListener('focus', () => {
            if (!resolt && triat !== k) {
                triat = k;
                pinta();
            }
        });
    }

    // Posa al dia el tauler i l'editor a partir de l'estat
    function pinta() {
        vista.pinta({ nivells, triat: resolt ? null : triat, estats });
        vista.el.classList.toggle('resolt', resolt);
        vista.capes.forEach((div, k) => {
            div.tabIndex = resolt ? -1 : 0;
            div.setAttribute('aria-valuenow', String(nivells[k][0] / nivells[k][1]));
            div.setAttribute('aria-valuetext', `${M.text(nivells[k])} cubs d'altura`);
            div.setAttribute('aria-label', `Dipòsit ${k + 1} (${ds[k].amp} × ${ds[k].alt} cubs)`);
        });
        const hi = triat !== null && !resolt;
        els.editor.classList.toggle('inactiu', !hi);
        [els.menys, els.mes, els.nivell].forEach(b => (b.disabled = !hi));
        els.nomDiposit.textContent = hi ? `Dipòsit ${triat + 1}:` : 'Toca un dipòsit';
        if (document.activeElement !== els.nivell) els.nivell.value = hi ? M.text(nivells[triat]) : '';
        els.comprova.disabled = resolt;
        nav.actualitza();
    }

    // ============================================================
    // ACCIONS
    // ============================================================
    const plena = k => M.F(ds[k].alt);

    // Posa el nivell del dipòsit k (una fracció, dins de 0…alçada)
    function posa(k, h) {
        if (resolt) return;
        if (M.menor(h, M.F(0))) h = M.F(0);
        if (M.menor(plena(k), h)) h = plena(k);
        if (M.igual(h, nivells[k])) return;
        nivells[k] = h;
        canvi();
    }

    // El nivell arrodonit a la marca més propera
    const arrodoneix = v => M.F(Math.round(v * pas), pas);
    const puja = (k, n) => posa(k, M.suma(nivells[k], M.F(n, pas)));

    function reinicia() {
        resolt = false;
        nivells = ds.map(() => M.F(0));
        canvi();
    }

    function canvi() {
        estats = null;
        amagaMissatge();
        if (M.comprova(problema, nivells).correcte) celebra();
        pinta();
    }

    // Les quantitats de cada cub d'una fila o columna, sumades: «1/3 + 1/2 = 5/6»
    function suma(tipus, i) {
        const t = M.totals(problema, nivells);
        const vs = tipus === 'fila' ? t.cubs[i] : t.cubs.map(fila => fila[i]);
        const total = tipus === 'fila' ? t.files[i] : t.columnes[i];
        return `${vs.map(M.text).join(' + ')} = ${M.text(total)}`;
    }

    const nomTotal = (tipus, i) => (tipus === 'fila' ? `la fila ${i + 1}` : `la columna ${i + 1}`);

    function estatsDe(r) {
        const e = { files: problema.totalsFiles.map(() => 'be'), columnes: problema.totalsColumnes.map(() => 'be') };
        r.errors.forEach(err => (e[err.tipus === 'fila' ? 'files' : 'columnes'][err.i] = 'malament'));
        return e;
    }

    // El botó «Comprova»: quins totals no quadren
    function comprova() {
        if (resolt) return;
        const r = M.comprova(problema, nivells);
        estats = estatsDe(r);
        pinta();
        const frases = r.errors.map(
            e => `A ${nomTotal(e.tipus, e.i)}: ${suma(e.tipus, e.i)}, i hi ha d'haver ${M.text(e.demanat)}.`
        );
        mostraMissatge(
            'error',
            frases.length === 1
                ? 'Encara no! Hi ha un total que no quadra:'
                : 'Encara no! Hi ha totals que no quadren:',
            frases
        );
        Comu.anima(vista.el, 'sacseja');
    }

    function celebra() {
        resolt = true;
        triat = null;
        estats = estatsDe(M.comprova(problema, nivells));
        progres.marcaResolt(actual + 1);
        const frases = [];
        problema.totalsFiles.forEach((v, i) => v !== null && frases.push(`Fila ${i + 1}: ${suma('fila', i)}`));
        problema.totalsColumnes.forEach((v, i) => v !== null && frases.push(`Columna ${i + 1}: ${suma('columna', i)}`));
        const boto = nav.botoSeguent();
        const titol = nav.totsResolts()
            ? '🏆 Molt bé! Has resolt tots els dipòsits!'
            : '🎉 Molt bé! Tots els totals quadren.';
        mostraMissatge('ok', titol, frases, boto);
        setTimeout(() => boto.focus({ preventScroll: true }), 0);
    }

    // ============================================================
    // L'EDITOR DEL DIPÒSIT TRIAT
    // ============================================================
    function escriuNivell() {
        if (triat === null || resolt) return;
        const t = els.nivell.value.trim().replace(/\s+/g, '');
        if (!/^\d+(\/[1-9]\d*)?$/.test(t)) {
            mostraMissatge('info', 'Escriu el nivell com un nombre o una fracció: 1, 3/4, 13/10…');
            els.nivell.value = M.text(nivells[triat]);
            return;
        }
        const h = M.llegeix(t);
        if (M.menor(plena(triat), h)) {
            mostraMissatge(
                'info',
                `Aquest dipòsit fa ${ds[triat].alt} ${ds[triat].alt === 1 ? 'cub' : 'cubs'} d'alçada: el nivell no pot passar de ${ds[triat].alt}.`
            );
            els.nivell.value = M.text(nivells[triat]);
            return;
        }
        posa(triat, h);
    }

    // ============================================================
    // TOCAR I ARROSSEGAR (Pointer Events: ratolí, dit i llapis amb el mateix codi)
    // ============================================================
    function iniciaArrossegament(e, k) {
        if (resolt || (e.pointerType === 'mouse' && e.button !== 0)) return;
        e.preventDefault();
        vista.capes[k].focus({ preventScroll: true });
        triat = k;
        arr = k;
        posa(k, arrodoneix(vista.nivellA(k, e.clientY)));
        pinta();
        document.addEventListener('pointermove', mouArrossegament);
        document.addEventListener('pointerup', acabaArrossegament);
        document.addEventListener('pointercancel', acabaArrossegament);
    }

    function mouArrossegament(e) {
        if (arr === null) return;
        e.preventDefault();
        posa(arr, arrodoneix(vista.nivellA(arr, e.clientY)));
    }

    function acabaArrossegament() {
        document.removeEventListener('pointermove', mouArrossegament);
        document.removeEventListener('pointerup', acabaArrossegament);
        document.removeEventListener('pointercancel', acabaArrossegament);
        arr = null;
    }

    // ============================================================
    // TECLAT
    // ============================================================
    function teclaDiposit(e, k) {
        if (e.altKey || e.ctrlKey || e.metaKey || resolt) return;
        const tecles = {
            ArrowUp: () => puja(k, 1),
            ArrowRight: () => puja(k, 1),
            ArrowDown: () => puja(k, -1),
            ArrowLeft: () => puja(k, -1),
            PageUp: () => puja(k, pas),
            PageDown: () => puja(k, -pas),
            Home: () => posa(k, M.F(0)),
            End: () => posa(k, plena(k)),
        };
        if (tecles[e.key]) {
            e.preventDefault();
            tecles[e.key]();
        } else if (/^[0-9]$/.test(e.key)) {
            // Una xifra: s'escriu el nivell al quadre de text
            e.preventDefault();
            els.nivell.value = e.key;
            els.nivell.focus();
        }
    }

    // ============================================================
    // ARRENCADA
    // ============================================================
    function pintaInstruccions() {
        const ex = P.exemple;
        const sol = M.resol(ex)[0];
        const o = { amplada: 230 };
        const totsBe = { files: ex.totalsFiles.map(() => 'be'), columnes: ex.totalsColumnes.map(() => 'be') };
        $('ex-problema').prepend(T.estatic(ex, { ...o, quantitats: false }));
        $('ex-solucio').prepend(T.estatic(ex, { ...o, nivells: sol, estats: totsBe }));
        $('ex-columna').prepend(T.estatic(ex, { ...o, nivells: sol }));
        // Un cub sol (1 litre), un dipòsit alt de dos pisos i un d'ample
        const un = { files: ['A'], divisions: 6, totalsFiles: [null], totalsColumnes: [null] };
        $('ex-litre').prepend(T.estatic(un, { amplada: 120, nivells: [M.F(1)] }));
        $('ex-un').prepend(T.estatic(un, { amplada: 120, nivells: [M.F(1, 3)] }));
        const alt = { files: ['A', 'A'], divisions: 6, totalsFiles: [null, null], totalsColumnes: [null] };
        $('ex-alt').prepend(T.estatic(alt, { amplada: 120, nivells: [M.F(3, 2)] }));
        const ample = { files: ['AA'], divisions: 6, totalsFiles: [null], totalsColumnes: [null, null] };
        $('ex-ample').prepend(T.estatic(ample, { amplada: 190, nivells: [M.F(1, 3)] }));
    }

    els.menys.addEventListener('click', () => triat !== null && puja(triat, -1));
    els.mes.addEventListener('click', () => triat !== null && puja(triat, 1));
    els.nivell.addEventListener('change', escriuNivell);
    els.nivell.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            escriuNivell();
        }
    });
    els.comprova.addEventListener('click', comprova);
    els.reinicia.addEventListener('click', reinicia);

    pintaInstruccions();
    carrega(nav.inicial());
})();
