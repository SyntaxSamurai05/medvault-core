// frontend/src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  try {
    const response = await fetch(url, { ...options, headers });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error.message);
    throw error;
  }
}

export const api = {
  // Initiate consent handshake (Doctor scans QR)
  initiateConsent: (patientId, providerDeviceId) =>
    request("/api/v1/consent/initiate", {
      method: "POST",
      body: JSON.stringify({ patientId, providerDeviceId }),
    }),

  // Patient grants access
  grantConsent: (sessionId, ttlSeconds = 900) =>
    request("/api/v1/consent/grant", {
      method: "POST",
      body: JSON.stringify({ sessionId, ttlSeconds }),
    }),

  // Patient revokes access (The Kill-Switch)
  revokeConsent: (sessionId) =>
    request("/api/v1/consent/revoke", {
      method: "POST",
      body: JSON.stringify({ sessionId }),
    }),

  // Check session status
  getSessionStatus: (sessionId) =>
    request(`/api/v1/consent/status/${sessionId}`),

  // Doctor fetches protected clinical summary
  getDoctorSummary: (sessionId) =>
    request(`/api/v1/records/view/${sessionId}`),

  // Patient fetches own full records
  getPatientRecords: (patientId) =>
    request(`/api/v1/records/patient/${patientId}`),

  // Self-upload or add record
  createRecord: (recordData) =>
    request("/api/v1/records", {
      method: "POST",
      body: JSON.stringify(recordData),
    }),
};