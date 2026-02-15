import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Receipt, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products">;

interface FarmerPricingPanelProps {
  farmerId: string;
}

const TERRA_FEE_PERCENT = 30;
const TAX_PERCENT = 12; // VAT
const DEFAULT_TRANSPORT_FEE = 45; // base delivery fee from delivery_zones

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
      {/* Summary Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Receipt className="h-5 w-5" />
            Transparent Pricing Breakdown
          </CardTitle>
          <CardDescription>
            See how the final buyer price is calculated for each of your products.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-primary" />
              <span className="text-muted-foreground">Base Price (your price)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-orange-500" />
              <span className="text-muted-foreground">Terra Fee ({TERRA_FEE_PERCENT}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500" />
              <span className="text-muted-foreground">VAT ({TAX_PERCENT}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-emerald-500" />
              <span className="text-muted-foreground">Transport (base ₱{transportFee})</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">
                    Base Price
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 inline ml-1 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>Your set price per unit</TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead className="text-right">
                    Terra Fee
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 inline ml-1 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>{TERRA_FEE_PERCENT}% platform service fee</TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead className="text-right">
                    Tax (VAT)
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 inline ml-1 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>{TAX_PERCENT}% value-added tax</TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead className="text-right">
                    Transport
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 inline ml-1 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>Base delivery fee (varies by distance)</TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead className="text-right font-semibold">Final Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const basePrice = Number(product.price);
                  const terraFee = basePrice * (TERRA_FEE_PERCENT / 100);
                  const subtotalBeforeTax = basePrice + terraFee;
                  const tax = subtotalBeforeTax * (TAX_PERCENT / 100);
                  const finalPrice = subtotalBeforeTax + tax + transportFee;

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
                      <TableCell className="text-right font-medium">
                        ₱{basePrice.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        ₱{terraFee.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        ₱{tax.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        ₱{transportFee.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-primary">
                        ₱{finalPrice.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            * Transport fee shown is the base delivery fee. Actual cost varies by delivery distance and zone.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FarmerPricingPanel;
