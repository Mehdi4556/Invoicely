import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { InvoiceFormData } from "@/types/invoice";

interface ClientInfoSectionProps {
  register: UseFormRegister<InvoiceFormData>;
  errors: FieldErrors<InvoiceFormData>;
}

export default function ClientInfoSection({ register, errors }: ClientInfoSectionProps) {
  return (
    <AccordionItem value="client" className="border-b border-border">
      <AccordionTrigger className="text-sm font-semibold py-3 hover:no-underline text-foreground">
        Client Information
      </AccordionTrigger>
      <AccordionContent className="space-y-4 pt-3 pb-4">
        <div className="space-y-2">
          <Label htmlFor="clientName" className="text-xs font-medium">
            Client Name
          </Label>
          <Input
            id="clientName"
            placeholder="John Doe"
            className="h-9 focus-visible:ring-offset-0"
            {...register("clientName")}
          />
          {errors.clientName && (
            <p className="text-xs text-red-600">{errors.clientName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="clientEmail" className="text-xs font-medium">
            Client Email
          </Label>
          <Input
            id="clientEmail"
            type="email"
            placeholder="john@example.com"
            className="h-9 focus-visible:ring-offset-0"
            {...register("clientEmail")}
          />
          {errors.clientEmail && (
            <p className="text-xs text-red-600">{errors.clientEmail.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="clientAddress" className="text-xs font-medium">
            Billing Address
          </Label>
          <Textarea
            id="clientAddress"
            placeholder="123 Main St, City, State, ZIP"
            rows={2}
            className="text-sm resize-none focus-visible:ring-offset-0"
            {...register("clientAddress")}
          />
          {errors.clientAddress && (
            <p className="text-xs text-red-600">{errors.clientAddress.message}</p>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

