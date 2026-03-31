import { useState, useEffect } from "react";
import { Crown, Search, Loader2, User, GitBranch, Calendar } from "lucide-react";
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

interface Membership {
  id: string;
  user_id: string;
  tier: string;
  package_price: number;
  membership_bv: number;
  sponsor_id: string | null;
  created_at: string;
}

const TIER_COLORS: Record<string, string> = {
  free: "bg-muted text-muted-foreground",
  starter: "bg-secondary text-secondary-foreground",
  basic: "bg-accent/20 text-accent-foreground",
  pro: "bg-primary/20 text-primary",
  elite: "bg-gradient-to-r from-primary to-accent text-primary-foreground",
};

const TIER_PRICES: Record<string, number> = {
  free: 0,
  starter: 500,
  basic: 1000,
  pro: 3000,
  elite: 5000,
};

export function MembershipsPanel() {
  const { toast } = useToast();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");

  useEffect(() => {
    fetchMemberships();
  }, []);

  const fetchMemberships = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("memberships")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMemberships(data || []);
    } catch (error) {
      console.error("Error fetching memberships:", error);
      toast({
        title: "Error",
        description: "Failed to load memberships",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredMemberships = memberships.filter((m) => {
    const matchesTier = tierFilter === "all" || m.tier === tierFilter;
    const matchesSearch = m.user_id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTier && matchesSearch;
  });

  // Stats
  const tierCounts = memberships.reduce((acc, m) => {
    acc[m.tier] = (acc[m.tier] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalBV = memberships.reduce((sum, m) => sum + Number(m.membership_bv), 0);
  const totalPackageValue = memberships.reduce((sum, m) => sum + Number(m.package_price), 0);

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
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {["free", "starter", "basic", "pro", "elite"].map((tier) => (
          <Card key={tier} className="p-4">
            <div className="flex items-center justify-between">
              <Badge className={TIER_COLORS[tier]}>{tier.charAt(0).toUpperCase() + tier.slice(1)}</Badge>
              <span className="text-2xl font-bold">{tierCounts[tier] || 0}</span>
            </div>
          </Card>
        ))}
        <Card className="p-4 bg-primary/10">
          <div className="text-sm text-muted-foreground">Total BV</div>
          <div className="text-2xl font-bold text-primary">{totalBV.toLocaleString()}</div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Memberships
              </CardTitle>
              <CardDescription>{memberships.length} total members</CardDescription>
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
              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="elite">Elite</SelectItem>
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
                <TableHead>Tier</TableHead>
                <TableHead>Package Price</TableHead>
                <TableHead>Membership BV</TableHead>
                <TableHead>Sponsor</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMemberships.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No memberships found
                  </TableCell>
                </TableRow>
              ) : (
                filteredMemberships.map((membership) => (
                  <TableRow key={membership.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono text-sm">{membership.user_id.slice(0, 8)}...</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={TIER_COLORS[membership.tier]}>
                        {membership.tier.charAt(0).toUpperCase() + membership.tier.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>₱{Number(membership.package_price).toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <GitBranch className="h-4 w-4 text-accent" />
                        {Number(membership.membership_bv).toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      {membership.sponsor_id ? (
                        <span className="font-mono text-sm text-muted-foreground">
                          {membership.sponsor_id.slice(0, 8)}...
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(membership.created_at).toLocaleDateString()}
                      </div>
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
