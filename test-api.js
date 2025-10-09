#!/usr/bin/env node

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3000/api';

// Función para hacer peticiones
async function makeRequest(method, endpoint, data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const result = await response.json();
    
    console.log(`${method} ${endpoint}:`, result);
    return result;
  } catch (error) {
    console.error(`Error en ${method} ${endpoint}:`, error.message);
  }
}

// Función principal de testing
async function testAPI() {
  console.log('🧪 Iniciando tests de la API...\n');
  
  // Test 1: Health check
  console.log('1. 🏥 Health Check');
  await makeRequest('GET', '/health');
  
  // Test 2: Crear tarea
  console.log('\n2. ➕ Crear tarea');
  const newTask = await makeRequest('POST', '/tasks', {
    title: 'Tarea de prueba',
    body: 'Esta es una tarea creada desde el test',
    userId: 1
  });
  
  // Test 3: Obtener todas las tareas
  console.log('\n3. 📋 Obtener todas las tareas');
  await makeRequest('GET', '/tasks');
  
  // Test 4: Obtener estadísticas
  console.log('\n4. 📊 Estadísticas de tareas');
  await makeRequest('GET', '/tasks/stats');
  
  // Test 5: Toggle completar tarea (si se creó una)
  if (newTask && newTask.data && newTask.data._id) {
    console.log('\n5. ✅ Toggle completar tarea');
    await makeRequest('PATCH', `/tasks/${newTask.data._id}/toggle`);
  }
  
  // Test 6: Sincronizar datos pendientes (simulando datos de IndexedDB)
  console.log('\n6. 🔄 Sincronizar datos pendientes');
  await makeRequest('POST', '/sync/pending', {
    pendingData: [
      {
        url: 'http://localhost:3000/api/tasks',
        method: 'POST',
        endpoint: '/tasks',
        data: {
          title: 'Tarea offline',
          body: 'Creada sin conexión',
          userId: 1
        },
        id: '1234567890'
      }
    ]
  });
  
  // Test 7: Estadísticas de sincronización
  console.log('\n7. 📈 Estadísticas de sincronización');
  await makeRequest('GET', '/sync/stats');
  
  // Test 8: Obtener datos pendientes
  console.log('\n8. 📋 Datos pendientes');
  await makeRequest('GET', '/sync/pending');
  
  console.log('\n🎉 Tests completados!');
  console.log('\n💡 Para probar la funcionalidad offline:');
  console.log('1. Abre tu PWA en el navegador');
  console.log('2. Desconecta la internet');
  console.log('3. Crea algunas tareas');
  console.log('4. Reconecta la internet');
  console.log('5. Las tareas se sincronizarán automáticamente');
}

// Ejecutar tests si se llama directamente
if (require.main === module) {
  testAPI().catch(console.error);
}

module.exports = { testAPI, makeRequest };
