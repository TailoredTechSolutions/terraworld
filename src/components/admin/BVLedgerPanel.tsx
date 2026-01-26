import { useState, useEffect } from "react";
import { Activity, Search, Loader2, User, ShoppingBag, Crown, ArrowLeft, ArrowRight } from "lucide-react";
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

interface BVRecord {
  id: string;
  user_id: string;
  order_id: string | null;
  bv_type: string;
  leg: string | null;
  bv_amount: number;
  terra_fee: number | null;
  source_description: string | null;
  created_at: string;
}

export function BVLedgerPanel() {
  const { toast } = useToast();
  const [records, setRecords] = useState<BVRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    fetchBVLedger();
  }, []);

  const fetchBVLedger = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("bv_ledger")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error("Error fetching BV ledger:", error);
      toast({
        title: "Error",
        description: "Failed to load BV ledger",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter((r) => {
    const matchesType = typeFilter === "all" || r.bv_type === typeFilter;
    const matchesSearch = r.user_id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Stats
  const totalProductBV = records
    .filter((r) => r.bv_type === "product")
    .reduce((sum, r) => sum + Number(r.bv_amount), 0);
  const totalMembershipBV = records
    .filter((r) => r.bv_type === "membership")
    .reduce((sum, r) => sum + Number(r.bv_amount), 0);
  const leftLegBV = records
    .filter((r) => r.leg === "left")
    .reduce((sum, r) => sum + Number(r.bv_amount), 0);
  const rightLegBV = records
    .filter((r) => r.leg === "right")
    .reduce((sum, r) => sum + Number(r.bv_amount), 0);

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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <ShoppingBag className="h-4 w-4" />
            Product BV
          </div>
          <div className="text-2xl font-bold text-accent">{totalProductBV.toLocaleString()}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Crown className="h-4 w-4" />
            Membership BV
          </div>
          <div className="text-2xl font-bold text-primary">{totalMembershipBV.toLocaleString()}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <ArrowLeft className="h-4 w-4" />
            Left Leg BV
          </div>
          <div className="text-2xl font-bold">{leftLegBV.toLocaleString()}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <ArrowRight className="h-4 w-4" />
            Right Leg BV
          </div>
          <div className="text-2xl font-bold">{rightLegBV.toLocaleString()}</div>
        </Card>
      </div>

      {/* Ledger Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                BV Ledger
              </CardTitle>
              <CardDescription>Immutable record of all Business Volume ({records.length} entries)</CardDescription>
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
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="membership">Membership</SelectItem>
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
                <TableHead>Type</TableHead>
                <TableHead>Leg</TableHead>
                <TableHead>BV Amount</TableHead>
                <TableHead>Terra Fee</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No BV records found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono text-sm">{record.user_id.slice(0, 8)}...</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={record.bv_type === "product" ? "secondary" : "default"}>
                        {record.bv_type === "product" ? (
                          <ShoppingBag className="h-3 w-3 mr-1" />
                        ) : (
                          <Crown className="h-3 w-3 mr-1" />
                        )}
                        {record.bv_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {record.leg ? (
                        <Badge variant="outline" className="capitalize">
                          {record.leg === "left" ? (
                            <ArrowLeft className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowRight className="h-3 w-3 mr-1" />
                          )}
                          {record.leg}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-primary">
                      +{Number(record.bv_amount).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {record.terra_fee ? (
                        <span className="text-muted-foreground">₱{Number(record.terra_fee).toLocaleString()}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {record.source_description || (record.order_id ? `Order ${record.order_id.slice(0, 8)}...` : "—")}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(record.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
