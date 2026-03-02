import { useState } from "react";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import terraLogo from "@/assets/terra-logo.png";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Footer = () => {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const handleBusinessCentreClick = (e: React.MouseEvent) => {
    if (user) {
      navigate("/business-centre");
    } else {
      e.preventDefault();
      setLoginError("");
      setLoginOpen(true);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const { error } = await signIn(loginEmail, loginPassword);
      if (error) {
        setLoginError(error.message || "Invalid email or password.");
      } else {
        setLoginOpen(false);
        setLoginEmail("");
        setLoginPassword("");
        navigate("/business-centre");
      }
    } catch {
      setLoginError("An unexpected error occurred.");
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <>
    <footer className="border-t border-border bg-card">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img 
                src={terraLogo} 
                alt="Terra Farming" 
                className="h-10 w-10 rounded-lg"
              />
              <div className="flex flex-col">
                <span className="font-display text-xl font-bold text-foreground leading-tight">
                  Terra Farming
                </span>
                <span className="text-[10px] text-muted-foreground leading-none">
                  From Dirt to Dessert
                </span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Connecting local farmers with conscious consumers. Fresh, organic, sustainable.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">
              Shop
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/shop?category=vegetables" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Vegetables
                </Link>
              </li>
              <li>
                <Link to="/shop?category=fruits" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Fruits
                </Link>
              </li>
              <li>
                <Link to="/shop?category=dairy-eggs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Dairy & Eggs
                </Link>
              </li>
              <li>
                <Link to="/shop?category=pantry" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Pantry
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">
              For Farmers
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Sell on Terra
                </Link>
              </li>
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Resources
                </Link>
              </li>
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Success Stories
                </Link>
              </li>
            </ul>
          </div>


          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">
              Support
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Delivery Info
                </Link>
              </li>
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Returns
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 Terra. All rights reserved.
          </p>
          <div className="flex gap-6">
            <button
              onClick={handleBusinessCentreClick}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-transparent border-none p-0"
            >
              Business Centre
            </button>
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>

    {/* Login Modal for Business Centre */}
    <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sign In to Continue</DialogTitle>
          <DialogDescription>
            Please log in to access the Business Centre.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bc-email">Email</Label>
            <Input
              id="bc-email"
              type="email"
              placeholder="you@example.com"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bc-password">Password</Label>
            <Input
              id="bc-password"
              type="password"
              placeholder="••••••••"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
            />
          </div>
          {loginError && (
            <p className="text-sm text-destructive">{loginError}</p>
          )}
          <Button type="submit" className="w-full" disabled={loginLoading}>
            {loginLoading ? "Signing in..." : "Login"}
          </Button>
          <div className="flex items-center justify-between text-sm">
            <Link
              to="/reset-password"
              className="text-primary hover:underline"
              onClick={() => setLoginOpen(false)}
            >
              Forgot Password?
            </Link>
            <Link
              to="/auth"
              className="text-primary hover:underline"
              onClick={() => setLoginOpen(false)}
            >
              Don't have an account? Register
            </Link>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default Footer;