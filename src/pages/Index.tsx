import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
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
    description: "Shop directly from verified local farmers. Fresh organic produce delivered from the highlands of Benguet to your doorstep.",
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
    title: "Affiliate Network",
    description: "Build your network and earn commissions. Our binary compensation plan rewards you for sharing the farm-fresh movement.",
    gradient: "from-violet-500/20 via-purple-500/10 to-transparent",
    iconColor: "text-violet-500",
    delay: 0.3,
  },
  {
    icon: Wallet,
    title: "Integrated Wallet System",
    description: "Manage your earnings, track commissions, and request withdrawals seamlessly from your member dashboard.",
    gradient: "from-accent/20 via-accent/10 to-transparent",
    iconColor: "text-accent",
    delay: 0.4,
  },
  {
    icon: TrendingUp,
    title: "Rank Progression",
    description: "Climb through 7 achievement tiers from Member to Crown Director. Unlock higher earning potential as you grow.",
    gradient: "from-yellow-500/20 via-amber-500/10 to-transparent",
    iconColor: "text-yellow-500",
    delay: 0.5,
  },
  {
    icon: Handshake,
    title: "Fair Farmer Partnerships",
    description: "We eliminate middlemen so farmers earn more. Transparent pricing ensures everyone benefits fairly.",
    gradient: "from-teal-500/20 via-cyan-500/10 to-transparent",
    iconColor: "text-teal-500",
    delay: 0.6,
  },
  {
    icon: ShieldCheck,
    title: "Verified & Secure",
    description: "KYC-verified members, secure transactions, and quality-assured products from trusted farm partners.",
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
      className="group relative p-6 glass-card glass-hover overflow-hidden"
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

// Video Background Section Component with Parallax
const VideoBackgroundSection = () => {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Parallax transforms
  const videoY = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.6, 1, 1, 0.6]);

  return (
    <section 
      ref={containerRef}
      className="relative h-[70vh] min-h-[500px] overflow-hidden"
    >
      {/* Background Video with Parallax */}
      <motion.div
        style={{ y: videoY }}
        className="absolute inset-0 w-full h-[130%] -top-[15%]"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/videos/terra-background.mp4" type="video/mp4" />
        </video>
      </motion.div>

      {/* Overlay gradient for readability */}
      <motion.div 
        style={{ opacity }}
        className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" 
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background" />

      {/* Content overlay with inverse parallax */}
      <div className="relative h-full flex items-center justify-center">
        <motion.div
          style={{ y: textY }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center px-4"
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold text-white drop-shadow-lg mb-4">
            Fresh From the Highlands
          </h2>
          <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto drop-shadow-md">
            Connecting Benguet farmers directly to your table
          </p>
        </motion.div>
      </div>
    </section>
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
    quote: "The vegetables from Terra are incredibly fresh! You can really taste the difference. My family loves the Baguio lettuce and strawberries.",
    delay: 0,
  },
  {
    id: 2,
    name: "Juan Dela Cruz",
    role: "Restaurant Owner",
    location: "Makati City",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    quote: "As a chef, quality ingredients are everything. Terra connects me directly with highland farmers. The produce is farm-fresh and my customers notice!",
    delay: 0.15,
  },
  {
    id: 3,
    name: "Ana Reyes",
    role: "Terra Affiliate",
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
    quote: "Terra has transformed my farm business. I now reach customers directly without middlemen. My income has increased by 40% since joining!",
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
      className="group relative p-6 glass-card glass-hover"
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
            Don't just take our word for it. Here's what our community has to say about Terra.
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
              Why Choose Terra
            </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Everything You Need, From Dirt to Dessert
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Terra connects farmers directly to consumers while rewarding our community. 
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

        {/* Video Background Section */}
        <VideoBackgroundSection />

        {/* How It Works Section */}
        <section className="py-20 bg-background">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                How Terra Works
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Simple steps to start your farm-fresh journey
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                {
                  step: "01",
                  title: "Sign Up & Verify",
                  description: "Create your account and complete KYC verification to unlock all features and earning potential.",
                },
                {
                  step: "02",
                  title: "Shop or Partner",
                  description: "Browse fresh produce from local farms, or register as a farmer to start selling directly to consumers.",
                },
                {
                  step: "03",
                  title: "Earn & Grow",
                  description: "Share your referral code, build your network, and watch your earnings grow with every order.",
                },
              ].map((item, index) => (
                <div key={item.step} className="text-center glass-card p-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground font-display text-2xl font-bold mb-4 shadow-glow-primary">
                    {item.step}
                  </div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {item.description}
                  </p>
                  {index < 2 && (
                    <ArrowRight className="hidden md:block h-6 w-6 text-muted-foreground/30 absolute right-0 top-1/2 -translate-y-1/2" />
                  )}
                </div>
              ))}
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

        {/* CTA Section */}
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
              Whether you're a farmer looking to reach more customers, or a consumer seeking fresh organic produce — Terra has a place for you.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/auth">
                <Button
                  size="lg"
                  className="btn-liquid-accent h-12 px-8 text-base font-semibold"
                >
                  Get Started Free
                </Button>
              </Link>
              <Link to="/affiliate">
                <Button
                  size="lg"
                  className="btn-liquid-outline h-12 px-8 text-base font-semibold border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  Learn About Affiliates
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-background">
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
