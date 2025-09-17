FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

ARG REACT_APP_ROUTE_API
ARG REACT_APP_ROUTE_BASE
ARG REACT_APP_ROUTE_IMAGE
ARG REACT_APP_RECAPTCHA_SITE_KEY
ENV REACT_APP_ROUTE_API=${REACT_APP_ROUTE_API}
ENV REACT_APP_ROUTE_BASE=${REACT_APP_ROUTE_BASE}
ENV REACT_APP_ROUTE_IMAGE=${REACT_APP_ROUTE_IMAGE}
ENV REACT_APP_RECAPTCHA_SITE_KEY=${REACT_APP_RECAPTCHA_SITE_KEY}

COPY . .
RUN npm run build

FROM nginx:1.27-alpine

COPY --from=builder /app/build /usr/share/nginx/html

COPY <<'NGINX' /etc/nginx/conf.d/default.conf
server {
  listen 80;
  server_name _;

  location ~* \.(js|css|png|jpg|jpeg|gif|svg|woff2?)$ {
    root /usr/share/nginx/html;
    add_header Cache-Control "public, max-age=31536000, immutable";
    try_files $uri =404;
  }

  location / {
    root /usr/share/nginx/html;
    try_files $uri /index.html;
  }
}
NGINX
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ || exit 1
