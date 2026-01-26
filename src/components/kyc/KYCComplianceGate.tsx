import { ReactNode, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import KYCStatusBadge from "./KYCStatusBadge";

type KYCStatus = 'not_started' | 'pending' | 'in_review' | 'approved' | 'rejected';

interface KYCComplianceGateProps {
  children: ReactNode;
  requiredStatus?: KYCStatus[];
  fallbackMessage?: string;
  showBlockedUI?: boolean;
}

/**
 * A compliance gate that restricts access to features based on KYC verification status.
 * 
 * @param children - Content to render when KYC requirements are met
 * @param requiredStatus - Array of acceptable KYC statuses (default: ['approved'])
 * @param fallbackMessage - Custom message to show when blocked
 * @param showBlockedUI - Whether to show blocked UI or just hide content
 */
const KYCComplianceGate = ({ 
  children, 
  requiredStatus = ['approved'],
  fallbackMessage = "Complete your identity verification to access this feature.",
  showBlockedUI = true 
}: KYCComplianceGateProps) => {
  const { user } = useAuth();
  const [kycStatus, setKycStatus] = useState<KYCStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKYCStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('kyc_profiles')
          .select('status')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        setKycStatus(data?.status as KYCStatus || 'not_started');
      } catch (error) {
        console.error("Error fetching KYC status:", error);
        setKycStatus('not_started');
      } finally {
        setLoading(false);
      }
    };

    fetchKYCStatus();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isAllowed = kycStatus && requiredStatus.includes(kycStatus);

  if (isAllowed) {
    return <>{children}</>;
  }

  if (!showBlockedUI) {
    return null;
  }

  return (
    <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/50">
            <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <CardTitle className="text-lg">Verification Required</CardTitle>
            <CardDescription>{fallbackMessage}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Current Status:</span>
            <KYCStatusBadge status={kycStatus || 'not_started'} />
          </div>
          <Button asChild variant="default" size="sm">
            <Link to="/member?tab=kyc">
              {kycStatus === 'not_started' ? 'Start Verification' : 'View Status'}
            </Link>
          </Button>
        </div>
        
        {kycStatus === 'pending' && (
          <div className="mt-4 flex items-start gap-2 p-3 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
            <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Your verification is being processed. This typically takes 1-3 business days.
            </p>
          </div>
        )}

        {kycStatus === 'rejected' && (
          <div className="mt-4 flex items-start gap-2 p-3 rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
            <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300">
              Your verification was rejected. Please review the feedback and resubmit your documents.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KYCComplianceGate;
