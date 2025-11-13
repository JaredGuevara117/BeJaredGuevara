const express = require('express');
const router = express.Router();
const {
  subscribe,
  unsubscribe,
  getSubscriptions,
  sendNotificationToUser
} = require('../controllers/pushController');
const { authenticate } = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación
router.post('/subscribe', authenticate, subscribe);
router.post('/unsubscribe', authenticate, unsubscribe);
router.get('/subscriptions', authenticate, getSubscriptions);

// Endpoint para enviar notificación a un usuario específico
// Nota: Este endpoint puede ser usado sin autenticación para testing con Postman
// En producción, deberías agregar autenticación o verificación de admin
router.post('/send', sendNotificationToUser);

module.exports = router;

