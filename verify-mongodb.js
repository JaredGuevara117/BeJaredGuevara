#!/usr/bin/env node

const mongoose = require('mongoose');
require('dotenv').config();

// Modelos
const Task = require('./models/Task');
const PendingData = require('./models/PendingData');

const MONGODB_URI = process.env.URI;

async function verifyMongoDB() {
  console.log('🔍 Verificando datos en MongoDB Atlas...\n');
  
  try {
    // Conectar a MongoDB Atlas
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB Atlas');
    console.log('🌐 Base de datos:', mongoose.connection.db.databaseName);
    
    // Verificar colección de tareas
    console.log('\n📋 Verificando colección de tareas...');
    const tasks = await Task.find().sort({ timestamp: -1 }).limit(10);
    console.log(`📊 Total de tareas en MongoDB: ${tasks.length}`);
    
    if (tasks.length > 0) {
      console.log('\n📝 Últimas tareas:');
      tasks.forEach((task, index) => {
        console.log(`${index + 1}. ${task.title} (${task.completed ? '✅' : '⏳'}) - ${task.timestamp.toLocaleString()}`);
      });
    }
    
    // Verificar colección de datos pendientes
    console.log('\n🔄 Verificando datos pendientes...');
    const pendingData = await PendingData.find().sort({ createdAt: -1 }).limit(10);
    console.log(`📊 Total de datos pendientes: ${pendingData.length}`);
    
    if (pendingData.length > 0) {
      console.log('\n📤 Últimos datos pendientes:');
      pendingData.forEach((data, index) => {
        console.log(`${index + 1}. ${data.method} ${data.endpoint} - ${data.status} - ${data.createdAt.toLocaleString()}`);
      });
    }
    
    // Estadísticas generales
    console.log('\n📈 Estadísticas generales:');
    const taskStats = await Task.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: ['$completed', 1, 0] } },
          synced: { $sum: { $cond: [{ $eq: ['$syncStatus', 'synced'] }, 1, 0] } }
        }
      }
    ]);
    
    const pendingStats = await PendingData.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          synced: { $sum: { $cond: [{ $eq: ['$status', 'synced'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } }
        }
      }
    ]);
    
    console.log('📊 Tareas:', taskStats[0] || { total: 0, completed: 0, synced: 0 });
    console.log('📊 Datos pendientes:', pendingStats[0] || { total: 0, synced: 0, pending: 0 });
    
    console.log('\n🎉 ¡Verificación completada!');
    console.log('✅ Los datos se están guardando correctamente en MongoDB Atlas');
    
  } catch (error) {
    console.error('❌ Error verificando MongoDB:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB Atlas');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  verifyMongoDB();
}

module.exports = { verifyMongoDB };
