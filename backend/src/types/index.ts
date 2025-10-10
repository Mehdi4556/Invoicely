import { z } from "zod";

// ============================================
// User & Auth Schemas
// ============================================
export const signupSchema = z.object({
  login: z.string().min(3).max(100),
  gmail: z.string().email().max(255),
  password: z.string().min(6).optional(), // Optional for Google OAuth
});

export const loginSchema = z.object({
  gmail: z.string().email(),
  password: z.string(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// ============================================
// Invoice Item Schema
// ============================================
export const invoiceItemSchema = z.object({
  itemName: z.string().min(1).max(255),
  description: z.string().optional(),
  quantity: z.number().int().positive(),
  price: z.number().int().positive(),
});

// ============================================
// Invoice Schema
// ============================================
export const createInvoiceSchema = z.object({
  // Company details
  companyLogo: z.string().optional(),
  companyName: z.string().min(1).max(255),
  companyAddress: z.string().optional(),

  // Client info
  clientName: z.string().min(1).max(255),
  clientAddress: z.string().optional(),

  // Invoice details
  currency: z.string().max(10).default("USD"),
  theme: z.enum(["light", "dark"]).default("light"),
  invoicePrefix: z.string().max(10).optional(),
  serialNumber: z.string().min(1).max(50),
  invoiceDate: z.string().or(z.date()).optional(),
  paymentTerms: z.string().max(100).optional(),
  billingDetails: z.string().optional(),
  labelTypeValue: z.string().max(50).optional(),

  // Items
  items: z.array(invoiceItemSchema).min(1),
});

export const updateInvoiceSchema = createInvoiceSchema.partial();

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>;

