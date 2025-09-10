FROM node:20-alpine

RUN addgroup -S app && adduser -S app -G app
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev || npm i --omit=dev

COPY . .

USER app
EXPOSE 8080 444

# Healthcheck HTTP (ajusta la ruta si tienes /health)
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/health || exit 1

CMD ["node", "index.js"]
