import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Leaf, ArrowLeft, ShoppingBag, Tractor, Truck, ChevronDown, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import terraLogo from "@/assets/terra-logo-full.png";
import authFarmBg from "@/assets/auth-farm-bg.jpg";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");
const nameSchema = z.string().min(2, "Name must be at least 2 characters").optional().or(z.literal(""));

type RegistrationRole = "buyer" | "farmer" | "driver";

const AuthPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signIn, signUp, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [registrationRole, setRegistrationRole] = useState<RegistrationRole | null>(null);
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

  // Pre-select role from URL param
  useEffect(() => {
    const role = searchParams.get("role");
    if (role === "buyer" || role === "farmer" || role === "driver") {
      setRegistrationRole(role);
      setActiveTab("register");
    }
  }, [searchParams]);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  const validateForm = (isSignup: boolean) => {
    let isValid = true;
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      setEmailError(emailResult.error.errors[0].message);
      isValid = false;
    } else {
      setEmailError("");
    }
    
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      setPasswordError(passwordResult.error.errors[0].message);
      isValid = false;
    } else {
      setPasswordError("");
    }
    
    if (isSignup && fullName) {
      const nameResult = nameSchema.safeParse(fullName);
      if (!nameResult.success) {
        setNameError(nameResult.error.errors[0].message);
        isValid = false;
      } else {
        setNameError("");
      }
    }
    
    return isValid;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(false)) return;
    setIsLoading(true);
    
    const { error } = await signIn(email, password);
    
    if (error) {
      let message = "Failed to sign in";
      if (error.message.includes("Invalid login credentials")) {
        message = "Invalid email or password";
      } else if (error.message.includes("Email not confirmed")) {
        message = "Please verify your email address";
      }
      toast({ title: "Sign In Failed", description: message, variant: "destructive" });
    } else {
      toast({ title: "Welcome back!", description: "You have successfully signed in." });
      navigate("/");
    }
    
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registrationRole) {
      toast({ title: "Select Role", description: "Please select your account type.", variant: "destructive" });
      return;
    }
    if (!validateForm(true)) return;
    setIsLoading(true);
    
    const { error } = await signUp(email, password, fullName, referralCode, registrationRole);
    
    if (error) {
      let message = "Failed to create account";
      if (error.message.includes("already registered")) {
        message = "This email is already registered. Please sign in.";
      } else if (error.message.includes("valid email")) {
        message = "Please enter a valid email address";
      }
      toast({ title: "Registration Failed", description: message, variant: "destructive" });
    } else {
      const roleLabels: Record<string, string> = { buyer: "Buyer", farmer: "Farmer", driver: "Driver" };
      toast({ title: "Account Created!", description: `Welcome to Terra Farming as a ${roleLabels[registrationRole]}!` });
      const redirectMap: Record<string, string> = { farmer: "/farmer", driver: "/driver", buyer: "/buyer" };
      navigate(redirectMap[registrationRole] || "/buyer");
    }
    
    setIsLoading(false);
  };

  const handleRegisterClick = (role: RegistrationRole) => {
    setRegistrationRole(role);
    setActiveTab("register");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Realistic Philippine highland farm background */}
      <div className="absolute inset-0 z-0">
        <img 
          src={authFarmBg} 
          alt="" 
          className="w-full h-full object-cover object-center md:object-center opacity-50" 
          loading="eager"
        />
        {/* Light mode overlay: subtle dark gradient for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/25 to-black/10 dark:hidden" />
        {/* Dark mode overlay: heavier cinematic overlay */}
        <div className="absolute inset-0 hidden dark:block bg-gradient-to-t from-black/70 via-black/55 to-black/40" />
        {/* Mobile extra overlay for readability */}
        <div className="absolute inset-0 bg-black/10 md:bg-transparent dark:bg-black/5 md:dark:bg-transparent" />
      </div>

      {/* Header */}
      <div className="container py-4 relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors drop-shadow-md">
          <ArrowLeft className="h-4 w-4" />
          Back to Marketplace
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10 mt-[5vh] md:mt-0">
        <Card 
          className="w-[92%] max-w-md border-2 shadow-2xl relative overflow-hidden backdrop-blur-sm dark:backdrop-blur-md"
          style={{
            background: `linear-gradient(hsla(34,28%,74%,0.92), hsla(34,28%,74%,0.92)), url(${terraLogo}) center / cover no-repeat`,
          }}
        >
          {/* Dark mode override with darker overlay */}
          <div 
            className="absolute inset-0 z-0 pointer-events-none hidden dark:block rounded-xl"
            style={{
              background: `linear-gradient(hsla(20,10%,8%,0.85), hsla(20,10%,8%,0.85)), url(${terraLogo}) center / cover no-repeat`,
            }}
          />

          <CardHeader className="text-center pb-2 relative z-10">
            <div className="py-6 md:py-8">
              <CardTitle className="font-display text-4xl md:text-5xl drop-shadow-sm">Welcome to Terra Farming</CardTitle>
              <CardDescription className="font-bold text-base mt-2">
                Join the farm-to-table revolution
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="relative z-10">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className={`inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${activeTab === "register" ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}>
                      Register
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-48">
                    <DropdownMenuItem onClick={() => handleRegisterClick("buyer")} className="gap-2 cursor-pointer">
                      <ShoppingBag className="h-4 w-4" />
                      Register as Buyer
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRegisterClick("farmer")} className="gap-2 cursor-pointer">
                      <Tractor className="h-4 w-4" />
                      Register as Farmer
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRegisterClick("driver")} className="gap-2 cursor-pointer">
                      <Truck className="h-4 w-4" />
                      Register as Driver
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="font-bold">Email</Label>
                    <Input id="login-email" type="email" placeholder="andrew@tailoredtech.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} className="h-11 md:h-10 dark:bg-[hsl(0,0%,12%)] dark:text-white dark:border-white/20" />
                    {emailError && <p className="text-sm text-destructive">{emailError}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="font-bold">Password</Label>
                    <div className="relative">
                      <Input id="login-password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} className="h-11 md:h-10 pr-10 dark:bg-[hsl(0,0%,12%)] dark:text-white dark:border-white/20" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember-me" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(checked === true)} />
                    <Label htmlFor="remember-me" className="text-sm font-medium cursor-pointer select-none">Remember me</Label>
                  </div>
                  <Button type="submit" className="w-full h-12 md:h-10 bg-primary hover:bg-primary/90 text-base font-semibold" disabled={isLoading}>
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
                {!registrationRole ? (
                  <div className="space-y-4 text-center py-4">
                    <p className="text-muted-foreground font-bold">Choose your account type to get started:</p>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => setRegistrationRole("buyer")}
                        className="p-4 rounded-xl border-2 border-border hover:border-primary transition-colors text-center space-y-2 dark:bg-[hsl(0,0%,12%)]/50"
                      >
                        <ShoppingBag className="h-7 w-7 mx-auto text-primary" />
                        <p className="font-semibold text-sm">Buyer</p>
                        <p className="text-xs text-muted-foreground">Shop fresh produce</p>
                      </button>
                      <button
                        onClick={() => setRegistrationRole("farmer")}
                        className="p-4 rounded-xl border-2 border-border hover:border-primary transition-colors text-center space-y-2 dark:bg-[hsl(0,0%,12%)]/50"
                      >
                        <Tractor className="h-7 w-7 mx-auto text-primary" />
                        <p className="font-semibold text-sm">Farmer</p>
                        <p className="text-xs text-muted-foreground">Sell your products</p>
                      </button>
                      <button
                        onClick={() => setRegistrationRole("driver")}
                        className="p-4 rounded-xl border-2 border-border hover:border-primary transition-colors text-center space-y-2 dark:bg-[hsl(0,0%,12%)]/50"
                      >
                        <Truck className="h-7 w-7 mx-auto text-primary" />
                        <p className="font-semibold text-sm">Driver</p>
                        <p className="text-xs text-muted-foreground">Deliver orders</p>
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSignup} className="space-y-4">
                    {/* Role indicator */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary dark:bg-[hsl(0,0%,15%)]">
                      <div className="flex items-center gap-2">
                        {registrationRole === "buyer" ? <ShoppingBag className="h-4 w-4 text-primary" /> : registrationRole === "driver" ? <Truck className="h-4 w-4 text-primary" /> : <Tractor className="h-4 w-4 text-primary" />}
                        <span className="text-sm font-medium">
                          Registering as {{ buyer: "Buyer", farmer: "Farmer", driver: "Driver" }[registrationRole]}
                        </span>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setRegistrationRole(null)}>
                        Change
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-name" className="font-bold">Full Name</Label>
                      <Input id="signup-name" type="text" placeholder="Juan dela Cruz" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={isLoading} className="h-11 md:h-10 dark:bg-[hsl(0,0%,12%)] dark:text-white dark:border-white/20" />
                      {nameError && <p className="text-sm text-destructive">{nameError}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="font-bold">Email</Label>
                      <Input id="signup-email" type="email" placeholder="andrew@tailoredtech.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} className="h-11 md:h-10 dark:bg-[hsl(0,0%,12%)] dark:text-white dark:border-white/20" />
                      {emailError && <p className="text-sm text-destructive">{emailError}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="font-bold">Password</Label>
                      <div className="relative">
                        <Input id="signup-password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} className="h-11 md:h-10 pr-10 dark:bg-[hsl(0,0%,12%)] dark:text-white dark:border-white/20" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1}>
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-referral" className="font-bold">
                        Referral Code <span className="text-muted-foreground">(optional)</span>
                      </Label>
                      <Input id="signup-referral" type="text" placeholder="ABCD1234" value={referralCode} onChange={(e) => setReferralCode(e.target.value.toUpperCase())} disabled={isLoading} className="uppercase h-11 md:h-10 dark:bg-[hsl(0,0%,12%)] dark:text-white dark:border-white/20" />
                      <p className="text-xs text-muted-foreground">Have a friend on Terra Farming? Enter their code to connect.</p>
                    </div>
                    <Button type="submit" className="w-full h-12 md:h-10 bg-primary hover:bg-primary/90 text-base font-semibold" disabled={isLoading}>
                      {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating Account...</>) : "Create Account"}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      By registering, you agree to our Terms of Service and Privacy Policy.
                    </p>
                  </form>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {/* Footer */}
      <div className="container py-4 text-center relative z-10">
        <p className="text-sm text-white/80 drop-shadow-md font-medium">Terra Farming — From Dirt to Dessert 🌱</p>
      </div>
    </div>
  );
};

export default AuthPage;
