"""
============================================================================
FITXER: tools/extreu-zeros.py
ROL: Llegeix els problemes d'«Afegeix zeros» (ゼロゼロ式) directament dels
     PDF (src/zero_q.pdf i src/zero_a.pdf) i escriu:
       - js/afegeix-zeros/problemes.js        (les dades del joc)
       - tests/afegeix-zeros-solucions.json   (quants zeros té cada targeta al PDF de solucions)
COM: les igualtats són text: pdftotext -layout dona «(n)» i, a la línia
     següent, «3 + 6 + 2 = 92» (amb xifres d'amplada completa, que es
     normalitzen amb NFKC).
ÚS (des de l'arrel del repositori; cal poppler-utils):
     python3 tools/extreu-zeros.py
============================================================================
"""
import json
import os
import re
import subprocess
import unicodedata

PDF_Q = 'src/zero_q.pdf'
PDF_A = 'src/zero_a.pdf'


def igualtats(pdf, primera):
    """{número: ([sumands], total)} de totes les pàgines a partir de «primera»."""
    text = subprocess.run(['pdftotext', '-layout', '-f', str(primera), pdf, '-'],
                          capture_output=True, text=True, check=True).stdout
    text = unicodedata.normalize('NFKC', text)
    res = {}
    for n, linia in re.findall(r'\((\d+)\)\s*\n\s*([^\n]+)', text):
        esquerra, total = linia.split('=')
        sumands = [int(x) for x in re.findall(r'\d+', esquerra)]
        assert int(n) not in res, n
        res[int(n)] = (sumands, int(re.sub(r'\s', '', total)))
    return res


def main():
    q = igualtats(PDF_Q, 2)
    a = igualtats(PDF_A, 1)
    assert sorted(q) == list(range(1, 50)) and sorted(a) == list(range(1, 50)), 'falten problemes'
    sols = {'exemple': [0, 2, 1]}  # 1 + 200 + 30 = 231
    cos = "    // L'exemple de les instruccions (【例題】)\n    exemple: { targetes: [1, 2, 3], total: 231 },\n\n    llista: [\n"
    for n in range(1, 50):
        targetes, total = q[n]
        sumands, total_a = a[n]
        assert total == total_a and len(sumands) == len(targetes), n
        zeros = []
        for t, s in zip(targetes, sumands):
            txt = str(s)
            assert 1 <= t <= 9 and txt[0] == str(t) and set(txt[1:]) <= {'0'}, (n, t, s)
            zeros.append(len(txt) - 1)
        assert sum(sumands) == total, n
        cos += f'        {{ targetes: {json.dumps(targetes)}, total: {total} }}, // {n}\n'.replace(',', ', ').replace(',  ', ', ')
        sols[str(n)] = zeros
    capcalera = """/**
 * ============================================================================
 * FITXER: js/afegeix-zeros/problemes.js
 * ROL: Dades dels 49 problemes del puzzle «Afegeix zeros»
 *      (ゼロゼロ式, de Naoki Inaba; src/zero_q.pdf).
 * NO S'EDITA A MÀ: el genera tools/extreu-zeros.py a partir del PDF.
 * FORMAT de cada problema:
 *   targetes: la xifra de cada targeta (sumands), d'esquerra a dreta.
 *   total:    el resultat de la igualtat.
 * Les solucions NO són aquí: les busca motor.js, i tests/ les compara amb
 * les del PDF (src/zero_a.pdf).
 * DEPENDÈNCIES: Cap. Es carrega abans de motor.js.
 * ============================================================================
 */
// prettier-ignore
window.PROBLEMES_ZEROS = {
"""
    os.makedirs('js/afegeix-zeros', exist_ok=True)
    with open('js/afegeix-zeros/problemes.js', 'w') as f:
        f.write(capcalera + cos + '    ],\n};\n')
    with open('tests/afegeix-zeros-solucions.json', 'w') as f:
        f.write('{\n' + ',\n'.join(f'  {json.dumps(k)}: {json.dumps(v)}' for k, v in sols.items()) + '\n}\n')
    print('✓ js/afegeix-zeros/problemes.js i tests/afegeix-zeros-solucions.json')


if __name__ == '__main__':
    main()
