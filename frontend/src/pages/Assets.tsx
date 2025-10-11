import SignatureCanvas from "@/components/assets/SignatureCanvas";
import LogoUploader from "@/components/assets/LogoUploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Info } from "lucide-react";

export default function Assets() {
  return (
    <div className="p-6 max-w-[1400px] mx-auto font-dm-sans">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">ASSETS</h1>
        <p className="text-sm text-muted-foreground">
          Manage your company logo and signature for invoices
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Logo Uploader */}
        <LogoUploader />

        {/* Signature Canvas */}
        <SignatureCanvas />
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            How it Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <FileText className="h-4 w-4 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <p>
              <strong className="text-foreground">Company Logo:</strong> Upload your company logo to display it on all your invoices. It will appear in the header of the invoice preview and PDF.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <FileText className="h-4 w-4 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <p>
              <strong className="text-foreground">Digital Signature:</strong> Draw your signature using your mouse or touch screen. This signature will be automatically added to the bottom of every invoice PDF you generate.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <FileText className="h-4 w-4 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <p>
              <strong className="text-foreground">Auto-Save:</strong> Both assets are automatically saved to your browser's local storage and will be used across all invoices until you update or remove them.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
