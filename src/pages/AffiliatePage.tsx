import { useEffect } from "react";
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
  Wallet,
  Shield,
  Clock,
  Target,
  Zap,
  HelpCircle,
  ChevronDown,
  Leaf,
  Heart,
  Globe,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const AffiliatePage = () => {
  const [copied, setCopied] = useState(false);
  const referralCode = "FARM2025XYZ";
  const referralLink = `https://farmdirect.ph/r/${referralCode}`;

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

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
      perks: ["Basic commission", "Monthly payouts", "Referral tracking"],
    },
    {
      name: "Growth",
      commission: "7%",
      requirement: "11-50 referrals",
      perks: ["Higher commission", "Bi-weekly payouts", "Priority support", "Performance bonuses"],
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
        "Custom promo codes",
      ],
    },
  ];

  const benefits = [
    {
      icon: Wallet,
      title: "Earn Passive Income",
      description: "Generate recurring income every time your referrals make a purchase. No limits on how much you can earn.",
    },
    {
      icon: Clock,
      title: "Lifetime Attribution",
      description: "Once someone signs up with your code, you earn from all their future orders—forever.",
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Get paid directly to your bank account or e-wallet. All transactions are secure and transparent.",
    },
    {
      icon: Target,
      title: "Real-Time Tracking",
      description: "Monitor your referrals, earnings, and performance with our comprehensive dashboard.",
    },
    {
      icon: Zap,
      title: "Instant Activation",
      description: "Start earning immediately after signing up. No approval process or waiting period.",
    },
    {
      icon: Heart,
      title: "Support Local Farmers",
      description: "Every referral helps connect consumers with local farmers, supporting sustainable agriculture.",
    },
  ];

  const faqs = [
    {
      question: "How do I get started as an affiliate?",
      answer: "Simply create a Terra account and you'll automatically receive your unique referral code. Share this code with friends and family, and you'll earn commission on every order they place.",
    },
    {
      question: "When and how do I get paid?",
      answer: "Payouts are processed based on your tier level—monthly for Starter, bi-weekly for Growth, and weekly for Partner tier. You can receive payments via bank transfer, GCash, Maya, or add the balance to your Terra wallet.",
    },
    {
      question: "Is there a minimum payout threshold?",
      answer: "Yes, the minimum payout is ₱500. This helps reduce transaction fees and ensures efficient processing. Your earnings accumulate until you reach the threshold.",
    },
    {
      question: "How long does the referral cookie last?",
      answer: "Our attribution is lifetime-based. Once someone creates an account using your referral code, you'll earn commission on all their future purchases—no expiration date.",
    },
    {
      question: "Can I refer businesses as well as individuals?",
      answer: "Absolutely! In fact, referring businesses like restaurants, hotels, and retailers can be very lucrative as they typically place larger and more frequent orders.",
    },
    {
      question: "What marketing materials are available?",
      answer: "We provide banners, social media graphics, email templates, and promotional content. Partner tier affiliates also get access to custom-branded materials and exclusive promotional codes.",
    },
  ];

  const successStories = [
    {
      name: "Maria Santos",
      location: "Quezon City",
      earnings: "₱45,000/month",
      quote: "I started sharing Terra with my neighborhood Facebook group. Now I have over 200 active referrals!",
      avatar: "MS",
    },
    {
      name: "Juan dela Cruz",
      location: "Cebu City",
      earnings: "₱28,000/month",
      quote: "As a food blogger, recommending Terra was natural. My followers love the fresh produce quality.",
      avatar: "JC",
    },
    {
      name: "Ana Reyes",
      location: "Davao City",
      earnings: "₱62,000/month",
      quote: "I connected local restaurants to Terra. The B2B referrals generate consistent monthly income.",
      avatar: "AR",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartDrawer />

      <main>
        {/* Hero Section */}
        <section className="relative py-16 sm:py-20 bg-primary overflow-hidden">
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
          <div className="container relative text-center px-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-1.5 backdrop-blur-sm mb-6">
              <Gift className="h-4 w-4 text-primary-foreground" />
              <span className="text-sm font-medium text-primary-foreground">
                Affiliate Program
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              Earn While You Share
            </h1>
            <p className="text-base sm:text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-8">
              Join our affiliate program and earn up to 10% commission on every
              order from your referrals. Support local farmers while building
              passive income.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/auth">
                <Button
                  size="lg"
                  className="btn-accent-gradient h-12 px-8 rounded-xl text-base font-semibold w-full sm:w-auto"
                >
                  Get Started Free
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 rounded-xl text-base font-semibold border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              >
                Learn More
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Dashboard */}
        <section className="py-10 sm:py-12 bg-secondary">
          <div className="container px-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {stats.map((stat) => (
                <Card key={stat.label} className="border-border">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                          {stat.label}
                        </p>
                        <p className="text-2xl sm:text-3xl font-bold text-foreground">
                          {stat.value}
                        </p>
                      </div>
                      <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-background flex items-center justify-center ${stat.color}`}>
                        <stat.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-12 sm:py-16">
          <div className="container px-4">
            <div className="text-center mb-10 sm:mb-12">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Why Join Our Affiliate Program?
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Discover the benefits of becoming a Terra affiliate partner
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {benefits.map((benefit) => (
                <Card key={benefit.title} className="border-border hover:shadow-md transition-shadow">
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                      <benefit.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <h3 className="font-display text-base sm:text-lg font-semibold text-foreground mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Referral Link Section */}
        <section className="py-12 sm:py-16 bg-secondary">
          <div className="container max-w-2xl px-4">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-2">
                Your Referral Link
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Share this link with friends and earn commission on their orders
              </p>
            </div>

            <div className="p-4 sm:p-6 rounded-2xl bg-card border border-border">
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <Input
                  value={referralLink}
                  readOnly
                  className="h-11 sm:h-12 rounded-xl bg-secondary border-border font-mono text-xs sm:text-sm"
                />
                <Button
                  onClick={handleCopy}
                  className={`h-11 sm:h-12 px-6 rounded-xl gap-2 shrink-0 ${
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

              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 pt-4 border-t border-border">
                <span className="text-xs sm:text-sm text-muted-foreground">Share on:</span>
                <div className="flex gap-2">
                  {["Facebook", "Twitter", "WhatsApp"].map((platform) => (
                    <Button
                      key={platform}
                      variant="outline"
                      size="sm"
                      className="rounded-full text-xs sm:text-sm h-8 sm:h-9"
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
        <section className="py-12 sm:py-16">
          <div className="container px-4">
            <div className="text-center mb-10 sm:mb-12">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Commission Tiers
              </h2>
              <p className="text-muted-foreground">
                Earn more as you refer more customers
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
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
                    <CardTitle className="font-display text-lg sm:text-xl">
                      {tier.name}
                    </CardTitle>
                    <p className="text-3xl sm:text-4xl font-bold text-primary mt-2">
                      {tier.commission}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {tier.requirement}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {tier.perks.map((perk) => (
                        <li
                          key={perk}
                          className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground"
                        >
                          <Check className="h-4 w-4 text-success shrink-0" />
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
        <section className="py-12 sm:py-16 bg-secondary">
          <div className="container px-4">
            <div className="text-center mb-10 sm:mb-12">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
                How It Works
              </h2>
              <p className="text-muted-foreground">
                Start earning in three simple steps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
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
                  <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground mx-auto mb-4">
                    <item.icon className="h-7 w-7 sm:h-8 sm:w-8" />
                  </div>
                  <h3 className="font-display text-lg sm:text-xl font-semibold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  {index < 2 && (
                    <ArrowRight className="hidden md:block absolute top-7 -right-4 h-6 w-6 text-muted-foreground/30" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Success Stories */}
        <section className="py-12 sm:py-16">
          <div className="container px-4">
            <div className="text-center mb-10 sm:mb-12">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Success Stories
              </h2>
              <p className="text-muted-foreground">
                Real affiliates, real earnings
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
              {successStories.map((story) => (
                <Card key={story.name} className="border-border">
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm sm:text-base">
                        {story.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm sm:text-base">{story.name}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">{story.location}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground italic mb-4">
                      "{story.quote}"
                    </p>
                    <div className="flex items-center gap-2 pt-3 border-t border-border">
                      <TrendingUp className="h-4 w-4 text-success" />
                      <span className="text-sm font-semibold text-success">{story.earnings}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 sm:py-16 bg-secondary">
          <div className="container max-w-3xl px-4">
            <div className="text-center mb-10 sm:mb-12">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 mb-4">
                <HelpCircle className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">FAQ</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground">
                Everything you need to know about the affiliate program
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-border">
                  <AccordionTrigger className="text-left text-sm sm:text-base font-medium hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto text-center p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
              <Globe className="h-12 w-12 mx-auto mb-4 opacity-80" />
              <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4">
                Ready to Start Earning?
              </h2>
              <p className="text-primary-foreground/80 mb-6 max-w-xl mx-auto">
                Join thousands of affiliates who are earning passive income while supporting local farmers. It's free to join and takes less than 2 minutes to get started.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/auth">
                  <Button
                    size="lg"
                    className="btn-accent-gradient h-12 px-8 rounded-xl text-base font-semibold w-full sm:w-auto"
                  >
                    Create Free Account
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 rounded-xl text-base font-semibold border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  Contact Us
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AffiliatePage;
