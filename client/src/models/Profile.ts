export interface IProfile {
  userId: string;
  userName: string;
  dob: string;
  sex: "Female" | "Male" | "Other";
  address: string;
  phone: string;
  email: string;
  medicalInfo: {
    condition: string;
    drugs: string;
    allergies: string;
  };
  emergencyContacts: IEmergencyContact[];
}

export interface IEmergencyContact {
  name: string;
  phone: string;
  email: string;
}
