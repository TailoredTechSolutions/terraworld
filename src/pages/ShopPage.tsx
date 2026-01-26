import { useState, useMemo } from "react";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import CategoryFilter from "@/components/CategoryFilter";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import { products } from "@/data/products";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  SlidersHorizontal, 
  Grid3X3, 
  LayoutGrid,
  Leaf,
  ArrowUpDown
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type SortOption = "name-asc" | "name-desc" | "price-asc" | "price-desc" | "farm";
type GridSize = "small" | "large";

const ShopPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const [organicOnly, setOrganicOnly] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [gridSize, setGridSize] = useState<GridSize>("large");
  const [selectedFarms, setSelectedFarms] = useState<string[]>([]);

  const farms = useMemo(() => {
    const uniqueFarms = [...new Set(products.map(p => p.farmName))];
    return uniqueFarms.sort();
  }, []);

  const maxPrice = useMemo(() => {
    return Math.ceil(Math.max(...products.map(p => p.price)) / 100) * 100;
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== "all") {
      result = result.filter(p => 
        p.category.toLowerCase().replace(/\s+&\s+/g, "-").includes(selectedCategory)
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.farmName.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    if (organicOnly) {
      result = result.filter(p => p.organic);
    }

    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    if (selectedFarms.length > 0) {
      result = result.filter(p => selectedFarms.includes(p.farmName));
    }

    switch (sortBy) {
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "farm":
        result.sort((a, b) => a.farmName.localeCompare(b.farmName));
        break;
    }

    return result;
  }, [selectedCategory, searchQuery, sortBy, organicOnly, priceRange, selectedFarms]);

  const toggleFarm = (farm: string) => {
    setSelectedFarms(prev => 
      prev.includes(farm) 
        ? prev.filter(f => f !== farm)
        : [...prev, farm]
    );
  };

  const clearFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setSortBy("name-asc");
    setOrganicOnly(false);
    setPriceRange([0, maxPrice]);
    setSelectedFarms([]);
  };

  const activeFiltersCount = [
    selectedCategory !== "all",
    organicOnly,
    priceRange[0] > 0 || priceRange[1] < maxPrice,
    selectedFarms.length > 0,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartDrawer />

      <main className="py-4 sm:py-8">
        <div className="container px-3 sm:px-4 lg:px-8">
          <div className="mb-4 sm:mb-8">
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1 sm:mb-2">
              Shop Fresh Produce
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Browse {products.length} products from local highland farms
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 sm:h-11 rounded-xl text-sm"
              />
            </div>

            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-28 sm:w-36 h-10 sm:h-11 rounded-xl text-xs sm:text-sm">
                  <ArrowUpDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="name-asc">Name: A-Z</SelectItem>
                  <SelectItem value="name-desc">Name: Z-A</SelectItem>
                  <SelectItem value="price-asc">Price: Low</SelectItem>
                  <SelectItem value="price-desc">Price: High</SelectItem>
                  <SelectItem value="farm">Farm</SelectItem>
                </SelectContent>
              </Select>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden h-10 sm:h-11 px-3 rounded-xl gap-1.5 text-xs sm:text-sm">
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
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>
                      Narrow down your product search
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="organic-mobile"
                        checked={organicOnly}
                        onCheckedChange={(checked) => setOrganicOnly(checked === true)}
                      />
                      <Label htmlFor="organic-mobile" className="flex items-center gap-2 cursor-pointer">
                        <Leaf className="h-4 w-4 text-accent" />
                        Organic Only
                      </Label>
                    </div>

                    <div className="space-y-3">
                      <Label>Price Range: ₱{priceRange[0]} - ₱{priceRange[1]}</Label>
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        max={maxPrice}
                        step={10}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>Farms</Label>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {farms.map((farm) => (
                          <div key={farm} className="flex items-center gap-2">
                            <Checkbox
                              id={`farm-mobile-${farm}`}
                              checked={selectedFarms.includes(farm)}
                              onCheckedChange={() => toggleFarm(farm)}
                            />
                            <Label htmlFor={`farm-mobile-${farm}`} className="text-sm cursor-pointer">
                              {farm}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button variant="outline" onClick={clearFilters} className="w-full">
                      Clear All Filters
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>

              <div className="hidden md:flex items-center gap-1 border rounded-xl p-1">
                <Button
                  variant={gridSize === "large" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setGridSize("large")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={gridSize === "small" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setGridSize("small")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex gap-4 lg:gap-6">
            <aside className="hidden lg:block w-56 xl:w-64 flex-shrink-0">
              <div className="sticky top-24 space-y-4">
                <div className="p-3 sm:p-4 rounded-xl bg-card border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm">Filters</h3>
                    {activeFiltersCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs px-2">
                        Clear
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pb-3 border-b border-border">
                    <Checkbox
                      id="organic-desktop"
                      checked={organicOnly}
                      onCheckedChange={(checked) => setOrganicOnly(checked === true)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="organic-desktop" className="flex items-center gap-1.5 cursor-pointer text-sm">
                      <Leaf className="h-3.5 w-3.5 text-accent" />
                      Organic Only
                    </Label>
                  </div>

                  <div className="py-3 border-b border-border space-y-2">
                    <Label className="text-xs font-medium">
                      Price: ₱{priceRange[0]} - ₱{priceRange[1]}
                    </Label>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={maxPrice}
                      step={10}
                      className="w-full"
                    />
                  </div>

                  <div className="pt-3 space-y-2">
                    <Label className="text-xs font-medium">Farms</Label>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {farms.map((farm) => (
                        <div key={farm} className="flex items-center gap-2">
                          <Checkbox
                            id={`farm-desktop-${farm}`}
                            checked={selectedFarms.includes(farm)}
                            onCheckedChange={() => toggleFarm(farm)}
                            className="h-3.5 w-3.5"
                          />
                          <Label 
                            htmlFor={`farm-desktop-${farm}`} 
                            className="text-xs cursor-pointer truncate"
                            title={farm}
                          >
                            {farm}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            <div className="flex-1 min-w-0">
              <div className="mb-3 sm:mb-4">
                <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={cn(
                      "flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-all",
                      selectedCategory === "all"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    )}
                  >
                    All
                  </button>
                  <CategoryFilter
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {filteredProducts.length} of {products.length} products
                </p>
                {activeFiltersCount > 0 && (
                  <div className="flex gap-1.5">
                    {organicOnly && (
                      <Badge variant="secondary" className="gap-1 text-xs px-2 py-0.5">
                        <Leaf className="h-2.5 w-2.5 text-accent" />
                        <span className="hidden sm:inline">Organic</span>
                      </Badge>
                    )}
                    {selectedFarms.length > 0 && (
                      <Badge variant="secondary" className="text-xs px-2 py-0.5">
                        {selectedFarms.length} farm{selectedFarms.length > 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <div className={cn(
                "grid gap-3 sm:gap-4",
                gridSize === "large" 
                  ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                  : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
              )}>
                {filteredProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${Math.min(index, 12) * 30}ms` }}
                  >
                    <ProductCard product={product} compact={gridSize === "small"} />
                  </div>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-10 sm:py-16">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-secondary mb-3 sm:mb-4">
                    <Search className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2">No products found</h3>
                  <p className="text-sm text-muted-foreground mb-3 sm:mb-4">
                    Try adjusting your filters
                  </p>
                  <Button onClick={clearFilters} variant="outline" size="sm">
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ShopPage;
