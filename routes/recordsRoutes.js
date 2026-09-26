import { Router } from "express";
import {
  getDoctorSummary,
  createRecord,
  getPatientRecords
} from "../controllers/recordsController.js";
import { validateConsentSession } from "../middlewares/validateConsent.js";

const router = Router();
router.get("/view/:sessionId", validateConsentSession, getDoctorSummary);
router.post("/", createRecord);
router.get("/patient/:patientId", getPatientRecords);

export default router;