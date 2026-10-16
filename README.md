# Kilómetro 36,6

Landing narrativa del trayecto Valdemoro → Julián Camarillo, contada como un día entero y siempre en el peor escenario. Construida sobre SYX con un tema propio, la retícula de grid-system y maquetas de iso-flat.

## Abrir

`kilometro.html` es autocontenida (CSS de SYX, fuentes, SVG y JS dentro). Ábrela en el navegador, sin servidor.

## Contenido

| Carpeta | Qué hay |
|---|---|
| `kilometro.html` | La página final |
| `src/` | Fuentes: `index.html` (con marcadores `{{CSS}}`, `{{SVG:…}}`, `{{JS}}`), `km.css` (tokens `--km-*` y reglas en `@layer syx.app`, Grid Spec en la cabecera), `km.js` |
| `iso/` | `build-scenes.mjs` (las tres escenas como datos), los SVG generados y las paletas `review-*.css` para renderizar la revisión |
| `syx-tema/` | El tema `kilometro` como parche (`git am`) y su CSS compilado |
| `tools/` | Texto de muestra usado con `gridcalc compose` / `lines`, y el `package.json` con el tema para `syx-scan` |
| `capturas/` | Escritorio en claro y móvil en oscuro |

## Reconstruir

1. Aplica el tema en tu clon de SYX y compila:
   ```
   cd C:\GITHUBS\syx
   git am ruta\a\syx-tema\0001-feat-themes-tema-kilometro-para-la-landing-del-traye.patch
   npm run build:css
   ```
2. Si cambias una escena: `node iso/build-scenes.mjs <skill--isometric>/skills/iso-flat-svg-web/scripts/iso.mjs iso`
   y compruébala con `python iso-check.py --tokens iso/km-mapa.svg`.
3. Ensambla la página: `python build.py C:\GITHUBS\syx` (o variable de entorno `SYX`). Escribe `dist/kilometro.html`.
4. Revisa el consumo de SYX: `npx syx-scan src --tema kilometro`.

## Decisiones de la retícula (gridcalc)

- Cuerpo Space Grotesk 16 → 18 px / 1.5; medida 31.613em = 62 caracteres reales de media.
- Escala cuarta justa sobre 18: 14 · 18 · 24 · 32 · 42 · 56 · 76 · 102 · 134.
- 6 → 12 columnas a 48em; gutter `clamp(1rem, .75rem + 1.111vw, 1.75rem)`; margen 16 → 120 px; máx. 1200 px.
- Operadores: O3 (la prosa arranca en la línea 3), O8 (maquetas isométricas a 30°), ruptura del mapa y el ranking a ancho completo.

## Pendiente

- Bebas Neue: fijar su line box con `ascent-override: 90%; descent-override: 30%; line-gap-override: 0%` (en Windows los titulares bajan 0,05em).

Diseñado y desarrollado por José Luis Pizarro.
