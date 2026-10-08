/**
 * ============================================================================
 * FITXER: js/busca-el-triangle/tauler.js
 * ROL: Dibuixa una quadrícula de punts: les línies (SVG), el triangle triat,
 *      com es calcula la seva àrea (la base i l'altura, o el rectangle que
 *      l'envolta i les peces del voltant) i els punts (HTML, perquè es puguin
 *      tocar i enfocar amb el teclat).
 * ARQUITECTURA: Tot es mesura en «unitats de tauler»: un quadret fa CEL
 *   unitats. L'SVG (amb viewBox) i els punts (en %) fan servir les mateixes
 *   unitats, i el tauler s'encongeix sencer en una pantalla estreta.
 *   El fa servir el joc, els exemples de les instruccions i la versió per imprimir.
 * DEPENDÈNCIES: motor.js (MotorTriangle.text, per escriure 1,5).
 * ============================================================================
 */
window.TaulerTriangle = (() => {
    const CEL = 64; // un quadret
    const MARGE = 26;
    const R = 9; // radi d'un punt
    const ESCALA = 1.25; // px per unitat a la pantalla gran…
    const MAXIM = 400; // …però el tauler no fa mai més de 400 px d'ample
    const SVG_NS = 'http://www.w3.org/2000/svg';

    function svg(nom, atributs = {}) {
        const el = document.createElementNS(SVG_NS, nom);
        for (const k in atributs) el.setAttribute(k, atributs[k]);
        return el;
    }

    const xy = ([c, f]) => ({ x: MARGE + c * CEL, y: MARGE + f * CEL });
    const llista = punts => punts.map(q => { const p = xy(q); return `${p.x},${p.y}`; }).join(' '); // prettier-ignore

    // Un text amb una vora blanca al voltant (perquè es llegeixi sobre les línies)
    function etiqueta(x, y, text, classe = '', amplada = Infinity) {
        // Si no hi cap, s'arrossega cap a dins (la lletra fa uns 9 unitats d'ample)
        const mig = text.length * 4.7;
        x = Math.max(mig + 2, Math.min(amplada - mig - 2, x));
        const t = svg('text', { 'x': x, 'y': y, 'class': 'etiq ' + classe, 'text-anchor': 'middle', 'dominant-baseline': 'central' }); // prettier-ignore
        t.textContent = text;
        return t;
    }

    /**
     * Crea una quadrícula amb els punts del problema p. Retorna:
     *   el, punts (un div per punt, en l'ordre de p.punts);
     *   pinta({ tria, estat, d }): el triangle (o el costat, o res) dels punts triats; estat '' | 'be' |
     *       'malament'; d = el desglossament de motor.js per dibuixar com es calcula l'àrea (o null);
     *   guia(i, punt): línia del punt i fins al punt (unitats de tauler), o guia(null) per amagar-la;
     *   posicio(clientX, clientY): el punt de la pantalla en unitats de tauler;
     *   puntA(q, radi): el punt que hi ha en aquella posició (o -1).
     */
    function crea(p, opcions = {}) {
        const amplada = p.amp * CEL + 2 * MARGE;
        const alcada = p.alt * CEL + 2 * MARGE;
        const el = document.createElement('div');
        el.className = 'tauler-triangle';
        el.style.width = (opcions.amplada || Math.min(amplada * ESCALA, MAXIM)) + 'px';
        el.style.aspectRatio = amplada + ' / ' + alcada;
        el.style.setProperty('--amplada', amplada);

        const s = svg('svg', {
            'class': 'dibuix',
            'viewBox': `0 0 ${amplada} ${alcada}`,
            'aria-hidden': 'true',
        });
        // La quadrícula: línies de punts grises, com al PDF
        let d = '';
        for (let c = 0; c <= p.amp; c++) d += `M${MARGE + c * CEL} ${MARGE}v${p.alt * CEL}`;
        for (let f = 0; f <= p.alt; f++) d += `M${MARGE} ${MARGE + f * CEL}h${p.amp * CEL}`;
        s.appendChild(svg('path', { class: 'quadricula', d }));
        const calcul = svg('g', { class: 'calcul' });
        const triangle = svg('polygon', { class: 'triangle' });
        const costats = svg('polyline', { class: 'costats' });
        const sobre = svg('g', { class: 'sobre' }); // les mides (base, altura) i les àrees de les peces
        const guiaLinia = svg('line', { class: 'guia' });
        s.append(calcul, triangle, costats, sobre, guiaLinia);
        el.appendChild(s);

        const centres = p.punts.map(xy);
        const punts = p.punts.map((q, i) => {
            const div = document.createElement('div');
            div.className = 'punt';
            div.dataset.punt = i;
            div.style.left = ((centres[i].x - R) / amplada) * 100 + '%';
            div.style.top = ((centres[i].y - R) / alcada) * 100 + '%';
            div.style.width = ((2 * R) / amplada) * 100 + '%';
            div.style.height = ((2 * R) / alcada) * 100 + '%';
            el.appendChild(div);
            return div;
        });

        // La base i l'altura d'un triangle amb un costat horitzontal o vertical
        function dibuixaBase(v, dd) {
            const [i, j] = dd.costat;
            const a = v[i];
            const b = v[j];
            const r = v[3 - i - j];
            const hor = a[1] === b[1];
            const peu = hor ? [r[0], a[1]] : [a[0], r[1]]; // on cau l'altura
            const pa = xy(a);
            const pb = xy(b);
            const pr = xy(r);
            const pp = xy(peu);
            calcul.appendChild(svg('line', { class: 'base', x1: pa.x, y1: pa.y, x2: pb.x, y2: pb.y }));
            // Si l'altura cau fora de la base, s'allarga la base amb una línia de punts
            const lluny = [pa, pb].reduce((m, q) => (Math.hypot(q.x - pp.x, q.y - pp.y) < Math.hypot(m.x - pp.x, m.y - pp.y) ? q : m)); // prettier-ignore
            const dins = hor ? (pp.x - pa.x) * (pp.x - pb.x) <= 0 : (pp.y - pa.y) * (pp.y - pb.y) <= 0;
            if (!dins)
                calcul.appendChild(
                    svg('line', {
                        class: 'allarga',
                        x1: lluny.x,
                        y1: lluny.y,
                        x2: pp.x,
                        y2: pp.y,
                    })
                );
            calcul.appendChild(
                svg('line', {
                    class: 'altura',
                    x1: pr.x,
                    y1: pr.y,
                    x2: pp.x,
                    y2: pp.y,
                })
            );
            // Un escaire on l'altura toca la base
            const sx = Math.sign(pr.x - pp.x) || 1;
            const sy = Math.sign(pr.y - pp.y) || 1;
            const ux = hor ? (Math.sign(pa.x + pb.x - 2 * pp.x) || 1) * 10 : sx * 10;
            const uy = hor ? sy * 10 : (Math.sign(pa.y + pb.y - 2 * pp.y) || 1) * 10;
            const e = hor ? `M${pp.x + ux} ${pp.y}v${uy}h${-ux}` : `M${pp.x} ${pp.y + uy}h${ux}v${-uy}`;
            calcul.appendChild(svg('path', { class: 'escaire', d: e }));
            // Les mides: «base 2» fora del triangle i «altura 3» al costat de la línia
            const T = window.MotorTriangle.text;
            const mx = (pa.x + pb.x) / 2;
            const my = (pa.y + pb.y) / 2;
            const fora = hor ? { x: 0, y: pr.y > my ? -22 : 22 } : { x: pr.x > mx ? -48 : 48, y: 0 };
            sobre.appendChild(etiqueta(mx + fora.x, my + fora.y, `base ${T(dd.base)}`, 'mida', amplada));
            // «altura 3» al costat de la línia de l'altura que queda més lluny del mig de la base
            const hx = (pr.x + pp.x) / 2;
            const hy = (pr.y + pp.y) / 2;
            const cap = hor ? (Math.sign(pp.x - mx) || 1) * 46 : (Math.sign(pp.y - my) || 1) * 20;
            sobre.appendChild(
                etiqueta(hx + (hor ? cap : 0), hy + (hor ? 0 : cap), `altura ${T(dd.altura)}`, 'mida', amplada)
            );
        }

        // El rectangle que envolta el triangle i les peces del voltant, amb les seves àrees
        function dibuixaCaixa(dd) {
            const T = window.MotorTriangle.text;
            const a = xy([dd.caixa.x0, dd.caixa.y0]);
            const b = xy([dd.caixa.x1, dd.caixa.y1]);
            calcul.appendChild(
                svg('rect', {
                    class: 'caixa',
                    x: a.x,
                    y: a.y,
                    width: b.x - a.x,
                    height: b.y - a.y,
                })
            );
            dd.peces.forEach(pc => {
                calcul.appendChild(svg('polygon', { class: 'peca', points: llista(pc.punts) }));
                // L'àrea, al centre de la peça (el baricentre d'un triangle; el centre d'un rectangle)
                const q = pc.punts.length === 3 ? pc.punts : [pc.punts[0], pc.punts[2]];
                const cx = q.reduce((s, k) => s + xy(k).x, 0) / q.length;
                const cy = q.reduce((s, k) => s + xy(k).y, 0) / q.length;
                sobre.appendChild(etiqueta(cx, cy, T(pc.area), 'area-peca'));
            });
        }

        function pinta({ tria = [], estat = '', d: dd = null } = {}) {
            const v = tria.map(i => p.punts[i]);
            calcul.replaceChildren();
            sobre.replaceChildren();
            triangle.setAttribute('points', v.length === 3 ? llista(v) : '');
            costats.setAttribute('points', v.length === 3 ? llista([...v, v[0]]) : llista(v));
            el.classList.remove('be', 'malament');
            if (estat) el.classList.add(estat);
            punts.forEach((div, i) => div.classList.toggle('triat', tria.includes(i)));
            if (dd && dd.tipus === 'base') dibuixaBase(v, dd);
            if (dd && dd.tipus === 'caixa') dibuixaCaixa(dd);
        }

        function guia(i, q) {
            guiaLinia.style.display = i === null ? 'none' : 'inline';
            if (i === null) return;
            guiaLinia.setAttribute('x1', centres[i].x);
            guiaLinia.setAttribute('y1', centres[i].y);
            guiaLinia.setAttribute('x2', q.x);
            guiaLinia.setAttribute('y2', q.y);
        }
        guia(null);

        function posicio(clientX, clientY) {
            const r = el.getBoundingClientRect();
            return {
                x: ((clientX - r.left) / r.width) * amplada,
                y: ((clientY - r.top) / r.height) * alcada,
            };
        }

        // El punt més proper, si és a menys de radi quadrets (per defecte, gairebé mig quadret)
        function puntA(q, radi = 0.45) {
            let millor = -1;
            let dist = CEL * radi;
            centres.forEach((c, i) => {
                const dd = Math.hypot(c.x - q.x, c.y - q.y);
                if (dd < dist) {
                    dist = dd;
                    millor = i;
                }
            });
            return millor;
        }

        return { el, punts, pinta, guia, posicio, puntA };
    }

    // Una quadrícula només per mirar (instruccions i versió per imprimir)
    function estatic(p, opcions = {}) {
        const t = crea(p, opcions);
        t.el.classList.add('estatic');
        t.pinta(opcions);
        return t.el;
    }

    return { crea, estatic };
})();
