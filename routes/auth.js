const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getCurrentUser,
  getAllUsers
} = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

// Rutas públicas
router.post('/register', register);
router.post('/login', login);

// Rutas protegidas
router.get('/me', authenticate, getCurrentUser);
router.get('/admin/users', authenticate, getAllUsers);

module.exports = router;

