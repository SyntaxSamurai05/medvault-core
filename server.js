import express from "express";
import http from "http";
import cors from "cors";
import { WebSocketServer } from "ws";
import { ENV } from "./config/env.js";
import consentRoutes from "./routes/consentRoutes.js";
import recordsRoutes from "./routes/recordsRoutes.js";
import { initWebSocketServer } from "./sockets/sessionSocket.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();
app.use(cors({ origin: ENV.CLIENT_ORIGIN }));
app.use(express.json());
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});
app.use("/api/v1/consent", consentRoutes);
app.use("/api/v1/records", recordsRoutes);
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Resource route not found" });
});
app.use(errorHandler);
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
initWebSocketServer(wss);

server.listen(ENV.PORT, () => {
  console.log(`[MedVault Core] Running on http://localhost:${ENV.PORT}`);
  console.log(`[MedVault Sockets] Listening on ws://localhost:${ENV.PORT}/ws/:sessionId`);
});