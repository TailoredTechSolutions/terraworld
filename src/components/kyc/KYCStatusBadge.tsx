import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, AlertCircle, FileQuestion } from "lucide-react";

type KYCStatus = 'not_started' | 'pending' | 'in_review' | 'approved' | 'rejected';

interface KYCStatusBadgeProps {
  status: KYCStatus;
  className?: string;
}

const statusConfig: Record<KYCStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ComponentType<{ className?: string }> }> = {
  not_started: {
    label: "Not Started",
    variant: "outline",
    icon: FileQuestion,
  },
  pending: {
    label: "Pending Review",
    variant: "secondary",
    icon: Clock,
  },
  in_review: {
    label: "In Review",
    variant: "default",
    icon: AlertCircle,
  },
  approved: {
    label: "Verified",
    variant: "default",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejected",
    variant: "destructive",
    icon: XCircle,
  },
};

const KYCStatusBadge = ({ status, className }: KYCStatusBadgeProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant} 
      className={`gap-1 ${status === 'approved' ? 'bg-green-600 hover:bg-green-700' : ''} ${className}`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};

export default KYCStatusBadge;
