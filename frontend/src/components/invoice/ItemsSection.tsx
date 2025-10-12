import type { UseFormRegister, UseFieldArrayReturn, FieldErrors } from "react-hook-form";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { InvoiceFormData } from "@/types/invoice";

interface ItemsSectionProps {
  register: UseFormRegister<InvoiceFormData>;
  fields: UseFieldArrayReturn<InvoiceFormData, "items", "id">["fields"];
  append: UseFieldArrayReturn<InvoiceFormData, "items", "id">["append"];
  remove: UseFieldArrayReturn<InvoiceFormData, "items", "id">["remove"];
  errors: FieldErrors<InvoiceFormData>;
  watchedValues: InvoiceFormData;
  getCurrencySymbol: (currency: string) => string;
}

export default function ItemsSection({
  register,
  fields,
  append,
  remove,
  errors,
  watchedValues,
  getCurrencySymbol,
}: ItemsSectionProps) {
  return (
    <AccordionItem value="items" className="border-b border-border">
      <AccordionTrigger className="text-sm font-semibold py-3 hover:no-underline text-foreground">
        <span>Items</span>
      </AccordionTrigger>
      <AccordionContent className="space-y-3 pt-3 pb-4">
        <div className="flex justify-end mb-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => append({ name: "", quantity: 1, price: 0 })}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Item
          </Button>
        </div>
        <div className="border rounded-md">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="text-xs">
                <TableHead className="h-8 py-2">Item Name</TableHead>
                <TableHead className="w-20 h-8 py-2">Qty</TableHead>
                <TableHead className="w-24 h-8 py-2">Price</TableHead>
                <TableHead className="w-24 h-8 py-2">Total</TableHead>
                <TableHead className="w-10 h-8 py-2"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field, index) => (
                <TableRow key={field.id}>
                  <TableCell className="py-1.5">
                    <Input
                      placeholder="Item name"
                      className="h-7 text-xs"
                      {...register(`items.${index}.name`)}
                    />
                  </TableCell>
                  <TableCell className="py-1.5">
                    <Input
                      type="number"
                      placeholder="1"
                      className="h-7 text-xs"
                      {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                    />
                  </TableCell>
                  <TableCell className="py-1.5">
                    <Input
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      className="h-7 text-xs"
                      {...register(`items.${index}.price`, { valueAsNumber: true })}
                    />
                  </TableCell>
                  <TableCell className="font-medium py-1.5 text-xs">
                    {getCurrencySymbol(watchedValues.currency)}
                    {(
                      (Number(watchedValues.items[index]?.quantity) || 0) *
                      (Number(watchedValues.items[index]?.price) || 0)
                    ).toFixed(2)}
                  </TableCell>
                  <TableCell className="py-1.5">
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="h-6 w-6"
                        onClick={() => remove(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {errors.items && <p className="text-xs text-red-600">{errors.items.message}</p>}
      </AccordionContent>
    </AccordionItem>
  );
}

