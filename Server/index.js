const express = require("express");
const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
app.set("trust proxy", true);

// —— Health (primero)
app.get("/health", (_req, res) => res.json({ ok: true }));

// —— Forzar HTTPS a :444 (si llega por HTTP)
app.use((req, res, next) => {
  if (req.path.startsWith("/.well-known/acme-challenge")) return next();
  const isHttps = req.secure || req.headers["x-forwarded-proto"] === "https";
  if (isHttps) return next();

  const host = req.headers.host || "";
  const domain = process.env.DOMAIN || "";
  if (domain && host.includes(domain)) {
    const bareHost = host.split(":")[0];
    return res.redirect(`https://${bareHost}:444${req.url}`);
  }
  next();
});

// —— ACME para certbot
const ACME_ROOT = "/var/www/certbot";
app.use("/.well-known", express.static(path.join(ACME_ROOT, ".well-known")));

// —— Proxies (una sola instancia por destino)
const FRONTEND_TARGET = process.env.FRONTEND_TARGET || "http://frontend:80";
const API_TARGET = process.env.API_TARGET || "http://rtc_api:3001";

const apiProxy = createProxyMiddleware({
  target: API_TARGET,
  changeOrigin: true,
  ws: true,
  autoRewrite: true,
  pathRewrite: { "^/api": "" }, // /api/foo -> /foo en la API
  logLevel: "info",
  proxyTimeout: 15000,
  timeout: 15000,
});

const spaProxy = createProxyMiddleware({
  target: FRONTEND_TARGET,
  changeOrigin: true,
  autoRewrite: true,
  logLevel: "info",
  proxyTimeout: 15000,
  timeout: 15000,
});

// —— 1) API bajo /api (cubre GET/POST/OPTIONS/etc. en /api)
app.use("/api", apiProxy);

// —— 2) Compatibilidad: toda petición NO GET/HEAD -> API (incluye OPTIONS, POST, PUT, DELETE, PATCH)
app.use((req, res, next) => {
  if (req.path.startsWith("/.well-known") || req.path === "/health")
    return next();
  const method = req.method.toUpperCase();
  if (method !== "GET" && method !== "HEAD") {
    return apiProxy(req, res, next);
  }
  return next();
});

// —— 3) Todo lo demás (GET/HEAD de SPA/estáticos) -> frontend
app.use((req, res, next) => {
  if (req.path.startsWith("/.well-known") || req.path === "/health")
    return next();
  return spaProxy(req, res, next);
});

// —— Servidor HTTP
const httpServer = http.createServer(app);
httpServer.keepAliveTimeout = 65000;
httpServer.headersTimeout = 66000;
// WS sobre HTTP (si tu API usa websockets)
httpServer.on("upgrade", (req, socket, head) => {
  if (req.url && req.url.startsWith("/api")) {
    apiProxy.upgrade(req, socket, head);
  } else {
    socket.destroy();
  }
});
httpServer.listen(8080, "0.0.0.0", () => console.log("HTTP listo en :8080"));

// —— Servidor HTTPS
const DOMAIN = process.env.DOMAIN || "cycwebcobperu.net";
const LIVE_DIR = `/etc/letsencrypt/live/${DOMAIN}`;
const KEY = path.join(LIVE_DIR, "privkey.pem");
const CERT = path.join(LIVE_DIR, "fullchain.pem");

let httpsServer;
if (fs.existsSync(KEY) && fs.existsSync(CERT)) {
  const options = { key: fs.readFileSync(KEY), cert: fs.readFileSync(CERT) };
  httpsServer = https.createServer(options, app);
  httpsServer.keepAliveTimeout = 65000;
  httpsServer.headersTimeout = 66000;
  httpsServer.on("upgrade", (req, socket, head) => {
    if (req.url && req.url.startsWith("/api")) {
      apiProxy.upgrade(req, socket, head);
    } else {
      socket.destroy();
    }
  });
  httpsServer.listen(444, "0.0.0.0", () =>
    console.log(`HTTPS listo en :444 para ${DOMAIN}`)
  );
} else {
  console.warn("⚠️ Certificados no encontrados en", LIVE_DIR);
}

// —— Cierre elegante
process.on("SIGTERM", () => {
  console.log("SIGTERM recibido, cerrando Server...");
  httpServer.close(() => process.exit(0));
});
