import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
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
import {
  Loader2, ArrowLeft, ShoppingBag, Tractor, Truck, Eye, EyeOff,
  Check, X, Phone
} from "lucide-react";
import { LOGO_FULL as terraLogo, AUTH_FARM_BG as authFarmBg } from "@/lib/siteImages";

// ─── Validation Schemas ─────────────────────────────────────────────
const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Please enter a valid email address")
  .max(255, "Email must be less than 255 characters")
  .refine((v) => /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(v), {
    message: "Email contains invalid characters",
  });

const passwordSchema = z
  .string()
  .min(8, "Minimum 8 characters")
  .regex(/[A-Z]/, "At least 1 uppercase letter")
  .regex(/[a-z]/, "At least 1 lowercase letter")
  .regex(/[0-9]/, "At least 1 number")
  .regex(/[^A-Za-z0-9]/, "At least 1 special character");

const phoneSchema = z
  .string()
  .trim()
  .min(1, "Mobile number is required")
  .regex(/^(09|\+639)\d{9}$/, "Enter a valid PH mobile (09XXXXXXXXX or +639XXXXXXXXX)");

type RegistrationRole = "buyer" | "farmer" | "driver";

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
  farmName?: string;
  farmLocation?: string;
  produceType?: string;
  vehicleType?: string;
  licenseNumber?: string;
  serviceArea?: string;
}

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  termsAccepted: false,
  referralCode: "",
  // farmer fields
  farmName: "",
  farmLocation: "",
  produceType: "",
  // driver fields
  vehicleType: "",
  licenseNumber: "",
  serviceArea: "",
};

// ─── Password Strength Indicator ────────────────────────────────────
const PasswordStrength = ({ password }: { password: string }) => {
  const rules = [
    { label: "8+ characters", met: password.length >= 8 },
    { label: "Uppercase", met: /[A-Z]/.test(password) },
    { label: "Lowercase", met: /[a-z]/.test(password) },
    { label: "Number", met: /[0-9]/.test(password) },
    { label: "Special char", met: /[^A-Za-z0-9]/.test(password) },
  ];
  if (!password) return null;
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-1.5">
      {rules.map((r) => (
        <span key={r.label} className={`flex items-center gap-1 text-xs ${r.met ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
          {r.met ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
          {r.label}
        </span>
      ))}
    </div>
  );
};

// ─── Password Input with Eye Toggle ─────────────────────────────────
const PasswordInput = ({
  id, placeholder, value, onChange, disabled, error,
}: {
  id: string; placeholder: string; value: string;
  onChange: (v: string) => void; disabled: boolean; error?: string;
}) => {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1">
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          autoComplete="new-password"
          className="h-11 md:h-10 pr-10 dark:bg-[hsl(0,0%,12%)] dark:text-white dark:border-white/20"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          tabIndex={-1}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

// ─── Role Card ──────────────────────────────────────────────────────
const ROLES: { key: RegistrationRole; icon: typeof ShoppingBag; label: string; desc: string }[] = [
  { key: "buyer", icon: ShoppingBag, label: "Buyer", desc: "Shop fresh produce" },
  { key: "farmer", icon: Tractor, label: "Farmer", desc: "Sell your products" },
  { key: "driver", icon: Truck, label: "Driver", desc: "Deliver orders" },
];

// ═════════════════════════════════════════════════════════════════════
// AuthPage Component
// ═════════════════════════════════════════════════════════════════════
const AuthPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signIn, signUp, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [registrationRole, setRegistrationRole] = useState<RegistrationRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<FieldErrors>({});

  // Login-specific state (separate from registration to prevent leakage)
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginEmailError, setLoginEmailError] = useState("");
  const [loginPasswordError, setLoginPasswordError] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // ── Reset registration form completely ──
  const resetForm = useCallback(() => {
    setForm({ ...EMPTY_FORM });
    setErrors({});
  }, []);

  // Pre-select role from URL
  useEffect(() => {
    const role = searchParams.get("role") as RegistrationRole | null;
    if (role && ["buyer", "farmer", "driver"].includes(role)) {
      setRegistrationRole(role);
      setActiveTab("register");
    }
    const ref = searchParams.get("ref");
    if (ref) setForm((f) => ({ ...f, referralCode: ref }));
  }, [searchParams]);

  // Reset form when switching roles
  useEffect(() => {
    resetForm();
  }, [registrationRole, resetForm]);

  // Reset form when switching tabs
  useEffect(() => {
    if (activeTab === "register") {
      resetForm();
    } else {
      setLoginEmail("");
      setLoginPassword("");
      setLoginEmailError("");
      setLoginPasswordError("");
    }
  }, [activeTab, resetForm]);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) navigate("/");
  }, [user, authLoading, navigate]);

  // ── Field updater ──
  const setField = (key: keyof typeof EMPTY_FORM, value: string | boolean) => {
    setForm((f) => ({ ...f, [key]: value }));
    // Clear error for this field on change
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  // ── Validate registration ──
  const validateRegistration = (): boolean => {
    const errs: FieldErrors = {};
    if (!form.firstName.trim()) errs.firstName = "First name is required";
    if (!form.lastName.trim()) errs.lastName = "Last name is required";

    const emailResult = emailSchema.safeParse(form.email);
    if (!emailResult.success) errs.email = emailResult.error.errors[0].message;

    const phoneResult = phoneSchema.safeParse(form.phone);
    if (!phoneResult.success) errs.phone = phoneResult.error.errors[0].message;

    const pwResult = passwordSchema.safeParse(form.password);
    if (!pwResult.success) errs.password = pwResult.error.errors[0].message;

    if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match";
    if (!form.confirmPassword) errs.confirmPassword = "Please confirm your password";

    if (!form.termsAccepted) errs.terms = "You must accept the Terms and Privacy Policy";

    // Role-specific
    if (registrationRole === "farmer") {
      if (!form.farmName.trim()) errs.farmName = "Farm name is required";
      if (!form.farmLocation.trim()) errs.farmLocation = "Farm location is required";
      if (!form.produceType.trim()) errs.produceType = "Produce type is required";
    }
    if (registrationRole === "driver") {
      if (!form.vehicleType.trim()) errs.vehicleType = "Vehicle type is required";
      if (!form.licenseNumber.trim()) errs.licenseNumber = "License number is required";
      if (!form.serviceArea.trim()) errs.serviceArea = "Service area is required";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Handle Login ──
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;
    const emailRes = emailSchema.safeParse(loginEmail);
    if (!emailRes.success) { setLoginEmailError(emailRes.error.errors[0].message); valid = false; } else setLoginEmailError("");
    if (!loginPassword) { setLoginPasswordError("Password is required"); valid = false; } else setLoginPasswordError("");
    if (!valid) return;

    setIsLoading(true);
    const { error } = await signIn(loginEmail.trim(), loginPassword);
    if (error) {
      const msg = error.message.includes("Invalid login credentials")
        ? "Invalid email or password"
        : error.message.includes("Email not confirmed")
          ? "Please verify your email address"
          : "Failed to sign in";
      toast({ title: "Sign In Failed", description: msg, variant: "destructive" });
    } else {
      toast({ title: "Welcome back!", description: "You have successfully signed in." });
      navigate("/");
    }
    setIsLoading(false);
  };

  // ── Handle Signup ──
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registrationRole) {
      toast({ title: "Select Role", description: "Please select your account type.", variant: "destructive" });
      return;
    }
    if (!validateRegistration()) return;

    setIsLoading(true);
    const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`;

    const { error } = await signUp(
      form.email.trim(),
      form.password,
      fullName,
      form.referralCode.trim(),
      registrationRole
    );

    if (error) {
      const msg = error.message.includes("already registered")
        ? "This email is already registered. Please sign in."
        : error.message.includes("valid email")
          ? "Please enter a valid email address"
          : error.message.includes("422")
            ? "Registration failed. Please check your details and try again."
            : `Registration failed: ${error.message}`;
      toast({ title: "Registration Failed", description: msg, variant: "destructive" });
    } else {
      const roleLabel = { buyer: "Buyer", farmer: "Farmer", driver: "Driver" }[registrationRole];
      toast({ title: "Account Created!", description: `Welcome to Terra Farming as a ${roleLabel}!` });
      resetForm();
      const redirectMap: Record<string, string> = { farmer: "/farmer", driver: "/driver", buyer: "/buyer" };
      navigate(redirectMap[registrationRole] || "/buyer");
    }
    setIsLoading(false);
  };

  // ── Input helper ──
  const inputClass = "h-11 md:h-10 dark:bg-[hsl(0,0%,12%)] dark:text-white dark:border-white/20";

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img src={authFarmBg} alt="" className="w-full h-full object-cover opacity-50" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/25 to-black/10 dark:hidden" />
        <div className="absolute inset-0 hidden dark:block bg-gradient-to-t from-black/70 via-black/55 to-black/40" />
      </div>

      {/* Header */}
      <div className="container py-4 relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors drop-shadow-md">
          <ArrowLeft className="h-4 w-4" /> Back to Marketplace
        </Link>
      </div>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <Card
          className="w-[92%] max-w-md border-2 shadow-2xl relative overflow-hidden backdrop-blur-sm dark:backdrop-blur-md"
          style={{ background: `linear-gradient(hsla(34,28%,74%,0.92), hsla(34,28%,74%,0.92)), url(${terraLogo}) center / cover no-repeat` }}
        >
          <div
            className="absolute inset-0 z-0 pointer-events-none hidden dark:block rounded-xl"
            style={{ background: `linear-gradient(hsla(20,10%,8%,0.85), hsla(20,10%,8%,0.85)), url(${terraLogo}) center / cover no-repeat` }}
          />

          <CardHeader className="text-center pb-2 relative z-10">
            <div className="py-6 md:py-8">
              <CardTitle className="font-display text-4xl md:text-5xl drop-shadow-sm">Welcome to Terra Farming</CardTitle>
              <CardDescription className="font-bold text-base mt-2">Join the farm-to-table revolution</CardDescription>
            </div>
          </CardHeader>

          <CardContent className="relative z-10">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              {/* ── LOGIN TAB ── */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4" autoComplete="on">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="font-bold">Email</Label>
                    <Input
                      id="login-email" type="email" placeholder="you@example.com"
                      value={loginEmail}
                      onChange={(e) => { setLoginEmail(e.target.value); setLoginEmailError(""); }}
                      onBlur={() => setLoginEmail((v) => v.trim())}
                      disabled={isLoading} autoComplete="email"
                      className={inputClass}
                    />
                    {loginEmailError && <p className="text-sm text-destructive">{loginEmailError}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="font-bold">Password</Label>
                    <div className="relative">
                      <Input
                        id="login-password" type={showLoginPassword ? "text" : "password"} placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => { setLoginPassword(e.target.value); setLoginPasswordError(""); }}
                        disabled={isLoading} autoComplete="current-password"
                        className={`${inputClass} pr-10`}
                      />
                      <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1}>
                        {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {loginPasswordError && <p className="text-sm text-destructive">{loginPasswordError}</p>}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember-me" checked={rememberMe} onCheckedChange={(c) => setRememberMe(c === true)} />
                    <Label htmlFor="remember-me" className="text-sm font-medium cursor-pointer select-none">Remember me</Label>
                  </div>
                  <Button type="submit" className="w-full h-12 md:h-10 bg-primary hover:bg-primary/90 text-base font-semibold" disabled={isLoading}>
                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing In...</> : "Sign In"}
                  </Button>
                  <div className="text-center">
                    <button
                      type="button"
                      className="text-sm text-primary hover:underline font-semibold"
                      onClick={async () => {
                        if (!loginEmail) { toast({ title: "Enter Email", description: "Please enter your email address first.", variant: "destructive" }); return; }
                        const { error } = await supabase.auth.resetPasswordForEmail(loginEmail.trim(), { redirectTo: `${window.location.origin}/reset-password` });
                        if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
                        else toast({ title: "Check Your Email", description: "A password reset link has been sent." });
                      }}
                    >Forgot your password?</button>
                  </div>
                </form>
              </TabsContent>

              {/* ── REGISTER TAB ── */}
              <TabsContent value="register">
                {!registrationRole ? (
                  <div className="space-y-4 text-center py-4">
                    <p className="text-muted-foreground font-bold">Choose your account type:</p>
                    <div className="grid grid-cols-3 gap-3">
                      {ROLES.map((r) => (
                        <button
                          key={r.key}
                          type="button"
                          onClick={() => setRegistrationRole(r.key)}
                          className="p-4 rounded-xl border-2 border-border hover:border-primary transition-colors text-center space-y-2 dark:bg-[hsl(0,0%,12%)]/50"
                        >
                          <r.icon className="h-7 w-7 mx-auto text-primary" />
                          <p className="font-semibold text-sm">{r.label}</p>
                          <p className="text-xs text-muted-foreground">{r.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSignup} className="space-y-3" autoComplete="off">
                    {/* Role indicator */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary dark:bg-[hsl(0,0%,15%)]">
                      <div className="flex items-center gap-2">
                        {ROLES.find((r) => r.key === registrationRole)?.icon &&
                          (() => { const Icon = ROLES.find((r) => r.key === registrationRole)!.icon; return <Icon className="h-4 w-4 text-primary" />; })()}
                        <span className="text-sm font-medium">
                          Registering as {{ buyer: "Buyer", farmer: "Farmer", driver: "Driver" }[registrationRole]}
                        </span>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setRegistrationRole(null)}>Change</Button>
                    </div>

                    {/* ── Core fields ── */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="reg-fname" className="font-bold text-sm">First Name</Label>
                        <Input id="reg-fname" value={form.firstName} onChange={(e) => setField("firstName", e.target.value)} disabled={isLoading} placeholder="Juan" autoComplete="off" className={inputClass} />
                        {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="reg-lname" className="font-bold text-sm">Last Name</Label>
                        <Input id="reg-lname" value={form.lastName} onChange={(e) => setField("lastName", e.target.value)} disabled={isLoading} placeholder="Dela Cruz" autoComplete="off" className={inputClass} />
                        {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="reg-email" className="font-bold text-sm">Email</Label>
                      <Input
                        id="reg-email" type="email" value={form.email}
                        onChange={(e) => setField("email", e.target.value)}
                        onBlur={() => setField("email", form.email.trim())}
                        disabled={isLoading} placeholder="you@example.com" autoComplete="off"
                        className={inputClass}
                      />
                      {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="reg-phone" className="font-bold text-sm">Mobile Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="reg-phone" type="tel" value={form.phone}
                          onChange={(e) => setField("phone", e.target.value.replace(/[^0-9+]/g, ""))}
                          disabled={isLoading} placeholder="09XXXXXXXXX" autoComplete="off"
                          className={`${inputClass} pl-9`}
                        />
                      </div>
                      {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="reg-pw" className="font-bold text-sm">Password</Label>
                      <PasswordInput id="reg-pw" placeholder="••••••••" value={form.password} onChange={(v) => setField("password", v)} disabled={isLoading} error={errors.password} />
                      <PasswordStrength password={form.password} />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="reg-cpw" className="font-bold text-sm">Confirm Password</Label>
                      <PasswordInput id="reg-cpw" placeholder="••••••••" value={form.confirmPassword} onChange={(v) => setField("confirmPassword", v)} disabled={isLoading} error={errors.confirmPassword} />
                    </div>

                    {/* ── Farmer-specific fields ── */}
                    {registrationRole === "farmer" && (
                      <div className="space-y-3 pt-2 border-t border-border">
                        <p className="text-sm font-bold text-primary">Farm Details</p>
                        <div className="space-y-1">
                          <Label htmlFor="reg-farm-name" className="font-bold text-sm">Farm Name</Label>
                          <Input id="reg-farm-name" value={form.farmName} onChange={(e) => setField("farmName", e.target.value)} disabled={isLoading} placeholder="Green Valley Farm" autoComplete="off" className={inputClass} />
                          {errors.farmName && <p className="text-xs text-destructive">{errors.farmName}</p>}
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="reg-farm-loc" className="font-bold text-sm">Farm Location / Address</Label>
                          <Input id="reg-farm-loc" value={form.farmLocation} onChange={(e) => setField("farmLocation", e.target.value)} disabled={isLoading} placeholder="La Trinidad, Benguet" autoComplete="off" className={inputClass} />
                          {errors.farmLocation && <p className="text-xs text-destructive">{errors.farmLocation}</p>}
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="reg-produce" className="font-bold text-sm">Produce Type / Category</Label>
                          <Input id="reg-produce" value={form.produceType} onChange={(e) => setField("produceType", e.target.value)} disabled={isLoading} placeholder="Vegetables, Fruits, etc." autoComplete="off" className={inputClass} />
                          {errors.produceType && <p className="text-xs text-destructive">{errors.produceType}</p>}
                        </div>
                      </div>
                    )}

                    {/* ── Driver-specific fields ── */}
                    {registrationRole === "driver" && (
                      <div className="space-y-3 pt-2 border-t border-border">
                        <p className="text-sm font-bold text-primary">Driver Details</p>
                        <div className="space-y-1">
                          <Label htmlFor="reg-vehicle" className="font-bold text-sm">Vehicle Type</Label>
                          <Input id="reg-vehicle" value={form.vehicleType} onChange={(e) => setField("vehicleType", e.target.value)} disabled={isLoading} placeholder="Motorcycle, Van, etc." autoComplete="off" className={inputClass} />
                          {errors.vehicleType && <p className="text-xs text-destructive">{errors.vehicleType}</p>}
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="reg-license" className="font-bold text-sm">License Number</Label>
                          <Input id="reg-license" value={form.licenseNumber} onChange={(e) => setField("licenseNumber", e.target.value)} disabled={isLoading} placeholder="N01-23-456789" autoComplete="off" className={inputClass} />
                          {errors.licenseNumber && <p className="text-xs text-destructive">{errors.licenseNumber}</p>}
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="reg-area" className="font-bold text-sm">Service Area / City</Label>
                          <Input id="reg-area" value={form.serviceArea} onChange={(e) => setField("serviceArea", e.target.value)} disabled={isLoading} placeholder="Baguio City" autoComplete="off" className={inputClass} />
                          {errors.serviceArea && <p className="text-xs text-destructive">{errors.serviceArea}</p>}
                        </div>
                      </div>
                    )}

                    {/* Referral code */}
                    <div className="space-y-1">
                      <Label htmlFor="reg-ref" className="font-bold text-sm">
                        Referral Code <span className="text-muted-foreground font-normal">(optional)</span>
                      </Label>
                      <Input id="reg-ref" value={form.referralCode} onChange={(e) => setField("referralCode", e.target.value.toUpperCase())} disabled={isLoading} placeholder="ABCD1234" autoComplete="off" className={`${inputClass} uppercase`} />
                    </div>

                    {/* Terms */}
                    <div className="flex items-start space-x-2 pt-1">
                      <Checkbox
                        id="terms"
                        checked={form.termsAccepted}
                        onCheckedChange={(c) => setField("termsAccepted", c === true)}
                      />
                      <Label htmlFor="terms" className="text-xs leading-tight cursor-pointer select-none">
                        I agree to the <span className="text-primary font-semibold">Terms of Service</span> and <span className="text-primary font-semibold">Privacy Policy</span>
                      </Label>
                    </div>
                    {errors.terms && <p className="text-xs text-destructive">{errors.terms}</p>}

                    <Button type="submit" className="w-full h-12 md:h-10 bg-primary hover:bg-primary/90 text-base font-semibold mt-2" disabled={isLoading || !form.termsAccepted}>
                      {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating Account...</> : "Create Account"}
                    </Button>
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
