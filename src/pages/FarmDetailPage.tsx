import { useParams, useNavigate, Link } from "react-router-dom";
import { farms, products } from "@/data/products";
import { motion } from "framer-motion";
import { MapPin, Phone, Star, Clock, Leaf, Award, ChevronLeft, ShoppingCart, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useCartStore } from "@/store/cartStore";
import { toast } from "sonner";
import { useState } from "react";
import { cn } from "@/lib/utils";

const FarmDetailPage = () => {
  const { farmId } = useParams<{ farmId: string }>();
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const [selectedImage, setSelectedImage] = useState(0);

  const farm = farms.find((f) => f.id === farmId);
  const farmProducts = products.filter((p) => p.farmId === farmId);

  // Build a gallery from the farm hero + unique product images
  const galleryImages = farm
    ? [
        { src: farm.image, alt: farm.name },
        ...farmProducts
          .filter((p, i, arr) => arr.findIndex((x) => x.image === p.image) === i)
          .slice(0, 5)
          .map((p) => ({ src: p.image, alt: p.name })),
      ]
    : [];

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

  const handleAddToCart = (product: typeof farmProducts[0]) => {
    addItem(product);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ── Full-width Hero ── */}
      <section className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden">
        <motion.img
          key={galleryImages[selectedImage]?.src}
          src={galleryImages[selectedImage]?.src}
          alt={galleryImages[selectedImage]?.alt}
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-transparent" />

        {/* Back button */}
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

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-6 md:p-12">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {farm.organicCertified && (
                <Badge className="bg-terra-leaf/90 text-primary-foreground border-0">
                  <Leaf className="h-3 w-3 mr-1" /> Organic Certified
                </Badge>
              )}
              {farm.certificate && (
                <Badge variant="outline" className="border-terra-gold/60 text-terra-gold backdrop-blur-sm bg-background/30">
                  <Award className="h-3 w-3 mr-1" /> {farm.certificate}
                </Badge>
              )}
              {farm.farmType && (
                <Badge variant="secondary" className="backdrop-blur-sm bg-background/40">
                  {farm.farmType}
                </Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground leading-tight">
              {farm.name}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base flex items-center gap-1">
              <span className="font-medium text-foreground">{farm.owner}</span>
              {farm.municipality && (
                <>
                  <span className="mx-1">·</span>
                  <MapPin className="h-3.5 w-3.5 text-accent" />
                  {farm.municipality}{farm.province ? `, ${farm.province}` : ""}
                </>
              )}
            </p>
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-terra-gold text-terra-gold" />
                <span className="font-semibold text-foreground">{farm.rating}</span>
                <span>({farm.reviewCount} reviews)</span>
              </span>
              {farm.operatingHours && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {farm.operatingHours}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Photo Gallery Thumbnails ── */}
      {galleryImages.length > 1 && (
        <div className="max-w-5xl mx-auto px-4 -mt-6 relative z-20">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {galleryImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={cn(
                  "flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200",
                  i === selectedImage
                    ? "border-primary ring-2 ring-primary/30 scale-105"
                    : "border-border/50 opacity-70 hover:opacity-100"
                )}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-16 h-16 md:w-20 md:h-20 object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Farm Info + Products ── */}
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
        {/* About section */}
        <section className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-xl font-display font-semibold text-foreground">About the Farm</h2>
            <p className="text-muted-foreground leading-relaxed">{farm.description}</p>

            {farm.specialties && farm.specialties.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {farm.specialties.map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Info Card */}
          <Card variant="glass" className="h-fit">
            <CardContent className="p-5 space-y-3 text-sm">
              {farm.elevation && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Elevation</span>
                  <span className="font-medium text-foreground">{farm.elevation}</span>
                </div>
              )}
              {farm.farmArea && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Farm Area</span>
                  <span className="font-medium text-foreground">{farm.farmArea}</span>
                </div>
              )}
              {farm.established && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Established</span>
                  <span className="font-medium text-foreground">{farm.established}</span>
                </div>
              )}
              {farm.deliveryAvailable !== undefined && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-medium text-foreground">
                    {farm.deliveryAvailable ? "Available" : "Pickup only"}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex gap-2">
                {farm.contact && (
                  <Button size="sm" variant="outline" className="flex-1" asChild>
                    <a href={`tel:${farm.contact}`}>
                      <Phone className="h-3.5 w-3.5 mr-1" /> Call
                    </a>
                  </Button>
                )}
                <Button size="sm" variant="outline" className="flex-1" asChild>
                  <a
                    href={`https://www.google.com/maps?q=${farm.latitude},${farm.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-1" /> Map
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Products section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-semibold text-foreground">
              Products
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({farmProducts.length} available)
              </span>
            </h2>
            <Button variant="outline" size="sm" onClick={() => navigate("/shop")}>
              View All Products
            </Button>
          </div>

          {farmProducts.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">
              No products listed yet for this farm.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {farmProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card hover="lift" className="overflow-hidden group">
                    <Link to={`/product/${product.id}`}>
                      <AspectRatio ratio={1}>
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </AspectRatio>
                    </Link>
                    <CardContent className="p-3 space-y-1.5">
                      <Link to={`/product/${product.id}`}>
                        <h3 className="text-sm font-semibold text-foreground line-clamp-1 hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-primary">
                          ₱{product.price.toFixed(0)}
                          <span className="text-xs font-normal text-muted-foreground">/{product.unit}</span>
                        </span>
                        {product.organic && (
                          <Leaf className="h-3.5 w-3.5 text-terra-leaf" />
                        )}
                      </div>
                      <Button
                        size="sm"
                        className="w-full h-8 text-xs"
                        onClick={() => handleAddToCart(product)}
                      >
                        <ShoppingCart className="h-3 w-3 mr-1" /> Add to Cart
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
