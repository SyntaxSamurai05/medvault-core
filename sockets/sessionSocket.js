import { socketManager } from "./socketManager.js";
import { db } from "../config/db.js";

export function initWebSocketServer(wss) {
  wss.on("connection", (ws, req) => {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      
      const sessionId = url.pathname.replace(/^\/ws\/?/, "").trim();

      if (!sessionId) {
        ws.close(1008, "Session ID required in URL path (e.g. /ws/sess_123)");
        return;
      }

      
      socketManager.registerClient(sessionId, ws);

      
      const session = db.sessions.get(sessionId);
      if (session) {
        ws.send(
          JSON.stringify({
            event: "CONNECTION_ACK",
            sessionId,
            status: session.status,
            expiresAt: session.expiresAt
          })
        );
      } else {
        ws.send(
          JSON.stringify({
            event: "CONNECTION_ACK",
            sessionId,
            status: "UNKNOWN_OR_NEW"
          })
        );
      }

      ws.on("close", () => {
        socketManager.removeClient(sessionId, ws);
      });

      ws.on("error", (err) => {
        console.error(`WebSocket error for session ${sessionId}:`, err.message);
        socketManager.removeClient(sessionId, ws);
      });
    } catch (err) {
      console.error("WebSocket connection parsing error:", err.message);
      ws.close(1011, "Internal server error");
    }
  });
}