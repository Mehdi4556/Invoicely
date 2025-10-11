import type { UseFormRegister, UseFormSetValue, FieldErrors } from "react-hook-form";
import { Upload, Image as ImageIcon } from "lucide-react";
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
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { InvoiceFormData, CurrencyCode } from "@/types/invoice";

interface CompanyInfoSectionProps {
  register: UseFormRegister<InvoiceFormData>;
  setValue: UseFormSetValue<InvoiceFormData>;
  errors: FieldErrors<InvoiceFormData>;
  logoPreview: string;
  handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeLogo: () => void;
}

export default function CompanyInfoSection({
  register,
  setValue,
  errors,
  logoPreview,
  handleLogoUpload,
  removeLogo,
}: CompanyInfoSectionProps) {
  return (
    <AccordionItem value="company" className="border-b border-border">
      <AccordionTrigger className="text-sm font-semibold py-3 hover:no-underline text-foreground">
        Company Information
      </AccordionTrigger>
      <AccordionContent className="space-y-4 pt-3 pb-4">
        <div className="space-y-2">
          <Label htmlFor="companyName" className="text-xs font-medium">
            Company Name
          </Label>
          <Input
            id="companyName"
            placeholder="Your Company Name"
            className="h-9 focus-visible:ring-offset-0"
            {...register("companyName")}
          />
          {errors.companyName && (
            <p className="text-xs text-red-600">{errors.companyName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency" className="text-xs font-medium">
            Currency
          </Label>
          <Select
            onValueChange={(value) => setValue("currency", value as CurrencyCode)}
            defaultValue="USD"
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">🇺🇸 USD - US Dollar ($)</SelectItem>
              <SelectItem value="EUR">🇪🇺 EUR - Euro (€)</SelectItem>
              <SelectItem value="GBP">🇬🇧 GBP - British Pound (£)</SelectItem>
              <SelectItem value="JPY">🇯🇵 JPY - Japanese Yen (¥)</SelectItem>
              <SelectItem value="CAD">🇨🇦 CAD - Canadian Dollar (CA$)</SelectItem>
              <SelectItem value="AUD">🇦🇺 AUD - Australian Dollar (A$)</SelectItem>
              <SelectItem value="CHF">🇨🇭 CHF - Swiss Franc (CHF)</SelectItem>
              <SelectItem value="CNY">🇨🇳 CNY - Chinese Yuan (¥)</SelectItem>
              <SelectItem value="INR">🇮🇳 INR - Indian Rupee (₹)</SelectItem>
              <SelectItem value="NGN">🇳🇬 NGN - Nigerian Naira (₦)</SelectItem>
              <SelectItem value="PKR">🇵🇰 PKR - Pakistani Rupee (Rs)</SelectItem>
            </SelectContent>
          </Select>
          {errors.currency && (
            <p className="text-xs text-red-600">{errors.currency.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium">Company Logo</Label>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label htmlFor="logo-upload" className="cursor-pointer">
                <div className="flex items-center justify-center h-9 px-4 rounded-md border border-input bg-transparent hover:bg-accent hover:text-accent-foreground transition-colors">
                  <Upload className="h-4 w-4 mr-2" />
                  <span className="text-sm">Upload Logo</span>
                </div>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
              </label>
            </div>
            {logoPreview && (
              <div className="flex items-center gap-2">
                <div className="w-16 h-16 border rounded-md overflow-hidden flex items-center justify-center bg-gray-50">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={removeLogo}
                  className="h-8"
                >
                  Remove
                </Button>
              </div>
            )}
            {!logoPreview && (
              <div className="w-16 h-16 border border-dashed rounded-md flex items-center justify-center bg-gray-50">
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Recommended: 200x200px, PNG or JPG
          </p>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

