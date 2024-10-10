const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

// Ruta del archivo data.json
const dataFilePath = path.join(__dirname, "..", "data.json");

// Endpoint para obtener todos los registros
router.get("/", (req, res) => {
  try {
    // Leer datos existentes
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

    // Devolver los registros almacenados
    res.status(200).json(data.records);
  } catch (error) {
    console.error("Error al leer los registros:", error);
    res.status(500).send("Error en el servidor al leer los registros.");
  }
});

module.exports = router;
