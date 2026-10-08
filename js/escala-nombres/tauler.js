/**
 * ============================================================================
 * FITXER: js/escala-nombres/tauler.js
 * ROL: Dibuixa un problema: les fileres (línies, SVG), el que augmenta a cada
 *      tram (+2, +3…) i els cercles amb els nombres (HTML, perquè es puguin
 *      tocar i enfocar amb el teclat).
 * ARQUITECTURA: Tot es mesura en «unitats de tauler», que són els punts del
 *   PDF (un cercle fa 2·R d'ample). L'SVG (amb viewBox) i els cercles (en %)
 *   fan servir les mateixes unitats, i el tauler s'encongeix sencer en una
 *   pantalla estreta. El fa servir el joc, els exemples de les instruccions i
 *   la versió per imprimir.
 * DEPENDÈNCIES: Cap.
 * ============================================================================
 */
window.TaulerEscala = (() => {
    const R = 14; // radi d'un cercle (com al PDF)
    const MARGE = R + 14; // hi caben les etiquetes +2 dels trams de la vora
    const ESCALA = 2.3; // px per unitat a la pantalla gran…
    const MAXIM = 440; // …però el tauler no fa mai més de 440 px d'ample
    const SVG_NS = 'http://www.w3.org/2000/svg';

    function svg(nom, atributs = {}) {
        const el = document.createElementNS(SVG_NS, nom);
        for (const k in atributs) el.setAttribute(k, atributs[k]);
        return el;
    }

    /**
     * Crea el tauler del problema p. Retorna:
     *   el, cercles (un div per cercle);
     *   pinta({ valors, estats, salts, triat }): els nombres (valors[i] o null), l'estat de cada filera
     *       ('' | 'be' | 'malament'), si s'escriu el que augmenta a cada tram (salts = true) i el cercle triat.
     */
    function crea(p, opcions = {}) {
        const xs = p.nodes.map(n => n[0]);
        const ys = p.nodes.map(n => n[1]);
        const x0 = Math.min(...xs);
        const y0 = Math.min(...ys);
        const amplada = Math.max(...xs) - x0 + 2 * MARGE;
        const alcada = Math.max(...ys) - y0 + 2 * MARGE;
        const centres = p.nodes.map(([x, y]) => ({ x: x - x0 + MARGE, y: y - y0 + MARGE }));

        const el = document.createElement('div');
        el.className = 'tauler-escala';
        el.style.width = (opcions.amplada || Math.min(amplada * ESCALA, MAXIM)) + 'px';
        el.style.aspectRatio = amplada + ' / ' + alcada;
        el.style.setProperty('--amplada', amplada);

        const s = svg('svg', { 'class': 'dibuix', 'viewBox': `0 0 ${amplada} ${alcada}`, 'aria-hidden': 'true' });
        const linies = p.fileres.map(f => {
            const l = svg('polyline', {
                class: 'filera',
                points: f.map(i => `${centres[i].x},${centres[i].y}`).join(' '),
            });
            s.appendChild(l);
            return l;
        });
        const salts = svg('g', { class: 'salts' });
        s.appendChild(salts);
        el.appendChild(s);

        const cercles = p.nodes.map((n, i) => {
            const div = document.createElement('div');
            div.className = 'cercle' + (n.length > 2 ? ' fix' : '');
            div.dataset.cercle = i;
            div.style.left = ((centres[i].x - R) / amplada) * 100 + '%';
            div.style.top = ((centres[i].y - R) / alcada) * 100 + '%';
            div.style.width = ((2 * R) / amplada) * 100 + '%';
            div.style.height = ((2 * R) / alcada) * 100 + '%';
            el.appendChild(div);
            return div;
        });

        // Tots els trams (parelles de centres) i la distància d'un punt a un tram
        const trams = p.fileres.flatMap(f => f.slice(1).map((i, k) => [centres[f[k]], centres[i]]));
        function distSeg(q, u, v) {
            const dx = v.x - u.x;
            const dy = v.y - u.y;
            const t = Math.max(0, Math.min(1, ((q.x - u.x) * dx + (q.y - u.y) * dy) / (dx * dx + dy * dy)));
            return Math.hypot(q.x - u.x - t * dx, q.y - u.y - t * dy);
        }

        // «+3» al costat de cada tram (el que augmenta d'un cercle al següent)
        function escriuSalts(valors) {
            salts.replaceChildren();
            const posades = []; // les etiquetes ja posades: les altres se n'aparten
            p.fileres.forEach(f => {
                for (let k = 0; k + 1 < f.length; k++) {
                    const a = centres[f[k]];
                    const b = centres[f[k + 1]];
                    const d = Math.abs(valors[f[k + 1]] - valors[f[k]]);
                    const len = Math.hypot(b.x - a.x, b.y - a.y);
                    // A un costat del tram: el que queda més lluny dels cercles, de les altres línies i de les etiquetes ja posades
                    const nx = -(b.y - a.y) / len;
                    const ny = (b.x - a.x) / len;
                    const mx = (a.x + b.x) / 2;
                    const my = (a.y + b.y) / 2;
                    const lluny = sg => {
                        const q = { x: mx + sg * nx * 13, y: my + sg * ny * 13 };
                        const punts = [...centres, ...posades].map(c => Math.hypot(c.x - q.x, c.y - q.y));
                        const linies = trams
                            .filter(([u, v]) => u !== a || v !== b)
                            .map(([u, v]) => distSeg(q, u, v) + 6);
                        return Math.min(...punts, ...linies);
                    };
                    const sg = lluny(1) >= lluny(-1) ? 1 : -1;
                    const t = svg('text', {
                        'x': mx + sg * nx * 13,
                        'y': my + sg * ny * 13,
                        'class': 'salt',
                        'text-anchor': 'middle',
                        'dominant-baseline': 'central',
                    });
                    t.textContent = '+' + d;
                    posades.push({ x: mx + sg * nx * 13, y: my + sg * ny * 13 });
                    salts.appendChild(t);
                }
            });
        }

        function pinta({ valors, estats = [], salts: ambSalts = false, triat = null }) {
            cercles.forEach((div, i) => {
                const v = valors[i];
                div.textContent = v === null ? '' : v;
                div.classList.toggle('buit', v === null);
                div.classList.toggle('llarg', v !== null && String(v).length > 2);
                div.classList.toggle('triat', i === triat);
            });
            linies.forEach((l, k) => {
                l.classList.toggle('be', estats[k] === 'be');
                l.classList.toggle('malament', estats[k] === 'malament');
            });
            if (ambSalts) escriuSalts(valors);
            else salts.replaceChildren();
        }

        return { el, cercles, pinta };
    }

    // Un tauler només per mirar (instruccions i versió per imprimir)
    function estatic(p, opcions = {}) {
        const t = crea(p, opcions);
        t.el.classList.add('estatic');
        t.pinta({ valors: opcions.valors || p.nodes.map(n => (n.length > 2 ? n[2] : null)), ...opcions });
        (opcions.classes || []).forEach(([i, classe]) => t.cercles[i].classList.add(classe));
        return t.el;
    }

    return { crea, estatic };
})();
