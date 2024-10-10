// routes/user.js
const express = require("express");
const fs = require("fs");
const router = express.Router();

// Endpoint para recibir el ID del usuario y el objeto JSON, y guardarlo en un archivo JSON
router.post("/", (req, res) => {
  try {
    const { userId, data } = req.body;

    if (!userId || !data) {
      return res
        .status(400)
        .send(
          'El campo "userId" y "data" son requeridos en el cuerpo de la solicitud.'
        );
    }

    // Nombre del archivo donde se almacenarán los datos (puedes cambiarlo si lo deseas)
    const fileName = "user_data.json";

    // Leer los datos existentes
    let userDataArray = [];
    if (fs.existsSync(fileName)) {
      const existingData = fs.readFileSync(fileName, "utf8");
      userDataArray = JSON.parse(existingData);
    }

    // Agregar los nuevos datos
    userDataArray.push({ userId, data });

    // Escribir los datos actualizados en el archivo
    fs.writeFileSync(fileName, JSON.stringify(userDataArray, null, 2));

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

module.exports = router;
