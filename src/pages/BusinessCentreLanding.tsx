import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { motion } from "framer-motion";
import { LayoutDashboard, Share2, DollarSign, Award, ArrowRight, TrendingUp, Users, Star, ShieldCheck } from "lucide-react";

const sections = [
  {
    title: "Partner Dashboard",
    description: "Track your earnings, monitor your network growth, and view real-time binary volume stats from a single command center.",
    icon: LayoutDashboard,
    tab: "dashboard",
    gradient: "from-emerald-600 to-emerald-800",
    stats: [
      { label: "Active Partners", value: "2,400+" },
      { label: "Avg. Monthly Earnings", value: "₱18,500" },
    ],
  },
  {
    title: "Referral Program",
    description: "Share your unique referral link, track conversions, and earn commissions every time someone joins through you.",
    icon: Share2,
    tab: "referral",
    gradient: "from-amber-500 to-amber-700",
    stats: [
      { label: "Conversion Rate", value: "4.6%" },
      { label: "Avg. Referral Bonus", value: "₱1,200" },
    ],
  },
  {
    title: "Commissions",
    description: "View detailed breakdowns of direct referral, binary, leadership, and matching bonuses earned across your network.",
    icon: DollarSign,
    tab: "commissions",
    gradient: "from-sky-600 to-sky-800",
    stats: [
      { label: "Commission Types", value: "4" },
      { label: "Payout Frequency", value: "Weekly" },
    ],
  },
  {
    title: "Rank & Rewards",
    description: "Climb through ranks from Starter to Diamond. Unlock exclusive rewards, higher caps, and leadership bonuses as you grow.",
    icon: Award,
    tab: "rank",
    gradient: "from-violet-600 to-violet-800",
    stats: [
      { label: "Rank Tiers", value: "6" },
      { label: "Top Reward", value: "Diamond" },
    ],
  },
];

const BusinessCentreLanding = () => {
  const { user, loading } = useAuth();

  if (!loading && !user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartDrawer />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E5631]/10 via-transparent to-[#C9A227]/10" />
        <div className="container relative py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              Grow Your Network, Grow Your Income
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground tracking-tight">
              Business Centre
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Your professional partner portal for managing referrals, tracking commissions, 
              and climbing the ranks in the Terra Farming ecosystem.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span><strong className="text-foreground">2,400+</strong> Active Partners</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <span><strong className="text-foreground">₱4.2M</strong> Paid Out</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-primary" />
                <span><strong className="text-foreground">4.8</strong> Partner Rating</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section Cards */}
      <section className="container py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {sections.map((section, index) => (
            <motion.div
              key={section.tab}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                to={`/business-centre/${section.tab}`}
                className="group block h-full"
              >
                <div className="relative h-full rounded-2xl border border-border bg-card p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-primary/30 overflow-hidden">
                  {/* Gradient accent */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${section.gradient} opacity-60 group-hover:opacity-100 transition-opacity`} />

                  <div className="flex items-start justify-between mb-5">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${section.gradient} text-white shadow-md`}>
                      <section.icon className="h-6 w-6" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>

                  <h3 className="text-xl font-display font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                    {section.description}
                  </p>

                  <div className="flex gap-6 pt-4 border-t border-border">
                    {section.stats.map((stat) => (
                      <div key={stat.label}>
                        <p className="text-lg font-bold text-foreground">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Platform Capabilities Section — relocated from home page */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-semibold mb-4">
              Platform Infrastructure
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Built for Scale & Security
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Complete affiliate and trading infrastructure supporting fiat and crypto operations, designed to scale across regions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-display font-semibold">Fund Management</h3>
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

            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-accent/10">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-lg font-display font-semibold">Token & Points</h3>
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

            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-emerald-500/10">
                  <Star className="h-6 w-6 text-emerald-500" />
                </div>
                <h3 className="text-lg font-display font-semibold">Security & Audit</h3>
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


      <Footer />
    </div>
  );
};

export default BusinessCentreLanding;
