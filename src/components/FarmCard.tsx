import { Farm } from "@/data/products";
import { Star, MapPin, ArrowRight, Phone, Award, Leaf, Shield, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FarmCardProps {
  farm: Farm;
  className?: string;
}

const FarmCard = ({ farm, className }: FarmCardProps) => {
  const isATICertified = farm.program === "ATI Learning Site";
  const isPhilGAP = farm.program === "PhilGAP Certified";

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/30",
        className
      )}
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={farm.image}
          alt={farm.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Rating badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-md text-white px-2.5 py-1.5 rounded-full border border-white/20">
          <Star className="h-4 w-4 fill-ph-gold text-ph-gold" />
          <span className="font-bold text-sm">{farm.rating}</span>
          <span className="text-xs text-white/70">({farm.reviewCount})</span>
        </div>

        {/* Certification Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isATICertified && (
            <div className="flex items-center gap-1.5 bg-accent/90 backdrop-blur-md text-accent-foreground px-2.5 py-1.5 rounded-full shadow-lg border border-accent/50">
              <Shield className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold">ATI Certified</span>
            </div>
          )}
          {isPhilGAP && (
            <div className="flex items-center gap-1.5 bg-primary/90 backdrop-blur-md text-primary-foreground px-2.5 py-1.5 rounded-full shadow-lg border border-primary/50">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold">PhilGAP</span>
            </div>
          )}
        </div>

        {/* Distance badge */}
        {farm.distance && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-md text-foreground px-2.5 py-1.5 rounded-full shadow-md">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium">{farm.distance} km away</span>
          </div>
        )}

        {/* Farm Type badge */}
        {farm.farmType && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-primary/90 backdrop-blur-md text-primary-foreground px-2.5 py-1.5 rounded-full shadow-md">
            <Leaf className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">{farm.farmType}</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-1 p-5">
        {/* Header */}
        <div className="mb-4">
          <h3 className="font-display text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1">
            {farm.name}
          </h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <span className="text-primary">●</span> 
            Owned by <span className="font-medium text-foreground/80">{farm.owner}</span>
          </p>
        </div>

        {/* Certificate Info */}
        {farm.certificate && (
          <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-muted/50 rounded-lg border border-border/50">
            <Award className="h-4 w-4 text-ph-gold flex-shrink-0" />
            <span className="text-xs font-mono text-muted-foreground">{farm.certificate}</span>
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
          {farm.description}
        </p>

        {/* Products - Show All */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Products Available</p>
          <div className="flex flex-wrap gap-1.5">
            {farm.products.map((product) => (
              <span
                key={product}
                className="text-xs font-medium bg-secondary/80 text-secondary-foreground px-2.5 py-1 rounded-full border border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors"
              >
                {product}
              </span>
            ))}
          </div>
        </div>

        {/* Contact & Action */}
        <div className="mt-auto pt-4 border-t border-border/50">
          <div className="flex items-center justify-between gap-3">
            {farm.contact ? (
              <a 
                href={`tel:${farm.contact.replace(/-/g, '')}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group/phone flex-shrink-0"
              >
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 group-hover/phone:bg-primary/20 transition-colors">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium hidden sm:inline">{farm.contact}</span>
              </a>
            ) : (
              <div />
            )}
            
            <Button
              variant="default"
              size="sm"
              className="gap-2 font-semibold group/btn shadow-md hover:shadow-lg transition-shadow"
            >
              View Farm
              <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmCard;