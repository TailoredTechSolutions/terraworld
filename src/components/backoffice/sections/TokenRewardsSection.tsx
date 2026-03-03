import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import DataTable from "../DataTable";
import StatusChip from "../StatusChip";
import KPICard from "../KPICard";
import { Coins, TrendingUp, Users, Settings } from "lucide-react";

const MOCK_DISTRIBUTIONS = [
  { id: "1", user: "Juan dela Cruz", amount: 12.5, source: "order", status: "issued", date: "2026-03-02" },
  { id: "2", user: "Carlo Tan", amount: 8.3, source: "referral", status: "issued", date: "2026-03-02" },
  { id: "3", user: "Maria Santos", amount: 25.0, source: "order", status: "pending", date: "2026-03-01" },
  { id: "4", user: "Ana Lim", amount: 5.0, source: "activity", status: "failed", date: "2026-03-01" },
  { id: "5", user: "Pedro Reyes", amount: 15.0, source: "manual", status: "issued", date: "2026-02-28" },
];

const MOCK_RULES = [
  { id: "1", key: "purchase", description: "1 token per ₱100 spent", status: "active" },
  { id: "2", key: "referral", description: "5 tokens per successful referral", status: "active" },
  { id: "3", key: "delivery_completed", description: "2 tokens per completed delivery", status: "active" },
  { id: "4", key: "signup", description: "10 tokens on signup", status: "inactive" },
];

interface Props { openDrawer: (type: string, data: any) => void; }

const TokenRewardsSection = ({ openDrawer }: Props) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard icon={Coins} title="Total Issued" value="24,580" change="AgriTokens" changeType="neutral" />
        <KPICard icon={TrendingUp} title="Market Price" value="₱2.50" change="+₱0.15 this week" changeType="up" />
        <KPICard icon={Users} title="Token Holders" value="1,284" change="+89 this month" changeType="up" />
        <KPICard icon={Coins} title="Pending" value="142" change="Tokens to distribute" changeType="neutral" />
      </div>

      <Tabs defaultValue="distributions">
        <TabsList className="h-8">
          <TabsTrigger value="distributions" className="text-xs h-7">Distributions</TabsTrigger>
          <TabsTrigger value="rules" className="text-xs h-7">Reward Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="distributions" className="mt-3">
          <DataTable
            columns={[
              { key: "user", label: "User" },
              { key: "amount", label: "Tokens", render: (r) => r.amount.toFixed(1) },
              { key: "source", label: "Source" },
              { key: "status", label: "Status", render: (r) => <StatusChip status={r.status} /> },
              { key: "date", label: "Date" },
            ]}
            data={MOCK_DISTRIBUTIONS}
          />
        </TabsContent>

        <TabsContent value="rules" className="mt-3">
          <div className="space-y-2">
            {MOCK_RULES.map(r => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/60">
                <div>
                  <p className="text-xs font-medium capitalize">{r.key.replace(/_/g, " ")}</p>
                  <p className="text-[11px] text-muted-foreground">{r.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusChip status={r.status} />
                  <Button variant="outline" size="sm" className="h-7 text-xs"><Settings className="h-3 w-3" /></Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TokenRewardsSection;
