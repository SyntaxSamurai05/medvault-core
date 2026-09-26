// frontend/src/components/doctor/SessionLocked.jsx
import React from "react";
import { ShieldAlert, RefreshCw } from "lucide-react";

export function SessionLocked({ reason = "Session Terminated" }) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 shadow-sm animate-pulse">
        <ShieldAlert size={36} />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Access Terminated</h2>
      <p className="mt-2 text-sm text-slate-600 max-w-sm">
        {reason === "REVOKED"
          ? "The patient has explicitly revoked access to their protected health records."
          : "The 15-minute point-of-care session timer has expired."}
      </p>
      <div className="mt-6 p-3 bg-slate-100 rounded-lg text-xs text-slate-500 max-w-xs border border-slate-200">
        Clinical data has been purged from browser memory in compliance with patient consent protocols.
      </div>
      <button
        onClick={() => window.location.reload()}
        className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
      >
        <RefreshCw size={16} />
        New Scan Handshake
      </button>
    </div>
  );
}