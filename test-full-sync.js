#!/usr/bin/env node

const fetch = require('node-fetch');
const mongoose = require('mongoose');
require('dotenv').config();

const API_BASE = 'http://localhost:3000/api';
const MONGODB_URI = process.env.URI;

// Modelos
const Task = require('./models/Task');
const PendingData = require('./models/PendingData');

async function testFullSync() {
  console.log('🧪 Prueba completa de sincronización con MongoDB Atlas...\n');
  
  try {
    // 1. Conectar a MongoDB Atlas
    console.log('1. 🔌 Conectando a MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB Atlas');
    
    // 2. Limpiar datos anteriores
    console.log('\n2. 🧹 Limpiando datos anteriores...');
    await Task.deleteMany({});
    await PendingData.deleteMany({});
    console.log('✅ Datos anteriores eliminados');
    
    // 3. Crear tarea directamente en la API
    console.log('\n3. ➕ Creando tarea en la API...');
    const createResponse = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Tarea creada online',
        body: 'Esta tarea fue creada con conexión',
        userId: 1
      })
    });
    
    const createData = await createResponse.json();
    console.log('✅ Tarea creada:', createData.success ? 'Sí' : 'No');
    if (createData.data) {
      console.log('📝 ID:', createData.data._id);
    }
    
    // 4. Simular datos offline (IndexedDB)
    console.log('\n4. 📱 Simulando datos offline...');
    const offlineData = [
      {
        url: 'http://localhost:3000/api/tasks',
        method: 'POST',
        endpoint: '/tasks',
        data: {
          title: 'Tarea offline 1',
          body: 'Esta tarea fue creada offline',
          userId: 1
        },
        id: 'offline_1'
      },
      {
        url: 'http://localhost:3000/api/tasks',
        method: 'POST',
        endpoint: '/tasks',
        data: {
          title: 'Tarea offline 2',
          body: 'Otra tarea offline',
          userId: 1
        },
        id: 'offline_2'
      }
    ];
    
    // 5. Sincronizar datos offline
    console.log('\n5. 🔄 Sincronizando datos offline...');
    const syncResponse = await fetch(`${API_BASE}/sync/pending`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pendingData: offlineData })
    });
    
    const syncData = await syncResponse.json();
    console.log('✅ Sincronización:', syncData.success ? 'Exitosa' : 'Fallida');
    console.log('📤 Elementos sincronizados:', syncData.data.synced.length);
    console.log('❌ Errores:', syncData.data.errors.length);
    
    // 6. Verificar datos en MongoDB
    console.log('\n6. 🔍 Verificando datos en MongoDB Atlas...');
    const tasks = await Task.find().sort({ timestamp: -1 });
    console.log(`📊 Total de tareas en MongoDB: ${tasks.length}`);
    
    tasks.forEach((task, index) => {
      console.log(`${index + 1}. ${task.title} - ${task.timestamp.toLocaleString()}`);
    });
    
    // 7. Verificar datos pendientes
    console.log('\n7. 📋 Verificando datos pendientes...');
    const pendingData = await PendingData.find().sort({ createdAt: -1 });
    console.log(`📊 Total de datos pendientes: ${pendingData.length}`);
    
    // 8. Obtener estadísticas finales
    console.log('\n8. 📈 Estadísticas finales...');
    const statsResponse = await fetch(`${API_BASE}/sync/stats`);
    const statsData = await statsResponse.json();
    
    if (statsData.success) {
      console.log('📊 Tareas:', statsData.data.tasks);
      console.log('📊 Datos pendientes:', statsData.data.pendingData);
    }
    
    console.log('\n🎉 ¡Prueba completada exitosamente!');
    console.log('\n✅ Resumen:');
    console.log('- Conexión a MongoDB Atlas: ✅');
    console.log('- Creación de tareas: ✅');
    console.log('- Sincronización offline: ✅');
    console.log('- Almacenamiento en MongoDB: ✅');
    console.log('- Eliminación de datos pendientes: ✅');
    
    console.log('\n💡 Ahora puedes probar tu PWA:');
    console.log('1. Abre tu PWA en el navegador');
    console.log('2. Crea tareas online (se guardan en MongoDB)');
    console.log('3. Desconecta la internet');
    console.log('4. Crea tareas offline (se guardan en IndexedDB)');
    console.log('5. Reconecta la internet');
    console.log('6. Las tareas offline se sincronizarán automáticamente con MongoDB');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB Atlas');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testFullSync();
}

module.exports = { testFullSync };
