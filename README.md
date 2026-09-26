# MedVault Core: Ephemeral Consent-Driven Health Record Engine

MedVault Core is an open-standard, zero-install clinical data access engine designed for low-friction point-of-care consultations at small clinics, Primary Health Centres (PHCs), and diagnostic facilities.

The platform implements a **dynamic cryptographic handshake** using **HL7 FHIR** data schemas, short-lived session tokens (TTL), and bidirectional **WebSockets** to enforce demonstrable, instant patient-controlled consent and revocation.

---

## Key Architectural Highlights

* **Zero-Install Point-of-Care Access:** Healthcare providers scan a dynamic QR code on any mobile browser—no specialized software, desktop installation, or complex provider logins required.
* **Instant Revocation Engine (The Kill-Switch):** Real-time WebSocket event dispatch pushes an immediate lock-and-wipe command to the provider's active browser session upon patient revocation.
* **FHIR-Compliant Schema:** Clinical records (Allergies, Medications, Diagnostic Reports) adhere to HL7 FHIR structural standards matching India's Ayushman Bharat Digital Mission (ABDM) specifications.
* **Consent Guard Middleware:** Strictly verifies ephemeral session state, TTL expiration, and revocation status before any protected health information (PHI) is released from memory.

---

## Handshake Sequence Flow

```
Provider Browser                     MedVault Engine                  Patient Client
      │                                     │                                │
      │── (1) Scans QR (POST /initiate) ───►│                                │
      │    [Status: PENDING_CONSENT]        │── (2) Push Consent Prompt ────►│
      │── (3) Connects WS (/ws/:sessionId) ─│                                │
      │                                     │◄── (4) Patient Taps "Grant" ───│
      │◄── (5) Broadcast "ACCESS_GRANTED" ──│                                │
      │                                     │                                │
      │── (6) GET /records/view/:sessionId ─►│                                │
      │◄── (7) Protected Clinical Summary ──│                                │
      │                                     │                                │
      │                                     │◄── (8) Patient Taps "Revoke" ──│
      │◄── (9) Broadcast "ACCESS_REVOKED" ──│                                │
      │    [Screen Locks / Memory Wiped]    │                                │
```

---

## Project Structure

```text
medvault-core/
├── config/
│   ├── db.js                 # In-memory mock store pre-seeded with FHIR records
│   └── env.js                # Centralized environment variable parser
├── controllers/
│   ├── consentController.js  # QR handshake, authorization grant, and instant revocation
│   └── recordsController.js  # FHIR record generation and ephemeral doctor summary queries
├── middlewares/
│   ├── errorHandler.js       # Centralized HTTP status and exception formatter
│   └── validateConsent.js    # Consent guard interceptor
├── models/
│   ├── ConsentSession.js     # Ephemeral session state and lifecycle methods
│   ├── HealthRecord.js       # FHIR-structured clinical resource model
│   └── Patient.js            # Patient identity and emergency contacts
├── routes/
│   ├── consentRoutes.js      # /api/v1/consent endpoints
│   └── recordsRoutes.js      # /api/v1/records endpoints
├── sockets/
│   ├── sessionSocket.js      # WebSocket connection handler
│   └── socketManager.js      # Pub/sub channel registry by session ID
├── utils/
│   └── responseFormatter.js  # Standardized API response formatters
├── server.js                 # HTTP and WebSocket server entry point
└── package.json
```

---

## Getting Started

### 1. Prerequisites
* **Node.js** (v18.x or later)
* **npm** (v9.x or later)

### 2. Installation
```bash
git clone [https://github.com/](https://github.com/)<your-username>/medvault-core.git
cd medvault-core
npm install
```

### 3. Environment Configuration
Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

### 4. Running the Server
```bash
# Development mode with auto-reload
npm run dev

# Production start
npm start
```
The HTTP server binds to `http://localhost:5000` and the WebSocket endpoint binds to `ws://localhost:5000/ws/:sessionId`.

---

## API Reference

### Consent Handshake Endpoints

#### 1. Initiate Consent Handshake
* **Route:** `POST /api/v1/consent/initiate`
* **Body:**
  ```json
  {
    "patientId": "pat_101",
    "providerDeviceId": "Clinic iPad Safari"
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Consent handshake initiated. Waiting for patient authorization.",
    "data": {
      "sessionId": "sess_89f1a23c",
      "status": "PENDING_CONSENT",
      "wsEndpoint": "/ws/sess_89f1a23c"
    }
  }
  ```

#### 2. Grant Access
* **Route:** `POST /api/v1/consent/grant`
* **Body:**
  ```json
  {
    "sessionId": "sess_89f1a23c",
    "ttlSeconds": 900
  }
  ```

#### 3. Instant Revocation (Kill-Switch)
* **Route:** `POST /api/v1/consent/revoke`
* **Body:**
  ```json
  {
    "sessionId": "sess_89f1a23c"
  }
  ```

---

### Clinical Records Endpoints

#### 1. View Ephemeral Summary (Doctor Point-of-Care)
* **Route:** `GET /api/v1/records/view/:sessionId`
* **Access Rule:** Requires session state `ACTIVE` and `expiresAt > Date.now()`. Blocked if unapproved, expired, or revoked.

#### 2. Create Clinical Record (Patient Self-Upload / Provider Push)
* **Route:** `POST /api/v1/records`
* **Body:**
  ```json
  {
    "patientId": "pat_101",
    "resourceType": "AllergyIntolerance",
    "clinicalStatus": "active",
    "category": "allergy",
    "summary": "Severe Peanut Allergy",
    "details": {
      "substance": "Peanuts",
      "reaction": "Anaphylaxis"
    },
    "criticality": "high",
    "sourceType": "patient_self_reported"
  }
  ```