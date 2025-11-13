const Task = require('../models/Task');
const PendingData = require('../models/PendingData');

// Obtener todas las tareas
const getAllTasks = async (req, res) => {
  try {
<<<<<<< HEAD
    const { userId = 1, completed, limit = 50, offset = 0 } = req.query;
    
    let query = { userId: parseInt(userId) };
=======
    const { completed, limit = 50, offset = 0 } = req.query;
    const userId = req.userId; // Obtener del token de autenticación
    
    let query = { userId: userId.toString() };
>>>>>>> 0ea7a8e (notificaciones)
    if (completed !== undefined) {
      query.completed = completed === 'true';
    }
    
    const tasks = await Task.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));
    
    const total = await Task.countDocuments(query);
    
    res.json({
      success: true,
      data: tasks,
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
      message: 'Error obteniendo tareas',
      error: error.message
    });
  }
};

// Obtener una tarea por ID
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
<<<<<<< HEAD
=======
    const userId = req.userId.toString();
>>>>>>> 0ea7a8e (notificaciones)
    const task = await Task.findById(id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }
    
<<<<<<< HEAD
=======
    // Verificar que la tarea pertenezca al usuario
    if (task.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para acceder a esta tarea'
      });
    }
    
>>>>>>> 0ea7a8e (notificaciones)
    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo tarea',
      error: error.message
    });
  }
};

// Crear nueva tarea
const createTask = async (req, res) => {
  try {
<<<<<<< HEAD
    const { title, body, userId = 1, originalId } = req.body;
=======
    const { title, body, originalId, userId: bodyUserId } = req.body;
    const userId = req.userId; // Obtener del token de autenticación
    
    // Validar que no se envíe userId == 1 en el body
    if (bodyUserId === 1 || bodyUserId === "1") {
      return res.status(400).json({
        success: false,
        message: 'No se permite userId igual a 1. El userId se obtiene del token de autenticación.'
      });
    }
>>>>>>> 0ea7a8e (notificaciones)
    
    if (!title || !body) {
      return res.status(400).json({
        success: false,
        message: 'Title y body son requeridos'
      });
    }
    
    const task = new Task({
      title,
      body,
<<<<<<< HEAD
      userId: parseInt(userId),
=======
      userId: userId.toString(),
>>>>>>> 0ea7a8e (notificaciones)
      originalId,
      syncStatus: 'synced'
    });
    
    const savedTask = await task.save();
    
    res.status(201).json({
      success: true,
      message: 'Tarea creada exitosamente',
      data: savedTask
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creando tarea',
      error: error.message
    });
  }
};

// Actualizar tarea
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
<<<<<<< HEAD
    const updates = req.body;
    
    const task = await Task.findByIdAndUpdate(
      id,
      { ...updates, syncStatus: 'synced' },
      { new: true, runValidators: true }
    );
=======
    const userId = req.userId.toString();
    const updates = req.body;
    
    const task = await Task.findById(id);
>>>>>>> 0ea7a8e (notificaciones)
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }
    
<<<<<<< HEAD
=======
    // Verificar que la tarea pertenezca al usuario
    if (task.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para actualizar esta tarea'
      });
    }
    
    Object.assign(task, updates, { syncStatus: 'synced' });
    await task.save();
    
>>>>>>> 0ea7a8e (notificaciones)
    res.json({
      success: true,
      message: 'Tarea actualizada exitosamente',
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error actualizando tarea',
      error: error.message
    });
  }
};

// Toggle completar tarea
const toggleTask = async (req, res) => {
  try {
    const { id } = req.params;
<<<<<<< HEAD
=======
    const userId = req.userId.toString();
>>>>>>> 0ea7a8e (notificaciones)
    const task = await Task.findById(id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }
    
<<<<<<< HEAD
=======
    // Verificar que la tarea pertenezca al usuario
    if (task.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para modificar esta tarea'
      });
    }
    
>>>>>>> 0ea7a8e (notificaciones)
    await task.toggleComplete();
    
    res.json({
      success: true,
      message: 'Estado de tarea actualizado',
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error actualizando estado de tarea',
      error: error.message
    });
  }
};

// Eliminar tarea
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
<<<<<<< HEAD
    const task = await Task.findByIdAndDelete(id);
=======
    const userId = req.userId.toString();
    const task = await Task.findById(id);
>>>>>>> 0ea7a8e (notificaciones)
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }
    
<<<<<<< HEAD
=======
    // Verificar que la tarea pertenezca al usuario
    if (task.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar esta tarea'
      });
    }
    
    await Task.findByIdAndDelete(id);
    
>>>>>>> 0ea7a8e (notificaciones)
    res.json({
      success: true,
      message: 'Tarea eliminada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error eliminando tarea',
      error: error.message
    });
  }
};

// Obtener estadísticas de tareas
const getTaskStats = async (req, res) => {
  try {
<<<<<<< HEAD
    const { userId = 1 } = req.query;
    
    const stats = await Task.aggregate([
      { $match: { userId: parseInt(userId) } },
=======
    const userId = req.userId; // Obtener del token de autenticación
    
    const stats = await Task.aggregate([
      { $match: { userId: userId.toString() } },
>>>>>>> 0ea7a8e (notificaciones)
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: ['$completed', 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$syncStatus', 'pending'] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ['$syncStatus', 'failed'] }, 1, 0] } },
          synced: { $sum: { $cond: [{ $eq: ['$syncStatus', 'synced'] }, 1, 0] } }
        }
      }
    ]);
    
    const result = stats[0] || {
      total: 0,
      completed: 0,
      pending: 0,
      failed: 0,
      synced: 0
    };
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas',
      error: error.message
    });
  }
};

// Sincronizar múltiples tareas (para datos de IndexedDB)
const syncTasks = async (req, res) => {
  try {
    const { tasks } = req.body;
    
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un array de tareas'
      });
    }
    
    const results = [];
    const errors = [];
    
<<<<<<< HEAD
    for (const taskData of tasks) {
      try {
        const { title, body, userId = 1, originalId, completed = false } = taskData;
=======
    const userId = req.userId; // Obtener del token de autenticación
    
    for (const taskData of tasks) {
      try {
        const { title, body, originalId, completed = false } = taskData;
>>>>>>> 0ea7a8e (notificaciones)
        
        const task = new Task({
          title,
          body,
<<<<<<< HEAD
          userId: parseInt(userId),
=======
          userId: userId.toString(),
>>>>>>> 0ea7a8e (notificaciones)
          originalId,
          completed,
          syncStatus: 'synced'
        });
        
        const savedTask = await task.save();
        results.push(savedTask);
      } catch (error) {
        errors.push({
          originalId: taskData.originalId,
          error: error.message
        });
      }
    }
    
    res.json({
      success: true,
      message: `Sincronizadas ${results.length} tareas`,
      data: {
        synced: results,
        errors: errors
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sincronizando tareas',
      error: error.message
    });
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  toggleTask,
  deleteTask,
  getTaskStats,
  syncTasks
};
