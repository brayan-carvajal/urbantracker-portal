pipeline {
  agent any

  environment {
    IMAGE_BASE = 'urbantracker-frontend'
    NETWORK_PREFIX = 'urbantracker-net'
    
    // Puertos específicos para frontend
    ADMIN_PORT = ''
    CLIENT_PORT = ''
    
    // Configuración de servicios
    ENABLE_SERVICES = ''
    CLEANUP_ENABLED = ''
    
    // URLs del backend por entorno
    BACKEND_URL = ''
  }

  stages {
    stage('Preparar Workspace') {
      steps { sh 'chmod -R 777 $WORKSPACE || true' }
    }

    stage('Configurar Entorno') {
      steps {
        script {
          if (!fileExists('.env')) {
            error "❌ Archivo .env requerido. Use: ENVIRONMENT=<main|qa|develop|staging>"
          }
          
          sh '''
            ENVIRONMENT=$(grep -E '^ENVIRONMENT=' .env | cut -d'=' -f2 | tr -d '\\r\\n')
            echo "ENVIRONMENT=$ENVIRONMENT" > env.properties
          '''
          
          def props = readProperties file: 'env.properties'
          env.ENVIRONMENT = props['ENVIRONMENT']
          
          switch(env.ENVIRONMENT) {
            case 'main':
              env.ADMIN_PORT = '3001'
              env.CLIENT_PORT = '3002'
              env.ENABLE_SERVICES = 'false'  // Frontend no necesita servicios locales
              env.CLEANUP_ENABLED = 'false'
              env.BACKEND_URL = 'http://localhost:8080'  // Asume backend en puerto estándar
              break
            case 'qa':
              env.ADMIN_PORT = '3011'
              env.CLIENT_PORT = '3012'
              env.ENABLE_SERVICES = 'false'
              env.CLEANUP_ENABLED = 'false'
              env.BACKEND_URL = 'http://localhost:8080'
              break
            case 'develop':
              env.ADMIN_PORT = '3021'
              env.CLIENT_PORT = '3022'
              env.ENABLE_SERVICES = 'false'
              env.CLEANUP_ENABLED = 'true'
              env.BACKEND_URL = 'http://localhost:8080'
              break
            case 'staging':
              env.ADMIN_PORT = '3031'
              env.CLIENT_PORT = '3032'
              env.ENABLE_SERVICES = 'false'
              env.CLEANUP_ENABLED = 'false'
              env.BACKEND_URL = 'http://localhost:8080'
              break
            default:
              error "❌ Entorno inválido: ${env.ENVIRONMENT}. Use: main, qa, develop, staging"
          }
          
          echo "✅ ${env.ENVIRONMENT}: Admin:${env.ADMIN_PORT} Client:${env.CLIENT_PORT}"
        }
      }
    }

    stage('Verificar Dependencias') {
      steps {
        sh '''
          echo "🔍 Verificando herramientas..."
          docker --version
          node --version
          npm --version
          echo "✅ Herramientas OK"
        '''
      }
    }

    stage('Compilar Web-Admin') {
      steps {
        dir('Web-Admin') {
          script {
            echo "📦 Compilando Web-Admin..."
            
            docker.image('node:20-alpine').inside {
              sh '''
                npm ci --silent
                npm run build
                
                # Verificar que la compilación fue exitosa
                if [ ! -d ".next" ]; then
                  echo "❌ Error: Build de Web-Admin falló"
                  exit 1
                fi
                
                echo "✅ Web-Admin compilado exitosamente"
              '''
            }
          }
        }
      }
    }

    stage('Compilar Web-Client') {
      steps {
        dir('Web-Client') {
          script {
            echo "📦 Compilando Web-Client..."
            
            docker.image('node:18-alpine').inside {
              sh '''
                npm ci --silent
                npm run build
                
                # Verificar que la compilación fue exitosa
                if [ ! -d ".next" ]; then
                  echo "❌ Error: Build de Web-Client falló"
                  exit 1
                fi
                
                echo "✅ Web-Client compilado exitosamente"
              '''
            }
          }
        }
      }
    }

    stage('Construir Imágenes Docker') {
      steps {
        script {
          def commitHash = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
          
          // Web-Admin
          dir('Web-Admin') {
            script {
              env.ADMIN_IMAGE = "${IMAGE_BASE}-admin:${env.ENVIRONMENT}-${commitHash}"
              env.ADMIN_IMAGE_LATEST = "${IMAGE_BASE}-admin:${env.ENVIRONMENT}-latest"
              
              sh """
                echo "🐳 Construyendo imagen Web-Admin..."
                docker build --no-cache -t ${env.ADMIN_IMAGE} -t ${env.ADMIN_IMAGE_LATEST} .
                echo "✅ Imagen Web-Admin: ${env.ADMIN_IMAGE}"
              """
            }
          }
          
          // Web-Client
          dir('Web-Client') {
            script {
              env.CLIENT_IMAGE = "${IMAGE_BASE}-client:${env.ENVIRONMENT}-${commitHash}"
              env.CLIENT_IMAGE_LATEST = "${IMAGE_BASE}-client:${env.ENVIRONMENT}-latest"
              
              sh """
                echo "🐳 Construyendo imagen Web-Client..."
                docker build --no-cache -t ${env.CLIENT_IMAGE} -t ${env.CLIENT_IMAGE_LATEST} .
                echo "✅ Imagen Web-Client: ${env.CLIENT_IMAGE}"
              """
            }
          }
        }
      }
    }

    stage('Desplegar Aplicaciones') {
      steps {
        script {
          def networkName = "${NETWORK_PREFIX}-frontend-${env.ENVIRONMENT}"
          
          // Crear red para frontend si es necesario
          sh "docker network create ${networkName} 2>/dev/null || true"
          
          // Variables de entorno para las aplicaciones
          def adminEnv = """
            -e NODE_ENV=production
            -e NEXT_PUBLIC_ENVIRONMENT=${env.ENVIRONMENT}
            -e NEXT_PUBLIC_API_URL=${env.BACKEND_URL}
            -e NEXT_PUBLIC_BACKEND_URL=${env.BACKEND_URL}
          """
          
          def clientEnv = """
            -e NODE_ENV=production
            -e NEXT_PUBLIC_ENVIRONMENT=${env.ENVIRONMENT}
            -e NEXT_PUBLIC_API_URL=${env.BACKEND_URL}
            -e NEXT_PUBLIC_BACKEND_URL=${env.BACKEND_URL}
          """
          
          // Desplegar Web-Admin
          sh """
            echo "🚀 Desplegando Web-Admin en puerto ${env.ADMIN_PORT}..."
            
            # Limpiar contenedor anterior
            docker stop urbantracker-admin-${env.ENVIRONMENT} 2>/dev/null || true
            docker rm urbantracker-admin-${env.ENVIRONMENT} 2>/dev/null || true
            
            # Desplegar Web-Admin
            docker run -d --name urbantracker-admin-${env.ENVIRONMENT} \\
              --network ${networkName} \\
              -p ${env.ADMIN_PORT}:3000 \\
              ${adminEnv} \\
              --restart unless-stopped \\
              ${env.ADMIN_IMAGE}
            
            echo "✅ Web-Admin desplegado en puerto ${env.ADMIN_PORT}"
          """
          
          // Desplegar Web-Client
          sh """
            echo "🚀 Desplegando Web-Client en puerto ${env.CLIENT_PORT}..."
            
            # Limpiar contenedor anterior
            docker stop urbantracker-client-${env.ENVIRONMENT} 2>/dev/null || true
            docker rm urbantracker-client-${env.ENVIRONMENT} 2>/dev/null || true
            
            # Desplegar Web-Client
            docker run -d --name urbantracker-client-${env.ENVIRONMENT} \\
              --network ${networkName} \\
              -p ${env.CLIENT_PORT}:3000 \\
              ${clientEnv} \\
              --restart unless-stopped \\
              ${env.CLIENT_IMAGE}
            
            echo "✅ Web-Client desplegado en puerto ${env.CLIENT_PORT}"
          """
        }
      }
    }

    stage('Verificar Despliegue') {
      steps {
        script {
          sh '''
            sleep 15
            echo "📊 Estado de contenedores frontend:"
            docker ps -a --filter "name=urbantracker"
          '''
          
          // Health check Web-Admin
          sh """
            echo "🔍 Health check Web-Admin en puerto ${env.ADMIN_PORT}..."
            curl -f -sS --connect-timeout 10 --max-time 15 http://localhost:${env.ADMIN_PORT} && {
              echo "✅ Web-Admin respondiendo correctamente"
            } || {
              echo "⚠️ Web-Admin puede estar iniciando..."
              docker logs urbantracker-admin-${env.ENVIRONMENT} --tail 10
            }
          """
          
          // Health check Web-Client
          sh """
            echo "🔍 Health check Web-Client en puerto ${env.CLIENT_PORT}..."
            curl -f -sS --connect-timeout 10 --max-time 15 http://localhost:${env.CLIENT_PORT} && {
              echo "✅ Web-Client respondiendo correctamente"
            } || {
              echo "⚠️ Web-Client puede estar iniciando..."
              docker logs urbantracker-client-${env.ENVIRONMENT} --tail 10
            }
          """
        }
      }
    }
  }

  post {
    success {
      script {
        echo "🎉 ¡Despliegue frontend exitoso!"
        echo "📊 Aplicaciones en ${env.ENVIRONMENT}:"
        echo "   - Web-Admin: http://localhost:${env.ADMIN_PORT}"
        echo "   - Web-Client: http://localhost:${env.CLIENT_PORT}"
        echo "   - Backend URL: ${env.BACKEND_URL}"
        echo "   - Imágenes Docker:"
        echo "     * ${env.ADMIN_IMAGE}"
        echo "     * ${env.CLIENT_IMAGE}"
      }
    }
    
    failure {
      script {
        echo "💥 Error en despliegue frontend ${env.ENVIRONMENT}"
        sh '''
          docker logs urbantracker-admin-${ENVIRONMENT} --tail 15 2>/dev/null || true
          docker logs urbantracker-client-${ENVIRONMENT} --tail 15 2>/dev/null || true
          docker ps -a --filter "name=urbantracker"
        '''
      }
    }
    
    always {
      script {
        if (env.CLEANUP_ENABLED == 'true') {
          echo "🧹 Limpieza automática para frontend ${env.ENVIRONMENT}..."
          sh """
            docker stop urbantracker-admin-${ENVIRONMENT} 2>/dev/null || true
            docker rm urbantracker-admin-${ENVIRONMENT} 2>/dev/null || true
            docker stop urbantracker-client-${ENVIRONMENT} 2>/dev/null || true
            docker rm urbantracker-client-${ENVIRONMENT} 2>/dev/null || true
            docker network rm ${NETWORK_PREFIX}-frontend-${ENVIRONMENT} 2>/dev/null || true
            echo "✅ Limpieza frontend completada"
          """
        } else {
          echo "🔒 Contenedores frontend mantenidos para ${env.ENVIRONMENT}"
        }
      }
    }
  }
}