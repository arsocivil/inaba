/**
 * ============================================================================
 * FITXER: js/enllac-multiples/tauler.js
 * ROL: Dibuixa un tauler: els llocs de les targetes (HTML) i les fletxes (SVG).
 * ARQUITECTURA: Tot es mesura en «unitats de tauler». L'SVG i els llocs fan
 *   servir les mateixes unitats (l'SVG amb viewBox, els llocs en %), de manera
 *   que el tauler s'encongeix sencer en una pantalla estreta.
 *   El fa servir el joc i també els exemples de les instruccions.
 * DEPENDÈNCIES: Cap.
 * ============================================================================
 */
window.TaulerEnllac = (() => {
    const W = 72; // amplada d'una targeta
    const H = 92; // alçada d'una targeta
    const PX = 150; // distància entre columnes
    const PY = 150; // distància entre files
    const MARGE = 14;
    const ESPAI = 7; // entre la vora de la targeta i la fletxa
    const PUNTA = 20; // llargada de la punta de la fletxa
    const SVG_NS = 'http://www.w3.org/2000/svg';

    function dimensions(problema) {
        const cols = Math.max(...problema.llocs.map(l => l[0])) + 1;
        const files = Math.max(...problema.llocs.map(l => l[1])) + 1;
        return { amplada: (cols - 1) * PX + W + 2 * MARGE, alcada: (files - 1) * PY + H + 2 * MARGE };
    }

    function centre(lloc) {
        return { x: MARGE + W / 2 + lloc[0] * PX, y: MARGE + H / 2 + lloc[1] * PY };
    }

    function svg(nom, atributs) {
        const el = document.createElementNS(SVG_NS, nom);
        for (const k in atributs) el.setAttribute(k, atributs[k]);
        return el;
    }

    // Fins on arriba un raig que surt del centre d'una targeta abans de tocar-ne la vora (+ ESPAI)
    function sortida(ux, uy) {
        const tx = ux === 0 ? Infinity : (W / 2 + ESPAI) / Math.abs(ux);
        const ty = uy === 0 ? Infinity : (H / 2 + ESPAI) / Math.abs(uy);
        return Math.min(tx, ty);
    }

    function dibuixaFletxa(a, b) {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const len = Math.hypot(dx, dy);
        const ux = dx / len;
        const uy = dy / len;
        const t = sortida(ux, uy);
        const x1 = a.x + ux * t;
        const y1 = a.y + uy * t;
        const x2 = b.x - ux * t;
        const y2 = b.y - uy * t;
        const nx = -uy;
        const ny = ux;
        const bx = x2 - ux * PUNTA;
        const by = y2 - uy * PUNTA;

        const g = svg('g', { class: 'fletxa' });
        g.appendChild(svg('line', { x1, y1, x2: bx + ux * 2, y2: by + uy * 2 }));
        const punts = [
            [x2, y2],
            [bx + nx * 11, by + ny * 11],
            [bx - nx * 11, by - ny * 11],
        ];
        g.appendChild(svg('polygon', { points: punts.map(p => p.join(',')).join(' ') }));

        // Etiqueta (×2, ✗…) al costat del mig de la fletxa: a sobre o a la dreta
        let ox = uy;
        let oy = -ux;
        if (oy > 0.01 || (Math.abs(oy) <= 0.01 && ox < 0)) {
            ox = -ox;
            oy = -oy;
        }
        const etiq = svg('g', { 'class': 'etiqueta', 'aria-hidden': 'true' });
        const mx = (x1 + x2) / 2 + ox * 24;
        const my = (y1 + y2) / 2 + oy * 24;
        etiq.appendChild(svg('rect', { x: mx - 22, y: my - 14, width: 44, height: 28, rx: 14 }));
        const text = svg('text', { 'x': mx, 'y': my + 1, 'text-anchor': 'middle', 'dominant-baseline': 'middle' });
        etiq.appendChild(text);
        g.appendChild(etiq);
        return { g, etiq, rect: etiq.firstChild, text };
    }

    /**
     * Crea un tauler. Retorna:
     *   el:      l'element del tauler
     *   llocs:   un element per lloc (mateix ordre que problema.llocs)
     *   fletxes: { g, etiq, rect, text } per a cada fletxa
     *   etiqueta(i, text): posa o treu (text buit) l'etiqueta de la fletxa i
     */
    function crea(problema) {
        const { amplada, alcada } = dimensions(problema);
        const el = document.createElement('div');
        el.className = 'tauler';
        el.style.width = amplada + 'px';
        el.style.aspectRatio = amplada + ' / ' + alcada;
        el.style.setProperty('--amplada', amplada);

        const s = svg('svg', { 'class': 'fletxes', 'viewBox': `0 0 ${amplada} ${alcada}`, 'aria-hidden': 'true' });
        const fletxes = problema.fletxes.map(([o, d]) => {
            const f = dibuixaFletxa(centre(problema.llocs[o]), centre(problema.llocs[d]));
            s.appendChild(f.g);
            return f;
        });
        el.appendChild(s);

        const llocs = problema.llocs.map(l => {
            const c = centre(l);
            const div = document.createElement('div');
            div.className = 'lloc';
            div.style.left = ((c.x - W / 2) / amplada) * 100 + '%';
            div.style.top = ((c.y - H / 2) / alcada) * 100 + '%';
            div.style.width = (W / amplada) * 100 + '%';
            div.style.height = (H / alcada) * 100 + '%';
            el.appendChild(div);
            return div;
        });

        function etiqueta(i, contingut) {
            const f = fletxes[i];
            f.text.textContent = contingut;
            const amp = Math.max(44, 14 * contingut.length + 18);
            const mx = Number(f.text.getAttribute('x'));
            f.rect.setAttribute('x', mx - amp / 2);
            f.rect.setAttribute('width', amp);
            f.g.classList.toggle('amb-etiqueta', contingut !== '');
        }

        return { el, llocs, fletxes, etiqueta };
    }

    // Un tauler només per mirar (instruccions): valors = un número o null per lloc
    function estatic(problema, valors, opcions = {}) {
        const t = crea(problema);
        t.el.classList.add('estatic');
        if (opcions.amplada) t.el.style.width = opcions.amplada + 'px';
        t.llocs.forEach((div, i) => {
            const fix = problema.llocs[i].length > 2;
            div.classList.add(fix ? 'fix' : valors[i] === null ? 'buit' : 'ple');
            div.textContent = valors[i] === null ? '' : valors[i];
        });
        (opcions.etiquetes || []).forEach((text, i) => text && t.etiqueta(i, text));
        if (opcions.estat) t.el.classList.add(opcions.estat);
        return t.el;
    }

    return { crea, estatic };
})();
