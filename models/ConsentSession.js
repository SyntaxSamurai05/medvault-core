export class ConsentSession {
  constructor({ sessionId, patientId, providerDeviceId, ttlSeconds = 900 }) {
    this.sessionId = sessionId;
    this.patientId = patientId;
    this.providerDeviceId = providerDeviceId;
    this.status = "PENDING_CONSENT"; 
    this.ttlSeconds = ttlSeconds;
    this.requestedAt = new Date().toISOString();
    this.grantedAt = null;
    this.expiresAt = null;
    this.revokedAt = null;
  }

  grant() {
    const now = Date.now();
    this.status = "ACTIVE";
    this.grantedAt = new Date(now).toISOString();
    this.expiresAt = new Date(now + this.ttlSeconds * 1000).toISOString();
  }

  revoke() {
    this.status = "REVOKED";
    this.revokedAt = new Date().toISOString();
  }

  isExpired() {
    if (!this.expiresAt) return false;
    return new Date() > new Date(this.expiresAt);
  }
}