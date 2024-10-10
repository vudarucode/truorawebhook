// routes/user.js
const express = require("express");
const router = express.Router();

// Almacén de datos en memoria
let userData = { users: [] };

// Endpoint para recibir los datos del usuario (POST /user)
router.post("/", (req, res) => {
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

    // Crear nuevo objeto de usuario
    const newUser = {
      phone,
      identity_process_id,
      validation_status,
      timestamp,
    };

    // Agregar nuevo usuario
    userData.users.push(newUser);

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
