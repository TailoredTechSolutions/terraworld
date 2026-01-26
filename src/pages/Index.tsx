import { useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ProductCard from "@/components/ProductCard";
import FarmCard from "@/components/FarmCard";
import CategoryFilter from "@/components/CategoryFilter";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import { products, farms } from "@/data/products";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState("vegetables");

  const filteredProducts = products.filter(p => 
    p.category.toLowerCase().replace(/\s+&\s+/g, "-").includes(selectedCategory)
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartDrawer />

      <main>
        {/* Hero */}
        <HeroSection />

        {/* Products Section */}
        <section className="py-16 bg-grain">
          <div className="container">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
              <div>
                <h2 className="font-display text-3xl font-bold text-foreground">
                  Fresh from the Farm
                </h2>
                <p className="text-muted-foreground mt-1">
                  Hand-picked organic produce from local farmers
                </p>
              </div>
            </div>

            {/* Category Filter */}
            <div className="mb-8">
              <CategoryFilter
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No products found in this category.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Featured Farms Section */}
        <section className="py-16 bg-secondary">
          <div className="container">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
              <div>
                <h2 className="font-display text-3xl font-bold text-foreground">
                  Nearby Farms
                </h2>
                <p className="text-muted-foreground mt-1">
                  Discover farms in your area and shop directly
                </p>
              </div>
              <Link to="/map">
                <Button variant="outline" className="rounded-xl gap-2">
                  View All Farms
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {farms.map((farm, index) => (
                <div
                  key={farm.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <FarmCard farm={farm} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary">
          <div className="container text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Are You a Farmer?
            </h2>
            <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-8">
              Join FarmDirect and reach thousands of customers directly. No middlemen, fair prices, and a community that cares about local agriculture.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                className="btn-accent-gradient h-12 px-8 rounded-xl text-base font-semibold"
              >
                Start Selling
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 rounded-xl text-base font-semibold border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              >
                Learn More
              </Button>
            </div>
          </div>
        </section>

        {/* Affiliate Banner */}
        <section className="py-16 bg-gradient-to-r from-accent/10 via-accent/5 to-transparent">
          <div className="container">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-8 rounded-2xl bg-card border border-border">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-3">
                  Affiliate Program
                </span>
                <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                  Earn While You Share
                </h3>
                <p className="text-muted-foreground max-w-lg">
                  Refer friends and earn 5% commission on every order. Build passive income while supporting local farmers.
                </p>
              </div>
              <Link to="/affiliate">
                <Button className="btn-accent-gradient h-12 px-8 rounded-xl text-base font-semibold whitespace-nowrap">
                  Join Affiliate Program
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
