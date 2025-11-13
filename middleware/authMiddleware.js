const jwt = require('jsonwebtoken');

// Middleware para verificar token JWT
const authenticate = (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticación requerido'
      });
    }

    // Extraer el token
    const token = authHeader.substring(7); // Remover "Bearer "

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu-secret-key-cambiar-en-produccion');
    
    // Agregar userId al request
    req.userId = decoded.userId;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Error de autenticación'
    });
  }
};

module.exports = {
  authenticate
};

