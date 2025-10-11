import type { UseFormRegister } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { InvoiceFormData } from "@/types/invoice";

interface SummarySectionProps {
  register: UseFormRegister<InvoiceFormData>;
  watchedValues: InvoiceFormData;
  calculateSubtotal: () => number;
  calculateTax: () => number;
  calculateDiscount: () => number;
  calculateTotal: () => number;
  getCurrencySymbol: (currency: string) => string;
}

export default function SummarySection({
  register,
  watchedValues,
  calculateSubtotal,
  calculateTax,
  calculateDiscount,
  calculateTotal,
  getCurrencySymbol,
}: SummarySectionProps) {
  return (
    <AccordionItem value="summary" className="border-b-0">
      <AccordionTrigger className="text-sm font-semibold py-3 hover:no-underline text-foreground">
        Summary
      </AccordionTrigger>
      <AccordionContent className="space-y-4 pt-3 pb-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="taxRate" className="text-xs font-medium">
              Tax Rate (%)
            </Label>
            <Input
              id="taxRate"
              type="number"
              placeholder="0"
              step="0.01"
              className="h-9 focus-visible:ring-offset-0"
              {...register("taxRate", { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="discountRate" className="text-xs font-medium">
              Discount Rate (%)
            </Label>
            <Input
              id="discountRate"
              type="number"
              placeholder="0"
              step="0.01"
              className="h-9 focus-visible:ring-offset-0"
              {...register("discountRate", { valueAsNumber: true })}
            />
          </div>
        </div>

        <div className="space-y-2.5 pt-4 border-t mt-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal:</span>
            <span className="font-medium">
              {getCurrencySymbol(watchedValues.currency)}
              {calculateSubtotal().toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Tax ({watchedValues.taxRate || 0}%):
            </span>
            <span className="font-medium">
              {getCurrencySymbol(watchedValues.currency)}
              {calculateTax().toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Discount ({watchedValues.discountRate || 0}%):
            </span>
            <span className="font-medium text-red-600">
              -{getCurrencySymbol(watchedValues.currency)}
              {calculateDiscount().toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-base font-bold pt-2 border-t mt-2">
            <span>Total:</span>
            <span className="text-blue-600 dark:text-blue-400">
              {getCurrencySymbol(watchedValues.currency)}
              {calculateTotal().toFixed(2)}
            </span>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

