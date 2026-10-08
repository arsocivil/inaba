/**
 * ============================================================================
 * FITXER: js/talla-rectangles/tauler.js
 * ROL: Dibuixa una figura (SVG): els quadrets, la quadrícula, les peces de
 *      colors amb la seva mida, els talls i la vora, i el rectangle que s'està
 *      dibuixant. El fa servir el joc i també els exemples de les instruccions.
 * ARQUITECTURA: Un quadret fa U unitats de l'SVG (viewBox). Una peça és
 *   { quadrets: [[x, y], …], classe, etiqueta }: al joc, cada peça és un
 *   rectangle; a les instruccions n'hi ha alguna que no ho és (la «L» ✗).
 * DEPENDÈNCIES: Cap.
 * ============================================================================
 */
window.TaulerRectangles = (() => {
    const U = 10; // unitats de l'SVG per quadret
    const MARGE = 2;
    const CEL = 56; // px per quadret a la pantalla gran…
    const MAXIM = 520; // …però el tauler no fa mai més de 520 px d'ample
    const NS = 'http://www.w3.org/2000/svg';

    function svg(nom, at = {}) {
        const el = document.createElementNS(NS, nom);
        for (const k in at) el.setAttribute(k, at[k]);
        return el;
    }

    /**
     * Crea el tauler d'una figura (files de '#' i '.'). Retorna:
     *   el (l'svg), amp, alt,
     *   pinta(peces): dibuixa les peces, els talls i la vora;
     *   previsio(r, valid): mostra el rectangle r = { x, y, w, h } que s'està dibuixant (null l'amaga);
     *   cursor(q): el quadret del teclat (null l'amaga);
     *   quadret(clientX, clientY): el quadret { x, y } d'un punt de la pantalla (dins dels límits).
     */
    function crea(files, opcions = {}) {
        const alt = files.length;
        const amp = files[0].length;
        const dins = (x, y) => x >= 0 && y >= 0 && x < amp && y < alt && files[y][x] === '#';

        const el = svg('svg', {
            class: 'tauler-rect',
            viewBox: `${-MARGE} ${-MARGE} ${amp * U + 2 * MARGE} ${alt * U + 2 * MARGE}`,
        });
        el.style.width = (opcions.amplada || Math.min(amp * CEL, MAXIM)) + 'px';

        // Fons: els quadrets de la figura
        const fons = svg('g', { class: 'fons' });
        for (let y = 0; y < alt; y++) {
            for (let x = 0; x < amp; x++) {
                if (dins(x, y)) fons.appendChild(svg('rect', { x: x * U, y: y * U, width: U, height: U }));
            }
        }
        const capaPeces = svg('g', { class: 'peces' });
        // Quadrícula: les arestes entre dos quadrets de la figura
        let d = '';
        for (let y = 0; y < alt; y++) {
            for (let x = 0; x < amp; x++) {
                if (!dins(x, y)) continue;
                if (dins(x + 1, y)) d += `M${(x + 1) * U} ${y * U}v${U}`;
                if (dins(x, y + 1)) d += `M${x * U} ${(y + 1) * U}h${U}`;
            }
        }
        const quadricula = svg('path', { class: 'quadricula', d });
        const talls = svg('path', { class: 'talls' });
        const etiquetes = svg('g', { class: 'etiquetes' });
        const prev = svg('rect', { class: 'previsio' });
        const prevText = svg('text', {
            'class': 'previsio-text',
            'text-anchor': 'middle',
            'dominant-baseline': 'central',
        });
        const cur = svg('rect', { class: 'cursor', width: U, height: U });
        el.append(fons, capaPeces, quadricula, talls, etiquetes, prev, prevText, cur);

        function pinta(peces) {
            const amo = files.map(f => [...f].map(() => -1));
            peces.forEach((p, i) => p.quadrets.forEach(([x, y]) => (amo[y][x] = i)));
            const de = (x, y) => (dins(x, y) ? amo[y][x] : -2); // -2: fora de la figura
            capaPeces.replaceChildren();
            etiquetes.replaceChildren();
            peces.forEach(p => {
                const g = svg('g', { class: 'peca ' + (p.classe || '') });
                p.quadrets.forEach(([x, y]) => g.appendChild(svg('rect', { x: x * U, y: y * U, width: U, height: U })));
                capaPeces.appendChild(g);
                // L'etiqueta: al centre si la peça és un rectangle; si no, al quadret més proper al centre
                const xs = p.quadrets.map(q => q[0]);
                const ys = p.quadrets.map(q => q[1]);
                const cx = xs.reduce((a, b) => a + b) / xs.length;
                const cy = ys.reduce((a, b) => a + b) / ys.length;
                const rectangle =
                    p.quadrets.length ===
                    (Math.max(...xs) - Math.min(...xs) + 1) * (Math.max(...ys) - Math.min(...ys) + 1);
                const [lx, ly] = rectangle
                    ? [cx, cy]
                    : p.quadrets.reduce((m, q) =>
                          Math.hypot(q[0] - cx, q[1] - cy) < Math.hypot(m[0] - cx, m[1] - cy) ? q : m
                      );
                const t = svg('text', {
                    'x': (lx + 0.5) * U,
                    'y': (ly + 0.5) * U,
                    'class': 'etiqueta ' + (p.classe || ''),
                    'text-anchor': 'middle',
                    'dominant-baseline': 'central',
                });
                t.textContent = p.etiqueta;
                etiquetes.appendChild(t);
            });
            // Talls (entre dues peces, o entre una peça i un quadret buit) i vora de la figura
            let t = '';
            for (let y = -1; y < alt; y++) {
                for (let x = -1; x < amp; x++) {
                    const a = de(x, y);
                    const dreta = de(x + 1, y);
                    const sota = de(x, y + 1);
                    if (a !== dreta && (a !== -2 || dreta !== -2) && !(a === -1 && dreta === -1)) {
                        t += `M${(x + 1) * U} ${y * U}v${U}`;
                    }
                    if (a !== sota && (a !== -2 || sota !== -2) && !(a === -1 && sota === -1)) {
                        t += `M${x * U} ${(y + 1) * U}h${U}`;
                    }
                }
            }
            talls.setAttribute('d', t);
        }

        function previsio(r, valid) {
            const on = !!r;
            prev.style.display = on ? 'inline' : 'none';
            prevText.style.display = on ? 'inline' : 'none';
            if (!on) return;
            prev.setAttribute('x', r.x * U);
            prev.setAttribute('y', r.y * U);
            prev.setAttribute('width', r.w * U);
            prev.setAttribute('height', r.h * U);
            prev.classList.toggle('invalida', !valid);
            prevText.setAttribute('x', (r.x + r.w / 2) * U);
            prevText.setAttribute('y', (r.y + r.h / 2) * U);
            prevText.textContent = r.w * r.h;
        }

        function cursor(q) {
            cur.style.display = q ? 'inline' : 'none';
            if (!q) return;
            cur.setAttribute('x', q.x * U);
            cur.setAttribute('y', q.y * U);
        }

        function quadret(clientX, clientY) {
            const r = el.getBoundingClientRect();
            const ux = ((clientX - r.left) / r.width) * (amp * U + 2 * MARGE) - MARGE;
            const uy = ((clientY - r.top) / r.height) * (alt * U + 2 * MARGE) - MARGE;
            return {
                x: Math.max(0, Math.min(amp - 1, Math.floor(ux / U))),
                y: Math.max(0, Math.min(alt - 1, Math.floor(uy / U))),
            };
        }

        previsio(null);
        cursor(null);
        pinta([]);
        return { el, amp, alt, pinta, previsio, cursor, quadret };
    }

    // Una figura només per mirar (instruccions), amb unes peces
    function estatic(files, peces, opcions = {}) {
        const t = crea(files, opcions);
        t.el.classList.add('estatic');
        t.pinta(peces);
        return t.el;
    }

    return { crea, estatic };
})();
