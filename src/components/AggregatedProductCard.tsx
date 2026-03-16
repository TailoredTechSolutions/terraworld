import React from "react";
import { Link } from "react-router-dom";
import { Leaf, MapPin, Store, Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AggregatedProduct } from "@/hooks/useAggregatedProducts";

interface AggregatedProductCardProps {
  product: AggregatedProduct;
  compact?: boolean;
  className?: string;
}

const AggregatedProductCard = React.forwardRef<HTMLAnchorElement, AggregatedProductCardProps>(
  ({ product, compact = false, className }, ref) => {
    const closestOffer = product.offers[0];
    const hasMultipleFarms = product.farmCount > 1;

    return (
      <Link
        ref={ref}
        to={`/product/${product.productId}/offers`}
        className={cn(
          "group relative flex flex-col overflow-hidden rounded-xl glass-card glass-hover transition-all",
          className
        )}
      >
        {/* Image */}
        <div className={cn(
          "relative overflow-hidden",
          compact ? "aspect-[4/3]" : "aspect-[4/3] sm:aspect-[3/2]"
        )}>
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
              }}
            />
          ) : (
            <div className="h-full w-full bg-secondary flex items-center justify-center">
              <Store className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {product.hasOrganic && (
              <div className="flex items-center gap-1 glass-badge-accent text-[10px] sm:text-xs font-semibold">
                <Leaf className="h-3 w-3" />
                <span className="hidden sm:inline">Organic</span>
              </div>
            )}
          </div>

          {/* Farm count badge */}
          {hasMultipleFarms && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-primary/90 text-primary-foreground rounded-full px-2 py-0.5 text-[10px] sm:text-xs font-bold shadow-lg">
              <Store className="h-3 w-3" />
              {product.farmCount} farms
            </div>
          )}
        </div>

        {/* Content */}
        <div className={cn(
          "flex flex-1 flex-col bg-card/50 backdrop-blur-sm",
          compact ? "p-3" : "p-3 sm:p-4"
        )}>
          <div className="flex-1 min-h-0">
            <p className="text-[10px] sm:text-xs font-medium text-muted-foreground mb-1">
              {product.category}
            </p>
            <h3 className={cn(
              "font-display font-semibold text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2",
              compact ? "text-sm" : "text-sm sm:text-base"
            )}>
              {product.name}
            </h3>
          </div>

          {/* Price and meta */}
          <div className={cn("mt-3 pt-3 border-t border-border/50 space-y-2", compact && "mt-2 pt-2")}>
            {/* Price range */}
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-1">
                <span className="text-[10px] sm:text-xs text-muted-foreground">From</span>
                <span className={cn(
                  "font-bold text-primary font-display",
                  compact ? "text-base" : "text-lg sm:text-xl"
                )}>
                  ₱{product.lowestPrice.toFixed(0)}
                </span>
                <span className="text-[10px] sm:text-xs text-muted-foreground">/{product.unit}</span>
              </div>
              {hasMultipleFarms && product.highestPrice !== product.lowestPrice && (
                <span className="text-[10px] text-muted-foreground">
                  up to ₱{product.highestPrice.toFixed(0)}
                </span>
              )}
            </div>

            {/* Distance & ETA from closest farm */}
            {closestOffer?.distanceKm !== null && (
              <div className="flex items-center gap-3 text-[10px] sm:text-xs text-muted-foreground">
                <span className="flex items-center gap-0.5">
                  <MapPin className="h-3 w-3" />
                  {closestOffer.distanceKm} km
                </span>
                {closestOffer.etaMinutes !== null && (
                  <span className="flex items-center gap-0.5">
                    <Clock className="h-3 w-3" />
                    ~{closestOffer.etaMinutes} min
                  </span>
                )}
              </div>
            )}

            {/* CTA */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs text-accent font-medium">
                {hasMultipleFarms ? "Compare offers" : closestOffer?.farmName}
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>
        </div>
      </Link>
    );
  }
);

AggregatedProductCard.displayName = "AggregatedProductCard";

export default AggregatedProductCard;
