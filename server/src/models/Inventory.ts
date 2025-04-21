import mongoose, { Document, Schema } from "mongoose";

export interface IInventoryItem {
  name: string;
  quantity: number;
  icon: string;
  description?: string; // Optional description of the item
}

export interface IInventory extends Document {
  category: string; // e.g., "default", "truck:<id>""
  items: IInventoryItem[];
}

const InventorySchema = new Schema<IInventory>({
  category: {
    type: String,
    required: true,
    unique: true, // one inventory per category (default or truck name)
  },
  items: [
    {
      name: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 0,
      },
      icon: {
        type: String,
        default: "Emergency",
      },
      description: {
        type: String,
        default: "",
      },
    },
  ],
});

export default mongoose.model<IInventory>("Inventory", InventorySchema);
