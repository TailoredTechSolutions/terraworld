import { useState } from "react";
import { Product } from "@/data/products";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Leaf, Sprout } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  className?: string;
}

const ProductCard = ({ product, className }: ProductCardProps) => {
  const { addItem } = useCartStore();
  const [quantity, setQuantity] = useState(1);

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = () => {
    addItem(product, quantity);
    setQuantity(1); // Reset quantity after adding
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl bg-card border-2 border-secondary/50 hover:border-accent/50 shadow-sm hover:shadow-lg hover:shadow-accent/10 transition-all duration-300",
        className
      )}
    >
      {/* Image Container */}
      <Link to={`/product/${product.id}`} className="relative aspect-square overflow-hidden bg-secondary/30">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {product.organic && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground shadow-md">
            <Leaf className="h-3.5 w-3.5" />
            Organic
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5 bg-gradient-to-b from-card to-secondary/20">
        <Link to={`/product/${product.id}`} className="flex-1">
          <div className="flex items-center gap-1.5 mb-2">
            <Sprout className="h-3.5 w-3.5 text-accent" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {product.farmName}
            </p>
          </div>
          <h3 className="font-display text-xl font-semibold text-foreground leading-tight group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-secondary">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-primary font-display">
              ₱{product.price.toFixed(0)}
            </span>
            <span className="text-sm text-muted-foreground font-medium">
              /{product.unit}
            </span>
          </div>

          {/* Quantity Selector and Add Button */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-secondary/50 rounded-xl overflow-hidden">
              <Button
                size="icon"
                variant="ghost"
                onClick={decrementQuantity}
                className="h-8 w-8 rounded-none hover:bg-secondary"
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <span className="w-8 text-center text-sm font-semibold">
                {quantity}
              </span>
              <Button
                size="icon"
                variant="ghost"
                onClick={incrementQuantity}
                className="h-8 w-8 rounded-none hover:bg-secondary"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>

            <Button
              size="icon"
              onClick={handleAddToCart}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-10 w-10 transition-all hover:-translate-y-0.5"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
