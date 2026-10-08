"""
============================================================================
FITXER: tools/extreu-rectangles.py
ROL: Llegeix les figures del «Talla en rectangles» (四角カット) directament
     dels PDF (src/shikaku_q.pdf i src/shikaku_a.pdf) i escriu:
       - js/talla-rectangles/problemes.js        (les dades del joc)
       - tests/talla-rectangles-solucions.json   (les solucions del PDF)
COM: pdftocairo -svg dona les línies com a vectors: les negres gruixudes són
     la vora de la figura (i, al PDF de solucions, també els talls), i les
     grises, la quadrícula. pdftotext -bbox dona els números «(n)» i les mides.
     Cada figura es desa com a files de text: '#' és un quadret de la figura.
ÚS (des de l'arrel del repositori; cal poppler-utils):
     python3 tools/extreu-rectangles.py
============================================================================
"""
import json
import math
import re
import string
import subprocess
import unicodedata
from collections import Counter

PDF_Q = 'src/shikaku_q.pdf'
PDF_A = 'src/shikaku_a.pdf'

# L'exemple de la pàgina 1 (【例題】 i 【解答】). En aquesta pàgina les figures són imatges, no vectors:
# s'ha copiat a mà. Cada lletra de la solució és un rectangle.
EXEMPLE = ['####..', '####..', '######']
SOLUCIO_EXEMPLE = ['ABBB..', 'ABBB..', 'ACCCCC']


# ---------------------------------------------------------------- lectura del PDF
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


def segments_negres(pdf, pag):
    """Els segments negres gruixuts (vora i talls), en coordenades de pàgina."""
    segs = []
    for m in re.finditer(r'<path ([^>]*)/>', svg_de(pdf, pag).split('</defs>', 1)[1]):
        at = dict(re.findall(r'([\w-]+)="([^"]*)"', m.group(1)))
        if at.get('stroke') != 'rgb(0%, 0%, 0%)' or abs(float(at.get('stroke-width') or 0) - 12.5) > 0.01:
            continue
        nums = list(map(float, re.findall(r'-?[\d.]+', ' '.join(re.findall(r'[ML] [-\d. ]+', at['d'])))))
        punts = list(zip(nums[0::2], nums[1::2]))
        if 'transform' in at:
            a, b, c, d, e, f = map(float, re.findall(r'-?[\d.]+', at['transform']))
            punts = [(a * x + c * y + e, b * x + d * y + f) for x, y in punts]
        segs += [(punts[i], punts[i + 1]) for i in range(len(punts) - 1)]
    return segs


# ---------------------------------------------------------------- figures
def figures(pdf, pag):
    """Les figures d'una pàgina: llistes d'arestes unitàries ((x, y), (x2, y2)) en quadrets."""
    segs = segments_negres(pdf, pag)
    # El costat d'un quadret: la llargada més repetida dels segments
    costat = Counter(round(math.dist(a, b), 1) for a, b in segs).most_common(1)[0][0]
    # Figures = grups de segments que es toquen
    pare = list(range(len(segs)))

    def arrel(i):
        while pare[i] != i:
            i = pare[i]
        return i

    def a_prop(p, q):
        return math.dist(p, q) < costat * 0.2

    for i in range(len(segs)):
        for j in range(i):
            if any(a_prop(p, q) for p in segs[i] for q in segs[j]):
                pare[arrel(i)] = arrel(j)
    grups = {}
    for i in range(len(segs)):
        grups.setdefault(arrel(i), []).append(segs[i])
    out = []
    for g in grups.values():
        x0 = min(min(a[0], b[0]) for a, b in g)
        y0 = min(min(a[1], b[1]) for a, b in g)
        arestes = set()
        for a, b in g:
            (i1, j1), (i2, j2) = [((p[0] - x0) / costat, (p[1] - y0) / costat) for p in (a, b)]
            for v in (i1, j1, i2, j2):
                assert abs(v - round(v)) < 0.08, 'un segment no cau a la quadrícula'
            i1, j1, i2, j2 = map(round, (i1, j1, i2, j2))
            # Es parteix en arestes d'un quadret
            if i1 == i2:
                for j in range(min(j1, j2), max(j1, j2)):
                    arestes.add(((i1, j), (i1, j + 1)))
            else:
                for i in range(min(i1, i2), max(i1, i2)):
                    arestes.add(((i, j1), (i + 1, j1)))
        out.append({'x0': x0, 'y0': y0, 'costat': costat, 'arestes': arestes,
                    'x1': max(max(a[0], b[0]) for a, b in g), 'y1': max(max(a[1], b[1]) for a, b in g)})
    return out


def quadrets_dins(arestes):
    """Quadrets de dins d'una vora (paritat de les arestes horitzontals de sobre)."""
    amp = max(max(a[0], b[0]) for a, b in arestes)
    alt = max(max(a[1], b[1]) for a, b in arestes)
    dins = set()
    for i in range(amp):
        for j in range(alt):
            creua = sum(1 for (a, b) in arestes if a[1] == b[1] and a[1] <= j and a[0] == i and b[0] == i + 1)
            if creua % 2:
                dins.add((i, j))
    return dins, amp, alt


def com_text(dins, amp, alt, lletra=None):
    return [''.join((lletra(i, j) if lletra else '#') if (i, j) in dins else '.' for i in range(amp)) for j in range(alt)]


def peces(dins, talls):
    """Les peces que queden en tallar la figura per les arestes de «talls» (nombrades 0, 1…)."""
    peca = {}
    n = 0
    for q in sorted(dins, key=lambda q: (q[1], q[0])):
        if q in peca:
            continue
        cua = [q]
        peca[q] = n
        while cua:
            i, j = cua.pop()
            veins = [((i + 1, j), ((i + 1, j), (i + 1, j + 1))), ((i - 1, j), ((i, j), (i, j + 1))),
                     ((i, j + 1), ((i, j + 1), (i + 1, j + 1))), ((i, j - 1), ((i, j), (i + 1, j)))]
            for w, aresta in veins:
                if w in dins and w not in peca and aresta not in talls:
                    peca[w] = n
                    cua.append(w)
        n += 1
    return peca


def assigna(fig, words, patro):
    """Per a cada etiqueta que compleix el patró, la figura més propera: {figura: text}."""
    etiq = [w for w in words if re.fullmatch(patro, w['t'])]
    parells = []
    for e, w in enumerate(etiq):
        for k, f in enumerate(fig):
            dx = max(f['x0'] - w['x'], 0, w['x'] - f['x1'])
            dy = max(f['y0'] - w['y'], 0, w['y'] - f['y1'])
            parells.append((math.hypot(dx, dy), e, k))
    fet, usades = {}, set()
    for _, e, k in sorted(parells):
        if e not in usades and k not in fet:
            fet[k] = etiq[e]['t']
            usades.add(e)
    return fet


def problemes(pdf, pag):
    """{número: (figura, mides)} d'una pàgina."""
    fig = figures(pdf, pag)
    words = paraules(pdf, pag)
    nums = assigna(fig, words, r'\(\d+\)')
    mides = assigna(fig, words, r'\d+(,\d+)+')
    return {int(t[1:-1]): (fig[k], list(map(int, mides[k].split(','))) if k in mides else None)
            for k, t in nums.items()}


# ---------------------------------------------------------------- sortida
def main():
    Q, A = {}, {}
    for pag in range(2, 9):
        Q.update(problemes(PDF_Q, pag))
    for pag in range(1, 8):
        A.update({n: f for n, (f, _) in problemes(PDF_A, pag).items()})
    assert sorted(Q) == list(range(1, 43)) and sorted(A) == list(range(1, 43)), 'falten problemes'

    sols = {'exemple': SOLUCIO_EXEMPLE}

    def afegeix(nom, figq, figa, mides):
        dins, amp, alt = quadrets_dins(figq['arestes'])
        assert sum(mides) == len(dins), f'{nom}: les mides no sumen l\'àrea'
        # Talls de la solució: arestes negres de la solució que separen dos quadrets de dins
        peca = peces(dins, figa['arestes'])
        files = com_text(dins, amp, alt)
        if sorted(Counter(peca.values()).values()) != sorted(mides):
            # El dibuix de la solució del PDF no quadra amb les mides (passa al 41): no es desa
            print(f'Avís: {nom}: les peces de la solució del PDF no tenen les mides de la llista')
            return files, None
        sol = com_text(dins, amp, alt, lambda i, j: string.ascii_uppercase[peca[(i, j)]])
        return files, sol

    cos = ('    // L\'exemple de les instruccions (【例題】)\n'
           f'    exemple: {{ figura: {json.dumps(EXEMPLE)}, mides: [3, 5, 6] }},\n\n    llista: [\n')
    for n in range(1, 43):
        figq, mides = Q[n]
        files, sol = afegeix(f'problema {n}', figq, A[n], mides)
        cos += f'        {{ figura: {json.dumps(files)}, mides: {json.dumps(mides)} }}, // {n}\n'
        sols[str(n)] = sol

    capcalera = '''/**
 * ============================================================================
 * FITXER: js/talla-rectangles/problemes.js
 * ROL: Dades dels 42 problemes del puzzle «Talla en rectangles»
 *      (四角カット, de Naoki Inaba; src/shikaku_q.pdf).
 * NO S'EDITA A MÀ: el genera tools/extreu-rectangles.py a partir del PDF.
 * FORMAT de cada problema:
 *   figura: les files de la quadrícula, de dalt a baix: '#' és un quadret de
 *           la figura i '.', un lloc buit.
 *   mides:  els quadrets que ha de tenir cada rectangle (un rectangle per mida).
 * Les solucions NO són aquí: les busca motor.js, i tests/ les compara amb
 * les del PDF (src/shikaku_a.pdf).
 * DEPENDÈNCIES: Cap. Es carrega abans de motor.js.
 * ============================================================================
 */
// prettier-ignore
window.PROBLEMES_RECTANGLES = {
'''
    js = capcalera + cos.replace('"', "'") + '    ],\n};\n'
    open('js/talla-rectangles/problemes.js', 'w', encoding='utf-8').write(js)
    with open('tests/talla-rectangles-solucions.json', 'w', encoding='utf-8') as f:
        f.write('{\n' + ',\n'.join(f'    "{k}": {json.dumps(v)}' for k, v in sols.items()) + '\n}\n')
    print('Fet: 42 problemes i l\'exemple.')


if __name__ == '__main__':
    main()
