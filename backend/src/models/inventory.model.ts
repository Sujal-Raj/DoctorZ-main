import mongoose, { Document } from "mongoose";

export interface IInventory extends Document {
  clinicId: mongoose.Types.ObjectId;

  itemName: string;

  category: "Medicine" | "Equipment" | "Consumable";

  quantity: number;

  unit: string;

  price: number;

  expiryDate?: Date;

  batchNumber?: string;

  supplier?: string;

  minimumStock: number;

  status: "Available" | "Low Stock" | "Out of Stock";
}

const inventorySchema = new mongoose.Schema<IInventory>(
  {
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
    },

    itemName: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: ["Medicine", "Equipment", "Consumable"],
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      default: 0,
    },

    unit: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    expiryDate: {
      type: Date,
    },

    batchNumber: {
      type: String,
    },

    supplier: {
      type: String,
    },

    minimumStock: {
      type: Number,
      default: 10,
    },

    status: {
      type: String,
      enum: ["Available", "Low Stock", "Out of Stock"],
      default: "Available",
    },
  },
  {
    timestamps: true,
  }
);

const inventoryModel = mongoose.model<IInventory>(
  "Inventory",
  inventorySchema
);

export default inventoryModel;