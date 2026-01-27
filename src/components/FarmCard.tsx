import { useState } from "react";
import { Farm } from "@/data/products";
import { Star, MapPin, ArrowRight, Phone, Award, Leaf, Shield, CheckCircle2, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FarmCardProps {
  farm: Farm;
  className?: string;
}

const FarmCard = ({ farm, className }: FarmCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const isATICertified = farm.program === "ATI Learning Site";
  const isPhilGAP = farm.program === "PhilGAP Certified";

  return (
    <>
      <div
        className={cn(
          "group relative flex flex-col overflow-hidden rounded-2xl glass-card glass-hover",
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
          <div className="absolute top-3 right-3 flex items-center gap-1.5 glass-badge backdrop-blur-md">
            <Star className="h-4 w-4 fill-ph-gold text-ph-gold" />
            <span className="font-bold text-sm">{farm.rating}</span>
            <span className="text-xs text-muted-foreground">({farm.reviewCount})</span>
          </div>

          {/* Certification Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isATICertified && (
              <div className="glass-badge-accent backdrop-blur-md flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" />
                <span className="text-xs font-semibold">ATI Certified</span>
              </div>
            )}
            {isPhilGAP && (
              <div className="glass-badge-primary backdrop-blur-md flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span className="text-xs font-semibold">PhilGAP</span>
              </div>
            )}
          </div>

          {/* Distance badge */}
          {farm.distance && (
            <div className="absolute bottom-3 left-3 glass-badge backdrop-blur-md flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium">{farm.distance} km away</span>
            </div>
          )}

          {/* Farm Type badge */}
          {farm.farmType && (
            <div className="absolute bottom-3 right-3 glass-badge-primary backdrop-blur-md flex items-center gap-1.5">
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
            <div className="flex items-center gap-2 mb-3 px-3 py-2 glass-card rounded-xl">
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
          <div className="mt-auto pt-4 border-t border-glass-border">
            <div className="flex items-center justify-between gap-3">
              {farm.contact ? (
                <a 
                  href={`tel:${farm.contact.replace(/-/g, '')}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group/phone flex-shrink-0"
                >
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 group-hover/phone:bg-primary/20 transition-colors">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium text-xs">{farm.contact}</span>
                </a>
              ) : (
                <div />
              )}
              
              <Button
                variant="liquid"
                size="sm"
                onClick={() => setIsOpen(true)}
                className="gap-2 font-semibold group/btn"
              >
                View Farm
                <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Farm Details Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-bold text-foreground flex items-center gap-3">
              {farm.name}
              {isATICertified && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-accent/20 text-accent px-2 py-1 rounded-full">
                  <Shield className="h-3 w-3" />
                  ATI Certified
                </span>
              )}
              {isPhilGAP && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-primary/20 text-primary px-2 py-1 rounded-full">
                  <CheckCircle2 className="h-3 w-3" />
                  PhilGAP
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          {/* Farm Image */}
          <div className="relative h-48 md:h-64 rounded-xl overflow-hidden mb-6">
            <img
              src={farm.image}
              alt={farm.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            
            {/* Rating overlay */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-md text-white px-3 py-2 rounded-full">
              <Star className="h-5 w-5 fill-ph-gold text-ph-gold" />
              <span className="font-bold">{farm.rating}</span>
              <span className="text-sm text-white/70">({farm.reviewCount} reviews)</span>
            </div>
          </div>

          {/* Farm Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Owner</h4>
                <p className="text-foreground font-medium">{farm.owner}</p>
              </div>

              {farm.farmType && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Farm Type</h4>
                  <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full">
                    <Leaf className="h-4 w-4" />
                    <span className="font-medium">{farm.farmType}</span>
                  </div>
                </div>
              )}

              {farm.program && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Program</h4>
                  <p className="text-foreground">{farm.program}</p>
                </div>
              )}

              {farm.certificate && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Certificate</h4>
                  <div className="inline-flex items-center gap-2 bg-muted px-3 py-2 rounded-lg">
                    <Award className="h-4 w-4 text-ph-gold" />
                    <span className="font-mono text-sm">{farm.certificate}</span>
                  </div>
                </div>
              )}

              {farm.contact && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Contact</h4>
                  <a 
                    href={`tel:${farm.contact.replace(/-/g, '')}`}
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    <span className="font-medium">{farm.contact}</span>
                  </a>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Location</h4>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-foreground">Baguio-Benguet Highlands</p>
                    <p className="text-sm text-muted-foreground">
                      Coordinates: {farm.latitude.toFixed(4)}, {farm.longitude.toFixed(4)}
                    </p>
                    {farm.distance && (
                      <p className="text-sm text-primary font-medium mt-1">{farm.distance} km away from you</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">About</h4>
                <p className="text-foreground/80 leading-relaxed">{farm.description}</p>
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Products Available</h4>
            <div className="flex flex-wrap gap-2">
              {farm.products.map((product) => (
                <span
                  key={product}
                  className="text-sm font-medium bg-secondary text-secondary-foreground px-4 py-2 rounded-full border border-border"
                >
                  {product}
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 pt-6 border-t border-border flex flex-wrap gap-3">
            {farm.contact && (
              <a 
                href={`tel:${farm.contact.replace(/-/g, '')}`}
                className="flex-1"
              >
                <Button className="w-full gap-2" size="lg">
                  <Phone className="h-5 w-5" />
                  Call Farm
                </Button>
              </a>
            )}
            <Button 
              variant="outline" 
              size="lg" 
              className="flex-1 gap-2"
              onClick={() => window.open(`https://www.google.com/maps?q=${farm.latitude},${farm.longitude}`, '_blank')}
            >
              <ExternalLink className="h-5 w-5" />
              View on Map
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FarmCard;