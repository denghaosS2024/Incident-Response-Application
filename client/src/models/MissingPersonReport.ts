export enum Gender {
  Male = "Male",
  Female = "Female",
}

export enum Race {
  White = "White",
  AfricanAmerican = "African American",
  AmericanIndian = "American Indian or Alaska Native",
  Hispanic = "Hispanic",
  Asian = "Asian",
  NativeHawaiian = "Native Hawaiian or Other Pacific Islander",
}

export default interface IMissingPerson {
  _id?: string;
  name: string;
  age: number;
  weight?: number;
  height?: number;
  race: Race;
  eyeColor?: string;
  gender: Gender;
  description?: string;
  dateLastSeen: Date;
  locationLastSeen?: string;
  photo?: string;
  reportStatus: string;
}
