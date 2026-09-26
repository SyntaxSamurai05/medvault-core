export class HealthRecord {
  constructor({
    id,
    patientId,
    resourceType,     
    clinicalStatus,   
    category,         
    summary,          
    details,          
    criticality = "low", 
    sourceType,       
    recordedBy
  }) {
    this.id = id;
    this.patientId = patientId;
    this.resourceType = resourceType;
    this.clinicalStatus = clinicalStatus;
    this.category = category;
    this.summary = summary;
    this.details = details;
    this.criticality = criticality;
    this.sourceType = sourceType;
    this.recordedBy = recordedBy;
    this.recordedAt = new Date().toISOString();
  }
}