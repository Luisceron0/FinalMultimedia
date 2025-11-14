const Block = require('../models/Block')
const fs = require('fs')
const path = require('path')

exports.getBlocks = async (req, res) => {
    try {
        const level = parseInt(req.query.level) || 1;
        const blocks = await Block.find({ level: level }).select('name x y z level role -_id');
        return res.json(blocks);
    } catch (error) {
        console.warn('⚠️ Error consultando MongoDB, usando fallback local:', error.message);
        try {
            const level = parseInt(req.query.level) || 1;
            const fileMap = {
                1: 'toy_car_blocks.json',
                2: 'toy_car_blocks2.json',
                3: 'toy_car_blocks3.json'
            };
            const fileName = fileMap[level] || 'toy_car_blocks.json';
            const filePath = path.join(__dirname, '..', 'data', fileName);
            const raw = fs.readFileSync(filePath, 'utf-8');
            const allBlocks = JSON.parse(raw);
            const filtered = allBlocks.filter(b => b.level === level || !b.level);
            return res.json(filtered.map(b => ({
                name: b.name,
                x: b.x,
                y: b.y,
                z: b.z,
                level: b.level || level,
                role: b.role || 'default'
            })));
        } catch (fallbackError) {
            console.error('❌ Fallback local también falló:', fallbackError);
            return res.status(500).json({ message: 'Error al obtener bloques (DB y fallback)', error, fallbackError });
        }
    }
};



// Agregar un nuevo bloque
exports.addBlock = async (req, res) => {
    try {
        const { name, x, y, z, level, role } = req.body;
        const newBlock = new Block({ name, x, y, z, level, role });
        await newBlock.save();
        res.status(201).json({ message: 'Bloque guardado', block: newBlock });
    } catch (error) {
        console.error('Error al agregar bloque:', error);
        res.status(500).json({ message: 'Error al agregar bloque', error });
    }
}


// Cargar lote desde JSON (para inicialización desde Blender)
exports.addMultipleBlocks = async (req, res) => {
    const blocks = req.body // array [{ x, y, z }, ...]
    await Block.insertMany(blocks)
    res.status(201).json({ message: 'Bloques guardados', count: blocks.length })
}
