import { v4 as uuidv4 } from "uuid";
import { db } from "../config/db.js";
import { ConsentSession } from "../models/ConsentSession.js";
import { socketManager } from "../sockets/socketManager.js";
import { successResponse, errorResponse } from "../utils/responseFormatter.js";
import { ENV } from "../config/env.js";

// Doctor scans patient QR -> Triggers ephemeral handshake
export function initiateConsent(req, res, next) {
  try {
    const { patientId, providerDeviceId } = req.body;

    if (!patientId) {
      return errorResponse(res, {
        statusCode: 400,
        message: "patientId is required to initiate consent."
      });
    }

    const patient = db.patients.get(patientId);
    if (!patient) {
      return errorResponse(res, {
        statusCode: 404,
        message: `Patient with ID ${patientId} not found.`
      });
    }

    // Create session identifier and register session
    const sessionId = "sess_" + uuidv4().slice(0, 8);
    const session = new ConsentSession({
      sessionId,
      patientId,
      providerDeviceId: providerDeviceId || "Point-of-Care Browser",
      ttlSeconds: ENV.DEFAULT_SESSION_TTL_SECONDS
    });

    db.sessions.set(sessionId, session);

    // Notify any active patient app listeners
    socketManager.broadcast(sessionId, "CONSENT_REQUESTED", {
      sessionId,
      patientId,
      providerDeviceId: session.providerDeviceId,
      requestedAt: session.requestedAt
    });

    return successResponse(res, {
      statusCode: 201,
      message: "Consent handshake initiated. Waiting for patient authorization.",
      data: {
        sessionId,
        status: session.status,
        wsEndpoint: `/ws/${sessionId}`
      }
    });
  } catch (err) {
    next(err);
  }
}

// Patient approves the access request
export function grantConsent(req, res, next) {
  try {
    const { sessionId, ttlSeconds } = req.body;

    if (!sessionId) {
      return errorResponse(res, {
        statusCode: 400,
        message: "sessionId is required to grant consent."
      });
    }

    const session = db.sessions.get(sessionId);
    if (!session) {
      return errorResponse(res, {
        statusCode: 404,
        message: "Session not found."
      });
    }

    if (session.status === "REVOKED") {
      return errorResponse(res, {
        statusCode: 400,
        message: "Cannot grant access to an explicitly revoked session."
      });
    }

    if (ttlSeconds && Number.isInteger(ttlSeconds)) {
      session.ttlSeconds = ttlSeconds;
    }

    session.grant();

    // Broadcast "ACCESS_GRANTED" immediately to doctor's browser screen
    socketManager.broadcast(sessionId, "ACCESS_GRANTED", {
      status: session.status,
      grantedAt: session.grantedAt,
      expiresAt: session.expiresAt
    });

    return successResponse(res, {
      message: "Access granted successfully.",
      data: {
        sessionId: session.sessionId,
        status: session.status,
        expiresAt: session.expiresAt
      }
    });
  } catch (err) {
    next(err);
  }
}

// Patient hits the Kill-Switch -> Forcibly locks doctor screen
export function revokeConsent(req, res, next) {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return errorResponse(res, {
        statusCode: 400,
        message: "sessionId is required to revoke consent."
      });
    }

    const session = db.sessions.get(sessionId);
    if (!session) {
      return errorResponse(res, {
        statusCode: 404,
        message: "Session not found."
      });
    }

    session.revoke();

    // Broadcast instant kill-switch signal to clear the doctor's web page
    socketManager.broadcast(sessionId, "ACCESS_REVOKED", {
      status: session.status,
      revokedAt: session.revokedAt,
      message: "Patient has immediately terminated access to these records."
    });

    return successResponse(res, {
      message: "Access has been revoked immediately.",
      data: {
        sessionId: session.sessionId,
        status: session.status,
        revokedAt: session.revokedAt
      }
    });
  } catch (err) {
    next(err);
  }
}

// Check session status
export function getSessionStatus(req, res, next) {
  try {
    const { sessionId } = req.params;
    const session = db.sessions.get(sessionId);

    if (!session) {
      return errorResponse(res, {
        statusCode: 404,
        message: "Session not found."
      });
    }

    return successResponse(res, {
      message: "Session status retrieved.",
      data: {
        sessionId: session.sessionId,
        patientId: session.patientId,
        status: session.status,
        isExpired: session.isExpired(),
        expiresAt: session.expiresAt
      }
    });
  } catch (err) {
    next(err);
  }
}