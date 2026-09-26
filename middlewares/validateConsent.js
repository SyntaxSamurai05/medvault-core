import { db } from "../config/db.js";
import { errorResponse } from "../utils/responseFormatter.js";
import { socketManager } from "../sockets/socketManager.js";

export function validateConsentSession(req, res, next) {
  // Session ID can come via URL params or headers
  const sessionId = req.params.sessionId || req.headers["x-session-id"];

  if (!sessionId) {
    return errorResponse(res, {
      statusCode: 400,
      message: "Missing session ID. An ephemeral session must be initialized first."
    });
  }

  const session = db.sessions.get(sessionId);

  if (!session) {
    return errorResponse(res, {
      statusCode: 404,
      message: "Consent session does not exist or has expired from memory."
    });
  }

  // Check if session has been revoked
  if (session.status === "REVOKED") {
    return errorResponse(res, {
      statusCode: 403,
      message: "Access forbidden: Session has been explicitly revoked by the patient."
    });
  }

  // Check if session is still awaiting authorization
  if (session.status === "PENDING_CONSENT") {
    return errorResponse(res, {
      statusCode: 403,
      message: "Access pending: Patient has not yet granted authorization."
    });
  }

  // Check time-to-live (TTL) expiration
  if (session.isExpired()) {
    session.status = "EXPIRED";
    socketManager.broadcast(sessionId, "SESSION_EXPIRED", {
      message: "Session time limit exceeded."
    });

    return errorResponse(res, {
      statusCode: 403,
      message: "Access forbidden: Session time limit expired."
    });
  }

  if (session.status !== "ACTIVE") {
    return errorResponse(res, {
      statusCode: 403,
      message: `Access denied: Invalid session state (${session.status}).`
    });
  }

  // Attach session and patient ID to request object for downstream controllers
  req.session = session;
  req.patientId = session.patientId;
  next();
}