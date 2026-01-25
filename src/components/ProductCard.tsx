import { Product } from "@/data/products";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { Plus, Leaf, Sprout } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  className?: string;
}

const ProductCard = ({ product, className }: ProductCardProps) => {
  const { addItem } = useCartStore();

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

        {/* Quick add button on hover */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <Button
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              addItem(product);
            }}
            className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full h-10 w-10 p-0 shadow-lg"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
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

          <Button
            size="sm"
            onClick={() => addItem(product)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-10 px-4 gap-2 font-semibold transition-all hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
