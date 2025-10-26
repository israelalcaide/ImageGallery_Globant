
# Dockerfile para solución mínima: Node.js sirve API y estáticos
FROM node:20-alpine
WORKDIR /app
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
