# Dockerfile de QA para Web-Admin
FROM node:20-alpine AS base

# Instalar dependencias globales necesarias
RUN apk add --no-cache git curl

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json para cache de dependencias
COPY package*.json ./

# Instalar dependencias (incluye devDependencies para QA)
RUN npm ci && npm cache clean --force

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

# Variables de entorno para QA
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Comando para ejecutar en producción (QA)
CMD ["npm", "run", "start"]