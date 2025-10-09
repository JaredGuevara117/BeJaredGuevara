// Controlador en memoria para desarrollo sin MongoDB
let tasks = [];
let pendingData = [];
let taskIdCounter = 1;
let pendingIdCounter = 1;

// Obtener todas las tareas
const getAllTasks = async (req, res) => {
  try {
    const { userId = 1, completed, limit = 50, offset = 0 } = req.query;
    
    let filteredTasks = tasks.filter(task => task.userId === parseInt(userId));
    
    if (completed !== undefined) {
      filteredTasks = filteredTasks.filter(task => task.completed === (completed === 'true'));
    }
    
    const paginatedTasks = filteredTasks
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(parseInt(offset), parseInt(offset) + parseInt(limit));
    
    res.json({
      success: true,
      data: paginatedTasks,
      pagination: {
        total: filteredTasks.length,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < filteredTasks.length
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
    const task = tasks.find(t => t._id === id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }
    
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
    const { title, body, userId = 1, originalId } = req.body;
    
    if (!title || !body) {
      return res.status(400).json({
        success: false,
        message: 'Title y body son requeridos'
      });
    }
    
    const task = {
      _id: `task_${taskIdCounter++}`,
      title,
      body,
      userId: parseInt(userId),
      originalId,
      completed: false,
      synced: true,
      timestamp: new Date(),
      syncStatus: 'synced',
      retryCount: 0,
      lastSyncAttempt: new Date()
    };
    
    tasks.push(task);
    
    res.status(201).json({
      success: true,
      message: 'Tarea creada exitosamente',
      data: task
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
    const updates = req.body;
    
    const taskIndex = tasks.findIndex(t => t._id === id);
    
    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }
    
    tasks[taskIndex] = { ...tasks[taskIndex], ...updates, syncStatus: 'synced' };
    
    res.json({
      success: true,
      message: 'Tarea actualizada exitosamente',
      data: tasks[taskIndex]
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
    const taskIndex = tasks.findIndex(t => t._id === id);
    
    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }
    
    tasks[taskIndex].completed = !tasks[taskIndex].completed;
    
    res.json({
      success: true,
      message: 'Estado de tarea actualizado',
      data: tasks[taskIndex]
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
    const taskIndex = tasks.findIndex(t => t._id === id);
    
    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }
    
    tasks.splice(taskIndex, 1);
    
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
    const { userId = 1 } = req.query;
    
    const userTasks = tasks.filter(task => task.userId === parseInt(userId));
    
    const stats = {
      total: userTasks.length,
      completed: userTasks.filter(t => t.completed).length,
      pending: userTasks.filter(t => t.syncStatus === 'pending').length,
      failed: userTasks.filter(t => t.syncStatus === 'failed').length,
      synced: userTasks.filter(t => t.syncStatus === 'synced').length
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas',
      error: error.message
    });
  }
};

// Sincronizar múltiples tareas
const syncTasks = async (req, res) => {
  try {
    const { tasks: tasksToSync } = req.body;
    
    if (!Array.isArray(tasksToSync) || tasksToSync.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un array de tareas'
      });
    }
    
    const results = [];
    const errors = [];
    
    for (const taskData of tasksToSync) {
      try {
        const { title, body, userId = 1, originalId, completed = false } = taskData;
        
        const task = {
          _id: `task_${taskIdCounter++}`,
          title,
          body,
          userId: parseInt(userId),
          originalId,
          completed,
          synced: true,
          timestamp: new Date(),
          syncStatus: 'synced',
          retryCount: 0,
          lastSyncAttempt: new Date()
        };
        
        tasks.push(task);
        results.push(task);
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

// Sincronizar datos pendientes
const syncPendingData = async (req, res) => {
  try {
    const { pendingData: dataToSync } = req.body;
    
    if (!Array.isArray(dataToSync) || dataToSync.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un array de datos pendientes'
      });
    }
    
    const results = [];
    const errors = [];
    
    for (const data of dataToSync) {
      try {
        // Guardar en pendingData para tracking
        const pendingRecord = {
          _id: `pending_${pendingIdCounter++}`,
          url: data.url,
          method: data.method,
          endpoint: data.endpoint,
          data: data.data,
          clientId: data.id || Date.now().toString(),
          status: 'synced',
          retryCount: 0,
          maxRetries: 3,
          syncedAt: new Date(),
          createdAt: new Date()
        };
        
        pendingData.push(pendingRecord);
        
        // Procesar según el tipo de endpoint
        if (data.endpoint === '/posts' || data.endpoint === '/tasks') {
          const { title, body, userId = 1 } = data.data;
          
          const task = {
            _id: `task_${taskIdCounter++}`,
            title,
            body,
            userId: parseInt(userId),
            originalId: data.id?.toString(),
            completed: false,
            synced: true,
            timestamp: new Date(),
            syncStatus: 'synced',
            retryCount: 0,
            lastSyncAttempt: new Date()
          };
          
          tasks.push(task);
          
          results.push({
            originalId: data.id,
            taskId: task._id,
            status: 'synced'
          });
        } else {
          results.push({
            originalId: data.id,
            status: 'synced'
          });
        }
        
      } catch (error) {
        console.error('Error procesando dato pendiente:', error);
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
    
    let filteredData = pendingData;
    if (status !== 'all') {
      filteredData = pendingData.filter(item => item.status === status);
    }
    
    const paginatedData = filteredData
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(parseInt(offset), parseInt(offset) + parseInt(limit));
    
    res.json({
      success: true,
      data: paginatedData,
      pagination: {
        total: filteredData.length,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < filteredData.length
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

// Obtener estadísticas de sincronización
const getSyncStats = async (req, res) => {
  try {
    const taskStats = {
      total: tasks.length,
      completed: tasks.filter(t => t.completed).length,
      pending: tasks.filter(t => t.syncStatus === 'pending').length,
      failed: tasks.filter(t => t.syncStatus === 'failed').length,
      synced: tasks.filter(t => t.syncStatus === 'synced').length
    };
    
    const pendingStats = {
      total: pendingData.length,
      pending: pendingData.filter(p => p.status === 'pending').length,
      processing: pendingData.filter(p => p.status === 'processing').length,
      synced: pendingData.filter(p => p.status === 'synced').length,
      failed: pendingData.filter(p => p.status === 'failed').length
    };
    
    res.json({
      success: true,
      data: {
        tasks: taskStats,
        pendingData: pendingStats
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

module.exports = {
  // Task controllers
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  toggleTask,
  deleteTask,
  getTaskStats,
  syncTasks,
  
  // Sync controllers
  syncPendingData,
  getPendingData,
  getSyncStats
};
