import mongoose, { Schema, Document } from "mongoose";

export interface IInventoryItem {
  name: string;
  quantity: number;
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
    },
  ],
});

export default mongoose.model<IInventory>("Inventory", InventorySchema);
