const fs = require('fs');
const path = require('path');

// 📂 Rutas
const jsonPath = path.join(__dirname, '..', '..', 'game-project', 'public', 'models', 'toycar', 'toy_car_blocks1.json');
const sourcesPath = path.join(__dirname, '..', '..', 'game-project', 'src', 'Experience', 'sources.js');

console.log('🔧 Sincronizando sources.js con toy_car_blocks1.json...\n');

// 📖 Leer JSON de nivel 1
const blocksData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
console.log(`✅ ${blocksData.length} bloques encontrados en toy_car_blocks1.json\n`);

// 📖 Leer sources.js actual
const sourcesContent = fs.readFileSync(sourcesPath, 'utf8');

// 🔍 Extraer texturas (preservar las que no sean modelos)
const textureMatches = [
    ...sourcesContent.matchAll(/\{\s*"name":\s*"([^"]+)",\s*"type":\s*"texture",\s*"path":\s*"([^"]+)"\s*\}/g),
    ...sourcesContent.matchAll(/\{\s*"name":\s*"([^"]+)",\s*"type":\s*"cubeTexture",\s*"path":\s*\[([\s\S]*?)\]\s*\}/g)
];

// 🎨 Construir array de texturas
const textures = [];
for (const match of textureMatches) {
    const fullMatch = match[0];
    if (fullMatch.includes('cubeTexture')) {
        textures.push(fullMatch);
    } else {
        textures.push(`    {\n        "name": "${match[1]}",\n        "type": "texture",\n        "path": "${match[2]}"\n    }`);
    }
}

console.log(`🎨 ${textures.length} texturas preservadas\n`);

// 🚗 Construir array de modelos SOLO de nivel 1
const models = blocksData.map(block => {
    return `    {\n        "name": "${block.name}",\n        "type": "gltfModel",\n        "path": "/models/toycar/${block.name}.glb"\n    }`;
});

console.log(`📦 ${models.length} modelos de nivel 1 agregados\n`);

// 🔨 Construir sources.js completo
const newSources = `export default [\n${textures.join(',\n')},\n${models.join(',\n')}\n]\n`;

// 💾 Guardar backup
fs.writeFileSync(sourcesPath + '.before-sync', sourcesContent);
console.log('💾 Backup creado: sources.js.before-sync\n');

// 💾 Guardar nuevo sources.js
fs.writeFileSync(sourcesPath, newSources);

console.log('✅ sources.js actualizado exitosamente!');
console.log(`📊 Total recursos: ${textures.length + models.length}`);
console.log(`   - Texturas: ${textures.length}`);
console.log(`   - Modelos nivel 1: ${models.length}`);
