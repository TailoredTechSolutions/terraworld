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

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <Index />
            </PageTransition>
          }
        />
        <Route
          path="/shop"
          element={
            <PageTransition>
              <ShopPage />
            </PageTransition>
          }
        />
        <Route
          path="/product/:id"
          element={
            <PageTransition>
              <ProductDetail />
            </PageTransition>
          }
        />
        <Route
          path="/map"
          element={
            <PageTransition>
              <MapPage />
            </PageTransition>
          }
        />
        <Route
          path="/affiliate"
          element={
            <PageTransition>
              <AffiliatePage />
            </PageTransition>
          }
        />
        <Route
          path="/business-centre/auth"
          element={
            <PageTransition>
              <BusinessCentreAuth />
            </PageTransition>
          }
        />
        <Route
          path="/business-centre"
          element={
            <RoleProtectedRoute allowedRoles={['affiliate', 'admin']}>
              <PageTransition>
                <BusinessCentreLanding />
              </PageTransition>
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/business-centre/:tab"
          element={
            <RoleProtectedRoute allowedRoles={['affiliate', 'admin']}>
              <PageTransition>
                <BusinessCentre />
              </PageTransition>
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <PageTransition>
              <CheckoutPage />
            </PageTransition>
          }
        />
        <Route
          path="/order-confirmation"
          element={
            <PageTransition>
              <OrderConfirmation />
            </PageTransition>
          }
        />
        <Route
          path="/buyer"
          element={
            <RoleProtectedRoute allowedRoles={['buyer']}>
              <PageTransition>
                <BuyerDashboard />
              </PageTransition>
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/driver"
          element={
            <RoleProtectedRoute allowedRoles={['driver']}>
              <PageTransition>
                <DriverDashboard />
              </PageTransition>
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <PageTransition>
                <AdminDashboard />
              </PageTransition>
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/member"
          element={
            <RoleProtectedRoute allowedRoles={['member']}>
              <PageTransition>
                <MemberDashboard />
              </PageTransition>
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/farmer"
          element={
            <RoleProtectedRoute allowedRoles={['farmer']}>
              <PageTransition>
                <FarmerDashboard />
              </PageTransition>
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/auth"
          element={
            <PageTransition>
              <AuthPage />
            </PageTransition>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PageTransition>
              <ResetPasswordPage />
            </PageTransition>
          }
        />
        <Route
          path="/kyc"
          element={
            <PageTransition>
              <KYCPage />
            </PageTransition>
          }
        />
        <Route
          path="*"
          element={
            <PageTransition>
              <NotFound />
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
