

# Dockerfile para solución robusta: Node.js sirve API y estáticos
FROM node:20-alpine

# Update apk packages to reduce vulnerabilities
RUN apk update && apk upgrade --no-cache

WORKDIR /app


# Copia package.json y package-lock.json primero para aprovechar el cache de Docker
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copia el resto del código
COPY . .

EXPOSE 3000
CMD ["node", "server.js"]
