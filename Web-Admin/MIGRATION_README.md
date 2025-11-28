# 🔄 Migración de URLs de Imágenes de Rutas

## Problema
Después de actualizar el sistema de imágenes de rutas, las rutas existentes tienen URLs que apuntan al puerto incorrecto (localhost:3000 en lugar de localhost:8080), causando errores 404 al intentar cargar las imágenes.

## Solución
Se han implementado las siguientes correcciones:

### 1. ✅ Corrección Automática en RouteCard
El componente `RouteCard` ahora detecta automáticamente URLs que apuntan a `localhost:3000` y las corrige a `localhost:8080`.

### 2. ✅ Sistema de Migración
Se agregó un sistema para migrar todas las rutas existentes a las nuevas URLs correctas.

## 🚀 Cómo Ejecutar la Migración

### Opción 1: Script Automático (Recomendado)
1. Abre tu navegador y ve a cualquier página del frontend
2. Abre la consola del navegador (F12 → Console)
3. Copia y pega el siguiente código:

```javascript
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
```

4. Presiona Enter para ejecutar
5. Deberías ver: `✅ Migración exitosa: URLs de imágenes migradas exitosamente`

### Opción 2: Archivo de Script
1. Ejecuta el archivo `migrate-routes.js` desde la consola:
   ```bash
   node migrate-routes.js
   ```

### Opción 3: Llamada Directa al API
1. Desde Postman o cualquier cliente HTTP:
   ```
   GET http://localhost:8080/api/v1/route/migrate-image-urls-public
   ```

## ✅ Verificación
Después de ejecutar la migración:

1. **Las imágenes deberían cargar correctamente** en las tarjetas de rutas
2. **No deberías ver más errores 404** en la consola
3. **Las nuevas rutas creadas** usarán automáticamente las URLs correctas

## 🔧 Detalles Técnicos

### Cambios Realizados:

#### Backend (RouteService.java):
- ✅ Agregado `determineImageBaseUrl()` para detectar entorno
- ✅ Actualizado `saveImage()` para usar URLs dinámicas
- ✅ Mejorado `deleteIfExists()` para manejar múltiples formatos de URL
- ✅ Agregado método `updateExistingImageUrls()` para migración

#### Backend (RouteController.java):
- ✅ Agregado endpoint `/api/v1/route/images/{filename}` para servir imágenes
- ✅ Agregado endpoint `/api/v1/route/migrate-image-urls-public` para migración

#### Frontend (RouteCard.tsx):
- ✅ Agregada función `getCorrectedImageUrl()` para corrección automática
- ✅ Actualizadas todas las referencias de imagen para usar URLs corregidas

#### Frontend (RouteFormManager.tsx):
- ✅ Agregados previews visuales inmediatos en el formulario
- ✅ Mejorado el diseño de subida de imágenes

## 🐛 Solución de Problemas

### Si aún ves errores 404:
1. Verifica que el backend esté corriendo en el puerto 8080
2. Ejecuta la migración nuevamente
3. Verifica que los archivos de imagen existan en `src/main/resources/static/images/routes/`

### Si las imágenes no se muestran:
1. Revisa la consola del navegador para errores específicos
2. Verifica que las URLs corregidas apunten al puerto correcto
3. Asegúrate de que el backend esté sirviendo las imágenes correctamente

## 📝 Notas
- El endpoint de migración público (`migrate-image-urls-public`) es temporal y debería removerse en producción
- Las nuevas rutas creadas usarán automáticamente las URLs correctas
- El sistema es retrocompatible con rutas existentes