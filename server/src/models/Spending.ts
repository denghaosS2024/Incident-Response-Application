import { Document, model, Model, Schema } from "mongoose";

export interface ISpending extends Document {
  incidentId: string; // ID of the incident
  amount: number; // Amount spent
  date: Date; // Date of the spending
  reason: string; // Name of the resource
}

interface SpendingModel extends Model<ISpending> {
  createForIncidents(
    incidentIds: string[],
    amount: number,
    date: Date,
    reason: string,
  ): Promise<ISpending[]>;
}

const SpendingSchema = new Schema<ISpending, SpendingModel>({
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

// Static method to create spendings for multiple incidents
SpendingSchema.statics.createForIncidents = async function (
  incidentIds: string[],
  amount: number[],
  date: Date,
  reason: string,
) {
  const records = incidentIds.map((incidentId) => ({
    incidentId,
    amount,
    date,
    reason,
  }));

  return this.insertMany(records);
};

export default model<ISpending, SpendingModel>("Spending", SpendingSchema);
