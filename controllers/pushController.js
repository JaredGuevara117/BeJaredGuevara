const User = require('../models/User');
const webpush = require('web-push');

// Suscribir usuario a notificaciones push
const subscribe = async (req, res, next) => {
  try {
    const { subscription } = req.body;
    const userId = req.userId;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({
        success: false,
        message: 'Suscripción inválida'
      });
    }

    // Buscar usuario
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar si la suscripción ya existe
    const existingSubscription = user.pushSubscriptions.find(
      sub => sub.endpoint === subscription.endpoint
    );

    if (existingSubscription) {
      return res.json({
        success: true,
        message: 'Suscripción ya existe',
        data: { subscription: existingSubscription }
      });
    }

    // Agregar nueva suscripción
    user.pushSubscriptions.push({
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth
      }
    });

    await user.save();

    res.json({
      success: true,
      message: 'Suscripción guardada exitosamente',
      data: { 
        subscription: user.pushSubscriptions[user.pushSubscriptions.length - 1]
      }
    });
  } catch (error) {
    next(error);
  }
};

// Desuscribir usuario de notificaciones push
const unsubscribe = async (req, res, next) => {
  try {
    const { endpoint } = req.body;
    const userId = req.userId;

    if (!endpoint) {
      return res.status(400).json({
        success: false,
        message: 'Endpoint requerido'
      });
    }

    // Buscar usuario
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Eliminar suscripción
    user.pushSubscriptions = user.pushSubscriptions.filter(
      sub => sub.endpoint !== endpoint
    );

    await user.save();

    res.json({
      success: true,
      message: 'Desuscripción exitosa'
    });
  } catch (error) {
    next(error);
  }
};

// Obtener suscripciones del usuario
const getSubscriptions = async (req, res, next) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).select('pushSubscriptions');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        subscriptions: user.pushSubscriptions
      }
    });
  } catch (error) {
    next(error);
  }
};

// Enviar notificación push a un usuario (función auxiliar)
const sendPushNotification = async (userId, payload) => {
  try {
    const user = await User.findById(userId).select('pushSubscriptions');
    if (!user || !user.pushSubscriptions || user.pushSubscriptions.length === 0) {
      console.log(`Usuario ${userId} no tiene suscripciones push`);
      return { sent: 0, failed: 0 };
    }

    let sent = 0;
    let failed = 0;
    const subscriptionsToRemove = [];

    for (const subscription of user.pushSubscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.keys.p256dh,
              auth: subscription.keys.auth
            }
          },
          JSON.stringify(payload)
        );
        sent++;
      } catch (error) {
        console.error('Error enviando notificación push:', error);
        // Si la suscripción es inválida (410 Gone), marcarla para eliminar
        if (error.statusCode === 410) {
          subscriptionsToRemove.push(subscription.endpoint);
        }
        failed++;
      }
    }

    // Eliminar suscripciones inválidas
    if (subscriptionsToRemove.length > 0) {
      user.pushSubscriptions = user.pushSubscriptions.filter(
        sub => !subscriptionsToRemove.includes(sub.endpoint)
      );
      await user.save();
    }

    return { sent, failed };
  } catch (error) {
    console.error('Error en sendPushNotification:', error);
    throw error;
  }
};

// Endpoint para enviar notificación push a un usuario específico
const sendNotificationToUser = async (req, res, next) => {
  try {
    const { userId, title, body, icon, badge, data, url } = req.body;

    // Validar campos requeridos
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId es requerido'
      });
    }

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        message: 'title y body son requeridos'
      });
    }

    // Buscar usuario
    const user = await User.findById(userId).select('username email pushSubscriptions');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar que el usuario tenga suscripciones activas
    if (!user.pushSubscriptions || user.pushSubscriptions.length === 0) {
      return res.status(400).json({
        success: false,
        message: `El usuario ${user.username} (${user.email}) no tiene suscripciones push activas`
      });
    }

    // Preparar payload de la notificación
    const payload = {
      title: title,
      body: body,
      icon: icon || '/icons/icon-192x192.png',
      badge: badge || '/icons/icon-96x96.png',
      data: {
        url: url || '/',
        ...data
      },
      timestamp: Date.now()
    };

    console.log(`Enviando notificación a usuario ${user.username} (${user.email})`);
    console.log(`Suscripciones activas: ${user.pushSubscriptions.length}`);

    // Enviar notificación
    const result = await sendPushNotification(userId, payload);

    if (result.sent === 0 && result.failed > 0) {
      return res.status(500).json({
        success: false,
        message: 'No se pudo enviar la notificación a ninguna suscripción',
        data: {
          userId: userId,
          username: user.username,
          email: user.email,
          sent: result.sent,
          failed: result.failed
        }
      });
    }

    res.json({
      success: true,
      message: `Notificación enviada exitosamente a ${result.sent} dispositivo(s)`,
      data: {
        userId: userId,
        username: user.username,
        email: user.email,
        sent: result.sent,
        failed: result.failed,
        totalSubscriptions: user.pushSubscriptions.length,
        payload: payload
      }
    });
  } catch (error) {
    console.error('Error en sendNotificationToUser:', error);
    next(error);
  }
};

module.exports = {
  subscribe,
  unsubscribe,
  getSubscriptions,
  sendPushNotification,
  sendNotificationToUser
};

