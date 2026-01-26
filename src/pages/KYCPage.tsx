import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import KYCStatusBadge from "@/components/kyc/KYCStatusBadge";
import KYCVerificationForm from "@/components/kyc/KYCVerificationForm";
import KYCDocumentUpload from "@/components/kyc/KYCDocumentUpload";
import KYCDocumentsList from "@/components/kyc/KYCDocumentsList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type KYCStatus = 'not_started' | 'pending' | 'in_review' | 'approved' | 'rejected';

interface KYCProfile {
  id: string;
  user_id: string;
  account_type: 'individual' | 'company';
  status: KYCStatus;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  rejection_reason?: string;
  submitted_at?: string;
  reviewed_at?: string;
}

const KYCPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [kycProfile, setKycProfile] = useState<KYCProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchKYCProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('kyc_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setKycProfile(data);
    } catch (error) {
      console.error("Error fetching KYC profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchKYCProfile();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const handleFormSuccess = () => {
    fetchKYCProfile();
  };

  const handleDocumentUpload = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-8 text-center">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
              <p className="text-muted-foreground mb-4">
                Please sign in to access KYC verification
              </p>
              <Button asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/member">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Shield className="h-6 w-6" />
                  Identity Verification
                </h1>
                <p className="text-muted-foreground">
                  Complete your KYC/KYB verification to unlock all platform features
                </p>
              </div>
            </div>
            {kycProfile && (
              <KYCStatusBadge status={kycProfile.status} />
            )}
          </div>

          {/* Status Alert */}
          {kycProfile?.status === 'approved' && (
            <Alert className="mb-6 border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20">
              <Shield className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-700 dark:text-green-400">Verified</AlertTitle>
              <AlertDescription className="text-green-600 dark:text-green-300">
                Your identity has been verified. You have full access to all platform features.
              </AlertDescription>
            </Alert>
          )}

          {kycProfile?.status === 'rejected' && (
            <Alert className="mb-6" variant="destructive">
              <Shield className="h-4 w-4" />
              <AlertTitle>Verification Rejected</AlertTitle>
              <AlertDescription>
                {kycProfile.rejection_reason || "Your verification was rejected. Please review and resubmit your information."}
              </AlertDescription>
            </Alert>
          )}

          {kycProfile?.status === 'in_review' && (
            <Alert className="mb-6 border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/20">
              <Shield className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-700 dark:text-blue-400">Under Review</AlertTitle>
              <AlertDescription className="text-blue-600 dark:text-blue-300">
                Your verification is being reviewed by our compliance team. This typically takes 1-3 business days.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Column - Form */}
            <div>
              <KYCVerificationForm
                userId={user.id}
                existingProfile={kycProfile}
                onSubmitSuccess={handleFormSuccess}
              />
            </div>

            {/* Right Column - Documents */}
            <div className="space-y-6">
              {kycProfile && (kycProfile.status === 'not_started' || kycProfile.status === 'pending' || kycProfile.status === 'rejected') && (
                <KYCDocumentUpload
                  kycProfileId={kycProfile.id}
                  userId={user.id}
                  accountType={kycProfile.account_type}
                  onUploadComplete={handleDocumentUpload}
                />
              )}

              <KYCDocumentsList
                userId={user.id}
                kycProfileId={kycProfile?.id || null}
                refreshTrigger={refreshTrigger}
              />

              {/* Requirements Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Document Requirements</CardTitle>
                  <CardDescription>
                    Please ensure your documents meet the following criteria
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      Documents must be clear and readable
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      All corners of the document must be visible
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      Files must be under 5MB (JPEG, PNG, WebP, or PDF)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      Government IDs must not be expired
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      Proof of address must be dated within 3 months
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default KYCPage;
