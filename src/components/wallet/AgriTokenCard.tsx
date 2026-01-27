import { useState, useEffect } from "react";
import { 
  Coins, 
  ExternalLink, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown,
  Lock,
  Unlock,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface TokenTransaction {
  id: string;
  tokens_issued: number;
  php_reward_value: number;
  token_market_price: number;
  source_description: string | null;
  created_at: string;
}

interface VestingSchedule {
  id: string;
  amount: number;
  unlockDate: Date;
  status: "locked" | "unlocked" | "claimed";
}

interface AgriTokenCardProps {
  userId: string;
  profileBalance?: number;
  externalWalletAddress?: string | null;
}

// Mock on-chain data (would be fetched from blockchain API)
const MOCK_ON_CHAIN_DATA = {
  balance: 1250.75,
  usdValue: 125.08,
  priceChange24h: 2.34,
  lastUpdated: new Date(),
};

// Mock vesting schedule
const MOCK_VESTING: VestingSchedule[] = [
  { id: "1", amount: 500, unlockDate: new Date("2025-02-15"), status: "unlocked" },
  { id: "2", amount: 500, unlockDate: new Date("2025-03-15"), status: "locked" },
  { id: "3", amount: 500, unlockDate: new Date("2025-04-15"), status: "locked" },
  { id: "4", amount: 500, unlockDate: new Date("2025-05-15"), status: "locked" },
];

const AgriTokenCard = ({ userId, profileBalance = 0, externalWalletAddress }: AgriTokenCardProps) => {
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [onChainData, setOnChainData] = useState(MOCK_ON_CHAIN_DATA);
  const [vestingSchedule] = useState(MOCK_VESTING);

  useEffect(() => {
    fetchTokenData();
  }, [userId]);

  const fetchTokenData = async () => {
    try {
      const { data, error } = await supabase
        .from("token_ledger")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error("Error fetching token data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate blockchain API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setOnChainData({
      ...MOCK_ON_CHAIN_DATA,
      lastUpdated: new Date(),
    });
    await fetchTokenData();
    setRefreshing(false);
  };

  const totalVested = vestingSchedule.reduce((sum, v) => sum + v.amount, 0);
  const unlockedTokens = vestingSchedule
    .filter((v) => v.status === "unlocked")
    .reduce((sum, v) => sum + v.amount, 0);
  const vestingProgress = (unlockedTokens / totalVested) * 100;

  const formatAddress = (address: string) => {
    if (!address) return "Not Connected";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const totalInternalTokens = transactions.reduce((sum, tx) => sum + tx.tokens_issued, 0);

  if (loading) {
    return (
      <Card className="glass-card animate-pulse">
        <CardHeader>
          <div className="h-6 w-40 bg-muted rounded" />
        </CardHeader>
        <CardContent>
          <div className="h-16 w-32 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-ph-gold/20 via-accent/10 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-ph-gold to-accent shadow-glow-gold">
              <Coins className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">AGRI Token</CardTitle>
              <CardDescription>Terra Reward Token</CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-9 w-9"
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Balance Display */}
        <div className="grid grid-cols-2 gap-4">
          {/* Internal Balance */}
          <div className="p-4 rounded-xl border bg-gradient-to-br from-primary/5 to-transparent">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Wallet className="h-4 w-4" />
              Internal Balance
            </div>
            <p className="text-2xl font-bold font-display">
              {(profileBalance || totalInternalTokens).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              <span className="text-sm font-normal text-muted-foreground ml-1">AGRI</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Platform rewards
            </p>
          </div>

          {/* On-Chain Balance */}
          <div className="p-4 rounded-xl border bg-gradient-to-br from-ph-gold/10 to-transparent">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <ExternalLink className="h-4 w-4" />
              On-Chain Balance
            </div>
            <p className="text-2xl font-bold font-display">
              {onChainData.balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              <span className="text-sm font-normal text-muted-foreground ml-1">AGRI</span>
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">
                ≈ ${onChainData.usdValue.toLocaleString()}
              </span>
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-xs px-1.5 py-0",
                  onChainData.priceChange24h >= 0 ? "text-green-600" : "text-red-600"
                )}
              >
                {onChainData.priceChange24h >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-0.5" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-0.5" />
                )}
                {Math.abs(onChainData.priceChange24h)}%
              </Badge>
            </div>
          </div>
        </div>

        {/* Wallet Address */}
        {externalWalletAddress && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-muted-foreground">Connected Wallet</span>
            </div>
            <code className="text-sm font-mono">{formatAddress(externalWalletAddress)}</code>
          </div>
        )}

        <Separator />

        {/* Tabs for History & Vesting */}
        <Tabs defaultValue="history" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="history" className="gap-2">
              <Clock className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="vesting" className="gap-2">
              <Lock className="h-4 w-4" />
              Vesting
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="mt-4">
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Coins className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No token transactions yet</p>
                <p className="text-xs">Earn AGRI by completing purchases and activities</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-green-500/10">
                        <ArrowDownLeft className="h-4 w-4 text-green-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {tx.source_description || "Token Reward"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.created_at).toLocaleDateString()} • 
                          @ ₱{tx.token_market_price.toFixed(2)}/AGRI
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">
                        +{tx.tokens_issued.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ₱{tx.php_reward_value.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="vesting" className="mt-4 space-y-4">
            {/* Vesting Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Vesting Progress</span>
                <span className="font-medium">
                  {unlockedTokens.toLocaleString()} / {totalVested.toLocaleString()} AGRI
                </span>
              </div>
              <Progress value={vestingProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {vestingProgress.toFixed(0)}% unlocked
              </p>
            </div>

            {/* Vesting Schedule */}
            <div className="space-y-2">
              {vestingSchedule.map((vest) => (
                <div
                  key={vest.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border",
                    vest.status === "unlocked" 
                      ? "bg-green-500/5 border-green-500/20" 
                      : "bg-muted/30"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {vest.status === "locked" ? (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Unlock className="h-4 w-4 text-green-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {vest.amount.toLocaleString()} AGRI
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {vest.unlockDate.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={vest.status === "unlocked" ? "default" : "secondary"}
                    className="capitalize"
                  >
                    {vest.status}
                  </Badge>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Last Updated */}
        <p className="text-xs text-center text-muted-foreground">
          Last synced: {onChainData.lastUpdated.toLocaleTimeString()}
        </p>
      </CardContent>
    </Card>
  );
};

export default AgriTokenCard;
