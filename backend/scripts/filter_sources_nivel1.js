// 🎮 SCRIPT DE EMERGENCIA: Generar sources.js SOLO con Nivel 1

const fs = require('fs');
const path = require('path');

// Leer el sources.js actual
const sourcesPath = path.join(__dirname, '../../game-project/src/Experience/sources.js');
const content = fs.readFileSync(sourcesPath, 'utf8');

// Extraer el array de sources (entre corchetes)
const match = content.match(/export\s+default\s+\[([\s\S]*)\]/);
if (!match) {
    console.error('❌ No se pudo parsear sources.js');
    process.exit(1);
}

const sourcesText = '[' + match[1] + ']';
let sources;
try {
    // Evaluar como JavaScript (cuidado: solo en scripts de desarrollo)
    sources = eval('(' + sourcesText + ')');
} catch (e) {
    console.error('❌ Error parseando sources:', e);
    process.exit(1);
}

console.log(`📊 Total modelos en sources.js: ${sources.length}`);

// Filtrar SOLO nivel 1
const nivel1 = sources.filter(s => {
    if (s.type !== 'gltfModel') return true; // Mantener texturas, etc
    const name = s.name || '';
    return name.includes('_lev1') || name.includes('_nivel1');
});

console.log(`✅ Modelos nivel 1: ${nivel1.length}`);
console.log(`❌ Modelos eliminados: ${sources.length - nivel1.length}`);

// Generar nuevo sources.js
const newContent = `export default ${JSON.stringify(nivel1, null, 4)}`;

// Backup del original
const backupPath = sourcesPath + '.backup';
fs.copyFileSync(sourcesPath, backupPath);
console.log(`💾 Backup creado: ${backupPath}`);

// Escribir nuevo archivo
fs.writeFileSync(sourcesPath, newContent);

console.log('\n🎉 sources.js actualizado!');
console.log('   ✅ Solo carga nivel 1');
console.log('   📦 Para restaurar: cp sources.js.backup sources.js');
console.log('\n🔄 REINICIA EL SERVIDOR DE DESARROLLO (npm run dev)');
