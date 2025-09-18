const { QueryTypes } = require("sequelize");
const { db } = require("../config/database_v1");
const crypto = require("crypto");

const attemptsByDoc = new Map();

const MAX_ATTEMPTS = 3;

// Devuelve el número de intentos de login para un documento
function getAttempts(doc) {
  return attemptsByDoc.get(doc) ?? 0;
}

// Incrementa el número de intentos de login para un documento
function incAttempts(doc) {
  const next = getAttempts(doc) + 1;
  attemptsByDoc.set(doc, next);
  return next;
}

// Resetea el número de intentos de login para un documento
function resetAttempts(doc) {
  attemptsByDoc.delete(doc);
}

// Bloquear usuario al intento 3
const bloquearSiCorresponde = async (doc) => {
  const [activo] = await db.query(
    "SELECT IDPERSONAL FROM personal WHERE DOC = :doc AND IDESTADO = 1",
    { replacements: { doc }, type: QueryTypes.SELECT }
  );
  const id = activo?.IDPERSONAL ?? null;
  if (id) {
    await db.query("UPDATE personal SET IDESTADO = 5 WHERE IDPERSONAL = :id", {
      replacements: { id },
      type: QueryTypes.UPDATE,
    });
    console.warn(
      `Usuario ${doc} bloqueado (IDPERSONAL=${id}) tras superar ${MAX_ATTEMPTS} intentos.`
    );
  } else {
    console.warn(`Usuario ${doc} no activo al bloquear (IDPERSONAL=NULL).`);
  }
};

// Insertar LOGS
// const registrarLogSesion = async (
//   IDPERSONAL,
//   dateSolicitud,
//   timeSolicitud,
//   estado,
//   DOCUSER,
//   PASSWORD
// ) => {
//   try {
//     await db.query(
//       "CALL SP_INSERTAR_LOG_SESION(:IDPERSONAL, :dateSolicitud, :timeSolicitud, :estado, :DOCUSER, :PASSWORD)",
//       {
//         replacements: {
//           IDPERSONAL,
//           estado,
//           DOCUSER,
//           PASSWORD,
//           dateSolicitud: dateSolicitud ?? null,
//           timeSolicitud: timeSolicitud ?? null,
//         },
//         type: QueryTypes.RAW,
//       }
//     );
//   } catch (err) {
//     console.error("Error al insertar log de sesión:", err.message);
//   }
// };

function hashForLog(docUser, password) {
  if (password == null) return null;
  const secret = process.env.JWT_SECRET || "";
  const data = `${docUser ?? ""}:${String(password)}`;
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

const registrarLogSesion = async (
  IDPERSONAL,
  dateSolicitud,
  timeSolicitud,
  estado,
  DOCUSER,
  PASSWORD
) => {
  console.log(
    " ====================== INSERTAR EN LOG DE SESION ======================"
  );
  console.log(
    `IDPERSONAL: ${IDPERSONAL}, dateSolicitud: ${dateSolicitud}, timeSolicitud: ${timeSolicitud}, estado: ${estado}, DOCUSER: ${DOCUSER}, PASSWORD: ${PASSWORD}`
  );

  try {
    const PASSWORD_HASH = hashForLog(DOCUSER, PASSWORD);

    await db.query(
      "CALL SP_INSERTAR_LOG_SESION(:IDPERSONAL, :dateSolicitud, :timeSolicitud, :estado, :DOCUSER, :PASSWORD)",
      {
        replacements: {
          IDPERSONAL,
          estado,
          DOCUSER,
          PASSWORD: estado == 2 ? PASSWORD : PASSWORD_HASH,
          dateSolicitud: dateSolicitud ?? null,
          timeSolicitud: timeSolicitud ?? null,
        },
        type: QueryTypes.RAW,
      }
    );
  } catch (err) {
    console.error("Error al insertar log de sesión:", err.message);
  }
};

module.exports = {
  getAttempts,
  incAttempts,
  resetAttempts,
  MAX_ATTEMPTS,
  attemptsByDoc,
  bloquearSiCorresponde,
  registrarLogSesion,
};
