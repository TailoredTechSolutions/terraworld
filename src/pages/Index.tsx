import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FarmCard from "@/components/FarmCard";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import { farms } from "@/data/products";
import farmerPedro from "@/assets/testimonials/farmer-pedro.jpg";
import farmerAlingRosa from "@/assets/testimonials/farmer-aling-rosa.jpg";
import farmerKuyaBen from "@/assets/testimonials/farmer-kuya-ben.jpg";
import customerMaria from "@/assets/testimonials/customer-maria.jpg";
import customerChefJuan from "@/assets/testimonials/customer-chef-juan.jpg";
import customerAteJoy from "@/assets/testimonials/customer-ate-joy.jpg";
import customerMike from "@/assets/testimonials/customer-mike.jpg";
import customerSooJin from "@/assets/testimonials/customer-soo-jin.jpg";
import { 
  ArrowRight, 
  Leaf, 
  Truck,
  Users, 
  Wallet, 
  MapPin, 
  ShieldCheck,
  TrendingUp,
  LogIn,
  type LucideIcon,
  Star,
  Quote
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const featureLinks: Record<string, string> = {
  "Farm-Fresh Marketplace": "/shop",
  "Find Farms Near You": "/map",
  "Real-Time Delivery Tracking": "/marketplace/order-tracking",
  "Secure Payments": "/marketplace/pricing-breakdown",
  "KYC/KYB Compliance": "/kyc",
};

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
    description: "Shop directly from verified local farmers. Every purchase supports sustainable agriculture with full pricing transparency.",
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
    icon: Wallet,
    title: "Secure Payments",
    description: "Pay with GCash, Maya, bank transfer, or card. Every transaction is tracked with full receipts and order history.",
    gradient: "from-accent/20 via-accent/10 to-transparent",
    iconColor: "text-accent",
    delay: 0.3,
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
interface Testimonial {
  id: number;
  name: string;
  role: string;
  location: string;
  avatar: string;
  rating: number;
  quote: string;
  translation?: string;
  isFarmer: boolean;
  delay: number;
}

const testimonials: Testimonial[] = [
  // Farmers — Ilocano / Cordillera dialect quotes
  {
    id: 1,
    name: "Mang Pedro Bautista",
    role: "Organic Farmer",
    location: "La Trinidad, Benguet",
    avatar: farmerPedro,
    rating: 5,
    quote: "Idi simmangpet ti Terra Farming, nagbaliw ti biag mi ditoy talon. Direkta kami nga makailako kadagiti customers — awan ti middleman! Dimmakel ti income mi iti 40%.",
    translation: "When Terra Farming arrived, life on our farm changed. We sell directly to customers — no middleman! Our income grew by 40%.",
    isFarmer: true,
    delay: 0,
  },
  {
    id: 2,
    name: "Aling Rosa Magbanua",
    role: "Vegetable Farmer",
    location: "Atok, Benguet",
    avatar: farmerAlingRosa,
    rating: 5,
    quote: "Naimbag unay daytoy app. Dati, mabaybayag dagiti nateng mi bago malako. Ita, adda orders bago pay laeng mapitas. Dakkel ti tulong na kadagiti mannalon kasta kanik.",
    translation: "This app is wonderful. Before, our vegetables took so long to sell. Now, we get orders even before harvest. It's a huge help for farmers like me.",
    isFarmer: true,
    delay: 0.15,
  },
  {
    id: 3,
    name: "Kuya Ben Palag-ao",
    role: "Strawberry Farmer",
    location: "Strawberry Fields, La Trinidad",
    avatar: farmerKuyaBen,
    rating: 5,
    quote: "Ay sus, grabe talaga 'tong Terra Farming eh! Dati hirap kami maghanap buyer, ngayon sila na pumupunta sa amin online. Mas malaki na kita namin!",
    translation: "Oh man, Terra Farming is amazing! We used to struggle to find buyers, now they come to us online. Our earnings are much bigger now!",
    isFarmer: true,
    delay: 0.3,
  },
  // Customers — mostly Filipino, couple foreigners
  {
    id: 4,
    name: "Maria Santos",
    role: "Home Cook",
    location: "Quezon City",
    avatar: customerMaria,
    rating: 5,
    quote: "Ang fresh talaga ng mga gulay galing Terra Farming! Ibang-iba ang lasa. Paborito ng pamilya ko yung Baguio lettuce at strawberries nila.",
    translation: "The vegetables from Terra Farming are so fresh! The taste is completely different. My family loves their Baguio lettuce and strawberries.",
    isFarmer: false,
    delay: 0.45,
  },
  {
    id: 5,
    name: "Chef Juan Reyes",
    role: "Restaurant Owner",
    location: "Makati City",
    avatar: customerChefJuan,
    rating: 5,
    quote: "Para sa akin bilang chef, ang quality ng ingredients ang pinaka-importante. Direktang galing sa highland farmers ang produce — fresh na fresh! Napapansin ng mga customers ko ang pagkakaiba.",
    translation: "As a chef, ingredient quality is everything. The produce comes directly from highland farmers — super fresh! My customers notice the difference.",
    isFarmer: false,
    delay: 0.6,
  },
  {
    id: 6,
    name: "Ate Joy Navarro",
    role: "Loyal Customer",
    location: "Baguio City",
    avatar: customerAteJoy,
    rating: 5,
    quote: "Nag-start ako bilang customer at hindi na ako tumigil! Super fresh ng mga gulay at prutas. Laging on-time ang delivery at mabait yung mga riders. Swak na swak!",
    translation: "I started as a customer and never stopped! The vegetables and fruits are super fresh. Delivery is always on time and the riders are great. Perfect fit!",
    isFarmer: false,
    delay: 0.75,
  },
  {
    id: 7,
    name: "Mike Thompson",
    role: "Expat Food Enthusiast",
    location: "Subic Bay",
    avatar: customerMike,
    rating: 5,
    quote: "I've lived in the Philippines for 8 years and finding quality organic produce was always a challenge. Terra Farming changed that — farm-to-table has never been this easy.",
    isFarmer: false,
    delay: 0.9,
  },
  {
    id: 8,
    name: "Soo-Jin Park",
    role: "Health & Wellness Coach",
    location: "BGC, Taguig",
    avatar: customerSooJin,
    rating: 5,
    quote: "I recommend Terra Farming to all my clients. The organic certification, direct farmer connection, and delivery tracking make healthy eating so much more accessible here.",
    isFarmer: false,
    delay: 1.05,
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

// Testimonial Card Component with translation fade-in
const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => {
  const [showTranslation, setShowTranslation] = useState(false);
  const hasTranslation = !!testimonial.translation;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: testimonial.delay }}
      whileHover={{ y: -5, transition: { duration: 0.3 } }}
      className="group relative p-6 glass-card glass-hover glass-shimmer-subtle flex flex-col"
    >
      {/* Farmer badge */}
      {testimonial.isFarmer && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: testimonial.delay + 0.1 }}
          className="absolute -top-2.5 -right-2.5 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg flex items-center gap-1"
        >
          <Leaf className="h-3 w-3" /> Farmer
        </motion.div>
      )}

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

      {/* Quote with translation toggle */}
      <div className="flex-1 mb-6 relative min-h-[120px]">
        <AnimatePresence mode="wait">
          {!showTranslation ? (
            <motion.p
              key="original"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-foreground/90 leading-relaxed italic text-sm"
            >
              "{testimonial.quote}"
            </motion.p>
          ) : (
            <motion.div
              key="translated"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-foreground leading-relaxed text-sm font-medium mb-2">
                "{testimonial.translation}"
              </p>
              <p className="text-muted-foreground text-xs italic leading-relaxed opacity-60">
                "{testimonial.quote}"
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Translate toggle button */}
        {hasTranslation && (
          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <motion.span
              animate={{ rotate: showTranslation ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="inline-block"
            >
              🌐
            </motion.span>
            {showTranslation ? "Show Original" : "Translate to English"}
          </button>
        )}
      </div>

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
          <p className="font-semibold text-foreground text-sm">{testimonial.name}</p>
          <p className="text-xs text-muted-foreground">
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
            Hear from our community — in their own words and their own language.
          </p>
        </motion.div>

        {/* Farmers Row */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-3"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600 flex items-center gap-1.5 mb-4">
            <Leaf className="h-3.5 w-3.5" /> From Our Farmers
          </span>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {testimonials.filter(t => t.isFarmer).map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>

        {/* Customers Row */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-3"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-primary flex items-center gap-1.5 mb-4">
            <Users className="h-3.5 w-3.5" /> From Our Customers
          </span>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.filter(t => !t.isFarmer).slice(0, 3).map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mt-6">
          {testimonials.filter(t => !t.isFarmer).slice(3).map((testimonial) => (
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
              {testimonials.slice(0, 6).map((t, i) => (
                <img
                  key={t.id}
                  src={t.avatar}
                  alt=""
                  className="h-8 w-8 rounded-full border-2 border-background object-cover"
                  style={{ zIndex: 6 - i }}
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
  const { user } = useAuth();
  useUserRoles(); // keep hook call order stable

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartDrawer />

      <main>
        {/* Hero */}
        <HeroSection />

        {/* Role Action Buttons — only when not signed in */}
        {!user && (
          <section className="py-10 bg-secondary/50">
            <div className="container">
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link to="/about">
                  <Button
                    size="lg"
                    className="h-12 px-8 text-base font-bold gap-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                    Download App
                  </Button>
                </Link>
                <Link to="/auth?role=farmer">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 px-8 text-base font-semibold gap-2 rounded-full border-2 border-primary/30 text-primary hover:bg-primary/5"
                  >
                    Become a Farmer
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/auth?role=buyer">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 px-8 text-base font-semibold gap-2 rounded-full border-2 border-primary/30 text-primary hover:bg-primary/5"
                  >
                    Become a Buyer
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        )}

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
                <Link key={feature.title} to={featureLinks[feature.title] || "/shop"} className="block">
                  <FeatureCard feature={feature} />
                </Link>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
              {[
                {
                  step: "01",
                  title: "Register & Verify",
                  description: "Create your account as individual or company. Complete KYC/KYB verification to unlock full platform access.",
                },
                {
                  step: "02",
                  title: "Browse & Order",
                  description: "Browse fresh produce from verified highland farms. Add to cart and checkout with transparent pricing and delivery fees.",
                },
                {
                  step: "03",
                  title: "Track & Receive",
                  description: "Track your delivery in real-time from farm to doorstep. Receive fresh, organic produce with full order transparency.",
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
                  {index < 2 && (
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
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth">
                <Button
                  size="lg"
                  className="btn-liquid-accent h-12 px-10 text-base font-bold gap-2 tracking-wide"
                >
                  <Users className="h-5 w-5" />
                  SIGN UP
                </Button>
              </Link>
              <Link to="/auth">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-10 text-base font-semibold border-2 border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 gap-2"
                >
                  <LogIn className="h-5 w-5" />
                  Sign In
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

        {/* Stats Section */}
        <section className="py-16 bg-secondary">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: "50+", label: "Partner Farms" },
                { value: "1,000+", label: "Happy Customers" },
                { value: "₱2M+", label: "Farmer Earnings" },
                { value: "24hr", label: "Farm-to-Table Delivery" },
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

      </main>

      <Footer />
    </div>
  );
};

export default Index;
