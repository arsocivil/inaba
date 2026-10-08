"""
============================================================================
FITXER: tools/extreu-kazu.py
ROL: Llegeix els problemes de «Busca el nombre» (かずさがし) directament dels PDF
     (src/kazu_q.pdf i src/kazu_a.pdf) i escriu:
       - js/busca-el-nombre/problemes.js        (les dades del joc)
       - tests/busca-el-nombre-solucions.json   (els quadrats de les solucions del PDF)
COM: pdftocairo -svg dona cada quadret com un rectangle tancat amb traç gris
     discontinu (4,17), cada poma com un cercle ple vermell i cada mandarina
     com un cercle ple taronja. A les respostes, el quadrat és un rectangle
     tancat amb traç negre gruixut (12,5). pdftotext -bbox dona les etiquetes
     （n） i el text de la pregunta (japonès: es classifica per paraules clau).
     Cada pàgina té 6 problemes (2 columnes x 3 files). Les pàgines de
     problemes 1-6, 13-18 i 25-30 demanen un quadrat de 2 x 2; les altres, de 3 x 3
     (ho diu la línia de dalt de cada pàgina: «たて２ よこ２» o «たて３ よこ３»).
FORMAT de cada problema (vegeu js/busca-el-nombre/problemes.js):
     [mida, ['p . pm', ...files], pregunta]
ÚS (des de l'arrel del repositori; cal poppler-utils):
     python3 tools/extreu-kazu.py
============================================================================
"""
import json
import re
import subprocess
import unicodedata

PDF_Q = 'src/kazu_q.pdf'
PDF_A = 'src/kazu_a.pdf'
ROIG = 'rgb(98.046875%, 36.083984%, 23.535156%)'
TARONJA = 'rgb(100%, 59.959412%, 0%)'


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
        out.append({'x0': x0, 'x1': x1, 'x': (x0 + x1) / 2, 'y': (y0 + y1) / 2,
                    't': unicodedata.normalize('NFKC', m.group(5))})
    return out


def punts_de(at):
    """Els punts d'un camí M/L/C/Z, en coordenades de pàgina (aplica el transform si n'hi ha)."""
    nums = list(map(float, re.findall(r'-?[\d.]+', re.sub(r'[A-Za-z]', ' ', at['d']))))
    punts = list(zip(nums[0::2], nums[1::2]))
    if 'transform' in at:
        a, b, c, d, e, f = map(float, re.findall(r'-?[\d.]+', at['transform']))
        punts = [(a * x + c * y + e, b * x + d * y + f) for x, y in punts]
    return punts


def bbox(punts):
    xs, ys = [p[0] for p in punts], [p[1] for p in punts]
    return min(xs), min(ys), max(xs), max(ys)


def dibuix(pdf, pag):
    """→ (quadrets, fruites, marcs): llistes de bbox (x0, y0, x1, y1) (+ color per a les fruites)."""
    quadrets, fruites, marcs = [], [], []
    for m in re.finditer(r'<path ([^>]*)/>', svg_de(pdf, pag).split('</defs>', 1)[1]):
        at = dict(re.findall(r'([\w-]+)="([^"]*)"', m.group(1)))
        if 'd' not in at:
            continue
        if 'stroke-dasharray' in at and 'Z' in at['d']:
            quadrets.append(bbox(punts_de(at)))
        elif at.get('fill') in (ROIG, TARONJA):
            fruites.append(bbox(punts_de(at)) + ('p' if at['fill'] == ROIG else 'm',))
        elif at.get('stroke') == 'rgb(0%, 0%, 0%)' and abs(float(at.get('stroke-width') or 0) - 12.5) < 0.01 \
                and 'Z' in at['d']:
            marcs.append(bbox(punts_de(at)))
    return quadrets, fruites, marcs


def centre(b):
    return (b[0] + b[2]) / 2, (b[1] + b[3]) / 2


def pregunta(text):
    """Text japonès de la pregunta → [clau, valor?]. Vegeu «PREGUNTES» a problemes.js."""
    t = text.replace(' ', '')
    m = re.search(r'(\d+)こ', t)
    if m and 'ミカン' not in t and 'リンゴ' not in t:
        return ['n', int(m.group(1))]
    m = re.search(r'さが(\d)', t)
    if m:
        return ['dif', int(m.group(1))]
    if 'おなじ' in t:
        return ['igual']
    mes = 'おおい' in t
    assert mes or 'すくない' in t, text
    primer = 'm' if t.index('ミカン') < t.index('リンゴ') else 'p'  # fruita que es compara amb l'altra
    return ['mes' if mes else 'menys', primer]


def problemes_de(pdf, pag):
    """Els 6 problemes d'una pàgina: {n, quadrets, fruites, marcs, text}."""
    quad, fru, mar = dibuix(pdf, pag)
    par = paraules(pdf, pag)
    etiquetes = [p for p in par if re.fullmatch(r'\(\d+\)', p['t'])]
    assert len(etiquetes) == 6, (pag, len(etiquetes))
    # Franges verticals: una per fila d'etiquetes (a la mateixa fila difereixen fins a 15 pt)
    ys = []
    for e in sorted(etiquetes, key=lambda e: e['y']):
        if not ys or e['y'] - ys[-1] > 40:
            ys.append(e['y'])
    assert len(ys) == 3, (pag, ys)

    def regio(x, y):
        k = [i for i in range(3) if ys[i] - 40 <= y]
        return (max(k), x >= 297.6) if k else None  # None: per sobre de la primera fila (el títol)

    out = []
    for e in etiquetes:
        r = regio(e['x'], e['y'])
        mesos = [p for p in par if p is not e and not re.fullmatch(r'\(\d+\)', p['t']) and regio(p['x'], p['y']) == r]
        # El text de la pregunta és a la dreta de l'etiqueta, a la seva altura o una mica per sota (1-2 línies)
        text = ''.join(p['t'] for p in sorted(mesos, key=lambda p: (round(p['y'] / 10), p['x']))
                       if -15 < p['y'] - e['y'] < 30 and p['x'] > e['x1'] - 5)
        out.append({'n': int(e['t'][1:-1]), 'text': text, 'r': r,
                    'quadrets': [q for q in quad if regio(*centre(q)) == r],
                    'fruites': [f for f in fru if regio(*centre(f)) == r],
                    'marcs': [m for m in mar if regio(*centre(m)) == r]})
    return sorted(out, key=lambda p: p['n'])


def graella(pb):
    """Quadrets i fruites d'un problema → (files de text, x0, y0, costat)."""
    q = pb['quadrets']
    costat = sorted(b[2] - b[0] for b in q)[len(q) // 2]
    x0, y0 = min(b[0] for b in q), min(b[1] for b in q)
    w = round((max(b[2] for b in q) - x0) / costat)
    h = round((max(b[3] for b in q) - y0) / costat)
    # Alguns quadrets estan dibuixats dos cops, amb 1-3 pt de diferència: es compten per posició a la quadrícula.
    posicions = {(round((b[0] - x0) / costat), round((b[1] - y0) / costat)) for b in q}
    # Al PDF, algun quadret no té la vora dibuixada (p. ex. el problema 30), però la zona és sempre un rectangle.
    assert w * h - len(posicions) <= 2, (pb['n'], len(posicions), w, h)
    # Un quadret pot tenir més d'una fruita (dues pomes dibuixades una mica encavalcades): es compten.
    cel = [[''] * w for _ in range(h)]
    for f in pb['fruites']:
        cx, cy = centre(f)
        c, r = int((cx - x0) // costat), int((cy - y0) // costat)
        assert 0 <= c < w and 0 <= r < h, (pb['n'], c, r)
        cel[r][c] += f[4]
    assert all(len(x) <= 3 for f in cel for x in f), pb['n']
    return [' '.join(''.join(sorted(x, reverse=True)) or '.' for x in f) for f in cel], x0, y0, costat


def main():
    dades, sols = [], []
    for pag in range(2, 9):
        mida = 2 if pag in (2, 4, 6) else 3
        pq = problemes_de(PDF_Q, pag)
        pa = problemes_de(PDF_A, pag - 1)
        for q, a in zip(pq, pa):
            assert q['n'] == a['n']
            files, x0, y0, costat = graella(q)
            filesa, _, _, _ = graella(a)
            assert files == filesa, (q['n'], 'les fruites de la resposta no coincideixen')
            assert len(a['marcs']) == 1, (q['n'], len(a['marcs']))
            m = a['marcs'][0]
            assert round((m[2] - m[0]) / costat) == mida == round((m[3] - m[1]) / costat), (q['n'], 'mida')
            col, fila = round((m[0] - x0) / costat), round((m[1] - y0) / costat)
            dades.append((q['n'], mida, files, pregunta(q['text']), q['text']))
            sols.append([col, fila])
    return dades, sols


# L'exemple de la pàgina 1 (【もんだい】 i 【こたえ】): quadrat de 3 x 3 amb 2 pomes. Copiat a mà.
EXEMPLE = "[3, ['. . . p', 'p . . .', 'p . p .', 'p . . .'], ['n', 2]]"

CAPCALERA = '''/**
 * ============================================================================
 * FITXER: js/busca-el-nombre/problemes.js
 * ROL: Dades dels 42 problemes del puzzle «Busca el nombre»
 *      (かずさがし, de Naoki Inaba; src/kazu_q.pdf).
 * NO S'EDITA A MÀ: el genera tools/extreu-kazu.py a partir del PDF.
 * FORMAT de cada problema: [mida, files, pregunta]
 *   mida      costat del quadrat que s'ha de posar (2 o 3), en quadrets.
 *   files     una cadena per fila de la quadrícula (de dalt a baix), amb un codi
 *             per quadret separats per un espai: «.» és un
 *             quadret buit, «p» té una poma, «m» una mandarina, i un quadret pot
 *             tenir-ne més d'una («pp» són dues pomes, «pm» una de cada). La quadrícula
 *             és un rectangle (és la zona de la línia de punts).
 *   pregunta  el que ha de complir el quadrat (pomes = p, mandarines = m):
 *               ['n', N]           hi ha N fruites (pomes en els primers
 *                                  problemes, que només en tenen)
 *               ['mes', 'm']       més mandarines que pomes (['mes', 'p']: al revés)
 *               ['menys', 'm']     menys mandarines que pomes (['menys', 'p']: al revés)
 *               ['igual']          tantes pomes com mandarines
 *               ['dif', D]         la diferència entre pomes i mandarines és D
 * A més, `exemple` és el de la pàgina 1 del PDF (3 × 3, 2 pomes; solució: el
 * quadrat que comença al quadret [1, 0]).
 * Les solucions NO són aquí: les busca motor.js, i tests/ les compara amb les
 * del PDF (src/kazu_a.pdf), llegides per tools/extreu-kazu.py a
 * tests/busca-el-nombre-solucions.json.
 * DEPENDÈNCIES: Cap. Es carrega abans de motor.js.
 * ============================================================================
 */'''


def escriu(dades, sols):
    linies = ['        [%d, %s, %s],' % (mida, json.dumps(files, ensure_ascii=False).replace('"', "'"),
                                         json.dumps(preg, ensure_ascii=False).replace('"', "'"))
              for _, mida, files, preg, _ in dades]
    cos = ('\nwindow.PROBLEMES_KAZU = {\n    // Exemple de la pàgina 1 del PDF\n    // prettier-ignore\n    exemple: ' + EXEMPLE + ',\n    // prettier-ignore\n    llista: [\n' + '\n'.join(linies) + '\n    ],\n};\n')
    with open('js/busca-el-nombre/problemes.js', 'w', encoding='utf8') as f:
        f.write(CAPCALERA + cos)
    with open('tests/busca-el-nombre-solucions.json', 'w', encoding='utf8') as f:
        f.write('{\n' + ',\n'.join('    "%d": %s' % (d[0], json.dumps(x)) for d, x in zip(dades, sols)) + '\n}\n')


if __name__ == '__main__':
    import os
    os.makedirs('js/busca-el-nombre', exist_ok=True)
    d, s = main()
    escriu(d, s)
    print('✓ %d problemes escrits a js/busca-el-nombre/problemes.js' % len(d))
