// frontend/src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PatientPortal } from "./pages/PatientPortal";
import { DoctorView } from "./pages/DoctorView";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route redirects to Patient Portal */}
        <Route path="/" element={<Navigate to="/patient" replace />} />
        <Route path="/patient" element={<PatientPortal />} />

        {/* Ephemeral Doctor Point-of-Care View */}
        <Route path="/view/:sessionId" element={<DoctorView />} />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/patient" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;