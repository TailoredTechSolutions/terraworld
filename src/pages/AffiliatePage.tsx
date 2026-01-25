import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Share2,
  Users,
  TrendingUp,
  DollarSign,
  Copy,
  Check,
  Gift,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";

const AffiliatePage = () => {
  const [copied, setCopied] = useState(false);
  const referralCode = "FARM2025XYZ";
  const referralLink = `https://farmdirect.ph/r/${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stats = [
    {
      label: "Total Referrals",
      value: "0",
      icon: Users,
      color: "text-primary",
    },
    {
      label: "Orders Generated",
      value: "0",
      icon: TrendingUp,
      color: "text-success",
    },
    {
      label: "Total Earnings",
      value: "₱0.00",
      icon: DollarSign,
      color: "text-accent",
    },
  ];

  const tiers = [
    {
      name: "Starter",
      commission: "5%",
      requirement: "0-10 referrals",
      perks: ["Basic commission", "Monthly payouts"],
    },
    {
      name: "Growth",
      commission: "7%",
      requirement: "11-50 referrals",
      perks: ["Higher commission", "Bi-weekly payouts", "Priority support"],
      highlighted: true,
    },
    {
      name: "Partner",
      commission: "10%",
      requirement: "51+ referrals",
      perks: [
        "Maximum commission",
        "Weekly payouts",
        "Dedicated manager",
        "Exclusive promotions",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartDrawer />

      <main>
        {/* Hero Section */}
        <section className="relative py-20 bg-primary overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="2" fill="currentColor"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dots)" />
            </svg>
          </div>
          <div className="container relative text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-1.5 backdrop-blur-sm mb-6">
              <Gift className="h-4 w-4 text-primary-foreground" />
              <span className="text-sm font-medium text-primary-foreground">
                Affiliate Program
              </span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              Earn While You Share
            </h1>
            <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-8">
              Join our affiliate program and earn up to 10% commission on every
              order from your referrals. Support local farmers while building
              passive income.
            </p>
            <Button
              size="lg"
              className="btn-accent-gradient h-12 px-8 rounded-xl text-base font-semibold"
            >
              Get Started
            </Button>
          </div>
        </section>

        {/* Stats Dashboard */}
        <section className="py-12 bg-secondary">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((stat) => (
                <Card key={stat.label} className="border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {stat.label}
                        </p>
                        <p className="text-3xl font-bold text-foreground">
                          {stat.value}
                        </p>
                      </div>
                      <div className={`h-12 w-12 rounded-full bg-secondary flex items-center justify-center ${stat.color}`}>
                        <stat.icon className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Referral Link Section */}
        <section className="py-16">
          <div className="container max-w-2xl">
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                Your Referral Link
              </h2>
              <p className="text-muted-foreground">
                Share this link with friends and earn commission on their orders
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border">
              <div className="flex gap-3 mb-4">
                <Input
                  value={referralLink}
                  readOnly
                  className="h-12 rounded-xl bg-secondary border-border font-mono text-sm"
                />
                <Button
                  onClick={handleCopy}
                  className={`h-12 px-6 rounded-xl gap-2 ${
                    copied ? "bg-success hover:bg-success" : "btn-primary-gradient"
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-center gap-6 pt-4 border-t border-border">
                <span className="text-sm text-muted-foreground">Share on:</span>
                <div className="flex gap-2">
                  {["Facebook", "Twitter", "WhatsApp"].map((platform) => (
                    <Button
                      key={platform}
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                    >
                      {platform}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Commission Tiers */}
        <section className="py-16 bg-secondary">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl font-bold text-foreground mb-2">
                Commission Tiers
              </h2>
              <p className="text-muted-foreground">
                Earn more as you refer more customers
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {tiers.map((tier) => (
                <Card
                  key={tier.name}
                  className={`border-border relative overflow-hidden ${
                    tier.highlighted
                      ? "ring-2 ring-accent border-accent"
                      : ""
                  }`}
                >
                  {tier.highlighted && (
                    <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-xs font-medium px-3 py-1 rounded-bl-lg">
                      Popular
                    </div>
                  )}
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="font-display text-xl">
                      {tier.name}
                    </CardTitle>
                    <p className="text-4xl font-bold text-primary mt-2">
                      {tier.commission}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {tier.requirement}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {tier.perks.map((perk) => (
                        <li
                          key={perk}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <Check className="h-4 w-4 text-success" />
                          {perk}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl font-bold text-foreground mb-2">
                How It Works
              </h2>
              <p className="text-muted-foreground">
                Start earning in three simple steps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                {
                  step: "1",
                  title: "Sign Up",
                  description: "Create your free affiliate account and get your unique referral link",
                  icon: Users,
                },
                {
                  step: "2",
                  title: "Share",
                  description: "Share your link with friends, family, and social media followers",
                  icon: Share2,
                },
                {
                  step: "3",
                  title: "Earn",
                  description: "Get paid for every order placed through your referral link",
                  icon: DollarSign,
                },
              ].map((item, index) => (
                <div key={item.step} className="text-center relative">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground mx-auto mb-4">
                    <item.icon className="h-8 w-8" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground">{item.description}</p>
                  {index < 2 && (
                    <ArrowRight className="hidden md:block absolute top-8 -right-4 h-6 w-6 text-muted-foreground/30" />
                  )}
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

export default AffiliatePage;
