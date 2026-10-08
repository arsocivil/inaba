"""
============================================================================
FITXER: tools/extreu-escala.py
ROL: Llegeix els problemes de «L'escala de nombres» (数字の階段) directament
     dels PDF (src/step_q.pdf i src/step_a.pdf) i escriu:
       - js/escala-nombres/problemes.js        (les dades del joc)
       - tests/escala-nombres-solucions.json   (els nombres del PDF de solucions)
COM: pdftocairo -svg dona els cercles (vora negra) i les línies gruixudes que
     els uneixen; pdftotext -bbox dona «(n)» i els números dels cercles. Cada
     línia recta que passa per uns quants cercles és una «filera»; dues línies
     que es troben en un cercle formant un angle són fileres diferents, però
     si continuen rectes, són la mateixa.
ÚS (des de l'arrel del repositori; cal poppler-utils):
     python3 tools/extreu-escala.py
============================================================================
"""
import json
import math
import os
import re
import subprocess
import unicodedata

PDF_Q = 'src/step_q.pdf'
PDF_A = 'src/step_a.pdf'
NEGRE = 'rgb(0%, 0%, 0%)'


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
    """Cercles (vora negra fina amb corbes) i segments de les línies gruixudes."""
    cercles, segs = [], []
    for m in re.finditer(r'<path ([^>]*)/>', svg_de(pdf, pag).split('</defs>', 1)[1]):
        at = dict(re.findall(r'([\w-]+)="([^"]*)"', m.group(1)))
        if 'd' not in at or at.get('stroke') != NEGRE:
            continue
        subs, corba = subcamins(at['d'])
        if 'transform' in at:
            a, b, c, d, e, f = map(float, re.findall(r'-?[\d.]+', at['transform']))
            subs = [[(a * x + c * y + e, b * x + d * y + f) for x, y in s] for s in subs]
        gruix = float(at.get('stroke-width') or 0)
        if corba and abs(gruix - 12.5) < 0.01:
            for s in subs:
                xs, ys = [q[0] for q in s], [q[1] for q in s]
                if max(xs) - min(xs) > 5:
                    cercles.append({'x': (min(xs) + max(xs)) / 2, 'y': (min(ys) + max(ys)) / 2,
                                    'r': (max(xs) - min(xs) + max(ys) - min(ys)) / 4})
        elif not corba and abs(gruix - 18.75) < 0.01:
            for s in subs:
                segs += [(s[i], s[i + 1]) for i in range(len(s) - 1)]
    return cercles, segs


def cercles_sobre(seg, cercles):
    """Els cercles per on passa un segment, en ordre."""
    (x1, y1), (x2, y2) = seg
    dx, dy = x2 - x1, y2 - y1
    L = math.hypot(dx, dy)
    res = []
    for i, c in enumerate(cercles):
        t = ((c['x'] - x1) * dx + (c['y'] - y1) * dy) / (L * L)
        dist = abs((c['x'] - x1) * dy - (c['y'] - y1) * dx) / L
        if dist < c['r'] * 0.5 and -c['r'] * 1.6 / L <= t <= 1 + c['r'] * 1.6 / L:
            res.append((t, i))
    return [i for t, i in sorted(res)]


def pagina(pdf, pag):
    """{número: {'nodes': [[x, y]], 'valors': [n | None], 'fileres': [[i, j, …]]}} d'una pàgina."""
    cercles, segs = elements(pdf, pag)
    words = paraules(pdf, pag)
    # Arestes entre cercles veïns, amb la seva direcció
    arestes = set()
    for s in segs:
        cs = cercles_sobre(s, cercles)
        for u, v in zip(cs, cs[1:]):
            arestes.add((min(u, v), max(u, v)))
    veins = {i: set() for i in range(len(cercles))}
    for u, v in arestes:
        veins[u].add(v)
        veins[v].add(u)

    def dir(u, v):
        a = math.atan2(cercles[v]['y'] - cercles[u]['y'], cercles[v]['x'] - cercles[u]['x'])
        return a

    def recte(a, b):  # dues direccions iguals (± 8°)
        d = abs((a - b + math.pi) % (2 * math.pi) - math.pi)
        return d < math.radians(8)

    # Fileres: cadenes rectes màximes d'arestes
    usades, fileres = set(), []
    for u, v in sorted(arestes):
        if (u, v) in usades:
            continue
        cadena = [u, v]
        for _ in range(2):  # allarga pels dos extrems
            while True:
                a, b = cadena[-2], cadena[-1]
                seg = [w for w in veins[b] if w != a and recte(dir(a, b), dir(b, w))]
                if not seg:
                    break
                cadena.append(seg[0])
            cadena.reverse()
        for a, b in zip(cadena, cadena[1:]):
            usades.add((min(a, b), max(a, b)))
        fileres.append(cadena)
    # Components (problemes) i els seus números
    pare = list(range(len(cercles)))

    def arrel(i):
        while pare[i] != i:
            i = pare[i]
        return i

    for u, v in arestes:
        pare[arrel(u)] = arrel(v)
    valors = [None] * len(cercles)
    for w in words:
        if re.fullmatch(r'\d+', w['t']):
            i = min(range(len(cercles)), key=lambda k: math.hypot(cercles[k]['x'] - w['x'], cercles[k]['y'] - w['y']))
            assert math.hypot(cercles[i]['x'] - w['x'], cercles[i]['y'] - w['y']) < cercles[i]['r'], w
            assert valors[i] is None, w
            valors[i] = int(w['t'])
    grups = {}
    for i in range(len(cercles)):
        grups.setdefault(arrel(i), []).append(i)
    # Les «(n)» fan una graella (2 columnes × 3 files): cada problema va amb la de la seva casella, és a dir,
    # la fila de l'etiqueta més baixa que queda per sobre del seu centre i, d'aquesta fila, la més propera
    etiq = [w for w in words if re.fullmatch(r'\(\d+\)', w['t'])]
    comps = list(grups.values())
    num_de = {}
    for c, nodes in enumerate(comps):
        cx = sum(cercles[i]['x'] for i in nodes) / len(nodes)
        cy = sum(cercles[i]['y'] for i in nodes) / len(nodes)
        dalt = [w for w in etiq if w['y'] < cy]
        fila = max(w['y'] for w in dalt)
        w = min((w for w in dalt if abs(w['y'] - fila) < 30), key=lambda w: abs(w['x'] - cx))
        num_de[c] = int(w['t'][1:-1])
    assert len(set(num_de.values())) == len(comps), 'dos problemes amb la mateixa etiqueta'
    res = {}
    for c, nodes in enumerate(comps):
        res[num_de[c]] = {'cercles': [cercles[i] for i in nodes], 'idx': nodes,
                          'valors': [valors[i] for i in nodes], 'fileres': [f for f in fileres if f[0] in nodes]}
    return res


# L'exemple de la pàgina 1 (【例題】 i 【解答】): a la pàgina hi ha també els dibuixos de l'explicació,
# i es copia a mà (posicions del PDF, en punts; els valors del 【解答】)
EXEMPLE = {
    'nodes': [[178, 195], [213, 264], [143, 290], [160, 243, 2], [197, 229, 3], [264, 285]],
    'fileres': [[0, 3, 2], [5, 1, 3], [1, 4, 0]],
}
SOLUCIO_EXEMPLE = [1, 5, 3, 2, 3, 8]


def problema(p):
    """Els cercles amb coordenades en punts del PDF (arrodonides, des de 0) i les fileres amb índexs locals."""
    x0 = min(c['x'] for c in p['cercles'])
    y0 = min(c['y'] for c in p['cercles'])
    nodes = []
    for c, v in zip(p['cercles'], p['valors']):
        n = [round(c['x'] - x0), round(c['y'] - y0)]
        nodes.append(n + ([v] if v is not None else []))
    fileres = [[p['idx'].index(i) for i in f] for f in p['fileres']]
    return {'nodes': nodes, 'fileres': fileres}


def js_problema(p):
    return f"{{ nodes: {json.dumps(p['nodes'])}, fileres: {json.dumps(p['fileres'])} }}".replace(',', ', ').replace(',  ', ', ')


def main():
    problemes, solucions = {}, {}
    for pag in range(2, 9):
        problemes.update(pagina(PDF_Q, pag))
        solucions.update(pagina(PDF_A, pag - 1))
    assert sorted(problemes) == list(range(1, 43)) and sorted(solucions) == list(range(1, 43)), 'falten problemes'
    sols = {'exemple': SOLUCIO_EXEMPLE}
    cos = f"    // L'exemple de les instruccions (【例題】)\n    exemple: {js_problema(EXEMPLE)},\n\n    llista: [\n"
    for n in range(1, 43):
        q, a = problemes[n], solucions[n]
        # El PDF de solucions té els mateixos cercles (en el mateix lloc) amb tots els números
        ordre = [min(range(len(a['cercles'])), key=lambda k: math.hypot(a['cercles'][k]['x'] - c['x'],
                                                                     a['cercles'][k]['y'] - c['y']))
                 for c in q['cercles']]
        assert sorted(ordre) == list(range(len(ordre))), n
        sol = [a['valors'][k] for k in ordre]
        assert None not in sol and all(v in (None, s) for v, s in zip(q['valors'], sol)), n
        cos += f'        {js_problema(problema(q))}, // {n}\n'
        sols[str(n)] = sol
    capcalera = """/**
 * ============================================================================
 * FITXER: js/escala-nombres/problemes.js
 * ROL: Dades dels 42 problemes del puzzle «L'escala de nombres»
 *      (数字の階段, de Naoki Inaba; src/step_q.pdf).
 * NO S'EDITA A MÀ: el genera tools/extreu-escala.py a partir del PDF.
 * FORMAT de cada problema:
 *   nodes:   [x, y, valor?]  Cercles; x i y en punts del PDF (y cap avall).
 *            Si porta valor, el número ja hi és escrit.
 *   fileres: [i, j, k, …]  Cada línia recta de cercles, en ordre d'un extrem
 *            a l'altre (índexs de «nodes»).
 * Les solucions NO són aquí: les busca motor.js, i tests/ les compara amb
 * les del PDF (src/step_a.pdf).
 * DEPENDÈNCIES: Cap. Es carrega abans de motor.js.
 * ============================================================================
 */
// prettier-ignore
window.PROBLEMES_ESCALA = {
"""
    os.makedirs('js/escala-nombres', exist_ok=True)
    with open('js/escala-nombres/problemes.js', 'w') as f:
        f.write(capcalera + cos + '    ],\n};\n')
    with open('tests/escala-nombres-solucions.json', 'w') as f:
        f.write('{\n' + ',\n'.join(f'  {json.dumps(k)}: {json.dumps(v)}' for k, v in sols.items()) + '\n}\n')
    print('✓ js/escala-nombres/problemes.js i tests/escala-nombres-solucions.json')


if __name__ == '__main__':
    main()
