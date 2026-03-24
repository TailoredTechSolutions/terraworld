import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import DataTable from "../DataTable";
import StatusChip from "../StatusChip";
import KPICard from "../KPICard";
import { Search, Download, DollarSign, AlertTriangle, Wallet, CreditCard } from "lucide-react";

const MOCK_TRANSACTIONS = [
  { id: "1", ref: "PAY-8810", order: "ORD-2026-089", provider: "GCash", amount: 1850, status: "captured", date: "2026-03-02 14:30" },
  { id: "2", ref: "PAY-8811", order: "ORD-2026-088", provider: "Card", amount: 3200, status: "captured", date: "2026-03-02 13:15" },
  { id: "3", ref: "PAY-8812", order: "ORD-2026-090", provider: "GCash", amount: 1200, status: "failed", date: "2026-03-02 12:45" },
  { id: "4", ref: "PAY-8813", order: "ORD-2026-086", provider: "Bank", amount: 2100, status: "captured", date: "2026-03-01 16:00" },
  { id: "5", ref: "PAY-8814", order: "ORD-2026-085", provider: "GCash", amount: 680, status: "refunded", date: "2026-02-28 10:20" },
];

const MOCK_PAYOUTS = [
  { id: "1", run: "PR-2026-012", type: "Farmers", status: "completed", total: 142500, items: 28, period: "Feb 24-28", date: "2026-03-01" },
  { id: "2", run: "PR-2026-013", type: "MLM Commissions", status: "processing", total: 38400, items: 15, period: "Feb 24-28", date: "2026-03-02" },
  { id: "3", run: "PR-2026-014", type: "Drivers", status: "draft", total: 22800, items: 8, period: "Mar 1-3", date: "2026-03-03" },
];

const MOCK_MISMATCHES = [
  { id: "1", ref: "PAY-8812", issue: "Payment timeout — GCash confirmed but DB shows failed", amount: 1200, status: "pending" },
  { id: "2", ref: "PAY-8801", issue: "Duplicate charge detected", amount: 850, status: "pending" },
];

interface Props { openDrawer: (type: string, data: any) => void; }

const PaymentsFinanceSection = ({ openDrawer }: Props) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard icon={DollarSign} title="Revenue (30d)" value="₱2.4M" change="+12.3%" changeType="up" />
        <KPICard icon={CreditCard} title="Transactions" value="1,247" change="This month" changeType="neutral" />
        <KPICard icon={Wallet} title="Pending Payouts" value="₱61.2K" change="3 runs" changeType="neutral" />
        <KPICard icon={AlertTriangle} title="Mismatches" value="2" change="Need resolution" changeType="down" />
      </div>

      <Tabs defaultValue="transactions">
        <TabsList className="h-8">
          <TabsTrigger value="transactions" className="text-xs h-7">Transactions</TabsTrigger>
          <TabsTrigger value="payouts" className="text-xs h-7">Payout Runs</TabsTrigger>
          <TabsTrigger value="mismatches" className="text-xs h-7">Mismatches ({MOCK_MISMATCHES.length})</TabsTrigger>
          <TabsTrigger value="config" className="text-xs h-7">Fee & Tax Config</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="mt-3">
          <DataTable
            columns={[
              { key: "ref", label: "Reference" },
              { key: "order", label: "Order" },
              { key: "provider", label: "Provider" },
              { key: "amount", label: "Amount", render: (r) => `₱${r.amount.toLocaleString()}` },
              { key: "status", label: "Status", render: (r) => <StatusChip status={r.status} /> },
              { key: "date", label: "Date" },
            ]}
            data={MOCK_TRANSACTIONS}
          />
        </TabsContent>

        <TabsContent value="payouts" className="mt-3">
          <DataTable
            columns={[
              { key: "run", label: "Run ID" },
              { key: "type", label: "Type" },
              { key: "status", label: "Status", render: (r) => <StatusChip status={r.status} /> },
              { key: "total", label: "Total", render: (r) => `₱${r.total.toLocaleString()}` },
              { key: "items", label: "Items" },
              { key: "period", label: "Period" },
              { key: "date", label: "Date" },
            ]}
            data={MOCK_PAYOUTS}
          />
          <div className="mt-3 flex gap-2">
            <Button size="sm" className="text-xs">Create Payout Run</Button>
            <Button variant="outline" size="sm" className="text-xs gap-1"><Download className="h-3.5 w-3.5" /> Export</Button>
          </div>
        </TabsContent>

        <TabsContent value="mismatches" className="mt-3">
          <div className="space-y-3">
            {MOCK_MISMATCHES.map(m => (
              <div key={m.id} className="p-3 rounded-lg border border-yellow-200 bg-yellow-50/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium">{m.ref} — ₱{m.amount.toLocaleString()}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{m.issue}</p>
                  </div>
                  <Button size="sm" className="h-7 text-xs">Resolve</Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="config" className="mt-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-border/50 bg-card/60 space-y-3">
              <h4 className="text-sm font-semibold">Platform Fees</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span>Global platform fee</span><span className="font-medium">15%</span></div>
                <div className="flex justify-between"><span>Vegetables category</span><span className="font-medium">12%</span></div>
                <div className="flex justify-between"><span>Specialty category</span><span className="font-medium">18%</span></div>
              </div>
              <Button variant="outline" size="sm" className="text-xs">Edit Rules</Button>
            </div>
            <div className="p-4 rounded-lg border border-border/50 bg-card/60 space-y-3">
              <h4 className="text-sm font-semibold">Tax Configuration</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span>VAT Rate</span><span className="font-medium">12%</span></div>
                <div className="flex justify-between"><span>Withholding Tax</span><span className="font-medium">2%</span></div>
              </div>
              <Button variant="outline" size="sm" className="text-xs">Edit Tax Rules</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentsFinanceSection;
