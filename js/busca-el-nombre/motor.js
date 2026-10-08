/**
 * ============================================================================
 * FITXER: js/busca-el-nombre/motor.js
 * ROL: Lògica pura del puzzle (sense DOM): llegir un problema, comptar les
 *      fruites d'un quadrat, comprovar-lo i buscar-ne les solucions.
 * ARQUITECTURA: analitza(problema) → un «problema analitzat» g:
 *   g.mida      costat del quadrat (2 o 3)
 *   g.amp, g.alt  columnes i files de la quadrícula (la zona de punts)
 *   g.cel[f][c]   { p, m }: pomes i mandarines del quadret de la fila f, columna c
 *   g.pregunta    la pregunta tal com és a problemes.js
 *   Un quadrat es descriu pel seu quadret de dalt a l'esquerra: [c, f]. Hi ha
 *   quadrats que no hi caben (sortirien de la línia de punts): no existeixen.
 * REGLES: només compten les fruites que queden dins del quadrat. Segons la
 *   pregunta, el compte de pomes (p) i mandarines (m) ha de ser un nombre
 *   donat, més o menys d'una fruita que d'una altra, igual, o amb una
 *   diferència donada.
 * DEPENDÈNCIES: Cap.
 * ============================================================================
 */
window.MotorKazu = (() => {
    function analitza([mida, files, pregunta]) {
        const cel = files.map(f =>
            f.split(' ').map(t => ({ p: (t.match(/p/g) || []).length, m: (t.match(/m/g) || []).length }))
        );
        const amp = cel[0].length;
        if (cel.some(f => f.length !== amp)) throw new Error('la quadrícula no és un rectangle');
        return { mida, amp, alt: cel.length, cel, pregunta };
    }

    // Hi ha mandarines en algun lloc? (els primers 24 problemes només tenen pomes)
    function teMandarines(g) {
        return g.cel.some(f => f.some(x => x.m > 0));
    }

    // El quadrat [c, f] cap dins de la quadrícula?
    function cap(g, c, f) {
        return c >= 0 && f >= 0 && c + g.mida <= g.amp && f + g.mida <= g.alt;
    }

    // Pomes i mandarines dins del quadrat [c, f]
    function compta(g, c, f) {
        let p = 0;
        let m = 0;
        for (let i = f; i < f + g.mida; i++) {
            for (let j = c; j < c + g.mida; j++) {
                p += g.cel[i][j].p;
                m += g.cel[i][j].m;
            }
        }
        return { p, m };
    }

    // Una pregunta és certa amb aquests comptes?
    function compleix(pregunta, { p, m }) {
        const [tipus, x] = pregunta;
        switch (tipus) {
            case 'n':
                return p + m === x;
            case 'igual':
                return p === m;
            case 'dif':
                return Math.abs(p - m) === x;
            case 'mes': // x és la fruita que n'hi ha més
                return x === 'm' ? m > p : p > m;
            case 'menys': // x és la fruita que n'hi ha menys
                return x === 'm' ? m < p : p < m;
        }
        throw new Error('pregunta desconeguda: ' + tipus);
    }

    // «1 poma», «3 pomes», «0 pomes»
    function pomes(n) {
        return n === 1 ? '1 poma' : n + ' pomes';
    }
    function mandarines(n) {
        return n === 1 ? '1 mandarina' : n + ' mandarines';
    }

    // El compte, en paraules: «3 pomes» (només pomes) o «2 pomes i 1 mandarina»
    function descriuCompte(g, { p, m }) {
        return teMandarines(g) ? `${pomes(p)} i ${mandarines(m)}` : pomes(p);
    }

    // La pregunta, en català (el que es mostra a sobre del tauler)
    function enunciat(g) {
        const [tipus, x] = g.pregunta;
        switch (tipus) {
            case 'n':
                return `On n'hi ha ${x}?`;
            case 'igual':
                return 'On hi ha tantes pomes com mandarines?';
            case 'dif':
                return `On la diferència entre pomes i mandarines és ${x}?`;
            case 'mes':
                return x === 'm' ? 'On hi ha més mandarines que pomes?' : 'On hi ha més pomes que mandarines?';
            case 'menys':
                return x === 'm' ? 'On hi ha menys mandarines que pomes?' : 'On hi ha menys pomes que mandarines?';
        }
        throw new Error('pregunta desconeguda: ' + tipus);
    }

    // Com són els dos comptes, en paraules: «més pomes que mandarines», «tantes pomes com mandarines»
    function relacio({ p, m }) {
        if (p > m) return 'més pomes que mandarines';
        if (p < m) return 'més mandarines que pomes';
        return 'tantes pomes com mandarines';
    }

    // Una frase amb el que hi ha dins del quadrat (per al missatge, quan és bo o quan no ho és)
    function explica(g, k) {
        const [tipus] = g.pregunta;
        const compte = descriuCompte(g, k);
        if (tipus === 'dif')
            return `${compte}: ${Math.max(k.p, k.m)} − ${Math.min(k.p, k.m)} = ${Math.abs(k.p - k.m)}.`;
        if (tipus === 'n') return `Aquí hi ha ${compte}.`;
        return `Aquí hi ha ${compte}: ${relacio(k)}.`;
    }

    // Comprova un quadrat: { correcte, p, m, compte, motiu, frase }.
    // El motiu explica per què no va bé; la frase explica què hi ha dins (en tot cas).
    function comprova(g, c, f) {
        const k = compta(g, c, f);
        const compte = descriuCompte(g, k);
        const correcte = compleix(g.pregunta, k);
        const [tipus, x] = g.pregunta;
        let motiu = '';
        if (!correcte) {
            if (tipus === 'n') motiu = `Aquí hi ha ${compte}, i en volies ${x}.`;
            else if (tipus === 'dif')
                motiu = `Aquí hi ha ${compte}: la diferència és ${Math.abs(k.p - k.m)}, i en volies ${x}.`;
            else motiu = explica(g, k);
        }
        return { correcte, p: k.p, m: k.m, compte, motiu, frase: explica(g, k) };
    }

    // Tots els quadrats [c, f] que compleixen la pregunta
    function resol(g) {
        const out = [];
        for (let f = 0; f + g.mida <= g.alt; f++) {
            for (let c = 0; c + g.mida <= g.amp; c++) {
                if (compleix(g.pregunta, compta(g, c, f))) out.push([c, f]);
            }
        }
        return out;
    }

    return { analitza, teMandarines, cap, compta, compleix, descriuCompte, enunciat, comprova, resol };
})();
