import mongoose from "mongoose";
const inventorySchema = new mongoose.Schema({
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
}, {
    timestamps: true,
});
const inventoryModel = mongoose.model("Inventory", inventorySchema);
export default inventoryModel;
