import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import DetailedFarmCard from "@/components/DetailedFarmCard";
import FarmMap from "@/components/maps/FarmMap";
import DeliveryTracker from "@/components/maps/DeliveryTracker";
import { farms, Farm } from "@/data/products";
import { useUserLocation, calculateDistance } from "@/hooks/useUserLocation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search, MapPin, List, Map as MapIcon, Navigation,
  Truck, AlertCircle, Mountain, Sprout, Shield, Star,
  SlidersHorizontal, Leaf
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import farmsHero from "@/assets/farms-hero.jpg";

const cubicSmooth = [0.22, 1, 0.36, 1] as const;

const farmCategories = [
  { id: "all", label: "All Farms", icon: Mountain },
  { id: "organic", label: "Organic", icon: Leaf },
  { id: "delivery", label: "With Delivery", icon: Truck },
];

const MapPage = () => {
  const [searchParams] = useSearchParams();
  const [view, setView] = useState<"list" | "map">("map");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [showTracker, setShowTracker] = useState(false);
  const [organicOnly, setOrganicOnly] = useState(false);
  const [deliveryOnly, setDeliveryOnly] = useState(false);
  const [selectedFarmType, setSelectedFarmType] = useState("all");
  const [activeCategory, setActiveCategory] = useState("all");

  const heroRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  const heroImageY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 500], [1, 1.15]);

  const { location, error: locationError, loading: locationLoading, requestLocation } = useUserLocation();

  const handleCategoryClick = (catId: string) => {
    setActiveCategory(catId);
    if (catId === "all") {
      setOrganicOnly(false);
      setDeliveryOnly(false);
    } else if (catId === "organic") {
      setOrganicOnly(true);
      setDeliveryOnly(false);
    } else if (catId === "delivery") {
      setOrganicOnly(false);
      setDeliveryOnly(true);
    }
  };

  useEffect(() => {
    const farmId = searchParams.get("farm");
    if (farmId) {
      const farm = farms.find(f => f.id === farmId);
      if (farm) {
        setSelectedFarm(farm);
        setView("map");
      }
    }
  }, [searchParams]);

  const farmsWithDistance = farms.map(farm => {
    if (location) {
      const distance = calculateDistance(location.lat, location.lng, farm.latitude, farm.longitude);
      return { ...farm, distance: Math.round(distance * 10) / 10 };
    }
    return farm;
  }).sort((a, b) => (a.distance || 0) - (b.distance || 0));

  const filteredFarms = farmsWithDistance.filter((farm) => {
    const matchesSearch =
      farm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farm.products.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (farm.municipality?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

    const matchesOrganic = !organicOnly || farm.organicCertified;
    const matchesDelivery = !deliveryOnly || farm.deliveryAvailable;
    const matchesFarmType = selectedFarmType === "all" || farm.farmType === selectedFarmType;

    return matchesSearch && matchesOrganic && matchesDelivery && matchesFarmType;
  });

  // Get unique farm types for filter
  const farmTypes = [...new Set(farms.map(f => f.farmType).filter(Boolean))] as string[];

  const activeFiltersCount = [organicOnly, deliveryOnly, selectedFarmType !== "all"].filter(Boolean).length;

  const clearFilters = () => {
    setOrganicOnly(false);
    setDeliveryOnly(false);
    setSelectedFarmType("all");
    setSearchQuery("");
  };

  const handleFarmSelect = (farm: Farm) => {
    setSelectedFarm(farm);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartDrawer />

      {/* ===== CINEMATIC HERO ===== */}
      <section className="relative h-[320px] sm:h-[380px] lg:h-[420px] overflow-hidden">
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.8, ease: cubicSmooth }}
        >
          <img
            src={farmsHero}
            alt="Highland farms at sunrise"
            className="h-full w-full object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-transparent" />

        <div className="relative container h-full flex flex-col justify-end pb-8 sm:pb-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: cubicSmooth }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 px-4 py-1.5 mb-4">
              <Mountain className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-primary">Highland Farm Network</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-2 max-w-2xl leading-tight">
              Discover Our Farms
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-lg">
              {farms.length} verified farms across the Baguio-Benguet highlands — certified, traceable, direct.
            </p>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            className="flex items-center gap-6 mt-5"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6, ease: cubicSmooth }}
          >
            {[
              { icon: Sprout, value: `${farms.length}`, label: "Verified Farms" },
              { icon: Shield, value: "ATI/GAP", label: "Certified" },
              { icon: Star, value: "4.5+", label: "Avg Rating" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-card/60 backdrop-blur-sm border border-border/50">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground leading-none">{value}</p>
                  <p className="text-[10px] text-muted-foreground">{label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== LOCATION STATUS (compact, integrated) ===== */}
      <section className="container px-3 sm:px-4 lg:px-8 -mt-5 relative z-10 mb-6">
        <motion.div
          className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-2xl bg-card border border-border shadow-sm"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: cubicSmooth }}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
              {locationLoading ? (
                <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <MapPin className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="min-w-0">
              {locationError ? (
                <>
                  <p className="font-medium text-foreground flex items-center gap-2 text-sm">
                    <AlertCircle className="h-4 w-4 text-yellow-500 shrink-0" />
                    <span className="truncate">Using default location (Manila)</span>
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{locationError}</p>
                </>
              ) : (
                <>
                  <p className="font-medium text-foreground text-sm">
                    {location ? "Showing farms near you" : "Getting your location..."}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : "Please wait..."}
                  </p>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" className="rounded-xl flex-1 sm:flex-none" size="sm" onClick={requestLocation}>
              <Navigation className="h-4 w-4 mr-2" />
              Update Location
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl flex-1 sm:flex-none"
              onClick={() => setShowTracker(!showTracker)}
            >
              <Truck className="h-4 w-4 mr-2" />
              {showTracker ? "Hide" : "Demo"} Tracker
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Delivery Tracker Demo */}
      {showTracker && (
        <section className="container px-3 sm:px-4 lg:px-8 mb-6">
          <DeliveryTracker orderId="FD-DEMO123" estimatedMinutes={45} />
        </section>
      )}

      {/* ===== MAIN CONTENT ===== */}
      <main className="pb-8 sm:pb-12">
        <div className="container px-3 sm:px-4 lg:px-8">
          {/* Search + controls toolbar */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search farms, products, or municipalities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 sm:h-11 rounded-xl text-sm"
              />
            </div>

            <div className="flex gap-2">
              {/* View toggle */}
              <div className="flex rounded-xl border border-border overflow-hidden">
                <Button
                  variant={view === "map" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-10 sm:h-11 w-10 sm:w-11 rounded-none"
                  onClick={() => setView("map")}
                >
                  <MapIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant={view === "list" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-10 sm:h-11 w-10 sm:w-11 rounded-none"
                  onClick={() => setView("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Mobile filter sheet */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden h-10 sm:h-11 px-3 rounded-xl gap-1.5 text-xs sm:text-sm">
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    <span className="hidden xs:inline">Filters</span>
                    {activeFiltersCount > 0 && (
                      <Badge variant="secondary" className="ml-0.5 h-4 w-4 sm:h-5 sm:w-5 p-0 flex items-center justify-center text-[10px]">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 sm:w-80">
                  <SheetHeader>
                    <SheetTitle>Farm Filters</SheetTitle>
                    <SheetDescription>Narrow down farms by type and certification</SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    <div className="flex items-center gap-3">
                      <Checkbox id="organic-mobile" checked={organicOnly} onCheckedChange={(c) => setOrganicOnly(c === true)} />
                      <Label htmlFor="organic-mobile" className="flex items-center gap-2 cursor-pointer">
                        <Leaf className="h-4 w-4 text-accent" /> Organic Certified
                      </Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <Checkbox id="delivery-mobile" checked={deliveryOnly} onCheckedChange={(c) => setDeliveryOnly(c === true)} />
                      <Label htmlFor="delivery-mobile" className="flex items-center gap-2 cursor-pointer">
                        <Truck className="h-4 w-4 text-primary" /> Delivery Available
                      </Label>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Farm Type</Label>
                      <div className="space-y-1">
                        <button
                          onClick={() => setSelectedFarmType("all")}
                          className={cn("w-full text-left text-sm px-3 py-2 rounded-lg transition-colors",
                            selectedFarmType === "all" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted/50"
                          )}
                        >
                          All Types
                        </button>
                        {farmTypes.map(type => (
                          <button
                            key={type}
                            onClick={() => setSelectedFarmType(type)}
                            className={cn("w-full text-left text-sm px-3 py-2 rounded-lg transition-colors",
                              selectedFarmType === type ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted/50"
                            )}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Button variant="outline" onClick={clearFilters} className="w-full">Clear All Filters</Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          <div className="flex gap-4 lg:gap-6">
            {/* Desktop sidebar filters */}
            <aside className="hidden lg:block w-56 xl:w-64 flex-shrink-0">
              <div className="sticky top-24 space-y-4">
                <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display font-semibold text-sm">Filters</h3>
                    {activeFiltersCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs px-2">Clear</Button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pb-3 border-b border-border">
                    <Checkbox id="organic-desktop" checked={organicOnly} onCheckedChange={(c) => setOrganicOnly(c === true)} className="h-4 w-4" />
                    <Label htmlFor="organic-desktop" className="flex items-center gap-1.5 cursor-pointer text-sm">
                      <Leaf className="h-3.5 w-3.5 text-accent" /> Organic
                    </Label>
                  </div>

                  <div className="flex items-center gap-2 py-3 border-b border-border">
                    <Checkbox id="delivery-desktop" checked={deliveryOnly} onCheckedChange={(c) => setDeliveryOnly(c === true)} className="h-4 w-4" />
                    <Label htmlFor="delivery-desktop" className="flex items-center gap-1.5 cursor-pointer text-sm">
                      <Truck className="h-3.5 w-3.5 text-primary" /> Delivery
                    </Label>
                  </div>
                </div>

                {/* Farm type quick-links */}
                <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
                  <h3 className="font-display font-semibold text-sm mb-3">Farm Type</h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => setSelectedFarmType("all")}
                      className={cn("w-full text-left text-sm px-3 py-2 rounded-lg transition-colors",
                        selectedFarmType === "all" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      All Farms
                    </button>
                    {farmTypes.map(type => (
                      <button
                        key={type}
                        onClick={() => setSelectedFarmType(type)}
                        className={cn("w-full text-left text-sm px-3 py-2 rounded-lg transition-colors",
                          selectedFarmType === type ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Main content area */}
            <div className="flex-1 min-w-0">
              {/* Results count */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {filteredFarms.length} of {farms.length} farms {location ? "• Sorted by distance" : ""}
                </p>
                {activeFiltersCount > 0 && (
                  <div className="flex gap-1.5">
                    {organicOnly && (
                      <Badge variant="secondary" className="gap-1 text-xs px-2 py-0.5">
                        <Leaf className="h-2.5 w-2.5 text-accent" /> Organic
                      </Badge>
                    )}
                    {deliveryOnly && (
                      <Badge variant="secondary" className="gap-1 text-xs px-2 py-0.5">
                        <Truck className="h-2.5 w-2.5" /> Delivery
                      </Badge>
                    )}
                    {selectedFarmType !== "all" && (
                      <Badge variant="secondary" className="gap-1 text-xs px-2 py-0.5">
                        {selectedFarmType}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {view === "map" && (
                <div className="space-y-6">
                  {/* Map */}
                  <div className="h-[280px] sm:h-[350px] lg:h-[400px] rounded-2xl overflow-hidden border border-border shadow-sm">
                    <FarmMap
                      farms={filteredFarms}
                      userLocation={location || undefined}
                      onFarmSelect={handleFarmSelect}
                      selectedFarm={selectedFarm}
                      showRoute={true}
                    />
                  </div>

                  {/* Farm cards below map */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredFarms.map((farm, index) => (
                      <motion.div
                        key={farm.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: Math.min(index, 9) * 0.05, ease: cubicSmooth }}
                      >
                        <DetailedFarmCard
                          farm={farm}
                          isSelected={selectedFarm?.id === farm.id}
                          onSelect={handleFarmSelect}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {view === "list" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredFarms.map((farm, index) => (
                      <motion.div
                        key={farm.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: Math.min(index, 9) * 0.05, ease: cubicSmooth }}
                      >
                        <DetailedFarmCard farm={farm} onSelect={handleFarmSelect} />
                      </motion.div>
                    ))}
                  </div>

                  {filteredFarms.length === 0 && (
                    <div className="text-center py-16">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary mb-4">
                        <Search className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-display font-semibold mb-2">No farms found</h3>
                      <p className="text-sm text-muted-foreground mb-4">Try adjusting your search or filters</p>
                      <Button onClick={clearFilters} variant="outline" size="sm" className="rounded-xl">Clear Filters</Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MapPage;
