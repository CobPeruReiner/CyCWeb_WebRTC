// const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const { db } = require("../config/database_v1");
const dotenv = require("dotenv");
const { QueryTypes } = require("sequelize");
const md5 = require("md5");
const { verifyCaptcha } = require("../Utils/Captcha");
const {
  resetAttempts,
  incAttempts,
  bloquearSiCorresponde,
  attemptsByDoc,
  MAX_ATTEMPTS,
  registrarLogSesion,
} = require("../Utils/LoginAttempt");

dotenv.config({ path: "./.env" });

const Login = async (req, res) => {
  const { user, password, captchaToken, dateSolicitud, timeSolicitud } =
    req.body;

  console.log("================================================");
  console.log("Credenciales enviadas: ", user, password);

  console.time("Login_query_time");

  if (!user || !password) {
    console.timeEnd("Login_query_time");
    return res
      .status(200)
      .json({ body: "Usuario o contraseña inválida", status: "1" });
  }

  // const captcha = await verifyCaptcha(captchaToken, req.ip);

  // if (!captcha?.success) {
  //   console.timeEnd("Login_query_time");
  //   console.warn("Captcha inválido:", captcha && captcha["error-codes"]);
  //   return res.status(200).json({ body: "Captcha inválido", status: "1" });
  // }

  try {
    // Si es estado 5, entonces no permites loguear
    const [bloqRow] = await db.query(
      "SELECT IDPERSONAL FROM personal WHERE DOC = :user AND IDESTADO = 5",
      { replacements: { user }, type: QueryTypes.SELECT }
    );
    if (bloqRow) {
      console.timeEnd("Login_query_time");
      return res.status(200).json({
        body: "Has sido bloqueado temporalmente. Contacta a Soporte o RRHH.",
        status: "1",
      });
    }

    // Buscar usuario en la BD
    const [users] = await db.query(
      "SELECT IDPERSONAL, APELLIDOS, NOMBRES, USUARIO, PASSWORD, api_token, ANEXO_BACKUP FROM personal WHERE DOC = :user AND IDESTADO = 1",
      {
        replacements: { user },
        type: QueryTypes.SELECT,
      }
    );

    console.log(
      "Usuario encontrado:",
      users && users.NOMBRES,
      users && users.APELLIDOS
    );

    if (!users || md5(password) !== users.PASSWORD) {
      const intentos = incAttempts(user);
      console.warn(`Intento fallido para ${user}. Conteo=${intentos}.`);

      const userID = users?.IDPERSONAL ?? null;

      await registrarLogSesion(
        userID,
        dateSolicitud,
        timeSolicitud,
        3,
        user ?? null,
        password ?? null
      );

      if (intentos >= MAX_ATTEMPTS) {
        await bloquearSiCorresponde(user);

        attemptsByDoc.delete(user);

        console.timeEnd("Login_query_time");

        return res.status(200).json({
          body: "Has sido bloqueado temporalmente. Contacta a Soporte o RRHH.",
          status: "1",
        });
      }

      console.timeEnd("Login_query_time");
      return res
        .status(200)
        .json({ body: "Usuario o contraseña inválida", status: "1" });
    }

    resetAttempts(user);

    await registrarLogSesion(
      users.IDPERSONAL,
      dateSolicitud,
      timeSolicitud,
      1,
      user ?? null,
      password ?? null
    );

    let fechaActual = moment().utc().subtract(5, "hours");
    let currentDay = fechaActual.format("dddd");

    let minTime, maxTime;
    if (currentDay === "Saturday") {
      minTime = moment()
        .utc()
        .subtract(5, "hours")
        .hour(7)
        .minute(55)
        .second(0);
      maxTime = moment()
        .utc()
        .subtract(5, "hours")
        .hour(17)
        .minute(30)
        .second(0);
    } else if (currentDay === "Sunday") {
      minTime = moment()
        .utc()
        .subtract(5, "hours")
        .hour(21)
        .minute(0)
        .second(0);
      maxTime = moment()
        .utc()
        .subtract(5, "hours")
        .hour(21)
        .minute(1)
        .second(0);
    } else {
      minTime = moment().utc().subtract(5, "hours").hour(7).minute(0).second(0);
      maxTime = moment()
        .utc()
        .subtract(5, "hours")
        .hour(19)
        .minute(55)
        .second(0);
    }

    let currentTime = moment().utc().subtract(5, "hours");

    if (currentTime.isBetween(minTime, maxTime)) {
      const api_token = jwt.sign(
        { id: users.IDPERSONAL },
        process.env.JWT_SECRET,
        { expiresIn: "11h" }
      );

      await db.query(
        "UPDATE personal SET api_token = :api_token WHERE IDPERSONAL = :IDPERSONAL",
        {
          replacements: { api_token, IDPERSONAL: users.IDPERSONAL },
          type: QueryTypes.UPDATE,
        }
      );

      notifyPreviousSession?.(users.IDPERSONAL);

      const clients = await db.query(
        `
          SELECT 
              cartera.cartera AS nombre,
              tabla_log.id AS id_tabla,
              tabla_log.id_cartera AS idcartera
          FROM tabla_log
          INNER JOIN asignacion_tabla ON tabla_log.id = asignacion_tabla.id_tabla
          INNER JOIN cartera ON tabla_log.id_cartera = cartera.id
          INNER JOIN cliente ON cartera.idcliente = cliente.id
          WHERE asignacion_tabla.id_usuario = :IDPERSONAL
          AND tabla_log.estado = 0
        `,
        {
          replacements: { IDPERSONAL: users.IDPERSONAL },
          type: QueryTypes.SELECT,
        }
      );

      users.clients = clients;

      console.timeEnd("Login_query_time");

      return res.status(200).json({
        body: { ...users, api_token },
        status: "0",
      });
    }

    console.timeEnd("Login_query_time");

    return res.status(200).json({
      body: "Acceso bloqueado, fuera de horario",
      status: "2",
      minTime: minTime.format("YYYY-MM-DD HH:mm:ss"),
      maxTime: maxTime.format("YYYY-MM-DD HH:mm:ss"),
      currentTime: currentTime.format("YYYY-MM-DD HH:mm:ss"),
      fechaActual: fechaActual.format("YYYY-MM-DD HH:mm:ss"),
      currentDay,
    });
  } catch (error) {
    console.timeEnd("Login_query_time");
    console.error("Error en Login:", error);
    res
      .status(500)
      .json({ error: "Error en el login", detalle: error.message });
  }
};

const Logout = async (req, res) => {
  const { userId, dateSolicitud, timeSolicitud, user, password } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "ID de usuario no proporcionado" });
  }

  console.log("================================================");
  console.log("ID de usuario recibido: ", userId);

  console.time("Logout_query_time");

  try {
    await db.query(
      "UPDATE personal SET api_token = NULL WHERE IDPERSONAL = :IDPERSONAL",
      {
        replacements: { IDPERSONAL: userId },
        type: QueryTypes.UPDATE,
      }
    );

    await registrarLogSesion(
      userId,
      dateSolicitud,
      timeSolicitud,
      2,
      user ? user : null,
      password ? password : null
    );

    console.timeEnd("Logout_query_time");

    res.status(200).json("logout");
  } catch (error) {
    console.timeEnd("Logout_query_time");

    res.status(500).json({ error: "Error en logout", detalle: error.message });
  }
};

const logOutInactividad = async (req, res) => {
  const userId = req.userId;
  const { dateSolicitud, timeSolicitud, user, password } = req.body || {};

  try {
    const now = new Date();
    const fecha = dateSolicitud || now.toISOString().slice(0, 10);
    const hora = timeSolicitud || now.toTimeString().slice(0, 8);

    await registrarLogSesion(userId, fecha, hora, 4, user, password);

    await db.query(
      "UPDATE personal SET api_token = NULL WHERE IDPERSONAL = :id",
      { replacements: { id: userId }, type: QueryTypes.UPDATE }
    );

    try {
      notifyPreviousSession?.(userId);
    } catch {}

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("logout-inactividad error:", err);
    return res.status(500).json({ error: "No se pudo cerrar por inactividad" });
  }
};

const ReLogin = async (req, res) => {
  const { user, password } = req.body;

  if (!user || !password) {
    return res.status(400).json({ error: "Credenciales no proporcionadas" });
  }

  console.log("================================================");
  console.log("Credenciales recibidas: ", user, password);

  console.time("ReLogin_query_time");

  try {
    // Buscar usuario en la BD
    const [users] = await db.query(
      "SELECT IDPERSONAL, APELLIDOS, NOMBRES, USUARIO, PASSWORD FROM personal WHERE USUARIO = :user",
      {
        replacements: { user },
        type: QueryTypes.SELECT,
      }
    );

    // console.log("================================================");
    console.log("Usuario encontrado: ", users);

    if (!users || md5(password) !== users.PASSWORD) {
      console.timeEnd("ReLogin_query_time");

      return res.status(200).json({ body: "Usuario inválido", status: "1" });
    }

    // Obtener clientes del usuario
    const clients = await db.query(
      `
        SELECT 
            cartera.cartera AS nombre,
            tabla_log.id AS id_tabla,
            tabla_log.id_cartera AS idcartera
        FROM tabla_log
        INNER JOIN asignacion_tabla ON tabla_log.id = asignacion_tabla.id_tabla
        INNER JOIN cartera ON tabla_log.id_cartera = cartera.id
        INNER JOIN cliente ON cartera.idcliente = cliente.id
        WHERE asignacion_tabla.id_usuario = :IDPERSONAL
        AND tabla_log.estado = 0
      `,
      {
        replacements: { IDPERSONAL: users.IDPERSONAL },
        type: QueryTypes.SELECT,
      }
    );

    // Depuracion
    // console.log("================================================");
    // console.log("Clientes asociados al usuario: ", clients);

    console.timeEnd("ReLogin_query_time");

    return res.status(200).json({ body: clients, status: "0" });
  } catch (error) {
    console.timeEnd("ReLogin_query_time");

    res.status(500).json({ error: "Error en relogin", detalle: error.message });
  }
};

const GetLastTableId = async (req, res) => {
  const { idTabla } = req.params;

  if (!idTabla) {
    return res.status(400).json({ error: "ID de tabla no proporcionado" });
  }

  console.log("================================================");
  console.log("ID de tabla recibido: ", idTabla);

  console.time("GetLastTableId_query_time");

  try {
    const query = `
            SELECT id FROM tabla_log 
            WHERE id_cartera = (SELECT id_cartera FROM tabla_log WHERE id = :idTabla) 
            ORDER BY id DESC
        `;

    const rows = await db.query(query, {
      replacements: { idTabla },
      type: QueryTypes.SELECT,
    });

    // console.log("================================================");
    // console.log("ID de la tabla: ", rows);

    console.timeEnd("GetLastTableId_query_time");

    return res.status(200).json(rows.map((row) => row.id));
  } catch (error) {
    console.timeEnd("GetLastTableId_query_time");

    res
      .status(500)
      .json({ error: "Error en getLastTableId", detalle: error.message });
  }
};

module.exports = {
  Login,
  Logout,
  ReLogin,
  GetLastTableId,
  logOutInactividad,
};
