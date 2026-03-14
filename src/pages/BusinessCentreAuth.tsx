import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, Users, TrendingUp, Award, Zap, DollarSign, Coins, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useVideoTransition } from "@/components/VideoTransitionOverlay";
import terraLogo from "@/assets/terra-logo-full.png";
import businessCentreHero from "@/assets/business-centre-hero.jpg";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");
const nameSchema = z.string().min(2, "Name must be at least 2 characters");

const cubicSmooth = [0.22, 1, 0.36, 1] as const;

const BusinessCentreAuth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signIn, signUp, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { scrollY } = useScroll();
  const heroImageY = useTransform(scrollY, [0, 400], [0, 120]);
  const heroScale = useTransform(scrollY, [0, 400], [1, 1.1]);
  const [triggerTransition, transitionOverlay] = useVideoTransition();

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [referralCode, setReferralCode] = useState(searchParams.get("ref") || "");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "register") setActiveTab("register");
  }, [searchParams]);

  const { isAdmin: isAdminUser, isAffiliate: isAffiliateUser, loading: rolesLoading } = useUserRoles();
  useEffect(() => {
    if (user && !authLoading && !rolesLoading) {
      if (isAdminUser || isAffiliateUser) {
        triggerTransition("/business-centre");
      }
    }
  }, [user, authLoading, rolesLoading, isAdminUser, isAffiliateUser, triggerTransition]);

  const validateForm = (isSignup: boolean) => {
    let valid = true;
    setEmailError("");
    setPasswordError("");
    setNameError("");

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) { setEmailError(emailResult.error.errors[0].message); valid = false; }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) { setPasswordError(passwordResult.error.errors[0].message); valid = false; }

    if (isSignup) {
      const nameResult = nameSchema.safeParse(fullName);
      if (!nameResult.success) { setNameError(nameResult.error.errors[0].message); valid = false; }
    }
    return valid;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(false)) return;
    setIsLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) { toast({ title: "Sign In Failed", description: error.message, variant: "destructive" }); }
      else { navigate("/business-centre"); }
    } catch { toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" }); }
    finally { setIsLoading(false); }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(true)) return;
    setIsLoading(true);
    try {
      const { error } = await signUp(email, password, fullName, referralCode, "affiliate");
      if (error) { toast({ title: "Registration Failed", description: error.message, variant: "destructive" }); }
      else {
        toast({ title: "Registration Successful!", description: "Please check your email to verify your account before signing in." });
        setActiveTab("login");
      }
    } catch { toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" }); }
    finally { setIsLoading(false); }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ===== CINEMATIC HERO WITH PARALLAX ===== */}
      <section className="relative h-[320px] sm:h-[380px] lg:h-[440px] overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{ y: heroImageY, scale: heroScale }}
        >
          <img
            src={businessCentreHero}
            alt="Philippine rice terraces at golden hour"
            className="h-full w-full object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-transparent" />

        <div className="relative container h-full flex flex-col justify-end pb-8 sm:pb-10 max-w-5xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: cubicSmooth }}
          >
            <div className="flex items-center gap-3 mb-4">
              <img src={terraLogo} alt="Terra" className="h-12 w-12 rounded-xl shadow-lg" />
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 px-3 py-1">
                  <Zap className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[11px] font-semibold text-primary">Affiliate Partner Program</span>
                </div>
              </div>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-2 max-w-xl leading-tight">
              Business Centre
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md">
              Join our affiliate network — earn commissions connecting farmers with buyers across the Philippines.
            </p>
          </motion.div>

          {/* Stats badges */}
          <motion.div
            className="flex items-center gap-5 mt-5"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: cubicSmooth }}
          >
            {[
              { icon: Users, value: "500+", label: "Partners" },
              { icon: DollarSign, value: "10%", label: "Direct Referral" },
              { icon: Coins, value: "AGRI", label: "Token Rewards" },
              { icon: Shield, value: "Secure", label: "Verified" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-card/60 backdrop-blur-sm border border-border/50">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground leading-none">{value}</p>
                  <p className="text-[10px] text-muted-foreground">{label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== AUTH FORM ===== */}
      <div className="flex-1 flex items-start justify-center -mt-6 relative z-10 px-4 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: cubicSmooth }}
          className="w-full max-w-md"
        >
          <Card className="border-border/50 shadow-xl bg-card/95 backdrop-blur-sm">
            <CardHeader className="text-center space-y-2 pb-4">
              <CardTitle className="text-2xl font-display">
                {activeTab === "login" ? "Affiliate Sign In" : "Become an Affiliate"}
              </CardTitle>
              <CardDescription>
                {activeTab === "login"
                  ? "Sign in to access your Business Centre dashboard"
                  : "Register as an affiliate partner to start earning"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bc-login-email" className="font-bold">Email</Label>
                      <Input id="bc-login-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} className="h-11 md:h-10" />
                      {emailError && <p className="text-sm text-destructive">{emailError}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bc-login-password" className="font-bold">Password</Label>
                      <div className="relative">
                        <Input id="bc-login-password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} className="h-11 md:h-10 pr-10" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1}>
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="bc-remember-me" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(checked === true)} />
                      <Label htmlFor="bc-remember-me" className="text-sm font-medium cursor-pointer select-none">Remember me</Label>
                    </div>
                    <Button type="submit" className="w-full h-12 md:h-10 text-base font-semibold" disabled={isLoading}>
                      {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing In...</>) : "Sign In"}
                    </Button>
                    <div className="text-center">
                      <button
                        type="button"
                        className="text-sm text-primary hover:underline font-semibold"
                        onClick={async () => {
                          if (!email) { toast({ title: "Enter Email", description: "Please enter your email address first.", variant: "destructive" }); return; }
                          const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
                          if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
                          else { toast({ title: "Check Your Email", description: "A password reset link has been sent to your email." }); }
                        }}
                      >
                        Forgot your password?
                      </button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="register">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bc-signup-name" className="font-bold">Full Name</Label>
                      <Input id="bc-signup-name" type="text" placeholder="Your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={isLoading} className="h-11 md:h-10" />
                      {nameError && <p className="text-sm text-destructive">{nameError}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bc-signup-email" className="font-bold">Email</Label>
                      <Input id="bc-signup-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} className="h-11 md:h-10" />
                      {emailError && <p className="text-sm text-destructive">{emailError}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bc-signup-password" className="font-bold">Password</Label>
                      <div className="relative">
                        <Input id="bc-signup-password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} className="h-11 md:h-10 pr-10" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1}>
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bc-signup-referral" className="font-bold">Referral Code <span className="text-muted-foreground font-normal">(optional)</span></Label>
                      <Input id="bc-signup-referral" type="text" placeholder="Enter referral code" value={referralCode} onChange={(e) => setReferralCode(e.target.value)} disabled={isLoading} className="h-11 md:h-10" />
                    </div>
                    <Button type="submit" className="w-full h-12 md:h-10 text-base font-semibold" disabled={isLoading}>
                      {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating Account...</>) : "Register as Affiliate"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              {/* Value props (mobile visible) */}
              <div className="grid grid-cols-2 gap-2 mt-6 pt-4 border-t border-border">
                {[
                  { icon: Users, title: "Build Your Team", desc: "Multi-level referral network" },
                  { icon: TrendingUp, title: "Earn Commissions", desc: "Up to 10% direct referral" },
                  { icon: Award, title: "Rank Up", desc: "Unlock higher earning tiers" },
                  { icon: Zap, title: "Full Dashboard", desc: "Complete business tools" },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-2 p-2.5 rounded-xl bg-muted/50 border border-border/30">
                    <Icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[11px] font-semibold text-foreground leading-tight">{title}</p>
                      <p className="text-[10px] text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Looking to buy or sell produce?{" "}
                  <Link to="/auth" className="text-primary hover:underline font-semibold">
                    Go to main sign in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default BusinessCentreAuth;
