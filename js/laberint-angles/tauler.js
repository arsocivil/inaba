/**
 * ============================================================================
 * FITXER: js/laberint-angles/tauler.js
 * ROL: Dibuixa un laberint: les línies, el camí i els arcs dels angles (SVG)
 *      i els cercles (HTML, perquè es puguin tocar, arrossegar i enfocar amb
 *      el teclat).
 * ARQUITECTURA: Tot es mesura en «unitats de tauler». L'SVG (amb viewBox) i
 *   els cercles (en %) fan servir les mateixes unitats, i el tauler
 *   s'encongeix sencer en una pantalla estreta. El fa servir el joc i també
 *   els exemples de les instruccions.
 * DEPENDÈNCIES: Cap.
 * ============================================================================
 */
window.TaulerLaberint = (() => {
    const COSTAT = 72; // un «costat» del laberint
    const ENTRE = 64; // distància mínima entre dos cercles connectats
    const R = 19; // radi d'un cercle
    const MARGE = R + 12;
    const RA = R + 10; // radi dels arcs dels angles
    const ESCALA = 1.4; // px per unitat de tauler a la pantalla gran…
    const MAXIM = 540; // …però el tauler no fa mai més de 540 px d'ample
    const SVG_NS = 'http://www.w3.org/2000/svg';

    function svg(nom, atributs = {}) {
        const el = document.createElementNS(SVG_NS, nom);
        for (const k in atributs) el.setAttribute(k, atributs[k]);
        return el;
    }

    /**
     * Crea un laberint. Retorna:
     *   el, cercles (un div per cercle),
     *   pintaCami(cami, marques): dibuixa el camí i, per a cada marca
     *       { pos, angle, classe }, l'arc de l'angle al cercle cami[pos];
     *   guia(i, punt): línia discontínua del cercle i fins al punt (o null per amagar-la);
     *   punt(clientX, clientY): el punt de la pantalla en unitats de tauler;
     *   cercleA(punt): el cercle que hi ha en aquell punt (o -1).
     */
    function crea(p, opcions = {}) {
        // Als laberints irregulars hi ha línies curtes: s'hi separen més els cercles
        const curta = Math.min(
            ...[...p.arestes, ...p.tallades].map(([a, b]) =>
                Math.hypot(p.nodes[a][0] - p.nodes[b][0], p.nodes[a][1] - p.nodes[b][1])
            )
        );
        const U = Math.max(COSTAT, ENTRE / curta);
        const amplada = Math.max(...p.nodes.map(n => n[0])) * U + 2 * MARGE;
        const alcada = Math.max(...p.nodes.map(n => n[1])) * U + 2 * MARGE;
        const centres = p.nodes.map(([x, y]) => ({ x: MARGE + x * U, y: MARGE + y * U }));

        const el = document.createElement('div');
        el.className = 'tauler-laberint';
        el.style.width = (opcions.amplada || Math.min(amplada * ESCALA, MAXIM)) + 'px';
        el.style.aspectRatio = amplada + ' / ' + alcada;
        el.style.setProperty('--amplada', amplada);

        const s = svg('svg', { 'class': 'linies', 'viewBox': `0 0 ${amplada} ${alcada}`, 'aria-hidden': 'true' });
        for (const [a, b] of p.arestes) {
            s.appendChild(
                svg('line', { class: 'linia', x1: centres[a].x, y1: centres[a].y, x2: centres[b].x, y2: centres[b].y })
            );
        }
        // Línies tallades: de punts i amb una × al mig, com al PDF
        for (const [a, b] of p.tallades) {
            const ca = centres[a];
            const cb = centres[b];
            s.appendChild(svg('line', { class: 'linia tallada', x1: ca.x, y1: ca.y, x2: cb.x, y2: cb.y }));
            const mx = (ca.x + cb.x) / 2;
            const my = (ca.y + cb.y) / 2;
            s.appendChild(
                svg('path', {
                    class: 'creu',
                    d: `M${mx - 6} ${my - 6}L${mx + 6} ${my + 6}M${mx + 6} ${my - 6}L${mx - 6} ${my + 6}`,
                })
            );
        }
        const cami = svg('polyline', { class: 'cami' });
        const arcs = svg('g', { class: 'arcs' });
        const guiaLinia = svg('line', { class: 'guia' });
        s.append(cami, arcs, guiaLinia);
        el.appendChild(s);

        const cercles = p.nodes.map((n, i) => {
            const div = document.createElement('div');
            div.className = 'cercle';
            if (n[2] === 'S') div.classList.add('sortida');
            else if (n[2] === 'G') div.classList.add('arribada');
            else if (typeof n[2] === 'number') div.classList.add('amb-angle');
            div.textContent = n.length > 2 ? n[2] : '';
            div.dataset.node = i;
            div.style.left = ((centres[i].x - R) / amplada) * 100 + '%';
            div.style.top = ((centres[i].y - R) / alcada) * 100 + '%';
            div.style.width = ((2 * R) / amplada) * 100 + '%';
            div.style.height = ((2 * R) / alcada) * 100 + '%';
            el.appendChild(div);
            return div;
        });

        // La marca de l'angle que formen les dues línies del camí: un escaire si és recte (90°),
        // un mig cercle si és pla (180°) i un arc si és un altre
        function arc(v, u, w, graus, classe) {
            const cv = centres[v];
            const a1 = Math.atan2(centres[u].y - cv.y, centres[u].x - cv.x);
            const a2 = Math.atan2(centres[w].y - cv.y, centres[w].x - cv.x);
            const p1 = { x: cv.x + RA * Math.cos(a1), y: cv.y + RA * Math.sin(a1) };
            const p3 = { x: cv.x + RA * Math.cos(a2), y: cv.y + RA * Math.sin(a2) };
            let d;
            if (graus === 90) {
                const q = R + 7;
                const e1 = { x: cv.x + q * Math.cos(a1), y: cv.y + q * Math.sin(a1) };
                const e3 = { x: cv.x + q * Math.cos(a2), y: cv.y + q * Math.sin(a2) };
                d = `M${e1.x} ${e1.y}L${e1.x + e3.x - cv.x} ${e1.y + e3.y - cv.y}L${e3.x} ${e3.y}`;
            } else {
                // Angle amb signe de la primera línia a la segona: l'arc va pel costat de l'angle convex
                let delta = a2 - a1;
                while (delta <= -Math.PI) delta += 2 * Math.PI;
                while (delta > Math.PI) delta -= 2 * Math.PI;
                let sentit = delta > 0 ? 1 : 0;
                let gran = 0;
                if (graus === 180) {
                    // Angle pla: el mig cercle va per sobre (o per la dreta, si les línies són verticals).
                    // Amb sentit 1, l'arc passa per (nx, ny), a 90° de la primera línia.
                    const nx = -Math.sin(a1);
                    const ny = Math.cos(a1);
                    const vol = ny < -0.01 || (Math.abs(ny) <= 0.01 && nx > 0) ? 1 : 0;
                    gran = vol === sentit ? 0 : 1; // als laberints irregulars, l'angle dibuixat no és exactament 180°
                    sentit = vol;
                }
                d = `M${p1.x} ${p1.y}A${RA} ${RA} 0 ${gran} ${sentit} ${p3.x} ${p3.y}`;
            }
            return svg('path', { class: 'arc ' + (classe || ''), d });
        }

        function pintaCami(llista, marques = []) {
            cami.setAttribute('points', llista.map(i => `${centres[i].x},${centres[i].y}`).join(' '));
            arcs.replaceChildren();
            for (const { pos, angle, classe } of marques) {
                const a = arc(llista[pos], llista[pos - 1], llista[pos + 1], angle, classe);
                if (a) arcs.appendChild(a);
            }
        }

        function guia(i, punt) {
            guiaLinia.style.display = i === null ? 'none' : 'inline';
            if (i === null) return;
            guiaLinia.setAttribute('x1', centres[i].x);
            guiaLinia.setAttribute('y1', centres[i].y);
            guiaLinia.setAttribute('x2', punt.x);
            guiaLinia.setAttribute('y2', punt.y);
        }
        guia(null);

        function punt(clientX, clientY) {
            const r = el.getBoundingClientRect();
            return { x: ((clientX - r.left) / r.width) * amplada, y: ((clientY - r.top) / r.height) * alcada };
        }

        function cercleA(q) {
            let millor = -1;
            let dist = R * 1.35;
            centres.forEach((c, i) => {
                const d = Math.hypot(c.x - q.x, c.y - q.y);
                if (d < dist) {
                    dist = d;
                    millor = i;
                }
            });
            return millor;
        }

        return { el, cercles, pintaCami, guia, punt, cercleA };
    }

    // Un laberint només per mirar (instruccions), amb un camí i les classes que es vulguin
    function estatic(p, cami, opcions = {}) {
        const t = crea(p, opcions);
        t.el.classList.add('estatic');
        cami.forEach((i, k) =>
            t.cercles[i].classList.add(k === cami.length - 1 && opcions.final ? 'final' : 'al-cami')
        );
        (opcions.classes || []).forEach(([i, classe]) => t.cercles[i].classList.add(classe));
        if (opcions.estat) t.el.classList.add(opcions.estat);
        t.pintaCami(cami, opcions.marques || []);
        return t.el;
    }

    return { crea, estatic };
})();
