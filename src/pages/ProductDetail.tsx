import { useParams, Link } from "react-router-dom";
import { products } from "@/data/products";
import { useCartStore } from "@/store/cartStore";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Minus, Plus, Leaf, MapPin, Truck, Shield, Star } from "lucide-react";
import { useState } from "react";

const ProductDetail = () => {
  const { id } = useParams();
  const { addItem } = useCartStore();
  const [quantity, setQuantity] = useState(1);

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <CartDrawer />
        <div className="container py-20 text-center">
          <h1 className="font-display text-2xl font-bold text-foreground mb-4">
            Product not found
          </h1>
          <Link to="/">
            <Button className="btn-primary-gradient rounded-xl">
              Back to Marketplace
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartDrawer />

      <main className="container py-8">
        {/* Breadcrumb */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 lg:mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Marketplace
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
              <Link
                to={`/farm/${product.farmId}`}
                className="text-sm font-medium text-primary hover:underline"
              >
                {product.farmName}
              </Link>
              <span className="text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">{product.category}</span>
            </div>

            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < 4 ? "fill-warning text-warning" : "text-muted"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">(42 reviews)</span>
            </div>

            <p className="text-muted-foreground mb-6 leading-relaxed">
              {product.description}
            </p>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-4xl font-bold text-foreground">
                ₱{product.price.toFixed(2)}
              </span>
              <span className="text-lg text-muted-foreground">
                per {product.unit}
              </span>
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
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-sm text-muted-foreground">
                {product.stock} available
              </span>
            </div>

            {/* Add to Cart */}
            <Button
              size="lg"
              onClick={handleAddToCart}
              className="btn-primary-gradient h-14 rounded-xl text-lg font-semibold mb-8"
            >
              Add to Cart — ₱{(product.price * quantity).toFixed(2)}
            </Button>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 border-t border-border">
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
                  <p className="text-xs text-muted-foreground">2.3 km away</p>
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
