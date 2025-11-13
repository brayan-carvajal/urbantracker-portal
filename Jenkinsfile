pipeline {
  agent any

  environment {
    IMAGE_BASE = 'web'
    NETWORK_PREFIX = 'myproject-net'
  }

  stages {
    // Mantener paridad con API: permisos sobre workspace
    stage('Permisos workspace') {
      steps {
        sh '''
          chmod -R 777 $WORKSPACE || true
        '''
      }
    }
    // Mantener paridad con API: leer .env raíz
    stage('Leer entorno desde .env') {
      steps {
        script {
          if (!fileExists('.env')) {
            error ".env no encontrado en la raíz. Debe contener: ENVIRONMENT=<develop|staging|prod>"
          }
          // Leer el archivo .env y extraer ENVIRONMENT
          def envContent = readFile('.env')
          def envLine = envContent.find(~/(?i)ENVIRONMENT\s*=\s*(.+)/)
          if (envLine) {
            env.ENVIRONMENT = envLine[1].trim()
            echo "✅ Entorno detectado: ${env.ENVIRONMENT}"
          } else {
            error "No se encontró la variable ENVIRONMENT en el archivo .env"
          }
        }
      }
    }

    

    stage('Verificar herramientas') {
      steps {
        script {
          echo "🔍 Verificando herramientas disponibles..."
          def toolsOk = true
          
          try {
            sh 'docker --version'
            echo "✅ Docker disponible"
          } catch (Exception e) {
            echo "⚠️ Docker no disponible o sin permisos"
            toolsOk = false
          }
          
          try {
            sh 'node --version'
            echo "✅ Node.js disponible"
          } catch (Exception e) {
            echo "⚠️ Node.js no disponible"
          }
          
          try {
            sh 'npm --version'
            echo "✅ NPM disponible"
          } catch (Exception e) {
            echo "⚠️ NPM no disponible"
          }
          
          if (!toolsOk) {
            error "Herramientas críticas no disponibles. Verificar configuración del agente Jenkins."
          }
          
          echo "✅ Verificación de herramientas completada"
        }
      }
    }

    
    

    stage('Construir imagen Docker') {
      steps {
        script {
          echo "🐳 Construyendo imágenes Docker del portal..."
          
          // Verificar que existen los Dockerfiles
          if (!fileExists('Frontend/Web-Admin/Dockerfile')) {
            error "No se encontró Frontend/Web-Admin/Dockerfile"
          }
          if (!fileExists('Frontend/Web-Client/Dockerfile')) {
            error "No se encontró Frontend/Web-Client/Dockerfile"
          }
          
          // Verificar que existen los directorios de contexto
          if (!fileExists('Frontend/Web-Admin/package.json')) {
            error "No se encontró Frontend/Web-Admin/package.json - verificar estructura del proyecto"
          }
          if (!fileExists('Frontend/Web-Client/package.json')) {
            error "No se encontró Frontend/Web-Client/package.json - verificar estructura del proyecto"
          }
          
          def commit = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
          env.IMAGE_TAG_WEB_ADMIN = "web-admin:${env.ENVIRONMENT}-${commit}"
          env.IMAGE_TAG_WEB_CLIENT = "web-client:${env.ENVIRONMENT}-${commit}"
          
          echo "🏗️ Construyendo Web-Admin: ${env.IMAGE_TAG_WEB_ADMIN}"
          sh "docker build --pull -t ${env.IMAGE_TAG_WEB_ADMIN} -f Frontend/Web-Admin/Dockerfile Frontend/Web-Admin"
          
          echo "🏗️ Construyendo Web-Client: ${env.IMAGE_TAG_WEB_CLIENT}"
          sh "docker build --pull -t ${env.IMAGE_TAG_WEB_CLIENT} -f Frontend/Web-Client/Dockerfile Frontend/Web-Client"
          
          echo "✅ Imágenes creadas: ${env.IMAGE_TAG_WEB_ADMIN} | ${env.IMAGE_TAG_WEB_CLIENT}"
        }
      }
    }

    

    stage('Preparar servicios') {
      steps {
        script {
          def netName = "${NETWORK_PREFIX}-${env.ENVIRONMENT}"
          echo "🌐 Creando red ${netName} ..."
          sh "docker network create ${netName} || echo '✅ Red ya existe'"
          if (env.ENVIRONMENT == 'prod') {
            echo "🛑 Ambiente prod: saltando servicios locales"
          } else {
            echo "ℹ️ Portal no requiere servicios extra locales (DB/MQTT)."
          }
        }
      }
    }

    stage('Desplegar Backend') {
      steps {
        script {
          if (env.ENVIRONMENT == 'prod') {
            echo "🚀 Despliegue remoto en producción"
          } else {
            def currEnv = env.ENVIRONMENT
            def netName = "${NETWORK_PREFIX}-${currEnv}"
            sh """
              docker stop urbantracker-web-admin-${currEnv} || true
              docker rm urbantracker-web-admin-${currEnv} || true
              docker stop urbantracker-web-client-${currEnv} || true
              docker rm urbantracker-web-client-${currEnv} || true
              sleep 3
              docker run -d \
                --name urbantracker-web-admin-${currEnv} \
                --network ${netName} \
                -e PORT=3000 \
                -p 3001:3000 \
                --restart unless-stopped \
                ${env.IMAGE_TAG_WEB_ADMIN}
              docker run -d \
                --name urbantracker-web-client-${currEnv} \
                --network ${netName} \
                -e PORT=3000 \
                -p 3002:3000 \
                --restart unless-stopped \
                ${env.IMAGE_TAG_WEB_CLIENT}
            """
            echo "✅ Contenedores portal iniciados exitosamente"
            
            // Validar que los contenedores estén corriendo
            sh """
              sleep 5
              echo "🔍 Verificando estado de contenedores..."
              docker ps --filter "name=urbantracker-web-${currEnv}" --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"
            """
          }
        }
      }
    }

    stage('Verificar Estado') {
      steps {
        script {
          echo "🔎 Verificando estado del portal..."
          sh '''
            sleep 20
            echo "⏱️ Esperando 20 segundos para inicialización..."
            echo "📊 Estado de contenedores:";
            docker ps -a --filter "name=urbantracker-web"
            echo "📋 Logs Web-Admin (últimas 20 líneas):";
            docker logs urbantracker-web-admin-${env.ENVIRONMENT} --tail 20 || true
            echo "📋 Logs Web-Client (últimas 20 líneas):";
            docker logs urbantracker-web-client-${env.ENVIRONMENT} --tail 20 || true
            echo "🔍 Health Web-Admin:";
            curl -sS --connect-timeout 5 --max-time 10 http://localhost:3001 && {
              echo "✅ Web-Admin responde"; } || { echo "⚠️ Web-Admin no responde"; }
            echo "🔍 Health Web-Client:";
            curl -sS --connect-timeout 5 --max-time 10 http://localhost:3002 && {
              echo "✅ Web-Client responde"; } || { echo "⚠️ Web-Client no responde"; }
          '''
        }
      }
    }
  }

  post {
    success {
      echo "🎉 Deploy completado exitosamente para ${env.ENVIRONMENT}"
      script {
        echo "Tags:"
        if (env.IMAGE_TAG_WEB_ADMIN) echo " - Admin: ${env.IMAGE_TAG_WEB_ADMIN}"
        if (env.IMAGE_TAG_WEB_CLIENT) echo " - Client: ${env.IMAGE_TAG_WEB_CLIENT}"
      }
      echo "📊 Servicios disponibles:"
      echo " - Web-Admin: http://localhost:3001"
      echo " - Web-Client: http://localhost:3002"
      echo "✅ Todas las etapas completadas correctamente"
    }
    failure {
      script {
        // Obtener información detallada del error
        def errorMessage = "Pipeline falló en etapa: ${env.STAGE_NAME ?: 'Desconocida'}"
        def buildNumber = env.BUILD_NUMBER ?: 'N/A'
        def gitCommit = sh(script: 'git rev-parse --short HEAD 2>/dev/null || echo "N/A"', returnStdout: true).trim()
        
        echo "❌ === ERROR DETALLADO ==="
        echo "Número de build: ${buildNumber}"
        echo "Git commit: ${gitCommit}"
        echo "Ambiente: ${env.ENVIRONMENT ?: 'N/A'}"
        echo "Etapa fallida: ${env.STAGE_NAME ?: 'N/A'}"
        echo "Timestamp: ${new Date()}"
        echo "============================"
        
        // Recopilar logs de contenedores antes de la limpieza
        echo "🔍 Recopilando logs de debugging..."
        
        // Verificar estado de contenedores
        sh '''
          echo "📊 Estado actual de contenedores:"
          docker ps -a --filter "name=urbantracker-web" --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}" 2>/dev/null || echo "⚠️ No se pudo acceder a Docker o no hay contenedores"
        '''
        
        // Logs del contenedor Web-Admin
        echo "📋 Logs Web-Admin (últimas 50 líneas):"
        sh '''
          if docker ps -a --filter "name=urbantracker-web-admin-${env.ENVIRONMENT}" --format "{{.Names}}" 2>/dev/null | grep -q .; then
            echo "=== CONTENEDOR WEB-ADMIN ==="
            docker logs urbantracker-web-admin-${env.ENVIRONMENT} --tail 50 2>/dev/null || echo "⚠️ No se pudieron obtener logs de Web-Admin"
            echo "=== FIN WEB-ADMIN ==="
          else
            echo "⚠️ Contenedor Web-Admin no encontrado o no accesible"
          fi
        '''
        
        // Logs del contenedor Web-Client
        echo "📋 Logs Web-Client (últimas 50 líneas):"
        sh '''
          if docker ps -a --filter "name=urbantracker-web-client-${env.ENVIRONMENT}" --format "{{.Names}}" 2>/dev/null | grep -q .; then
            echo "=== CONTENEDOR WEB-CLIENT ==="
            docker logs urbantracker-web-client-${env.ENVIRONMENT} --tail 50 2>/dev/null || echo "⚠️ No se pudieron obtener logs de Web-Client"
            echo "=== FIN WEB-CLIENT ==="
          else
            echo "⚠️ Contenedor Web-Client no encontrado o no accesible"
          fi
        '''
        
        // Información de recursos del sistema
        echo "💾 Información del sistema:"
        sh '''
          echo "=== ESPACIO EN DISCO ==="
          df -h / 2>/dev/null || echo "No se pudo obtener info de disco"
          echo "=== MEMORIA ==="
          free -h 2>/dev/null || echo "No se pudo obtener info de memoria"
        '''
        
        // Información Docker (solo si está disponible)
        echo "🐳 Información Docker (si está disponible):"
        sh '''
          if docker ps 2>/dev/null; then
            echo "=== IMÁGENES DOCKER ==="
            docker images | grep -E "(urbantracker|web-admin|web-client)" 2>/dev/null || echo "No hay imágenes relacionadas"
            echo "=== REDES DOCKER ==="
            docker network ls | grep "${NETWORK_PREFIX}" 2>/dev/null || echo "No hay redes relacionadas"
          else
            echo "⚠️ Docker no disponible o sin permisos"
          fi
        '''
        
        echo "💡 Recomendaciones de troubleshooting:"
        echo "1. Verificar que Docker esté instalado y funcionando"
        echo "2. Revisar permisos del usuario Jenkins"
        echo "3. Validar que el archivo .env contenga ENVIRONMENT=<develop|staging|prod>"
        echo "4. Comprobar conectividad de red"
        echo "5. Verificar que los Dockerfiles estén correctos"
      }
    }
    always {
      script {
        echo "🧹 Ejecutando limpieza final..."
        
        // Limpieza específica para ambiente develop
        if (env.ENVIRONMENT == 'develop') {
          echo "🧽 Limpiando recursos de desarrollo..."
          sh '''
            echo "Deteniendo contenedores de desarrollo..."
            docker stop urbantracker-web-admin-${env.ENVIRONMENT} 2>/dev/null || echo "✅ Web-Admin develop ya detenido"
            docker rm urbantracker-web-admin-${env.ENVIRONMENT} 2>/dev/null || echo "✅ Web-Admin develop ya eliminado"
            docker stop urbantracker-web-client-${env.ENVIRONMENT} 2>/dev/null || echo "✅ Web-Client develop ya detenido"
            docker rm urbantracker-web-client-${env.ENVIRONMENT} 2>/dev/null || echo "✅ Web-Client develop ya eliminado"
            
            echo "Eliminando red de desarrollo..."
            docker network rm ${NETWORK_PREFIX}-${env.ENVIRONMENT} 2>/dev/null || echo "✅ Red de desarrollo ya eliminada"
          '''
        }
        
        // Limpieza general de recursos no utilizados
        sh '''
          echo "🏃 Removiendo imágenes sin usar..."
          docker system prune -f 2>/dev/null || echo "⚠️ Error en limpieza general"
          
          echo "✅ Proceso de limpieza completado"
        '''
      }
    }
  }
}
