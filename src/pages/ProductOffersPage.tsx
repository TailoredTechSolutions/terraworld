import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import { useAggregatedProducts, FarmOffer } from "@/hooks/useAggregatedProducts";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapPin, Clock, Star, Leaf, Truck, Plus, Minus,
  ArrowLeft, ArrowUpDown, Store, ChevronDown
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type SortMode = "distance" | "price" | "eta" | "rating";

const ProductOffersPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: products, isLoading } = useAggregatedProducts();
  const { addItem } = useCartStore();
  const [sortMode, setSortMode] = useState<SortMode>("distance");
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const product = products?.find(p => p.productId === id);

  const sortedOffers = useMemo(() => {
    if (!product) return [];
    const offers = [...product.offers];
    switch (sortMode) {
      case "distance":
        return offers.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
      case "price":
        return offers.sort((a, b) => a.price - b.price);
      case "eta":
        return offers.sort((a, b) => (a.etaMinutes ?? 999) - (b.etaMinutes ?? 999));
      case "rating":
        return offers.sort((a, b) => (b.farmRating ?? 0) - (a.farmRating ?? 0));
      default:
        return offers;
    }
  }, [product, sortMode]);

  const getQuantity = (offerId: string) => quantities[offerId] || 1;
  const setQuantity = (offerId: string, qty: number) => {
    setQuantities(prev => ({ ...prev, [offerId]: Math.max(1, qty) }));
  };

  const handleAddToCart = (offer: FarmOffer) => {
    if (!product) return;
    const qty = getQuantity(offer.farmProductId);
    // Create a Product-compatible object for the cart
    const cartProduct = {
      id: `${product.productId}-${offer.farmId}`,
      name: product.name,
      price: offer.price,
      unit: product.unit,
      farmId: offer.farmId,
      farmName: offer.farmName,
      image: product.imageUrl || "",
      category: product.category,
      stock: offer.stockQuantity,
      organic: offer.isOrganic,
      description: product.description || "",
    };
    addItem(cartProduct, qty);
    setQuantity(offer.farmProductId, 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <CartDrawer />
        <main className="container px-4 py-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-4 w-96 mb-8" />
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
          </div>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <CartDrawer />
        <main className="container px-4 py-16 text-center">
          <h2 className="text-xl font-semibold mb-2">Product not found</h2>
          <Link to="/shop" className="text-primary hover:underline">Back to Shop</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartDrawer />

      <main className="py-4 sm:py-8">
        <div className="container px-3 sm:px-4 lg:px-8">
          {/* Breadcrumb */}
          <Link to="/shop" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Shop
          </Link>

          {/* Product header */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-6">
            {product.imageUrl && (
              <div className="w-full sm:w-48 h-48 sm:h-36 rounded-xl overflow-hidden flex-shrink-0">
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                {product.hasOrganic && (
                  <Badge variant="outline" className="text-xs gap-1 text-accent border-accent/30">
                    <Leaf className="h-3 w-3" /> Organic available
                  </Badge>
                )}
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
                {product.name}
              </h1>
              {product.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
              )}
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Store className="h-4 w-4" />
                  {product.farmCount} farm{product.farmCount > 1 ? "s" : ""} selling
                </span>
                <span className="font-semibold text-primary">
                  From ₱{product.lowestPrice.toFixed(0)}/{product.unit}
                </span>
              </div>
            </div>
          </div>

          {/* Sort controls */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-foreground">
              Available from {product.farmCount} farm{product.farmCount > 1 ? "s" : ""}
            </h2>
            <Select value={sortMode} onValueChange={(v) => setSortMode(v as SortMode)}>
              <SelectTrigger className="w-36 h-9 rounded-lg text-xs">
                <ArrowUpDown className="h-3 w-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="distance">Closest</SelectItem>
                <SelectItem value="price">Lowest Price</SelectItem>
                <SelectItem value="eta">Fastest ETA</SelectItem>
                <SelectItem value="rating">Best Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Farm offers list */}
          <div className="space-y-3">
            {sortedOffers.map((offer, index) => {
              const qty = getQuantity(offer.farmProductId);
              const isLowest = offer.price === product.lowestPrice;

              return (
                <div
                  key={offer.farmProductId}
                  className={cn(
                    "relative rounded-xl border bg-card p-4 transition-all hover:shadow-md",
                    isLowest && "ring-2 ring-primary/20 border-primary/30"
                  )}
                >
                  {isLowest && product.farmCount > 1 && (
                    <Badge className="absolute -top-2.5 left-4 bg-primary text-primary-foreground text-[10px]">
                      Best Price
                    </Badge>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    {/* Farm info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm sm:text-base truncate">{offer.farmName}</h3>
                        {offer.farmRating && (
                          <span className="flex items-center gap-0.5 text-xs text-amber-500">
                            <Star className="h-3 w-3 fill-current" />
                            {offer.farmRating}
                          </span>
                        )}
                        {offer.isOrganic && (
                          <Badge variant="outline" className="text-[10px] gap-0.5 h-5 text-accent border-accent/30">
                            <Leaf className="h-2.5 w-2.5" /> Organic
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {offer.distanceKm !== null && (
                          <span className="flex items-center gap-0.5">
                            <MapPin className="h-3 w-3" />
                            {offer.distanceKm} km away
                          </span>
                        )}
                        {offer.etaMinutes !== null && (
                          <span className="flex items-center gap-0.5">
                            <Clock className="h-3 w-3" />
                            ~{offer.etaMinutes} min delivery
                          </span>
                        )}
                        {offer.deliveryFee !== null && (
                          <span className="flex items-center gap-0.5">
                            <Truck className="h-3 w-3" />
                            ₱{offer.deliveryFee} delivery
                          </span>
                        )}
                        {offer.harvestDate && (
                          <span className="text-accent">
                            Harvested: {new Date(offer.harvestDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground mt-1">
                        {offer.stockQuantity} {product.unit} in stock
                      </p>
                    </div>

                    {/* Price + actions */}
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="text-right">
                        <div className="font-display font-bold text-lg sm:text-xl text-primary">
                          ₱{offer.price.toFixed(0)}
                        </div>
                        <span className="text-[10px] text-muted-foreground">/{product.unit}</span>
                      </div>

                      {/* Quantity selector */}
                      <div className="flex items-center bg-secondary rounded-lg overflow-hidden border border-border">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setQuantity(offer.farmProductId, qty - 1)}
                          className="h-8 w-8 rounded-none"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-semibold">{qty}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setQuantity(offer.farmProductId, qty + 1)}
                          className="h-8 w-8 rounded-none"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <Button
                        onClick={() => handleAddToCart(offer)}
                        size="sm"
                        className="rounded-lg gap-1 px-3"
                      >
                        <Plus className="h-4 w-4" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductOffersPage;
