// frontend/src/components/patient/DynamicQRCard.jsx
import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { QrCode, ShieldCheck } from "lucide-react";

export function DynamicQRCard({ patientId, abhaAddress }) {
  // Encodes the direct doctor point-of-care initiation payload
  const qrPayload = JSON.stringify({
    patientId,
    timestamp: Date.now(),
    type: "POINT_OF_CARE_HANDSHAKE"
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col items-center text-center">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-xs font-semibold mb-4">
        <ShieldCheck size={14} /> Ready for Doctor Handshake
      </div>

      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl shadow-inner">
        <QRCodeSVG
          value={qrPayload}
          size={190}
          level="H"
          includeMargin={false}
          className="rounded-lg"
        />
      </div>

      <h3 className="mt-4 text-sm font-bold text-slate-800 tracking-tight">Show this QR to your Doctor</h3>
      <p className="text-xs text-slate-500 mt-1 max-w-xs">
        Enables temporary 15-minute point-of-care access. Access requires your explicit mobile approval.
      </p>

      <div className="mt-4 pt-3 border-t border-slate-100 w-full flex items-center justify-between text-xs text-slate-400 font-mono">
        <span>ABHA: {abhaAddress}</span>
        <span className="flex items-center gap-1"><QrCode size={13} /> {patientId}</span>
      </div>
    </div>
  );
}