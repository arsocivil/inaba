/**
 * ============================================================================
 * FITXER: js/creuat-multiples/motor.js
 * ROL: Lògica pura del puzzle (sense DOM): llegir un quadre, trobar els nombres
 *      que es veuen des de cada número, comprovar-los i buscar les solucions.
 * ARQUITECTURA: analitza(problema) → un «quadre» g:
 *   g.amp, g.alt            mides en caselles
 *   g.cel[y][x]             { negra: false } o { negra: true, a, d } (a = número
 *                           que es llegeix cap avall, d = cap a la dreta)
 *   g.blanques              [{ x, y }] en ordre de lectura (fila a fila)
 *   g.trams                 [{ dir: 'a' | 'd', clau, x, y, cel: [{ x, y }] }]:
 *                           cada número amb les caselles blanques que «veu»
 *   Els valors que s'hi escriuen són una matriu v[y][x] amb una xifra 0–9 o null.
 * DEPENDÈNCIES: Cap.
 * ============================================================================
 */
window.MotorCreuat = (() => {
    // '#a3d8' → { negra: true, a: 3, d: 8 }; '.' → { negra: false }
    function casella(text) {
        if (text === '.') return { negra: false };
        const m = /^#(?:a(\d+))?(?:d(\d+))?$/.exec(text);
        if (!m) throw new Error(`casella no vàlida: ${text}`);
        return { negra: true, a: m[1] ? Number(m[1]) : null, d: m[2] ? Number(m[2]) : null };
    }

    function analitza(files) {
        const cel = files.map(f => f.split(' ').map(casella));
        const g = { amp: cel[0].length, alt: cel.length, cel, blanques: [], trams: [] };
        g.cel.forEach((fila, y) =>
            fila.forEach((c, x) => {
                if (!c.negra) g.blanques.push({ x, y });
            })
        );
        // Cada número «veu» les caselles blanques seguides que té cap avall (a) o cap a la dreta (d)
        g.cel.forEach((fila, y) =>
            fila.forEach((c, x) => {
                if (!c.negra) return;
                for (const dir of ['d', 'a']) {
                    if (c[dir] === null) continue;
                    const dx = dir === 'd' ? 1 : 0;
                    const dy = dir === 'a' ? 1 : 0;
                    const cels = [];
                    for (let i = 1; ; i++) {
                        const xx = x + dx * i;
                        const yy = y + dy * i;
                        if (xx >= g.amp || yy >= g.alt || g.cel[yy][xx].negra) break;
                        cels.push({ x: xx, y: yy });
                    }
                    g.trams.push({ dir, clau: c[dir], x, y, cel: cels });
                }
            })
        );
        return g;
    }

    const buida = g => g.cel.map(fila => fila.map(() => null));

    // El nombre que es veu en un tram, com a text de xifres; null si encara falta alguna xifra
    function nombreDe(tram, v) {
        const xifres = tram.cel.map(({ x, y }) => v[y][x]);
        return xifres.some(d => d === null) ? null : xifres.join('');
    }

    // Per què un nombre no és múltiple de clau: «8 × 8 = 64 i 8 × 9 = 72»
    function entre(nombre, clau) {
        const q = Math.floor(nombre / clau);
        return `${clau} × ${q} = ${clau * q} i ${clau} × ${q + 1} = ${clau * (q + 1)}`;
    }

    /**
     * Comprova el quadre. Retorna:
     *   complet: totes les caselles blanques tenen xifra;
     *   correcte: complet i tots els nombres són bons;
     *   trams: per a cada tram { tram, nombre (text o null), estat, motiu, quocient }, amb estat
     *     'be' | 'zero' | 'multiple' | 'incomplet'.
     */
    function comprova(g, v) {
        const complet = g.blanques.every(({ x, y }) => v[y][x] !== null);
        const trams = g.trams.map(tram => {
            const text = nombreDe(tram, v);
            const r = { tram, nombre: text, estat: 'incomplet', motiu: '', quocient: null };
            if (text === null) return r;
            const n = Number(text);
            if (text[0] === '0') {
                r.estat = 'zero';
                r.motiu = `El nombre que es veu des del ${tram.clau} no pot començar per 0.`;
            } else if (n % tram.clau !== 0) {
                r.estat = 'multiple';
                r.motiu = `${n} no és múltiple de ${tram.clau}: ${entre(n, tram.clau)}.`;
            } else {
                r.estat = 'be';
                r.quocient = n / tram.clau;
            }
            return r;
        });
        return { complet, correcte: complet && trams.every(t => t.estat === 'be'), trams };
    }

    // Totes les solucions (màxim `max`): es prova xifra a xifra, i un tram es comprova quan s'ha omplert
    function resol(g, max = 2) {
        const v = buida(g);
        const sols = [];
        const k = g.blanques.length;
        // Per a cada casella (en ordre), els trams que acaben en aquesta casella
        const acaben = g.blanques.map(({ x, y }) =>
            g.trams.filter(t => t.cel.length && t.cel[t.cel.length - 1].x === x && t.cel[t.cel.length - 1].y === y)
        );
        // Per a cada casella, els trams que hi comencen (la primera xifra no pot ser 0)
        const comencen = g.blanques.map(({ x, y }) =>
            g.trams.filter(t => t.cel.length && t.cel[0].x === x && t.cel[0].y === y)
        );
        function cerca(i) {
            if (sols.length >= max) return;
            if (i === k) {
                sols.push(v.map(fila => fila.slice()));
                return;
            }
            const { x, y } = g.blanques[i];
            for (let d = 0; d <= 9; d++) {
                if (d === 0 && comencen[i].length) continue;
                v[y][x] = d;
                if (acaben[i].every(t => Number(nombreDe(t, v)) % t.clau === 0)) cerca(i + 1);
            }
            v[y][x] = null;
        }
        cerca(0);
        return sols;
    }

    return { analitza, buida, nombreDe, comprova, resol };
})();
