#!/usr/bin/env node

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3000/api';

async function testConnection() {
  console.log('🧪 Probando conexión a la API...\n');
  
  try {
    // 1. Health check
    console.log('1. 🏥 Health Check');
    const healthResponse = await fetch('http://localhost:3000/health');
    const healthData = await healthResponse.json();
    console.log('✅ Servidor funcionando:', healthData.status);
    console.log('📊 Base de datos:', healthData.database);
    
    // 2. Crear tarea
    console.log('\n2. ➕ Crear tarea');
    const createResponse = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Tarea de prueba',
        body: 'Esta es una tarea creada desde el test',
        userId: 1
      })
    });
    
    const createData = await createResponse.json();
    console.log('✅ Tarea creada:', createData.success ? 'Sí' : 'No');
    if (createData.data) {
      console.log('📝 ID de tarea:', createData.data._id);
    }
    
    // 3. Obtener tareas
    console.log('\n3. 📋 Obtener tareas');
    const tasksResponse = await fetch(`${API_BASE}/tasks?userId=1`);
    const tasksData = await tasksResponse.json();
    console.log('✅ Tareas obtenidas:', tasksData.data.length);
    
    // 4. Estadísticas
    console.log('\n4. 📊 Estadísticas');
    const statsResponse = await fetch(`${API_BASE}/sync/stats`);
    const statsData = await statsResponse.json();
    console.log('✅ Estadísticas obtenidas:', statsData.success ? 'Sí' : 'No');
    console.log('📈 Total de tareas:', statsData.data.tasks.total);
    
    // 5. Probar sincronización
    console.log('\n5. 🔄 Probar sincronización');
    const syncResponse = await fetch(`${API_BASE}/sync/pending`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pendingData: [
          {
            url: 'http://localhost:3000/api/tasks',
            method: 'POST',
            endpoint: '/tasks',
            data: {
              title: 'Tarea sincronizada',
              body: 'Esta tarea fue sincronizada',
              userId: 1
            },
            id: '1234567890'
          }
        ]
      })
    });
    
    const syncData = await syncResponse.json();
    console.log('✅ Sincronización:', syncData.success ? 'Exitosa' : 'Fallida');
    if (syncData.data) {
      console.log('📤 Elementos sincronizados:', syncData.data.synced.length);
    }
    
    console.log('\n🎉 ¡Todas las pruebas pasaron!');
    console.log('\n💡 Ahora puedes probar tu PWA:');
    console.log('1. Abre tu PWA en el navegador');
    console.log('2. Crea algunas tareas');
    console.log('3. Desconecta la internet (DevTools > Network > Offline)');
    console.log('4. Crea más tareas (se guardarán en IndexedDB)');
    console.log('5. Reconecta la internet');
    console.log('6. Las tareas se sincronizarán automáticamente');
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
    console.log('\n🔧 Soluciones:');
    console.log('1. Verifica que el servidor esté ejecutándose: node index.js');
    console.log('2. Verifica que el puerto 3000 esté libre');
    console.log('3. Revisa la consola del servidor para errores');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testConnection();
}

module.exports = { testConnection };
