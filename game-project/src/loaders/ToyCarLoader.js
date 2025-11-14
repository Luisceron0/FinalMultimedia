import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { createBoxShapeFromModel, createTrimeshShapeFromModel } from '../Experience/Utils/PhysicsShapeFactory.js';
import Prize from '../Experience/World/Prize.js';

export default class ToyCarLoader {
    constructor(experience, { onChestCollect, robotRef } = {}) {
        this.experience = experience;
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.physics = this.experience.physics;
        this.prizes = [];
        this.onChestCollect = onChestCollect;
        this.robotRef = robotRef;
        this._missingModelsLog = [];
    }

    /**
     * Aplica una textura a los meshes que cumplan el matcher.
     * options: { rotation, center:{x,y}, mirrorX }
     */
    _applyTextureToMeshes(root, imagePath, matcher, options = {}) {
        const matchedMeshes = [];
        const tex = new THREE.TextureLoader().load(imagePath);
        if ('colorSpace' in tex) tex.colorSpace = THREE.SRGBColorSpace; else tex.encoding = THREE.sRGBEncoding;
        tex.flipY = false;
        root.traverse(child => {
            if (child.isMesh && (!matcher || matcher(child))) {
                matchedMeshes.push(child);
                child.material = new THREE.MeshBasicMaterial({ map: tex });
                if (options.rotation || options.center || options.mirrorX) {
                    child.material.map.center.set(options.center?.x || 0.5, options.center?.y || 0.5);
                    child.material.map.rotation = options.rotation || 0;
                    if (options.mirrorX) child.material.map.repeat.x = -1;
                    child.material.map.needsUpdate = true;
                }
            }
        });
        return matchedMeshes;
    }

    /**
     * Carga bloques desde la API (o fallback local) para un nivel.
     */
    async loadFromAPI(level = 1) {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
        const apiUrl = `${backendUrl}/api/blocks?level=${level}`;
        let data;
        try {
            const res = await fetch(apiUrl);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const ct = res.headers.get('content-type') || '';
            if (!ct.includes('application/json')) throw new Error('Respuesta no JSON');
            data = await res.json();
            if (!data.blocks || data.blocks.length === 0) throw new Error('API vacía');
        } catch (e) {
            console.warn(`ToyCarLoader.loadFromAPI: fallo API (${e.message}) -> fallback local`);
            const publicPath = (p) => {
                const base = import.meta.env.BASE_URL || '/';
                return `${base.replace(/\/$/, '')}/${p.replace(/^\//, '')}`;
            };
            const localUrl = publicPath('data/toy_car_blocks.json');
            const localRes = await fetch(localUrl);
            if (!localRes.ok) throw new Error(`Fallback local también falló (${localRes.status})`);
            const allBlocks = await localRes.json();
            const filtered = allBlocks.filter(b => b.level == level);
            data = { blocks: filtered, spawnPoint: filtered.find(b => b.role === 'spawnPoint') };
        }

        // Precise physics models
        let preciseModels = [];
        try {
            const publicPath = (p) => {
                const base = import.meta.env.BASE_URL || '/';
                return `${base.replace(/\/$/, '')}/${p.replace(/^\//, '')}`;
            };
            const preciseUrl = publicPath('config/precisePhysicsModels.json');
            const r = await fetch(preciseUrl);
            if (r.ok) preciseModels = await r.json();
        } catch (e) {
            console.warn('No se pudo cargar precisePhysicsModels.json', e);
        }

        this._processBlocks(data.blocks || [], preciseModels);
        return data;
    }

    /**
     * Busca un modelo en resources por nombre exacto o coincidencia parcial
     */
    _findModel(blockName) {
        // Intento 1: Búsqueda exacta
        if (this.resources?.items?.[blockName]) {
            return this.resources.items[blockName];
        }

        // Intento 2: Buscar cualquier modelo que contenga el nombre base sin sufijo de nivel
        const baseName = blockName.replace(/_lev\d+$/, ''); // Quitar _lev1, _lev2, _lev3
        
        for (const key in this.resources.items) {
            // Coincidir si el key contiene el nombre base
            if (key.includes(baseName) && key.includes(blockName.match(/_lev\d+$/)?.[0] || '')) {
                return this.resources.items[key];
            }
        }

        // Intento 3: Buscar solo por sufijo de nivel
        const levelSuffix = blockName.match(/_lev\d+$/)?.[0];
        if (levelSuffix) {
            for (const key in this.resources.items) {
                if (key.endsWith(`${baseName}${levelSuffix}`) || key.includes(baseName)) {
                    return this.resources.items[key];
                }
            }
        }

        return null;
    }

    /**
     * Procesa bloques: clona modelos, aplica escala, crea físicas y premios.
     */
    _processBlocks(blocks, precisePhysicsModels = []) {
        blocks.forEach(block => {
            if (!block?.name) { console.warn('Bloque sin nombre:', block); return; }
            const glb = this._findModel(block.name);
            if (!glb) { console.warn(`Modelo no encontrado: ${block.name}`); this._missingModelsLog.push(block.name); return; }

            const model = glb.scene.clone();
            model.userData.levelObject = true;

            // Escala por nivel (solo nivel 1 *20)
            const levelScale = (block.level === 1) ? 20 : 1;
            model.scale.set(levelScale, levelScale, levelScale);
            model.position.set(block.x * levelScale, block.y * levelScale, block.z * levelScale);

            // Eliminar cámaras / luces internas
            model.traverse(child => { if (child.isCamera || child.isLight) child.parent?.remove(child); });

            // Texturas especiales (cylinder)
            this._applyTextureToMeshes(
                model,
                '/textures/ima1.jpg',
                (child) => child.name === 'Cylinder001' || (child.name && child.name.toLowerCase().includes('cylinder')),
                { rotation: -Math.PI / 2, center: { x: 0.5, y: 0.5 }, mirrorX: true }
            );

            // Baked portal
            if (block.name.includes('baked')) {
                const bakedTexture = new THREE.TextureLoader().load('/textures/baked.jpg');
                bakedTexture.flipY = false;
                if ('colorSpace' in bakedTexture) bakedTexture.colorSpace = THREE.SRGBColorSpace; else bakedTexture.encoding = THREE.sRGBEncoding;
                model.traverse(child => {
                    if (child.isMesh) {
                        child.material = new THREE.MeshBasicMaterial({ map: bakedTexture });
                        child.material.needsUpdate = true;
                        if (child.name.toLowerCase().includes('portal')) {
                            this.experience.time.on('tick', () => { child.rotation.y += 0.01; });
                        }
                    }
                });
            }

            // Premio (coin)
            if (block.name.startsWith('coin')) {
                const prize = new Prize({
                    model,
                    position: new THREE.Vector3(model.position.x, model.position.y, model.position.z),
                    scene: this.scene,
                    role: block.role || 'default',
                    robotRef: this.robotRef
                });
                prize.model.userData.levelObject = true;
                this.prizes.push(prize);
                return; // no física estática
            }

            // Bloque estático
            this.scene.add(model);
            let shape;
            let position = new THREE.Vector3();

            if (precisePhysicsModels.includes(block.name)) {
                shape = createTrimeshShapeFromModel(model);
                if (!shape) console.warn(`No se pudo crear Trimesh para ${block.name}, usando BoxShape fallback.`);
                position.set(0, 0, 0);
            }
            if (!shape) {
                shape = createBoxShapeFromModel(model, 0.9);
                const bbox = new THREE.Box3().setFromObject(model);
                const center = new THREE.Vector3();
                const size = new THREE.Vector3();
                bbox.getCenter(center);
                bbox.getSize(size);
                center.y -= size.y / 2; // apoyar en el suelo
                position.copy(center);
            }

            const body = new CANNON.Body({
                mass: 0,
                shape,
                position: new CANNON.Vec3(position.x, position.y, position.z),
                material: this.physics.obstacleMaterial
            });
            body.userData = { levelObject: true };
            model.userData.physicsBody = body;
            body.userData.linkedModel = model;
            this.physics.world.addBody(body);
        });

        // Resumen modelos faltantes (únicos)
        if (this._missingModelsLog.length) {
            const unique = [...new Set(this._missingModelsLog)];
            console.warn(`⚠️ Modelos faltantes (${unique.length}):`, unique.slice(0, 25), unique.length > 25 ? `... (+${unique.length - 25} más)` : '');
        } else {
            console.log('✅ Todos los modelos solicitados presentes en resources.');
        }
    }
}


