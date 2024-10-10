const express = require("express");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const router = express.Router();

// Clave secreta para verificar el JWT
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error(
    "Error: JWT_SECRET no está definido en las variables de entorno."
  );
  process.exit(1);
}

// Ruta de los archivos JSON
const dataFilePath = path.join(__dirname, "..", "data.json");
const userDataFilePath = path.join(__dirname, "..", "user_data.json");

// Endpoint para recibir el webhook
router.post("/", (req, res) => {
  try {
    const jwtToken = req.body;

    // Verificar y decodificar el token JWT
    const decodedData = jwt.verify(jwtToken, JWT_SECRET);

    // Guardar los datos decodificados en data.json
    let data = {};
    if (fs.existsSync(dataFilePath)) {
      const fileData = fs.readFileSync(dataFilePath, "utf8");
      if (fileData.trim()) {
        try {
          data = JSON.parse(fileData);
        } catch (parseError) {
          console.error("Error al parsear data.json:", parseError);
          data = {};
        }
      }
    }

    // Asegurar que data.records sea un array
    if (!Array.isArray(data.records)) {
      data.records = [];
    }

    data.records.push(decodedData);
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));

    // Procesar el arreglo de eventos
    const events = decodedData.events;

    if (Array.isArray(events)) {
      // Leer datos de usuarios existentes
      let userData = {};
      if (fs.existsSync(userDataFilePath)) {
        const userFileData = fs.readFileSync(userDataFilePath, "utf8");
        if (userFileData.trim()) {
          try {
            userData = JSON.parse(userFileData);
          } catch (parseError) {
            console.error("Error al parsear user_data.json:", parseError);
            userData = {};
          }
        }
      }

      // Asegurar que userData.users sea un array
      if (!Array.isArray(userData.users)) {
        userData.users = [];
      }

      for (const event of events) {
        const identity_process_id = event.object.identity_process_id;
        const validation_status = event.object.validation_status;

        // Buscar el usuario por identity_process_id
        const userIndex = userData.users.findIndex(
          (user) => user.identity_process_id === identity_process_id
        );

        if (userIndex !== -1) {
          // Actualizar validation_status
          userData.users[userIndex].validation_status = validation_status;
          // Opcional: actualizar timestamp u otros campos si es necesario
        }
      }

      // Guardar datos actualizados de usuarios
      fs.writeFileSync(userDataFilePath, JSON.stringify(userData, null, 2));
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
