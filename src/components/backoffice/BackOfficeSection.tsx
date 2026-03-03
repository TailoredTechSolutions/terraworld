import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  id: string;
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const BackOfficeSection = ({ id, title, defaultOpen = false, children }: Props) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors"
      >
        <h2 className="text-base font-display font-semibold text-foreground">{title}</h2>
        {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
      </button>
      <div className={cn("transition-all duration-300", open ? "max-h-none" : "max-h-0 overflow-hidden")}>
        <div className="px-5 pb-5">
          {children}
        </div>
      </div>
    </section>
  );
};

export default BackOfficeSection;
