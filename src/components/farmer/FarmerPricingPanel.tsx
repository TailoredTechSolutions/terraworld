import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Receipt } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products">;

interface FarmerPricingPanelProps {
  farmerId: string;
}

const PLATFORM_FEE_PERCENT = 20;
const COMMISSION_PERCENT = 10;
const TAX_PERCENT = 12; // Philippine VAT
const DEFAULT_TRANSPORT_FEE = 45; // base delivery fee (Lalamove/Grab)

const FarmerPricingPanel = ({ farmerId }: FarmerPricingPanelProps) => {
  const { data: products, isLoading } = useQuery({
    queryKey: ["farmer-pricing-products", farmerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("farmer_id", farmerId)
        .order("name");
      if (error) throw error;
      return data as Product[];
    },
  });

  const { data: deliveryZone } = useQuery({
    queryKey: ["default-delivery-zone"],
    queryFn: async () => {
      const { data } = await supabase
        .from("delivery_zones")
        .select("base_fee")
        .eq("is_active", true)
        .order("min_distance_km")
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  const transportFee = Number(deliveryZone?.base_fee ?? DEFAULT_TRANSPORT_FEE);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!products?.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No products yet. Add products first to see pricing breakdown.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Receipt className="h-5 w-5" />
            Transparent Pricing Breakdown
          </CardTitle>
          <CardDescription>
            See how the final consumer price is calculated for each product. You set the Base Price — the system applies Platform Fee, Commission, VAT, and Transport automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-primary" />
              <span className="text-muted-foreground">Base Price</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-orange-500" />
              <span className="text-muted-foreground">Platform Fee ({PLATFORM_FEE_PERCENT}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-purple-500" />
              <span className="text-muted-foreground">Commission ({COMMISSION_PERCENT}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500" />
              <span className="text-muted-foreground">VAT ({TAX_PERCENT}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-emerald-500" />
              <span className="text-muted-foreground">Transport (Lalamove/Grab)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Base Price</TableHead>
                  <TableHead className="text-right">Platform Fee</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                  <TableHead className="text-right">VAT (12%)</TableHead>
                  <TableHead className="text-right">Transport</TableHead>
                  <TableHead className="text-right font-semibold">Consumer Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const basePrice = Number(product.price);
                  const platformFee = basePrice * (PLATFORM_FEE_PERCENT / 100);
                  const commission = basePrice * (COMMISSION_PERCENT / 100);
                  const subtotalBeforeVAT = basePrice + platformFee + commission;
                  const vat = subtotalBeforeVAT * (TAX_PERCENT / 100);
                  const finalPrice = subtotalBeforeVAT + vat + transportFee;

                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-xs text-muted-foreground">
                            per {product.unit}
                            {product.is_organic && (
                              <Badge variant="secondary" className="ml-2 text-[10px] px-1 py-0">Organic</Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">₱{basePrice.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">₱{platformFee.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">₱{commission.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">₱{vat.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">₱{transportFee.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-bold text-primary">₱{finalPrice.toFixed(2)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            * Transport fee shown is the base delivery fee via Lalamove/Grab. Actual cost varies by delivery distance.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FarmerPricingPanel;
