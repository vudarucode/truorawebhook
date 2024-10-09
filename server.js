const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "data.json");

// Middleware para permitir CORS y parsear el body de las peticiones en JSON
app.use(cors());
app.use(express.json());

// Ruta para recibir notificaciones vía webhook y almacenar en data.json
app.post("/webhook", (req, res) => {
  const newRecord = req.body;

  // Leer el archivo actual
  fs.readFile(DATA_FILE, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error al leer el archivo" });
    }

    // Convertir los datos en un array si el archivo no está vacío
    let records = data ? JSON.parse(data) : [];

    // Agregar el nuevo registro al array
    records.push(newRecord);

    // Escribir el archivo con los nuevos datos
    fs.writeFile(DATA_FILE, JSON.stringify(records, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ message: "Error al guardar el archivo" });
      }
      res.status(200).json({ message: "Registro guardado correctamente" });
    });
  });
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
