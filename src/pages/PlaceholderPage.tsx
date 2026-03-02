import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, Construction } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

interface PlaceholderPageProps {
  title: string;
  description: string;
  category?: string;
}

const PlaceholderPage = ({ title, description, category }: PlaceholderPageProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <CartDrawer />
      <main className="flex-1 container py-16 md:py-24">
        <div className="max-w-2xl mx-auto text-center">
          {category && (
            <span className="inline-block mb-4 text-xs font-medium uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
              {category}
            </span>
          )}
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center">
              <Construction className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            {title}
          </h1>
          <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
            {description}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Link>
            <Link
              to="/support"
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PlaceholderPage;
