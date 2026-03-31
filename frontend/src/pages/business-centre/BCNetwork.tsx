import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Search, Users, GitBranch, TrendingUp, Activity, Eye, Crown, Star, ArrowLeftCircle, ArrowRightCircle } from "lucide-react";
import { useState } from "react";
import { useUserRoles } from "@/hooks/useUserRoles";

interface NetworkMember {
  id: string;
  name: string;
  email: string;
  tier: string;
  rank: string;
  side: string;
  joinDate: string;
  bv: number;
  leftBv: number;
  rightBv: number;
  matchedBv: number;
  status: string;
  directReferrals: number;
  sponsor: string;
}

const DUMMY_NETWORK: NetworkMember[] = [
  { id: "1", name: "Ameer Saati", email: "ameer.saati@gmail.com", tier: "elite", rank: "Diamond", side: "left", joinDate: "2025-07-01", bv: 250000, leftBv: 75000, rightBv: 50000, matchedBv: 50000, status: "active", directReferrals: 8, sponsor: "Andrew Gwaltney" },
  { id: "2", name: "Liza Reyes", email: "liza@terra.ph", tier: "pro", rank: "Gold", side: "right", joinDate: "2025-07-20", bv: 45000, leftBv: 25000, rightBv: 18000, matchedBv: 18000, status: "active", directReferrals: 5, sponsor: "Andrew Gwaltney" },
  { id: "3", name: "Maria Santos", email: "maria@terra.ph", tier: "pro", rank: "Gold", side: "left", joinDate: "2025-08-15", bv: 75000, leftBv: 30000, rightBv: 22000, matchedBv: 22000, status: "active", directReferrals: 4, sponsor: "Ameer Saati" },
  { id: "4", name: "Juan Dela Cruz", email: "juan@terra.ph", tier: "basic", rank: "Silver", side: "right", joinDate: "2025-09-20", bv: 25000, leftBv: 12000, rightBv: 8000, matchedBv: 8000, status: "active", directReferrals: 3, sponsor: "Ameer Saati" },
  { id: "5", name: "Rosa Mendoza", email: "rosa@terra.ph", tier: "starter", rank: "Bronze", side: "left", joinDate: "2025-10-01", bv: 5000, leftBv: 2500, rightBv: 1500, matchedBv: 1500, status: "active", directReferrals: 1, sponsor: "Liza Reyes" },
  { id: "6", name: "Ben Torres", email: "ben@terra.ph", tier: "basic", rank: "Silver", side: "right", joinDate: "2025-09-05", bv: 15000, leftBv: 8000, rightBv: 5000, matchedBv: 5000, status: "active", directReferrals: 2, sponsor: "Liza Reyes" },
  { id: "7", name: "Pedro Garcia", email: "pedro@terra.ph", tier: "starter", rank: "Bronze", side: "left", joinDate: "2025-11-01", bv: 2500, leftBv: 1000, rightBv: 800, matchedBv: 800, status: "active", directReferrals: 0, sponsor: "Maria Santos" },
  { id: "8", name: "Carlo Villanueva", email: "carlo@terra.ph", tier: "basic", rank: "Silver", side: "right", joinDate: "2025-10-10", bv: 12000, leftBv: 5000, rightBv: 4000, matchedBv: 4000, status: "active", directReferrals: 1, sponsor: "Maria Santos" },
  { id: "9", name: "Ana Lopez", email: "ana@terra.ph", tier: "starter", rank: "Bronze", side: "left", joinDate: "2026-01-10", bv: 3500, leftBv: 1500, rightBv: 1000, matchedBv: 1000, status: "active", directReferrals: 0, sponsor: "Juan Dela Cruz" },
  { id: "10", name: "Miguel Ramos", email: "miguel@terra.ph", tier: "free", rank: "—", side: "right", joinDate: "2026-02-15", bv: 0, leftBv: 0, rightBv: 0, matchedBv: 0, status: "free", directReferrals: 0, sponsor: "Ben Torres" },
];

const BCNetwork = () => {
  const { isAnyAdmin } = useUserRoles();
  const [searchQuery, setSearchQuery] = useState("");

  const members = DUMMY_NETWORK;
  const filtered = searchQuery
    ? members.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.email.toLowerCase().includes(searchQuery.toLowerCase()))
    : members;

  const stats = {
    total: members.length,
    left: members.filter(m => m.side === "left").length,
    right: members.filter(m => m.side === "right").length,
    active: members.filter(m => m.status === "active").length,
    totalBv: members.reduce((s, m) => s + m.bv, 0),
    totalLeftBv: members.reduce((s, m) => s + m.leftBv, 0),
    totalRightBv: members.reduce((s, m) => s + m.rightBv, 0),
    totalMatched: members.reduce((s, m) => s + m.matchedBv, 0),
  };

  const tierColor = (t: string) => {
    switch (t) {
      case "elite": return "bg-amber-500/10 text-amber-600 border-amber-500/30";
      case "pro": return "bg-purple-500/10 text-purple-600 border-purple-500/30";
      case "basic": return "bg-blue-500/10 text-blue-600 border-blue-500/30";
      case "starter": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display flex items-center gap-2">
            <GitBranch className="h-6 w-6 text-primary" /> Genealogy Explorer
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Full network hierarchy, BV distribution, and member performance
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search members..." className="pl-9 h-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: "Total Network", value: stats.total.toString(), icon: Users },
          { label: "Active", value: stats.active.toString(), icon: Activity },
          { label: "Left Leg", value: stats.left.toString(), icon: ArrowLeftCircle },
          { label: "Right Leg", value: stats.right.toString(), icon: ArrowRightCircle },
          { label: "Total BV", value: stats.totalBv.toLocaleString(), icon: TrendingUp },
          { label: "Left BV", value: stats.totalLeftBv.toLocaleString(), icon: ArrowLeftCircle },
          { label: "Right BV", value: stats.totalRightBv.toLocaleString(), icon: ArrowRightCircle },
          { label: "Matched BV", value: stats.totalMatched.toLocaleString(), icon: Star },
        ].map((s) => (
          <div key={s.label} className="text-center p-3 rounded-xl border border-border/40 bg-card">
            <s.icon className="h-4 w-4 mx-auto mb-1.5 text-primary" />
            <p className="text-lg font-bold font-display">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Member Table */}
      <Card className="border-border/40">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-sm font-semibold">Member</TableHead>
                  <TableHead className="text-sm font-semibold">Sponsor</TableHead>
                  <TableHead className="text-sm font-semibold">Leg</TableHead>
                  <TableHead className="text-sm font-semibold">Package</TableHead>
                  <TableHead className="text-sm font-semibold">Rank</TableHead>
                  <TableHead className="text-sm font-semibold text-right">Personal BV</TableHead>
                  <TableHead className="text-sm font-semibold text-right">Left BV</TableHead>
                  <TableHead className="text-sm font-semibold text-right">Right BV</TableHead>
                  <TableHead className="text-sm font-semibold text-right">Matched</TableHead>
                  <TableHead className="text-sm font-semibold text-right">Referrals</TableHead>
                  <TableHead className="text-sm font-semibold">Joined</TableHead>
                  <TableHead className="text-sm font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((m) => (
                  <TableRow key={m.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell>
                      <p className="font-medium text-sm">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.email}</p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{m.sponsor}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-xs px-2 py-0.5", m.side === "left" ? "border-emerald-500/40 text-emerald-600 bg-emerald-500/5" : "border-blue-500/40 text-blue-600 bg-blue-500/5")}>
                        {m.side.charAt(0).toUpperCase() + m.side.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("text-xs px-2 py-0.5", tierColor(m.tier))} variant="outline">
                        {m.tier.charAt(0).toUpperCase() + m.tier.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{m.rank}</TableCell>
                    <TableCell className="text-right font-bold text-sm">{m.bv.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-sm text-emerald-600">{m.leftBv.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-sm text-blue-600">{m.rightBv.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-sm font-medium">{m.matchedBv.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-sm">{m.directReferrals}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(m.joinDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}</TableCell>
                    <TableCell>
                      <Badge variant={m.status === "active" ? "default" : "secondary"} className="text-xs px-2">
                        {m.status === "active" ? "Active" : "Free"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={12} className="py-8 text-center text-sm text-muted-foreground">No members found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BCNetwork;
