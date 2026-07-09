import express from "express";
// import { addInventoryItem } from "../controllers/inventory.controller.js";
import { addInventoryItem, getInventoryItems, getSingleInventoryItem, updateInventoryItem, deleteInventoryItem, } from "../controllers/inventory.controller.js";
const inventoryRouter = express.Router();
inventoryRouter.post("/add", addInventoryItem);
// Get all inventory items by clinic or lab
inventoryRouter.get("/clinic/:clinicId", getInventoryItems);
inventoryRouter.get("/lab/:labId", getInventoryItems);
// Get single inventory item
inventoryRouter.get("/:id", getSingleInventoryItem);
// Update inventory item
inventoryRouter.put("/update/:id", updateInventoryItem);
// Delete inventory item
inventoryRouter.delete("/delete/:id", deleteInventoryItem);
export default inventoryRouter;
