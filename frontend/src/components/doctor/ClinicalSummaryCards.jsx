// frontend/src/components/doctor/ClinicalSummaryCards.jsx
import React from "react";
import { AlertTriangle, Pill, FileText, Building2 } from "lucide-react";

export function ClinicalSummaryCards({ summary }) {
  const { criticalAlerts = [], activeMedications = [], diagnostics = [] } = summary;

  return (
    <div className="space-y-6">
      {/* 1. Critical Red Flags (Allergies & High-Risk Conditions) */}
      <div className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden">
        <div className="bg-red-50/70 border-b border-red-100 px-4 py-3 flex items-center gap-2 text-red-800 font-semibold text-sm">
          <AlertTriangle size={18} className="text-red-600" />
          Critical Alerts & Allergies ({criticalAlerts.length})
        </div>
        <div className="divide-y divide-slate-100">
          {criticalAlerts.length === 0 ? (
            <div className="p-4 text-sm text-slate-500">No known critical allergies reported.</div>
          ) : (
            criticalAlerts.map((alert) => (
              <div key={alert.id} className="p-4 flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-red-700">{alert.summary}</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    <span className="font-medium text-slate-700">Reaction:</span> {alert.details?.reaction || "Not specified"}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                    <Building2 size={12} /> {alert.recordedBy}
                  </p>
                </div>
                <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-[11px] font-bold uppercase tracking-wider">
                  {alert.criticality}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 2. Active Medications */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-emerald-50/70 border-b border-emerald-100 px-4 py-3 flex items-center gap-2 text-emerald-900 font-semibold text-sm">
          <Pill size={18} className="text-emerald-600" />
          Active Prescriptions ({activeMedications.length})
        </div>
        <div className="divide-y divide-slate-100">
          {activeMedications.length === 0 ? (
            <div className="p-4 text-sm text-slate-500">No active medication records available.</div>
          ) : (
            activeMedications.map((med) => (
              <div key={med.id} className="p-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-900">{med.summary}</h4>
                  <span className="text-xs text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {med.clinicalStatus}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-slate-600">
                  <div><span className="text-slate-400">Dosage:</span> {med.details?.dosage || "N/A"}</div>
                  <div><span className="text-slate-400">Schedule:</span> {med.details?.frequency || "N/A"}</div>
                </div>
                <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                  <Building2 size={12} /> {med.recordedBy}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. Diagnostic & Lab Reports */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-blue-50/70 border-b border-blue-100 px-4 py-3 flex items-center gap-2 text-blue-900 font-semibold text-sm">
          <FileText size={18} className="text-blue-600" />
          Diagnostic & Lab History ({diagnostics.length})
        </div>
        <div className="divide-y divide-slate-100">
          {diagnostics.length === 0 ? (
            <div className="p-4 text-sm text-slate-500">No recent diagnostic reports on record.</div>
          ) : (
            diagnostics.map((diag) => (
              <div key={diag.id} className="p-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-900">{diag.summary}</h4>
                  <span className="text-xs text-slate-500">{diag.details?.dateOfStudy || "Recent"}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-2.5 rounded border border-slate-100">
                  {diag.details?.findings || "Normal report"}
                </p>
                <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                  <Building2 size={12} /> {diag.recordedBy}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}