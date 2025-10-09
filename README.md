# 🚀 PWA API Server

API Server para aplicación PWA con sincronización offline usando IndexedDB y MongoDB.

## 🎯 Características

- ✅ **CRUD completo de tareas**
- ✅ **Sincronización offline con IndexedDB**
- ✅ **Base de datos MongoDB con Mongoose**
- ✅ **Manejo de errores robusto**
- ✅ **CORS habilitado**
- ✅ **Logging de requests**
- ✅ **Estadísticas en tiempo real**

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Instalar dependencias de desarrollo
npm install --save-dev nodemon
```

## 🔧 Configuración

1. Crear archivo `.env` en la raíz del proyecto:
```env
URI=mongodb://localhost:27017/pwa-database
PORT=3000
NODE_ENV=development
```

2. Asegúrate de que MongoDB esté ejecutándose

## 🚀 Uso

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

## 📡 Endpoints de la API

### Tareas (`/api/tasks`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/tasks` | Obtener todas las tareas |
| GET | `/api/tasks/:id` | Obtener tarea por ID |
| GET | `/api/tasks/stats` | Estadísticas de tareas |
| POST | `/api/tasks` | Crear nueva tarea |
| POST | `/api/tasks/sync` | Sincronizar múltiples tareas |
| PUT | `/api/tasks/:id` | Actualizar tarea |
| PATCH | `/api/tasks/:id/toggle` | Toggle completar tarea |
| DELETE | `/api/tasks/:id` | Eliminar tarea |

### Sincronización (`/api/sync`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/sync/pending` | Sincronizar datos pendientes |
| GET | `/api/sync/pending` | Obtener datos pendientes |
| POST | `/api/sync/retry` | Reintentar datos fallidos |
| GET | `/api/sync/stats` | Estadísticas de sincronización |
| DELETE | `/api/sync/clean` | Limpiar datos antiguos |
| POST | `/api/sync/auto` | Sincronización automática |

### Utilidades

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/` | Información del servidor |
| GET | `/health` | Health check |

## 📊 Modelos de Datos

### Task
```javascript
{
  title: String,
  body: String,
  userId: Number,
  completed: Boolean,
  synced: Boolean,
  timestamp: Date,
  originalId: String,
  syncStatus: String,
  retryCount: Number,
  lastSyncAttempt: Date
}
```

### PendingData
```javascript
{
  url: String,
  method: String,
  endpoint: String,
  data: Mixed,
  status: String,
  retryCount: Number,
  maxRetries: Number,
  lastRetry: Date,
  error: String,
  syncedAt: Date,
  clientId: String,
  userAgent: String,
  ipAddress: String
}
```

## 🔄 Flujo de Sincronización

1. **Usuario offline** → Datos se guardan en IndexedDB
2. **Conexión restaurada** → Service Worker detecta conexión
3. **Sincronización automática** → Datos se envían a MongoDB
4. **Limpieza** → Datos sincronizados se eliminan de IndexedDB

## 🛠️ Ejemplos de Uso

### Crear tarea
```javascript
POST /api/tasks
{
  "title": "Mi tarea",
  "body": "Descripción de la tarea",
  "userId": 1
}
```

### Sincronizar datos pendientes
```javascript
POST /api/sync/pending
{
  "pendingData": [
    {
      "url": "http://localhost:3000/api/tasks",
      "method": "POST",
      "endpoint": "/tasks",
      "data": {
        "title": "Tarea offline",
        "body": "Creada sin conexión",
        "userId": 1
      },
      "id": "1234567890"
    }
  ]
}
```

### Obtener estadísticas
```javascript
GET /api/sync/stats
```

## 🧪 Testing

### Probar sincronización offline:
1. Desconectar internet
2. Crear tareas en la PWA
3. Reconectar internet
4. Verificar que las tareas se sincronicen automáticamente

### Verificar en MongoDB:
```javascript
// Conectar a MongoDB y verificar colecciones
use pwa-database
db.tasks.find()
db.pendingdata.find()
```

## 📝 Logs

El servidor registra automáticamente:
- Requests HTTP con duración
- Errores de base de datos
- Sincronizaciones exitosas/fallidas
- Estadísticas de rendimiento

## 🚨 Troubleshooting

### Error de conexión a MongoDB:
- Verificar que MongoDB esté ejecutándose
- Revisar la URI en el archivo `.env`
- Comprobar permisos de conexión

### Error de CORS:
- Verificar que el middleware CORS esté habilitado
- Comprobar headers en las peticiones

### Datos no se sincronizan:
- Verificar que el Service Worker esté activo
- Revisar logs del navegador
- Comprobar que la API esté accesible

## 📈 Monitoreo

### Health Check
```bash
curl http://localhost:3000/health
```

### Estadísticas
```bash
curl http://localhost:3000/api/sync/stats
```

## 🔧 Configuración Avanzada

### Variables de Entorno
```env
URI=mongodb://localhost:27017/pwa-database
PORT=3000
NODE_ENV=development
MAX_RETRIES=3
CLEANUP_DAYS=30
```

### Personalización de Middleware
- Modificar `middleware/errorHandler.js` para manejo de errores personalizado
- Ajustar límites de tamaño en `index.js`
- Configurar CORS específico por dominio
