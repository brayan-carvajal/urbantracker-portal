pipeline {
    agent any

    environment {
        DOCKER_CLI_HINTS = "off"
        IMAGE_BASE_ADMIN = 'frontend-admin'
        IMAGE_BASE_CLIENT = 'frontend-client'
        NETWORK_PREFIX = 'urbantracker-net'
    }

    stages {

        // 1️⃣ Leer entorno desde .env raíz
        stage('Leer entorno desde .env raíz') {
            steps {
                sh '''
                    echo "📂 Leyendo entorno desde .env raíz..."

                    ENVIRONMENT=$(grep '^ENVIRONMENT=' .env | cut -d '=' -f2 | tr -d '\\r\\n')
                    if [ -z "$ENVIRONMENT" ]; then
                        echo "❌ No se encontró ENVIRONMENT en .env"
                        exit 1
                    fi

                    echo "ENVIRONMENT=$ENVIRONMENT" > env.properties
                    echo "ENV_DIR=Frontend/Devops/$ENVIRONMENT" >> env.properties
                    echo "COMPOSE_FILE=Frontend/Devops/$ENVIRONMENT/docker-compose.yml" >> env.properties
                '''

                script {
                    def props = readProperties file: 'env.properties'
                    env.ENVIRONMENT = props.ENVIRONMENT
                    env.ENV_DIR = props.ENV_DIR
                    env.COMPOSE_FILE = props.COMPOSE_FILE

                    echo """
                    ✅ Entorno: ${env.ENVIRONMENT}
                    📄 Compose: ${env.COMPOSE_FILE}
                    📁 Env dir: ${env.ENV_DIR}
                    """
                }
            }
        }

        // 2️⃣ Preparación Docker
        stage('Preparar entorno Docker') {
            steps {
                sh '''
                    echo "🧹 Limpiando imágenes..."
                    sudo docker image prune -f || true

                    echo "🌐 Verificando red..."
                    sudo docker network create ${NETWORK_PREFIX}-${ENVIRONMENT} || true
                '''
            }
        }

        // 3️⃣ Verificar herramientas
        stage('Verificar herramientas') {
            steps {
                sh '''
                    echo "🔍 Docker versión:"
                    sudo docker --version
                '''
            }
        }

        // 4️⃣ Compilar Frontend Admin
        stage('Compilar Frontend Admin') {
            steps {
                dir('Frontend/Web-Admin') {
                    sh '''
                        echo "📦 Compilando Web-Admin..."

                        echo "Directorio actual: $PWD"
                        ls -la

                        sudo docker run --rm \
                            -v "$PWD":/app \
                            -w /app \
                            node:18-alpine sh -c "
                                npm install || npm ci
                                npm run lint || echo '⚠️ Lint falló, continuando...'
                                npm run build
                            "
                    '''
                }
            }
        }

        // 5️⃣ Compilar Frontend Client
        stage('Compilar Frontend Client') {
            steps {
                dir('Frontend/Web-Client') {
                    sh '''
                        echo "📦 Compilando Web-Client..."

                        echo "Directorio actual: $PWD"
                        ls -la

                        sudo docker run --rm \
                            -v "$PWD":/app \
                            -w /app \
                            node:18-alpine sh -c "
                                npm install || npm ci
                                npm run lint || echo '⚠️ Lint falló, continuando...'
                                npm run build
                            "
                    '''
                }
            }
        }

        // 6️⃣ Construir imagen Docker Admin
        stage('Construir imagen Docker Admin') {
            steps {
                script {
                    def commit = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
                    env.IMAGE_TAG_ADMIN = "${IMAGE_BASE_ADMIN}:${env.ENVIRONMENT}-${commit}"

                    def dockerfilePath = fileExists("${env.ENV_DIR}/Dockerfile.app")
                        ? "${env.ENV_DIR}/Dockerfile.app"
                        : "Frontend/Web-Admin/Dockerfile"

                    sh """
                        sudo docker build -t ${env.IMAGE_TAG_ADMIN} \
                        -f ${dockerfilePath} Frontend/Web-Admin/
                    """
                }
            }
        }

        // 7️⃣ Construir imagen Docker Client
        stage('Construir imagen Docker Client') {
            steps {
                script {
                    def commit = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
                    env.IMAGE_TAG_CLIENT = "${IMAGE_BASE_CLIENT}:${env.ENVIRONMENT}-${commit}"

                    def dockerfilePath = fileExists("${env.ENV_DIR}/Dockerfile.client")
                        ? "${env.ENV_DIR}/Dockerfile.client"
                        : "Frontend/Web-Client/Dockerfile"

                    sh """
                        sudo docker build -t ${env.IMAGE_TAG_CLIENT} \
                        -f ${dockerfilePath} Frontend/Web-Client/
                    """
                }
            }
        }

        // 8️⃣ Deploy Admin
        stage('Desplegar Frontend Admin') {
            steps {
                script {
                    if (env.ENVIRONMENT != 'main') {
                        def containerName = "urbantracker-frontend-admin-${env.ENVIRONMENT}"
                        def networkName = "${NETWORK_PREFIX}-${env.ENVIRONMENT}"

                        sh """
                            sudo docker stop ${containerName} || true
                            sudo docker rm ${containerName} || true

                            sudo docker run -d \
                                --name ${containerName} \
                                --network ${networkName} \
                                -p 3000:3000 \
                                --restart unless-stopped \
                                ${env.IMAGE_TAG_ADMIN}
                        """
                    }
                }
            }
        }

        // 9️⃣ Deploy Client
        stage('Desplegar Frontend Client') {
            steps {
                script {
                    if (env.ENVIRONMENT != 'main') {
                        def containerName = "urbantracker-frontend-client-${env.ENVIRONMENT}"
                        def networkName = "${NETWORK_PREFIX}-${env.ENVIRONMENT}"

                        sh """
                            sudo docker stop ${containerName} || true
                            sudo docker rm ${containerName} || true

                            sudo docker run -d \
                                --name ${containerName} \
                                --network ${networkName} \
                                -p 3001:3000 \
                                --restart unless-stopped \
                                ${env.IMAGE_TAG_CLIENT}
                        """
                    }
                }
            }
        }

        // 🔟 Verificar Estado
        stage('Verificar Estado') {
            steps {
                sh '''
                    echo "⏱️ Esperando 20s para inicialización..."
                    sleep 20

                    echo "📋 Contenedores:"
                    sudo docker ps --filter "name=urbantracker"

                    echo "🔍 Healthcheck Admin..."
                    curl -s http://localhost:3000 || echo "⚠️ Admin no responde"

                    echo "🔍 Healthcheck Client..."
                    curl -s http://localhost:3001 || echo "⚠️ Client no responde"
                '''
            }
        }
    }

    post {
        success {
            echo "🎉 Deploy completado para ${env.ENVIRONMENT}"
        }
        failure {
            echo "💥 Error durante deploy"
        }
        always {
            script {
                if (env.ENVIRONMENT == 'develop') {
                    sh '''
                        sudo docker stop urbantracker-frontend-admin-${ENVIRONMENT} || true
                        sudo docker rm urbantracker-frontend-admin-${ENVIRONMENT} || true
                        sudo docker stop urbantracker-frontend-client-${ENVIRONMENT} || true
                        sudo docker rm urbantracker-frontend-client-${ENVIRONMENT} || true
                        sudo docker network rm ${NETWORK_PREFIX}-${ENVIRONMENT} || true
                    '''
                }
            }
        }
    }
}
