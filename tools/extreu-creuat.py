"""
============================================================================
FITXER: tools/extreu-creuat.py
ROL: Llegeix els quadres del «Creuat de múltiples» (倍数クロス) directament
     dels PDF (src/bcross_q.pdf i src/bcross_a.pdf) i escriu:
       - js/creuat-multiples/problemes.js        (les dades del joc)
       - tests/creuat-multiples-solucions.json   (les solucions del PDF)
COM: pdftocairo -svg dona cada casella com un camí vectorial: les negres són
     polígons plens de negre amb traç blanc; les blanques, rectangles plens de
     blanc amb traç negre fi. pdftotext -bbox dona els números: dins d'una
     casella negra, el número de la meitat de dalt a la dreta (◥) es llegeix
     cap a la dreta, i el de la meitat de baix a l'esquerra (◣), cap avall.
     Cada casella es desa com un text: '.' blanca, '#' negra sense números,
     '#d8' negra amb el 8 que es llegeix cap a la dreta, '#a3' amb el 3 que
     es llegeix cap avall (i '#a3d8' si en té dos).
ÚS (des de l'arrel del repositori; cal poppler-utils):
     python3 tools/extreu-creuat.py
============================================================================
"""
import io
import json
import math
import re
import subprocess
import unicodedata

PDF_Q = 'src/bcross_q.pdf'
PDF_A = 'src/bcross_a.pdf'

# L'exemple de la pàgina 1 (【例題】 i 【解答】): s'ha copiat a mà.
EXEMPLE = ['# #a3 #a13', '#d8 . .', '# #d5 .']
SOLUCIO_EXEMPLE = ['', '96', '5']  # xifres de les caselles blanques, fila per fila


CAPCALERA = '''/**
 * ============================================================================
 * FITXER: js/creuat-multiples/problemes.js
 * ROL: Dades dels 42 problemes del puzzle «Creuat de múltiples»
 *      (倍数クロス, de Naoki Inaba; src/bcross_q.pdf).
 * NO S'EDITA A MÀ: el genera tools/extreu-creuat.py a partir del PDF.
 * FORMAT de cada problema: la llista de files del quadre, de dalt a baix; cada
 *   fila és un text amb les caselles separades per un espai:
 *     '.'     casella blanca (s'hi escriu una xifra)
 *     '#'     casella negra sense números
 *     '#d8'   casella negra amb el 8 a la meitat de dalt a la dreta (◥): el
 *             nombre que formen les caselles blanques cap a la DRETA ha de
 *             ser múltiple de 8
 *     '#a3'   casella negra amb el 3 a la meitat de baix a l'esquerra (◣): el
 *             nombre que formen les caselles blanques cap AVALL ha de ser
 *             múltiple de 3
 *     '#a3d8' casella negra amb els dos números
 * Les solucions NO són aquí: les busca motor.js, i tests/ les compara amb les
 * del PDF (src/bcross_a.pdf), llegides per tools/extreu-creuat.py a
 * tests/creuat-multiples-solucions.json.
 * DEPENDÈNCIES: Cap. Es carrega abans de motor.js.
 * ============================================================================
 */'''


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


def raster(pdf, pag, dpi=144):
    """La pàgina com a imatge de grisos (PIL) i el factor punts → píxels."""
    from PIL import Image
    png = subprocess.run(['pdftoppm', '-r', str(dpi), '-gray', '-png', '-f', str(pag), '-l', str(pag), pdf],
                         capture_output=True, check=True).stdout
    return Image.open(io.BytesIO(png)).convert('L'), dpi / 72


def caselles(pdf, pag):
    """Les caselles de la pàgina: {'x0','y0','x1','y1','negra'} en coordenades de pàgina."""
    out = []
    for m in re.finditer(r'<path ([^>]*)/>', svg_de(pdf, pag).split('</defs>', 1)[1]):
        at = dict(re.findall(r'([\w-]+)="([^"]*)"', m.group(1)))
        if 'd' not in at or 'transform' not in at:
            continue
        fill, stroke = at.get('fill'), at.get('stroke')
        gruix = float(at.get('stroke-width') or 0)
        if 'Z' not in at['d']:
            continue  # les diagonals (línies obertes) no són caselles
        if stroke == 'rgb(100%, 100%, 100%)' and fill in ('rgb(0%, 0%, 0%)', 'none'):
            negra = True  # el contorn blanc d'una casella negra (el farciment és de vegades un altre camí)
        elif stroke == 'rgb(0%, 0%, 0%)' and abs(gruix - 4.1666) < 0.01 and \
                fill in ('rgb(100%, 100%, 100%)', 'none'):
            negra = False  # blanca (en un cas el rectangle és sense farciment)
        else:
            continue
        # Només el primer subcamí (el rectangle de la casella)
        subcami = at['d'].split('Z')[0]
        nums = list(map(float, re.findall(r'-?[\d.]+', subcami)))
        punts = list(zip(nums[0::2], nums[1::2]))
        a, b, c, d, e, f = map(float, re.findall(r'-?[\d.]+', at['transform']))
        punts = [(a * x + c * y + e, b * x + d * y + f) for x, y in punts]
        out.append({'x0': min(p[0] for p in punts), 'y0': min(p[1] for p in punts),
                    'x1': max(p[0] for p in punts), 'y1': max(p[1] for p in punts), 'negra': negra})
    # Una casella pot sortir dibuixada dues vegades (farciment i contorn): es queda una per posició.
    # El color de debò es decideix després, pel ràster (vegeu llegeix_figura).
    unics = []
    for q in out:
        if not any(abs(q['x0'] - r['x0']) < 3 and abs(q['y0'] - r['y0']) < 3 for r in unics):
            unics.append(q)
    return unics


def figures(cas):
    """Agrupa les caselles que es toquen: una figura per problema."""
    pare = list(range(len(cas)))

    def arrel(i):
        while pare[i] != i:
            i = pare[i]
        return i

    for i in range(len(cas)):
        for j in range(i):
            a, b = cas[i], cas[j]
            dx = max(a['x0'] - b['x1'], b['x0'] - a['x1'], 0)
            dy = max(a['y0'] - b['y1'], b['y0'] - a['y1'], 0)
            if dx < 3 and dy < 3:
                pare[arrel(i)] = arrel(j)
    grups = {}
    for i in range(len(cas)):
        grups.setdefault(arrel(i), []).append(cas[i])
    return list(grups.values())


def llegeix_figura(grup, words, usades, img):
    """Retorna (files, xifres, bbox): files en text i, per a cada casella blanca, la xifra de la pàgina."""
    costat = sorted(q['x1'] - q['x0'] for q in grup)[len(grup) // 2]
    x0 = min(q['x0'] for q in grup)
    y0 = min(q['y0'] for q in grup)
    cols = max(round((q['x1'] - x0) / costat) for q in grup)
    files = max(round((q['y1'] - y0) / costat) for q in grup)
    graella = {}
    for q in grup:
        i, j = round((q['x0'] - x0) / costat), round((q['y0'] - y0) / costat)
        assert (i, j) not in graella, 'casella repetida'
        graella[(i, j)] = q
    # El color de cada casella es decideix pel ràster, perquè al PDF alguns contorns són ambigus i algunes
    # caselles negres no tenen camí propi. Es miren quatre punts a les dues meitats de la diagonal, lluny
    # de la vora gruixuda de la figura (que fa fosques les cantonades de baix i de la dreta) i del centre
    # (on hi ha els números): si algun és fosc, la casella és negra; una casella blanca els té tots clars.
    im, k = img
    for i in range(cols):
        for j in range(files):
            gx, gy = x0 + i * costat, y0 + j * costat
            fosc = [im.getpixel((int((gx + u * costat) * k), int((gy + v * costat) * k))) < 90
                    for u, v in ((0.15, 0.8), (0.1, 0.5), (0.5, 0.1), (0.8, 0.15))]
            graella[(i, j)] = {'x0': gx, 'y0': gy, 'x1': gx + costat, 'y1': gy + costat, 'negra': any(fosc)}
    clau = {}     # (i, j) -> {'a': n, 'd': n} per a les negres
    xifres = {}   # (i, j) -> text per a les blanques
    for k, w in enumerate(words):
        if k in usades or not re.fullmatch(r'\d+', w['t']):
            continue
        i, j = int((w['x'] - x0) // costat), int((w['y'] - y0) // costat)
        if (i, j) not in graella:
            continue
        q = graella[(i, j)]
        if not (q['x0'] - 2 <= w['x'] <= q['x1'] + 2 and q['y0'] - 2 <= w['y'] <= q['y1'] + 2):
            continue
        usades.add(k)
        if q['negra']:
            u, v = (w['x'] - q['x0']) / costat, (w['y'] - q['y0']) / costat
            # Diagonal de dalt-esquerra a baix-dreta: u > v és la meitat de dalt a la dreta (◥)
            clau.setdefault((i, j), {})['d' if u > v else 'a'] = int(w['t'])
        else:
            xifres[(i, j)] = w['t']
    text = []
    for j in range(files):
        fila = []
        for i in range(cols):
            if graella[(i, j)]['negra']:
                c = clau.get((i, j), {})
                fila.append('#' + (f"a{c['a']}" if 'a' in c else '') + (f"d{c['d']}" if 'd' in c else ''))
            else:
                fila.append('.')
        text.append(' '.join(fila))
    sol = [''.join(xifres.get((i, j), '_') for i in range(cols) if not graella[(i, j)]['negra'])
           for j in range(files)]
    return text, sol, (min(q['x0'] for q in grup), min(q['y0'] for q in grup),
                       max(q['x1'] for q in grup), max(q['y1'] for q in grup))


def problemes(pdf, pag):
    """{número: (files, solució)} d'una pàgina."""
    words = paraules(pdf, pag)
    figs = figures(caselles(pdf, pag))
    usades = set()
    img = raster(pdf, pag)
    llegides = [llegeix_figura(g, words, usades, img) for g in figs]
    etiq = [(k, w) for k, w in enumerate(words) if re.fullmatch(r'\(\d+\)', w['t'])]
    parells = []
    for e, (k, w) in enumerate(etiq):
        for n, (_, _, (x0, y0, x1, y1)) in enumerate(llegides):
            dx = max(x0 - w['x'], 0, w['x'] - x1)
            dy = max(y0 - w['y'], 0, w['y'] - y1)
            parells.append((math.hypot(dx, dy), e, n))
    fet, gastades = {}, set()
    for _, e, n in sorted(parells):
        if e not in gastades and n not in fet:
            fet[n] = int(etiq[e][1]['t'][1:-1])
            gastades.add(e)
    assert len(fet) == len(llegides) == len(etiq), f'pàgina {pag}: figures i etiquetes no quadren'
    return {num: (llegides[n][0], llegides[n][1]) for n, num in fet.items()}


# ---------------------------------------------------------------- sortida
def main():
    Q, A = {}, {}
    for pag in range(2, 9):
        Q.update(problemes(PDF_Q, pag))
    for pag in range(1, 8):
        A.update(problemes(PDF_A, pag))
    assert sorted(Q) == list(range(1, 43)) and sorted(A) == list(range(1, 43)), 'falten problemes'

    sols = {'exemple': SOLUCIO_EXEMPLE}
    llista = []
    for n in range(1, 43):
        files_q, _ = Q[n]
        files_a, xifres = A[n]
        assert files_q == files_a, f'problema {n}: els números del PDF de solucions no coincideixen'
        assert all('_' not in f for f in xifres), f'problema {n}: falta alguna xifra a la solució'
        llista.append(files_q)
        sols[str(n)] = xifres

    sortida = [CAPCALERA, '// prettier-ignore', 'window.PROBLEMES_CREUAT = {']
    sortida.append("    // L'exemple de les instruccions (【例題】)")
    sortida.append(f"    exemple: {json.dumps(EXEMPLE, ensure_ascii=False)},".replace('"', "'"))
    sortida += ['', '    llista: [']
    for n, files in enumerate(llista, 1):
        sortida.append(f"        {json.dumps(files, ensure_ascii=False)}, // {n}".replace('"', "'"))
    sortida += ['    ],', '};', '']
    with open('js/creuat-multiples/problemes.js', 'w', encoding='utf8') as f:
        f.write('\n'.join(sortida))
    with open('tests/creuat-multiples-solucions.json', 'w', encoding='utf8') as f:
        json.dump(sols, f, ensure_ascii=False, indent=1)
    print('Fet:', len(llista), 'problemes')


if __name__ == '__main__':
    main()
