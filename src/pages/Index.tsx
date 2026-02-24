import { motion } from "framer-motion";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FarmCard from "@/components/FarmCard";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import { farms } from "@/data/products";
import { 
  ArrowRight, 
  Leaf, 
  Truck,
  Users, 
  Wallet, 
  MapPin, 
  ShieldCheck,
  TrendingUp,
  Handshake,
  type LucideIcon,
  Star,
  Quote
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  iconColor: string;
  delay: number;
}

const features: Feature[] = [
  {
    icon: Leaf,
    title: "Farm-Fresh Marketplace",
    description: "Shop directly from verified local farmers. Transactions generate volume and rewards according to system rules with full transparency.",
    gradient: "from-emerald-500/20 via-green-500/10 to-transparent",
    iconColor: "text-emerald-500",
    delay: 0,
  },
  {
    icon: MapPin,
    title: "Find Farms Near You",
    description: "Discover farms in your area with real-time availability. See what's fresh and ready for harvest today.",
    gradient: "from-primary/20 via-primary/10 to-transparent",
    iconColor: "text-primary",
    delay: 0.1,
  },
  {
    icon: Truck,
    title: "Real-Time Delivery Tracking",
    description: "Track your order from farm to table. Our drivers ensure your produce arrives fresh with live GPS updates.",
    gradient: "from-orange-500/20 via-amber-500/10 to-transparent",
    iconColor: "text-orange-500",
    delay: 0.2,
  },
  {
    icon: Users,
    title: "Binary Genealogy Network",
    description: "Build your network with a 1-1 binary structure. Choose placement or let the system auto-place new members for optimal growth.",
    gradient: "from-violet-500/20 via-purple-500/10 to-transparent",
    iconColor: "text-violet-500",
    delay: 0.3,
  },
  {
    icon: Wallet,
    title: "Multi-Wallet System",
    description: "Manage earnings with separate commission, main, and vesting wallets. Support for available and pending balances with full transaction history.",
    gradient: "from-accent/20 via-accent/10 to-transparent",
    iconColor: "text-accent",
    delay: 0.4,
  },
  {
    icon: TrendingUp,
    title: "7-Tier Rank Progression",
    description: "Progress from Member to Crown Director based on performance criteria. Higher ranks unlock deeper matching and advanced features.",
    gradient: "from-yellow-500/20 via-amber-500/10 to-transparent",
    iconColor: "text-yellow-500",
    delay: 0.5,
  },
  {
    icon: Handshake,
    title: "Full Compensation Engine",
    description: "Binary MLM engine with direct bonuses, binary matching, rank-based rewards, and capped earnings with fail-safe mechanisms.",
    gradient: "from-teal-500/20 via-cyan-500/10 to-transparent",
    iconColor: "text-teal-500",
    delay: 0.6,
  },
  {
    icon: ShieldCheck,
    title: "KYC/KYB Compliance",
    description: "Built-in verification for individuals and corporate entities. Securely upload documents with tracked verification status.",
    gradient: "from-blue-500/20 via-sky-500/10 to-transparent",
    iconColor: "text-blue-500",
    delay: 0.7,
  },
];

const FeatureCard = ({ feature }: { feature: Feature }) => {
  const IconComponent = feature.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: feature.delay }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="group relative p-6 glass-card glass-hover glass-shimmer-subtle overflow-hidden"
    >
      {/* Animated gradient background */}
      <motion.div 
        className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
        initial={false}
      />
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-1 h-1 rounded-full ${feature.iconColor} opacity-0 group-hover:opacity-40`}
            initial={{ x: "50%", y: "100%" }}
            animate={{ 
              x: ["50%", `${30 + i * 20}%`, `${40 + i * 15}%`],
              y: ["100%", "20%", "-10%"],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeOut"
            }}
          />
        ))}
      </div>

      {/* Icon container with animations */}
      <motion.div 
        className={`relative inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} backdrop-blur-sm mb-5 border border-glass-border`}
        whileHover={{ 
          scale: 1.1,
          rotate: [0, -5, 5, 0],
          transition: { duration: 0.5 }
        }}
      >
        {/* Pulse ring effect */}
        <motion.div
          className={`absolute inset-0 rounded-2xl border-2 ${feature.iconColor} opacity-0 group-hover:opacity-30`}
          initial={false}
          animate={{
            scale: [1, 1.3, 1.5],
            opacity: [0.3, 0.1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
        
        <motion.div
          animate={{ 
            y: [0, -3, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: feature.delay
          }}
        >
          <IconComponent className={`h-7 w-7 ${feature.iconColor}`} />
        </motion.div>
      </motion.div>

      {/* Content */}
      <div className="relative">
        <h3 className="font-display text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
          {feature.title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {feature.description}
        </p>
      </div>

      {/* Hover arrow indicator */}
      <motion.div
        className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100"
        initial={{ x: -10, opacity: 0 }}
        whileHover={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <ArrowRight className={`h-5 w-5 ${feature.iconColor}`} />
      </motion.div>
    </motion.div>
  );
};


// Testimonials data
const testimonials = [
  {
    id: 1,
    name: "Maria Santos",
    role: "Home Cook",
    location: "Quezon City",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    quote: "The vegetables from Terra Farming are incredibly fresh! You can really taste the difference. My family loves the Baguio lettuce and strawberries.",
    delay: 0,
  },
  {
    id: 2,
    name: "Juan Dela Cruz",
    role: "Restaurant Owner",
    location: "Makati City",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    quote: "As a chef, quality ingredients are everything. Terra Farming connects me directly with highland farmers. The produce is farm-fresh and my customers notice!",
    delay: 0.15,
  },
  {
    id: 3,
    name: "Ana Reyes",
    role: "Terra Farming Affiliate",
    location: "Baguio City",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    quote: "I started as a customer and now I'm earning passive income as an affiliate. The commission structure is transparent and payouts are always on time.",
    delay: 0.3,
  },
  {
    id: 4,
    name: "Pedro Gomez",
    role: "Organic Farmer",
    location: "La Trinidad, Benguet",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    quote: "Terra Farming has transformed my farm business. I now reach customers directly without middlemen. My income has increased by 40% since joining!",
    delay: 0.45,
  },
];

// Animated Star Rating Component
const AnimatedStarRating = ({ rating, delay }: { rating: number; delay: number }) => {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0, rotate: -180 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.4,
            delay: delay + i * 0.1,
            type: "spring",
            stiffness: 200,
          }}
        >
          <Star
            className={`h-4 w-4 ${
              i < rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-muted text-muted"
            }`}
          />
        </motion.div>
      ))}
    </div>
  );
};

// Testimonial Card Component
const TestimonialCard = ({ testimonial }: { testimonial: typeof testimonials[0] }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: testimonial.delay }}
      whileHover={{ y: -5, transition: { duration: 0.3 } }}
      className="group relative p-6 glass-card glass-hover glass-shimmer-subtle"
    >
      {/* Quote icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: testimonial.delay + 0.2 }}
        className="absolute -top-3 -left-3 p-2 rounded-full bg-primary shadow-lg"
      >
        <Quote className="h-4 w-4 text-primary-foreground" />
      </motion.div>

      {/* Stars */}
      <div className="mb-4">
        <AnimatedStarRating rating={testimonial.rating} delay={testimonial.delay + 0.3} />
      </div>

      {/* Quote */}
      <p className="text-foreground/90 leading-relaxed mb-6 italic">
        "{testimonial.quote}"
      </p>

      {/* Author */}
      <div className="flex items-center gap-3">
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: testimonial.delay + 0.4, type: "spring" }}
          className="relative"
        >
          <img
            src={testimonial.avatar}
            alt={testimonial.name}
            className="h-12 w-12 rounded-full object-cover border-2 border-primary/20"
          />
          {/* Online indicator */}
          <motion.div
            className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-card"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
        <div>
          <p className="font-semibold text-foreground">{testimonial.name}</p>
          <p className="text-sm text-muted-foreground">
            {testimonial.role} • {testimonial.location}
          </p>
        </div>
      </div>

      {/* Decorative gradient */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </motion.div>
  );
};

// Testimonials Section Component
const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-grain overflow-hidden">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-semibold mb-4">
            Testimonials
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Loved by Farmers & Customers
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Don't just take our word for it. Here's what our community has to say about Terra Farming.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 flex flex-wrap justify-center items-center gap-8 text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {testimonials.slice(0, 4).map((t, i) => (
                <img
                  key={t.id}
                  src={t.avatar}
                  alt=""
                  className="h-8 w-8 rounded-full border-2 border-background object-cover"
                  style={{ zIndex: 4 - i }}
                />
              ))}
            </div>
            <span className="text-sm font-medium">1,000+ happy customers</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-sm font-medium">4.9/5 average rating</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartDrawer />

      <main>
        {/* Hero */}
        <HeroSection />

        {/* Key Features Section */}
        <section className="py-20 bg-grain">
          <div className="container">
            <div className="text-center mb-12">
            <span className="glass-badge-primary inline-block mb-4">
              Why Choose Terra Farming
            </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Everything You Need, From Dirt to Dessert
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Terra Farming connects farmers directly to consumers while rewarding our community. 
                Experience the future of farm-fresh commerce.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature) => (
                <FeatureCard key={feature.title} feature={feature} />
              ))}
            </div>
          </div>
        </section>


        {/* How It Works Section */}
        <section className="py-20 bg-background">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                How Terra Farming Works
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Simple steps to start your farm-fresh journey
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
              {[
                {
                  step: "01",
                  title: "Register & Verify",
                  description: "Create your account as individual or company. Complete KYC/KYB verification to unlock full platform access.",
                },
                {
                  step: "02",
                  title: "Get Placed",
                  description: "Receive your unique referral link. Get automatically placed in the binary genealogy or choose your preferred position.",
                },
                {
                  step: "03",
                  title: "Shop & Earn",
                  description: "Purchase from verified farms. Transactions generate Business Volume and rewards following transparent system rules.",
                },
                {
                  step: "04",
                  title: "Grow & Withdraw",
                  description: "Build your network, progress through ranks, and withdraw earnings via bank, GCash, Maya, or crypto.",
                },
              ].map((item, index) => (
                <div key={item.step} className="text-center glass-card glass-shimmer-primary p-5 relative">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground font-display text-xl font-bold mb-4 shadow-glow-primary">
                    {item.step}
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                  {index < 3 && (
                    <ArrowRight className="hidden md:block h-5 w-5 text-muted-foreground/30 absolute -right-3 top-1/2 -translate-y-1/2 z-10" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section - Moved up after How It Works */}
        <section className="py-20 bg-primary relative overflow-hidden">
          {/* Glass overlay decorations */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full bg-accent/10 blur-3xl" />
            <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full bg-primary-foreground/5 blur-3xl" />
          </div>
          
          <div className="container text-center relative">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Join the Movement?
            </h2>
            <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-8">
              Whether you're a farmer looking to reach more customers, or a consumer seeking fresh organic produce — Terra Farming has a place for you.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/auth">
                <Button
                  size="lg"
                  className="btn-liquid-accent h-12 px-8 text-base font-semibold gap-2"
                >
                  <Users className="h-5 w-5" />
                  Become a Member
                </Button>
              </Link>
              <Link to="/auth">
                <Button
                  size="lg"
                  className="btn-liquid-outline h-12 px-8 text-base font-semibold border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 gap-2"
                >
                  <Truck className="h-5 w-5" />
                  Become a Driver
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <TestimonialsSection />

        {/* Featured Farms Section */}
        <section className="py-16 bg-secondary">
          <div className="container">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
              <div>
                <h2 className="font-display text-3xl font-bold text-foreground">
                  Partner Farms
                </h2>
                <p className="text-muted-foreground mt-1">
                  Meet our verified farm partners from the Baguio-Benguet highlands
                </p>
              </div>
              <Link to="/map">
                <Button className="btn-liquid-outline gap-2">
                  Explore All Farms
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

        {/* Platform Capabilities Section */}
        <section className="py-16 bg-background">
          <div className="container">
            <div className="text-center mb-12">
              <span className="glass-badge-accent inline-block mb-4">
                Platform Infrastructure
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Built for Scale & Security
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Complete affiliate and trading infrastructure supporting fiat and crypto operations, designed to scale across regions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Wallet className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-semibold">Fund Management</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Internal wallets store earnings with available and pending balances, transaction history, and vesting schedules. Secure transfers between members enabled by compliance rules.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Commission, Main & Vesting Wallets
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    GCash, Maya, Bank Transfers
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Crypto Payment Support
                  </li>
                </ul>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-accent/10">
                    <TrendingUp className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-display text-lg font-semibold">Token & Points</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Points-to-token migration path allows earned rewards to convert into tokens. Token rewards calculated on fixed value logic, recorded separately from cash earnings.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                    AGRI Token Integration
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                    Read-Only Blockchain API
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                    On-Chain Balance Display
                  </li>
                </ul>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-emerald-500/10">
                    <ShieldCheck className="h-6 w-6 text-emerald-500" />
                  </div>
                  <h3 className="font-display text-lg font-semibold">Security & Audit</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  All financial calculations, reward distributions, and ledger entries recorded in an auditable system with predefined caps and fail-safe mechanisms.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    75% Fail-Safe Mechanism
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Transparent Ledger System
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Multi-Language Support
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-secondary">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: "50+", label: "Partner Farms" },
                { value: "1,000+", label: "Happy Customers" },
                { value: "₱2M+", label: "Farmer Earnings" },
                { value: "7", label: "Achievement Ranks" },
              ].map((stat) => (
                <div key={stat.label} className="text-center glass-card p-6">
                  <p className="font-display text-4xl md:text-5xl font-bold text-primary mb-2">
                    {stat.value}
                  </p>
                  <p className="text-muted-foreground font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Affiliate Banner */}
        <section className="py-16 bg-gradient-to-r from-accent/10 via-accent/5 to-transparent">
          <div className="container">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-8 glass-card-accent">
              <div>
                <span className="glass-badge-accent inline-block mb-3">
                  Affiliate Program
                </span>
                <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                  Earn While You Share
                </h3>
                <p className="text-muted-foreground max-w-lg">
                  Refer friends and earn commissions on every order. Our binary compensation plan helps you build sustainable passive income while supporting local farmers.
                </p>
              </div>
              <Link to="/affiliate">
                <Button className="btn-liquid-accent h-12 px-8 text-base font-semibold whitespace-nowrap">
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
