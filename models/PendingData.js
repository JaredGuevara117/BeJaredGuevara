const mongoose = require('mongoose');

const pendingDataSchema = new mongoose.Schema({
  // Datos del request original
  url: {
    type: String,
    required: true
  },
  method: {
    type: String,
    required: true,
    enum: ['POST', 'PUT', 'DELETE', 'PATCH']
  },
  endpoint: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  
  // Metadatos de sincronización
  status: {
    type: String,
    enum: ['pending', 'processing', 'synced', 'failed'],
    default: 'pending'
  },
  retryCount: {
    type: Number,
    default: 0
  },
  maxRetries: {
    type: Number,
    default: 3
  },
  lastRetry: {
    type: Date
  },
  error: {
    type: String
  },
  syncedAt: {
    type: Date
  },
  
  // ID original del cliente para tracking
  clientId: {
    type: String,
    required: true
  },
  
  // Metadatos del dispositivo/cliente
  userAgent: {
    type: String
  },
  ipAddress: {
    type: String
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
pendingDataSchema.index({ status: 1, retryCount: 1 });
pendingDataSchema.index({ clientId: 1 });
pendingDataSchema.index({ createdAt: -1 });
pendingDataSchema.index({ method: 1, endpoint: 1 });

// Método para procesar sincronización
pendingDataSchema.methods.processSync = async function() {
  this.status = 'processing';
  this.lastRetry = new Date();
  this.retryCount += 1;
  return this.save();
};

// Método para marcar como sincronizado
pendingDataSchema.methods.markAsSynced = function() {
  this.status = 'synced';
  this.syncedAt = new Date();
  return this.save();
};

// Método para marcar como fallido
pendingDataSchema.methods.markAsFailed = function(error) {
  this.status = 'failed';
  this.error = error;
  this.lastRetry = new Date();
  return this.save();
};

// Método estático para obtener datos pendientes
pendingDataSchema.statics.getPending = function() {
  return this.find({ 
    status: 'pending',
    retryCount: { $lt: this.maxRetries }
  }).sort({ createdAt: 1 });
};

// Método estático para obtener datos fallidos
pendingDataSchema.statics.getFailed = function() {
  return this.find({ 
    $or: [
      { status: 'failed' },
      { retryCount: { $gte: this.maxRetries } }
    ]
  });
};

// Método estático para estadísticas
pendingDataSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        processing: { $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] } },
        synced: { $sum: { $cond: [{ $eq: ['$status', 'synced'] }, 1, 0] } },
        failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } }
      }
    }
  ]);
};

// Método estático para limpiar datos antiguos
pendingDataSchema.statics.cleanOldData = function(daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return this.deleteMany({
    status: 'synced',
    syncedAt: { $lt: cutoffDate }
  });
};

module.exports = mongoose.model('PendingData', pendingDataSchema);
