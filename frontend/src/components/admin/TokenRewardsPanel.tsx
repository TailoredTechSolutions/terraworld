import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Coins, Search, Loader2, User, TrendingUp, DollarSign, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TokenRecord {
  id: string;
  user_id: string;
  tokens_issued: number;
  php_reward_value: number;
  token_market_price: number;
  source_description: string | null;
  created_at: string;
}

const TokenRewardsPanel = () => {
  const [records, setRecords] = useState<TokenRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => { fetchTokens(); }, []);

  const fetchTokens = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("token_ledger")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      setRecords(data || []);
    } catch (err) {
      console.error("Error fetching token ledger:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalTokens = records.reduce((s, r) => s + Number(r.tokens_issued), 0);
  const totalPHPValue = records.reduce((s, r) => s + Number(r.php_reward_value), 0);
  const uniqueHolders = [...new Set(records.map((r) => r.user_id))].length;
  const latestPrice = records.length > 0 ? Number(records[0].token_market_price) : 0;

  const filtered = records.filter((r) =>
    r.user_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.source_description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Per-user aggregation
  const userTotals = records.reduce((acc, r) => {
    if (!acc[r.user_id]) acc[r.user_id] = { tokens: 0, value: 0, count: 0 };
    acc[r.user_id].tokens += Number(r.tokens_issued);
    acc[r.user_id].value += Number(r.php_reward_value);
    acc[r.user_id].count += 1;
    return acc;
  }, {} as Record<string, { tokens: number; value: number; count: number }>);

  const topHolders = Object.entries(userTotals)
    .sort(([, a], [, b]) => b.tokens - a.tokens)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1"><Coins className="h-4 w-4 text-primary" /></div>
            <p className="text-2xl font-bold">{totalTokens.toLocaleString()} AGRI</p>
            <p className="text-xs text-muted-foreground">Total Tokens Issued</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1"><DollarSign className="h-4 w-4 text-accent" /></div>
            <p className="text-2xl font-bold">₱{totalPHPValue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total PHP Reward Value</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1"><Users className="h-4 w-4 text-muted-foreground" /></div>
            <p className="text-2xl font-bold">{uniqueHolders}</p>
            <p className="text-xs text-muted-foreground">Active Holders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1"><TrendingUp className="h-4 w-4 text-primary" /></div>
            <p className="text-2xl font-bold">₱{latestPrice.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Current Token Price</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Holders */}
      {topHolders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4 text-primary" />Top Token Holders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topHolders.map(([userId, data], i) => (
                <div key={userId} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-primary">#{i + 1}</span>
                    <span className="font-mono text-sm">{userId.slice(0, 8)}...</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">{data.tokens.toLocaleString()} AGRI</span>
                    <Badge variant="outline">₱{data.value.toLocaleString()}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ledger Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2"><Coins className="h-5 w-5 text-primary" />Token Issuance Ledger</CardTitle>
              <CardDescription>All token reward distributions ({records.length} entries)</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 w-[200px]" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground"><Coins className="h-12 w-12 mx-auto mb-3 opacity-50" /><p>No token records found</p></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Tokens Issued</TableHead>
                  <TableHead>PHP Value</TableHead>
                  <TableHead>Token Price</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="font-mono text-xs">{record.user_id.slice(0, 8)}...</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-primary">+{Number(record.tokens_issued).toLocaleString()}</TableCell>
                    <TableCell>₱{Number(record.php_reward_value).toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground">₱{Number(record.token_market_price).toFixed(2)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{record.source_description || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(record.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TokenRewardsPanel;
