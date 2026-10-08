"""
============================================================================
FITXER: tools/extreu-laberint.py
ROL: Llegeix la geometria del «Laberint d'angles» (角度メイズ) directament
     dels PDF (src/kmaze_q.pdf i src/kmaze_a.pdf) i escriu:
       - js/laberint-angles/problemes.js        (les dades del joc)
       - tests/laberint-angles-solucions.json   (els camins del PDF de solucions)
COM: pdftocairo -svg dona les línies i els cercles com a vectors, i
     pdftotext -bbox, els números. Els dibuixos del PDF estan fets a mà (hi ha
     angles desviats fins a 12°), així que es redibuixen exactes: cada línia
     va en un múltiple de 90°, 60°, 45° o 30° (segons la família de problemes)
     i fa 1 o √2 de llarg. Els problemes 31-36 (i l'exemple) són figures
     irregulars: s'hi deixen les posicions del PDF, i el joc arrodoneix la
     direcció de cada línia a múltiples de 15°.
ÚS (des de l'arrel del repositori; cal poppler-utils):
     python3 tools/extreu-laberint.py
============================================================================
"""
import json
import math
import re
import statistics
import subprocess
import unicodedata

PDF_Q = 'src/kmaze_q.pdf'
PDF_A = 'src/kmaze_a.pdf'


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
    """Cercles, segments de línia (grisos, discontinus = tallats) i línies de la solució."""
    cercles, segs = [], []
    for m in re.finditer(r'<path ([^>]*)/>', svg_de(pdf, pag).split('</defs>', 1)[1]):
        at = dict(re.findall(r'([\w-]+)="([^"]*)"', m.group(1)))
        if 'd' not in at:
            continue
        subs, corba = subcamins(at['d'])
        if 'transform' in at:
            a, b, c, d, e, f = map(float, re.findall(r'-?[\d.]+', at['transform']))
            subs = [[(a * x + c * y + e, b * x + d * y + f) for x, y in s] for s in subs]
        traç = at.get('stroke', '')
        gruix = float(at.get('stroke-width') or 0)
        negre = traç == 'rgb(0%, 0%, 0%)'
        if corba and negre and abs(gruix - 9.375) < 0.01:  # vora d'un cercle
            for s in subs:
                xs, ys = [q[0] for q in s], [q[1] for q in s]
                if max(xs) - min(xs) > 2:
                    cercles.append({'x': (min(xs) + max(xs)) / 2, 'y': (min(ys) + max(ys)) / 2,
                                    'r': (max(xs) - min(xs) + max(ys) - min(ys)) / 4})
        elif not corba and abs(gruix - 12.5) < 0.01 and traç.startswith('rgb(') and not negre:
            if float(traç[4:].split('%')[0]) > 50:  # línies grises del laberint
                for s in subs:
                    segs += [{'a': s[i], 'b': s[i + 1], 'tallada': 'stroke-dasharray' in at, 'sol': False}
                             for i in range(len(s) - 1)]
        elif not corba and negre and abs(gruix - 25) < 0.01:  # camí de la solució (PDF de solucions)
            for s in subs:
                segs += [{'a': s[i], 'b': s[i + 1], 'tallada': False, 'sol': True} for i in range(len(s) - 1)]
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
        if dist < c['r'] * 0.45 and -c['r'] * 1.5 / L <= t <= 1 + c['r'] * 1.5 / L:
            res.append((t, i))
    return [i for t, i in sorted(res)]


def grafs(pdf, pag):
    """Els laberints d'una pàgina: {número: {nodes, arestes, sol}}; amb número 0 si no en tenen."""
    cercles, segs = elements(pdf, pag)
    words = paraules(pdf, pag)
    arestes, solucio = {}, set()
    for s in segs:
        cs = cercles_sobre((s['a'], s['b']), cercles)
        for u, v in zip(cs, cs[1:]):
            k = (min(u, v), max(u, v))
            arestes[k] = arestes.get(k, False) or s['tallada']
            if s['sol']:
                solucio.add(k)
    pare = list(range(len(cercles)))

    def arrel(i):
        while pare[i] != i:
            i = pare[i]
        return i

    for u, v in arestes:
        pare[arrel(u)] = arrel(v)
    comps = {}
    for i in range(len(cercles)):
        comps.setdefault(arrel(i), []).append(i)
    comps = [c for c in comps.values() if len(c) > 1]
    etiq = {}
    for w in words:
        for i, c in enumerate(cercles):
            if math.hypot(w['x'] - c['x'], w['y'] - c['y']) < c['r'] * 0.8:
                etiq[i] = w['t']
    # Cada número «(n)» va amb el laberint més proper
    nums = [w for w in words if re.fullmatch(r'\(\d+\)', w['t'])]
    parells = []
    for w in nums:
        for k, comp in enumerate(comps):
            xs, ys = [cercles[i]['x'] for i in comp], [cercles[i]['y'] for i in comp]
            dx = max(min(xs) - w['x'], 0, w['x'] - max(xs))
            dy = max(min(ys) - w['y'], 0, w['y'] - max(ys))
            parells.append((math.hypot(dx, dy), int(w['t'][1:-1]), k))
    assignat, usats = {}, set()
    for _, n, k in sorted(parells):
        if n not in assignat and k not in usats:
            assignat[n] = k
            usats.add(k)
    if not nums:  # pàgina d'instruccions: el primer laberint (dalt a l'esquerra) és l'exemple
        primer = min(range(len(comps)), key=lambda k: min(cercles[i]['y'] + cercles[i]['x'] for i in comps[k]))
        assignat = {0: primer}
    out = {}
    for n, k in assignat.items():
        comp = sorted(comps[k], key=lambda i: (round(cercles[i]['y']), cercles[i]['x']))
        idx = {g: j for j, g in enumerate(comp)}
        out[n] = {
            'nodes': [{'x': cercles[i]['x'], 'y': cercles[i]['y'], 'e': etiq.get(i, '')} for i in comp],
            'arestes': [[idx[u], idx[v], t] for (u, v), t in arestes.items() if u in idx],
            'sol': sorted([idx[u], idx[v]] for u, v in solucio if u in idx),
        }
    return out


# ---------------------------------------------------------------- geometria exacta
def pas_familia(n):
    """Múltiple de graus de les línies de cada família de problemes (None = irregular)."""
    if n == 0 or 31 <= n <= 36:
        return None
    if n <= 6:
        return 90
    if n <= 12 or n == 37:
        return 60
    if n <= 18 or n == 38:
        return 45
    return 30


def redibuixa(p, pas):
    """Posicions en unitats de «costat» (≈ 1). Exactes si la família és regular."""
    n = p['nodes']
    u = statistics.median(math.hypot(n[b]['x'] - n[a]['x'], n[b]['y'] - n[a]['y']) for a, b, _ in p['arestes'])
    if pas is None:
        x0, y0 = min(q['x'] for q in n), min(q['y'] for q in n)
        return [((q['x'] - x0) / u, (q['y'] - y0) / u) for q in n]

    def vector(a, b):
        dx, dy = n[b]['x'] - n[a]['x'], n[a]['y'] - n[b]['y']
        th = math.radians(round(math.degrees(math.atan2(dy, dx)) / pas) * pas)
        L = min([1, math.sqrt(2)], key=lambda c: abs(c - math.hypot(dx, dy) / u))
        return L * math.cos(th), -L * math.sin(th)

    veins = {}
    for a, b, _ in p['arestes']:
        veins.setdefault(a, []).append(b)
        veins.setdefault(b, []).append(a)
    pos, cua = {0: (0.0, 0.0)}, [0]
    while cua:
        a = cua.pop(0)
        for b in veins[a]:
            if b not in pos:
                vx, vy = vector(a, b)
                pos[b] = (pos[a][0] + vx, pos[a][1] + vy)
                cua.append(b)
    for a, b, _ in p['arestes']:  # el redibuix ha de tancar tots els cicles
        vx, vy = vector(a, b)
        assert math.hypot(pos[b][0] - pos[a][0] - vx, pos[b][1] - pos[a][1] - vy) < 1e-6, 'geometria inconsistent'
    x0, y0 = min(q[0] for q in pos.values()), min(q[1] for q in pos.values())
    return [(pos[i][0] - x0, pos[i][1] - y0) for i in range(len(n))]


def cami_solucio(p, a):
    """El camí del PDF de solucions, amb els índexs de l'enunciat, de S a G."""
    def rel(nn):
        mx, my = min(x['x'] for x in nn), min(x['y'] for x in nn)
        return [(x['x'] - mx, x['y'] - my) for x in nn]

    rq, ra = rel(p['nodes']), rel(a['nodes'])
    mapa = {j: min(range(len(rq)), key=lambda i: math.dist(rq[i], ra[j])) for j in range(len(ra))}
    veins = {}
    for x, y in a['sol']:
        veins.setdefault(mapa[x], []).append(mapa[y])
        veins.setdefault(mapa[y], []).append(mapa[x])
    cami, abans = [next(i for i, q in enumerate(p['nodes']) if q['e'] == 'S')], None
    while True:
        seg = [w for w in veins.get(cami[-1], []) if w != abans]
        if not seg:
            return cami
        abans = cami[-1]
        cami.append(seg[0])


# ---------------------------------------------------------------- sortida
def js_problema(p, pos, sagnat):
    def node(q, xy):
        v = [round(xy[0], 3), round(xy[1], 3)]
        if q['e']:
            v.append(int(q['e']) if q['e'].isdigit() else q['e'])
        return '[' + ', '.join(f"'{x}'" if isinstance(x, str) else str(x) for x in v) + ']'

    nodes = ', '.join(node(q, xy) for q, xy in zip(p['nodes'], pos))
    arestes = ', '.join(f'[{a}, {b}]' for a, b, t in sorted(p['arestes']) if not t)
    tallades = ', '.join(f'[{a}, {b}]' for a, b, t in sorted(p['arestes']) if t)
    s = ' ' * sagnat
    return (f'{{\n{s}    nodes: [{nodes}],\n{s}    arestes: [{arestes}],\n'
            f'{s}    tallades: [{tallades}],\n{s}}}')


def ordena(p, pos, cami):
    """Numera els cercles per files (de dalt a baix i d'esquerra a dreta)."""
    ordre = sorted(range(len(pos)), key=lambda i: (round(pos[i][1], 2), pos[i][0]))
    nou = {vell: j for j, vell in enumerate(ordre)}
    p2 = {'nodes': [p['nodes'][i] for i in ordre],
          'arestes': [sorted([nou[a], nou[b]]) + [t] for a, b, t in p['arestes']]}
    return p2, [pos[i] for i in ordre], [nou[i] for i in cami]


def main():
    Q, A = {}, {}
    for pag in range(2, 9):
        Q.update(grafs(PDF_Q, pag))
    for pag in range(1, 8):
        A.update(grafs(PDF_A, pag))
    assert sorted(Q) == list(range(1, 39)) and sorted(A) == list(range(1, 39)), 'falten problemes'
    exemple = grafs(PDF_Q, 1)[0]

    capcalera = '''/**
 * ============================================================================
 * FITXER: js/laberint-angles/problemes.js
 * ROL: Dades dels 38 laberints del puzzle «Laberint d'angles»
 *      (角度メイズ, de Naoki Inaba; src/kmaze_q.pdf).
 * NO S'EDITA A MÀ: el genera tools/extreu-laberint.py a partir del PDF.
 * FORMAT de cada problema:
 *   nodes:    [x, y, etiqueta?]  Cercles; x i y en «costats» (y cap avall).
 *             L'etiqueta és 'S' (sortida), 'G' (arribada) o un angle en graus.
 *   arestes:  [a, b]  Línies per on es pot passar (índexs de «nodes»).
 *   tallades: [a, b]  Línies de punts amb una ×: NO s'hi pot passar.
 * DEPENDÈNCIES: Cap. Es carrega abans de motor.js.
 * ============================================================================
 */
// prettier-ignore
window.PROBLEMES_LABERINT = {
    // L'exemple de les instruccions (【例題】)
    exemple: '''
    ex, pos, _ = ordena(exemple, redibuixa(exemple, None), [])
    cos = capcalera + js_problema(ex, pos, 4) + ',\n\n    llista: [\n'
    sols = {}
    for n in range(1, 39):
        p, pos, sols[str(n)] = ordena(Q[n], redibuixa(Q[n], pas_familia(n)), cami_solucio(Q[n], A[n]))
        cos += f'        // ({n})\n        ' + js_problema(p, pos, 8) + ',\n'
    cos += '    ],\n};\n'
    open('js/laberint-angles/problemes.js', 'w', encoding='utf-8').write(cos)

    with open('tests/laberint-angles-solucions.json', 'w', encoding='utf-8') as f:
        f.write('{\n' + ',\n'.join(f'    "{k}": {json.dumps(v)}' for k, v in sols.items()) + '\n}\n')
    print('Fet: 38 problemes i l\'exemple.')


if __name__ == '__main__':
    main()
