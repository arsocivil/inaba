/**
 * ============================================================================
 * FITXER: js/talla-rectangles/motor.js
 * ROL: Lògica pura del puzzle (sense DOM): llegir la figura, comprovar els
 *      rectangles i buscar les solucions.
 * ARQUITECTURA: Un rectangle és { x, y, w, h } en quadrets (x = columna i
 *   y = fila del quadret de dalt a l'esquerra). Una figura té `amp` columnes i
 *   `alt` files; dins(f, x, y) diu si el quadret (x, y) és de la figura.
 * DEPENDÈNCIES: Cap.
 * ============================================================================
 */
window.MotorRectangles = (() => {
    function figura(p) {
        const alt = p.figura.length;
        const amp = p.figura[0].length;
        let area = 0;
        p.figura.forEach(fila => [...fila].forEach(c => (area += c === '#' ? 1 : 0)));
        return { amp, alt, area, files: p.figura };
    }

    function dins(f, x, y) {
        return x >= 0 && y >= 0 && x < f.amp && y < f.alt && f.files[y][x] === '#';
    }

    // El rectangle que va del quadret a al b (en qualsevol ordre)
    function entre(a, b) {
        return {
            x: Math.min(a.x, b.x),
            y: Math.min(a.y, b.y),
            w: Math.abs(a.x - b.x) + 1,
            h: Math.abs(a.y - b.y) + 1,
        };
    }

    // El rectangle cau tot dins de la figura?
    function cap(f, r) {
        for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) if (!dins(f, x, y)) return false;
        return true;
    }

    function toca(r, s) {
        return r.x < s.x + s.w && s.x < r.x + r.w && r.y < s.y + s.h && s.y < r.y + r.h;
    }

    /**
     * Revisa uns rectangles (que no es trepitgen i són dins de la figura).
     * Retorna { complet, sobren: [índexs dels rectangles amb una mida que no toca], correcte }.
     * Una mida «no toca» si no és a la llista o si ja hi ha un altre rectangle d'aquella mida.
     */
    function comprova(p, rects) {
        const f = figura(p);
        const coberts = rects.reduce((s, r) => s + r.w * r.h, 0);
        const queden = [...p.mides];
        const sobren = [];
        rects.forEach((r, i) => {
            const k = queden.indexOf(r.w * r.h);
            if (k >= 0) queden.splice(k, 1);
            else sobren.push(i);
        });
        const complet = coberts === f.area;
        return { complet, sobren, correcte: complet && sobren.length === 0 };
    }

    // Totes les maneres de tallar la figura en rectangles de les mides de la llista (cadascuna un cop)
    function resol(p) {
        const f = figura(p);
        const ple = f.files.map(fila => [...fila].map(c => c !== '#'));
        const solucions = [];
        const posats = [];
        const usades = p.mides.map(() => false);
        (function prova() {
            // El primer quadret buit (de dalt a baix i d'esquerra a dreta) ha de ser la cantonada d'un rectangle
            let x0 = -1;
            let y0 = -1;
            for (let y = 0; y < f.alt && x0 < 0; y++) {
                for (let x = 0; x < f.amp; x++) {
                    if (!ple[y][x]) {
                        x0 = x;
                        y0 = y;
                        break;
                    }
                }
            }
            if (x0 < 0) {
                solucions.push(posats.map(r => ({ ...r })));
                return;
            }
            p.mides.forEach((m, k) => {
                if (usades[k]) return;
                for (let w = 1; w <= m; w++) {
                    if (m % w) continue;
                    const r = { x: x0, y: y0, w, h: m / w };
                    if (!cap(f, r) || ocupat(r)) continue;
                    marca(r, true);
                    usades[k] = true;
                    posats.push(r);
                    prova();
                    posats.pop();
                    usades[k] = false;
                    marca(r, false);
                }
            });
        })();
        return solucions;

        function ocupat(r) {
            for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) if (ple[y][x]) return true;
            return false;
        }
        function marca(r, v) {
            for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) ple[y][x] = v;
        }
    }

    return { figura, dins, entre, cap, toca, comprova, resol };
})();
