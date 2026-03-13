import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShoppingBag, Search, Leaf, Loader2, ExternalLink } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useToast } from "@/hooks/use-toast";

const BuyerShopPanel = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const { toast } = useToast();
  const addItem = useCartStore((s) => s.addItem);

  const { data: products, isLoading } = useQuery({
    queryKey: ["buyer-shop-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, farmers!products_farmer_id_fkey(name)")
        .eq("is_paused", false)
        .gt("stock", 0)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  const categories = [...new Set((products || []).map((p) => p.category))].sort();

  const filtered = (products || []).filter((p) => {
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = category === "all" || p.category === category;
    return matchesSearch && matchesCat;
  });

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image_url || "/placeholder.svg",
      farmerId: product.farmer_id,
      farmerName: product.farmers?.name || "Unknown Farm",
      unit: product.unit,
    });
    toast({ title: "Added to cart", description: `${product.name} added to your cart.` });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-40 h-9">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" asChild className="h-9">
          <Link to="/shop">
            Full Shop <ExternalLink className="h-3 w-3 ml-1" />
          </Link>
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">{filtered.length} products available</p>

      {!filtered.length ? (
        <Card>
          <CardContent className="pt-6 text-center space-y-3">
            <ShoppingBag className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">No products found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((product) => (
            <Card key={product.id} className="overflow-hidden group">
              <div className="aspect-square relative bg-muted">
                <img
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {product.is_organic && (
                  <Badge className="absolute top-2 left-2 bg-green-600 text-white text-[10px] gap-1">
                    <Leaf className="h-2.5 w-2.5" /> Organic
                  </Badge>
                )}
              </div>
              <CardContent className="p-3 space-y-1">
                <Link to={`/product/${product.id}`} className="hover:underline">
                  <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                </Link>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {(product as any).farmers?.name || "Farm"}
                </p>
                <div className="flex items-center justify-between pt-1">
                  <p className="text-sm font-bold text-primary">₱{Number(product.price).toLocaleString()}/{product.unit}</p>
                </div>
                <Button
                  size="sm"
                  className="w-full mt-2 h-8 text-xs"
                  onClick={() => handleAddToCart(product)}
                >
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BuyerShopPanel;
