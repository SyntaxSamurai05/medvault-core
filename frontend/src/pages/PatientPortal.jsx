// frontend/src/pages/PatientPortal.jsx
import React, { useState, useCallback } from "react";
import { api } from "../services/api";
import { DynamicQRCard } from "../components/patient/DynamicQRCard";
import { useConsentSocket } from "../hooks/useConsentSocket";
import { ShieldCheck, ShieldAlert, KeyRound, ExternalLink } from "lucide-react";

export function PatientPortal() {
  const patientId = "pat_101"; // Default seeded patient
  const abhaAddress = "ramesh.kumar@abdm";

  const [activeSessionId, setActiveSessionId] = useState("");
  const [sessionStatus, setSessionStatus] = useState("IDLE"); // IDLE | PENDING | ACTIVE | REVOKED
  const [loading, setLoading] = useState(false);

  // Listen to WebSocket events when a session is initiated
  const handleSocketEvent = useCallback((payload) => {
    if (payload.event === "CONSENT_REQUESTED") {
      setActiveSessionId(payload.sessionId);
      setSessionStatus("PENDING");
    }
  }, []);

  useConsentSocket(activeSessionId, handleSocketEvent);

  // Simulate Doctor Scanning QR (creates an ephemeral session)
  const handleSimulateDoctorScan = async () => {
    try {
      setLoading(true);
      const res = await api.initiateConsent(patientId, "Doctor Mobile Safari");
      if (res.success) {
        setActiveSessionId(res.data.sessionId);
        setSessionStatus("PENDING");
      }
    } catch (err) {
      alert("Failed to initiate handshake: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Grant Access
  const handleGrant = async () => {
    try {
      setLoading(true);
      await api.grantConsent(activeSessionId, 900); // 15 mins
      setSessionStatus("ACTIVE");
    } catch (err) {
      alert("Grant failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Instant Revoke (Kill-Switch)
  const handleRevoke = async () => {
    try {
      setLoading(true);
      await api.revokeConsent(activeSessionId);
      setSessionStatus("REVOKED");
    } catch (err) {
      alert("Revoke failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <h1 className="font-bold text-slate-800 text-base">MedVault Patient Portal</h1>
        <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
          {abhaAddress}
        </span>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        {/* Dynamic QR Presentation Card */}
        <DynamicQRCard patientId={patientId} abhaAddress={abhaAddress} />

        {/* Live Simulation Control Box */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Demo Quick Actions</h4>
          <button
            onClick={handleSimulateDoctorScan}
            disabled={loading || sessionStatus === "PENDING" || sessionStatus === "ACTIVE"}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 transition-all"
          >
            <KeyRound size={16} /> Simulate Doctor Scanning QR
          </button>
        </div>

        {/* Handshake Consent Prompts */}
        {sessionStatus === "PENDING" && (
          <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl shadow-md animate-pulse">
            <h3 className="font-bold text-amber-900 text-base">Doctor Requesting Access</h3>
            <p className="text-xs text-amber-700 mt-1">
              A clinic device has scanned your QR. Allow temporary 15-minute read access?
            </p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleGrant}
                disabled={loading}
                className="flex-1 py-2 bg-emerald-600 text-white font-semibold text-sm rounded-lg hover:bg-emerald-700 transition"
              >
                Approve Access
              </button>
              <button
                onClick={() => setSessionStatus("IDLE")}
                className="px-4 py-2 border border-slate-300 text-slate-600 font-semibold text-sm rounded-lg hover:bg-white transition"
              >
                Deny
              </button>
            </div>
          </div>
        )}

        {/* Active Session & The Instant Revocation Button */}
        {sessionStatus === "ACTIVE" && (
          <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <ShieldCheck size={18} className="text-emerald-600" /> Active Session
              </div>
              <a
                href={`/view/${activeSessionId}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium hover:underline"
              >
                Open Doctor View <ExternalLink size={12} />
              </a>
            </div>
            <p className="text-xs text-emerald-700">
              Doctor is currently viewing your allergies and prescriptions.
            </p>
            <button
              onClick={handleRevoke}
              disabled={loading}
              className="w-full py-2.5 bg-red-600 text-white font-bold text-sm rounded-lg hover:bg-red-700 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <ShieldAlert size={16} /> Revoke Access Now
            </button>
          </div>
        )}

        {sessionStatus === "REVOKED" && (
          <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl text-center text-xs text-slate-600 font-medium">
            Session has been terminated. The doctor screen was locked immediately.
          </div>
        )}
      </main>
    </div>
  );
}