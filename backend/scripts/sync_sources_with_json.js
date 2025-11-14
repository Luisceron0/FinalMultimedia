const fs = require('fs');
const path = require('path');

// 📂 Rutas
const toycar1Folder = path.join(__dirname, '..', '..', 'game-project', 'public', 'models', 'toycar');
const toycar2Folder = path.join(__dirname, '..', '..', 'game-project', 'public', 'models', 'toycar2');
const toycar3Folder = path.join(__dirname, '..', '..', 'game-project', 'public', 'models', 'toycar3');
const sourcesPath = path.join(__dirname, '..', '..', 'game-project', 'src', 'Experience', 'sources.js');

console.log('🔧 Sincronizando sources.js con archivos GLB reales...\n');

// 📖 Leer archivos .glb de cada carpeta
const getGlbFiles = (folderPath, folderName) => {
    if (!fs.existsSync(folderPath)) return [];
    return fs.readdirSync(folderPath)
        .filter(file => file.endsWith('.glb'))
        .map(file => ({
            name: file.replace('.glb', ''),
            folder: folderName,
            file: file
        }));
};

const level1Files = getGlbFiles(toycar1Folder, 'toycar');
const level2Files = getGlbFiles(toycar2Folder, 'toycar2');
const level3Files = getGlbFiles(toycar3Folder, 'toycar3');

console.log(`✅ Nivel 1 (toycar): ${level1Files.length} archivos .glb`);
console.log(`✅ Nivel 2 (toycar2): ${level2Files.length} archivos .glb`);
console.log(`✅ Nivel 3 (toycar3): ${level3Files.length} archivos .glb\n`);

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

// 🚗 Construir modelos desde archivos reales
const allFiles = [...level1Files, ...level2Files, ...level3Files];

const models = allFiles.sort((a, b) => a.name.localeCompare(b.name)).map(fileInfo => {
    return `    {\n        "name": "${fileInfo.name}",\n        "type": "gltfModel",\n        "path": "/models/${fileInfo.folder}/${fileInfo.file}"\n    }`;
});

console.log(`📦 ${models.length} modelos desde archivos físicos\n`);

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
console.log(`   - Modelos: ${models.length}`);
