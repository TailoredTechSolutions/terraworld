import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  icon: LucideIcon;
  className?: string;
}

const KPICard = ({ title, value, change, changeType = "neutral", icon: Icon, className }: Props) => {
  return (
    <div className={cn("rounded-lg border border-border/50 bg-card/60 p-4 flex items-start gap-3 min-w-0", className)}>
      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="h-4.5 w-4.5 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground break-words">{title}</p>
        <p className="text-xl font-bold text-foreground mt-0.5 break-all leading-tight">{value}</p>
        {change && (
          <p className={cn("text-xs mt-0.5 break-words", {
            "text-success": changeType === "up",
            "text-destructive": changeType === "down",
            "text-muted-foreground": changeType === "neutral",
          })}>
            {changeType === "up" ? "↑" : changeType === "down" ? "↓" : ""} {change}
          </p>
        )}
      </div>
    </div>
  );
};

export default KPICard;
