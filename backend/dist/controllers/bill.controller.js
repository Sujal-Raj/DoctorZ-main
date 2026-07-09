import billModel from "../models/bill.model.js";
import inventoryModel from "../models/inventory.model.js";
import patientModel from "../models/patient.model.js";
import { sendSimulatedAlert } from "../utils/smsHelper.js";
export const createBill = async (req, res) => {
    try {
        const { clinicId, patientId, admissionId, items, // Array of { name, quantity, unitPrice, inventoryItemId }
        tax, discount, insuranceClaimed, insuranceProvider, insurancePolicyNumber, claimAmount, } = req.body;
        if (!clinicId || !patientId || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: "Clinic, patient, and billing items list are required" });
        }
        const patient = await patientModel.findById(patientId);
        if (!patient) {
            return res.status(404).json({ success: false, message: "Patient not found" });
        }
        // Process line items and deduce inventory stock
        let subTotal = 0;
        const processedItems = [];
        for (const item of items) {
            const quantity = Number(item.quantity) || 1;
            const unitPrice = Number(item.unitPrice) || 0;
            const total = quantity * unitPrice;
            subTotal += total;
            processedItems.push({
                name: item.name,
                quantity,
                unitPrice,
                total,
                inventoryItemId: item.inventoryItemId || undefined,
            });
            // Automatically sync inventory if linked
            if (item.inventoryItemId) {
                const stockItem = await inventoryModel.findById(item.inventoryItemId);
                if (stockItem) {
                    // Decrement stock quantity
                    stockItem.quantity = Math.max(0, stockItem.quantity - quantity);
                    // Re-calculate stock status
                    if (stockItem.quantity <= 0) {
                        stockItem.status = "Out of Stock";
                    }
                    else if (stockItem.quantity <= stockItem.minimumStock) {
                        stockItem.status = "Low Stock";
                    }
                    else {
                        stockItem.status = "Available";
                    }
                    await stockItem.save();
                }
            }
        }
        const taxVal = Number(tax) || 0;
        const discountVal = Number(discount) || 0;
        const grandTotal = subTotal + taxVal - discountVal;
        // Generate unique invoice sequence number
        const randSeq = Math.floor(100000 + Math.random() * 900000).toString();
        const invoiceNumber = `INV-2026-${randSeq}`;
        const newBill = new billModel({
            clinicId,
            patientId,
            admissionId: admissionId || undefined,
            invoiceNumber,
            items: processedItems,
            subTotal,
            tax: taxVal,
            discount: discountVal,
            grandTotal,
            paidAmount: 0,
            dueAmount: grandTotal,
            status: "Unpaid",
            insuranceClaimed: !!insuranceClaimed,
            insuranceProvider: insuranceProvider || undefined,
            insurancePolicyNumber: insurancePolicyNumber || undefined,
            claimAmount: claimAmount || 0,
            claimStatus: insuranceClaimed ? "Pending" : undefined,
        });
        await newBill.save();
        // Simulated SMS Alert for Invoice
        sendSimulatedAlert({
            clinicId: newBill.clinicId,
            patientId: newBill.patientId,
            type: "Invoice",
            recipientPhone: String(patient.mobileNumber),
            message: `Dear ${patient.fullName}, an invoice ${newBill.invoiceNumber} of ₹${newBill.grandTotal.toLocaleString()} has been generated. Due amount: ₹${newBill.dueAmount.toLocaleString()}. Thank you!`,
        }).catch(err => console.error("Simulated alert error:", err));
        return res.status(201).json({
            success: true,
            message: "Invoice created and inventory synchronized successfully",
            bill: newBill,
        });
    }
    catch (err) {
        console.error("Error creating bill:", err);
        return res.status(500).json({ success: false, message: err.message || "Failed to create bill" });
    }
};
export const getBillsList = async (req, res) => {
    try {
        const { clinicId } = req.params;
        const list = await billModel.find({ clinicId })
            .populate("patientId", "fullName mobileNumber age gender")
            .populate("admissionId", "bedNumber status")
            .sort({ createdAt: -1 });
        return res.status(200).json({ success: true, count: list.length, bills: list });
    }
    catch (err) {
        console.error("Error fetching bills list:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
export const recordPayment = async (req, res) => {
    try {
        const { billId } = req.params;
        const { amount, method, transactionId } = req.body;
        if (!amount || !method) {
            return res.status(400).json({ success: false, message: "Amount and payment method are required" });
        }
        const bill = await billModel.findById(billId);
        if (!bill) {
            return res.status(404).json({ success: false, message: "Bill not found" });
        }
        const payAmt = Number(amount);
        bill.paymentHistory = bill.paymentHistory || [];
        bill.paymentHistory.push({
            date: new Date(),
            amount: payAmt,
            method,
            transactionId: transactionId || undefined,
        });
        bill.paidAmount += payAmt;
        bill.dueAmount = Math.max(0, bill.grandTotal - bill.paidAmount);
        // Update status based on paid progress
        if (bill.dueAmount <= 0) {
            bill.status = "Paid";
        }
        else {
            bill.status = "Partially Paid";
        }
        // Save final state
        await bill.save();
        return res.status(200).json({ success: true, message: "Payment transaction recorded", bill });
    }
    catch (err) {
        console.error("Error logging payment:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
export const processInsuranceClaim = async (req, res) => {
    try {
        const { billId } = req.params;
        const { approvedAmount, claimStatus } = req.body; // claimStatus: Approved | Rejected | Pending
        const bill = await billModel.findById(billId);
        if (!bill) {
            return res.status(404).json({ success: false, message: "Bill not found" });
        }
        bill.approvedAmount = Number(approvedAmount) || 0;
        bill.claimStatus = claimStatus;
        if (claimStatus === "Approved") {
            // Approved amount acts as a credit payment from insurance provider
            const insCredit = Number(approvedAmount) || 0;
            bill.paidAmount += insCredit;
            bill.dueAmount = Math.max(0, bill.grandTotal - bill.paidAmount);
            if (bill.dueAmount <= 0) {
                bill.status = "Paid";
            }
            else {
                bill.status = "Partially Paid";
            }
        }
        await bill.save();
        return res.status(200).json({ success: true, message: "Insurance claim processed", bill });
    }
    catch (err) {
        console.error("Error setting insurance claim status:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
