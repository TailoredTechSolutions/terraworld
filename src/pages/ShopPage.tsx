import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import AggregatedProductCard from "@/components/AggregatedProductCard";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import { useAggregatedProducts } from "@/hooks/useAggregatedProducts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  SlidersHorizontal, 
  Grid3X3, 
  LayoutGrid,
  Leaf,
  ArrowUpDown,
  Store,
  Sprout,
  MapPin,
  Truck
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

// Hero + category images
import shopHero from "@/assets/shop-hero.jpg";
import categoryVegetables from "@/assets/category-vegetables.jpg";
import categoryFruits from "@/assets/category-fruits.jpg";
import categoryDairy from "@/assets/category-dairy.jpg";
import categoryPantry from "@/assets/category-pantry.jpg";

type SortOption = "name-asc" | "name-desc" | "price-asc" | "price-desc" | "farms";
type GridSize = "small" | "large";

const categoryCards = [
  { id: "vegetables", name: "Vegetables", image: categoryVegetables, description: "Highland greens & root crops" },
  { id: "fruits", name: "Fruits", image: categoryFruits, description: "Tropical & seasonal picks" },
  { id: "dairy", name: "Dairy & Eggs", image: categoryDairy, description: "Farm-fresh dairy products" },
  { id: "pantry", name: "Pantry", image: categoryPantry, description: "Artisanal preserves & staples" },
];

const cubicSmooth = [0.22, 1, 0.36, 1] as const;

const ShopPage = () => {
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const [organicOnly, setOrganicOnly] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [gridSize, setGridSize] = useState<GridSize>("large");
  const [multiFarmOnly, setMultiFarmOnly] = useState(false);

  const { data: aggregatedProducts, isLoading } = useAggregatedProducts();

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  const maxPrice = useMemo(() => {
    if (!aggregatedProducts?.length) return 1000;
    return Math.ceil(Math.max(...aggregatedProducts.map(p => p.highestPrice)) / 100) * 100;
  }, [aggregatedProducts]);

  const filteredProducts = useMemo(() => {
    let result = aggregatedProducts ? [...aggregatedProducts] : [];

    if (selectedCategory !== "all") {
      result = result.filter(p => 
        p.category.toLowerCase().replace(/\s+&\s+/g, "-").includes(selectedCategory)
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) ||
        (p.description?.toLowerCase().includes(query)) ||
        p.offers.some(o => o.farmName.toLowerCase().includes(query))
      );
    }

    if (organicOnly) {
      result = result.filter(p => p.hasOrganic);
    }

    if (multiFarmOnly) {
      result = result.filter(p => p.farmCount > 1);
    }

    result = result.filter(p => p.lowestPrice >= priceRange[0] && p.lowestPrice <= priceRange[1]);

    switch (sortBy) {
      case "name-asc": result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "name-desc": result.sort((a, b) => b.name.localeCompare(a.name)); break;
      case "price-asc": result.sort((a, b) => a.lowestPrice - b.lowestPrice); break;
      case "price-desc": result.sort((a, b) => b.lowestPrice - a.lowestPrice); break;
      case "farms": result.sort((a, b) => b.farmCount - a.farmCount); break;
    }

    return result;
  }, [aggregatedProducts, selectedCategory, searchQuery, sortBy, organicOnly, priceRange, multiFarmOnly]);

  const clearFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setSortBy("name-asc");
    setOrganicOnly(false);
    setMultiFarmOnly(false);
    setPriceRange([0, maxPrice]);
  };

  const activeFiltersCount = [
    selectedCategory !== "all",
    organicOnly,
    multiFarmOnly,
    priceRange[0] > 0 || priceRange[1] < maxPrice,
  ].filter(Boolean).length;

  const totalProducts = aggregatedProducts?.length || 0;

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
            src={shopHero}
            alt="Farm marketplace at sunrise"
            className="h-full w-full object-cover"
          />
        </motion.div>
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-transparent" />

        <div className="relative container h-full flex flex-col justify-end pb-8 sm:pb-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: cubicSmooth }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 px-4 py-1.5 mb-4">
              <Sprout className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-primary">Farm-Direct Marketplace</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-2 max-w-2xl leading-tight">
              Freshly Harvested.<br className="hidden sm:block" /> Fairly Priced.
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-lg">
              Compare prices from highland farms, track delivery from field to door.
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
              { icon: Leaf, value: `${totalProducts}+`, label: "Products" },
              { icon: MapPin, value: "Multi", label: "Farm Sources" },
              { icon: Truck, value: "Direct", label: "Farm Delivery" },
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

      {/* ===== CATEGORY CARDS ===== */}
      <section className="container px-3 sm:px-4 lg:px-8 -mt-6 relative z-10 mb-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {categoryCards.map((cat, i) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <motion.button
                key={cat.id}
                onClick={() => setSelectedCategory(isSelected ? "all" : cat.id)}
                className={cn(
                  "group relative overflow-hidden rounded-2xl h-28 sm:h-32 text-left transition-all",
                  isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "hover:ring-1 hover:ring-primary/40"
                )}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 * i, ease: cubicSmooth }}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className={cn(
                  "absolute inset-0 transition-colors duration-300",
                  isSelected
                    ? "bg-primary/50"
                    : "bg-gradient-to-t from-black/70 via-black/30 to-transparent group-hover:from-black/80"
                )} />
                <div className="relative h-full flex flex-col justify-end p-3 sm:p-4">
                  <h3 className="font-display text-sm sm:text-base font-bold text-white leading-tight">
                    {cat.name}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-white/70 mt-0.5">{cat.description}</p>
                </div>
                {isSelected && (
                  <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* ===== MAIN SHOP CONTENT ===== */}
      <main className="pb-8 sm:pb-12">
        <div className="container px-3 sm:px-4 lg:px-8">
          {/* Search + sort toolbar */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products or farms..."
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
                  <SelectItem value="farms">Most Farms</SelectItem>
                </SelectContent>
              </Select>

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
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>Narrow down your product search</SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    <div className="flex items-center gap-3">
                      <Checkbox id="organic-mobile" checked={organicOnly} onCheckedChange={(c) => setOrganicOnly(c === true)} />
                      <Label htmlFor="organic-mobile" className="flex items-center gap-2 cursor-pointer">
                        <Leaf className="h-4 w-4 text-accent" /> Organic Only
                      </Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <Checkbox id="multifarm-mobile" checked={multiFarmOnly} onCheckedChange={(c) => setMultiFarmOnly(c === true)} />
                      <Label htmlFor="multifarm-mobile" className="flex items-center gap-2 cursor-pointer">
                        <Store className="h-4 w-4 text-primary" /> Multi-Farm Only
                      </Label>
                    </div>
                    <div className="space-y-3">
                      <Label>Price Range: ₱{priceRange[0]} - ₱{priceRange[1]}</Label>
                      <Slider value={priceRange} onValueChange={setPriceRange} max={maxPrice} step={10} className="w-full" />
                    </div>
                    <Button variant="outline" onClick={clearFilters} className="w-full">Clear All Filters</Button>
                  </div>
                </SheetContent>
              </Sheet>

              <div className="hidden md:flex items-center gap-1 border rounded-xl p-1">
                <Button variant={gridSize === "large" ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setGridSize("large")}>
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button variant={gridSize === "small" ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setGridSize("small")}>
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </div>
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
                      <Leaf className="h-3.5 w-3.5 text-accent" /> Organic Only
                    </Label>
                  </div>

                  <div className="flex items-center gap-2 py-3 border-b border-border">
                    <Checkbox id="multifarm-desktop" checked={multiFarmOnly} onCheckedChange={(c) => setMultiFarmOnly(c === true)} className="h-4 w-4" />
                    <Label htmlFor="multifarm-desktop" className="flex items-center gap-1.5 cursor-pointer text-sm">
                      <Store className="h-3.5 w-3.5 text-primary" /> Multi-Farm
                    </Label>
                  </div>

                  <div className="py-3 space-y-2">
                    <Label className="text-xs font-medium">Price: ₱{priceRange[0]} - ₱{priceRange[1]}</Label>
                    <Slider value={priceRange} onValueChange={setPriceRange} max={maxPrice} step={10} className="w-full" />
                  </div>
                </div>

                {/* Category quick-links in sidebar */}
                <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
                  <h3 className="font-display font-semibold text-sm mb-3">Categories</h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className={cn(
                        "w-full text-left text-sm px-3 py-2 rounded-lg transition-colors",
                        selectedCategory === "all" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      All Products
                    </button>
                    {categoryCards.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={cn(
                          "w-full text-left text-sm px-3 py-2 rounded-lg transition-colors",
                          selectedCategory === cat.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            <div className="flex-1 min-w-0">
              {/* Results count */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {isLoading ? "Loading farm products..." : `${filteredProducts.length} of ${totalProducts} products`}
                </p>
                {activeFiltersCount > 0 && (
                  <div className="flex gap-1.5">
                    {organicOnly && (
                      <Badge variant="secondary" className="gap-1 text-xs px-2 py-0.5">
                        <Leaf className="h-2.5 w-2.5 text-accent" />
                        <span className="hidden sm:inline">Organic</span>
                      </Badge>
                    )}
                    {multiFarmOnly && (
                      <Badge variant="secondary" className="gap-1 text-xs px-2 py-0.5">
                        <Store className="h-2.5 w-2.5" /> Multi-Farm
                      </Badge>
                    )}
                    {selectedCategory !== "all" && (
                      <Badge variant="secondary" className="gap-1 text-xs px-2 py-0.5 capitalize">
                        {selectedCategory}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Loading state */}
              {isLoading && (
                <div className={cn(
                  "grid gap-3 sm:gap-4",
                  gridSize === "large" ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                )}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden bg-card border border-border">
                      <Skeleton className="aspect-[4/3] w-full" />
                      <div className="p-3 space-y-2">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Product grid */}
              {!isLoading && (
                <div className={cn(
                  "grid gap-3 sm:gap-4",
                  gridSize === "large"
                    ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                )}>
                  {filteredProducts.map((product, index) => (
                    <motion.div
                      key={product.productId}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: Math.min(index, 12) * 0.04, ease: cubicSmooth }}
                    >
                      <AggregatedProductCard product={product} compact={gridSize === "small"} />
                    </motion.div>
                  ))}
                </div>
              )}

              {!isLoading && filteredProducts.length === 0 && (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-display font-semibold mb-2">No products found</h3>
                  <p className="text-sm text-muted-foreground mb-4">Try adjusting your filters or search terms</p>
                  <Button onClick={clearFilters} variant="outline" size="sm" className="rounded-xl">Clear Filters</Button>
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
