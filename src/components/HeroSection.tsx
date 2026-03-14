import { motion } from "framer-motion";
import heroImage from "@/assets/hero-farm.jpg";
import terraLogo from "@/assets/terra-logo.png";
import terraHeroBadge from "@/assets/terra-hero-badge.png";
import { Button } from "@/components/ui/button";
import {
  Truck,
  Leaf,
  ArrowRight,
  Sprout,
  Shield,
  Clock,
  Wallet,
  BadgeCheck } from
"lucide-react";
import { Link } from "react-router-dom";

const trustBadges = [
{
  icon: Leaf,
  title: "100% Organic",
  subtitle: "Certified local farms"
},
{
  icon: Truck,
  title: "Same-Day Delivery",
  subtitle: "Farm to door in hours"
},
{
  icon: Shield,
  title: "Quality Guaranteed",
  subtitle: "Freshness or refund"
},
{
  icon: Clock,
  title: "Real-Time Tracking",
  subtitle: "Know where your food is"
}];


const stats = [
{ value: "50+", label: "Partner Farms" },
{ value: "1K+", label: "Happy Customers" },
{ value: "24hr", label: "Delivery Time" },
{ value: "4.9★", label: "Avg Rating" }];


const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-grain min-h-[90vh] flex items-center">
      {/* Sticky background wallpaper */}
      <div className="fixed inset-0 -z-10">
        <img
          src={terraHeroBadge}
          alt=""
          className="h-full w-full object-cover opacity-50"
        />
      </div>

      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-brown-dark/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-brown-dark/70 via-transparent to-primary/20" />
      </div>

      {/* Content */}
      <div className="relative container py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            {/* Main headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-[1.1] mb-4">

              From Dirt
              <br />
              <span className="text-accent">to Dessert</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl md:text-2xl text-secondary font-display italic mb-4">

              Farm-fresh goodness, delivered to your table
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-base md:text-lg text-primary-foreground/80 mb-8 max-w-lg">

              The Philippines' first farm-to-table marketplace connecting you directly with highland farmers. 
              Shop organic, support local Benguet farmers, and enjoy fresh produce delivered to your door.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap gap-4 mb-10">

              <Link to="/shop">
                <Button
                  size="lg"
                  className="btn-liquid-accent h-14 px-8 text-lg font-semibold gap-2">

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
              className="flex flex-wrap gap-6 md:gap-10">

              {stats.map((stat, index) =>
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                className="text-center glass-card glass-shimmer-subtle px-4 py-3">

                  <p className="text-2xl md:text-3xl font-bold text-accent font-display">
                    {stat.value}
                  </p>
                  <p className="text-xs md:text-sm text-primary-foreground/70">
                    {stat.label}
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Right Column - Trust Badges Grid (Smaller) */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="hidden lg:grid grid-cols-2 gap-3">

            {trustBadges.map((badge, index) =>
            <motion.div
              key={badge.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.03, y: -3 }}
              className="p-3.5 glass-card glass-hover glass-shimmer-subtle">

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
            )}

            {/* Additional Feature Card (Smaller) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="col-span-2 p-3.5 glass-card-gold glass-shimmer-gold">

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/30 border border-accent/40 backdrop-blur-sm shadow-glow-gold">
                  <Leaf className="h-5 w-5 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-primary-foreground mb-0.5">
                    Freshness Guaranteed
                  </p>
                  <p className="text-xs text-primary-foreground/70">
                    Harvested today, delivered to your door. 100% satisfaction or your money back.
                  </p>
                </div>
                <Link to="/shop">
                  <Button size="sm" className="btn-liquid text-xs py-1.5 px-3 h-auto rounded-lg gap-1">
                    Shop Now
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
              className="col-span-2 flex items-center justify-center gap-4 py-3">

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
          className="lg:hidden mt-10 grid grid-cols-2 gap-3">

          {trustBadges.map((badge, index) =>
          <div
            key={badge.title}
            className="flex items-center gap-3 p-3 glass-card">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20 backdrop-blur-sm">
                <badge.icon className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm font-semibold text-primary-foreground">{badge.title}</p>
                <p className="text-xs text-primary-foreground/70">{badge.subtitle}</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>);

};

export default HeroSection;