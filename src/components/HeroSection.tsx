import { motion } from "framer-motion";
import heroHarvest from "@/assets/hero-harvest-sunrise.jpg";
import terraLogo from "@/assets/terra-logo.png";
import { Button } from "@/components/ui/button";
import {
  Truck,
  Leaf,
  ArrowRight,
  Shield,
  Clock,
  BadgeCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

const trustBadges = [
  { icon: Leaf, title: "100% Organic", subtitle: "Certified local farms" },
  { icon: Truck, title: "Same-Day Delivery", subtitle: "Farm to door in hours" },
  { icon: Shield, title: "Quality Guaranteed", subtitle: "Freshness or refund" },
  { icon: Clock, title: "Real-Time Tracking", subtitle: "Know where your food is" },
];

const stats = [
  { value: "50+", label: "Partner Farms" },
  { value: "1K+", label: "Happy Customers" },
  { value: "24hr", label: "Delivery Time" },
];

const cubicSmooth = [0.22, 1, 0.36, 1];

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden min-h-[92vh] flex items-center">
      {/* Cinematic background image */}
      <div className="absolute inset-0">
        <motion.img
          src={heroHarvest}
          alt="Filipino farmers harvesting at sunrise in Benguet highlands"
          className="h-full w-full object-cover"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 8, ease: "easeOut" }}
        />
        {/* Multi-layer gradient overlays for depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/30" />
        {/* Warm golden accent from right */}
        <div className="absolute inset-0 bg-gradient-to-l from-terra-gold/10 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative container py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-xl">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: cubicSmooth }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 border border-primary/25 backdrop-blur-sm mb-6"
            >
              <Leaf className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Philippines' Farm-to-Table Platform</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: cubicSmooth }}
              className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.08] mb-5"
            >
              From Dirt
              <br />
              <span className="text-transparent bg-clip-text" style={{
                backgroundImage: "linear-gradient(135deg, hsl(var(--terra-terracotta)), hsl(var(--terra-gold)))"
              }}>
                to Dessert
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: cubicSmooth }}
              className="text-xl md:text-2xl text-muted-foreground font-display italic mb-4"
            >
              Farm-fresh goodness, delivered to your table
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: cubicSmooth }}
              className="text-base md:text-lg text-muted-foreground/90 mb-8 max-w-lg leading-relaxed"
            >
              The Philippines' first farm-to-table marketplace connecting you
              directly with highland farmers. Shop organic, support local Benguet
              farmers, and enjoy fresh produce delivered to your door.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4, ease: cubicSmooth }}
              className="flex flex-wrap gap-4 mb-10"
            >
              <Link to="/shop">
                <Button size="lg" className="btn-liquid h-14 px-8 text-lg font-semibold gap-2">
                  Explore Marketplace
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/map">
                <Button size="lg" variant="liquid-outline" className="h-14 px-8 text-lg font-semibold gap-2">
                  Find Farms
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5, ease: cubicSmooth }}
              className="flex flex-wrap gap-5"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                  className="text-center"
                >
                  <p className="text-2xl md:text-3xl font-bold text-primary font-display">
                    {stat.value}
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right Column — Trust Badges */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: cubicSmooth }}
            className="hidden lg:grid grid-cols-2 gap-3"
          >
            {trustBadges.map((badge, index) => (
              <motion.div
                key={badge.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.03, y: -3 }}
                className="p-4 glass-card glass-hover"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 border border-primary/25">
                    <badge.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground mb-0.5">
                      {badge.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{badge.subtitle}</p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Freshness Guarantee */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="col-span-2 p-4 glass-card border-terra-gold/30"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-terra-gold/15 border border-terra-gold/25">
                  <Leaf className="h-5 w-5 text-terra-gold" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-foreground mb-0.5">
                    Freshness Guaranteed
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Harvested today, delivered to your door. 100% satisfaction or your money back.
                  </p>
                </div>
                <Link to="/shop">
                  <Button size="sm" className="btn-liquid text-xs py-1.5 px-3 h-auto rounded-lg gap-1">
                    Shop Now <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Verification */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="col-span-2 flex items-center justify-center gap-4 py-3"
            >
              {["DA Registered", "SEC Compliant", "KYC Verified"].map((label, i) => (
                <div key={label} className="flex items-center gap-1.5 text-muted-foreground">
                  {i > 0 && <div className="h-3 w-px bg-border mr-2.5" />}
                  <BadgeCheck className="h-4 w-4 text-primary" />
                  <span className="text-xs">{label}</span>
                </div>
              ))}
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
          {trustBadges.map((badge) => (
            <div key={badge.title} className="flex items-center gap-3 p-3 glass-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
                <badge.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{badge.title}</p>
                <p className="text-xs text-muted-foreground">{badge.subtitle}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
