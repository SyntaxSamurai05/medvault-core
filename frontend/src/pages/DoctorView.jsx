// frontend/src/pages/DoctorView.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { api } from "../services/api";
import { useConsentSocket } from "../hooks/useConsentSocket";
import { ClinicalSummaryCards } from "../components/doctor/ClinicalSummaryCards";
import { SessionLocked } from "../components/doctor/SessionLocked";
import { ShieldCheck, Clock, User, HeartPulse } from "lucide-react";

export function DoctorView() {
  const { sessionId } = useParams();
  const [sessionStatus, setSessionStatus] = useState("LOADING"); // LOADING | PENDING_CONSENT | ACTIVE | REVOKED | EXPIRED
  const [summaryData, setSummaryData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchClinicalData = useCallback(async () => {
    try {
      const response = await api.getDoctorSummary(sessionId);
      if (response.success) {
        setSummaryData(response.data);
        setSessionStatus("ACTIVE");
      }
    } catch (err) {
      setErrorMessage(err.message);
    }
  }, [sessionId]);

  // Handle incoming real-time socket events
  const handleSocketEvent = useCallback(
    (payload) => {
      switch (payload.event) {
        case "ACCESS_GRANTED":
          fetchClinicalData();
          break;
        case "ACCESS_REVOKED":
          setSessionStatus("REVOKED");
          setSummaryData(null); // Purge sensitive data from memory immediately
          break;
        case "SESSION_EXPIRED":
          setSessionStatus("EXPIRED");
          setSummaryData(null);
          break;
        default:
          break;
      }
    },
    [fetchClinicalData]
  );

  const { isConnected } = useConsentSocket(sessionId, handleSocketEvent);

  // Initial session check
  useEffect(() => {
    async function checkStatus() {
      try {
        const response = await api.getSessionStatus(sessionId);
        const status = response.data.status;
        setSessionStatus(status);

        if (status === "ACTIVE") {
          fetchClinicalData();
        }
      } catch (err) {
        setSessionStatus("NOT_FOUND");
        setErrorMessage(err.message);
      }
    }
    checkStatus();
  }, [sessionId, fetchClinicalData]);

  if (sessionStatus === "REVOKED" || sessionStatus === "EXPIRED") {
    return <SessionLocked reason={sessionStatus} />;
  }

  if (sessionStatus === "PENDING_CONSENT") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4 animate-bounce">
          <Clock size={30} />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Awaiting Patient Authorization</h2>
        <p className="mt-2 text-sm text-slate-500 max-w-xs">
          A request has been pushed to the patient's phone. Medical records will display as soon as they tap Approve.
        </p>
        <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
          <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500" : "bg-amber-500"}`} />
          {isConnected ? "Secure Channel Active" : "Connecting to relay..."}
        </div>
      </div>
    );
  }

  if (sessionStatus === "LOADING") {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">
        Establishing secure session...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Point-of-Care Top Bar */}
      <header className="sticky top-0 bg-white border-b border-slate-200 px-4 py-3 z-10 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-700 font-bold text-base">
          <HeartPulse size={20} /> MedVault Point-of-Care
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-medium">
          <ShieldCheck size={14} className="text-emerald-600" /> Authorized Read-Only
        </div>
      </header>

      <main className="max-w-xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Patient Demographic Card */}
        {summaryData?.patient && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold">
                <User size={22} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{summaryData.patient.fullName}</h3>
                <p className="text-xs text-slate-500">
                  {summaryData.patient.gender} • DOB: {summaryData.patient.dateOfBirth}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-400">BLOOD</span>
              <div className="text-base font-extrabold text-red-600">{summaryData.patient.bloodGroup}</div>
            </div>
          </div>
        )}

        {/* Clinical Records List */}
        {summaryData && <ClinicalSummaryCards summary={summaryData} />}
      </main>
    </div>
  );
}