// build-scenes.mjs — las tres escenas isométricas de la landing «Kilómetro».
// Usa las primitivas de skill--isometric (iso.mjs): proyección iso 30°, unidad 32px,
// luz arriba-izquierda, tres tonos por material, orden del pintor.
// Uso: node build-scenes.mjs <ruta a iso.mjs> <carpeta de salida>
import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const iso = await import(pathToFileURL(resolve(process.argv[2])).href);
const OUT = process.argv[3] || '.';
const { prism, cylinder, flatShadow, cylinderShadow, shadowDir, depthSort, project } = iso;

const MODE = 'iso', UNIT = 32, PREFIX = 'km-iso';
const o = { mode: MODE, unit: UNIT, prefix: PREFIX, tokens: true };
const r2 = (n) => Math.round(n * 100) / 100;
const pts = (l) => l.map((v) => project(v, MODE, UNIT).map(r2).join(',')).join(' ');

function draw(i) { return i.kind === 'cylinder' ? cylinder({ ...o, ...i }) : prism({ ...o, ...i }); }

// Escena: losa → marcas planas en el suelo → sombras (recortadas a la losa) → objetos por profundidad.
function build({ key, title, desc, base, ground = [], objects, width, height, oy = 0.62 }) {
  const sz = base.z + base.h;
  const dir = shadowDir('left');
  const sh = objects.filter((i) => !i.noShadow).map((i) => {
    const s = { ...o, ...i, dir, h: (i.h ?? 1) + (i.z ?? 0) - sz, z: sz, opacity: 0.16 };
    return i.kind === 'cylinder' ? cylinderShadow(s) : flatShadow(s);
  }).join('');
  const top = pts([[base.x, base.y, sz], [base.x + base.w, base.y, sz], [base.x + base.w, base.y + base.d, sz], [base.x, base.y + base.d, sz]]);
  const body = [
    draw(base),
    `<g class="km-iso__suelo">${ground.map(draw).join('')}</g>`,
    `<defs><clipPath id="${key}-clip"><polygon points="${top}"/></clipPath></defs>`,
    `<g class="iso-sombras" clip-path="url(#${key}-clip)">${sh}</g>`,
    ...depthSort(objects).map(draw),
  ].join('');
  const vb = `${-width / 2} ${-height * oy} ${width} ${height}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" role="img" aria-labelledby="${key}-title ${key}-desc" class="km-iso">` +
    `<title id="${key}-title">${title}</title><desc id="${key}-desc">${desc}</desc>${body}</svg>`;
  writeFileSync(`${OUT}/${key}.svg`, svg + '\n');
}

// Ayudas de construcción ---------------------------------------------------
const box = (id, x, y, z, w, d, h, token, extra = {}) => ({ kind: 'prism', id, x, y, z, w, d, h, token, ...extra });
const tree = (id, cx, cy, z, r = 0.32, h = 0.9) => ({ kind: 'cylinder', id, cx, cy, z, r, h, token: 'arbol' });
// Coche: chasis + cabina (dos prismas apilados, la cabina ligeramente retrasada).
function car(id, x, y, z, token = 'coche', along = 'x') {
  const [w, d] = along === 'x' ? [1.1, 0.55] : [0.55, 1.1];
  const cab = along === 'x' ? [x + 0.25, y + 0.05, 0.55, 0.45] : [x + 0.05, y + 0.25, 0.45, 0.55];
  return [box(id, x, y, z, w, d, 0.3, token), box(`${id}-cabina`, cab[0], cab[1], z + 0.3, cab[2], cab[3], 0.22, token, { noShadow: true })];
}
// Vagón de tren a lo largo de x.
const wagon = (id, x, y, z, len = 2.2, token = 'tren') => box(id, x, y, z, len, 0.7, 0.75, token);

// ===================================================================
// 1 · El mapa: Valdemoro (sur, izquierda) → A-4 → Julián Camarillo (norte, derecha)
// ===================================================================
{
  const Z = 0.5;
  const base = box('losa', -10, -3.6, 0, 20, 7.2, Z, 'losa');
  const ground = [
    // A-4: calzada y marcas viales discontinuas
    box('a4', -10, 0.6, Z, 20, 1.5, 0.02, 'asfalto'),
    ...Array.from({ length: 13 }, (_, i) => box(`a4-marca-${i}`, -9.6 + i * 1.5, 1.3, Z + 0.02, 0.7, 0.1, 0.005, 'marca')),
    // C3: lecho de vía
    box('c3', -10, -1.7, Z, 20, 0.9, 0.02, 'balasto'),
    ...Array.from({ length: 2 }, (_, i) => box(`c3-carril-${i}`, -10, -1.55 + i * 0.5, Z + 0.02, 20, 0.08, 0.02, 'carril')),
  ];
  const objects = [
    // Valdemoro: casas bajas y árboles
    box('casa-1', -9.4, -3.2, Z, 1.2, 1, 0.9, 'casa'), box('casa-2', -7.8, -3.1, Z, 1, 1.1, 1.2, 'casa'),
    box('casa-3', -9.4, 2.7, Z, 1.2, 0.7, 0.6, 'casa'), box('casa-4', -7.9, 2.8, Z, 0.9, 0.6, 0.5, 'casa'),
    box('estacion', -6.2, -3.3, Z, 1.6, 1.1, 1.1, 'casa'),
    tree('arbol-1', -3.6, -3.1, Z), tree('arbol-2', -2.4, -2.8, Z, 0.26, 0.7), tree('arbol-3', -1.2, -3.2, Z),
    tree('arbol-4', 0.6, -2.9, Z, 0.26, 0.7), tree('arbol-5', 1.8, -3.1, Z), tree('arbol-6', 4.4, 3.2, Z, 0.24, 0.45),
    tree('arbol-7', -5.4, 3.2, Z, 0.24, 0.45), tree('arbol-8', -1.5, 3.2, Z, 0.24, 0.45),
    // En marcha: el coche por la A-4, la C3 por la vía
    ...car('coche', -2.4, 0.75, Z + 0.02),
    ...car('coche-2', 2.6, 1.35, Z + 0.02, 'gris'),
    ...car('coche-3', -6.2, 1.35, Z + 0.02, 'gris'),
    wagon('tren-1', 3.4, -1.7, Z + 0.04), wagon('tren-2', 5.7, -1.7, Z + 0.04),
    // Madrid · Simancas: oficinas, el destino en azul de cartel
    box('oficina-1', 4.6, -3.3, Z, 1.3, 1.2, 2.2, 'edificio'),
    box('destino', 6.4, -3.4, Z, 1.8, 1.4, 3.6, 'oficina'),
    box('oficina-2', 8.6, -3.3, Z, 1.2, 1.3, 2.8, 'edificio'),
    box('oficina-3', 6.4, 2.6, Z, 1.4, 0.8, 0.9, 'edificio'),
    box('oficina-4', 8.4, 2.5, Z, 1.2, 0.9, 1.2, 'edificio'),
  ];
  build({ key: 'km-mapa', title: 'El trayecto, de Valdemoro a Julián Camarillo', desc: 'Maqueta isométrica: a la izquierda las casas de Valdemoro y su estación; en el centro la A-4 con un coche ámbar y la vía de la C3 con un tren violeta; a la derecha las oficinas de Simancas y el edificio de destino en azul.', base, ground, objects, width: 820, height: 500, oy: 0.56 });
}

// ===================================================================
// 2 · La estación de Valdemoro: aparcar y subir a la C3
// ===================================================================
{
  const Z = 0.4;
  const base = box('losa', -5, -4, 0, 10, 8, Z, 'losa');
  const ground = [
    box('aparcamiento', -4.6, 0.8, Z, 6.4, 2.8, 0.02, 'asfalto'),
    ...Array.from({ length: 6 }, (_, i) => box(`plaza-${i}`, -4.5 + i * 1.05, 0.9, Z + 0.02, 0.06, 1.2, 0.005, 'marca')),
    ...Array.from({ length: 6 }, (_, i) => box(`plaza-b-${i}`, -4.5 + i * 1.05, 2.3, Z + 0.02, 0.06, 1.2, 0.005, 'marca')),
    box('via', -5, -3.4, Z, 10, 1, 0.02, 'balasto'),
    box('via-carril-1', -5, -3.25, Z + 0.02, 10, 0.08, 0.02, 'carril'),
    box('via-carril-2', -5, -2.65, Z + 0.02, 10, 0.08, 0.02, 'carril'),
  ];
  const objects = [
    box('anden', -5, -2.3, Z, 10, 1, 0.25, 'casa'),
    box('estacion', 2.2, 0.6, Z, 2.4, 2.2, 1.4, 'casa'),
    box('estacion-tejado', 2.1, 0.5, Z + 1.4, 2.6, 2.4, 0.15, 'oficina', { noShadow: true }),
    wagon('c3-1', -4.6, -3.4, Z + 0.04, 3), wagon('c3-2', -1.4, -3.4, Z + 0.04, 3),
    ...car('mi-coche', -2.4 + 0.03, 1.0, Z + 0.02, 'coche', 'y'),
    ...car('coche-a', -4.45 + 0.03, 1.0, Z + 0.02, 'gris', 'y'),
    ...car('coche-b', -3.4 + 0.03, 1.0, Z + 0.02, 'gris', 'y'),
    ...car('coche-c', -0.25 + 0.03, 2.4, Z + 0.02, 'gris', 'y'),
    tree('arbol-1', 4.4, 3.4, Z), tree('arbol-2', 3.3, 3.5, Z), tree('arbol-3', -4.4, 3.8, Z, 0.28, 0.7),
  ];
  build({ key: 'km-estacion', title: 'La estación de Valdemoro', desc: 'Maqueta isométrica: un aparcamiento junto a la estación con el coche propio en ámbar entre coches grises, el andén y un tren violeta de la C3 esperando.', base, ground, objects, width: 560, height: 420, oy: 0.55 });
}

// ===================================================================
// 3 · Julián Camarillo: aparcar en destino
// ===================================================================
{
  const Z = 0.4;
  const base = box('losa', -6, -4, 0, 12, 8, Z, 'losa');
  const ground = [
    box('calle', -6, -0.6, Z, 12, 1.6, 0.02, 'asfalto'),
    ...Array.from({ length: 7 }, (_, i) => box(`calle-marca-${i}`, -5.6 + i * 1.7, 0.15, Z + 0.02, 0.8, 0.1, 0.005, 'marca')),
    box('explanada', 0.6, 1.6, Z, 5.2, 2.2, 0.03, 'balasto'),
  ];
  // Parking de abono: tres plantas de forjado sobre pilares, con sitio
  const parking = [];
  for (let f = 0; f < 3; f++) {
    const z = Z + f * 0.9;
    parking.push(box(`forjado-${f}`, -5.4, -3.6, z + 0.6, 3.6, 2.6, 0.15, 'edificio', { noShadow: f > 0 }));
  }
  const objects = [
    ...parking,
    box('pilar-1', -5.4, -1.15, Z, 0.15, 0.15, 2.4, 'edificio', { noShadow: true }),
    box('pilar-2', -1.95, -1.15, Z, 0.15, 0.15, 2.4, 'edificio', { noShadow: true }),
    box('destino', 1.2, -3.6, Z, 2.6, 2.2, 3.6, 'oficina'),
    box('juzgados', 4.2, -3.4, Z, 1.5, 1.8, 2.2, 'edificio'),
    // Calle: coches en doble fila y en la acera
    ...car('coche-1', -4.6, -0.5, Z + 0.02, 'gris'), ...car('coche-2', -2.6, -0.5, Z + 0.02, 'gris'),
    ...car('coche-3', 0.2, 0.45, Z + 0.02, 'gris'), ...car('coche-4', 2.4, -0.5, Z + 0.02, 'gris'),
    ...car('mi-coche', -0.6, -0.5, Z + 0.02, 'coche'),
    // Explanada gratuita, al fondo-derecha: llena
    ...[0, 1, 2, 3].flatMap((i) => car(`ex-a-${i}`, 0.8 + i * 1.25, 1.75, Z + 0.03, 'gris')),
    ...[0, 1, 2, 3].flatMap((i) => car(`ex-b-${i}`, 0.8 + i * 1.25, 2.75, Z + 0.03, 'gris')),
    box('aviso', 5.3, 3.9, Z, 0.08, 0.08, 1.3, 'edificio', { noShadow: true }),
    box('aviso-placa', 5.05, 3.95, Z + 1.3, 0.6, 0.04, 0.5, 'lleno', { noShadow: true }),
    tree('arbol-1', -5.3, 2.3, Z), tree('arbol-2', -4.2, 3.2, Z), tree('arbol-3', -2.9, 2.4, Z),
  ];
  build({ key: 'km-destino', title: 'Aparcar en Julián Camarillo', desc: 'Maqueta isométrica: a la izquierda un parking de varias plantas con sitio; en el centro la calle con coches en doble fila y el coche propio en ámbar buscando hueco; al fondo el edificio de destino en azul y, a la derecha, la explanada gratuita llena con un cartel rojo.', base, ground, objects, width: 620, height: 470, oy: 0.6 });
}
