/**
 * ============================================================================
 * FITXER: js/portada.js
 * ROL: A la portada (index.html), mostra quants problemes de cada puzzle ha
 *      resolt qui juga en aquest navegador. Si no hi ha localStorage, no fa res.
 * ============================================================================
 */
(() => {
    const PUZZLES = [
        { clau: 'inaba.enllac-multiples', el: 'progres-enllac', total: 42 },
        { clau: 'inaba.laberint-angles', el: 'progres-laberint', total: 38 },
        { clau: 'inaba.expressions-bessones', el: 'progres-bessones', total: 42 },
        { clau: 'inaba.talla-rectangles', el: 'progres-rectangles', total: 42 },
        { clau: 'inaba.creuat-multiples', el: 'progres-creuat', total: 42 },
        { clau: 'inaba.on-es-la-xifra', el: 'progres-xifra', total: 42 },
        { clau: 'inaba.busca-el-nombre', el: 'progres-nombre', total: 42 },
        { clau: 'inaba.busca-el-triangle', el: 'progres-triangle', total: 42 },
        { clau: 'inaba.escala-nombres', el: 'progres-escala', total: 42 },
        { clau: 'inaba.busca-la-figura', el: 'progres-figura', total: 42 },
    ];
    PUZZLES.forEach(({ clau, el, total }) => {
        try {
            const d = JSON.parse(localStorage.getItem(clau));
            const n = d && Array.isArray(d.resolts) ? d.resolts.length : 0;
            if (n > 0) document.getElementById(el).textContent = `Resolts: ${n} / ${total}`;
        } catch (e) {
            /* sense localStorage: es queda el text de l'HTML */
        }
    });
})();
