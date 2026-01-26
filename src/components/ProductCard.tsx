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
        "group relative flex flex-col overflow-hidden glass-card glass-hover",
        className
      )}
    >
      {/* Image Container */}
      <Link to={`/product/${product.id}`} className="relative aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {product.organic && (
          <div className="absolute top-3 left-3 glass-badge-accent flex items-center gap-1.5 shadow-md">
            <Leaf className="h-3.5 w-3.5" />
            Organic
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5 bg-gradient-to-b from-transparent to-secondary/10">
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

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-glass-border">
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
            <div className="flex items-center bg-glass backdrop-blur-sm rounded-xl overflow-hidden border border-glass-border">
              <Button
                size="icon"
                variant="ghost"
                onClick={decrementQuantity}
                className="h-8 w-8 rounded-none hover:bg-secondary/50"
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
                className="h-8 w-8 rounded-none hover:bg-secondary/50"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>

            <Button
              size="icon"
              onClick={handleAddToCart}
              className="btn-liquid h-10 w-10 p-0 rounded-xl"
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
