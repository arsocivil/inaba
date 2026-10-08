/**
 * ============================================================================
 * FITXER: js/diposits-aigua/tauler.js
 * ROL: Dibuixa un problema: la cara del davant dels cubs (SVG) amb les vores
 *      gruixudes dels dipòsits, les marques, l'aigua i quanta n'hi ha a cada
 *      cub; les fletxes amb els totals de les files (a l'esquerra) i de les
 *      columnes (a dalt); i una capa HTML per dipòsit per tocar-lo, arrossegar-hi
 *      el nivell i enfocar-lo amb el teclat.
 * ARQUITECTURA: Un cub fa CUB unitats de l'SVG (viewBox); les capes HTML es
 *   posen en %. El tauler s'encongeix sencer en una pantalla estreta. El fa
 *   servir el joc, els exemples de les instruccions i la versió per imprimir.
 * DEPENDÈNCIES: motor.js (MotorDiposits: dipòsits, aigua de cada cub, text).
 * ============================================================================
 */
window.TaulerDiposits = (() => {
    const CUB = 100;
    const MARGE = 12;
    const ESCALA = 1.15; // px per unitat a la pantalla gran…
    const MAXIM = 470; // …però el tauler no fa mai més de 470 px d'ample
    const NS = 'http://www.w3.org/2000/svg';

    function svg(nom, at = {}) {
        const el = document.createElementNS(NS, nom);
        for (const k in at) el.setAttribute(k, at[k]);
        return el;
    }

    /**
     * Crea el tauler del problema p. Retorna:
     *   el, capes (un div per dipòsit, en l'ordre de MotorDiposits.diposits), ds (els dipòsits);
     *   pinta({ nivells, triat, estats, quantitats }): l'aigua de cada dipòsit (fraccions), el dipòsit triat,
     *     l'estat de cada total ({ files: ['' | 'be' | 'malament'], columnes: […] }) i si s'escriu quanta
     *     aigua hi ha a cada cub;
     *   nivellA(k, clientY): el nivell del dipòsit k a l'altura clientY de la pantalla (sense arrodonir).
     */
    function crea(p, opcions = {}) {
        const M = window.MotorDiposits;
        const ds = M.diposits(p);
        const alt = p.files.length;
        const amp = p.files[0].length;
        // A l'esquerra, el total i la fletxa de cada fila; a dalt, els de cada columna (si n'hi ha)
        const ESQ = p.totalsFiles.some(v => v !== null) ? 128 : MARGE;
        const DALT = p.totalsColumnes.some(v => v !== null) ? 104 : MARGE;
        const W = ESQ + amp * CUB + MARGE;
        const H = DALT + alt * CUB + MARGE;
        const x = c => ESQ + c * CUB;
        const y = f => DALT + f * CUB;

        const el = document.createElement('div');
        el.className = 'tauler-diposits';
        el.style.width = (opcions.amplada || Math.min(W * ESCALA, MAXIM)) + 'px';
        el.style.aspectRatio = `${W} / ${H}`;
        el.style.setProperty('--amplada', W);

        const s = svg('svg', { 'class': 'dibuix', 'viewBox': `0 0 ${W} ${H}`, 'aria-hidden': 'true' });
        const aigua = svg('g', { class: 'aigua' });
        const quantitats = svg('g', { class: 'quantitats' });
        s.appendChild(aigua);
        // Les línies fines entre cubs, les marques i les vores gruixudes dels dipòsits
        let fines = '';
        for (let f = 0; f <= alt; f++) fines += `M${x(0)} ${y(f)}H${x(amp)}`;
        for (let c = 0; c <= amp; c++) fines += `M${x(c)} ${y(0)}V${y(alt)}`;
        s.appendChild(svg('path', { class: 'fines', d: fines }));
        let marques = '';
        if (p.divisions) {
            ds.forEach(d => {
                for (let f = d.f0; f <= d.f1; f++) {
                    for (let k = 1; k < p.divisions; k++) {
                        const yy = y(f) + (k * CUB) / p.divisions;
                        marques += `M${x(d.c0)} ${yy}h${k * 2 === p.divisions ? 22 : 14}`;
                    }
                }
            });
        }
        s.appendChild(svg('path', { class: 'marques', d: marques }));
        ds.forEach(d => {
            s.appendChild(
                svg('rect', { class: 'vora', x: x(d.c0), y: y(d.f0), width: d.amp * CUB, height: d.alt * CUB })
            );
        });
        s.appendChild(quantitats);
        // Els totals, amb una fletxa cap a la fila o la columna
        const etiquetes = { files: [], columnes: [] };
        p.totalsFiles.forEach((v, f) => {
            if (v === null) return etiquetes.files.push(null);
            const g = svg('g', { class: 'total' });
            const yy = y(f) + CUB / 2;
            g.appendChild(svg('path', { class: 'fletxa', d: `M${ESQ - 54} ${yy}H${ESQ - 22}` }));
            g.appendChild(svg('path', { class: 'punta', d: `M${ESQ - 8} ${yy}l-16 -10v20z` }));
            const t = svg('text', { 'x': ESQ - 62, 'y': yy, 'text-anchor': 'end', 'dominant-baseline': 'central' });
            t.textContent = v;
            g.appendChild(t);
            s.appendChild(g);
            etiquetes.files.push(g);
        });
        p.totalsColumnes.forEach((v, c) => {
            if (v === null) return etiquetes.columnes.push(null);
            const g = svg('g', { class: 'total' });
            const xx = x(c) + CUB / 2;
            g.appendChild(svg('path', { class: 'fletxa', d: `M${xx} ${DALT - 50}V${DALT - 22}` }));
            g.appendChild(svg('path', { class: 'punta', d: `M${xx} ${DALT - 8}l-10 -16h20z` }));
            const t = svg('text', { 'x': xx, 'y': DALT - 70, 'text-anchor': 'middle', 'dominant-baseline': 'central' });
            t.textContent = v;
            g.appendChild(t);
            s.appendChild(g);
            etiquetes.columnes.push(g);
        });
        el.appendChild(s);

        // Una capa HTML per dipòsit (per tocar-lo, arrossegar-hi el nivell i enfocar-lo)
        const capes = ds.map((d, k) => {
            const div = document.createElement('div');
            div.className = 'capa-diposit';
            div.dataset.diposit = k;
            div.style.left = (x(d.c0) / W) * 100 + '%';
            div.style.top = (y(d.f0) / H) * 100 + '%';
            div.style.width = ((d.amp * CUB) / W) * 100 + '%';
            div.style.height = ((d.alt * CUB) / H) * 100 + '%';
            el.appendChild(div);
            return div;
        });

        function pinta({ nivells, triat = null, estats = null, quantitats: ambQuantitats = true }) {
            aigua.replaceChildren();
            quantitats.replaceChildren();
            ds.forEach((d, k) => {
                const h = nivells[k];
                const hv = h[0] / h[1];
                if (hv > 0) {
                    const alcada = hv * CUB;
                    aigua.appendChild(
                        svg('rect', { x: x(d.c0), y: y(d.f1 + 1) - alcada, width: d.amp * CUB, height: alcada })
                    );
                }
                capes[k].classList.toggle('triat', k === triat);
                if (!ambQuantitats) return;
                for (let f = d.f0; f <= d.f1; f++) {
                    for (let c = d.c0; c <= d.c1; c++) {
                        const w = M.aiguaCub(d, h, f);
                        if (w[0] === 0) continue; // un cub buit: no s'hi escriu res
                        const t = svg('text', {
                            'x': x(c) + CUB / 2 + 6,
                            'y': y(f) + CUB / 2,
                            'text-anchor': 'middle',
                            'dominant-baseline': 'central',
                        });
                        t.textContent = M.text(w);
                        quantitats.appendChild(t);
                    }
                }
            });
            ['files', 'columnes'].forEach(q =>
                etiquetes[q].forEach((g, i) => {
                    if (!g) return;
                    g.classList.toggle('be', !!estats && estats[q][i] === 'be');
                    g.classList.toggle('malament', !!estats && estats[q][i] === 'malament');
                })
            );
        }

        function nivellA(k, clientY) {
            const r = el.getBoundingClientRect();
            const uy = ((clientY - r.top) / r.height) * H;
            return (y(ds[k].f1 + 1) - uy) / CUB;
        }

        return { el, capes, ds, pinta, nivellA };
    }

    // Un tauler només per mirar (instruccions i versió per imprimir)
    function estatic(p, opcions = {}) {
        const t = crea(p, opcions);
        t.el.classList.add('estatic');
        const M = window.MotorDiposits;
        t.pinta({ nivells: opcions.nivells || t.ds.map(() => M.F(0)), ...opcions });
        return t.el;
    }

    return { crea, estatic };
})();
