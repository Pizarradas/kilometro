import { pathToFileURL } from 'node:url';
const iso = await import(pathToFileURL(process.argv[2]).href);
const mode = process.argv[3];
const P = mode==='dark'
 ? { losa:'#2a313b', asfalto:'#bebebe', marca:'#0f1319', balasto:'#3a414c', carril:'#9e9e9e', coche:'#f4af2d', gris:'#9e9e9e', tren:'#c19fe9', oficina:'#88bcf6', edificio:'#9e9e9e', casa:'#0f1319', arbol:'#349750', lleno:'#c75853' }
 : { losa:'#d8d1c2', asfalto:'#4b5666', marca:'#fbf9f5', balasto:'#c4bcab', carril:'#5a6474', coche:'#f4af2d', gris:'#5a6474', tren:'#7c49b8', oficina:'#124aa3', edificio:'#5a6474', casa:'#fbf9f5', arbol:'#349750', lleno:'#c75853' };
console.log(iso.paletteCSS(P,{prefix:'km-iso'}).replace('}','  --km-iso-sombra: #000;\n}'));
