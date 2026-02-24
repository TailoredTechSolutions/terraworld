import { useState } from "react";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import FarmCard from "@/components/FarmCard";
import FarmMap from "@/components/maps/FarmMap";
import DeliveryTracker from "@/components/maps/DeliveryTracker";
import { farms, Farm } from "@/data/products";
import { useUserLocation, calculateDistance, calculateDeliveryFee, calculateETA } from "@/hooks/useUserLocation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Filter, List, Map as MapIcon, Navigation, Clock, Truck, AlertCircle, Star } from "lucide-react";

const MapPage = () => {
  const [view, setView] = useState<"list" | "map">("map");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [showTracker, setShowTracker] = useState(false);
  
  const { location, error: locationError, loading: locationLoading, requestLocation } = useUserLocation();

  // Calculate distances and sort farms
  const farmsWithDistance = farms.map(farm => {
    if (location) {
      const distance = calculateDistance(
        location.lat,
        location.lng,
        farm.latitude,
        farm.longitude
      );
      return { ...farm, distance: Math.round(distance * 10) / 10 };
    }
    return farm;
  }).sort((a, b) => (a.distance || 0) - (b.distance || 0));

  const filteredFarms = farmsWithDistance.filter(
    (farm) =>
      farm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farm.products.some((p) =>
        p.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const handleFarmSelect = (farm: Farm) => {
    setSelectedFarm(farm);
  };

  const getDeliveryInfo = (farm: Farm) => {
    const distance = farm.distance || 5;
    const fee = calculateDeliveryFee(distance);
    const eta = calculateETA(distance);
    return { fee, eta };
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartDrawer />

      <main className="container py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Find Farms Near You
          </h1>
          <p className="text-muted-foreground">
            Discover local farms and shop directly from producers in your area
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search farms or products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 rounded-xl border-border bg-secondary"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="h-12 rounded-xl border-border gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <div className="flex rounded-xl border border-border overflow-hidden">
              <Button
                variant={view === "list" ? "secondary" : "ghost"}
                size="icon"
                className="h-12 w-12 rounded-none"
                onClick={() => setView("list")}
              >
                <List className="h-5 w-5" />
              </Button>
              <Button
                variant={view === "map" ? "secondary" : "ghost"}
                size="icon"
                className="h-12 w-12 rounded-none"
                onClick={() => setView("map")}
              >
                <MapIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Location Status Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-xl bg-secondary mb-8">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary shrink-0">
              {locationLoading ? (
                <div className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <MapPin className="h-5 w-5 text-primary-foreground" />
              )}
            </div>
            <div className="min-w-0">
              {locationError ? (
                <>
                  <p className="font-medium text-foreground flex items-center gap-2 text-sm sm:text-base">
                    <AlertCircle className="h-4 w-4 text-yellow-500 shrink-0" />
                    <span className="truncate">Using default location (Manila)</span>
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{locationError}</p>
                </>
              ) : (
                <>
                  <p className="font-medium text-foreground text-sm sm:text-base">
                    {location ? "Showing farms near you" : "Getting your location..."}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : "Please wait..."}
                  </p>
                </>
              )}
            </div>
          </div>
          <Button variant="outline" className="rounded-xl w-full sm:w-auto shrink-0" onClick={requestLocation}>
            <Navigation className="h-4 w-4 mr-2" />
            Update Location
          </Button>
        </div>

        {/* Demo Tracker Toggle */}
        <div className="flex justify-end mb-4">
          <Button 
            variant="outline" 
            size="sm"
            className="rounded-xl"
            onClick={() => setShowTracker(!showTracker)}
          >
            <Truck className="h-4 w-4 mr-2" />
            {showTracker ? "Hide" : "Show"} Demo Tracker
          </Button>
        </div>

        {/* Delivery Tracker Demo */}
        {showTracker && (
          <div className="mb-8">
            <DeliveryTracker orderId="FD-DEMO123" estimatedMinutes={45} />
          </div>
        )}

        {view === "map" ? (
          <div className="space-y-6">
            {/* Map - compact height */}
            <div className="h-[280px] sm:h-[350px] lg:h-[400px] rounded-2xl overflow-hidden border border-border">
              <FarmMap
                farms={filteredFarms}
                userLocation={location || undefined}
                onFarmSelect={handleFarmSelect}
                selectedFarm={selectedFarm}
                showRoute={true}
              />
            </div>

            {/* Farm Cards - prominent and large */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-display font-semibold text-foreground">
                  {filteredFarms.length} Farms Found
                </h2>
                <span className="text-sm text-muted-foreground">
                  Sorted by distance
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredFarms.map((farm) => {
                  const { fee, eta } = getDeliveryInfo(farm);
                  return (
                    <div
                      key={farm.id}
                      className={`rounded-2xl border-2 transition-all cursor-pointer overflow-hidden ${
                        selectedFarm?.id === farm.id
                          ? "border-primary bg-primary/5 shadow-lg"
                          : "border-border hover:border-primary/50 hover:shadow-md"
                      }`}
                      onClick={() => setSelectedFarm(farm)}
                    >
                      <img
                        src={farm.image}
                        alt={farm.name}
                        className="w-full h-36 sm:h-40 object-cover"
                      />
                      <div className="p-4">
                        <h4 className="font-display font-semibold text-foreground text-lg truncate">
                          {farm.name}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {farm.distance} km away
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-primary" />
                            {eta.min}-{eta.max} min
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Truck className="h-4 w-4 text-primary" />
                            ₱{fee}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-medium text-foreground">{farm.rating}</span>
                          <span className="text-xs text-muted-foreground ml-1">• {farm.products.length} products</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Farm Stats */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm text-muted-foreground">
                {filteredFarms.length} farms found
              </span>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">
                Sorted by distance
              </span>
            </div>

            {/* Farms Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredFarms.map((farm, index) => (
                <div
                  key={farm.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <FarmCard farm={farm} />
                </div>
              ))}
            </div>

            {filteredFarms.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No farms found matching your search.
                </p>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MapPage;
