# 🎮 Proyecto Final UCC – Juego 3D Educativo Multijugador

Juego 3D interactivo desarrollado con **React**, **Three.js**, **WebGL** y **MongoDB**. Sistema de 3 niveles con portales, enemigos inteligentes, sistema de autenticación JWT y modo multijugador en tiempo real.

## 👥 Integrantes del Proyecto

- **Desarrollador 1**: Gustavo Sánchez Rodríguez
- **Desarrollador 2**: [Nombre del segundo integrante]
- **Universidad**: Universidad Cooperativa de Colombia

---

## 📋 Descripción del Proyecto

Sistema de juego 3D con múltiples niveles donde el jugador debe recolectar monedas mientras evita enemigos. Incluye sistema de autenticación, guardado de puntuaciones y modo multijugador con WebSocket.

### ✨ Funcionalidades Implementadas

#### 1. 🎨 3 Niveles Diseñados en Blender (10 pts)
- ✅ **Nivel 1**: Escenario toycar1 con modelos 3D de Kenney.nl exportados como GLB
- ✅ **Nivel 2**: Escenario toycar2 con 46 modelos diferentes (polysurface + pcylinder)
- ✅ **Nivel 3**: Escenario toycar3 con arquitectura compleja
- ✅ Configuración dinámica mediante archivos JSON por nivel
- ✅ Posiciones aleatorizadas para mayor rejugabilidad

#### 2. 🌀 Sistema de Teletransporte/Portal (10 pts)
- ✅ Portal visual con efectos de partículas y luces
- ✅ Sonido espacial de activación del portal
- ✅ El portal se activa SOLO al recoger TODAS las monedas del nivel
- ✅ Animación procedural con shaders personalizados
- ✅ Al completar nivel 3, muestra puntaje total final

#### 3. 🎯 HUD Actualizado (5 pts)
- ✅ Indicador de nivel actual prominente ("🎮 Nivel: X")
- ✅ Contador de monedas recolectadas vs objetivo
- ✅ Temporizador de tiempo transcurrido
- ✅ Indicador de jugadores conectados
- ✅ Se actualiza dinámicamente al cambiar de nivel

#### 4. 💾 Lógica de Puntos desde Base de Datos (10 pts)
- ✅ Cantidad de monedas cargada dinámicamente desde MongoDB
- ✅ Sistema `coinGoal` variable por nivel
- ✅ API REST para obtener configuración de niveles
- ✅ No hay valores hardcodeados, todo es dinámico

#### 5. 👾 Personajes y Enemigos (20 pts)
- ✅ Personaje jugador con animaciones (caminar, correr, saltar, idle)
- ✅ Sistema de enemigos zombies con IA de persecución
- ✅ **Nivel 1**: 1 enemigo
- ✅ **Nivel 2**: 3 enemigos
- ✅ **Nivel 3**: 5 enemigos
- ✅ Mínimo 10 monedas por nivel configurables
- ✅ Sistema de teletransporte de enemigos cuando se quedan atascados

#### 6. 🪧 Carteles Visuales (5 pts)
- ✅ Componente Billboard para mostrar imágenes/carteles
- ✅ 4 carteles por nivel en posiciones estratégicas
- ✅ Billboarding automático (siempre miran a la cámara)
- ✅ Texturas personalizables por nivel

#### 7. 🔐 Sistema de Login JWT (10 pts)
- ✅ Pantalla de autenticación con login y registro
- ✅ Tokens JWT para autenticación segura
- ✅ Guardado de puntajes por usuario
- ✅ Modo offline para jugar sin backend
- ✅ Persistencia de sesión con localStorage

#### 8. 🚀 Publicación en Vercel (5 pts)
- ✅ Configuración `vercel.json` para SPA
- ✅ Variables de entorno configuradas
- ✅ JSON ajustado para funcionar sin backend
- ✅ Optimización de caché para assets y modelos

### 🎁 Características Adicionales

- 🎮 **Modo VR**: Soporte para dispositivos de realidad virtual
- 🌐 **Multijugador**: Sistema en tiempo real con Socket.io
- 🎵 **Audio Espacial**: Efectos de sonido 3D posicionales
- 📱 **Responsive**: Controles táctiles para móviles
- 🎨 **Efectos Visuales**: Partículas, shaders, post-procesamiento
- 🔧 **Debug Mode**: Panel de depuración con dat.GUI

---

## 🏗️ Estructura del Proyecto

```
FinalMultimedia/
├─ backend/                    # API REST + WebSocket + MongoDB
│  ├─ controllers/            # Controladores de la API
│  ├─ models/                 # Modelos de Mongoose
│  ├─ routes/                 # Rutas de Express
│  ├─ middleware/             # Autenticación JWT
│  ├─ data/                   # JSONs de configuración de niveles
│  └─ scripts/                # Scripts de inicialización DB
│
└─ game-project/              # Frontend 3D (React + Vite + Three.js)
   ├─ public/
   │  ├─ models/              # Modelos 3D GLB (toycar1, toycar2, toycar3)
   │  ├─ sounds/              # Efectos de sonido
   │  ├─ textures/            # Texturas y sprites
   │  └─ data/                # JSONs de bloques por nivel
   │
   ├─ src/
   │  ├─ Experience/          # Motor del juego Three.js
   │  │  ├─ World/            # Objetos del mundo (jugador, enemigos, etc.)
   │  │  └─ Utils/            # Utilidades (física, partículas, etc.)
   │  ├─ controls/            # Controles de usuario
   │  ├─ network/             # WebSocket y multiplayer
   │  └─ components/          # Componentes React
   │
   └─ vercel.json             # Configuración de despliegue
```

---

## ⚙️ Requisitos

- **Node.js** 18+ y npm
- **MongoDB** (local o Atlas)
- Navegador moderno con soporte WebGL 2

---

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/Luisceron0/FinalMultimedia.git
cd FinalMultimedia
```

### 2. Configurar Backend

```bash
cd backend
npm install
```

Crear archivo `.env` en la carpeta `backend`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/threejs_blocks
PORT=3001
JWT_SECRET=tu_secreto_jwt_super_seguro
```

Inicializar la base de datos:

```bash
node scripts/init_database.js
node scripts/init_level_configs.js
```

### 3. Configurar Frontend

```bash
cd ../game-project
npm install
```

Crear archivo `.env` en la carpeta `game-project`:

```env
VITE_API_URL=http://localhost:3001
VITE_ENEMIES_COUNT=1
```

---

## 🎮 Ejecución

### Modo Desarrollo (con Backend)

Abrir dos terminales:

**Terminal 1 - Backend:**
```bash
cd backend
npm start
# Servidor corriendo en http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd game-project
npm run dev
# Aplicación en http://localhost:5173
```

### Modo Offline (sin Backend)

```bash
cd game-project
npm run dev
```

El juego funcionará con datos locales desde los archivos JSON en `/public/data/`.

---

## 🌐 Despliegue en Vercel

### Frontend

1. Instalar Vercel CLI:
```bash
npm install -g vercel
```

2. Desplegar desde la carpeta `game-project`:
```bash
cd game-project
vercel
```

3. Configurar variables de entorno en Vercel:
   - `VITE_API_URL`: URL de tu backend
   - `VITE_ENEMIES_COUNT`: Número de enemigos inicial

### Backend

El backend puede desplegarse en:
- **Vercel** (serverless)
- **Railway** (contenedores)
- **Render** (servicios web)
- **Heroku** (plataforma cloud)

## 📚 Documentación de la API

### Endpoints REST

**Base URL**: `http://localhost:3001/api`

#### Autenticación

- `POST /api/auth/register` - Registrar nuevo usuario
  ```json
  {
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "password": "password123"
  }
  ```

- `POST /api/auth/login` - Iniciar sesión
  ```json
  {
    "email": "juan@example.com",
    "password": "password123"
  }
  ```

#### Bloques/Niveles

- `GET /api/blocks?level=1` - Obtener bloques por nivel
- `POST /api/blocks/batch` - Insertar múltiples bloques
- `GET /api/levelconfigs` - Obtener configuración de niveles

#### Puntuaciones

- `POST /api/scores` - Guardar puntuación (requiere autenticación)
  ```json
  {
    "score": 150,
    "level": 2
  }
  ```

### WebSocket (Multijugador)

**URL**: `http://localhost:3001`

Eventos principales:

- `new-player` → Registrar jugador
- `update-position` → Actualizar posición
- `coin-collected` → Sincronizar monedas
- `remove-player` → Desconexión

---

## 🎯 Controles del Juego

### 🖱️ Teclado y Mouse (PC)

- **W, A, S, D** - Movimiento
- **Espacio** - Saltar
- **Shift** - Correr
- **Mouse** - Mirar alrededor
- **ESC** - Menú

### 📱 Controles Táctiles (Móvil)

- **Joystick virtual** - Movimiento
- **Botón de salto** - Saltar
- **Deslizar pantalla** - Rotar cámara

### 🥽 Modo VR

- **Controles VR** - Movimiento con controladores
- **Botón menú** - Activar/desactivar VR

---

## 🎨 Tecnologías Utilizadas

### Frontend
- **React** 18 - Framework UI
- **Vite** - Build tool y dev server
- **Three.js** - Motor 3D WebGL
- **Cannon.js** - Motor de física
- **GSAP** - Animaciones
- **Socket.io Client** - Comunicación en tiempo real

### Backend
- **Node.js** - Runtime
- **Express** - Framework web
- **MongoDB** + **Mongoose** - Base de datos
- **JWT** - Autenticación
- **Socket.io** - WebSocket server
- **Bcrypt** - Encriptación de contraseñas

### DevOps
- **Vercel** - Hosting frontend
- **Git** - Control de versiones
- **ESLint** - Linter de código

---

## 🐛 Solución de Problemas

### El juego no carga los modelos 3D

- Verificar que los archivos GLB estén en `/public/models/`
- Revisar la consola del navegador para errores de carga
- Asegurar que el servidor está corriendo correctamente

### Los enemigos no aparecen

- Verificar variable de entorno `VITE_ENEMIES_COUNT`
- Revisar configuración de niveles en MongoDB
- Comprobar consola para errores de carga de Enemy.js

### Error de autenticación

- Verificar que el backend esté corriendo
- Comprobar la variable `VITE_API_URL`
- Limpiar localStorage del navegador

### Portal no aparece

- Asegurar que se han recolectado TODAS las monedas del nivel
- Verificar en consola los logs del sistema de portales
- Comprobar que `coinGoal` coincide con monedas disponibles

---

## 📝 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

---

## 👨‍💻 Contacto

- **Email**: guswillsan@gmail.com
- **Universidad**: Universidad Cooperativa de Colombia
- **Repositorio**: https://github.com/Luisceron0/FinalMultimedia

---

## 🙏 Créditos

- **Modelos 3D**: [Kenney.nl](https://kenney.nl)
- **Sonidos**: Freesound.org
- **Three.js**: Biblioteca de gráficos 3D
- **React Three Fiber**: Comunidad de desarrollo

---

**Desarrollado con ❤️ para el curso de Multimedia - UCC 2025**
const socket = io('http://localhost:3001')
```

---

### Datos y scripts útiles (backend)

- `backend/scripts/` → utilidades para generar/ sincronizar datos (`sync_blocks.js`, `generate_sources.js`, etc.).
- `backend/data/` → JSON de modelos y posiciones.
- `node seed.js` → carga de datos iniciales (opcional).

Consulta `backend/README.md` para detalles avanzados (niveles, exportación desde Blender, etc.).

---

### Frontend (game-project)

- Arranque: `npm run dev` (Vite). Ajusta `VITE_API_URL` si el backend corre en otra máquina/puerto.
- Tecnologías: React 19, Three.js, cannon-es, GSAP, Howler, Socket.io Client.

Estructura relevante:

```
game-project/
├─ public/            # assets (modelos, texturas, sonidos)
└─ src/
   ├─ Experience/     # Núcleo 3D (cámaras, mundo, física, recursos)
   ├─ loaders/        # Cargadores (p.ej., ToyCarLoader)
   ├─ network/        # SocketManager (cliente)
   └─ controls/       # Controles (móvil/teclado)
```

---

### Desarrollo simultáneo y puertos

- Backend: `3001`
- Frontend (Vite): `5173`

Si pruebas en red local, levanta Vite con `npm run dev -- --host` y usa `VITE_API_URL` apuntando a la IP LAN del backend, por ejemplo:

```env
VITE_API_URL=http://192.168.1.100:3001
```

---

### Solución de problemas

- Asegura que MongoDB esté corriendo y `MONGO_URI` sea accesible.
- Si el frontend no carga datos, verifica `VITE_API_URL` y la consola del navegador.
- CORS: el backend permite `origin: '*'` vía Socket.io y `cors()` en Express para desarrollo.

---

### Licencia y autoría

- Autor: Gustavo Willyn Sánchez Rodríguez — `guswillsan@gmail.com`
- Licencia: ISC (verifica archivos de licencia si aplica).


