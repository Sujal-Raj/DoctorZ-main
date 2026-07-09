import { Request, Response } from "express";
import expenseModel from "../models/expense.model.js";
import clinicModel from "../models/clinic.model.js";
import { LabModel } from "../models/lab.model.js";

export const addExpense = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      clinicId,
      labId,
      title,
      category,
      amount,
      paymentMethod,
      expenseDate,
      description,
      receipt,
      addedBy,
    } = req.body;

    // Validation
    if (!clinicId && !labId) {
      return res.status(400).json({
        success: false,
        message: "Either clinicId or labId must be provided",
      });
    }

    if (
      !title ||
      !category ||
      amount === undefined ||
      !paymentMethod
    ) {
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

    // Create expense
    const newExpense = new expenseModel({
      clinicId: clinicId || undefined,
      labId: labId || undefined,
      title,
      category,
      amount,
      paymentMethod,
      expenseDate,
      description,
      receipt,
      addedBy,
    });

    await newExpense.save();

    return res.status(201).json({
      success: true,
      message: "Expense added successfully",
      data: newExpense,
    });

  } catch (error: any) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getExpenses = async (
  req: Request,
  res: Response
) => {
  try {
    const { clinicId, labId } = req.params;

    if (!clinicId && !labId) {
      return res.status(400).json({
        success: false,
        message: "Either clinicId or labId must be provided in parameters",
      });
    }

    let query: any = {};

    if (clinicId) {
      query.clinicId = clinicId;
    } else if (labId) {
      const labExists = await LabModel.findById(labId);
      if (!labExists) {
        return res.status(404).json({
          success: false,
          message: "Lab not found",
        });
      }
      query.labId = labId;
    }

    const expenses = await expenseModel.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
    });

  } catch (error: any) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getSingleExpense = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const expense = await expenseModel.findById(id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: expense,
    });

  } catch (error: any) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const updateExpense = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const expense = await expenseModel.findById(id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    const updatedExpense = await expenseModel.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      data: updatedExpense,
    });

  } catch (error: any) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const deleteExpense = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const expense = await expenseModel.findById(id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    await expenseModel.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
    });

  } catch (error: any) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};