import { Document, Schema, model } from "mongoose";
import { IUser } from "./User";

export interface IFundingHistory {
  type: "Assign" | "Request";
  sender: IUser;
  timestamp: Date;
  amount: number;
  reason: string;
}
const FundingHistorySchema = new Schema<IFundingHistory>(
  {
    type: { type: String, enum: ["Assign", "Request"], required: true },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
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
  remainingFunding: number;
}

const CitySchema = new Schema<ICity>({
  name: { type: String, required: true, unique: true },
  // add more fields as needed
  fireFunding: { type: Number, default: 0 },
  policeFunding: { type: Number, default: 0 },
  fireFundingHistory: { type: [FundingHistorySchema], default: [] },
  policeFundingHistory: { type: [FundingHistorySchema], default: [] },
  remainingFunding: { type: Number, default: 0 },
});

export default model<ICity>("City", CitySchema);
