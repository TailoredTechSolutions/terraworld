import { Link } from "react-router-dom";
import { ChevronRight, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface ContentBlock {
  heading: string;
  body: string;
}

interface StandardPageShellProps {
  category?: string;
  title: string;
  description: string;
  breadcrumbs?: Breadcrumb[];
  contentBlocks?: ContentBlock[];
  cta?: { label: string; href: string };
  children?: React.ReactNode;
}

const StandardPageShell = ({
  category,
  title,
  description,
  breadcrumbs,
  contentBlocks,
  cta,
  children,
}: StandardPageShellProps) => {
  const defaultBreadcrumbs: Breadcrumb[] = breadcrumbs ?? [
    { label: "Home", href: "/" },
    ...(category ? [{ label: category }] : []),
    { label: title },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <CartDrawer />
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="container pt-6">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted-foreground overflow-x-auto">
            {defaultBreadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1 whitespace-nowrap">
                {i > 0 && <ChevronRight className="h-3 w-3 shrink-0" />}
                {crumb.href ? (
                  <Link to={crumb.href} className="hover:text-foreground transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-foreground font-medium">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        </div>

        {/* Hero */}
        <div className="container py-10 md:py-16">
          <div className="max-w-3xl">
            {category && (
              <span className="inline-block mb-3 text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
                {category}
              </span>
            )}
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
              {title}
            </h1>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-2xl">
              {description}
            </p>
          </div>
        </div>

        {/* Content blocks */}
        {contentBlocks && contentBlocks.length > 0 && (
          <div className="container pb-12">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {contentBlocks.map((block, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-6">
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                    {block.heading}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {block.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom children */}
        {children && <div className="container pb-12">{children}</div>}

        {/* CTA + Back */}
        <div className="container pb-16">
          <div className="flex flex-col sm:flex-row items-start gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Link>
            {cta && (
              <Link
                to={cta.href}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
              >
                {cta.label}
              </Link>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StandardPageShell;
