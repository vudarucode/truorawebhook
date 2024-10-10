const express = require("express");
require("dotenv").config();
const app = express();

const webhookRouter = require("./routes/webhook");
const recordsRouter = require("./routes/records");
const userRouter = require("./routes/user");

// Middlewares
app.use("/webhook", express.text({ type: "application/jwt" })); // Solo para /webhook
app.use(express.json()); // Para los demás endpoints

// Rutas
app.use("/webhook", webhookRouter);
app.use("/records", recordsRouter);
app.use("/user", userRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
