const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const jwtDecode = require("jwt-decode");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "data.json");

// Middleware para permitir CORS y parsear el body de las peticiones en JSON
app.use(cors());
app.use(express.json());

// Ruta para recibir notificaciones vía webhook y almacenar en data.json
app.post("/webhook", (req, res) => {
  const { token } = req.body;

  // Log para ver lo que llega en el cuerpo de la petición
  console.log("Datos recibidos en la petición:", req.body);

  if (!token) {
    return res.status(400).json({ message: "Token no proporcionado" });
  }

  try {
    // Decodificar el token JWT
    const decodedToken = jwtDecode(token);

    // Log para ver el token decodificado
    console.log("Token decodificado:", decodedToken);

    // Leer el archivo actual
    fs.readFile(DATA_FILE, "utf8", (err, data) => {
      if (err) {
        return res.status(500).json({ message: "Error al leer el archivo" });
      }

      // Convertir los datos en un array si el archivo no está vacío
      let records = data ? JSON.parse(data) : [];

      // Agregar el token decodificado al array de registros
      records.push(decodedToken);

      // Escribir el archivo con los nuevos datos
      fs.writeFile(DATA_FILE, JSON.stringify(records, null, 2), (err) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "Error al guardar el archivo" });
        }
        res
          .status(200)
          .json({ message: "Registro guardado correctamente", decodedToken });
      });
    });
  } catch (err) {
    return res
      .status(400)
      .json({ message: "Error al decodificar el token", error: err.message });
  }
});

// Ruta para consultar los datos almacenados en data.json
app.get("/records", (req, res) => {
  fs.readFile(DATA_FILE, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error al leer el archivo" });
    }

    const records = data ? JSON.parse(data) : [];
    res.status(200).json(records);
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
