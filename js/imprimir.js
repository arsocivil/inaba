/**
 * ============================================================================
 * FITXER: js/imprimir.js
 * ROL: Munta els fulls A4 de les versions per imprimir (imprimir/<puzzle>.html):
 *      els fulls de problemes (6 per full), la capçalera i el peu de cada full,
 *      i el botó «Imprimeix» de la barra de dalt.
 * ARQUITECTURA: El full d'instruccions s'escriu a mà a l'HTML. Aquest fitxer
 *   hi afegeix al darrere els fulls de problemes, i després posa capçalera i peu
 *   a tots els fulls que porten data-quins (els fulls en blanc no en porten).
 *   Cada puzzle li passa una funció que dibuixa el problema i-èsim.
 * DEPENDÈNCIES: Cap. El fa servir tools/genera-pdf.js a través de l'HTML.
 * ============================================================================
 */
window.Imprimir = (() => {
    const PEU =
        'Puzzle original de Naoki Inaba · © 2026 David Arso Civil · Departament de Matemàtiques, ' +
        'INS Miquel Tarradell · Contingut: CC BY-NC-SA 4.0';

    function element(etiqueta, classe, text) {
        const el = document.createElement(etiqueta);
        if (classe) el.className = classe;
        if (text !== undefined) el.textContent = text;
        return el;
    }

    /**
     * Afegeix els fulls de problemes al final del document.
     *   total, perFull: quants problemes n'hi ha i quants per full
     *   regla: una frase (HTML) per recordar la regla a dalt de cada full, o una funció
     *          (primer, darrer) → frase, si canvia d'un full a un altre
     *   dibuixa(i): l'element del problema i (0…)
     */
    function problemes({ total, perFull, regla, dibuixa }) {
        for (let primer = 1; primer <= total; primer += perFull) {
            const darrer = Math.min(primer + perFull - 1, total);
            const full = element('section', 'pagina');
            full.dataset.quins = `Problemes ${primer}–${darrer}`;
            if (regla) {
                const p = element('p', 'regla-full');
                p.innerHTML = typeof regla === 'function' ? regla(primer, darrer) : regla;
                full.appendChild(p);
            }
            const graella = element('div', 'problemes');
            for (let n = primer; n <= darrer; n++) {
                const fig = element('figure', 'problema');
                fig.appendChild(element('div', 'num-problema', n));
                fig.appendChild(dibuixa(n - 1));
                graella.appendChild(fig);
            }
            full.appendChild(graella);
            document.body.appendChild(full);
        }
    }

    // Posa la capçalera (títol i «Problemes 1–6») i el peu als fulls amb data-quins
    function capsIPeus({ titol, jp }) {
        document.querySelectorAll('.pagina[data-quins]').forEach(full => {
            const cap = element('header', 'cap');
            const h1 = element('h1', '', titol);
            if (jp) h1.appendChild(element('span', 'jp', jp));
            cap.append(h1, element('span', 'quins', full.dataset.quins));
            full.prepend(cap);
            full.appendChild(element('footer', 'peu', PEU));
        });
    }

    // El botó «Imprimeix» de la barra de dalt (la barra no s'imprimeix)
    document.querySelectorAll('[data-imprimeix]').forEach(b => b.addEventListener('click', () => window.print()));

    return { problemes, capsIPeus };
})();
