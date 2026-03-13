import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, DollarSign, TrendingUp, Receipt, ArrowDownRight } from "lucide-react";
import { format } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";

interface FarmerEarningsPanelProps {
  farmerId: string;
  userId: string;
}

const FarmerEarningsPanel = ({ farmerId, userId }: FarmerEarningsPanelProps) => {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["farmer-earnings-orders", farmerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("farmer_id", farmerId)
        .in("status", ["delivered", "in_transit", "preparing"])
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Tables<"orders">[];
    },
  });

  const { data: wallet } = useQuery({
    queryKey: ["farmer-wallet", userId],
    queryFn: async () => {
      const { data } = await supabase.from("wallets").select("*").eq("user_id", userId).maybeSingle();
      return data;
    },
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  const totalGross = orders?.reduce((sum, o) => sum + Number(o.subtotal), 0) || 0;
  const totalTerraFee = orders?.reduce((sum, o) => sum + Number(o.terra_fee || 0), 0) || 0;
  const totalFarmerNet = orders?.reduce((sum, o) => sum + Number(o.farmer_price || 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <DollarSign className="h-4 w-4" /> Gross Sales
          </div>
          <p className="text-xl font-bold">₱{totalGross.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <ArrowDownRight className="h-4 w-4" /> Platform Fees
          </div>
          <p className="text-xl font-bold text-destructive">-₱{totalTerraFee.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <TrendingUp className="h-4 w-4" /> Net Earnings
          </div>
          <p className="text-xl font-bold text-primary">₱{totalFarmerNet.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Receipt className="h-4 w-4" /> Wallet Balance
          </div>
          <p className="text-xl font-bold">₱{Number(wallet?.available_balance || 0).toLocaleString()}</p>
        </Card>
      </div>

      {/* Earnings Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Receipt className="h-4 w-4" /> Order Earnings Breakdown
          </CardTitle>
          <CardDescription>{orders?.filter(o => o.status === "delivered").length || 0} delivered orders</CardDescription>
        </CardHeader>
        <CardContent>
          {!orders?.length ? (
            <p className="text-center text-muted-foreground py-6">No orders yet.</p>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Gross</TableHead>
                    <TableHead className="text-right">Terra Fee</TableHead>
                    <TableHead className="text-right">Net to You</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.order_number}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{format(new Date(order.created_at), "MMM d, yyyy")}</TableCell>
                      <TableCell className="text-right">₱{Number(order.subtotal).toLocaleString()}</TableCell>
                      <TableCell className="text-right text-destructive">-₱{Number(order.terra_fee || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-right font-semibold text-primary">₱{Number(order.farmer_price || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={order.status === "delivered" ? "default" : "secondary"}>{order.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FarmerEarningsPanel;
