import mongoose, { Document } from "mongoose";

export interface IExpense extends Document {
  clinicId?: mongoose.Types.ObjectId;
  labId?: mongoose.Types.ObjectId;

  title: string;

  category:
    | "Salary"
    | "Electricity"
    | "Medicine Purchase"
    | "Equipment"
    | "Maintenance"
    | "Rent"
    | "Internet"
    | "Miscellaneous";

  amount: number;

  paymentMethod:
    | "Cash"
    | "UPI"
    | "Card"
    | "Bank Transfer";

  expenseDate: Date;

  description?: string;

  receipt?: string;

  addedBy?: string;
  transactionId?: string;
}

const expenseSchema = new mongoose.Schema<IExpense>(
  {
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
      required: false,
    },
    labId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lab",
      required: false,
    },

    title: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      // enum: [
      //   "Salary",
      //   "Electricity",
      //   "Medicine Purchase",
      //   "Equipment",
      //   "Maintenance",
      //   "Rent",
      //   "Internet",
      //   "Miscellaneous",
      // ],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["Cash", "UPI", "Card", "Bank Transfer"],
      required: true,
    },

    expenseDate: {
      type: Date,
      default: Date.now,
    },

    description: {
      type: String,
    },

    receipt: {
      type: String,
    },
    transactionId:{
      type:String,
    },

    addedBy: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const expenseModel = mongoose.model<IExpense>(
  "Expense",
  expenseSchema
);

export default expenseModel;