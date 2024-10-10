// routes/user.js
import express from "express";
import { JSONFile } from "lowdb/node";
import { Low } from "lowdb";

const router = express.Router();

// Configurar lowdb para user_data.json
const adapter = new JSONFile("user_data.json");
const db = new Low(adapter);

// Endpoint para recibir los datos del usuario (POST /user)
router.post("/", async (req, res) => {
  try {
    const { phone, identity_process_id, validation_status } = req.body;

    if (!phone || !identity_process_id || !validation_status) {
      return res
        .status(400)
        .send(
          'Los campos "phone", "identity_process_id" y "validation_status" son requeridos.'
        );
    }

    // Agregar timestamp del lado del servidor
    const timestamp = new Date().toISOString();

    // Leer datos existentes
    await db.read();
    db.data = db.data || { users: [] };

    // Crear nuevo objeto de usuario
    const newUser = {
      phone,
      identity_process_id,
      validation_status,
      timestamp,
    };

    // Agregar nuevo usuario
    db.data.users.push(newUser);

    // Guardar datos actualizados
    await db.write();

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
router.get("/", async (req, res) => {
  try {
    // Leer datos existentes
    await db.read();
    db.data = db.data || { users: [] };

    // Devolver los usuarios almacenados
    res.status(200).json(db.data.users);
  } catch (error) {
    console.error("Error al obtener los registros de usuarios:", error);
    res
      .status(500)
      .send("Error en el servidor al obtener los registros de usuarios.");
  }
});

export default router;
