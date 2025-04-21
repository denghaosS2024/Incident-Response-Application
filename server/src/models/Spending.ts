import { Document, model, Schema } from "mongoose";

export interface ISpending extends Document {
  incidentId: string; // ID of the incident
  amount: number; // Amount spent
  date: Date; // Date of the spending
  reason: string; // Name of the resource
}

const SpendingSchema = new Schema<ISpending>({
  incidentId: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
});

export default model<ISpending>("Spending", SpendingSchema);
