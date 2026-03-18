import { useNavigate } from "react-router-dom";
import { Farm } from "@/data/products";
import {
  Star,
  MapPin,
  Phone,
  Award,
  Leaf,
  Shield,
  CheckCircle2,
  Clock,
  Truck,
  Mountain,
  Ruler,
  Calendar,
  ExternalLink,
  Sprout,
  BadgeCheck,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { calculateDeliveryFee, calculateETA } from "@/hooks/useUserLocation";

interface DetailedFarmCardProps {
  farm: Farm;
  isSelected?: boolean;
  onSelect?: (farm: Farm) => void;
  className?: string;
}

// Map static farm IDs to normalized DB slugs
const farmSlugMap: Record<string, string> = {
  "saymayat-vegetable": "saymayat-vegetable-farming",
  "urban-garden-pines": "urban-garden-under-the-pines",
  "la-faustino-farm": "la-faustino-farm",
  "pcjeam-farm": "pcjeam-farm",
  "dulche-chocolates": "dulche-chocolates-inc",
  "csb-family-farm": "csb-family-farm",
  "fit-fab-farm": "fit-and-fab-farm",
  "mls-harvest-farm": "mls-harvest-farm",
  "atok-highlands-farm": "atok-highlands-vegetable-farm",
  "kibungan-green-terraces": "kibungan-green-terraces",
  "bakun-valley-farm": "bakun-valley-organic-farm",
  "mankayan-root-farm": "mankayan-root-crops-farm",
  "bsu-strawberry-farm": "bsu-strawberry-farm",
  "itogon-mixed-farm": "itogon-riverside-mixed-farm",
  "tublay-berry-farm": "tublay-berry-and-greens-farm",
  "pinsao-urban-farm": "pinsao-urban-vegetable-garden",
};

const DetailedFarmCard = ({ farm, isSelected, onSelect, className }: DetailedFarmCardProps) => {
  const navigate = useNavigate();
  const isATICertified = farm.program === "ATI Learning Site";
  const isPhilGAP = farm.program === "PhilGAP Certified";
  const distance = farm.distance || 5;
  const fee = calculateDeliveryFee(distance);
  const eta = calculateETA(distance);

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border-2 transition-all cursor-pointer bg-card",
        isSelected
          ? "border-primary shadow-lg ring-2 ring-primary/20"
          : "border-border hover:border-primary/50 hover:shadow-md",
        className
      )}
      onClick={() => onSelect?.(farm)}
    >
      {/* Image */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={farm.image}
          alt={farm.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Badges top */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {isATICertified && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-accent/90 text-accent-foreground px-2 py-0.5 rounded-full backdrop-blur-sm">
              <Shield className="h-3 w-3" /> ATI Certified
            </span>
          )}
          {isPhilGAP && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-primary/90 text-primary-foreground px-2 py-0.5 rounded-full backdrop-blur-sm">
              <CheckCircle2 className="h-3 w-3" /> PhilGAP
            </span>
          )}
          {farm.organicCertified && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-green-600/90 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
              <Sprout className="h-3 w-3" /> Organic
            </span>
          )}
        </div>

        {/* Rating top right */}
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-full">
          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-bold">{farm.rating}</span>
          <span className="text-[10px] text-white/70">({farm.reviewCount})</span>
        </div>

        {/* Bottom overlay info */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
          {farm.distance !== undefined && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-full">
              <MapPin className="h-3 w-3" /> {farm.distance} km
            </span>
          )}
          {farm.farmType && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-primary/80 backdrop-blur-sm text-primary-foreground px-2 py-1 rounded-full">
              <Leaf className="h-3 w-3" /> {farm.farmType}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Name & Owner */}
        <div>
          <h3 className="font-display text-base font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {farm.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            by <span className="font-medium text-foreground/80">{farm.owner}</span>
          </p>
        </div>

        {/* Location & Specs Grid */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
          {farm.municipality && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-primary flex-shrink-0" />
              {farm.municipality}, {farm.province}
            </span>
          )}
          {farm.elevation && (
            <span className="flex items-center gap-1.5">
              <Mountain className="h-3 w-3 text-primary flex-shrink-0" />
              {farm.elevation}
            </span>
          )}
          {farm.farmArea && (
            <span className="flex items-center gap-1.5">
              <Ruler className="h-3 w-3 text-primary flex-shrink-0" />
              {farm.farmArea}
            </span>
          )}
          {farm.established && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3 text-primary flex-shrink-0" />
              Est. {farm.established}
            </span>
          )}
        </div>

        {/* Certificate */}
        {farm.certificate && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-secondary rounded-lg">
            <Award className="h-3 w-3 text-yellow-500 flex-shrink-0" />
            <span className="text-[10px] font-mono text-muted-foreground">{farm.certificate}</span>
          </div>
        )}

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {farm.description}
        </p>

        {/* Specialties */}
        {farm.specialties && farm.specialties.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Specialties</p>
            <div className="flex flex-wrap gap-1">
              {farm.specialties.map((s) => (
                <span
                  key={s}
                  className="text-[10px] font-medium bg-accent/10 text-accent px-2 py-0.5 rounded-full border border-accent/20"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Products */}
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Products ({farm.products.length})</p>
          <div className="flex flex-wrap gap-1">
            {farm.products.map((product) => (
              <span
                key={product}
                className="text-[10px] font-medium bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full border border-border/50"
              >
                {product}
              </span>
            ))}
          </div>
        </div>

        {/* Delivery & Hours Info */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-primary" />
            {eta.min}-{eta.max} min
          </span>
          <span className="flex items-center gap-1">
            <Truck className="h-3 w-3 text-primary" />
            ₱{fee}
          </span>
          {farm.deliveryAvailable !== undefined && (
            <span className="flex items-center gap-1">
              <BadgeCheck className="h-3 w-3 text-primary" />
              {farm.deliveryAvailable ? "Delivers" : "Pickup only"}
            </span>
          )}
        </div>

        {farm.operatingHours && (
          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" /> {farm.operatingHours}
          </p>
        )}

        {/* Actions */}
        <div className="mt-auto pt-3 border-t border-border flex items-center justify-between gap-2">
          {farm.contact ? (
            <a
              href={`tel:${farm.contact.replace(/-/g, "")}`}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Phone className="h-3.5 w-3.5 text-primary" />
              {farm.contact}
            </a>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={(e) => {
                e.stopPropagation();
                window.open(`https://www.google.com/maps?q=${farm.latitude},${farm.longitude}`, "_blank");
              }}
            >
              <ExternalLink className="h-3 w-3" /> Map
            </Button>
            <Button
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={(e) => {
                e.stopPropagation();
                const slug = farmSlugMap[farm.id] || farm.id;
                navigate(`/farms/${slug}`);
              }}
            >
              <Store className="h-3 w-3" /> View Farm
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedFarmCard;
