import { Request, Response } from "express";
import inventoryModel from "../models/inventory.model.js";
import clinicModel from "../models/clinic.model.js";

export const addInventoryItem = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      clinicId,
      itemName,
      category,
      quantity,
      unit,
      price,
      expiryDate,
      batchNumber,
      supplier,
      minimumStock,
    } = req.body;

    // Validation
    if (
      !clinicId ||
      !itemName ||
      !category ||
      quantity === undefined ||
      !unit ||
      price === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    // Check clinic exists
    const clinicExists = await clinicModel.findById(clinicId);

    if (!clinicExists) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found",
      });
    }

    // Auto stock status
    let status = "Available";

    if (quantity <= 0) {
      status = "Out of Stock";
    } else if (quantity <= (minimumStock || 10)) {
      status = "Low Stock";
    }

    // Create inventory item
    const newItem = new inventoryModel({
      clinicId,
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

    return res.status(201).json({
      success: true,
      message: "Inventory item added successfully",
      data: newItem,
    });

  } catch (error: any) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getInventoryItems = async (
  req: Request,
  res: Response
) => {
  try {
    const { clinicId } = req.params;

    // Check clinic exists
    const clinicExists = await clinicModel.findById(clinicId);

    if (!clinicExists) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found",
      });
    }

    const inventoryItems = await inventoryModel.find({
      clinicId,
    });

    return res.status(200).json({
      success: true,
      count: inventoryItems.length,
      data: inventoryItems,
    });

  } catch (error: any) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getSingleInventoryItem = async (
  req: Request,
  res: Response
) => {
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

  } catch (error: any) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const updateInventoryItem = async (
  req: Request,
  res: Response
) => {
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
      } else if (
        updatedData.quantity <=
        (updatedData.minimumStock || existingItem.minimumStock)
      ) {
        updatedData.status = "Low Stock";
      } else {
        updatedData.status = "Available";
      }
    }

    const updatedItem = await inventoryModel.findByIdAndUpdate(
      id,
      updatedData,
      {
        new: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Inventory item updated successfully",
      data: updatedItem,
    });

  } catch (error: any) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const deleteInventoryItem = async (
  req: Request,
  res: Response
) => {
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

  } catch (error: any) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

