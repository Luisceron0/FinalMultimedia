/**
 * Script para corregir las rutas de los modelos lev2 y lev3 en sources.js
 * Los modelos lev2 y lev3 deben estar en /models/toycar2/, no en /models/toycar/
 */

const fs = require('fs');
const path = require('path');

const SOURCES_PATH = path.join(__dirname, '../../game-project/src/Experience/sources.js');

console.log('🔧 Corrigiendo rutas en sources.js...');

// Leer el archivo sources.js
let content = fs.readFileSync(SOURCES_PATH, 'utf-8');

// Contador de cambios
let changes = 0;

// Reemplazar todas las rutas de lev2 y lev3 que estén en toycar/
content = content.replace(
    /"path":\s*"\/models\/toycar\/([^"]+_(lev2|lev3)\.glb)"/g,
    (match, filename) => {
        changes++;
        return `"path": "/models/toycar2/${filename}"`;
    }
);

// Guardar el archivo corregido
fs.writeFileSync(SOURCES_PATH, content, 'utf-8');

console.log(`✅ Corrección completada: ${changes} rutas actualizadas`);
console.log(`📄 Archivo: ${SOURCES_PATH}`);
