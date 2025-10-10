import express from "express";
import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
} from "../controllers/invoice-controller.js";
import { authMiddleware } from "../middlewares/auth-middleware.js";

const router = express.Router();

// All invoice routes are protected
router.use(authMiddleware);

// 📋 Get all invoices
router.get("/", getInvoices);

// 📄 Create invoice
router.post("/", createInvoice);

// 📄 Get single invoice
router.get("/:id", getInvoiceById);

// ✏️ Update invoice
router.put("/:id", updateInvoice);

// 🗑️ Delete invoice
router.delete("/:id", deleteInvoice);

export default router;
