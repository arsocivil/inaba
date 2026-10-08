"""
============================================================================
FITXER: tools/extreu-triangle.py
ROL: Llegeix els problemes de «Busca el triangle» (三角探し) directament dels
     PDF (src/sankaku_q.pdf i src/sankaku_a.pdf) i escriu:
       - js/busca-el-triangle/problemes.js        (les dades del joc)
       - tests/busca-el-triangle-solucions.json   (els triangles del PDF de solucions)
COM: pdftocairo -svg dona la quadrícula (línies grises discontínues), els punts
     (cercles negres plens) i, al PDF de solucions, els cercles que marquen
     els tres vèrtexs triats; pdftotext -bbox dona «(n)» i «面積 A» (l'àrea).
     Cada punt s'arrodoneix a un vèrtex de la quadrícula: (columna, fila),
     amb la fila 0 a dalt.
ÚS (des de l'arrel del repositori; cal poppler-utils):
     python3 tools/extreu-triangle.py
============================================================================
"""
import json
import os
import re
import subprocess
import unicodedata

PDF_Q = 'src/sankaku_q.pdf'
PDF_A = 'src/sankaku_a.pdf'
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
    """Segments de la quadrícula, punts (cercles plens) i anelles (els vèrtexs marcats a les solucions)."""
    quadricula, punts, anelles = [], [], []
    for m in re.finditer(r'<path ([^>]*)/>', svg_de(pdf, pag).split('</defs>', 1)[1]):
        at = dict(re.findall(r'([\w-]+)="([^"]*)"', m.group(1)))
        if 'd' not in at:
            continue
        subs, corba = subcamins(at['d'])
        if 'transform' in at:
            a, b, c, d, e, f = map(float, re.findall(r'-?[\d.]+', at['transform']))
            subs = [[(a * x + c * y + e, b * x + d * y + f) for x, y in s] for s in subs]
        subs = [s for s in subs if len(s) > 1]
        if not corba and 'stroke-dasharray' in at and at.get('stroke', '').startswith('rgb(5'):
            for s in subs:
                quadricula += [(s[i], s[i + 1]) for i in range(len(s) - 1)]
        elif corba and (at.get('fill') == NEGRE or at.get('stroke') == NEGRE):
            for s in subs:
                xs, ys = [q[0] for q in s], [q[1] for q in s]
                c = {'x': (min(xs) + max(xs)) / 2, 'y': (min(ys) + max(ys)) / 2,
                     'r': (max(xs) - min(xs) + max(ys) - min(ys)) / 4}
                if c['r'] < 1:
                    continue
                (punts if at.get('fill') == NEGRE else anelles).append(c)
    return quadricula, punts, anelles


# ---------------------------------------------------------------- problemes d'una pàgina
def quadricules(segs):
    """Agrupa els segments en quadrícules (components que es toquen): bbox i mida del quadret."""
    pare = list(range(len(segs)))

    def arrel(i):
        while pare[i] != i:
            i = pare[i]
        return i

    caixa = [(min(a[0], b[0]), min(a[1], b[1]), max(a[0], b[0]), max(a[1], b[1])) for a, b in segs]
    for i in range(len(segs)):
        for j in range(i):
            p, q = caixa[i], caixa[j]
            if p[0] <= q[2] + 2 and q[0] <= p[2] + 2 and p[1] <= q[3] + 2 and q[1] <= p[3] + 2:
                pare[arrel(i)] = arrel(j)
    grups = {}
    for i in range(len(segs)):
        grups.setdefault(arrel(i), []).append(caixa[i])
    out = []
    for cs in grups.values():
        x0, y0 = min(c[0] for c in cs), min(c[1] for c in cs)
        x1, y1 = max(c[2] for c in cs), max(c[3] for c in cs)
        verticals = sorted({round(c[0]) for c in cs if abs(c[2] - c[0]) < 1})
        cel = min(b - a for a, b in zip(verticals, verticals[1:]) if b - a > 5)
        out.append({'x0': x0, 'y0': y0, 'x1': x1, 'y1': y1, 'cel': cel,
                    'amp': round((x1 - x0) / cel), 'alt': round((y1 - y0) / cel)})
    return out


def vertex(q, c):
    """El vèrtex (columna, fila) de la quadrícula q on cau el centre c."""
    fx, fy = (c['x'] - q['x0']) / q['cel'], (c['y'] - q['y0']) / q['cel']
    i, j = round(fx), round(fy)
    assert abs(fx - i) < 0.15 and abs(fy - j) < 0.15, (fx, fy)
    assert 0 <= i <= q['amp'] and 0 <= j <= q['alt'], (i, j, q)
    return [i, j]


def dins(q, c, marge):
    return q['x0'] - marge <= c['x'] <= q['x1'] + marge and q['y0'] - marge <= c['y'] <= q['y1'] + marge


def pagina(pdf, pag):
    """{número: {amp, alt, punts, area, triats}} d'una pàgina."""
    segs, punts, anelles = elements(pdf, pag)
    qs = quadricules(segs)
    words = paraules(pdf, pag)
    res = {}
    for q in qs:
        cx = (q['x0'] + q['x1']) / 2
        # «(n)» a sobre de la quadrícula, «面積 A» a sota: les paraules més properes
        dalt = [w for w in words if re.fullmatch(r'\(\d+\)', w['t']) and w['y'] < q['y0']]
        baix = [w for w in words if w['t'].startswith('面積') and w['y'] > q['y1']]
        n = min(dalt, key=lambda w: abs(w['x'] - cx) + (q['y0'] - w['y']) * 2)
        a = min(baix, key=lambda w: abs(w['x'] - cx) + (w['y'] - q['y1']) * 2)
        area = float(a['t'][2:].replace(',', '.'))
        ps = sorted((vertex(q, c) for c in punts if dins(q, c, q['cel'] * 0.3)), key=lambda v: (v[1], v[0]))
        triats = sorted((vertex(q, c) for c in anelles if c['r'] > 6 and dins(q, c, q['cel'] * 0.3)),
                        key=lambda v: (v[1], v[0]))
        num = int(n['t'][1:-1])
        assert num not in res, num
        res[num] = {'amp': q['amp'], 'alt': q['alt'], 'punts': ps, 'area': area, 'triats': triats}
    return res


# L'exemple de la pàgina 1 (【例題】 i 【解答】): s'hi barregen els dibuixos de l'explicació, i es copia a mà
EXEMPLE = {'amp': 3, 'alt': 3, 'punts': [[2, 0], [2, 1], [3, 1], [0, 3], [2, 3]], 'area': 3}
SOLUCIO_EXEMPLE = [[2, 0], [0, 3], [2, 3]]


def js_problema(p):
    area = int(p['area']) if p['area'] == int(p['area']) else p['area']
    return f"{{ amp: {p['amp']}, alt: {p['alt']}, punts: {json.dumps(p['punts'], separators=(', ', ': '))}, area: {area} }}"


def main():
    problemes, solucions = {}, {}
    for pag in range(2, 9):
        problemes.update(pagina(PDF_Q, pag))
        solucions.update(pagina(PDF_A, pag - 1))
    assert sorted(problemes) == list(range(1, 43)) and sorted(solucions) == list(range(1, 43)), 'falten problemes'
    sols = {'exemple': SOLUCIO_EXEMPLE}
    cos = f"    // L'exemple de les instruccions (【例題】)\n    exemple: {js_problema(EXEMPLE)},\n\n    llista: [\n"
    for n in range(1, 43):
        p, s = problemes[n], solucions[n]
        assert (s['amp'], s['alt'], s['punts'], s['area']) == (p['amp'], p['alt'], p['punts'], p['area']), n
        assert len(s['triats']) == 3 and all(v in p['punts'] for v in s['triats']), (n, s['triats'])
        cos += f'        {js_problema(p)}, // {n}\n'
        sols[str(n)] = s['triats']
    capcalera = """/**
 * ============================================================================
 * FITXER: js/busca-el-triangle/problemes.js
 * ROL: Dades dels 42 problemes del puzzle «Busca el triangle»
 *      (三角探し, de Naoki Inaba; src/sankaku_q.pdf).
 * NO S'EDITA A MÀ: el genera tools/extreu-triangle.py a partir del PDF.
 * FORMAT de cada problema:
 *   amp, alt: quadrets d'amplada i d'alçada de la quadrícula.
 *   punts:    els punts negres, [columna, fila] d'un vèrtex de la quadrícula
 *             (de 0 a amp i de 0 a alt; la fila 0 és la de dalt).
 *   area:     l'àrea del triangle que s'ha de fer (en quadrets).
 * Les solucions NO són aquí: les busca motor.js, i tests/ les compara amb
 * les del PDF (src/sankaku_a.pdf).
 * DEPENDÈNCIES: Cap. Es carrega abans de motor.js.
 * ============================================================================
 */
// prettier-ignore
window.PROBLEMES_TRIANGLE = {
"""
    os.makedirs('js/busca-el-triangle', exist_ok=True)
    with open('js/busca-el-triangle/problemes.js', 'w') as f:
        f.write(capcalera + cos + '    ],\n};\n')
    with open('tests/busca-el-triangle-solucions.json', 'w') as f:
        f.write('{\n' + ',\n'.join(f'  {json.dumps(k)}: {json.dumps(v)}' for k, v in sols.items()) + '\n}\n')
    print('✓ js/busca-el-triangle/problemes.js i tests/busca-el-triangle-solucions.json')


if __name__ == '__main__':
    main()
