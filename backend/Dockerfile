# FROM node:20-alpine

# RUN addgroup -S app && adduser -S app -G app
# WORKDIR /app

# ENV NODE_ENV=production
# ENV PORT=3001

# COPY package*.json ./
# RUN npm ci --omit=dev

# COPY . .

# # 👇 Crea y entrega permisos del árbol de /app al usuario 'app'
# RUN mkdir -p /app/logs && chown -R app:app /app

# RUN npm i -g pm2

# USER app
# EXPOSE 3001

# HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
#   CMD wget -qO- http://127.0.0.1:3001/health || exit 1

# CMD ["pm2-runtime","server.js","-i","2"]

# Utiliza la imagen de node js 20.18.1
FROM node:20.18-alpine

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de la aplicación
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia los archivos de la aplicación
COPY . .

# Expone el puerto 3005
EXPOSE 8081

# Inicia la aplicación
CMD ["node", "server.js"]