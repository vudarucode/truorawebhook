const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { JSONFile, Low } = require("lowdb");

// Configurar lowdb para data.json
const adapter = new JSONFile("data.json");
const db = new Low(adapter);

// Configurar lowdb para user_data.json
const userAdapter = new JSONFile("user_data.json");
const userDb = new Low(userAdapter);

// Clave secreta para verificar el JWT
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error(
    "Error: JWT_SECRET no está definido en las variables de entorno."
  );
  process.exit(1);
}

// Endpoint para recibir el webhook
router.post("/", async (req, res) => {
  try {
    const jwtToken = req.body;

    // Verificar y decodificar el token JWT
    const decodedData = jwt.verify(jwtToken, JWT_SECRET);

    // Guardar los datos decodificados en data.json
    await db.read();
    db.data = db.data || { records: [] };
    db.data.records.push(decodedData);
    await db.write();

    // Procesar el arreglo de eventos
    const events = decodedData.events;

    if (Array.isArray(events)) {
      // Leer datos de usuarios existentes
      await userDb.read();
      userDb.data = userDb.data || { users: [] };

      for (const event of events) {
        const identity_process_id = event.object.identity_process_id;
        const validation_status = event.object.validation_status;

        // Buscar el usuario por identity_process_id
        const userIndex = userDb.data.users.findIndex(
          (user) => user.identity_process_id === identity_process_id
        );

        if (userIndex !== -1) {
          // Actualizar validation_status si es "success"
          if (validation_status === "success") {
            userDb.data.users[userIndex].validation_status = validation_status;
            // Opcional: actualizar timestamp u otros campos si es necesario
          }
        }
      }

      // Guardar datos actualizados de usuarios
      await userDb.write();
    }

    res.status(200).send("Datos recibidos y procesados correctamente.");
  } catch (error) {
    console.error("Error al procesar el webhook:", error);

    if (error.name === "JsonWebTokenError") {
      res.status(401).send("Token JWT inválido.");
    } else if (error.name === "TokenExpiredError") {
      res.status(401).send("El token JWT ha expirado.");
    } else {
      res.status(500).send("Error en el servidor al procesar el webhook.");
    }
  }
});

module.exports = router;
