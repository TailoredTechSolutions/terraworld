import heroImage from "@/assets/hero-farm.jpg";
import { Button } from "@/components/ui/button";
import { MapPin, Truck, Shield, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-grain">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Farm at sunrise"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative container py-20 md:py-32">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-4 py-1.5 backdrop-blur-sm mb-6 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            <span className="text-sm font-medium text-primary-foreground">
              Fresh harvest available now
            </span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-6 animate-slide-up">
            Farm Fresh,
            <br />
            <span className="text-terracotta-light">Delivered Direct</span>
          </h1>

          <p className="text-lg text-primary-foreground/80 mb-8 max-w-lg animate-slide-up delay-100">
            Connect with local farmers and get the freshest organic produce delivered to your door. Skip the middleman, support local agriculture.
          </p>

          <div className="flex flex-wrap gap-4 mb-12 animate-slide-up delay-200">
            <Button
              size="lg"
              className="btn-accent-gradient h-12 px-6 rounded-xl text-base font-semibold gap-2"
            >
              Shop Now
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Link to="/map">
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-6 rounded-xl text-base font-semibold border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 gap-2"
              >
                <MapPin className="h-4 w-4" />
                Find Nearby Farms
              </Button>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-6 animate-slide-up delay-300">
            <div className="flex items-center gap-2 text-primary-foreground/80">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10 backdrop-blur-sm">
                <Truck className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-primary-foreground">Fast Delivery</p>
                <p className="text-xs text-primary-foreground/70">Same-day available</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-primary-foreground/80">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10 backdrop-blur-sm">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-primary-foreground">100% Organic</p>
                <p className="text-xs text-primary-foreground/70">Certified farms only</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
