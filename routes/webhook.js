const express = require("express");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error(
    "Error: JWT_SECRET no está definido en las variables de entorno."
  );
  process.exit(1);
}

router.post("/", (req, res) => {
  try {
    const jwtToken = req.body;
    const decodedData = jwt.verify(jwtToken, JWT_SECRET);

    let dataArray = [];
    if (fs.existsSync("data.json")) {
      const existingData = fs.readFileSync("data.json", "utf8");
      dataArray = JSON.parse(existingData);
    }

    dataArray.push(decodedData);
    fs.writeFileSync("data.json", JSON.stringify(dataArray, null, 2));

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
