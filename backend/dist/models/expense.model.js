import mongoose from "mongoose";
const expenseSchema = new mongoose.Schema({
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
    transactionId: {
        type: String,
    },
    addedBy: {
        type: String,
    },
}, {
    timestamps: true,
});
const expenseModel = mongoose.model("Expense", expenseSchema);
export default expenseModel;
