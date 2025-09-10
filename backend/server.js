require("./logger");
const { app } = require("./app");
const { db } = require("./config/database");

(async () => {
  try {
    await db.authenticate();
    console.log("DB autenticada");

    if (process.env.DB_SYNC === "true") {
      await db.sync();
      console.log("DB sincronizada");
    }
  } catch (err) {
    console.error("Error DB:", err);
    process.exit(1);
  }

  const PORT = process.env.PORT || 3005;
  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`API escuchando en :${PORT}`);
  });

  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;
  server.requestTimeout = 15000;

  const shutdown = async () => {
    console.log("SIGTERM recibido, cerrando API...");
    server.close(async () => {
      try {
        await db.close();
      } catch {}
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
})();
