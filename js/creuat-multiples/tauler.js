/**
 * ============================================================================
 * FITXER: js/creuat-multiples/tauler.js
 * ROL: Dibuixa el quadre del «Creuat de múltiples»: caselles negres amb els
 *      números als dos triangles (◥ cap a la dreta, ◣ cap avall) i caselles
 *      blanques per a les xifres. El fa servir el joc i els exemples de les
 *      instruccions.
 * ARQUITECTURA: Una graella CSS d'una casella per cel·la (--amp columnes).
 *   - Casella negra: <div class="negra"> amb la diagonal dibuixada pel CSS i,
 *     si cal, <span class="n-d"> (dalt a la dreta) i <span class="n-a"> (baix a
 *     l'esquerra).
 *   - Casella blanca: <div class="blanca" data-x data-y> (el joc li posa els
 *     esdeveniments; aquí només es pinta).
 * DEPENDÈNCIES: motor.js (analitza el quadre).
 * ============================================================================
 */
window.TaulerCreuat = (() => {
    const M = window.MotorCreuat;

    /**
     * Crea el quadre d'un problema (files de text, vegeu problemes.js). Retorna:
     *   el, g (el quadre analitzat per motor.js),
     *   blanques: matriu [y][x] amb l'element de cada casella blanca (null a les negres),
     *   claus: Map «dir,x,y» → element del número (dir 'a' o 'd'),
     *   pinta({ v, cursor, resultat }): posa les xifres (matriu v[y][x]), marca la casella del cursor
     *     i, si hi ha resultat (el de M.comprova), els nombres bons (verd) i dolents (vermell).
     */
    function crea(files) {
        const g = M.analitza(files);
        const el = document.createElement('div');
        el.className = 'creuat';
        el.style.setProperty('--amp', g.amp);
        el.style.setProperty('--alt', g.alt); // la versió per imprimir ajusta la mida de la casella a l'alçada
        const blanques = g.cel.map(() => new Array(g.amp).fill(null));
        const claus = new Map();
        g.cel.forEach((fila, y) =>
            fila.forEach((c, x) => {
                const d = document.createElement('div');
                if (c.negra) {
                    d.className = 'negra';
                    for (const dir of ['d', 'a']) {
                        if (c[dir] === null) continue;
                        const s = document.createElement('span');
                        s.className = 'n-' + dir;
                        s.textContent = c[dir];
                        d.appendChild(s);
                        claus.set(`${dir},${x},${y}`, s);
                    }
                } else {
                    d.className = 'blanca';
                    d.dataset.x = x;
                    d.dataset.y = y;
                    blanques[y][x] = d;
                }
                el.appendChild(d);
            })
        );

        function pinta({ v, cursor = null, resultat = null }) {
            g.blanques.forEach(({ x, y }) => {
                const d = blanques[y][x];
                const xifra = v[y][x];
                d.textContent = xifra === null ? '' : xifra;
                d.classList.toggle('ple', xifra !== null);
                d.classList.toggle('cursor', !!cursor && cursor.x === x && cursor.y === y);
                d.classList.remove('be', 'malament');
            });
            claus.forEach(s => s.classList.remove('be', 'malament'));
            if (!resultat) return;
            // Una casella és roja si algun dels seus nombres no va bé, i verda si tots hi van bé
            resultat.trams.forEach(r => {
                const bo = r.estat === 'be';
                claus.get(`${r.tram.dir},${r.tram.x},${r.tram.y}`).classList.add(bo ? 'be' : 'malament');
                r.tram.cel.forEach(({ x, y }) => {
                    const d = blanques[y][x];
                    if (!bo) {
                        d.classList.remove('be');
                        d.classList.add('malament');
                    } else if (!d.classList.contains('malament')) {
                        d.classList.add('be');
                    }
                });
            });
        }

        return { el, g, blanques, claus, pinta };
    }

    /**
     * Un quadre només per mirar (instruccions). Opcions:
     *   v: les xifres escrites (matriu); si no hi és, el quadre buit;
     *   veu: llista de { dir, x, y } de números dels quals es ressalta el que «veuen» (amb una fletxa);
     *   comprova: si és true, es pinten de verd o de vermell els nombres, com al joc.
     */
    function estatic(files, opcions = {}) {
        const t = crea(files);
        t.el.classList.add('estatic');
        const v = opcions.v || M.buida(t.g);
        t.pinta({ v });
        (opcions.veu || []).forEach(({ dir, x, y }) => {
            t.claus.get(`${dir},${x},${y}`).classList.add('veu-' + dir);
            const cels = t.g.trams.find(r => r.dir === dir && r.x === x && r.y === y).cel;
            cels.forEach(c => t.blanques[c.y][c.x].classList.add('veu'));
            // La primera casella del tram porta la fletxa (→ o ↓) que diu cap on es llegeix
            t.blanques[cels[0].y][cels[0].x].classList.add('veu-ini-' + dir);
        });
        if (opcions.comprova) t.pinta({ v, resultat: M.comprova(t.g, v) });
        return t.el;
    }

    return { crea, estatic };
})();
