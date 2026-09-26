import { Router } from "express";
import {
  initiateConsent,
  grantConsent,
  revokeConsent,
  getSessionStatus
} from "../controllers/consentController.js";

const router = Router();
router.post("/initiate", initiateConsent);
router.post("/grant", grantConsent);
router.post("/revoke", revokeConsent);
router.get("/status/:sessionId", getSessionStatus);

export default router;