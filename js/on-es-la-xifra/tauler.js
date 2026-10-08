/**
 * ============================================================================
 * FITXER: js/on-es-la-xifra/tauler.js
 * ROL: Dibuixa la suma en columna d'«On és la xifra?»: les caselles □ de les
 *      xifres, el signe +, la ratlla de la suma i els números de fora amb
 *      fletxa (↓ a sobre d'una columna, ← a la dreta d'una fila). El fa servir
 *      el joc i els exemples de les instruccions.
 * ARQUITECTURA: Una graella CSS de columnes [signe][caselles…][pista de fila] i
 *   files [pistes de columna][1r nombre][2n nombre + ][ratlla][resultat]:
 *   - Casella: <div class="caixa" data-f data-k> (f = fila 0–2, k = posició dins
 *     del nombre; el joc li posa els esdeveniments, aquí només es pinta).
 *   - Pista: <div class="pista pista-col|pista-fila"> amb una <span class="p">
 *     per cada xifra (així es pot pintar cada una de verd o de vermell).
 * DEPENDÈNCIES: motor.js (analitza el problema).
 * ============================================================================
 */
window.TaulerXifra = (() => {
    const M = window.MotorXifra;
    const FILA_GRAELLA = [2, 3, 5]; // fila de la graella de cada fila de caselles (la 4 és la ratlla)

    function pistaEl(dir, xifres) {
        const d = document.createElement('div');
        d.className = 'pista pista-' + dir;
        const digs = document.createElement('span');
        digs.className = 'digs';
        const spans = xifres.map((x, i) => {
            if (i) digs.append(', ');
            const s = document.createElement('span');
            s.className = 'p';
            s.textContent = x;
            digs.appendChild(s);
            return s;
        });
        const fl = document.createElement('span');
        fl.className = 'fl';
        fl.setAttribute('aria-hidden', 'true');
        fl.textContent = (dir === 'col' ? '↓' : '←') + '\uFE0E'; // VS15: sempre com a text, mai com a emoji
        d.append(...(dir === 'col' ? [digs, fl] : [fl, digs]));
        return { el: d, spans };
    }

    /**
     * Crea el tauler d'un problema (vegeu problemes.js). Retorna:
     *   el, g (el problema analitzat per motor.js),
     *   caixes: matriu [f][k] amb l'element de cada casella,
     *   pistes: Map «fila|columna,index,xifra» → element de la xifra de la pista,
     *   pinta({ v, cursor, resultat }): posa les xifres (matriu v[f][k]), marca la casella del cursor, les
     *     pistes ja complertes (ajuda local) i, si hi ha resultat (el de M.comprova), el que va bé (verd)
     *     i el que no (vermell).
     */
    function crea(problema) {
        const g = M.analitza(problema);
        const el = document.createElement('div');
        el.className = 'suma';
        el.style.setProperty('--amp', g.amp);
        // Si cap columna té número a sobre, no es reserva la fila de dalt (vegeu el CSS)
        el.classList.toggle(
            'sense-col',
            g.pistesCol.every(xs => !xs.length)
        );
        const pistes = new Map();
        const caixes = g.ns.map(() => []);

        // Pistes de columna (a dalt)
        g.pistesCol.forEach((xs, c) => {
            if (!xs.length) return;
            const p = pistaEl('col', xs);
            p.el.style.gridArea = `1 / ${c + 2}`;
            xs.forEach((x, i) => pistes.set(`columna,${c},${x}`, p.spans[i]));
            el.appendChild(p.el);
        });
        // Caselles, pistes de fila i signe +
        g.ns.forEach((n, f) => {
            for (let k = 0; k < n; k++) {
                const d = document.createElement('div');
                d.className = 'caixa';
                d.dataset.f = f;
                d.dataset.k = k;
                d.style.gridArea = `${FILA_GRAELLA[f]} / ${g.col0[f] + k + 2}`;
                caixes[f].push(d);
                el.appendChild(d);
            }
            const xs = g.pistesFila[f];
            if (xs.length) {
                const p = pistaEl('fila', xs);
                p.el.style.gridArea = `${FILA_GRAELLA[f]} / ${g.amp + 2}`;
                xs.forEach((x, i) => pistes.set(`fila,${f},${x}`, p.spans[i]));
                el.appendChild(p.el);
            }
        });
        const signe = document.createElement('div');
        signe.className = 'signe';
        signe.textContent = '+';
        signe.style.gridArea = '3 / 1';
        const ratlla = document.createElement('div');
        ratlla.className = 'ratlla';
        ratlla.style.gridArea = `4 / 1 / 5 / ${g.amp + 2}`;
        el.append(signe, ratlla);

        function pinta({ v, cursor = null, resultat = null }) {
            g.ns.forEach((n, f) =>
                caixes[f].forEach((d, k) => {
                    const xifra = v[f][k];
                    d.textContent = xifra === null ? '' : xifra;
                    d.classList.toggle('ple', xifra !== null);
                    d.classList.toggle('cursor', !!cursor && cursor.f === f && cursor.k === k);
                    d.classList.remove('be', 'malament');
                })
            );
            const fetes = new Set(M.pistesFetes(g, v).map(p => `${p.dir},${p.index},${p.xifra}`));
            pistes.forEach((s, clau) => {
                s.classList.toggle('feta', fetes.has(clau));
                s.classList.remove('be', 'malament');
            });
            [signe, ratlla].forEach(e => e.classList.remove('be', 'malament'));
            if (!resultat || !resultat.complet) return;
            pistes.forEach(s => s.classList.remove('feta')); // ja hi ha el verd o el vermell

            const colorMes = (f, k, classe) => {
                const d = caixes[f][k];
                if (classe === 'malament') d.classList.remove('be');
                if (classe === 'be' && d.classList.contains('malament')) return;
                d.classList.add(classe);
            };
            // Una casella és vermella si és d'una línia amb una pista que falla o és un 0 inicial; verda si no
            g.ns.forEach((n, f) => caixes[f].forEach((_, k) => colorMes(f, k, 'be')));
            resultat.zeros.forEach(z => colorMes(z.f, 0, 'malament'));
            resultat.pistes.forEach(p => {
                pistes.get(`${p.dir},${p.index},${p.xifra}`).classList.add(p.ok ? 'be' : 'malament');
                if (p.ok) return;
                if (p.dir === 'fila') caixes[p.index].forEach((_, k) => colorMes(p.index, k, 'malament'));
                else
                    g.ns.forEach((n, f) => {
                        const k = p.index - g.col0[f];
                        if (k >= 0) colorMes(f, k, 'malament');
                    });
            });
            const ok = resultat.suma.ok;
            [signe, ratlla].forEach(e => e.classList.add(ok ? 'be' : 'malament'));
            if (!ok) g.ns.forEach((n, f) => caixes[f].forEach((_, k) => colorMes(f, k, 'malament')));
        }

        return { el, g, caixes, pistes, pinta };
    }

    /**
     * Un tauler només per mirar (instruccions). Opcions:
     *   v: les xifres escrites (matriu); si no hi és, el tauler buit;
     *   comprova: si és true, es pinta de verd o de vermell, com al joc;
     *   cercles: llista de [f, k] de caselles que es marquen amb un cercle (les xifres que es busquen).
     */
    function estatic(problema, opcions = {}) {
        const t = crea(problema);
        t.el.classList.add('estatic');
        const v = opcions.v || M.buida(t.g);
        t.pinta({ v });
        if (opcions.comprova) t.pinta({ v, resultat: M.comprova(t.g, v) });
        (opcions.cercles || []).forEach(([f, k]) => t.caixes[f][k].classList.add('cercle'));
        return t.el;
    }

    return { crea, estatic };
})();
