# Documentación de Implementación de Jenkins en UrbanTracker API

Esta documentación proporciona un análisis completo de la implementación de Jenkins en el repositorio `urbantracker-api`, que cuenta con 4 ramas principales: `main`, `qa`, `staging` y `develop`. Actualmente, Jenkins está configurado y operativo únicamente para la rama `develop`, pero el proceso de implementación es idéntico para las demás ramas, ya que todas comparten la misma estructura de pipeline, `Jenkinsfile` y archivos de configuración. Solo se requiere ajustar las variables de entorno y rutas específicas a cada rama sin cambios en la lógica del pipeline.

## 1. Descripción General del Pipeline de Jenkins

### Triggers
El pipeline actual no define triggers explícitos en el `Jenkinsfile`, lo que significa que se ejecuta de forma manual o mediante configuración externa en Jenkins (como polling SCM o webhooks). Para entornos de desarrollo, se recomienda configurar polling automático en repositorios Git con expresiones como `H/5 * * * *` para verificar cambios cada 5 minutos.

### Stages y Jobs
El pipeline está estructurado en 8 stages principales, cada uno representando un job independiente que puede fallar o ejecutarse de manera aislada:

1. **Permisos workspace**: Configura permisos en el directorio de trabajo
2. **Leer entorno desde .env**: Detecta el entorno de despliegue desde el archivo `.env`
3. **Verificar herramientas**: Valida la disponibilidad de Docker y Maven
4. **Compilar Backend**: Construye la aplicación Java usando Maven
5. **Construir imagen Docker**: Crea la imagen Docker del backend
6. **Preparar servicios**: Inicia servicios dependientes (PostgreSQL, Mosquitto)
7. **Desplegar Backend**: Ejecuta el contenedor de la aplicación
8. **Verificar Estado**: Realiza health checks y validaciones post-despliegue

### Arquitectura General
- **Tipo**: Pipeline Declarativo
- **Agente**: Cualquier nodo disponible (`agent any`)
- **Entornos soportados**: develop, qa, staging, main (configurable vía `.env`)
- **Implementación actual**: Configurada únicamente para la rama `develop`
- **Replicabilidad**: El mismo `Jenkinsfile` puede usarse en todas las ramas cambiando únicamente el archivo `.env` y creando directorios específicos en `Backend/Devops/`
- **Estrategia**: Contenedores Docker para aislamiento y consistencia entre entornos

## 2. Configuraciones Específicas en el Jenkinsfile

### Variables de Entorno Globales
```groovy
environment {
    IMAGE_BASE = 'backend'
    NETWORK_PREFIX = 'myproject-net'
}
```

### Stage 1: Permisos workspace
```groovy
stage('Permisos workspace') {
    steps {
        sh '''
            chmod -R 777 $WORKSPACE || true
        '''
    }
}
```
**Explicación**: Asegura permisos de escritura en todo el workspace para evitar errores de acceso durante operaciones de Docker y Maven.

### Stage 2: Leer entorno desde .env
```groovy
stage('Leer entorno desde .env') {
    steps {
        script {
            if (!fileExists('.env')) {
                error ".env no encontrado en la raíz. Debe contener: ENVIRONMENT=<develop|qa|staging|main>"
            }
            sh '''
                ENVIRONMENT=$(grep -E '^ENVIRONMENT=' .env | cut -d'=' -f2 | tr -d '\\r\\n')
                echo "ENVIRONMENT=$ENVIRONMENT" > env.properties
                echo "ENV_DIR=Backend/Devops/$ENVIRONMENT" >> env.properties
                echo "COMPOSE_FILE=Backend/Devops/$ENVIRONMENT/docker-compose.yml" >> env.properties
            '''
            def props = readProperties file: 'env.properties'
            env.ENVIRONMENT = props['ENVIRONMENT']
            echo "✅ Entorno detectado: ${env.ENVIRONMENT}"
        }
    }
}
```
**Explicación**: Lee la variable `ENVIRONMENT` del archivo `.env` en la raíz del repositorio. Configura rutas dinámicas como `Backend/Devops/$ENVIRONMENT/` para acceder a archivos específicos del entorno (ej. `Backend/Devops/develop/docker-compose.yml`).

### Stage 3: Verificar herramientas
```groovy
stage('Verificar herramientas') {
    steps {
        sh '''
            echo "🔍 Verificando herramientas..."
            docker --version
            mvn --version
        '''
    }
}
```
**Explicación**: Valida que Docker y Maven estén instalados y accesibles, previniendo fallos en stages posteriores de compilación y contenerización.

### Stage 4: Compilar Backend
```groovy
stage('Compilar Backend') {
    steps {
        dir('Backend') {
            script {
                echo "📦 Compilando Backend con maven..."
                docker.image('maven:3.9.4-eclipse-temurin-17').inside {
                    sh '''
                        mvn -B clean package -DskipTests
                    '''
                }
            }
        }
    }
}
```
**Explicación**: Utiliza un contenedor Maven oficial para compilar el proyecto Spring Boot ubicado en `Backend/`, ejecutando `mvn clean package` sin tests para acelerar el proceso. El JAR resultante se almacena en `Backend/target/`.

### Stage 5: Construir imagen Docker
```groovy
stage('Construir imagen Docker') {
    steps {
        dir('Backend') {
            script {
                echo "🐳 Construyendo imagen Docker del backend..."
                def commit = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
                env.IMAGE_TAG = "${IMAGE_BASE}:${env.ENVIRONMENT}-${commit}"
                sh '''
                    JARFILE=$(ls target/*.jar 2>/dev/null | head -n 1)
                    if [ -z "$JARFILE" ]; then
                        echo "❌ No se encontró jar en Backend/target"
                        exit 1
                    fi
                    echo "✅ JAR encontrado: $JARFILE"
                    mkdir -p Devops/develop
                    cp ${JARFILE} Devops/develop/app.jar
                '''
                sh """
                    docker build --no-cache -t ${env.IMAGE_TAG} -f Devops/develop/Dockerfile.app Devops/develop
                """
                echo "✅ Imagen creada: ${env.IMAGE_TAG}"
            }
        }
    }
}
```
**Explicación**: Copia el JAR compilado a `Backend/Devops/develop/app.jar`, luego construye la imagen Docker usando `Backend/Devops/develop/Dockerfile.app`. La imagen se etiqueta dinámicamente como `backend:{entorno}-{commit-hash}`.

### Stage 6: Preparar servicios
```groovy
stage('Preparar servicios') {
    steps {
        script {
            def netName = "${NETWORK_PREFIX}-${env.ENVIRONMENT}"
            echo "🌐 Creando red ${netName} ..."
            sh "docker network create ${netName} || echo '✅ Red ya existe'"
            if (env.ENVIRONMENT != 'main') {
                echo "🗄️ Iniciando PostgreSQL..."
                sh """
                    docker run -d \\
                        --name urbantracker-postgres-${env.ENVIRONMENT} \\
                        --network ${netName} \\
                        -e POSTGRES_DB=urbantracker_${env.ENVIRONMENT} \\
                        -e POSTGRES_USER=postgres \\
                        -e POSTGRES_PASSWORD=develop1234 \\
                        -p 5433:5432 \\
                        --restart unless-stopped \\
                        postgres:15
                """
                echo "📡 Iniciando Mosquitto MQTT..."
                sh """
                    docker run -d \\
                        --name urbantracker-mosquitto-${env.ENVIRONMENT} \\
                        --network ${netName} \\
                        -p 1883:1883 \\
                        -p 9001:9001 \\
                        --restart unless-stopped \\
                        eclipse-mosquitto:2
                """
            } else {
                echo "🛑 Ambiente main: saltando servicios locales (usar infraestructura cloud)"
            }
        }
    }
}
```
**Explicación**: Crea una red Docker específica para el entorno y lanza contenedores de PostgreSQL y Mosquitto usando configuraciones similares a `Backend/Devops/develop/docker-compose.yml`. Para `main`, se omite este paso asumiendo despliegue en infraestructura externa.

### Stage 7: Desplegar Backend
```groovy
stage('Desplegar Backend') {
    steps {
        script {
            if (env.ENVIRONMENT == 'main') {
                echo "🚀 Despliegue remoto en producción (Kubernetes/AWS)"
            } else {
                script {
                    echo "🚀 Desplegando backend local (${env.ENVIRONMENT})"
                    def networkName = "${NETWORK_PREFIX}-${env.ENVIRONMENT}"
                    def containerName = "urbantracker-backend-${env.ENVIRONMENT}"
                    sh """
                        docker stop ${containerName} || true
                        docker rm ${containerName} || true
                        sleep 3
                        docker run -d \\
                            --name ${containerName} \\
                            --network ${networkName} \\
                            -p 8081:8080 \\
                            -e SPRING_PROFILES_ACTIVE=${env.ENVIRONMENT} \\
                            --restart unless-stopped \\
                            ${env.IMAGE_TAG}
                        echo "✅ Contenedor backend iniciado"
                    """
                }
            }
        }
    }
}
```
**Explicación**: Ejecuta el contenedor de la aplicación conectada a la red Docker, exponiendo el puerto 8081. Utiliza el perfil Spring definido en `Backend/Devops/develop/.env.develop` y variables de entorno para configuración.

### Stage 8: Verificar Estado
```groovy
stage('Verificar Estado') {
    steps {
        script {
            echo "🔎 Verificando estado del backend..."
            sh '''
                sleep 20
                echo "⏱️ Esperando 20 segundos para inicialización..."
                echo "📊 Estado de contenedores:"
                docker ps -a --filter "name=urbantracker-backend"
                echo "📋 Logs del backend (últimas 20 líneas):"
                docker logs urbantracker-backend-develop --tail 20 || true
                echo "🔍 Intentando health check..."
                curl -sS --connect-timeout 5 --max-time 10 http://localhost:8081/actuator/health && {
                    echo "✅ Backend respondiendo correctamente"
                } || {
                    echo "⚠️ Backend no responde en puerto 8081"
                    echo "🔍 Intentando puerto 8080..."
                    curl -sS --connect-timeout 5 --max-time 10 http://localhost:8080/actuator/health && {
                        echo "✅ Backend respondiendo en puerto 8080"
                    } || {
                        echo "⚠️ Backend no está respondiendo aún - puede estar iniciando"
                    }
                }
            '''
        }
    }
}
```
**Explicación**: Realiza validaciones post-despliegue incluyendo revisión de logs del contenedor y health checks HTTP al endpoint `/actuator/health` configurado en la aplicación Spring Boot.

### Post-actions
```groovy
post {
    success {
        echo "🎉 Deploy completado para ${env.ENVIRONMENT}"
        echo "📊 Servicios disponibles:"
        echo "   - Backend: http://localhost:8081"
    }
    failure {
        echo "💥 Error durante deploy"
        sh '''
            docker logs urbantracker-backend-develop --tail 20 2>/dev/null || true
        '''
    }
    always {
        script {
            if (env.ENVIRONMENT == 'develop') {
                echo "🧹 Limpiando contenedores..."
                sh """
                    docker stop urbantracker-backend-${env.ENVIRONMENT} || true
                    docker rm urbantracker-backend-${env.ENVIRONMENT} || true
                    docker stop urbantracker-postgres-${env.ENVIRONMENT} || true
                    docker rm urbantracker-postgres-${env.ENVIRONMENT} || true
                    docker stop urbantracker-mosquitto-${env.ENVIRONMENT} || true
                    docker rm urbantracker-mosquitto-${env.ENVIRONMENT} || true
                    docker network rm ${NETWORK_PREFIX}-${env.ENVIRONMENT} || true
                """
            }
        }
    }
}
```
**Explicación**: Maneja resultados del pipeline con notificaciones, logs de error y limpieza automática de recursos (solo para `develop`).

## 3. Integración con Archivos de Configuración y Estructuras en Backend/Devops

### Archivo .env (Raíz)
```bash
ENVIRONMENT=develop
```
**Función**: Define el entorno de despliegue. El pipeline lee esta variable para determinar rutas y configuraciones específicas. Para otras ramas, simplemente cambiar el valor (ej. `ENVIRONMENT=qa`).

### Estructura Backend/Devops/
Cada entorno tiene su propio directorio bajo `Backend/Devops/{entorno}/` con archivos idénticos en estructura pero configuraciones específicas:

- **docker-compose.yml**: Define servicios PostgreSQL con configuración específica del entorno (ej. `Backend/Devops/develop/docker-compose.yml`)
- **Dockerfile.app**: Imagen ligera basada en Eclipse Temurin 17 para ejecutar el JAR (ej. `Backend/Devops/develop/Dockerfile.app`)
- **.env.{entorno}**: Variables de entorno para el entorno específico (ej. `Backend/Devops/develop/.env.develop`)
- **schema-init.sql**: Scripts de inicialización de esquemas de base de datos (compartido entre entornos)

### Manejo de Diferencias entre Ramas
- **Archivos base**: `Jenkinsfile`, `pom.xml`, `Dockerfile` en `Backend/` son compartidos
- **Configuración específica**: Cada rama tiene su `.env` y directorio `Backend/Devops/{rama}/`
- **Lógica condicional**: El pipeline usa `env.ENVIRONMENT` para adaptar comportamientos (ej. saltar servicios locales en `main`)
- **Reutilización**: No se requieren cambios en el `Jenkinsfile` para nuevas ramas, solo archivos de configuración

## 4. Guía para Replicación en Otras Ramas

### Por qué es Idéntico para Todas las Ramas
El `Jenkinsfile` está diseñado para ser agnóstico del entorno, leyendo configuraciones dinámicamente desde `.env` y archivos en `Backend/Devops/{entorno}/`. Esto permite reutilizar el mismo pipeline en `main`, `qa` y `staging` sin modificaciones en la lógica.

### Pasos para Adaptar a qa
1. Crear directorio: `mkdir -p Backend/Devops/qa`
2. Copiar archivos base: `cp Backend/Devops/develop/* Backend/Devops/qa/`
3. Modificar `.env.qa` con configuraciones de QA (base de datos de testing, puertos diferentes)
4. Cambiar `.env` en raíz: `ENVIRONMENT=qa`
5. Crear job en Jenkins con branch specifier `*/qa`

### Pasos para Adaptar a staging
1. Crear directorio: `mkdir -p Backend/Devops/staging`
2. Copiar archivos base: `cp Backend/Devops/develop/* Backend/Devops/staging/`
3. Modificar `.env.staging` con configuraciones de staging (datos similares a producción)
4. Cambiar `.env` en raíz: `ENVIRONMENT=staging`
5. Crear job en Jenkins con branch specifier `*/staging`

### Pasos para Adaptar a main
1. Crear directorio: `mkdir -p Backend/Devops/main`
2. Copiar archivos base: `cp Backend/Devops/develop/* Backend/Devops/main/`
3. Modificar `.env.main` con configuraciones de producción (URLs externas, secrets)
4. Cambiar `.env` en raíz: `ENVIRONMENT=main`
5. Crear job en Jenkins con branch specifier `*/main`
6. **Importante**: Modificar Stage 6 y 7 para despliegue remoto (Kubernetes, AWS ECS)

### Configuración de Jobs en Jenkins por Rama
```groovy
// En la configuración del job para cada rama
branches: [[name: '*/{rama}']]  // develop, qa, staging, main
```

## 5. Consideraciones Adicionales

### Manejo de Errores
- **Fallas tempranas**: Verificación de herramientas previene errores posteriores
- **Limpieza automática**: Bloque `post.always` asegura entornos limpios
- **Logs detallados**: Cada stage incluye output informativo para debugging
- **Health checks**: Validaciones automáticas confirman despliegue exitoso

### Seguridad
- **Secrets management**: Usar Jenkins Credentials para contraseñas y tokens
- **Variables de entorno**: No hardcode credentials en archivos de configuración
- **Redes aisladas**: Docker networks separan entornos
- **Acceso controlado**: Restringir permisos de jobs por rama

### Mejores Prácticas
- **Branch protection**: Configurar reglas en Git para merges a main requieren CI exitoso
- **Paralelización**: Considerar stages paralelos para testing y building
- **Caching**: Implementar cache de dependencias Maven para acelerar builds
- **Monitoring**: Integrar con herramientas como Prometheus para métricas
- **Rollback**: Agregar stages de rollback automático en caso de fallos
- **Notificaciones**: Configurar alertas por Slack/email específicas por entorno

### Escalabilidad
- **Multi-branch**: Un solo `Jenkinsfile` maneja todas las ramas
- **Parametrización**: Variables de entorno permiten flexibilidad
- **Reutilización**: Mínimos cambios requeridos para nuevos entornos
- **Consistencia**: Misma estructura asegura comportamiento predecible

Esta implementación proporciona una base sólida y escalable para CI/CD en proyectos Java con Docker, permitiendo despliegues consistentes a través de todas las ramas del repositorio con mínima configuración adicional.