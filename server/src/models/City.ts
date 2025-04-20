import { Document, Schema, model } from "mongoose";
import { IUser } from "./User";

export interface IFundingHistory {
  type: "assign" | "request";
  sender: IUser;
  timestamp: Date;
  amount: number;
  reason: string;
}
const FundingHistorySchema = new Schema<IFundingHistory>(
  {
    type: { type: String, enum: ["assign", "request"], required: true },
    sender: { type: String, required: true },
    amount: { type: Number, required: true },
    reason: { type: String, required: false },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false },
);

export interface ICity extends Document {
  name: string;
  fireFunding: number;
  policeFunding: number;
  fireFundingHistory: IFundingHistory[];
  policeFundingHistory: IFundingHistory[];
}

const CitySchema = new Schema<ICity>({
  name: { type: String, required: true, unique: true },
  // add more fields as needed
  fireFunding: { type: Number, default: 0 },
  policeFunding: { type: Number, default: 0 },
  fireFundingHistory: { type: [FundingHistorySchema], default: [] },
  policeFundingHistory: { type: [FundingHistorySchema], default: [] },
});

export default model<ICity>("City", CitySchema);
