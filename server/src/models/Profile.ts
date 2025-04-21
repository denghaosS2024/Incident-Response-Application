import mongoose, { Document, InferSchemaType, Schema } from "mongoose";

const LanguagePreferenceSchema: Schema = new Schema({
  languages: { type: [String], required: true },
  translateTarget: { type: String, required: true },
  autoTranslate: { type: Boolean, required: true },
});

type ILanguagePreference = InferSchemaType<typeof LanguagePreferenceSchema>;

const EmegencyContactSchema: Schema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
});

type IEmergencyContact = InferSchemaType<typeof EmegencyContactSchema>;

export interface IProfile extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  dob: Date;
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

const ProfileSchema = new Schema<IProfile>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    name: { type: String, required: true },
    dob: { type: Date, required: true },
    sex: { type: String, enum: ["Female", "Male", "Other"], required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    medicalInfo: {
      condition: { type: String, required: false },
      drugs: { type: String, required: false },
      allergies: { type: String, required: false },
    },
    languagePreference: { type: LanguagePreferenceSchema, required: false },
    emergencyContacts: { type: [EmegencyContactSchema], required: false },
  },
  { timestamps: true },
);

export default mongoose.model<IProfile>("Profile", ProfileSchema);
