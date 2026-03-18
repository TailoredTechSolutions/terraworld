import { lazy, Suspense } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PageTransition from "./PageTransition";
import ProtectedRoute from "./ProtectedRoute";
import RoleProtectedRoute from "./RoleProtectedRoute";

// Retry wrapper for lazy imports
function lazyRetry(factory: () => Promise<{ default: React.ComponentType<any> }>) {
  return lazy(() =>
    factory().catch(() => {
      const key = "chunk-reload";
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        window.location.reload();
      }
      sessionStorage.removeItem(key);
      return factory();
    })
  );
}

// Only the landing page is eagerly loaded
import Index from "@/pages/Index";

// Lazy-load everything else
const ShopPage = lazyRetry(() => import("@/pages/ShopPage"));
const ProductDetail = lazyRetry(() => import("@/pages/ProductDetail"));
const ProductOffersPage = lazyRetry(() => import("@/pages/ProductOffersPage"));
const MapPage = lazyRetry(() => import("@/pages/MapPage"));
const FarmDetailPage = lazyRetry(() => import("@/pages/FarmDetailPage"));
const AffiliatePage = lazyRetry(() => import("@/pages/AffiliatePage"));
const BusinessCentreAuth = lazyRetry(() => import("@/pages/BusinessCentreAuth"));
const BusinessCentreShell = lazyRetry(() => import("@/components/business-centre/BusinessCentreShell"));

// Business Centre pages
const BCOverview = lazyRetry(() => import("@/pages/business-centre/BCOverview"));
const BCBinaryTree = lazyRetry(() => import("@/pages/business-centre/BCBinaryTree"));
const BCNetwork = lazyRetry(() => import("@/pages/business-centre/BCNetwork"));
const BCCommissions = lazyRetry(() => import("@/pages/business-centre/BCCommissions"));
const BCReferrals = lazyRetry(() => import("@/pages/business-centre/BCReferrals"));
const BCRankActivation = lazyRetry(() => import("@/pages/business-centre/BCRankActivation"));
const BCCoupons = lazyRetry(() => import("@/pages/business-centre/BCCoupons"));
const BCWallet = lazyRetry(() => import("@/pages/business-centre/BCWallet"));
const BCTokenRewards = lazyRetry(() => import("@/pages/business-centre/BCTokenRewards"));
const BCMarketing = lazyRetry(() => import("@/pages/business-centre/BCMarketing"));
const BCSupport = lazyRetry(() => import("@/pages/business-centre/BCSupport"));
const BCEarnings = lazyRetry(() => import("@/pages/business-centre/BCEarnings"));
const BCWithdrawals = lazyRetry(() => import("@/pages/business-centre/BCWithdrawals"));
const BCStatements = lazyRetry(() => import("@/pages/business-centre/BCStatements"));

// New 12-module admin pages
const BCUsersRoles = lazyRetry(() => import("@/pages/business-centre/BCUsersRoles"));
const BCMarketplace = lazyRetry(() => import("@/pages/business-centre/BCMarketplace"));
const BCLogistics = lazyRetry(() => import("@/pages/business-centre/BCLogistics"));
const BCFinancialManagement = lazyRetry(() => import("@/pages/business-centre/BCFinancialManagement"));
const BCMLMSystem = lazyRetry(() => import("@/pages/business-centre/BCMLMSystem"));
const BCTokenomics = lazyRetry(() => import("@/pages/business-centre/BCTokenomics"));
const BCCustomerService = lazyRetry(() => import("@/pages/business-centre/BCCustomerService"));
const BCComplianceAudit = lazyRetry(() => import("@/pages/business-centre/BCComplianceAudit"));

// Admin extended pages
const BCReports = lazyRetry(() => import("@/pages/business-centre/BCAdminExtended").then(m => ({ default: m.BCReports })));
const BCPackageManager = lazyRetry(() => import("@/pages/business-centre/BCAdminExtended").then(m => ({ default: m.BCPackageManager })));
const BCRankManager = lazyRetry(() => import("@/pages/business-centre/BCAdminExtended").then(m => ({ default: m.BCRankManager })));
const BCWalletControls = lazyRetry(() => import("@/pages/business-centre/BCAdminExtended").then(m => ({ default: m.BCWalletControls })));
const BCManualPlacement = lazyRetry(() => import("@/pages/business-centre/BCAdminExtended").then(m => ({ default: m.BCManualPlacement })));
const BCGlobalConfig = lazyRetry(() => import("@/pages/business-centre/BCAdminExtended").then(m => ({ default: m.BCGlobalConfig })));

// Existing admin pages (named exports)
const BCMemberSearch = lazyRetry(() => import("@/pages/business-centre/BCAdminPages").then(m => ({ default: m.BCMemberSearch })));
const BCCommissionRuns = lazyRetry(() => import("@/pages/business-centre/BCAdminPages").then(m => ({ default: m.BCCommissionRuns })));
const BCPayoutOversight = lazyRetry(() => import("@/pages/business-centre/BCAdminPages").then(m => ({ default: m.BCPayoutOversight })));
const BCCompliance = lazyRetry(() => import("@/pages/business-centre/BCAdminPages").then(m => ({ default: m.BCCompliance })));
const BCSystemSettings = lazyRetry(() => import("@/pages/business-centre/BCAdminPages").then(m => ({ default: m.BCSystemSettings })));
const BCSecurity = lazyRetry(() => import("@/pages/business-centre/BCAdminPages").then(m => ({ default: m.BCSecurity })));
const BCAuditLogs = lazyRetry(() => import("@/pages/business-centre/BCAdminPages").then(m => ({ default: m.BCAuditLogs })));
const BCControlCenter = lazyRetry(() => import("@/pages/business-centre/BCControlCenter"));

import { BusinessCentreProvider } from "@/contexts/BusinessCentreContext";
const CheckoutPage = lazyRetry(() => import("@/pages/CheckoutPage"));
const OrderConfirmation = lazyRetry(() => import("@/pages/OrderConfirmation"));
const DriverDashboard = lazyRetry(() => import("@/pages/DriverDashboard"));
const AdminDashboard = lazyRetry(() => import("@/pages/AdminDashboard"));
const AdminBackOffice = lazyRetry(() => import("@/pages/AdminBackOffice"));
const FarmerDashboard = lazyRetry(() => import("@/pages/FarmerDashboard"));
const BuyerDashboard = lazyRetry(() => import("@/pages/BuyerDashboard"));
const AuthPage = lazyRetry(() => import("@/pages/AuthPage"));
const ResetPasswordPage = lazyRetry(() => import("@/pages/ResetPasswordPage"));
const KYCPage = lazyRetry(() => import("@/pages/KYCPage"));
const NotFound = lazyRetry(() => import("@/pages/NotFound"));

import {
  AboutPage, HowItWorksPage, ImpactPage, CareersPage, PilotBaguioPage,
  PricingPage, CategoriesPage, OrderTrackPage, QualityPolicyPage,
  FarmerOnboardingPage, FarmerUploadPage, FarmerPayoutsPage, FarmerLogisticsPage, FarmerFAQPage,
  BuyerOnboardingPage, BuyerWholesalePage, AccountTransactionsPage, SupportDisputesPage, BuyerFAQPage,
  DriverOverviewPage, DriverRegisterPage, DriverAssignmentsPage, DriverRouteTrackingPage, DriverEarningsPage, DriverGuidelinesPage, DriverFAQPage,
  RewardsPage, CompensationPage,
  BlogPage, HelpPage, StatusPage, SupportPage, ContactPage,
  TermsPage, PrivacyPage, CookiePolicyPage, RefundPolicyPage, RiskDisclosurePage, AMLKYCPolicyPage,
} from "@/pages/placeholders";

const P = ({ children }: { children: React.ReactNode }) => <PageTransition>{children}</PageTransition>;

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<LoadingFallback />}>
        <Routes location={location} key={location.pathname}>
          {/* Core pages */}
          <Route path="/" element={<P><Index /></P>} />
          <Route path="/shop" element={<P><ShopPage /></P>} />
          <Route path="/product/:id" element={<P><ProductDetail /></P>} />
          <Route path="/product/:id/offers" element={<P><ProductOffersPage /></P>} />
          <Route path="/map" element={<P><MapPage /></P>} />
          <Route path="/farm/:farmId" element={<P><FarmDetailPage /></P>} />
          <Route path="/affiliate" element={<P><AffiliatePage /></P>} />
          <Route path="/business-centre/auth" element={<P><BusinessCentreAuth /></P>} />

          {/* ═══ Business Centre — 12-Module Admin Domain ═══ */}
          <Route path="/business-centre" element={<RoleProtectedRoute allowedRoles={['affiliate', 'member', 'admin', 'admin_readonly']}><P><BusinessCentreProvider><BusinessCentreShell /></BusinessCentreProvider></P></RoleProtectedRoute>}>
            <Route index element={<BCOverview />} />
            <Route path="dashboard" element={<BCOverview />} />
            <Route path="overview" element={<BCOverview />} />

            {/* Module 2: Users & Roles */}
            <Route path="users" element={<BCUsersRoles />} />

            {/* Module 3: Marketplace Operations */}
            <Route path="marketplace" element={<BCMarketplace />} />

            {/* Module 4: Logistics & Delivery */}
            <Route path="logistics" element={<BCLogistics />} />

            {/* Module 5: Financial Management */}
            <Route path="financial-management" element={<BCFinancialManagement />} />
            <Route path="earnings" element={<BCEarnings />} />
            <Route path="wallet" element={<BCWallet />} />
            <Route path="withdrawals" element={<BCWithdrawals />} />
            <Route path="statements" element={<BCStatements />} />
            <Route path="payout-oversight" element={<BCPayoutOversight />} />
            <Route path="wallet-controls" element={<BCWalletControls />} />

            {/* Module 6: MLM System */}
            <Route path="mlm-system" element={<BCMLMSystem />} />
            <Route path="binary-tree" element={<BCBinaryTree />} />
            <Route path="network" element={<BCNetwork />} />
            <Route path="referrals" element={<BCReferrals />} />
            <Route path="commissions" element={<BCCommissions />} />
            <Route path="commission-runs" element={<BCCommissionRuns />} />
            <Route path="rank-activation" element={<BCRankActivation />} />
            <Route path="rank-manager" element={<BCRankManager />} />
            <Route path="package-manager" element={<BCPackageManager />} />
            <Route path="member-search" element={<BCMemberSearch />} />
            <Route path="genealogy-explorer" element={<BCBinaryTree />} />
            <Route path="manual-placement" element={<BCManualPlacement />} />

            {/* Module 7: Tokenomics & Rewards */}
            <Route path="tokenomics" element={<BCTokenomics />} />
            <Route path="token-rewards" element={<BCTokenRewards />} />

            {/* Module 8: Coupons & Promotions */}
            <Route path="coupons" element={<BCCoupons />} />
            <Route path="marketing" element={<BCMarketing />} />

            {/* Module 9: Customer Service */}
            <Route path="customer-service" element={<BCCustomerService />} />
            <Route path="support" element={<BCSupport />} />

            {/* Module 10: Reports & Analytics */}
            <Route path="reports" element={<BCReports />} />

            {/* Module 11: Compliance & Security */}
            <Route path="compliance-audit" element={<BCComplianceAudit />} />
            <Route path="compliance" element={<BCCompliance />} />
            <Route path="security-roles" element={<BCSecurity />} />

            {/* Module 12: Settings & Audit */}
            <Route path="control-center" element={<BCControlCenter />} />
            <Route path="system-settings" element={<BCSystemSettings />} />
            <Route path="global-config" element={<BCGlobalConfig />} />
            <Route path="audit-logs" element={<BCAuditLogs />} />
          </Route>

          <Route path="/checkout" element={<P><CheckoutPage /></P>} />
          <Route path="/order-confirmation" element={<P><OrderConfirmation /></P>} />
          <Route path="/auth" element={<P><AuthPage /></P>} />
          <Route path="/reset-password" element={<P><ResetPasswordPage /></P>} />
          <Route path="/kyc" element={<P><KYCPage /></P>} />

          {/* Role-protected dashboards (output-only for users) */}
          <Route path="/buyer" element={<RoleProtectedRoute allowedRoles={['buyer']}><P><BuyerDashboard /></P></RoleProtectedRoute>} />
          <Route path="/driver" element={<RoleProtectedRoute allowedRoles={['driver']}><P><DriverDashboard /></P></RoleProtectedRoute>} />
          <Route path="/admin" element={<RoleProtectedRoute allowedRoles={['admin']}><P><AdminBackOffice /></P></RoleProtectedRoute>} />
          <Route path="/admin/legacy" element={<RoleProtectedRoute allowedRoles={['admin']}><P><AdminDashboard /></P></RoleProtectedRoute>} />
          <Route path="/member" element={<Navigate to="/business-centre" replace />} />
          <Route path="/farmer" element={<RoleProtectedRoute allowedRoles={['farmer']}><P><FarmerDashboard /></P></RoleProtectedRoute>} />

          {/* Terra / Company */}
          <Route path="/about" element={<P><AboutPage /></P>} />
          <Route path="/how-it-works" element={<P><HowItWorksPage /></P>} />
          <Route path="/mission-impact" element={<P><ImpactPage /></P>} />
          <Route path="/impact" element={<P><ImpactPage /></P>} />
          <Route path="/pilot-program-baguio" element={<P><PilotBaguioPage /></P>} />
          <Route path="/pilot/baguio" element={<P><PilotBaguioPage /></P>} />
          <Route path="/careers" element={<P><CareersPage /></P>} />

          {/* Marketplace */}
          <Route path="/marketplace/categories" element={<P><CategoriesPage /></P>} />
          <Route path="/marketplace/pricing-breakdown" element={<P><PricingPage /></P>} />
          <Route path="/pricing" element={<P><PricingPage /></P>} />
          <Route path="/marketplace/order-tracking" element={<P><OrderTrackPage /></P>} />
          <Route path="/orders/track" element={<P><OrderTrackPage /></P>} />
          <Route path="/marketplace/quality-policy" element={<P><QualityPolicyPage /></P>} />
          <Route path="/policies/quality" element={<P><QualityPolicyPage /></P>} />

          {/* For Farmers */}
          <Route path="/farmers/onboarding" element={<P><FarmerOnboardingPage /></P>} />
          <Route path="/farmers/upload-products" element={<P><FarmerUploadPage /></P>} />
          <Route path="/farmers/upload" element={<P><FarmerUploadPage /></P>} />
          <Route path="/farmers/payouts-settlement" element={<P><FarmerPayoutsPage /></P>} />
          <Route path="/farmers/payouts" element={<P><FarmerPayoutsPage /></P>} />
          <Route path="/farmers/logistics-options" element={<P><FarmerLogisticsPage /></P>} />
          <Route path="/farmers/logistics" element={<P><FarmerLogisticsPage /></P>} />
          <Route path="/farmers/faq" element={<P><FarmerFAQPage /></P>} />
          <Route path="/faq/farmers" element={<P><FarmerFAQPage /></P>} />

          {/* For Drivers */}
          <Route path="/drivers" element={<P><DriverOverviewPage /></P>} />
          <Route path="/drivers/register" element={<P><DriverRegisterPage /></P>} />
          <Route path="/drivers/assignments" element={<P><DriverAssignmentsPage /></P>} />
          <Route path="/drivers/route-tracking" element={<P><DriverRouteTrackingPage /></P>} />
          <Route path="/drivers/earnings-payouts" element={<P><DriverEarningsPage /></P>} />
          <Route path="/drivers/guidelines" element={<P><DriverGuidelinesPage /></P>} />
          <Route path="/drivers/faq" element={<P><DriverFAQPage /></P>} />

          {/* For Buyers */}
          <Route path="/buyers/onboarding" element={<P><BuyerOnboardingPage /></P>} />
          <Route path="/buyers/wholesale" element={<P><BuyerWholesalePage /></P>} />
          <Route path="/account/transactions" element={<P><AccountTransactionsPage /></P>} />
          <Route path="/support/disputes" element={<P><SupportDisputesPage /></P>} />
          <Route path="/faq/buyers" element={<P><BuyerFAQPage /></P>} />

          {/* Rewards */}
          <Route path="/rewards" element={<P><RewardsPage /></P>} />
          <Route path="/rewards/compensation" element={<P><CompensationPage /></P>} />

          {/* Resources */}
          <Route path="/blog" element={<P><BlogPage /></P>} />
          <Route path="/help" element={<P><HelpPage /></P>} />
          <Route path="/status" element={<P><StatusPage /></P>} />
          <Route path="/support" element={<P><SupportPage /></P>} />
          <Route path="/contact" element={<P><ContactPage /></P>} />

          {/* Legal */}
          <Route path="/legal/terms" element={<P><TermsPage /></P>} />
          <Route path="/legal/privacy" element={<P><PrivacyPage /></P>} />
          <Route path="/legal/cookies" element={<P><CookiePolicyPage /></P>} />
          <Route path="/legal/refunds" element={<P><RefundPolicyPage /></P>} />
          <Route path="/legal/risk-disclosure" element={<P><RiskDisclosurePage /></P>} />
          <Route path="/legal/aml-kyc" element={<P><AMLKYCPolicyPage /></P>} />

          {/* Catch-all */}
          <Route path="*" element={<P><NotFound /></P>} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
