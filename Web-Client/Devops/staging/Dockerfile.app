# Dockerfile de Staging para Web-Client
FROM node:18-alpine AS base

# Instalar dependencias globales necesarias
RUN apk add --no-cache git curl

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json para cache de dependencias
COPY package*.json ./

# Instalar solo las dependencias de producción para staging
RUN npm ci --only=production && npm cache clean --force

# Copiar el código fuente
COPY . .

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Crear directorio para datos de Next.js
RUN mkdir -p /app/.next/cache && \
    chown -R nextjs:nodejs /app/.next

# Cambiar a usuario no-root
USER nextjs

# Variables de entorno para Staging
ENV NODE_ENV=staging
ENV NEXT_TELEMETRY_DISABLED=1

# Comando para ejecutar en staging
CMD ["npm", "run", "start"]