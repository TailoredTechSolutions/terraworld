import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-800 border-green-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  paid: "bg-green-100 text-green-800 border-green-200",
  verified: "bg-green-100 text-green-800 border-green-200",
  issued: "bg-green-100 text-green-800 border-green-200",
  resolved: "bg-green-100 text-green-800 border-green-200",
  closed: "bg-gray-100 text-gray-700 border-gray-200",
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  pending_approval: "bg-yellow-100 text-yellow-800 border-yellow-200",
  reviewing: "bg-yellow-100 text-yellow-800 border-yellow-200",
  processing: "bg-blue-100 text-blue-800 border-blue-200",
  preparing: "bg-blue-100 text-blue-800 border-blue-200",
  in_transit: "bg-blue-100 text-blue-800 border-blue-200",
  assigned: "bg-blue-100 text-blue-800 border-blue-200",
  open: "bg-orange-100 text-orange-800 border-orange-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  failed: "bg-red-100 text-red-800 border-red-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  suspended: "bg-red-100 text-red-800 border-red-200",
  draft: "bg-gray-100 text-gray-600 border-gray-200",
  unverified: "bg-gray-100 text-gray-600 border-gray-200",
};

interface Props {
  status: string;
  className?: string;
}

const StatusChip = ({ status, className }: Props) => {
  const style = STATUS_STYLES[status.toLowerCase()] || "bg-gray-100 text-gray-700 border-gray-200";
  return (
    <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 border", style, className)}>
      {status.replace(/_/g, " ")}
    </Badge>
  );
};

export default StatusChip;
