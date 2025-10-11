import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Trash2, Image as ImageIcon } from "lucide-react";
import { useAssets } from "@/contexts/AssetsContext";

export default function LogoUploader() {
  const { companyLogo, setCompanyLogo, clearLogo } = useAssets();
  const [preview, setPreview] = useState<string>(companyLogo);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        setCompanyLogo(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setPreview("");
    clearLogo();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ImageIcon className="h-5 w-5" />
          Company Logo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center">
          {preview ? (
            <div className="relative">
              <div className="w-48 h-48 border-2 border-border rounded-lg overflow-hidden flex items-center justify-center bg-gray-50">
                <img
                  src={preview}
                  alt="Company logo"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>
          ) : (
            <div className="w-48 h-48 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No logo uploaded</p>
              </div>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Recommended: 200x200px, PNG or JPG format
        </p>
        <div className="flex gap-2">
          <label htmlFor="logo-upload" className="flex-1">
            <Button type="button" className="w-full" asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                {preview ? "Change Logo" : "Upload Logo"}
              </span>
            </Button>
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />
          </label>
          {preview && (
            <Button type="button" variant="outline" onClick={handleRemoveLogo}>
              <Trash2 className="h-4 w-4 mr-2" />
              Remove
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

