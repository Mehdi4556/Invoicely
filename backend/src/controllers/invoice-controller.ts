import type { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { db } from "../db/index.js";
import { invoices, invoiceItems } from "../db/schema.js";
import { createInvoiceSchema, updateInvoiceSchema } from "../types/index.js";
import { eq, and, desc } from "drizzle-orm";

// 📄 Create invoice
export const createInvoice = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  // Validate input
  const validatedData = createInvoiceSchema.parse(req.body);

  // Create invoice
  const [newInvoice] = await db
    .insert(invoices)
    .values({
      userId,
      companyLogo: validatedData.companyLogo,
      companyName: validatedData.companyName,
      companyAddress: validatedData.companyAddress,
      clientName: validatedData.clientName,
      clientAddress: validatedData.clientAddress,
      currency: validatedData.currency,
      theme: validatedData.theme,
      invoicePrefix: validatedData.invoicePrefix,
      serialNumber: validatedData.serialNumber,
      invoiceDate: validatedData.invoiceDate ? new Date(validatedData.invoiceDate) : undefined,
      paymentTerms: validatedData.paymentTerms,
      billingDetails: validatedData.billingDetails,
      labelTypeValue: validatedData.labelTypeValue,
    })
    .returning();

  // Create invoice items
  if (!newInvoice) {
    res.status(500).json({ error: "Failed to create invoice" });
    return;
  }

  const items = await db
    .insert(invoiceItems)
    .values(
      validatedData.items.map((item) => ({
        invoiceId: newInvoice.id,
        itemName: item.itemName,
        description: item.description,
        quantity: item.quantity,
        price: item.price,
      }))
    )
    .returning();

  res.status(201).json({
    message: "Invoice created successfully",
    invoice: {
      ...newInvoice,
      items,
    },
  });
});

// 📋 Get all invoices for user
export const getInvoices = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  const userInvoices = await db
    .select()
    .from(invoices)
    .where(eq(invoices.userId, userId))
    .orderBy(desc(invoices.createdAt));

  res.json({
    invoices: userInvoices,
  });
});

// 📄 Get single invoice with items
export const getInvoiceById = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const invoiceId = parseInt(req.params.id || "");

  if (isNaN(invoiceId)) {
    res.status(400).json({ error: "Invalid invoice ID" });
    return;
  }

  // Get invoice
  const [invoice] = await db
    .select()
    .from(invoices)
    .where(and(eq(invoices.id, invoiceId), eq(invoices.userId, userId)))
    .limit(1);

  if (!invoice) {
    res.status(404).json({ error: "Invoice not found" });
    return;
  }

  // Get invoice items
  const items = await db
    .select()
    .from(invoiceItems)
    .where(eq(invoiceItems.invoiceId, invoiceId));

  res.json({
    invoice: {
      ...invoice,
      items,
    },
  });
});

// ✏️ Update invoice
export const updateInvoice = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const invoiceId = parseInt(req.params.id || "");

  if (isNaN(invoiceId)) {
    res.status(400).json({ error: "Invalid invoice ID" });
    return;
  }

  // Validate input
  const validatedData = updateInvoiceSchema.parse(req.body);

  // Check if invoice exists and belongs to user
  const [existingInvoice] = await db
    .select()
    .from(invoices)
    .where(and(eq(invoices.id, invoiceId), eq(invoices.userId, userId)))
    .limit(1);

  if (!existingInvoice) {
    res.status(404).json({ error: "Invoice not found" });
    return;
  }

  // Prepare update data
  const updateData: any = {};
  if (validatedData.companyLogo !== undefined) updateData.companyLogo = validatedData.companyLogo;
  if (validatedData.companyName !== undefined) updateData.companyName = validatedData.companyName;
  if (validatedData.companyAddress !== undefined) updateData.companyAddress = validatedData.companyAddress;
  if (validatedData.clientName !== undefined) updateData.clientName = validatedData.clientName;
  if (validatedData.clientAddress !== undefined) updateData.clientAddress = validatedData.clientAddress;
  if (validatedData.currency !== undefined) updateData.currency = validatedData.currency;
  if (validatedData.theme !== undefined) updateData.theme = validatedData.theme;
  if (validatedData.invoicePrefix !== undefined) updateData.invoicePrefix = validatedData.invoicePrefix;
  if (validatedData.serialNumber !== undefined) updateData.serialNumber = validatedData.serialNumber;
  if (validatedData.invoiceDate !== undefined) updateData.invoiceDate = new Date(validatedData.invoiceDate);
  if (validatedData.paymentTerms !== undefined) updateData.paymentTerms = validatedData.paymentTerms;
  if (validatedData.billingDetails !== undefined) updateData.billingDetails = validatedData.billingDetails;
  if (validatedData.labelTypeValue !== undefined) updateData.labelTypeValue = validatedData.labelTypeValue;

  // Update invoice
  const [updatedInvoice] = await db
    .update(invoices)
    .set(updateData)
    .where(eq(invoices.id, invoiceId))
    .returning();

  // Update items if provided
  if (validatedData.items) {
    // Delete old items
    await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));

    // Insert new items
    await db
      .insert(invoiceItems)
      .values(
        validatedData.items.map((item) => ({
          invoiceId: invoiceId,
          itemName: item.itemName,
          description: item.description,
          quantity: item.quantity,
          price: item.price,
        }))
      );
  }

  // Get updated items
  const items = await db
    .select()
    .from(invoiceItems)
    .where(eq(invoiceItems.invoiceId, invoiceId));

  res.json({
    message: "Invoice updated successfully",
    invoice: {
      ...updatedInvoice,
      items,
    },
  });
});

// 🗑️ Delete invoice
export const deleteInvoice = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const invoiceId = parseInt(req.params.id || "");

  if (isNaN(invoiceId)) {
    res.status(400).json({ error: "Invalid invoice ID" });
    return;
  }

  // Check if invoice exists and belongs to user
  const [existingInvoice] = await db
    .select()
    .from(invoices)
    .where(and(eq(invoices.id, invoiceId), eq(invoices.userId, userId)))
    .limit(1);

  if (!existingInvoice) {
    res.status(404).json({ error: "Invoice not found" });
    return;
  }

  // Delete invoice (items will be deleted automatically due to cascade)
  await db.delete(invoices).where(eq(invoices.id, invoiceId));

  res.json({
    message: "Invoice deleted successfully",
  });
});

