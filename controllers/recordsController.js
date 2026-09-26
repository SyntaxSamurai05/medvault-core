import { v4 as uuidv4 } from "uuid";
import { db } from "../config/db.js";
import { HealthRecord } from "../models/HealthRecord.js";
import { successResponse, errorResponse } from "../utils/responseFormatter.js";

// Fetch point-of-care summary for Doctor (Guarded by validateConsentSession middleware)
export function getDoctorSummary(req, res, next) {
  try {
    const { patientId, session } = req;
    const patient = db.patients.get(patientId);

    if (!patient) {
      return errorResponse(res, {
        statusCode: 404,
        message: "Patient record not found."
      });
    }

    const recordIds = db.patientRecords.get(patientId) || new Set();
    const records = Array.from(recordIds).map((id) => db.records.get(id)).filter(Boolean);

    // Group records by clinical priority for immediate clinical review
    const criticalAlerts = records.filter(
      (r) => r.criticality === "high" || r.resourceType === "AllergyIntolerance"
    );
    const activeMedications = records.filter(
      (r) => r.resourceType === "MedicationStatement" && r.clinicalStatus === "active"
    );
    const diagnostics = records.filter(
      (r) => r.resourceType === "DiagnosticReport"
    );

    return successResponse(res, {
      message: "Emergency clinical summary retrieved.",
      data: {
        patient: {
          fullName: patient.fullName,
          dateOfBirth: patient.dateOfBirth,
          gender: patient.gender,
          bloodGroup: patient.bloodGroup,
          abhaAddress: patient.abhaAddress
        },
        session: {
          sessionId: session.sessionId,
          expiresAt: session.expiresAt
        },
        criticalAlerts,
        activeMedications,
        diagnostics
      }
    });
  } catch (err) {
    next(err);
  }
}

// Add a new clinical record (Patient self-upload or clinic push)
export function createRecord(req, res, next) {
  try {
    const {
      patientId,
      resourceType,
      clinicalStatus = "active",
      category,
      summary,
      details,
      criticality = "low",
      sourceType = "patient_self_reported",
      recordedBy
    } = req.body;

    if (!patientId || !resourceType || !summary) {
      return errorResponse(res, {
        statusCode: 400,
        message: "patientId, resourceType, and summary are required fields."
      });
    }

    const patient = db.patients.get(patientId);
    if (!patient) {
      return errorResponse(res, {
        statusCode: 404,
        message: `Patient ${patientId} does not exist.`
      });
    }

    const recordId = "rec_" + uuidv4().slice(0, 8);
    const newRecord = new HealthRecord({
      id: recordId,
      patientId,
      resourceType,
      clinicalStatus,
      category,
      summary,
      details,
      criticality,
      sourceType,
      recordedBy: recordedBy || (sourceType === "patient_self_reported" ? "Patient Self-Upload" : "Authorized Clinic")
    });

    db.records.set(recordId, newRecord);

    if (!db.patientRecords.has(patientId)) {
      db.patientRecords.set(patientId, new Set());
    }
    db.patientRecords.get(patientId).add(recordId);

    return successResponse(res, {
      statusCode: 201,
      message: "Clinical record registered successfully.",
      data: newRecord
    });
  } catch (err) {
    next(err);
  }
}

// Get all records for the Patient dashboard
export function getPatientRecords(req, res, next) {
  try {
    const { patientId } = req.params;
    const patient = db.patients.get(patientId);

    if (!patient) {
      return errorResponse(res, {
        statusCode: 404,
        message: "Patient not found."
      });
    }

    const recordIds = db.patientRecords.get(patientId) || new Set();
    const records = Array.from(recordIds).map((id) => db.records.get(id)).filter(Boolean);

    return successResponse(res, {
      message: "Patient records retrieved.",
      data: {
        patient,
        records
      }
    });
  } catch (err) {
    next(err);
  }
}