import express from "express";
import { createAsset, getAssetsList, logAssetRepair, createSupplier, getSuppliersList, settleSupplierBalance, } from "../controllers/assetSupplier.controller.js";
const assetSupplierRouter = express.Router();
// Asset operations
assetSupplierRouter.post("/assets/add", createAsset);
assetSupplierRouter.get("/assets/:clinicId", getAssetsList);
assetSupplierRouter.post("/assets/repair/:assetId", logAssetRepair);
// Supplier operations
assetSupplierRouter.post("/suppliers/add", createSupplier);
assetSupplierRouter.get("/suppliers/:clinicId", getSuppliersList);
assetSupplierRouter.post("/suppliers/settle/:supplierId", settleSupplierBalance);
export default assetSupplierRouter;
