import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Image, Trash2, Eye, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import KYCStatusBadge from "./KYCStatusBadge";

interface KYCDocument {
  id: string;
  document_type: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  status: 'not_started' | 'pending' | 'in_review' | 'approved' | 'rejected';
  rejection_reason: string | null;
  created_at: string;
}

interface KYCDocumentsListProps {
  userId: string;
  kycProfileId: string | null;
  refreshTrigger?: number;
}

const documentTypeLabels: Record<string, string> = {
  government_id: "Government ID",
  passport: "Passport",
  drivers_license: "Driver's License",
  proof_of_address: "Proof of Address",
  selfie: "Selfie with ID",
  business_registration: "Business Registration",
  articles_of_incorporation: "Articles of Incorporation",
  tax_certificate: "Tax Certificate",
};

const KYCDocumentsList = ({ userId, kycProfileId, refreshTrigger }: KYCDocumentsListProps) => {
  const [documents, setDocuments] = useState<KYCDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [viewingUrl, setViewingUrl] = useState<string | null>(null);

  const fetchDocuments = async () => {
    if (!kycProfileId) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('kyc_documents')
        .select('*')
        .eq('kyc_profile_id', kycProfileId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error: any) {
      console.error("Error fetching documents:", error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [kycProfileId, refreshTrigger]);

  const handleView = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('kyc-documents')
        .createSignedUrl(filePath, 300); // 5 minutes

      if (error) throw error;
      window.open(data.signedUrl, '_blank');
    } catch (error: any) {
      console.error("Error viewing document:", error);
      toast({
        title: "Error",
        description: "Failed to view document",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (doc: KYCDocument) => {
    if (doc.status !== 'pending') {
      toast({
        title: "Cannot delete",
        description: "Only pending documents can be deleted",
        variant: "destructive",
      });
      return;
    }

    setDeleting(doc.id);
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('kyc-documents')
        .remove([doc.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('kyc_documents')
        .delete()
        .eq('id', doc.id);

      if (dbError) throw dbError;

      toast({
        title: "Document deleted",
        description: "The document has been removed",
      });

      fetchDocuments();
    } catch (error: any) {
      console.error("Error deleting document:", error);
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete document",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  const getFileIcon = (mimeType: string | null) => {
    if (mimeType?.startsWith('image/')) {
      return <Image className="h-5 w-5 text-muted-foreground" />;
    }
    return <FileText className="h-5 w-5 text-muted-foreground" />;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Uploaded Documents</CardTitle>
        <CardDescription>
          {documents.length === 0 
            ? "No documents uploaded yet" 
            : `${documents.length} document${documents.length > 1 ? 's' : ''} uploaded`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>Upload your verification documents to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {getFileIcon(doc.mime_type)}
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">
                      {documentTypeLabels[doc.document_type] || doc.document_type}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {doc.file_name}
                    </p>
                    {doc.rejection_reason && (
                      <p className="text-xs text-destructive mt-1">
                        Reason: {doc.rejection_reason}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <KYCStatusBadge status={doc.status} />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleView(doc.file_path)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {doc.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(doc)}
                      disabled={deleting === doc.id}
                    >
                      {deleting === doc.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-destructive" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KYCDocumentsList;
