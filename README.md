# MedVault Core: Ephemeral Consent-Driven Health Record Engine

An open-standard, zero-install clinical data access engine designed for low-friction point-of-care consultations at small clinics, Primary Health Centres (PHCs), and diagnostic facilities.

MedVault implements an ephemeral cryptographic handshake using **HL7 FHIR** schemas, short-lived tokens (TTL), and bidirectional **WebSockets** to enforce demonstrable, patient-controlled consent and instant kill-switch revocation.

---

## System Architecture

```
[ Patient Mobile Client ]                      [ MedVault Core Engine ]                     [ Doctor Web Browser ]
          │                                                │                                          │
          │                                                │◄──── 1. Scans QR (POST /initiate) ───────│
          │◄──── 2. WS Prompt: "Grant Access?" ────────────│      (Session: PENDING_CONSENT)          │
          │                                                │────── 3. WS Connect: /ws/:sessionId ────►│
          │───── 4. Taps "Approve" (POST /grant) ─────────►│                                          │
          │                                                │────── 5. WS Broadcast: ACCESS_GRANTED ──►│
          │                                                │◄───── 6. GET /records/view/:sessionId ───│
          │                                                │────── 7. Clinical FHIR Payload ─────────►│
          │                                                │                                          │
          │───── 8. Taps "REVOKE NOW" (POST /revoke) ─────►│                                          │
          │                                                │────── 9. WS Broadcast: ACCESS_REVOKED ──►│
          │                                                │      [Instant Lock Screen / Purge PHI]   │
```

---

## Key Features

* **Zero-Install Point-of-Care Access:** Providers scan a dynamic QR code on any standard browser—no desktop software installation or doctor accounts required.
* **Instant Revocation Engine (The Kill-Switch):** Patient-triggered WebSocket dispatch pushes a real-time lock-and-wipe command that immediately clears sensitive medical data from the doctor's browser state.
* **FHIR-Compliant Data Schemas:** Critical red-flag allergies, active medications, and diagnostic reports adhere to HL7 FHIR structural standards matching India's ABDM specifications.
* **Consent Guard Middleware:** Strictly verifies session authenticity, authorization state, and TTL expiration before protected health information (PHI) is released from memory.

---

## Tech Stack

* **Backend:** Node.js, Express, Native WebSockets (`ws`), In-Memory Store
* **Frontend:** React, Vite, Tailwind CSS, Lucide Icons, QRCode.react, React Router DOM
* **Architecture:** Monorepo with full REST and WebSocket real-time event synchronization

---

## Getting Started

### 1. Prerequisites
* **Node.js** (v18.x or later)
* **npm** (v9.x or later)

### 2. Setup Backend & Frontend

```bash
# Clone the repository
git clone [https://github.com/](https://github.com/)<your-username>/medvault-core.git
cd medvault-core

# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Environment Configuration
Ensure `.env` exists in the root:
```env
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
DEFAULT_SESSION_TTL_SECONDS=900
```

Ensure `frontend/.env` exists:
```env
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000
```

---

## Running the Application

Open two terminal tabs:

**Terminal 1 (Backend Engine):**
```bash
npm run server
# Runs Express & WebSockets on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
npm run client
# Runs Vite dev server on http://localhost:5173
```

---

## Live Demo Test Walkthrough

1. Open `http://localhost:5173/patient` in your browser.
2. Click **"Simulate Doctor Scanning QR"** to initiate an ephemeral session handshake.
3. You will see an incoming approval prompt. Click **"Approve Access"**.
4. Click **"Open Doctor View"** (opens in a new tab: `/view/:sessionId`).
5. Notice the doctor view immediately renders the patient's critical allergies, active medications, and lab reports.
6. Switch back to the **Patient Portal** tab and tap **"Revoke Access Now"**.
7. Switch to the **Doctor View** tab: the screen will instantly transition to **"Access Terminated"** and wipe all protected clinical data from memory via the WebSocket kill-switch.