# Planches : chaque serie d'images/ (nom-00000.png) cote a cote, reduite.
import glob
import os
import re
import sys

from PIL import Image

ICI = os.path.dirname(os.path.abspath(__file__))
echelle = float(sys.argv[1]) if len(sys.argv) > 1 else 0.42
series = {}
for f in sorted(glob.glob(os.path.join(ICI, 'images', '*.png'))):
    m = re.match(r'(.+)-(\d{5})\.png$', os.path.basename(f))
    if m:
        series.setdefault(m.group(1), []).append(f)

for nom, fichiers in series.items():
    ims = [Image.open(f).convert('RGB') for f in fichiers]
    w, h = ims[0].size
    w2, h2 = int(w * echelle), int(h * echelle)
    cols = min(len(ims), 3)
    rows = (len(ims) + cols - 1) // cols
    planche = Image.new('RGB', (w2 * cols, h2 * rows), 'white')
    for i, im in enumerate(ims):
        planche.paste(im.resize((w2, h2)), ((i % cols) * w2, (i // cols) * h2))
    planche.save(os.path.join(ICI, f'planche-{nom}.png'))
    print(nom, len(ims))
