import inventoryModel from "../models/inventory.model.js";
import clinicModel from "../models/clinic.model.js";
import { LabModel } from "../models/lab.model.js";
import expenseModel from "../models/expense.model.js";
export const addInventoryItem = async (req, res) => {
    try {
        const { clinicId, labId, itemName, category, quantity, unit, price, expiryDate, batchNumber, supplier, minimumStock, } = req.body;
        // Validation
        if (!clinicId && !labId) {
            return res.status(400).json({
                success: false,
                message: "Either clinicId or labId must be provided",
            });
        }
        if (!itemName ||
            !category ||
            quantity === undefined ||
            !unit ||
            price === undefined) {
            return res.status(400).json({
                success: false,
                message: "Required fields are missing",
            });
        }
        // Check clinic exists if clinicId is passed
        if (clinicId) {
            const clinicExists = await clinicModel.findById(clinicId);
            if (!clinicExists) {
                return res.status(404).json({
                    success: false,
                    message: "Clinic not found",
                });
            }
        }
        // Check lab exists if labId is passed
        if (labId) {
            const labExists = await LabModel.findById(labId);
            if (!labExists) {
                return res.status(404).json({
                    success: false,
                    message: "Lab not found",
                });
            }
        }
        // Auto stock status
        let status = "Available";
        if (quantity <= 0) {
            status = "Out of Stock";
        }
        else if (quantity <= (minimumStock || 10)) {
            status = "Low Stock";
        }
        // Create inventory item
        const newItem = new inventoryModel({
            clinicId: clinicId || undefined,
            labId: labId || undefined,
            itemName,
            category,
            quantity,
            unit,
            price,
            expiryDate,
            batchNumber,
            supplier,
            minimumStock,
            status,
        });
        await newItem.save();
        // If it's a lab stock purchase, automatically create a matching expense entry
        if (labId) {
            let expenseCategory = "Miscellaneous";
            if (category === "Medicine") {
                expenseCategory = "Medicine Purchase";
            }
            else if (category === "Equipment") {
                expenseCategory = "Equipment";
            }
            const totalAmount = quantity * price;
            const autoExpense = new expenseModel({
                labId,
                title: `Inventory Purchase: ${itemName}`,
                category: expenseCategory,
                amount: totalAmount,
                paymentMethod: "Cash",
                expenseDate: new Date(),
                description: `Auto-recorded expense from adding inventory item: ${itemName} (${quantity} ${unit} @ ₹${price} each). Supplier: ${supplier || "Unknown"}`,
                addedBy: "System (Inventory Sync)"
            });
            await autoExpense.save();
        }
        return res.status(201).json({
            success: true,
            message: "Inventory item added successfully",
            data: newItem,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
export const getInventoryItems = async (req, res) => {
    try {
        const { clinicId, labId } = req.params;
        if (!clinicId && !labId) {
            return res.status(400).json({
                success: false,
                message: "Either clinicId or labId must be provided in parameters",
            });
        }
        let query = {};
        if (clinicId) {
            const clinicExists = await clinicModel.findById(clinicId);
            if (!clinicExists) {
                return res.status(404).json({
                    success: false,
                    message: "Clinic not found",
                });
            }
            query.clinicId = clinicId;
        }
        else if (labId) {
            const labExists = await LabModel.findById(labId);
            if (!labExists) {
                return res.status(404).json({
                    success: false,
                    message: "Lab not found",
                });
            }
            query.labId = labId;
        }
        const inventoryItems = await inventoryModel.find(query);
        return res.status(200).json({
            success: true,
            count: inventoryItems.length,
            data: inventoryItems,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
export const getSingleInventoryItem = async (req, res) => {
    try {
        const { id } = req.params;
        const inventoryItem = await inventoryModel.findById(id);
        if (!inventoryItem) {
            return res.status(404).json({
                success: false,
                message: "Inventory item not found",
            });
        }
        return res.status(200).json({
            success: true,
            data: inventoryItem,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
export const updateInventoryItem = async (req, res) => {
    try {
        const { id } = req.params;
        const existingItem = await inventoryModel.findById(id);
        if (!existingItem) {
            return res.status(404).json({
                success: false,
                message: "Inventory item not found",
            });
        }
        const updatedData = req.body;
        // Auto update stock status
        if (updatedData.quantity !== undefined) {
            if (updatedData.quantity <= 0) {
                updatedData.status = "Out of Stock";
            }
            else if (updatedData.quantity <=
                (updatedData.minimumStock || existingItem.minimumStock)) {
                updatedData.status = "Low Stock";
            }
            else {
                updatedData.status = "Available";
            }
        }
        const updatedItem = await inventoryModel.findByIdAndUpdate(id, updatedData, {
            new: true,
        });
        return res.status(200).json({
            success: true,
            message: "Inventory item updated successfully",
            data: updatedItem,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
export const deleteInventoryItem = async (req, res) => {
    try {
        const { id } = req.params;
        const inventoryItem = await inventoryModel.findById(id);
        if (!inventoryItem) {
            return res.status(404).json({
                success: false,
                message: "Inventory item not found",
            });
        }
        await inventoryModel.findByIdAndDelete(id);
        return res.status(200).json({
            success: true,
            message: "Inventory item deleted successfully",
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
