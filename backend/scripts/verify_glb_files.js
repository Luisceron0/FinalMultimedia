const fs = require('fs');
const path = require('path');

// 🔍 Script para verificar integridad de archivos GLB

const carpetas = [
    'game-project/public/models/toycar',
    'game-project/public/models/toycar2',
    'game-project/public/models/toycar3'
];

console.log('🔍 Verificando archivos GLB...\n');

let totalArchivos = 0;
let archivosCorruptos = [];
let archivosValidos = 0;

carpetas.forEach(carpeta => {
    const rutaCompleta = path.join(__dirname, '../../', carpeta);
    
    if (!fs.existsSync(rutaCompleta)) {
        console.log(`⚠️  Carpeta no existe: ${carpeta}`);
        return;
    }

    console.log(`📂 Analizando: ${carpeta}`);
    const archivos = fs.readdirSync(rutaCompleta).filter(f => f.endsWith('.glb'));
    
    archivos.forEach(archivo => {
        totalArchivos++;
        const rutaArchivo = path.join(rutaCompleta, archivo);
        const stats = fs.statSync(rutaArchivo);
        
        // GLB válido debe tener al menos 100 bytes (header mínimo)
        if (stats.size < 100) {
            archivosCorruptos.push({
                carpeta: carpeta.split('/').pop(),
                archivo,
                tamaño: stats.size
            });
        } else {
            // Verificar que empiece con "glTF" (magic number del formato GLB)
            const buffer = Buffer.alloc(4);
            const fd = fs.openSync(rutaArchivo, 'r');
            fs.readSync(fd, buffer, 0, 4, 0);
            fs.closeSync(fd);
            
            const magic = buffer.toString('utf8');
            if (magic !== 'glTF') {
                archivosCorruptos.push({
                    carpeta: carpeta.split('/').pop(),
                    archivo,
                    tamaño: stats.size,
                    motivo: 'Magic number inválido'
                });
            } else {
                archivosValidos++;
            }
        }
    });
    
    console.log(`   ✅ ${archivos.length} archivos encontrados`);
});

console.log('\n📊 RESUMEN:');
console.log(`   Total archivos: ${totalArchivos}`);
console.log(`   Archivos válidos: ${archivosValidos}`);
console.log(`   Archivos corruptos: ${archivosCorruptos.length}`);

if (archivosCorruptos.length > 0) {
    console.log('\n❌ ARCHIVOS CORRUPTOS DETECTADOS:\n');
    
    // Agrupar por carpeta
    const porCarpeta = archivosCorruptos.reduce((acc, item) => {
        if (!acc[item.carpeta]) acc[item.carpeta] = [];
        acc[item.carpeta].push(item);
        return acc;
    }, {});
    
    Object.keys(porCarpeta).forEach(carpeta => {
        console.log(`\n📁 ${carpeta} (${porCarpeta[carpeta].length} corruptos):`);
        porCarpeta[carpeta].slice(0, 10).forEach(item => {
            console.log(`   - ${item.archivo} (${item.tamaño} bytes) ${item.motivo || ''}`);
        });
        if (porCarpeta[carpeta].length > 10) {
            console.log(`   ... y ${porCarpeta[carpeta].length - 10} más`);
        }
    });
    
    // Guardar lista completa
    const reportePath = path.join(__dirname, 'archivos_corruptos.json');
    fs.writeFileSync(reportePath, JSON.stringify(archivosCorruptos, null, 2));
    console.log(`\n💾 Lista completa guardada en: ${reportePath}`);
    
    // Generar script de limpieza
    const scriptLimpieza = archivosCorruptos.map(item => {
        const ruta = `game-project/public/models/${item.carpeta}/${item.archivo}`;
        return `Remove-Item "${ruta}" -ErrorAction SilentlyContinue`;
    }).join('\n');
    
    const scriptPath = path.join(__dirname, 'limpiar_corruptos.ps1');
    fs.writeFileSync(scriptPath, scriptLimpieza);
    console.log(`💾 Script de limpieza generado: ${scriptPath}`);
    console.log('\n⚠️  RECOMENDACIÓN: Eliminar archivos corruptos y volver a exportar desde Blender');
}

console.log('\n✅ Verificación completada');
