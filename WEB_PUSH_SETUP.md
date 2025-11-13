# Configuración de Web Push Notifications

Este documento explica cómo configurar las notificaciones push web en la aplicación.

## Requisitos Previos

1. Tener las VAPID keys (pública y privada) generadas
2. Node.js y npm instalados
3. MongoDB configurado

## Configuración del Backend

### 1. Agregar Variables de Entorno

Agrega las siguientes variables a tu archivo `.env` en el directorio `BeJaredGuevara-main`:

```env
VAPID_PUBLIC_KEY=tu_vapid_public_key_aqui
VAPID_PRIVATE_KEY=tu_vapid_private_key_aqui
VAPID_EMAIL=mailto:tu-email@ejemplo.com
```

**Importante:**
- `VAPID_PUBLIC_KEY`: Tu clave pública VAPID (base64)
- `VAPID_PRIVATE_KEY`: Tu clave privada VAPID (base64)
- `VAPID_EMAIL`: Tu email o un URI mailto (ej: `mailto:admin@tudominio.com`)

### 2. Verificar Instalación

El backend ya tiene configurado `web-push` en `package.json`. Si necesitas instalarlo:

```bash
cd BeJaredGuevara-main
npm install
```

### 3. Endpoints Disponibles

Una vez configurado, los siguientes endpoints estarán disponibles:

- `POST /api/push/subscribe` - Suscribir usuario a notificaciones push
- `POST /api/push/unsubscribe` - Desuscribir usuario
- `GET /api/push/subscriptions` - Obtener suscripciones del usuario

## Configuración del Frontend

### 1. Configurar VAPID Public Key

Edita el archivo `feJaredGuevara-main/src/config.js` y reemplaza `TU_VAPID_PUBLIC_KEY_AQUI` con tu clave pública VAPID:

```javascript
export const VAPID_PUBLIC_KEY = 'tu_vapid_public_key_aqui';
```

**Nota:** Esta debe ser la misma clave pública que configuraste en el backend.

## Funcionamiento

### Flujo Automático

1. Cuando el usuario se autentica, el Service Worker envía un mensaje solicitando permisos
2. Si el usuario no ha otorgado permisos, se solicita automáticamente
3. Una vez otorgados los permisos, se crea la suscripción push
4. La suscripción se envía automáticamente al servidor y se guarda en la base de datos

### Enviar Notificaciones Push

Para enviar notificaciones push a un usuario, usa la función `sendPushNotification` del controlador:

```javascript
const { sendPushNotification } = require('./controllers/pushController');

// Enviar notificación a un usuario
await sendPushNotification(userId, {
  title: 'Título de la notificación',
  body: 'Cuerpo de la notificación',
  icon: '/icons/icon-192x192.png',
  badge: '/icons/icon-96x96.png',
  data: {
    url: '/ruta-donde-redirigir'
  }
});
```

## Generar VAPID Keys

Si aún no tienes las VAPID keys, puedes generarlas usando `web-push`:

```bash
npm install -g web-push
web-push generate-vapid-keys
```

Esto generará un par de keys que debes usar en tu configuración.

## Solución de Problemas

### El Service Worker no solicita permisos

- Verifica que el Service Worker esté registrado correctamente
- Asegúrate de que el usuario esté autenticado
- Revisa la consola del navegador para errores

### Error al suscribirse

- Verifica que la VAPID public key esté correctamente configurada en `config.js`
- Asegúrate de que las keys del backend y frontend coincidan
- Verifica que el backend tenga las VAPID keys configuradas en el `.env`

### Notificaciones no se reciben

- Verifica que el usuario tenga permisos de notificación otorgados
- Revisa que la suscripción esté guardada en la base de datos
- Verifica que el Service Worker esté activo y registrado

