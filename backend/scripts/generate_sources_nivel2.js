// scripts/generate_sources_nivel2.js
// Genera el archivo sources_2.js con TODOS los modelos de toycar2

const fs = require('fs');
const path = require('path');

// Rutas correctas
const modelsPath = 'C:/Users/labinf2.pasto/FinalMultimedia/game-project/public/models/toycar2';
const outputPath = path.join(__dirname, '../data/sources_2.js');

console.log('📂 Buscando modelos en:', modelsPath);

if (!fs.existsSync(modelsPath)) {
    console.error('❌ El directorio no existe:', modelsPath);
    process.exit(1);
}

const files = fs.readdirSync(modelsPath);
const sources = [];

files.forEach(file => {
    if (file.endsWith('.glb')) {
        // Usar el nombre exacto del archivo (sin extensión) como name
        const name = path.basename(file, '.glb');
        sources.push({
            name: name,
            type: 'gltfModel',
            path: `/models/toycar2/${file}`
        });
    }
});

// Ordenar por nombre para mejor organización
sources.sort((a, b) => a.name.localeCompare(b.name));

const output = `export default ${JSON.stringify(sources, null, 2)};\n`;

fs.writeFileSync(outputPath, output, 'utf-8');

console.log(`✅ Archivo sources_2.js generado con ${sources.length} modelos`);
console.log('📍 Guardado en:', outputPath);
