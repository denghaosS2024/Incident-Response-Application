import mongoose, { Document, Schema } from "mongoose";

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

export interface IMissingPerson extends Document {
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

const MissingPersonSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  weight: {
    type: Number,
  },
  height: {
    type: Number,
  },
  race: {
    type: String,
    required: true,
    enum: Object.values(Race),
  },
  eyeColor: {
    type: String,
  },
  gender: {
    type: String,
    required: true,
    enum: Object.values(Gender),
  },
  description: {
    type: String,
  },
  dateLastSeen: {
    type: Date,
    required: true,
  },
  locationLastSeen: {
    type: String,
  },
  photo: {
    type: String,
  },
  reportStatus: {
    type: String,
    enum: ["open", "closed"],
    default: "open",
  },
});

export default mongoose.model<IMissingPerson>(
  "MissingPerson",
  MissingPersonSchema,
);
