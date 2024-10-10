const express = require("express");
const fs = require("fs");
const router = express.Router();

router.get("/", (req, res) => {
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

module.exports = router;
