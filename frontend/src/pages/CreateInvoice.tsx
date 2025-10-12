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
import { useAssets } from "@/contexts/AssetsContext";
import { useAuth } from "@/contexts/AuthContext";

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
  theme: z.enum(["modern", "classic", "minimal", "bold"]),
  clientName: z.string().min(1, "Client name is required"),
  clientEmail: z.union([z.string().email("Invalid email address"), z.literal("")]),
  clientAddress: z.string(),
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
  const [dueDate, setDueDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date;
  });
  const [logoPreview, setLogoPreview] = useState<string>("");
  
  // Get assets from context
  const { signature, companyLogo: savedCompanyLogo } = useAssets();
  
  // Get auth state
  const { isAuthenticated } = useAuth();

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
      theme: "modern",
      clientName: "",
      clientEmail: "",
      clientAddress: "",
      invoiceNumber: `INV-${Date.now()}`,
      issueDate: new Date(),
      dueDate: (() => {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        return date;
      })(),
      status: "Pending",
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

  // Initialize logo from assets context
  useEffect(() => {
    if (savedCompanyLogo && !logoPreview) {
      setLogoPreview(savedCompanyLogo);
      setValue("companyLogo", savedCompanyLogo);
    }
  }, [savedCompanyLogo, logoPreview, setValue]);

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
    
    // Get theme colors for PDF
    const getThemeColors = (theme: string) => {
      switch (theme) {
        case "modern":
          return {
            primary: [37, 99, 235] as [number, number, number], // Blue
            secondary: [219, 234, 254] as [number, number, number], // Light blue
            headerBg: [239, 246, 255] as [number, number, number], // Very light blue
          };
        case "classic":
          return {
            primary: [71, 85, 105] as [number, number, number], // Slate
            secondary: [226, 232, 240] as [number, number, number], // Light slate
            headerBg: [241, 245, 249] as [number, number, number], // Very light slate
          };
        case "minimal":
          return {
            primary: [17, 24, 39] as [number, number, number], // Gray
            secondary: [229, 231, 235] as [number, number, number], // Light gray
            headerBg: [243, 244, 246] as [number, number, number], // Very light gray
          };
        case "bold":
          return {
            primary: [147, 51, 234] as [number, number, number], // Purple
            secondary: [233, 213, 255] as [number, number, number], // Light purple
            headerBg: [250, 245, 255] as [number, number, number], // Very light purple
          };
        default:
          return {
            primary: [37, 99, 235] as [number, number, number],
            secondary: [219, 234, 254] as [number, number, number],
            headerBg: [239, 246, 255] as [number, number, number],
          };
      }
    };
    
    const themeColors = getThemeColors(watchedValues.theme || "modern");
    
    // Add colored header background
    doc.setFillColor(...themeColors.headerBg);
    doc.rect(0, 0, 210, 30, "F");
    
    // Add company name/logo
    doc.setFontSize(20);
    doc.setTextColor(...themeColors.primary);
    // draw logo if available
    try {
      if (watchedValues.companyLogo) {
        // addImage(imageData, format, x, y, width, height)
        doc.addImage(watchedValues.companyLogo, "PNG", 20, 8, 18, 18, undefined, "FAST");
      }
    } catch {
      // Ignore image errors
    }
    doc.text(watchedValues.companyName || "INVOICELY", watchedValues.companyLogo ? 42 : 20, 18);
    
    // Add subtitle
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("Professional Invoice", watchedValues.companyLogo ? 42 : 20, 24);
    
    // Add invoice details with themed styling
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Invoice Number: ${watchedValues.invoiceNumber}`, 20, 40);
    doc.text(`Issue Date: ${format(issueDate, "MMM dd, yyyy")}`, 20, 47);
    doc.text(`Due Date: ${format(dueDate, "MMM dd, yyyy")}`, 20, 54);
    
    // Status badge with theme color
    const status = watchedValues.status || "Pending";
    doc.setFillColor(...themeColors.secondary);
    doc.roundedRect(120, 36, 35, 8, 2, 2, "F");
    doc.setTextColor(...themeColors.primary);
    doc.setFontSize(9);
    doc.text(status, 122, 41);
    
    // Add client info with themed header
    doc.setFontSize(11);
    doc.setTextColor(...themeColors.primary);
    doc.text("BILL TO:", 20, 68);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(watchedValues.clientName || "", 20, 75);
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(watchedValues.clientEmail || "", 20, 81);
    const addressLines = (watchedValues.clientAddress || "").split("\n");
    addressLines.forEach((line, i) => {
      doc.text(line, 20, 87 + (i * 5));
    });
    
    // Add items table with theme colors
    const tableData = watchedValues.items.map(item => [
      item.name,
      item.quantity.toString(),
      `${currencySymbol}${item.price.toFixed(2)}`,
      `${currencySymbol}${(item.quantity * item.price).toFixed(2)}`
    ]);
    
    autoTable(doc, {
      startY: 105,
      head: [["Item", "Qty", "Price", "Total"]],
      body: tableData,
      theme: "striped",
      headStyles: { 
        fillColor: themeColors.primary,
        fontSize: 10,
        fontStyle: "bold",
        halign: "left",
      },
      bodyStyles: {
        fontSize: 9,
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250],
      },
      columnStyles: {
        1: { halign: "center" },
        2: { halign: "right" },
        3: { halign: "right" },
      },
    });
    
    // Add totals with theme styling
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finalY = (doc as any).lastAutoTable.finalY + 12;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Subtotal:`, 130, finalY);
    doc.text(`${currencySymbol}${calculateSubtotal().toFixed(2)}`, 190, finalY, { align: "right" });
    doc.text(`Tax (${watchedValues.taxRate}%):`, 130, finalY + 7);
    doc.text(`${currencySymbol}${calculateTax().toFixed(2)}`, 190, finalY + 7, { align: "right" });
    doc.text(`Discount (${watchedValues.discountRate}%):`, 130, finalY + 14);
    doc.setTextColor(220, 38, 38);
    doc.text(`-${currencySymbol}${calculateDiscount().toFixed(2)}`, 190, finalY + 14, { align: "right" });
    
    // Total with theme color box
    doc.setFillColor(...themeColors.secondary);
    doc.roundedRect(125, finalY + 20, 65, 12, 2, 2, "F");
    doc.setFontSize(12);
    doc.setTextColor(...themeColors.primary);
    doc.text(`Total:`, 130, finalY + 28);
    doc.setFontSize(14);
    doc.text(`${currencySymbol}${calculateTotal().toFixed(2)}`, 190, finalY + 28, { align: "right" });
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text("Thank you for your business! Payment is due by the due date specified above.", 105, finalY + 45, { align: "center" });
    
    // Add signature if available
    if (signature) {
      try {
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        doc.text("Authorized Signature:", 20, finalY + 60);
        doc.addImage(signature, "PNG", 20, finalY + 65, 50, 20, undefined, "FAST");
      } catch {
        // Ignore signature image errors
      }
    }
    
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
    const invoiceData = {
      ...data,
      issueDate: issueDate.toISOString(),
      dueDate: dueDate.toISOString(),
      subtotal: calculateSubtotal(),
      tax: calculateTax(),
      discount: calculateDiscount(),
      total: calculateTotal(),
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage
    const invoiceId = `invoice-${Date.now()}`;
    try {
      localStorage.setItem(invoiceId, JSON.stringify(invoiceData));
      console.log("Invoice saved:", invoiceId);
      
      // Also sync to cloud if authenticated
      if (isAuthenticated) {
        fetch("http://localhost:5000/api/invoices", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(invoiceData),
        }).catch((error) => {
          console.error("Error syncing to cloud:", error);
        });
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
    }

    downloadPDF();
    alert("Invoice generated and saved successfully!");
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

  // Get theme-specific styles for invoice preview
  const getThemeStyles = (theme: string) => {
    switch (theme) {
      case "modern":
        return {
          cardClass: "shadow-sm border-blue-100 dark:border-blue-900/30",
          headerBg: "bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20",
          accentColor: "text-blue-600 dark:text-blue-400",
          borderColor: "border-blue-200 dark:border-blue-800/50",
          tableHeaderBg: "bg-blue-50 dark:bg-blue-950/20",
        };
      case "classic":
        return {
          cardClass: "shadow-md border-slate-200 dark:border-slate-800/30",
          headerBg: "bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-900/30 dark:to-slate-800/20",
          accentColor: "text-slate-700 dark:text-slate-300",
          borderColor: "border-slate-300 dark:border-slate-700/50",
          tableHeaderBg: "bg-slate-100 dark:bg-slate-900/20",
        };
      case "minimal":
        return {
          cardClass: "shadow-sm border-gray-100 dark:border-gray-800/30",
          headerBg: "bg-gray-50 dark:bg-gray-900/20",
          accentColor: "text-gray-900 dark:text-gray-100",
          borderColor: "border-gray-200 dark:border-gray-700/50",
          tableHeaderBg: "bg-gray-50 dark:bg-gray-900/20",
        };
      case "bold":
        return {
          cardClass: "shadow-lg border-purple-200 dark:border-purple-900/30",
          headerBg: "bg-gradient-to-r from-purple-100 via-indigo-100 to-blue-100 dark:from-purple-950/30 dark:via-indigo-950/30 dark:to-blue-950/30",
          accentColor: "text-purple-600 dark:text-purple-400",
          borderColor: "border-purple-300 dark:border-purple-700/50",
          tableHeaderBg: "bg-purple-50 dark:bg-purple-950/20",
        };
      default:
        return {
          cardClass: "shadow-sm border-blue-100 dark:border-blue-900/30",
          headerBg: "bg-gradient-to-r from-blue-50 to-blue-100/50",
          accentColor: "text-blue-600",
          borderColor: "border-blue-200",
          tableHeaderBg: "bg-blue-50",
        };
    }
  };

  const themeStyles = getThemeStyles(watchedValues.theme || "modern");

  return (
    <div className="p-6 max-w-[1800px] mx-auto font-dm-sans bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/20 dark:from-transparent dark:via-transparent dark:to-transparent min-h-screen">
      <h1 className="text-2xl font-bold text-foreground mb-6">CREATE INVOICE</h1>

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
                  className="w-full mt-6 h-10"
                >
                  Generate Invoice
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT SIDE - Live Preview */}
          <div className="w-full xl:w-1/2">
            <Card className={themeStyles.cardClass}>
              <CardHeader className={cn("pb-4 border-b", themeStyles.headerBg, themeStyles.borderColor)}>
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
                      <div className={cn("text-2xl font-bold mb-1", themeStyles.accentColor)}>
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
                    className="h-8 text-xs"
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
                  <div className={cn("border rounded-md", themeStyles.borderColor)}>
                    <Table className="text-xs">
                      <TableHeader className={themeStyles.tableHeaderBg}>
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
                  <div className={cn("flex justify-between text-lg font-bold pt-3 mt-3 border-t", themeStyles.borderColor)}>
                    <span>Total Amount:</span>
                    <span className={themeStyles.accentColor}>{getCurrencySymbol(watchedValues.currency)}{calculateTotal().toFixed(2)}</span>
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
