const express = require("express");
const fs = require("fs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const app = express();

// Clave secreta o clave pública para verificar el JWT desde variables de entorno
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error(
    "Error: JWT_SECRET no está definido en las variables de entorno."
  );
  process.exit(1);
}

// Middlewares
app.use(express.json()); // Para los endpoints que reciben JSON

// Endpoint para recibir el webhook
app.post("/webhook", express.text({ type: "application/jwt" }), (req, res) => {
  try {
    const jwtToken = req.body;

    // Verificar y decodificar el token JWT
    const decodedData = jwt.verify(jwtToken, JWT_SECRET);

    // Leer el archivo data.json si existe, de lo contrario inicializar un array vacío
    let dataArray = [];
    if (fs.existsSync("data.json")) {
      const existingData = fs.readFileSync("data.json", "utf8");
      if (existingData.trim()) {
        dataArray = JSON.parse(existingData);
      }
    }

    // Agregar el nuevo registro al array
    dataArray.push(decodedData);

    // Escribir el array actualizado en data.json
    fs.writeFileSync("data.json", JSON.stringify(dataArray, null, 2));

    // Procesar los eventos y actualizar el validation_status en user_data.json
    const events = decodedData.events;

    if (Array.isArray(events)) {
      // Leer el archivo user_data.json si existe, de lo contrario inicializar un array vacío
      let userDataArray = [];
      if (fs.existsSync("user_data.json")) {
        const existingUserData = fs.readFileSync("user_data.json", "utf8");
        if (existingUserData.trim()) {
          userDataArray = JSON.parse(existingUserData);
        }
      }

      // Actualizar validation_status para cada evento
      events.forEach((event) => {
        const identity_process_id = event.object.identity_process_id;
        const validation_status = event.object.validation_status;

        // Buscar el usuario con el identity_process_id
        const userIndex = userDataArray.findIndex(
          (user) => user.identity_process_id === identity_process_id
        );

        if (userIndex !== -1) {
          // Actualizar el validation_status del usuario
          userDataArray[userIndex].validation_status = validation_status;
        }
      });

      // Escribir el array actualizado en user_data.json
      fs.writeFileSync(
        "user_data.json",
        JSON.stringify(userDataArray, null, 2)
      );
    }

    res.status(200).send("Datos recibidos y procesados correctamente.");
  } catch (error) {
    console.error("Error al procesar el webhook:", error);

    // Manejo de errores específicos de JWT
    if (error.name === "JsonWebTokenError") {
      res.status(401).send("Token JWT inválido.");
    } else if (error.name === "TokenExpiredError") {
      res.status(401).send("El token JWT ha expirado.");
    } else {
      res.status(500).send("Error en el servidor al procesar el webhook.");
    }
  }
});

// Endpoint para consultar todos los registros
app.get("/records", (req, res) => {
  try {
    if (fs.existsSync("data.json")) {
      const data = fs.readFileSync("data.json", "utf8");
      const dataArray = JSON.parse(data);
      res.status(200).json(dataArray);
    } else {
      res.status(200).json([]);
    }
  } catch (error) {
    console.error("Error al leer los registros:", error);
    res.status(500).send("Error en el servidor al leer los registros.");
  }
});

// Endpoint para recibir datos de usuario y almacenarlos
app.post("/user", (req, res) => {
  try {
    const userDataInput = req.body;

    // Verificar que req.body contenga los datos esperados
    if (typeof userDataInput !== "object" || userDataInput === null) {
      return res
        .status(400)
        .send("El cuerpo de la solicitud debe ser un objeto JSON válido.");
    }

    // Agregar timestamp del lado del servidor
    userDataInput.timestamp = new Date().toISOString();

    // Leer el archivo user_data.json si existe, de lo contrario inicializar un array vacío
    let userDataArray = [];
    if (fs.existsSync("user_data.json")) {
      const existingUserData = fs.readFileSync("user_data.json", "utf8");
      if (existingUserData.trim()) {
        userDataArray = JSON.parse(existingUserData);
      }
    }

    // Agregar el nuevo registro al array
    userDataArray.push(userDataInput);

    // Escribir el array actualizado en user_data.json
    fs.writeFileSync("user_data.json", JSON.stringify(userDataArray, null, 2));

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

// Endpoint para consultar todos los datos de usuarios
app.get("/user", (req, res) => {
  try {
    if (fs.existsSync("user_data.json")) {
      const data = fs.readFileSync("user_data.json", "utf8");
      const userDataArray = JSON.parse(data);
      res.status(200).json(userDataArray);
    } else {
      res.status(200).json([]);
    }
  } catch (error) {
    console.error("Error al leer los datos de usuarios:", error);
    res.status(500).send("Error en el servidor al leer los datos de usuarios.");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
