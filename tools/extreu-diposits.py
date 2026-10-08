"""
============================================================================
FITXER: tools/extreu-diposits.py
ROL: Llegeix els problemes de «Dipòsits d'aigua» (水そうと水) directament
     dels PDF (src/mizu_q.pdf i src/mizu_a.pdf) i escriu:
       - js/diposits-aigua/problemes.js        (les dades del joc)
       - tests/diposits-aigua-solucions.json   (el nivell de l'aigua de cada dipòsit al PDF de solucions)
COM: pdftocairo -svg dona la cara del davant dels cubs: les vores gruixudes
     (12,5) separen els dipòsits, les marques fines (3,125) de l'esquerra de
     cada cub en donen les divisions (3 marques = quarts), i al PDF de
     solucions, els rectangles blau clar són l'aigua. pdftotext -bbox dona
     «(n)» i els totals (5/4, 1…): a l'esquerra, d'una fila; a dalt, d'una
     columna.
ÚS (des de l'arrel del repositori; cal poppler-utils):
     python3 tools/extreu-diposits.py
============================================================================
"""
import json
import math
import os
import re
import subprocess
import unicodedata
from fractions import Fraction

PDF_Q = 'src/mizu_q.pdf'
PDF_A = 'src/mizu_a.pdf'
NEGRE = 'rgb(0%, 0%, 0%)'


def svg_de(pdf, pag):
    return subprocess.run(['pdftocairo', '-svg', '-f', str(pag), '-l', str(pag), pdf, '-'],
                          capture_output=True, text=True, check=True).stdout


def paraules(pdf, pag):
    html = subprocess.run(['pdftotext', '-bbox', '-f', str(pag), '-l', str(pag), pdf, '-'],
                          capture_output=True, text=True, check=True).stdout
    out = []
    patro = r'<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">([^<]*)</word>'
    for m in re.finditer(patro, html):
        x0, y0, x1, y1 = map(float, m.groups()[:4])
        out.append({'x': (x0 + x1) / 2, 'y': (y0 + y1) / 2, 't': unicodedata.normalize('NFKC', m.group(5))})
    return out


def subcamins(d):
    """Punts de cada subcamí d'un atribut d (M, L, C, Z) i si té corbes."""
    subs, cur, corba, cmd, nums = [], [], False, None, []

    def buida():
        nonlocal nums, corba
        if cmd in ('M', 'L'):
            cur.extend((nums[i], nums[i + 1]) for i in range(0, len(nums), 2))
        elif cmd == 'C':
            corba = True
            cur.extend((nums[i + 4], nums[i + 5]) for i in range(0, len(nums), 6))
        nums = []

    for t in re.findall(r'[MLCZ]|-?[\d.]+(?:e-?\d+)?', d):
        if t in 'MLCZ':
            if cmd:
                buida()
            if t == 'M' and cur:
                subs.append(cur)
                cur = []
            cmd = t
        else:
            nums.append(float(t))
    if cmd:
        buida()
    if cur:
        subs.append(cur)
    return subs, corba


def elements(pdf, pag):
    """Segments gruixuts (vores dels dipòsits), marques (3,125 negres) i rectangles d'aigua."""
    gruixuts, marques, aigua = [], [], []
    for m in re.finditer(r'<path ([^>]*)/>', svg_de(pdf, pag).split('</defs>', 1)[1]):
        at = dict(re.findall(r'([\w-]+)="([^"]*)"', m.group(1)))
        if 'd' not in at:
            continue
        subs, corba = subcamins(at['d'])
        if 'transform' in at:
            a, b, c, d, e, f = map(float, re.findall(r'-?[\d.]+', at['transform']))
            subs = [[(a * x + c * y + e, b * x + d * y + f) for x, y in s] for s in subs]
        gruix = float(at.get('stroke-width') or 0)
        if at.get('stroke') == NEGRE and abs(gruix - 12.5) < 0.01:
            for s in subs:
                gruixuts += [(s[i], s[i + 1]) for i in range(len(s) - 1)]
        elif at.get('stroke') == NEGRE and abs(gruix - 3.125) < 0.01:
            for s in subs:
                marques += [(s[i], s[i + 1]) for i in range(len(s) - 1)]
        elif at.get('fill', '').startswith('rgb(73'):
            for s in subs:
                xs, ys = [q[0] for q in s], [q[1] for q in s]
                aigua.append((min(xs), min(ys), max(xs), max(ys)))
    return gruixuts, marques, aigua


def fraccio(t):
    t = re.sub(r'\s', '', t)
    return Fraction(t) if re.fullmatch(r'\d+(/\d+)?', t) else None


def cares(gruixuts):
    """Agrupa els segments gruixuts en cares del davant (una per problema): la seva caixa."""
    pare = list(range(len(gruixuts)))

    def arrel(i):
        while pare[i] != i:
            i = pare[i]
        return i

    caixa = [(min(a[0], b[0]), min(a[1], b[1]), max(a[0], b[0]), max(a[1], b[1])) for a, b in gruixuts]
    for i in range(len(caixa)):
        for j in range(i):
            p, q = caixa[i], caixa[j]
            if p[0] <= q[2] + 3 and q[0] <= p[2] + 3 and p[1] <= q[3] + 3 and q[1] <= p[3] + 3:
                pare[arrel(i)] = arrel(j)
    grups = {}
    for i in range(len(caixa)):
        grups.setdefault(arrel(i), []).append(i)
    return [(min(caixa[i][0] for i in g), min(caixa[i][1] for i in g), max(caixa[i][2] for i in g),
             max(caixa[i][3] for i in g), [gruixuts[i] for i in g]) for g in grups.values()]


CUB = 45.3  # el costat d'un cub, en punts (el mateix a tot el PDF)


def problema(cara, marques, aigua, words):
    x0, y0, x1, y1, segs = cara
    amp, alt = round((x1 - x0) / CUB), round((y1 - y0) / CUB)
    cx, cy = (x1 - x0) / amp, (y1 - y0) / alt

    def gruixut(x, y, vertical):
        """Hi ha una vora gruixuda que passa pel punt (x, y)?"""
        for (ax, ay), (bx, by) in segs:
            if vertical and abs(ax - bx) < 2 and abs(ax - x) < 3 and min(ay, by) - 2 <= y <= max(ay, by) + 2:
                return True
            if not vertical and abs(ay - by) < 2 and abs(ay - y) < 3 and min(ax, bx) - 2 <= x <= max(ax, bx) + 2:
                return True
        return False

    # Dipòsits: cel·les unides si la vora entre elles no és gruixuda
    pare = {(f, c): (f, c) for f in range(alt) for c in range(amp)}

    def arrel(k):
        while pare[k] != k:
            k = pare[k]
        return k

    for f in range(alt):
        for c in range(amp):
            if c + 1 < amp and not gruixut(x0 + (c + 1) * cx, y0 + (f + 0.5) * cy, True):
                pare[arrel((f, c))] = arrel((f, c + 1))
            if f + 1 < alt and not gruixut(x0 + (c + 0.5) * cx, y0 + (f + 1) * cy, False):
                pare[arrel((f, c))] = arrel((f + 1, c))
    ids, files = {}, []
    for f in range(alt):
        fila = ''
        for c in range(amp):
            r = arrel((f, c))
            ids.setdefault(r, 'ABCDEFGHI'[len(ids)])
            fila += ids[r]
        files.append(fila)
    # Cada dipòsit ha de ser un rectangle
    for lletra in ids.values():
        cel = [(f, c) for f in range(alt) for c in range(amp) if files[f][c] == lletra]
        fs, cs = [f for f, _ in cel], [c for _, c in cel]
        assert len(cel) == (max(fs) - min(fs) + 1) * (max(cs) - min(cs) + 1), ('no és un rectangle', files)
    # Divisions: les marques curtes de l'esquerra dels cubs (n marques → n + 1 parts); 0 si no n'hi ha
    divisions = set()
    for f in range(alt):
        for c in range(amp):
            n = sum(1 for (ax, ay), (bx, by) in marques
                    if abs(ay - by) < 0.5 and abs(bx - ax) < 0.5 * cx
                    and x0 + c * cx - 2 <= min(ax, bx) <= x0 + c * cx + 0.2 * cx
                    and y0 + f * cy + 2 < ay < y0 + (f + 1) * cy - 2)
            divisions.add(n + 1 if n else 0)
    divisions.discard(0)  # les marques només són a la columna de l'esquerra de cada dipòsit
    assert len(divisions) <= 1, divisions
    div = divisions.pop() if divisions else 0
    # Totals: a l'esquerra de la cara, d'una fila; a dalt, d'una columna
    files_t, columnes_t = [None] * alt, [None] * amp
    for w in words:
        v = fraccio(w['t'])
        if v is None:
            continue
        if x0 - 110 < w['x'] < x0 - 20 and y0 - 5 < w['y'] < y1 + 5:
            f = int((w['y'] - y0) // cy)
            assert files_t[f] is None
            files_t[f] = v
        elif w['y'] < y0 - 20 and x0 - 5 < w['x'] < x1 + 5 and w['y'] > y0 - 90:
            c = int((w['x'] - x0) // cx)
            assert columnes_t[c] is None
            columnes_t[c] = v
    # Aigua de cada cel·la (PDF de solucions): l'alçada dels rectangles blaus dins de la cel·la
    nivells = None
    if aigua:
        omple = [[Fraction(0)] * amp for _ in range(alt)]
        for f in range(alt):
            for c in range(amp):
                mx = x0 + (c + 0.5) * cx
                t, b = y0 + f * cy, y0 + (f + 1) * cy
                h = 0
                for (ax, ay, bx, by) in aigua:
                    if ax < mx < bx and by - ay > 0.5:
                        h += max(0, min(b, by) - max(t, ay))
                omple[f][c] = h / cy
        # Als problemes sense marques (37-42), el PDF escriu l'aigua de cada cub: es fa servir aquest text
        for w in words:
            v = fraccio(w['t'])
            if v is not None and x0 < w['x'] < x1 and y0 < w['y'] < y1:
                omple[int((w['y'] - y0) // cy)][int((w['x'] - x0) // cx)] = v
        nivells = {}
        for lletra in ids.values():
            cel = [(f, c) for f in range(alt) for c in range(amp) if files[f][c] == lletra]
            c0 = cel[0][1]
            h = sum(omple[f][c] for f, c in cel if c == c0)
            # El dibuix és aproximat: s'arrodoneix a les divisions de les marques
            nivells[lletra] = Fraction(round(h * div), div) if div else Fraction(h)
    return {'files': files, 'divisions': div, 'totalsFiles': files_t, 'totalsColumnes': columnes_t,
            'nivells': nivells, 'x0': x0, 'y0': y0}


def pagina(pdf, pag):
    gruixuts, marques, aigua = elements(pdf, pag)
    words = paraules(pdf, pag)
    etiq = [w for w in words if re.fullmatch(r'\(\d+\)', w['t'])]
    res = {}
    for cara in cares(gruixuts):
        x0, y0, x1, y1, _ = cara
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        dalt = [w for w in etiq if w['y'] < cy]
        fila = max(w['y'] for w in dalt)
        # De la fila, l'etiqueta de la seva columna: la de més a la dreta que queda a l'esquerra de la cara
        w = max((w for w in dalt if abs(w['y'] - fila) < 30 and w['x'] < x0 + 10), key=lambda w: w['x'])
        n = int(w['t'][1:-1])
        assert n not in res, n
        res[n] = problema(cara, marques, aigua, words)
    return res


# L'exemple de la pàgina 1 (【例題】 i 【解答】): s'hi barregen els dibuixos de l'explicació, i es copia a mà.
# A dalt, dos dipòsits d'un cub; a baix, un d'ample. Fila de dalt: 1; fila de baix: 1; columna de la dreta: 5/6.
EXEMPLE = {'files': ['AB', 'CC'], 'divisions': 6, 'totalsFiles': ['1', '1'], 'totalsColumnes': [None, '5/6']}
SOLUCIO_EXEMPLE = ['2/3', '1/3', '1/2']


def main():
    q, a = {}, {}
    for pag in range(2, 9):
        q.update(pagina(PDF_Q, pag))
        a.update(pagina(PDF_A, pag - 1))
    assert sorted(q) == list(range(1, 43)) and sorted(a) == list(range(1, 43)), 'falten problemes'
    text = lambda v: None if v is None else str(v)
    sols = {'exemple': SOLUCIO_EXEMPLE}
    llista = lambda vs: '[' + ', '.join('null' if v is None else f"'{v}'" for v in vs) + ']'
    js = lambda p: (f"{{ files: {llista(p['files'])}, divisions: {p['divisions']}, "
                    f"totalsFiles: {llista(p['totalsFiles'])}, totalsColumnes: {llista(p['totalsColumnes'])} }}")
    cos = f"    // L'exemple de les instruccions (【例題】)\n    exemple: {js(EXEMPLE)},\n\n    llista: [\n"
    for n in range(1, 43):
        p, s = q[n], a[n]
        assert (s['files'], s['divisions'], s['totalsFiles'], s['totalsColumnes']) == \
            (p['files'], p['divisions'], p['totalsFiles'], p['totalsColumnes']), n
        d = {'files': p['files'], 'divisions': p['divisions'],
             'totalsFiles': [text(v) for v in p['totalsFiles']], 'totalsColumnes': [text(v) for v in p['totalsColumnes']]}
        cos += f'        {js(d)}, // {n}\n'
        sols[str(n)] = [str(s['nivells'][l]) for l in sorted(s['nivells'])]
    capcalera = """/**
 * ============================================================================
 * FITXER: js/diposits-aigua/problemes.js
 * ROL: Dades dels 42 problemes del puzzle «Dipòsits d'aigua»
 *      (水そうと水, de Naoki Inaba; src/mizu_q.pdf).
 * NO S'EDITA A MÀ: el genera tools/extreu-diposits.py a partir del PDF.
 * FORMAT de cada problema:
 *   files:          la cara del davant, de dalt a baix: cada lletra és el
 *                   dipòsit d'aquell cub (cada dipòsit és un rectangle de cubs).
 *   divisions:      en quantes parts divideixen cada cub les marques del costat
 *                   (4: quarts, 6: sisens); 0 si no n'hi ha.
 *   totalsFiles:    el total d'aigua de cada fila (de dalt a baix), o null.
 *   totalsColumnes: el total d'aigua de cada columna (d'esquerra a dreta), o null.
 * 1 cub = 1 litre. Les solucions NO són aquí: les busca motor.js, i tests/ les
 * compara amb les del PDF (src/mizu_a.pdf).
 * DEPENDÈNCIES: Cap. Es carrega abans de motor.js.
 * ============================================================================
 */
// prettier-ignore
window.PROBLEMES_DIPOSITS = {
"""
    os.makedirs('js/diposits-aigua', exist_ok=True)
    with open('js/diposits-aigua/problemes.js', 'w') as f:
        f.write(capcalera + cos + '    ],\n};\n')
    with open('tests/diposits-aigua-solucions.json', 'w') as f:
        f.write('{\n' + ',\n'.join(f'  {json.dumps(k)}: {json.dumps(v)}' for k, v in sols.items()) + '\n}\n')
    print('✓ js/diposits-aigua/problemes.js i tests/diposits-aigua-solucions.json')


if __name__ == '__main__':
    main()
