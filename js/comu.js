/**
 * ============================================================================
 * FITXER: js/comu.js
 * ROL: El que comparteixen tots els puzzles: el progrés desat al navegador,
 *      la capçalera (Problema n de N, ‹ Escull… ›) amb el diàleg per escollir
 *      problema, els missatges de sota el tauler i les animacions.
 * ARQUITECTURA: Cada puzzle el fa servir des del seu controlador
 *      (js/<puzzle>/<puzzle>.js). Els elements de la capçalera i del diàleg
 *      han de tenir els id de l'HTML dels puzzles (titol-problema, btn-tria…).
 * DEPENDÈNCIES: Cap. Es carrega abans del controlador del puzzle.
 * ============================================================================
 */
window.Comu = (() => {
    const $ = id => document.getElementById(id);

    // ============================================================
    // PROGRÉS: { resolts: [números de problema], actual: índex }
    // Si el navegador no deixa desar, es juga igual però no es recorda res.
    // ============================================================
    function progres(clau) {
        const dades = { resolts: [], actual: 0 };
        try {
            const d = JSON.parse(localStorage.getItem(clau));
            if (d && Array.isArray(d.resolts)) Object.assign(dades, d);
        } catch (e) {
            /* sense localStorage */
        }
        function desa() {
            try {
                localStorage.setItem(clau, JSON.stringify(dades));
            } catch (e) {
                /* sense localStorage */
            }
        }
        function marcaResolt(n) {
            if (dades.resolts.includes(n)) return;
            dades.resolts.push(n);
            dades.resolts.sort((a, b) => a - b);
            desa();
        }
        return { dades, desa, marcaResolt, esResolt: n => dades.resolts.includes(n) };
    }

    // ============================================================
    // CAPÇALERA I DIÀLEG «ESCULL…»
    // carrega(i) és la funció del puzzle que obre el problema i (0…total-1).
    // ============================================================
    function navegacio({ total, progres, carrega }) {
        const els = {
            titol: $('titol-problema'),
            jaResolt: $('ja-resolt'),
            comptador: $('comptador'),
            anterior: $('btn-anterior'),
            seguent: $('btn-seguent'),
            tria: $('btn-tria'),
            dialeg: $('dialeg-tria'),
            graella: $('graella-problemes'),
            tanca: $('btn-tanca-tria'),
            esborra: $('btn-esborra-progres'),
        };
        let actual = 0;

        for (let i = 0; i < total; i++) {
            const b = document.createElement('button');
            b.type = 'button';
            b.textContent = i + 1;
            b.addEventListener('click', () => {
                els.dialeg.close();
                carrega(i);
            });
            els.graella.appendChild(b);
        }

        function obreTria() {
            [...els.graella.children].forEach((b, i) => {
                const fet = progres.esResolt(i + 1);
                b.classList.toggle('fet', fet);
                b.classList.toggle('actual', i === actual);
                b.setAttribute('aria-label', `Problema ${i + 1}${fet ? ', resolt' : ''}`);
                if (i === actual) b.setAttribute('aria-current', 'true');
                else b.removeAttribute('aria-current');
            });
            els.dialeg.showModal();
            els.graella.children[actual].focus();
        }

        els.anterior.addEventListener('click', () => carrega(actual - 1));
        els.seguent.addEventListener('click', () => carrega(actual + 1));
        els.tria.addEventListener('click', obreTria);
        els.tanca.addEventListener('click', () => els.dialeg.close());
        els.esborra.addEventListener('click', () => {
            if (!confirm("S'esborraran les marques ✓ de tots els problemes resolts. Vols continuar?")) return;
            progres.dades.resolts = [];
            progres.desa();
            els.dialeg.close();
            carrega(0);
        });
        // Clicar fora del diàleg el tanca
        els.dialeg.addEventListener('click', e => {
            if (e.target === els.dialeg) els.dialeg.close();
        });

        // Posa al dia la capçalera
        function actualitza() {
            els.titol.textContent = `Problema ${actual + 1} de ${total}`;
            els.jaResolt.hidden = !progres.esResolt(actual + 1);
            els.comptador.textContent = `Resolts: ${progres.dades.resolts.length} / ${total}`;
            els.anterior.disabled = actual === 0;
            els.seguent.disabled = actual === total - 1;
        }

        // Quan el puzzle obre el problema i: el recorda, el posa a l'adreça (?p=) i a la capçalera
        function obre(i) {
            actual = i;
            progres.dades.actual = i;
            progres.desa();
            try {
                history.replaceState(null, '', '?p=' + (i + 1));
            } catch (e) {
                /* file:// en alguns navegadors */
            }
            actualitza();
        }

        // El problema per on es comença: el de l'adreça (?p=13) o el darrer que es va mirar
        function inicial() {
            const p = parseInt(new URLSearchParams(location.search).get('p'), 10);
            if (p >= 1 && p <= total) return p - 1;
            return Math.min(progres.dades.actual || 0, total - 1);
        }

        const totsResolts = () => progres.dades.resolts.length === total;

        // El botó que surt en resoldre un problema
        function botoSeguent() {
            const boto = document.createElement('button');
            boto.type = 'button';
            boto.className = 'btn-principal';
            if (actual < total - 1) {
                const seguent = actual + 1;
                boto.textContent = 'Problema següent →';
                boto.addEventListener('click', () => carrega(seguent));
            } else {
                boto.textContent = totsResolts() ? 'Torna a mirar els problemes' : 'Escull un altre problema';
                boto.addEventListener('click', obreTria);
            }
            return boto;
        }

        return { obre, actualitza, inicial, botoSeguent, totsResolts, obreTria, dialegObert: () => els.dialeg.open };
    }

    // ============================================================
    // MISSATGES (error / encert / avís) I ANIMACIONS
    // ============================================================
    function missatge(el, tipus, titol, frases = [], boto = null) {
        el.className = 'missatge ' + tipus;
        const t = document.createElement('div');
        t.className = 'missatge-titol';
        t.textContent = titol;
        el.replaceChildren(t);
        if (frases.length) {
            const ul = document.createElement('ul');
            frases.forEach(f => {
                const li = document.createElement('li');
                li.textContent = f;
                ul.appendChild(li);
            });
            el.appendChild(ul);
        }
        if (boto) el.appendChild(boto);
    }

    function amagaMissatge(el) {
        el.className = 'missatge';
        el.replaceChildren();
    }

    function anima(el, classe) {
        el.classList.remove(classe);
        void el.offsetWidth; // reinicia l'animació
        el.classList.add(classe);
        el.addEventListener('animationend', () => el.classList.remove(classe), { once: true });
    }

    return { progres, navegacio, missatge, amagaMissatge, anima };
})();
