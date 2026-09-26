import { WebSocket } from "ws";

class SocketManager {
  constructor() {
    this.sessionRooms = new Map();
  }

  
  registerClient(sessionId, ws) {
    if (!this.sessionRooms.has(sessionId)) {
      this.sessionRooms.set(sessionId, new Set());
    }
    this.sessionRooms.get(sessionId).add(ws);
  }

  
  removeClient(sessionId, ws) {
    if (this.sessionRooms.has(sessionId)) {
      const room = this.sessionRooms.get(sessionId);
      room.delete(ws);
      if (room.size === 0) {
        this.sessionRooms.delete(sessionId);
      }
    }
  }

  
  broadcast(sessionId, eventType, data = {}) {
    const clients = this.sessionRooms.get(sessionId);
    if (!clients || clients.size === 0) return;

    const payload = JSON.stringify({
      event: eventType,
      sessionId,
      timestamp: new Date().toISOString(),
      ...data
    });

    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  }
}

export const socketManager = new SocketManager();