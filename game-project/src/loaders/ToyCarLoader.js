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
    }

    _applyTextureToMeshes(root, imagePath, matcher, options = {}) {
        const matchedMeshes = [];
        root.traverse((child) => {
            if (child.isMesh && (!matcher || matcher(child))) {
                matchedMeshes.push(child);
            }
        });
        if (matchedMeshes.length === 0) {
            return;
        }
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(
            imagePath,
            (texture) => {
                if ('colorSpace' in texture) {
                    texture.colorSpace = THREE.SRGBColorSpace;
                } else {
                    texture.encoding = THREE.sRGBEncoding;
                }
                texture.flipY = false;
                const wrapS = options.wrapS || THREE.ClampToEdgeWrapping;
                const wrapT = options.wrapT || THREE.ClampToEdgeWrapping;
                texture.wrapS = wrapS;
                texture.wrapT = wrapT;
                const maxAniso = this.experience?.renderer?.instance?.capabilities?.getMaxAnisotropy?.();
                if (typeof maxAniso === 'number' && maxAniso > 0) {
                    texture.anisotropy = maxAniso;
                }
                const center = options.center || { x: 0.5, y: 0.5 };
                texture.center.set(center.x, center.y);
                if (typeof options.rotation === 'number') {
                    texture.rotation = options.rotation;
                }
                if (options.repeat) {
                    texture.repeat.set(options.repeat.x || 1, options.repeat.y || 1);
                }
                if (options.mirrorX) {
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.repeat.x = -Math.abs(texture.repeat.x || 1);
                    texture.offset.x = 1;
                }
                if (options.mirrorY) {
                    texture.wrapT = THREE.RepeatWrapping;
                    texture.repeat.y = -Math.abs(texture.repeat.y || 1);
                    texture.offset.y = 1;
                }
                if (options.offset) {
                    texture.offset.set(
                        options.offset.x ?? texture.offset.x,
                        options.offset.y ?? texture.offset.y
                    );
                }
                texture.needsUpdate = true;

                let applied = 0;
                matchedMeshes.forEach((child) => {
                    if (Array.isArray(child.material)) {
                        child.material.forEach((mat) => {
                            mat.map = texture;
                            mat.needsUpdate = true;
                        });
                    } else if (child.material) {
                        child.material.map = texture;
                        child.material.needsUpdate = true;
                    } else {
                        child.material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
                    }
                    applied++;
                });

                if (applied === 0) {
                    // console.debug(`Sin meshes para aplicar textura: ${imagePath}`);
                } else {
                    console.log(`🖼️ Textura aplicada (${imagePath}) a ${applied} mesh(es)`);
                }
            },
            undefined,
            (err) => {
                console.error('❌ Error cargando textura', imagePath, err);
            }
        );
    }

    async loadFromAPI() {
        try {
            const listRes = await fetch('/config/precisePhysicsModels.json');
            const precisePhysicsModels = await listRes.json();
            let blocks = [];
            try {
                const apiUrl = import.meta.env.VITE_API_URL + '/api/blocks';
                const res = await fetch(apiUrl);
                if (!res.ok) throw new Error('Conexión fallida');
                blocks = await res.json();
                console.log('Datos cargados desde la API:', blocks.length);
            } catch (apiError) {
                console.warn('No se pudo conectar con la API. Cargando desde archivo local...');
                const localRes = await fetch('/data/toy_car_blocks.json');
                const allBlocks = await localRes.json();
                blocks = allBlocks.filter(b => b.level === 1);
E-              console.log(`Datos cargados desde archivo local (nivel 1): ${blocks.length}`);
            }
            this._processBlocks(blocks, precisePhysicsModels);
        } catch (err) {
            console.error('Error al cargar bloques o lista Trimesh:', err);
        }
    }

    async loadFromURL(apiUrl) {
        try {
            const listRes = await fetch('/config/precisePhysicsModels.json');
            const precisePhysicsModels = await listRes.json();
            const res = await fetch(apiUrl);
            if (!res.ok) throw new Error('Conexión fallida al cargar bloques de nivel.');
            const blocks = await res.json();
            console.log(`📦 Bloques cargados (${blocks.length}) desde ${apiUrl}`);
            this._processBlocks(blocks, precisePhysicsModels);
        } catch (err) {
            console.error('Error al cargar bloques desde URL:', err);
        }
    }

    _processBlocks(blocks, precisePhysicsModels) {
        blocks.forEach(block => {
            if (!block.name) {
                console.warn('Bloque sin nombre:', block);
                return;
            }

            const resourceKey = block.name;
            const glb = this.resources.items[resourceKey];

            if (!glb) {
                console.warn(`Modelo no encontrado: ${resourceKey}`);
                return;
            }

		const model = glb.scene.clone();
		model.userData.levelObject = true;

		// 📏 ESCALAR NIVEL 1 x20 para que coincida mejor con el tamaño del robot
		const levelScale = (block.level === 1) ? 20 : 1;
		if (levelScale !== 1) {
			model.scale.set(levelScale, levelScale, levelScale);
			// Escalar también la posición del modelo
			model.position.set(
				block.x * levelScale,
				block.y * levelScale,
				block.z * levelScale
			);
		} else {
			model.position.set(block.x, block.y, block.z);
		}

		// Eliminar cámaras y luces embebidas
		model.traverse((child) => {
			if (child.isCamera || child.isLight) {
				child.parent.remove(child);
			}
		});            // (Lógica de texturas y 'baked' se queda igual)
            this._applyTextureToMeshes(
                model,
                '/textures/ima1.jpg',
                (child) => child.name === 'Cylinder001' || (child.name && child.name.toLowerCase().includes('cylinder')),
                { rotation: -Math.PI / 2, center: { x: 0.5, y: 0.5 }, mirrorX: true }
            );
            if (block.name.includes('baked')) {
                const bakedTexture = new THREE.TextureLoader().load('/textures/baked.jpg');
                bakedTexture.flipY = false;
                if ('colorSpace' in bakedTexture) {
                    bakedTexture.colorSpace = THREE.SRGBColorSpace;
                } else {
                    bakedTexture.encoding = THREE.sRGBEncoding;
                }
                model.traverse(child => {
                   if (child.isMesh) {
                        child.material = new THREE.MeshBasicMaterial({ map: bakedTexture });
                        child.material.needsUpdate = true;
                        if (child.name.toLowerCase().includes('portal')) {
                            this.experience.time.on('tick', () => {
                                child.rotation.y += 0.01;
                            });
                        }
                    }
                });
            }
            // --- FIN LÓGICA 'baked' ---


            // Si es un premio (coin)
            if (block.name.startsWith('coin')) {
                const prize = new Prize({
                    model, 
                    position: new THREE.Vector3(block.x * ((block.level === 1) ? 20 : 1), block.y * ((block.level === 1) ? 20 : 1), block.z * ((block.level === 1) ? 20 : 1)),
                    scene: this.scene,
                    role: block.role || "default",
                    robotRef: this.robotRef 
                });
                prize.model.userData.levelObject = true;
             this.prizes.push(prize);
                return; // <-- Salir para no crear física estática
            }


            // ❌ Cofres removidos - solo monedas en los 3 niveles
            // Los cofres ya no se usan en el juego


            // Si NO es 'coin', entonces es un bloque estático
            this.scene.add(model);            // Físicas (Solo para bloques estáticos)
            let shape;
            let position = new THREE.Vector3();

            if (precisePhysicsModels.includes(block.name)) {
                shape = createTrimeshShapeFromModel(model);
                if (!shape) {
                    console.warn(`No se pudo crear Trimesh para ${block.name}`);
                    return;
                }
                position.set(0, 0, 0);
            } else {
                shape = createBoxShapeFromModel(model, 0.9);
                const bbox = new THREE.Box3().setFromObject(model);
                const center = new THREE.Vector3();
                const size = new THREE.Vector3();
          bbox.getCenter(center);
                bbox.getSize(size);
                center.y -= size.y / 2;
                position.copy(center);
            }

            // 📦 Escalar físicas para nivel 1 (modelos escalados x20)
            const physicsScale = (block.level === 1) ? 20 : 1;
            if (physicsScale !== 1 && shape) {
                // Escalar la forma de colisión
                if (shape.halfExtents) {
                    shape.halfExtents.x *= physicsScale;
                    shape.halfExtents.y *= physicsScale;
                    shape.halfExtents.z *= physicsScale;
                }
                // Escalar posición
                position.multiplyScalar(physicsScale);
            }

            const body = new CANNON.Body({
               mass: 0,
                shape: shape,
                position: new CANNON.Vec3(position.x, position.y, position.z),
               material: this.physics.obstacleMaterial
            });            body.userData = { levelObject: true };
            model.userData.physicsBody = body;
            body.userData.linkedModel = model;
            this.physics.world.addBody(body);
     });
    }
}


