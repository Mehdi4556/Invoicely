import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { FileText, Search, Filter, Eye, Download, Trash2,} from "lucide-react";
// import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  totalAmount: number;
  currency: string;
  status: "Pending" | "Paid" | "Overdue";
  issueDate: string;
  dueDate: string;
  storage: "local" | "cloud";
}

export default function Invoices() {
  const { isAuthenticated } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [storageFilter, setStorageFilter] = useState<string>("all");

  useEffect(() => {
    loadInvoices();
  }, [isAuthenticated]);

  const loadInvoices = async () => {
    // Load local invoices from localStorage
    const localInvoices: Invoice[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("invoice-")) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            localInvoices.push({
              id: key,
              invoiceNumber: parsed.invoiceNumber || "N/A",
              clientName: parsed.clientName || "Unknown",
              totalAmount: parsed.total || 0,
              currency: parsed.currency || "USD",
              status: parsed.status || "Pending",
              issueDate: parsed.issueDate || new Date().toISOString(),
              dueDate: parsed.dueDate || new Date().toISOString(),
              storage: "local",
            });
          } catch (error) {
            console.error("Error parsing invoice:", error);
          }
        }
      }
    }

    // If authenticated, also load cloud invoices
    if (isAuthenticated) {
      try {
        const response = await fetch("http://localhost:5000/api/invoices", {
          credentials: "include",
        });
        if (response.ok) {
          const cloudInvoices = await response.json();
          setInvoices([
            ...localInvoices,
            ...cloudInvoices.map((inv: Invoice) => ({ ...inv, storage: "cloud" })),
          ]);
          return;
        }
      } catch (error) {
        console.error("Error loading cloud invoices:", error);
      }
    }

    setInvoices(localInvoices);
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    const matchesStorage = storageFilter === "all" || invoice.storage === storageFilter;
    return matchesSearch && matchesStatus && matchesStorage;
  });

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "Paid":
        return "default";
      case "Pending":
        return "secondary";
      case "Overdue":
        return "destructive";
      default:
        return "outline";
    }
  };

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

  return (
    <div className="p-6 max-w-[1600px] mx-auto font-dm-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
            <FileText className="h-6 w-6" />
            INVOICES
          </h1>
          <p className="text-sm text-muted-foreground">
            {isAuthenticated
              ? "Manage your invoices stored locally and in the cloud"
              : "Manage your invoices (Sign in to sync across devices)"}
          </p>
        </div>
        {/* <Link to="/create-invoice">
          <Button className="gap-2 mr-12 mb-15">
            <Plus className="h-4 w-4" />
            Create New Invoice
          </Button>
        </Link> */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Invoice List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="filters" className="border-b">
              <AccordionTrigger className="text-sm font-semibold py-3 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters & Search
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Search */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Invoice # or Client name"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Storage Filter */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Storage</label>
                    <Select value={storageFilter} onValueChange={setStorageFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All storage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Storage</SelectItem>
                        <SelectItem value="local">Local Only</SelectItem>
                        <SelectItem value="cloud">Cloud Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Invoice #</TableHead>
                  <TableHead className="font-semibold">Client</TableHead>
                  <TableHead className="font-semibold">Amount</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Issue Date</TableHead>
                  <TableHead className="font-semibold">Due Date</TableHead>
                  <TableHead className="font-semibold">Storage</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="font-medium">No invoices found</p>
                      <p className="text-sm">
                        {invoices.length === 0
                          ? "Create your first invoice to get started"
                          : "Try adjusting your filters"}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.clientName}</TableCell>
                      <TableCell className="font-medium">
                        {getCurrencySymbol(invoice.currency)}
                        {invoice.totalAmount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(invoice.status)}>{invoice.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(invoice.issueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={invoice.storage === "cloud" ? "default" : "outline"} className="text-xs">
                          {invoice.storage === "cloud" ? "☁️ Cloud" : "💾 Local"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon-sm" title="View Invoice">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon-sm" title="Download PDF">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon-sm" className="text-red-600 hover:text-red-700" title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Stats */}
          {invoices.length > 0 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
              <p>
                Showing {filteredInvoices.length} of {invoices.length} invoice(s)
              </p>
              <p>
                {invoices.filter((i) => i.storage === "local").length} local •{" "}
                {invoices.filter((i) => i.storage === "cloud").length} cloud
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
