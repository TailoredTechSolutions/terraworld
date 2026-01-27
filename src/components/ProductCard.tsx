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
  compact?: boolean;
}

const ProductCard = ({ product, className, compact = false }: ProductCardProps) => {
  const { addItem } = useCartStore();
  const [quantity, setQuantity] = useState(1);

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = () => {
    addItem(product, quantity);
    setQuantity(1);
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl glass-card glass-hover",
        className
      )}
    >
      {/* Image Container - Optimized aspect ratio */}
      <Link 
        to={`/product/${product.id}`} 
        className={cn(
          "relative overflow-hidden",
          compact ? "aspect-[4/3]" : "aspect-[4/3] sm:aspect-[3/2]"
        )}
      >
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {product.organic && (
          <div className="absolute top-2 left-2 flex items-center gap-1 glass-badge-accent text-[10px] sm:text-xs font-semibold">
            <Leaf className="h-3 w-3" />
            <span className="hidden sm:inline">Organic</span>
          </div>
        )}
      </Link>

      {/* Content - Compact layout */}
      <div className={cn(
        "flex flex-1 flex-col bg-card/50 backdrop-blur-sm",
        compact ? "p-3" : "p-3 sm:p-4"
      )}>
        <Link to={`/product/${product.id}`} className="flex-1 min-h-0">
          <div className="flex items-center gap-1 mb-1">
            <Sprout className="h-3 w-3 text-accent flex-shrink-0" />
            <p className="text-[10px] sm:text-xs font-medium text-muted-foreground truncate">
              {product.farmName}
            </p>
          </div>
          <h3 className={cn(
            "font-display font-semibold text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2",
            compact ? "text-sm" : "text-sm sm:text-base"
          )}>
            {product.name}
          </h3>
        </Link>

        {/* Price and Actions */}
        <div className={cn(
          "flex items-center justify-between mt-3 pt-3 border-t border-border/50",
          compact && "mt-2 pt-2"
        )}>
          <div className="flex items-baseline gap-0.5">
            <span className={cn(
              "font-bold text-primary font-display",
              compact ? "text-base" : "text-lg sm:text-xl"
            )}>
              ₱{product.price.toFixed(0)}
            </span>
            <span className="text-[10px] sm:text-xs text-muted-foreground">
              /{product.unit}
            </span>
          </div>

          {/* Compact quantity selector */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center bg-glass backdrop-blur-sm rounded-lg overflow-hidden border border-glass-border">
              <Button
                size="icon"
                variant="ghost"
                onClick={decrementQuantity}
                className={cn(
                  "rounded-none hover:bg-secondary",
                  compact ? "h-6 w-6" : "h-7 w-7"
                )}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className={cn(
                "text-center text-xs font-semibold",
                compact ? "w-5" : "w-6"
              )}>
                {quantity}
              </span>
              <Button
                size="icon"
                variant="ghost"
                onClick={incrementQuantity}
                className={cn(
                  "rounded-none hover:bg-secondary",
                  compact ? "h-6 w-6" : "h-7 w-7"
                )}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            <Button
              size="icon"
              onClick={handleAddToCart}
              className={cn(
                "rounded-lg shadow-sm",
                compact ? "h-7 w-7" : "h-8 w-8"
              )}
            >
              <Plus className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;