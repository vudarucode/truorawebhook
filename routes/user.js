const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

// Ruta del archivo user_data.json
const userDataFilePath = path.join(__dirname, "..", "user_data.json");

// Endpoint para recibir los datos del usuario (POST /user)
router.post("/", (req, res) => {
  try {
    const userDataInput = req.body;

    // Validar que se haya recibido un objeto JSON
    if (
      typeof userDataInput !== "object" ||
      Array.isArray(userDataInput) ||
      userDataInput === null
    ) {
      return res
        .status(400)
        .send(
          "Se requiere un objeto JSON válido en el cuerpo de la solicitud."
        );
    }

    // Agregar timestamp del lado del servidor
    userDataInput.timestamp = new Date().toISOString();

    // Leer datos existentes de user_data.json
    let userData = {};
    if (fs.existsSync(userDataFilePath)) {
      const fileData = fs.readFileSync(userDataFilePath, "utf8");
      if (fileData.trim()) {
        try {
          userData = JSON.parse(fileData);
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

    // Agregar los datos recibidos al array
    userData.users.push(userDataInput);

    // Guardar los datos actualizados en user_data.json
    fs.writeFileSync(userDataFilePath, JSON.stringify(userData, null, 2));

    res
      .status(200)
      .send("Datos del usuario recibidos y almacenados correctamente.");
  } catch (error) {
    console.error("Error al procesar los datos del usuario:", error);
    res
      .status(500)
      .send("Error en el servidor al procesar los datos del usuario.");
  }
});

// Endpoint para obtener los registros de usuarios (GET /user)
router.get("/", (req, res) => {
  try {
    // Leer datos existentes de user_data.json
    let userData = {};
    if (fs.existsSync(userDataFilePath)) {
      const fileData = fs.readFileSync(userDataFilePath, "utf8");
      if (fileData.trim()) {
        try {
          userData = JSON.parse(fileData);
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

    // Devolver los usuarios almacenados
    res.status(200).json(userData.users);
  } catch (error) {
    console.error("Error al obtener los registros de usuarios:", error);
    res
      .status(500)
      .send("Error en el servidor al obtener los registros de usuarios.");
  }
});

module.exports = router;
