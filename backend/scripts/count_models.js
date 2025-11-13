const fs = require('fs');
const path = require('path');

const sourcesPath = path.join(__dirname, '../../game-project/src/Experience/sources.js');
const content = fs.readFileSync(sourcesPath, 'utf8');

const gltfModels = (content.match(/"type":\s*"gltfModel"/g) || []).length;

console.log(`📊 Total modelos GLB en sources.js: ${gltfModels}`);

// El problema probable: carga lazy vs carga inmediata
console.log('\n⚠️  PROBLEMA DETECTADO:');
console.log(`   - Intentando cargar ${gltfModels} modelos GLB simultáneamente`);
console.log(`   - El navegador está colapsando por carga masiva`);
console.log(`   - Los errores "JSON.parse" son porque el navegador cancela las descargas`);
console.log('\n✅ SOLUCIÓN:');
console.log('   1. Implementar carga LAZY (solo modelos visibles)');
console.log('   2. O reducir cantidad de modelos simultáneos');
console.log('   3. O implementar sistema de LOD (Level of Detail)');
