import { motion } from "framer-motion";
import heroImage from "@/assets/hero-farm.jpg";
import terraLogo from "@/assets/terra-logo.png";
import { Button } from "@/components/ui/button";
import { 
  Truck, 
  Leaf, 
  ArrowRight, 
  Sprout, 
  Shield, 
  Clock, 
  Users, 
  Wallet,
  BadgeCheck
} from "lucide-react";
import { Link } from "react-router-dom";

const trustBadges = [
  {
    icon: Leaf,
    title: "100% Organic",
    subtitle: "Certified local farms",
  },
  {
    icon: Truck,
    title: "Same-Day Delivery",
    subtitle: "Farm to door in hours",
  },
  {
    icon: Shield,
    title: "Quality Guaranteed",
    subtitle: "Freshness or refund",
  },
  {
    icon: Clock,
    title: "Real-Time Tracking",
    subtitle: "Know where your food is",
  },
];

const stats = [
  { value: "50+", label: "Partner Farms" },
  { value: "1K+", label: "Happy Customers" },
  { value: "24hr", label: "Delivery Time" },
  { value: "4.9★", label: "Avg Rating" },
];

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
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/75 to-primary/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-primary/20" />
      </div>

      {/* Decorative elements */}
      <motion.div 
        className="absolute top-20 right-10 opacity-20 hidden lg:block"
        animate={{ rotate: [0, 10, -10, 0], y: [0, -10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <Sprout className="h-32 w-32 text-accent" />
      </motion.div>

      {/* Content */}
      <div className="relative container py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Main Content */}
          <div>
            {/* Logo badge */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-3 rounded-full border border-accent/30 bg-background/10 px-4 py-2 backdrop-blur-md mb-6"
            >
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
            </motion.div>

            {/* Main headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-[1.1] mb-4"
            >
              From Dirt
              <br />
              <span className="text-accent">to Dessert</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl md:text-2xl text-secondary font-display italic mb-4"
            >
              Farm-fresh goodness, delivered to your table
            </motion.p>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-base md:text-lg text-primary-foreground/80 mb-8 max-w-lg"
            >
              The Philippines' first farm-to-table marketplace with integrated affiliate rewards. 
              Shop organic, earn commissions, and support local Benguet farmers directly.
            </motion.p>

            {/* CTA Button */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap gap-4 mb-10"
            >
              <Link to="/shop">
                <Button
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground h-14 px-8 rounded-xl text-lg font-semibold gap-2 shadow-lg shadow-accent/30 transition-all hover:shadow-xl hover:shadow-accent/40 hover:-translate-y-0.5"
                >
                  Explore Marketplace
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </motion.div>

            {/* Stats Row */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-wrap gap-6 md:gap-10"
            >
              {stats.map((stat, index) => (
                <motion.div 
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                  className="text-center"
                >
                  <p className="text-2xl md:text-3xl font-bold text-accent font-display">
                    {stat.value}
                  </p>
                  <p className="text-xs md:text-sm text-primary-foreground/70">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right Column - Trust Badges Grid */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="hidden lg:grid grid-cols-2 gap-4"
          >
            {trustBadges.map((badge, index) => (
              <motion.div
                key={badge.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="p-5 rounded-2xl bg-background/10 backdrop-blur-md border border-primary-foreground/20 hover:border-accent/50 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20 border border-accent/30">
                    <badge.icon className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-primary-foreground mb-1">
                      {badge.title}
                    </p>
                    <p className="text-sm text-primary-foreground/70">
                      {badge.subtitle}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Additional Feature Cards */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="col-span-2 p-5 rounded-2xl bg-gradient-to-r from-accent/20 to-accent/10 backdrop-blur-md border border-accent/30"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/30 border border-accent/40">
                  <Wallet className="h-7 w-7 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-primary-foreground mb-1">
                    Earn While You Shop
                  </p>
                  <p className="text-sm text-primary-foreground/70">
                    Join our affiliate program and earn commissions on every referral. 
                    Build passive income while supporting local farmers.
                  </p>
                </div>
                <Link to="/affiliate">
                  <Button size="sm" variant="secondary" className="rounded-xl gap-1.5">
                    Learn More
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Verification Badge */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="col-span-2 flex items-center justify-center gap-6 py-4"
            >
              <div className="flex items-center gap-2 text-primary-foreground/70">
                <BadgeCheck className="h-5 w-5 text-accent" />
                <span className="text-sm">DA Registered</span>
              </div>
              <div className="h-4 w-px bg-primary-foreground/30" />
              <div className="flex items-center gap-2 text-primary-foreground/70">
                <BadgeCheck className="h-5 w-5 text-accent" />
                <span className="text-sm">SEC Compliant</span>
              </div>
              <div className="h-4 w-px bg-primary-foreground/30" />
              <div className="flex items-center gap-2 text-primary-foreground/70">
                <BadgeCheck className="h-5 w-5 text-accent" />
                <span className="text-sm">KYC Verified</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Mobile Trust Badges */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="lg:hidden mt-10 grid grid-cols-2 gap-3"
        >
          {trustBadges.map((badge, index) => (
            <div
              key={badge.title}
              className="flex items-center gap-3 p-3 rounded-xl bg-background/10 backdrop-blur-sm border border-primary-foreground/20"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
                <badge.icon className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm font-semibold text-primary-foreground">{badge.title}</p>
                <p className="text-xs text-primary-foreground/70">{badge.subtitle}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
