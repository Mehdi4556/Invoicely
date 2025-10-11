import type { UseFormRegister, UseFormSetValue, FieldErrors } from "react-hook-form";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import type { InvoiceFormData, InvoiceStatus } from "@/types/invoice";

interface InvoiceDetailsSectionProps {
  register: UseFormRegister<InvoiceFormData>;
  setValue: UseFormSetValue<InvoiceFormData>;
  errors: FieldErrors<InvoiceFormData>;
  issueDate: Date;
  dueDate: Date;
  setIssueDate: (date: Date) => void;
  setDueDate: (date: Date) => void;
}

export default function InvoiceDetailsSection({
  register,
  setValue,
  errors,
  issueDate,
  dueDate,
  setIssueDate,
  setDueDate,
}: InvoiceDetailsSectionProps) {
  return (
    <AccordionItem value="invoice" className="border-b border-border">
      <AccordionTrigger className="text-sm font-semibold py-3 hover:no-underline text-foreground">
        Invoice Details
      </AccordionTrigger>
      <AccordionContent className="space-y-4 pt-3 pb-4">
        <div className="space-y-2">
          <Label htmlFor="invoiceNumber" className="text-xs font-medium">
            Invoice Number
          </Label>
          <Input
            id="invoiceNumber"
            placeholder="INV-001"
            className="h-9 focus-visible:ring-offset-0"
            {...register("invoiceNumber")}
          />
          {errors.invoiceNumber && (
            <p className="text-xs text-red-600">{errors.invoiceNumber.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium">Issue Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "w-full justify-start text-left font-normal h-9",
                    !issueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                  {issueDate ? format(issueDate, "MMM dd, yyyy") : <span>Pick date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={issueDate}
                  onSelect={(date) => {
                    setIssueDate(date || new Date());
                    setValue("issueDate", date || new Date());
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium">Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "w-full justify-start text-left font-normal h-9",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                  {dueDate ? format(dueDate, "MMM dd, yyyy") : <span>Pick date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={(date) => {
                    setDueDate(date || new Date());
                    setValue("dueDate", date || new Date());
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status" className="text-xs font-medium">
            Status
          </Label>
          <Select
            onValueChange={(value) =>
              setValue("status", value as InvoiceStatus)
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && <p className="text-xs text-red-600">Please select a status</p>}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

