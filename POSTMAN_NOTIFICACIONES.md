# Enviar Notificaciones Push desde Postman

Este documento explica cómo usar el endpoint para enviar notificaciones push a usuarios específicos desde Postman.

## Endpoint

```
POST http://localhost:3000/api/push/send
```

## Headers

```
Content-Type: application/json
```

## Body (JSON)

```json
{
  "userId": "ID_DEL_USUARIO",
  "title": "Título de la notificación",
  "body": "Cuerpo del mensaje de la notificación",
  "icon": "/icons/icon-192x192.png",
  "badge": "/icons/icon-96x96.png",
  "url": "/",
  "data": {
    "customField": "valor personalizado"
  }
}
```

## Campos Requeridos

- `userId` (string): ID del usuario al que se enviará la notificación
- `title` (string): Título de la notificación
- `body` (string): Cuerpo del mensaje

## Campos Opcionales

- `icon` (string): URL del icono de la notificación (default: `/icons/icon-192x192.png`)
- `badge` (string): URL del badge de la notificación (default: `/icons/icon-96x96.png`)
- `url` (string): URL a la que redirigir cuando se hace clic en la notificación (default: `/`)
- `data` (object): Datos adicionales personalizados

## Ejemplo Completo

```json
{
  "userId": "507f1f77bcf86cd799439011",
  "title": "Nueva Tarea Asignada",
  "body": "Tienes una nueva tarea pendiente por revisar",
  "icon": "/icons/icon-192x192.png",
  "badge": "/icons/icon-96x96.png",
  "url": "/tasks",
  "data": {
    "taskId": "12345",
    "priority": "high"
  }
}
```

## Respuesta Exitosa

```json
{
  "success": true,
  "message": "Notificación enviada exitosamente a 1 dispositivo(s)",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "username": "usuario123",
    "email": "usuario@ejemplo.com",
    "sent": 1,
    "failed": 0,
    "totalSubscriptions": 1,
    "payload": {
      "title": "Nueva Tarea Asignada",
      "body": "Tienes una nueva tarea pendiente por revisar",
      "icon": "/icons/icon-192x192.png",
      "badge": "/icons/icon-96x96.png",
      "data": {
        "url": "/tasks",
        "taskId": "12345",
        "priority": "high"
      },
      "timestamp": 1234567890123
    }
  }
}
```

## Respuestas de Error

### Usuario no encontrado
```json
{
  "success": false,
  "message": "Usuario no encontrado"
}
```

### Usuario sin suscripciones
```json
{
  "success": false,
  "message": "El usuario usuario123 (usuario@ejemplo.com) no tiene suscripciones push activas"
}
```

### Campos faltantes
```json
{
  "success": false,
  "message": "userId es requerido"
}
```

o

```json
{
  "success": false,
  "message": "title y body son requeridos"
}
```

## Cómo Obtener el userId

### Opción 1: Desde el Panel de Administrador
1. Inicia sesión como usuario "webos"
2. Accede al Panel de Administrador
3. Copia el ID del usuario de la tabla

### Opción 2: Desde la Base de Datos
Consulta directamente MongoDB para obtener el `_id` del usuario.

### Opción 3: Desde la Respuesta de Login/Register
El `id` del usuario se retorna en la respuesta de login o registro.

## Notas Importantes

1. **Suscripción Activa**: El usuario debe tener al menos una suscripción push activa. Si el usuario no se ha suscrito a las notificaciones desde la app, no recibirá la notificación.

2. **Múltiples Dispositivos**: Si el usuario tiene múltiples suscripciones (por ejemplo, desde diferentes dispositivos), la notificación se enviará a todas.

3. **Limpieza Automática**: Si una suscripción es inválida (410 Gone), se eliminará automáticamente de la base de datos.

4. **Notificaciones en el Dispositivo**: La notificación aparecerá en el dispositivo donde el usuario inició sesión y se suscribió a las notificaciones push.

## Testing

1. Asegúrate de que el servidor backend esté corriendo en `http://localhost:3000`
2. Asegúrate de que el usuario tenga una suscripción push activa (debe haberse suscrito desde la app)
3. Abre Postman
4. Crea una nueva petición POST
5. URL: `http://localhost:3000/api/push/send`
6. Headers: `Content-Type: application/json`
7. Body: Selecciona "raw" y "JSON", luego pega el JSON de ejemplo
8. Reemplaza `userId` con el ID real del usuario
9. Envía la petición
10. La notificación debería aparecer en el dispositivo del usuario

