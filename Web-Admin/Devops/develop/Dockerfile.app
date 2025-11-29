# Dockerfile de desarrollo para Web-Admin
FROM node:20-alpine

# Instalar dependencias globales útiles para desarrollo
RUN apk add --no-cache git

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json primero para cache de dependencias
COPY package*.json ./

# Instalar todas las dependencias (incluyendo devDependencies)
RUN npm ci

# Copiar el código fuente
COPY . .

# Crear directorio para datos persistentes si es necesario
RUN mkdir -p /app/.next/cache

# Exponer el puerto de desarrollo (Next.js usa 3000 por defecto)
EXPOSE 3000

# Variables de entorno para desarrollo
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

# Comando para ejecutar en modo desarrollo con recarga automática
CMD ["npm", "run", "dev", "--", "-p", "3001"]