import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Download, Image as ImageIcon } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Accordion } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

// Import Invoice Section Components
import CompanyInfoSection from "@/components/invoice/CompanyInfoSection";
import ClientInfoSection from "@/components/invoice/ClientInfoSection";
import InvoiceDetailsSection from "@/components/invoice/InvoiceDetailsSection";
import ItemsSection from "@/components/invoice/ItemsSection";
import SummarySection from "@/components/invoice/SummarySection";
import type { InvoiceFormData } from "@/types/invoice";

// Zod Schema for Validation
const invoiceItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  price: z.number().min(0, "Price must be positive"),
});

const invoiceSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  companyLogo: z.string().optional(),
  currency: z.enum(["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "INR", "NGN", "PKR"]),
  clientName: z.string().min(1, "Client name is required"),
  clientEmail: z.string().email("Invalid email address"),
  clientAddress: z.string().min(1, "Client address is required"),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  issueDate: z.date(),
  dueDate: z.date(),
  status: z.enum(["Pending", "Paid", "Overdue"]).optional(),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
  taxRate: z.number().min(0).max(100),
  discountRate: z.number().min(0).max(100),
});

export default function CreateInvoice() {
  const [issueDate, setIssueDate] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [logoPreview, setLogoPreview] = useState<string>("");

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      companyName: "INVOICELY",
      companyLogo: "",
      currency: "USD",
      clientName: "",
      clientEmail: "",
      clientAddress: "",
      invoiceNumber: `INV-${Date.now()}`,
      issueDate: new Date(),
      dueDate: new Date(),
      status: undefined,
      items: [{ name: "", quantity: 1, price: 0 }],
      taxRate: 0,
      discountRate: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  // Watch all form values for live preview
  const watchedValues = watch();

  // Currency symbols mapping
  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      JPY: "¥",
      CAD: "CA$",
      AUD: "A$",
      CHF: "CHF",
      CNY: "¥",
      INR: "₹",
      NGN: "₦",
      PKR: "Rs",
    };
    return symbols[currency] || "$";
  };

  // Calculate totals
  const calculateSubtotal = () => {
    return watchedValues.items.reduce((sum, item) => {
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      return sum + quantity * price;
    }, 0);
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    const taxRate = Number(watchedValues.taxRate) || 0;
    return (subtotal * taxRate) / 100;
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    const discountRate = Number(watchedValues.discountRate) || 0;
    return (subtotal * discountRate) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() - calculateDiscount();
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        setValue("companyLogo", result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Persist and restore draft from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("create-invoice-draft");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.companyLogo) setLogoPreview(parsed.companyLogo);
        // we only set fields that exist in the schema
        Object.entries(parsed).forEach(([key, value]) => {
          if (
            [
              "companyName",
              "companyLogo",
              "currency",
              "clientName",
              "clientEmail",
              "clientAddress",
              "invoiceNumber",
              "status",
              "items",
              "taxRate",
              "discountRate",
            ].includes(key)
          ) {
            // @ts-expect-error dynamic set
            setValue(key, value);
          }
        });
      } catch {
        // Ignore parse errors
      }
    }
  }, [setValue]);

  useEffect(() => {
    const subscription = watch((data) => {
      try {
        localStorage.setItem("create-invoice-draft", JSON.stringify(data));
      } catch {
        // Ignore storage errors
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const removeLogo = () => {
    setLogoPreview("");
    setValue("companyLogo", "");
    try {
      const saved = localStorage.getItem("create-invoice-draft");
      const parsed = saved ? JSON.parse(saved) : {};
      parsed.companyLogo = "";
      parsed.activity = [...(parsed.activity || []), { type: "logo_removed", at: Date.now() }];
      localStorage.setItem("create-invoice-draft", JSON.stringify(parsed));
    } catch {
      // Ignore storage errors
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const currencySymbol = getCurrencySymbol(watchedValues.currency);
    
    // Add company name/logo
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235); // Blue color
    // draw logo if available
    try {
      if (watchedValues.companyLogo) {
        // addImage(imageData, format, x, y, width, height)
        doc.addImage(watchedValues.companyLogo, "PNG", 20, 10, 18, 18, undefined, "FAST");
      }
    } catch {
      // Ignore image errors
    }
    doc.text(watchedValues.companyName || "INVOICELY", watchedValues.companyLogo ? 42 : 20, 20);
    
    // Add invoice details
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Invoice Number: ${watchedValues.invoiceNumber}`, 20, 35);
    doc.text(`Issue Date: ${format(issueDate, "MMM dd, yyyy")}`, 20, 42);
    doc.text(`Due Date: ${format(dueDate, "MMM dd, yyyy")}`, 20, 49);
    doc.text(`Status: ${watchedValues.status || "Pending"}`, 120, 35);
    
    // Add client info
    doc.setFontSize(12);
    doc.text("Bill To:", 20, 60);
    doc.setFontSize(10);
    doc.text(watchedValues.clientName || "", 20, 67);
    doc.text(watchedValues.clientEmail || "", 20, 74);
    doc.text(watchedValues.clientAddress || "", 20, 81);
    
    // Add items table
    const tableData = watchedValues.items.map(item => [
      item.name,
      item.quantity.toString(),
      `${currencySymbol}${item.price.toFixed(2)}`,
      `${currencySymbol}${(item.quantity * item.price).toFixed(2)}`
    ]);
    
    autoTable(doc, {
      startY: 95,
      head: [["Item", "Qty", "Price", "Total"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [37, 99, 235] },
    });
    
    // Add totals
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.text(`Subtotal: ${currencySymbol}${calculateSubtotal().toFixed(2)}`, 140, finalY);
    doc.text(`Tax (${watchedValues.taxRate}%): ${currencySymbol}${calculateTax().toFixed(2)}`, 140, finalY + 7);
    doc.text(`Discount (${watchedValues.discountRate}%): -${currencySymbol}${calculateDiscount().toFixed(2)}`, 140, finalY + 14);
    doc.setFontSize(12);
    doc.setTextColor(37, 99, 235);
    doc.text(`Total: ${currencySymbol}${calculateTotal().toFixed(2)}`, 140, finalY + 24);
    
    // Save PDF
    doc.save(`invoice-${watchedValues.invoiceNumber}.pdf`);
    // activity log
    try {
      const saved = localStorage.getItem("create-invoice-draft");
      const parsed = saved ? JSON.parse(saved) : {};
      parsed.activity = [...(parsed.activity || []), { type: "download_pdf", at: Date.now() }];
      localStorage.setItem("create-invoice-draft", JSON.stringify(parsed));
    } catch {
      // Ignore storage errors
    }
  };

  const onSubmit = (data: InvoiceFormData) => {
    console.log("Invoice Data:", {
      ...data,
      subtotal: calculateSubtotal(),
      tax: calculateTax(),
      discount: calculateDiscount(),
      total: calculateTotal(),
    });
    downloadPDF();
    alert("Invoice generated successfully!");
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case "Paid":
        return "text-green-600 bg-green-100";
      case "Overdue":
        return "text-red-600 bg-red-100";
      case "Pending":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="p-6 max-w-[1800px] mx-auto font-dm-sans bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/20 dark:from-transparent dark:via-transparent dark:to-transparent min-h-screen">
      <h1 className="text-2xl font-bold text-foreground mb-6">Create Invoice</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col xl:flex-row gap-6">
          {/* LEFT SIDE - Invoice Form */}
          <div className="w-full xl:w-1/2">
            <Card className="shadow-sm">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-lg font-semibold">Invoice Information</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 overflow-visible">
                <Accordion type="single" collapsible defaultValue="company" className="w-full space-y-1">
                  {/* Company Information */}
                  <CompanyInfoSection
                    register={register}
                    setValue={setValue}
                    errors={errors}
                    logoPreview={logoPreview}
                    handleLogoUpload={handleLogoUpload}
                    removeLogo={removeLogo}
                  />

                  {/* Client Information */}
                  <ClientInfoSection
                    register={register}
                    errors={errors}
                  />

                  {/* Invoice Details */}
                  <InvoiceDetailsSection
                    register={register}
                    setValue={setValue}
                    errors={errors}
                    issueDate={issueDate}
                    dueDate={dueDate}
                    setIssueDate={setIssueDate}
                    setDueDate={setDueDate}
                  />

                  {/* Items Table */}
                  <ItemsSection
                    register={register}
                    fields={fields}
                    append={append}
                    remove={remove}
                    errors={errors}
                    watchedValues={watchedValues}
                    getCurrencySymbol={getCurrencySymbol}
                  />

                  {/* Summary Section */}
                  <SummarySection
                    register={register}
                    watchedValues={watchedValues}
                    calculateSubtotal={calculateSubtotal}
                    calculateTax={calculateTax}
                    calculateDiscount={calculateDiscount}
                    calculateTotal={calculateTotal}
                    getCurrencySymbol={getCurrencySymbol}
                  />
                </Accordion>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700 h-10 font-medium"
                >
                  Generate Invoice
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT SIDE - Live Preview */}
          <div className="w-full xl:w-1/2">
            <Card className="shadow-sm">
              <CardHeader className="pb-4 border-b">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {logoPreview ? (
                      <div className="w-12 h-12 border rounded-md overflow-hidden flex items-center justify-center bg-gray-50">
                        <img src={logoPreview} alt="Company logo" className="max-w-full max-h-full object-contain" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 border border-dashed rounded-md flex items-center justify-center bg-blue-50">
                        <ImageIcon className="h-6 w-6 text-blue-600" />
                      </div>
                    )}
                    <div>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                        {watchedValues.companyName || "INVOICELY"}
                      </div>
                      <div className="text-xs text-muted-foreground">Professional Invoice</div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    type="button" 
                    onClick={downloadPDF}
                    className="h-8 text-xs border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950"
                  >
                    <Download className="h-3 w-3 mr-1.5" />
                    Download PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-5 pt-5 overflow-visible">
                {/* Invoice Header */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">
                      Invoice Number
                    </h3>
                    <p className="text-sm font-medium">{watchedValues.invoiceNumber || "—"}</p>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">
                      Status
                    </h3>
                    <span
                      className={cn(
                        "inline-block px-2 py-0.5 text-[10px] font-semibold rounded",
                        getStatusColor(watchedValues.status)
                      )}
                    >
                      {watchedValues.status || "Not Set"}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">
                      Issue Date
                    </h3>
                    <p className="text-sm font-medium">
                      {issueDate ? format(issueDate, "MMM dd, yyyy") : "—"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">
                      Due Date
                    </h3>
                    <p className="text-sm font-medium">
                      {dueDate ? format(dueDate, "MMM dd, yyyy") : "—"}
                    </p>
                  </div>
                </div>

                {/* Bill To */}
                <div>
                  <h3 className="text-[10px] font-semibold text-muted-foreground uppercase mb-1.5">
                    Bill To
                  </h3>
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold">{watchedValues.clientName || "Client Name"}</p>
                    <p className="text-xs text-muted-foreground">
                      {watchedValues.clientEmail || "client@example.com"}
                    </p>
                    <p className="text-xs text-muted-foreground whitespace-pre-line">
                      {watchedValues.clientAddress || "Client Address"}
                    </p>
                  </div>
                </div>

                {/* Items Table */}
                <div>
                  <h3 className="text-[10px] font-semibold text-muted-foreground uppercase mb-2">
                    Invoice Items
                  </h3>
                  <div className="border rounded-md">
                    <Table className="text-xs">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="h-8 py-2 text-xs">Item</TableHead>
                          <TableHead className="text-center h-8 py-2 text-xs">Qty</TableHead>
                          <TableHead className="text-right h-8 py-2 text-xs">Price</TableHead>
                          <TableHead className="text-right h-8 py-2 text-xs">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {watchedValues.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium py-1.5">
                              {item.name || `Item ${index + 1}`}
                            </TableCell>
                            <TableCell className="text-center py-1.5">{item.quantity || 0}</TableCell>
                            <TableCell className="text-right py-1.5">
                              {getCurrencySymbol(watchedValues.currency)}{(Number(item.price) || 0).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right font-medium py-1.5">
                              {getCurrencySymbol(watchedValues.currency)}
                              {(
                                (Number(item.quantity) || 0) * (Number(item.price) || 0)
                              ).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Summary */}
                <div className="space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-medium">{getCurrencySymbol(watchedValues.currency)}{calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Tax ({watchedValues.taxRate || 0}%):
                    </span>
                    <span className="font-medium">{getCurrencySymbol(watchedValues.currency)}{calculateTax().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Discount ({watchedValues.discountRate || 0}%):
                    </span>
                    <span className="font-medium text-red-600">
                      -{getCurrencySymbol(watchedValues.currency)}{calculateDiscount().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-3 mt-3 border-t">
                    <span>Total Amount:</span>
                    <span className="text-blue-600 dark:text-blue-400">{getCurrencySymbol(watchedValues.currency)}{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                {/* Footer Note */}
                <div className="pt-4 border-t">
                  <p className="text-[10px] text-muted-foreground text-center">
                    Thank you for your business! Payment is due by the due date specified above.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
