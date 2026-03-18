import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin, Phone, Star, Clock, Leaf, Award, ChevronLeft,
  ShoppingCart, ExternalLink, Search, SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useCartStore } from "@/store/cartStore";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useFarmBySlug, useFarmProducts, type FarmProduct } from "@/hooks/useFarmDetail";
import { getProductImage } from "@/data/productImageMap";
import { siteImageUrl } from "@/lib/siteImages";

// Map farm slugs to existing farm images
const farmImageMap: Record<string, string> = {
  "mls-harvest-farm": siteImageUrl("farms/mls-harvest-farm.jpg"),
  "itogon-riverside-mixed-farm": siteImageUrl("farms/itogon-mixed-farm.jpg"),
  "csb-family-farm": siteImageUrl("farms/csb-family-farm.jpg"),
  "pinsao-urban-vegetable-garden": siteImageUrl("farms/pinsao-urban-farm.jpg"),
  "dulche-chocolates-inc": siteImageUrl("farms/dulche-chocolates.jpg"),
  "fit-and-fab-farm": siteImageUrl("farms/fit-fab-farm.jpg"),
  "bsu-strawberry-farm": siteImageUrl("farms/bsu-strawberry-farm.jpg"),
  "saymayat-vegetable-farming": siteImageUrl("farms/saymayat-vegetable.jpg"),
  "urban-garden-under-the-pines": siteImageUrl("farms/urban-garden-pines.jpg"),
  "la-faustino-farm": siteImageUrl("farms/la-faustino-farm.jpg"),
  "tublay-berry-and-greens-farm": siteImageUrl("farms/tublay-berry-farm.jpg"),
  "kibungan-green-terraces": siteImageUrl("farms/kibungan-green-terraces.jpg"),
  "pcjeam-farm": siteImageUrl("farms/pcjeam-farm.jpg"),
  "bakun-valley-organic-farm": siteImageUrl("farms/bakun-valley-farm.jpg"),
  "atok-highlands-vegetable-farm": siteImageUrl("farms/atok-highlands-farm.jpg"),
  "mankayan-root-crops-farm": siteImageUrl("farms/mankayan-root-farm.jpg"),
};

const FarmDetailPage = () => {
  const { farmSlug } = useParams<{ farmSlug: string }>();
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);

  const { data: farm, isLoading: farmLoading } = useFarmBySlug(farmSlug);
  const { data: products = [], isLoading: productsLoading } = useFarmProducts(farm?.id);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Derive unique categories from this farm's products
  const farmCategories = useMemo(() => {
    const cats = new Map<string, string>();
    products.forEach((p) => {
      if (p.category_slug && p.category_name) {
        cats.set(p.category_slug, p.category_name);
      }
    });
    return Array.from(cats.entries()).map(([slug, name]) => ({ slug, name }));
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category_name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    if (selectedCategory) {
      result = result.filter((p) => p.category_slug === selectedCategory);
    }

    switch (sortBy) {
      case "alpha":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "price-low":
        result.sort((a, b) => (a.price ?? 999999) - (b.price ?? 999999));
        break;
      case "price-high":
        result.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        break;
      case "newest":
        result.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case "featured":
      default:
        result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
        break;
    }

    return result;
  }, [products, search, selectedCategory, sortBy]);

  const handleAddToCart = (product: FarmProduct) => {
    // Convert to static Product shape for cart compatibility
    const cartProduct = {
      id: product.id,
      name: product.name,
      price: product.price ?? 0,
      unit: product.unit ?? "pc",
      farmId: farm?.id ?? "",
      farmName: farm?.name ?? "",
      image: getProductImage(product.name, product.image_url),
      category: product.category_name ?? "General",
      stock: product.stock_quantity,
      organic: false,
      description: product.description ?? "",
    };
    addItem(cartProduct);
    toast.success(`${product.name} added to cart`);
  };

  const farmImage = farmSlug ? farmImageMap[farmSlug] : undefined;

  // Loading state
  if (farmLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Skeleton className="w-full h-[50vh]" />
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Not found
  if (!farm) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h2 className="text-2xl font-display font-semibold text-foreground">Farm not found</h2>
        <Button variant="outline" onClick={() => navigate("/map")}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Farms
        </Button>
      </div>
    );
  }

  const heroImage = farm.image_url || farmImage || siteImageUrl("farms/atok-highlands-farm.jpg");
  const hasOrganic = farm.certifications.some((c) => c.toLowerCase().includes("organic"));

  return (
    <div className="min-h-screen bg-background">
      {/* ── Full-width Hero ── */}
      <section className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden">
        <motion.img
          src={heroImage}
          alt={farm.name}
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-transparent" />

        <div className="absolute top-4 left-4 z-20">
          <Button
            size="sm"
            variant="secondary"
            className="backdrop-blur-md bg-background/60 border border-border/50"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-10 p-6 md:p-12">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {hasOrganic && (
                <Badge className="bg-terra-leaf/90 text-primary-foreground border-0">
                  <Leaf className="h-3 w-3 mr-1" /> Organic Certified
                </Badge>
              )}
              {farm.certifications.filter((c) => !c.toLowerCase().includes("organic")).map((cert) => (
                <Badge key={cert} variant="outline" className="border-terra-gold/60 text-terra-gold backdrop-blur-sm bg-background/30">
                  <Award className="h-3 w-3 mr-1" /> {cert}
                </Badge>
              ))}
              {farm.certificate_code && (
                <Badge variant="outline" className="border-terra-gold/60 text-terra-gold backdrop-blur-sm bg-background/30">
                  {farm.certificate_code}
                </Badge>
              )}
              {farm.farm_type && (
                <Badge variant="secondary" className="backdrop-blur-sm bg-background/40">
                  {farm.farm_type}
                </Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground leading-tight">
              {farm.name}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base flex items-center gap-1">
              {farm.owner_name && <span className="font-medium text-foreground">{farm.owner_name}</span>}
              {farm.municipality && (
                <>
                  <span className="mx-1">·</span>
                  <MapPin className="h-3.5 w-3.5 text-accent" />
                  {farm.municipality}{farm.province ? `, ${farm.province}` : ""}
                </>
              )}
            </p>
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              {farm.rating && (
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-terra-gold text-terra-gold" />
                  <span className="font-semibold text-foreground">{Number(farm.rating).toFixed(1)}</span>
                  <span>({farm.review_count} reviews)</span>
                </span>
              )}
              {farm.opening_hours && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {farm.opening_hours}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Farm Info + Products ── */}
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
        {/* About section */}
        <section className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-xl font-display font-semibold text-foreground">About the Farm</h2>
            <p className="text-muted-foreground leading-relaxed">{farm.description}</p>
            {farm.specialties.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {farm.specialties.map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Card className="h-fit border-border">
            <CardContent className="p-5 space-y-3 text-sm">
              {farm.elevation_meters && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Elevation</span>
                  <span className="font-medium text-foreground">{farm.elevation_meters.toLocaleString()}m</span>
                </div>
              )}
              {farm.land_area_hectares && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Farm Area</span>
                  <span className="font-medium text-foreground">{Number(farm.land_area_hectares)} hectares</span>
                </div>
              )}
              {farm.established_year && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Established</span>
                  <span className="font-medium text-foreground">{farm.established_year}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span className="font-medium text-foreground">
                  {farm.delivery_available ? "Available" : farm.pickup_available ? "Pickup only" : "Contact farm"}
                </span>
              </div>
              {farm.delivery_fee_php && farm.delivery_available && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="font-medium text-foreground">₱{Number(farm.delivery_fee_php).toFixed(0)}</span>
                </div>
              )}
              {farm.delivery_eta_min && farm.delivery_eta_max && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Est. Delivery</span>
                  <span className="font-medium text-foreground">{farm.delivery_eta_min}–{farm.delivery_eta_max} min</span>
                </div>
              )}
              <Separator />
              <div className="flex gap-2">
                {farm.phone && (
                  <Button size="sm" variant="outline" className="flex-1" asChild>
                    <a href={`tel:${farm.phone}`}>
                      <Phone className="h-3.5 w-3.5 mr-1" /> Call
                    </a>
                  </Button>
                )}
                {farm.latitude && farm.longitude && (
                  <Button size="sm" variant="outline" className="flex-1" asChild>
                    <a
                      href={`https://www.google.com/maps?q=${farm.latitude},${farm.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3.5 w-3.5 mr-1" /> Map
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Products section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-semibold text-foreground">
              Available Products
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({filteredProducts.length})
              </span>
            </h2>
          </div>

          {/* Search + Sort bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="alpha">A – Z</SelectItem>
                <SelectItem value="price-low">Price: Low → High</SelectItem>
                <SelectItem value="price-high">Price: High → Low</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category chips */}
          {farmCategories.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-6">
              <Badge
                variant={selectedCategory === null ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Badge>
              {farmCategories.map((cat) => (
                <Badge
                  key={cat.slug}
                  variant={selectedCategory === cat.slug ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(selectedCategory === cat.slug ? null : cat.slug)}
                >
                  {cat.name}
                </Badge>
              ))}
            </div>
          )}

          {productsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-56 rounded-lg" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 space-y-2">
              <p className="text-muted-foreground">
                No products are currently available from this farm right now.
              </p>
              <p className="text-sm text-muted-foreground">
                Please check back later for fresh harvest updates.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                >
                  <Card className="overflow-hidden group hover:shadow-md transition-shadow border-border">
                    <AspectRatio ratio={1}>
                      <img
                        src={getProductImage(product.name, product.image_url)}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    </AspectRatio>
                    <CardContent className="p-3 space-y-1.5">
                      <h3 className="text-sm font-semibold text-foreground line-clamp-1">
                        {product.name}
                      </h3>
                      {product.category_name && (
                        <p className="text-xs text-muted-foreground">{product.category_name}</p>
                      )}
                      <div className="flex items-center justify-between">
                        {product.price != null ? (
                          <span className="text-sm font-bold text-primary">
                            ₱{product.price.toFixed(0)}
                            {product.unit && (
                              <span className="text-xs font-normal text-muted-foreground">/{product.unit}</span>
                            )}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Price TBA</span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        className="w-full h-8 text-xs"
                        onClick={() => handleAddToCart(product)}
                        disabled={product.price == null}
                      >
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        {product.price != null ? "Add to Cart" : "Coming Soon"}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default FarmDetailPage;
