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

// Ruta del archivo data.json
const dataFilePath = path.join(__dirname, "..", "data.json");

// Endpoint para recibir el webhook
router.post("/", (req, res) => {
  try {
    const jwtToken = req.body;

    // Verificar y decodificar el token JWT
    const decodedData = jwt.verify(jwtToken, JWT_SECRET);

    // Leer datos existentes de data.json
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

    // Agregar los datos decodificados al array
    data.records.push(decodedData);

    // Guardar los datos actualizados en data.json
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));

    res.status(200).send("Datos recibidos y almacenados correctamente.");
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
