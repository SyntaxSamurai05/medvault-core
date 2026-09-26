// frontend/src/hooks/useConsentSocket.js
import { useState, useEffect, useRef, useCallback } from "react";

const WS_BASE_URL = import.meta.env.VITE_WS_URL || "ws://localhost:5000";

export function useConsentSocket(sessionId, onEventReceived) {
  const [isConnected, setIsConnected] = useState(false);
  const [latestEvent, setLatestEvent] = useState(null);
  const socketRef = useRef(null);

  const stableCallback = useRef(onEventReceived);
  useEffect(() => {
    stableCallback.current = onEventReceived;
  }, [onEventReceived]);

  useEffect(() => {
    if (!sessionId) return;

    const wsUrl = `${WS_BASE_URL}/ws/${sessionId}`;
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        setLatestEvent(payload);

        if (stableCallback.current) {
          stableCallback.current(payload);
        }
      } catch (err) {
        console.error("Failed to parse WebSocket message:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket connection error:", err);
      setIsConnected(false);
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [sessionId]);

  const sendMessage = useCallback((data) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
    }
  }, []);

  return { isConnected, latestEvent, sendMessage };
}