import { Product } from "@/data/products";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { Plus, ShoppingBag, Leaf } from "lucide-react";
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
        "group relative flex flex-col overflow-hidden rounded-2xl bg-card border border-border card-hover",
        className
      )}
    >
      {/* Image Container */}
      <Link to={`/product/${product.id}`} className="relative aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.organic && (
          <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-primary/90 px-2.5 py-1 text-xs font-medium text-primary-foreground backdrop-blur-sm">
            <Leaf className="h-3 w-3" />
            Organic
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <Link to={`/product/${product.id}`} className="flex-1">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            {product.farmName}
          </p>
          <h3 className="font-display text-lg font-semibold text-foreground leading-tight mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
          <div>
            <span className="text-lg font-bold text-foreground">
              ₱{product.price.toFixed(2)}
            </span>
            <span className="text-sm text-muted-foreground">
              /{product.unit}
            </span>
          </div>

          <Button
            size="sm"
            onClick={() => addItem(product)}
            className="btn-primary-gradient rounded-xl h-9 px-3 gap-1.5"
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
