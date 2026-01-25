import heroImage from "@/assets/hero-farm.jpg";
import terraLogo from "@/assets/terra-logo.png";
import { Button } from "@/components/ui/button";
import { MapPin, Truck, Leaf, ArrowRight, Sprout } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-grain min-h-[90vh] flex items-center">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Farm at sunrise"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 right-10 opacity-20 hidden lg:block">
        <Sprout className="h-32 w-32 text-accent" />
      </div>

      {/* Content */}
      <div className="relative container py-20 md:py-32">
        <div className="max-w-2xl">
          {/* Logo badge */}
          <div className="inline-flex items-center gap-3 rounded-full border border-accent/30 bg-background/10 px-4 py-2 backdrop-blur-md mb-8 animate-fade-in">
            <img src={terraLogo} alt="Terra" className="h-8 w-8" />
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              <span className="text-sm font-medium text-primary-foreground">
                Fresh harvest available now
              </span>
            </div>
          </div>

          {/* Main headline with tagline */}
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground leading-[1.1] mb-4 animate-slide-up">
            From Dirt
            <br />
            <span className="text-accent">to Dessert</span>
          </h1>

          <p className="text-xl md:text-2xl text-secondary font-display italic mb-6 animate-slide-up delay-75">
            Farm-fresh goodness, delivered to your table
          </p>

          <p className="text-lg text-primary-foreground/80 mb-10 max-w-lg animate-slide-up delay-100">
            Connect directly with local farmers for the freshest organic produce. 
            Skip the middleman, support sustainable agriculture, and taste the difference.
          </p>

          <div className="flex flex-wrap gap-4 mb-14 animate-slide-up delay-200">
            <Link to="/#products">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground h-14 px-8 rounded-xl text-lg font-semibold gap-2 shadow-lg shadow-accent/30 transition-all hover:shadow-xl hover:shadow-accent/40 hover:-translate-y-0.5"
              >
                Shop Fresh Produce
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/map">
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 rounded-xl text-lg font-semibold border-2 border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 hover:border-primary-foreground/60 gap-2 transition-all"
              >
                <MapPin className="h-5 w-5" />
                Find Nearby Farms
              </Button>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-8 animate-slide-up delay-300">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 backdrop-blur-sm border border-accent/30">
                <Truck className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm font-semibold text-primary-foreground">Same-Day Delivery</p>
                <p className="text-xs text-primary-foreground/70">Fresh to your door</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 backdrop-blur-sm border border-accent/30">
                <Leaf className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm font-semibold text-primary-foreground">100% Organic</p>
                <p className="text-xs text-primary-foreground/70">Certified local farms</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
