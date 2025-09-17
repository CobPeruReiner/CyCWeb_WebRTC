const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const { db } = require("../config/database_v1");
const dotenv = require("dotenv");
const { QueryTypes } = require("sequelize");
const md5 = require("md5");

dotenv.config({ path: "./.env" });

// Helper de notificacion
const injectNotifier = (fn) => {
  notifyPreviousSession = fn;
};

// Comparar el token con el que esta en base de datos
const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ message: "No autorizado" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const [row] = await db.query(
      "SELECT api_token FROM SISTEMAGEST.personal WHERE IDPERSONAL = :id LIMIT 1",
      { replacements: { id: payload.id }, type: QueryTypes.SELECT }
    );

    if (!row || row.api_token !== token) {
      return res
        .status(401)
        .json({ message: "Sesión inválida (cerrada en otro dispositivo)" });
    }

    req.user = { id: payload.id };
    next();
  } catch (e) {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};

const Login = async (req, res) => {
  const { user, password } = req.body;

  console.log("================================================");
  console.log("Credenciales enviadas: ", user, password);

  console.time("Login_query_time");

  if (!user || !password) {
    console.timeEnd("Login_query_time");

    return res
      .status(200)
      .json({ body: "Usuario o contraseña inválida", status: "1" });
  }

  try {
    // Buscar usuario en la BD
    const [users] = await db.query(
      "SELECT IDPERSONAL, APELLIDOS, NOMBRES, USUARIO, PASSWORD, api_token, ANEXO_BACKUP FROM personal WHERE DOC = :user AND IDESTADO = 1",
      {
        replacements: { user },
        type: QueryTypes.SELECT,
      }
    );

    // Depuracion
    console.log("Usuario logeado: ", users.NOMBRES, users.APELLIDOS);

    if (!users || md5(password) !== users.PASSWORD) {
      console.timeEnd("Login_query_time");

      return res
        .status(200)
        .json({ body: "Usuario o contraseña inválida", status: "1" });
    }

    // Obtener fecha y hora actual
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
      // Generar token
      const api_token = jwt.sign(
        { id: users.IDPERSONAL },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );

      // Guardar token en la BD
      await db.query(
        "UPDATE personal SET api_token = :api_token WHERE IDPERSONAL = :IDPERSONAL",
        {
          replacements: { api_token, IDPERSONAL: users.IDPERSONAL },
          type: QueryTypes.UPDATE,
        }
      );

      // Notificamos
      notifyPreviousSession?.(users.IDPERSONAL);

      // Obtener clientes del usuario (asumiendo que la relación está en otra tabla)
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
        body: {
          ...users,
          api_token,
        },
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

    res
      .status(500)
      .json({ error: "Error en el login", detalle: error.message });
  }
};

const Logout = async (req, res) => {
  const { userId } = req.body;

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

    console.timeEnd("Logout_query_time");

    res.status(200).json("logout");
  } catch (error) {
    console.timeEnd("Logout_query_time");

    res.status(500).json({ error: "Error en logout", detalle: error.message });
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
  auth,
  injectNotifier,
};
