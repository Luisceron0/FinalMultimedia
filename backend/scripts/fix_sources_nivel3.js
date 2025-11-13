const fs = require('fs');
const path = require('path');

// Ruta al archivo sources.js
const sourcesPath = path.join(__dirname, '../../game-project/src/Experience/sources.js');

console.log('📂 Leyendo sources.js...');
let content = fs.readFileSync(sourcesPath, 'utf8');

// Contar modelos _lev3 que apuntan a toycar2
const regex = /"name":\s*"([^"]+_lev3)",\s*"type":\s*"gltfModel",\s*"path":\s*"\/models\/toycar2\/([^"]+_lev3\.glb)"/g;
let matches = content.match(regex);

console.log(`🔍 Encontrados ${matches ? matches.length : 0} modelos _lev3 apuntando a toycar2`);

if (matches && matches.length > 0) {
    // Reemplazar toycar2 por toycar3 para todos los modelos _lev3
    content = content.replace(
        /"path":\s*"\/models\/toycar2\/([^"]+_lev3\.glb)"/g,
        '"path": "/models/toycar3/$1"'
    );
    
    fs.writeFileSync(sourcesPath, content, 'utf8');
    console.log(`✅ ${matches.length} rutas actualizadas de toycar2 → toycar3`);
} else {
    console.log('✅ No hay rutas que actualizar');
}

console.log('🎉 Proceso completado');
