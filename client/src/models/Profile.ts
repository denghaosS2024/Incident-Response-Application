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
  languagePreference: ILanguagePreference;
  emergencyContacts: IEmergencyContact[];
}

export interface IEmergencyContact {
  name: string;
  phone: string;
  email: string;
}

export interface ILanguagePreference {
  languages: string[];
  translateTarget: string;
  autoTranslate: boolean;
}

export const defaultLanguagePreference: ILanguagePreference = {
  languages: [],
  translateTarget: "",
  autoTranslate: false,
};
