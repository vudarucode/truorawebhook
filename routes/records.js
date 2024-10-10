// routes/records.js
import express from "express";
import { JSONFile } from "lowdb/node";
import { Low } from "lowdb";

const router = express.Router();

// Configurar lowdb para data.json
const adapter = new JSONFile("data.json");
const db = new Low(adapter);

// Endpoint para obtener todos los registros
router.get("/", async (req, res) => {
  try {
    await db.read();
    db.data = db.data || { records: [] };

    res.status(200).json(db.data.records);
  } catch (error) {
    console.error("Error al leer los registros:", error);
    res.status(500).send("Error en el servidor al leer los registros.");
  }
});

export default router;
