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
  Handshake
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Leaf,
    title: "Farm-Fresh Marketplace",
    description: "Shop directly from verified local farmers. Fresh organic produce delivered from the highlands of Benguet to your doorstep.",
    color: "text-green-600 bg-green-100",
  },
  {
    icon: MapPin,
    title: "Find Farms Near You",
    description: "Discover farms in your area with real-time availability. See what's fresh and ready for harvest today.",
    color: "text-primary bg-primary/10",
  },
  {
    icon: Truck,
    title: "Real-Time Delivery Tracking",
    description: "Track your order from farm to table. Our drivers ensure your produce arrives fresh with live GPS updates.",
    color: "text-orange-600 bg-orange-100",
  },
  {
    icon: Users,
    title: "Affiliate Network",
    description: "Build your network and earn commissions. Our binary compensation plan rewards you for sharing the farm-fresh movement.",
    color: "text-purple-600 bg-purple-100",
  },
  {
    icon: Wallet,
    title: "Integrated Wallet System",
    description: "Manage your earnings, track commissions, and request withdrawals seamlessly from your member dashboard.",
    color: "text-accent bg-accent/10",
  },
  {
    icon: TrendingUp,
    title: "Rank Progression",
    description: "Climb through 7 achievement tiers from Member to Crown Director. Unlock higher earning potential as you grow.",
    color: "text-yellow-600 bg-yellow-100",
  },
  {
    icon: Handshake,
    title: "Fair Farmer Partnerships",
    description: "We eliminate middlemen so farmers earn more. Transparent pricing ensures everyone benefits fairly.",
    color: "text-teal-600 bg-teal-100",
  },
  {
    icon: ShieldCheck,
    title: "Verified & Secure",
    description: "KYC-verified members, secure transactions, and quality-assured products from trusted farm partners.",
    color: "text-blue-600 bg-blue-100",
  },
];

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
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
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
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`inline-flex p-3 rounded-xl ${feature.color} mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

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
                <div key={item.step} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground font-display text-2xl font-bold mb-4">
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
                <Button variant="outline" className="rounded-xl gap-2">
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
        <section className="py-20 bg-primary">
          <div className="container text-center">
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
                  className="btn-accent-gradient h-12 px-8 rounded-xl text-base font-semibold"
                >
                  Get Started Free
                </Button>
              </Link>
              <Link to="/affiliate">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 rounded-xl text-base font-semibold border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: "50+", label: "Partner Farms" },
                { value: "1,000+", label: "Happy Customers" },
                { value: "₱2M+", label: "Farmer Earnings" },
                { value: "7", label: "Achievement Ranks" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
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
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-8 rounded-2xl bg-card border border-border">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-3">
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
