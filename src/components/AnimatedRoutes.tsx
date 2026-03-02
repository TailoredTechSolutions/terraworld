import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PageTransition from "./PageTransition";
import ProtectedRoute from "./ProtectedRoute";
import RoleProtectedRoute from "./RoleProtectedRoute";
import Index from "@/pages/Index";
import ShopPage from "@/pages/ShopPage";
import ProductDetail from "@/pages/ProductDetail";
import MapPage from "@/pages/MapPage";
import AffiliatePage from "@/pages/AffiliatePage";
import BusinessCentre from "@/pages/BusinessCentre";
import BusinessCentreLanding from "@/pages/BusinessCentreLanding";
import BusinessCentreAuth from "@/pages/BusinessCentreAuth";
import CheckoutPage from "@/pages/CheckoutPage";
import OrderConfirmation from "@/pages/OrderConfirmation";
import DriverDashboard from "@/pages/DriverDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import MemberDashboard from "@/pages/MemberDashboard";
import FarmerDashboard from "@/pages/FarmerDashboard";
import BuyerDashboard from "@/pages/BuyerDashboard";
import AuthPage from "@/pages/AuthPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import KYCPage from "@/pages/KYCPage";
import NotFound from "@/pages/NotFound";
import {
  AboutPage, ImpactPage, CareersPage, PilotBaguioPage,
  PricingPage, OrderTrackPage, QualityPolicyPage,
  FarmerOnboardingPage, FarmerUploadPage, FarmerPayoutsPage, FarmerLogisticsPage, FarmerFAQPage,
  BuyerOnboardingPage, BuyerWholesalePage, AccountTransactionsPage, SupportDisputesPage, BuyerFAQPage,
  RewardsPage, CompensationPage,
  BlogPage, HelpPage, StatusPage, SupportPage, ContactPage,
  TermsPage, PrivacyPage, CookiePolicyPage, RefundPolicyPage, RiskDisclosurePage, AMLKYCPolicyPage,
} from "@/pages/placeholders";

const P = ({ children }: { children: React.ReactNode }) => <PageTransition>{children}</PageTransition>;

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Core pages */}
        <Route path="/" element={<P><Index /></P>} />
        <Route path="/shop" element={<P><ShopPage /></P>} />
        <Route path="/product/:id" element={<P><ProductDetail /></P>} />
        <Route path="/map" element={<P><MapPage /></P>} />
        <Route path="/affiliate" element={<P><AffiliatePage /></P>} />
        <Route path="/business-centre/auth" element={<P><BusinessCentreAuth /></P>} />
        <Route path="/business-centre" element={<RoleProtectedRoute allowedRoles={['affiliate', 'admin']}><P><BusinessCentreLanding /></P></RoleProtectedRoute>} />
        <Route path="/business-centre/:tab" element={<RoleProtectedRoute allowedRoles={['affiliate', 'admin']}><P><BusinessCentre /></P></RoleProtectedRoute>} />
        <Route path="/checkout" element={<P><CheckoutPage /></P>} />
        <Route path="/order-confirmation" element={<P><OrderConfirmation /></P>} />
        <Route path="/auth" element={<P><AuthPage /></P>} />
        <Route path="/reset-password" element={<P><ResetPasswordPage /></P>} />
        <Route path="/kyc" element={<P><KYCPage /></P>} />

        {/* Role-protected dashboards */}
        <Route path="/buyer" element={<RoleProtectedRoute allowedRoles={['buyer']}><P><BuyerDashboard /></P></RoleProtectedRoute>} />
        <Route path="/driver" element={<RoleProtectedRoute allowedRoles={['driver']}><P><DriverDashboard /></P></RoleProtectedRoute>} />
        <Route path="/admin" element={<RoleProtectedRoute allowedRoles={['admin']}><P><AdminDashboard /></P></RoleProtectedRoute>} />
        <Route path="/member" element={<RoleProtectedRoute allowedRoles={['member']}><P><MemberDashboard /></P></RoleProtectedRoute>} />
        <Route path="/farmer" element={<RoleProtectedRoute allowedRoles={['farmer']}><P><FarmerDashboard /></P></RoleProtectedRoute>} />

        {/* Terra / Company */}
        <Route path="/about" element={<P><AboutPage /></P>} />
        <Route path="/impact" element={<P><ImpactPage /></P>} />
        <Route path="/careers" element={<P><CareersPage /></P>} />
        <Route path="/pilot/baguio" element={<P><PilotBaguioPage /></P>} />

        {/* Marketplace */}
        <Route path="/pricing" element={<P><PricingPage /></P>} />
        <Route path="/orders/track" element={<P><OrderTrackPage /></P>} />
        <Route path="/policies/quality" element={<P><QualityPolicyPage /></P>} />

        {/* For Farmers */}
        <Route path="/farmers/onboarding" element={<P><FarmerOnboardingPage /></P>} />
        <Route path="/farmers/upload" element={<P><FarmerUploadPage /></P>} />
        <Route path="/farmers/payouts" element={<P><FarmerPayoutsPage /></P>} />
        <Route path="/farmers/logistics" element={<P><FarmerLogisticsPage /></P>} />
        <Route path="/faq/farmers" element={<P><FarmerFAQPage /></P>} />

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
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
