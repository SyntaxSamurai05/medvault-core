export class Patient {
  constructor({ id, abhaAddress, fullName, dateOfBirth, gender, bloodGroup, emergencyPhone }) {
    this.id = id;                                
    this.abhaAddress = abhaAddress;               
    this.fullName = fullName;
    this.dateOfBirth = dateOfBirth;               
    this.gender = gender;                         
    this.bloodGroup = bloodGroup;                 
    this.emergencyPhone = emergencyPhone;         
    this.createdAt = new Date().toISOString();
  }
}