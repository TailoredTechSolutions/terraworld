import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Navigate } from "react-router-dom";
import BackOfficeTopBar from "@/components/backoffice/BackOfficeTopBar";
import BackOfficeSection from "@/components/backoffice/BackOfficeSection";
import OverviewSection from "@/components/backoffice/sections/OverviewSection";
import UsersRolesSection from "@/components/backoffice/sections/UsersRolesSection";
import MarketplaceSection from "@/components/backoffice/sections/MarketplaceSection";
import OrdersSection from "@/components/backoffice/sections/OrdersSection";
import LogisticsSection from "@/components/backoffice/sections/LogisticsSection";
import PaymentsFinanceSection from "@/components/backoffice/sections/PaymentsFinanceSection";
import MLMCommissionsSection from "@/components/backoffice/sections/MLMCommissionsSection";
import TokenRewardsSection from "@/components/backoffice/sections/TokenRewardsSection";
import SupportDisputesSection from "@/components/backoffice/sections/SupportDisputesSection";
import ReportsAnalyticsSection from "@/components/backoffice/sections/ReportsAnalyticsSection";
import ComplianceAuditSection from "@/components/backoffice/sections/ComplianceAuditSection";
import SystemSettingsSection from "@/components/backoffice/sections/SystemSettingsSection";
import DetailDrawer from "@/components/backoffice/DetailDrawer";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "users", label: "Users & Roles" },
  { id: "marketplace", label: "Marketplace" },
  { id: "orders", label: "Orders" },
  { id: "logistics", label: "Logistics" },
  { id: "finance", label: "Payments & Finance" },
  { id: "mlm", label: "MLM & Commissions" },
  { id: "tokens", label: "Token Rewards" },
  { id: "support", label: "Support & Disputes" },
  { id: "reports", label: "Reports & Analytics" },
  { id: "compliance", label: "Compliance & Audit" },
  { id: "settings", label: "System Settings" },
] as const;

export type SectionId = typeof SECTIONS[number]["id"];

export interface DrawerState {
  open: boolean;
  type: string;
  data: any;
}

const AdminBackOffice = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isAnyAdmin, isAdminReadonly, loading: rolesLoading } = useUserRoles();
  const [activeTab, setActiveTab] = useState<SectionId>("overview");
  const [drawer, setDrawer] = useState<DrawerState>({ open: false, type: "", data: null });
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const openDrawer = useCallback((type: string, data: any) => {
    setDrawer({ open: true, type, data });
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawer({ open: false, type: "", data: null });
  }, []);

  const scrollToSection = useCallback((id: SectionId) => {
    const el = sectionRefs.current[id];
    if (el) {
      const offset = 120; // top bar height
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
    setActiveTab(id);
  }, []);

  // Track scroll position to highlight active tab
  useEffect(() => {
    const handleScroll = () => {
      const offset = 140;
      let current: SectionId = "overview";
      for (const s of SECTIONS) {
        const el = sectionRefs.current[s.id];
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= offset) current = s.id;
        }
      }
      setActiveTab(current);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (authLoading || rolesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading Back Office…</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!isAnyAdmin) return <Navigate to="/" replace />;

  const registerRef = (id: string) => (el: HTMLElement | null) => {
    sectionRefs.current[id] = el;
  };

  return (
    <div className="min-h-screen bg-background">
      <BackOfficeTopBar
        sections={SECTIONS as any}
        activeTab={activeTab}
        onTabClick={scrollToSection}
      />

      {/* Main content — offset for sticky header */}
      <main className="pt-[120px] pb-16 px-4 lg:px-8 max-w-[1600px] mx-auto space-y-6">
        <div ref={registerRef("overview")} id="section-overview">
          <BackOfficeSection id="overview" title="Overview" defaultOpen>
            <OverviewSection openDrawer={openDrawer} />
          </BackOfficeSection>
        </div>

        <div ref={registerRef("users")} id="section-users">
          <BackOfficeSection id="users" title="Users & Roles">
            <UsersRolesSection openDrawer={openDrawer} />
          </BackOfficeSection>
        </div>

        <div ref={registerRef("marketplace")} id="section-marketplace">
          <BackOfficeSection id="marketplace" title="Marketplace">
            <MarketplaceSection openDrawer={openDrawer} />
          </BackOfficeSection>
        </div>

        <div ref={registerRef("orders")} id="section-orders">
          <BackOfficeSection id="orders" title="Orders">
            <OrdersSection openDrawer={openDrawer} />
          </BackOfficeSection>
        </div>

        <div ref={registerRef("logistics")} id="section-logistics">
          <BackOfficeSection id="logistics" title="Logistics">
            <LogisticsSection openDrawer={openDrawer} />
          </BackOfficeSection>
        </div>

        <div ref={registerRef("finance")} id="section-finance">
          <BackOfficeSection id="finance" title="Payments & Finance">
            <PaymentsFinanceSection openDrawer={openDrawer} />
          </BackOfficeSection>
        </div>

        <div ref={registerRef("mlm")} id="section-mlm">
          <BackOfficeSection id="mlm" title="MLM & Commissions">
            <MLMCommissionsSection openDrawer={openDrawer} />
          </BackOfficeSection>
        </div>

        <div ref={registerRef("tokens")} id="section-tokens">
          <BackOfficeSection id="tokens" title="Token Rewards">
            <TokenRewardsSection openDrawer={openDrawer} />
          </BackOfficeSection>
        </div>

        <div ref={registerRef("support")} id="section-support">
          <BackOfficeSection id="support" title="Support & Disputes">
            <SupportDisputesSection openDrawer={openDrawer} />
          </BackOfficeSection>
        </div>

        <div ref={registerRef("reports")} id="section-reports">
          <BackOfficeSection id="reports" title="Reports & Analytics">
            <ReportsAnalyticsSection />
          </BackOfficeSection>
        </div>

        <div ref={registerRef("compliance")} id="section-compliance">
          <BackOfficeSection id="compliance" title="Compliance & Audit">
            <ComplianceAuditSection openDrawer={openDrawer} />
          </BackOfficeSection>
        </div>

        <div ref={registerRef("settings")} id="section-settings">
          <BackOfficeSection id="settings" title="System Settings">
            <SystemSettingsSection />
          </BackOfficeSection>
        </div>
      </main>

      <DetailDrawer state={drawer} onClose={closeDrawer} />
    </div>
  );
};

export default AdminBackOffice;
