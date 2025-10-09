const express = require('express');
const router = express.Router();

// Usar siempre los controladores de MongoDB (conexión obligatoria)
const {
  syncPendingData,
  getPendingData,
  retryFailedData,
  getSyncStats,
  cleanOldData,
  processAutoSync
} = require('../controllers/syncController');

// Rutas para sincronización
router.post('/pending', syncPendingData); // Sincronizar datos pendientes desde IndexedDB
router.get('/pending', getPendingData); // Obtener datos pendientes
router.post('/retry', retryFailedData); // Reintentar datos fallidos
router.get('/stats', getSyncStats); // Estadísticas de sincronización
router.delete('/clean', cleanOldData); // Limpiar datos antiguos
router.post('/auto', processAutoSync); // Sincronización automática

module.exports = router;
