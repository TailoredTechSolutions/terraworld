import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, FileText, Image, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type DocumentType = 
  | 'government_id'
  | 'passport'
  | 'drivers_license'
  | 'proof_of_address'
  | 'selfie'
  | 'business_registration'
  | 'articles_of_incorporation'
  | 'tax_certificate';

interface KYCDocumentUploadProps {
  kycProfileId: string;
  userId: string;
  accountType: 'individual' | 'company';
  onUploadComplete: () => void;
}

const documentTypes: Record<DocumentType, { label: string; forCompany?: boolean }> = {
  government_id: { label: "Government ID" },
  passport: { label: "Passport" },
  drivers_license: { label: "Driver's License" },
  proof_of_address: { label: "Proof of Address" },
  selfie: { label: "Selfie with ID" },
  business_registration: { label: "Business Registration", forCompany: true },
  articles_of_incorporation: { label: "Articles of Incorporation", forCompany: true },
  tax_certificate: { label: "Tax Certificate", forCompany: true },
};

const KYCDocumentUpload = ({ kycProfileId, userId, accountType, onUploadComplete }: KYCDocumentUploadProps) => {
  const [selectedType, setSelectedType] = useState<DocumentType | "">("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const availableTypes = Object.entries(documentTypes).filter(([_, config]) => {
    if (accountType === 'individual') {
      return !config.forCompany;
    }
    return true;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file size (5MB max)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 5MB",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a JPEG, PNG, WebP, or PDF file",
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!selectedType || !file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${selectedType}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('kyc-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create document record
      const { error: dbError } = await supabase
        .from('kyc_documents')
        .insert({
          kyc_profile_id: kycProfileId,
          user_id: userId,
          document_type: selectedType,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
        });

      if (dbError) throw dbError;

      toast({
        title: "Document uploaded",
        description: "Your document has been uploaded successfully",
      });

      setFile(null);
      setSelectedType("");
      onUploadComplete();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = () => {
    if (!file) return null;
    return file.type.startsWith('image/') ? (
      <Image className="h-8 w-8 text-muted-foreground" />
    ) : (
      <FileText className="h-8 w-8 text-muted-foreground" />
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Upload Document</CardTitle>
        <CardDescription>
          Upload identity and verification documents. Accepted formats: JPEG, PNG, WebP, PDF (max 5MB)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Document Type</Label>
          <Select value={selectedType} onValueChange={(value) => setSelectedType(value as DocumentType)}>
            <SelectTrigger>
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              {availableTypes.map(([type, config]) => (
                <SelectItem key={type} value={type}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>File</Label>
          {file ? (
            <div className="flex items-center gap-3 p-3 border rounded-md bg-muted/50">
              {getFileIcon()}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setFile(null)}
                disabled={uploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed rounded-md p-6 text-center">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <Label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-primary hover:underline">Click to upload</span>
                <span className="text-muted-foreground"> or drag and drop</span>
              </Label>
              <Input
                id="file-upload"
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={handleFileChange}
              />
            </div>
          )}
        </div>

        <Button
          onClick={handleUpload}
          disabled={!selectedType || !file || uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default KYCDocumentUpload;
