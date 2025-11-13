const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generar token JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'tu-secret-key-cambiar-en-produccion', {
    expiresIn: '7d'
  });
};

// Registrar nuevo usuario
const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Validar campos requeridos
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos'
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El usuario o email ya existe'
      });
    }

    // Crear nuevo usuario
    const user = new User({
      username,
      email,
      password
    });

    await user.save();

    // Generar token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// Iniciar sesión
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validar campos requeridos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    // Buscar usuario por email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar contraseña
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Generar token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obtener información del usuario actual
const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obtener todos los usuarios (solo para admin)
const getAllUsers = async (req, res, next) => {
  try {
    // Verificar que el usuario actual sea el admin "webos"
    const currentUser = await User.findById(req.userId).select('username');
    
    if (!currentUser || currentUser.username !== 'webos') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Solo el administrador puede acceder a esta información.'
      });
    }

    // Obtener todos los usuarios con sus suscripciones
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 });

    // Formatear datos para incluir información de suscripciones
    const usersWithSubscriptions = users.map(user => ({
      id: user._id,
      username: user.username,
      email: user.email,
      hasPushSubscription: user.pushSubscriptions && user.pushSubscriptions.length > 0,
      pushSubscriptionsCount: user.pushSubscriptions ? user.pushSubscriptions.length : 0,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));

    res.json({
      success: true,
      data: {
        users: usersWithSubscriptions,
        total: usersWithSubscriptions.length,
        withSubscriptions: usersWithSubscriptions.filter(u => u.hasPushSubscription).length,
        withoutSubscriptions: usersWithSubscriptions.filter(u => !u.hasPushSubscription).length
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  getAllUsers
};

