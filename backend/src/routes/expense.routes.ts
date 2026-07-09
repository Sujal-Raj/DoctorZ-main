import express from "express";

import {
  addExpense,
  getExpenses,
  getSingleExpense,
  updateExpense,
  deleteExpense,
} from "../controllers/expense.controller.js";

const expenseRouter = express.Router();

// Add expense
expenseRouter.post("/add", addExpense);

// Get all expenses of clinic or lab
expenseRouter.get("/clinic/:clinicId", getExpenses);
expenseRouter.get("/lab/:labId", getExpenses);

// Get single expense
expenseRouter.get("/:id", getSingleExpense);

// Update expense
expenseRouter.put("/update/:id", updateExpense);

// Delete expense
expenseRouter.delete("/delete/:id", deleteExpense);

export default expenseRouter;