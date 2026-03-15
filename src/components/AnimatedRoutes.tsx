import { lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PageTransition from "./PageTransition";
import ProtectedRoute from "./ProtectedRoute";
import RoleProtectedRoute from "./RoleProtectedRoute";

// Only the landing page is eagerly loaded for fast initial paint
import Index from "@/pages/Index";

// Lazy-load everything else
const ShopPage = lazy(() => import("@/pages/ShopPage"));
const ProductDetail = lazy(() => import("@/pages/ProductDetail"));
const ProductOffersPage = lazy(() => import("@/pages/ProductOffersPage"));
const MapPage = lazy(() => import("@/pages/MapPage"));
const FarmDetailPage = lazy(() => import("@/pages/FarmDetailPage"));
const AffiliatePage = lazy(() => import("@/pages/AffiliatePage"));
const BusinessCentreLanding = lazy(() => import("@/pages/BusinessCentreLanding"));
const BusinessCentreAuth = lazy(() => import("@/pages/BusinessCentreAuth"));
const CheckoutPage = lazy(() => import("@/pages/CheckoutPage"));
const OrderConfirmation = lazy(() => import("@/pages/OrderConfirmation"));
const DriverDashboard = lazy(() => import("@/pages/DriverDashboard"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const AdminBackOffice = lazy(() => import("@/pages/AdminBackOffice"));
const MemberDashboard = lazy(() => import("@/pages/MemberDashboard"));
const FarmerDashboard = lazy(() => import("@/pages/FarmerDashboard"));
const BuyerDashboard = lazy(() => import("@/pages/BuyerDashboard"));
const AuthPage = lazy(() => import("@/pages/AuthPage"));
const ResetPasswordPage = lazy(() => import("@/pages/ResetPasswordPage"));
const KYCPage = lazy(() => import("@/pages/KYCPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// Placeholder pages are lightweight, keep as static imports
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
          <Route path="/affiliate" element={<P><AffiliatePage /></P>} />
          <Route path="/business-centre/auth" element={<P><BusinessCentreAuth /></P>} />
          <Route path="/business-centre" element={<RoleProtectedRoute allowedRoles={['affiliate', 'admin']}><P><BusinessCentreLanding /></P></RoleProtectedRoute>} />
          <Route path="/business-centre/dashboard" element={<RoleProtectedRoute allowedRoles={['affiliate', 'admin']}><P><BusinessCentreLanding /></P></RoleProtectedRoute>} />
          <Route path="/checkout" element={<P><CheckoutPage /></P>} />
          <Route path="/order-confirmation" element={<P><OrderConfirmation /></P>} />
          <Route path="/auth" element={<P><AuthPage /></P>} />
          <Route path="/reset-password" element={<P><ResetPasswordPage /></P>} />
          <Route path="/kyc" element={<P><KYCPage /></P>} />

          {/* Role-protected dashboards */}
          <Route path="/buyer" element={<RoleProtectedRoute allowedRoles={['buyer']}><P><BuyerDashboard /></P></RoleProtectedRoute>} />
          <Route path="/driver" element={<RoleProtectedRoute allowedRoles={['driver']}><P><DriverDashboard /></P></RoleProtectedRoute>} />
          <Route path="/admin" element={<RoleProtectedRoute allowedRoles={['admin']}><P><AdminBackOffice /></P></RoleProtectedRoute>} />
          <Route path="/admin/legacy" element={<RoleProtectedRoute allowedRoles={['admin']}><P><AdminDashboard /></P></RoleProtectedRoute>} />
          <Route path="/member" element={<RoleProtectedRoute allowedRoles={['member']}><P><MemberDashboard /></P></RoleProtectedRoute>} />
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
