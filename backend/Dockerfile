FROM node:20-alpine

# Usuario no-root
RUN addgroup -S app && adduser -S app -G app
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# PM2 para cluster de 2 workers (2 vCPU)
RUN npm i -g pm2

USER app
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3001/health || exit 1

CMD ["pm2-runtime","server.js","-i","2"]
