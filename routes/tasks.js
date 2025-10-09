const express = require('express');
const router = express.Router();

// Usar siempre los controladores de MongoDB (conexión obligatoria)
const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  toggleTask,
  deleteTask,
  getTaskStats,
  syncTasks
} = require('../controllers/taskController');

// Rutas para tareas
router.get('/', getAllTasks);
router.get('/stats', getTaskStats);
router.get('/:id', getTaskById);
router.post('/', createTask);
router.post('/sync', syncTasks); // Endpoint especial para sincronización masiva
router.put('/:id', updateTask);
router.patch('/:id/toggle', toggleTask);
router.delete('/:id', deleteTask);

module.exports = router;
