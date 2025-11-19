const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../data/toy_car_blocks2.json');
const blocks = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

console.log(`📦 Total de bloques en nivel 2: ${blocks.length}`);

// Distribuir bloques en una cuadrícula
const gridSize = Math.ceil(Math.sqrt(blocks.length));
const spacing = 2; // Espaciado entre bloques

blocks.forEach((block, index) => {
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    
    block.x = (col - gridSize / 2) * spacing;
    block.y = 0.5; // Altura base
    block.z = (row - gridSize / 2) * spacing;
});

// Guardar el archivo actualizado
fs.writeFileSync(jsonPath, JSON.stringify(blocks, null, 4), 'utf-8');

console.log(`✅ Archivo actualizado con nuevas posiciones`);
console.log(`   Distribución: ${gridSize}x${gridSize} cuadrícula`);
console.log(`   Espaciado: ${spacing} unidades`);
