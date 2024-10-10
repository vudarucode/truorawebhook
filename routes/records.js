// routes/records.js
const express = require("express");
const router = express.Router();
const { JSONFile, Low } = require("lowdb");

// Configurar la base de datos lowdb para data.json
const adapter = new JSONFile("data.json");
const db = new Low(adapter);

// Endpoint para obtener todos los registros
router.get("/", async (req, res) => {
  try {
    await db.read();
    db.data = db.data || { records: [] }; // Inicializar si está vacío

    res.status(200).json(db.data.records);
  } catch (error) {
    console.error("Error al leer los registros:", error);
    res.status(500).send("Error en el servidor al leer los registros.");
  }
});

module.exports = router;
