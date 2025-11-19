const fs = require('fs');
const path = require('path');

// Configuración para cada nivel
const levels = [
    { level: 1, folder: 'toycar', outputFile: 'sources_1.js' },
    { level: 2, folder: 'toycar2', outputFile: 'sources_2.js' },
    { level: 3, folder: 'toycar3', outputFile: 'sources_3.js' }
];

levels.forEach(({ level, folder, outputFile }) => {
    const modelsPath = path.join(__dirname, `../../game-project/public/models/${folder}`);
    const outputPath = path.join(__dirname, '../data', outputFile);

    console.log(`\n📂 Procesando nivel ${level} - Carpeta: ${folder}`);
    console.log(`   Ruta de modelos: ${modelsPath}`);

    try {
        // Verificar que la carpeta existe
        if (!fs.existsSync(modelsPath)) {
            console.error(`❌ La carpeta no existe: ${modelsPath}`);
            return;
        }

        // Leer todos los archivos GLB
        const files = fs.readdirSync(modelsPath);
        const glbFiles = files.filter(file => file.endsWith('.glb'));

        console.log(`   Archivos GLB encontrados: ${glbFiles.length}`);

        if (glbFiles.length === 0) {
            console.warn(`⚠️  No se encontraron archivos GLB en ${folder}`);
            return;
        }

        // Generar las entradas para sources
        const entries = glbFiles.map(file => {
            const name = file.replace('.glb', '');
            return `  { name: '${name}', type: 'gltfModel', path: '/models/${folder}/${file}' }`;
        });

        // Crear el contenido del archivo
        const content = `export default [\n${entries.join(',\n')}\n]\n`;

        // Escribir el archivo
        fs.writeFileSync(outputPath, content, 'utf8');
        console.log(`✅ Archivo generado: ${outputPath}`);
        console.log(`   Total de entradas: ${entries.length}`);

    } catch (error) {
        console.error(`❌ Error procesando ${folder}:`, error.message);
    }
});

console.log('\n🎉 Proceso completado\n');
