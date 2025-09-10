const express = require("express");

const {
  Login,
  Logout,
  GetLastTableId,
  ReLogin,
} = require("../Controllers/auth.controller");

const authRoutes = express.Router();

authRoutes.post("/login", Login);

authRoutes.post("/logout", Logout);

authRoutes.post("/relogin", ReLogin);

authRoutes.post("/getlasttableid/:idTabla", GetLastTableId);

module.exports = { authRoutes };
