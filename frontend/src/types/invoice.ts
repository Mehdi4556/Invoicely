export interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
}

export type CurrencyCode = "USD" | "EUR" | "GBP" | "JPY" | "CAD" | "AUD" | "CHF" | "CNY" | "INR" | "NGN" | "PKR";
export type InvoiceStatus = "Pending" | "Paid" | "Overdue";
export type InvoiceTheme = "modern" | "classic" | "minimal" | "bold";

export interface InvoiceFormData {
  companyName: string;
  companyLogo?: string;
  currency: CurrencyCode;
  theme: InvoiceTheme;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  invoiceNumber: string;
  issueDate: Date;
  dueDate: Date;
  status?: InvoiceStatus;
  items: InvoiceItem[];
  taxRate: number;
  discountRate: number;
}

