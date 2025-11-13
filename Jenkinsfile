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
                    node --version
                    npm --version
                '''
            }
        }

        stage('Compilar Frontend Admin') {
            steps {
                dir('Frontend/Web-Admin') {
                    script {
                        echo "📦 Compilando Web-Admin con Node.js..."
                        docker.image('node:18-alpine').inside {
                            sh '''
                                npm ci
                                npm run build
                            '''
                        }
                    }
                }
            }
        }

        stage('Compilar Frontend Client') {
            steps {
                dir('Frontend/Web-Client') {
                    script {
                        echo "📦 Compilando Web-Client con Node.js..."
                        docker.image('node:18-alpine').inside {
                            sh '''
                                npm ci
                                npm run build
                            '''
                        }
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
                    sh """
                        docker build -t ${env.IMAGE_TAG_ADMIN} -f Frontend/Devops/develop/Dockerfile.app Frontend/Web-Admin
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
                    sh """
                        docker build -t ${env.IMAGE_TAG_CLIENT} -f Frontend/Devops/develop/Dockerfile.client Frontend/Web-Client
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
                    sh "docker network create ${netName} || echo '✅ Red ya existe'"
                    // No servicios adicionales para frontend
                }
            }
        }

        stage('Desplegar Frontend Admin') {
            steps {
                script {
                    if (env.ENVIRONMENT == 'main') {
                        echo "🚀 Despliegue remoto en producción (Kubernetes/AWS)"
                    } else {
                        script {
                            echo "🚀 Desplegando frontend-admin local (${env.ENVIRONMENT})"
                            def networkName = "${NETWORK_PREFIX}-${env.ENVIRONMENT}"
                            def containerName = "urbantracker-frontend-admin-${env.ENVIRONMENT}"
                            sh """
                                docker stop ${containerName} || true
                                docker rm ${containerName} || true
                                sleep 3
                                docker run -d \\
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
        }

        stage('Desplegar Frontend Client') {
            steps {
                script {
                    if (env.ENVIRONMENT == 'main') {
                        echo "🚀 Despliegue remoto en producción (Kubernetes/AWS)"
                    } else {
                        script {
                            echo "🚀 Desplegando frontend-client local (${env.ENVIRONMENT})"
                            def networkName = "${NETWORK_PREFIX}-${env.ENVIRONMENT}"
                            def containerName = "urbantracker-frontend-client-${env.ENVIRONMENT}"
                            sh """
                                docker stop ${containerName} || true
                                docker rm ${containerName} || true
                                sleep 3
                                docker run -d \\
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
        }

        stage('Verificar Estado') {
            steps {
                script {
                    echo "🔎 Verificando estado del frontend..."
                    sh '''
                        sleep 20
                        echo "⏱️ Esperando 20 segundos para inicialización..."
                        echo "📊 Estado de contenedores:"
                        docker ps -a --filter "name=urbantracker-frontend"
                        echo "📋 Logs del frontend-admin (últimas 20 líneas):"
                        docker logs urbantracker-frontend-admin-develop --tail 20 || true
                        echo "📋 Logs del frontend-client (últimas 20 líneas):"
                        docker logs urbantracker-frontend-client-develop --tail 20 || true
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
                docker logs urbantracker-frontend-admin-develop --tail 20 2>/dev/null || true
                docker logs urbantracker-frontend-client-develop --tail 20 2>/dev/null || true
            '''
        }
        always {
            script {
                if (env.ENVIRONMENT == 'develop') {
                    echo "🧹 Limpiando contenedores..."
                    sh """
                        docker stop urbantracker-frontend-admin-${env.ENVIRONMENT} || true
                        docker rm urbantracker-frontend-admin-${env.ENVIRONMENT} || true
                        docker stop urbantracker-frontend-client-${env.ENVIRONMENT} || true
                        docker rm urbantracker-frontend-client-${env.ENVIRONMENT} || true
                        docker network rm ${NETWORK_PREFIX}-${env.ENVIRONMENT} || true
                    """
                }
            }
        }
    }
}