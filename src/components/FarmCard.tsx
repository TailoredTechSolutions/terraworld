import { Farm } from "@/data/products";
import { Star, MapPin, ArrowRight, Tractor, Phone, Award, Leaf } from "lucide-react";
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
        "group relative flex flex-col overflow-hidden glass-card glass-hover",
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
        <div className="absolute top-3 right-3 glass-badge-gold flex items-center gap-1.5 shadow-md">
          <Star className="h-4 w-4 fill-current" />
          <span className="font-bold">{farm.rating}</span>
        </div>

        {/* Program badge */}
        {farm.program && (
          <div className="absolute top-3 left-3 glass-badge-accent flex items-center gap-1.5 shadow-md">
            <Award className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">{farm.program === "ATI Learning Site" ? "ATI Certified" : "PhilGAP"}</span>
          </div>
        )}

        {farm.distance && (
          <div className="absolute bottom-3 left-3 glass-badge-primary flex items-center gap-1.5 shadow-md">
            <MapPin className="h-3.5 w-3.5" />
            {farm.distance} km away
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col p-5 bg-gradient-to-b from-transparent to-secondary/10">
        <div className="flex items-start gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
            <Tractor className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {farm.name}
            </h3>
            <p className="text-sm text-muted-foreground">by {farm.owner}</p>
          </div>
        </div>

        {/* Farm Type & Certificate */}
        {(farm.farmType || farm.certificate) && (
          <div className="flex flex-wrap gap-2 mb-3">
            {farm.farmType && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                <Leaf className="h-3 w-3" />
                {farm.farmType}
              </span>
            )}
            {farm.certificate && (
              <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                {farm.certificate}
              </span>
            )}
          </div>
        )}

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
          {farm.description}
        </p>

        {/* Contact - Click to Call */}
        {farm.contact && (
          <a 
            href={`tel:${farm.contact.replace(/-/g, '')}`}
            className="flex items-center gap-2 text-sm text-muted-foreground mb-3 hover:text-primary transition-colors group/phone"
          >
            <Phone className="h-3.5 w-3.5 text-primary group-hover/phone:scale-110 transition-transform" />
            <span className="underline-offset-2 group-hover/phone:underline">{farm.contact}</span>
          </a>
        )}

        <div className="flex flex-wrap gap-2 mb-5">
          {farm.products.slice(0, 3).map((product) => (
            <span
              key={product}
              className="glass-badge-accent"
            >
              {product}
            </span>
          ))}
          {farm.products.length > 3 && (
            <span className="glass-badge">
              +{farm.products.length - 3} more
            </span>
          )}
        </div>

        <Button
          variant="outline"
          className="w-full mt-auto btn-liquid-outline h-11 gap-2 font-semibold group/btn"
        >
          View Farm
          <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
        </Button>
      </div>
    </div>
  );
};

export default FarmCard;
