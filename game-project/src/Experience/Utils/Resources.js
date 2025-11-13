import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import EventEmitter from './EventEmitter.js'

export default class Resources extends EventEmitter {
    constructor(sources) {
        super()

        this.sources = sources
        this.items = {}
        this.toLoad = this.sources.length
        this.loaded = 0
        this.failed = 0

        // 🚀 Configuración de carga por lotes
        this.batchSize = 10 // Cargar máximo 10 modelos simultáneos
        this.currentBatch = 0
        this.queue = [...this.sources]

        this.setLoaders()
        this.startLoading()
    }

    setLoaders() {
        this.loaders = {}
        this.loaders.gltfLoader = new GLTFLoader()
        this.loaders.textureLoader = new THREE.TextureLoader()
        this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader()
    }

    startLoading() {
        console.log(`🎮 Iniciando carga de ${this.toLoad} recursos en lotes de ${this.batchSize}`);
        this.loadNextBatch()
    }

    loadNextBatch() {
        const batch = this.queue.splice(0, this.batchSize)
        
        if (batch.length === 0) {
            return // No hay más por cargar
        }

        this.currentBatch++
        console.log(`📦 Lote ${this.currentBatch}: cargando ${batch.length} recursos...`);

        batch.forEach(source => {
            if (source.type === 'gltfModel') {
                this.loaders.gltfLoader.load(
                    source.path,
                    (file) => {
                        this.sourceLoaded(source, file)
                    },
                    undefined,
                    (error) => {
                        console.error(`❌ Error al cargar modelo ${source.name} desde ${source.path}`)
                        this.sourceFailed(source, error)
                    }
                )
            } else if (source.type === 'texture') {
                this.loaders.textureLoader.load(
                    source.path,
                    (file) => {
                        this.sourceLoaded(source, file)
                    },
                    undefined,
                    (error) => {
                        console.error(`❌ Error al cargar textura ${source.name} desde ${source.path}`)
                        this.sourceFailed(source, error)
                    }
                )
            } else if (source.type === 'cubeTexture') {
                this.loaders.cubeTextureLoader.load(
                    source.path,
                    (file) => {
                        this.sourceLoaded(source, file)
                    },
                    undefined,
                    (error) => {
                        console.error(`❌ Error al cargar cubemap ${source.name} desde ${source.path}`)
                        this.sourceFailed(source, error)
                    }
                )
            }
        })
    }

    sourceFailed(source, error) {
        this.failed++
        this.loaded++ // Contar como "procesado" para avanzar

        const percent = Math.floor((this.loaded / this.toLoad) * 100)
        window.dispatchEvent(new CustomEvent('resource-progress', { detail: percent }))

        if (this.loaded === this.toLoad) {
            console.log(`⚠️  Carga completada: ${this.loaded - this.failed} éxitos, ${this.failed} fallos`);
            window.dispatchEvent(new CustomEvent('resource-complete'))
            this.trigger('ready')
        } else if (this.loaded % this.batchSize === 0) {
            // Cuando termina un lote, cargar el siguiente
            this.loadNextBatch()
        }
    }

    sourceLoaded(source, file) {
        this.items[source.name] = file
        this.loaded++

        const percent = Math.floor((this.loaded / this.toLoad) * 100)
        window.dispatchEvent(new CustomEvent('resource-progress', { detail: percent }))

        if (this.loaded === this.toLoad) {
            console.log(`✅ Carga completada: ${this.loaded - this.failed}/${this.toLoad} recursos cargados`);
            window.dispatchEvent(new CustomEvent('resource-complete'))
            this.trigger('ready')
        } else if (this.loaded % this.batchSize === 0) {
            // Cuando termina un lote, cargar el siguiente
            this.loadNextBatch()
        }
    }
}
