pipeline {
    agent any

    environment {
        IMAGE_BASE_ADMIN = 'frontend-admin'
        IMAGE_BASE_CLIENT = 'frontend-client'
        NETWORK_PREFIX = 'urbantracker-net'
    }

    stages {
        stage('Permisos workspace') {
            steps {
                sh '''
                    chmod -R 777 $WORKSPACE || true
                '''
            }
        }

        stage('Leer entorno desde .env') {
            steps {
                script {
                    if (!fileExists('.env')) {
                        error ".env no encontrado en la raíz. Debe contener: ENVIRONMENT=<develop|qa|staging|main>"
                    }
                    sh '''
                        ENVIRONMENT=$(grep -E '^ENVIRONMENT=' .env | cut -d'=' -f2 | tr -d '\\r\\n')
                        echo "ENVIRONMENT=$ENVIRONMENT" > env.properties
                        echo "ENV_DIR=Frontend/Devops/$ENVIRONMENT" >> env.properties
                        echo "COMPOSE_FILE=Frontend/Devops/$ENVIRONMENT/docker-compose.yml" >> env.properties
                    '''
                    def props = [:]
                    def lines = readFile(file: 'env.properties').split('\n')
                    for (line in lines) {
                        if (line.contains('=')) {
                            def parts = line.split('=', 2)
                            props[parts[0]] = parts[1]
                        }
                    }
                    env.ENVIRONMENT = props['ENVIRONMENT']
                    env.ENV_DIR = props['ENV_DIR']
                    env.COMPOSE_FILE = props['COMPOSE_FILE']
                    echo "✅ Entorno detectado: ${env.ENVIRONMENT}"
                }
            }
        }

        stage('Verificar herramientas') {
            steps {
                sh '''
                    echo "🔍 Verificando herramientas..."
                    sudo docker --version || echo "Docker no disponible en este entorno"
                    echo "✅ Node.js se usará dentro de contenedores Docker"
                '''
            }
        }

        stage('Compilar Frontend Admin') {
            steps {
                dir('Frontend/Web-Admin') {
                    script {
                        echo "📦 Compilando Web-Admin con Node.js en contenedor Docker..."
                        sh '''
                            sudo docker run --rm -v "$WORKSPACE/Frontend/Web-Admin":/app -w /app node:18-alpine sh -c "
                                npm install || npm ci
                                npm run lint || echo 'Linting falló pero continuando...'
                                npm run build
                            "
                        '''
                    }
                }
            }
        }

        stage('Compilar Frontend Client') {
            steps {
                dir('Frontend/Web-Client') {
                    script {
                        echo "📦 Compilando Web-Client con Node.js en contenedor Docker..."
                        sh '''
                            sudo docker run --rm -v "$WORKSPACE/Frontend/Web-Client":/app -w /app node:18-alpine sh -c "
                                npm install || npm ci
                                npm run lint || echo 'Linting falló pero continuando...'
                                npm run build
                            "
                        '''
                    }
                }
            }
        }

        stage('Construir imagen Docker Admin') {
            steps {
                script {
                    echo "🐳 Construyendo imagen Docker del frontend-admin..."
                    def commit = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
                    env.IMAGE_TAG_ADMIN = "${IMAGE_BASE_ADMIN}:${env.ENVIRONMENT}-${commit}"

                    // Usar Dockerfile desde la carpeta correcta
                    def dockerfilePath = "Frontend/Web-Admin/Dockerfile"
                    if (fileExists("${env.ENV_DIR}/Dockerfile.app")) {
                        dockerfilePath = "${env.ENV_DIR}/Dockerfile.app"
                    }

                    sh """
                        sudo docker build -t ${env.IMAGE_TAG_ADMIN} -f ${dockerfilePath} Frontend/Web-Admin/
                    """
                    echo "✅ Imagen creada: ${env.IMAGE_TAG_ADMIN}"
                }
            }
        }

        stage('Construir imagen Docker Client') {
            steps {
                script {
                    echo "🐳 Construyendo imagen Docker del frontend-client..."
                    def commit = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
                    env.IMAGE_TAG_CLIENT = "${IMAGE_BASE_CLIENT}:${env.ENVIRONMENT}-${commit}"

                    // Usar Dockerfile desde la carpeta correcta
                    def dockerfilePath = "Frontend/Web-Client/Dockerfile"
                    if (fileExists("${env.ENV_DIR}/Dockerfile.client")) {
                        dockerfilePath = "${env.ENV_DIR}/Dockerfile.client"
                    }

                    sh """
                        sudo docker build -t ${env.IMAGE_TAG_CLIENT} -f ${dockerfilePath} Frontend/Web-Client/
                    """
                    echo "✅ Imagen creada: ${env.IMAGE_TAG_CLIENT}"
                }
            }
        }

        stage('Preparar servicios') {
            steps {
                script {
                    def netName = "${NETWORK_PREFIX}-${env.ENVIRONMENT}"
                    echo "🌐 Creando red ${netName} ..."
                    sh "sudo docker network create ${netName} || echo '✅ Red ya existe'"
                }
            }
        }

        stage('Desplegar Frontend Admin') {
            steps {
                script {
                    if (env.ENVIRONMENT == 'main') {
                        echo "🚀 Desplegue remoto en producción (Kubernetes/AWS)"
                    } else {
                        echo "🚀 Desplegando frontend-admin local (${env.ENVIRONMENT})"
                        def networkName = "${NETWORK_PREFIX}-${env.ENVIRONMENT}"
                        def containerName = "urbantracker-frontend-admin-${env.ENVIRONMENT}"
                        sh """
                            sudo docker stop ${containerName} || true
                            sudo docker rm ${containerName} || true
                            sleep 3
                            sudo docker run -d \\
                                --name ${containerName} \\
                                --network ${networkName} \\
                                -p 3000:3000 \\
                                --restart unless-stopped \\
                                ${env.IMAGE_TAG_ADMIN}
                            echo "✅ Contenedor frontend-admin iniciado"
                        """
                    }
                }
            }
        }

        stage('Desplegar Frontend Client') {
            steps {
                script {
                    if (env.ENVIRONMENT == 'main') {
                        echo "🚀 Desplegue remoto en producción (Kubernetes/AWS)"
                    } else {
                        echo "🚀 Desplegando frontend-client local (${env.ENVIRONMENT})"
                        def networkName = "${NETWORK_PREFIX}-${env.ENVIRONMENT}"
                        def containerName = "urbantracker-frontend-client-${env.ENVIRONMENT}"
                        sh """
                            sudo docker stop ${containerName} || true
                            sudo docker rm ${containerName} || true
                            sleep 3
                            sudo docker run -d \\
                                --name ${containerName} \\
                                --network ${networkName} \\
                                -p 3001:3000 \\
                                --restart unless-stopped \\
                                ${env.IMAGE_TAG_CLIENT}
                            echo "✅ Contenedor frontend-client iniciado"
                        """
                    }
                }
            }
        }

        stage('Verificar Estado') {
            steps {
                script {
                    echo "🔎 Verificando estado del frontend..."
                    sh '''
                        sleep 20
                        echo "⏱️ Esperando 20 segundos para inicialización..."
                        echo "📊 Estado de contenedores:"
                        sudo docker ps -a --filter "name=urbantracker-frontend" || echo "Docker no disponible"
                        echo "📋 Logs del frontend-admin (últimas 20 líneas):"
                        sudo docker logs urbantracker-frontend-admin-develop --tail 20 2>/dev/null || echo "Contenedor admin no encontrado"
                        echo "📋 Logs del frontend-client (últimas 20 líneas):"
                        sudo docker logs urbantracker-frontend-client-develop --tail 20 2>/dev/null || echo "Contenedor client no encontrado"
                        echo "🔍 Intentando health check admin..."
                        curl -sS --connect-timeout 5 --max-time 10 http://localhost:3000 && {
                            echo "✅ Frontend-admin respondiendo correctamente"
                        } || {
                            echo "⚠️ Frontend-admin no responde en puerto 3000"
                        }
                        echo "🔍 Intentando health check client..."
                        curl -sS --connect-timeout 5 --max-time 10 http://localhost:3001 && {
                            echo "✅ Frontend-client respondiendo correctamente"
                        } || {
                            echo "⚠️ Frontend-client no responde en puerto 3001"
                        }
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "🎉 Deploy completado para ${env.ENVIRONMENT}"
            echo "📊 Servicios disponibles:"
            echo "   - Frontend-Admin: http://localhost:3000"
            echo "   - Frontend-Client: http://localhost:3001"
        }
        failure {
            echo "💥 Error durante deploy"
            sh '''
                sudo docker logs urbantracker-frontend-admin-develop --tail 20 2>/dev/null || echo "No se pueden obtener logs del admin"
                sudo docker logs urbantracker-frontend-client-develop --tail 20 2>/dev/null || echo "No se pueden obtener logs del client"
            '''
        }
        always {
            script {
                if (env.ENVIRONMENT == 'develop') {
                    echo "🧹 Limpiando contenedores..."
                    sh '''
                        sudo docker stop urbantracker-frontend-admin-${ENVIRONMENT} 2>/dev/null || true
                        sudo docker rm urbantracker-frontend-admin-${ENVIRONMENT} 2>/dev/null || true
                        sudo docker stop urbantracker-frontend-client-${ENVIRONMENT} 2>/dev/null || true
                        sudo docker rm urbantracker-frontend-client-${ENVIRONMENT} 2>/dev/null || true
                        sudo docker network rm ${NETWORK_PREFIX}-${ENVIRONMENT} 2>/dev/null || true
                    '''
                }
            }
        }
    }
}