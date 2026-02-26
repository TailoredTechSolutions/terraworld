import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { motion } from "framer-motion";
import { LayoutDashboard, Share2, DollarSign, Award, ArrowRight, TrendingUp, Users, Star } from "lucide-react";

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

      {/* CTA */}
      <section className="border-t border-border bg-muted/30">
        <div className="container py-16 text-center space-y-4">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            Ready to start earning?
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Join thousands of partners already growing with Terra Farming. Access your full dashboard to get started.
          </p>
          <Link
            to="/business-centre/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors mt-4"
          >
            Open Full Dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BusinessCentreLanding;
