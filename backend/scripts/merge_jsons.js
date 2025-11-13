const fs = require('fs');
const path = require('path');

// Rutas de los archivos JSON individuales
const json1Path = path.join(__dirname, '../../game-project/public/models/toycar/toy_car_blocks1.json');
const json2Path = path.join(__dirname, '../../game-project/public/models/toycar2/toy_car_blocks2.json');
const json3Path = path.join(__dirname, '../../game-project/public/models/toycar3/toy_car_blocks3.json');

// Ruta del archivo JSON combinado
const outputPath = path.join(__dirname, '../../game-project/public/data/toy_car_blocks.json');

console.log('📂 Combinando JSONs de los 3 niveles...');

try {
    // Leer los 3 archivos JSON
    const blocks1 = JSON.parse(fs.readFileSync(json1Path, 'utf8'));
    const blocks2 = JSON.parse(fs.readFileSync(json2Path, 'utf8'));
    const blocks3 = JSON.parse(fs.readFileSync(json3Path, 'utf8'));

    console.log(`✅ Nivel 1: ${blocks1.length} bloques`);
    console.log(`✅ Nivel 2: ${blocks2.length} bloques`);
    console.log(`✅ Nivel 3: ${blocks3.length} bloques`);

    // Combinar todos los bloques en un solo array
    const allBlocks = [...blocks1, ...blocks2, ...blocks3];

    console.log(`📊 Total combinado: ${allBlocks.length} bloques`);

    // Crear directorio data si no existe
    const dataDir = path.dirname(outputPath);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    // Guardar el archivo combinado
    fs.writeFileSync(outputPath, JSON.stringify(allBlocks, null, 4), 'utf8');

    console.log(`💾 Archivo guardado: ${outputPath}`);
    console.log('🎉 Proceso completado exitosamente');

} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}
