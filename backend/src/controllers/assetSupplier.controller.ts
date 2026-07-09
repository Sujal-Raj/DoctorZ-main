import { Request, Response } from "express";
import assetModel from "../models/asset.model.js";
import supplierModel from "../models/supplier.model.js";
import expenseModel from "../models/expense.model.js";

// ==========================================
// CLINICAL ASSET CONFIGURATION & MAINTENANCE
// ==========================================

export const createAsset = async (req: Request, res: Response) => {
  try {
    const { clinicId, assetName, purchaseDate, purchaseCost, depreciationRate, amcExpiryDate, amcProvider } = req.body;

    if (!clinicId || !assetName || !purchaseDate || !purchaseCost) {
      return res.status(400).json({ success: false, message: "Required asset parameters are missing" });
    }

    const cost = Number(purchaseCost);
    const rate = Number(depreciationRate) || 10; // default 10% per year

    // Basic straight-line depreciation calculation based on years elapsed
    const yearsElapsed = Math.max(0, (new Date().getTime() - new Date(purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
    const depreciatedValue = Math.max(0, cost - (cost * (rate / 100) * yearsElapsed));

    const asset = new assetModel({
      clinicId,
      assetName,
      purchaseDate,
      purchaseCost: cost,
      depreciationRate: rate,
      currentValuation: Math.round(depreciatedValue),
      amcExpiryDate: amcExpiryDate || undefined,
      amcProvider: amcProvider || undefined,
    });

    await asset.save();

    // Auto-record purchase cost as a clinic Equipment expense
    const purchaseExpense = new expenseModel({
      clinicId,
      title: `Asset Acquisition: ${assetName}`,
      category: "Equipment",
      amount: cost,
      paymentMethod: "Bank Transfer",
      expenseDate: new Date(purchaseDate),
      description: `Asset purchase cost for ${assetName} (depreciation rate: ${rate}% per year).`,
      addedBy: "System (Asset Sync)",
    });
    await purchaseExpense.save();

    return res.status(201).json({ success: true, message: "Asset onboarded and expense synced successfully", asset });
  } catch (err: any) {
    console.error("Error creating asset:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to onboard asset" });
  }
};

export const getAssetsList = async (req: Request, res: Response) => {
  try {
    const { clinicId } = req.params;

    const list = await assetModel.find({ clinicId }).sort({ createdAt: -1 });

    // Recalculate current valuation in real-time on query
    for (const asset of list) {
      const yearsElapsed = Math.max(0, (new Date().getTime() - new Date(asset.purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
      const depreciatedValue = Math.max(0, asset.purchaseCost - (asset.purchaseCost * (asset.depreciationRate / 100) * yearsElapsed));
      asset.currentValuation = Math.round(depreciatedValue);
    }

    return res.status(200).json({ success: true, assets: list });
  } catch (err: any) {
    console.error("Error fetching assets list:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const logAssetRepair = async (req: Request, res: Response) => {
  try {
    const { assetId } = req.params;
    const { description, cost, technician, status } = req.body;

    if (!description || !cost || !technician) {
      return res.status(400).json({ success: false, message: "Description, cost, and technician are required" });
    }

    const asset = await assetModel.findById(assetId);
    if (!asset) {
      return res.status(404).json({ success: false, message: "Asset not found" });
    }

    const repairCost = Number(cost);

    asset.repairLogs = asset.repairLogs || [];
    asset.repairLogs.push({
      date: new Date(),
      description,
      cost: repairCost,
      technician,
      status: status || "Completed",
    });

    await asset.save();

    // Auto-record repair cost as a clinic Maintenance expense
    const repairExpense = new expenseModel({
      clinicId: asset.clinicId,
      title: `Machine Repair: ${asset.assetName}`,
      category: "Maintenance",
      amount: repairCost,
      paymentMethod: "UPI",
      expenseDate: new Date(),
      description: `Equipment maintenance cost for ${asset.assetName}. Technician: ${technician}. Description: ${description}`,
      addedBy: "System (Asset Sync)",
    });
    await repairExpense.save();

    return res.status(200).json({ success: true, message: "Repair log registered and expense posted", asset });
  } catch (err: any) {
    console.error("Error logging repair:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ==========================================
// SUPPLIER BALANCE LEDGERS
// ==========================================

export const createSupplier = async (req: Request, res: Response) => {
  try {
    const { clinicId, name, contactPerson, mobile } = req.body;

    if (!clinicId || !name) {
      return res.status(400).json({ success: false, message: "Clinic ID and name are required" });
    }

    const supplier = new supplierModel({
      clinicId,
      name,
      contactPerson: contactPerson || undefined,
      mobile: mobile || undefined,
      balanceDue: 0,
    });

    await supplier.save();

    return res.status(201).json({ success: true, message: "Supplier registered successfully", supplier });
  } catch (err: any) {
    console.error("Error creating supplier:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to create supplier" });
  }
};

export const getSuppliersList = async (req: Request, res: Response) => {
  try {
    const { clinicId } = req.params;

    const list = await supplierModel.find({ clinicId }).sort({ name: 1 });
    return res.status(200).json({ success: true, suppliers: list });
  } catch (err: any) {
    console.error("Error fetching suppliers list:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const settleSupplierBalance = async (req: Request, res: Response) => {
  try {
    const { supplierId } = req.params;
    const { amount, method } = req.body;

    if (!amount || !method) {
      return res.status(400).json({ success: false, message: "Amount and payment method are required" });
    }

    const supplier = await supplierModel.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({ success: false, message: "Supplier not found" });
    }

    const payAmt = Number(amount);
    supplier.balanceDue = Math.max(0, supplier.balanceDue - payAmt);
    await supplier.save();

    // Auto-record payment as a clinic Medicine Purchase expense
    const payoutExpense = new expenseModel({
      clinicId: supplier.clinicId,
      title: `Supplier Payout: ${supplier.name}`,
      category: "Medicine Purchase",
      amount: payAmt,
      paymentMethod: method,
      expenseDate: new Date(),
      description: `Settled payment of ₹${payAmt.toLocaleString()} for supplier ${supplier.name}. Outstanding balance remaining: ₹${supplier.balanceDue.toLocaleString()}`,
      addedBy: "System (Supplier Sync)",
    });
    await payoutExpense.save();

    return res.status(200).json({ success: true, message: "Balance settled and expense recorded", supplier });
  } catch (err: any) {
    console.error("Error settling supplier balance:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
