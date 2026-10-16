import re, base64, pathlib
R = pathlib.Path(__file__).parent
import os, sys
SYX = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else os.environ.get('SYX', R.parent/'syx')).resolve()
css = (SYX/'css/styles-theme-kilometro.css').read_text()
def font(m):
    p = (SYX/'css'/m.group(1)).resolve()
    return 'url("data:font/woff2;base64,%s")' % base64.b64encode(p.read_bytes()).decode()
css = re.sub(r'url\("(\.\./fonts/[^"]+\.woff2)"\)', font, css)
css = re.sub(r'/\*[^!][\s\S]*?\*/', '', css)          # comentarios fuera
css = re.sub(r'\n\s*\n', '\n', css)
app = (R/'src/km.css').read_text()
html = (R/'src/index.html').read_text()
html = html.replace('{{CSS}}', css + '\n' + app)
for s in ['km-mapa', 'km-mapa-m', 'km-estacion', 'km-destino']:
    html = html.replace('{{SVG:%s}}' % s, (R/'iso'/(s+'.svg')).read_text().strip())
html = html.replace('{{JS}}', (R/'src/km.js').read_text())
out = R/'dist'; out.mkdir(exist_ok=True)
(out/'kilometro.html').write_text(html)
print(len(html)//1024, 'KB')
