import { Patient } from "../models/Patient.js";
import { HealthRecord } from "../models/HealthRecord.js";

export const db = {
  patients: new Map(),
  records: new Map(),        
  patientRecords: new Map(), 
  sessions: new Map()        
};

const defaultPatient = new Patient({
  id: "pat_101",
  abhaAddress: "ramesh.kumar@abdm",
  fullName: "Ramesh Kumar",
  dateOfBirth: "1984-04-12",
  gender: "male",
  bloodGroup: "B+",
  emergencyPhone: "+919876543210"
});

db.patients.set(defaultPatient.id, defaultPatient);
db.patientRecords.set(defaultPatient.id, new Set());

const initialRecords = [
  new HealthRecord({
    id: "rec_001",
    patientId: "pat_101",
    resourceType: "AllergyIntolerance",
    clinicalStatus: "active",
    category: "allergy",
    summary: "Severe Penicillin Allergy",
    details: {
      substance: "Penicillin G",
      reaction: "Anaphylaxis, acute urticaria",
      severity: "severe"
    },
    criticality: "high",
    sourceType: "provider_push",
    recordedBy: "Care Hospital, Hyderabad"
  }),
  new HealthRecord({
    id: "rec_002",
    patientId: "pat_101",
    resourceType: "MedicationStatement",
    clinicalStatus: "active",
    category: "medication",
    summary: "Telmisartan 40mg (Hypertension)",
    details: {
      medication: "Telmisartan",
      dosage: "40mg",
      frequency: "Once daily (Morning)",
      duration: "Ongoing"
    },
    criticality: "medium",
    sourceType: "provider_push",
    recordedBy: "Apollo Health Clinic"
  }),
  new HealthRecord({
    id: "rec_003",
    patientId: "pat_101",
    resourceType: "DiagnosticReport",
    clinicalStatus: "active",
    category: "lab_result",
    summary: "Abdominal Ultrasound Report",
    details: {
      testName: "Ultrasound Whole Abdomen",
      findings: "Mild diffuse fatty liver; gall bladder, pancreas, and spleen normal",
      dateOfStudy: "2026-07-15"
    },
    criticality: "low",
    sourceType: "patient_self_reported",
    recordedBy: "Lucid Medical Diagnostics"
  })
];

initialRecords.forEach((record) => {
  db.records.set(record.id, record);
  db.patientRecords.get(defaultPatient.id).add(record.id);
});