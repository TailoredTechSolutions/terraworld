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
import { Loader2, Eye, EyeOff, Briefcase, Users, TrendingUp, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import terraLogo from "@/assets/terra-logo-full.png";
import authFarmBg from "@/assets/auth-farm-bg.jpg";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");
const nameSchema = z.string().min(2, "Name must be at least 2 characters");

const BusinessCentreAuth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signIn, signUp, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [referralCode, setReferralCode] = useState(searchParams.get("ref") || "");

  // Error states
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [nameError, setNameError] = useState("");

  // Pre-select tab from URL
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "register") setActiveTab("register");
  }, [searchParams]);

  // Only redirect admins and affiliates — farmers/buyers must use separate credentials
  const { isAdmin: isAdminUser, isAffiliate: isAffiliateUser, loading: rolesLoading } = useUserRoles();
  useEffect(() => {
    if (user && !authLoading && !rolesLoading) {
      if (isAdminUser || isAffiliateUser) {
        navigate("/business-centre");
      }
    }
  }, [user, authLoading, rolesLoading, isAdminUser, isAffiliateUser, navigate]);

  const validateForm = (isSignup: boolean) => {
    let valid = true;
    setEmailError("");
    setPasswordError("");
    setNameError("");

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      setEmailError(emailResult.error.errors[0].message);
      valid = false;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      setPasswordError(passwordResult.error.errors[0].message);
      valid = false;
    }

    if (isSignup) {
      const nameResult = nameSchema.safeParse(fullName);
      if (!nameResult.success) {
        setNameError(nameResult.error.errors[0].message);
        valid = false;
      }
    }

    return valid;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(false)) return;

    setIsLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: "Sign In Failed", description: error.message, variant: "destructive" });
      } else {
        navigate("/business-centre");
      }
    } catch {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(true)) return;

    setIsLoading(true);
    try {
      const { error } = await signUp(email, password, fullName, referralCode, "affiliate");
      if (error) {
        toast({ title: "Registration Failed", description: error.message, variant: "destructive" });
      } else {
        toast({
          title: "Registration Successful!",
          description: "Please check your email to verify your account before signing in.",
        });
        setActiveTab("login");
      }
    } catch {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Panel — Branding */}
      <div
        className="hidden md:flex md:w-1/2 relative items-center justify-center p-12"
        style={{
          backgroundImage: `url(${authFarmBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-primary/30" />
        <div className="relative z-10 max-w-md text-white space-y-8">
          <div className="flex items-center gap-3">
            <img src={terraLogo} alt="Terra" className="h-14 w-14 rounded-xl" />
            <div>
              <h1 className="text-3xl font-display font-bold">Business Centre</h1>
              <p className="text-sm text-white/70 italic">Affiliate Partner Program</p>
            </div>
          </div>

          <p className="text-lg text-white/90 leading-relaxed">
            Join our affiliate network and earn commissions by connecting farmers with buyers. Build your team, grow your network, and earn rewards.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm">
              <Users className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold">Build Your Team</p>
                <p className="text-xs text-white/60">Multi-level referral network</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm">
              <TrendingUp className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold">Earn Commissions</p>
                <p className="text-xs text-white/60">Up to 10% direct referral</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm">
              <Award className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold">Rank Up</p>
                <p className="text-xs text-white/60">Unlock higher earning tiers</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm">
              <Briefcase className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold">Your Business</p>
                <p className="text-xs text-white/60">Full dashboard & tools</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-background">
        <Card className="w-full max-w-md border-border/50 shadow-xl">
          <CardHeader className="text-center space-y-2">
            <div className="md:hidden flex items-center justify-center gap-2 mb-2">
              <img src={terraLogo} alt="Terra" className="h-10 w-10 rounded-lg" />
              <span className="font-display text-lg font-bold">Business Centre</span>
            </div>
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

            <div className="mt-6 pt-4 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                Looking to buy or sell produce?{" "}
                <Link to="/auth" className="text-primary hover:underline font-semibold">
                  Go to main sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BusinessCentreAuth;
