#!/bin/bash
# Stamp a build version before committing a deploy.
#   tools/stamp.sh            -> writes js/version.js and refreshes the import map in index.html
# Why: GitHub Pages caches every file for 10 minutes. The import map gives every module URL a ?v=<version>,
# so a new deploy never mixes with cached old modules, and the version shows bottom-right in the game.
set -euo pipefail
cd "$(dirname "$0")/.."
V=$(date +%m%d-%H%M)
printf "// Written by tools/stamp.sh. Shown bottom-right in the game; quote it when reporting.\nexport const VERSION = '%s';\n" "$V" > js/version.js
python3 - "$V" <<'EOF'
import re, sys, pathlib
v = sys.argv[1]
root = pathlib.Path('.')
mods = sorted(str(p).replace('\\', '/') for p in root.glob('js/**/*.js'))
entries = ',\n'.join(f'    "./{m}": "./{m}?v={v}"' for m in mods)
block = f'<!--importmap:start-->\n<script type="importmap">\n{{ "imports": {{\n{entries}\n}} }}\n</script>\n<!--importmap:end-->'
html = (root / 'index.html').read_text(encoding='utf-8')
if '<!--importmap:start-->' in html:
    html = re.sub(r'<!--importmap:start-->.*?<!--importmap:end-->', block, html, flags=re.S)
else:
    html = html.replace('<script type="module"', block + '\n<script type="module"', 1)
html = re.sub(r'<script type="module" src="js/main\.js(\?v=[^"]*)?"></script>', f'<script type="module" src="js/main.js?v={v}"></script>', html)
(root / 'index.html').write_text(html, encoding='utf-8')
print(f'version {v}: {len(mods)} modules mapped')
EOF
