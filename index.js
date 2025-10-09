const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

// Importar rutas
const taskRoutes = require('./routes/tasks');
const syncRoutes = require('./routes/sync');

// Importar middleware
const { errorHandler, notFound, requestLogger, corsHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection
const MONGODB_URI = process.env.URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in your .env file');
  process.exit(1);
}

// Connect to MongoDB with Mongoose
async function connectToMongoDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas successfully');
    console.log('🌐 Database:', mongoose.connection.db.databaseName);
  } catch (error) {
    console.error('❌ Error connecting to MongoDB Atlas:', error);
    console.log('🚨 MongoDB connection is REQUIRED. Server will not start without database connection.');
    process.exit(1);
  }
}

// Initialize connection
connectToMongoDB();

// Middleware
app.use(corsHandler);
app.use(requestLogger);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Basic routes
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 PWA API Server is running!',
    version: '1.0.0',
    endpoints: {
      tasks: '/api/tasks',
      sync: '/api/sync',
      health: '/health'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check route
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  res.json({ 
    status: 'OK', 
    database: dbStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: dbStatus === 'Disconnected' ? 'MongoDB no disponible - usando modo desarrollo' : 'Todo funcionando correctamente'
  });
});

// API Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/sync', syncRoutes);

// Manejo de errores
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📱 API Endpoints:`);
  console.log(`   - Tasks: http://localhost:${PORT}/api/tasks`);
  console.log(`   - Sync: http://localhost:${PORT}/api/sync`);
  console.log(`   - Health: http://localhost:${PORT}/health`);
});
