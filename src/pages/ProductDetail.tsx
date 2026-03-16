import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { products as localProducts } from "@/data/products";
import { getProductImage } from "@/data/productImageMap";
import { useCartStore } from "@/store/cartStore";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Minus, Plus, Leaf, MapPin, Truck, Shield, Star, Info } from "lucide-react";
import { useState } from "react";

const PLATFORM_FEE_RATE = 0.20;
const COMMISSION_RATE = 0.10;
const VAT_RATE = 0.12;

const ProductDetail = () => {
  const { id } = useParams();
  const { addItem } = useCartStore();
  const [quantity, setQuantity] = useState(1);

  // Try DB product first, fall back to local
  const { data: dbProduct, isLoading } = useQuery({
    queryKey: ["product-detail", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*, farmers!products_farmer_id_fkey(name, location, rating)")
        .eq("id", id!)
        .maybeSingle();
      return data;
    },
    enabled: !!id,
  });

  const localProduct = localProducts.find((p) => p.id === id);

  // Normalize to a unified shape
  const product = dbProduct
    ? {
        id: dbProduct.id,
        name: dbProduct.name,
        price: Number(dbProduct.price),
        unit: dbProduct.unit,
        farmId: dbProduct.farmer_id,
        farmName: (dbProduct.farmers as any)?.name || "Farm",
        farmLocation: (dbProduct.farmers as any)?.location || "",
        farmRating: Number((dbProduct.farmers as any)?.rating || 5),
        image: dbProduct.image_url || "/placeholder.svg",
        category: dbProduct.category,
        stock: dbProduct.stock,
        organic: dbProduct.is_organic || false,
        description: dbProduct.description || "",
        harvestDate: dbProduct.harvest_date,
      }
    : localProduct
    ? {
        id: localProduct.id,
        name: localProduct.name,
        price: localProduct.price,
        unit: localProduct.unit,
        farmId: localProduct.farmId,
        farmName: localProduct.farmName,
        farmLocation: "",
        farmRating: 4.5,
        image: localProduct.image,
        category: localProduct.category,
        stock: localProduct.stock,
        organic: localProduct.organic,
        description: localProduct.description,
        harvestDate: null,
      }
    : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <CartDrawer />
        <main className="container py-8">
          <Skeleton className="h-6 w-40 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-12 w-32" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <CartDrawer />
        <div className="container py-20 text-center">
          <h1 className="font-display text-2xl font-bold text-foreground mb-4">
            Product not found
          </h1>
          <Link to="/shop">
            <Button className="btn-primary-gradient rounded-xl">
              Back to Shop
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Pricing breakdown
  const basePrice = product.price;
  const platformFee = basePrice * PLATFORM_FEE_RATE;
  const commission = basePrice * COMMISSION_RATE;
  const subtotalBeforeVAT = basePrice + platformFee + commission;
  const vat = subtotalBeforeVAT * VAT_RATE;
  const estimatedTransport = 45; // placeholder
  const finalBuyerPrice = subtotalBeforeVAT + vat + estimatedTransport;

  const handleAddToCart = () => {
    const cartProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      farmId: product.farmId,
      farmName: product.farmName,
      image: product.image,
      category: product.category,
      stock: product.stock,
      organic: product.organic,
      description: product.description,
    };
    addItem(cartProduct, quantity);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartDrawer />

      <main className="container py-8">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 lg:mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-secondary">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
            />
            {product.organic && (
              <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full bg-primary/90 px-3 py-1.5 text-sm font-medium text-primary-foreground backdrop-blur-sm">
                <Leaf className="h-4 w-4" />
                Certified Organic
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-primary">
                {product.farmName}
              </span>
              {product.farmLocation && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {product.farmLocation}
                  </span>
                </>
              )}
              <span className="text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">{product.category}</span>
            </div>

            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(product.farmRating) ? "fill-warning text-warning" : "text-muted"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">Farm rating</span>
            </div>

            <p className="text-muted-foreground mb-4 leading-relaxed">
              {product.description}
            </p>

            {product.harvestDate && (
              <p className="text-sm text-accent mb-4">
                Harvested: {new Date(product.harvestDate).toLocaleDateString()}
              </p>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-bold text-foreground">
                ₱{product.price.toFixed(2)}
              </span>
              <span className="text-lg text-muted-foreground">
                per {product.unit}
              </span>
            </div>

            {/* Availability */}
            <div className="mb-6">
              <Badge variant={product.stock > 0 ? "secondary" : "destructive"} className="text-xs">
                {product.stock > 0 ? `${product.stock} ${product.unit} in stock` : "Out of stock"}
              </Badge>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium text-foreground">Quantity:</span>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-semibold">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Add to Cart */}
            <Button
              size="lg"
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="btn-primary-gradient h-14 rounded-xl text-lg font-semibold mb-6"
            >
              Add to Cart — ₱{(product.price * quantity).toFixed(2)}
            </Button>

            {/* Pricing Transparency Breakdown */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  Pricing Transparency (per {product.unit})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base Farmer Price</span>
                  <span className="font-medium">₱{basePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform Fee (20%)</span>
                  <span>₱{platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Commission (10%)</span>
                  <span>₱{commission.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">VAT (12%)</span>
                  <span>₱{vat.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Est. Transport</span>
                  <span>₱{estimatedTransport.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Est. Final Buyer Price</span>
                  <span className="text-primary">₱{finalBuyerPrice.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 border-t border-border mt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Fast Delivery</p>
                  <p className="text-xs text-muted-foreground">Same-day available</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Local Farm</p>
                  <p className="text-xs text-muted-foreground">Highland produce</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Quality Assured</p>
                  <p className="text-xs text-muted-foreground">Freshness guaranteed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
