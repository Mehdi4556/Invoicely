import { pgTable, serial, varchar, text, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";

// 🧍 User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  login: varchar("login", { length: 100 }).notNull(),
  gmail: varchar("gmail", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }),
  googleId: varchar("google_id", { length: 255 }).unique(),
  profilePicture: text("profile_picture"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 📄 Invoice table
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),

  // Relations
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),

  // Company details
  companyLogo: text("company_logo"),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  companyAddress: text("company_address"),

  // Client info
  clientName: varchar("client_name", { length: 255 }).notNull(),
  clientAddress: text("client_address"),

  // Invoice details
  currency: varchar("currency", { length: 10 }).default("USD"),
  theme: varchar("theme", { length: 10 }).default("light"), // dark or light
  invoicePrefix: varchar("invoice_prefix", { length: 10 }),
  serialNumber: varchar("serial_number", { length: 50 }).notNull(),
  invoiceDate: timestamp("invoice_date").defaultNow(),
  paymentTerms: varchar("payment_terms", { length: 100 }),
  billingDetails: text("billing_details"),
  labelTypeValue: varchar("label_type_value", { length: 50 }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 🧾 Invoice Items table
export const invoiceItems = pgTable("invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull().references(() => invoices.id, { onDelete: "cascade" }),
  itemName: varchar("item_name", { length: 255 }).notNull(),
  description: text("description"),
  quantity: integer("quantity").notNull(),
  price: integer("price").notNull(),
});
