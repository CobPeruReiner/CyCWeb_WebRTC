const express = require("express");
const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
app.set("trust proxy", true);

app.get("/health", (_req, res) => res.json({ ok: true }));

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

const ACME_ROOT = "/var/www/certbot";
app.use("/.well-known", express.static(path.join(ACME_ROOT, ".well-known")));

const API_TARGET = process.env.API_TARGET || "http://rtc_api:3001";

app.use((req, res, next) => {
  if (req.path.startsWith("/.well-known")) return next();
  if (req.path === "/health") return next();
  return createProxyMiddleware({
    target: API_TARGET,
    changeOrigin: true,
    ws: true,
    autoRewrite: true,
    logLevel: "info",
    proxyTimeout: 15000,
    timeout: 15000,
    onError(err, _req, res) {
      console.error("Proxy error:", err.code || err.message);
      if (!res.headersSent) res.writeHead(502);
      res.end("Bad gateway");
    },
  })(req, res, next);
});

const httpServer = http.createServer(app);
httpServer.keepAliveTimeout = 65000;
httpServer.headersTimeout = 66000;
httpServer.listen(8080, "0.0.0.0", () => console.log("HTTP listo en :8080"));

const DOMAIN = process.env.DOMAIN || "cycwebcobperu.net";
const LIVE_DIR = `/etc/letsencrypt/live/${DOMAIN}`;
const KEY = path.join(LIVE_DIR, "privkey.pem");
const CERT = path.join(LIVE_DIR, "fullchain.pem");

if (fs.existsSync(KEY) && fs.existsSync(CERT)) {
  const options = { key: fs.readFileSync(KEY), cert: fs.readFileSync(CERT) };
  const httpsServer = https.createServer(options, app);
  httpsServer.keepAliveTimeout = 65000;
  httpsServer.headersTimeout = 66000;
  httpsServer.listen(444, "0.0.0.0", () =>
    console.log(`HTTPS listo en :444 para ${DOMAIN}`)
  );
} else {
  console.warn("⚠️ Certificados no encontrados en", LIVE_DIR);
}

process.on("SIGTERM", () => {
  console.log("SIGTERM recibido, cerrando Server...");
  httpServer.close(() => process.exit(0));
});
