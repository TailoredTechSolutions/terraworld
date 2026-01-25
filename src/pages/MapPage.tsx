import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import FarmCard from "@/components/FarmCard";
import { farms } from "@/data/products";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Filter, List, Map as MapIcon } from "lucide-react";
import { useState } from "react";

const MapPage = () => {
  const [view, setView] = useState<"list" | "map">("list");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFarms = farms.filter(
    (farm) =>
      farm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farm.products.some((p) =>
        p.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

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

        {/* Location Banner */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
            <MapPin className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground">
              Showing farms near Manila, Philippines
            </p>
            <p className="text-sm text-muted-foreground">
              Based on your location
            </p>
          </div>
          <Button variant="outline" className="rounded-xl">
            Change Location
          </Button>
        </div>

        {view === "list" ? (
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
        ) : (
          /* Map View Placeholder */
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-secondary border border-border">
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
              <MapIcon className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                Interactive Map Coming Soon
              </h3>
              <p className="text-muted-foreground max-w-md">
                We're integrating Google Maps to show you exact farm locations with
                real-time routing and delivery estimates.
              </p>
              <Button className="mt-6 btn-primary-gradient rounded-xl">
                Enable Location Services
              </Button>
            </div>
            {/* Map Placeholder Pattern */}
            <div className="absolute inset-0 opacity-5">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                    <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MapPage;
