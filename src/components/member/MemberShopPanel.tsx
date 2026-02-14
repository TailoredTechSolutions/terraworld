import { useState, useEffect } from "react";
import {
  ShoppingBag,
  Ticket,
  Tag,
  Package,
  Search,
  Loader2,
  QrCode,
  Gift,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ShopProduct {
  id: string;
  product_type: string;
  sku: string;
  name: string;
  description: string | null;
  price: number;
  token_price: number | null;
  stock_quantity: number | null;
  status: string;
  metadata: any;
  image_url: string | null;
}

interface DigitalAsset {
  id: string;
  asset_type: string;
  asset_code: string;
  qr_data: string | null;
  status: string;
  issued_at: string;
  expires_at: string | null;
  redeemed_at: string | null;
  metadata: any;
}

interface MemberShopPanelProps {
  userId: string;
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  coupon: Tag,
  ticket: Ticket,
  merchandise: Package,
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-500/10 text-green-600",
  redeemed: "bg-muted text-muted-foreground",
  expired: "bg-destructive/10 text-destructive",
  voided: "bg-destructive/10 text-destructive",
  issued: "bg-primary/10 text-primary",
};

const MemberShopPanel = ({ userId }: MemberShopPanelProps) => {
  const { toast } = useToast();
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [myAssets, setMyAssets] = useState<DigitalAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<DigitalAsset | null>(null);
  const [activeTab, setActiveTab] = useState("browse");

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, assetsRes] = await Promise.all([
        supabase.from("shop_products").select("*").eq("status", "active").order("created_at", { ascending: false }),
        supabase.from("digital_assets").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      ]);

      setProducts((productsRes.data as ShopProduct[]) || []);
      setMyAssets((assetsRes.data as DigitalAsset[]) || []);
    } catch (error) {
      console.error("Error fetching shop data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (product: ShopProduct) => {
    setPurchasing(product.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Error", description: "Please sign in first", variant: "destructive" });
        return;
      }

      const response = await supabase.functions.invoke("shop-checkout", {
        body: {
          items: [{ shop_product_id: product.id, quantity: 1 }],
        },
      });

      if (response.error) throw response.error;

      toast({
        title: "Purchase Successful!",
        description: `${product.name} has been added to your assets.`,
      });

      await fetchData();
      setActiveTab("my-assets");
    } catch (error: any) {
      toast({
        title: "Purchase Failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setPurchasing(null);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="browse" className="gap-2">
            <ShoppingBag className="h-4 w-4" />
            Shop
          </TabsTrigger>
          <TabsTrigger value="my-assets" className="gap-2">
            <Gift className="h-4 w-4" />
            My Assets ({myAssets.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4 mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search coupons, tickets, merchandise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {filteredProducts.length === 0 ? (
            <Card className="p-12 text-center">
              <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="font-medium text-muted-foreground">No products available yet</p>
              <p className="text-sm text-muted-foreground">Check back soon for coupons, tickets, and merchandise.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => {
                const Icon = TYPE_ICONS[product.product_type] || Package;
                return (
                  <Card key={product.id} className="overflow-hidden glass-hover">
                    {product.image_url && (
                      <div className="h-40 bg-muted overflow-hidden">
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-primary" />
                          <Badge variant="outline" className="capitalize text-xs">
                            {product.product_type}
                          </Badge>
                        </div>
                        {product.stock_quantity !== null && (
                          <span className="text-xs text-muted-foreground">
                            {product.stock_quantity} left
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{product.name}</h3>
                        {product.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{product.description}</p>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-bold text-primary">₱{product.price.toLocaleString()}</p>
                          {product.token_price && (
                            <p className="text-xs text-muted-foreground">or {product.token_price} AGRI</p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handlePurchase(product)}
                          disabled={purchasing === product.id}
                        >
                          {purchasing === product.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Buy Now"
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-assets" className="space-y-4 mt-4">
          {myAssets.length === 0 ? (
            <Card className="p-12 text-center">
              <Gift className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="font-medium text-muted-foreground">No digital assets yet</p>
              <p className="text-sm text-muted-foreground">Purchase coupons or tickets from the shop.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myAssets.map((asset) => {
                const Icon = TYPE_ICONS[asset.asset_type] || Gift;
                const statusColor = STATUS_COLORS[asset.status] || "bg-muted text-muted-foreground";

                return (
                  <Card
                    key={asset.id}
                    className="cursor-pointer glass-hover"
                    onClick={() => setSelectedAsset(asset)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-primary/10">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">{asset.metadata?.product_name || asset.asset_type}</p>
                            <p className="text-xs text-muted-foreground font-mono">{asset.asset_code}</p>
                          </div>
                        </div>
                        <Badge className={statusColor}>{asset.status}</Badge>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Issued: {new Date(asset.issued_at).toLocaleDateString()}</span>
                        {asset.expires_at && (
                          <span>Expires: {new Date(asset.expires_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Asset Detail Dialog */}
      <Dialog open={!!selectedAsset} onOpenChange={() => setSelectedAsset(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              {selectedAsset?.metadata?.product_name || "Digital Asset"}
            </DialogTitle>
            <DialogDescription>
              Present this code for redemption
            </DialogDescription>
          </DialogHeader>
          {selectedAsset && (
            <div className="space-y-4">
              <div className="p-6 bg-secondary rounded-xl text-center">
                <p className="text-2xl font-mono font-bold tracking-wider">{selectedAsset.asset_code}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{selectedAsset.asset_type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge className={STATUS_COLORS[selectedAsset.status]}>{selectedAsset.status}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Issued</p>
                  <p className="font-medium">{new Date(selectedAsset.issued_at).toLocaleDateString()}</p>
                </div>
                {selectedAsset.expires_at && (
                  <div>
                    <p className="text-muted-foreground">Expires</p>
                    <p className="font-medium">{new Date(selectedAsset.expires_at).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MemberShopPanel;
