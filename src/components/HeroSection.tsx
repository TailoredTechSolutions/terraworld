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
      {/* Background Image with Overlay - Blue primary with red accent hints */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Farm at sunrise"
          className="h-full w-full object-cover"
        />
        {/* Blue to brown gradient with subtle red */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-brown-dark/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-brown-dark/80 via-transparent to-primary/30" />
      </div>

      {/* Floating glow orbs */}
      <div className="hero-glow-orb hero-glow-orb-primary w-96 h-96 -top-20 -left-20" style={{ animationDelay: '0s' }} />
      <div className="hero-glow-orb hero-glow-orb-accent w-64 h-64 top-1/3 right-10" style={{ animationDelay: '2s' }} />
      <div className="hero-glow-orb hero-glow-orb-gold w-80 h-80 bottom-10 left-1/4" style={{ animationDelay: '4s' }} />

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
            {/* Animated Video Badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="mb-8"
            >
              <div className="relative inline-flex items-center gap-4 glass-card-accent glass-shimmer p-3 pr-6">
                {/* Video Icon */}
                <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border-2 border-accent shadow-lg shadow-glow-accent">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  >
                    <source src="/videos/harvest-badge.mp4" type="video/mp4" />
                  </video>
                  {/* Pulsing ring */}
                  <motion.div
                    className="absolute inset-0 border-2 border-accent rounded-xl"
                    animate={{ scale: [1, 1.15, 1], opacity: [0.8, 0, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                
                {/* Text content */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
                    </span>
                    <span className="text-xs font-semibold text-accent uppercase tracking-wide">
                      Live Now
                    </span>
                  </div>
                  <span className="text-lg md:text-xl font-bold text-primary-foreground">
                    Fresh Harvest Available
                  </span>
                  <span className="text-sm text-primary-foreground/70">
                    Direct from Benguet highlands
                  </span>
                </div>
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

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap gap-4 mb-10"
            >
              <Link to="/shop">
                <Button
                  size="lg"
                  className="btn-liquid-accent h-14 px-8 text-lg font-semibold gap-2"
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
                  className="text-center glass-card glass-shimmer-subtle px-4 py-3"
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

          {/* Right Column - Trust Badges Grid (Smaller) */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="hidden lg:grid grid-cols-2 gap-3"
          >
            {trustBadges.map((badge, index) => (
              <motion.div
                key={badge.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.03, y: -3 }}
                className="p-3.5 glass-card glass-hover glass-shimmer-subtle"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/20 border border-accent/30 backdrop-blur-sm shadow-glow-accent">
                    <badge.icon className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-primary-foreground mb-0.5">
                      {badge.title}
                    </p>
                    <p className="text-xs text-primary-foreground/70">
                      {badge.subtitle}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Additional Feature Card (Smaller) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="col-span-2 p-3.5 glass-card-gold glass-shimmer-gold"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/30 border border-accent/40 backdrop-blur-sm shadow-glow-gold">
                  <Wallet className="h-5 w-5 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-primary-foreground mb-0.5">
                    Earn While You Shop
                  </p>
                  <p className="text-xs text-primary-foreground/70">
                    Join our affiliate program and earn commissions on every referral.
                  </p>
                </div>
                <Link to="/affiliate">
                  <Button size="sm" className="btn-liquid text-xs py-1.5 px-3 h-auto rounded-lg gap-1">
                    Learn More
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Verification Badge (Smaller) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="col-span-2 flex items-center justify-center gap-4 py-3"
            >
              <div className="flex items-center gap-1.5 text-primary-foreground/70">
                <BadgeCheck className="h-4 w-4 text-accent" />
                <span className="text-xs">DA Registered</span>
              </div>
              <div className="h-3 w-px bg-primary-foreground/30" />
              <div className="flex items-center gap-1.5 text-primary-foreground/70">
                <BadgeCheck className="h-4 w-4 text-accent" />
                <span className="text-xs">SEC Compliant</span>
              </div>
              <div className="h-3 w-px bg-primary-foreground/30" />
              <div className="flex items-center gap-1.5 text-primary-foreground/70">
                <BadgeCheck className="h-4 w-4 text-accent" />
                <span className="text-xs">KYC Verified</span>
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
              className="flex items-center gap-3 p-3 glass-card"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20 backdrop-blur-sm">
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
