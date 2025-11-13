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
          sh '''
            ENVIRONMENT=$(grep -E '^ENVIRONMENT=' .env | cut -d'=' -f2 | tr -d '\r\n')
            echo "ENVIRONMENT=$ENVIRONMENT" > env.properties
            echo "ENV_DIR=Frontend/Devops/$ENVIRONMENT" >> env.properties
            echo "COMPOSE_FILE=Frontend/Devops/$ENVIRONMENT/docker-compose.yml" >> env.properties
          '''
          def props = readProperties file: 'env.properties'
          env.ENVIRONMENT = props['ENVIRONMENT']
          echo "✅ Entorno detectado: ${env.ENVIRONMENT}"
        }
      }
    }

    

    stage('Verificar herramientas') {
      steps {
        sh '''
          echo "🔍 Verificando herramientas..."
          docker --version
          node --version || true
          npm --version || true
        '''
      }
    }

    
    

    stage('Construir imagen Docker') {
      steps {
        script {
          echo "🐳 Construyendo imágenes Docker del portal..."
          def commit = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
          env.IMAGE_TAG_WEB_ADMIN = "web-admin:${env.ENVIRONMENT}-${commit}"
          env.IMAGE_TAG_WEB_CLIENT = "web-client:${env.ENVIRONMENT}-${commit}"
          sh """
            docker build --pull -t ${env.IMAGE_TAG_WEB_ADMIN} -f Frontend/Web-Admin/Dockerfile Frontend/Web-Admin
            docker build --pull -t ${env.IMAGE_TAG_WEB_CLIENT} -f Frontend/Web-Client/Dockerfile Frontend/Web-Client
          """
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
            echo "✅ Contenedores portal iniciados"
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
            docker logs urbantracker-web-admin-${ENVIRONMENT} --tail 20 || true
            echo "📋 Logs Web-Client (últimas 20 líneas):";
            docker logs urbantracker-web-client-${ENVIRONMENT} --tail 20 || true
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
      echo "🎉 Deploy completado para ${env.ENVIRONMENT}"
      echo "Tags:"
      if (env.IMAGE_TAG_WEB_ADMIN) echo " - Admin: ${env.IMAGE_TAG_WEB_ADMIN}"
      if (env.IMAGE_TAG_WEB_CLIENT) echo " - Client: ${env.IMAGE_TAG_WEB_CLIENT}"
      echo "📊 Servicios disponibles:"
      echo " - Web-Admin: http://localhost:3001"
      echo " - Web-Client: http://localhost:3002"
    }
    failure {
      echo "💥 Error durante deploy"
      script {
        sh '''
          docker logs urbantracker-web-admin-${ENVIRONMENT} --tail 50 2>/dev/null || true
          docker logs urbantracker-web-client-${ENVIRONMENT} --tail 50 2>/dev/null || true
        '''
      }
    }
    always {
      script {
        if (env.ENVIRONMENT == 'develop') {
          sh '''
            docker stop urbantracker-web-admin-develop 2>/dev/null || true
            docker rm urbantracker-web-admin-develop 2>/dev/null || true
            docker stop urbantracker-web-client-develop 2>/dev/null || true
            docker rm urbantracker-web-client-develop 2>/dev/null || true
            docker network rm ${NETWORK_PREFIX}-develop 2>/dev/null || true
          '''
        }
      }
    }
  }
}
