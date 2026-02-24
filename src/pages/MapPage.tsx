import { useState } from "react";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import FarmCard from "@/components/FarmCard";
import DetailedFarmCard from "@/components/DetailedFarmCard";
import FarmMap from "@/components/maps/FarmMap";
import DeliveryTracker from "@/components/maps/DeliveryTracker";
import { farms, Farm, categories } from "@/data/products";
import { useUserLocation, calculateDistance } from "@/hooks/useUserLocation";
import CategoryFilter from "@/components/CategoryFilter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Filter, List, Map as MapIcon, Navigation, Truck, AlertCircle } from "lucide-react";

const MapPage = () => {
  const [view, setView] = useState<"list" | "map">("map");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [showTracker, setShowTracker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  
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

  const filteredFarms = farmsWithDistance.filter((farm) => {
    const matchesSearch =
      farm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farm.products.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (farm.municipality?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    
    const matchesCategory =
      selectedCategory === "all" ||
      (farm.categories && farm.categories.includes(selectedCategory));
    
    return matchesSearch && matchesCategory;
  });

  const handleFarmSelect = (farm: Farm) => {
    setSelectedFarm(farm);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartDrawer />

      <main className="container py-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Find Farms Near You
          </h1>
          <p className="text-muted-foreground">
            Discover {farms.length} verified farms across the Baguio-Benguet highlands
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search farms, products, or municipalities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 rounded-xl border-border bg-secondary"
              />
            </div>
            <div className="flex gap-2">
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

          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`flex items-center gap-1 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
                selectedCategory === "all"
                  ? "bg-primary text-primary-foreground shadow-glow-primary"
                  : "glass-badge hover:bg-glass/80 backdrop-blur-sm"
              }`}
            >
              All Farms
            </button>
            <CategoryFilter selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
          </div>
        </div>

        {/* Location Status Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-xl bg-secondary mb-6">
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
          <div className="mb-6">
            <DeliveryTracker orderId="FD-DEMO123" estimatedMinutes={45} />
          </div>
        )}

        {view === "map" ? (
          <div className="space-y-6">
            {/* Map */}
            <div className="h-[280px] sm:h-[350px] lg:h-[400px] rounded-2xl overflow-hidden border border-border">
              <FarmMap
                farms={filteredFarms}
                userLocation={location || undefined}
                onFarmSelect={handleFarmSelect}
                selectedFarm={selectedFarm}
                showRoute={true}
              />
            </div>

            {/* Detailed Farm Cards */}
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
                {filteredFarms.map((farm) => (
                  <DetailedFarmCard
                    key={farm.id}
                    farm={farm}
                    isSelected={selectedFarm?.id === farm.id}
                    onSelect={handleFarmSelect}
                  />
                ))}
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

            {/* Farms Grid - list view uses DetailedFarmCard too */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredFarms.map((farm, index) => (
                <div
                  key={farm.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <DetailedFarmCard farm={farm} onSelect={handleFarmSelect} />
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
