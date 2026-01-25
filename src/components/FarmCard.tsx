import { Farm } from "@/data/products";
import { Star, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FarmCardProps {
  farm: Farm;
  className?: string;
}

const FarmCard = ({ farm, className }: FarmCardProps) => {
  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl bg-card border border-border card-hover",
        className
      )}
    >
      {/* Image */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={farm.image}
          alt={farm.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {farm.distance && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
            <MapPin className="h-3 w-3 text-primary" />
            {farm.distance} km away
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {farm.name}
            </h3>
            <p className="text-sm text-muted-foreground">by {farm.owner}</p>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-secondary px-2 py-1">
            <Star className="h-3.5 w-3.5 fill-warning text-warning" />
            <span className="text-sm font-semibold">{farm.rating}</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {farm.description}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {farm.products.slice(0, 3).map((product) => (
            <span
              key={product}
              className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
            >
              {product}
            </span>
          ))}
          {farm.products.length > 3 && (
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              +{farm.products.length - 3} more
            </span>
          )}
        </div>

        <Button
          variant="outline"
          className="w-full mt-auto rounded-xl border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors gap-2"
        >
          View Farm
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default FarmCard;
