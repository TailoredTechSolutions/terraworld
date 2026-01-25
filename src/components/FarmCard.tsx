import { Farm } from "@/data/products";
import { Star, MapPin, ArrowRight, Tractor } from "lucide-react";
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
        "group relative flex flex-col overflow-hidden rounded-2xl bg-card border-2 border-secondary/50 hover:border-accent/50 shadow-sm hover:shadow-lg hover:shadow-accent/10 transition-all duration-300",
        className
      )}
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={farm.image}
          alt={farm.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-primary/20 to-transparent" />
        
        {/* Rating badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-background/95 px-3 py-1.5 shadow-md backdrop-blur-sm">
          <Star className="h-4 w-4 fill-accent text-accent" />
          <span className="text-sm font-bold text-foreground">{farm.rating}</span>
        </div>

        {farm.distance && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground shadow-md">
            <MapPin className="h-3.5 w-3.5" />
            {farm.distance} km away
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col p-5 bg-gradient-to-b from-card to-secondary/20">
        <div className="flex items-start gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
            <Tractor className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {farm.name}
            </h3>
            <p className="text-sm text-muted-foreground">by {farm.owner}</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
          {farm.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-5">
          {farm.products.slice(0, 3).map((product) => (
            <span
              key={product}
              className="rounded-full bg-accent/15 border border-accent/30 px-3 py-1 text-xs font-semibold text-accent"
            >
              {product}
            </span>
          ))}
          {farm.products.length > 3 && (
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
              +{farm.products.length - 3} more
            </span>
          )}
        </div>

        <Button
          variant="outline"
          className="w-full mt-auto rounded-xl border-2 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 gap-2 font-semibold h-11 group/btn"
        >
          View Farm
          <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
        </Button>
      </div>
    </div>
  );
};

export default FarmCard;
