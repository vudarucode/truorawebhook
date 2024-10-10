// server.js
import express from "express";
import dotenv from "dotenv";
dotenv.config();

import webhookRouter from "./routes/webhook.js";
import recordsRouter from "./routes/records.js";
import userRouter from "./routes/user.js";

const app = express();

// Middlewares
app.use(express.text({ type: "application/jwt" }));
app.use(express.json());

// Rutas
app.use("/webhook", webhookRouter);
app.use("/records", recordsRouter);
app.use("/user", userRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
