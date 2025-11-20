# 🪧 Guía de Implementación de Carteles (Billboards)

## Estado Actual

✅ **Creado**: Componente `Billboard.js` en `/src/Experience/World/Billboard.js`

## ❌ Pendiente: Integrar Billboards en World.js

### Paso 1: Importar Billboard

En `World.js`, agregar al inicio del archivo:

```javascript
import Billboard from './Billboard.js';
```

### Paso 2: Inicializar Array de Billboards

En el constructor de World.js, agregar:

```javascript
this.billboards = [];
```

### Paso 3: Crear Billboards por Nivel

En la función `loadLevel(level)`, después de cargar los modelos, agregar:

```javascript
// Limpiar billboards anteriores
this.billboards.forEach(b => b.destroy());
this.billboards = [];

// Crear 4 billboards por nivel
const billboardPositions = this.getBillboardPositionsForLevel(level);
billboardPositions.forEach(pos => {
  const billboard = new Billboard({
    position: pos,
    imagePath: `/textures/sign_level${level}.png`,
    scale: 3,
    experience: this.experience
  });
  this.billboards.push(billboard);
});
```

### Paso 4: Agregar Método de Posiciones

```javascript
getBillboardPositionsForLevel(level) {
  const positions = {
    1: [
      { x: -20, y: 3, z: 15 },
      { x: 20, y: 3, z: 15 },
      { x: -15, y: 3, z: -20 },
      { x: 15, y: 3, z: -20 }
    ],
    2: [
      { x: -30, y: 3, z: 25 },
      { x: 30, y: 3, z: 25 },
      { x: -25, y: 3, z: -30 },
      { x: 25, y: 3, z: -30 }
    ],
    3: [
      { x: -40, y: 3, z: 35 },
      { x: 40, y: 3, z: 35 },
      { x: -35, y: 3, z: -40 },
      { x: 35, y: 3, z: -40 }
    ]
  };
  return positions[level] || positions[1];
}
```

### Paso 5: Actualizar Billboards en el Loop

En el método `update()` de World.js:

```javascript
// Actualizar billboards (para billboarding)
this.billboards.forEach(b => b.update());
```

### Paso 6: Limpiar al Destruir

En el método `destroy()` o `clearCurrentScene()`:

```javascript
// Limpiar billboards
this.billboards.forEach(b => b.destroy());
this.billboards = [];
```

## 🎨 Crear Imágenes para los Carteles

Necesitas crear 3 imágenes PNG y colocarlas en `/public/textures/`:

1. `sign_level1.png` - Cartel del Nivel 1
2. `sign_level2.png` - Cartel del Nivel 2
3. `sign_level3.png` - Cartel del Nivel 3

**Recomendaciones**:
- Tamaño: 512x512 o 1024x1024 px
- Formato: PNG con transparencia
- Contenido: Instrucciones, información del nivel, decoración, etc.

## ✅ Verificación

Para verificar que funciona:

1. Iniciar el juego
2. Deberías ver 4 carteles distribuidos en el nivel
3. Los carteles deben rotar para mirar siempre a la cámara
4. Al cambiar de nivel, los carteles deben actualizarse

## 📝 Código Completo para Referencia

Ubicación en World.js después de `_onResourcesReady()`:

```javascript
// En _onResourcesReady(), después de inicializar otros componentes
this.billboards = [];

// En loadLevel(level)
async loadLevel(level) {
  // ... código existente ...
  
  // Limpiar billboards del nivel anterior
  this.billboards.forEach(b => b?.destroy());
  this.billboards = [];
  
  // Crear nuevos billboards
  const billboardPositions = this.getBillboardPositionsForLevel(level);
  billboardPositions.forEach(pos => {
    const billboard = new Billboard({
      position: pos,
      imagePath: `/textures/sign_level${level}.png`,
      scale: 3,
      experience: this.experience
    });
    this.billboards.push(billboard);
  });
  
  // ... resto del código ...
}
```

## 🔧 Personalización

Puedes personalizar:

- **Tamaño**: Cambiar el parámetro `scale`
- **Posiciones**: Ajustar el array de `billboardPositions`
- **Imágenes**: Cambiar `imagePath` por tus propias texturas
- **Billboarding**: Desactivar con `billboard.enableBillboarding = false`

---

**Nota**: Las imágenes de ejemplo pueden crearse con cualquier herramienta de diseño (Photoshop, GIMP, Canva, etc.)
