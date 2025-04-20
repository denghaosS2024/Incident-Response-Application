import mongoose, { Document, Schema, Types } from "mongoose";

// TODO: The totalnumberofpatients field is redundant and should be removed in the future, can just use patients.length
export interface IHospital extends Document {
  hospitalId: string;
  hospitalName: string;
  hospitalAddress: string;
  hospitalDescription: string;
  totalNumberERBeds: number;
  totalNumberOfPatients: number;
  nurses: Schema.Types.ObjectId[];
  patients: Schema.Types.ObjectId[];
  hospitalGroupId?: Types.ObjectId;
}

const HospitalSchema = new Schema({
  hospitalId: {
    type: String,
    required: true,
    unique: true,
  },
  hospitalName: {
    type: String,
    required: true,
    unique: false,
  },
  hospitalAddress: {
    type: String,
    required: true,
    unique: false,
  },
  hospitalDescription: {
    type: String,
    required: false,
    unique: false,
  },
  totalNumberERBeds: {
    type: Number,
    required: false,
    unique: false,
    default: 0,
  },
  totalNumberOfPatients: {
    type: Number,
    required: false,
    unique: false,
  },
  nurses: {
    type: [Schema.Types.ObjectId],
    ref: "User",
    required: false,
    unique: false,
    default: [],
  },
  patients: {
    type: [Schema.Types.ObjectId],
    ref: "User",
    required: false,
    unique: false,
    default: [],
  },
  hospitalGroupId: {
    type: Schema.Types.ObjectId,
    ref: "Channel",
    required: false,
    default: null,
  },
});

// set the hospitalId to be the same as _id when creating a new hospital
HospitalSchema.pre("save", function (next) {
  if (!this.hospitalId) {
    this.hospitalId = this._id.toString();
  }
  next();
});

export default mongoose.model<IHospital>("Hospital", HospitalSchema);
