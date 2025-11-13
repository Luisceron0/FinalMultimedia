const fs = require('fs');
const path = require('path');

// Lista de archivos con error según el log
const archivosConError = [
    '0_lev1.glb',
    '1_lev1.glb',
    'bench_lev1.glb',
    'bench.001.001_lev1.glb',
    'cross-column.001.001_lev1.glb',
    'cross-column.001.002_lev1.glb',
    // ... y muchos más
];

const carpeta = path.join(__dirname, '../../game-project/public/models/toycar');

console.log('🔍 Verificando archivos GLB problemáticos...\n');

let corruptos = [];
let validos = [];

// Verificar TODOS los archivos GLB en toycar
const todosArchivos = fs.readdirSync(carpeta).filter(f => f.endsWith('.glb'));

todosArchivos.forEach(archivo => {
    const rutaArchivo = path.join(carpeta, archivo);
    const stats = fs.statSync(rutaArchivo);
    
    // Leer primeros 4 bytes (magic number)
    const buffer = Buffer.alloc(4);
    const fd = fs.openSync(rutaArchivo, 'r');
    fs.readSync(fd, buffer, 0, 4, 0);
    fs.closeSync(fd);
    
    const magic = buffer.toString('utf8');
    
    if (magic !== 'glTF' || stats.size < 100) {
        corruptos.push(archivo);
        console.log(`❌ CORRUPTO: ${archivo} (${stats.size} bytes, magic: "${magic}")`);
    } else {
        validos.push(archivo);
    }
});

console.log(`\n📊 RESUMEN:`);
console.log(`   ✅ Archivos válidos: ${validos.length}`);
console.log(`   ❌ Archivos corruptos: ${corruptos.length}`);

if (corruptos.length > 0) {
    console.log('\n⚠️  ARCHIVOS CORRUPTOS DETECTADOS:');
    corruptos.forEach(f => console.log(`   - ${f}`));
    
    // Generar script de limpieza PowerShell
    const comandos = corruptos.map(archivo => {
        return `Remove-Item "game-project\\public\\models\\toycar\\${archivo}" -Force`;
    });
    
    const scriptPath = path.join(__dirname, 'eliminar_corruptos_lev1.ps1');
    fs.writeFileSync(scriptPath, comandos.join('\n'));
    
    console.log(`\n💾 Script de limpieza generado: ${scriptPath}`);
    console.log('📋 Para ejecutar:');
    console.log(`   .\\${path.basename(scriptPath)}`);
    
    // También actualizar sources.js para remover referencias
    console.log('\n🔧 Actualizando sources.js para omitir archivos corruptos...');
    const sourcesPath = path.join(__dirname, '../../game-project/src/Experience/sources.js');
    let sourcesContent = fs.readFileSync(sourcesPath, 'utf8');
    
    // Contar cuántos se van a eliminar
    let eliminados = 0;
    corruptos.forEach(archivo => {
        const nombreModelo = archivo.replace('.glb', '');
        const regex = new RegExp(`\\s*\\{[^}]*"name":\\s*"${nombreModelo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^}]*\\},?\\n`, 'g');
        const antes = sourcesContent;
        sourcesContent = sourcesContent.replace(regex, '');
        if (antes !== sourcesContent) eliminados++;
    });
    
    fs.writeFileSync(sourcesPath, sourcesContent);
    console.log(`   ✅ Eliminadas ${eliminados} referencias de sources.js`);
}

console.log('\n✅ Verificación completada');
