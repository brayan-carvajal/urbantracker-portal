// Script para migrar URLs de imágenes de rutas existentes
// Ejecutar en la consola del navegador: copy(script); luego pegar y ejecutar

const script = `
(async () => {
  try {
    console.log('Iniciando migración de URLs de imágenes de rutas...');

    const response = await fetch('http://localhost:8080/api/v1/route/migrate-image-urls-public', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const result = await response.text();
      console.log('✅ Migración exitosa:', result);
    } else {
      console.error('❌ Error en la migración:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('❌ Error de conexión:', error);
  }
})();
`;

// Ejecutar automáticamente
(async () => {
  try {
    console.log('Iniciando migración de URLs de imágenes de rutas...');

    const response = await fetch('http://localhost:8080/api/v1/route/migrate-image-urls-public', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const result = await response.text();
      console.log('✅ Migración exitosa:', result);
    } else {
      console.error('❌ Error en la migración:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('❌ Error de conexión:', error);
  }
})();