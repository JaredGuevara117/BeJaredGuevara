const PendingData = require('../models/PendingData');
const Task = require('../models/Task');

// Sincronizar datos pendientes desde IndexedDB
const syncPendingData = async (req, res) => {
  try {
    const { pendingData } = req.body;
    
    if (!Array.isArray(pendingData) || pendingData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un array de datos pendientes'
      });
    }
    
    const results = [];
    const errors = [];
    
    for (const data of pendingData) {
      try {
        // Guardar en PendingData para tracking
        const pendingRecord = new PendingData({
          url: data.url,
          method: data.method,
          endpoint: data.endpoint,
          data: data.data,
          clientId: data.id || Date.now().toString(),
          userAgent: req.get('User-Agent'),
          ipAddress: req.ip || req.connection.remoteAddress
        });
        
        await pendingRecord.save();
        
        // Procesar según el tipo de endpoint
        if (data.endpoint === '/posts' || data.endpoint === '/tasks') {
          const { title, body, userId = 1 } = data.data;
          
          const task = new Task({
            title,
            body,
            userId: parseInt(userId),
            originalId: data.id?.toString(),
            syncStatus: 'synced'
          });
          
          const savedTask = await task.save();
          
          // Marcar como sincronizado
          await pendingRecord.markAsSynced();
          
          results.push({
            originalId: data.id,
            taskId: savedTask._id,
            status: 'synced'
          });
        } else {
          // Para otros endpoints, solo guardar el registro
          await pendingRecord.markAsSynced();
          results.push({
            originalId: data.id,
            status: 'synced'
          });
        }
        
      } catch (error) {
        console.error('Error procesando dato pendiente:', error);
        
        // Marcar como fallido
        try {
          const pendingRecord = new PendingData({
            url: data.url,
            method: data.method,
            endpoint: data.endpoint,
            data: data.data,
            clientId: data.id || Date.now().toString(),
            userAgent: req.get('User-Agent'),
            ipAddress: req.ip || req.connection.remoteAddress
          });
          
          await pendingRecord.markAsFailed(error.message);
        } catch (dbError) {
          console.error('Error guardando fallo:', dbError);
        }
        
        errors.push({
          originalId: data.id,
          error: error.message
        });
      }
    }
    
    res.json({
      success: true,
      message: `Procesados ${results.length} elementos`,
      data: {
        synced: results,
        errors: errors
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sincronizando datos pendientes',
      error: error.message
    });
  }
};

// Obtener datos pendientes
const getPendingData = async (req, res) => {
  try {
    const { status = 'pending', limit = 50, offset = 0 } = req.query;
    
    let query = {};
    if (status !== 'all') {
      query.status = status;
    }
    
    const pendingData = await PendingData.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));
    
    const total = await PendingData.countDocuments(query);
    
    res.json({
      success: true,
      data: pendingData,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo datos pendientes',
      error: error.message
    });
  }
};

// Reintentar datos fallidos
const retryFailedData = async (req, res) => {
  try {
    const failedData = await PendingData.getFailed();
    const results = [];
    const errors = [];
    
    for (const data of failedData) {
      try {
        await data.processSync();
        
        // Procesar según el endpoint
        if (data.endpoint === '/posts' || data.endpoint === '/tasks') {
          const { title, body, userId = 1 } = data.data;
          
          const task = new Task({
            title,
            body,
            userId: parseInt(userId),
            originalId: data.clientId,
            syncStatus: 'synced'
          });
          
          await task.save();
        }
        
        await data.markAsSynced();
        results.push({
          id: data._id,
          status: 'retried_successfully'
        });
        
      } catch (error) {
        await data.markAsFailed(error.message);
        errors.push({
          id: data._id,
          error: error.message
        });
      }
    }
    
    res.json({
      success: true,
      message: `Reintentados ${results.length} elementos`,
      data: {
        retried: results,
        errors: errors
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error reintentando datos fallidos',
      error: error.message
    });
  }
};

// Obtener estadísticas de sincronización
const getSyncStats = async (req, res) => {
  try {
    const [taskStats, pendingStats] = await Promise.all([
      Task.getStats(),
      PendingData.getStats()
    ]);
    
    res.json({
      success: true,
      data: {
        tasks: taskStats[0] || {
          total: 0,
          completed: 0,
          pending: 0,
          failed: 0,
          synced: 0
        },
        pendingData: pendingStats[0] || {
          total: 0,
          pending: 0,
          processing: 0,
          synced: 0,
          failed: 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas de sincronización',
      error: error.message
    });
  }
};

// Limpiar datos antiguos
const cleanOldData = async (req, res) => {
  try {
    const { daysOld = 30 } = req.query;
    const result = await PendingData.cleanOldData(parseInt(daysOld));
    
    res.json({
      success: true,
      message: `Eliminados ${result.deletedCount} registros antiguos`,
      data: {
        deletedCount: result.deletedCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error limpiando datos antiguos',
      error: error.message
    });
  }
};

// Procesar sincronización automática (para service worker)
const processAutoSync = async (req, res) => {
  try {
    const pendingData = await PendingData.getPending();
    const results = [];
    const errors = [];
    
    for (const data of pendingData) {
      try {
        await data.processSync();
        
        // Procesar según el endpoint
        if (data.endpoint === '/posts' || data.endpoint === '/tasks') {
          const { title, body, userId = 1 } = data.data;
          
          const task = new Task({
            title,
            body,
            userId: parseInt(userId),
            originalId: data.clientId,
            syncStatus: 'synced'
          });
          
          await task.save();
        }
        
        await data.markAsSynced();
        results.push({
          id: data._id,
          status: 'auto_synced'
        });
        
      } catch (error) {
        await data.markAsFailed(error.message);
        errors.push({
          id: data._id,
          error: error.message
        });
      }
    }
    
    res.json({
      success: true,
      message: `Sincronización automática completada`,
      data: {
        synced: results,
        errors: errors
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en sincronización automática',
      error: error.message
    });
  }
};

module.exports = {
  syncPendingData,
  getPendingData,
  retryFailedData,
  getSyncStats,
  cleanOldData,
  processAutoSync
};
