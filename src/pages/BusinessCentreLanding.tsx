import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { motion } from "framer-motion";
import { LayoutDashboard, Share2, DollarSign, Award, ArrowRight, TrendingUp, Users, Star, ShieldCheck, UserPlus, ShoppingCart, GitBranch, Wallet } from "lucide-react";

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

      {/* Quick Links — moved from footer */}
      <section className="container pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            { label: "Rewards Overview", to: "/rewards", icon: Award, color: "text-amber-600 bg-amber-500/10" },
            { label: "Referral & Earnings", to: "/business-centre/dashboard", icon: Share2, color: "text-emerald-600 bg-emerald-500/10" },
            { label: "Compensation Rules", to: "/rewards/compensation", icon: ShieldCheck, color: "text-sky-600 bg-sky-500/10" },
            { label: "Back Office", to: "/business-centre/dashboard", icon: LayoutDashboard, color: "text-violet-600 bg-violet-500/10" },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center hover:border-primary/30 hover:shadow-sm transition-all group"
            >
              <div className={`p-2.5 rounded-lg ${item.color}`}>
                <item.icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{item.label}</span>
            </Link>
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

      {/* How to Earn Section */}
      <section className="py-16 border-t border-border bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
                Getting Started
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                How to Earn with Terra Farming
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Follow these simple steps to start building your income as a Terra Farming partner.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              {
                step: "01",
                icon: UserPlus,
                title: "Join & Activate",
                description: "Register your account, complete KYC verification, and choose a membership package to activate your partner status.",
                color: "text-primary",
                bg: "bg-primary/10",
                borderColor: "border-primary/20",
              },
              {
                step: "02",
                icon: Share2,
                title: "Refer & Build",
                description: "Share your unique referral link with friends, family, and your community. Earn direct referral bonuses for every new partner you bring in.",
                color: "text-accent",
                bg: "bg-accent/10",
                borderColor: "border-accent/20",
              },
              {
                step: "03",
                icon: GitBranch,
                title: "Grow Binary Volume",
                description: "As your left and right legs grow, matched binary volume generates weekly binary bonuses. The more balanced your tree, the more you earn.",
                color: "text-emerald-600",
                bg: "bg-emerald-500/10",
                borderColor: "border-emerald-500/20",
              },
              {
                step: "04",
                icon: Wallet,
                title: "Earn & Withdraw",
                description: "Track all your commissions in real-time. Withdraw via GCash, Maya, or bank transfer — payouts processed weekly with full transparency.",
                color: "text-sky-600",
                bg: "bg-sky-500/10",
                borderColor: "border-sky-500/20",
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative rounded-2xl border ${item.borderColor} bg-card p-6 text-center`}
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${item.bg} ${item.color} font-display text-sm font-bold mb-4`}>
                  {item.step}
                </div>
                <div className={`mx-auto mb-4 inline-flex p-3 rounded-xl ${item.bg}`}>
                  <item.icon className={`h-6 w-6 ${item.color}`} />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
                {index < 3 && (
                  <ArrowRight className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/30 z-10" />
                )}
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12 max-w-4xl mx-auto"
          >
            <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
              <h3 className="font-display text-lg font-semibold text-foreground mb-6 text-center">
                4 Ways You Earn
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Direct Referral", rate: "10%", description: "Per signup you refer", color: "bg-primary" },
                  { label: "Binary Bonus", rate: "8%", description: "Matched volume weekly", color: "bg-emerald-500" },
                  { label: "Leadership Bonus", rate: "5%", description: "From downline leaders", color: "bg-violet-500" },
                  { label: "Matching Bonus", rate: "3%", description: "From team performance", color: "bg-accent" },
                ].map((earning) => (
                  <div key={earning.label} className="text-center p-4 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors">
                    <div className={`w-3 h-3 rounded-full ${earning.color} mx-auto mb-3`} />
                    <p className="text-2xl font-bold font-display text-foreground">{earning.rate}</p>
                    <p className="text-sm font-medium text-foreground mt-1">{earning.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{earning.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BusinessCentreLanding;
