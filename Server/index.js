const express = require("express");
const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

// Forzar HTTPS, pero redirigiendo al puerto 444
app.use((req, res, next) => {
  if (req.path.startsWith("/.well-known/acme-challenge")) return next();
  if (req.secure || req.headers["x-forwarded-proto"] === "https") return next();
  const host = req.headers.host || "";
  if (host.includes(process.env.DOMAIN || "")) {
    return res.redirect("https://" + host.split(":")[0] + ":444" + req.url);
  }
  next();
});

// ACME (no se usará aquí, pero no molesta)
const ACME_ROOT = "/var/www/certbot";
app.use("/.well-known", express.static(path.join(ACME_ROOT, ".well-known")));

// Proxy TODO hacia backend (sirve build + API)
const API_TARGET = process.env.API_TARGET || "http://rtc-api:3001";
app.use(
  "/",
  createProxyMiddleware({
    target: API_TARGET,
    changeOrigin: true,
    autoRewrite: true,
  })
);

// Health
app.get("/health", (_req, res) => res.json({ ok: true }));

// HTTP en 8080
http.createServer(app).listen(8080, "0.0.0.0", () => {
  console.log("HTTP listo en :8080");
});

// HTTPS en 444 (lee certificados ya existentes)
const DOMAIN = process.env.DOMAIN || "cycwebcobperu.net";
const LIVE_DIR = `/etc/letsencrypt/live/${DOMAIN}`;
const KEY = path.join(LIVE_DIR, "privkey.pem");
const CERT = path.join(LIVE_DIR, "fullchain.pem");

if (fs.existsSync(KEY) && fs.existsSync(CERT)) {
  const options = { key: fs.readFileSync(KEY), cert: fs.readFileSync(CERT) };
  https.createServer(options, app).listen(444, "0.0.0.0", () => {
    console.log(`HTTPS listo en :444 para ${DOMAIN}`);
  });
} else {
  console.warn("⚠️ Certificados no encontrados en", LIVE_DIR);
}
