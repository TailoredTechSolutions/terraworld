import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";

const BCStatements = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold font-display">Statements</h1>
      <p className="text-sm text-muted-foreground mt-1">Financial statements and transaction logs</p>
    </div>

    <Card className="border-border/40">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-sm font-semibold">Monthly Statements</h3>
            <p className="text-xs text-muted-foreground">Download your monthly earnings and transaction summaries</p>
          </div>
        </div>
        <div className="space-y-2">
          {["March 2026", "February 2026", "January 2026"].map((month) => (
            <div key={month} className="flex justify-between items-center p-2.5 rounded bg-muted/30 text-xs">
              <span>{month}</span>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                <Download className="h-3 w-3" /> Export
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default BCStatements;
