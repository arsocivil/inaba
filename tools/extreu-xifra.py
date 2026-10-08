"""
============================================================================
FITXER: tools/extreu-xifra.py
ROL: Llegeix les sumes de «On és la xifra?» (どこかな算) directament dels PDF
     (src/dokoeq_q.pdf i src/dokoeq_a.pdf) i escriu:
       - js/on-es-la-xifra/problemes.js        (les dades del joc)
       - tests/on-es-la-xifra-solucions.json   (les solucions del PDF)
COM: pdftocairo -svg dona cada □ com un rectangle tancat amb traç negre gruixut
     (6,25); pdftotext -bbox dona els números de les pistes (el «４，８» és una
     sola paraula). Cada pàgina té 6 problemes (2 columnes x 3 files), amb
     l'etiqueta （n） a dalt a l'esquerra de cadascun.
     Una pista és «de fila» si és a la dreta de les caselles, a l'altura d'una
     fila; és «de columna» si és a sobre de les caselles, alineada amb una
     columna. A les respostes, les xifres són paraules dins de les caselles.
FORMAT de cada problema (vegeu js/on-es-la-xifra/problemes.js):
     [[n1, n2, ns], [pistes de columna], [pistes de fila]]
ÚS (des de l'arrel del repositori; cal poppler-utils):
     python3 tools/extreu-xifra.py
============================================================================
"""
import json
import re
import subprocess
import unicodedata

PDF_Q = 'src/dokoeq_q.pdf'
PDF_A = 'src/dokoeq_a.pdf'

# L'exemple de la pàgina 1 (【例題】 i 【解答】): s'ha copiat a mà (el 3 apunta a la columna, el 5 a la fila).
EXEMPLE = '[[1, 1, 2], [[], [3]], [[], [5], []]]'


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


def caselles(pdf, pag):
    """Els □ de la pàgina, en coordenades de pàgina: {'x','y'} = centre."""
    out = []
    for m in re.finditer(r'<path ([^>]*)/>', svg_de(pdf, pag).split('</defs>', 1)[1]):
        at = dict(re.findall(r'([\w-]+)="([^"]*)"', m.group(1)))
        if 'd' not in at or 'transform' not in at or 'Z' not in at['d']:
            continue
        if at.get('stroke') != 'rgb(0%, 0%, 0%)' or abs(float(at.get('stroke-width') or 0) - 6.25) > 0.01:
            continue
        nums = list(map(float, re.findall(r'-?[\d.]+', at['d'].split('Z')[0])))
        punts = list(zip(nums[0::2], nums[1::2]))
        a, b, c, d, e, f = map(float, re.findall(r'-?[\d.]+', at['transform']))
        punts = [(a * x + c * y + e, b * x + d * y + f) for x, y in punts]
        xs, ys = [p[0] for p in punts], [p[1] for p in punts]
        out.append({'x': (min(xs) + max(xs)) / 2, 'y': (min(ys) + max(ys)) / 2,
                    'w': max(xs) - min(xs)})
    return out


def problemes_de(pdf, pag):
    """Els 6 problemes d'una pàgina: llista de {n, caselles, paraules}."""
    cas, par = caselles(pdf, pag), paraules(pdf, pag)
    etiquetes = sorted([p for p in par if re.fullmatch(r'\(\d+\)', p['t'])], key=lambda p: (round(p['y']), p['x']))
    assert len(etiquetes) == 6, (pag, len(etiquetes))
    # Regions: columna esquerra/dreta (x < 297) i franges verticals entre etiquetes.
    ys = []
    for e in sorted(etiquetes, key=lambda e: e['y']):
        if not ys or e['y'] - ys[-1] > 20:  # les etiquetes d'una mateixa fila difereixen 1-15 pt
            ys.append(e['y'])
    out = []
    for e in etiquetes:
        n = int(e['t'][1:-1])
        esq = e['x'] < 297
        k = max(i for i in range(len(ys)) if ys[i] <= e['y'] + 20 and e['y'] - ys[i] < 20)
        y0 = ys[k] - 20
        y1 = ys[k + 1] - 20 if k + 1 < len(ys) else 9999
        dins = lambda p: y0 <= p['y'] < y1 and (p['x'] < 297) == esq
        out.append({'n': n, 'cas': [c for c in cas if dins(c)],
                    'par': [p for p in par if dins(p) and p is not e and p['t'] != '+']})
    return sorted(out, key=lambda p: p['n'])


def estructura(pb):
    """Files de caselles i pistes d'un problema → ([n1, n2, ns], pistes de columna, pistes de fila)."""
    cas = pb['cas']
    fy = sorted(set(round(c['y']) for c in cas))
    # Les files de caselles estan separades uns 37 pt; ajunta les que difereixen menys de 6.
    files = []
    for y in fy:
        if files and y - files[-1] < 6:
            continue
        files.append(y)
    assert len(files) == 3, (pb['n'], files)
    per_fila = [sorted([c for c in cas if abs(c['y'] - y) < 6], key=lambda c: c['x']) for y in files]
    amplada = per_fila[0][0]['w'] if per_fila[0] else 30
    # Columnes: posicions x úniques (la fila més ampla les defineix; les altres hi encaixen)
    xs = []
    for c in sorted(cas, key=lambda c: c['x']):
        if not xs or c['x'] - xs[-1] > 6:
            xs.append(c['x'])
    nc = len(xs)
    ns = [len(f) for f in per_fila]
    # Totes les files acaben a la mateixa columna (alineades a la dreta)
    for f in per_fila:
        assert abs(f[-1]['x'] - xs[-1]) < 6, (pb['n'], 'no alineat')
    dreta = max(c['x'] for c in cas) + amplada / 2
    dalt = min(c['y'] for c in cas) - amplada / 2
    pistes_col = [[] for _ in range(nc)]
    pistes_fila = [[] for _ in range(3)]
    for p in pb['par']:
        if any(abs(p['x'] - c['x']) < 12 and abs(p['y'] - c['y']) < 12 for c in cas):
            continue  # xifra escrita dins d'una casella (a les respostes), no és una pista
        xifres = sorted(int(t) for t in re.findall(r'\d', p['t']))
        if p['x'] > dreta:
            i = min(range(3), key=lambda k: abs(p['y'] - files[k]))
            assert abs(p['y'] - files[i]) < 12, (pb['n'], p)
            pistes_fila[i] = xifres
        else:
            assert p['y'] < dalt, (pb['n'], p)
            # el text pot ser «4,8»: una sola paraula centrada a sobre d'una columna;
            # si en canvi són dues paraules separades (x diferent) cada una és de la seva columna
            j = min(range(nc), key=lambda k: abs(p['x'] - xs[k]))
            assert abs(p['x'] - xs[j]) < 14, (pb['n'], p)
            pistes_col[j] = sorted(set(pistes_col[j]) | set(xifres))
    return ns, pistes_col, pistes_fila, per_fila


def main():
    dades, sols = [], []
    for pag in range(2, 9):
        pq = problemes_de(PDF_Q, pag)
        pa = problemes_de(PDF_A, pag - 1)
        for q, a in zip(pq, pa):
            ns, pc, pf, _ = estructura(q)
            ns2, _, _, per_fila = estructura(a)
            assert ns == ns2, (q['n'], ns, ns2)
            # xifres de la resposta: paraules d'un sol dígit que cauen dins d'una casella
            sol = []
            for f in per_fila:
                txt = ''
                for c in f:
                    t = [p['t'] for p in a['par'] if abs(p['x'] - c['x']) < 8 and abs(p['y'] - c['y']) < 8]
                    assert len(t) == 1 and re.fullmatch(r'\d', t[0]), (q['n'], c, t)
                    txt += t[0]
                sol.append(txt)
            dades.append((q['n'], ns, pc, pf))
            sols.append(sol)
    return dades, sols


CAPCALERA = '''/**
 * ============================================================================
 * FITXER: js/on-es-la-xifra/problemes.js
 * ROL: Dades dels 42 problemes del puzzle «On és la xifra?»
 *      (どこかな算, de Naoki Inaba; src/dokoeq_q.pdf).
 * NO S'EDITA A MÀ: el genera tools/extreu-xifra.py a partir del PDF.
 * FORMAT de cada problema: [[n1, n2, ns], pistesColumna, pistesFila]
 *   [n1, n2, ns]  quantes xifres (caselles □) té el primer nombre, el segon i
 *                 el resultat. Els nombres van alineats per la dreta (unitats
 *                 amb unitats); el resultat és el més llarg.
 *   pistesColumna una llista per columna (d'esquerra a dreta, com el resultat):
 *                 les xifres dels números de dalt (↓). Cadascuna ha de ser
 *                 en alguna casella d'aquella columna (de les tres files).
 *   pistesFila    una llista per fila (primer nombre, segon, resultat): les
 *                 xifres dels números de la dreta (←). Cadascuna ha de ser
 *                 en alguna casella d'aquella fila.
 *   Un número de fora amb coma al PDF (4,8) són dues xifres: s'hi han de
 *   trobar les dues.
 * Les solucions NO són aquí: les busca motor.js, i tests/ les compara amb les
 * del PDF (src/dokoeq_a.pdf), llegides per tools/extreu-xifra.py a
 * tests/on-es-la-xifra-solucions.json.
 * DEPENDÈNCIES: Cap. Es carrega abans de motor.js.
 * ============================================================================
 */'''


def escriu(dades, sols):
    linies = ['        [%s, %s, %s],' % (json.dumps(ns), json.dumps(pc), json.dumps(pf)) for _, ns, pc, pf in dades]
    cos = ('\nwindow.PROBLEMES_XIFRA = {\n    // Exemple de la pàgina 1 del PDF (8 + 5 = 13)\n    // prettier-ignore\n    exemple: ' + EXEMPLE + ',\n    // prettier-ignore\n    llista: [\n' + '\n'.join(linies) + '\n    ],\n};\n')
    with open('js/on-es-la-xifra/problemes.js', 'w', encoding='utf8') as f:
        f.write(CAPCALERA + cos)
    with open('tests/on-es-la-xifra-solucions.json', 'w', encoding='utf8') as f:
        f.write('{\n' + ',\n'.join('    "%d": %s' % (d[0], json.dumps(x)) for d, x in zip(dades, sols)) + '\n}\n')


if __name__ == '__main__':
    d, s = main()
    escriu(d, s)
    print('✓ %d problemes escrits a js/on-es-la-xifra/problemes.js' % len(d))
