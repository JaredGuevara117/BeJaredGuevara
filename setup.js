#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando PWA API Server...\n');

// Verificar si existe el archivo .env
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creando archivo .env...');
  
  const envContent = `# PWA API Server Configuration
URI=mongodb://localhost:27017/pwa-database
PORT=3000
NODE_ENV=development

# Opcional: Configuración avanzada
MAX_RETRIES=3
CLEANUP_DAYS=30
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Archivo .env creado');
} else {
  console.log('✅ Archivo .env ya existe');
}

// Verificar dependencias
console.log('\n📦 Verificando dependencias...');

const packageJson = require('./package.json');
const requiredDeps = ['express', 'mongoose', 'dotenv'];
const missingDeps = [];

requiredDeps.forEach(dep => {
  if (!packageJson.dependencies[dep]) {
    missingDeps.push(dep);
  }
});

if (missingDeps.length > 0) {
  console.log(`❌ Faltan dependencias: ${missingDeps.join(', ')}`);
  console.log('💡 Ejecuta: npm install');
} else {
  console.log('✅ Todas las dependencias están instaladas');
}

// Crear directorios si no existen
const dirs = ['models', 'controllers', 'routes', 'middleware'];
dirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Directorio ${dir} creado`);
  }
});

console.log('\n🎉 Configuración completada!');
console.log('\n📋 Próximos pasos:');
console.log('1. Asegúrate de que MongoDB esté ejecutándose');
console.log('2. Ejecuta: npm install (si faltan dependencias)');
console.log('3. Ejecuta: npm run dev');
console.log('4. Visita: http://localhost:3000');
console.log('\n🔗 Endpoints disponibles:');
console.log('   - GET  /api/tasks');
console.log('   - POST /api/tasks');
console.log('   - POST /api/sync/pending');
console.log('   - GET  /api/sync/stats');
console.log('   - GET  /health');
