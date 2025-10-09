const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  body: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: Number,
    required: true,
    default: 1
  },
  completed: {
    type: Boolean,
    default: false
  },
  synced: {
    type: Boolean,
    default: true // En la base de datos siempre está sincronizado
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  // Para tracking de sincronización
  originalId: {
    type: String, // ID original del cliente
    required: false
  },
  syncStatus: {
    type: String,
    enum: ['synced', 'pending', 'failed'],
    default: 'synced'
  },
  retryCount: {
    type: Number,
    default: 0
  },
  lastSyncAttempt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Agrega createdAt y updatedAt automáticamente
});

// Índices para optimizar consultas
taskSchema.index({ userId: 1, completed: 1 });
taskSchema.index({ timestamp: -1 });
taskSchema.index({ syncStatus: 1 });
taskSchema.index({ originalId: 1 });

// Método para marcar como completada
taskSchema.methods.toggleComplete = function() {
  this.completed = !this.completed;
  return this.save();
};

// Método estático para obtener tareas por usuario
taskSchema.statics.getByUser = function(userId) {
  return this.find({ userId }).sort({ timestamp: -1 });
};

// Método estático para obtener tareas pendientes
taskSchema.statics.getPending = function() {
  return this.find({ syncStatus: 'pending' });
};

// Método estático para estadísticas
taskSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        completed: { $sum: { $cond: ['$completed', 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ['$syncStatus', 'pending'] }, 1, 0] } },
        failed: { $sum: { $cond: [{ $eq: ['$syncStatus', 'failed'] }, 1, 0] } }
      }
    }
  ]);
};

module.exports = mongoose.model('Task', taskSchema);
