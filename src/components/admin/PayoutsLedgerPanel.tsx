import { useState, useEffect } from "react";
import { Wallet, Search, Loader2, User, GitBranch, Users, Crown, ShoppingBag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PayoutRecord {
  id: string;
  user_id: string;
  payout_period: string;
  bonus_type: string;
  gross_amount: number;
  net_amount: number;
  source_order_id: string | null;
  source_user_id: string | null;
  level_depth: number | null;
  notes: string | null;
  created_at: string;
}

const BONUS_TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  direct_product: { icon: ShoppingBag, color: "bg-accent/20 text-accent-foreground", label: "Direct Product" },
  direct_membership: { icon: Crown, color: "bg-primary/20 text-primary", label: "Direct Membership" },
  binary: { icon: GitBranch, color: "bg-secondary text-secondary-foreground", label: "Binary" },
  matching: { icon: Users, color: "bg-muted text-foreground", label: "Matching" },
};

export function PayoutsLedgerPanel() {
  const { toast } = useToast();
  const [records, setRecords] = useState<PayoutRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    fetchPayouts();
  }, []);

  const fetchPayouts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("payout_ledger")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error("Error fetching payouts:", error);
      toast({
        title: "Error",
        description: "Failed to load payouts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter((r) => {
    const matchesType = typeFilter === "all" || r.bonus_type === typeFilter;
    const matchesSearch = r.user_id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Stats by type
  const statsByType = records.reduce(
    (acc, r) => {
      acc[r.bonus_type] = (acc[r.bonus_type] || 0) + Number(r.net_amount);
      return acc;
    },
    {} as Record<string, number>
  );

  const totalPaid = records.reduce((sum, r) => sum + Number(r.net_amount), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(BONUS_TYPE_CONFIG).map(([type, config]) => (
          <Card key={type} className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <config.icon className="h-4 w-4" />
              {config.label}
            </div>
            <div className="text-xl font-bold">₱{(statsByType[type] || 0).toLocaleString()}</div>
          </Card>
        ))}
        <Card className="p-4 bg-primary/10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Wallet className="h-4 w-4" />
            Total Paid
          </div>
          <div className="text-xl font-bold text-primary">₱{totalPaid.toLocaleString()}</div>
        </Card>
      </div>

      {/* Ledger Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                Payout Ledger
              </CardTitle>
              <CardDescription>All bonus payouts ({records.length} entries)</CardDescription>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by user ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-[200px]"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="direct_product">Direct Product</SelectItem>
                  <SelectItem value="direct_membership">Direct Membership</SelectItem>
                  <SelectItem value="binary">Binary</SelectItem>
                  <SelectItem value="matching">Matching</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Bonus Type</TableHead>
                <TableHead>Gross</TableHead>
                <TableHead>Net</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No payout records found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record) => {
                  const config = BONUS_TYPE_CONFIG[record.bonus_type] || {
                    icon: Wallet,
                    color: "bg-muted",
                    label: record.bonus_type,
                  };
                  return (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono text-sm">{record.user_id.slice(0, 8)}...</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{record.payout_period}</TableCell>
                      <TableCell>
                        <Badge className={config.color}>
                          <config.icon className="h-3 w-3 mr-1" />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        ₱{Number(record.gross_amount).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium text-primary">
                        ₱{Number(record.net_amount).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {record.level_depth ? (
                          <Badge variant="outline">L{record.level_depth}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                        {record.notes || "—"}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
